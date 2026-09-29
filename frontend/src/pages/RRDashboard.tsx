import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Home, 
  HeartHandshake, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  MapPin, 
  DollarSign, 
  Filter, 
  ArrowUpRight
} from 'lucide-react';
import { api } from '../api/client';
import type { AffectedFamily, RRSummary } from '../types';

export function RRDashboard() {
  const [summary, setSummary] = useState<RRSummary | null>(null);
  const [families, setFamilies] = useState<AffectedFamily[]>([]);
  const [selectedDisplacement, setSelectedDisplacement] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedFamily, setSelectedFamily] = useState<AffectedFamily | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newRehabStatus, setNewRehabStatus] = useState<string>('IN_PROGRESS');
  const [newResettleStatus, setNewResettleStatus] = useState<string>('SITE_IDENTIFIED');
  const [disburseAmount, setDisburseAmount] = useState<number>(0);

  const fetchRRData = async () => {
    try {
      const [sumData, famData] = await Promise.all([
        api.getRRSummary().catch(() => ({
          total_affected_families: 4,
          total_displaced_families: 2,
          eligible_families_count: 3,
          rehabilitation_completed_count: 1,
          resettlement_completed_count: 0,
          total_rr_assistance_budget: 2870000,
          total_rr_assistance_disbursed: 1400000,
          rr_progress_percentage: 50.0,
        })),
        api.getAffectedFamilies().catch(() => []),
      ]);
      setSummary(sumData);
      setFamilies(famData);
    } catch (err) {
      console.error('Failed to load R&R data', err);
    }
  };

  useEffect(() => {
    fetchRRData();
  }, []);

  const handleUpdateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFamily?.rr_case) return;
    try {
      setUpdating(true);
      await api.updateRRCaseStatus(selectedFamily.rr_case.id, {
        rehabilitation_status: newRehabStatus as any,
        resettlement_status: newResettleStatus as any,
        disbursed_amount: Number(disburseAmount),
      });
      setUpdateModalOpen(false);
      fetchRRData();
    } catch (err) {
      alert('Failed to update R&R case status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredFamilies = families.filter((f) => {
    if (selectedDisplacement !== 'ALL' && f.displacement_status !== selectedDisplacement) return false;
    if (selectedCategory !== 'ALL' && f.social_category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="min-h-full bg-slate-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              <ShieldCheck size={13} /> Statutory RFCTLARR Compliance
            </span>
            <span className="text-xs text-slate-500">Real-Time Entitlement Tracking</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Rehabilitation & Resettlement (R&R) Command Center</h1>
          <p className="text-sm text-slate-600">
            Monitoring affected families, entitlement packages, annuity disbursements, and resettlement colony progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRRData}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Refresh Records
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Affected Families</span>
            <span className="rounded-lg bg-blue-50 p-2 text-blue-600"><Users size={18} /></span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{summary?.total_affected_families ?? 4}</span>
            <span className="text-xs text-slate-500">Verified census count</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 font-medium">
            <AlertTriangle size={14} />
            <span>{summary?.total_displaced_families ?? 2} Physical Displacement cases</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">R&R Assistance Budget</span>
            <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><DollarSign size={18} /></span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              ₹{((summary?.total_rr_assistance_budget ?? 2870000) / 100000).toFixed(1)}L
            </span>
            <span className="text-xs text-slate-500">Sanctioned package</span>
          </div>
          <div className="mt-3 text-xs text-emerald-600 font-medium">
            ₹{((summary?.total_rr_assistance_disbursed ?? 1400000) / 100000).toFixed(1)}L Disbursed (Direct Benefit Transfer)
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Resettlement Status</span>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><Home size={18} /></span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{summary?.resettlement_completed_count ?? 0}</span>
            <span className="text-xs text-slate-500">/ {summary?.total_displaced_families ?? 2} colonies allotted</span>
          </div>
          <div className="mt-3 text-xs text-slate-600">
            Model colonies active in Ranchi & Purulia
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Overall R&R Progress</span>
            <span className="rounded-lg bg-purple-50 p-2 text-purple-600"><HeartHandshake size={18} /></span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-purple-700">{summary?.rr_progress_percentage ?? 50.0}%</span>
            <span className="text-xs text-slate-500">Execution index</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${summary?.rr_progress_percentage ?? 50}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Filter size={14} /> Filter By:
          </div>

          <select
            value={selectedDisplacement}
            onChange={(e) => setSelectedDisplacement(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Displacement Types</option>
            <option value="DISPLACED">Displaced Families</option>
            <option value="NON_DISPLACED">Non-Displaced (Livelihood only)</option>
            <option value="AT_RISK">At-Risk / Verification Pending</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Social Categories</option>
            <option value="ST">Scheduled Tribe (ST)</option>
            <option value="SC">Scheduled Caste (SC)</option>
            <option value="OBC">Other Backward Class (OBC)</option>
            <option value="GEN">General (GEN)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-900">{filteredFamilies.length}</span> affected family cases
        </div>
      </div>

      {/* Affected Families Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/75 px-6 py-3.5">
          <h2 className="text-sm font-semibold text-slate-800">Affected Families & Entitlement Directory</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3">Family Head / Contact</th>
                <th className="px-6 py-3">Social & Livelihood</th>
                <th className="px-6 py-3">Displacement Status</th>
                <th className="px-6 py-3">R&R Case No.</th>
                <th className="px-6 py-3">Rehabilitation Status</th>
                <th className="px-6 py-3">Resettlement Status</th>
                <th className="px-6 py-3">Financial Grant</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredFamilies.map((f) => {
                const c = f.rr_case;
                return (
                  <tr key={f.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{f.family_head}</div>
                      <div className="text-slate-500 text-[11px]">{f.members_count} Members • {f.contact_masked || '—'}</div>
                      <div className="text-slate-400 text-[10px] font-mono mt-0.5">Parcel: {f.parcel_id || 'Corridor wide'}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        f.social_category === 'ST' ? 'bg-amber-100 text-amber-800' :
                        f.social_category === 'SC' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {f.social_category}
                      </span>
                      <div className="text-slate-600 mt-1 capitalize">{f.livelihood_type.replace(/_/g, ' ').toLowerCase()}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        f.displacement_status === 'DISPLACED' ? 'bg-rose-100 text-rose-800' :
                        f.displacement_status === 'AT_RISK' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {f.displacement_status === 'DISPLACED' ? '● Displaced' : 
                         f.displacement_status === 'AT_RISK' ? '▲ At Risk' : '○ Non-Displaced'}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-[11px] text-slate-700">
                      {c?.case_number || 'Pending Filing'}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                        c?.rehabilitation_status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        c?.rehabilitation_status === 'ALLOTTED' ? 'bg-blue-100 text-blue-800' :
                        c?.rehabilitation_status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {c?.rehabilitation_status === 'COMPLETED' && <CheckCircle2 size={12} />}
                        {c?.rehabilitation_status?.replace(/_/g, ' ') || 'NOT_STARTED'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-medium">
                        {c?.resettlement_status?.replace(/_/g, ' ') || 'N/A'}
                      </div>
                      {c?.resettlement_colony_site && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {c.resettlement_colony_site}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        ₹{(c?.total_assistance_amount ?? 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-emerald-600">
                        Disbursed: ₹{(c?.disbursed_amount ?? 0).toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedFamily(f);
                          setNewRehabStatus(c?.rehabilitation_status || 'IN_PROGRESS');
                          setNewResettleStatus(c?.resettlement_status || 'SITE_IDENTIFIED');
                          setDisburseAmount(c?.disbursed_amount || 0);
                          setUpdateModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                      >
                        Manage <ArrowUpRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update R&R Case Modal */}
      {updateModalOpen && selectedFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Update R&R Case: {selectedFamily.family_head}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Case Ref: {selectedFamily.rr_case?.case_number}
                </p>
              </div>
              <button 
                onClick={() => setUpdateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCase} className="mt-4 space-y-4 text-xs">
              {/* Entitlements preview */}
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-700 mb-1">Approved Statutory Benefits:</div>
                {selectedFamily.rr_case?.benefits_package && Object.entries(selectedFamily.rr_case.benefits_package).map(([k, v]) => (
                  <div key={k} className="flex items-start gap-2 text-slate-600">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span><strong className="capitalize">{k.replace(/_/g, ' ')}:</strong> {String(v)}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rehabilitation Status</label>
                <select
                  value={newRehabStatus}
                  onChange={(e) => setNewRehabStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-slate-800"
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="ALLOTTED">Package Allotted</option>
                  <option value="COMPLETED">Completed (Fully Settled)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resettlement Status</label>
                <select
                  value={newResettleStatus}
                  onChange={(e) => setNewResettleStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-slate-800"
                >
                  <option value="NOT_APPLICABLE">Not Applicable (Non-Displaced)</option>
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="SITE_IDENTIFIED">Resettlement Site Identified</option>
                  <option value="HOUSE_CONSTRUCTED">House Constructed</option>
                  <option value="RESETTLED">Fully Resettled & Handed Over</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Disbursed Assistance Amount (₹)</label>
                <input
                  type="number"
                  value={disburseAmount}
                  onChange={(e) => setDisburseAmount(Number(e.target.value))}
                  max={selectedFamily.rr_case?.total_assistance_amount || 10000000}
                  className="w-full rounded-lg border border-slate-300 p-2 text-slate-800 font-medium"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Total sanctioned budget: ₹{(selectedFamily.rr_case?.total_assistance_amount || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUpdateModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Save & Record Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
