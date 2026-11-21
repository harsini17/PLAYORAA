
import { useState } from "react";
import "./Login.css";

function Login({ onLoginSuccess, onShowRegister }) {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      localStorage.setItem("playoraToken", data.token);
      localStorage.setItem("playoraUser", JSON.stringify(data.user));

      setMessage("Login successful!");

      onLoginSuccess(data.user);

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">

        <h1 className="login-logo">PLAYORA</h1>
        <p className="login-subtitle">
          Stream in Harmony
        </p>

        <h2>Welcome Back</h2>
        <p className="login-description">
          Login to continue enjoying your favourite music.
        </p>

        <form onSubmit={handleSubmit}>

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your registered email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              className="show-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "LOGIN"}
          </button>

        </form>

        {message && (
          <p className="login-message">{message}</p>
        )}

        <p className="register-link">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onShowRegister}
          >
            Register
          </button>
        </p>

      </div>
    </div>
  );
}

export default Login;
