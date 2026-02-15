import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

console.log('🔧 Loading Firebase config...');
console.log('API Key available:', !!import.meta.env.VITE_FIREBASE_API_KEY);
console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'NO_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'NO_AUTH_DOMAIN',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'NO_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'NO_STORAGE',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'NO_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'NO_APP_ID',
};

let app = null;
let db = null;
let auth = null;
let isFirebaseInitialized = false;
let firebaseError = null;

try {
  // Check if config has actual values (not just demo/placeholders)
  const hasValidConfig = 
    firebaseConfig.apiKey && 
    !firebaseConfig.apiKey.includes('your_') &&
    !firebaseConfig.apiKey.includes('demo_') &&
    firebaseConfig.projectId && 
    !firebaseConfig.projectId.includes('your_');

  if (!hasValidConfig) {
    throw new Error('Firebase config contains placeholder values - using localStorage');
  }

  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  
  // Initialize Firestore
  db = getFirestore(app);
  
  // Initialize Auth
  auth = getAuth(app);
  
  isFirebaseInitialized = true;
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.warn('⚠️ Firebase initialization skipped:', error.message);
  console.log('💾 Will use localStorage instead');
  firebaseError = error;
  isFirebaseInitialized = false;
  
  // Set to null so app doesn't crash
  db = null;
  auth = null;
}

export { db, auth, isFirebaseInitialized, firebaseError };
export default app;


