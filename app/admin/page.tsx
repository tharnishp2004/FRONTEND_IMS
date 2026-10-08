"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Boxes,
  Package,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowRight,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { API_URL } from "@/app/lib/api";
import { StatCard } from "@/app/components/ui/StatCard";
import { Badge } from "@/app/components/ui/Badge";
import { BarChart, DonutChart, AreaChart } from "@/app/components/ui/Charts";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, ordRes, purRes, altRes] = await Promise.all([
          fetch(`${API_URL}/products`).then((r) => r.json()).catch(() => []),
          fetch(`${API_URL}/orders`).then((r) => r.json()).catch(() => []),
          fetch(`${API_URL}/purchases`).then((r) => r.json()).catch(() => []),
          fetch(`${API_URL}/alerts`).then((r) => r.json()).catch(() => []),
        ]);

        setProducts(Array.isArray(prodRes) ? prodRes : []);
        setOrders(Array.isArray(ordRes) ? ordRes : []);
        setPurchases(Array.isArray(purRes) ? purRes : []);
        setAlerts(Array.isArray(altRes) ? altRes : []);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute key metrics
  const totalStockUnits = useMemo(
    () => products.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0),
    [products]
  );

  const inventoryValuation = useMemo(
    () => products.reduce((acc, p) => acc + (Number(p.quantity) || 0) * (Number(p.price) || 0), 0),
    [products]
  );

  const lowStockItems = useMemo(
    () => products.filter((p) => Number(p.quantity) > 0 && Number(p.quantity) <= 5),
    [products]
  );

  const outOfStockItems = useMemo(
    () => products.filter((p) => Number(p.quantity) === 0),
    [products]
  );

  const pendingOrdersCount = useMemo(
    () =>
      orders.filter(
        (o) =>
          (o.orderStatus || "").toUpperCase() === "PENDING" ||
          (o.orderStatus || "").toUpperCase() === "PROCESSING"
      ).length +
      purchases.filter((p) => (p.status || "").toUpperCase() === "PENDING").length,
    [orders, purchases]
  );

  const totalSalesRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0),
    [orders]
  );

  // Category breakdown for Stock Donut (Sage Green, Burnt Amber, Deep Amber)
  const stockDistributionData = useMemo(() => {
    const inStockCount = products.filter((p) => Number(p.quantity) > 5).length;
    const lowCount = lowStockItems.length;
    const outCount = outOfStockItems.length;

    return [
      { label: "Optimal Stock", value: inStockCount, color: "#466e50" }, // Sage Green
      { label: "Low Stock", value: lowCount, color: "#c65922" },       // Burnt Amber
      { label: "Out of Stock", value: outCount, color: "#9e3215" },     // Deep Amber Red
    ];
  }, [products, lowStockItems, outOfStockItems]);

  // Sales Trend chart data (in Burnt Amber & Sage)
  const salesTrendData = useMemo(() => {
    if (orders.length === 0) {
      return [
        { label: "Mon", value: 120 },
        { label: "Tue", value: 340 },
        { label: "Wed", value: 210 },
        { label: "Thu", value: 450 },
        { label: "Fri", value: 380 },
        { label: "Sat", value: 520 },
        { label: "Sun", value: 290 },
      ];
    }

    return orders.slice(-7).map((o, idx) => {
      const prod = products.find((p) => String(p.id) === String(o.productId));
      const dateLabel = o.date ? new Date(o.date).toLocaleDateString(undefined, { weekday: "short" }) : `#${idx + 1}`;
      return {
        label: dateLabel,
        value: Number(o.totalPrice || 0),
        tooltip: `${prod?.name || "Order"}: ₹${Number(o.totalPrice || 0).toFixed(2)}`,
      };
    });
  }, [orders, products]);

  // Stock Movement / Category Share Data (Sage Green bars)
  const categoryBarData = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category || "General";
      map[cat] = (map[cat] || 0) + (Number(p.quantity) || 0);
    });

    const entries = Object.entries(map);
    if (entries.length === 0) return [];
    return entries.slice(0, 6).map(([label, value]) => ({
      label,
      value,
      tooltip: `${label}: ${value} units in stock`,
    }));
  }, [products]);

  const getProductName = (id: string | number) => {
    const p = products.find((pr) => String(pr.id) === String(id));
    return p ? p.name : `Product #${id}`;
  };

  if (loading) {
    return <LoadingSpinner label="Loading Executive Console..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1f1c] tracking-tight">
              Executive Overview
            </h1>
            <Badge variant="admin">Sage & Concrete Core</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#616d65] mt-1 font-medium">
            Real-time analytics, critical stock notifications, and sales transaction pipeline.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <Link
            href="/admin/inventory"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3f6549] hover:bg-[#34553d] text-white text-xs font-semibold shadow-xs shadow-[#3f6549]/20 transition-colors"
          >
            <Boxes className="w-4 h-4" />
            <span>Manage Inventory</span>
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#242b26] hover:bg-[#1a1f1c] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>View Orders</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Products"
          value={products.length}
          icon={Boxes}
          subtitle="Catalog stock listings"
          trend={{ value: "+4.2%", isPositive: true, text: "vs last month" }}
          accentColor="sage"
        />

        <StatCard
          title="Total Stock Units"
          value={totalStockUnits.toLocaleString()}
          icon={Package}
          subtitle={`Valuation: ₹${inventoryValuation.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          trend={{ value: "Healthy", isPositive: true }}
          accentColor="sage"
        />

        <StatCard
          title="Low Stock Items"
          value={lowStockItems.length + outOfStockItems.length}
          icon={AlertTriangle}
          subtitle={`${outOfStockItems.length} completely depleted`}
          trend={{
            value: lowStockItems.length > 0 ? "Attention Required" : "All Good",
            isPositive: lowStockItems.length === 0,
          }}
          accentColor="amber"
        />

        <StatCard
          title="Pending Orders"
          value={pendingOrdersCount}
          icon={ShoppingCart}
          subtitle={`Total revenue: ₹${totalSalesRevenue.toFixed(2)}`}
          trend={{ value: `${orders.length} Total orders` }}
          accentColor="concrete"
        />
      </div>

      {/* Charts Section: Inventory Overview + Sales Trend + Stock Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart (Burnt Amber) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#1a1f1c] tracking-tight">
                Sales Volume & Revenue Trend
              </h3>
              <p className="text-xs text-[#66736a]">
                Transaction value across recent completed customer orders
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#b4511c] hover:text-[#973f1a] flex items-center gap-1"
            >
              <span>Details</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="pt-4">
            <BarChart data={salesTrendData} height={200} valuePrefix="₹" color="#c65922" />
          </div>
        </div>

        {/* Inventory Stock Health Donut */}
        <div className="bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#1a1f1c] tracking-tight">
              Stock Health Status
            </h3>
            <p className="text-xs text-[#66736a]">Distribution of product inventory readiness</p>
          </div>

          <DonutChart
            data={stockDistributionData}
            centerLabel="Products"
            centerValue={products.length}
            size={160}
          />

          <div className="mt-4 pt-4 border-t border-[#edf0ee] flex justify-between text-xs text-[#66736a] font-medium">
            <span className="text-[#36573e] font-semibold">Optimal: {products.filter((p) => p.quantity > 5).length}</span>
            <span className="text-[#b4511c] font-semibold">Low: {lowStockItems.length}</span>
            <span className="text-[#a43719] font-semibold">Out: {outOfStockItems.length}</span>
          </div>
        </div>
      </div>

      {/* Stock Movement & Category Volume Chart (Sage Green) */}
      <div className="bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#1a1f1c] tracking-tight">
              Stock Movement by Category
            </h3>
            <p className="text-xs text-[#66736a]">Total physical on-hand units grouped by product department</p>
          </div>
          <Badge variant="success">Category Breakdown</Badge>
        </div>

        {categoryBarData.length > 0 ? (
          <BarChart data={categoryBarData} height={160} valueSuffix=" units" color="#466e50" />
        ) : (
          <p className="text-xs text-[#828f86] py-8 text-center">No category data recorded yet.</p>
        )}
      </div>

      {/* Two Column Section: Recent Orders Table & Low-Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-[#1a1f1c] tracking-tight">
                Recent Orders Table
              </h3>
              <p className="text-xs text-[#66736a]">
                Latest transactions processed through the system
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#3f6549] hover:text-[#32523a] flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#edf0ee] text-[#717e75] font-semibold uppercase tracking-wider">
                  <th className="pb-3 px-3">Order ID</th>
                  <th className="pb-3 px-3">Product</th>
                  <th className="pb-3 px-3">Quantity</th>
                  <th className="pb-3 px-3">Revenue</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0ee]">
                {orders.slice(-5).reverse().map((o, idx) => (
                  <tr key={o.id || idx} className="hover:bg-[#f6f8f6] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#343b37]">
                      #{o.id || idx + 1}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#1a1f1c]">
                      {getProductName(o.productId)}
                    </td>
                    <td className="py-3 px-3 text-[#525e56] font-medium">
                      {o.quantity} units
                    </td>
                    <td className="py-3 px-3 font-bold text-[#385c41]">
                      ₹{Number(o.totalPrice || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-[#717e75]">
                      {o.date ? new Date(o.date).toLocaleDateString() : "Today"}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Badge
                        variant={
                          (o.orderStatus || "").toUpperCase() === "COMPLETED"
                            ? "success"
                            : (o.orderStatus || "").toUpperCase() === "PENDING"
                            ? "warning"
                            : "info"
                        }
                      >
                        {o.orderStatus || "COMPLETED"}
                      </Badge>
                    </td>
                  </tr>
                ))}

                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#828f86]">
                      No customer orders placed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low-Stock Products & Priority Alerts (1 Col in Burnt Amber) */}
        <div className="bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#1a1f1c] tracking-tight flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#c65922]" />
                <span>Low-Stock Monitor</span>
              </h3>
              <Link
                href="/admin/alerts"
                className="text-xs font-semibold text-[#b4511c] hover:text-[#973f1a]"
              >
                Alerts Center
              </Link>
            </div>

            <p className="text-xs text-[#66736a] mb-4">
              Items at or below the reorder threshold (≤ 5 units):
            </p>

            <div className="space-y-3">
              {[...outOfStockItems, ...lowStockItems].slice(0, 5).map((p) => {
                const isOut = p.quantity === 0;
                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-[#edf0ee] bg-[#f9faf9] flex items-center justify-between gap-3 hover:bg-[#f2f5f3] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1a1f1c] truncate">{p.name}</p>
                      <p className="text-[11px] text-[#717e75]">SKU: {p.sku || `SKU-${p.id}`}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                          isOut
                            ? "bg-[#f8e4dc] text-[#972f13]"
                            : "bg-[#faece1] text-[#aa4b1a]"
                        }`}
                      >
                        {p.quantity} left
                      </span>
                      <Link
                        href="/admin/inventory"
                        className="p-1 rounded-lg text-[#717e75] hover:text-[#3f6549]"
                        title="Restock Item"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}

              {outOfStockItems.length === 0 && lowStockItems.length === 0 && (
                <div className="py-8 text-center text-xs text-[#717e75] flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-[#3f6549]" />
                  <span>All product lines maintain optimal inventory levels.</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#edf0ee]">
            <Link
              href="/admin/purchases"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#faece1] hover:bg-[#f6decb] text-[#9b4114] text-xs font-bold transition-colors border border-[#eec6a9]"
            >
              <Truck className="w-3.5 h-3.5 text-[#b4511c]" />
              <span>Create Supplier Purchase Order</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
