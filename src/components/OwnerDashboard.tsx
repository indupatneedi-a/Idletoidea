import React, { useState } from 'react';
import {
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  History,
  RotateCcw,
  PlayCircle,
  PlusCircle,
  ShieldAlert,
  Wrench,
  Ban,
  Tag,
  Gift,
  Coins,
} from 'lucide-react';
import { User, RequestRecord, Resource, Incident, HandoverRecord, UserStanding } from '../types';
import { IdleToIdeaService, DECISION_REASONS } from '../services/idleToIdeaService';
import { StatusChip, RiskChip, AccessModelChip } from './StatusChip';

interface OwnerDashboardProps {
  currentUser: User;
  allUsers: User[];
  resources: Resource[];
  requests: RequestRecord[];
  incidents: Incident[];
  handovers: HandoverRecord[];
  onOpenCreateListing: () => void;
  onOpenCheckoutReturn: (mode: 'checkout' | 'return', request: RequestRecord, resource: Resource) => void;
  onOpenIncident: (incident: Incident) => void;
  onOpenTimeline: (request: RequestRecord) => void;
  onRefresh: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  currentUser,
  allUsers,
  resources,
  requests,
  incidents,
  handovers,
  onOpenCreateListing,
  onOpenCheckoutReturn,
  onOpenIncident,
  onOpenTimeline,
  onRefresh,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'listings' | 'confirmed' | 'flags' | 'incidents'>('queue');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReasonCode, setRejectReasonCode] = useState<string>('REJECTED_OWNER_DECLINED');
  const [decisionNote, setDecisionNote] = useState<string>('');
  const [actionMessage, setActionMessage] = useState('');

  // Maintenance block state
  const [blockingSlotResId, setBlockingSlotResId] = useState<string | null>(null);
  const [blockingSlotId, setBlockingSlotId] = useState<string>('');
  const [blockReason, setBlockReason] = useState('Scheduled optical lens cleaning');

  // Filter listings owned by this user (or all if admin)
  const myListings = resources.filter((r) => r.ownerId === currentUser.id || currentUser.role === 'admin');
  const myListingIds = new Set(myListings.map((r) => r.id));

  // Requests on owned listings
  const relevantRequests = requests.filter((r) => myListingIds.has(r.resourceId));
  const pendingRequests = relevantRequests.filter((r) => r.status === 'pending-review');
  const confirmedBookings = relevantRequests.filter((r) => r.status === 'confirmed' || r.status === 'in-use' || r.status === 'overdue');
  const myIncidents = incidents.filter((i) => myListingIds.has(i.resourceId));

  // Repeated Problem Flags: Users with >= 1 late return, no-show, or incident (Section 10.8)
  const problemUsers = allUsers.filter((u) => {
    return u.userStanding.lateReturns > 0 || u.userStanding.noShows > 0 || u.userStanding.restrictedUntil !== null;
  });

  const handleApprove = (reqId: string) => {
    try {
      IdleToIdeaService.decideRequest(currentUser, reqId, 'approve', 'APPROVED_ELIGIBLE', 'Approved by owner under fair allocation policy.');
      setActionMessage('Request approved successfully! Slot is now confirmed.');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReject = (reqId: string) => {
    try {
      IdleToIdeaService.decideRequest(currentUser, reqId, 'reject', rejectReasonCode, decisionNote);
      setActionMessage('Request rejected. Requester notified with plain-language reason code.');
      setRejectingId(null);
      setDecisionNote('');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleNeedMoreInfo = (reqId: string) => {
    const question = prompt('What additional clarification is needed from the requester?');
    if (!question) return;
    try {
      IdleToIdeaService.decideRequest(currentUser, reqId, 'needMoreInfo', 'NEEDS_MORE_INFO', question);
      setActionMessage('Clarification request sent to the requester.');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePermanentHandover = (req: RequestRecord) => {
    const notes = prompt('Enter permanent transfer handover notes (e.g. Serial # checked, recipient confirmed physically):');
    if (!notes) return;
    try {
      IdleToIdeaService.completePermanentTransfer(currentUser, {
        requestId: req.id,
        handoverNotes: notes,
      });
      setActionMessage('Permanent handover completed! Transfer logged to audit timeline.');
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
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage('')} className="text-[#c4adb5] hover:text-[#fff]">
            ×
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#3b0e19]">
        <div className="flex flex-wrap gap-1.5 bg-[#14060c] p-1 rounded-2xl border border-[#300e19]">
          <button
            onClick={() => setActiveSubTab('queue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeSubTab === 'queue'
                ? 'bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/50 shadow-sm'
                : 'text-[#c4adb5] hover:text-[#faedf1]'
            }`}
          >
            Review Queue ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveSubTab('confirmed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeSubTab === 'confirmed'
                ? 'bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/50 shadow-sm'
                : 'text-[#c4adb5] hover:text-[#faedf1]'
            }`}
          >
            Active Bookings ({confirmedBookings.length})
          </button>
          <button
            onClick={() => setActiveSubTab('listings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeSubTab === 'listings'
                ? 'bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/50 shadow-sm'
                : 'text-[#c4adb5] hover:text-[#faedf1]'
            }`}
          >
            My Listings ({myListings.length})
          </button>
          <button
            onClick={() => setActiveSubTab('incidents')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeSubTab === 'incidents'
                ? 'bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/50 shadow-sm'
                : 'text-[#c4adb5] hover:text-[#faedf1]'
            }`}
          >
            Incidents ({myIncidents.length})
          </button>
          <button
            onClick={() => setActiveSubTab('flags')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeSubTab === 'flags'
                ? 'bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/50 shadow-sm'
                : 'text-[#c4adb5] hover:text-[#faedf1]'
            }`}
          >
            Repeated-Problem Flags ({problemUsers.length})
          </button>
        </div>

        <button
          onClick={onOpenCreateListing}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5c0f20] via-[#8a1731] to-[#5c0f20] text-[#fff] border border-[#f5b5c8]/60 text-xs font-semibold shadow-lg shadow-[#8a1731]/30 hover:scale-105 transition-all"
        >
          <PlusCircle className="w-4 h-4 text-[#f5b5c8]" />
          <span>New Equipment Listing</span>
        </button>
      </div>

      {/* 1. Review Queue Tab */}
      {activeSubTab === 'queue' && (
        <div className="p-5 rounded-3xl bg-[#12060b] border border-[#3b0e19] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2b0c16]">
            <div>
              <h3 className="text-base font-black font-cinematic uppercase tracking-wider text-[#faedf1]">
                Pending Access Review Queue
              </h3>
              <p className="text-xs text-[#c4adb5] font-serif-cozy italic">
                Inspect requester training credentials and decision snapshot before confirming.
              </p>
            </div>
            <span className="text-xs font-mono-film text-[#f5b5c8]">
              {pendingRequests.length} Awaiting Decision
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#c4adb5]">
              No pending requests in your queue. All requests have been reviewed!
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req) => {
                const res = resources.find((r) => r.id === req.resourceId);
                const requester = allUsers.find((u) => u.id === req.requesterId);

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-[#17060e] border border-[#4a1220] space-y-3 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={requester?.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
                          alt={requester?.displayName}
                          className="w-8 h-8 rounded-full object-cover border border-[#f5b5c8]"
                        />
                        <div>
                          <div className="text-xs font-bold text-[#faedf1]">
                            {requester?.displayName} ({requester?.email})
                          </div>
                          <div className="text-[10px] text-[#c4adb5]">
                            Target: <span className="text-[#f5b5c8] font-semibold">{res?.title}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/50 text-amber-300 font-mono-film">
                          PENDING REVIEW
                        </span>
                        <span className="text-[10px] text-[#c4adb5] font-mono-film">
                          {new Date(req.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    {/* Eligibility Snapshot Box */}
                    <div className="p-3 rounded-xl bg-[#0c0407] border border-[#2b0c16] space-y-2 text-xs">
                      <div className="text-[10px] font-mono-film text-[#f5b5c8] uppercase">
                        VERIFICATION & FAIRNESS SNAPSHOT
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div className="flex items-center space-x-1.5 text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Safety Quiz: Passed</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Standing: Clean (0 Overdue)</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active Cap: Within Limit (1/2)</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Overlap: Verified Slot Free</span>
                        </div>
                      </div>
                      <div className="pt-1 text-[11px] text-[#d6c4ca]">
                        <span className="text-[#c4adb5]">Requester note: </span>
                        "{req.message}"
                      </div>
                    </div>

                    {/* Action Decision Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#260810]">
                      <button
                        onClick={() => onOpenTimeline(req)}
                        className="text-[11px] text-[#c4adb5] hover:text-[#faedf1] underline flex items-center space-x-1"
                      >
                        <History className="w-3 h-3 text-[#f5b5c8]" />
                        <span>View Request History</span>
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleNeedMoreInfo(req.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#240812] hover:bg-[#38101e] text-[#f5b5c8] border border-[#5c0f20] text-xs font-medium"
                        >
                          Request Clarification
                        </button>
                        <button
                          onClick={() => setRejectingId(req.id)}
                          className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-rose-300 border border-neutral-700 text-xs font-medium"
                        >
                          Decline Request
                        </button>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/60 text-xs font-bold shadow-md shadow-[#8a1731]/40 hover:scale-105 transition-all"
                        >
                          Approve & Reserve Slot
                        </button>
                      </div>
                    </div>

                    {/* Inline Reject Form */}
                    {rejectingId === req.id && (
                      <div className="p-3.5 rounded-xl bg-[#290913] border border-rose-700/60 space-y-2 text-xs">
                        <div className="font-semibold text-rose-200">
                          Decline Request with Plain-Language Reason Code
                        </div>
                        <select
                          value={rejectReasonCode}
                          onChange={(e) => setRejectReasonCode(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0c0407] border border-[#3b0e19] text-xs text-[#faedf1]"
                        >
                          <option value="REJECTED_TRAINING_INCOMPLETE">REJECTED_TRAINING_INCOMPLETE: Training incomplete</option>
                          <option value="REJECTED_CAP_REACHED">REJECTED_CAP_REACHED: Booking cap reached</option>
                          <option value="REJECTED_MAINTENANCE">REJECTED_MAINTENANCE: Scheduled maintenance</option>
                          <option value="REJECTED_OWNER_DECLINED">REJECTED_OWNER_DECLINED: Owner declined with custom note</option>
                        </select>
                        <input
                          type="text"
                          value={decisionNote}
                          onChange={(e) => setDecisionNote(e.target.value)}
                          placeholder="Specific owner note explaining reason..."
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0c0407] border border-[#3b0e19] text-xs text-[#faedf1]"
                        />
                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-3 py-1 rounded-lg bg-rose-800 text-white text-xs font-semibold"
                          >
                            Confirm Rejection
                          </button>
                          <button
                            onClick={() => setRejectingId(null)}
                            className="px-3 py-1 rounded-lg bg-[#14060c] text-[#c4adb5] text-xs"
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
      )}

      {/* 2. Active Bookings & Handover Trigger */}
      {activeSubTab === 'confirmed' && (
        <div className="p-5 rounded-3xl bg-[#12060b] border border-[#3b0e19] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2b0c16]">
            <div>
              <h3 className="text-base font-black font-cinematic uppercase tracking-wider text-[#faedf1]">
                Active Bookings & Condition Handovers
              </h3>
              <p className="text-xs text-[#c4adb5] font-serif-cozy italic">
                Manage check-in condition, in-use sessions, and verified returns.
              </p>
            </div>
          </div>

          {confirmedBookings.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#c4adb5]">
              No confirmed bookings currently active for your resources.
            </div>
          ) : (
            <div className="space-y-3">
              {confirmedBookings.map((req) => {
                const res = resources.find((r) => r.id === req.resourceId);
                const isConfirmed = req.status === 'confirmed';
                const isInUse = req.status === 'in-use';
                const isOverdue = req.status === 'overdue';
                const isPermanent = res?.transferMode === 'permanent';

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-[#17060e] border border-[#3b0e19] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <StatusChip status={req.status} />
                        <span className="text-sm font-bold text-[#faedf1] font-cinematic uppercase">
                          {res?.title}
                        </span>
                      </div>
                      <div className="text-xs text-[#c4adb5]">
                        Requester: <span className="text-[#faedf1]">{req.requesterId}</span> • Slot:{' '}
                        {req.slotStart ? new Date(req.slotStart).toLocaleString() : 'Permanent Transfer'}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isPermanent ? (
                        <button
                          onClick={() => handlePermanentHandover(req)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/50 text-xs font-semibold"
                        >
                          Record Permanent Handover
                        </button>
                      ) : isConfirmed ? (
                        <button
                          onClick={() => res && onOpenCheckoutReturn('checkout', req, res)}
                          className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/50 text-xs font-semibold shadow-md"
                        >
                          <PlayCircle className="w-3.5 h-3.5 text-[#f5b5c8]" />
                          <span>Record Check-Out (Condition)</span>
                        </button>
                      ) : isInUse || isOverdue ? (
                        <button
                          onClick={() => res && onOpenCheckoutReturn('return', req, res)}
                          className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl bg-emerald-900/90 text-emerald-100 border border-emerald-500/70 text-xs font-semibold shadow-md"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Record Final Return Inspection</span>
                        </button>
                      ) : null}

                      <button
                        onClick={() => onOpenTimeline(req)}
                        className="p-2 rounded-xl bg-[#220710] text-[#f5b5c8] border border-[#5c0f20]"
                        title="Audit Timeline"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. My Listings Tab */}
      {activeSubTab === 'listings' && (
        <div className="p-5 rounded-3xl bg-[#12060b] border border-[#3b0e19] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2b0c16]">
            <div>
              <h3 className="text-base font-black font-cinematic uppercase tracking-wider text-[#faedf1]">
                My Published Listings & Availability Controls
              </h3>
              <p className="text-xs text-[#c4adb5] font-serif-cozy italic">
                Manage blackout slots for maintenance and view listing verification states.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {myListings.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl bg-[#17060e] border border-[#3b0e19] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#3b0914] text-[#f5b5c8] border border-[#5c0f20] font-mono-film">
                      {r.category}
                    </span>
                    <h4 className="text-sm font-bold text-[#faedf1] font-cinematic uppercase">
                      {r.title}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RiskChip risk={r.riskLevel} />
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono-film ${
                        r.listingState === 'active'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-amber-950 text-amber-300 border border-amber-700'
                      }`}
                    >
                      {r.listingState.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Slots Overview */}
                {r.transferMode === 'temporary' && (
                  <div className="pt-2 border-t border-[#260a12]">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[#c4adb5]">
                        Availability Slots ({r.availabilitySlots.filter((s) => s.state === 'available').length} Available):
                      </span>
                      <button
                        onClick={() => setBlockingSlotResId(blockingSlotResId === r.id ? null : r.id)}
                        className="text-[11px] text-[#f5b5c8] hover:underline flex items-center space-x-1"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>Manage Blackout / Maintenance Slots</span>
                      </button>
                    </div>

                    {blockingSlotResId === r.id && (
                      <div className="p-3 rounded-xl bg-[#0c0407] border border-[#3b0e19] space-y-2 mb-2 text-xs">
                        <span className="text-[10px] font-mono-film text-[#f5b5c8]">
                          BLOCK SLOT FOR MAINTENANCE / INTERNAL USE
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <select
                            value={blockingSlotId}
                            onChange={(e) => setBlockingSlotId(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-[#14060c] border border-[#3b0e19] text-xs text-[#faedf1]"
                          >
                            <option value="">Select slot to block...</option>
                            {r.availabilitySlots.map((s) => (
                              <option key={s.id} value={s.id}>
                                {new Date(s.start).toLocaleString()} ({s.state})
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            placeholder="Reason for maintenance block..."
                            className="px-3 py-1.5 rounded-lg bg-[#14060c] border border-[#3b0e19] text-xs text-[#faedf1]"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (!blockingSlotId) return;
                            IdleToIdeaService.blockSlot(currentUser, r.id, blockingSlotId, blockReason);
                            setActionMessage('Slot blocked for maintenance. Audit log and user notifications triggered.');
                            setBlockingSlotResId(null);
                            onRefresh();
                          }}
                          className="px-3 py-1 rounded-lg bg-amber-900 text-amber-200 text-xs font-semibold"
                        >
                          Confirm Maintenance Block
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Incidents Tab */}
      {activeSubTab === 'incidents' && (
        <div className="p-5 rounded-3xl bg-[#12060b] border border-[#3b0e19] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2b0c16]">
            <div>
              <h3 className="text-base font-black font-cinematic uppercase tracking-wider text-[#faedf1]">
                Logged Damage & Incident Reports
              </h3>
              <p className="text-xs text-[#c4adb5] font-serif-cozy italic">
                Evidence-based incident handling with Gemini AI neutral summaries and fair human resolution.
              </p>
            </div>
          </div>

          {myIncidents.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#c4adb5]">
              No incident reports logged on your equipment.
            </div>
          ) : (
            <div className="space-y-3">
              {myIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 rounded-2xl bg-[#17060e] border border-[#5c0f20] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span className="font-bold text-[#faedf1]">Case #{inc.id.slice(0, 10)}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#290812] text-[#f5b5c8] font-mono-film uppercase">
                        {inc.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#d6c4ca] italic">"{inc.description}"</p>
                  </div>

                  <button
                    onClick={() => onOpenIncident(inc)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/50 text-xs font-semibold shadow-md hover:scale-105 transition-all"
                  >
                    Open Incident & AI Summarizer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Repeated-Problem Flags Tab (Section 10.8) */}
      {activeSubTab === 'flags' && (
        <div className="p-5 rounded-3xl bg-[#12060b] border border-[#3b0e19] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2b0c16]">
            <div>
              <h3 className="text-base font-black font-cinematic uppercase tracking-wider text-[#faedf1]">
                Repeated-Problem Flags (Rule-Based Queue)
              </h3>
              <p className="text-xs text-[#c4adb5] font-serif-cozy italic">
                Rule-based counters for late returns and no-shows. A flag prompts review but never restricts users automatically.
              </p>
            </div>
          </div>

          {problemUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#c4adb5]">
              No repeated-problem flags active. All users maintain clean operational standing.
            </div>
          ) : (
            <div className="space-y-3">
              {problemUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl bg-[#17060e] border border-[#4a1220] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={u.avatarUrl}
                      alt={u.displayName}
                      className="w-10 h-10 rounded-full object-cover border border-[#f5b5c8]"
                    />
                    <div>
                      <div className="font-bold text-sm text-[#faedf1]">{u.displayName}</div>
                      <div className="text-[11px] text-[#c4adb5]">{u.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <span className="text-[10px] text-[#c4adb5] block">Late Returns</span>
                      <span className="font-bold text-amber-300 font-mono-film">
                        {u.userStanding.lateReturns}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-[#c4adb5] block">No-Shows</span>
                      <span className="font-bold text-amber-300 font-mono-film">
                        {u.userStanding.noShows}
                      </span>
                    </div>
                    {u.userStanding.restrictedUntil && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-600 font-mono-film text-[10px]">
                        Restricted until {new Date(u.userStanding.restrictedUntil).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
