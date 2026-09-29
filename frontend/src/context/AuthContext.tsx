import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { AppUser, OfficialRole } from '../types';
import { landowner } from '../data/mockData';

interface AuthContextValue {
  user: AppUser | null;
  loginOfficial: (name: string, role: OfficialRole, jurisdiction: string) => void;
  loginLandowner: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loginOfficial: (name, role, jurisdiction) => {
        const initials = name
          .split(' ')
          .map((p) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();
        setUser({
          mode: 'official',
          id: `OFF-${Math.floor(Math.random() * 9000 + 1000)}`,
          name,
          role,
          jurisdiction,
          avatarInitials: initials || 'GO',
        });
      },
      loginLandowner: () => {
        setUser(landowner);
      },
      logout: () => setUser(null),
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export const ROLE_LABELS: Record<OfficialRole, string> = {
  NATIONAL_ADMIN: 'National Admin',
  STATE_OFFICER: 'State Officer',
  DISTRICT_OFFICER: 'District Officer',
  FIELD_OFFICER: 'Field Officer',
  PROJECT_OFFICER: 'Project Officer',
};
