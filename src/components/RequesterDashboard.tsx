import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Hourglass,
  AlertTriangle,
  History,
  RotateCcw,
  Sparkles,
  Ban,
  ArrowRight,
  Shield,
  FileText,
  Calendar,
  Gift,
  Tag,
} from 'lucide-react';
import { User, RequestRecord, Resource, WaitlistEntry, HandoverRecord } from '../types';
import { IdleToIdeaService, DECISION_REASONS } from '../services/idleToIdeaService';
import { StatusChip, AccessModelChip } from './StatusChip';

interface RequesterDashboardProps {
  currentUser: User;
  requests: RequestRecord[];
  resources: Resource[];
  waitlists: WaitlistEntry[];
  handovers: HandoverRecord[];
  onOpenTimeline: (request: RequestRecord) => void;
  onOpenResource: (resource: Resource) => void;
  onRefresh: () => void;
}

export const RequesterDashboard: React.FC<RequesterDashboardProps> = ({
  currentUser,
  requests,
  resources,
  waitlists,
  handovers,
  onOpenTimeline,
  onOpenResource,
  onRefresh,
}) => {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of project plans');
  const [extendingId, setExtendingId] = useState<string | null>(null);
  const [extendMinutes, setExtendMinutes] = useState(30);
  const [actionMessage, setActionMessage] = useState('');

  const myRequests = requests.filter((r) => r.requesterId === currentUser.id);
  const myWaitlists = waitlists.filter((w) => w.userId === currentUser.id);

  // Overdue check
  const overdueRequests = myRequests.filter((r) => r.status === 'overdue');
  const activeBookings = myRequests.filter((r) => r.status === 'confirmed' || r.status === 'in-use');

  const handleCancel = (reqId: string) => {
    try {
      IdleToIdeaService.cancelBooking(currentUser, reqId, cancelReason);
      setActionMessage('Booking cancelled. Slot has been freed and offered to the next waitlisted user.');
      setCancellingId(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAcceptWaitlist = (entry: WaitlistEntry) => {
    try {
      IdleToIdeaService.acceptWaitlistOffer(currentUser, entry.id);
      setActionMessage('Waitlist offer accepted! Your session is now confirmed.');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRequestExtension = (reqId: string) => {
    try {
      const res = IdleToIdeaService.requestExtension(currentUser, reqId, extendMinutes);
      setActionMessage(
        res.autoApproved
          ? `Extension granted! Booking extended by ${extendMinutes} minutes.`
          : 'Extension request submitted to owner for review.'
      );
      setExtendingId(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Banner */}
      {actionMessage && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#3b0914] to-[#5c0f20] border border-[#f5b5c8]/50 text-xs text-[#faedf1] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#f5b5c8]" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage('')} className="text-[#c4adb5] hover:text-[#fff]">
            ×
          </button>
        </div>
      )}

      {/* OVERDUE WARNING BANNER */}
      {overdueRequests.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-950/80 border-2 border-red-500 text-red-100 flex items-start space-x-3 shadow-xl animate-pulse">
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="font-bold text-sm uppercase tracking-wider font-mono-film">
              STAGED OVERDUE ALERT (HUMAN REVIEW PROTOCOL)
            </div>
            <p className="mt-1">
              You have an overdue equipment return. Please return the resource to the safety desk immediately.
              A temporary booking restriction will apply after the published grace period pending staff review.
            </p>
          </div>
        </div>
      )}

      {/* Waitlist Offers & Positions */}
      {myWaitlists.length > 0 && (
        <div className="p-5 rounded-3xl bg-[#14060c] border border-[#5c0f20] shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Hourglass className="w-4 h-4 text-[#f5b5c8]" />
              <h3 className="text-sm font-black font-cinematic uppercase tracking-wider text-[#faedf1]">
                Active Waitlist Standings
              </h3>
            </div>
            <span className="text-[10px] text-[#e094aa] font-mono-film">
              First-eligible transparent allocation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myWaitlists.map((w) => {
              const res = resources.find((r) => r.id === w.resourceId);
              const isOffered = w.status === 'offered';

              return (
                <div
                  key={w.id}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
                    isOffered
                      ? 'bg-gradient-to-br from-[#2e0b17] to-[#42101e] border-[#f5b5c8] shadow-lg shadow-[#8a1731]/30 animate-pulse'
                      : 'bg-[#0d0407] border-[#2b0c16]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-[#faedf1]">{res?.title || 'Resource'}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono-film ${
                          isOffered
                            ? 'bg-[#8a1731] text-[#fff] border border-[#f5b5c8]'
                            : 'bg-[#290913] text-[#f5b5c8]'
                        }`}
                      >
                        {isOffered ? 'SLOT OFFERED (24H)' : 'WAITING IN QUEUE'}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#c4adb5]">
                      {isOffered
                        ? 'A slot has opened up! Accept within 24 hours before it is offered to the next eligible person.'
                        : `Joined on ${new Date(w.joinedAt).toLocaleDateString()}. Eligibility and caps are checked prior to offer.`}
                    </p>
                  </div>

                  {isOffered && (
                    <div className="mt-3 pt-2 border-t border-[#5c0f20] flex items-center justify-end">
                      <button
                        onClick={() => handleAcceptWaitlist(w)}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8] text-xs font-semibold shadow-md hover:scale-105 transition-all"
                      >
                        Accept Offer & Confirm Slot
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Requests List */}
      <div className="p-5 rounded-3xl bg-[#12060b] border border-[#3b0e19] shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2b0c16]">
          <div>
            <h3 className="text-base font-black font-cinematic uppercase tracking-wider text-[#faedf1]">
              My Bookings & Access Requests
            </h3>
            <p className="text-xs text-[#c4adb5] font-serif-cozy italic">
              Track requests from review through check-out and condition verification.
            </p>
          </div>
          <span className="text-xs font-mono-film text-[#f5b5c8]">
            {myRequests.length} Total Records
          </span>
        </div>

        {myRequests.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#c4adb5] space-y-2">
            <p>You have not submitted any equipment or workspace requests yet.</p>
            <p className="text-[11px] text-[#e094aa]">
              Explore the Discover tab to find available 3D printers, laser cutters, or project benches!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myRequests.map((req) => {
              const res = resources.find((r) => r.id === req.resourceId);
              const isConfirmed = req.status === 'confirmed';
              const isInUse = req.status === 'in-use';
              const isPending = req.status === 'pending-review';
              const isOverdue = req.status === 'overdue';

              return (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-[#17060e] border border-[#300e19] hover:border-[#5c0f20] transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <StatusChip status={req.status} />
                      <h4 className="text-sm font-bold text-[#faedf1] font-cinematic uppercase">
                        {res?.title || 'Resource'}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      {res && (
                        <AccessModelChip
                          priceMode={res.priceMode}
                          transferMode={res.transferMode}
                          price={res.price}
                          priceUnit={res.priceUnit}
                        />
                      )}
                      <span className="text-[10px] text-[#c4adb5] font-mono-film">
                        Req #{req.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>

                  {/* Slot or terms info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-[#0c0407] p-2.5 rounded-xl border border-[#2b0c16]">
                    <div>
                      <span className="text-[#c4adb5] block text-[10px]">Requested Schedule:</span>
                      <span className="text-[#faedf1] font-mono-film">
                        {req.slotStart ? new Date(req.slotStart).toLocaleString() : 'Permanent Transfer'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#c4adb5] block text-[10px]">Location:</span>
                      <span className="text-[#faedf1]">{res?.location || 'Makerspace'}</span>
                    </div>
                    <div>
                      <span className="text-[#c4adb5] block text-[10px]">Decision Explanation:</span>
                      <span className="text-[#f5b5c8] font-medium">
                        {DECISION_REASONS[req.decisionReasonCode || '']?.text || req.decisionNote || (isPending ? 'Pending authorized review' : req.status)}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#260810]">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onOpenTimeline(req)}
                        className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-[#220710] hover:bg-[#380e1c] text-[#f5b5c8] border border-[#5c0f20] text-[11px] font-medium transition-colors"
                      >
                        <History className="w-3 h-3" />
                        <span>View Audit Timeline</span>
                      </button>

                      {res && (
                        <button
                          onClick={() => onOpenResource(res)}
                          className="text-[11px] text-[#c4adb5] hover:text-[#faedf1] underline"
                        >
                          View Listing Details
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Extension request button for active bookings */}
                      {(isConfirmed || isInUse) && res?.policies.autoExtendEnabled && (
                        <button
                          onClick={() => setExtendingId(req.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#290c16] hover:bg-[#3d1120] text-[#faedf1] border border-[#4a1220] text-[11px]"
                        >
                          Request Extension
                        </button>
                      )}

                      {/* Cancel Booking */}
                      {(isConfirmed || isPending) && (
                        <button
                          onClick={() => setCancellingId(req.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#1f0710] hover:bg-[#3b0914] text-rose-300 border border-rose-900/50 text-[11px]"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline Cancel Dialog */}
                  {cancellingId === req.id && (
                    <div className="p-3 rounded-xl bg-[#2b0c16] border border-rose-700/60 space-y-2 mt-2">
                      <div className="text-xs font-semibold text-rose-200">
                        Confirm Cancellation
                      </div>
                      <p className="text-[11px] text-[#c4adb5]">
                        Cancellation frees this slot immediately and offers it to the first eligible person on the waitlist.
                      </p>
                      <input
                        type="text"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Reason for cancellation..."
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0d0407] border border-[#3b0e19] text-xs text-[#faedf1]"
                      />
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => handleCancel(req.id)}
                          className="px-3 py-1 rounded-lg bg-rose-800 text-white text-xs font-medium"
                        >
                          Confirm & Free Slot
                        </button>
                        <button
                          onClick={() => setCancellingId(null)}
                          className="px-3 py-1 rounded-lg bg-[#190810] text-[#c4adb5] text-xs"
                        >
                          Keep Booking
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline Extension Dialog */}
                  {extendingId === req.id && (
                    <div className="p-3 rounded-xl bg-[#260812] border border-[#5c0f20] space-y-2 mt-2">
                      <div className="text-xs font-semibold text-[#f5b5c8]">
                        Request Booking Extension
                      </div>
                      <p className="text-[11px] text-[#c4adb5]">
                        Extensions are only permitted if subsequent slots are free, no waitlist exists, and the user is in good standing.
                      </p>
                      <div className="flex items-center space-x-3">
                        <select
                          value={extendMinutes}
                          onChange={(e) => setExtendMinutes(Number(e.target.value))}
                          className="px-3 py-1.5 rounded-lg bg-[#0d0407] border border-[#3b0e19] text-xs text-[#faedf1]"
                        >
                          <option value={15}>+15 Minutes</option>
                          <option value={30}>+30 Minutes</option>
                          <option value={60}>+60 Minutes</option>
                        </select>
                        <button
                          onClick={() => handleRequestExtension(req.id)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] text-xs font-medium"
                        >
                          Submit Extension
                        </button>
                        <button
                          onClick={() => setExtendingId(null)}
                          className="px-3 py-1.5 rounded-lg bg-[#190810] text-[#c4adb5] text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
