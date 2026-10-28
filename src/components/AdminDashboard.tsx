import React, { useState } from 'react';
import {
  Shield,
  Layers,
  Activity,
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Sparkles,
  BarChart3,
  Lock,
} from 'lucide-react';
import { User, Resource, AuditLogItem, OwnerVerification } from '../types';
import { IdleToIdeaService } from '../services/idleToIdeaService';

interface AdminDashboardProps {
  currentUser: User;
  allUsers: User[];
  resources: Resource[];
  auditLogs: AuditLogItem[];
  ownerVerifications: Record<string, OwnerVerification>;
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  allUsers,
  resources,
  auditLogs,
  ownerVerifications,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'spot-checks' | 'moderation' | 'audit'>('metrics');
  const [auditSearch, setAuditSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState('');

  const metrics = IdleToIdeaService.getMetrics();
  const owners = allUsers.filter((u) => u.role === 'owner');

  // Listings pending admin check
  const pendingListings = resources.filter((r) => r.listingState === 'pending-admin-check');

  const filteredLogs = auditLogs.filter((log) => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (auditSearch) {
      const q = auditSearch.toLowerCase();
      return (
        log.summary.toLowerCase().includes(q) ||
        log.actorId.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        (log.reasonCode && log.reasonCode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSpotCheck = (ownerId: string, state: 'spot-checked' | 'flagged' | 'suspended') => {
    const note = prompt(`Enter admin note for updating status to ${state}:`) || 'Verified institutional affiliation.';
    try {
      IdleToIdeaService.adminSpotCheckOwner(currentUser, ownerId, state, note);
      setActionMessage(`Owner ${ownerId} status updated to ${state}!`);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleModerateListing = (resourceId: string, approve: boolean) => {
    const note = prompt(approve ? 'Approval note:' : 'Rejection reason:') || 'Administrative review completed.';
    try {
      IdleToIdeaService.adminCheckListing(currentUser, resourceId, approve, note);
      setActionMessage(`Listing ${approve ? 'approved and activated' : 'rejected'}.`);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
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
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'metrics'
                ? 'bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/50 shadow-sm'
                : 'text-[#c4adb5] hover:text-[#faedf1]'
            }`}
          >
            Makerspace Metrics
          </button>
          <button
            onClick={() => setActiveTab('spot-checks')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'spot-checks'
                ? 'bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/50 shadow-sm'
                : 'text-[#c4adb5] hover:text-[#faedf1]'
            }`}
          >
            Owner Spot-Checks ({owners.length})
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'moderation'
                ? 'bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/50 shadow-sm'
                : 'text-[#c4adb5] hover:text-[#faedf1]'
            }`}
          >
            Listing Moderation ({pendingListings.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'audit'
                ? 'bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/50 shadow-sm'
                : 'text-[#c4adb5] hover:text-[#faedf1]'
            }`}
          >
            Append-Only Audit Trail ({auditLogs.length})
          </button>
        </div>

        <span className="text-[10px] text-[#f5b5c8] font-mono-film">
          PLATFORM ADMIN: {currentUser.displayName}
        </span>
      </div>

      {/* 1. Metrics & Utilisation */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#14060c] border border-[#3b0e19]">
              <span className="text-[10px] text-[#c4adb5] font-mono-film block">TOTAL LISTINGS</span>
              <div className="text-2xl font-bold font-cinematic text-[#faedf1] mt-1">
                {metrics.totalResources}
              </div>
              <span className="text-[10px] text-emerald-400">
                {metrics.availableResources} Currently available
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#14060c] border border-[#3b0e19]">
              <span className="text-[10px] text-[#c4adb5] font-mono-film block">REQUESTS FLOW</span>
              <div className="text-2xl font-bold font-cinematic text-[#faedf1] mt-1">
                {metrics.submittedRequests}
              </div>
              <span className="text-[10px] text-[#f5b5c8]">
                {metrics.confirmedRequests} confirmed • {metrics.pendingRequests} pending
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#14060c] border border-[#3b0e19]">
              <span className="text-[10px] text-[#c4adb5] font-mono-film block">WAITLIST & OVERDUE</span>
              <div className="text-2xl font-bold font-cinematic text-amber-300 mt-1">
                {metrics.waitlistCount}
              </div>
              <span className="text-[10px] text-rose-400">
                {metrics.overdueCount} overdue items
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#14060c] border border-[#3b0e19]">
              <span className="text-[10px] text-[#c4adb5] font-mono-film block">SCHEDULE UTILISATION</span>
              <div className="text-2xl font-bold font-cinematic text-[#f5b5c8] mt-1">
                {metrics.utilisationPercent}%
              </div>
              <span className="text-[10px] text-[#c4adb5]">
                {metrics.bookedSlots} / {metrics.totalSlots} slots booked
              </span>
            </div>
          </div>

          {/* Utilisation Chart per Resource */}
          <div className="p-5 rounded-3xl bg-[#14060c] border border-[#3b0e19] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2b0c16]">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-[#f5b5c8]" />
                <h3 className="text-base font-black font-cinematic uppercase tracking-wider text-[#faedf1]">
                  Resource Slot Utilisation (Sample Data)
                </h3>
              </div>
              <span className="text-[10px] text-[#c4adb5] font-mono-film">
                Denominator: Booked hours / Published available hours
              </span>
            </div>

            <div className="space-y-4">
              {resources.filter((r) => r.availabilitySlots.length > 0).map((r) => {
                const total = r.availabilitySlots.length;
                const booked = r.availabilitySlots.filter((s) => s.state === 'confirmed' || s.state === 'held').length;
                const pct = total > 0 ? Math.round((booked / total) * 100) : 0;

                return (
                  <div key={r.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#faedf1]">{r.title}</span>
                      <span className="font-mono-film text-[#f5b5c8]">
                        {booked} / {total} slots ({pct}%)
                      </span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-[#0c0407] border border-[#2b0c16] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#5c0f20] via-[#8a1731] to-[#f5b5c8] rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Owner Spot-Checks */}
      {activeTab === 'spot-checks' && (
        <div className="p-5 rounded-3xl bg-[#12060b] border border-[#3b0e19] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2b0c16]">
            <div>
              <h3 className="text-base font-black font-cinematic uppercase tracking-wider text-[#faedf1]">
                Owner & Facility Spot-Check Queue
              </h3>
              <p className="text-xs text-[#c4adb5] font-serif-cozy italic">
                Owners self-register and an administrator spot-checks against institutional affiliation.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {owners.map((owner) => {
              const verif = ownerVerifications[owner.id] || {
                state: 'self-registered',
                note: 'Self-registered owner. High-risk listings require admin check.',
              };
              const isSpotChecked = verif.state === 'spot-checked';

              return (
                <div
                  key={owner.id}
                  className="p-4 rounded-2xl bg-[#17060e] border border-[#3b0e19] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={owner.avatarUrl}
                      alt={owner.displayName}
                      className="w-10 h-10 rounded-full object-cover border border-[#f5b5c8]"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-[#faedf1]">{owner.displayName}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono-film ${
                            isSpotChecked
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : 'bg-amber-950 text-amber-300 border border-amber-700'
                          }`}
                        >
                          {isSpotChecked ? 'Demo verified' : 'Unverified owner'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#c4adb5]">{owner.bio}</div>
                      <div className="text-[10px] text-[#e094aa] font-mono-film mt-0.5">
                        Note: {verif.note}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSpotCheck(owner.id, 'spot-checked')}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/60 text-xs font-semibold"
                    >
                      Spot-Check & Verify
                    </button>
                    <button
                      onClick={() => handleSpotCheck(owner.id, 'flagged')}
                      className="px-3 py-1.5 rounded-xl bg-amber-950 text-amber-200 border border-amber-700 text-xs font-medium"
                    >
                      Flag
                    </button>
                    <button
                      onClick={() => handleSpotCheck(owner.id, 'suspended')}
                      className="px-3 py-1.5 rounded-xl bg-neutral-900 text-rose-300 border border-neutral-700 text-xs font-medium"
                    >
                      Suspend
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Listing Moderation */}
      {activeTab === 'moderation' && (
        <div className="p-5 rounded-3xl bg-[#12060b] border border-[#3b0e19] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2b0c16]">
            <div>
              <h3 className="text-base font-black font-cinematic uppercase tracking-wider text-[#faedf1]">
                High-Risk Listing Moderation Queue ({pendingListings.length})
              </h3>
              <p className="text-xs text-[#c4adb5] font-serif-cozy italic">
                Rule: High-risk equipment listings from unverified owners require administrative review before becoming bookable.
              </p>
            </div>
          </div>

          {pendingListings.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#c4adb5]">
              No high-risk listings pending admin review. All active listings are verified.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingListings.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl bg-[#17060e] border border-amber-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-[#faedf1]">{r.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 font-mono-film">
                        HIGH RISK
                      </span>
                    </div>
                    <div className="text-[11px] text-[#c4adb5] mt-1">{r.description}</div>
                    <div className="text-[10px] text-[#e094aa] font-mono-film mt-0.5">
                      Owner: {r.ownerId} • Location: {r.location}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleModerateListing(r.id, false)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-900 text-rose-300 border border-neutral-700 text-xs"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleModerateListing(r.id, true)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/60 text-xs font-semibold"
                    >
                      Approve & Publish Listing
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Append-Only Audit Trail */}
      {activeTab === 'audit' && (
        <div className="p-5 rounded-3xl bg-[#12060b] border border-[#3b0e19] shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2b0c16]">
            <div>
              <h3 className="text-base font-black font-cinematic uppercase tracking-wider text-[#faedf1]">
                System Audit Log (Append-Only)
              </h3>
              <p className="text-xs text-[#c4adb5] font-serif-cozy italic">
                Immutable, tamper-evident log of all access requests, eligibility decisions, handovers, and policy enforcement.
              </p>
            </div>

            {/* Filter & Search */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#c4adb5] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Filter events..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] text-xs text-[#faedf1] outline-none w-48"
                />
              </div>

              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-[#0c0407] border border-[#3b0e19] text-xs text-[#faedf1]"
              >
                <option value="all">All Actions</option>
                <option value="SUBMIT_REQUEST">Requests</option>
                <option value="APPROVE_REQUEST">Approvals</option>
                <option value="SUBMIT_QUIZ">Quizzes</option>
                <option value="RECORD_CHECKOUT">Check-outs</option>
                <option value="RECORD_RETURN">Returns</option>
                <option value="RESOLVE_INCIDENT">Incidents</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#17060e] border border-[#2b0c16] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono-film text-[10px] text-[#f5b5c8] uppercase font-bold">
                      [{log.action}]
                    </span>
                    <span className="text-[#faedf1] font-medium">{log.summary}</span>
                  </div>
                  <div className="text-[10px] text-[#c4adb5]">
                    Actor: <span className="text-[#fde8ef]">{log.actorId}</span> ({log.actorRole}) • Entity:{' '}
                    {log.entityType} ({log.entityId.slice(0, 10)})
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-[#c4adb5] font-mono-film block">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  {log.reasonCode && (
                    <span className="text-[9px] bg-[#290812] text-[#f5b5c8] px-1.5 py-0.5 rounded font-mono-film">
                      {log.reasonCode}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
