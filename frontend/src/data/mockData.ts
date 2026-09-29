import type {
  StateEntity,
  District,
  Village,
  Project,
  Parcel,
  BottleneckAlert,
  MappingRule,
  SyncStatus,
  LandownerUser,
} from '../types';

// ---------- Geo helpers ----------
function square(lat: number, lng: number, sizeDeg: number): GeoJSON.Polygon {
  const h = sizeDeg / 2;
  return {
    type: 'Polygon',
    coordinates: [
      [
        [lng - h, lat - h],
        [lng + h, lat - h],
        [lng + h, lat + h],
        [lng - h, lat + h],
        [lng - h, lat - h],
      ],
    ],
  };
}

// ---------- States / Districts / Villages ----------
export const states: StateEntity[] = [
  { id: 'JH', name: 'Jharkhand', center: [23.3441, 85.3096] },
  { id: 'WB', name: 'West Bengal', center: [22.9868, 87.855] },
  { id: 'OD', name: 'Odisha', center: [20.5, 85.85] },
];

export const districts: District[] = [
  { id: 'JH-RAN', name: 'Ranchi', stateId: 'JH' },
  { id: 'JH-EMB', name: 'East Singhbhum', stateId: 'JH' },
  { id: 'WB-PUR', name: 'Purulia', stateId: 'WB' },
  { id: 'WB-HOW', name: 'Howrah', stateId: 'WB' },
  { id: 'OD-MYB', name: 'Mayurbhanj', stateId: 'OD' },
];

export const villages: Village[] = [
  { id: 'V01', name: 'Namkum', districtId: 'JH-RAN' },
  { id: 'V02', name: 'Ormanjhi', districtId: 'JH-RAN' },
  { id: 'V03', name: 'Jamshedpur Rural', districtId: 'JH-EMB' },
  { id: 'V04', name: 'Ghatshila', districtId: 'JH-EMB' },
  { id: 'V05', name: 'Balarampur', districtId: 'WB-PUR' },
  { id: 'V06', name: 'Raghunathpur', districtId: 'WB-PUR' },
  { id: 'V07', name: 'Uluberia', districtId: 'WB-HOW' },
  { id: 'V08', name: 'Domjur', districtId: 'WB-HOW' },
  { id: 'V09', name: 'Baripada', districtId: 'OD-MYB' },
  { id: 'V10', name: 'Rairangpur', districtId: 'OD-MYB' },
];

// ---------- Projects ----------
export const projects: Project[] = [
  {
    id: 'PRJ-HW-01',
    name: 'NH-143 Ranchi–Kolkata Expansion Corridor',
    type: 'HIGHWAY',
    stateIds: ['JH', 'WB'],
    totalLandRequiredSqm: 4_820_000,
    corridor: {
      type: 'LineString',
      coordinates: [
        [85.3096, 23.3441],
        [86.2, 23.05],
        [86.66, 22.98],
        [87.855, 22.9868],
        [88.1, 22.75],
      ],
    },
    description:
      'Six-lane expansion of NH-143 connecting Ranchi to the Kolkata metropolitan periphery, spanning two states and eleven villages.',
  },
  {
    id: 'PRJ-RL-01',
    name: 'East Coast Freight Rail Link',
    type: 'RAIL',
    stateIds: ['JH', 'OD'],
    totalLandRequiredSqm: 3_150_000,
    corridor: {
      type: 'LineString',
      coordinates: [
        [86.2, 22.8],
        [86.4, 22.4],
        [86.5, 21.9],
        [85.9, 21.4],
        [85.82, 20.9],
      ],
    },
    description:
      'Dedicated freight rail corridor linking the Jamshedpur industrial belt to the Mayurbhanj mineral belt in Odisha.',
  },
];

// ---------- Landowner ----------
export const landowner: LandownerUser = {
  mode: 'landowner',
  id: 'OWN-1001',
  name: 'Suresh Mahato',
  ownerRefId: 'ORID-JH-778102',
  phoneMasked: '+91 98••••••41',
  parcelIds: ['NLAMS-JH-RAN-0001', 'NLAMS-WB-PUR-0006'],
};

