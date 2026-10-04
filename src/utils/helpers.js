// Small shared helpers

export const DEFAULT_STOCK = 10;

export const formatPrice = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

// Works with Firestore Timestamps, JS Dates and numbers.
export const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatDate = (value) => {
  const date = toDate(value);
  if (!date) return "Just now";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const formatDateTime = (value) => {
  const date = toDate(value);
  if (!date) return "Just now";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Turns Firebase errors into messages a customer can understand.
export const getFirebaseErrorMessage = (error) => {
  switch (error?.code) {
    case "permission-denied":
      return "Permission denied. The Firestore rules have not been published yet - publish firestore.rules from the project root in the Firebase console.";
    case "unavailable":
    case "timeout":
      return "We couldn't reach the server. Please check your internet connection and try again.";
    case "unauthenticated":
      return "Your session has expired. Please log in again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try logging in instead.";
    case "auth/weak-password":
      return "Please choose a stronger password (at least 6 characters).";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    case "auth/popup-blocked":
      return "The sign-in popup was blocked. Please allow popups and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
};

// Reject a promise if it does not settle in `ms` milliseconds.
export const withTimeout = (promise, ms = 15000) =>
  new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      const err = new Error("Request timed out");
      err.code = "timeout";
      reject(err);
    }, ms);

    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      }
    );
  });
