import Link from "next/link";
import Image from "next/image";
import {
  Boxes,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  BellRing,
  PackageCheck,
  Users,
  Layers,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f4f6f4] text-[#1c201d] flex flex-col font-sans selection:bg-[#466e50] selection:text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#466e50]/8 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[350px] bg-[#c65922]/6 blur-[120px] rounded-full pointer-events-none" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #d8ded9 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top Navigation */}
      <header className="relative z-10 border-b border-[#dce2de] bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#385e42] via-[#466e50] to-[#c65922] flex items-center justify-center text-white shadow-sm shadow-[#466e50]/20 group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-[#1c201d]">IMS</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold uppercase tracking-wider text-[#466e50] bg-[#eef4ef] px-2 py-0.5 rounded-md">
                Inventory Suite
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-[#343b36] hover:text-[#1c201d] hover:bg-[#ecefec] rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-bold text-white bg-[#466e50] hover:bg-[#385840] shadow-sm shadow-[#466e50]/20 rounded-xl transition-all hover:shadow-md cursor-pointer"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center max-w-5xl mx-auto">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#dce2de] shadow-xs mb-8 text-xs font-semibold text-[#385840]">
          <span className="w-2 h-2 rounded-full bg-[#466e50] animate-pulse" />
          <span>Real-time Inventory & Supply Chain Management</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#1c201d] leading-[1.15]">
          Smart {" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#385e42] via-[#466e50] to-[#c65922]">
            Inventory Management
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-[#5d6860] max-w-2xl font-medium leading-relaxed">
          An intuitive, role-based platform designed for modern warehouse operations.
          Track product quantities, monitor purchase orders, and receive automated low-stock alerts.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-[#466e50] hover:bg-[#385840] shadow-md shadow-[#466e50]/25 transition-all hover:scale-[1.02] active:scale-[0.99]"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-[#27392c] bg-white hover:bg-[#ecefec] border border-[#dce2de] shadow-xs transition-colors"
          >
            <span>Sign Up as Viewer</span>
            <ChevronRight className="w-4 h-4 text-[#7b857e]" />
          </Link>
        </div>



        {/* Feature Cards Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs hover:shadow-md hover:border-[#c6dacb] transition-all">
            <div className="w-11 h-11 rounded-xl bg-[#eef4ef] text-[#466e50] flex items-center justify-center mb-4">
              <PackageCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1c201d]">Stock Tracking</h3>
            <p className="mt-2 text-xs text-[#5d6860] leading-relaxed">
              Instant inventory counts, SKU codes, categories, pricing, and automated restock indicators.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs hover:shadow-md hover:border-[#c6dacb] transition-all">
            <div className="w-11 h-11 rounded-xl bg-[#faece1] text-[#c65922] flex items-center justify-center mb-4">
              <BellRing className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1c201d]">Smart Alerts</h3>
            <p className="mt-2 text-xs text-[#5d6860] leading-relaxed">
              Live automated alerts for out-of-stock items, critical thresholds, and pending vendor deliveries.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs hover:shadow-md hover:border-[#c6dacb] transition-all">
            <div className="w-11 h-11 rounded-xl bg-[#ecefec] text-[#385740] flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1c201d]">Role Security</h3>
            <p className="mt-2 text-xs text-[#5d6860] leading-relaxed">
              Tailored portals for Administrators, Warehouse Staff, and Read-Only Guest Viewers.
            </p>
          </div>
        </div>

        {/* Role Quick Reference Pills */}
        <div className="mt-14 pt-8 border-t border-[#dce2de] w-full flex flex-wrap items-center justify-center gap-3 text-xs text-[#606963]">
          <span className="font-semibold text-[#343b36]">Quick Demo Portals:</span>
          <span className="px-3 py-1 rounded-lg bg-white border border-[#dce2de] font-medium">
            <strong className="text-[#385740]">Admin:</strong> full system control & user management
          </span>
          <span className="px-3 py-1 rounded-lg bg-white border border-[#dce2de] font-medium">
            <strong className="text-[#c65922]">Staff:</strong> inventory, purchases & order execution
          </span>
          <span className="px-3 py-1 rounded-lg bg-white border border-[#dce2de] font-medium">
            <strong className="text-[#606963]">Viewer:</strong> read-only analytics & reporting
          </span>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 border-t border-[#dce2de] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7b857e]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#466e50] flex items-center justify-center text-white text-[10px] font-bold">
              IMS
            </div>
            <span>© 2026 Inventory Management System. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-5 font-medium">
            <Link href="/login" className="hover:text-[#1c201d] transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-[#1c201d] transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
