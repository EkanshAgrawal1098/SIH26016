import { NavLink, Outlet } from 'react-router-dom';
import { Map, LayoutDashboard, FileStack, Workflow, HeartHandshake, Smartphone } from 'lucide-react';
import { Header } from './Header';
import { BhoomiCopilot } from '../copilot/BhoomiCopilot';

const navItems = [
  { to: '/gis-command', label: 'GIS Command Center', icon: Map },
  { to: '/projects/PRJ-HW-01', label: 'Project 360°', icon: LayoutDashboard },
  { to: '/parcels/NLAMS-JH-RAN-0001', label: 'Parcel 360°', icon: FileStack },
  { to: '/rr-dashboard', label: 'R&R Management', icon: HeartHandshake },
  { to: '/field-officer', label: 'Field Portal (PWA)', icon: Smartphone },
  { to: '/interoperability', label: 'Interoperability', icon: Workflow },
];

export function OfficialLayout() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <nav className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white py-4 md:flex space-y-1">
          <div className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Platform Navigation
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `mx-2 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                  isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>

      {/* Global BhoomiAI Copilot Assistant */}
      <BhoomiCopilot />
    </div>
  );
}

