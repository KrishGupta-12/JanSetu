
import { initializeApp, getApps, App, type AppOptions } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function getSdks(app: App) {
  return {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}

export async function initializeAdminApp() {
  const apps = getApps();
  if (apps.length > 0) {
    return getSdks(apps[0]);
  }

  // When deployed to a Google Cloud environment, the Admin SDK is
  // automatically initialized with project credentials.
  const app = initializeApp();
  return getSdks(app);
}
