import {
  User,
  Resource,
  OwnerVerification,
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
  Slot,
} from '../types';

import {
  SEED_USERS,
  SEED_OWNER_VERIFICATIONS,
  SEED_QUIZZES,
  generateInitialSlots,
  getInitialResources,
  SEED_ELIGIBILITY_RECORDS,
  getInitialRequests,
  SEED_WAITLIST,
  SEED_HANDOVERS,
  SEED_INCIDENTS,
  SEED_PAYMENTS,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS,
  INITIAL_DEMO_TIME,
} from '../data/seedData';

const STORAGE_KEY = 'idle_to_idea_data_v1';

export interface AppState {
  currentUserId: string;
  demoClock: string; // ISO string
  users: User[];
  ownerVerifications: Record<string, OwnerVerification>;
  resources: Resource[];
  quizzes: Quiz[];
  eligibilityRecords: EligibilityRecord[];
  requests: RequestRecord[];
  waitlistEntries: WaitlistEntry[];
  handoverRecords: HandoverRecord[];
  extensionRequests: ExtensionRequest[];
  paymentsDemo: PaymentDemo[];
  incidents: Incident[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
}

export function createInitialState(): AppState {
  const initialSlots = generateInitialSlots(INITIAL_DEMO_TIME);
  const initialResources = getInitialResources(initialSlots);
  const initialRequests = getInitialRequests(initialSlots);

  return {
    currentUserId: 'user_aarav', // Default to student requester
    demoClock: INITIAL_DEMO_TIME,
    users: JSON.parse(JSON.stringify(SEED_USERS)),
    ownerVerifications: JSON.parse(JSON.stringify(SEED_OWNER_VERIFICATIONS)),
    resources: initialResources,
    quizzes: JSON.parse(JSON.stringify(SEED_QUIZZES)),
    eligibilityRecords: JSON.parse(JSON.stringify(SEED_ELIGIBILITY_RECORDS)),
    requests: initialRequests,
    waitlistEntries: JSON.parse(JSON.stringify(SEED_WAITLIST)),
    handoverRecords: JSON.parse(JSON.stringify(SEED_HANDOVERS)),
    extensionRequests: [],
    paymentsDemo: JSON.parse(JSON.stringify(SEED_PAYMENTS)),
    incidents: JSON.parse(JSON.stringify(SEED_INCIDENTS)),
    notifications: JSON.parse(JSON.stringify(SEED_NOTIFICATIONS)),
    auditLogs: JSON.parse(JSON.stringify(SEED_AUDIT_LOGS)),
  };
}

class StoreService {
  private state: AppState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadFromStorage();
  }

  private loadFromStorage(): AppState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not load IDLETOIDEA state from localStorage:', e);
    }
    return createInitialState();
  }

  public saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Could not save IDLETOIDEA state to localStorage:', e);
    }
    this.notify();
  }

  public getState(): AppState {
    return this.state;
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public resetAllData() {
    this.state = createInitialState();
    this.saveToStorage();
  }

  public update(updater: (state: AppState) => void) {
    updater(this.state);
    this.saveToStorage();
  }
}

export const dataStore = new StoreService();