// ---------- Parcels ----------
const baseTimeline = (
  stages: { stage: Parcel['stage']; offsetDays: number; actor: string; note?: string }[],
  startDate: Date
) =>
  stages.map((s, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + s.offsetDays);
    return {
      stage: s.stage,
      date: d.toISOString().slice(0, 10),
      actor: s.actor,
      note: s.note,
      immutableHash: `0x${(i + 1).toString(16).padStart(4, '0')}a1${s.stage.slice(0, 3).toLowerCase()}`,
    };
  });

const start = new Date('2025-02-10');

export const parcels: Parcel[] = [
  {
    id: 'NLAMS-JH-RAN-0001',
    stateRefNo: 'Khesra No. 214/2, Rakba 1.85 acre',
    stateId: 'JH',
    districtId: 'JH-RAN',
    villageId: 'V01',
    projectId: 'PRJ-HW-01',
    ownerId: 'OWN-1001',
    ownerName: 'Suresh Mahato',
    normalizedAreaSqm: 7487,
    sourceArea: 1.85,
    sourceAreaUnit: 'acre',
    stage: 'POSSESSION',
    risk: 'LOW',
    riskReasons: [],
    dataQualityFlags: [],
    geometry: square(23.3441, 85.3096, 0.006),
    centroid: [23.3441, 85.3096],
    timeline: baseTimeline(
      [
        { stage: 'SURVEY', offsetDays: 0, actor: 'Field Officer R. Kumar' },
        { stage: 'VERIFICATION', offsetDays: 12, actor: 'District Officer, Ranchi' },
        { stage: 'NOTIFICATION', offsetDays: 30, actor: 'State Officer, Jharkhand' },
        { stage: 'OBJECTION', offsetDays: 45, actor: 'System', note: '21-day objection window opened' },
        { stage: 'HEARING', offsetDays: 70, actor: 'District Collector, Ranchi' },
        { stage: 'VALUATION', offsetDays: 90, actor: 'Valuation Committee' },
        { stage: 'AWARD', offsetDays: 110, actor: 'District Collector, Ranchi' },
        { stage: 'COMPENSATION', offsetDays: 140, actor: 'Treasury, Jharkhand' },
        { stage: 'POSSESSION', offsetDays: 160, actor: 'Field Officer R. Kumar' },
      ],
      start
    ),
    documents: [
      { id: 'D1', title: 'Section 11 Public Notice', type: 'NOTICE', uploadedAt: '2025-03-12', ocrVerified: true },
      {
        id: 'D2',
        title: 'Award Order No. 2025/RAN/0044',
        type: 'AWARD_ORDER',
        uploadedAt: '2025-06-02',
        ocrVerified: true,
        ocrFields: [
          { field: 'Owner Name', extracted: 'Suresh Mahato', verified: true },
          { field: 'Award Amount', extracted: '₹42,10,000', verified: true },
          { field: 'Khesra No.', extracted: '214/2', verified: true },
        ],
      },
      { id: 'D3', title: 'Payment Receipt', type: 'PAYMENT_RECEIPT', uploadedAt: '2025-07-01', ocrVerified: true },
    ],
    conflicts: [],
    objections: [],
    financials: {
      awardedAmount: 4210000,
      disbursedAmount: 4210000,
      paymentReferenceMasked: 'UTR••••8821',
      settlementDate: '2025-07-01',
      valuationRatePerSqm: 562,
    },
  },
  {
    id: 'NLAMS-JH-RAN-0002',
    stateRefNo: 'Khesra No. 219/1, Rakba 0.92 acre',
    stateId: 'JH',
    districtId: 'JH-RAN',
    villageId: 'V02',
    projectId: 'PRJ-HW-01',
    ownerId: 'OWN-1002',
    ownerName: 'Devanti Devi',
    normalizedAreaSqm: 3723,
    sourceArea: 0.92,
    sourceAreaUnit: 'acre',
    stage: 'HEARING',
    risk: 'HIGH',
    riskReasons: ['Contested ownership between two heirs', 'Objection filed past hearing date twice rescheduled'],
    dataQualityFlags: ['Area mismatch: source deed vs GIS survey (Δ4.2%)'],
    geometry: square(23.41, 85.42, 0.006),
    centroid: [23.41, 85.42],
    timeline: baseTimeline(
      [
        { stage: 'SURVEY', offsetDays: 0, actor: 'Field Officer P. Singh' },
        { stage: 'VERIFICATION', offsetDays: 15, actor: 'District Officer, Ranchi' },
        { stage: 'NOTIFICATION', offsetDays: 40, actor: 'State Officer, Jharkhand' },
        { stage: 'OBJECTION', offsetDays: 55, actor: 'System' },
        { stage: 'HEARING', offsetDays: 95, actor: 'District Collector, Ranchi', note: 'Rescheduled twice — heir dispute' },
      ],
      start
    ),
    documents: [
      { id: 'D4', title: 'Section 11 Public Notice', type: 'NOTICE', uploadedAt: '2025-03-25', ocrVerified: true },
    ],
    conflicts: [
      {
        field: 'Owner Name',
        sourceA: { system: 'Jharkhand Bhoomi Portal', value: 'Devanti Devi' },
        sourceB: { system: 'District Revenue Register', value: 'Devanti Devi W/O Late Ram Mahato' },
        resolved: false,
      },
    ],
    objections: [
      {
        id: 'O1',
        filedBy: 'Birsa Mahato (claimed co-heir)',
        filedAt: '2025-04-18',
        subject: 'Ownership share dispute',
        description: 'Claimant asserts a 50% ancestral share not reflected in current record of rights.',
        status: 'IN_HEARING',
        slaDueDate: '2025-09-10',
      },
    ],
    financials: { awardedAmount: 0, disbursedAmount: 0, paymentReferenceMasked: '—', valuationRatePerSqm: 0 },
  },
  {
    id: 'NLAMS-JH-EMB-0003',
    stateRefNo: 'Survey No. 88, Rakba 2.10 acre',
    stateId: 'JH',
    districtId: 'JH-EMB',
    villageId: 'V03',
    projectId: 'PRJ-RL-01',
    ownerId: 'OWN-1003',
    ownerName: 'Manoj Tudu',
    normalizedAreaSqm: 8498,
    sourceArea: 2.1,
    sourceAreaUnit: 'acre',
    stage: 'VALUATION',
    risk: 'MEDIUM',
    riskReasons: ['Valuation pending market rate confirmation from Registrar'],
    dataQualityFlags: [],
    geometry: square(22.75, 86.18, 0.006),
    centroid: [22.75, 86.18],
    timeline: baseTimeline(
      [
        { stage: 'SURVEY', offsetDays: 0, actor: 'Field Officer S. Hansda' },
        { stage: 'VERIFICATION', offsetDays: 10, actor: 'District Officer, E. Singhbhum' },
        { stage: 'NOTIFICATION', offsetDays: 28, actor: 'State Officer, Jharkhand' },
        { stage: 'OBJECTION', offsetDays: 42, actor: 'System' },
        { stage: 'HEARING', offsetDays: 60, actor: 'District Collector, E. Singhbhum' },
        { stage: 'VALUATION', offsetDays: 85, actor: 'Valuation Committee', note: 'Awaiting Registrar circle-rate confirmation' },
      ],
      start
    ),
    documents: [
      { id: 'D5', title: 'Section 11 Public Notice', type: 'NOTICE', uploadedAt: '2025-03-10', ocrVerified: true },
      { id: 'D6', title: 'Survey Map', type: 'SURVEY_MAP', uploadedAt: '2025-02-11', ocrVerified: false },
    ],
    conflicts: [],
    objections: [],
    financials: { awardedAmount: 0, disbursedAmount: 0, paymentReferenceMasked: '—', valuationRatePerSqm: 0 },
  },
  {
    id: 'NLAMS-JH-EMB-0004',
    stateRefNo: 'Survey No. 91, Rakba 1.30 acre',
    stateId: 'JH',
    districtId: 'JH-EMB',
    villageId: 'V04',
    projectId: 'PRJ-RL-01',
    ownerId: 'OWN-1004',
    ownerName: 'Falguni Soren',
    normalizedAreaSqm: 5261,
    sourceArea: 1.3,
    sourceAreaUnit: 'acre',
    stage: 'AWARD',
    risk: 'LOW',
    riskReasons: [],
    dataQualityFlags: [],
    geometry: square(22.58, 86.48, 0.006),
    centroid: [22.58, 86.48],
    timeline: baseTimeline(
      [
        { stage: 'SURVEY', offsetDays: 0, actor: 'Field Officer S. Hansda' },
        { stage: 'VERIFICATION', offsetDays: 9, actor: 'District Officer, E. Singhbhum' },
        { stage: 'NOTIFICATION', offsetDays: 26, actor: 'State Officer, Jharkhand' },
        { stage: 'OBJECTION', offsetDays: 40, actor: 'System' },
        { stage: 'HEARING', offsetDays: 58, actor: 'District Collector, E. Singhbhum' },
        { stage: 'VALUATION', offsetDays: 80, actor: 'Valuation Committee' },
        { stage: 'AWARD', offsetDays: 100, actor: 'District Collector, E. Singhbhum' },
      ],
      start
    ),
    documents: [
      { id: 'D7', title: 'Award Order No. 2025/EMB/0019', type: 'AWARD_ORDER', uploadedAt: '2025-05-20', ocrVerified: true },
    ],
    conflicts: [],
    objections: [],
    financials: { awardedAmount: 3105000, disbursedAmount: 0, paymentReferenceMasked: 'Pending', valuationRatePerSqm: 590 },
  },
  {
    id: 'NLAMS-WB-PUR-0005',
    stateRefNo: 'Dag No. 1102, Khatian 340',
    stateId: 'WB',
    districtId: 'WB-PUR',
    villageId: 'V05',
    projectId: 'PRJ-HW-01',
    ownerId: 'OWN-1005',
    ownerName: 'Ratan Mandal',
    normalizedAreaSqm: 6070,
    sourceArea: 1.5,
    sourceAreaUnit: 'acre',
    stage: 'OBJECTION',
    risk: 'MEDIUM',
    riskReasons: ['Objection window closes in 4 days, no hearing scheduled yet'],
    dataQualityFlags: ['Missing Aadhaar-linked bank account for compensation'],
    geometry: square(23.05, 86.2, 0.006),
    centroid: [23.05, 86.2],
    timeline: baseTimeline(
      [
        { stage: 'SURVEY', offsetDays: 0, actor: 'Field Officer T. Ghosh' },
        { stage: 'VERIFICATION', offsetDays: 14, actor: 'District Officer, Purulia' },
        { stage: 'NOTIFICATION', offsetDays: 33, actor: 'State Officer, West Bengal' },
        { stage: 'OBJECTION', offsetDays: 48, actor: 'System', note: 'Window closes in 4 days' },
      ],
      start
    ),
    documents: [{ id: 'D8', title: 'Section 11 Public Notice', type: 'NOTICE', uploadedAt: '2025-03-30', ocrVerified: true }],
    conflicts: [],
    objections: [
      {
        id: 'O2',
        filedBy: 'Ratan Mandal',
        filedAt: '2025-04-05',
        subject: 'Compensation rate objection',
        description: 'Owner disputes the proposed circle rate as below adjacent parcel valuations.',
        status: 'OPEN',
        slaDueDate: '2025-09-03',
      },
    ],
    financials: { awardedAmount: 0, disbursedAmount: 0, paymentReferenceMasked: '—', valuationRatePerSqm: 0 },
  },
  {
    id: 'NLAMS-WB-PUR-0006',
    stateRefNo: 'Dag No. 1145, Khatian 355',
    stateId: 'WB',
    districtId: 'WB-PUR',
    villageId: 'V06',
    projectId: 'PRJ-HW-01',
    ownerId: 'OWN-1001',
    ownerName: 'Suresh Mahato',
    normalizedAreaSqm: 4047,
    sourceArea: 1.0,
    sourceAreaUnit: 'acre',
    stage: 'COMPENSATION',
    risk: 'LOW',
    riskReasons: [],
    dataQualityFlags: [],
    geometry: square(23.12, 86.35, 0.006),
    centroid: [23.12, 86.35],
    timeline: baseTimeline(
      [
        { stage: 'SURVEY', offsetDays: 0, actor: 'Field Officer T. Ghosh' },
        { stage: 'VERIFICATION', offsetDays: 11, actor: 'District Officer, Purulia' },
        { stage: 'NOTIFICATION', offsetDays: 29, actor: 'State Officer, West Bengal' },
        { stage: 'OBJECTION', offsetDays: 44, actor: 'System' },
        { stage: 'HEARING', offsetDays: 65, actor: 'District Collector, Purulia' },
        { stage: 'VALUATION', offsetDays: 88, actor: 'Valuation Committee' },
        { stage: 'AWARD', offsetDays: 108, actor: 'District Collector, Purulia' },
        { stage: 'COMPENSATION', offsetDays: 135, actor: 'Treasury, West Bengal', note: 'Disbursement in process' },
      ],
      start
    ),
    documents: [
      { id: 'D9', title: 'Award Order No. 2025/PUR/0027', type: 'AWARD_ORDER', uploadedAt: '2025-05-28', ocrVerified: true },
    ],
    conflicts: [],
    objections: [],
    financials: {
      awardedAmount: 2265000,
      disbursedAmount: 1400000,
      paymentReferenceMasked: 'UTR••••3390',
      settlementDate: undefined,
      valuationRatePerSqm: 560,
    },
  },
  {
    id: 'NLAMS-WB-HOW-0007',
    stateRefNo: 'Dag No. 402, Khatian 88',
    stateId: 'WB',
    districtId: 'WB-HOW',
    villageId: 'V07',
    projectId: 'PRJ-HW-01',
    ownerId: 'OWN-1007',
    ownerName: 'Ashok Bera',
    normalizedAreaSqm: 2833,
    sourceArea: 0.7,
    sourceAreaUnit: 'acre',
    stage: 'VERIFICATION',
    risk: 'LOW',
    riskReasons: [],
    dataQualityFlags: ['Source geometry pending GIS digitisation QA'],
    geometry: square(22.65, 88.05, 0.006),
    centroid: [22.65, 88.05],
    timeline: baseTimeline(
      [
        { stage: 'SURVEY', offsetDays: 0, actor: 'Field Officer M. Dutta' },
        { stage: 'VERIFICATION', offsetDays: 8, actor: 'District Officer, Howrah' },
      ],
      start
    ),
    documents: [],
    conflicts: [],
    objections: [],
    financials: { awardedAmount: 0, disbursedAmount: 0, paymentReferenceMasked: '—', valuationRatePerSqm: 0 },
  },
  {
    id: 'NLAMS-WB-HOW-0008',
    stateRefNo: 'Dag No. 415, Khatian 92',
    stateId: 'WB',
    districtId: 'WB-HOW',
    villageId: 'V08',
    projectId: 'PRJ-HW-01',
    ownerId: 'OWN-1008',
    ownerName: 'Mitali Sen',
    normalizedAreaSqm: 3480,
    sourceArea: 0.86,
    sourceAreaUnit: 'acre',
    stage: 'SURVEY',
    risk: 'MEDIUM',
    riskReasons: ['Field survey team access delayed by local access dispute'],
    dataQualityFlags: [],
    geometry: square(22.58, 88.15, 0.006),
    centroid: [22.58, 88.15],
    timeline: baseTimeline([{ stage: 'SURVEY', offsetDays: 0, actor: 'Field Officer M. Dutta', note: 'Access delayed' }], start),
    documents: [],
    conflicts: [],
    objections: [],
    financials: { awardedAmount: 0, disbursedAmount: 0, paymentReferenceMasked: '—', valuationRatePerSqm: 0 },
  },
  {
    id: 'NLAMS-OD-MYB-0009',
    stateRefNo: 'Plot No. 556/2201',
    stateId: 'OD',
    districtId: 'OD-MYB',
    villageId: 'V09',
    projectId: 'PRJ-RL-01',
    ownerId: 'OWN-1009',
    ownerName: 'Bijay Hembram',
    normalizedAreaSqm: 9308,
    sourceArea: 2.3,
    sourceAreaUnit: 'acre',
    stage: 'NOTIFICATION',
    risk: 'HIGH',
    riskReasons: ['Overlaps notified forest boundary — pending environmental clearance', 'Missing verified ID documents'],
    dataQualityFlags: ['Owner name mismatch across two state registers'],
    geometry: square(21.93, 86.73, 0.006),
    centroid: [21.93, 86.73],
    timeline: baseTimeline(
      [
        { stage: 'SURVEY', offsetDays: 0, actor: 'Field Officer K. Nayak' },
        { stage: 'VERIFICATION', offsetDays: 20, actor: 'District Officer, Mayurbhanj' },
        { stage: 'NOTIFICATION', offsetDays: 50, actor: 'State Officer, Odisha', note: 'Forest boundary overlap flagged' },
      ],
      start
    ),
    documents: [],
    conflicts: [
      {
        field: 'Owner Name',
        sourceA: { system: 'Odisha Bhulekh', value: 'Bijay Hembram' },
        sourceB: { system: 'District Land Register', value: 'Bijoy Hembram' },
        resolved: false,
      },
    ],
    objections: [],
    financials: { awardedAmount: 0, disbursedAmount: 0, paymentReferenceMasked: '—', valuationRatePerSqm: 0 },
  },
  {
    id: 'NLAMS-OD-MYB-0010',
    stateRefNo: 'Plot No. 601/2245',
    stateId: 'OD',
    districtId: 'OD-MYB',
    villageId: 'V10',
    projectId: 'PRJ-RL-01',
    ownerId: 'OWN-1010',
    ownerName: 'Sarita Murmu',
    normalizedAreaSqm: 6474,
    sourceArea: 1.6,
    sourceAreaUnit: 'acre',
    stage: 'POSSESSION',
    risk: 'LOW',
    riskReasons: [],
    dataQualityFlags: [],
    geometry: square(22.24, 86.15, 0.006),
    centroid: [22.24, 86.15],
    timeline: baseTimeline(
      [
        { stage: 'SURVEY', offsetDays: 0, actor: 'Field Officer K. Nayak' },
        { stage: 'VERIFICATION', offsetDays: 13, actor: 'District Officer, Mayurbhanj' },
        { stage: 'NOTIFICATION', offsetDays: 31, actor: 'State Officer, Odisha' },
        { stage: 'OBJECTION', offsetDays: 46, actor: 'System' },
        { stage: 'HEARING', offsetDays: 66, actor: 'District Collector, Mayurbhanj' },
        { stage: 'VALUATION', offsetDays: 89, actor: 'Valuation Committee' },
        { stage: 'AWARD', offsetDays: 109, actor: 'District Collector, Mayurbhanj' },
        { stage: 'COMPENSATION', offsetDays: 138, actor: 'Treasury, Odisha' },
        { stage: 'POSSESSION', offsetDays: 155, actor: 'Field Officer K. Nayak' },
      ],
      start
    ),
    documents: [
      { id: 'D10', title: 'Award Order No. 2025/MYB/0011', type: 'AWARD_ORDER', uploadedAt: '2025-06-08', ocrVerified: true },
      { id: 'D11', title: 'Payment Receipt', type: 'PAYMENT_RECEIPT', uploadedAt: '2025-06-30', ocrVerified: true },
    ],
    conflicts: [],
    objections: [],
    financials: {
      awardedAmount: 3560000,
      disbursedAmount: 3560000,
      paymentReferenceMasked: 'UTR••••7712',
      settlementDate: '2025-06-30',
      valuationRatePerSqm: 550,
    },
  },
];

