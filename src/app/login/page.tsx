"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("password123");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    setStatusMsg("Initializing Database & Demo Data...");
    const res = await fetch("/api/setup-demo", { method: "POST" });
    const data = await res.json();
    setStatusMsg(data.message || data.error);
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { redirect: false, email, password });
    if (res?.error) {
      setStatusMsg("Login failed! First click the green '1-Click Initialize Demo Database' button above.");
      setLoading(false);
    } else {
      router.push("/inbox");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">LazyChat AI MVP</h1>
          <p className="text-xs text-slate-500 mt-1">Complete Sales Automation Platform</p>
        </div>
        {statusMsg && <div className="rounded-lg bg-indigo-50 p-3 text-xs text-indigo-700 font-medium">{statusMsg}</div>}
        <button type="button" onClick={handleSeed} disabled={loading} className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white shadow">
          ⚡ First Time? 1-Click Initialize Demo Database
        </button>
        <form onSubmit={handleLogin} className="space-y-4 pt-2 border-t">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
            Sign In to Workspace
          </button>
        </form>
      </div>
    </div>
  );
}