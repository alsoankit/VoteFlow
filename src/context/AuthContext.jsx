import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Google Login
  const login = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
    setUserData(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        setUserData(null);
        setLoading(false);
        return;
      }

      try {
        // Check global settings
        const settingsRef = doc(db, "settings", "global");
        const settingsSnap = await getDoc(settingsRef);

        if (!settingsSnap.exists()) {
          await signOut(auth);
          setLoading(false);
          return;
        }

        const { loginEnabled, adminloginEnabled, superadminloginEnabled } = settingsSnap.data();

        // Fetch user from whitelist or dynamically create a public anonymous showcase profile
        const userRef = doc(db, "users", user.email);
        const userSnap = await getDoc(userRef);

        let userInfo;

        if (!userSnap.exists()) {
          userInfo = {
            name: user.displayName || "Showcase Visitor",
            email: user.email,
            role: "user",
            projectId: "Riddhi", 
            hasVotedPR: false,
            hasVotedPOC: false
          };
          await setDoc(userRef, userInfo);
        } else {
          userInfo = userSnap.data();
        }

        const role = userInfo.role;

        // Role-based login constraints
        if (role === "user" && loginEnabled === false) {
          await signOut(auth);
          alert("Student login is currently disabled by administrators.");
          setLoading(false);
          return;
        }

        if (role === "admin" && adminloginEnabled === false) {
          await signOut(auth);
          alert("Admin login is currently disabled.");
          setLoading(false);
          return;
        }

        if (role === "superadmin" && superadminloginEnabled === false) {
          await signOut(auth);
          alert("Superadmin login is currently disabled.");
          setLoading(false);
          return;
        }

        setCurrentUser(user);
        setUserData(userInfo);
      } catch (error) {
        console.error("Auth error:", error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userData,
        login,
        logout,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};