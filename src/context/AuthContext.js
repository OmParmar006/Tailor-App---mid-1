import React, { createContext, useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 KEEP USER LOGGED IN (IMPORTANT FIX)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) {
          setUser({
            uid: firebaseUser.uid,
            ...snap.data(),
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ✅ SIGNUP
  const signup = async ({ name, phone, email, password, role }) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", res.user.uid), {
        name,
        phone,
        email,
        role,
        createdAt: new Date(),
      });

      return true;
    } catch (error) {
      console.log("Signup error:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGIN
  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const snap = await getDoc(doc(db, "users", res.user.uid));
      if (snap.exists()) {
        setUser({
          uid: res.user.uid,
          ...snap.data(),
        });
      }
    } catch (error) {
      console.log("Login error:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGOUT
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.log("Logout error:", error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


