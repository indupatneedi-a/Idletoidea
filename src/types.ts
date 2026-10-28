/**
 * IDLETOIDEA (formerly UNLOCK) Data Models and Types
 * Fictional makerspace and shared-facility resource management system.
 */

export type UserRole = 'requester' | 'owner' | 'supervisor' | 'admin';

export interface UserStanding {
  lateReturns: number;
  noShows: number;
  lateCancellations: number;
  restrictedUntil: string | null;
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  organisationId: string;
  facilityId: string;
  verificationLabel: 'Demo verified' | 'Unverified owner';
  userStanding: UserStanding;
  avatarUrl: string;
  bio: string;
  createdAt: string;
}

export type OwnerVerificationState = 'self-registered' | 'spot-checked' | 'flagged' | 'suspended';

export interface OwnerVerification {
  ownerId: string;
  state: OwnerVerificationState;
  checkedBy: string | null;
  checkedAt: string | null;
  note: string;
}

export type ResourceType = 'equipment' | 'workspace';
export type PriceMode = 'free' | 'paid';
export type TransferMode = 'temporary' | 'permanent';
export type RiskLevel = 'low' | 'medium' | 'high';
export type ApprovalMode = 'auto-if-low-risk' | 'owner-review' | 'supervisor-review';
export type ListingState = 'draft' | 'pending-admin-check' | 'active' | 'paused';

export interface ResourcePolicies {
  bookingCap: number; // default 2 for high demand
  waitlistOfferHours: number; // default 24
  pendingExpiryHours: number; // default 48
  minNoticeHours: number;
  cancellationNoticeHours: number;
  noShowMinutes: number; // default 15
  repeatedNoShowThreshold: number; // e.g. 2
  simulatedCancellationFeePercent: number; // e.g. 20
  graceMinutes: number; // e.g. 30
  autoExtendEnabled: boolean;
  maxExtensionMinutes: number;
}

export interface Slot {
  id: string;
  resourceId: string;
  start: string; // ISO string
  end: string;   // ISO string
  state: 'available' | 'held' | 'confirmed' | 'blocked';
  blockReason?: string;
  bookedByRequestId?: string;
}

export interface Resource {
  id: string;
  ownerId: string;
  facilityId: string;
  organisationId: string;
  title: string;
  resourceType: ResourceType;
  category: string;
  description: string;
  photos: string[];
  location: string;
  status: 'available' | 'maintenance' | 'paused';
  priceMode: PriceMode;
  transferMode: TransferMode;
  price: number;
  priceUnit?: string;
  riskLevel: RiskLevel;
  trainingRequired: boolean;
  quizId?: string;
  supervisedAccess: boolean;
  allowedUsers: string;
  safetyNotes: string;
  ppe: string[];
  prohibitedUses: string;
  conditionSummary: string;
  accessories: string[];
  collectionPoint: string;
  setupNotes: string;
  returnInstructions: string;
  approvalMode: ApprovalMode;
  highDemand: boolean;
  policies: ResourcePolicies;
  availabilitySlots: Slot[];
  assignedSupervisorIds: string[];
  listingState: ListingState;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  resourceId: string;
  title: string;
  questions: QuizQuestion[];
  passMark: number; // e.g., 80
  maxAttemptsPerDay: number; // e.g., 3
}

export type EligibilityStatus = 
  | 'not started' 
  | 'passed' 
  | 'failed' 
  | 'awaiting supervisor' 
  | 'approved' 
  | 'rejected' 
  | 'expired';

export interface EligibilityRecord {
  id: string;
  userId: string;
  resourceId: string;
  quizScore: number;
  attemptsToday: number;
  lastAttemptAt?: string;
  status: EligibilityStatus;
  approvedBy?: string;
  approvedAt?: string;
  expiresAt?: string;
}

export type RequestType = 'borrow' | 'rent' | 'giveaway' | 'sale';

export type BookingStatus =
  | 'draft'
  | 'pending-review'
  | 'waitlisted'
  | 'offered'
  | 'confirmed'
  | 'in-use'
  | 'returned'
  | 'rejected'
  | 'cancelled'
  | 'expired'
  | 'overdue'
  | 'transfer-complete';

export interface RequestRecord {
  id: string;
  resourceId: string;
  requesterId: string;
  requestType: RequestType;
  slotId?: string;
  slotStart?: string;
  slotEnd?: string;
  transferTerms?: string;
  status: BookingStatus;
  eligibilitySnapshot: {
    trainingPassed: boolean;
    supervisorApproved: boolean;
    standingOk: boolean;
    capOk: boolean;
  };
  message: string;
  createdAt: string;
  decisionBy?: string;
  decisionAt?: string;
  decisionReasonCode?: string;
  decisionNote?: string;
  expiresAt?: string;
}

export interface WaitlistEntry {
  id: string;
  resourceId: string;
  slotId: string;
  userId: string;
  joinedAt: string;
  status: 'waiting' | 'offered' | 'accepted' | 'expired' | 'left';
  offerExpiresAt?: string;
  originalRequestId?: string;
}

export interface HandoverRecord {
  id: string;
  requestId: string;
  checkoutAt?: string;
  checkoutBy?: string;
  beforeCondition?: string;
  beforePhotos?: string[];
  accessoriesChecked: string[];
  dueAt?: string;
  returnedAt?: string;
  returnedRecordedBy?: string;
  returnCondition?: string;
  returnPhotos?: string[];
  accessoriesReturned: string[];
  reportedIssues?: string;
}

export interface ExtensionRequest {
  id: string;
  requestId: string;
  requestedMinutes: number;
  status: 'pending' | 'approved' | 'rejected';
  decidedBy?: string;
  reasonCode?: string;
  createdAt: string;
}

export type PaymentStatus = 'not-required' | 'pending' | 'marked-as-paid' | 'cancelled' | 'refunded-simulated';

export interface PaymentDemo {
  id: string;
  requestId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  simulationLabel: string;
  markedBy?: string;
  updatedAt: string;
}

export type IncidentStatus = 'open' | 'awaiting response' | 'under review' | 'resolved';

export interface IncidentAISummary {
  reportedAllegations: string[];
  verifiedFacts: string[];
  missingInformation: string[];
  timeline: string[];
  generatedAt: string;
  editedBy?: string;
}

export interface Incident {
  id: string;
  resourceId: string;
  requestId: string;
  reportedBy: string;
  description: string;
  evidenceRefs: string[];
  status: IncidentStatus;
  response?: string;
  responseAt?: string;
  aiSummary?: IncidentAISummary;
  decision?: 'no_action' | 'warning' | 'temporary_restriction' | 'repair_fee_simulated';
  decisionReason?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  type: string;
  message: string;
  relatedRecordId?: string;
  isDemo: boolean;
  readAt?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  reasonCode?: string;
  summary: string;
  timestamp: string;
}

export interface DecisionReason {
  code: string;
  text: string;
  ruleReference: string;
}
