import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { OfficialLayout } from './components/layout/OfficialLayout';
import { CitizenLayout } from './components/layout/CitizenLayout';

import { Landing } from './pages/Landing';
import { LoginOfficial } from './pages/LoginOfficial';
import { LoginLandowner } from './pages/LoginLandowner';
import { GISCommandCenter } from './pages/GISCommandCenter';
import { ProjectDashboard } from './pages/ProjectDashboard';
import { ParcelView } from './pages/ParcelView';
import { Interoperability } from './pages/Interoperability';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { RRDashboard } from './pages/RRDashboard';
import { FieldOfficerPortal } from './pages/FieldOfficerPortal';

// Fix default Leaflet marker icons under bundlers
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login/official" element={<LoginOfficial />} />
          <Route path="/login/landowner" element={<LoginLandowner />} />

          {/* Official Portal Routes */}
          <Route
            element={
              <ProtectedRoute mode="official">
                <OfficialLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/gis-command" element={<GISCommandCenter />} />
            <Route path="/projects/:id" element={<ProjectDashboard />} />
            <Route path="/parcels/:id" element={<ParcelView />} />
            <Route path="/rr-dashboard" element={<RRDashboard />} />
            <Route path="/field-officer" element={<FieldOfficerPortal />} />
            <Route path="/interoperability" element={<Interoperability />} />
          </Route>

          {/* Citizen / Landowner Routes */}
          <Route
            element={
              <ProtectedRoute mode="landowner">
                <CitizenLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
