// ── Types ────────────────────────────────────────────────────────────────────

export type ResidentStatus = 'stable' | 'monitor' | 'urgent';
export type CareLevel = 'Low' | 'Medium' | 'High';
export type ShiftType = 'morning' | 'afternoon' | 'night' | 'leave' | 'off';
export type IncidentSeverity = 'critical' | 'major' | 'minor' | 'low';
export type IncidentStatus = 'open' | 'pending' | 'resolved' | 'closed';

export interface MockResident {
  id: number;
  firstName: string;
  lastName: string;
  residentId: string;
  room: string;
  wing: string;
  age: number;
  conditions: string[];
  careLevel: CareLevel;
  status: ResidentStatus;
  lastChecked: string;
  dob: string;
  admittedDate: string;
  medications: string[];
  keyWorker: string;
  nextOfKin: string;
  // API-mapped fields
  condition?: string;
  gpName?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  unitId?: number;
  roomId?: number;
}

export interface MockCarePlan {
  id: number;
  residentId: number;
  residentName: string;
  room: string;
  status: 'active' | 'overdue' | 'due-soon' | 'up-to-date';
  lastReview: string;
  nextReview: string;
  progress: number;
  goals: MockGoal[];
  assignedStaff: string[];
}

export interface MockGoal {
  id: number;
  title: string;
  tasks: { id: number; label: string; done: boolean }[];
}

export interface MockStaff {
  id: number;
  name: string;
  role: string;
  wing: string;
  shifts: Record<string, ShiftType>;
}

export interface MockIncident {
  id: number;
  title: string;
  type: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: string;
  time: string;
  date: string;
  reportedBy: string;
  residentId?: number;
  residentName?: string;
  description: string;
  actions: { id: number; label: string; done: boolean }[];
  timeline: { time: string; actor: string; note: string }[];
}

// ── Residents ─────────────────────────────────────────────────────────────────
// TODO: replace with API call to GET /api/v1/residents/directory

