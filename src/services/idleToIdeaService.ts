import { dataStore, AppState } from './store';
import {
  User,
  Resource,
  Quiz,
  EligibilityRecord,
  RequestRecord,
  WaitlistEntry,
  HandoverRecord,
  ExtensionRequest,
  PaymentDemo,
  Incident,
  NotificationItem,
  AuditLogItem,
  OwnerVerificationState,
  Slot,
  DecisionReason,
} from '../types';

export const DECISION_REASONS: Record<string, DecisionReason> = {
  APPROVED_ELIGIBLE: {
    code: 'APPROVED_ELIGIBLE',
    text: 'Safety training verified and slot available; booking confirmed.',
    ruleReference: 'Section 10.1: Risk-based eligibility & slot availability',
  },
  AUTO_CONFIRMED_LOW_RISK: {
    code: 'AUTO_CONFIRMED_LOW_RISK',
    text: 'Low-risk resource with auto-confirm enabled by owner; confirmed automatically.',
    ruleReference: 'Section 10.1: Auto-approval policy for low-risk equipment',
  },
  REJECTED_TRAINING_INCOMPLETE: {
    code: 'REJECTED_TRAINING_INCOMPLETE',
    text: 'Required safety training quiz or supervisor certification not completed.',
    ruleReference: 'Section 10.1: Training prerequisite requirement',
  },
  REJECTED_SLOT_UNAVAILABLE: {
    code: 'REJECTED_SLOT_UNAVAILABLE',
    text: 'The requested time slot is already confirmed or reserved by another user.',
    ruleReference: 'Section 10.4: Transactional overlap prevention',
  },
  REJECTED_CAP_REACHED: {
    code: 'REJECTED_CAP_REACHED',
    text: 'You have reached the maximum active booking cap (default 2) for this high-demand resource.',
    ruleReference: 'Section 10.2: Fair allocation active booking cap',
  },
  REJECTED_MAINTENANCE: {
    code: 'REJECTED_MAINTENANCE',
    text: 'Resource or slot is currently taken offline for maintenance or calibration.',
    ruleReference: 'Section 10.4: Maintenance blackout schedule',
  },
  REJECTED_OWNER_DECLINED: {
    code: 'REJECTED_OWNER_DECLINED',
    text: 'Request declined by facility manager or equipment owner.',
    ruleReference: 'Section 9.1: Owner discretion under published policy',
  },
  WAITLISTED_FIRST_ELIGIBLE: {
    code: 'WAITLISTED_FIRST_ELIGIBLE',
    text: 'Slot is occupied. Placed on the transparent first-eligible waitlist.',
    ruleReference: 'Section 10.2: First-eligible waitlist policy',
  },
  NEEDS_MORE_INFO: {
    code: 'NEEDS_MORE_INFO',
    text: 'The owner or supervisor requested additional project details before approval.',
    ruleReference: 'Section 11.3: Clarification request workflow',
  },
  RESTRICTED_OVERDUE: {
    code: 'RESTRICTED_OVERDUE',
    text: 'User profile currently has a temporary restriction pending review of overdue equipment.',
    ruleReference: 'Section 10.7: Overdue grace period restriction',
  },
};

export class IdleToIdeaService {
  // Current session & clock
  static getCurrentUser(): User {
    const state = dataStore.getState();
    const user = state.users.find((u) => u.id === state.currentUserId);
    return user || state.users[0];
  }

  static setCurrentUser(userId: string) {
    dataStore.update((s) => {
      s.currentUserId = userId;
    });
  }

  static getDemoClock(): string {
    return dataStore.getState().demoClock;
  }

  static advanceDemoClock(minutes: number) {
    let newTimeStr = '';
    dataStore.update((s) => {
      const current = new Date(s.demoClock);
      current.setMinutes(current.getMinutes() + minutes);
      s.demoClock = current.toISOString();
      newTimeStr = s.demoClock;
    });
    this.runClockTriggers(newTimeStr);
  }

  static jumpClockToAfterDueTime() {
    // Jump to just after Kabir's session or the next active session
    dataStore.update((s) => {
      const confirmed = s.requests.find((r) => r.status === 'confirmed' || r.status === 'in-use');
      if (confirmed && confirmed.slotEnd) {
        const afterDue = new Date(confirmed.slotEnd);
        afterDue.setMinutes(afterDue.getMinutes() + 16); // 16 mins after due (past 15m grace)
        s.demoClock = afterDue.toISOString();
      } else {
        const cur = new Date(s.demoClock);
        cur.setHours(cur.getHours() + 25);
        s.demoClock = cur.toISOString();
      }
    });
    this.runClockTriggers(dataStore.getState().demoClock);
  }

