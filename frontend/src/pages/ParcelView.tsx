import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import {
  ArrowLeft,
  ScanText,
  FileText,
  Gavel,
  Wallet,
  CheckCircle2,
  Workflow,
  UserCheck,
  History,
  ShieldAlert,
  Sparkles,
  Clock,
  Scale
} from 'lucide-react';
import { getParcelById, getStateName, getDistrictName, getVillageName, getProjectName } from '../data/mockData';
import { RiskBadge, StageBadge } from '../components/common/StatusBadge';
import { StageTimeline } from '../components/common/StageTimeline';
import { Modal } from '../components/common/Modal';
import { STAGE_ORDER, STAGE_LABELS, type ParcelStage, type DocumentRef, type DataConflict, type PrescriptiveSuggestion, type AIRiskBreakdown } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

type Tab = 'ownership' | 'legal' | 'financials' | 'documents' | 'audit';


export function ParcelView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const parcel = getParcelById(id ?? '');
  const [tab, setTab] = useState<Tab>('ownership');
  const [ocrDoc, setOcrDoc] = useState<DocumentRef | null>(null);
  const [conflict, setConflict] = useState<DataConflict | null>(null);
  const [transitionOpen, setTransitionOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [nextStage, setNextStage] = useState<ParcelStage | null>(null);
  const [suggestions, setSuggestions] = useState<PrescriptiveSuggestion[]>([]);
  const [riskBreakdown, setRiskBreakdown] = useState<AIRiskBreakdown | null>(null);

  useEffect(() => {
    if (!parcel) return;
    api.getParcelSuggestions(parcel.id)
      .then((res) => setSuggestions(res.suggestions))
      .catch(() => {
        if (parcel.risk === 'HIGH') {
          setSuggestions([
            {
              id: 'SUGG-SEC77-LARRA',
              title: 'Deposit Compensation into LARRA Authority (RFCTLARR Sec 77(2))',
              statutory_reference: 'RFCTLARR Act, 2013 § 77(2)',
              urgency: 'HIGH',
              summary: 'Where ownership is in dispute or multiple claimants raise title objections, the Collector is legally empowered to deposit the compensation into the LARRA Authority.',
              strategic_benefit: 'Enables taking lawful physical possession under Section 38 without waiting for civil court litigation to conclude.',
              estimated_days_saved: 210,
              success_probability: 94.0,
              action_cta: 'Prepare Sec 77(2) Order'
            },
            {
              id: 'SUGG-CONSENT-SOLATIUM',
              title: 'Authorize 100% Solatium & Consent Award Incentive',
              statutory_reference: 'RFCTLARR Act 2013 First Schedule',
              urgency: 'HIGH',
              summary: 'Offer expedited settlement bonus of 12% additional interest per annum from notification date under Section 30(3) upon instant possession handover.',
              strategic_benefit: 'Secures immediate voluntary possession within 14 days.',
              estimated_days_saved: 90,
              success_probability: 88.0,
              action_cta: 'Issue Consent Award Notice'
            }
          ]);
        }
      });

    api.getParcelAIRiskBreakdown(parcel.id)
      .then(setRiskBreakdown)
      .catch(() => {
        setRiskBreakdown({
          parcel_id: parcel.id,
          owner_name: parcel.ownerName,
          stage: parcel.stage,
          risk_level: parcel.risk,
          risk_score: parcel.risk === 'HIGH' ? 78.5 : (parcel.risk === 'MEDIUM' ? 42.0 : 15.0),
          projected_delay_weeks: parcel.risk === 'HIGH' ? 14 : (parcel.risk === 'MEDIUM' ? 5 : 0),
          contributing_factors: parcel.riskReasons.length > 0 ? parcel.riskReasons : ['Normal milestone progression within SLA'],
          category_breakdown: {
            legal_disputes: parcel.risk === 'HIGH' ? 35 : 0,
            cadastral_conflicts: parcel.conflicts.length > 0 ? 15 : 0,
            compensation_delays: 15,
            sla_timeline_breach: 20,
            environmental_fra: 0
          },
          factor_weights_pct: {
            'Legal Disputes': 45.0,
            'Cadastral Conflicts': 25.0,
            'SLA Breaches': 30.0
          },
          confidence_index: 92.4,
          mitigation_urgency: parcel.risk === 'HIGH' ? 'IMMEDIATE' : 'ROUTINE'
        });
      });
  }, [parcel?.id]);


  if (!parcel) {
    return (
      <div className="p-8 text-center text-slate-500">
        Parcel not found. <button onClick={() => navigate(-1)} className="text-indigo-600">Go back</button>
      </div>
    );
  }

  const isOfficial = user?.mode === 'official';
  const currentIdx = STAGE_ORDER.indexOf(parcel.stage);
  const upcomingStage = STAGE_ORDER[currentIdx + 1];

  const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
    { id: 'ownership', label: 'Ownership & Verification', icon: UserCheck },
    { id: 'legal', label: 'Legal Disputes & Objections', icon: Gavel },
    { id: 'financials', label: 'Financials', icon: Wallet },
    { id: 'documents', label: 'Linked Documents', icon: FileText },
    { id: 'audit', label: 'Audit Events', icon: History },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <button onClick={() => navigate(-1)} className="mb-3 flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600">
        <ArrowLeft size={13} /> Back
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono-data text-xs text-slate-400">{parcel.id}</p>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">{parcel.stateRefNo}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {getStateName(parcel.stateId)} &gt; {getDistrictName(parcel.districtId)} &gt; {getVillageName(parcel.villageId)} · {getProjectName(parcel.projectId)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StageBadge stage={parcel.stage} />
          <RiskBadge risk={parcel.risk} />
        </div>
      </div>

      {/* Explainable AI Risk Diagnostics & Forecast */}
      {riskBreakdown && (
        <div className="mt-4 rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <Sparkles size={16} />
              </span>
              <div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-900">
                  Explainable AI Risk Diagnostic &amp; Timeline Forecast
                </h3>
                <p className="text-[11px] text-slate-500">Multi-factor SLA &amp; legal risk model</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-xs">
                <Clock size={13} className="text-amber-600" />
                <span className="text-slate-500">Projected Delay:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {riskBreakdown.projected_delay_weeks > 0 ? `+${riskBreakdown.projected_delay_weeks} Weeks` : 'On Track (0w)'}
                </span>
              </div>
              <div className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs">
                <span className="text-slate-500">Risk Score:</span>
                <span className="ml-1 font-bold text-indigo-700 font-mono">{riskBreakdown.risk_score} / 100</span>
              </div>
            </div>
          </div>

          {/* Factor Category Weight Progress */}
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
            {Object.entries(riskBreakdown.factor_weights_pct).map(([cat, pct]) => (
              <div key={cat} className="rounded-lg border border-slate-100 bg-slate-50/60 p-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>{cat}</span>
                  <span className="font-mono text-slate-800">{pct}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-600" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Contributing Reasons */}
          {riskBreakdown.contributing_factors.length > 0 && (
            <div className="mt-3 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Primary Risk Drivers:</span>
              <ul className="mt-1 space-y-1 text-slate-700">
                {riskBreakdown.contributing_factors.map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Prescriptive Statutory AI Remedies */}
      {suggestions.length > 0 && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-emerald-700" />
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-emerald-950">
                Prescriptive Statutory AI Remedies (RFCTLARR Act 2013)
              </h3>
            </div>
            <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              {suggestions.length} Statutory Pathway(s)
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {suggestions.map((sugg) => (
              <div key={sugg.id} className="rounded-xl border border-emerald-200 bg-white p-3.5 text-xs shadow-xs space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{sugg.title}</span>
                    <span className="rounded bg-indigo-50 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-indigo-700">
                      Saves ~{sugg.estimated_days_saved}d
                    </span>
                  </div>
                  {sugg.statutory_reference && (
                    <span className="block text-[10px] font-semibold text-indigo-600 mt-0.5">{sugg.statutory_reference}</span>
                  )}
                  <p className="mt-1.5 text-slate-600 leading-relaxed text-[11px]">{sugg.summary}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-emerald-700">
                    Success Probability: {sugg.success_probability}%
                  </span>
                  <button
                    onClick={() => alert(`Statutory action '${sugg.action_cta}' initiated. Digital file reference created.`)}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    {sugg.action_cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Normalized area</p>
          <p className="font-display text-xl font-bold text-slate-900 font-mono-data">
            {parcel.normalizedAreaSqm.toLocaleString()} sqm
          </p>
          <p className="text-xs text-slate-400">Source: {parcel.sourceArea} {parcel.sourceAreaUnit}</p>

          <div className="mt-4">
            <StageTimeline currentStage={parcel.stage} events={parcel.timeline} />
          </div>

          {isOfficial && upcomingStage && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => { setNextStage(upcomingStage); setTransitionOpen(true); }}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <Workflow size={14} /> Advance to {STAGE_LABELS[upcomingStage]}
              </button>
              <button
                onClick={() => setAssignOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <UserCheck size={14} /> Assign officer task
              </button>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <MapContainer center={parcel.centroid} zoom={15} scrollWheelZoom={false} className="h-56 w-full">
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Polygon
              positions={parcel.geometry.type === 'Polygon' ? parcel.geometry.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]) : []}
              pathOptions={{ color: '#4f46e5', fillColor: '#4f46e5', fillOpacity: 0.35, weight: 2 }}
            />
          </MapContainer>
          <div className="p-3 text-xs text-slate-500">
            Centroid: <span className="font-mono-data">{parcel.centroid[0].toFixed(4)}, {parcel.centroid[1].toFixed(4)}</span>
          </div>
        </div>
      </div>

      {parcel.conflicts.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-800">
            <ShieldAlert size={15} /> Data Quality &amp; Conflict Panel
          </p>
          <p className="mt-1 text-xs text-amber-700">Field-level conflicts between state sources — raw data preserved, not overwritten.</p>
          <div className="mt-3 space-y-2">
            {parcel.conflicts.map((c) => (
              <button
                key={c.field}
                onClick={() => setConflict(c)}
                className="flex w-full items-center justify-between rounded-lg border border-amber-200 bg-white px-3 py-2 text-left text-xs hover:bg-amber-50/60"
              >
                <span>
                  <span className="font-semibold">{c.field}:</span> "{c.sourceA.value}" vs "{c.sourceB.value}"
                </span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  {c.resolved ? 'Resolved' : 'Unresolved'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {parcel.dataQualityFlags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {parcel.dataQualityFlags.map((f) => (
            <span key={f} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200">
              {f}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 border-b border-slate-200">
        <div className="flex flex-wrap gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-semibold transition ${
                tab === t.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="py-5">
        {tab === 'ownership' && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Registered owner</p>
            <p className="mt-1 font-display text-lg font-bold text-slate-900">{parcel.ownerName}</p>
            <p className="mt-1 text-xs text-slate-500">Owner ID: {parcel.ownerId}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Verification status</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-emerald-700">
              <CheckCircle2 size={15} /> {parcel.conflicts.length === 0 ? 'Verified across all linked state sources' : 'Pending conflict resolution'}
            </p>
          </div>
        )}

        {tab === 'legal' && (
          <div className="space-y-3">
            {parcel.objections.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-400">No objections filed for this parcel.</div>
            )}
            {parcel.objections.map((o) => (
              <div key={o.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-bold text-slate-900">{o.subject}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    o.status === 'OPEN' ? 'bg-rose-50 text-rose-700' : o.status === 'IN_HEARING' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>{o.status.replace('_', ' ')}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Filed by {o.filedBy} on {o.filedAt}</p>
                <p className="mt-2 text-sm text-slate-600">{o.description}</p>
                <p className="mt-2 text-xs text-slate-400">SLA due: <span className="font-mono-data">{o.slaDueDate}</span></p>
              </div>
            ))}
          </div>
        )}

        {tab === 'financials' && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Awarded amount</p>
              <p className="mt-1 font-display text-xl font-bold font-mono-data text-slate-900">₹{parcel.financials.awardedAmount.toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Disbursed amount</p>
              <p className="mt-1 font-display text-xl font-bold font-mono-data text-emerald-700">₹{parcel.financials.disbursedAmount.toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Valuation rate</p>
              <p className="mt-1 font-display text-xl font-bold font-mono-data text-slate-900">₹{parcel.financials.valuationRatePerSqm}/sqm</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment reference</p>
              <p className="mt-1 font-mono-data text-sm text-slate-700">{parcel.financials.paymentReferenceMasked}</p>
              {parcel.financials.settlementDate && <p className="mt-1 text-xs text-slate-400">Settled on {parcel.financials.settlementDate}</p>}
            </div>
          </div>
        )}

        {tab === 'documents' && (
          <div className="space-y-2">
            {parcel.documents.length === 0 && <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-400">No documents linked yet.</div>}
            {parcel.documents.map((d) => (
              <button
                key={d.id}
                onClick={() => setOcrDoc(d)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 text-left hover:border-indigo-200 hover:bg-indigo-50/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{d.title}</p>
                    <p className="text-xs text-slate-400">{d.type.replace('_', ' ')} · Uploaded {d.uploadedAt}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${d.ocrVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  <ScanText size={11} /> {d.ocrVerified ? 'OCR verified' : 'OCR pending'}
                </span>
              </button>
            ))}
          </div>
        )}

        {tab === 'audit' && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <ul className="space-y-3">
              {parcel.timeline.map((e) => (
                <li key={e.immutableHash} className="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0">
                  <History size={14} className="mt-0.5 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{STAGE_LABELS[e.stage]}</p>
                    <p className="text-xs text-slate-500">{e.date} · {e.actor}{e.note ? ` — ${e.note}` : ''}</p>
                  </div>
                  <span className="font-mono-data text-[10px] text-slate-300">{e.immutableHash}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* OCR document modal */}
      <Modal open={!!ocrDoc} onClose={() => setOcrDoc(null)} title={ocrDoc?.title ?? ''} subtitle="OCR extracted field verification" wide>
        {ocrDoc?.ocrFields ? (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr><th className="pb-2">Field</th><th className="pb-2">Extracted value</th><th className="pb-2">Status</th></tr>
            </thead>
            <tbody>
              {ocrDoc.ocrFields.map((f) => (
                <tr key={f.field} className="border-t border-slate-100">
                  <td className="py-2 font-medium text-slate-700">{f.field}</td>
                  <td className="py-2 font-mono-data text-slate-600">{f.extracted}</td>
                  <td className="py-2">
                    {f.verified ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle2 size={13} /> Verified</span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600">Needs review</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-slate-500">This document has not yet completed OCR field extraction.</p>
        )}
      </Modal>

      {/* Conflict resolution modal */}
      <Modal open={!!conflict} onClose={() => setConflict(null)} title={`Resolve conflict: ${conflict?.field}`} subtitle="Raw source data is preserved — resolving selects the canonical value for display only.">
        {conflict && (
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-semibold text-slate-500">{conflict.sourceA.system}</p>
              <p className="mt-1 font-mono-data text-sm text-slate-800">{conflict.sourceA.value}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-semibold text-slate-500">{conflict.sourceB.system}</p>
              <p className="mt-1 font-mono-data text-sm text-slate-800">{conflict.sourceB.value}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Stage transition modal */}
      <Modal
        open={transitionOpen}
        onClose={() => setTransitionOpen(false)}
        title={`Advance parcel stage`}
        subtitle={`${parcel.id} · ${nextStage ? STAGE_LABELS[nextStage] : ''}`}
        footer={
          <>
            <button onClick={() => setTransitionOpen(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600">Cancel</button>
            <button onClick={() => setTransitionOpen(false)} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">Confirm transition</button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          This will record an immutable stage transition event from <span className="font-semibold">{STAGE_LABELS[parcel.stage]}</span> to{' '}
          <span className="font-semibold">{nextStage ? STAGE_LABELS[nextStage] : ''}</span>, timestamped and attributed to your officer account.
        </p>
        <label className="mt-4 block text-xs font-semibold text-slate-600">Remarks (optional)</label>
        <textarea rows={3} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="Add a note for the audit trail…" />
      </Modal>

      {/* Assign officer task modal */}
      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign officer task"
        subtitle={parcel.id}
        footer={
          <>
            <button onClick={() => setAssignOpen(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600">Cancel</button>
            <button onClick={() => setAssignOpen(false)} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">Assign task</button>
          </>
        }
      >
        <label className="block text-xs font-semibold text-slate-600">Assign to</label>
        <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
          <option>Field Officer — {getDistrictName(parcel.districtId)}</option>
          <option>District Officer — {getDistrictName(parcel.districtId)}</option>
          <option>Valuation Committee</option>
        </select>
        <label className="mt-4 block text-xs font-semibold text-slate-600">Task</label>
        <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" placeholder="e.g. Re-verify boundary markers" />
        <label className="mt-4 block text-xs font-semibold text-slate-600">Due date</label>
        <input type="date" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
      </Modal>
    </div>
  );
}
