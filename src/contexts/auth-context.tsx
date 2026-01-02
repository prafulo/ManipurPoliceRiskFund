'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { UserRole } from '@/lib/types';

interface AuthContextType {
  role: UserRole;
  unit: string | null;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('Super Admin');
  const [unit, setUnit] = useState<string | null>(null);

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'Unit Admin') {
      setUnit('1MR'); // Default unit for demo
    } else {
      setUnit(null);
    }
  };

  return (
    <AuthContext.Provider value={{ role, unit, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
