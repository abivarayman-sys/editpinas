import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 1. MACTANSHINE (Main App) Configuration
// Assuming your existing firebase-applet-config.json contains the mactanshine config
import mactanshineConfig from '../firebase-applet-config.json';

const mainApp = initializeApp(mactanshineConfig);
export const db = getFirestore(mainApp, mactanshineConfig.firestoreDatabaseId);
export const auth = getAuth(mainApp);
export const googleProvider = new GoogleAuthProvider();

// 2. PHOTOBOOTH (Secondary App) Configuration
const photoboothConfig = {
  apiKey: "AIzaSyBx6hAr7s3NBJUToVvOaJGp2OZn4s5lXVs",
  authDomain: "photobooth-fdd10.firebaseapp.com",
  projectId: "photobooth-fdd10",
  storageBucket: "photobooth-fdd10.firebasestorage.app",
  messagingSenderId: "749633572995",
  appId: "1:749633572995:web:5a0217e9eca4cd18d80bb6",
  measurementId: "G-QQJTL9BCPD"
};

// Initialize the secondary app with a unique name ('photoboothApp')
const photoboothApp = initializeApp(photoboothConfig, 'photoboothApp');
export const photoboothDb = getFirestore(photoboothApp);

// --- Auth Exports ---
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

// --- Error Handling Exports ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      // ... keep your existing error auth mapping here ...
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}