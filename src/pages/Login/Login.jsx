import { useState } from "react";
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "../../firebase/firebase";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { getFirebaseErrorMessage } from "../../utils/helpers";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Where to go after login (e.g. back to checkout).
  const redirectTo = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================
  // EMAIL / PASSWORD LOGIN
  // =========================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      setSuccess("Login successful!");

      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 400);
    } catch (err) {
      console.error(err);
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // FORGOT PASSWORD
  // =========================================

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Enter your email address above, then click 'Forgot password'.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess("Password reset email sent. Please check your inbox.");
    } catch (err) {
      console.error(err);
      setError(getFirebaseErrorMessage(err));
    }
  };

  // =========================================
  // GOOGLE LOGIN
  // =========================================

  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);

      setSuccess("Google login successful!");

      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 400);
    } catch (err) {
      console.error(err);
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // JSX
  // =========================================

  return (
    <main className="login-page">

      {/* Decorations */}

      <div className="login-decoration login-decoration-one">
        ✿
      </div>

      <div className="login-decoration login-decoration-two">
        ❀
      </div>


      {/* Login Card */}

      <section className="login-card">

        {/* Header */}

        <div className="login-header">

          <Link
            to="/"
            className="login-logo"
          >
            Crafting Tales
          </Link>

          <p className="login-eyebrow">
            WELCOME BACK
          </p>

          <h1>
            Sign In
          </h1>

          <p className="login-subtitle">
            Sign in to continue exploring our
            handmade creations.
          </p>

        </div>


        {/* Messages */}

        {error && (
          <div className="login-message login-error">
            {error}
          </div>
        )}

        {success && (
          <div className="login-message login-success">
            {success}
          </div>
        )}


        {/* =====================================
            EMAIL LOGIN
        ===================================== */}

        <form
          className="login-form"
          onSubmit={handleLogin}
        >

          {/* Email */}

          <div className="login-field">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              disabled={loading}
              required
            />

          </div>


          {/* Password */}

          <div className="login-field">

            <label htmlFor="password">
              Password
            </label>

            <div className="password-wrapper">

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                disabled={loading}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                disabled={loading}
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>


          <button
            type="button"
            className="login-forgot"
            onClick={handleForgotPassword}
            disabled={loading}
          >
            Forgot password?
          </button>

          {/* Login Button */}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>


        {/* =====================================
            DIVIDER
        ===================================== */}

        <div className="login-divider">
          <span>OR</span>
        </div>


        {/* =====================================
            GOOGLE LOGIN
        ===================================== */}

        <button
          type="button"
          className="google-login-button"
          onClick={handleGoogleLogin}
          disabled={loading}
        >

          <span className="google-icon">
            G
          </span>

          <span>
            Continue with Google
          </span>

        </button>


        {/* =====================================
            REGISTER
        ===================================== */}

        <div className="login-switch">

          <span>
            Don't have an account?
          </span>

          <Link to="/register" state={{ from: redirectTo }}>
            Create an account
          </Link>

        </div>


        {/* Home */}

        <Link
          to="/"
          className="login-home-link"
        >
          ← Back to Home
        </Link>

      </section>

    </main>
  );
};

export default Login;