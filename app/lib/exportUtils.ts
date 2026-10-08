import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// CSV Helper to download content
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCell = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows = [
    headers.map(escapeCell).join(","),
    ...rows.map(row => row.map(escapeCell).join(","))
  ];

  const csvString = "\uFEFF" + csvRows.join("\r\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Format currency in Indian Rupees (INR)
const formatCurrency = (amount: number) => {
  return "INR " + amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Formats timestamp for reports
const getFormattedDateTime = () => {
  const now = new Date();
  return now.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// ==========================================
// 1. INVENTORY STOCK REPORT
// ==========================================
export function exportInventoryReport(products: any[], format: "csv" | "pdf") {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `inventory-report-${timestamp}`;

  const headers = [
    "Product Name",
    "SKU",
    "Category",
    "Unit Price (INR)",
    "In Stock",
    "Total Value (INR)",
    "Status",
    "Supplier",
    "Expiry Date"
  ];

  const rows = products.map((p) => {
    const qty = Number(p.quantity) || 0;
    const price = Number(p.price) || 0;
    const val = (qty * price).toFixed(2);
    const status = qty === 0 ? "Out of Stock" : qty <= 5 ? "Low Stock" : "In Stock";
    return [
      p.name || "N/A",
      p.sku || `SKU-${p.id || ""}`,
      p.category || "General",
      price.toFixed(2),
      qty,
      val,
      status,
      p.supplier || "N/A",
      p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : "N/A"
    ];
  });

  if (format === "csv") {
    downloadCSV(filename, headers, rows);
    return;
  }

  // PDF Export
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const totalItems = products.length;
  const totalValuation = products.reduce((acc, p) => acc + (Number(p.quantity) || 0) * (Number(p.price) || 0), 0);
  const lowStockCount = products.filter(p => (Number(p.quantity) || 0) > 0 && (Number(p.quantity) || 0) <= 5).length;
  const outOfStockCount = products.filter(p => (Number(p.quantity) || 0) === 0).length;

  // Header Banner
  doc.setFillColor(90, 75, 250); // Brand purple-indigo
  doc.rect(0, 0, 595.28, 70, "F");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("INVENTORY STOCK REPORT", 40, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated: ${getFormattedDateTime()}`, 40, 58);

  // Summary Metrics Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(40, 85, 515, 60, 6, 6, "FD");

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL PRODUCTS", 55, 105);
  doc.text("TOTAL VALUATION", 185, 105);
  doc.text("LOW STOCK ITEMS", 330, 105);
  doc.text("OUT OF STOCK", 450, 105);

  doc.setTextColor(30, 27, 75);
  doc.setFontSize(14);
  doc.text(String(totalItems), 55, 128);
  doc.text(formatCurrency(totalValuation), 185, 128);
  doc.setTextColor(217, 119, 6);
  doc.text(String(lowStockCount), 330, 128);
  doc.setTextColor(239, 68, 68);
  doc.text(String(outOfStockCount), 450, 128);

  // Table
  autoTable(doc, {
    startY: 160,
    head: [["Product", "Category", "Price", "Qty", "Total Val.", "Status", "Supplier"]],
    body: products.map(p => {
      const qty = Number(p.quantity) || 0;
      const price = Number(p.price) || 0;
      const status = qty === 0 ? "OUT OF STOCK" : qty <= 5 ? "LOW STOCK" : "IN STOCK";
      return [
        p.name || "N/A",
        p.category || "General",
        price.toFixed(2),
        qty,
        (qty * price).toFixed(2),
        status,
        p.supplier || "N/A"
      ];
    }),
    headStyles: {
      fillColor: [90, 75, 250],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: 40,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "center" },
      4: { halign: "right" },
      5: { halign: "center" },
    },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 5) {
        if (data.cell.raw === "OUT OF STOCK") {
          doc.setTextColor(239, 68, 68);
        } else if (data.cell.raw === "LOW STOCK") {
          doc.setTextColor(217, 119, 6);
        } else {
          doc.setTextColor(16, 185, 129);
        }
      }
    },
    margin: { left: 40, right: 40 },
    theme: "grid"
  });

  // Footer with page numbering
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Inventory Management System - Page ${i} of ${pageCount}`,
      40,
      820
    );
  }

  doc.save(`${filename}.pdf`);
}

// ==========================================
// 2. SALES HISTORY REPORT
// ==========================================
export function exportSalesReport(orders: any[], products: any[], format: "csv" | "pdf") {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `sales-report-${timestamp}`;

  const getProductName = (id: string) => {
    const p = products.find(prod => String(prod.id) === String(id));
    return p ? p.name : "Product";
  };

  const headers = [
    "Order ID",
    "Product Name",
    "Quantity Sold",
    "Total Revenue (INR)",
    "Date & Time",
    "Status"
  ];

  const rows = orders.map((o, idx) => [
    `#${idx + 1} (${o.id || ""})`,
    getProductName(o.productId),
    Number(o.quantity) || 1,
    Number(o.totalPrice || 0).toFixed(2),
    o.date ? new Date(o.date).toLocaleString() : "N/A",
    o.orderStatus || "COMPLETED"
  ]);

  if (format === "csv") {
    downloadCSV(filename, headers, rows);
    return;
  }

  // PDF Export
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
  const totalUnits = orders.reduce((sum, o) => sum + Number(o.quantity || 1), 0);
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;

  // Header Banner
  doc.setFillColor(90, 75, 250);
  doc.rect(0, 0, 595.28, 70, "F");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("SALES PERFORMANCE REPORT", 40, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated: ${getFormattedDateTime()}`, 40, 58);

  // Summary Metrics Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(40, 85, 515, 60, 6, 6, "FD");

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL REVENUE", 55, 105);
  doc.text("TOTAL ORDERS", 195, 105);
  doc.text("UNITS SOLD", 325, 105);
  doc.text("AVG ORDER VALUE", 435, 105);

  doc.setTextColor(16, 185, 129);
  doc.setFontSize(14);
  doc.text(formatCurrency(totalRevenue), 55, 128);
  doc.setTextColor(30, 27, 75);
  doc.text(String(orders.length), 195, 128);
  doc.text(String(totalUnits), 325, 128);
  doc.text(formatCurrency(avgOrder), 435, 128);

  // Table
  autoTable(doc, {
    startY: 160,
    head: [["#", "Product Name", "Qty", "Revenue", "Date", "Status"]],
    body: orders.map((o, idx) => [
      `#${idx + 1}`,
      getProductName(o.productId),
      `${o.quantity} Units`,
      formatCurrency(Number(o.totalPrice || 0)),
      o.date ? new Date(o.date).toLocaleDateString() : "N/A",
      (o.orderStatus || "COMPLETED").toUpperCase()
    ]),
    headStyles: {
      fillColor: [90, 75, 250],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: 40,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 35, halign: "center" },
      2: { halign: "center" },
      3: { halign: "right" },
      5: { halign: "center" },
    },
    margin: { left: 40, right: 40 },
    theme: "grid"
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Inventory Management System - Page ${i} of ${pageCount}`,
      40,
      820
    );
  }

  doc.save(`${filename}.pdf`);
}

// ==========================================
// 3. COMPREHENSIVE ANALYTICS REPORT
// ==========================================
export function exportAnalyticsReport(
  totalRevenue: number,
  totalSales: number,
  avgOrder: number,
  stockValuation: number,
  categories: { name: string; value: number; pct: number }[],
  orders: any[],
  products: any[],
  format: "csv" | "pdf"
) {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `inventory-analytics-summary-${timestamp}`;

  if (format === "csv") {
    // Generate a multi-section structured CSV
    const rows: (string | number)[][] = [
      ["=== INVENTORY & SALES EXECUTIVE SUMMARY ==="],
      ["Generated At", new Date().toLocaleString()],
      [""],
      ["METRIC", "VALUE"],
      ["Total Sales Revenue (INR)", totalRevenue.toFixed(2)],
      ["Total Completed Orders", totalSales],
      ["Average Order Value (INR)", avgOrder.toFixed(2)],
      ["Total Stock Valuation (INR)", stockValuation.toFixed(2)],
      ["Total Products Tracked", products.length],
      [""],
      ["=== CATEGORY BREAKDOWN ==="],
      ["Category Name", "Valuation (INR)", "Share of Stock (%)"],
      ...categories.map(c => [c.name, c.value.toFixed(2), `${c.pct}%`]),
      [""],
      ["=== RECENT ORDERS ==="],
      ["Order ID", "Product", "Quantity", "Revenue (INR)", "Date", "Status"],
      ...orders.slice(-15).reverse().map((o, i) => {
        const prod = products.find(p => String(p.id) === String(o.productId));
        return [
          `#${i + 1}`,
          prod?.name || "Product",
          o.quantity,
          Number(o.totalPrice || 0).toFixed(2),
          o.date ? new Date(o.date).toLocaleString() : "N/A",
          o.orderStatus || "COMPLETED"
        ];
      })
    ];

    downloadCSV(filename, ["Section", "Detail", "", "", "", ""], rows);
    return;
  }

  // PDF Export
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  // Banner
  doc.setFillColor(90, 75, 250);
  doc.rect(0, 0, 595.28, 75, "F");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("EXECUTIVE INVENTORY REPORT", 40, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(`Comprehensive Analytics, Valuation & Sales Summary | ${getFormattedDateTime()}`, 40, 60);

  // Top Key Metrics Grid
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(40, 90, 515, 65, 6, 6, "FD");

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL REVENUE", 55, 110);
  doc.text("TOTAL SALES", 185, 110);
  doc.text("AVG ORDER", 300, 110);
  doc.text("STOCK VALUATION", 420, 110);

  doc.setTextColor(16, 185, 129);
  doc.setFontSize(13);
  doc.text(formatCurrency(totalRevenue), 55, 133);
  doc.setTextColor(30, 27, 75);
  doc.text(String(totalSales), 185, 133);
  doc.text(formatCurrency(avgOrder), 300, 133);
  doc.setTextColor(90, 75, 250);
  doc.text(formatCurrency(stockValuation), 420, 133);

  // Section 1: Category Stock Distribution Table
  doc.setTextColor(30, 27, 75);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Category Valuation Breakdown", 40, 175);

  autoTable(doc, {
    startY: 185,
    head: [["Category Name", "Valuation", "% of Total Stock Inventory"]],
    body: categories.map(c => [
      c.name,
      formatCurrency(c.value),
      `${c.pct}%`
    ]),
    headStyles: {
      fillColor: [90, 75, 250],
      textColor: 255,
      fontSize: 9,
      fontStyle: "bold"
    },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "center" }
    },
    theme: "grid",
    margin: { left: 40, right: 40 }
  });

  // Section 2: Recent Transactions
  const nextY = (doc as any).lastAutoTable.finalY + 25;
  doc.setTextColor(30, 27, 75);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Recent Activity & Transactions", 40, nextY);

  autoTable(doc, {
    startY: nextY + 10,
    head: [["Product Name", "Units", "Revenue", "Date", "Status"]],
    body: orders.slice(-10).reverse().map(o => {
      const prod = products.find(p => String(p.id) === String(o.productId));
      return [
        prod?.name || "Product",
        `${o.quantity} Units`,
        formatCurrency(Number(o.totalPrice || 0)),
        o.date ? new Date(o.date).toLocaleDateString() : "N/A",
        (o.orderStatus || "COMPLETED").toUpperCase()
      ];
    }),
    headStyles: {
      fillColor: [30, 27, 75],
      textColor: 255,
      fontSize: 9,
      fontStyle: "bold"
    },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
      4: { halign: "center" }
    },
    theme: "grid",
    margin: { left: 40, right: 40 }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Inventory Management System - Confidential - Page ${i} of ${pageCount}`,
      40,
      820
    );
  }

  doc.save(`${filename}.pdf`);
}
