import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../services/firebase';

// This context handles all things authentication for the app.
// It lets you sign up, log in, log out, and reset passwords anywhere in the app without passing props everywhere.
const AuthContext = createContext();

// Custom hook so you can just call useAuth() to get all auth stuff
export function useAuth() {
  return useContext(AuthContext);
}

// This provider wraps the whole app and keeps track of auth state (who's logged in, etc.)
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null); // Stores the logged-in user (or null)
  const [loading, setLoading] = useState(true); // True while we check if user is logged in

  // Sign up with email and password
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Log in with email and password
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Log out the current user
  function logout() {
    return signOut(auth);
  }

  // Send a password reset email
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // When the app loads, listen for auth state changes (login/logout)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    // Clean up the listener when component unmounts
    return unsubscribe;
  }, []);

  // All the stuff we want to share with the rest of the app
  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    loading
  };

  // Provide the auth context to all children components
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