// ---------- Bottleneck alerts ----------
export const bottleneckAlerts: BottleneckAlert[] = [
  {
    id: 'B1',
    category: 'OWNERSHIP_DISPUTE',
    projectId: 'PRJ-HW-01',
    parcelId: 'NLAMS-JH-RAN-0002',
    summary: 'Heir dispute has caused two hearing reschedules over 55 days.',
    recommendedAction: 'Assign a revenue mediator and set a binding hearing date within 7 days.',
    severity: 'HIGH',
    daysDelayed: 55,
  },
  {
    id: 'B2',
    category: 'PENDING_VALUATION',
    projectId: 'PRJ-RL-01',
    parcelId: 'NLAMS-JH-EMB-0003',
    summary: 'Valuation blocked on Registrar circle-rate confirmation for 22 days.',
    recommendedAction: 'Escalate to State Registrar office; auto-reminder sent to Valuation Committee.',
    severity: 'MEDIUM',
    daysDelayed: 22,
  },
  {
    id: 'B3',
    category: 'MISSING_DOCUMENTS',
    projectId: 'PRJ-RL-01',
    parcelId: 'NLAMS-OD-MYB-0009',
    summary: 'Owner ID verification and forest clearance documents outstanding.',
    recommendedAction: 'Request field officer to collect ID proof and forward file to Forest Dept. liaison.',
    severity: 'HIGH',
    daysDelayed: 38,
  },
  {
    id: 'B4',
    category: 'SLA_BREACH',
    projectId: 'PRJ-HW-01',
    parcelId: 'NLAMS-WB-PUR-0005',
    summary: 'Objection SLA closes in 4 days with no hearing scheduled.',
    recommendedAction: 'District Officer, Purulia to schedule hearing before SLA breach.',
    severity: 'MEDIUM',
    daysDelayed: 4,
  },
];

