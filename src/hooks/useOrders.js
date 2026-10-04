import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserOrders } from "../services/orderService";
import { getFirebaseErrorMessage } from "../utils/helpers";

// Loads the logged-in customer's orders.
export const useOrders = () => {
  const { user } = useAuth();
  const uid = user?.uid;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!uid) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      setOrders(await getUserOrders(uid));
    } catch (err) {
      console.error("Could not load orders:", err);
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    load();
  }, [load]);

  return { orders, loading, error, reload: load };
};
