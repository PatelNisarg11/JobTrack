// Import Firebase functions
import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";

import { getAnalytics } from "firebase/analytics";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMlY3CoVeOf2WdaBBVm7SsTMDF8j7imi0",
  authDomain: "jobtrack-f073b.firebaseapp.com",
  projectId: "jobtrack-f073b",
  storageBucket: "jobtrack-f073b.firebasestorage.app",
  messagingSenderId: "551627480078",
  appId: "1:551627480078:web:eeaa7f2ae1489f5057305f",
  measurementId: "G-8336B0X3R2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);

// Firestore Database
export const db = getFirestore(app);

// Analytics
export const analytics = getAnalytics(app);