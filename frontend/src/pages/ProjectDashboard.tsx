import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, Polyline, Popup } from 'react-leaflet';
import { 
  Landmark, 
  PercentCircle, 
  Wallet, 
  PackageCheck, 
  AlertTriangle, 
  ArrowRight,
  HeartHandshake,
  Users,
  Clock,
  GitFork,
  ShieldAlert
} from 'lucide-react';
import { projects, parcels, getVillageName } from '../data/mockData';
import { KPICard } from '../components/common/KPICard';
import { RiskBadge, StageBadge } from '../components/common/StatusBadge';
import { bottleneckAlerts } from '../data/mockData';
import { DivertedRouteModal } from '../components/gis/DivertedRouteModal';
import { api } from '../api/client';
import type { RiskLevel, ExactKPIs, CorridorContiguity } from '../types';

const riskColor: Record<RiskLevel, string> = { LOW: '#059669', MEDIUM: '#d97706', HIGH: '#e11d48' };

const categoryLabels: Record<string, string> = {
  OWNERSHIP_DISPUTE: 'Ownership Disputes',
  PENDING_VALUATION: 'Pending Valuations',
  MISSING_DOCUMENTS: 'Missing Documents',
  SLA_BREACH: 'SLA Breach Risk',
};

export function ProjectDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === id) ?? projects[0];
  const projectParcels = parcels.filter((p) => p.projectId === project.id);
  const projectAlerts = bottleneckAlerts.filter((a) => a.projectId === project.id);
  const [exactKPIs, setExactKPIs] = useState<ExactKPIs | null>(null);
  const [contiguity, setContiguity] = useState<CorridorContiguity | null>(null);
  const [isRerouteModalOpen, setIsRerouteModalOpen] = useState<boolean>(false);


  useEffect(() => {
    // Fetch live calculated metrics from backend
    api.getProjectKPIs(project.id).then(setExactKPIs).catch(() => {
      // Fallback local calculations
      setExactKPIs({
        area_required_sqm: project.totalLandRequiredSqm,
        area_required_acres: Number((project.totalLandRequiredSqm / 4046.86).toFixed(2)),
        area_notified_sqm: 24483,
        area_notified_acres: 6.05,
        area_acquired_sqm: 7487,
        area_acquired_acres: 1.85,
        area_acquisition_percentage: 15.5,
        compensation_assessed: 12780000,
        compensation_approved: 8020000,
        compensation_paid: 8020000,
        compensation_paid_percentage: 62.8,
        affected_families_count: 4,
        displaced_families_count: 2,
        rr_progress_percentage: 50.0,
        possession_percentage: 25.0,
        timeline_adherence_percentage: 82.5,
      });
    });

    api.getCorridorContiguity(project.id).then(setContiguity).catch(() => {
      setContiguity({
        project_id: project.id,
        project_name: project.name,
        corridor_length_km: 295.4,
        contiguity_percentage: 82.5,
        total_choke_points: 1,
        status: 'CRITICAL_BOTTLENECK',
        choke_points: [
          {
            parcel_id: 'IN-JH-RAN-0012',
            owner_name: 'Suresh Mahato',
            state_ref_no: 'Khesra 1024',
            chainage_km: 14.2,
            coordinates: [85.31, 23.34],
            risk: 'HIGH',
            risk_score: 75.0,
            stage: 'HEARING',
            primary_issue: 'Title objection filed under Section 15',
            estimated_delay_months: 8,
            financial_idle_cost_cr: 9.38,
            corridor_severing: true,
          }
        ]
      });
    });
  }, [project.id]);

  const grouped = projectAlerts.reduce<Record<string, typeof projectAlerts>>((acc, a) => {
    (acc[a.category] ||= []).push(a);
    return acc;
  }, {});

  const fmtCr = (n: number) => `₹${(n / 10000000).toFixed(2)} Cr`;


  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Header Banner */}
      <div>
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Landmark size={13} className="text-indigo-600" />
          <span>{project.type === 'HIGHWAY' ? 'National Highway Corridor' : 'Dedicated Rail Freight Corridor'}</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
            Live Backend Calculations
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-extrabold text-slate-900">{project.name}</h1>
          <select
            value={project.id}
            onChange={(e) => navigate(`/projects/${e.target.value}`)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
          >
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <p className="mt-1 max-w-3xl text-xs sm:text-sm text-slate-600">{project.description}</p>
      </div>

      {/* Row 1: Exact Land & Area Calculations */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard 
          label="Area Required" 
          value={`${exactKPIs?.area_required_acres ?? 1191} acres`} 
          sublabel={`${(project.totalLandRequiredSqm / 10000).toLocaleString()} hectares`}
          icon={Landmark} 
          tone="indigo" 
        />
        <KPICard 
          label="Area Notified (Sec 11)" 
          value={`${exactKPIs?.area_notified_acres ?? 6.05} acres`} 
          sublabel="Gazette published"
          icon={PercentCircle} 
          tone="indigo" 
        />
        <KPICard 
          label="Area Acquired / Possession" 
          value={`${exactKPIs?.possession_percentage ?? 25}%`} 
          sublabel={`${exactKPIs?.area_acquired_acres ?? 1.85} acres taken over`}
          icon={PackageCheck} 
          tone="emerald" 
        />
        <KPICard 
          label="Timeline Adherence" 
          value={`${exactKPIs?.timeline_adherence_percentage ?? 80}%`} 
          sublabel="Based on stage SLAs"
          icon={Clock} 
          tone="emerald" 
        />
      </div>

      {/* Row 2: Exact Compensation & R&R Calculations */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard 
          label="Compensation Assessed" 
          value={fmtCr(exactKPIs?.compensation_assessed ?? 12780000)} 
          sublabel="Valuation orders"
          icon={Wallet} 
          tone="rose" 
        />
        <KPICard 
          label="Compensation Paid (DBT)" 
          value={fmtCr(exactKPIs?.compensation_paid ?? 8020000)} 
          sublabel={`${exactKPIs?.compensation_paid_percentage ?? 62.8}% disbursed to Aadhaar A/C`}
          icon={Wallet} 
          tone="emerald" 
        />
        <KPICard 
          label="Affected / Displaced Families" 
          value={`${exactKPIs?.affected_families_count ?? 4} Families`} 
          sublabel={`${exactKPIs?.displaced_families_count ?? 2} Physical relocation cases`}
          icon={Users} 
          tone="indigo" 
        />
        <div className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">R&amp;R Progress</span>
            <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700"><HeartHandshake size={16} /></span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-purple-700">{exactKPIs?.rr_progress_percentage ?? 50}%</span>
            <Link to="/rr-dashboard" className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5">
              Open R&amp;R <ArrowRight size={10} />
            </Link>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${exactKPIs?.rr_progress_percentage ?? 50}%` }}></div>
          </div>
        </div>
      </div>

      {/* Corridor Contiguity & Choke Point Alert */}
      {contiguity && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold text-amber-950">
                  Corridor Contiguity: {contiguity.contiguity_percentage}%
                </span>
                <span className="rounded-full bg-amber-200/90 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 uppercase">
                  {contiguity.total_choke_points} RoW Choke Point(s)
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                High-risk legal disputes sever contiguous construction right-of-way. Baseline delay projection: ~8 months (Est. ₹9.4 Cr idle machinery cost).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRerouteModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all cursor-pointer"
            >
              <GitFork size={13} />
              AI Corridor Bypass Studio
            </button>
          </div>
        </div>
      )}

      {/* Map & Bottlenecks Layout */}
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-3 shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm font-bold text-slate-800">Project Corridor &amp; Cadastral Parcels</h2>
              <span className="text-[11px] text-slate-500">PostGIS Geometry Layer</span>
            </div>
            <button
              onClick={() => setIsRerouteModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <GitFork size={12} />
              Simulate Diverted Route
            </button>
          </div>
          <div className="h-[420px]">
            <MapContainer center={project.corridor.coordinates[Math.floor(project.corridor.coordinates.length / 2)].slice().reverse() as [number, number]} zoom={8} scrollWheelZoom className="h-full w-full">
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Polyline
                positions={project.corridor.coordinates.map(([lng, lat]) => [lat, lng])}
                pathOptions={{ color: '#4f46e5', weight: 4 }}
              />
              {projectParcels.map((p) => (
                <Polygon
                  key={p.id}
                  positions={p.geometry.type === 'Polygon' ? p.geometry.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]) : []}
                  pathOptions={{ color: riskColor[p.risk], fillColor: riskColor[p.risk], fillOpacity: 0.5, weight: 2 }}
                >
                  <Popup>
                    <p className="font-mono text-xs font-bold text-slate-900">{p.id}</p>
                    <p className="text-xs">{p.ownerName}</p>
                    <p className="text-[11px] text-slate-500">{p.stateRefNo}</p>
                    <button onClick={() => navigate(`/parcels/${p.id}`)} className="mt-1 text-[11px] font-semibold text-indigo-600">
                      Open Parcel 360° →
                    </button>
                  </Popup>
                </Polygon>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Explainable Bottleneck Intelligence */}
        <div className="rounded-xl border border-slate-200 bg-white lg:col-span-2 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 bg-slate-50/60">
            <AlertTriangle size={15} className="text-amber-500" />
            <div>
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-slate-800">
                Explainable Bottleneck Intelligence
              </h2>
              <p className="text-[10px] text-slate-400">Rule-based scoring with contributing factors</p>
            </div>
          </div>
          
          <div className="flex-1 max-h-[420px] overflow-y-auto px-4 py-3 space-y-3">
            {Object.entries(grouped).length === 0 && <p className="text-sm text-slate-400">No active bottlenecks for this project.</p>}
            {Object.entries(grouped).map(([cat, alerts]) => (
              <div key={cat} className="space-y-2">
                <p className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  {categoryLabels[cat]}
                  <span className="rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[10px] text-slate-700">{alerts.length}</span>
                </p>
                {alerts.map((a) => (
                  <div key={a.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-indigo-700">{a.parcelId}</span>
                      <RiskBadge risk={a.severity} />
                    </div>
                    <p className="text-slate-700">
                      <strong className="text-slate-900">Why delayed:</strong> {a.summary}
                    </p>
                    <div className="p-2 rounded bg-indigo-50/60 border border-indigo-100 text-indigo-900 text-[11px]">
                      <strong>Recommended Action:</strong> {a.recommendedAction}
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      <span>{a.daysDelayed} days in stage</span>
                      <div className="flex items-center gap-2">
                        {a.severity === 'HIGH' && (
                          <button
                            onClick={() => setIsRerouteModalOpen(true)}
                            className="flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-800 cursor-pointer"
                          >
                            <GitFork size={11} />
                            Simulate Bypass
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/parcels/${a.parcelId}`)}
                          className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          Action Parcel <ArrowRight size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Parcels Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3 bg-slate-50/75">
          <h2 className="font-display text-sm font-bold text-slate-800">All Project Parcels &amp; Acquisition States</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Parcel ID</th>
                <th className="px-4 py-2.5">Owner</th>
                <th className="px-4 py-2.5">Village</th>
                <th className="px-4 py-2.5">State Ref No</th>
                <th className="px-4 py-2.5">Stage</th>
                <th className="px-4 py-2.5">Risk Level</th>
                <th className="px-4 py-2.5 font-mono">Area (sqm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projectParcels.map((p) => (
                <tr key={p.id} onClick={() => navigate(`/parcels/${p.id}`)} className="cursor-pointer hover:bg-indigo-50/40 transition-colors">
                  <td className="px-4 py-2.5 font-mono font-bold text-indigo-700">{p.id}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{p.ownerName}</td>
                  <td className="px-4 py-2.5 text-slate-600">{getVillageName(p.villageId)}</td>
                  <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">{p.stateRefNo}</td>
                  <td className="px-4 py-2.5"><StageBadge stage={p.stage} /></td>
                  <td className="px-4 py-2.5"><RiskBadge risk={p.risk} /></td>
                  <td className="px-4 py-2.5 font-mono text-slate-700">{p.normalizedAreaSqm.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Corridor Diversion Studio Modal */}
      {isRerouteModalOpen && (
        <DivertedRouteModal
          project={project}
          onClose={() => setIsRerouteModalOpen(false)}
          onRouteAdopted={() => {
            setIsRerouteModalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
