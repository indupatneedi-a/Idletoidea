import {
  User,
  Resource,
  Quiz,
  EligibilityRecord,
  RequestRecord,
  WaitlistEntry,
  HandoverRecord,
  PaymentDemo,
  Incident,
  NotificationItem,
  AuditLogItem,
  OwnerVerification,
  Slot,
} from '../types';

export const SEEDED_FACILITY = {
  id: 'fac_demo_lab',
  name: 'Demo Innovation Lab (fictional)',
  organisationId: 'org_demo_inst',
  organisationName: 'Demo Institution (fictional)',
};

export const INITIAL_DEMO_TIME = '2026-10-28T10:00:00.000Z';

export const SEED_USERS: User[] = [
  {
    id: 'user_aarav',
    displayName: 'Aarav Rao',
    email: 'aarav.rao@demo-inst.edu',
    role: 'requester',
    organisationId: SEEDED_FACILITY.organisationId,
    facilityId: SEEDED_FACILITY.id,
    verificationLabel: 'Demo verified',
    userStanding: { lateReturns: 0, noShows: 0, lateCancellations: 0, restrictedUntil: null },
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    bio: 'Mechanical Engineering Student (Year 3). Building an aerodynamic drone frame for my capstone.',
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'user_meera',
    displayName: 'Meera Nair',
    email: 'meera.nair@inventor-net.org',
    role: 'requester',
    organisationId: SEEDED_FACILITY.organisationId,
    facilityId: SEEDED_FACILITY.id,
    verificationLabel: 'Demo verified',
    userStanding: { lateReturns: 0, noShows: 0, lateCancellations: 0, restrictedUntil: null },
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Independent Robotics Inventor. Prototyping bionic prosthetic grips. Passed 3D printing safety training.',
    createdAt: '2026-09-05T09:30:00.000Z',
  },
  {
    id: 'user_kabir',
    displayName: 'Kabir Shah',
    email: 'kabir@quickproto.tech',
    role: 'requester',
    organisationId: SEEDED_FACILITY.organisationId,
    facilityId: SEEDED_FACILITY.id,
    verificationLabel: 'Demo verified',
    userStanding: { lateReturns: 0, noShows: 0, lateCancellations: 0, restrictedUntil: null },
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Startup Founder at QuickProto. Holds scheduled 3D print session tomorrow 10:00 AM.',
    createdAt: '2026-09-10T11:00:00.000Z',
  },
  {
    id: 'user_rhea',
    displayName: 'Dr. Rhea Kapoor',
    email: 'rhea.kapoor@demo-inst.edu',
    role: 'owner',
    organisationId: SEEDED_FACILITY.organisationId,
    facilityId: SEEDED_FACILITY.id,
    verificationLabel: 'Demo verified',
    userStanding: { lateReturns: 0, noShows: 0, lateCancellations: 0, restrictedUntil: null },
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Head of Advanced Fabrication & Rapid Prototyping Lab. Owner of 3D printing and bench workspace assets.',
    createdAt: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'user_sam',
    displayName: 'Sam Iyer',
    email: 'sam.iyer@demo-inst.edu',
    role: 'supervisor',
    organisationId: SEEDED_FACILITY.organisationId,
    facilityId: SEEDED_FACILITY.id,
    verificationLabel: 'Demo verified',
    userStanding: { lateReturns: 0, noShows: 0, lateCancellations: 0, restrictedUntil: null },
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Certified Lab Safety Officer & Supervisor. Oversees high-risk laser cutting and industrial 3D printing access.',
    createdAt: '2026-08-10T08:00:00.000Z',
  },
  {
    id: 'user_nisha',
    displayName: 'Nisha Verma',
    email: 'nisha.verma@demo-inst.edu',
    role: 'admin',
    organisationId: SEEDED_FACILITY.organisationId,
    facilityId: SEEDED_FACILITY.id,
    verificationLabel: 'Demo verified',
    userStanding: { lateReturns: 0, noShows: 0, lateCancellations: 0, restrictedUntil: null },
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    bio: 'Platform Administrator. Responsible for owner spot-checks, policy audits, escalations, and system integrity.',
    createdAt: '2026-07-15T08:00:00.000Z',
  },
  {
    id: 'user_dev',
    displayName: 'Dev Menon',
    email: 'dev.menon@external-makers.org',
    role: 'owner',
    organisationId: SEEDED_FACILITY.organisationId,
    facilityId: SEEDED_FACILITY.id,
    verificationLabel: 'Unverified owner',
    userStanding: { lateReturns: 0, noShows: 0, lateCancellations: 0, restrictedUntil: null },
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    bio: 'Self-registered resource owner. Subject to admin spot-checks for high-risk equipment listings.',
    createdAt: '2026-10-20T14:00:00.000Z',
  },
];

