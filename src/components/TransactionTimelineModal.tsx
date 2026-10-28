import React from 'react';
import {
  X,
  History,
  CheckCircle2,
  Clock,
  User,
  Shield,
  FileText,
  AlertTriangle,
  RotateCcw,
  PlayCircle,
  Coins,
  Gift,
} from 'lucide-react';
import { RequestRecord, Resource, User as UserType, HandoverRecord, Incident } from '../types';
import { dataStore } from '../services/store';

interface TransactionTimelineModalProps {
  request: RequestRecord;
  resource?: Resource;
  currentUser: UserType;
  onClose: () => void;
}

export const TransactionTimelineModal: React.FC<TransactionTimelineModalProps> = ({
  request,
  resource,
  currentUser,
  onClose,
}) => {
  const state = dataStore.getState();

  // Find all audit logs, handovers, payments, incidents, and extensions associated with this request
  const relatedLogs = state.auditLogs
    .filter((l) => l.entityId === request.id || l.summary.includes(request.id))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handover = state.handoverRecords.find((h) => h.requestId === request.id);
  const incident = state.incidents.find((i) => i.requestId === request.id);
  const payment = state.paymentsDemo.find((p) => p.requestId === request.id);

  // Synthesize unified chronological events
  const events: {
    time: string;
    actor: string;
    role: string;
    title: string;
    details: string;
    reasonCode?: string;
    icon: any;
    color: string;
  }[] = [];

  // 1. Request submission
  events.push({
    time: request.createdAt,
    actor: request.requesterId === 'user_aarav' ? 'Aarav Rao' : request.requesterId === 'user_meera' ? 'Meera Nair' : 'Kabir Shah',
    role: 'requester',
    title: `Submitted ${request.requestType} Request`,
    details: `Message: "${request.message}". Eligibility prerequisites checked.`,
    reasonCode: 'REQUEST_SUBMITTED',
    icon: Clock,
    color: 'text-blue-400',
  });

  // 2. Decision if decided
  if (request.decisionAt) {
    events.push({
      time: request.decisionAt,
      actor: request.decisionBy === 'user_sam' ? 'Sam Iyer' : request.decisionBy === 'user_rhea' ? 'Dr. Rhea Kapoor' : 'System Auto-Rule',
      role: request.decisionBy === 'system' ? 'policy-engine' : 'supervisor',
      title: `Request ${request.status.toUpperCase()}`,
      details: request.decisionNote || 'Decision recorded under published makerspace policy.',
      reasonCode: request.decisionReasonCode,
      icon: CheckCircle2,
      color: request.status === 'confirmed' ? 'text-emerald-400' : 'text-neutral-400',
    });
  }

  // 3. Payment state
  if (payment) {
    events.push({
      time: payment.updatedAt,
      actor: 'System Ledger',
      role: 'simulation',
      title: `Simulated Payment State: ${payment.status.toUpperCase()}`,
      details: `Amount: ₹${payment.amount} ${payment.currency}. ${payment.simulationLabel}`,
      icon: Coins,
      color: 'text-amber-400',
    });
  }

  // 4. Check-out
  if (handover?.checkoutAt) {
    events.push({
      time: handover.checkoutAt,
      actor: handover.checkoutBy === 'user_sam' ? 'Sam Iyer' : 'Lab Officer',
      role: 'supervisor',
      title: 'Initial Check-Out Handover Completed',
      details: `Condition: "${handover.beforeCondition}". Accessories verified: ${handover.accessoriesChecked.join(', ')}.`,
      icon: PlayCircle,
      color: 'text-purple-400',
    });
  }

  // 5. Return
  if (handover?.returnedAt) {
    events.push({
      time: handover.returnedAt,
      actor: handover.returnedRecordedBy === 'user_sam' ? 'Sam Iyer' : 'Lab Officer',
      role: 'supervisor',
      title: 'Return Inspection Verified',
      details: `Condition: "${handover.returnCondition}". ${handover.reportedIssues ? `Reported issue: ${handover.reportedIssues}` : 'Returned clean.'}`,
      icon: RotateCcw,
      color: 'text-emerald-400',
    });
  }

  // 6. Incident if exists
  if (incident) {
    events.push({
      time: incident.createdAt,
      actor: incident.reportedBy === 'user_rhea' ? 'Dr. Rhea Kapoor' : incident.reportedBy,
      role: 'owner',
      title: 'Incident Report Logged',
      details: `Allegation: "${incident.description}". Treated as unreviewed allegation.`,
      icon: AlertTriangle,
      color: 'text-rose-400',
    });

    if (incident.responseAt) {
      events.push({
        time: incident.responseAt,
        actor: 'Meera Nair',
        role: 'requester',
        title: 'Requester Response Statement',
        details: `Statement: "${incident.response}"`,
        icon: User,
        color: 'text-blue-400',
      });
    }

    if (incident.resolvedAt) {
      events.push({
        time: incident.resolvedAt,
        actor: incident.resolvedBy || 'Reviewer',
        role: 'supervisor',
        title: `Incident Resolved (${incident.decision?.toUpperCase()})`,
        details: `Rationale: "${incident.decisionReason}". Human review completed.`,
        icon: CheckCircle2,
        color: 'text-emerald-400',
      });
    }
  }

  // Sort chronologically
  events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0f050a] border border-[#5c0f20] shadow-2xl p-5 sm:p-6 flex flex-col text-[#faedf1] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3b0e19]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#8a1731] to-[#3b0914] border border-[#f5b5c8]/50">
              <History className="w-5 h-5 text-[#f5b5c8]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-cinematic uppercase tracking-wide text-[#faedf1]">
                Transaction History & Audit Timeline
              </h3>
              <p className="text-xs text-[#c4adb5] font-mono-film">
                Request #{request.id.slice(0, 12)} • {resource?.title || 'Resource'}
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

        {/* Timeline Events */}
        <div className="py-5">
          <div className="relative border-l-2 border-[#3b0e19] ml-4 space-y-6">
            {events.map((ev, idx) => {
              const IconComp = ev.icon;
              return (
                <div key={idx} className="relative pl-6">
                  {/* Timeline Node */}
                  <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-[#17060e] border border-[#5c0f20] flex items-center justify-center shadow-md">
                    <IconComp className={`w-4 h-4 ${ev.color}`} />
                  </div>

                  {/* Event Card */}
                  <div className="p-3.5 rounded-2xl bg-[#14060c] border border-[#2b0c16] space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <span className="font-bold text-[#faedf1]">{ev.title}</span>
                      <span className="text-[10px] text-[#c4adb5] font-mono-film">
                        {new Date(ev.time).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-[#d6c4ca] leading-relaxed">
                      {ev.details}
                    </p>

                    <div className="flex items-center space-x-2 text-[10px] font-mono-film text-[#f5b5c8] pt-1">
                      <span>Actor: {ev.actor} ({ev.role})</span>
                      {ev.reasonCode && (
                        <>
                          <span>•</span>
                          <span className="bg-[#260810] px-1.5 py-0.5 rounded text-[#e094aa]">
                            Code: {ev.reasonCode}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#3b0e19] flex items-center justify-between text-xs text-[#c4adb5]">
          <span>Single shared timeline visible to requester and owner.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1f0710] font-medium text-[#c4adb5] hover:text-[#faedf1]"
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
};
