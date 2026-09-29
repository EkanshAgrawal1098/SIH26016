import { useState } from 'react';
import { ArrowRight, Database, RefreshCcw, CheckCircle2, XCircle, AlertCircle, Layers, ShieldCheck } from 'lucide-react';
import { mappingRules, syncStatuses, states, getStateName } from '../data/mockData';

const freshnessStyle: Record<string, string> = {
  FRESH: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  STALE: 'bg-amber-50 text-amber-700 ring-amber-200',
  FAILED: 'bg-rose-50 text-rose-700 ring-rose-200',
};

export function Interoperability() {
  const [stateFilter, setStateFilter] = useState('ALL');
  const rules = mappingRules.filter((r) => stateFilter === 'ALL' || r.stateId === stateFilter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-6">
      {/* Title & Core Value Proposition */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
          <Layers size={14} /> National Interoperability Engine
        </div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">
          State Schema Adapter &amp; Interoperability
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          An interoperability and intelligence layer over existing land-acquisition and land-record systems. 
          Every state speaks a different dialect (Khesra/Rakba in Jharkhand, Survey No/Ha in Maharashtra, Gata in UP). 
          This adapter normalizes them into the Canonical Land Model without altering source records.
        </p>
      </div>

      {/* Sync Status Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {syncStatuses.map((s) => (
          <div key={s.stateId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-display text-sm font-bold text-slate-800">{getStateName(s.stateId)}</p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${freshnessStyle[s.freshness]}`}>
                {s.freshness}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <Database size={12} /> {s.system}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="font-mono text-sm font-bold text-slate-800">{s.recordsRead.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400">Read</p>
              </div>
              <div>
                <p className="font-mono text-sm font-bold text-emerald-700">{s.recordsWritten.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400">Written</p>
              </div>
              <div>
                <p className="font-mono text-sm font-bold text-rose-600">{s.recordsFailed.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400">Failed</p>
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1 text-[11px] text-slate-400">
              <RefreshCcw size={11} /> Last sync {new Date(s.lastSyncAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        ))}
      </div>

      {/* Field Mapping Rules Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-slate-800">State-to-Canonical Field Mapping Matrix</h2>
          <select 
            value={stateFilter} 
            onChange={(e) => setStateFilter(e.target.value)} 
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
          >
            <option value="ALL">All States</option>
            {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">State Cadastre</th>
                <th className="px-4 py-2.5">Source Field</th>
                <th className="px-4 py-2.5"></th>
                <th className="px-4 py-2.5">Canonical National Field</th>
                <th className="px-4 py-2.5">Transformation Rule</th>
                <th className="px-4 py-2.5">Adapter Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-semibold text-slate-800">{getStateName(r.stateId)}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{r.sourceField}</td>
                  <td className="px-4 py-3 text-slate-300"><ArrowRight size={13} /></td>
                  <td className="px-4 py-3 font-mono font-semibold text-indigo-700">{r.canonicalField}</td>
                  <td className="px-4 py-3 text-slate-500">{r.transform}</td>
                  <td className="px-4 py-3">
                    {r.active ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        <XCircle size={12} /> Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50 p-3.5 text-xs text-indigo-800">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-indigo-600" />
          <span>
            <strong>Non-Destructive Ingestion Principle:</strong> The Canonical Land Model preserves original units, source timestamps, and raw identifiers alongside normalized values so no state's authoritative record is ever overwritten or lost.
          </span>
        </div>
      </div>

      {/* Prototype vs. Production Architecture Comparison Matrix */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">
              System Architecture: SIH Prototype vs. Production Rollout
            </h3>
            <p className="text-xs text-slate-500">
              Clear distinction between working prototype capabilities and enterprise government deployment.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
            <ShieldCheck size={14} /> Modular Monolith Architecture
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Dimension</th>
                <th className="py-3 px-4 text-indigo-700">SIH 2026 Working Prototype</th>
                <th className="py-3 px-4 text-emerald-800">Production Infrastructure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-900">Government APIs</td>
                <td className="py-3 px-4 text-indigo-900">Multi-state schema adapters (Jharkhand, MH, WB, UP)</td>
                <td className="py-3 px-4 text-emerald-900">Authorized state/central API gateways (NIC, DILRMP, Bhoomi Rashi)</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-900">Landowner Records</td>
                <td className="py-3 px-4 text-indigo-900">Synthetic / anonymized data (privacy-safe demo)</td>
                <td className="py-3 px-4 text-emerald-900">Authorized state RoR &amp; Aadhaar DBT banking integration</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-900">GIS &amp; Cadastral</td>
                <td className="py-3 px-4 text-indigo-900">PostGIS + GeoJSON vector corridors &amp; parcel polygons</td>
                <td className="py-3 px-4 text-emerald-900">National Spatial Data Infrastructure &amp; NAKSHA DGPS surveys</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-900">Risk &amp; Bottlenecks</td>
                <td className="py-3 px-4 text-indigo-900">Explainable risk engine with transparent factors</td>
                <td className="py-3 px-4 text-emerald-900">Hybrid rule-based baseline + trained XGBoost ML delay model</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-900">Field Inspections</td>
                <td className="py-3 px-4 text-indigo-900">Responsive Mobile Web / PWA field portal with GPS capture</td>
                <td className="py-3 px-4 text-emerald-900">Offline-first native mobile application with tamper-proof sync</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-900">Document OCR</td>
                <td className="py-3 px-4 text-indigo-900">Simulated / candidate field extraction preview</td>
                <td className="py-3 px-4 text-emerald-900">Production PaddleOCR / Tesseract pipeline with verification</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-900">Architecture Scale</td>
                <td className="py-3 px-4 text-indigo-900">Clean modular monolith (FastAPI + Supabase PostgreSQL)</td>
                <td className="py-3 px-4 text-emerald-900">High-availability cloud deployment with Redis cache &amp; MinIO S3</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