  // Audit logging helper
  static logAudit(actor: User, action: string, entityType: string, entityId: string, summary: string, reasonCode?: string) {
    const entry: AuditLogItem = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      actorId: actor.id,
      actorRole: actor.role,
      action,
      entityType,
      entityId,
      reasonCode,
      summary,
      timestamp: dataStore.getState().demoClock,
    };
    dataStore.update((s) => {
      s.auditLogs.unshift(entry);
    });
  }

  // Notification helper
  static notify(recipientId: string, type: string, message: string, relatedRecordId?: string) {
    const notif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      recipientId,
      type,
      message,
      relatedRecordId,
      isDemo: true,
      createdAt: dataStore.getState().demoClock,
    };
    dataStore.update((s) => {
      s.notifications.unshift(notif);
    });
  }

  // Resources
  static getResources(): Resource[] {
    return dataStore.getState().resources;
  }

  static getResource(id: string): Resource | undefined {
    return dataStore.getState().resources.find((r) => r.id === id);
  }

  static searchResources(params: {
    query?: string;
    category?: string;
    resourceType?: string;
    priceMode?: string;
    transferMode?: string;
    riskLevel?: string;
    availableOnly?: boolean;
  }): Resource[] {
    const all = dataStore.getState().resources;
    return all.filter((r) => {
      if (r.listingState === 'draft' || r.listingState === 'pending-admin-check') {
        const current = this.getCurrentUser();
        // Visible to owner or admin only
        if (current.role !== 'admin' && current.id !== r.ownerId) return false;
      }

      if (params.category && params.category !== 'all' && r.category !== params.category) {
        return false;
      }
      if (params.resourceType && params.resourceType !== 'all' && r.resourceType !== params.resourceType) {
        return false;
      }
      if (params.priceMode && params.priceMode !== 'all' && r.priceMode !== params.priceMode) {
        return false;
      }
      if (params.transferMode && params.transferMode !== 'all' && r.transferMode !== params.transferMode) {
        return false;
      }
      if (params.riskLevel && params.riskLevel !== 'all' && r.riskLevel !== params.riskLevel) {
        return false;
      }
      if (params.availableOnly && r.status !== 'available') {
        return false;
      }
      if (params.query) {
        const q = params.query.toLowerCase();
        const matches =
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }

  // Create Listing (Owner)
  static createListing(
    actor: User,
    data: Omit<Resource, 'id' | 'ownerId' | 'facilityId' | 'organisationId' | 'availabilitySlots' | 'createdAt' | 'listingState'>,
    slots: Slot[] = []
  ): { resource: Resource; message: string } {
    if (actor.role !== 'owner' && actor.role !== 'admin') {
      throw new Error('Only resource owners or administrators can create listings.');
    }

    const state = dataStore.getState();
    const ownerVerif = state.ownerVerifications[actor.id];
    const isUnverified = !ownerVerif || ownerVerif.state === 'self-registered';

    // Rule: high-risk listings by unverified owners must go through admin spot-check
    const listingState = isUnverified && data.riskLevel === 'high' ? 'pending-admin-check' : 'active';

    const newId = `res_${Date.now()}`;
    const newResource: Resource = {
      ...data,
      id: newId,
      ownerId: actor.id,
      facilityId: actor.facilityId,
      organisationId: actor.organisationId,
      availabilitySlots: slots.map((s) => ({ ...s, resourceId: newId })),
      listingState,
      createdAt: state.demoClock,
    };

    dataStore.update((s) => {
      s.resources.unshift(newResource);
    });

    const msg =
      listingState === 'pending-admin-check'
        ? 'High-risk equipment submitted! Placed in Admin review queue for safety spot-check before becoming public.'
        : `Listing published successfully (${isUnverified ? 'Unverified owner label applied' : 'Demo verified'}).`;

    this.logAudit(
      actor,
      'CREATE_LISTING',
      'Resource',
      newId,
      `Owner ${actor.displayName} created listing "${newResource.title}" (Status: ${listingState}).`,
      listingState === 'pending-admin-check' ? 'PENDING_ADMIN_CHECK' : 'PUBLISHED_ACTIVE'
    );

    return { resource: newResource, message: msg };
  }

  // Block a slot for maintenance or internal use
  static blockSlot(actor: User, resourceId: string, slotId: string, reason: string) {
    const state = dataStore.getState();
    const resource = state.resources.find((r) => r.id === resourceId);
    if (!resource) throw new Error('Resource not found');

    const isOwner = actor.id === resource.ownerId;
    const isAdmin = actor.role === 'admin';
    if (!isOwner && !isAdmin) {
      throw new Error('Only the resource owner or admin can block slots.');
    }

    let affectedRequestId: string | undefined;
    let affectedUserId: string | undefined;

    dataStore.update((s) => {
      const targetRes = s.resources.find((r) => r.id === resourceId);
      const slot = targetRes?.availabilitySlots.find((sl) => sl.id === slotId);
      if (!slot) throw new Error('Slot not found');

      // If a booking was confirmed on this slot, note affected user
      if (slot.state === 'confirmed' && slot.bookedByRequestId) {
        affectedRequestId = slot.bookedByRequestId;
        const targetReq = s.requests.find((req) => req.id === affectedRequestId);
        if (targetReq) {
          affectedUserId = targetReq.requesterId;
          targetReq.status = 'cancelled';
          targetReq.decisionReasonCode = 'REJECTED_MAINTENANCE';
          targetReq.decisionNote = `Slot blocked by owner for maintenance: ${reason}. Priority offered on next matching slot.`;
        }
      }

      slot.state = 'blocked';
      slot.blockReason = reason;
      slot.bookedByRequestId = undefined;
    });

    this.logAudit(
      actor,
      'BLOCK_SLOT',
      'Slot',
      slotId,
      `Owner ${actor.displayName} blocked slot on "${resource.title}" for maintenance. Reason: ${reason}`
    );

    if (affectedUserId) {
      this.notify(
        affectedUserId,
        'SLOT_MAINTENANCE_BLOCKED',
        `Your booking on "${resource.title}" was rescheduled due to required maintenance: "${reason}". Please pick an alternative slot or contact staff.`,
        affectedRequestId
      );
    }
  }

  // Admin Actions
  static adminCheckListing(actor: User, resourceId: string, approve: boolean, note: string) {
    if (actor.role !== 'admin') throw new Error('Unauthorized: Admin access required.');

    let resourceTitle = '';
    let ownerId = '';
    dataStore.update((s) => {
      const res = s.resources.find((r) => r.id === resourceId);
      if (!res) throw new Error('Resource not found');
      resourceTitle = res.title;
      ownerId = res.ownerId;
      res.listingState = approve ? 'active' : 'paused';
    });

    this.logAudit(
      actor,
      approve ? 'ADMIN_APPROVE_LISTING' : 'ADMIN_REJECT_LISTING',
      'Resource',
      resourceId,
      `Admin ${actor.displayName} ${approve ? 'approved' : 'rejected'} listing "${resourceTitle}". Note: ${note}`
    );

    this.notify(
      ownerId,
      'LISTING_ADMIN_DECISION',
      `Your listing "${resourceTitle}" was ${approve ? 'approved and is now active' : 'rejected by platform admin'}. Note: ${note}`,
      resourceId
    );
  }

  static adminSpotCheckOwner(actor: User, ownerId: string, newState: OwnerVerificationState, note: string) {
    if (actor.role !== 'admin') throw new Error('Unauthorized: Admin access required.');

    dataStore.update((s) => {
      s.ownerVerifications[ownerId] = {
        ownerId,
        state: newState,
        checkedBy: actor.id,
        checkedAt: s.demoClock,
        note,
      };
      const user = s.users.find((u) => u.id === ownerId);
      if (user) {
        user.verificationLabel = newState === 'spot-checked' ? 'Demo verified' : 'Unverified owner';
      }
    });

    this.logAudit(
      actor,
      'SPOT_CHECK_OWNER',
      'User',
      ownerId,
      `Admin ${actor.displayName} updated owner verification for ${ownerId} to "${newState}". Note: ${note}`
    );
  }

  // Eligibility & Quizzes
  static getQuiz(quizId: string): Quiz | undefined {
    return dataStore.getState().quizzes.find((q) => q.id === quizId);
  }

  static getEligibility(userId: string, resourceId: string): {
    record?: EligibilityRecord;
    isEligible: boolean;
    checklist: { label: string; met: boolean; detail: string; action?: string }[];
  } {
    const state = dataStore.getState();
    const user = state.users.find((u) => u.id === userId);
    const resource = state.resources.find((r) => r.id === resourceId);
    if (!resource || !user) return { isEligible: false, checklist: [] };

    const eligRecord = state.eligibilityRecords.find((e) => e.userId === userId && e.resourceId === resourceId);
    const checklist: { label: string; met: boolean; detail: string; action?: string }[] = [];

    // 1. Account Standing check
    const isStandingOk = !user.userStanding.restrictedUntil || new Date(user.userStanding.restrictedUntil) <= new Date(state.demoClock);
    checklist.push({
      label: 'Account Standing & No Restrictions',
      met: isStandingOk,
      detail: isStandingOk ? 'Account is in good standing.' : `Account has active temporary restriction until ${new Date(user.userStanding.restrictedUntil!).toLocaleTimeString()}.`,
    });

    // 2. Booking Cap check
    if (resource.highDemand) {
      const activeBookings = state.requests.filter(
        (req) => req.requesterId === userId && req.resourceId === resourceId && (req.status === 'confirmed' || req.status === 'in-use' || req.status === 'pending-review')
      ).length;
      const capMet = activeBookings < (resource.policies.bookingCap || 2);
      checklist.push({
        label: `Fair Allocation Booking Cap (Max ${resource.policies.bookingCap} active)`,
        met: capMet,
        detail: capMet ? `${activeBookings} of ${resource.policies.bookingCap} active slots used.` : `Reached active booking cap (${activeBookings}/${resource.policies.bookingCap}). You can join the waitlist.`,
      });
    }

    // 3. Training & Quiz
    if (resource.trainingRequired && resource.quizId) {
      const hasPassedQuiz = eligRecord && eligRecord.quizScore >= (state.quizzes.find((q) => q.id === resource.quizId)?.passMark || 80);
      checklist.push({
        label: 'Safety Certification Quiz (80%+)',
        met: !!hasPassedQuiz,
        detail: hasPassedQuiz ? `Passed with score ${eligRecord.quizScore}%.` : eligRecord ? `Previous attempt score ${eligRecord.quizScore}%. Retake available.` : 'Not yet taken. Must complete safety quiz.',
        action: hasPassedQuiz ? undefined : 'take_quiz',
      });
    }

    // 4. Supervisor sign-off for High-Risk
    if (resource.riskLevel === 'high') {
      const isApproved = eligRecord && (eligRecord.status === 'approved' || eligRecord.approvedBy);
      checklist.push({
        label: 'High-Risk Supervisor Physical Verification',
        met: !!isApproved,
        detail: isApproved ? `Supervisor verified hands-on safety on ${new Date(eligRecord!.approvedAt!).toLocaleDateString()}.` : eligRecord?.status === 'awaiting supervisor' ? 'Quiz passed; awaiting supervisor sign-off in queue.' : 'Requires quiz completion then supervisor in-person sign-off.',
      });
    }

    const isEligible = checklist.every((c) => c.met);
    return { record: eligRecord, isEligible, checklist };
  }

  static submitQuiz(
    actor: User,
    quizId: string,
    answers: Record<string, number>
  ): { record: EligibilityRecord; passed: boolean; score: number } {
    const state = dataStore.getState();
    const quiz = state.quizzes.find((q) => q.id === quizId);
    if (!quiz) throw new Error('Quiz not found');

    const resource = state.resources.find((r) => r.id === quiz.resourceId);

    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correctCount++;
    });
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passMark;

    let existingRecord = state.eligibilityRecords.find((e) => e.userId === actor.id && e.resourceId === quiz.resourceId);

    const attemptsToday = (existingRecord?.attemptsToday || 0) + 1;
    if (attemptsToday > quiz.maxAttemptsPerDay && !passed) {
      throw new Error(`Daily attempt limit reached (${quiz.maxAttemptsPerDay} per day). Please review the safety guidelines and retry tomorrow.`);
    }

    const newStatus = passed
      ? resource?.riskLevel === 'high'
        ? 'awaiting supervisor'
        : 'approved'
      : 'failed';

    const updatedRecord: EligibilityRecord = {
      id: existingRecord?.id || `elig_${actor.id}_${quiz.resourceId}`,
      userId: actor.id,
      resourceId: quiz.resourceId,
      quizScore: score,
      attemptsToday,
      lastAttemptAt: state.demoClock,
      status: newStatus,
      approvedAt: newStatus === 'approved' ? state.demoClock : undefined,
      expiresAt: newStatus === 'approved' ? new Date(new Date(state.demoClock).getTime() + 365 * 24 * 3600 * 1000).toISOString() : undefined,
    };

    dataStore.update((s) => {
      const idx = s.eligibilityRecords.findIndex((e) => e.id === updatedRecord.id);
      if (idx >= 0) {
        s.eligibilityRecords[idx] = updatedRecord;
      } else {
        s.eligibilityRecords.push(updatedRecord);
      }
    });

    this.logAudit(
      actor,
      'SUBMIT_QUIZ',
      'Quiz',
      quizId,
      `User ${actor.displayName} scored ${score}% on "${quiz.title}" (Status: ${newStatus}).`,
      passed ? 'QUIZ_PASSED' : 'QUIZ_FAILED'
    );

    if (newStatus === 'awaiting supervisor' && resource?.assignedSupervisorIds?.length) {
      resource.assignedSupervisorIds.forEach((supId) => {
        this.notify(
          supId,
          'SUPERVISOR_APPROVAL_NEEDED',
          `${actor.displayName} passed the safety quiz for ${resource.title}. Supervisor sign-off required to grant access.`,
          updatedRecord.id
        );
      });
    }

    return { record: updatedRecord, passed, score };
  }

  static supervisorApproveEligibility(actor: User, eligibilityRecordId: string, note?: string) {
    if (actor.role !== 'supervisor' && actor.role !== 'admin') {
      throw new Error('Only equipment supervisors or admins can approve high-risk eligibility.');
    }

    let userId = '';
    let resourceTitle = '';
    dataStore.update((s) => {
      const record = s.eligibilityRecords.find((e) => e.id === eligibilityRecordId);
      if (!record) throw new Error('Eligibility record not found');
      record.status = 'approved';
      record.approvedBy = actor.id;
      record.approvedAt = s.demoClock;
      record.expiresAt = new Date(new Date(s.demoClock).getTime() + 365 * 24 * 3600 * 1000).toISOString();
      userId = record.userId;
      const res = s.resources.find((r) => r.id === record.resourceId);
      resourceTitle = res ? res.title : 'Equipment';
    });

    this.logAudit(
      actor,
      'SUPERVISOR_APPROVE_ELIGIBILITY',
      'EligibilityRecord',
      eligibilityRecordId,
      `Supervisor ${actor.displayName} approved eligibility for ${userId} on ${resourceTitle}. ${note || ''}`,
      'APPROVED_ELIGIBLE'
    );

    this.notify(
      userId,
      'ELIGIBILITY_APPROVED',
      `Your hands-on safety certification for "${resourceTitle}" was approved by Supervisor ${actor.displayName}. You may now book sessions!`,
      eligibilityRecordId
    );
  }

  static supervisorRejectEligibility(actor: User, eligibilityRecordId: string, reason: string) {
    if (actor.role !== 'supervisor' && actor.role !== 'admin') {
      throw new Error('Only equipment supervisors or admins can reject eligibility.');
    }

    let userId = '';
    let resourceTitle = '';
    dataStore.update((s) => {
      const record = s.eligibilityRecords.find((e) => e.id === eligibilityRecordId);
      if (!record) throw new Error('Eligibility record not found');
      record.status = 'rejected';
      userId = record.userId;
      const res = s.resources.find((r) => r.id === record.resourceId);
      resourceTitle = res ? res.title : 'Equipment';
    });

    this.logAudit(
      actor,
      'SUPERVISOR_REJECT_ELIGIBILITY',
      'EligibilityRecord',
      eligibilityRecordId,
      `Supervisor ${actor.displayName} declined eligibility for ${userId} on ${resourceTitle}. Reason: ${reason}`
    );

    this.notify(
      userId,
      'ELIGIBILITY_REJECTED',
      `Safety certification sign-off for "${resourceTitle}" was declined. Reason: ${reason}`,
      eligibilityRecordId
    );
  }

  // Request Submission with Transactional Overlap and Cap check
  static submitRequest(
    actor: User,
    params: {
      resourceId: string;
      slotId?: string;
      transferTerms?: string;
      message: string;
    }
  ): { request: RequestRecord; isAutoConfirmed: boolean; message: string; reasonCode: string } {
    const state = dataStore.getState();
    const resource = state.resources.find((r) => r.id === params.resourceId);
    if (!resource) throw new Error('Resource not found');

    // Check account standing
    if (actor.userStanding.restrictedUntil && new Date(actor.userStanding.restrictedUntil) > new Date(state.demoClock)) {
      throw new Error('Your account is temporarily restricted from new bookings due to an overdue item. Please return the resource or contact the lab supervisor.');
    }

    // Check Eligibility
    const { isEligible, checklist } = this.getEligibility(actor.id, params.resourceId);
    if (!isEligible) {
      const unmet = checklist.filter((c) => !c.met).map((c) => c.label).join(', ');
      throw new Error(`Eligibility prerequisites not satisfied: ${unmet}`);
    }

    // Determine request type
    let requestType: RequestRecord['requestType'] = 'borrow';
    if (resource.transferMode === 'permanent') {
      requestType = resource.priceMode === 'paid' ? 'sale' : 'giveaway';
    } else {
      requestType = resource.priceMode === 'paid' ? 'rent' : 'borrow';
    }

    // For temporary bookings, check slot and overlap
    let slot: Slot | undefined;
    if (resource.transferMode === 'temporary') {
      if (!params.slotId) throw new Error('Please select an available time slot.');
      slot = resource.availabilitySlots.find((s) => s.id === params.slotId);
      if (!slot) throw new Error('Selected slot does not exist.');

      // Overlap prevention: verify slot is not confirmed or blocked
      if (slot.state === 'confirmed') {
        throw new Error('Slot conflict: This slot was already confirmed for another user. You can join the waitlist instead.');
      }
      if (slot.state === 'blocked') {
        throw new Error(`Slot unavailable: This slot is blocked (${slot.blockReason || 'maintenance'}).`);
      }

      // Check user cap
      if (resource.highDemand) {
        const activeCount = state.requests.filter(
          (req) => req.requesterId === actor.id && req.resourceId === resource.id && (req.status === 'confirmed' || req.status === 'in-use' || req.status === 'pending-review')
        ).length;
        if (activeCount >= (resource.policies.bookingCap || 2)) {
          throw new Error(`Active booking cap of ${resource.policies.bookingCap} reached for this high-demand equipment.`);
        }
      }
    }

    // Check if auto-confirm applies: Low risk AND owner enabled auto-confirm
    const canAutoConfirm =
      resource.riskLevel === 'low' &&
      resource.approvalMode === 'auto-if-low-risk' &&
      resource.transferMode === 'temporary';

    const reqId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const expiresAt = new Date(new Date(state.demoClock).getTime() + (resource.policies.pendingExpiryHours || 48) * 3600 * 1000).toISOString();

    const newRequest: RequestRecord = {
      id: reqId,
      resourceId: resource.id,
      requesterId: actor.id,
      requestType,
      slotId: slot?.id,
      slotStart: slot?.start,
      slotEnd: slot?.end,
      transferTerms: params.transferTerms,
      status: canAutoConfirm ? 'confirmed' : 'pending-review',
      eligibilitySnapshot: {
        trainingPassed: true,
        supervisorApproved: resource.riskLevel !== 'high' || true,
        standingOk: true,
        capOk: true,
      },
      message: params.message || 'Makerspace project request.',
      createdAt: state.demoClock,
      expiresAt,
      decisionBy: canAutoConfirm ? 'system' : undefined,
      decisionAt: canAutoConfirm ? state.demoClock : undefined,
      decisionReasonCode: canAutoConfirm ? 'AUTO_CONFIRMED_LOW_RISK' : undefined,
      decisionNote: canAutoConfirm ? 'Auto-confirmed per low-risk institutional policy.' : undefined,
    };

    // Transactional write
    dataStore.update((s) => {
      s.requests.unshift(newRequest);
      if (slot) {
        const targetRes = s.resources.find((r) => r.id === resource.id);
        const targetSlot = targetRes?.availabilitySlots.find((sl) => sl.id === slot!.id);
        if (targetSlot) {
          targetSlot.state = canAutoConfirm ? 'confirmed' : 'held';
          targetSlot.bookedByRequestId = reqId;
        }
      }
      // If paid, create simulated payment record
      if (resource.priceMode === 'paid') {
        s.paymentsDemo.unshift({
          id: `pay_${reqId}`,
          requestId: reqId,
          amount: resource.price,
          currency: 'INR',
          status: 'pending',
          simulationLabel: 'Simulation only. No real money is moved.',
          updatedAt: s.demoClock,
        });
      }
    });

    this.logAudit(
      actor,
      'SUBMIT_REQUEST',
      'Request',
      reqId,
      `Requester ${actor.displayName} submitted ${requestType} request for "${resource.title}". Status: ${newRequest.status}`,
      canAutoConfirm ? 'AUTO_CONFIRMED_LOW_RISK' : 'PENDING_REVIEW'
    );

    // Notify owner / supervisors
    if (!canAutoConfirm) {
      this.notify(
        resource.ownerId,
        'REQUEST_RECEIVED',
        `New ${requestType} request received from ${actor.displayName} for "${resource.title}".`,
        reqId
      );
      if (resource.assignedSupervisorIds) {
        resource.assignedSupervisorIds.forEach((supId) => {
          this.notify(
            supId,
            'REQUEST_RECEIVED',
            `New access request for supervised resource "${resource.title}" from ${actor.displayName}.`,
            reqId
          );
        });
      }
    } else {
      this.notify(
        actor.id,
        'REQUEST_AUTO_CONFIRMED',
        `Your request for "${resource.title}" was auto-confirmed. Slot reserved!`,
        reqId
      );
    }

    return {
      request: newRequest,
      isAutoConfirmed: canAutoConfirm,
      message: canAutoConfirm ? 'Booking automatically confirmed!' : 'Request submitted successfully. Currently pending owner/supervisor review.',
      reasonCode: canAutoConfirm ? 'AUTO_CONFIRMED_LOW_RISK' : 'PENDING_REVIEW',
    };
  }

  // Owner / Supervisor Decision
  static decideRequest(
    actor: User,
    requestId: string,
    decision: 'approve' | 'reject' | 'needMoreInfo',
    reasonCode: string,
    note?: string
  ) {
    const state = dataStore.getState();
    const req = state.requests.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');
    const resource = state.resources.find((r) => r.id === req.resourceId);
    if (!resource) throw new Error('Resource not found');

    // Role check: must be owner, assigned supervisor, or admin
    const isOwner = actor.id === resource.ownerId;
    const isSupervisor = resource.assignedSupervisorIds?.includes(actor.id);
    const isAdmin = actor.role === 'admin';
    if (!isOwner && !isSupervisor && !isAdmin) {
      throw new Error('Unauthorized: You do not have permission to review this request.');
    }

    if (decision === 'approve') {
      // Re-verify overlap check in transaction!
      if (req.slotId) {
        const slot = resource.availabilitySlots.find((s) => s.id === req.slotId);
        if (slot && slot.state === 'confirmed' && slot.bookedByRequestId !== req.id) {
          throw new Error('Conflict error: Slot was already reserved by another confirmed booking.');
        }
      }

      dataStore.update((s) => {
        const targetReq = s.requests.find((r) => r.id === requestId);
        if (targetReq) {
          targetReq.status = 'confirmed';
          targetReq.decisionBy = actor.id;
          targetReq.decisionAt = s.demoClock;
          targetReq.decisionReasonCode = reasonCode || 'APPROVED_ELIGIBLE';
          targetReq.decisionNote = note || `Approved by ${actor.role} ${actor.displayName}`;
        }
        if (req.slotId) {
          const res = s.resources.find((r) => r.id === req.resourceId);
          const sl = res?.availabilitySlots.find((slot) => slot.id === req.slotId);
          if (sl) {
            sl.state = 'confirmed';
            sl.bookedByRequestId = req.id;
          }
        }
      });

      this.logAudit(
        actor,
        'APPROVE_REQUEST',
        'Request',
        requestId,
        `${actor.displayName} (${actor.role}) approved request for "${resource.title}". Reason: ${reasonCode}. ${note || ''}`,
        reasonCode || 'APPROVED_ELIGIBLE'
      );

      this.notify(
        req.requesterId,
        'REQUEST_APPROVED',
        `Your request for "${resource.title}" was approved! Reason: ${DECISION_REASONS[reasonCode]?.text || 'Training and slot confirmed.'}`,
        requestId
      );
    } else if (decision === 'reject') {
      dataStore.update((s) => {
        const targetReq = s.requests.find((r) => r.id === requestId);
        if (targetReq) {
          targetReq.status = 'rejected';
          targetReq.decisionBy = actor.id;
          targetReq.decisionAt = s.demoClock;
          targetReq.decisionReasonCode = reasonCode || 'REJECTED_OWNER_DECLINED';
          targetReq.decisionNote = note || 'Declined by reviewer.';
        }
        if (req.slotId) {
          const res = s.resources.find((r) => r.id === req.resourceId);
          const sl = res?.availabilitySlots.find((slot) => slot.id === req.slotId);
          if (sl && sl.state === 'held' && sl.bookedByRequestId === req.id) {
            sl.state = 'available';
            sl.bookedByRequestId = undefined;
          }
        }
      });

      this.logAudit(
        actor,
        'REJECT_REQUEST',
        'Request',
        requestId,
        `${actor.displayName} (${actor.role}) rejected request for "${resource.title}". Reason: ${reasonCode}. ${note || ''}`,
        reasonCode
      );

      this.notify(
        req.requesterId,
        'REQUEST_REJECTED',
        `Your request for "${resource.title}" was declined. Reason: ${DECISION_REASONS[reasonCode]?.text || note || 'Declined by owner.'}`,
        requestId
      );
    } else {
      // Need more info
      dataStore.update((s) => {
        const targetReq = s.requests.find((r) => r.id === requestId);
        if (targetReq) {
          targetReq.decisionReasonCode = 'NEEDS_MORE_INFO';
          targetReq.decisionNote = note;
        }
      });

      this.logAudit(
        actor,
        'NEED_MORE_INFO',
        'Request',
        requestId,
        `${actor.displayName} requested more information on request for "${resource.title}": "${note}"`,
        'NEEDS_MORE_INFO'
      );

      this.notify(
        req.requesterId,
        'MORE_INFO_REQUESTED',
        `Clarification needed for your "${resource.title}" request: ${note}`,
        requestId
      );
    }
  }

  // Cancel Booking & Fair Waitlist Slot Offering
  static cancelBooking(actor: User, requestId: string, reason: string) {
    const state = dataStore.getState();
    const req = state.requests.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');

    const isRequester = actor.id === req.requesterId;
    const isAdmin = actor.role === 'admin';
    if (!isRequester && !isAdmin) {
      throw new Error('Only the requester or administrator can cancel this booking.');
    }

    const resource = state.resources.find((r) => r.id === req.resourceId);
    const slotId = req.slotId;

    dataStore.update((s) => {
      const targetReq = s.requests.find((r) => r.id === requestId);
      if (targetReq) {
        targetReq.status = 'cancelled';
        targetReq.decisionNote = `Cancelled by ${actor.displayName}: ${reason}`;
      }
      if (slotId && resource) {
        const res = s.resources.find((r) => r.id === resource.id);
        const sl = res?.availabilitySlots.find((x) => x.id === slotId);
        if (sl) {
          sl.state = 'available';
          sl.bookedByRequestId = undefined;
        }
      }
    });

    this.logAudit(
      actor,
      'CANCEL_BOOKING',
      'Request',
      requestId,
      `User ${actor.displayName} cancelled booking for "${resource?.title || 'Resource'}". Reason: ${reason}`
    );

    // Fair waitlist trigger: offer slot to the first eligible waitlisted person!
    if (slotId && resource) {
      this.offerSlotToFirstEligibleWaitlist(resource.id, slotId);
    }
  }

  static offerSlotToFirstEligibleWaitlist(resourceId: string, slotId: string) {
    const state = dataStore.getState();
    const waitlist = state.waitlistEntries
      .filter((w) => w.resourceId === resourceId && w.slotId === slotId && w.status === 'waiting')
      .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

    if (waitlist.length === 0) return;

    // Find first user who is currently eligible
    for (const entry of waitlist) {
      const { isEligible } = this.getEligibility(entry.userId, resourceId);
      if (isEligible) {
        const offerExpiry = new Date(new Date(state.demoClock).getTime() + 24 * 3600 * 1000).toISOString();
        dataStore.update((s) => {
          const targetWl = s.waitlistEntries.find((w) => w.id === entry.id);
          if (targetWl) {
            targetWl.status = 'offered';
            targetWl.offerExpiresAt = offerExpiry;
          }
        });

        const res = state.resources.find((r) => r.id === resourceId);
        this.notify(
          entry.userId,
          'WAITLIST_SLOT_OFFERED',
          `Good news! A slot opened for "${res?.title || 'Resource'}". You have 24 hours to accept this offer before it passes to the next person.`,
          entry.id
        );

        const actor = state.users.find((u) => u.id === entry.userId) || state.users[0];
        this.logAudit(
          actor,
          'OFFER_WAITLIST_SLOT',
          'WaitlistEntry',
          entry.id,
          `Freed slot offered to first eligible waitlisted user ${actor.displayName} (offer expires in 24h).`
        );
        break;
      }
    }
  }

  // Join & Accept Waitlist
  static joinWaitlist(actor: User, resourceId: string, slotId: string) {
    const state = dataStore.getState();
    const resource = state.resources.find((r) => r.id === resourceId);
    if (!resource) throw new Error('Resource not found');

    // Rule: Must be eligible before joining waitlist
    const { isEligible, checklist } = this.getEligibility(actor.id, resourceId);
    if (!isEligible) {
      const unmet = checklist.filter((c) => !c.met).map((c) => c.label).join(', ');
      throw new Error(`Cannot join waitlist without completing prerequisites: ${unmet}`);
    }

    // Check cap
    if (resource.highDemand) {
      const activeCount = state.requests.filter(
        (r) => r.requesterId === actor.id && r.resourceId === resourceId && (r.status === 'confirmed' || r.status === 'in-use')
      ).length;
      if (activeCount >= (resource.policies.bookingCap || 2)) {
        throw new Error('You cannot join the waitlist because you have already reached your active booking cap for this resource.');
      }
    }

    // Check existing waitlist entry
    const existing = state.waitlistEntries.find(
      (w) => w.resourceId === resourceId && w.slotId === slotId && w.userId === actor.id && (w.status === 'waiting' || w.status === 'offered')
    );
    if (existing) throw new Error('You are already on the waitlist for this slot.');

    const newEntry: WaitlistEntry = {
      id: `wl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      resourceId,
      slotId,
      userId: actor.id,
      joinedAt: state.demoClock,
      status: 'waiting',
    };

    dataStore.update((s) => {
      s.waitlistEntries.push(newEntry);
    });

    const position = state.waitlistEntries.filter((w) => w.resourceId === resourceId && w.slotId === slotId && w.status === 'waiting').length;

    this.logAudit(
      actor,
      'JOIN_WAITLIST',
      'WaitlistEntry',
      newEntry.id,
      `${actor.displayName} joined waitlist for "${resource.title}" at position #${position}.`,
      'WAITLISTED_FIRST_ELIGIBLE'
    );

    this.notify(
      actor.id,
      'WAITLIST_CONFIRMATION',
      `You are position #${position} on the waitlist for ${resource.title}. We will offer you the slot automatically if freed.`,
      newEntry.id
    );

    return { entry: newEntry, position };
  }

  static acceptWaitlistOffer(actor: User, waitlistEntryId: string) {
    const state = dataStore.getState();
    const entry = state.waitlistEntries.find((w) => w.id === waitlistEntryId);
    if (!entry) throw new Error('Waitlist entry not found');
    if (entry.userId !== actor.id) throw new Error('Unauthorized');
    if (entry.status !== 'offered') throw new Error('This waitlist slot is not in an offered state.');

    const resource = state.resources.find((r) => r.id === entry.resourceId);
    if (!resource) throw new Error('Resource not found');

    const slot = resource.availabilitySlots.find((s) => s.id === entry.slotId);
    if (!slot) throw new Error('Slot not found');

    // Re-check overlap inside transaction
    if (slot.state === 'confirmed') {
      throw new Error('This slot is already booked.');
    }

    const reqId = `req_${Date.now()}_wl`;
    const newRequest: RequestRecord = {
      id: reqId,
      resourceId: resource.id,
      requesterId: actor.id,
      requestType: resource.priceMode === 'paid' ? 'rent' : 'borrow',
      slotId: slot.id,
      slotStart: slot.start,
      slotEnd: slot.end,
      status: 'confirmed',
      eligibilitySnapshot: {
        trainingPassed: true,
        supervisorApproved: true,
        standingOk: true,
        capOk: true,
      },
      message: 'Accepted waitlist offer.',
      createdAt: state.demoClock,
      decisionBy: 'system',
      decisionAt: state.demoClock,
      decisionReasonCode: 'APPROVED_ELIGIBLE',
      decisionNote: 'Waitlist offer accepted by first-eligible user.',
    };

    dataStore.update((s) => {
      const targetWl = s.waitlistEntries.find((w) => w.id === waitlistEntryId);
      if (targetWl) targetWl.status = 'accepted';

      s.requests.unshift(newRequest);

      const targetRes = s.resources.find((r) => r.id === resource.id);
      const targetSlot = targetRes?.availabilitySlots.find((sl) => sl.id === slot.id);
      if (targetSlot) {
        targetSlot.state = 'confirmed';
        targetSlot.bookedByRequestId = reqId;
      }
    });

    this.logAudit(
      actor,
      'ACCEPT_WAITLIST_OFFER',
      'Request',
      reqId,
      `User ${actor.displayName} accepted waitlist offer for "${resource.title}". Slot is now confirmed.`
    );

    this.notify(
      actor.id,
      'BOOKING_CONFIRMED',
      `Booking confirmed for "${resource.title}" from your waitlist offer!`,
      reqId
    );
  }

  // Extensions
  static requestExtension(actor: User, requestId: string, requestedMinutes: number) {
    const state = dataStore.getState();
    const req = state.requests.find((r) => r.id === requestId);
    if (!req) throw new Error('Request not found');
    if (req.requesterId !== actor.id) throw new Error('Only the booking requester can request extensions.');
    if (req.status !== 'in-use' && req.status !== 'confirmed') {
      throw new Error('Can only extend active or in-use bookings. Overdue or cancelled sessions cannot be extended.');
    }

    const resource = state.resources.find((r) => r.id === req.resourceId);
    if (!resource) throw new Error('Resource not found');

    // Check if waitlist exists for subsequent slot
    const hasWaitlist = state.waitlistEntries.some((w) => w.resourceId === resource.id && w.status === 'waiting');
    if (hasWaitlist) {
      throw new Error('Extension refused: Another user is currently on the waitlist for this equipment. Fair access rules prioritize waiting requesters.');
    }

    // Check user standing
    if (actor.userStanding.lateReturns > 0 || actor.userStanding.restrictedUntil) {
      throw new Error('Extension cannot be approved due to previous late returns or restrictions.');
    }

    // Auto-extend if enabled for low-risk
    const canAutoExtend = resource.policies.autoExtendEnabled && resource.riskLevel === 'low';

    const extId = `ext_${Date.now()}`;
    const extReq: ExtensionRequest = {
      id: extId,
      requestId,
      requestedMinutes,
      status: canAutoExtend ? 'approved' : 'pending',
      decidedBy: canAutoExtend ? 'system' : undefined,
      reasonCode: canAutoExtend ? 'AUTO_EXTENDED' : undefined,
      createdAt: state.demoClock,
    };

    dataStore.update((s) => {
      s.extensionRequests.push(extReq);
      if (canAutoExtend && req.slotEnd) {
        const currentEnd = new Date(req.slotEnd);
        currentEnd.setMinutes(currentEnd.getMinutes() + requestedMinutes);
        const targetReq = s.requests.find((r) => r.id === requestId);
        if (targetReq) targetReq.slotEnd = currentEnd.toISOString();
      }
    });

    this.logAudit(
      actor,
      'REQUEST_EXTENSION',
      'ExtensionRequest',
      extId,
      `${actor.displayName} requested ${requestedMinutes}m extension on "${resource.title}". Auto-approved: ${canAutoExtend}`
    );

    return { extension: extReq, autoApproved: canAutoExtend };
  }

  // Check-out & Return (Handover condition tracking)
  static recordCheckout(
    actor: User,
    params: {
      requestId: string;
      beforeCondition: string;
      accessoriesChecked: string[];
      beforePhotos: string[];
    }
  ) {
    const state = dataStore.getState();
    const req = state.requests.find((r) => r.id === params.requestId);
    if (!req) throw new Error('Request not found');

    const resource = state.resources.find((r) => r.id === req.resourceId);
    const isSupervisor = resource?.assignedSupervisorIds?.includes(actor.id);
    const isOwner = resource?.ownerId === actor.id;
    const isAdmin = actor.role === 'admin';
    if (!isSupervisor && !isOwner && !isAdmin) {
      throw new Error('Unauthorized: Only assigned supervisors or resource owners can record check-out.');
    }

    const handoverId = `handover_${Date.now()}`;
    const handover: HandoverRecord = {
      id: handoverId,
      requestId: req.id,
      checkoutAt: state.demoClock,
      checkoutBy: actor.id,
      beforeCondition: params.beforeCondition,
      beforePhotos: params.beforePhotos,
      accessoriesChecked: params.accessoriesChecked,
      dueAt: req.slotEnd || new Date(new Date(state.demoClock).getTime() + 3600 * 1000).toISOString(),
      accessoriesReturned: [],
    };

    dataStore.update((s) => {
      const targetReq = s.requests.find((r) => r.id === req.id);
      if (targetReq) targetReq.status = 'in-use';
      s.handoverRecords.push(handover);
    });

    this.logAudit(
      actor,
      'RECORD_CHECKOUT',
      'HandoverRecord',
      handoverId,
      `Check-out recorded by ${actor.displayName} for ${req.id}. Initial condition: "${params.beforeCondition}". Equipment now In Use.`
    );

    this.notify(
      req.requesterId,
      'CHECKOUT_CONFIRMED',
      `Check-out complete for "${resource?.title || 'equipment'}". Safe operating rules in effect. Due at: ${new Date(handover.dueAt!).toLocaleTimeString()}`,
      req.id
    );
  }

  static recordReturn(
    actor: User,
    params: {
      requestId: string;
      returnCondition: string;
      accessoriesReturned: string[];
      returnPhotos: string[];
      reportedIssues?: string;
    }
  ) {
    const state = dataStore.getState();
    const req = state.requests.find((r) => r.id === params.requestId);
    if (!req) throw new Error('Request not found');

    const resource = state.resources.find((r) => r.id === req.resourceId);
    const isSupervisor = resource?.assignedSupervisorIds?.includes(actor.id);
    const isOwner = resource?.ownerId === actor.id;
    const isAdmin = actor.role === 'admin';
    if (!isSupervisor && !isOwner && !isAdmin) {
      throw new Error('Unauthorized: Only assigned supervisors or resource owners can record return condition.');
    }

    dataStore.update((s) => {
      const targetReq = s.requests.find((r) => r.id === req.id);
      if (targetReq) targetReq.status = 'returned';

      let handover = s.handoverRecords.find((h) => h.requestId === req.id);
      if (handover) {
        handover.returnedAt = s.demoClock;
        handover.returnedRecordedBy = actor.id;
        handover.returnCondition = params.returnCondition;
        handover.returnPhotos = params.returnPhotos;
        handover.accessoriesReturned = params.accessoriesReturned;
        handover.reportedIssues = params.reportedIssues;
      }

      // Free slot
      if (req.slotId && resource) {
        const res = s.resources.find((r) => r.id === resource.id);
        const sl = res?.availabilitySlots.find((x) => x.id === req.slotId);
        if (sl) {
          sl.state = 'available';
          sl.bookedByRequestId = undefined;
        }
      }
    });

    this.logAudit(
      actor,
      'RECORD_RETURN',
      'Request',
      req.id,
      `Return recorded by ${actor.displayName}. Condition noted: "${params.returnCondition}". Booking completed.`
    );

    this.notify(
      req.requesterId,
      'RETURN_RECORDED',
      `Return verified for "${resource?.title || 'Resource'}". Thank you for keeping the makerspace safe!`,
      req.id
    );

    // If an issue or damage was reported, suggest incident creation
    if (params.reportedIssues) {
      this.notify(
        resource?.ownerId || actor.id,
        'RETURN_ISSUE_FLAGGED',
        `Return for "${resource?.title}" flagged an issue: "${params.reportedIssues}". Consider opening an incident review.`,
        req.id
      );
    }
  }

  // Permanent Transfer Handover Flow (distinct from temporary)
  static completePermanentTransfer(
    actor: User,
    params: {
      requestId: string;
      handoverNotes: string;
    }
  ) {
    const state = dataStore.getState();
    const req = state.requests.find((r) => r.id === params.requestId);
    if (!req) throw new Error('Request not found');

    const resource = state.resources.find((r) => r.id === req.resourceId);
    if (resource?.transferMode !== 'permanent') {
      throw new Error('This flow is reserved for permanent transfers (giveaway / sale) only.');
    }

    const isOwner = resource.ownerId === actor.id;
    const isAdmin = actor.role === 'admin';
    if (!isOwner && !isAdmin) {
      throw new Error('Only the resource owner or admin can confirm permanent handover.');
    }

    dataStore.update((s) => {
      const targetReq = s.requests.find((r) => r.id === req.id);
      if (targetReq) {
        targetReq.status = 'transfer-complete';
        targetReq.decisionNote = `Permanent transfer finalized by ${actor.displayName}. Notes: ${params.handoverNotes}`;
      }
      const targetRes = s.resources.find((r) => r.id === resource.id);
      if (targetRes) {
        targetRes.status = 'paused'; // Archived/Transferred
      }
    });

    this.logAudit(
      actor,
      'COMPLETE_PERMANENT_TRANSFER',
      'Request',
      req.id,
      `Permanent transfer handover completed for "${resource.title}". Ownership transferred to ${req.requesterId}.`
    );

    this.notify(
      req.requesterId,
      'TRANSFER_COMPLETE',
      `Permanent transfer completed for "${resource.title}". Handover notes: ${params.handoverNotes}`,
      req.id
    );
  }

  // Payment Simulation
  static markPaymentState(actor: User, paymentId: string, newStatus: PaymentDemo['status']) {
    dataStore.update((s) => {
      const pay = s.paymentsDemo.find((p) => p.id === paymentId);
      if (pay) {
        pay.status = newStatus;
        pay.markedBy = actor.id;
        pay.updatedAt = s.demoClock;
      }
    });

    this.logAudit(
      actor,
      'UPDATE_PAYMENT_STATE',
      'PaymentDemo',
      paymentId,
      `Payment state updated to ${newStatus} by ${actor.displayName} (Simulation only).`
    );
  }

  // Incidents
  static createIncident(
    actor: User,
    params: {
      resourceId: string;
      requestId: string;
      description: string;
      evidenceRefs: string[];
    }
  ): Incident {
    const state = dataStore.getState();
    const incId = `inc_${Date.now()}`;
    const incident: Incident = {
      id: incId,
      resourceId: params.resourceId,
      requestId: params.requestId,
      reportedBy: actor.id,
      description: params.description,
      evidenceRefs: params.evidenceRefs,
      status: 'awaiting response',
      createdAt: state.demoClock,
    };

    dataStore.update((s) => {
      s.incidents.unshift(incident);
    });

    const req = state.requests.find((r) => r.id === params.requestId);
    const resource = state.resources.find((r) => r.id === params.resourceId);

    this.logAudit(
      actor,
      'CREATE_INCIDENT',
      'Incident',
      incId,
      `Incident reported by ${actor.displayName} regarding "${resource?.title || 'Resource'}". Status: Awaiting response. Treated as allegation until reviewed.`
    );

    if (req) {
      this.notify(
        req.requesterId,
        'INCIDENT_RESPONSE_REQUESTED',
        `An incident report was filed regarding your session with ${resource?.title}. Please review the allegation and submit your statement.`,
        incId
      );
    }

    return incident;
  }

  static respondToIncident(actor: User, incidentId: string, statement: string) {
    dataStore.update((s) => {
      const inc = s.incidents.find((i) => i.id === incidentId);
      if (!inc) throw new Error('Incident not found');
      inc.response = statement;
      inc.responseAt = s.demoClock;
      inc.status = 'under review';
    });

    this.logAudit(
      actor,
      'RESPOND_TO_INCIDENT',
      'Incident',
      incidentId,
      `User ${actor.displayName} submitted response statement to incident #${incidentId}. Case is now Under Review.`
    );
  }

  static resolveIncident(
    actor: User,
    params: {
      incidentId: string;
      decision: Incident['decision'];
      decisionReason: string;
    }
  ) {
    if (actor.role !== 'owner' && actor.role !== 'supervisor' && actor.role !== 'admin') {
      throw new Error('Unauthorized: Only owners, supervisors, or admins can resolve incidents.');
    }

    let affectedUserId = '';
    dataStore.update((s) => {
      const inc = s.incidents.find((i) => i.id === params.incidentId);
      if (!inc) throw new Error('Incident not found');
      inc.status = 'resolved';
      inc.decision = params.decision;
      inc.decisionReason = params.decisionReason;
      inc.resolvedBy = actor.id;
      inc.resolvedAt = s.demoClock;

      const req = s.requests.find((r) => r.id === inc.requestId);
      if (req) {
        affectedUserId = req.requesterId;
        const user = s.users.find((u) => u.id === req.requesterId);
        if (user && params.decision === 'temporary_restriction') {
          // Set 7-day restriction
          const until = new Date(s.demoClock);
          until.setDate(until.getDate() + 7);
          user.userStanding.restrictedUntil = until.toISOString();
        }
      }
    });

    this.logAudit(
      actor,
      'RESOLVE_INCIDENT',
      'Incident',
      params.incidentId,
      `Incident resolved by ${actor.displayName} (${actor.role}). Outcome: ${params.decision}. Rationale: "${params.decisionReason}". Human review completed.`
    );

    if (affectedUserId) {
      this.notify(
        affectedUserId,
        'INCIDENT_RESOLVED',
        `Incident review completed by ${actor.displayName}. Outcome: ${params.decision}. Note: ${params.decisionReason}`,
        params.incidentId
      );
    }
  }

  // Clock Trigger Logic: Overdue, Expiries, Reminders
  static runClockTriggers(currentTimeStr: string) {
    const now = new Date(currentTimeStr);

    dataStore.update((s) => {
      // 1. Check in-use requests for overdue transition
      s.requests.forEach((req) => {
        if (req.status === 'in-use' && req.slotEnd) {
          const due = new Date(req.slotEnd);
          if (now > due) {
            req.status = 'overdue';
            const resource = s.resources.find((r) => r.id === req.resourceId);
            const user = s.users.find((u) => u.id === req.requesterId);

            // Increment late counter
            if (user) {
              user.userStanding.lateReturns += 1;
              // Check grace period (default 15 mins)
              const graceMin = resource?.policies.graceMinutes || 15;
              const graceEnd = new Date(due.getTime() + graceMin * 60 * 1000);
              if (now > graceEnd) {
                // Apply temporary restriction
                const restrictUntil = new Date(now.getTime() + 48 * 3600 * 1000);
                user.userStanding.restrictedUntil = restrictUntil.toISOString();
              }
            }

            s.notifications.unshift({
              id: `notif_ovd_${req.id}`,
              recipientId: req.requesterId,
              type: 'OVERDUE_ALERT',
              message: `URGENT: Your booking for "${resource?.title || 'equipment'}" is overdue! Please return immediately to Bay safety desk to avoid restriction.`,
              relatedRecordId: req.id,
              isDemo: true,
              createdAt: s.demoClock,
            });
          }
        }

        // 2. Pending request expiration (48 hours)
        if (req.status === 'pending-review' && req.expiresAt) {
          if (now > new Date(req.expiresAt)) {
            req.status = 'expired';
            req.decisionReasonCode = 'EXPIRED_NO_REVIEW';
            req.decisionNote = 'Request expired without owner review.';
          }
        }
      });

      // 3. Waitlist offer expiration (24 hours)
      s.waitlistEntries.forEach((wl) => {
        if (wl.status === 'offered' && wl.offerExpiresAt) {
          if (now > new Date(wl.offerExpiresAt)) {
            wl.status = 'expired';
            // Slot becomes available again or passes to next person
          }
        }
      });
    });
  }

  // Metrics
  static getMetrics() {
    const s = dataStore.getState();
    const totalResources = s.resources.length;
    const availableResources = s.resources.filter((r) => r.status === 'available').length;
    const submittedRequests = s.requests.length;
    const confirmedRequests = s.requests.filter((r) => r.status === 'confirmed' || r.status === 'in-use').length;
    const pendingRequests = s.requests.filter((r) => r.status === 'pending-review').length;
    const rejectedRequests = s.requests.filter((r) => r.status === 'rejected').length;
    const waitlistCount = s.waitlistEntries.filter((w) => w.status === 'waiting').length;
    const overdueCount = s.requests.filter((r) => r.status === 'overdue').length;
    const openIncidents = s.incidents.filter((i) => i.status !== 'resolved').length;

    // Utilisation calculation
    let bookedSlots = 0;
    let totalSlots = 0;
    s.resources.forEach((r) => {
      r.availabilitySlots.forEach((sl) => {
        totalSlots++;
        if (sl.state === 'confirmed' || sl.state === 'held') bookedSlots++;
      });
    });
    const utilisationPercent = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

    return {
      totalResources,
      availableResources,
      submittedRequests,
      confirmedRequests,
      pendingRequests,
      rejectedRequests,
      waitlistCount,
      overdueCount,
      openIncidents,
      utilisationPercent,
      bookedSlots,
      totalSlots,
    };
  }
}
