import React, { useState } from "react";

// 1. Interactive Bar Chart
interface BarChartProps {
  data: { label: string; value: number; secondaryValue?: number; tooltip?: string }[];
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  color?: string;
}

export function BarChart({
  data,
  height = 200,
  valuePrefix = "",
  valueSuffix = "",
  color = "#4d7356", // Default to refined Sage Green
}: BarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-xs text-[#7d8780]">
        No chart metrics available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full">
      <div className="flex items-end gap-2 sm:gap-4 w-full" style={{ height: `${height}px` }}>
        {data.map((item, idx) => {
          const heightPercent = Math.max(8, (item.value / maxValue) * 100);
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 bg-[#1e2320] text-[#f4f7f5] text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none border border-[#3b443e]">
                  {item.tooltip || `${item.label}: ${valuePrefix}${item.value.toLocaleString()}${valueSuffix}`}
                </div>
              )}

              {/* Bar with smooth top curve */}
              <div
                className="w-full rounded-t-lg transition-all duration-300"
                style={{
                  height: `${heightPercent}%`,
                  backgroundColor: isHovered ? "#385840" : color,
                  opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#e2e7e3]">
        {data.map((item, idx) => (
          <span
            key={idx}
            className="flex-1 text-center text-[10px] font-semibold text-[#667269] truncate px-0.5"
            title={item.label}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// 2. Donut / Progress Distribution Chart
interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  size?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

export function DonutChart({
  data,
  size = 180,
  centerLabel = "Total",
  centerValue,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#edf1ee" // Concrete Light
            strokeWidth={strokeWidth}
          />
          {total > 0 &&
            data.map((item, i) => {
              const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPercent * circumference;
              accumulatedPercent += item.value / total;

              return (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 hover:opacity-85"
                />
              );
            })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-extrabold text-[#1a1f1c]">
            {centerValue !== undefined ? centerValue : total}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#68746c]">
            {centerLabel}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2.5">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[#49544c] font-medium">{item.label}</span>
            </div>
            <span className="font-bold text-[#1a1f1c]">
              {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. Smooth Area Trend Chart
interface AreaChartProps {
  data: { label: string; value: number }[];
  height?: number;
  valuePrefix?: string;
  color?: string;
}

export function AreaChart({
  data,
  height = 180,
  valuePrefix = "₹",
  color = "#4d7356", // Sage Green
}: AreaChartProps) {
  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-xs text-[#7d8780]">
        Requires at least 2 data points
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values, minVal + 1);

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - minVal) / (maxVal - minVal)) * 80 - 10;
    return { x, y, ...d };
  });

  const pathD = points.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ""
  );

  const areaD = `${pathD} L 100 100 L 0 100 Z`;

  return (
    <div className="w-full">
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.32" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#areaGradient)" />
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#e2e7e3]">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] font-semibold text-[#667269]">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
