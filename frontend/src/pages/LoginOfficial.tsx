import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Landmark, ShieldCheck } from 'lucide-react';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import type { OfficialRole } from '../types';

const roles: OfficialRole[] = ['NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'FIELD_OFFICER', 'PROJECT_OFFICER'];

const jurisdictionByRole: Record<OfficialRole, string> = {
  NATIONAL_ADMIN: 'All India',
  STATE_OFFICER: 'Jharkhand',
  DISTRICT_OFFICER: 'Jharkhand > Ranchi',
  FIELD_OFFICER: 'Jharkhand > Ranchi > Namkum',
  PROJECT_OFFICER: 'NH-143 Ranchi–Kolkata Corridor',
};

export function LoginOfficial() {
  const navigate = useNavigate();
  const { loginOfficial } = useAuth();
  const [name, setName] = useState('Anjali Verma');
  const [employeeId, setEmployeeId] = useState('GOV-JH-40217');
  const [role, setRole] = useState<OfficialRole>('DISTRICT_OFFICER');
  const [password, setPassword] = useState('••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginOfficial(name || 'Officer', role, jurisdictionByRole[role]);
    navigate('/gis-command');
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-navy-950 p-10 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft size={15} /> Back to portal selection
        </Link>
        <div>
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
            <Landmark size={22} />
          </div>
          <h1 className="font-display text-2xl font-extrabold leading-tight">Official Government Portal</h1>
          <p className="mt-3 max-w-sm text-sm text-slate-400">
            Role-based access to the National GIS Command Center, project bottleneck intelligence, and parcel-level
            audit trails across every state land registry.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={14} /> RBAC enforced · Session-scoped jurisdiction
        </div>
      </div>

      <div className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h2 className="font-display text-xl font-bold text-slate-900">Officer sign-in</h2>
          <p className="mt-1 text-sm text-slate-500">Enter your government-issued credentials.</p>

          <label className="mt-6 block text-xs font-semibold text-slate-600">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          <label className="mt-4 block text-xs font-semibold text-slate-600">Employee ID</label>
          <input
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-mono-data outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          <label className="mt-4 block text-xs font-semibold text-slate-600">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          <label className="mt-4 block text-xs font-semibold text-slate-600">Role scope (RBAC)</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as OfficialRole)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-slate-400">Jurisdiction: {jurisdictionByRole[role]}</p>

          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Sign in to Command Center
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            Not a government officer?{' '}
            <Link to="/login/landowner" className="font-semibold text-indigo-600">
              Go to the citizen portal
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
