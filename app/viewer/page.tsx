"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Boxes,
  Package,
  Search,
  Eye,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2,
  PackageX,
  Layers,
  Sparkles,
} from "lucide-react";
import { API_URL } from "@/app/lib/api";
import { StatCard } from "@/app/components/ui/StatCard";
import { Badge } from "@/app/components/ui/Badge";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Modal } from "@/app/components/ui/Modal";

interface Product {
  id: number | string;
  name: string;
  sku?: string;
  category?: string;
  price: number;
  quantity: number;
  supplier?: string;
  expiryDate?: string;
}

export default function ViewerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
    );
  }, [products, search]);

  const inStock = useMemo(() => products.filter((p) => p.quantity > 5).length, [products]);
  const lowStock = useMemo(
    () => products.filter((p) => p.quantity > 0 && p.quantity <= 5).length,
    [products]
  );
  const outOfStock = useMemo(() => products.filter((p) => p.quantity === 0).length, [products]);
  const totalValuation = useMemo(
    () => products.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 0), 0),
    [products]
  );

  if (loading) {
    return <LoadingSpinner label="Loading Viewer Observatory..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-[#1c201d] tracking-tight">
              Viewer Observatory
            </h1>
            <Badge variant="viewer" dot>Read-Only Inspection</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#5d6860] mt-1 font-medium">
            Live catalog observation portal. Audit real-time inventory balances, product specifications, and asset valuations.
          </p>
        </div>

        <Link
          href="/viewer/inventory"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#466e50] hover:bg-[#385840] text-white text-xs font-bold shadow-xs hover:shadow transition-all"
        >
          <Boxes className="w-4 h-4" />
          <span>Full Inventory Table</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-80" />
        </Link>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Catalog Items"
          value={products.length}
          icon={Boxes}
          subtitle={`Valuation: ₹${totalValuation.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          accentColor="sage"
        />
        <StatCard
          title="In Stock Units"
          value={inStock}
          icon={CheckCircle2}
          subtitle="Healthy stock balances"
          accentColor="sage"
        />
        <StatCard
          title="Low Stock Watchlist"
          value={lowStock}
          icon={AlertTriangle}
          subtitle="Restock required soon"
          accentColor="amber"
        />
        <StatCard
          title="Out of Stock Items"
          value={outOfStock}
          icon={PackageX}
          subtitle="Zero units on shelf"
          accentColor="amber"
        />
      </div>

      {/* Catalog Grid View */}
      <div className="bg-white rounded-2xl p-6 border border-[#dce2de] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#1c201d] tracking-tight">
              Product Catalogue
            </h3>
            <p className="text-xs text-[#5d6860] mt-0.5">
              Showing {filtered.length} of {products.length} catalogued items
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7d8a80]" />
            <input
              type="text"
              placeholder="Search product, SKU, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#f4f6f4] border border-[#dce2de] rounded-xl text-xs sm:text-sm font-medium text-[#1c201d] placeholder-[#7d8a80] focus:outline-none focus:ring-2 focus:ring-[#466e50] focus:bg-white transition-all"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No Items Found"
            description="No inventory items match your current search query."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => {
              const isOut = p.quantity === 0;
              const isLow = p.quantity > 0 && p.quantity <= 5;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className="p-5 rounded-2xl border border-[#dce2de] hover:border-[#466e50]/60 bg-white hover:bg-[#f9faf9] hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#f0f4f1] text-[#385840] flex items-center justify-center font-bold group-hover:bg-[#466e50] group-hover:text-white transition-colors">
                        <Package className="w-5 h-5" />
                      </div>
                      <Badge variant={isOut ? "danger" : isLow ? "warning" : "success"} dot>
                        {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                      </Badge>
                    </div>

                    <h4 className="font-extrabold text-sm text-[#1c201d] group-hover:text-[#466e50] transition-colors line-clamp-1">
                      {p.name}
                    </h4>

                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#7d8a80]">
                      <span className="font-mono text-[#5d6860] bg-[#f4f6f4] px-1.5 py-0.5 rounded border border-[#dce2de]">
                        {p.sku || `SKU-${p.id}`}
                      </span>
                      <span>•</span>
                      <span>{p.category || "General"}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#edf1ee] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#7d8a80] tracking-wider block">
                        On-Hand
                      </span>
                      <span className="text-xs font-extrabold text-[#1c201d]">
                        {p.quantity} units
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[#7d8a80] tracking-wider block">
                        Unit Price
                      </span>
                      <span className="text-sm font-extrabold text-[#466e50]">
                        ₹{Number(p.price || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Read-Only Detail Modal */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct.name}
          description={`SKU: ${selectedProduct.sku || selectedProduct.id}`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-[#f4f6f4] border border-[#dce2de] space-y-2.5">
              <div className="flex justify-between items-center py-1 border-b border-[#e2e7e3]">
                <span className="text-[#5d6860] font-medium">Category:</span>
                <span className="font-bold text-[#1c201d]">{selectedProduct.category || "General"}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#e2e7e3]">
                <span className="text-[#5d6860] font-medium">Unit Price:</span>
                <span className="font-bold text-[#466e50]">
                  ₹{Number(selectedProduct.price).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#e2e7e3]">
                <span className="text-[#5d6860] font-medium">Stock Count:</span>
                <span className="font-extrabold text-[#1c201d]">
                  {selectedProduct.quantity} units
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#e2e7e3]">
                <span className="text-[#5d6860] font-medium">Total Asset Value:</span>
                <span className="font-extrabold text-[#c65922]">
                  ₹{(Number(selectedProduct.price) * Number(selectedProduct.quantity)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#e2e7e3]">
                <span className="text-[#5d6860] font-medium">Supplier:</span>
                <span className="text-[#1c201d] font-semibold">{selectedProduct.supplier || "N/A"}</span>
              </div>
              {selectedProduct.expiryDate && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#5d6860] font-medium">Expiry Date:</span>
                  <span className="text-[#1c201d] font-semibold">{selectedProduct.expiryDate}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedProduct(null)}
              className="w-full py-2.5 rounded-xl bg-[#1c201d] text-white font-semibold text-xs hover:bg-[#2e3530] transition-colors cursor-pointer shadow-xs"
            >
              Close Overview
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
