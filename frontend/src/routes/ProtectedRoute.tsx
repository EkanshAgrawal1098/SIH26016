import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserMode } from '../types';

export function ProtectedRoute({ mode, children }: { mode: UserMode; children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={mode === 'official' ? '/login/official' : '/login/landowner'} replace />;
  if (user.mode !== mode) return <Navigate to={user.mode === 'official' ? '/gis-command' : '/citizen/dashboard'} replace />;
  return <>{children}</>;
}
