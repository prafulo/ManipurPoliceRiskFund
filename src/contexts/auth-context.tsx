'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { UserRole } from '@/lib/types';
import { useAuthUser } from '@/firebase';
import { getDoc, doc, getFirestore } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  role: UserRole;
  unit: string | null;
  loading: boolean;
  user: any;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuthUser();
  const [role, setRole] = useState<UserRole>('Unit Admin'); // Default role
  const [unit, setUnit] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserRole() {
      if (user) {
        const db = getFirestore();
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRole(userData.role || 'Unit Admin');
          setUnit(userData.unit || null);
        }
      }
      setLoading(false);
    }

    if (!authLoading) {
      fetchUserRole();
    }
  }, [user, authLoading]);
  
  const logout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, role, unit, loading: authLoading || loading, logout }}>
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
