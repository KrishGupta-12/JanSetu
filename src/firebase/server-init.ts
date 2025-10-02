import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export async function initializeAdminApp() {
  const apps = getApps();
  if (apps.length > 0) {
    return getSdks(apps[0]);
  }

  // When deployed, this will use the GAE service account credentials.
  // In a local dev environment, it will use the credentials from running `gcloud auth application-default login`.
  const app = initializeApp();

  return getSdks(app);
}

function getSdks(app: App) {
  return {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}
