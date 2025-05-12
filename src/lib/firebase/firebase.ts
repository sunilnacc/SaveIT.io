
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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

const missingConfigs = requiredConfigs.filter(key => !firebaseConfig[key]);

if (missingConfigs.length > 0) {
  const errorMessage = `Firebase configuration is missing or incomplete. Please check your .env file and ensure the following NEXT_PUBLIC_FIREBASE_ variables are set: ${missingConfigs.join(', ')}`;
  console.error(errorMessage);
  // Throw an error during server-side rendering or build time if critical configs are missing.
  // For client-side, this will also log, but might not halt execution in the same way.
  if (typeof window === 'undefined') {
    throw new Error(errorMessage);
  }
}


// Initialize Firebase
// Ensure this only runs once
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Error initializing Firebase app:", error);
    // Propagate the error if initialization fails, especially for server-side contexts
    if (typeof window === 'undefined') {
      throw error;
    }
  }
} else {
  app = getApp();
}

let auth: ReturnType<typeof getAuth>;
// const db = getFirestore(app);
// const storage = getStorage(app);

// Initialize Auth only if app was successfully initialized
if (app) {
  try {
    auth = getAuth(app);
  } catch (error) {
    console.error("Error initializing Firebase Auth:", error);
     if (typeof window === 'undefined') {
      throw error;
    }
    // Ensure auth is defined even if it fails, to prevent undefined errors later
    // Though, this means auth-dependent features will fail.
    // @ts-ignore
    auth = undefined; 
  }
} else {
   console.error("Firebase app not initialized. Auth cannot be initialized.");
   // @ts-ignore
   auth = undefined;
}


export { app, auth /*, db, storage */ };
