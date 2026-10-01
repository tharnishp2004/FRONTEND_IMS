"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/app/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        const userRole = (data.role || "").toLowerCase();

        const userObj = {
          id: data.id,
          name: data.name,
          username: data.username,
          role: userRole,
        };

        localStorage.setItem("inventory_user", JSON.stringify(userObj));

        if (userRole === "admin") router.push("/admin");
        else if (userRole === "staff") router.push("/staff/operations");
        else router.push("/viewer");
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Invalid username or password.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#171332] relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5a4bfa] opacity-20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative w-full max-w-[420px] bg-[#1e1a3f] rounded-[32px] p-8 shadow-2xl border border-white/5">

        <div className="text-center mb-10 text-white">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#15112c] border border-white/10 flex items-center justify-center mb-6 shadow-inner">
            <Lock className="w-7 h-7 text-[#5a4bfa]" />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">Sign In</h2>
          <p className="text-[10px] font-bold tracking-widest text-[#6b678e] uppercase">
            Access the IMS Portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10 w-full">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-bold text-center mb-4">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-widest text-[#6b678e] uppercase ml-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-[#6b678e]" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-[#15112c] border border-transparent rounded-xl text-white placeholder-[#4a4665] focus:outline-none focus:ring-2 focus:ring-[#5a4bfa] transition-all font-semibold"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black tracking-widest text-[#6b678e] uppercase ml-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-[#6b678e]" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-16 py-4 bg-[#15112c] border border-transparent rounded-xl text-white placeholder-[#4a4665] focus:outline-none focus:ring-2 focus:ring-[#5a4bfa] transition-all font-semibold"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[10px] font-bold text-[#6b678e] hover:text-white tracking-widest transition-colors"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center space-x-2 py-4 rounded-xl text-sm font-black text-white bg-[#5a4bfa] hover:bg-[#4b3de6] transition-colors shadow-[0_0_20px_rgba(90,75,250,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            <span>{loading ? "AUTHENTICATING..." : "SIGN IN TO DASHBOARD"}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

          <div className="mt-8 relative flex items-center justify-center">
            <div className="absolute w-full h-[1px] bg-white/5"></div>
            <span className="bg-[#1e1a3f] px-4 text-[9px] font-bold tracking-widest text-[#4a4665] uppercase z-10">
              New to IMS?
            </span>
          </div>
          <Link href="/signup"
            className="mt-4 w-full flex justify-center items-center py-4 rounded-xl text-sm font-black text-[#5a4bfa] border border-[#5a4bfa]/30 hover:bg-[#5a4bfa]/10 transition-colors">
            Create an Account
          </Link>
        </form>
      </div>
    </div>
  );
}
