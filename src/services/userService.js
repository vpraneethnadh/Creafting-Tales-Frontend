import {
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "../firebase/firebase";

// Creates users/{uid} the first time a person signs in (any method).
export const ensureUserProfile = async (user, extra = {}) => {
  if (!user) return;

  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    await setDoc(ref, {
      name: extra.name || user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      phone: "",
      address: { address: "", city: "", state: "", pincode: "" },
      createdAt: serverTimestamp(),
    });
  }
};

export const getUserProfile = async (uid) => {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? snapshot.data() : null;
};
