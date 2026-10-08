"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  ShoppingCart,
  Search,
  Download,
  FileText,
  Eye,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { API_URL } from "@/app/lib/api";
import { exportSalesReport } from "@/app/lib/exportUtils";
import { Badge } from "@/app/components/ui/Badge";
import { Modal } from "@/app/components/ui/Modal";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { TableSkeleton } from "@/app/components/ui/LoadingSpinner";

interface OrderItem {
  id: number | string;
  productId: number | string;
  quantity: number;
  totalPrice: number;
  orderStatus: string;
  date: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes] = await Promise.all([
        fetch(`${API_URL}/orders`).then((r) => r.json()).catch(() => []),
        fetch(`${API_URL}/products`).then((r) => r.json()).catch(() => []),
      ]);

      setOrders(Array.isArray(ordRes) ? ordRes : []);
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

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const prod = getProduct(o.productId);
      const prodName = prod ? prod.name.toLowerCase() : "";
      const orderIdStr = String(o.id).toLowerCase();

      const matchesSearch =
        orderIdStr.includes(searchQuery.toLowerCase()) ||
        prodName.includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (
        statusFilter !== "ALL" &&
        (o.orderStatus || "").toUpperCase() !== statusFilter.toUpperCase()
      ) {
        return false;
      }

      if (dateFilter !== "ALL" && o.date) {
        const orderDate = new Date(o.date);
        const now = new Date();
        if (dateFilter === "TODAY") {
          if (orderDate.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === "WEEK") {
          const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 7) return false;
        } else if (dateFilter === "MONTH") {
          const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 30) return false;
        }
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, dateFilter, getProduct]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const getStatusBadgeVariant = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "COMPLETED") return "success";
    if (s === "PENDING") return "warning";
    if (s === "PROCESSING") return "warning";
    if (s === "CANCELLED") return "danger";
    return "neutral";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#1a1f1c] tracking-tight">
              Order Fulfillment
            </h1>
            <Badge variant="admin">
              {filteredOrders.length} {filteredOrders.length === 1 ? "Order" : "Orders"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#616d65] mt-1 font-medium">
            Monitor sales fulfillment, track customer order statuses, and review transactional histories.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => exportSalesReport(orders, products, "csv")}
            disabled={orders.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#dce2de] bg-white hover:bg-[#f6f8f6] text-[#3e4841] text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            title="Download CSV"
          >
            <Download className="w-4 h-4 text-[#3f6549]" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => exportSalesReport(orders, products, "pdf")}
            disabled={orders.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#dce2de] bg-white hover:bg-[#f6f8f6] text-[#3e4841] text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            title="Download PDF"
          >
            <FileText className="w-4 h-4 text-[#c65922]" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#dce2de] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7f8b83]" />
            <input
              type="text"
              placeholder="Search by order ID or product name..."
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
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium text-[#3e4841] focus:outline-none focus:ring-2 focus:ring-[#4d7557] transition-all cursor-pointer"
            >
              <option value="ALL">All Order Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2.5 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium text-[#3e4841] focus:outline-none focus:ring-2 focus:ring-[#4d7557] transition-all cursor-pointer"
            >
              <option value="ALL">All Time Periods</option>
              <option value="TODAY">Today Only</option>
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#dce2de] shadow-xs overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No Orders Found"
            description="No customer sales or orders match your current query or filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#f6f8f6] border-b border-[#dce2de] text-[#616d65] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4 text-center">Quantity</th>
                  <th className="py-3.5 px-4 text-right">Total Price (₹)</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0ee]">
                {paginatedOrders.map((o, idx) => {
                  const prod = getProduct(o.productId);
                  const itemIndex = (currentPage - 1) * itemsPerPage + idx + 1;

                  return (
                    <tr key={o.id} className="hover:bg-[#f9faf9] transition-colors">
                      <td className="py-4 px-4 text-center text-[#7f8b83] font-mono text-xs">
                        {itemIndex}
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-[#343b37]">
                        #{o.id}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#eaf1ec] text-[#34593e] flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-[#1a1f1c] block">
                              {prod?.name || "Product"}
                            </span>
                            <span className="text-[10px] text-[#7f8b83]">
                              {prod?.category || "General"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center font-bold text-[#1a1f1c]">
                        {o.quantity} units
                      </td>

                      <td className="py-4 px-4 text-right font-extrabold text-[#385c41]">
                        ₹{Number(o.totalPrice || 0).toFixed(2)}
                      </td>

                      <td className="py-4 px-4 text-[#616d65] text-xs">
                        {o.date ? new Date(o.date).toLocaleString() : "N/A"}
                      </td>

                      <td className="py-4 px-4">
                        <Badge variant={getStatusBadgeVariant(o.orderStatus)} dot>
                          {o.orderStatus || "COMPLETED"}
                        </Badge>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dce2de] text-xs font-semibold text-[#4d5750] hover:text-[#3f6549] hover:bg-[#eaf1ec] transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
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
        {filteredOrders.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#edf0ee] bg-[#f9faf9] text-xs">
            <span className="text-[#616d65] font-medium">
              Showing{" "}
              <strong className="text-[#1a1f1c]">
                {(currentPage - 1) * itemsPerPage + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-[#1a1f1c]">
                {Math.min(currentPage * itemsPerPage, filteredOrders.length)}
              </strong>{" "}
              of <strong className="text-[#1a1f1c]">{filteredOrders.length}</strong> orders
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.id} Summary`}
          description="Complete transactional breakdown and product fulfillment details"
          maxWidth="md"
        >
          {(() => {
            const prod = getProduct(selectedOrder.productId);
            return (
              <div className="space-y-5 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-[#f6f8f6] border border-[#dce2de] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#717e75]">
                      Fulfillment Status
                    </p>
                    <div className="mt-1">
                      <Badge variant={getStatusBadgeVariant(selectedOrder.orderStatus)} dot>
                        {selectedOrder.orderStatus || "COMPLETED"}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-[#717e75]">Order Total</p>
                    <p className="text-xl font-extrabold text-[#385c41]">
                      ₹{Number(selectedOrder.totalPrice || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 divide-y divide-[#edf0ee]">
                  <div className="flex justify-between py-2">
                    <span className="text-[#616d65] font-medium">Product Item:</span>
                    <span className="font-bold text-[#1a1f1c]">{prod?.name || "Product"}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#616d65] font-medium">SKU:</span>
                    <span className="font-mono text-[#4d5750]">{prod?.sku || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#616d65] font-medium">Category:</span>
                    <span className="text-[#1a1f1c] font-semibold">{prod?.category || "General"}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#616d65] font-medium">Unit Price:</span>
                    <span className="text-[#1a1f1c] font-semibold">
                      ₹{prod ? Number(prod.price).toFixed(2) : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#616d65] font-medium">Quantity Sold:</span>
                    <span className="text-[#1a1f1c] font-bold">{selectedOrder.quantity} units</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#616d65] font-medium">Transaction Date:</span>
                    <span className="text-[#1a1f1c]">
                      {selectedOrder.date ? new Date(selectedOrder.date).toLocaleString() : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#edf0ee] flex justify-end">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-5 py-2.5 rounded-xl bg-[#242b26] text-white text-xs font-semibold hover:bg-[#1a1f1c] transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
