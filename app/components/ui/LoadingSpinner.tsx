import React from "react";

interface LoadingSpinnerProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-3",
  lg: "w-12 h-12 border-4",
};

export function LoadingSpinner({
  label = "Loading...",
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 gap-3 ${className}`}>
      <div
        className={`${sizeMap[size]} border-slate-200 border-t-indigo-600 rounded-full animate-spin`}
      />
      {label && <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-3 animate-pulse p-4">
      <div className="h-10 bg-slate-100 rounded-xl w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-3">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-6 bg-slate-100 rounded-lg flex-1"
              style={{ opacity: Math.max(0.4, 1 - j * 0.1) }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
