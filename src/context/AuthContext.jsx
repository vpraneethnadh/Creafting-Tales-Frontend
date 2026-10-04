import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  auth,
  db,
  doc,
  getDoc,
  onAuthStateChanged,
} from "../firebase/firebase";
import { ensureUserProfile } from "../services/userService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Make sure users/{uid} exists (email, Google, anything).
        try {
          await ensureUserProfile(currentUser);
        } catch (error) {
          console.warn("Could not create user profile:", error);
        }

        // Admin = has a document at admins/{uid}.
        try {
          const adminSnap = await getDoc(doc(db, "admins", currentUser.uid));
          setIsAdmin(adminSnap.exists());
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Call after updateProfile() so the navbar/profile re-render.
  const refreshUser = useCallback(async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser(auth.currentUser);
      setVersion((v) => v + 1);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin,
      isLoggedIn: !!user,
      refreshUser,
      version,
    }),
    [user, loading, isAdmin, refreshUser, version]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
