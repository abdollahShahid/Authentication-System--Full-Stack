"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tokenFromUrl =
    searchParams?.get("token") || searchParams?.get("t") || "";

  const [token, setToken] = useState<string>(tokenFromUrl);
  const [status, setStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >(tokenFromUrl ? "verifying" : "idle");
  const [message, setMessage] = useState<string>("");
  const [cooldown, setCooldown] = useState<number>(0);

  // If URL changes (client-side nav), keep token in sync
  useEffect(() => {
    if (tokenFromUrl && tokenFromUrl !== token) {
      setToken(tokenFromUrl);
      setStatus("verifying");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenFromUrl]);

  const disabled = useMemo(
    () => status === "verifying" || cooldown > 0,
    [status, cooldown]
  );

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const verify = async () => {
    if (!token) {
      toast.error("Missing verification token");
      return;
    }
    try {
      setStatus("verifying");
      setMessage("");
      const { data } = await axios.post<{
        message?: string;
        redirect?: string;
      }>("/api/users/verifyemail", { token });
      setStatus("success");
      setMessage(data?.message || "Email verified successfully.");
      toast.success("Email verified ✅");
      // Optional: auto-redirect after a short delay
      setTimeout(() => router.push(data?.redirect || "/login"), 1200);
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setStatus("error");
      const msg =
        e.response?.data?.message || e.message || "Verification failed";
      setMessage(msg);
      toast.error(msg);
    }
  };

  const resend = async () => {
    try {
      setCooldown(15); // prevent rapid retries
      const { data } = await axios.post<{ message?: string }>(
        "/api/users/resend-verification",
        {
          // If your backend needs an email, you can collect it or
          // read from an existing session on the server.
          token,
        }
      );
      toast.success(data?.message || "Verification email sent");
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      toast.error(e.response?.data?.message || e.message || "Couldn't resend");
    }
  };

  useEffect(() => {
    if (status === "verifying") verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="rounded-2xl bg-white/80 p-6 text-center shadow-xl ring-1 ring-black/5 backdrop-blur dark:bg-slate-900/60">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Verify your email
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {status === "success"
                ? "You're all set! Redirecting to login…"
                : status === "error"
                ? "We couldn't verify your email. You can try again or request a new link."
                : "Hang tight while we verify your link."}
            </p>

            {/* Token bubble (hidden if no token) */}
            {token && (
              <div className="mx-auto mt-4 max-w-full break-all rounded-xl bg-amber-100 px-3 py-2 text-sm text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                token: {token}
              </div>
            )}

            {/* Status content */}
            <div className="mt-6">
              {status === "verifying" && (
                <div className="mx-auto flex max-w-xs items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-b-transparent"
                    aria-hidden
                  />
                  Verifying…
                </div>
              )}

              {status === "success" && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                  <p className="text-sm font-medium">{message}</p>
                  <div className="mt-3">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-300"
                    >
                      Go to Login
                    </Link>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
                  <p className="text-sm font-medium">{message}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={verify}
                      className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-800 focus-visible:ring-2 focus-visible:ring-rose-300"
                    >
                      Try again
                    </button>
                    <button
                      onClick={resend}
                      disabled={disabled}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Meta */}
            <p className="mt-6 text-xs text-slate-500">
              Opened this page accidentally?{" "}
              <Link href="/signup" className="underline underline-offset-4">
                Create an account
              </Link>{" "}
              or{" "}
              <Link href="/login" className="underline underline-offset-4">
                log in
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
