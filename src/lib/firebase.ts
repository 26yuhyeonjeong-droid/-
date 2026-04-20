import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, onSnapshot, query, deleteDoc } from 'firebase/firestore';

import config from '../../firebase-applet-config.json';

let firebaseConfig = {
  apiKey: "PLACEHOLDER",
  authDomain: "PLACEHOLDER",
  projectId: "PLACEHOLDER",
  storageBucket: "PLACEHOLDER",
  messagingSenderId: "PLACEHOLDER",
  appId: "PLACEHOLDER",
  firestoreDatabaseId: "(default)"
};

if (config && config.apiKey !== "PLACEHOLDER") {
  firebaseConfig = { ...firebaseConfig, ...config };
} else {
  console.warn("Firebase configuration is missing or using placeholders. Please ensure set_up_firebase was run successfully.");
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || "(default)");
export const googleProvider = new GoogleAuthProvider();

// Auth helpers
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

// Firestore helpers
export { doc, getDoc, setDoc, collection, onSnapshot, query, deleteDoc };
