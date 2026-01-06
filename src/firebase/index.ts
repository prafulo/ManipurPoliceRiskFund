'use client';
import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Re-export hooks and providers
export * from './hooks';
export * from './provider';
export * from './client-provider';


const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


function initializeFirebase() {
    if (getApps().length > 0) {
        return getApp();
    }
    return initializeApp(firebaseConfig);
}

export const firebaseApp = initializeFirebase();

export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && !(auth as any).emulatorConfig) {
    // Set up emulators
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(firestore, 'localhost', 8080);
}
