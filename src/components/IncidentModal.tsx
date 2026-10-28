import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Clock,
  User,
  HelpCircle,
  Scale,
  Send,
  Edit3,
} from 'lucide-react';
import { Incident, User as UserType, Resource, RequestRecord, HandoverRecord } from '../types';
import { IdleToIdeaService } from '../services/idleToIdeaService';

interface IncidentModalProps {
  incident: Incident;
  currentUser: UserType;
  resource?: Resource;
  request?: RequestRecord;
  handover?: HandoverRecord;
  onClose: () => void;
  onIncidentUpdated: () => void;
}

export const IncidentModal: React.FC<IncidentModalProps> = ({
  incident,
  currentUser,
  resource,
  request,
  handover,
  onClose,
  onIncidentUpdated,
}) => {
  const [userResponse, setUserResponse] = useState<string>(incident.response || '');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  // AI Summary State
  const [aiSummary, setAiSummary] = useState(incident.aiSummary || null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [isEditingAi, setIsEditingAi] = useState(false);

  // Resolution State
  const [decision, setDecision] = useState<Incident['decision']>(incident.decision || 'no_action');
  const [decisionReason, setDecisionReason] = useState<string>(incident.decisionReason || '');
  const [resolving, setResolving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isNamedRequester = request?.requesterId === currentUser.id;
  const canReview = currentUser.role === 'owner' || currentUser.role === 'supervisor' || currentUser.role === 'admin';

  // Call Server-side Gemini endpoint
  const handleGenerateAiSummary = async () => {
    setAiLoading(true);
    setAiMessage('');
    try {
      const res = await fetch('/api/gemini/summarize-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportText: incident.description,
          conditionRecords: {
            beforeCondition: handover?.beforeCondition,
            returnCondition: handover?.returnCondition,
          },
          userResponse: userResponse || incident.response,
          timelineEvents: [
            { time: handover?.checkoutAt, summary: `Check-out: ${handover?.beforeCondition}` },
            { time: handover?.returnedAt, summary: `Return: ${handover?.returnCondition}` },
            { time: incident.createdAt, summary: `Incident logged: ${incident.description}` },
          ],
        }),
      });

      const data = await res.json();
      setAiSummary({
        ...data.summary,
        generatedAt: IdleToIdeaService.getDemoClock(),
      });
      setAiMessage(data.message || 'AI-generated summary. Advisory only.');
    } catch (err) {
      console.error('Failed to summarize incident:', err);
      setAiSummary({
        reportedAllegations: [incident.description],
        verifiedFacts: [
          handover?.beforeCondition ? `Check-out condition: "${handover.beforeCondition}"` : 'Initial condition recorded.',
          handover?.returnCondition ? `Return condition: "${handover.returnCondition}"` : 'Return condition recorded.',
        ],
        missingInformation: ['Awaiting supervisor physical microscope assessment of PEI sheet.'],
        timeline: ['Session checkout recorded', 'Return logged with surface scratch', 'Incident report submitted'],
        generatedAt: IdleToIdeaService.getDemoClock(),
      });
      setAiMessage('AI service unavailable. Showing structured rule-based summary.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmitResponse = () => {
    if (!userResponse.trim()) return;
    try {
      setSubmittingResponse(true);
      IdleToIdeaService.respondToIncident(currentUser, incident.id, userResponse);
      onIncidentUpdated();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleResolveIncident = () => {
    if (!decisionReason.trim()) {
      setErrorMessage('Please state the factual rationale for this human resolution.');
      return;
    }
    try {
      setResolving(true);
      IdleToIdeaService.resolveIncident(currentUser, {
        incidentId: incident.id,
        decision,
        decisionReason,
      });
      onIncidentUpdated();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0f050a] border border-[#5c0f20] shadow-2xl p-5 sm:p-6 flex flex-col text-[#faedf1] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3b0e19]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#8a1731] to-[#3b0914] border border-[#f5b5c8]/50">
              <Scale className="w-5 h-5 text-[#f5b5c8]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-cinematic uppercase tracking-wide text-[#faedf1]">
                Incident & Dispute Review
              </h3>
              <p className="text-xs text-[#c4adb5] font-mono-film">
                Case #{incident.id.slice(0, 12)} • Status: {incident.status.toUpperCase()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#c4adb5] hover:text-[#fff] hover:bg-[#3b0e19] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NON-NEGOTIABLE ALLEGATION BANNER */}
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-950/60 border border-amber-600/70 text-amber-200 text-xs flex items-start space-x-3 shadow-inner">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-xs uppercase tracking-wider font-mono-film">
              UNREVIEWED REPORT. NOT A FINDING.
            </div>
            <p className="mt-0.5 text-[11px] text-[#fde8ef]/90 leading-relaxed">
              An incident report is an allegation until formally reviewed. IDLETOIDEA never assigns automatic blame or penalties merely because someone was the last user. Evidence before and after use is compared impartially.
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-5 text-xs">
          {/* Incident Details & Before/After comparison */}
          <div className="p-4 rounded-2xl bg-[#14060c] border border-[#3b0e19] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#f5b5c8] uppercase font-mono-film">
                Reported Incident Description
              </span>
              <span className="text-[10px] text-[#c4adb5] font-mono-film">
                Filed by {incident.reportedBy === 'user_rhea' ? 'Dr. Rhea Kapoor' : incident.reportedBy} on{' '}
                {new Date(incident.createdAt).toLocaleDateString()}
              </span>
            </div>

            <p className="text-xs text-[#faedf1] bg-[#0c0407] p-3 rounded-xl border border-[#2b0c16] leading-relaxed">
              "{incident.description}"
            </p>

            {/* Documented Evidence side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#0d0407] border border-[#2b0c16]">
                <span className="text-[10px] text-[#e094aa] uppercase font-mono-film block mb-1">
                  Baseline (Check-out Condition):
                </span>
                <p className="text-[11px] text-[#c4adb5]">
                  {handover?.beforeCondition || 'Clean PEI sheet, pristine smooth surface, calibrated 0.4mm nozzle.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0d0407] border border-[#2b0c16]">
                <span className="text-[10px] text-[#f5b5c8] uppercase font-mono-film block mb-1">
                  Recorded (Return Condition):
                </span>
                <p className="text-[11px] text-[#faedf1]">
                  {handover?.returnCondition || 'Hairline scratch on center of PEI sheet from metal spatula.'}
                </p>
              </div>
            </div>
          </div>

          {/* User Statement / Response Section */}
          <div className="p-4 rounded-2xl bg-[#17060e] border border-[#3b0e19] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#f5b5c8] uppercase font-mono-film flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Requester Statement & Explanation</span>
              </h4>
              {incident.response && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-700 font-mono-film">
                  Response Submitted
                </span>
              )}
            </div>

            {incident.response ? (
              <div className="p-3 rounded-xl bg-[#0c0407] border border-[#2b0c16] text-xs text-[#faedf1] italic">
                "{incident.response}"
              </div>
            ) : isNamedRequester ? (
              <div className="space-y-2">
                <p className="text-[11px] text-[#c4adb5]">
                  You are named in this incident report. Please provide your perspective on what occurred during your session:
                </p>
                <textarea
                  rows={3}
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="e.g. The part was stuck tight; I waited 10 mins for bed cooling and used the plastic scraper. The metal spatula on the bench might have caused the slight mark, but no deep gouge."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] focus:border-[#f5b5c8] text-xs text-[#faedf1] outline-none"
                />
                <button
                  onClick={handleSubmitResponse}
                  disabled={submittingResponse || !userResponse.trim()}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/60 text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  <Send className="w-3 h-3 text-[#f5b5c8]" />
                  <span>Submit Statement</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-[#c4adb5] italic">
                Awaiting requester response statement. (Switch to Meera Nair to respond).
              </p>
            )}
          </div>

          {/* AI Neutral Summarizer (Section 12.2) */}
          <div className="p-4 rounded-2xl bg-[#1b0811] border border-[#5c0f20] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#f5b5c8]" />
                <span className="text-xs font-semibold text-[#f5b5c8] uppercase font-mono-film">
                  AI Neutral Incident Summarizer (Gemini 3.8 Flash)
                </span>
              </div>
              <button
                onClick={handleGenerateAiSummary}
                disabled={aiLoading}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#2b0c16] hover:bg-[#3d1120] text-[#f5b5c8] border border-[#731627] text-xs font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{aiSummary ? 'Regenerate Summary' : 'Summarise this Incident'}</span>
              </button>
            </div>

            {aiLoading && (
              <div className="p-4 text-center text-xs text-[#c4adb5] animate-pulse">
                Analyzing evidence and generating neutral breakdown...
              </div>
            )}

            {aiSummary && !aiLoading && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-[10px] text-[#e094aa] font-mono-film bg-[#14060c] px-2.5 py-1 rounded-lg border border-[#3b0e19]">
                  <span>AI-GENERATED SUMMARY • ADVISORY ONLY</span>
                  <button
                    onClick={() => setIsEditingAi(!isEditingAi)}
                    className="flex items-center space-x-1 hover:text-[#f5b5c8]"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEditingAi ? 'Done Editing' : 'Edit Summary'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#0c0407] border border-[#2b0c16]">
                    <span className="font-bold text-[#f5b5c8] block mb-1 font-mono-film text-[10px]">
                      REPORTED ALLEGATIONS:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-[#d6c4ca] text-[11px]">
                      {aiSummary.reportedAllegations.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0c0407] border border-[#2b0c16]">
                    <span className="font-bold text-emerald-300 block mb-1 font-mono-film text-[10px]">
                      VERIFIED SYSTEM FACTS:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-[#d6c4ca] text-[11px]">
                      {aiSummary.verifiedFacts.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0c0407] border border-[#2b0c16]">
                    <span className="font-bold text-amber-300 block mb-1 font-mono-film text-[10px]">
                      MISSING INFORMATION:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-[#d6c4ca] text-[11px]">
                      {aiSummary.missingInformation.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0c0407] border border-[#2b0c16]">
                    <span className="font-bold text-blue-300 block mb-1 font-mono-film text-[10px]">
                      SEQUENCE OF EVENTS:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-[#d6c4ca] text-[11px]">
                      {aiSummary.timeline.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Human Review & Resolution Form (Owner/Supervisor/Admin only) */}
          {canReview && incident.status !== 'resolved' && (
            <div className="p-4 rounded-2xl bg-[#14060c] border border-[#5c0f20] space-y-3">
              <h4 className="text-xs font-semibold text-[#f5b5c8] uppercase font-mono-film">
                Human Review & Resolution (No Automatic Penalties)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#c4adb5] mb-1">
                    Formal Decision
                  </label>
                  <select
                    value={decision}
                    onChange={(e) => setDecision(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] focus:border-[#f5b5c8] text-xs text-[#faedf1] outline-none"
                  >
                    <option value="no_action">No Action / Normal Wear & Tear</option>
                    <option value="warning">Written Advisory Warning</option>
                    <option value="temporary_restriction">Temporary Restriction (7 Days)</option>
                    <option value="repair_fee_simulated">Simulated Replacement Cost (₹350 PEI plate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#c4adb5] mb-1">
                    Factual Rationale / Agreed Finding
                  </label>
                  <input
                    type="text"
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    placeholder="e.g. Surface mark consistent with premature scraping; resolved as minor wear warning with retraining."
                    className="w-full px-3 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] focus:border-[#f5b5c8] text-xs text-[#faedf1] outline-none"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-700 text-xs text-rose-200">
                  {errorMessage}
                </div>
              )}

              <button
                onClick={handleResolveIncident}
                disabled={resolving || !decisionReason.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#5c0f20] via-[#8a1731] to-[#5c0f20] text-[#fff] border border-[#f5b5c8]/60 text-xs font-semibold shadow-lg shadow-[#8a1731]/40 hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer"
              >
                Log Final Human Resolution & Close Case
              </button>
            </div>
          )}

          {/* Resolved State View */}
          {incident.status === 'resolved' && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-600/50 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>CASE RESOLVED BY {incident.resolvedBy?.toUpperCase()}</span>
              </div>
              <p className="text-xs text-[#faedf1]">
                <span className="text-[#c4adb5]">Finding / Action: </span>
                <span className="font-semibold uppercase">{incident.decision}</span>
              </p>
              <p className="text-xs text-[#faedf1]">
                <span className="text-[#c4adb5]">Rationale: </span>
                {incident.decisionReason}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#3b0e19] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1f0710] text-xs font-medium text-[#c4adb5] hover:text-[#faedf1]"
          >
            Close Incident View
          </button>
        </div>
      </div>
    </div>
  );
};
