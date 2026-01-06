'use client';
import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase.config.js';

// Re-export hooks and providers
export * from './provider';
export * from './hooks/use-collection';
export * from './hooks/use-doc';
export * from './hooks/use-auth-user';
export * from './client-provider';


function initializeFirebase() {
    if (getApps().length > 0) {
        return getApp();
    }
    return initializeApp(firebaseConfig as FirebaseOptions);
}

export const firebaseApp = initializeFirebase();

export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
