import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import "../styles/login.css";
import { sendPasswordResetEmail } from "firebase/auth";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
  const handleForgotPassword = async () => {

  if (!email) {
    toast.error("Please enter your email first.");
    return;
  }

  try {

    await sendPasswordResetEmail(auth, email);

    toast.success(
      "Password reset link sent to your email 📧"
    );

  } catch (error) {

    switch (error.code) {

      case "auth/user-not-found":
        toast.error("No account found with this email.");
        break;

      case "auth/invalid-email":
        toast.error("Enter a valid email.");
        break;

      default:
        toast.error(error.message);

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

          <div className="input-box">

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

          </div>

          <div className="input-box password-box">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="forgot-password">

               <button
                  type="button"
                  onClick={handleForgotPassword}
                 >
                  
                Forgot Password?
                </button>

            </div>
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