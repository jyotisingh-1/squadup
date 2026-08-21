import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "../firebase/firebase";
import "../styles/login.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= LOGIN ================= */

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    if (!email.includes("@")) {
      setError("Enter a valid email");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("🎉 Login Successful!");

      navigate("/dashboard");

    } catch (error) {

      switch (error.code) {

        case "auth/invalid-credential":
          setError("Invalid email or password");
          break;

        case "auth/user-not-found":
          setError("User not found");
          break;

        case "auth/wrong-password":
          setError("Wrong password");
          break;

        case "auth/too-many-requests":
          setError("Too many attempts. Try again later.");
          break;

        default:
          setError(error.message);
      }

    } finally {
      setLoading(false);
    }
  };

  /* ================= FORGOT PASSWORD ================= */

  const handleForgotPassword = async () => {

    if (!email) {
      alert("Please enter your registered email first.");
      return;
    }

    try {

      await sendPasswordResetEmail(auth, email);

      alert(
        "Password reset link sent! 📧\nPlease check your email inbox."
      );

    } catch (error) {

      console.error("Password reset error:", error);

      switch (error.code) {

        case "auth/invalid-email":
          alert("Please enter a valid email address.");
          break;

        case "auth/user-not-found":
          alert("No account found with this email.");
          break;

        case "auth/too-many-requests":
          alert("Too many requests. Please try again later.");
          break;

        default:
          alert("Failed to send reset email: " + error.message);
      }

    }

  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          🎮 SquadUp
        </div>

        <h1>Welcome Back!</h1>

        <p>Login to find your perfect gaming squad.</p>

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <div className="input-box">

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

          </div>

          {/* PASSWORD */}

          <div className="input-box password-box">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </span>

          </div>

          {/* FORGOT PASSWORD */}

          <div className="forgot-password">

            <button
              type="button"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>

          </div>

          {/* ERROR */}

          {error && (
            <p
              className="error-msg"
              style={{
                color: "#ff4d4f",
                marginBottom: "15px",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="auth-bottom">
          Don't have an account?
          <Link to="/signup"> Create Account</Link>
        </div>

      </div>

    </div>
  );
}

export default Login;