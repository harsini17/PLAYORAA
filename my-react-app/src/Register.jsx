
import { useState } from "react";

function Register({ onShowLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/users/register",
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
        throw new Error(data.message || "Registration failed.");
      }

      setSuccess(true);
      setMessage("Account created successfully! Please login.");

      setFormData({
        username: "",
        email: "",
        password: ""
      });

    } catch (error) {
      setSuccess(false);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">

        <h1>PLAYORA</h1>
        <p>Create your account</p>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Create a password (minimum 6 characters)"
            value={formData.password}
            onChange={handleChange}
            minLength={6}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "REGISTER"}
          </button>

        </form>

        {message && (
          <p
            className="register-message"
            style={{
              color: success ? "#65d69a" : "#ff7777"
            }}
          >
            {message}
          </p>
        )}

        <p className="register-login-link">
          Already have an account?{" "}
          <button type="button" onClick={onShowLogin}>
            Login
          </button>
        </p>

      </div>
    </div>
  );
}

export default Register;
