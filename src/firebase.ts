import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore, 
  initializeFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "AIzaSyAIJWdYfZ4oYeDv0ZLRzA423Xb_ur2KsJ8",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0413158308.firebaseapp.com",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0413158308",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0413158308.firebasestorage.app",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "79067193325",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:79067193325:web:1ad8abfb7ce8343b7ad1e4"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with standard or multi-database option
const databaseId = (import.meta as any).env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || "ai-studio-8b98b1f4-5ef7-44b1-950b-991286127ce0";
export const db = databaseId 
  ? initializeFirestore(app, {}, databaseId) 
  : getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Standardize standard helper queries logic for easy CRUD throughout the app
export {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
};
