"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag,
  PackagePlus,
  Truck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Package,
  Boxes,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { API_URL } from "@/app/lib/api";
import { Badge } from "@/app/components/ui/Badge";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";

export default function StaffOperationsPage() {
  const [activeTab, setActiveTab] = useState<"sale" | "entry" | "purchase">("sale");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Sale Order Form State
  const [saleProductId, setSaleProductId] = useState("");
  const [saleQuantity, setSaleQuantity] = useState(1);

  // Stock Entry Form State
  const [entryProductId, setEntryProductId] = useState("");
  const [entryQuantity, setEntryQuantity] = useState(1);

  // Purchase Order Form State
  const [purchaseSupplier, setPurchaseSupplier] = useState("");
  const [purchaseProductId, setPurchaseProductId] = useState("");
  const [purchaseQuantity, setPurchaseQuantity] = useState(10);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setInitialLoading(false);
    }
  };

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const selectedSaleProduct = useMemo(
    () => products.find((p) => String(p.id) === String(saleProductId)),
    [products, saleProductId]
  );

  const selectedEntryProduct = useMemo(
    () => products.find((p) => String(p.id) === String(entryProductId)),
    [products, entryProductId]
  );

  const selectedPurchaseProduct = useMemo(
    () => products.find((p) => String(p.id) === String(purchaseProductId)),
    [products, purchaseProductId]
  );

  const handleProcessSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleProductId) return showNotification("Please select a product.", "error");
    if (!selectedSaleProduct) return;

    if (selectedSaleProduct.quantity < saleQuantity) {
      return showNotification(
        `Insufficient stock! Only ${selectedSaleProduct.quantity} units currently available.`,
        "error"
      );
    }

    setLoading(true);
    try {
      const updatedQuantity = selectedSaleProduct.quantity - saleQuantity;
      await fetch(`${API_URL}/products/${selectedSaleProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: updatedQuantity }),
      });

      const newOrder = {
        productId: Number(selectedSaleProduct.id),
        quantity: Number(saleQuantity),
        totalPrice: Number(selectedSaleProduct.price) * Number(saleQuantity),
        orderStatus: "COMPLETED",
      };
      await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      showNotification(
        `Sale recorded successfully! ${saleQuantity} units of ${selectedSaleProduct.name} fulfilled.`
      );
      setSaleProductId("");
      setSaleQuantity(1);
      fetchProducts();
    } catch {
      showNotification("Error communicating with backend server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStockEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryProductId) return showNotification("Please select a product.", "error");
    if (!selectedEntryProduct) return;
    if (entryQuantity <= 0) return showNotification("Quantity must be greater than zero.", "error");

    setLoading(true);
    try {
      const updatedQuantity = selectedEntryProduct.quantity + entryQuantity;
      await fetch(`${API_URL}/products/${selectedEntryProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: updatedQuantity }),
      });

      showNotification(
        `Stock replenished! New on-hand balance for ${selectedEntryProduct.name} is ${updatedQuantity} units.`
      );
      setEntryProductId("");
      setEntryQuantity(1);
      fetchProducts();
    } catch {
      showNotification("Error completing stock entry.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePurchaseOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseSupplier.trim() || !purchaseProductId) {
      return showNotification("Please complete supplier name and target product.", "error");
    }
    if (purchaseQuantity <= 0) {
      return showNotification("Quantity must be at least 1 unit.", "error");
    }

    setLoading(true);
    try {
      const newPurchase = {
        supplier: purchaseSupplier.trim(),
        productId: Number(purchaseProductId),
        quantity: Number(purchaseQuantity),
        status: "PENDING",
      };

      await fetch(`${API_URL}/purchases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPurchase),
      });

      showNotification(
        `Purchase order created! Requisition for ${purchaseQuantity} units sent to ${purchaseSupplier}.`
      );
      setPurchaseSupplier("");
      setPurchaseProductId("");
      setPurchaseQuantity(10);
    } catch {
      showNotification("Error generating purchase order.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner label="Loading Operations Terminal..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-[#1a1f1c] tracking-tight">
            Inventory Operations Hub
          </h1>
          <Badge variant="staff">Terminal Active</Badge>
        </div>
        <p className="text-xs sm:text-sm text-[#616d65] mt-1 font-medium">
          Fast workflow interface for register counter sales, inbound warehouse shipments, and vendor procurements.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-[#edf1ee] rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab("sale")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "sale"
              ? "bg-white text-[#3f6549] shadow-xs"
              : "text-[#5b675f] hover:text-[#1a1f1c]"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Process Sale Order</span>
        </button>

        <button
          onClick={() => setActiveTab("entry")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "entry"
              ? "bg-white text-[#2e5239] shadow-xs"
              : "text-[#5b675f] hover:text-[#1a1f1c]"
          }`}
        >
          <PackagePlus className="w-4 h-4" />
          <span>Stock Intake Entry</span>
        </button>

        <button
          onClick={() => setActiveTab("purchase")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "purchase"
              ? "bg-white text-[#b4511c] shadow-xs"
              : "text-[#5b675f] hover:text-[#1a1f1c]"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Purchase Order Draft</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs sm:text-sm font-semibold animate-in fade-in ${
            message.type === "success"
              ? "bg-[#eaf1ec] text-[#2c5237] border-[#bed3c3]"
              : "bg-[#faece1] text-[#9c4013] border-[#eec6a9]"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-[#3f6549] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#c65922] shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Terminal Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#dce2de] shadow-xs">
        {/* 1. SALE ORDER TAB */}
        {activeTab === "sale" && (
          <form onSubmit={handleProcessSale} className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#1a1f1c]">Direct Customer Sale</h3>
              <p className="text-xs text-[#616d65]">
                Immediately updates available physical inventory and records transaction in Orders.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-[#343b36]">Select Product</label>
                <select
                  required
                  value={saleProductId}
                  onChange={(e) => setSaleProductId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white cursor-pointer"
                >
                  <option value="">Choose item to sell...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                      {p.name} — ₹{Number(p.price).toFixed(2)} ({p.quantity} units available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#343b36]">Units to Sell</label>
                <input
                  type="number"
                  min="1"
                  max={selectedSaleProduct ? selectedSaleProduct.quantity : undefined}
                  required
                  value={saleQuantity}
                  onChange={(e) => setSaleQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-4 py-3 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white"
                />
              </div>

              {/* Dynamic Calculation Card (Sage Green Theme) */}
              {selectedSaleProduct ? (
                <div className="p-4 rounded-xl bg-[#eaf1ec] border border-[#bed3c3] flex flex-col justify-center">
                  <div className="flex justify-between text-xs text-[#2c5237] font-semibold mb-1">
                    <span>Total Sale Value:</span>
                    <span className="text-sm font-extrabold text-[#23452c]">
                      ₹{(Number(selectedSaleProduct.price) * saleQuantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#4d7557]">
                    <span>Remaining On-Hand:</span>
                    <span className="font-bold">
                      {Math.max(0, selectedSaleProduct.quantity - saleQuantity)} units
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#f6f8f6] border border-[#dce2de] flex items-center justify-center text-xs text-[#7f8b83]">
                  Select a product to preview pricing
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !saleProductId}
              className="w-full py-3.5 px-4 rounded-xl bg-[#3f6549] hover:bg-[#34553d] disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xs shadow-[#3f6549]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? "Processing Sale..." : "Confirm & Record Sale Order"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* 2. STOCK ENTRY TAB */}
        {activeTab === "entry" && (
          <form onSubmit={handleStockEntry} className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#1a1f1c]">Inbound Stock Intake</h3>
              <p className="text-xs text-[#616d65]">
                Log newly delivered items received at the warehouse to increase on-hand counts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-[#343b36]">Product Line</label>
                <select
                  required
                  value={entryProductId}
                  onChange={(e) => setEntryProductId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white cursor-pointer"
                >
                  <option value="">Select product to restock...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Currently {p.quantity} units)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#343b36]">Quantity to Add</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={entryQuantity}
                  onChange={(e) => setEntryQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-4 py-3 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4d7557] focus:bg-white"
                />
              </div>

              {selectedEntryProduct ? (
                <div className="p-4 rounded-xl bg-[#eaf1ec] border border-[#bed3c3] flex flex-col justify-center">
                  <div className="flex justify-between text-xs text-[#2c5237] font-semibold mb-1">
                    <span>Current Inventory:</span>
                    <span className="font-bold">{selectedEntryProduct.quantity} units</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#34593e] font-bold">
                    <span>New Total Balance:</span>
                    <span className="text-sm font-extrabold">
                      {selectedEntryProduct.quantity + entryQuantity} units
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#f6f8f6] border border-[#dce2de] flex items-center justify-center text-xs text-[#7f8b83]">
                  Select a product to view stock balance
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !entryProductId}
              className="w-full py-3.5 px-4 rounded-xl bg-[#34593e] hover:bg-[#2c4e36] disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xs shadow-[#34593e]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? "Recording Intake..." : "Complete Inbound Stock Entry"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        {/* 3. PURCHASE ORDER TAB (Burnt Amber Theme) */}
        {activeTab === "purchase" && (
          <form onSubmit={handleGeneratePurchaseOrder} className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#1a1f1c]">Supplier Purchase Order</h3>
              <p className="text-xs text-[#616d65]">
                Draft an official replenishment requisition for contracted suppliers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#343b36]">Supplier Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Components LLC"
                  value={purchaseSupplier}
                  onChange={(e) => setPurchaseSupplier(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#c65922] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#343b36]">Requisition Product</label>
                <select
                  required
                  value={purchaseProductId}
                  onChange={(e) => setPurchaseProductId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#c65922] focus:bg-white cursor-pointer"
                >
                  <option value="">Select item...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#343b36]">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-4 py-3 bg-[#f6f8f6] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#c65922] focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !purchaseSupplier || !purchaseProductId}
              className="w-full py-3.5 px-4 rounded-xl bg-[#c65922] hover:bg-[#a64516] disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xs shadow-[#c65922]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? "Generating Requisition..." : "Submit Purchase Order Draft"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