export const residents: MockResident[] = [
  {
    id: 1, firstName: 'Margaret', lastName: 'Hughes', residentId: 'R-0041', room: '12A', wing: 'Wing A',
    age: 82, conditions: ['Dementia', 'Hypertension'], careLevel: 'High', status: 'monitor',
    lastChecked: '09:15', dob: '12 Mar 1943', admittedDate: '04 Jan 2022',
    medications: ['Donepezil 10mg', 'Amlodipine 5mg', 'Atorvastatin 20mg'],
    keyWorker: 'Sarah Okonkwo', nextOfKin: 'David Hughes (Son)',
    condition: 'Dementia, Hypertension', gpName: 'Dr. Adeyemi',
    emergencyContactName: 'David Hughes', emergencyContactPhone: '+44 7700 900001',
    unitId: 1, roomId: 1,
  },
  {
    id: 2, firstName: 'Robert', lastName: 'Kwame', residentId: 'R-0038', room: '07B', wing: 'Wing B',
    age: 78, conditions: ['Parkinson\'s', 'Diabetes T2'], careLevel: 'High', status: 'urgent',
    lastChecked: '08:45', dob: '02 Sep 1946', admittedDate: '17 May 2021',
    medications: ['Levodopa 100mg', 'Metformin 500mg'],
    keyWorker: 'James Osei', nextOfKin: 'Abena Kwame (Daughter)',
    condition: "Parkinson's, Type 2 Diabetes", gpName: 'Dr. Singh',
    emergencyContactName: 'Abena Kwame', emergencyContactPhone: '+44 7700 900002',
    unitId: 2, roomId: 2,
  },
  {
    id: 3, firstName: 'Dorothy', lastName: 'Patel', residentId: 'R-0055', room: '03C', wing: 'Wing C',
    age: 91, conditions: ['COPD', 'Osteoporosis'], careLevel: 'Medium', status: 'stable',
    lastChecked: '10:00', dob: '28 Nov 1932', admittedDate: '21 Aug 2020',
    medications: ['Salbutamol inhaler', 'Calcium 500mg'],
    keyWorker: 'Priya Sharma', nextOfKin: 'Raj Patel (Son)',
    condition: 'COPD, Osteoporosis', gpName: 'Dr. Singh',
    emergencyContactName: 'Raj Patel', emergencyContactPhone: '+44 7700 900003',
    unitId: 3, roomId: 3,
  },
  {
    id: 4, firstName: 'Thomas', lastName: 'Brennan', residentId: 'R-0029', room: '09A', wing: 'Wing A',
    age: 85, conditions: ['Stroke recovery', 'Atrial fibrillation'], careLevel: 'High', status: 'monitor',
    lastChecked: '08:30', dob: '15 Apr 1939', admittedDate: '11 Mar 2023',
    medications: ['Warfarin 3mg', 'Ramipril 5mg'],
    keyWorker: 'Sarah Okonkwo', nextOfKin: 'Catherine Brennan (Wife)',
    condition: 'Stroke recovery, Atrial fibrillation', gpName: 'Dr. Adeyemi',
    emergencyContactName: 'Catherine Brennan', emergencyContactPhone: '+44 7700 900004',
    unitId: 1, roomId: 4,
  },
  {
    id: 5, firstName: 'Elsie', lastName: 'Nkrumah', residentId: 'R-0062', room: '14B', wing: 'Wing B',
    age: 74, conditions: ['Rheumatoid arthritis'], careLevel: 'Low', status: 'stable',
    lastChecked: '10:30', dob: '03 Jul 1950', admittedDate: '09 Sep 2023',
    medications: ['Methotrexate 10mg', 'Folic acid 5mg'],
    keyWorker: 'James Osei', nextOfKin: 'Kofi Nkrumah (Son)',
    condition: 'Rheumatoid arthritis', gpName: 'Dr. Patel',
    emergencyContactName: 'Kofi Nkrumah', emergencyContactPhone: '+44 7700 900005',
    unitId: 2, roomId: 5,
  },
  {
    id: 6, firstName: 'Harold', lastName: 'Sinclair', residentId: 'R-0017', room: '01C', wing: 'Wing C',
    age: 88, conditions: ['Heart failure', 'CKD Stage 3'], careLevel: 'High', status: 'stable',
    lastChecked: '09:50', dob: '22 Jan 1936', admittedDate: '15 Feb 2019',
    medications: ['Furosemide 40mg', 'Bisoprolol 2.5mg'],
    keyWorker: 'Priya Sharma', nextOfKin: 'Linda Sinclair (Daughter)',
    condition: 'Heart failure, CKD Stage 3', gpName: 'Dr. Walsh',
    emergencyContactName: 'Linda Sinclair', emergencyContactPhone: '+44 7700 900006',
    unitId: 3, roomId: 6,
  },
  {
    id: 7, firstName: 'Joan', lastName: 'Fletcher', residentId: 'R-0073', room: '06A', wing: 'Wing A',
    age: 79, conditions: ['Depression', 'Type 2 diabetes'], careLevel: 'Medium', status: 'stable',
    lastChecked: '10:15', dob: '17 Aug 1945', admittedDate: '22 Nov 2022',
    medications: ['Sertraline 50mg', 'Metformin 1g'],
    keyWorker: 'Sarah Okonkwo', nextOfKin: 'Peter Fletcher (Husband)',
    condition: 'Depression, Type 2 diabetes', gpName: 'Dr. Adeyemi',
    emergencyContactName: 'Peter Fletcher', emergencyContactPhone: '+44 7700 900007',
    unitId: 1, roomId: 7,
  },
  {
    id: 8, firstName: 'Arthur', lastName: 'Mensah', residentId: 'R-0044', room: '11B', wing: 'Wing B',
    age: 83, conditions: ['Vascular dementia', 'Hypertension'], careLevel: 'High', status: 'urgent',
    lastChecked: '07:55', dob: '09 Dec 1940', admittedDate: '30 Jun 2021',
    medications: ['Aspirin 75mg', 'Lisinopril 10mg'],
    keyWorker: 'James Osei', nextOfKin: 'Grace Mensah (Wife)',
    condition: 'Vascular dementia, Hypertension', gpName: 'Dr. Patel',
    emergencyContactName: 'Grace Mensah', emergencyContactPhone: '+44 7700 900008',
    unitId: 2, roomId: 8,
  },
];

// ── Care Plans ─────────────────────────────────────────────────────────────────
// TODO: replace with API call to GET /api/v1/care-plans

