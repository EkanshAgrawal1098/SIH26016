// Domain model for the National Land Acquisition & Management System

export type OfficialRole =
  | 'NATIONAL_ADMIN'
  | 'STATE_OFFICER'
  | 'DISTRICT_OFFICER'
  | 'FIELD_OFFICER'
  | 'PROJECT_OFFICER';

export type UserMode = 'official' | 'landowner';

export interface OfficialUser {
  mode: 'official';
  id: string;
  name: string;
  role: OfficialRole;
  jurisdiction: string; // e.g. "Jharkhand > Ranchi"
  avatarInitials: string;
}

export interface LandownerUser {
  mode: 'landowner';
  id: string;
  name: string;
  ownerRefId: string;
  phoneMasked: string;
  parcelIds: string[];
}

export type AppUser = OfficialUser | LandownerUser;

export type ParcelStage =
  | 'SURVEY'
  | 'VERIFICATION'
  | 'NOTIFICATION'
  | 'OBJECTION'
  | 'HEARING'
  | 'VALUATION'
  | 'AWARD'
  | 'COMPENSATION'
  | 'POSSESSION';

export const STAGE_ORDER: ParcelStage[] = [
  'SURVEY',
  'VERIFICATION',
  'NOTIFICATION',
  'OBJECTION',
  'HEARING',
  'VALUATION',
  'AWARD',
  'COMPENSATION',
  'POSSESSION',
];

export const STAGE_LABELS: Record<ParcelStage, string> = {
  SURVEY: 'Survey',
  VERIFICATION: 'Verification',
  NOTIFICATION: 'Notification',
  OBJECTION: 'Objection Window',
  HEARING: 'Hearing',
  VALUATION: 'Valuation',
  AWARD: 'Award',
  COMPENSATION: 'Compensation',
  POSSESSION: 'Possession',
};

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface StageEvent {
  stage: ParcelStage;
  date: string; // ISO date
  actor: string;
  note?: string;
  immutableHash: string;
}

export interface DocumentRef {
  id: string;
  title: string;
  type: 'NOTICE' | 'AWARD_ORDER' | 'SURVEY_MAP' | 'ID_PROOF' | 'PAYMENT_RECEIPT' | 'EVIDENCE';
  uploadedAt: string;
  ocrVerified: boolean;
  ocrFields?: { field: string; extracted: string; verified: boolean }[];
  url?: string;
}

export interface DataConflict {
  field: string;
  sourceA: { system: string; value: string };
  sourceB: { system: string; value: string };
  resolved: boolean;
}

export interface Objection {
  id: string;
  filedBy: string;
  filedAt: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_HEARING' | 'RESOLVED' | 'REJECTED';
  slaDueDate: string;
}

export interface FinancialRecord {
  awardedAmount: number;
  disbursedAmount: number;
  paymentReferenceMasked: string;
  settlementDate?: string;
  valuationRatePerSqm: number;
}

export interface Parcel {
  id: string; // National Parcel ID
  stateRefNo: string; // Khesra/Survey No
  stateId: string;
  districtId: string;
  villageId: string;
  projectId: string;
  ownerId: string;
  ownerName: string;
  normalizedAreaSqm: number;
  sourceArea: number;
  sourceAreaUnit: string;
  stage: ParcelStage;
  risk: RiskLevel;
  riskReasons: string[];
  dataQualityFlags: string[];
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  timeline: StageEvent[];
  documents: DocumentRef[];
  conflicts: DataConflict[];
  objections: Objection[];
  financials: FinancialRecord;
  centroid: [number, number]; // lat, lng
}

export interface Project {
  id: string;
  name: string;
  type: 'HIGHWAY' | 'RAIL';
  stateIds: string[];
  totalLandRequiredSqm: number;
  corridor: GeoJSON.LineString;
  description: string;
}

export interface Village {
  id: string;
  name: string;
  districtId: string;
}

export interface District {
  id: string;
  name: string;
  stateId: string;
}

export interface StateEntity {
  id: string;
  name: string;
  center: [number, number];
}

export interface BottleneckAlert {
  id: string;
  category: 'OWNERSHIP_DISPUTE' | 'PENDING_VALUATION' | 'MISSING_DOCUMENTS' | 'SLA_BREACH';
  projectId: string;
  parcelId: string;
  summary: string;
  recommendedAction: string;
  severity: RiskLevel;
  daysDelayed: number;
}

export interface MappingRule {
  id: string;
  stateId: string;
  sourceField: string;
  canonicalField: string;
  transform: string;
  active: boolean;
}

export interface SyncStatus {
  stateId: string;
  system: string;
  lastSyncAt: string;
  recordsRead: number;
  recordsWritten: number;
  recordsFailed: number;
  freshness: 'FRESH' | 'STALE' | 'FAILED';
}

// ---------- Rehabilitation & Resettlement (R&R) ----------
export type DisplacementStatus = 'DISPLACED' | 'NON_DISPLACED' | 'AT_RISK';
export type RREligibility = 'ELIGIBLE' | 'UNDER_REVIEW' | 'INELIGIBLE';
export type RRRehabStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'ALLOTTED' | 'COMPLETED';
export type RRResettleStatus = 'NOT_APPLICABLE' | 'NOT_STARTED' | 'SITE_IDENTIFIED' | 'HOUSE_CONSTRUCTED' | 'RESETTLED';

