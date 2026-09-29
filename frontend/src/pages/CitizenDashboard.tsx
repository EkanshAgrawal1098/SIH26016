import { useState } from 'react';
import { FileText, Upload, Send, Clock, MapPin, Wallet, Landmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getParcelById, getVillageName, getProjectName, getDistrictName } from '../data/mockData';
import { StageTimeline } from '../components/common/StageTimeline';
import { RiskBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export function CitizenDashboard() {
  const { user } = useAuth();
  const [activeParcelId, setActiveParcelId] = useState<string | null>(null);
  const [grievanceOpen, setGrievanceOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!user || user.mode !== 'landowner') return null;

  const myParcels = user.parcelIds.map((id) => getParcelById(id)).filter(Boolean);
  const activeParcel = activeParcelId ? getParcelById(activeParcelId) : myParcels[0];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">Welcome, {user.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Owner Reference ID: <span className="font-mono-data">{user.ownerRefId}</span> · {myParcels.length} linked parcels
          </p>
        </div>
        <button
          onClick={() => setGrievanceOpen(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          File a grievance / objection
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {myParcels.map((p) =>
          p ? (
            <button
              key={p.id}
              onClick={() => setActiveParcelId(p.id)}
              className={`rounded-xl border bg-white p-4 text-left transition ${
                activeParcel?.id === p.id ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-indigo-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono-data text-xs text-slate-400">{p.id}</p>
                <RiskBadge risk={p.risk} />
              </div>
              <p className="mt-1 font-display text-base font-bold text-slate-900">{p.stateRefNo}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                <MapPin size={11} /> {getVillageName(p.villageId)}, {getDistrictName(p.districtId)}
              </p>
              <p className="mt-2 text-xs font-semibold text-indigo-700">{getProjectName(p.projectId)}</p>
              <div className="mt-3">
                <StageTimeline currentStage={p.stage} events={p.timeline} compact />
              </div>
            </button>
          ) : null
        )}
      </div>

      {activeParcel && (
        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="mb-4 flex items-center gap-1.5 font-display text-sm font-bold text-slate-800">
              <Clock size={14} /> Parcel lifecycle — {activeParcel.stateRefNo}
            </p>
            <StageTimeline currentStage={activeParcel.stage} events={activeParcel.timeline} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="mb-4 flex items-center gap-1.5 font-display text-sm font-bold text-slate-800">
              <Wallet size={14} /> Financial transparency
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Awarded amount</p>
                <p className="mt-1 font-mono-data text-lg font-bold text-slate-900">
                  ₹{activeParcel.financials.awardedAmount.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Disbursed amount</p>
                <p className="mt-1 font-mono-data text-lg font-bold text-emerald-700">
                  ₹{activeParcel.financials.disbursedAmount.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment reference</p>
                <p className="mt-1 font-mono-data text-sm text-slate-700">{activeParcel.financials.paymentReferenceMasked}</p>
                {activeParcel.financials.settlementDate && (
                  <p className="text-xs text-slate-400">Settled {activeParcel.financials.settlementDate}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="flex items-center gap-1.5 font-display text-sm font-bold text-slate-800">
                <Landmark size={14} /> Document hub
              </p>
              <button className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                <Upload size={13} /> Upload evidence
              </button>
            </div>
            {activeParcel.documents.length === 0 ? (
              <p className="text-sm text-slate-400">No documents published for this parcel yet.</p>
            ) : (
              <div className="space-y-2">
                {activeParcel.documents.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <FileText size={15} className="text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">{d.title}</p>
                        <p className="text-xs text-slate-400">{d.uploadedAt}</p>
                      </div>
                    </div>
                    <button className="text-xs font-semibold text-indigo-600 hover:underline">Download</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {activeParcel.objections.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="mb-4 font-display text-sm font-bold text-slate-800">Your objections</p>
              {activeParcel.objections.map((o) => (
                <div key={o.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">{o.subject}</p>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      {o.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Filed {o.filedAt} · SLA due {o.slaDueDate}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        open={grievanceOpen}
        onClose={() => { setGrievanceOpen(false); setSubmitted(false); }}
        title="File a grievance or objection"
        subtitle={activeParcel ? `Linked to ${activeParcel.id}` : undefined}
        footer={
          !submitted && (
            <>
              <button onClick={() => setGrievanceOpen(false)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600">
                Cancel
              </button>
              <button
                onClick={() => setSubmitted(true)}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
              >
                <Send size={13} /> Submit
              </button>
            </>
          )
        }
      >
        {submitted ? (
          <div className="py-4 text-center">
            <p className="font-display text-base font-bold text-emerald-700">Grievance submitted</p>
            <p className="mt-1 text-sm text-slate-500">
              Your reference ID is <span className="font-mono-data">GRV-{Math.floor(Math.random() * 90000 + 10000)}</span>. SLA resolution target: 21 days.
            </p>
          </div>
        ) : (
          <>
            <label className="block text-xs font-semibold text-slate-600">Subject</label>
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" placeholder="e.g. Compensation rate dispute" />
            <label className="mt-4 block text-xs font-semibold text-slate-600">Description</label>
            <textarea rows={4} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" placeholder="Describe your objection in detail…" />
            <label className="mt-4 block text-xs font-semibold text-slate-600">Supporting evidence (optional)</label>
            <div className="mt-1 flex items-center justify-center rounded-lg border border-dashed border-slate-300 py-6 text-xs text-slate-400">
              <Upload size={14} className="mr-1.5" /> Drag file here or click to upload
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