export const SEED_OWNER_VERIFICATIONS: Record<string, OwnerVerification> = {
  user_rhea: {
    ownerId: 'user_rhea',
    state: 'spot-checked',
    checkedBy: 'user_nisha',
    checkedAt: '2026-08-15T10:00:00.000Z',
    note: 'Verified faculty lab manager credentials and safety certifications.',
  },
  user_dev: {
    ownerId: 'user_dev',
    state: 'self-registered',
    checkedBy: null,
    checkedAt: null,
    note: 'Pending admin spot-check. High-risk listings require admin review prior to publishing.',
  },
};

export const SEED_QUIZZES: Quiz[] = [
  {
    id: 'quiz_3d_printer',
    resourceId: 'res_3d_printer',
    title: '3D Printer Safety & Operation Certification',
    passMark: 80,
    maxAttemptsPerDay: 3,
    questions: [
      {
        id: 'q1',
        text: 'What should you do if a 3D print fails mid-job and the brass nozzle is at 215°C?',
        options: [
          'Grab the hot filament clump immediately by hand before it cools',
          'Wait for the hotend to cool below 50°C or use heat-resistant tweezers/tools',
          'Increase the nozzle temperature to 300°C to burn away excess plastic',
          'Turn off the power switch while the nozzle is cooling down, stopping the heatsink fan',
        ],
        correctIndex: 1,
        explanation: 'Touching hot nozzles causes severe burns. Always let it cool or use heat-safe tools. Never cut power while hot as heatsink fans prevent heat creep.',
      },
      {
        id: 'q2',
        text: 'Why is it mandatory to remain in the makerspace during the first 3 layers of a print?',
        options: [
          'To continuously manually push the filament spool',
          'Most adhesion failures occur during initial layers and can damage the print head or create plastic blobs',
          'The bed heater only turns on if a human is detected in the room',
          'It is not mandatory; you can start and leave immediately',
        ],
        correctIndex: 1,
        explanation: 'First-layer adhesion is critical. Dislodged prints quickly wrap around the hotend and create dangerous blobs.',
      },
      {
        id: 'q3',
        text: 'What is the correct protocol before scraping parts off the flexible PEI spring-steel build plate?',
        options: [
          'Use a steel hammer to wedge the scraper directly into the coating',
          'Wait until the bed cools to room temperature, remove the flexible sheet, and gently flex it',
          'Pour cold water directly onto the 60°C heated bed',
          'Scrape vigorously with a razor blade while the bed is vacuum locked',
        ],
        correctIndex: 1,
        explanation: 'Letting the PEI plate cool causes parts to release naturally. Gentle flexing frees the part without scratching the surface.',
      },
      {
        id: 'q4',
        text: 'Which filament material produces toxic fumes (styrene) requiring dedicated negative-pressure enclosure ventilation?',
        options: [
          'Standard PLA (Polylactic Acid)',
          'ABS (Acrylonitrile Butadiene Styrene)',
          'PETG (Polyethylene Terephthalate Glycol)',
          'TPU (Thermoplastic Polyurethane)',
        ],
        correctIndex: 1,
        explanation: 'ABS releases toxic styrene fumes and ultra-fine particles, requiring active filtration or dedicated ducted ventilation.',
      },
      {
        id: 'q5',
        text: 'If your print job exceeds your booked time slot, what must you do according to makerspace policy?',
        options: [
          'Let it run unattended into the next user’s booking without notice',
          'Cancel the job, calibrate file print times beforehand, or request an extension before the slot ends if available',
          'Lock the makerspace door so other users cannot enter',
          'Unplug the machine mid-print',
        ],
        correctIndex: 1,
        explanation: 'Unattended overruns violate fair access rules. Users must preview sliced print times accurately and book sufficient slots.',
      },
    ],
  },
  {
    id: 'quiz_laser_cutter',
    resourceId: 'res_laser_cutter',
    title: 'High-Power CO2 Laser Cutter & Ventilation Safety',
    passMark: 80,
    maxAttemptsPerDay: 3,
    questions: [
      {
        id: 'q1',
        text: 'Which of the following materials is STRICTLY PROHIBITED in the CO2 laser cutter due to corrosive toxic chlorine gas emission?',
        options: [
          'Birch plywood (3mm)',
          'Cast acrylic (PMMA)',
          'PVC / Vinyl (Polyvinyl Chloride)',
          'Natural cardboard',
        ],
        correctIndex: 2,
        explanation: 'Cutting PVC releases hydrochloric acid gas (HCl) and dioxins, which destroys optical lenses, rusts steel frames, and causes pulmonary damage.',
      },
      {
        id: 'q2',
        text: 'What eye protection is required when operating or observing the high-power CO2 laser cutter?',
        options: [
          'Standard sunglasses or tinted glasses',
          'Certified OD 5+ safety glasses rated for 10.6 µm wavelength with side shields',
          'Reading glasses with anti-glare coating',
          'No eye protection is necessary if the lid has an acrylic window',
        ],
        correctIndex: 1,
        explanation: 'CO2 lasers emit invisible infrared radiation at 10,600 nm. Certified optical density (OD) glasses prevent permanent corneal burns.',
      },
      {
        id: 'q3',
        text: 'Before pressing "Start" on a laser job, which auxiliary systems must be verified active?',
        options: [
          'Exhaust ventilation blower and air-assist compressor with chiller flow at 18-22°C',
          'Room ceiling lighting and FM radio',
          'Only the internal USB drive connection',
          'The 3D printer bed heater',
        ],
        correctIndex: 0,
        explanation: 'Exhaust blower extracts combustible vapors, air assist suppresses flames at the focal point, and the chiller protects the laser tube from cracking.',
      },
      {
        id: 'q4',
        text: 'If a sustained flame ignites on the honeycomb bed that air-assist cannot extinguish, what is the immediate action?',
        options: [
          'Open the lid wide and blow on the flame with your mouth',
          'Hit the Emergency Stop (E-Stop), keep lid closed briefly to starve oxygen, and use the CO2 fire extinguisher if fire spreads',
          'Run out of the room without alerting anyone',
          'Increase laser power to 100% to burn through the material faster',
        ],
        correctIndex: 1,
        explanation: 'Hitting E-Stop halts the beam and moves the carriage away. Keeping lid closed starves oxygen; use the nearby CO2 extinguisher if needed.',
      },
      {
        id: 'q5',
        text: 'Why does high-risk equipment like the CO2 Laser Cutter require supervisor approval in addition to passing this quiz?',
        options: [
          'Because the supervisor collects cash directly',
          'Passing the theory quiz demonstrates knowledge, but an authorised supervisor must verify physical hands-on competence and focal calibration',
          'To slow down student projects',
          'Because high-risk machines are only available on weekends',
        ],
        correctIndex: 1,
        explanation: 'High-risk tools have severe physical hazard potential. Supervised hands-on verification guarantees safe physical setup and focus gauge use.',
      },
    ],
  },
];

