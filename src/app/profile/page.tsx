"use client";

import React from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();

  const logout = async () => {
    try {
      await axios.post("/api/users/logout");
      toast.success("Logout successful");
      router.push("/login");
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      toast.error(e.response?.data?.message || e.message || "Logout failed");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        {/* Funny round avatar */}
        <div style={styles.avatar}>
          <svg viewBox="0 0 48 48" style={styles.emoji} aria-hidden="true">
            <circle cx="24" cy="24" r="22" fill="#FFEEA9" />
            <path
              d="M10 20h8l2-3h8l2 3h8"
              stroke="#0F172A"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M16 31c2.5 2.5 13.5 2.5 16 0"
              stroke="#0F172A"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <span style={styles.sparkle} />
        </div>

        {/* Big red logout button */}
        <button onClick={logout} style={styles.button}>
          <span
            style={{ display: "inline-flex", gap: 8, alignItems: "center" }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M16 13v-2H7V8l-5 4 5 4v-3h9z" />
              <path d="M20 3h-8v2h8v14h-8v2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
            </svg>
            Log Out
          </span>
        </button>
      </div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "#0b1220", // dark
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
  },
  avatar: {
    height: 80,
    width: 80,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ec4899, #f59e0b)",
    display: "grid",
    placeItems: "center",
    position: "relative",
    boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
  },
  emoji: {
    height: 48,
    width: 48,
    filter: "drop-shadow(0 2px 2px rgba(0,0,0,.2))",
  },
  sparkle: {
    position: "absolute",
    top: -4,
    right: -4,
    height: 10,
    width: 10,
    background: "rgba(255,255,255,0.9)",
    borderRadius: "50%",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  button: {
    width: 220,
    padding: "12px 20px",
    fontWeight: 700,
    fontSize: 18,
    color: "white",
    background: "#dc2626",
    border: "none",
    borderRadius: 12,
    boxShadow: "0 10px 20px rgba(220,38,38,0.35)",
    cursor: "pointer",
    transition:
      "transform 120ms ease, background 160ms ease, box-shadow 160ms ease",
  },
};

// tiny global keyframes injection for the sparkle
if (typeof document !== "undefined") {
  const id = "profile-pulse-anim";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML =
      "@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.3)}100%{transform:scale(1)}}";
    document.head.appendChild(style);
  }
}
