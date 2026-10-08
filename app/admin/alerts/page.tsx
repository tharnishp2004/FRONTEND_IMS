"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  PackageX,
  Package,
  Truck,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Trash2,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/app/lib/api";
import { Badge } from "@/app/components/ui/Badge";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { TableSkeleton } from "@/app/components/ui/LoadingSpinner";
import { StatCard } from "@/app/components/ui/StatCard";

interface AlertModel {
  id: string;
  dbId?: number | string;
  type: "OUT_OF_STOCK" | "LOW_STOCK" | "EXPIRY" | "PENDING_ORDER" | "SYSTEM";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
  title: string;
  message: string;
  date: string;
  status: "ACTIVE" | "RESOLVED";
  link?: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");

  useEffect(() => {
    fetchAlertsData();
  }, []);

  const fetchAlertsData = async () => {
    setLoading(true);
    try {
      const [prodRes, purchRes, dbAlertsRes] = await Promise.all([
        fetch(`${API_URL}/products`).then((r) => r.json()).catch(() => []),
        fetch(`${API_URL}/purchases`).then((r) => r.json()).catch(() => []),
        fetch(`${API_URL}/alerts`).then((r) => r.json()).catch(() => []),
      ]);

      const products = Array.isArray(prodRes) ? prodRes : [];
      const purchases = Array.isArray(purchRes) ? purchRes : [];
      const dbAlerts = Array.isArray(dbAlertsRes) ? dbAlertsRes : [];

      const list: AlertModel[] = [];

      // 1. Out of Stock (CRITICAL - Burnt Amber Alert)
      products
        .filter((p: any) => Number(p.quantity) === 0)
        .forEach((p: any) => {
          list.push({
            id: `out-${p.id}`,
            type: "OUT_OF_STOCK",
            severity: "CRITICAL",
            title: `Out of Stock: ${p.name}`,
            message: `Inventory depleted to 0 units for ${p.name} (SKU: ${p.sku || p.id}). Restock required immediately.`,
            date: new Date().toISOString(),
            status: "ACTIVE",
            link: "/admin/purchases",
          });
        });

      // 2. Low Stock (HIGH - Burnt Amber Warning)
      products
        .filter((p: any) => Number(p.quantity) > 0 && Number(p.quantity) <= 5)
        .forEach((p: any) => {
          list.push({
            id: `low-${p.id}`,
            type: "LOW_STOCK",
            severity: "HIGH",
            title: `Low Stock: ${p.name}`,
            message: `Only ${p.quantity} units remaining in stock. Consider generating a purchase requisition order.`,
            date: new Date().toISOString(),
            status: "ACTIVE",
            link: "/admin/inventory",
          });
        });

      // 3. Expiry Check
      const now = new Date();
      products
        .filter((p: any) => p.expiryDate)
        .forEach((p: any) => {
          const exp = new Date(p.expiryDate);
          const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
          if (diffDays <= 30) {
            list.push({
              id: `exp-${p.id}`,
              type: "EXPIRY",
              severity: diffDays <= 0 ? "CRITICAL" : "MEDIUM",
              title: diffDays <= 0 ? `Product Expired: ${p.name}` : `Expiring Soon: ${p.name}`,
              message:
                diffDays <= 0
                  ? `Batch expired on ${p.expiryDate}. Remove damaged/expired units from inventory immediately.`
                  : `Batch expires in ${diffDays} days (${p.expiryDate}). Expedite clearance sales.`,
              date: p.expiryDate,
              status: "ACTIVE",
              link: "/admin/inventory",
            });
          }
        });

      // 4. Pending Purchase Orders
      purchases
        .filter((pur: any) => (pur.status || "").toUpperCase() === "PENDING")
        .forEach((pur: any) => {
          const prod = products.find((p: any) => String(p.id) === String(pur.productId));
          list.push({
            id: `purch-${pur.id}`,
            type: "PENDING_ORDER",
            severity: "MEDIUM",
            title: `Pending Purchase Requisition #${pur.id}`,
            message: `Procurement order for ${pur.quantity} units of ${prod?.name || "Product"} from ${pur.supplier} is awaiting intake.`,
            date: pur.date || new Date().toISOString(),
            status: "ACTIVE",
            link: "/admin/purchases",
          });
        });

      // 5. Database alerts from backend
      dbAlerts.forEach((a: any) => {
        list.push({
          id: `db-${a.id}`,
          dbId: a.id,
          type: "SYSTEM",
          severity: (a.type || "").toUpperCase().includes("OUT") ? "CRITICAL" : "HIGH",
          title: a.type || "System Notice",
          message: a.message,
          date: new Date().toISOString(),
          status: (a.status || "ACTIVE").toUpperCase() === "RESOLVED" ? "RESOLVED" : "ACTIVE",
        });
      });

      setAlerts(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertItem: AlertModel) => {
    if (alertItem.dbId) {
      try {
        await fetch(`${API_URL}/alerts/${alertItem.dbId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "RESOLVED", message: alertItem.message, type: alertItem.type }),
        });
      } catch (e) {
        console.error(e);
      }
    }
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertItem.id ? { ...a, status: "RESOLVED" } : a))
    );
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (filterType !== "ALL" && a.type !== filterType) return false;
      if (filterSeverity !== "ALL" && a.severity !== filterSeverity) return false;
      return true;
    });
  }, [alerts, filterType, filterSeverity]);

  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL" && a.status === "ACTIVE").length;
  const highCount = alerts.filter((a) => a.severity === "HIGH" && a.status === "ACTIVE").length;
  const activeCount = alerts.filter((a) => a.status === "ACTIVE").length;

  const getSeverityBadge = (sev: string) => {
    if (sev === "CRITICAL") return <Badge variant="danger" dot>Critical Shortage</Badge>;
    if (sev === "HIGH") return <Badge variant="warning" dot>High Priority</Badge>;
    if (sev === "MEDIUM") return <Badge variant="warning" dot>Reorder Level</Badge>;
    return <Badge variant="info">Observation</Badge>;
  };

  const getTypeIcon = (type: string) => {
    if (type === "OUT_OF_STOCK") return <PackageX className="w-5 h-5 text-[#972f13]" />;
    if (type === "LOW_STOCK") return <AlertTriangle className="w-5 h-5 text-[#aa4b1a]" />;
    if (type === "EXPIRY") return <Calendar className="w-5 h-5 text-[#b4511c]" />;
    if (type === "PENDING_ORDER") return <Truck className="w-5 h-5 text-[#3f6549]" />;
    return <ShieldAlert className="w-5 h-5 text-[#4d5750]" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#1a1f1c] tracking-tight">
              Real-Time Alert Center
            </h1>
            <Badge variant="warning">{activeCount} Active</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#616d65] mt-1 font-medium">
            Automated intelligence notifications identifying out-of-stock items, critical thresholds, pending requisitions, and expiry risks.
          </p>
        </div>

        <button
          onClick={fetchAlertsData}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#dce2de] bg-white hover:bg-[#f6f8f6] text-[#3e4841] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Clock className="w-4 h-4 text-[#3f6549]" />
          <span>Refresh Monitors</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Active System Alerts"
          value={activeCount}
          icon={AlertTriangle}
          subtitle="Real-time triggered monitors"
          accentColor="amber"
        />
        <StatCard
          title="Critical Shortages"
          value={criticalCount}
          icon={PackageX}
          subtitle="Completely depleted stock lines"
          accentColor="rose"
        />
        <StatCard
          title="Threshold Warnings"
          value={highCount}
          icon={Clock}
          subtitle="Inventory nearing safety stock"
          accentColor="amber"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#dce2de] shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-auto flex items-center gap-2 text-xs font-semibold text-[#616d65]">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
        </div>

        <div className="w-full sm:w-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium text-[#3e4841] focus:outline-none focus:ring-2 focus:ring-[#4d7557] transition-all cursor-pointer"
          >
            <option value="ALL">All Alert Categories</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="EXPIRY">Expiration Date</option>
            <option value="PENDING_ORDER">Pending Purchase Orders</option>
            <option value="SYSTEM">System Notices</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium text-[#3e4841] focus:outline-none focus:ring-2 focus:ring-[#4d7557] transition-all cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Severity</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Moderate</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {loading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : filteredAlerts.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="All Clear!"
            description="No active system or stock alerts meet the selected criteria. All inventories and orders are running normally."
          />
        ) : (
          filteredAlerts.map((alert) => {
            const isResolved = alert.status === "RESOLVED";

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isResolved
                    ? "bg-[#f7f9f7] border-[#dce2de] opacity-60"
                    : alert.severity === "CRITICAL"
                    ? "bg-[#fcf5f1] border-[#f0ccaF] shadow-xs"
                    : alert.severity === "HIGH"
                    ? "bg-[#fef8f4] border-[#f4d7c0] shadow-xs"
                    : "bg-white border-[#dce2de] shadow-xs"
                }`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      alert.severity === "CRITICAL"
                        ? "bg-[#f8e4dc]"
                        : alert.severity === "HIGH"
                        ? "bg-[#faece1]"
                        : "bg-[#edf1ee]"
                    }`}
                  >
                    {getTypeIcon(alert.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <h4
                        className={`text-sm font-bold tracking-tight ${
                          isResolved ? "line-through text-[#828e85]" : "text-[#1a1f1c]"
                        }`}
                      >
                        {alert.title}
                      </h4>
                      {getSeverityBadge(alert.severity)}
                      {isResolved && <Badge variant="neutral">Resolved</Badge>}
                    </div>

                    <p className="text-xs text-[#525e56] leading-relaxed font-medium">
                      {alert.message}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-[#717e75]">
                      <span>Category: {alert.type.replace(/_/g, " ")}</span>
                      <span>•</span>
                      <span>
                        Date: {alert.date ? new Date(alert.date).toLocaleDateString() : "Today"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {alert.link && !isResolved && (
                    <Link
                      href={alert.link}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#dce2de] bg-white hover:bg-[#f6f8f6] text-[#3e4841] text-xs font-semibold shadow-xs transition-colors"
                    >
                      <span>Take Action</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {!isResolved ? (
                    <button
                      onClick={() => handleResolveAlert(alert)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#3f6549] hover:bg-[#34553d] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  ) : (
                    <span className="text-xs text-[#34593e] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