export function generateInitialSlots(baseDateStr: string = INITIAL_DEMO_TIME): Record<string, Slot[]> {
  const baseDate = new Date(baseDateStr);
  const slots: Record<string, Slot[]> = {};

  // For 3D printer: 7 days, 9am - 5pm, 1-hour slots
  const printerSlots: Slot[] = [];
  for (let d = 0; d < 5; d++) {
    const dayDate = new Date(baseDate);
    dayDate.setUTCDate(baseDate.getUTCDate() + d);

    for (let h = 9; h < 17; h++) {
      const start = new Date(dayDate);
      start.setUTCHours(h, 0, 0, 0);
      const end = new Date(dayDate);
      end.setUTCHours(h + 1, 0, 0, 0);

      const slotId = `slot_3d_d${d}_h${h}`;
      // Kabir holds day 1, 10:00 (tomorrow 10:00)
      const isKabirTomorrow = d === 1 && h === 10;

      printerSlots.push({
        id: slotId,
        resourceId: 'res_3d_printer',
        start: start.toISOString(),
        end: end.toISOString(),
        state: isKabirTomorrow ? 'confirmed' : 'available',
        bookedByRequestId: isKabirTomorrow ? 'req_seeded_kabir' : undefined,
      });
    }
  }
  slots['res_3d_printer'] = printerSlots;

  // For Laser cutter: 5 days, 10am - 4pm, 1-hour slots
  const laserSlots: Slot[] = [];
  for (let d = 0; d < 5; d++) {
    const dayDate = new Date(baseDate);
    dayDate.setUTCDate(baseDate.getUTCDate() + d);

    for (let h = 10; h < 16; h++) {
      const start = new Date(dayDate);
      start.setUTCHours(h, 0, 0, 0);
      const end = new Date(dayDate);
      end.setUTCHours(h + 1, 0, 0, 0);

      const slotId = `slot_laser_d${d}_h${h}`;
      // Tomorrow 14:00 is blocked for maintenance
      const isMaint = d === 1 && h === 14;

      laserSlots.push({
        id: slotId,
        resourceId: 'res_laser_cutter',
        start: start.toISOString(),
        end: end.toISOString(),
        state: isMaint ? 'blocked' : 'available',
        blockReason: isMaint ? 'Scheduled optical lens recalibration and chiller filter replacement' : undefined,
      });
    }
  }
  slots['res_laser_cutter'] = laserSlots;

  // For Project Bench Room: 5 days, 9am - 6pm (2-hour slots)
  const benchSlots: Slot[] = [];
  for (let d = 0; d < 5; d++) {
    const dayDate = new Date(baseDate);
    dayDate.setUTCDate(baseDate.getUTCDate() + d);

    for (let h = 9; h < 17; h += 2) {
      const start = new Date(dayDate);
      start.setUTCHours(h, 0, 0, 0);
      const end = new Date(dayDate);
      end.setUTCHours(h + 2, 0, 0, 0);

      benchSlots.push({
        id: `slot_bench_d${d}_h${h}`,
        resourceId: 'res_bench_room',
        start: start.toISOString(),
        end: end.toISOString(),
        state: 'available',
      });
    }
  }
  slots['res_bench_room'] = benchSlots;

  return slots;
}

