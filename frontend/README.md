# NLAMS — National Land Acquisition & Management System

A production-ready React + TypeScript frontend for the Smart India Hackathon 2026 brief: a canonical, interoperable
land-acquisition record spanning state registries, infrastructure projects, and landowners.

## Stack
- React 19 + TypeScript + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- React Router DOM (client-side routing, RBAC-gated routes)
- React-Leaflet + Leaflet (GIS mapping, corridors, parcel polygons)
- Lucide React (icons)

## Getting started

```bash
npm install
npm run dev       # start local dev server
npm run build     # production build to dist/
npm run preview   # preview the production build
```

## Demo accounts

**Official portal** (`/login/official`): fill in any name/employee ID and pick an RBAC role
(National Admin, State Officer, District Officer, Field Officer, Project Officer) — the form logs you straight in
with a jurisdiction scope derived from the role.

**Citizen portal** (`/login/landowner`): choose Phone OTP / Aadhaar OTP / Owner Reference ID, submit to receive a
synthetic OTP, then enter any 6 digits to sign in as the demo landowner **Suresh Mahato**, who owns two parcels
across Jharkhand and West Bengal.

## Structure

```
src/
  types.ts                 Canonical Land Model + domain types
  data/mockData.ts         3 states, 5 districts, 10 villages, 2 projects, 10 parcels, alerts, mapping rules
  context/AuthContext.tsx  Official/landowner session switching
  components/layout/       Header, official sidebar layout, citizen layout
  components/common/       StatusBadge, StageTimeline (signature rail-motif), Modal, KPICard
  pages/
    Landing.tsx             Portal selector
    LoginOfficial.tsx        RBAC login
    LoginLandowner.tsx       OTP-based login
    GISCommandCenter.tsx     National map, hierarchy drill-down, layer control
    ProjectDashboard.tsx     Project 360°, KPIs, bottleneck intelligence
    ParcelView.tsx           Parcel 360°, timeline, tabs, OCR/conflict/transition modals
    Interoperability.tsx    State schema adapter, mapping rules, sync monitor
    CitizenDashboard.tsx    Landowner dashboard, financials, documents, grievance form
```

## Notes
- All data is synthetic and defined in `src/data/mockData.ts` — no backend is required.
- Stage transitions, officer assignment, and grievance filing are wired to modal flows with mock submit handlers;
  swap in real API calls where indicated.
- Map tiles are served from public OpenStreetMap / Esri endpoints — internet access is required at runtime.
