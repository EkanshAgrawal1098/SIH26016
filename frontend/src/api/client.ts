import type { 
  AffectedFamily, 
  RRCase, 
  RRSummary, 
  ExactKPIs, 
  FieldVerificationPayload,
  CorridorContiguity,
  DivertedRoutesResponse,
  PrescriptiveSuggestion,
  AIRiskBreakdown,
  ProjectAIRiskMatrix
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (payload: { username?: string; password?: string; role?: string; mode?: string; owner_ref_id?: string; phone?: string }) =>
    apiFetch<{ access_token: string; token_type: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => apiFetch<any>('/auth/me'),

  // Reference
  getStates: () => apiFetch<any[]>('/reference/states'),
  getDistricts: (stateId?: string) => apiFetch<any[]>(`/reference/districts${stateId ? `?state_id=${stateId}` : ''}`),
  getVillages: (districtId?: string) => apiFetch<any[]>(`/reference/villages${districtId ? `?district_id=${districtId}` : ''}`),

  // Projects
  getProjects: (stateId?: string) => apiFetch<any[]>(`/projects${stateId ? `?state_id=${stateId}` : ''}`),
  getProject360: (projectId: string) => apiFetch<any>(`/projects/${projectId}`),
  getProjectParcels: (projectId: string) => apiFetch<any[]>(`/projects/${projectId}/parcels`),
  getProjectKPIs: (projectId: string) => apiFetch<ExactKPIs>(`/analytics/projects/${projectId}/kpis`),

  // Parcels
  getParcels: (params?: { state_id?: string; district_id?: string; project_id?: string; stage?: string; risk?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiFetch<any[]>(`/parcels${query ? `?${query}` : ''}`);
  },
  getParcel360: (parcelId: string) => apiFetch<any>(`/parcels/${parcelId}`),
  getParcelTimeline: (parcelId: string) => apiFetch<any[]>(`/parcels/${parcelId}/timeline`),
  updateParcel: (parcelId: string, payload: any) =>
    apiFetch<any>(`/parcels/${parcelId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Acquisition Workflow
  transitionStage: (parcelId: string, payload: { to_stage: string; remarks?: string; actor?: string; document_ids?: string[] }) =>
    apiFetch<any>(`/acquisition-cases/${parcelId}/transition`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Analytics & Exact KPIs
  getNationalKPIs: () => apiFetch<ExactKPIs>('/analytics/national'),
  getProjectRisk: (projectId: string) => apiFetch<any>(`/analytics/projects/${projectId}/risk`),
  getProjectBottlenecks: (projectId: string) => apiFetch<any[]>(`/analytics/projects/${projectId}/bottlenecks`),

  // Documents
  getDocuments: (params?: { parcel_id?: string; project_id?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiFetch<any[]>(`/documents${query ? `?${query}` : ''}`);
  },
  uploadDocument: (payload: any) =>
    apiFetch<any>('/documents', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getDocumentOCR: (docId: string) => apiFetch<any>(`/documents/${docId}/ocr`),

  // Interoperability
  getSourceSystems: () => apiFetch<any[]>('/imports/sources'),
  importRecords: (payload: { source_system: string; records: any[] }) =>
    apiFetch<any>('/imports/import', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Grievances
  getGrievances: (params?: { parcel_id?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiFetch<any[]>(`/grievances${query ? `?${query}` : ''}`);
  },
  submitGrievance: (payload: any) =>
    apiFetch<any>('/grievances', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Rehabilitation & Resettlement (R&R)
  getRRSummary: (projectId?: string) =>
    apiFetch<RRSummary>(`/rr/summary${projectId ? `?project_id=${projectId}` : ''}`),
  getAffectedFamilies: (params?: { project_id?: string; displacement_status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiFetch<AffectedFamily[]>(`/rr/families${query ? `?${query}` : ''}`);
  },
  updateRRCaseStatus: (caseId: string, payload: Partial<RRCase>) =>
    apiFetch<RRCase>(`/rr/cases/${caseId}/update-status`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Field Officer Portal
  getFieldAssignedParcels: () => apiFetch<any[]>('/field/assigned-parcels'),
  submitFieldVerification: (payload: FieldVerificationPayload) =>
    apiFetch<any>('/field/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // AI Intelligence: Diverted Routes & Corridor Contiguity
  getCorridorContiguity: (projectId: string) =>
    apiFetch<CorridorContiguity>(`/projects/${projectId}/corridor-analysis`),
  getDivertedRoutes: (projectId: string, blockedParcelIds?: string[]) =>
    apiFetch<DivertedRoutesResponse>(`/projects/${projectId}/diverted-routes`, {
      method: 'POST',
      body: JSON.stringify({ blocked_parcel_ids: blockedParcelIds }),
    }),
  adoptDivertedRoute: (projectId: string, payload: { option_id: string; remarks?: string }) =>
    apiFetch<any>(`/projects/${projectId}/adopt-diverted-route`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // AI Intelligence: BhoomiAI Copilot & Statutory Guidance
  chatWithCopilot: (payload: { message: string; project_id?: string; parcel_id?: string }) =>
    apiFetch<{ reply: string; actions?: any[]; sources?: string[] }>('/copilot/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getCopilotQuickPrompts: () => apiFetch<any[]>('/copilot/quick-prompts'),
  getParcelSuggestions: (parcelId: string) =>
    apiFetch<{ parcel_id: string; suggestions: PrescriptiveSuggestion[] }>(`/copilot/suggestions/parcel/${parcelId}`),
  getProjectSuggestions: (projectId: string) =>
    apiFetch<{ project_id: string; suggestions: PrescriptiveSuggestion[] }>(`/copilot/suggestions/project/${projectId}`),

  // AI Intelligence: Risk Matrix & Breakdown
  getProjectAIRiskMatrix: (projectId: string) =>
    apiFetch<ProjectAIRiskMatrix>(`/analytics/projects/${projectId}/ai-risk-matrix`),
  getParcelAIRiskBreakdown: (parcelId: string) =>
    apiFetch<AIRiskBreakdown>(`/analytics/parcels/${parcelId}/ai-risk-breakdown`),
};

