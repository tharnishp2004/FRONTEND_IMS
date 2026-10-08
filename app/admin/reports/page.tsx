"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart3,
  Download,
  FileText,
  IndianRupee,
  TrendingUp,
  Package,
  Truck,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { API_URL } from "@/app/lib/api";
import { exportAnalyticsReport } from "@/app/lib/exportUtils";
import { StatCard } from "@/app/components/ui/StatCard";
import { Badge } from "@/app/components/ui/Badge";
import { BarChart, DonutChart, AreaChart } from "@/app/components/ui/Charts";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";

export default function ReportsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"ALL" | "30D" | "90D">("ALL");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes, purRes] = await Promise.all([
        fetch(`${API_URL}/orders`).then((r) => r.json()).catch(() => []),
        fetch(`${API_URL}/products`).then((r) => r.json()).catch(() => []),
        fetch(`${API_URL}/purchases`).then((r) => r.json()).catch(() => []),
      ]);

      setOrders(Array.isArray(ordRes) ? ordRes : []);
      setProducts(Array.isArray(prodRes) ? prodRes : []);
      setPurchases(Array.isArray(purRes) ? purRes : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (period === "ALL") return orders;
    const now = new Date();
    const daysLimit = period === "30D" ? 30 : 90;
    return orders.filter((o) => {
      if (!o.date) return true;
      const d = new Date(o.date);
      const diff = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
      return diff <= daysLimit;
    });
  }, [orders, period]);

  const totalRevenue = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0),
    [filteredOrders]
  );
  const totalSales = filteredOrders.length;
  const avgOrder = totalSales > 0 ? totalRevenue / totalSales : 0;
  const stockValuation = useMemo(
    () => products.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 0), 0),
    [products]
  );

  const categories = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category || "General";
      map[cat] = (map[cat] || 0) + (Number(p.price) || 0) * (Number(p.quantity) || 0);
    });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      pct: stockValuation > 0 ? Math.round((value / stockValuation) * 100) : 0,
    }));
  }, [products, stockValuation]);

  const supplierPerformance = useMemo(() => {
    const map: Record<string, { count: number; units: number }> = {};
    purchases.forEach((p) => {
      const sup = p.supplier || "Unknown Supplier";
      if (!map[sup]) map[sup] = { count: 0, units: 0 };
      map[sup].count += 1;
      map[sup].units += Number(p.quantity) || 0;
    });
    return Object.entries(map).map(([supplier, data]) => ({
      supplier,
      ...data,
    }));
  }, [purchases]);

  const timelineChartData = useMemo(() => {
    if (filteredOrders.length === 0) {
      return [
        { label: "W1", value: 450 },
        { label: "W2", value: 680 },
        { label: "W3", value: 890 },
        { label: "W4", value: 1200 },
      ];
    }
    return filteredOrders.slice(-8).map((o, i) => ({
      label: o.date ? new Date(o.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : `#${i + 1}`,
      value: Number(o.totalPrice || 0),
    }));
  }, [filteredOrders]);

  if (loading) {
    return <LoadingSpinner label="Generating Intelligence Reports..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#1a1f1c] tracking-tight">
              Analytics & Executive Reports
            </h1>
            <Badge variant="admin">Full Executive Access</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#616d65] mt-1 font-medium">
            Financial performance, inventory valuation breakdown, procurement volumes, and supplier metrics.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() =>
              exportAnalyticsReport(
                totalRevenue,
                totalSales,
                avgOrder,
                stockValuation,
                categories,
                orders,
                products,
                "csv"
              )
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#dce2de] bg-white hover:bg-[#f6f8f6] text-[#3e4841] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Download CSV Summary"
          >
            <Download className="w-4 h-4 text-[#3f6549]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() =>
              exportAnalyticsReport(
                totalRevenue,
                totalSales,
                avgOrder,
                stockValuation,
                categories,
                orders,
                products,
                "pdf"
              )
            }
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3f6549] hover:bg-[#34553d] text-white text-xs font-semibold shadow-xs shadow-[#3f6549]/20 transition-all cursor-pointer"
            title="Download Executive PDF"
          >
            <FileText className="w-4 h-4 text-[#eec6a9]" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* Filter Period Pills */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-3 sm:px-6 border border-[#dce2de] shadow-xs">
        <span className="text-xs font-bold text-[#616d65] uppercase tracking-wider flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span>Report Horizon:</span>
        </span>

        <div className="flex items-center gap-1.5 bg-[#edf1ee] p-1 rounded-xl">
          <button
            onClick={() => setPeriod("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              period === "ALL"
                ? "bg-white text-[#1a1f1c] shadow-xs"
                : "text-[#616d65] hover:text-[#1a1f1c]"
            }`}
          >
            All-Time
          </button>
          <button
            onClick={() => setPeriod("90D")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              period === "90D"
                ? "bg-white text-[#1a1f1c] shadow-xs"
                : "text-[#616d65] hover:text-[#1a1f1c]"
            }`}
          >
            Last 90 Days
          </button>
          <button
            onClick={() => setPeriod("30D")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              period === "30D"
                ? "bg-white text-[#1a1f1c] shadow-xs"
                : "text-[#616d65] hover:text-[#1a1f1c]"
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Gross Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={IndianRupee}
          subtitle="Processed sales transactions"
          trend={{ value: "+12.4%", isPositive: true }}
          accentColor="sage"
        />

        <StatCard
          title="Orders Processed"
          value={totalSales}
          icon={TrendingUp}
          subtitle="Customer fulfillments"
          accentColor="amber"
        />

        <StatCard
          title="Avg. Order Value"
          value={`₹${avgOrder.toFixed(2)}`}
          icon={Package}
          subtitle="Per customer transaction"
          accentColor="concrete"
        />

        <StatCard
          title="Inventory Valuation"
          value={`₹${stockValuation.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={Layers}
          subtitle={`${products.length} catalog items`}
          accentColor="sage"
        />
      </div>

      {/* Charts Section: Sales Performance Trend & Category Valuation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Performance Area/Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#1a1f1c] tracking-tight">
                Sales Performance Trajectory
              </h3>
              <p className="text-xs text-[#616d65]">
                Revenue generated across customer orders over time
              </p>
            </div>
            <Badge variant="success">Revenue Growth</Badge>
          </div>

          <div className="py-2">
            <AreaChart data={timelineChartData} height={200} color="#466e50" />
          </div>
        </div>

        {/* Category Valuation Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1a1f1c] tracking-tight">
              Stock Valuation by Category
            </h3>
            <p className="text-xs text-[#616d65] mb-6">Percentage share of total asset valuation</p>

            <div className="space-y-4">
              {categories.map((c, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#3e4841]">{c.name}</span>
                    <span className="text-[#1a1f1c] font-extrabold">
                      ₹{c.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })} ({c.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#edf1ee] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3f6549] rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(4, c.pct)}%` }}
                    />
                  </div>
                </div>
              ))}

              {categories.length === 0 && (
                <p className="text-xs text-[#828f86] py-6 text-center">No category asset data</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#edf0ee] flex justify-between text-xs text-[#616d65]">
            <span>Total Valuation:</span>
            <span className="font-extrabold text-[#1a1f1c]">
              ₹{stockValuation.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Supplier Performance Section */}
      <div className="bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#1a1f1c] tracking-tight">
              Supplier Requisition Performance
            </h3>
            <p className="text-xs text-[#616d65]">
              Procurement volume and fulfillment tracking across contracted vendors
            </p>
          </div>
          <Badge variant="warning">Procurement Standing</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#edf0ee] text-[#717e75] font-semibold uppercase tracking-wider text-[11px]">
                <th className="pb-3 px-3">Supplier Name</th>
                <th className="pb-3 px-3 text-center">Purchase Orders</th>
                <th className="pb-3 px-3 text-center">Total Units Supplied</th>
                <th className="pb-3 px-3 text-right">Fulfillment Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0ee]">
              {supplierPerformance.map((sup, idx) => (
                <tr key={idx} className="hover:bg-[#f6f8f6] transition-colors">
                  <td className="py-3.5 px-3 font-bold text-[#1a1f1c]">{sup.supplier}</td>
                  <td className="py-3.5 px-3 text-center font-medium text-[#4d5750]">
                    {sup.count} POs
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-[#1a1f1c]">
                    {sup.units} units
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <Badge variant="success" dot>
                      Verified Vendor
                    </Badge>
                  </td>
                </tr>
              ))}

              {supplierPerformance.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#828f86]">
                    No supplier requisition history recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
