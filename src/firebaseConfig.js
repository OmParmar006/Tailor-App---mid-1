// import { initializeApp } from "firebase/app";
// import {
//   initializeAuth,
//   getReactNativePersistence,
// } from "firebase/auth";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyBW3E7wtyQDk0d4caYBr6CDB88E1UGQxuY",
//   authDomain: "tailor-measurement-app-e4b84.firebaseapp.com",
//   projectId: "tailor-measurement-app-e4b84",
//   storageBucket: "tailor-measurement-app-e4b84.appspot.com",
//   messagingSenderId: "577479263332",
//   appId: "1:577479263332:web:d1d181abca712dd93dcb71",
// };

// const app = initializeApp(firebaseConfig);

// /* ✅ IMPORTANT CHANGE HERE */
// export const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });

// export const db = getFirestore(app);


import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBW3E7wtyQDk0d4caYBr6CDB88E1UGQxuY",
  authDomain: "tailor-measurement-app-e4b84.firebaseapp.com",
  projectId: "tailor-measurement-app-e4b84",
  storageBucket: "tailor-measurement-app-e4b84.appspot.com",
  messagingSenderId: "577479263332",
  appId: "1:577479263332:web:d1d181abca712dd93dcb71",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
