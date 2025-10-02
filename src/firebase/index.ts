import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

let firebaseApp: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!firebaseApp) {
    if (getApps().length > 0) {
      firebaseApp = getApp();
    } else {
      try {
        firebaseApp = initializeApp(firebaseConfig);
      } catch (e) {
        console.error('Could not initialize Firebase', e);
        // Fallback or further error handling
      }
    }

    if (firebaseApp) {
      auth = getAuth(firebaseApp);
      firestore = getFirestore(firebaseApp);
    }
  }

  // Ensure all services are initialized before returning
  if (!firebaseApp || !auth || !firestore) {
    // This state should ideally not be reached if initialization is successful.
    // Consider how to handle this case, maybe throw an error or have a retry mechanism.
    console.error("Firebase services could not be initialized.");
    // To satisfy the return type, we might need a more robust error handling strategy,
    // but for now, we'll throw an error to make the issue apparent.
    throw new Error("Failed to initialize Firebase services.");
  }
  
  return { firebaseApp, auth, firestore };
}

export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './errors';
export * from './error-emitter';
