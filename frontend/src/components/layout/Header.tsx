import { Bell, LogOut, MapPinned, RadioTower, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLE_LABELS } from '../../context/AuthContext';
import { bottleneckAlerts, syncStatuses } from '../../data/mockData';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAlerts, setShowAlerts] = useState(false);
  if (!user) return null;

  const staleCount = syncStatuses.filter((s) => s.freshness !== 'FRESH').length;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-navy-700 bg-navy-900 px-4 text-white sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-display font-extrabold">
          N
        </div>
        <div className="hidden sm:block">
          <p className="font-display text-sm font-bold leading-tight">NLAMS</p>
          <p className="text-[11px] leading-tight text-slate-400">National Land Acquisition &amp; Management System</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {user.mode === 'official' && (
          <div className="hidden items-center gap-1.5 rounded-lg bg-navy-800 px-3 py-1.5 text-xs text-slate-300 md:flex">
            <MapPinned size={14} className="text-indigo-400" />
            {user.jurisdiction}
          </div>
        )}

        <div className="hidden items-center gap-1.5 rounded-lg bg-navy-800 px-3 py-1.5 text-xs text-slate-300 lg:flex">
          <RadioTower size={14} className={staleCount > 0 ? 'text-amber-400' : 'text-emerald-400'} />
          {staleCount > 0 ? `${staleCount} source feed stale` : 'All state feeds fresh'}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowAlerts((s) => !s)}
            className="relative rounded-lg p-2 text-slate-300 transition hover:bg-navy-800 hover:text-white"
          >
            <Bell size={18} />
            {bottleneckAlerts.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold">
                {bottleneckAlerts.length}
              </span>
            )}
          </button>
          {showAlerts && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-2xl">
              <p className="px-2 py-1 text-xs font-bold uppercase tracking-wide text-slate-400">SLA &amp; Risk Alerts</p>
              <div className="max-h-72 overflow-y-auto">
                {bottleneckAlerts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setShowAlerts(false);
                      navigate(`/parcels/${a.parcelId}`);
                    }}
                    className="block w-full rounded-lg px-2 py-2 text-left text-xs hover:bg-slate-50"
                  >
                    <span
                      className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                        a.severity === 'HIGH' ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                    />
                    <span className="font-semibold">{a.parcelId}</span> — {a.summary}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-l border-navy-700 pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold">
            {user.mode === 'official' ? user.avatarInitials : user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold leading-tight">{user.name}</p>
            <p className="text-[11px] leading-tight text-slate-400">
              {user.mode === 'official' ? ROLE_LABELS[user.role] : 'Landowner'}
            </p>
          </div>
          <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="rounded-lg p-2 text-slate-300 transition hover:bg-navy-800 hover:text-rose-400"
          title="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
