import { Link } from 'react-router-dom';
import { Landmark, UserRound, ArrowRight, MapPin, Smartphone, Layers } from 'lucide-react';

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <div className="flex items-center justify-between px-6 py-5 sm:px-10 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-display font-extrabold shadow-md shadow-indigo-600/30">
            N
          </div>
          <div>
            <p className="font-display text-sm font-bold leading-tight tracking-wide">NLAMS</p>
            <p className="text-[11px] leading-tight text-slate-400">National Land Acquisition &amp; Management System</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>PostgreSQL + PostGIS • FastAPI Active</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mb-10 max-w-3xl text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-400 ring-1 ring-indigo-500/30">
            <MapPin size={13} /> Smart India Hackathon 2026 Prototype
          </span>
          
          {/* Core Headline Differentiator */}
          <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-5xl text-slate-100">
            An interoperability and intelligence layer over existing land-acquisition and land-record systems.
          </h1>
          
          <p className="mt-4 text-sm text-slate-400 sm:text-base max-w-2xl mx-auto">
            Unifying heterogeneous state cadastres (Jharkhand Khesra, Maharashtra Survey No, UP Gata) into a single canonical GIS ledger — with explainable risk and bottleneck intelligence and statutory R&amp;R tracking.
          </p>
        </div>

        {/* Portal Entry Cards */}
        <div className="grid w-full max-w-5xl gap-5 sm:grid-cols-3">
          {/* 1. Official Portal */}
          <Link
            to="/login/official"
            className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-6 transition hover:border-indigo-500 hover:bg-slate-900 shadow-xl"
          >
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                <Landmark size={22} />
              </div>
              <h2 className="font-display text-base font-bold text-slate-100">Official Command Center</h2>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                National, State, District &amp; Project officer dashboards, Project 360, R&amp;R tracking, and bottleneck diagnosis.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
              Sign in as an officer <ArrowRight size={14} className="transition group-hover:translate-x-1" />
            </div>
          </Link>

          {/* 2. Responsive Field Officer Portal */}
          <Link
            to="/field-officer"
            className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-6 transition hover:border-purple-500 hover:bg-slate-900 shadow-xl"
          >
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                <Smartphone size={22} />
              </div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-bold text-slate-100">Field Officer Portal</h2>
                <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full">PWA / Web</span>
              </div>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Assigned work queue, live ground GPS verification, cadastral boundary alignment &amp; geo-tagged photo evidence.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-purple-400 group-hover:text-purple-300">
              Launch field verification <ArrowRight size={14} className="transition group-hover:translate-x-1" />
            </div>
          </Link>

          {/* 3. Citizen & Landowner Portal */}
          <Link
            to="/login/landowner"
            className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-6 transition hover:border-emerald-500 hover:bg-slate-900 shadow-xl"
          >
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <UserRound size={22} />
              </div>
              <h2 className="font-display text-base font-bold text-slate-100">Citizen &amp; Landowner View</h2>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Check personal parcel status, award amounts, DBT compensation timestamps, public notices &amp; submit grievances.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
              Sign in as a landowner <ArrowRight size={14} className="transition group-hover:translate-x-1" />
            </div>
          </Link>
        </div>

        {/* Prototype vs Production Architectural Matrix Section */}
        <div className="mt-16 w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                <Layers size={14} /> Architecture Blueprint
              </div>
              <h3 className="text-lg font-bold text-slate-100 mt-1">SIH Prototype vs. Production Infrastructure</h3>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              TRD Section 15 &amp; 18 Design Strategy
            </span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">System Component</th>
                  <th className="py-3 px-4 text-indigo-300">SIH Working Prototype</th>
                  <th className="py-3 px-4 text-emerald-300">Production Implementation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-100">Government APIs</td>
                  <td className="py-3.5 px-4 text-indigo-300/90">Multi-state schema adapters (Jharkhand, MH, WB, UP)</td>
                  <td className="py-3.5 px-4 text-emerald-300/90">Authorized API gateways (NIC, DILRMP, Bhoomi Rashi)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-100">Landowner Records</td>
                  <td className="py-3.5 px-4 text-indigo-300/90">Synthetic / anonymized data (privacy-safe demo)</td>
                  <td className="py-3.5 px-4 text-emerald-300/90">Authorized state RoR / Aadhaar-masked registries</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-100">GIS &amp; Cadastral</td>
                  <td className="py-3.5 px-4 text-indigo-300/90">PostGIS + GeoJSON vector corridor boundaries</td>
                  <td className="py-3.5 px-4 text-emerald-300/90">National Spatial Data Infrastructure &amp; NAKSHA survey</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-100">Risk &amp; Bottlenecks</td>
                  <td className="py-3.5 px-4 text-indigo-300/90">Explainable rule-based scoring engine (+disputes, +delays)</td>
                  <td className="py-3.5 px-4 text-emerald-300/90">Hybrid rule-based baseline + trained XGBoost ML model</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-100">Field Inspections</td>
                  <td className="py-3.5 px-4 text-indigo-300/90">Responsive Mobile Web / PWA field portal with GPS capture</td>
                  <td className="py-3.5 px-4 text-emerald-300/90">Offline-first native mobile app with encrypted sync</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-100">Document OCR</td>
                  <td className="py-3.5 px-4 text-indigo-300/90">Simulated / candidate field extraction preview</td>
                  <td className="py-3.5 px-4 text-emerald-300/90">PaddleOCR / Tesseract asynchronous pipeline</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-100">Architecture Scale</td>
                  <td className="py-3.5 px-4 text-indigo-300/90">Clean modular monolith (FastAPI + Supabase PostgreSQL)</td>
                  <td className="py-3.5 px-4 text-emerald-300/90">Scalable cloud deployment with managed cache &amp; MinIO S3</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
