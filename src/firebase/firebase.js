import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// ------------------------------------------------------------
// Firebase config
// Values come from .env (VITE_FIREBASE_*). The fallbacks keep the
// site working if you have not created a .env file yet.
// NOTE: Firebase web config is not a secret - your real security
// comes from Firestore/Storage rules (see firestore.rules).
// ------------------------------------------------------------
const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDHf992RNRk3mIRlMIjpm3ighWC64E3i-I",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "crafting-tales.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "crafting-tales",
  storageBucket:
    env.VITE_FIREBASE_STORAGE_BUCKET || "crafting-tales.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1037494232764",
  appId:
    env.VITE_FIREBASE_APP_ID || "1:1037494232764:web:e7636b8efa366121cc92b9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
};

export {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
};

export { storageRef, uploadBytes, getDownloadURL };
