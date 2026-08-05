import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Change to "./firebase" if this file is directly inside src

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);

      localStorage.setItem("adminLoggedIn", "true");

      window.location.href = "/admin";
    } catch (err) {
      console.error(err);
      setError("❌ Invalid Email or Password");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#111827",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "#1f2937",
          padding: "40px",
          borderRadius: "20px",
          width: "380px",
          boxShadow: "0 0 20px rgba(0,0,0,0.4)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "white",
            marginBottom: "30px",
          }}
        >
          🔒 Admin Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "10px",
            border: "none",
          }}
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "10px",
            border: "none",
          }}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            marginBottom: "20px",
            background: "transparent",
            color: "#60a5fa",
            border: "none",
            cursor: "pointer",
          }}
        >
          {showPassword ? "🙈 Hide Password" : "👁 Show Password"}
        </button>

        {error && (
          <p
            style={{
              color: "#ef4444",
              marginBottom: "15px",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "15px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;