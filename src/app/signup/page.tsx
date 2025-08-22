"use client";
import React, { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>(
    {}
  );

  useEffect(() => setMounted(true), []);

  const validatePassword = (pwd: string): string | undefined => {
    if (pwd.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pwd)) return "Must include at least one uppercase letter";
    if (!/[a-z]/.test(pwd)) return "Must include at least one lowercase letter";
    if (!/[0-9]/.test(pwd)) return "Must include at least one number";
    if (!/[!@#$%^&*()[\]{}\-_=+~`|\\;:'\",.<>/?]/.test(pwd))
      return "Must include at least one special character";
    return undefined;
  };

  useEffect(() => {
    const next: typeof errors = {};
    const pwdErr = user.password ? validatePassword(user.password) : undefined;
    if (pwdErr) next.password = pwdErr;
    if (user.confirmPassword && user.confirmPassword !== user.password)
      next.confirm = "Passwords do not match";
    setErrors(next);

    const valid =
      user.username.trim() &&
      user.email.trim() &&
      !pwdErr &&
      user.confirmPassword === user.password;

    setButtonDisabled(!valid);
  }, [user]);

  const safeRedirectToLogin = () => {
    try {
      startTransition(() => router.push("/login"));
      setTimeout(() => {
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/login"
        ) {
          window.location.assign("/login");
        }
      }, 250);
    } catch {
      if (typeof window !== "undefined") window.location.assign("/login");
    }
  };

  const onSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (errors.password || errors.confirm) {
      toast.error("Please fix the errors before signing up");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        username: user.username.trim(),
        email: user.email.trim(),
        password: user.password,
      };

      // Handle non-2xx without throwing, so we can show server messages.
      const res = await axios.post("/api/users/signup", payload, {
        validateStatus: () => true,
      });

      if (res.status >= 200 && res.status < 300) {
        toast.success("Signup successful! Please log in");
        setTimeout(safeRedirectToLogin, 800);
        return;
      }

      // Show helpful server error message (e.g., 409 user exists)
      toast.error(res?.data?.message || `Signup failed (${res.status})`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Signup failed";
      toast.error(msg);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <style jsx>{`
        .signup-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #000;
          padding: 1rem;
        }
        .signup-container {
          background-color: #121212;
          padding: 2rem;
          border-radius: 12px;
          max-width: 400px;
          width: 100%;
          color: #fff;
          text-align: center;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.05);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .signup-container.loading {
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
        input {
          width: 100%;
          padding: 0.6rem;
          border-radius: 6px;
          border: 1px solid #333;
          background-color: #1e1e1e;
          color: #fff;
          font-size: 0.9rem;
        }
        input::placeholder {
          color: #888;
        }
        .toggle-password {
          position: absolute;
          top: 35px;
          right: 10px;
          cursor: pointer;
          font-size: 0.8rem;
          color: #facc15;
          user-select: none;
        }
        .error-text {
          margin-top: 0.4rem;
          font-size: 0.8rem;
          color: #f87171;
        }
        .signup-button {
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
        }
        .signup-button:hover {
          background-color: ${buttonDisabled ? "#fcd34d88" : "#fbbf24"};
          transform: ${buttonDisabled ? "none" : "scale(1.02)"};
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

      <div className="signup-wrapper">
        <div className={`signup-container ${loading ? "loading" : ""}`}>
          <h1>{loading ? "Processing..." : "Signup"}</h1>
          <p>Create your account</p>

          <form onSubmit={onSignup}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="your username"
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
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
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                disabled={loading}
                required
                minLength={8}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
              {errors.password && (
                <div className="error-text">{errors.password}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="repeat password"
                value={user.confirmPassword}
                onChange={(e) =>
                  setUser({ ...user, confirmPassword: e.target.value })
                }
                disabled={loading}
                required
                minLength={8}
              />
              <span
                className="toggle-password"
                onClick={() => setShowConfirmPassword((p) => !p)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </span>
              {errors.confirm && (
                <div className="error-text">{errors.confirm}</div>
              )}
            </div>

            <button
              type="submit"
              className="signup-button"
              disabled={buttonDisabled || loading}
            >
              {loading ? "Signing up..." : "Signup"}
            </button>
          </form>

          <div className="secondary-text">
            Already have an account? <Link href="/login">Login here</Link>
          </div>
        </div>
      </div>
    </>
  );
}
