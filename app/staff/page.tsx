"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Boxes,
  Package,
  ShoppingCart,
  TrendingUp,
  SlidersHorizontal,
  ArrowRight,
  AlertTriangle,
  Clock,
  Truck,
  PlusCircle,
} from "lucide-react";
import { API_URL } from "@/app/lib/api";
import { StatCard } from "@/app/components/ui/StatCard";
import { Badge } from "@/app/components/ui/Badge";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";

export default function StaffDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/products`).then((r) => r.json()).catch(() => []),
      fetch(`${API_URL}/orders`).then((r) => r.json()).catch(() => []),
      fetch(`${API_URL}/purchases`).then((r) => r.json()).catch(() => []),
    ])
      .then(([p, o, pur]) => {
        setProducts(Array.isArray(p) ? p : []);
        setOrders(Array.isArray(o) ? o : []);
        setPurchases(Array.isArray(pur) ? pur : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalItems = useMemo(
    () => products.reduce((sum: number, p: any) => sum + (Number(p.quantity) || 0), 0),
    [products]
  );
  const lowStock = useMemo(
    () => products.filter((p: any) => Number(p.quantity) <= 5),
    [products]
  );

  const getProductName = (id: string | number) => {
    const p = products.find((pr) => String(pr.id) === String(id));
    return p ? p.name : `Product #${id}`;
  };

  if (loading) {
    return <LoadingSpinner label="Loading Staff Operations Console..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#1a1f1c] tracking-tight">
              Staff Operations Console
            </h1>
            <Badge variant="staff">Operations Clearance</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#616d65] mt-1 font-medium">
            Daily inventory workflows: execute sale orders, process physical stock entries, and request supplier requisitions.
          </p>
        </div>

        <Link
          href="/staff/operations"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3f6549] hover:bg-[#34553d] text-white text-xs font-bold shadow-xs shadow-[#3f6549]/20 transition-all cursor-pointer active:scale-95"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Quick Operations</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Stock Units"
          value={totalItems.toLocaleString()}
          icon={Package}
          subtitle={`${products.length} registered products`}
          accentColor="sage"
        />
        <StatCard
          title="Orders Processed"
          value={orders.length}
          icon={ShoppingCart}
          subtitle="Customer fulfillments"
          accentColor="sage"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStock.length}
          icon={AlertTriangle}
          subtitle="Requires intake attention"
          accentColor="amber"
        />
        <StatCard
          title="Purchase Orders"
          value={purchases.length}
          icon={Truck}
          subtitle="Supplier procurement records"
          accentColor="concrete"
        />
      </div>

      {/* Quick Action Station (Concrete Slate & Sage Gradient Banner) */}
      <div className="bg-gradient-to-r from-[#171b19] via-[#222925] to-[#2d3731] rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-[#313c35] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8eb097]">
            Workflows Station
          </span>
          <h3 className="text-xl font-extrabold text-white mt-1 tracking-tight">
            Perform Daily Inventory Tasks
          </h3>
          <p className="text-xs sm:text-sm text-[#a6b2aa] mt-1 max-w-lg">
            Record counter sales to automatically decrement stock, add incoming replenishment shipments, or draft supplier POs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/staff/operations"
            className="px-4 py-2.5 rounded-xl bg-[#3f6549] hover:bg-[#34553d] text-white font-bold text-xs transition-colors shadow-xs"
          >
            Process Sale Order
          </Link>
          <Link
            href="/staff/operations"
            className="px-4 py-2.5 rounded-xl bg-[#29322c] hover:bg-[#333e37] text-[#d6ded8] font-bold text-xs transition-colors border border-[#3d4a41]"
          >
            Enter Stock Intake
          </Link>
          <Link
            href="/staff/purchases"
            className="px-4 py-2.5 rounded-xl bg-[#29322c] hover:bg-[#333e37] text-[#e8b598] font-bold text-xs transition-colors border border-[#3d4a41]"
          >
            Supplier Requisition
          </Link>
        </div>
      </div>

      {/* Two Column Grid: Stock Overview & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Overview */}
        <div className="bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-[#1a1f1c] tracking-tight">
                Current Stock Levels
              </h3>
              <p className="text-xs text-[#616d65]">Quick view of items on warehouse shelves</p>
            </div>
            <Link
              href="/staff/inventory"
              className="text-xs font-semibold text-[#3f6549] hover:text-[#32523a] flex items-center gap-1"
            >
              <span>Full Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#edf0ee]">
            {products.slice(0, 5).map((p: any) => {
              const isOut = p.quantity === 0;
              const isLow = p.quantity > 0 && p.quantity <= 5;

              return (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1a1f1c] truncate">{p.name}</p>
                    <p className="text-[11px] text-[#717e75]">
                      {p.category || "General"} • {p.sku || `SKU-${p.id}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#1a1f1c]">
                      {p.quantity} units
                    </span>
                    <Badge variant={isOut ? "danger" : isLow ? "warning" : "success"} dot>
                      {isOut ? "Out" : isLow ? "Low" : "Optimal"}
                    </Badge>
                  </div>
                </div>
              );
            })}

            {products.length === 0 && (
              <p className="text-xs text-[#828f86] py-6 text-center">No inventory items</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-[#1a1f1c] tracking-tight">
                Recent Orders Processed
              </h3>
              <p className="text-xs text-[#616d65]">Latest customer sale records</p>
            </div>
            <Link
              href="/staff/orders"
              className="text-xs font-semibold text-[#3f6549] hover:text-[#32523a] flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#edf0ee]">
            {orders.slice(-5).reverse().map((o: any) => (
              <div key={o.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#1a1f1c]">
                    {getProductName(o.productId)}
                  </p>
                  <p className="text-[11px] text-[#717e75]">
                    Order #{o.id} • {o.quantity} units •{" "}
                    {o.date ? new Date(o.date).toLocaleDateString() : "Today"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-extrabold text-[#385c41]">
                    ₹{Number(o.totalPrice || 0).toFixed(2)}
                  </p>
                  <Badge variant="success">Completed</Badge>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <p className="text-xs text-[#828f86] py-6 text-center">
                No orders recorded yet. Process a sale to see it here!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
