import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import {
  db,
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from "../firebase/firebase";

const WishlistContext = createContext(null);

const GUEST_KEY = "crafting-tales-wishlist-guest";

const readGuest = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(GUEST_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const writeGuest = (ids) => {
  try {
    window.localStorage.setItem(GUEST_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
};

export const WishlistProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();

  const [guestIds, setGuestIds] = useState(readGuest);
  const [cloudIds, setCloudIds] = useState([]);

  const uid = user?.uid;

  // Logged in: keep wishlist live from Firestore.
  useEffect(() => {
    if (authLoading) return undefined;

    if (!uid) {
      setCloudIds([]);
      return undefined;
    }

    // Move anything saved while logged out into the account.
    const pending = readGuest();
    if (pending.length > 0) {
      Promise.all(
        pending.map((productId) =>
          setDoc(doc(db, "users", uid, "wishlist", productId), {
            productId,
            addedAt: serverTimestamp(),
          })
        )
      )
        .then(() => {
          writeGuest([]);
          setGuestIds([]);
        })
        .catch((error) => console.warn("Wishlist merge failed:", error.code));
    }

    return onSnapshot(
      collection(db, "users", uid, "wishlist"),
      (snapshot) => setCloudIds(snapshot.docs.map((d) => d.id)),
      (error) => console.warn("Wishlist unavailable:", error.code)
    );
  }, [uid, authLoading]);

  const wishlistIds = uid ? cloudIds : guestIds;

  const isInWishlist = useCallback(
    (productId) => wishlistIds.includes(String(productId)),
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (product) => {
      const productId = String(product.id);
      const exists = wishlistIds.includes(productId);

      if (!uid) {
        const next = exists
          ? guestIds.filter((id) => id !== productId)
          : [...guestIds, productId];
        setGuestIds(next);
        writeGuest(next);
        toast.success(exists ? "Removed from wishlist" : "Added to wishlist");
        return;
      }

      try {
        const ref = doc(db, "users", uid, "wishlist", productId);

        if (exists) {
          await deleteDoc(ref);
          toast.success("Removed from wishlist");
        } else {
          await setDoc(ref, { productId, addedAt: serverTimestamp() });
          toast.success("Added to wishlist");
        }
      } catch (error) {
        console.error("Wishlist update failed:", error);
        toast.error("Couldn't update your wishlist. Please try again.");
      }
    },
    [uid, wishlistIds, guestIds, toast]
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      const id = String(productId);

      if (!uid) {
        const next = guestIds.filter((x) => x !== id);
        setGuestIds(next);
        writeGuest(next);
        return;
      }

      try {
        await deleteDoc(doc(db, "users", uid, "wishlist", id));
      } catch (error) {
        console.error("Wishlist remove failed:", error);
        toast.error("Couldn't remove that item. Please try again.");
      }
    },
    [uid, guestIds, toast]
  );

  const value = useMemo(
    () => ({
      wishlistIds,
      wishlistCount: wishlistIds.length,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
    }),
    [wishlistIds, isInWishlist, toggleWishlist, removeFromWishlist]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return context;
};
