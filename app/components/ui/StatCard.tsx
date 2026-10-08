import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    text?: string;
  };
  accentColor?: "sage" | "amber" | "concrete" | "rose" | "indigo" | "emerald" | "sky" | "purple";
}

const colorMap = {
  // Sage Green Accent
  sage: {
    bg: "bg-[#eaf2ec]",
    text: "text-[#3e694a]",
    border: "border-[#c4dac9]",
    badge: "bg-[#e2ede4] text-[#2c4e36]",
    ring: "hover:border-[#7fa689]",
  },
  // Burnt Amber Accent
  amber: {
    bg: "bg-[#fbf0e6]",
    text: "text-[#b4511c]",
    border: "border-[#f0ccaF]",
    badge: "bg-[#faeee4] text-[#9b4114]",
    ring: "hover:border-[#de884f]",
  },
  // Architectural Concrete Accent
  concrete: {
    bg: "bg-[#edf0ee]",
    text: "text-[#4d5750]",
    border: "border-[#d4dbd6]",
    badge: "bg-[#e5eae6] text-[#3a433d]",
    ring: "hover:border-[#9ba59e]",
  },
  // Deep Burnt Amber / Depletion Warning
  rose: {
    bg: "bg-[#f9e9e1]",
    text: "text-[#a43719]",
    border: "border-[#ecc3b3]",
    badge: "bg-[#f7e3d8] text-[#8e2e14]",
    ring: "hover:border-[#ce5734]",
  },
  // Compatibility aliases
  indigo: {
    bg: "bg-[#eaf2ec]",
    text: "text-[#3e694a]",
    border: "border-[#c4dac9]",
    badge: "bg-[#e2ede4] text-[#2c4e36]",
    ring: "hover:border-[#7fa689]",
  },
  emerald: {
    bg: "bg-[#eaf2ec]",
    text: "text-[#3e694a]",
    border: "border-[#c4dac9]",
    badge: "bg-[#e2ede4] text-[#2c4e36]",
    ring: "hover:border-[#7fa689]",
  },
  sky: {
    bg: "bg-[#fbf0e6]",
    text: "text-[#b4511c]",
    border: "border-[#f0ccaF]",
    badge: "bg-[#faeee4] text-[#9b4114]",
    ring: "hover:border-[#de884f]",
  },
  purple: {
    bg: "bg-[#edf0ee]",
    text: "text-[#4d5750]",
    border: "border-[#d4dbd6]",
    badge: "bg-[#e5eae6] text-[#3a433d]",
    ring: "hover:border-[#9ba59e]",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  accentColor = "sage",
}: StatCardProps) {
  const colors = colorMap[accentColor] || colorMap.sage;

  return (
    <div
      className={`group relative bg-white rounded-2xl p-5 border border-[#dce2de] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full min-h-[148px] overflow-hidden ${colors.ring}`}
    >
      {/* Top Header Row: Title on Left, Icon Badge on Right with shrink-0 */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <span
          className="text-[11px] font-bold uppercase tracking-wider text-[#636d66] truncate block"
          title={title}
        >
          {title}
        </span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colors.bg} ${colors.text} transition-transform group-hover:scale-105 duration-300`}
        >
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>

      {/* Main Metric Value: Full Width, No Overlap */}
      <div className="my-auto py-1">
        <h3
          className="text-2xl sm:text-[26px] xl:text-[28px] font-extrabold text-[#1a1f1c] tracking-tight truncate leading-tight"
          title={String(value)}
        >
          {value}
        </h3>
      </div>

      {/* Footer Row: Subtitle and Trend Aligned on Equal Baseline */}
      <div className="mt-3 pt-3 border-t border-[#edf0ee] flex items-center justify-between gap-2 text-xs text-[#636d66] font-medium min-h-[28px]">
        <span className="truncate text-[11px]" title={subtitle}>
          {subtitle || "—"}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 font-semibold text-[11px] shrink-0 px-2 py-0.5 rounded-md ${
              trend.isPositive ? "bg-[#eaf2ec] text-[#3e694a]" : "bg-[#fbf0e6] text-[#b4511c]"
            }`}
          >
            <span>{trend.value}</span>
            {trend.text && <span className="text-[#848e87] font-normal hidden sm:inline">{trend.text}</span>}
          </span>
        )}
      </div>
    </div>
  );
}
