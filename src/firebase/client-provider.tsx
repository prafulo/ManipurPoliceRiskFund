'use client';

import { firebaseApp, auth, firestore } from '@/firebase';
import { FirebaseProvider } from '@/firebase/provider';
import { ReactNode } from 'react';

// This provider is a client-side wrapper that ensures Firebase is initialized only once.
// It should be used as high up in the component tree as possible.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