export function getInitialResources(slotsMap: Record<string, Slot[]>): Resource[] {
  return [
    {
      id: 'res_3d_printer',
      ownerId: 'user_rhea',
      facilityId: SEEDED_FACILITY.id,
      organisationId: SEEDED_FACILITY.organisationId,
      title: 'Demo 3D Printer (FDM Pro)',
      resourceType: 'equipment',
      category: '3D Printing & Additive',
      description: 'Precision dual-extrusion FDM 3D printer with 300x300x400mm build volume. Heated PEI bed, direct drive extruder, suitable for PLA, PETG, TPU, and ABS with filtration.',
      photos: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1631553127989-532454f0a2e5?w=800&auto=format&fit=crop&q=80',
      ],
      location: 'Makerspace Bay 3 - Prototyping Zone',
      status: 'available',
      priceMode: 'free',
      transferMode: 'temporary',
      price: 0,
      riskLevel: 'medium',
      trainingRequired: true,
      quizId: 'quiz_3d_printer',
      supervisedAccess: false,
      allowedUsers: 'Enrolled students, researchers, verified innovators with passed safety quiz',
      safetyNotes: 'Hot surfaces up to 260°C. Never touch nozzle or bed during operation. Ensure room ventilation is switched on.',
      ppe: ['Heat-resistant gloves (during maintenance)', 'Closed-toe shoes'],
      prohibitedUses: 'Unattended overnight prints exceeding booked window; toxic resins or unauthorized unlisted filaments',
      conditionSummary: 'Good condition. 0.4mm brass nozzle recently replaced, bed leveled and calibrated yesterday.',
      accessories: ['PEI spring steel sheet', '0.4mm nozzle tool kit', 'Digital caliper', 'Heat-resistant tweezers', 'Filament dry-box'],
      collectionPoint: 'Bay 3 Equipment Desk. Check-in with Lab Assistant.',
      setupNotes: 'Slice model using PrusaSlicer/OrcaSlicer with IDLETOIDEA profile on the lab workstation.',
      returnInstructions: 'Scrape build plate clean, remove filament from feeder, vacuum skirt fragments, wipe bed with 70% IPA.',
      approvalMode: 'supervisor-review',
      highDemand: true,
      policies: {
        bookingCap: 2,
        waitlistOfferHours: 24,
        pendingExpiryHours: 48,
        minNoticeHours: 1,
        cancellationNoticeHours: 2,
        noShowMinutes: 15,
        repeatedNoShowThreshold: 2,
        simulatedCancellationFeePercent: 0,
        graceMinutes: 15,
        autoExtendEnabled: true,
        maxExtensionMinutes: 60,
      },
      availabilitySlots: slotsMap['res_3d_printer'] || [],
      assignedSupervisorIds: ['user_sam'],
      listingState: 'active',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 'res_laser_cutter',
      ownerId: 'user_rhea',
      facilityId: SEEDED_FACILITY.id,
      organisationId: SEEDED_FACILITY.organisationId,
      title: 'Demo Industrial Laser Cutter (100W CO2)',
      resourceType: 'equipment',
      category: 'Fabrication & CNC',
      description: 'Industrial 100W CO2 laser cutting and engraving system with 900x600mm honeycomb bed. Capable of cutting up to 10mm acrylic and 8mm birch plywood with motorized autofocus.',
      photos: [
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
      ],
      location: 'Makerspace Bay 1 - Heavy Fabrication Chamber',
      status: 'available',
      priceMode: 'free',
      transferMode: 'temporary',
      price: 0,
      riskLevel: 'high',
      trainingRequired: true,
      quizId: 'quiz_laser_cutter',
      supervisedAccess: true,
      allowedUsers: 'Users who passed theory quiz AND received in-person supervisor sign-off',
      safetyNotes: 'High-risk Class 4 laser hazard. Severe fire and toxic gas risk. NEVER leave machine operating unattended for even a single second.',
      ppe: ['Certified OD 5+ laser goggles (10.6 µm)', 'Safety glasses', 'Closed-toe shoes'],
      prohibitedUses: 'PVC, Vinyl, Teflon, ABS, Carbon fiber, mirrored surfaces, materials of unknown composition',
      conditionSummary: 'Excellent. Optics cleaned weekly, chiller maintained at 19°C, honeycomb bed free of heavy debris.',
      accessories: ['Autofocus height gauge', 'Honeycomb pin clamps', 'Rotary attachment (available on request)', 'Lens wipe kit'],
      collectionPoint: 'Bay 1 Safety Office. Supervisor Sam Iyer must verify checklist before laser key is issued.',
      setupNotes: 'Design file must be pre-formatted in LightBurn / DXF with red (cut) and blue (engrave) vector layers.',
      returnInstructions: 'Vacuum cutting bay honeycomb tray, empty scrap drawer, inspect mirrors with supervisor, log laser tube hours.',
      approvalMode: 'supervisor-review',
      highDemand: true,
      policies: {
        bookingCap: 1,
        waitlistOfferHours: 24,
        pendingExpiryHours: 48,
        minNoticeHours: 4,
        cancellationNoticeHours: 4,
        noShowMinutes: 15,
        repeatedNoShowThreshold: 1,
        simulatedCancellationFeePercent: 0,
        graceMinutes: 10,
        autoExtendEnabled: false,
        maxExtensionMinutes: 0,
      },
      availabilitySlots: slotsMap['res_laser_cutter'] || [],
      assignedSupervisorIds: ['user_sam'],
      listingState: 'active',
      createdAt: '2026-09-02T08:00:00.000Z',
    },
    {
      id: 'res_bench_room',
      ownerId: 'user_rhea',
      facilityId: SEEDED_FACILITY.id,
      organisationId: SEEDED_FACILITY.organisationId,
      title: 'Project Bench Room (Collab Suite B)',
      resourceType: 'workspace',
      category: 'Workspaces & Assembly',
      description: 'Dedicated hardware assembly room with antistatic ESD workbench, soldering stations, fume extractors, variable DC power supply, and 55" display for team review.',
      photos: [
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80',
      ],
      location: 'Innovation Wing 2nd Floor, Room 204',
      status: 'available',
      priceMode: 'paid',
      transferMode: 'temporary',
      price: 150,
      priceUnit: '/ hour (simulated fee)',
      riskLevel: 'low',
      trainingRequired: false,
      supervisedAccess: false,
      allowedUsers: 'Project teams, student inventors, startup founders',
      safetyNotes: 'Turn off soldering irons and power supplies before leaving. Wash hands after handling solder flux.',
      ppe: ['Antistatic wrist strap (provided)'],
      prohibitedUses: 'Heavy grinding, spray painting, unventilated chemical casting',
      conditionSummary: 'Pristine. Dual Hakko soldering stations calibrated, whiteboard markers replenished.',
      accessories: ['Dual Hakko FX-888D soldering stations', 'Rigol 30V/3A DC bench power supply', 'Antistatic mats', '55" HDMI monitor', 'Whiteboard'],
      collectionPoint: 'Room 204 Keypad (Access code provided in confirmed booking notification).',
      setupNotes: 'Plug equipment into designated surge-protected overhead reels.',
      returnInstructions: 'Clean bench tops, return test leads to wall rack, unplug irons, ensure door clicks locked.',
      approvalMode: 'auto-if-low-risk',
      highDemand: false,
      policies: {
        bookingCap: 3,
        waitlistOfferHours: 24,
        pendingExpiryHours: 48,
        minNoticeHours: 1,
        cancellationNoticeHours: 24,
        noShowMinutes: 20,
        repeatedNoShowThreshold: 2,
        simulatedCancellationFeePercent: 20,
        graceMinutes: 20,
        autoExtendEnabled: true,
        maxExtensionMinutes: 120,
      },
      availabilitySlots: slotsMap['res_bench_room'] || [],
      assignedSupervisorIds: ['user_sam'],
      listingState: 'active',
      createdAt: '2026-09-03T08:00:00.000Z',
    },
    {
      id: 'res_hand_tools',
      ownerId: 'user_rhea',
      facilityId: SEEDED_FACILITY.id,
      organisationId: SEEDED_FACILITY.organisationId,
      title: 'Precision Hand Tool Set (Makerspace Surplus)',
      resourceType: 'equipment',
      category: 'Hand Tools & Hardware',
      description: 'Full 48-piece electronics hand tool set including micro-cutters, torque hex drivers, crimping pliers, wire strippers, and ESD tweezers in a rugged canvas roll.',
      photos: [
        'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&auto=format&fit=crop&q=80',
      ],
      location: 'Makerspace Tool Crib - Locker 12',
      status: 'available',
      priceMode: 'free',
      transferMode: 'permanent',
      price: 0,
      riskLevel: 'low',
      trainingRequired: false,
      supervisedAccess: false,
      allowedUsers: 'Anyone with an active student/inventor profile seeking permanent transfer for verified project work',
      safetyNotes: 'Sharp blades and cutters. Always cut away from the body.',
      ppe: ['Standard safety eyewear recommended'],
      prohibitedUses: 'Resale or commercial liquidation without project use',
      conditionSummary: 'Surplus set in excellent condition. Lightly used during last semester electronics lab.',
      accessories: ['Rugged canvas tool roll', '48 tool bits and driver handles'],
      collectionPoint: 'Makerspace Tool Crib during open lab hours (Mon-Fri 10am-4pm).',
      setupNotes: 'No setup required; self-contained set.',
      returnInstructions: 'Permanent transfer giveaway; no return required. Handover record logged upon transfer.',
      approvalMode: 'owner-review',
      highDemand: false,
      policies: {
        bookingCap: 1,
        waitlistOfferHours: 48,
        pendingExpiryHours: 72,
        minNoticeHours: 0,
        cancellationNoticeHours: 12,
        noShowMinutes: 60,
        repeatedNoShowThreshold: 2,
        simulatedCancellationFeePercent: 0,
        graceMinutes: 0,
        autoExtendEnabled: false,
        maxExtensionMinutes: 0,
      },
      availabilitySlots: [],
      assignedSupervisorIds: [],
      listingState: 'active',
      createdAt: '2026-09-04T08:00:00.000Z',
    },
    {
      id: 'res_oscilloscope',
      ownerId: 'user_dev',
      facilityId: SEEDED_FACILITY.id,
      organisationId: SEEDED_FACILITY.organisationId,
      title: 'Surplus Digital Storage Oscilloscope (100MHz 4-CH)',
      resourceType: 'equipment',
      category: 'Electronics & Test Equipment',
      description: 'Benchtop 100MHz 4-channel digital oscilloscope with 1GSa/s real-time sampling, 7" TFT color screen, and USB waveform logging. Decommissioned from upgraded lab.',
      photos: [
        'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&auto=format&fit=crop&q=80',
      ],
      location: 'Electronics Lab Storage B, Shelf 4',
      status: 'available',
      priceMode: 'paid',
      transferMode: 'permanent',
      price: 4500,
      priceUnit: '(simulated sale price in INR)',
      riskLevel: 'low',
      trainingRequired: false,
      supervisedAccess: false,
      allowedUsers: 'Student innovators, hardware startups seeking permanent equipment purchase',
      safetyNotes: 'High voltage caution when probing mains-connected circuits. Always use 10x attenuated probes.',
      ppe: ['ESD precautions when handling internal boards'],
      prohibitedUses: 'Uncalibrated measurement on lethal voltage (>300V CAT II)',
      conditionSummary: 'Fully functional. All 4 channels tested with 1kHz calibration square wave. Minor cosmetic scuffs on casing.',
      accessories: ['4x 100MHz passive probes', 'IEC power cord', 'USB host cable', 'BNC-to-Alligator cable'],
      collectionPoint: 'Makerspace Front Office. Handover verified by Owner Dev Menon.',
      setupNotes: 'Plug in and allow 15 minutes warmup for thermal ADC stabilization.',
      returnInstructions: 'Permanent transfer sale; no return required. Transfer complete upon handover and simulated payment confirmation.',
      approvalMode: 'owner-review',
      highDemand: false,
      policies: {
        bookingCap: 1,
        waitlistOfferHours: 24,
        pendingExpiryHours: 48,
        minNoticeHours: 2,
        cancellationNoticeHours: 12,
        noShowMinutes: 60,
        repeatedNoShowThreshold: 2,
        simulatedCancellationFeePercent: 0,
        graceMinutes: 0,
        autoExtendEnabled: false,
        maxExtensionMinutes: 0,
      },
      availabilitySlots: [],
      assignedSupervisorIds: [],
      listingState: 'active',
      createdAt: '2026-09-05T08:00:00.000Z',
    },
  ];
}

