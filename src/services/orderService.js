import {
  db,
  doc,
  collection,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "../firebase/firebase";

import { toDate, withTimeout } from "../utils/helpers";

// ---------------------------------------------------------
// ORDER STATUS
// ---------------------------------------------------------

export const ORDER_STEPS = [
  "Order Placed",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
];

export const ORDER_STATUSES = [...ORDER_STEPS, "Cancelled"];

// ---------------------------------------------------------
// PAYMENT METHODS
// ---------------------------------------------------------

export const PAYMENT_METHODS = {
  COD: "Cash on Delivery",
  UPI: "UPI",
};

// ---------------------------------------------------------
// GENERATE ORDER NUMBER
// ---------------------------------------------------------

export const generateOrderNumber = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return `CT-${code}`;
};

// ---------------------------------------------------------
// SORT ORDERS
// ---------------------------------------------------------

const newestFirst = (a, b) =>
  (toDate(b.createdAt)?.getTime() || Date.now()) -
  (toDate(a.createdAt)?.getTime() || Date.now());

// ---------------------------------------------------------
// CREATE ORDER
// ---------------------------------------------------------

export const placeOrder = async ({
  user,
  customer,
  items,
  total,
  paymentMethod = PAYMENT_METHODS.COD,
}) => {
  const orderRef = doc(collection(db, "orders"));

  const orderNumber = generateOrderNumber();

  const isUPI = paymentMethod === PAYMENT_METHODS.UPI;

  const order = {
    orderNumber,

    userId: user.uid,

    customer: {
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
    },

    items: items.map((item) => ({
      id: String(item.id),
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      image: typeof item.image === "string" ? item.image : "",
      category: item.category || "",
    })),

    total: Number(total),

    // -----------------------------------------------------
    // PAYMENT INFORMATION
    // -----------------------------------------------------

    paymentMethod: isUPI
      ? PAYMENT_METHODS.UPI
      : PAYMENT_METHODS.COD,

    // QR payments are manually verified by the admin.
    paymentStatus: isUPI
      ? "Pending Verification"
      : "Pending",

    // -----------------------------------------------------
    // ORDER STATUS
    // -----------------------------------------------------

    status: "Order Placed",

    statusHistory: [
      {
        status: "Order Placed",
        at: Date.now(),
      },
    ],

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await withTimeout(
    setDoc(orderRef, order),
    15000
  );

  return {
    id: orderRef.id,
    orderNumber,
  };
};

// ---------------------------------------------------------
// GET USER ORDERS
// ---------------------------------------------------------

export const getUserOrders = async (uid) => {
  const snapshot = await getDocs(
    query(
      collection(db, "orders"),
      where("userId", "==", uid)
    )
  );

  return snapshot.docs
    .map((d) => ({
      id: d.id,
      ...d.data(),
    }))
    .sort(newestFirst);
};

// ---------------------------------------------------------
// GET ONE ORDER
// ---------------------------------------------------------

export const getOrderById = async (id) => {
  const snapshot = await getDoc(
    doc(db, "orders", id)
  );

  return snapshot.exists()
    ? {
        id: snapshot.id,
        ...snapshot.data(),
      }
    : null;
};

// ---------------------------------------------------------
// GET ALL ORDERS - ADMIN
// ---------------------------------------------------------

export const getAllOrders = async () => {
  const snapshot = await getDocs(
    collection(db, "orders")
  );

  return snapshot.docs
    .map((d) => ({
      id: d.id,
      ...d.data(),
    }))
    .sort(newestFirst);
};

// ---------------------------------------------------------
// APPEND STATUS HISTORY
// ---------------------------------------------------------

const appendHistory = (order, status) => [
  ...(Array.isArray(order.statusHistory)
    ? order.statusHistory
    : []),

  {
    status,
    at: Date.now(),
  },
];

// ---------------------------------------------------------
// UPDATE ORDER STATUS
// ---------------------------------------------------------

export const updateOrderStatus = async (
  order,
  status
) => {
  await updateDoc(
    doc(db, "orders", order.id),
    {
      status,

      statusHistory: appendHistory(
        order,
        status
      ),

      updatedAt: serverTimestamp(),
    }
  );
};

// ---------------------------------------------------------
// CANCEL ORDER
// ---------------------------------------------------------

export const cancelOrder = (order) =>
  updateOrderStatus(
    order,
    "Cancelled"
  );