"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Boxes,
  Plus,
  Search,
  Download,
  FileText,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { API_URL } from "@/app/lib/api";
import { exportInventoryReport } from "@/app/lib/exportUtils";
import { Badge } from "@/app/components/ui/Badge";
import { Modal } from "@/app/components/ui/Modal";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { TableSkeleton } from "@/app/components/ui/LoadingSpinner";

interface ProductItem {
  id: number | string;
  name: string;
  sku?: string;
  category: string;
  price: number;
  quantity: number;
  supplier?: string;
  expiryDate?: string;
}

const EMPTY_FORM = {
  name: "",
  sku: "",
  category: "",
  price: "",
  quantity: "",
  supplier: "",
  expiryDate: "",
};

export default function InventoryManagementPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("viewer");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [supplierFilter, setSupplierFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm State
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
    const storedUser = localStorage.getItem("inventory_user") || localStorage.getItem("user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUserRole((u.role || "viewer").toLowerCase());
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const isReadOnly = userRole === "viewer";

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load products", e);
    } finally {
      setLoading(false);
    }
  };

  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const suppliersList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.supplier) set.add(p.supplier);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;
      if (categoryFilter !== "ALL" && p.category !== categoryFilter) return false;
      if (supplierFilter !== "ALL" && p.supplier !== supplierFilter) return false;

      if (statusFilter === "IN_STOCK" && p.quantity <= 5) return false;
      if (statusFilter === "LOW_STOCK" && (p.quantity <= 0 || p.quantity > 5)) return false;
      if (statusFilter === "OUT_OF_STOCK" && p.quantity > 0) return false;

      return true;
    });
  }, [products, searchQuery, categoryFilter, supplierFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const openAddModal = () => {
    if (isReadOnly) return;
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (p: ProductItem) => {
    if (isReadOnly) return;
    setEditingProduct(p);
    setForm({
      name: p.name,
      sku: p.sku || "",
      category: p.category || "",
      price: String(p.price),
      quantity: String(p.quantity),
      supplier: p.supplier || "",
      expiryDate: p.expiryDate || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!form.name.trim()) return setFormError("Product name is required.");
    const numPrice = parseFloat(form.price);
    const numQty = parseInt(form.quantity, 10);

    if (isNaN(numPrice) || numPrice < 0) return setFormError("Price must be a valid positive number.");
    if (isNaN(numQty) || numQty < 0) return setFormError("Quantity must be a valid non-negative integer.");

    setIsSubmitting(true);
    setFormError("");

    try {
      const generatedSku = form.sku.trim() || `SKU-${form.category.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        name: form.name.trim(),
        sku: generatedSku,
        category: form.category.trim() || "General",
        price: numPrice,
        quantity: numQty,
        supplier: form.supplier.trim() || "Default Supplier",
        expiryDate: form.expiryDate || null,
      };

      if (editingProduct) {
        await fetch(`${API_URL}/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...editingProduct, ...payload }),
        });
      } else {
        await fetch(`${API_URL}/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setFormError("Failed to save product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id: string | number) => {
    if (isReadOnly) return;
    setDeleteId(id);
  };

  const executeDelete = async () => {
    if (!deleteId || isReadOnly) return;
    setIsDeleting(true);
    try {
      await fetch(`${API_URL}/products/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#1a1f1c] tracking-tight">
              Inventory & Products
            </h1>
            <Badge variant="neutral">
              {filteredProducts.length} {filteredProducts.length === 1 ? "Item" : "Items"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#616d65] mt-1 font-medium">
            {isReadOnly
              ? "Read-only inventory catalogue. View real-time stock levels, pricing, and suppliers."
              : "Complete inventory management. Track stock quantities, SKUs, suppliers, and reorder levels."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => exportInventoryReport(products, "csv")}
            disabled={products.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#dce2de] bg-white hover:bg-[#f6f8f6] text-[#3e4841] text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            title="Download CSV"
          >
            <Download className="w-4 h-4 text-[#3f6549]" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => exportInventoryReport(products, "pdf")}
            disabled={products.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#dce2de] bg-white hover:bg-[#f6f8f6] text-[#3e4841] text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            title="Download PDF"
          >
            <FileText className="w-4 h-4 text-[#c65922]" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3f6549] hover:bg-[#34553d] text-white text-xs font-semibold shadow-xs shadow-[#3f6549]/20 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#dce2de] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7f8b83]" />
            <input
              type="text"
              placeholder="Search product name, SKU..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium text-[#1a1f1c] placeholder-[#7f8b83] focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white transition-all"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium text-[#3e4841] focus:outline-none focus:ring-2 focus:ring-[#4d7557] transition-all cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier Filter */}
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

          {/* Stock Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium text-[#3e4841] focus:outline-none focus:ring-2 focus:ring-[#4d7557] transition-all cursor-pointer"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="IN_STOCK">In Stock (&gt; 5)</option>
              <option value="LOW_STOCK">Low Stock (1-5)</option>
              <option value="OUT_OF_STOCK">Out of Stock (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Product Table Card */}
      <div className="bg-white rounded-2xl border border-[#dce2de] shadow-xs overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={8} />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No Products Found"
            description={
              searchQuery || categoryFilter !== "ALL" || statusFilter !== "ALL"
                ? "No products match the selected query. Try adjusting your filter."
                : "No products currently exist in your inventory catalog."
            }
            actionText={!isReadOnly ? "+ Add New Product" : undefined}
            onAction={!isReadOnly ? openAddModal : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#f6f8f6] border-b border-[#dce2de] text-[#616d65] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Unit Price (₹)</th>
                  <th className="py-3.5 px-4 text-center">Quantity</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4">Status</th>
                  {!isReadOnly && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0ee]">
                {paginatedProducts.map((p, idx) => {
                  const isOut = p.quantity === 0;
                  const isLow = p.quantity > 0 && p.quantity <= 5;
                  const itemIndex = (currentPage - 1) * itemsPerPage + idx + 1;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#f9faf9] transition-colors group"
                    >
                      <td className="py-4 px-4 text-center text-[#7f8b83] font-mono text-xs">
                        {itemIndex}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#eaf1ec] flex items-center justify-center text-[#34593e] shrink-0 font-bold text-xs group-hover:bg-[#dce9df] transition-colors">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-[#1a1f1c] block">
                              {p.name}
                            </span>
                            {p.expiryDate && (
                              <span className="text-[10px] text-[#7f8b83] flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3 text-[#b4511c]" />
                                <span>Expires: {p.expiryDate}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#edf0ee] text-[#4d5750] border border-[#d8ded9]">
                          {p.sku || `SKU-${p.id}`}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-medium text-[#4d5750]">
                          {p.category || "General"}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right font-extrabold text-[#1a1f1c]">
                        ₹{Number(p.price || 0).toFixed(2)}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="font-extrabold text-[#1a1f1c]">
                          {p.quantity}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-medium text-[#4d5750]">
                        {p.supplier || "N/A"}
                      </td>

                      <td className="py-4 px-4">
                        <Badge
                          variant={isOut ? "danger" : isLow ? "warning" : "success"}
                          dot
                        >
                          {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                        </Badge>
                      </td>

                      {!isReadOnly && (
                        <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg border border-[#dce2de] text-[#4d5750] hover:text-[#3f6549] hover:bg-[#eaf1ec] transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => confirmDelete(p.id)}
                            className="p-1.5 rounded-lg border border-[#dce2de] text-[#4d5750] hover:text-[#a63519] hover:bg-[#faece1] transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredProducts.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#edf0ee] bg-[#f9faf9] text-xs">
            <span className="text-[#616d65] font-medium">
              Showing{" "}
              <strong className="text-[#1a1f1c]">
                {(currentPage - 1) * itemsPerPage + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-[#1a1f1c]">
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
              </strong>{" "}
              of <strong className="text-[#1a1f1c]">{filteredProducts.length}</strong> items
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-[#dce2de] bg-white hover:bg-[#f6f8f6] disabled:opacity-40 disabled:cursor-not-allowed text-[#4d5750] cursor-pointer"
                aria-label="Previous Page"
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
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? "Edit Product Details" : "Add New Inventory Product"}
        description={
          editingProduct
            ? `Updating inventory record for ${editingProduct.name}`
            : "Enter details below to register a new product in the system"
        }
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-[#faece1] border border-[#eec6a9] text-[#a64516] text-xs font-semibold">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-[#343b36]">
                Product Name <span className="text-[#b4511c]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Mechanical Ergonomic Keyboard"
                className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white"
              />
            </div>

            {/* SKU */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#343b36]">SKU Code</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="Auto-generated if blank"
                className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#343b36]">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Electronics, Peripherals"
                className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white"
              />
            </div>

            {/* Unit Price */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#343b36]">
                Unit Price (₹) <span className="text-[#b4511c]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#343b36]">
                Stock Quantity <span className="text-[#b4511c]">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white"
              />
            </div>

            {/* Supplier */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#343b36]">Supplier Name</label>
              <input
                type="text"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                placeholder="e.g. TechLogistics Global"
                className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white"
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#343b36]">Expiry Date</label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white"
              />
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
                ? "Saving..."
                : editingProduct
                ? "Update Product"
                : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        title="Delete Product"
        message="Are you sure you want to permanently delete this product? This action cannot be undone and will affect inventory records."
        confirmText="Delete Product"
        isLoading={isDeleting}
      />
    </div>
  );
}
