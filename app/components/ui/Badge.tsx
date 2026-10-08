import React from "react";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "admin"
  | "staff"
  | "viewer";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
  // Sage Green Variant (Success / Optimal Stock)
  success: {
    bg: "bg-[#eaf1ec]",
    text: "text-[#2e5239]",
    border: "border-[#bfd6c5]",
    dot: "bg-[#4a7a58]",
  },
  // Burnt Amber Variant (Warning / Low Stock / Attention)
  warning: {
    bg: "bg-[#faece1]",
    text: "text-[#aa4b1a]",
    border: "border-[#eec6a9]",
    dot: "bg-[#cb5e25]",
  },
  // Deep Burnt Amber / Out of Stock (Critical Danger)
  danger: {
    bg: "bg-[#f8e4dc]",
    text: "text-[#972f13]",
    border: "border-[#eab9a4]",
    dot: "bg-[#b93817]",
  },
  // Concrete Slate Variant (Informational / Tracking)
  info: {
    bg: "bg-[#eaecea]",
    text: "text-[#424b45]",
    border: "border-[#cbcfcb]",
    dot: "bg-[#6c7770]",
  },
  // Soft Concrete Neutral
  neutral: {
    bg: "bg-[#eff1ef]",
    text: "text-[#545d57]",
    border: "border-[#d8deda]",
    dot: "bg-[#87928b]",
  },
  // Admin: Rich Sage Green
  admin: {
    bg: "bg-[#e1ede4]",
    text: "text-[#23452c]",
    border: "border-[#b1cca5]",
    dot: "bg-[#3e6b4a]",
  },
  // Staff: Warm Burnt Amber
  staff: {
    bg: "bg-[#f8eee6]",
    text: "text-[#9b4114]",
    border: "border-[#ecc3a4]",
    dot: "bg-[#be5620]",
  },
  // Viewer: Concrete Grey
  viewer: {
    bg: "bg-[#e8ecea]",
    text: "text-[#3f4a44]",
    border: "border-[#cad2ce]",
    dot: "bg-[#717e76]",
  },
};

export function Badge({ children, variant = "neutral", className = "", dot = false }: BadgeProps) {
  const style = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border transition-all ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      {children}
    </span>
  );
}
