"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Package,
  Calendar,
  Filter,
} from "lucide-react";
import { API_URL } from "@/app/lib/api";
import { Badge } from "@/app/components/ui/Badge";
import { Modal } from "@/app/components/ui/Modal";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { TableSkeleton } from "@/app/components/ui/LoadingSpinner";
import { StatCard } from "@/app/components/ui/StatCard";

interface PurchaseItem {
  id: number | string;
  supplier: string;
  productId: number | string;
  quantity: number;
  status: string;
  date: string;
}

const EMPTY_PURCHASE = {
  supplier: "",
  productId: "",
  quantity: "10",
  status: "PENDING",
};

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<PurchaseItem | null>(null);
  const [form, setForm] = useState(EMPTY_PURCHASE);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [purRes, prodRes] = await Promise.all([
        fetch(`${API_URL}/purchases`).then((r) => r.json()).catch(() => []),
        fetch(`${API_URL}/products`).then((r) => r.json()).catch(() => []),
      ]);

      setPurchases(Array.isArray(purRes) ? purRes : []);
      setProducts(Array.isArray(prodRes) ? prodRes : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getProduct = useCallback(
    (productId: string | number) => {
      return products.find((p) => String(p.id) === String(productId));
    },
    [products]
  );

  const suppliersList = useMemo(() => {
    const set = new Set<string>();
    purchases.forEach((p) => {
      if (p.supplier) set.add(p.supplier);
    });
    return Array.from(set);
  }, [purchases]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const prod = getProduct(p.productId);
      const prodName = prod ? prod.name.toLowerCase() : "";
      const supName = (p.supplier || "").toLowerCase();

      const matchesSearch =
        supName.includes(searchQuery.toLowerCase()) ||
        prodName.includes(searchQuery.toLowerCase()) ||
        String(p.id).includes(searchQuery);

      if (!matchesSearch) return false;
      if (supplierFilter !== "ALL" && p.supplier !== supplierFilter) return false;

      if (
        statusFilter !== "ALL" &&
        (p.status || "").toUpperCase() !== statusFilter.toUpperCase()
      ) {
        return false;
      }

      return true;
    });
  }, [purchases, searchQuery, supplierFilter, statusFilter, getProduct]);

  const totalPages = Math.max(1, Math.ceil(filteredPurchases.length / itemsPerPage));
  const paginatedPurchases = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPurchases.slice(start, start + itemsPerPage);
  }, [filteredPurchases, currentPage]);

  const openAddModal = () => {
    setEditingPurchase(null);
    setForm({
      ...EMPTY_PURCHASE,
      productId: products.length > 0 ? String(products[0].id) : "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (p: PurchaseItem) => {
    setEditingPurchase(p);
    setForm({
      supplier: p.supplier || "",
      productId: String(p.productId || ""),
      quantity: String(p.quantity || "1"),
      status: (p.status || "PENDING").toUpperCase(),
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplier.trim()) return setFormError("Supplier name is required.");
    if (!form.productId) return setFormError("Please select a target product.");
    const qty = parseInt(form.quantity, 10);
    if (isNaN(qty) || qty <= 0) return setFormError("Quantity must be greater than zero.");

    setIsSubmitting(true);
    setFormError("");

    try {
      const payload = {
        supplier: form.supplier.trim(),
        productId: Number(form.productId),
        quantity: qty,
        status: form.status,
      };

      if (editingPurchase) {
        await fetch(`${API_URL}/purchases/${editingPurchase.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...editingPurchase, ...payload }),
        });
      } else {
        await fetch(`${API_URL}/purchases`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setFormError("Failed to save purchase order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await fetch(`${API_URL}/purchases/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const updatePurchaseStatus = async (purchase: PurchaseItem, newStatus: string) => {
    try {
      await fetch(`${API_URL}/purchases/${purchase.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...purchase, status: newStatus }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const pendingCount = purchases.filter((p) => (p.status || "").toUpperCase() === "PENDING").length;
  const receivedCount = purchases.filter((p) => (p.status || "").toUpperCase() === "RECEIVED" || (p.status || "").toUpperCase() === "COMPLETED").length;
  const totalUnits = purchases.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#1a1f1c] tracking-tight">
              Purchase Procurement
            </h1>
            <Badge variant="neutral">{filteredPurchases.length} Orders</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#616d65] mt-1 font-medium">
            Manage procurement requests, track incoming supplier replenishment shipments, and update intake statuses.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3f6549] hover:bg-[#34553d] text-white text-xs font-semibold shadow-xs shadow-[#3f6549]/20 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Purchase Order</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Purchases"
          value={purchases.length}
          icon={Truck}
          subtitle={`${totalUnits} units requisitioned`}
          accentColor="sage"
        />
        <StatCard
          title="Pending Procurement"
          value={pendingCount}
          icon={Clock}
          subtitle="Awaiting supplier dispatch"
          accentColor="amber"
        />
        <StatCard
          title="Received & Fulfilled"
          value={receivedCount}
          icon={CheckCircle2}
          subtitle="Inventory successfully stocked"
          accentColor="sage"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#dce2de] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7f8b83]" />
            <input
              type="text"
              placeholder="Search supplier, product or PO ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium text-[#1a1f1c] placeholder-[#7f8b83] focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white transition-all"
            />
          </div>

          <div>
            <select
              value={supplierFilter}
              onChange={(e) => {
                setSupplierFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium text-[#3e4841] focus:outline-none focus:ring-2 focus:ring-[#4d7557] transition-all cursor-pointer"
            >
              <option value="ALL">All Suppliers</option>
              {suppliersList.map((sup) => (
                <option key={sup} value={sup}>
                  {sup}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium text-[#3e4841] focus:outline-none focus:ring-2 focus:ring-[#4d7557] transition-all cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="RECEIVED">Received</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-[#dce2de] shadow-xs overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : filteredPurchases.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No Purchase Orders"
            description="No purchase records match your query. Create a purchase order to request more inventory from a supplier."
            actionText="+ Create Purchase Order"
            onAction={openAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#f6f8f6] border-b border-[#dce2de] text-[#616d65] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">PO Code</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4">Product Requisitioned</th>
                  <th className="py-3.5 px-4 text-center">Quantity</th>
                  <th className="py-3.5 px-4">Order Date</th>
                  <th className="py-3.5 px-4">Intake Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0ee]">
                {paginatedPurchases.map((p, idx) => {
                  const prod = getProduct(p.productId);
                  const status = (p.status || "PENDING").toUpperCase();
                  const itemIndex = (currentPage - 1) * itemsPerPage + idx + 1;

                  return (
                    <tr key={p.id} className="hover:bg-[#f9faf9] transition-colors">
                      <td className="py-4 px-4 text-center text-[#7f8b83] font-mono text-xs">
                        {itemIndex}
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-[#343b37]">
                        PO-#{p.id}
                      </td>

                      <td className="py-4 px-4 font-bold text-[#1a1f1c]">
                        {p.supplier}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#eaf1ec] text-[#34593e] flex items-center justify-center shrink-0">
                            <Package className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-[#1a1f1c] block">
                              {prod?.name || `Product #${p.productId}`}
                            </span>
                            <span className="text-[10px] text-[#7f8b83]">
                              Unit Cost: ₹{prod ? Number(prod.price).toFixed(2) : "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center font-extrabold text-[#1a1f1c]">
                        {p.quantity} units
                      </td>

                      <td className="py-4 px-4 text-[#616d65] text-xs">
                        {p.date ? new Date(p.date).toLocaleDateString() : "Pending"}
                      </td>

                      <td className="py-4 px-4">
                        <select
                          value={status}
                          onChange={(e) => updatePurchaseStatus(p, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition-colors ${
                            status === "RECEIVED" || status === "COMPLETED"
                              ? "bg-[#eaf1ec] text-[#2e5239] border-[#bfd6c5]"
                              : status === "CANCELLED"
                              ? "bg-[#f8e4dc] text-[#972f13] border-[#eab9a4]"
                              : "bg-[#faece1] text-[#aa4b1a] border-[#eec6a9]"
                          }`}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="RECEIVED">Received</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg border border-[#dce2de] text-[#4d5750] hover:text-[#3f6549] hover:bg-[#eaf1ec] transition-colors cursor-pointer"
                          title="Edit Purchase Order"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-1.5 rounded-lg border border-[#dce2de] text-[#4d5750] hover:text-[#a63519] hover:bg-[#faece1] transition-colors cursor-pointer"
                          title="Delete PO"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredPurchases.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#edf0ee] bg-[#f9faf9] text-xs">
            <span className="text-[#616d65] font-medium">
              Showing{" "}
              <strong className="text-[#1a1f1c]">
                {(currentPage - 1) * itemsPerPage + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-[#1a1f1c]">
                {Math.min(currentPage * itemsPerPage, filteredPurchases.length)}
              </strong>{" "}
              of <strong className="text-[#1a1f1c]">{filteredPurchases.length}</strong> purchase orders
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-[#dce2de] bg-white hover:bg-[#f6f8f6] disabled:opacity-40 disabled:cursor-not-allowed text-[#4d5750] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-semibold text-[#1a1f1c]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg border border-[#dce2de] bg-white hover:bg-[#f6f8f6] disabled:opacity-40 disabled:cursor-not-allowed text-[#4d5750] cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Purchase Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPurchase ? "Edit Purchase Order" : "Create New Purchase Order"}
        description="Requisition raw inventory from verified suppliers"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-[#faece1] border border-[#eec6a9] text-[#a64516] text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#343b36]">Supplier Name</label>
              <input
                type="text"
                required
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                placeholder="e.g. Acme Components LLC"
                className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#343b36]">Requisition Product</label>
              <select
                required
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white cursor-pointer"
              >
                <option value="">Select product to restock...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current: {p.quantity} units)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#343b36]">Order Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="10"
                className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#343b36]">Initial Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white cursor-pointer"
              >
                <option value="PENDING">Pending Requisition</option>
                <option value="RECEIVED">Received & In Stock</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-[#edf0ee]">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-[#dce2de] text-xs font-semibold text-[#4d5750] hover:bg-[#f6f8f6] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#3f6549] hover:bg-[#34553d] text-white text-xs font-semibold shadow-xs shadow-[#3f6549]/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? "Submitting..."
                : editingPurchase
                ? "Update PO"
                : "Submit PO"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Purchase Order"
        message="Are you sure you want to delete this purchase order record? This cannot be undone."
        confirmText="Delete Order"
        isLoading={isDeleting}
      />
    </div>
  );
}