export const SEED_ELIGIBILITY_RECORDS: EligibilityRecord[] = [
  {
    id: 'elig_meera_3d',
    userId: 'user_meera',
    resourceId: 'res_3d_printer',
    quizScore: 100,
    attemptsToday: 1,
    lastAttemptAt: '2026-10-15T14:20:00.000Z',
    status: 'approved',
    approvedBy: 'user_sam',
    approvedAt: '2026-10-15T14:30:00.000Z',
    expiresAt: '2027-10-15T14:30:00.000Z',
  },
  {
    id: 'elig_kabir_3d',
    userId: 'user_kabir',
    resourceId: 'res_3d_printer',
    quizScore: 80,
    attemptsToday: 1,
    lastAttemptAt: '2026-10-20T10:00:00.000Z',
    status: 'approved',
    approvedBy: 'user_sam',
    approvedAt: '2026-10-20T10:15:00.000Z',
    expiresAt: '2027-10-20T10:15:00.000Z',
  },
];

export function getInitialRequests(slotsMap: Record<string, Slot[]>): RequestRecord[] {
  const tomorrowKabirSlot = (slotsMap['res_3d_printer'] || []).find((s) => s.id === 'slot_3d_d1_h10');

  return [
    // Past completed request by Meera with open incident
    {
      id: 'req_past_meera_3d',
      resourceId: 'res_3d_printer',
      requesterId: 'user_meera',
      requestType: 'borrow',
      slotId: 'slot_past_meera',
      slotStart: '2026-10-26T14:00:00.000Z',
      slotEnd: '2026-10-26T15:00:00.000Z',
      status: 'returned',
      eligibilitySnapshot: {
        trainingPassed: true,
        supervisorApproved: true,
        standingOk: true,
        capOk: true,
      },
      message: 'Printing bionic prosthetic finger joint prototype in PETG filament.',
      createdAt: '2026-10-25T09:00:00.000Z',
      decisionBy: 'user_sam',
      decisionAt: '2026-10-25T10:00:00.000Z',
      decisionReasonCode: 'APPROVED_ELIGIBLE',
      decisionNote: 'Training verified and slot free; approved by Supervisor Sam Iyer.',
    },
    // Confirmed request tomorrow by Kabir
    {
      id: 'req_seeded_kabir',
      resourceId: 'res_3d_printer',
      requesterId: 'user_kabir',
      requestType: 'borrow',
      slotId: tomorrowKabirSlot ? tomorrowKabirSlot.id : 'slot_3d_d1_h10',
      slotStart: tomorrowKabirSlot?.start || '2026-10-29T10:00:00.000Z',
      slotEnd: tomorrowKabirSlot?.end || '2026-10-29T11:00:00.000Z',
      status: 'confirmed',
      eligibilitySnapshot: {
        trainingPassed: true,
        supervisorApproved: true,
        standingOk: true,
        capOk: true,
      },
      message: 'High-precision test enclosure fitment for QuickProto demo.',
      createdAt: '2026-10-27T11:00:00.000Z',
      decisionBy: 'user_sam',
      decisionAt: '2026-10-27T11:30:00.000Z',
      decisionReasonCode: 'APPROVED_ELIGIBLE',
      decisionNote: 'Slot reserved; training requirements satisfied.',
    },
  ];
}

