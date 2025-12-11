"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError("Invalid credentials");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold text-center">Admin Login</h1>

        <div className="space-y-1">
          <label className="block text-sm text-slate-300">Username</label>
          <input
            className="w-full rounded-md bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-slate-300">Password</label>
          <input
            type="password"
            className="w-full rounded-md bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 hover:bg-blue-500 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
