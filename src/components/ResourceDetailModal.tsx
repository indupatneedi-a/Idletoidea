import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Coins,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Sparkles,
  Calendar,
  Layers,
  Info,
  ChevronRight,
  Gift,
  Tag,
  ArrowRight,
  Shield,
  Hourglass,
} from 'lucide-react';
import { Resource, User as UserType, Slot } from '../types';
import { IdleToIdeaService } from '../services/idleToIdeaService';
import { StatusChip, RiskChip, AccessModelChip } from './StatusChip';

interface ResourceDetailModalProps {
  resource: Resource | null;
  currentUser: UserType;
  onClose: () => void;
  onOpenQuiz: (quizId: string) => void;
  onRequestSubmitted: (message: string) => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  currentUser,
  onClose,
  onOpenQuiz,
  onRequestSubmitted,
}) => {
  if (!resource) return null;

  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [requestMessage, setRequestMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);

  const { isEligible, checklist } = IdleToIdeaService.getEligibility(currentUser.id, resource.id);
  const availableSlots = resource.availabilitySlots.filter((s) => s.state === 'available');

  const selectedSlot = resource.availabilitySlots.find((s) => s.id === selectedSlotId);
  const isSelectedSlotOccupied = selectedSlot && (selectedSlot.state === 'confirmed' || selectedSlot.state === 'held');

  const handleRequestSubmit = () => {
    setErrorMessage('');
    if (resource.transferMode === 'temporary' && !selectedSlotId) {
      setErrorMessage('Please select a time slot.');
      return;
    }

    try {
      setSubmitting(true);
      const result = IdleToIdeaService.submitRequest(currentUser, {
        resourceId: resource.id,
        slotId: selectedSlotId || undefined,
        message: requestMessage,
      });
      onRequestSubmitted(result.message);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinWaitlist = () => {
    setErrorMessage('');
    if (!selectedSlotId) {
      setErrorMessage('Please select the occupied slot to join its waitlist.');
      return;
    }

    try {
      setSubmitting(true);
      const result = IdleToIdeaService.joinWaitlist(currentUser, resource.id, selectedSlotId);
      onRequestSubmitted(`You are position #${result.position} on the waitlist for this slot!`);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to join waitlist.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSlotTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0f050a] border border-[#5c0f20] shadow-2xl flex flex-col text-[#faedf1] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 sm:p-5 bg-[#17060e]/95 border-b border-[#3b0e19] backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#3b0914] text-[#f5b5c8] border border-[#5c0f20] font-mono-film">
              {resource.category}
            </span>
            <AccessModelChip
              priceMode={resource.priceMode}
              transferMode={resource.transferMode}
              price={resource.price}
              priceUnit={resource.priceUnit}
            />
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#c4adb5] hover:text-[#fff] hover:bg-[#3b0e19] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Title & Photo Gallery */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black font-cinematic uppercase tracking-wide text-[#faedf1]">
                  {resource.title}
                </h2>
                <div className="flex items-center space-x-2 text-xs text-[#c4adb5] mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#f5b5c8]" />
                  <span>{resource.location}</span>
                  <span>•</span>
                  <span>Demo Innovation Lab (fictional)</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <RiskChip risk={resource.riskLevel} />
                <StatusChip status={resource.status} />
              </div>
            </div>

            {/* Gallery Image */}
            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-[#1f0912] border border-[#3b0e19]">
              <img
                src={resource.photos[activePhotoIdx] || resource.photos[0]}
                alt={resource.title}
                className="w-full h-full object-cover"
              />
              {resource.photos.length > 1 && (
                <div className="absolute bottom-3 right-3 flex space-x-1.5 bg-black/60 p-1.5 rounded-xl backdrop-blur-md">
                  {resource.photos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        activePhotoIdx === idx ? 'bg-[#f5b5c8] scale-110' : 'bg-neutral-600'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description & Specs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-5">
              <div>
                <h4 className="text-xs font-semibold text-[#f5b5c8] uppercase font-mono-film mb-1">
                  Overview & Capabilities
                </h4>
                <p className="text-sm text-[#d6c4ca] leading-relaxed">
                  {resource.description}
                </p>
              </div>

              {/* Condition & Logistics */}
              <div className="p-4 rounded-2xl bg-[#17060e] border border-[#3b0e19] space-y-3">
                <h4 className="text-xs font-semibold text-[#f5b5c8] uppercase font-mono-film flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Condition & Operational Logistics</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#c4adb5] block">Current Condition:</span>
                    <span className="text-[#faedf1] font-medium">{resource.conditionSummary}</span>
                  </div>
                  <div>
                    <span className="text-[#c4adb5] block">Collection Point:</span>
                    <span className="text-[#faedf1] font-medium">{resource.collectionPoint}</span>
                  </div>
                  <div>
                    <span className="text-[#c4adb5] block">Setup Protocol:</span>
                    <span className="text-[#faedf1] font-medium">{resource.setupNotes}</span>
                  </div>
                  <div>
                    <span className="text-[#c4adb5] block">Return Protocol:</span>
                    <span className="text-[#faedf1] font-medium">{resource.returnInstructions}</span>
                  </div>
                </div>

                {resource.accessories.length > 0 && (
                  <div className="pt-2 border-t border-[#260a12]">
                    <span className="text-[11px] text-[#c4adb5] block mb-1">Included Accessories:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {resource.accessories.map((acc, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-lg bg-[#220710] border border-[#4a1220] text-[#fde8ef]">
                          • {acc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Safety & PPE Notes */}
              <div className="p-4 rounded-2xl bg-[#1b0811] border border-[#5c0f20]/60 space-y-2">
                <h4 className="text-xs font-semibold text-[#f5b5c8] uppercase font-mono-film flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#f5b5c8]" />
                  <span>Safety Notes & Required PPE</span>
                </h4>
                <p className="text-xs text-[#faedf1]">{resource.safetyNotes}</p>
                {resource.ppe.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {resource.ppe.map((item, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-700/50 text-rose-200">
                        PPE: {item}
                      </span>
                    ))}
                  </div>
                )}
                {resource.prohibitedUses && (
                  <div className="text-[11px] text-rose-300/90 pt-1">
                    <span className="font-semibold">Prohibited uses: </span>
                    {resource.prohibitedUses}
                  </div>
                )}
              </div>

              {/* Published Owner Policies */}
              <div className="p-4 rounded-2xl bg-[#14060c] border border-[#3b0e19] space-y-2 text-xs">
                <h4 className="text-xs font-semibold text-[#f5b5c8] uppercase font-mono-film">
                  Published Access & Allocation Policies
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-[#0d0407] border border-[#2b0c16]">
                    <span className="text-[#c4adb5] block">Active Cap:</span>
                    <span className="font-bold text-[#faedf1]">{resource.policies.bookingCap} slots / user</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#0d0407] border border-[#2b0c16]">
                    <span className="text-[#c4adb5] block">Waitlist Offer:</span>
                    <span className="font-bold text-[#faedf1]">{resource.policies.waitlistOfferHours} Hours window</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#0d0407] border border-[#2b0c16]">
                    <span className="text-[#c4adb5] block">Cancellation Notice:</span>
                    <span className="font-bold text-[#faedf1]">{resource.policies.cancellationNoticeHours} Hours before</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#0d0407] border border-[#2b0c16]">
                    <span className="text-[#c4adb5] block">No-show Threshold:</span>
                    <span className="font-bold text-[#faedf1]">{resource.policies.noShowMinutes} mins after start</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#0d0407] border border-[#2b0c16]">
                    <span className="text-[#c4adb5] block">Overdue Grace:</span>
                    <span className="font-bold text-[#faedf1]">{resource.policies.graceMinutes} mins</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#0d0407] border border-[#2b0c16]">
                    <span className="text-[#c4adb5] block">Auto-Extension:</span>
                    <span className="font-bold text-[#faedf1]">
                      {resource.policies.autoExtendEnabled ? `Yes (max ${resource.policies.maxExtensionMinutes}m)` : 'Review required'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Eligibility Checklist & Booking Form */}
            <div className="space-y-5">
              {/* Eligibility Checklist */}
              <div className="p-4 rounded-2xl bg-[#17060e] border border-[#5c0f20] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[#f5b5c8] uppercase font-mono-film">
                    Your Eligibility Status
                  </h4>
                  <span
                    className={`text-[10px] font-mono-film px-2 py-0.5 rounded-full ${
                      isEligible
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                        : 'bg-rose-950 text-rose-300 border border-rose-600'
                    }`}
                  >
                    {isEligible ? 'Eligible to book' : 'Requirements pending'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {checklist.map((c, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-xl border flex items-start space-x-2 ${
                        c.met ? 'bg-emerald-950/20 border-emerald-900/40 text-[#faedf1]' : 'bg-rose-950/20 border-rose-900/40 text-[#fcd5e0]'
                      }`}
                    >
                      {c.met ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-[11px]">{c.label}</div>
                        <div className="text-[10px] text-[#c4adb5]">{c.detail}</div>
                        {c.action === 'take_quiz' && resource.quizId && (
                          <button
                            onClick={() => onOpenQuiz(resource.quizId!)}
                            className="mt-1.5 inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/50 text-[10px] font-semibold"
                          >
                            <Sparkles className="w-3 h-3 text-[#f5b5c8]" />
                            <span>Take Safety Quiz Now</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking Slot Selection or Permanent Handover */}
              {resource.transferMode === 'temporary' ? (
                <div className="p-4 rounded-2xl bg-[#14060c] border border-[#3b0e19] space-y-3">
                  <h4 className="text-xs font-semibold text-[#f5b5c8] uppercase font-mono-film">
                    Select Time Slot
                  </h4>

                  <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                    {resource.availabilitySlots.slice(0, 14).map((slot) => {
                      const isAvail = slot.state === 'available';
                      const isHeld = slot.state === 'held';
                      const isConf = slot.state === 'confirmed';
                      const isBlock = slot.state === 'blocked';
                      const isSelected = selectedSlotId === slot.id;

                      return (
                        <div
                          key={slot.id}
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-[#2b0c16] border-[#f5b5c8] shadow-sm'
                              : isAvail
                              ? 'bg-[#0d0407] border-[#2b0c16] hover:border-[#5c0f20]'
                              : isBlock
                              ? 'bg-[#18080c] border-neutral-800 opacity-60'
                              : 'bg-[#1e0710] border-[#3b0e19]'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3.5 h-3.5 text-[#f5b5c8]" />
                            <span className="font-mono-film text-[11px]">
                              {formatSlotTime(slot.start)}
                            </span>
                          </div>

                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono-film uppercase ${
                              isAvail
                                ? 'bg-emerald-950 text-emerald-300'
                                : isBlock
                                ? 'bg-amber-950 text-amber-300'
                                : 'bg-[#420f1e] text-[#f5b5c8]'
                            }`}
                          >
                            {isAvail ? 'Available' : isBlock ? 'Maintenance' : 'Occupied'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Input */}
                  <div>
                    <label className="block text-[11px] font-medium text-[#c4adb5] mb-1">
                      Project Purpose / Brief note
                    </label>
                    <input
                      type="text"
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="e.g. Slicing test for thesis prototype"
                      className="w-full px-3 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] focus:border-[#f5b5c8] text-xs text-[#faedf1] placeholder-[#7a646c] outline-none"
                    />
                  </div>

                  {/* Payment Note if Paid */}
                  {resource.priceMode === 'paid' && (
                    <div className="p-2 rounded-xl bg-[#240812] border border-[#4a1220] text-[11px] text-[#fde8ef]">
                      <div className="flex items-center space-x-1.5 text-[#f5b5c8] font-semibold">
                        <Coins className="w-3 h-3" />
                        <span>Fictional Fee: ₹{resource.price} {resource.priceUnit || '/hr'}</span>
                      </div>
                      <p className="text-[10px] text-[#c4adb5] mt-0.5">
                        Simulation only. No real money is moved.
                      </p>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-700 text-xs text-rose-200">
                      {errorMessage}
                    </div>
                  )}

                  {/* Actions: Request Access or Join Waitlist */}
                  {isSelectedSlotOccupied ? (
                    <button
                      onClick={handleJoinWaitlist}
                      disabled={submitting || !isEligible}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#3b0914] via-[#5c0f20] to-[#3b0914] text-[#f5b5c8] border border-[#f5b5c8]/50 text-xs font-semibold shadow-md hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5"
                    >
                      <Hourglass className="w-3.5 h-3.5 text-[#f5b5c8]" />
                      <span>Join Transparent Waitlist for this Slot</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleRequestSubmit}
                      disabled={submitting || !isEligible || !selectedSlotId}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#5c0f20] via-[#8a1731] to-[#5c0f20] text-[#fff] border border-[#f5b5c8]/60 text-xs font-semibold shadow-lg shadow-[#8a1731]/40 hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5"
                    >
                      <span>
                        {resource.approvalMode === 'auto-if-low-risk'
                          ? 'Confirm Access (Auto-approve)'
                          : 'Submit Access Request (Pending Review)'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#f5b5c8]" />
                    </button>
                  )}

                  {!isEligible && (
                    <p className="text-[10px] text-center text-[#e094aa]">
                      Complete all eligibility prerequisites above to unlock request submission.
                    </p>
                  )}
                </div>
              ) : (
                /* Permanent Handover (Giveaway / Sale) */
                <div className="p-4 rounded-2xl bg-[#14060c] border border-[#3b0e19] space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-mono-film text-[#f5b5c8]">
                    {resource.priceMode === 'free' ? <Gift className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                    <span>PERMANENT HANDOVER FLOW</span>
                  </div>

                  <p className="text-xs text-[#c4adb5]">
                    {resource.priceMode === 'free'
                      ? 'This is a free makerspace equipment giveaway. If accepted, ownership is permanently transferred to the recipient upon physical handover.'
                      : `Surplus equipment sale at simulated price ₹${resource.price}. Payment simulation and handover record are logged.`}
                  </p>

                  <div>
                    <label className="block text-[11px] font-medium text-[#c4adb5] mb-1">
                      Proposed use for the equipment
                    </label>
                    <textarea
                      rows={2}
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Explain your intended project work..."
                      className="w-full px-3 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] focus:border-[#f5b5c8] text-xs text-[#faedf1] placeholder-[#7a646c] outline-none"
                    />
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-700 text-xs text-rose-200">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    onClick={handleRequestSubmit}
                    disabled={submitting || !isEligible}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#5c0f20] via-[#8a1731] to-[#5c0f20] text-[#fff] border border-[#f5b5c8]/60 text-xs font-semibold shadow-lg shadow-[#8a1731]/40 hover:scale-[1.01] transition-all disabled:opacity-50"
                  >
                    Request Permanent Transfer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
