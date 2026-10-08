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
  ShieldCheck,
} from "lucide-react";
import { API_URL } from "@/app/lib/api";

export default function SignUpPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 3) {
      setError("Password must be at least 3 characters long.");
      return;
    }

    if (form.password.length > 10) {
      setError("Password must be 10 characters or less.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          name: form.name,
          role: "VIEWER",
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Failed to create account. Username may already be taken.");
      }
    } catch (err) {
      console.error(err);
      setError("Could not connect to the backend server. Please verify Spring Boot is running.");
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
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[720px] h-[450px] bg-[#466e50]/8 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[320px] bg-[#c65922]/6 blur-[120px] rounded-full pointer-events-none" />

      {/* Subtle architectural concrete grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #d8ded9 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-[#dce2de] z-10 animate-in fade-in zoom-in-95 duration-300">
        {success ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#eaf2ec] border border-[#bfd6c5] flex items-center justify-center mb-5 text-[#3e694a]">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#1c201d] tracking-tight">Account Created!</h2>
            <p className="text-[#5d6860] text-sm mt-2">
              Redirecting you to the sign in portal...
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#385e42] via-[#466e50] to-[#c65922] flex items-center justify-center mb-4 shadow-md shadow-[#466e50]/20 text-white">
                <Boxes className="w-7 h-7" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1c201d] tracking-tight">Create Account</h1>
              <p className="text-xs font-bold text-[#466e50] uppercase tracking-widest mt-1">
                IMS • Inventory Management System
              </p>
              <p className="text-xs text-[#5d6860] mt-1.5 font-medium">
                New accounts start with Guest Viewer role access
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-[#faece1] border border-[#eec6a9] text-[#9b4114] text-xs font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#c65922]" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#343b36]">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717e75]">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-[#1c201d] placeholder-[#7d8a80] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#466e50] focus:bg-white focus:border-transparent transition-all"
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#343b36]">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717e75]">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-[#1c201d] placeholder-[#7d8a80] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#466e50] focus:bg-white focus:border-transparent transition-all"
                    placeholder="Choose a username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#343b36]">Password</label>
                  <span
                    className={`text-[11px] font-medium transition-colors ${
                      form.password.length > 10
                        ? "text-[#c65922] font-bold"
                        : "text-[#717e75]"
                    }`}
                  >
                    {form.password.length > 0
                      ? `${form.password.length}/10 chars`
                      : "Max 10 characters"}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717e75]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      if (error) setError("");
                    }}
                    className={`w-full pl-10 pr-11 py-3 bg-[#f6f8f6] border rounded-xl text-[#1c201d] placeholder-[#7d8a80] text-sm font-medium focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      form.password.length > 10
                        ? "border-[#c65922] focus:ring-[#c65922]"
                        : "border-[#dce2de] focus:ring-[#466e50] focus:border-transparent"
                    }`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#717e75] hover:text-[#1c201d] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password.length > 10 && (
                  <p className="text-xs text-[#c65922] font-medium flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Password must be 10 characters or less.</span>
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#343b36]">Confirm Password</label>
                  {form.confirmPassword.length > 10 && (
                    <span className="text-[11px] font-bold text-[#c65922]">
                      {form.confirmPassword.length}/10 chars
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717e75]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.confirmPassword}
                    onChange={(e) => {
                      setForm({ ...form, confirmPassword: e.target.value });
                      if (error) setError("");
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-[#f6f8f6] border rounded-xl text-[#1c201d] placeholder-[#7d8a80] text-sm font-medium focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                      form.confirmPassword.length > 10
                        ? "border-[#c65922] focus:ring-[#c65922]"
                        : "border-[#dce2de] focus:ring-[#466e50] focus:border-transparent"
                    }`}
                    placeholder="Repeat password"
                  />
                </div>
                {form.confirmPassword.length > 10 && (
                  <p className="text-xs text-[#c65922] font-medium flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Password must be 10 characters or less.</span>
                  </p>
                )}
              </div>

              {/* Notice */}
              

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#466e50] hover:bg-[#385840] shadow-md shadow-[#466e50]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-[#5d6860]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#c65922] hover:text-[#9e4316] font-bold transition-colors"
              >
                Sign in instead
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
