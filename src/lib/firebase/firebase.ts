
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate that all essential Firebase config values are present
const requiredConfigs: (keyof FirebaseOptions)[] = [
  'apiKey',
  'authDomain',
  'projectId',
];

const missingConfigKeys = requiredConfigs.filter(key => !firebaseConfig[key]);

if (missingConfigKeys.length > 0) {
  const envVarNames = missingConfigKeys.map(key => {
    // Construct the expected environment variable name
    if (key === 'apiKey') return 'NEXT_PUBLIC_FIREBASE_API_KEY';
    if (key === 'authDomain') return 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN';
    if (key === 'projectId') return 'NEXT_PUBLIC_FIREBASE_PROJECT_ID';
    // Add other mappings if necessary
    return `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`;
  });
  const errorMessage = `CRITICAL: Firebase configuration is missing or incomplete. Please ensure the following environment variables are set in your .env file: ${envVarNames.join(', ')}`;
  console.error(errorMessage);
  // Throw an error to halt execution if critical configs are missing.
  // This error will be thrown when this module is first imported.
  throw new Error(errorMessage);
}


let app: FirebaseApp;
let auth: Auth;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} catch (error) {
  const appInitError = `CRITICAL: Firebase app initialization failed. This can be due to incorrect or incomplete Firebase config values. Error: ${(error as Error).message}`;
  console.error(appInitError, firebaseConfig);
  throw new Error(appInitError);
}

try {
  auth = getAuth(app);
} catch (error) {
  // This can be due to invalid API key (e.g., auth/invalid-api-key) even if the key is present but incorrect for the project.
  const authInitError = `CRITICAL: Firebase Auth initialization failed. This might be due to an invalid API key or other Firebase project misconfiguration. Error: ${(error as Error).message}`;
  console.error(authInitError);
  throw new Error(authInitError);
}

export { app, auth /*, db, storage */ };
