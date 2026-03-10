import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// 🔐 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBW3E7wtyQDk0d4caYBr6CDB88E1UGQxuY",
  authDomain: "tailor-measurement-app-e4b84.firebaseapp.com",
  projectId: "tailor-measurement-app-e4b84",
  storageBucket: "tailor-measurement-app-e4b84.appspot.com",
  messagingSenderId: "577479263332",
  appId: "1:577479263332:web:d1d181abca712dd93dcb71",
};

// 🚀 Prevent multiple app initialization (VERY IMPORTANT)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 🔑 React Native Persistent Auth (Best for Expo)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // If already initialized, use existing auth
  auth = getAuth(app);
}

// 🗄️ Firestore Database
const db = getFirestore(app);

export { app, auth, db };