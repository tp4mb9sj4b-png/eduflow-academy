"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@eduflow.academy");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Identifiants invalides.");
    } else {
      router.push("/admin");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6 dark:from-slate-950 dark:to-slate-900">
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl2 border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl2 bg-eduflow text-sm font-bold text-white">
            EF
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900 dark:text-white">Espace admin</h1>
            <p className="text-xs text-slate-400">EduFlow Academy</p>
          </div>
        </div>

        <label className="mb-1 block text-xs font-medium text-slate-500">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="mb-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-eduflow/30 dark:border-slate-700 dark:bg-slate-800"
        />
        <label className="mb-1 block text-xs font-medium text-slate-500">Mot de passe</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="admin123 (démo)"
          className="mb-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-eduflow/30 dark:border-slate-700 dark:bg-slate-800"
        />

        {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-eduflow py-2 text-sm font-medium text-white transition hover:bg-eduflow-dark disabled:opacity-60"
        >
          <Lock size={14} />
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <p className="mt-3 text-center text-[11px] text-slate-400">
          Identifiants de démo créés par le seed : voir .env / README.
        </p>
      </motion.form>
    </main>
  );
}