export const SEED_WAITLIST: WaitlistEntry[] = [
  {
    id: 'wl_meera_kabir_slot',
    resourceId: 'res_3d_printer',
    slotId: 'slot_3d_d1_h10',
    userId: 'user_meera',
    joinedAt: '2026-10-27T12:00:00.000Z',
    status: 'waiting',
    originalRequestId: 'req_wl_meera',
  },
];

export const SEED_HANDOVERS: HandoverRecord[] = [
  {
    id: 'handover_past_meera',
    requestId: 'req_past_meera_3d',
    checkoutAt: '2026-10-26T14:02:00.000Z',
    checkoutBy: 'user_sam',
    beforeCondition: 'Clean PEI sheet, pristine smooth surface, nozzle clean, 0.4mm calibrated.',
    beforePhotos: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80'],
    accessoriesChecked: ['PEI spring steel sheet', '0.4mm nozzle tool kit', 'Digital caliper', 'Heat-resistant tweezers'],
    dueAt: '2026-10-26T15:00:00.000Z',
    returnedAt: '2026-10-26T15:04:00.000Z',
    returnedRecordedBy: 'user_sam',
    returnCondition: 'Print completed. Noticeable hairline scratch on center of PEI sheet from metal spatula; slight bend on sheet corner.',
    returnPhotos: ['https://images.unsplash.com/photo-1631553127989-532454f0a2e5?w=400&auto=format&fit=crop&q=80'],
    accessoriesReturned: ['PEI spring steel sheet', '0.4mm nozzle tool kit', 'Digital caliper', 'Heat-resistant tweezers'],
    reportedIssues: 'Build plate surface scratch noted during checkout inspection.',
  },
];

