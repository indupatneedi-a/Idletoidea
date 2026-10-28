import React, { useState } from 'react';
import {
  X,
  PlayCircle,
  RotateCcw,
  CheckSquare,
  Square,
  Camera,
  AlertTriangle,
  Clock,
  User,
  ShieldAlert,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { RequestRecord, Resource, User as UserType, HandoverRecord } from '../types';
import { IdleToIdeaService } from '../services/idleToIdeaService';

interface CheckoutReturnModalProps {
  mode: 'checkout' | 'return';
  request: RequestRecord;
  resource: Resource;
  currentUser: UserType;
  existingHandover?: HandoverRecord;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const CheckoutReturnModal: React.FC<CheckoutReturnModalProps> = ({
  mode,
  request,
  resource,
  currentUser,
  existingHandover,
  onClose,
  onSuccess,
}) => {
  const isCheckout = mode === 'checkout';

  // State for condition notes
  const [conditionNotes, setConditionNotes] = useState<string>(
    isCheckout
      ? 'Clean PEI sheet, pristine smooth surface, nozzle clean, 0.4mm calibrated.'
      : 'Print completed cleanly. Work area wiped down and scraper returned.'
  );

  const [accessoriesChecked, setAccessoriesChecked] = useState<string[]>(
    isCheckout ? resource.accessories : existingHandover?.accessoriesChecked || resource.accessories
  );

  const [photoUrl, setPhotoUrl] = useState<string>(
    isCheckout
      ? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1631553127989-532454f0a2e5?w=400&auto=format&fit=crop&q=80'
  );

  const [reportedIssues, setReportedIssues] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const toggleAccessory = (item: string) => {
    setAccessoriesChecked((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = () => {
    setErrorMessage('');
    if (!conditionNotes.trim()) {
      setErrorMessage('Please provide inspection condition notes.');
      return;
    }

    try {
      setSubmitting(true);
      if (isCheckout) {
        IdleToIdeaService.recordCheckout(currentUser, {
          requestId: request.id,
          beforeCondition: conditionNotes,
          accessoriesChecked,
          beforePhotos: photoUrl ? [photoUrl] : [],
        });
        onSuccess(`Check-out completed for ${resource.title}! Equipment is now In Use.`);
      } else {
        IdleToIdeaService.recordReturn(currentUser, {
          requestId: request.id,
          returnCondition: conditionNotes,
          accessoriesReturned: accessoriesChecked,
          returnPhotos: photoUrl ? [photoUrl] : [],
          reportedIssues: reportedIssues.trim() || undefined,
        });
        onSuccess(`Return condition verified for ${resource.title}. Booking completed!`);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing handover.');
    } finally {
      setSubmitting(false);
    }
  };

  const demoTime = IdleToIdeaService.getDemoClock();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0f050a] border border-[#5c0f20] shadow-2xl p-5 sm:p-6 flex flex-col text-[#faedf1] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3b0e19]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#8a1731] to-[#3b0914] border border-[#f5b5c8]/50">
              {isCheckout ? <PlayCircle className="w-5 h-5 text-[#f5b5c8]" /> : <RotateCcw className="w-5 h-5 text-[#f5b5c8]" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-cinematic uppercase tracking-wide text-[#faedf1]">
                {isCheckout ? 'Initial Check-Out Inspection' : 'Return Condition Verification'}
              </h3>
              <p className="text-xs text-[#c4adb5] font-mono-film">
                {resource.title} • Request #{request.id.slice(0, 12)}
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

        {/* Content Body */}
        <div className="py-4 space-y-5 text-xs">
          {/* Inspection Metadata */}
          <div className="p-3 rounded-2xl bg-[#17060e] border border-[#3b0e19] grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#c4adb5] block">Inspection Timestamp:</span>
              <span className="text-[#faedf1] font-mono-film font-semibold">
                {new Date(demoTime).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[#c4adb5] block">Supervised By:</span>
              <span className="text-[#faedf1] font-semibold">
                {currentUser.displayName} ({currentUser.role})
              </span>
            </div>
          </div>

          {/* If Return: Side-by-Side Comparison */}
          {!isCheckout && existingHandover && (
            <div className="p-4 rounded-2xl bg-[#14060c] border border-[#4a1220] space-y-3">
              <h4 className="text-xs font-semibold text-[#f5b5c8] uppercase font-mono-film flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Side-by-Side Condition Audit</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-[#0d0407] border border-[#2b0c16]">
                  <span className="text-[10px] text-[#e094aa] uppercase font-mono-film block mb-1">
                    BEFORE (At Check-Out):
                  </span>
                  <p className="text-xs text-[#faedf1] italic">
                    "{existingHandover.beforeCondition || 'Pristine condition recorded.'}"
                  </p>
                  {existingHandover.beforePhotos?.[0] && (
                    <img
                      src={existingHandover.beforePhotos[0]}
                      alt="Before condition"
                      className="mt-2 w-full h-24 object-cover rounded-lg border border-[#3b0e19]"
                    />
                  )}
                </div>

                <div className="p-3 rounded-xl bg-[#1c0812] border border-[#5c0f20]">
                  <span className="text-[10px] text-[#f5b5c8] uppercase font-mono-film block mb-1">
                    AFTER (Return Inspection):
                  </span>
                  <p className="text-xs text-[#fde8ef]">
                    Enter final return condition below to compare against initial baseline.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Condition Notes */}
          <div>
            <label className="block text-xs font-medium text-[#fde8ef] mb-1">
              {isCheckout ? 'Initial Visible Condition Notes' : 'Final Return Condition Notes'}
            </label>
            <textarea
              rows={3}
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              placeholder="Record any wear, calibration values, clean surface, or scratches..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] focus:border-[#f5b5c8] text-xs text-[#faedf1] outline-none"
            />
          </div>

          {/* Accessories Checklist */}
          {resource.accessories.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-[#fde8ef] mb-1.5">
                {isCheckout ? 'Verify Handover Accessories Issued:' : 'Verify Accessories Returned:'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {resource.accessories.map((acc, i) => {
                  const isChecked = accessoriesChecked.includes(acc);
                  return (
                    <div
                      key={i}
                      onClick={() => toggleAccessory(acc)}
                      className={`p-2 rounded-xl border flex items-center space-x-2 cursor-pointer transition-colors ${
                        isChecked ? 'bg-[#2b0c16] border-[#f5b5c8]/60 text-[#faedf1]' : 'bg-[#0d0407] border-[#2b0c16] text-[#c4adb5]'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#f5b5c8] shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-neutral-600 shrink-0" />
                      )}
                      <span className="text-xs">{acc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Photo URL / Evidence */}
          <div>
            <label className="block text-xs font-medium text-[#c4adb5] mb-1 flex items-center space-x-1">
              <Camera className="w-3.5 h-3.5 text-[#f5b5c8]" />
              <span>Evidence Photo URL (Simulated storage)</span>
            </label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] focus:border-[#f5b5c8] text-xs text-[#faedf1] outline-none font-mono-film"
            />
          </div>

          {/* If Return: Reported issues */}
          {!isCheckout && (
            <div>
              <label className="block text-xs font-medium text-amber-200 mb-1 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Any Damage or Issues to Flag? (Optional)</span>
              </label>
              <textarea
                rows={2}
                value={reportedIssues}
                onChange={(e) => setReportedIssues(e.target.value)}
                placeholder="e.g. Scratched PEI plate during part removal, or optical lens fogging."
                className="w-full px-3.5 py-2 rounded-xl bg-[#0c0407] border border-amber-800/60 focus:border-amber-400 text-xs text-[#faedf1] outline-none"
              />
              <p className="text-[10px] text-[#c4adb5] mt-1">
                Flagging an issue will notify the owner and allow a formal incident review with human resolution.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700 text-xs text-rose-200">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#3b0e19] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1f0710] text-xs font-medium text-[#c4adb5] hover:text-[#faedf1]"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5c0f20] via-[#8a1731] to-[#5c0f20] text-[#fff] border border-[#f5b5c8]/60 text-xs font-semibold shadow-lg shadow-[#8a1731]/40 hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
          >
            {isCheckout ? 'Confirm Check-Out (Begin Session)' : 'Finalize Return & Audit'}
          </button>
        </div>
      </div>
    </div>
  );
};
