import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, Popup, LayersControl, LayerGroup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Search, Filter, Layers, GitFork } from 'lucide-react';
import {
  states,
  districts,
  villages,
  projects,
  parcels,
  getStateName,
  getDistrictName,
  getVillageName,
  getProjectName,
} from '../data/mockData';
import type { RiskLevel } from '../types';
import { RiskBadge } from '../components/common/StatusBadge';
import { DivertedRouteModal } from '../components/gis/DivertedRouteModal';


const riskColor: Record<RiskLevel, string> = { LOW: '#059669', MEDIUM: '#d97706', HIGH: '#e11d48' };

export function GISCommandCenter() {
  const navigate = useNavigate();
  const [stateId, setStateId] = useState<string>('ALL');
  const [districtId, setDistrictId] = useState<string>('ALL');
  const [villageId, setVillageId] = useState<string>('ALL');
  const [projectId, setProjectId] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [rerouteProject, setRerouteProject] = useState<any | null>(null);


  const filteredDistricts = districts.filter((d) => stateId === 'ALL' || d.stateId === stateId);
  const filteredVillages = villages.filter((v) => districtId === 'ALL' || v.districtId === districtId);

  const filteredParcels = useMemo(() => {
    return parcels.filter((p) => {
      if (stateId !== 'ALL' && p.stateId !== stateId) return false;
      if (districtId !== 'ALL' && p.districtId !== districtId) return false;
      if (villageId !== 'ALL' && p.villageId !== villageId) return false;
      if (projectId !== 'ALL' && p.projectId !== projectId) return false;
      if (riskFilter !== 'ALL' && p.risk !== riskFilter) return false;
      if (query && !p.id.toLowerCase().includes(query.toLowerCase()) && !p.ownerName.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [stateId, districtId, villageId, projectId, riskFilter, query]);

  const summary = {
    total: filteredParcels.length,
    high: filteredParcels.filter((p) => p.risk === 'HIGH').length,
    medium: filteredParcels.filter((p) => p.risk === 'MEDIUM').length,
    low: filteredParcels.filter((p) => p.risk === 'LOW').length,
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Hierarchy:</span>
          <button onClick={() => { setStateId('ALL'); setDistrictId('ALL'); setVillageId('ALL'); }} className="hover:text-indigo-600">
            All India
          </button>
          {stateId !== 'ALL' && (
            <>
              <ChevronRight size={12} />
              <button onClick={() => { setDistrictId('ALL'); setVillageId('ALL'); }} className="hover:text-indigo-600">
                {getStateName(stateId)}
              </button>
            </>
          )}
          {districtId !== 'ALL' && (
            <>
              <ChevronRight size={12} />
              <button onClick={() => setVillageId('ALL')} className="hover:text-indigo-600">
                {getDistrictName(districtId)}
              </button>
            </>
          )}
          {villageId !== 'ALL' && (
            <>
              <ChevronRight size={12} />
              <span className="font-semibold text-indigo-700">{getVillageName(villageId)}</span>
            </>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search parcel ID or owner"
              className="rounded-lg border border-slate-300 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <select value={stateId} onChange={(e) => { setStateId(e.target.value); setDistrictId('ALL'); setVillageId('ALL'); }} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs">
            <option value="ALL">All states</option>
            {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={districtId} onChange={(e) => { setDistrictId(e.target.value); setVillageId('ALL'); }} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs">
            <option value="ALL">All districts</option>
            {filteredDistricts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={villageId} onChange={(e) => setVillageId(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs">
            <option value="ALL">All villages</option>
            {filteredVillages.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs">
            <option value="ALL">All projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="flex items-center gap-1 rounded-lg border border-slate-300 px-1.5 py-1">
            <Filter size={13} className="text-slate-400" />
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                  riskFilter === r ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {r === 'ALL' ? 'All risk' : r}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3 text-[11px] font-semibold text-slate-500">
            <button
              onClick={() => {
                const proj = projects.find((p) => p.id === projectId) || projects[0];
                setRerouteProject(proj);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
            >
              <GitFork size={13} />
              AI Route Diversion Studio
            </button>
            <span className="border-l border-slate-200 pl-3">{summary.total} parcels</span>
            <span className="flex items-center gap-1 text-rose-600"><span className="h-2 w-2 rounded-full bg-rose-500" />{summary.high}</span>
            <span className="flex items-center gap-1 text-amber-600"><span className="h-2 w-2 rounded-full bg-amber-500" />{summary.medium}</span>
            <span className="flex items-center gap-1 text-emerald-600"><span className="h-2 w-2 rounded-full bg-emerald-500" />{summary.low}</span>
          </div>
        </div>
      </div>

      <div className="relative flex-1">
        <MapContainer center={[22.6, 86.5]} zoom={7} scrollWheelZoom className="h-full w-full">
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Streets">
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite (Esri)">
              <TileLayer
                attribution="Tiles &copy; Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
            <LayersControl.Overlay checked name="Project corridors">
              <LayerGroup>
                {projects
                  .filter((p) => projectId === 'ALL' || p.id === projectId)
                  .map((p) => (
                    <Polyline
                      key={p.id}
                      positions={p.corridor.coordinates.map(([lng, lat]) => [lat, lng])}
                      pathOptions={{ color: p.type === 'HIGHWAY' ? '#4f46e5' : '#0ea5e9', weight: 4, dashArray: p.type === 'RAIL' ? '2 8' : undefined }}
                    >
                      <Popup>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-xs text-slate-500">{(p.totalLandRequiredSqm / 10000).toLocaleString()} ha required</p>
                      </Popup>
                    </Polyline>
                  ))}
              </LayerGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="Parcels">
              <LayerGroup>
                {filteredParcels.map((p) => (
                  <Polygon
                    key={p.id}
                    positions={
                      p.geometry.type === 'Polygon'
                        ? p.geometry.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number])
                        : []
                    }
                    pathOptions={{ color: riskColor[p.risk], fillColor: riskColor[p.risk], fillOpacity: 0.45, weight: 2 }}
                  >
                    <Popup>
                      <div className="text-xs">
                        <p className="font-mono-data font-semibold">{p.id}</p>
                        <p className="mt-1">{p.ownerName} · {getVillageName(p.villageId)}</p>
                        <p className="text-slate-500">{getProjectName(p.projectId)}</p>
                        <button
                          onClick={() => navigate(`/parcels/${p.id}`)}
                          className="mt-2 rounded-md bg-indigo-600 px-2 py-1 text-[11px] font-semibold text-white"
                        >
                          Open Parcel 360°
                        </button>
                      </div>
                    </Popup>
                  </Polygon>
                ))}
              </LayerGroup>
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>

        <div className="absolute bottom-4 left-4 z-[400] rounded-lg bg-white/95 px-3 py-2 text-[11px] shadow-lg backdrop-blur">
          <p className="mb-1 flex items-center gap-1.5 font-semibold text-slate-600"><Layers size={12} /> Legend</p>
          <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Blocked / High risk</div>
          <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Medium risk</div>
          <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> On track</div>
        </div>
      </div>

      <div className="max-h-40 overflow-y-auto border-t border-slate-200 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Parcel ID</th>
              <th className="px-4 py-2">Owner</th>
              <th className="px-4 py-2">Village</th>
              <th className="px-4 py-2">Project</th>
              <th className="px-4 py-2">Stage</th>
              <th className="px-4 py-2">Risk</th>
            </tr>
          </thead>
          <tbody>
            {filteredParcels.map((p) => (
              <tr key={p.id} onClick={() => navigate(`/parcels/${p.id}`)} className="cursor-pointer border-t border-slate-100 hover:bg-indigo-50/50">
                <td className="px-4 py-2 font-mono-data">{p.id}</td>
                <td className="px-4 py-2">{p.ownerName}</td>
                <td className="px-4 py-2">{getVillageName(p.villageId)}</td>
                <td className="px-4 py-2">{getProjectName(p.projectId)}</td>
                <td className="px-4 py-2">{p.stage}</td>
                <td className="px-4 py-2"><RiskBadge risk={p.risk} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Corridor Diversion Studio Modal */}
      {rerouteProject && (
        <DivertedRouteModal
          project={rerouteProject}
          onClose={() => setRerouteProject(null)}
          onRouteAdopted={() => {
            setRerouteProject(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
