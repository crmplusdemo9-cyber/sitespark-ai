"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number; // percentage change
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  loading?: boolean;
}

export default function StatCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  iconColor = "text-brand-400",
  iconBg = "bg-brand-500/20",
  loading = false,
}: StatCardProps) {
  const TrendIcon =
    change === undefined || change === 0
      ? Minus
      : change > 0
      ? TrendingUp
      : TrendingDown;

  const trendColor =
    change === undefined || change === 0
      ? "text-gray-500"
      : change > 0
      ? "text-emerald-400"
      : "text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-gray-700 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded bg-gray-800" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          )}
          {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      {change !== undefined && (
        <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          <span>{Math.abs(change).toFixed(1)}%</span>
          <span className="text-gray-500">vs last period</span>
        </div>
      )}
    </motion.div>
  );
}
