import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  auth,
  db,
  doc,
  setDoc,
  createUserWithEmailAndPassword,
  updateProfile,
} from "../../firebase/firebase";
import { getFirebaseErrorMessage } from "../../utils/helpers";
import "../Login/Login.css";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await updateProfile(credential.user, { displayName: name.trim() });

      // AuthContext creates users/{uid}; make sure the typed name is in it.
      await setDoc(
        doc(db, "users", credential.user.uid),
        { name: name.trim(), email: email.trim() },
        { merge: true }
      ).catch((err) => console.warn("Profile save failed:", err.code));

      setSuccess("Account created! Welcome to Crafting Tales.");

      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 500);
    } catch (err) {
      console.error(err);
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">

      <div className="login-decoration login-decoration-one">✿</div>
      <div className="login-decoration login-decoration-two">❀</div>

      <section className="login-card">

        <div className="login-header">
          <Link to="/" className="login-logo">
            Crafting Tales
          </Link>

          <p className="login-eyebrow">JOIN US</p>

          <h1>Create Account</h1>

          <p className="login-subtitle">
            Sign up to save your favourites, track your orders and
            check out faster.
          </p>
        </div>

        {error && (
          <div className="login-message login-error">{error}</div>
        )}

        {success && (
          <div className="login-message login-success">{success}</div>
        )}

        <form className="login-form" onSubmit={handleRegister}>

          <div className="login-field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>

            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        <div className="login-switch">
          <span>Already have an account?</span>
          <Link to="/login" state={{ from: redirectTo }}>
            Sign in
          </Link>
        </div>

        <Link to="/" className="login-home-link">
          ← Back to Home
        </Link>

      </section>

    </main>
  );
};

export default Register;
