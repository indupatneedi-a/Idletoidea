import React from 'react';
import {
  CheckCircle2,
  Circle,
  X,
  Compass,
  ArrowRight,
  UserCheck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Shield,
  Clock,
} from 'lucide-react';
import { User, AuditLogItem } from '../types';
import { IdleToIdeaService } from '../services/idleToIdeaService';

interface JudgeWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  currentStepIndex: number;
  onSelectStep: (step: number) => void;
  currentUser: User;
  auditLogs: AuditLogItem[];
  onNavigateTab: (tab: string) => void;
  onOpenCreateListing: () => void;
  onResetData: () => void;
}

export interface WalkthroughStep {
  id: number;
  title: string;
  recommendedRole: string;
  recommendedUserId: string;
  targetTab: string;
  instruction: string;
  checkEvent: (logs: AuditLogItem[]) => boolean;
  actionButtonText?: string;
  action?: () => void;
}

export const JudgeWalkthrough: React.FC<JudgeWalkthroughProps> = ({
  isOpen,
  onClose,
  currentStepIndex,
  onSelectStep,
  currentUser,
  auditLogs,
  onNavigateTab,
  onOpenCreateListing,
  onResetData,
}) => {
  if (!isOpen) return null;

  const STEPS: WalkthroughStep[] = [
    {
      id: 1,
      title: 'Owner Lists a Resource',
      recommendedRole: 'Dr. Rhea Kapoor (Owner)',
      recommendedUserId: 'user_rhea',
      targetTab: 'owner-dashboard',
      instruction:
        'Switch to Dr. Rhea Kapoor or Dev Menon. Open the listing creator, use "Fill with example" to prepopulate safety rules and booking cap policies, and publish.',
      checkEvent: (logs) => logs.some((l) => l.action === 'CREATE_LISTING'),
      actionButtonText: 'Open Create Listing Modal',
      action: onOpenCreateListing,
    },
    {
      id: 2,
      title: 'Discover & Check Eligibility',
      recommendedRole: 'Aarav Rao (Requester)',
      recommendedUserId: 'user_aarav',
      targetTab: 'discover',
      instruction:
        'Switch to Aarav Rao (student). Browse listings or use "Find my match" AI. Open Demo 3D Printer details to see the unmet eligibility checklist, then complete the 5-question safety quiz.',
      checkEvent: (logs) => logs.some((l) => l.action === 'SUBMIT_QUIZ'),
    },
    {
      id: 3,
      title: 'Submit Booking Request',
      recommendedRole: 'Aarav Rao (Requester)',
      recommendedUserId: 'user_aarav',
      targetTab: 'discover',
      instruction:
        'Pick an available time slot on the 3D Printer, write a brief project message, and submit. Verify that the booking status is clearly marked "Pending review" (never falsely confirmed).',
      checkEvent: (logs) => logs.some((l) => l.action === 'SUBMIT_REQUEST'),
    },
    {
      id: 4,
      title: 'System Verifies Requirements',
      recommendedRole: 'Aarav Rao (Requester)',
      recommendedUserId: 'user_aarav',
      targetTab: 'my-requests',
      instruction:
        'Visit My Requests dashboard. Inspect the request card showing the snapshot of verified training, active booking cap limit, and transactional overlap verification.',
      checkEvent: (logs) => logs.some((l) => l.action === 'SUBMIT_REQUEST'),
    },
    {
      id: 5,
      title: 'Owner / Supervisor Reviews Request',
      recommendedRole: 'Sam Iyer (Supervisor)',
      recommendedUserId: 'user_sam',
      targetTab: 'supervisor-dashboard',
      instruction:
        'Switch to Supervisor Sam Iyer. Open the Review Queue, inspect the requester safety training snapshot, and click Approve or Reject with a mandatory plain-language reason code.',
      checkEvent: (logs) => logs.some((l) => l.action === 'APPROVE_REQUEST' || l.action === 'REJECT_REQUEST'),
    },
    {
      id: 6,
      title: 'Fair Allocation & Waitlist Position',
      recommendedRole: 'Meera Nair (Requester)',
      recommendedUserId: 'user_meera',
      targetTab: 'my-requests',
      instruction:
        'Switch to Meera Nair to view her active waitlist position (#1) for the 3D printer. Switch to Kabir Shah to cancel his conflicting booking and watch the freed slot immediately offered to Meera!',
      checkEvent: (logs) => logs.some((l) => l.action === 'CANCEL_BOOKING' || l.action === 'OFFER_WAITLIST_SLOT' || l.action === 'ACCEPT_WAITLIST_OFFER'),
    },
    {
      id: 7,
      title: 'Check-in with Initial Condition',
      recommendedRole: 'Sam Iyer (Supervisor)',
      recommendedUserId: 'user_sam',
      targetTab: 'supervisor-dashboard',
      instruction:
        'On a confirmed booking, record the initial check-out condition: note PEI build plate state, verify accessories checklist, and log timestamp. Booking moves to "In use".',
      checkEvent: (logs) => logs.some((l) => l.action === 'RECORD_CHECKOUT'),
    },
    {
      id: 8,
      title: 'Return with Final Condition',
      recommendedRole: 'Sam Iyer (Supervisor)',
      recommendedUserId: 'user_sam',
      targetTab: 'supervisor-dashboard',
      instruction:
        'Record return inspection notes, check off returned accessories, compare before-and-after condition side-by-side, and finalize return. Slot is returned to availability.',
      checkEvent: (logs) => logs.some((l) => l.action === 'RECORD_RETURN'),
    },
    {
      id: 9,
      title: 'Overdue Stages & Incident Review',
      recommendedRole: 'Dr. Rhea Kapoor (Owner)',
      recommendedUserId: 'user_rhea',
      targetTab: 'owner-dashboard',
      instruction:
        'Advance the Demo Clock to trigger overdue stages, or inspect the pre-seeded incident on 3D Printer. Generate the neutral Gemini AI summary, review user response, and submit a fair human resolution.',
      checkEvent: (logs) => logs.some((l) => l.action === 'RESOLVE_INCIDENT'),
    },
    {
      id: 10,
      title: 'Transaction Timeline & Audit Trail',
      recommendedRole: 'Nisha Verma (Admin)',
      recommendedUserId: 'user_nisha',
      targetTab: 'admin-dashboard',
      instruction:
        'Inspect the full append-only audit trail in the Admin view. Open any booking transaction timeline to verify that both requester and owner see identical, verifiable event histories.',
      checkEvent: (logs) => logs.length > 5,
    },
  ];

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[#0c0509] border-l border-[#4a1220] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#29070f] via-[#4d0c1c] to-[#29070f] border-b border-[#5c0f20] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Compass className="w-5 h-5 text-[#f5b5c8]" />
          <div>
            <h2 className="text-sm font-black font-cinematic uppercase tracking-wider text-[#faedf1]">
              Judge Walkthrough
            </h2>
            <p className="text-[10px] text-[#fcd5e0] font-mono-film">
              10-Step End-to-End Guided Demonstration
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onResetData}
            title="Reset demo data"
            className="p-1.5 rounded-lg bg-[#14050a] text-[#c4adb5] hover:text-[#f5b5c8] border border-[#3b0e19] text-[10px] flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#c4adb5] hover:text-[#faedf1] hover:bg-[#3b0e19]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Counter */}
      <div className="px-4 py-2 bg-[#14060c] border-b border-[#2b0c16] flex items-center justify-between text-xs font-mono-film text-[#c4adb5]">
        <span>
          STEP {currentStepIndex + 1} OF {STEPS.length}
        </span>
        <span className="text-[#f5b5c8]">
          {STEPS.filter((s) => s.checkEvent(auditLogs)).length} Completed
        </span>
      </div>

      {/* Step List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {STEPS.map((step, idx) => {
          const isDone = step.checkEvent(auditLogs);
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step.id}
              onClick={() => onSelectStep(idx)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-[#220710] border-[#f5b5c8]/80 shadow-lg shadow-[#8a1731]/30'
                  : isDone
                  ? 'bg-[#14060c]/70 border-emerald-900/50 opacity-90'
                  : 'bg-[#14060c] border-[#3b0e19] hover:border-[#5c0f20]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-[#f5b5c8]' : 'text-neutral-600'}`} />
                  )}
                  <span className="text-xs font-black font-cinematic uppercase tracking-wider text-[#faedf1]">
                    {step.id}. {step.title}
                  </span>
                </div>
                {isCurrent && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5c0f20] text-[#f5b5c8] font-mono-film">
                    ACTIVE
                  </span>
                )}
              </div>

              {/* Instruction */}
              <p className="mt-2 text-xs text-[#d6c4ca] leading-relaxed">
                {step.instruction}
              </p>

              {/* Action Buttons */}
              <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-[#3b0e19]/60">
                {currentUser.id !== step.recommendedUserId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      IdleToIdeaService.setCurrentUser(step.recommendedUserId);
                    }}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#3b0914] hover:bg-[#5c0f20] text-[#f5b5c8] border border-[#731627] text-[11px] font-medium transition-colors"
                  >
                    <UserCheck className="w-3 h-3" />
                    <span>Switch to {step.recommendedRole.split(' ')[0]}</span>
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateTab(step.targetTab);
                    if (step.action) step.action();
                  }}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#1f0710] hover:bg-[#2e0b17] text-[#faedf1] border border-[#4a1220] text-[11px] font-medium transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-[#f5b5c8]" />
                  <span>Go to screen</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="p-3 bg-[#14060c] border-t border-[#3b0e19] flex items-center justify-between">
        <button
          disabled={currentStepIndex === 0}
          onClick={() => onSelectStep(Math.max(0, currentStepIndex - 1))}
          className="px-3 py-1.5 rounded-xl bg-[#240812] text-xs font-medium text-[#c4adb5] disabled:opacity-40"
        >
          Previous
        </button>

        <button
          onClick={() => onSelectStep(Math.min(STEPS.length - 1, currentStepIndex + 1))}
          className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/50 text-xs font-semibold shadow-md shadow-[#8a1731]/30"
        >
          <span>Next Step</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#f5b5c8]" />
        </button>
      </div>
    </aside>
  );
};
