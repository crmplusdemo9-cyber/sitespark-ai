"use client";

import { useMemo } from "react";

interface MiniChartProps {
  data: { date: string; value: number }[];
  color?: string;
  height?: number;
  showLabels?: boolean;
  showGrid?: boolean;
  fillOpacity?: number;
  title?: string;
  valuePrefix?: string;
  loading?: boolean;
}

export default function MiniChart({
  data,
  color = "#5c7cfa",
  height = 200,
  showLabels = true,
  showGrid = true,
  fillOpacity = 0.15,
  title,
  valuePrefix = "",
  loading = false,
}: MiniChartProps) {
  const chartData = useMemo(() => {
    if (!data.length) return { path: "", fillPath: "", points: [], maxVal: 0, labels: [] };

    const values = data.map((d) => d.value);
    const maxVal = Math.max(...values, 1);
    const padding = 40;
    const width = 600;
    const chartHeight = height - (showLabels ? 40 : 10);

    const points = data.map((d, i) => ({
      x: padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2),
      y: 10 + (1 - d.value / maxVal) * (chartHeight - 20),
      value: d.value,
      date: d.date,
    }));

    // Smooth curve path using catmull-rom spline
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    // Fill path (close the area)
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    const fillPath = `${path} L ${lastPoint.x} ${chartHeight} L ${firstPoint.x} ${chartHeight} Z`;

    // X-axis labels (show every nth)
    const labelInterval = Math.ceil(data.length / 7);
    const labels = data
      .filter((_, i) => i % labelInterval === 0 || i === data.length - 1)
      .map((d, i, filtered) => ({
        x: padding + ((data.indexOf(d)) / Math.max(data.length - 1, 1)) * (width - padding * 2),
        label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }));

    return { path, fillPath, points, maxVal, labels };
  }, [data, height, showLabels]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        {title && <h3 className="text-sm font-semibold text-gray-300 mb-4">{title}</h3>}
        <div className="animate-pulse" style={{ height }}>
          <div className="h-full w-full rounded-lg bg-gray-800" />
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        {title && <h3 className="text-sm font-semibold text-gray-300 mb-4">{title}</h3>}
        <div className="flex items-center justify-center text-gray-600" style={{ height }}>
          No data available
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const latest = data[data.length - 1]?.value || 0;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
          <div className="text-right">
            <p className="text-lg font-bold text-white">{valuePrefix}{total.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total • Latest: {valuePrefix}{latest.toLocaleString()}</p>
          </div>
        </div>
      )}
      <svg
        viewBox={`0 0 600 ${height}`}
        className="w-full"
        style={{ height }}
      >
        {/* Grid lines */}
        {showGrid && Array.from({ length: 4 }).map((_, i) => {
          const y = 10 + (i / 3) * (height - (showLabels ? 60 : 30));
          return (
            <line
              key={i}
              x1="40"
              y1={y}
              x2="560"
              y2={y}
              stroke="rgb(55, 65, 81)"
              strokeWidth="0.5"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Y-axis labels */}
        {showGrid && Array.from({ length: 4 }).map((_, i) => {
          const y = 10 + (i / 3) * (height - (showLabels ? 60 : 30));
          const val = Math.round(chartData.maxVal * (1 - i / 3));
          return (
            <text
              key={i}
              x="35"
              y={y + 4}
              textAnchor="end"
              fill="rgb(107, 114, 128)"
              fontSize="10"
            >
              {valuePrefix}{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
            </text>
          );
        })}

        {/* Fill area */}
        <path d={chartData.fillPath} fill={color} opacity={fillOpacity} />

        {/* Line */}
        <path d={chartData.path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

        {/* Data points */}
        {chartData.points.map((point, i) => (
          <g key={i}>
            <circle cx={point.x} cy={point.y} r="3" fill={color} opacity={0} className="hover:opacity-100 transition-opacity">
              <title>{`${point.date}: ${valuePrefix}${point.value.toLocaleString()}`}</title>
            </circle>
          </g>
        ))}

        {/* Hover-visible last point */}
        <circle
          cx={chartData.points[chartData.points.length - 1]?.x}
          cy={chartData.points[chartData.points.length - 1]?.y}
          r="4"
          fill={color}
          stroke="rgb(17, 24, 39)"
          strokeWidth="2"
        />

        {/* X-axis labels */}
        {showLabels && chartData.labels.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={height - 5}
            textAnchor="middle"
            fill="rgb(107, 114, 128)"
            fontSize="10"
          >
            {label.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
