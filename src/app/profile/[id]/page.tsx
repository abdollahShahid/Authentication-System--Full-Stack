"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { Toaster, toast } from "react-hot-toast";

// ---- Types
interface PageProps {
  params: { id: string };
}

interface User {
  _id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Safely parse various API response shapes to a User
function parseUserFromPayload(payload: unknown): User | null {
  if (!payload || typeof payload !== "object") return null;
  const anyPayload = payload as any;

  let maybe: any = null;
  if (anyPayload.data && typeof anyPayload.data === "object") {
    maybe = anyPayload.data;
  } else if (anyPayload.user && typeof anyPayload.user === "object") {
    maybe = anyPayload.user;
  } else if (
    "_id" in anyPayload ||
    "email" in anyPayload ||
    "name" in anyPayload ||
    "role" in anyPayload
  ) {
    maybe = anyPayload;
  }

  if (
    maybe &&
    typeof maybe === "object" &&
    typeof (maybe as any)._id === "string"
  ) {
    return maybe as User;
  }
  return null;
}

export default function Page({ params }: PageProps) {
  const router = useRouter();
  const { id } = params;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initials = useMemo(() => {
    const n = (user?.name || user?.email || "?").trim();
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, [user?.name, user?.email]);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get(
          `/api/users/${encodeURIComponent(id)}`,
          {
            withCredentials: true,
            headers: { Accept: "application/json" },
            signal: controller.signal as any,
          }
        );
        const u = parseUserFromPayload(data);
        if (!u) throw new Error((data as any)?.message || "User not found");
        setUser(u);
      } catch (err) {
        const e = err as AxiosError<{ message?: string }>;
        const status = e.response?.status;
        const msg =
          e.response?.data?.message || e.message || "Failed to load user";
        setError(msg);
        console.error("GET /api/users/[id] error:", status, e.response?.data);
        if (status === 401) {
          toast.error(
            "You're not authenticated. Please log in to view your profile."
          );
          // router.push("/login"); // intentionally avoid auto-redirect on 401 so the page doesn't feel like a logout
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [id, router]);

  const copyId = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(id);
        toast.success("User ID copied");
      } else {
        throw new Error("Clipboard not available");
      }
    } catch (err: any) {
      toast.error(err?.message || "Couldn't copy ID");
    }
  };

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(`/api/users/${encodeURIComponent(id)}`, {
        withCredentials: true,
        headers: { Accept: "application/json" },
      });
      const u = parseUserFromPayload(data);
      if (!u) throw new Error((data as any)?.message || "User not found");
      setUser(u);
      toast.success("Refreshed");
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Refresh failed";
      toast.error(msg);
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* Local Toaster in case a global one isn't mounted */}
      <Toaster position="top-right" />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav
          className="mb-6 text-sm text-slate-600 dark:text-slate-300"
          aria-label="Breadcrumb"
        >
          <ol className="flex items-center gap-2">
            <li>
              <Link
                href="/profile"
                className="underline underline-offset-4 hover:no-underline"
              >
                Profile
              </Link>
            </li>
            <li aria-hidden className="opacity-60">
              /
            </li>
            <li className="font-medium truncate max-w-[60vw]">{id}</li>
          </ol>
        </nav>

        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          {/* Left: Main card */}
          <section className="rounded-2xl bg-white/80 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur dark:bg-slate-900/60">
            <header className="mb-5 flex items-center gap-4">
              {/* Avatar */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-base font-semibold text-slate-700 ring-1 ring-black/5 dark:bg-slate-800 dark:text-slate-200">
                {initials}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
                  {user?.name || "User"}
                </h1>
                <p className="truncate text-sm text-slate-600 dark:text-slate-300">
                  {user?.email || "—"}
                </p>
              </div>
            </header>

            {/* Content */}
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-24 w-full rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
                <p className="text-sm font-medium">{error}</p>
                <button
                  onClick={refetch}
                  className="mt-3 rounded-lg bg-rose-700 px-3 py-1.5 text-sm text-white hover:bg-rose-800 focus-visible:ring-2 focus-visible:ring-rose-300"
                >
                  Try again
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">
                    ID: {user?._id}
                  </span>
                  {user?.role && (
                    <span className="rounded bg-blue-100 px-2 py-1 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                      {user.role}
                    </span>
                  )}
                  <button
                    onClick={copyId}
                    className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-slate-700 dark:bg-slate-900"
                  >
                    Copy ID
                  </button>
                </div>

                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">
                      Created
                    </dt>
                    <dd className="text-sm text-slate-800 dark:text-slate-200">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleString()
                        : "—"}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">
                      Updated
                    </dt>
                    <dd className="text-sm text-slate-800 dark:text-slate-200">
                      {user?.updatedAt
                        ? new Date(user.updatedAt).toLocaleString()
                        : "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </section>

          {/* Right: Actions */}
          <aside className="grid gap-3 self-start">
            <button
              onClick={() => router.push("/profile")}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-400 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Back to Profile
            </button>
            <button
              onClick={refetch}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Refresh
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