export interface RRCase {
  id: string;
  family_id: string;
  case_number: string;
  eligibility_status: RREligibility;
  rehabilitation_status: RRRehabStatus;
  resettlement_status: RRResettleStatus;
  benefits_package: Record<string, string>;
  total_assistance_amount: number;
  disbursed_amount: number;
  resettlement_colony_site?: string;
  remarks?: string;
}

export interface AffectedFamily {
  id: string;
  family_head: string;
  members_count: number;
  social_category: 'SC' | 'ST' | 'OBC' | 'GEN';
  livelihood_type: string;
  displacement_status: DisplacementStatus;
  contact_masked?: string;
  parcel_id?: string;
  project_id: string;
  rr_case?: RRCase;
}

export interface RRSummary {
  total_affected_families: number;
  total_displaced_families: number;
  eligible_families_count: number;
  rehabilitation_completed_count: number;
  resettlement_completed_count: number;
  total_rr_assistance_budget: number;
  total_rr_assistance_disbursed: number;
  rr_progress_percentage: number;
}

// ---------- Exact Dashboard Calculations ----------
export interface ExactKPIs {
  area_required_sqm: number;
  area_required_acres: number;
  area_notified_sqm: number;
  area_notified_acres: number;
  area_acquired_sqm: number;
  area_acquired_acres: number;
  area_acquisition_percentage: number;
  compensation_assessed: number;
  compensation_approved: number;
  compensation_paid: number;
  compensation_paid_percentage: number;
  affected_families_count: number;
  displaced_families_count: number;
  rr_progress_percentage: number;
  possession_percentage: number;
  timeline_adherence_percentage: number;
  total_projects?: number;
  total_parcels?: number;
  states_count?: number;
  high_risk_projects_count?: number;
  active_disputes_count?: number;
  average_data_quality_score?: number;
  headline_proposition?: string;
  risk_intelligence_mode?: string;
}

export interface FieldVerificationPayload {
  parcel_id: string;
  officer_name: string;
  verified_gps_lat: number;
  verified_gps_lng: number;
  boundary_verified: boolean;
  crop_structure_found: boolean;
  structure_details?: string;
  evidence_photo_url?: string;
  officer_remarks: string;
  advance_stage_to?: string;
}

// ---------- AI Intelligence, Rerouting & Copilot Types ----------
export interface DivertedRouteMetrics {
  total_length_km: number;
  length_delta_km: number;
  estimated_land_cost_cr: number;
  additional_civil_cost_cr: number;
  total_capex_cr: number;
  schedule_days_saved: number;
  feasibility_score: number;
  avoided_disputed_parcels_count: number;
  new_parcels_required: number;
  forest_clearance_required: boolean;
  displaced_families_count: number;
  statutory_path: string;
}

export interface DivertedRouteOption {
  id: string;
  name: string;
  type: string;
  description: string;
  corridor: GeoJSON.LineString;
  metrics: DivertedRouteMetrics;
  color: string;
  recommended: boolean;
}

export interface ChokePoint {
  parcel_id: string;
  owner_name: string;
  state_ref_no: string;
  chainage_km: number;
  coordinates: [number, number];
  risk: RiskLevel;
  risk_score: number;
  stage: ParcelStage;
  primary_issue: string;
  estimated_delay_months: number;
  financial_idle_cost_cr: number;
  corridor_severing: boolean;
}

export interface CorridorContiguity {
  project_id: string;
  project_name: string;
  corridor_length_km: number;
  contiguity_percentage: number;
  total_choke_points: number;
  choke_points: ChokePoint[];
  status: 'CRITICAL_BOTTLENECK' | 'ATTENTION_REQUIRED' | 'OPTIMAL' | 'NO_GEOMETRY';
}

export interface DivertedRoutesResponse {
  project_id: string;
  project_name: string;
  original_corridor_length_km: number;
  blocked_parcels: { id: string; owner: string; ref_no: string; risk_reasons: string[] }[];
  baseline_delay_projection_months: number;
  baseline_cost_overrun_cr: number;
  diversion_options: DivertedRouteOption[];
  ai_synthesis: string;
}

export interface PrescriptiveSuggestion {
  id: string;
  title: string;
  statutory_reference?: string;
  category?: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  strategic_benefit?: string;
  estimated_days_saved: number;
  cost_delta_cr?: number;
  success_probability?: number;
  action_cta?: string;
  action_type?: string;
}

export interface CopilotAction {
  type: 'OPEN_DIVERSION_STUDIO' | 'VIEW_PROJECT' | 'VIEW_PARCEL' | 'DRAFT_NOTICE';
  label: string;
  payload: Record<string, any>;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actions?: CopilotAction[];
  sources?: string[];
}

export interface AIRiskBreakdown {
  parcel_id: string;
  owner_name: string;
  state_ref_no?: string;
  stage: ParcelStage;
  risk_level: RiskLevel;
  risk_score: number;
  projected_delay_weeks: number;
  contributing_factors: string[];
  category_breakdown: Record<string, number>;
  factor_weights_pct: Record<string, number>;
  confidence_index?: number;
  mitigation_urgency?: string;
}

export interface ProjectAIRiskMatrix {
  project_id: string;
  project_name: string;
  total_parcels_analyzed: number;
  average_risk_score: number;
  overall_risk_level: RiskLevel;
  max_projected_delay_weeks: number;
  macro_category_breakdown: Record<string, number>;
  parcels: AIRiskBreakdown[];
}

