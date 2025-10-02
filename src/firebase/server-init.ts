import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { firebaseConfig } from './config';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export async function initializeAdminApp() {
  const apps = getApps();
  if (apps.length > 0) {
    return getSdks(apps[0]);
  }

  const app = initializeApp({
    projectId: firebaseConfig.projectId,
  });

  return getSdks(app);
}

function getSdks(app: App) {
  return {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}