// ---------- Mapping rules ----------
export const mappingRules: MappingRule[] = [
  { id: 'M1', stateId: 'JH', sourceField: 'Khesra', canonicalField: 'stateRefNo', transform: 'direct copy', active: true },
  { id: 'M2', stateId: 'JH', sourceField: 'Rakba (acre)', canonicalField: 'normalizedAreaSqm', transform: 'acre × 4046.86', active: true },
  { id: 'M3', stateId: 'WB', sourceField: 'Dag No.', canonicalField: 'stateRefNo', transform: 'direct copy', active: true },
  { id: 'M4', stateId: 'WB', sourceField: 'Khatian', canonicalField: 'stateRefNo (secondary)', transform: 'concat with Dag No.', active: true },
  { id: 'M5', stateId: 'OD', sourceField: 'Plot No.', canonicalField: 'stateRefNo', transform: 'direct copy', active: true },
  { id: 'M6', stateId: 'OD', sourceField: 'Ekar (acre)', canonicalField: 'normalizedAreaSqm', transform: 'acre × 4046.86', active: false },
];

export const syncStatuses: SyncStatus[] = [
  { stateId: 'JH', system: 'Jharkhand Bhoomi Portal', lastSyncAt: '2026-08-30T04:12:00Z', recordsRead: 18240, recordsWritten: 18190, recordsFailed: 50, freshness: 'FRESH' },
  { stateId: 'WB', system: 'Banglarbhumi', lastSyncAt: '2026-08-29T22:40:00Z', recordsRead: 22110, recordsWritten: 22015, recordsFailed: 95, freshness: 'FRESH' },
  { stateId: 'OD', system: 'Odisha Bhulekh', lastSyncAt: '2026-08-27T11:05:00Z', recordsRead: 15980, recordsWritten: 15600, recordsFailed: 380, freshness: 'STALE' },
];

export const getStateName = (id: string) => states.find((s) => s.id === id)?.name ?? id;
export const getDistrictName = (id: string) => districts.find((d) => d.id === id)?.name ?? id;
export const getVillageName = (id: string) => villages.find((v) => v.id === id)?.name ?? id;
export const getProjectName = (id: string) => projects.find((p) => p.id === id)?.name ?? id;
export const getParcelById = (id: string) => parcels.find((p) => p.id === id);
export const getProjectById = (id: string) => projects.find((p) => p.id === id);