export const carePlans: MockCarePlan[] = [
  {
    id: 1, residentId: 2, residentName: 'Robert Kwame', room: '07B', status: 'overdue',
    lastReview: '28 Feb 2026', nextReview: '28 Mar 2026', progress: 40,
    goals: [
      { id: 1, title: 'Mobility & Fall Prevention', tasks: [{ id: 1, label: 'Daily physio exercises (15 min)', done: true }, { id: 2, label: 'Walking aid assessment', done: false }, { id: 3, label: 'Fall risk reassessment', done: false }] },
      { id: 2, title: 'Nutrition & Hydration', tasks: [{ id: 4, label: 'Record daily fluid intake', done: true }, { id: 5, label: 'Weekly weight check', done: true }, { id: 6, label: 'Dietician review', done: false }] },
    ],
    assignedStaff: ['James Osei', 'Dr. Adeyemi'],
  },
  {
    id: 2, residentId: 1, residentName: 'Margaret Hughes', room: '12A', status: 'due-soon',
    lastReview: '12 Apr 2026', nextReview: '12 Jun 2026', progress: 75,
    goals: [
      { id: 3, title: 'Cognitive Stimulation', tasks: [{ id: 7, label: 'Daily reminiscence activity', done: true }, { id: 8, label: 'Music therapy session (weekly)', done: true }, { id: 9, label: 'Memory assessment', done: false }] },
      { id: 4, title: 'Personal Care & Dignity', tasks: [{ id: 10, label: 'Morning care routine documented', done: true }, { id: 11, label: 'Preferences reviewed with family', done: true }] },
    ],
    assignedStaff: ['Sarah Okonkwo', 'Dr. Adeyemi'],
  },
  {
    id: 3, residentId: 4, residentName: 'Thomas Brennan', room: '09A', status: 'overdue',
    lastReview: '15 Feb 2026', nextReview: '15 Mar 2026', progress: 55,
    goals: [
      { id: 5, title: 'Speech & Swallowing', tasks: [{ id: 12, label: 'SALT review arranged', done: true }, { id: 13, label: 'Modified diet maintained', done: true }, { id: 14, label: 'Carer training completed', done: false }] },
    ],
    assignedStaff: ['Sarah Okonkwo'],
  },
  {
    id: 4, residentId: 3, residentName: 'Dorothy Patel', room: '03C', status: 'up-to-date',
    lastReview: '20 May 2026', nextReview: '20 Jul 2026', progress: 90,
    goals: [
      { id: 6, title: 'Respiratory Management', tasks: [{ id: 15, label: 'Inhaler technique checked', done: true }, { id: 16, label: 'O2 sats monitored daily', done: true }, { id: 17, label: 'GP review scheduled', done: true }] },
    ],
    assignedStaff: ['Priya Sharma', 'Dr. Singh'],
  },
  {
    id: 5, residentId: 8, residentName: 'Arthur Mensah', room: '11B', status: 'overdue',
    lastReview: '01 Jan 2026', nextReview: '01 Feb 2026', progress: 20,
    goals: [
      { id: 7, title: 'Behavioural Support', tasks: [{ id: 18, label: 'Behaviour log completed', done: false }, { id: 19, label: 'Psychiatry referral made', done: false }] },
    ],
    assignedStaff: ['James Osei'],
  },
];

// ── Staff ──────────────────────────────────────────────────────────────────────
// TODO: replace with API call to GET /api/v1/staff (endpoint to be built)

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const staff: MockStaff[] = [
  { id: 1, name: 'Sarah Okonkwo', role: 'Senior Carer', wing: 'Wing A', shifts: { Mon: 'morning', Tue: 'morning', Wed: 'off', Thu: 'morning', Fri: 'morning', Sat: 'off', Sun: 'off' } },
  { id: 2, name: 'James Osei', role: 'Carer', wing: 'Wing B', shifts: { Mon: 'afternoon', Tue: 'afternoon', Wed: 'afternoon', Thu: 'off', Fri: 'afternoon', Sat: 'morning', Sun: 'off' } },
  { id: 3, name: 'Priya Sharma', role: 'Senior Carer', wing: 'Wing C', shifts: { Mon: 'morning', Tue: 'off', Wed: 'morning', Thu: 'morning', Fri: 'off', Sat: 'morning', Sun: 'morning' } },
  { id: 4, name: 'Marcus Williams', role: 'Night Carer', wing: 'Wing A', shifts: { Mon: 'night', Tue: 'night', Wed: 'night', Thu: 'off', Fri: 'night', Sat: 'off', Sun: 'night' } },
  { id: 5, name: 'Adeola Fashola', role: 'Carer', wing: 'Wing B', shifts: { Mon: 'off', Tue: 'morning', Wed: 'morning', Thu: 'morning', Fri: 'off', Sat: 'afternoon', Sun: 'afternoon' } },
  { id: 6, name: 'Helen Walsh', role: 'Nurse', wing: 'Wing C', shifts: { Mon: 'morning', Tue: 'morning', Wed: 'leave', Thu: 'leave', Fri: 'leave', Sat: 'off', Sun: 'off' } },
  { id: 7, name: 'Tomasz Kowalski', role: 'Night Carer', wing: 'Wing A', shifts: { Mon: 'off', Tue: 'night', Wed: 'night', Thu: 'night', Fri: 'night', Sat: 'night', Sun: 'off' } },
  { id: 8, name: 'Dr. Yemi Adeyemi', role: 'GP (visiting)', wing: 'All', shifts: { Mon: 'morning', Tue: 'off', Wed: 'morning', Thu: 'off', Fri: 'off', Sat: 'off', Sun: 'off' } },
];

export { DAYS };

// ── Incidents ──────────────────────────────────────────────────────────────────
// TODO: replace with API call to GET /api/v1/incidents (endpoint to be built)

