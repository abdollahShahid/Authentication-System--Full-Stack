"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

const Login = () => {
  const router = useRouter();
  const [user, setUser] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setButtonDisabled(!(user.email && user.password));
  }, [user]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post("/api/users/login", { ...user, rememberMe });
      toast.success("Login successful");
      router.push("/profile");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <style jsx>{`
        .login-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #000;
          padding: 1rem;
        }

        .login-container {
          background-color: #121212;
          padding: 2rem;
          border-radius: 12px;
          max-width: 360px;
          width: 100%;
          color: #fff;
          text-align: center;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.05);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .login-container.loading {
          opacity: 0.6;
          pointer-events: none;
          transform: scale(0.98);
        }

        h1 {
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
        }

        p {
          font-size: 0.9rem;
          color: #ccc;
          margin-bottom: 2rem;
        }

        .form-group {
          text-align: left;
          margin-bottom: 1.2rem;
          position: relative;
        }

        label {
          display: block;
          font-size: 0.9rem;
          margin-bottom: 0.4rem;
        }

        /* Base inputs */
        input[type="email"],
        input[type="password"],
        input[type="text"] {
          width: 100%;
          padding: 0.6rem;
          border-radius: 6px;
          border: 1px solid #333;
          background-color: #1e1e1e;
          color: #fff;
          font-size: 0.9rem;
          transition: background-color 0.25s ease, border-color 0.25s ease,
            color 0.25s ease;
        }

        input::placeholder {
          color: #888;
          transition: color 0.25s ease;
        }

        /* Focus effect: white background for ALL inputs (email + password + text) */
        input[type="email"]:focus,
        input[type="password"]:focus,
        input[type="text"]:focus {
          background-color: #fff;
          color: #000;
          border-color: #facc15; /* theme yellow */
          outline: none;
        }

        /* Make placeholder darker on white focus for readability */
        input[type="email"]:focus::placeholder,
        input[type="password"]:focus::placeholder,
        input[type="text"]:focus::placeholder {
          color: #666;
        }

        /* Toggle password eye/text */
        .toggle-password {
          position: absolute;
          top: 35px;
          right: 10px;
          cursor: pointer;
          font-size: 0.8rem;
          color: #facc15;
          user-select: none;
          transition: color 0.2s ease;
        }

        /* When the form group is focused (input turns white), darken the toggle so it stays visible */
        .form-group:focus-within .toggle-password {
          color: #111827; /* slate-900 on white field */
        }

        .remember-me {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
        }

        .remember-me input {
          margin-right: 0.5rem;
          accent-color: #facc15;
        }

        .login-button {
          width: 100%;
          padding: 0.75rem;
          font-weight: bold;
          font-size: 1rem;
          background-color: ${buttonDisabled ? "#fcd34d88" : "#facc15"};
          border: none;
          border-radius: 6px;
          color: #000;
          cursor: ${buttonDisabled ? "not-allowed" : "pointer"};
          transition: background-color 0.3s ease, transform 0.2s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        }

        .login-button:hover {
          background-color: ${buttonDisabled ? "#fcd34d88" : "#fbbf24"};
          transform: ${buttonDisabled ? "none" : "scale(1.02)"};
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #000;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .secondary-text {
          margin-top: 1.5rem;
          font-size: 0.85rem;
          color: #ccc;
        }

        .secondary-text a {
          color: #facc15;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .secondary-text a:hover {
          color: #fbbf24;
        }
      `}</style>

      <div className="login-wrapper">
        <div className={`login-container ${loading ? "loading" : ""}`}>
          <h1>{loading ? "Processing..." : "Login"}</h1>
          <p>Enter your credentials to access your account</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="••••••••"
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                disabled={loading}
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                disabled={loading}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={buttonDisabled || loading}
            >
              {loading && <span className="spinner" />}
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="secondary-text">
            Not a member? <a href="/signup">Create an account</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
