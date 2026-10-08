"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Boxes,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { API_URL } from "@/app/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        // Persist user payload and tokens across all layout keys
        localStorage.setItem("inventory_user", JSON.stringify(data));
        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("token", data.token || "auth-session-active");
        localStorage.setItem("inventory_token", data.token || "auth-session-active");

        // Direct based on returned backend authority
        const role = (data.role || "VIEWER").toUpperCase();
        if (role === "ADMIN") router.push("/admin");
        else if (role === "STAFF") router.push("/staff");
        else router.push("/viewer");
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Invalid username or password. Please check your credentials (default password: 123).");
      }
    } catch (err) {
      console.error(err);
      setError("Could not connect to the backend server. Please verify Spring Boot is running on port 8080.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden font-sans p-4 sm:p-6">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-[#5d6860] hover:text-[#1c201d] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* Soft Sage Green and Burnt Amber ambient glows on white */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[720px] h-[450px] bg-[#466e50]/8 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[320px] bg-[#c65922]/6 blur-[120px] rounded-full pointer-events-none" />

      {/* Subtle architectural concrete grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #d8ded9 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Auth Card (Crisp White with Concrete Border & Sage Accent) */}
      <div className="relative w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-[#dce2de] z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand & Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#385e42] via-[#466e50] to-[#c65922] flex items-center justify-center mb-4 shadow-md shadow-[#466e50]/20 text-white">
            <Boxes className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-[#1c201d] tracking-tight">
            IMS
          </h1>
          <p className="text-xs font-bold text-[#466e50] uppercase tracking-widest mt-1">
            Inventory Management System
          </p>
          <p className="text-xs text-[#5d6860] mt-1.5 font-medium">
            Sign in to access your inventory and operations console
          </p>
        </div>

        {/* Error Alert in Burnt Amber */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#faece1] border border-[#eec6a9] text-[#9b4114] text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#c65922]" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#343b36]">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717e75]">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-[#1c201d] placeholder-[#7d8a80] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#466e50] focus:bg-white focus:border-transparent transition-all"
                placeholder="Enter username"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#343b36]">Password</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717e75]">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-[#1c201d] placeholder-[#7d8a80] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#466e50] focus:bg-white focus:border-transparent transition-all"
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#717e75] hover:text-[#1c201d] transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button (Sage Green) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#466e50] hover:bg-[#385840] shadow-md shadow-[#466e50]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </div>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Register Footer */}
        <div className="mt-6 text-center text-xs text-[#5d6860]">
          Need an account?{" "}
          <Link
            href="/signup"
            className="text-[#c65922] hover:text-[#9e4316] font-bold transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
