import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "./Admin.css";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("adminLoggedIn", "true");
      window.location.href = "/admin";
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Invalid email or password");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <div className="admin-login-icon">&#128274;</div>
          <h1>Admin Login</h1>
          <p>Sri Laxmi Fashion Dashboard</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="modal-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="modal-field">
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: 60 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="admin-login-toggle"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-login-error">{error}</div>
          )}

          <button
            type="submit"
            className="admin-login-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="admin-login-loading">
                <span className="admin-loading-spinner" style={{ width: 18, height: 18, borderWidth: 2, marginBottom: 0 }} />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