export const SEED_INCIDENTS: Incident[] = [
  {
    id: 'inc_past_meera_plate',
    resourceId: 'res_3d_printer',
    requestId: 'req_past_meera_3d',
    reportedBy: 'user_rhea',
    description: 'Owner inspection found a bend on the flexible PEI build plate corner and a deep scratch across the central print zone, likely caused by removing the print before the bed cooled.',
    evidenceRefs: [
      'Checkout log: clean PEI sheet at 14:02',
      'Return log: hairline scratch and bent corner noted by Supervisor Sam at 15:04',
      'Photo of bed scratches logged in system records',
    ],
    status: 'awaiting response',
    response: '',
    createdAt: '2026-10-26T16:00:00.000Z',
  },
];

export const SEED_PAYMENTS: PaymentDemo[] = [
  {
    id: 'pay_bench_demo',
    requestId: 'req_seeded_bench',
    amount: 300,
    currency: 'INR',
    status: 'pending',
    simulationLabel: 'Simulation only. No real money is moved.',
    updatedAt: '2026-10-28T09:00:00.000Z',
  },
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    recipientId: 'user_meera',
    type: 'INCIDENT_OPENED',
    message: 'An incident report regarding build plate condition on 3D Printer was opened for your session. Please provide your perspective.',
    relatedRecordId: 'inc_past_meera_plate',
    isDemo: true,
    createdAt: '2026-10-26T16:05:00.000Z',
  },
  {
    id: 'notif_2',
    recipientId: 'user_meera',
    type: 'WAITLIST_POSITION',
    message: 'You are #1 on the waitlist for Demo 3D Printer (Slot: Tomorrow 10:00 AM). You will be notified instantly if the slot frees up.',
    relatedRecordId: 'wl_meera_kabir_slot',
    isDemo: true,
    createdAt: '2026-10-27T12:00:00.000Z',
  },
  {
    id: 'notif_3',
    recipientId: 'user_kabir',
    type: 'BOOKING_REMINDER',
    message: 'Upcoming booking reminder: Demo 3D Printer session starts tomorrow at 10:00 AM in Bay 3.',
    relatedRecordId: 'req_seeded_kabir',
    isDemo: true,
    createdAt: '2026-10-27T11:35:00.000Z',
  },
  {
    id: 'notif_4',
    recipientId: 'user_rhea',
    type: 'INCIDENT_LOGGED',
    message: 'Incident #inc_past_meera_plate logged for Demo 3D Printer. Awaiting requester statement before review.',
    relatedRecordId: 'inc_past_meera_plate',
    isDemo: true,
    createdAt: '2026-10-26T16:02:00.000Z',
  },
];

