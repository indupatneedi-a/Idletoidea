import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  PlayCircle,
  RotateCcw,
  AlertTriangle,
  History,
  UserCheck,
  Award,
  Layers,
} from 'lucide-react';
import { User, Resource, RequestRecord, EligibilityRecord, Incident, HandoverRecord } from '../types';
import { IdleToIdeaService } from '../services/idleToIdeaService';
import { StatusChip } from './StatusChip';

interface SupervisorDashboardProps {
  currentUser: User;
  allUsers: User[];
  resources: Resource[];
  requests: RequestRecord[];
  eligibilityRecords: EligibilityRecord[];
  incidents: Incident[];
  handovers: HandoverRecord[];
  onOpenCheckoutReturn: (mode: 'checkout' | 'return', request: RequestRecord, resource: Resource) => void;
  onOpenIncident: (incident: Incident) => void;
  onOpenTimeline: (request: RequestRecord) => void;
  onRefresh: () => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({
  currentUser,
  allUsers,
  resources,
  requests,
  eligibilityRecords,
  incidents,
  handovers,
  onOpenCheckoutReturn,
  onOpenIncident,
  onOpenTimeline,
  onRefresh,
}) => {
  const [actionMessage, setActionMessage] = useState('');

  // Assigned equipment for Sam Iyer
  const assignedResources = resources.filter(
    (r) => r.assignedSupervisorIds?.includes(currentUser.id) || currentUser.role === 'admin'
  );
  const assignedResIds = new Set(assignedResources.map((r) => r.id));

  // High-Risk Training Sign-off Queue
  const pendingCertifications = eligibilityRecords.filter(
    (e) => e.status === 'awaiting supervisor' && assignedResIds.has(e.resourceId)
  );

  // Active bookings on supervised resources
  const supervisedRequests = requests.filter((r) => assignedResIds.has(r.resourceId));
  const activeBookings = supervisedRequests.filter(
    (r) => r.status === 'confirmed' || r.status === 'in-use' || r.status === 'overdue'
  );

  const handleApproveTraining = (recordId: string) => {
    try {
      IdleToIdeaService.supervisorApproveEligibility(currentUser, recordId, 'Hands-on safety protocol verified.');
      setActionMessage('Safety certification signed off! User is now eligible to book this high-risk equipment.');
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRejectTraining = (recordId: string) => {
    const reason = prompt('State reason for declining hands-on sign-off (e.g. Needs additional calibration practice):');
    if (!reason) return;
    try {
      IdleToIdeaService.supervisorRejectEligibility(currentUser, recordId, reason);
      setActionMessage('Certification sign-off declined.');
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

      {/* 1. High-Risk Safety Sign-off Queue (Prerequisite Gate) */}
      <div className="p-5 rounded-3xl bg-[#14060c] border border-[#5c0f20] shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2b0c16]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#8a1731] to-[#3b0914] border border-[#f5b5c8]/50">
              <ShieldAlert className="w-5 h-5 text-[#f5b5c8]" />
            </div>
            <div>
              <h3 className="text-base font-black font-cinematic uppercase tracking-wider text-[#faedf1]">
                High-Risk Hands-on Training Approvals ({pendingCertifications.length})
              </h3>
              <p className="text-xs text-[#c4adb5] font-serif-cozy italic">
                Users who passed the theory quiz require physical sign-off before booking high-risk machinery.
              </p>
            </div>
          </div>
        </div>

        {pendingCertifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#c4adb5]">
            No pending training certifications awaiting supervisor review.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingCertifications.map((elig) => {
              const user = allUsers.find((u) => u.id === elig.userId);
              const res = resources.find((r) => r.id === elig.resourceId);

              return (
                <div
                  key={elig.id}
                  className="p-4 rounded-2xl bg-[#17060e] border border-[#4a1220] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-[#f5b5c8]" />
                      <span className="font-bold text-[#faedf1]">{user?.displayName}</span>
                      <span className="text-[10px] text-[#c4adb5]">({user?.email})</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono-film">
                        Quiz Score: {elig.quizScore}%
                      </span>
                    </div>
                    <div className="text-[11px] text-[#c4adb5]">
                      Equipment: <span className="text-[#f5b5c8] font-semibold">{res?.title}</span> • Theory passed on{' '}
                      {new Date(elig.lastAttemptAt || '').toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRejectTraining(elig.id)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-900 text-rose-300 border border-neutral-700 text-xs font-medium"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleApproveTraining(elig.id)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/60 text-xs font-bold shadow-md hover:scale-105 transition-all"
                    >
                      Sign Off Hands-on Competence
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Supervised Check-outs & Returns */}
      <div className="p-5 rounded-3xl bg-[#12060b] border border-[#3b0e19] shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2b0c16]">
          <div>
            <h3 className="text-base font-black font-cinematic uppercase tracking-wider text-[#faedf1]">
              Upcoming Handovers & Return Inspections
            </h3>
            <p className="text-xs text-[#c4adb5] font-serif-cozy italic">
              Record physical condition before and after access for supervised equipment.
            </p>
          </div>
        </div>

        {activeBookings.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#c4adb5]">
            No active sessions currently scheduled on supervised machinery.
          </div>
        ) : (
          <div className="space-y-3">
            {activeBookings.map((req) => {
              const res = resources.find((r) => r.id === req.resourceId);
              const isConfirmed = req.status === 'confirmed';
              const isInUse = req.status === 'in-use';
              const isOverdue = req.status === 'overdue';

              return (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-[#17060e] border border-[#3b0e19] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <StatusChip status={req.status} />
                      <span className="font-bold text-sm text-[#faedf1] font-cinematic uppercase">
                        {res?.title}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#c4adb5]">
                      Requester: <span className="text-[#faedf1]">{req.requesterId}</span> • Slot:{' '}
                      {req.slotStart ? new Date(req.slotStart).toLocaleString() : 'Permanent Handover'}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isConfirmed ? (
                      <button
                        onClick={() => res && onOpenCheckoutReturn('checkout', req, res)}
                        className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#5c0f20] to-[#8a1731] text-[#fff] border border-[#f5b5c8]/60 text-xs font-semibold shadow-md"
                      >
                        <PlayCircle className="w-3.5 h-3.5 text-[#f5b5c8]" />
                        <span>Perform Check-Out (Baseline)</span>
                      </button>
                    ) : (isInUse || isOverdue) ? (
                      <button
                        onClick={() => res && onOpenCheckoutReturn('return', req, res)}
                        className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl bg-emerald-900/90 text-emerald-100 border border-emerald-500/70 text-xs font-semibold shadow-md"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Perform Return Inspection</span>
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
    </div>
  );
};
