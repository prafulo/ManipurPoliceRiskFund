'use client';
import { createContext, useContext, ReactNode } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseContextType {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({
  children,
  firebaseApp,
  auth,
  firestore,
}: {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}) {
  return (
    <FirebaseContext.Provider value={{ firebaseApp, auth, firestore }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp(): FirebaseApp {
  const context = useFirebase();
  if (!context.firebaseApp) {
    throw new Error('Firebase app not available');
  }
  return context.firebaseApp;
}

export function useAuth(): Auth {
  const context = useFirebase();
  if (!context.auth) {
    throw new Error('Firebase Auth not available');
  }
  return context.auth;
}

export function useFirestore(): Firestore {
  const context = useFirebase();
  if (!context.firestore) {
    throw new Error('Firebase Firestore not available');
  }
  return context.firestore;
}