export const SEED_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'audit_1',
    actorId: 'user_nisha',
    actorRole: 'admin',
    action: 'SPOT_CHECK_OWNER',
    entityType: 'User',
    entityId: 'user_rhea',
    reasonCode: 'ADMIN_VERIFIED',
    summary: 'Admin Nisha Verma verified institutional facility credentials for Dr. Rhea Kapoor.',
    timestamp: '2026-08-15T10:00:00.000Z',
  },
  {
    id: 'audit_2',
    actorId: 'user_rhea',
    actorRole: 'owner',
    action: 'CREATE_LISTING',
    entityType: 'Resource',
    entityId: 'res_3d_printer',
    reasonCode: 'PUBLISHED_ACTIVE',
    summary: 'Created listing for Demo 3D Printer (FDM Pro) with safety quiz and supervisor review required.',
    timestamp: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'audit_3',
    actorId: 'user_meera',
    actorRole: 'requester',
    action: 'SUBMIT_QUIZ',
    entityType: 'Quiz',
    entityId: 'quiz_3d_printer',
    reasonCode: 'QUIZ_PASSED',
    summary: 'Meera Nair completed 3D printing safety quiz with score 100%.',
    timestamp: '2026-10-15T14:20:00.000Z',
  },
  {
    id: 'audit_4',
    actorId: 'user_sam',
    actorRole: 'supervisor',
    action: 'SUPERVISOR_APPROVE_ELIGIBILITY',
    entityType: 'EligibilityRecord',
    entityId: 'elig_meera_3d',
    reasonCode: 'APPROVED_ELIGIBLE',
    summary: 'Supervisor Sam Iyer approved 3D printer operation eligibility for Meera Nair.',
    timestamp: '2026-10-15T14:30:00.000Z',
  },
  {
    id: 'audit_5',
    actorId: 'user_kabir',
    actorRole: 'requester',
    action: 'SUBMIT_REQUEST',
    entityType: 'Request',
    entityId: 'req_seeded_kabir',
    reasonCode: 'REQUEST_SUBMITTED',
    summary: 'Kabir Shah requested Demo 3D Printer slot for tomorrow 10:00 AM.',
    timestamp: '2026-10-27T11:00:00.000Z',
  },
  {
    id: 'audit_6',
    actorId: 'user_sam',
    actorRole: 'supervisor',
    action: 'APPROVE_REQUEST',
    entityType: 'Request',
    entityId: 'req_seeded_kabir',
    reasonCode: 'APPROVED_ELIGIBLE',
    summary: 'Supervisor Sam Iyer confirmed booking for Kabir Shah. Slot reserved.',
    timestamp: '2026-10-27T11:30:00.000Z',
  },
  {
    id: 'audit_7',
    actorId: 'user_meera',
    actorRole: 'requester',
    action: 'JOIN_WAITLIST',
    entityType: 'WaitlistEntry',
    entityId: 'wl_meera_kabir_slot',
    reasonCode: 'WAITLISTED_FIRST_ELIGIBLE',
    summary: 'Meera Nair joined waitlist for Demo 3D Printer slot tomorrow 10:00 AM as #1.',
    timestamp: '2026-10-27T12:00:00.000Z',
  },
];
