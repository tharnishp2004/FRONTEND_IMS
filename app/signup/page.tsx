"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight, UserPlus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/app/lib/api";

export default function SignUpPage() {
  const [form, setForm] = useState({ name: "", username: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (form.password.length < 3) {
      return setError("Password must be at least 3 characters.");
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          username: form.username,
          password: form.password,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Failed to create account. Username may already exist.");
      }
    } catch (err) {
      setError("Failed to connect to the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-[#171332] relative overflow-hidden font-sans py-12">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5a4bfa] opacity-20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative w-full max-w-[440px] bg-[#1e1a3f] rounded-[32px] p-8 shadow-2xl border border-white/5">

        {/* Success State */}
        {success ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-[#10b981]" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase mb-2">Account Created!</h2>
            <p className="text-[#6b678e] text-sm font-medium">Redirecting you to login...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8 text-white">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-[#15112c] border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                <UserPlus className="w-7 h-7 text-[#5a4bfa]" />
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">Create Account</h2>
              <p className="text-[10px] font-bold tracking-widest text-[#6b678e] uppercase">
                First user becomes Admin · Others get Viewer
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm font-bold text-center">
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black tracking-widest text-[#6b678e] uppercase ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-[#6b678e]" />
                  </div>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="block w-full pl-11 pr-4 py-4 bg-[#15112c] border border-transparent rounded-xl text-white placeholder-[#4a4665] focus:outline-none focus:ring-2 focus:ring-[#5a4bfa] transition-all font-semibold"
                    placeholder="Your full name" />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black tracking-widest text-[#6b678e] uppercase ml-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-[#6b678e]" />
                  </div>
                  <input type="text" required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                    className="block w-full pl-11 pr-4 py-4 bg-[#15112c] border border-transparent rounded-xl text-white placeholder-[#4a4665] focus:outline-none focus:ring-2 focus:ring-[#5a4bfa] transition-all font-semibold"
                    placeholder="Choose a username" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black tracking-widest text-[#6b678e] uppercase ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-[#6b678e]" />
                  </div>
                  <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className="block w-full pl-11 pr-4 py-4 bg-[#15112c] border border-transparent rounded-xl text-white placeholder-[#4a4665] focus:outline-none focus:ring-2 focus:ring-[#5a4bfa] transition-all font-semibold"
                    placeholder="Create a password" />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black tracking-widest text-[#6b678e] uppercase ml-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-[#6b678e]" />
                  </div>
                  <input type="password" required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    className="block w-full pl-11 pr-4 py-4 bg-[#15112c] border border-transparent rounded-xl text-white placeholder-[#4a4665] focus:outline-none focus:ring-2 focus:ring-[#5a4bfa] transition-all font-semibold"
                    placeholder="Repeat your password" />
                </div>
              </div>

              {/* Role info banner */}
              <div className="p-3 rounded-xl bg-[#5a4bfa]/10 border border-[#5a4bfa]/20 text-[#a9a3f7] text-xs font-bold text-center leading-relaxed">
                🛡️ All new accounts start as <span className="text-white">Admin</span>.<br />
                Roles can be changed later from the Admin → Users panel.
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex justify-center items-center space-x-2 py-4 rounded-xl text-sm font-black text-white bg-[#5a4bfa] hover:bg-[#4b3de6] transition-colors shadow-[0_0_20px_rgba(90,75,250,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                <span>{loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="mt-6 relative flex items-center justify-center">
                <div className="absolute w-full h-[1px] bg-white/5"></div>
                <span className="bg-[#1e1a3f] px-4 text-[9px] font-bold tracking-widest text-[#4a4665] uppercase z-10">
                  Already have an account?
                </span>
              </div>

              <Link href="/login"
                className="w-full flex justify-center items-center py-4 rounded-xl text-sm font-black text-[#5a4bfa] border border-[#5a4bfa]/30 hover:bg-[#5a4bfa]/10 transition-colors">
                Sign In Instead
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