export const incidents: MockIncident[] = [
  {
    id: 1, title: 'Fall — Wing B corridor', type: 'Fall', severity: 'major', status: 'open',
    location: 'Wing B, Corridor 2', time: '07:42', date: '01 Jun 2026',
    reportedBy: 'James Osei', residentId: 2, residentName: 'Robert Kwame',
    description: 'Resident found on floor near room 07B at 07:42. No loss of consciousness. Complained of pain in right hip. Emergency protocol initiated.',
    actions: [{ id: 1, label: 'GP notified', done: true }, { id: 2, label: 'Family contacted', done: true }, { id: 3, label: 'X-ray arranged', done: false }, { id: 4, label: 'Incident form filed', done: false }],
    timeline: [{ time: '07:42', actor: 'James Osei', note: 'Resident discovered on floor. Emergency response activated.' }, { time: '07:50', actor: 'Helen Walsh', note: 'Nursing assessment completed. No external injuries visible.' }, { time: '08:15', actor: 'Dr. Adeyemi', note: 'GP contacted. X-ray referral issued.' }],
  },
  {
    id: 2, title: 'Medication error — Wing A', type: 'Medication', severity: 'critical', status: 'pending',
    location: 'Wing A, Room 12A', time: '14:30', date: '31 May 2026',
    reportedBy: 'Sarah Okonkwo', residentId: 1, residentName: 'Margaret Hughes',
    description: 'Wrong dosage of Donepezil administered. 20mg given instead of prescribed 10mg. Resident monitored for adverse effects. No symptoms observed at time of report.',
    actions: [{ id: 5, label: 'GP notified', done: true }, { id: 6, label: 'Pharmacy informed', done: true }, { id: 7, label: 'RIDDOR report submitted', done: false }, { id: 8, label: 'Root cause analysis completed', done: false }],
    timeline: [{ time: '14:30', actor: 'Sarah Okonkwo', note: 'Error discovered during medication round audit.' }, { time: '14:45', actor: 'Helen Walsh', note: 'Resident assessed. No adverse effects noted.' }, { time: '15:00', actor: 'Manager on duty', note: 'Incident escalated to senior management.' }],
  },
  {
    id: 3, title: 'Aggressive behaviour — Wing B', type: 'Behaviour', severity: 'minor', status: 'resolved',
    location: 'Wing B, Dining room', time: '12:05', date: '30 May 2026',
    reportedBy: 'James Osei', residentId: 8, residentName: 'Arthur Mensah',
    description: 'Resident became verbally aggressive during lunch. Calm intervention applied. Resident settled within 10 minutes. No physical contact made.',
    actions: [{ id: 9, label: 'De-escalation applied', done: true }, { id: 10, label: 'Behaviour log updated', done: true }, { id: 11, label: 'Care plan reviewed', done: true }],
    timeline: [{ time: '12:05', actor: 'James Osei', note: 'Verbal aggression observed. De-escalation protocol applied.' }, { time: '12:15', actor: 'James Osei', note: 'Resident settled. Returned to room.' }, { time: '13:00', actor: 'Sarah Okonkwo', note: 'Care plan updated with behaviour note.' }],
  },
  {
    id: 4, title: 'Near-miss — medication storage', type: 'Near-miss', severity: 'low', status: 'closed',
    location: 'Medication room', time: '09:00', date: '29 May 2026',
    reportedBy: 'Helen Walsh',
    description: 'Medication trolley left unlocked for approximately 5 minutes. No medications removed. Lock audited, procedure reminder issued to all staff.',
    actions: [{ id: 12, label: 'Trolley secured', done: true }, { id: 13, label: 'Staff reminder issued', done: true }],
    timeline: [{ time: '09:00', actor: 'Helen Walsh', note: 'Unlocked trolley discovered during morning round.' }, { time: '09:10', actor: 'Manager on duty', note: 'All staff reminded of medication security procedures.' }],
  },
  {
    id: 5, title: 'Pressure sore — Wing C', type: 'Skin integrity', severity: 'major', status: 'open',
    location: 'Wing C, Room 03C', time: '11:20', date: '01 Jun 2026',
    reportedBy: 'Priya Sharma', residentId: 3, residentName: 'Dorothy Patel',
    description: 'Grade 2 pressure ulcer identified on sacral area during morning care. Dressing applied. Repositioning schedule reviewed and increased to 2-hourly turns.',
    actions: [{ id: 14, label: 'Wound dressed', done: true }, { id: 15, label: 'Repositioning plan updated', done: true }, { id: 16, label: 'Tissue viability nurse referral', done: false }, { id: 17, label: 'Family informed', done: false }],
    timeline: [{ time: '11:20', actor: 'Priya Sharma', note: 'Pressure ulcer identified during morning care. Initial dressing applied.' }, { time: '11:45', actor: 'Helen Walsh', note: 'Nursing assessment. Grade 2 pressure sore confirmed.' }],
  },
];