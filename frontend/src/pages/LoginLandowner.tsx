import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UserRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Method = 'aadhaar' | 'ownerRef' | 'phone';

export function LoginLandowner() {
  const navigate = useNavigate();
  const { loginLandowner } = useAuth();
  const [method, setMethod] = useState<Method>('phone');
  const [identifier, setIdentifier] = useState('+91 98••••••41');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const sendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpSent(true);
  };

  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    loginLandowner();
    navigate('/citizen/dashboard');
  };

  const methodTabs: { id: Method; label: string }[] = [
    { id: 'phone', label: 'Phone OTP' },
    { id: 'aadhaar', label: 'Aadhaar OTP' },
    { id: 'ownerRef', label: 'Owner Ref ID' },
  ];

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-navy-950 p-10 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft size={15} /> Back to portal selection
        </Link>
        <div>
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
            <UserRound size={22} />
          </div>
          <h1 className="font-display text-2xl font-extrabold leading-tight">Citizen &amp; Landowner Portal</h1>
          <p className="mt-3 max-w-sm text-sm text-slate-400">
            See only what belongs to you: your parcels, your compensation, your documents. Nothing more.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={14} /> Access limited to your linked parcels
        </div>
      </div>

      <div className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-xl font-bold text-slate-900">Landowner sign-in</h2>
          <p className="mt-1 text-sm text-slate-500">Verify your identity to view your parcels.</p>

          <div className="mt-5 flex rounded-lg bg-slate-100 p-1">
            {methodTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setMethod(tab.id);
                  setOtpSent(false);
                }}
                className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                  method === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {!otpSent ? (
            <form onSubmit={sendOtp}>
              <label className="mt-5 block text-xs font-semibold text-slate-600">
                {method === 'phone' ? 'Registered phone number' : method === 'aadhaar' ? 'Aadhaar number' : 'Owner Reference ID'}
              </label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-mono-data outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <button
                type="submit"
                className="mt-5 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Send OTP
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp}>
              <p className="mt-5 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 ring-1 ring-emerald-200">
                A 6-digit OTP was sent to {identifier}. (Synthetic demo — use any 6 digits.)
              </p>
              <label className="mt-4 block text-xs font-semibold text-slate-600">Enter OTP</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                placeholder="••••••"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-center text-lg font-mono-data tracking-[0.5em] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <button
                type="submit"
                className="mt-5 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Verify &amp; view my parcels
              </button>
            </form>
          )}

          <p className="mt-4 text-center text-xs text-slate-400">
            Are you a government officer?{' '}
            <Link to="/login/official" className="font-semibold text-emerald-700">
              Go to the official portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
