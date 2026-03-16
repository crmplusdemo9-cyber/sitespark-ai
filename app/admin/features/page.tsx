"use client";

import { useState, useEffect } from "react";
import {
  ToggleLeft,
  ToggleRight,
  Zap,
  Info,
  Save,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number;
  updated_at: string;
}

export default function AdminFeaturesPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadFlags();
  }, []);

  async function loadFlags() {
    setLoading(true);
    const { data } = await supabase
      .from("feature_flags")
      .select("*")
      .order("created_at", { ascending: true });

    setFlags(data || []);
    setLoading(false);
  }

  async function toggleFlag(id: string, enabled: boolean) {
    setSaving(id);
    const { error } = await supabase
      .from("feature_flags")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update flag");
    } else {
      toast.success(`${id} ${enabled ? "enabled" : "disabled"}`);
      setFlags(flags.map((f) => (f.id === id ? { ...f, enabled } : f)));
    }
    setSaving(null);
  }

  async function updateRollout(id: string, percentage: number) {
    const { error } = await supabase
      .from("feature_flags")
      .update({ rollout_percentage: percentage, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      setFlags(flags.map((f) => (f.id === id ? { ...f, rollout_percentage: percentage } : f)));
    }
  }

  const enabledCount = flags.filter((f) => f.enabled).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
          <p className="text-sm text-gray-500">
            Control feature rollouts and experiments • {enabledCount}/{flags.length} enabled
          </p>
        </div>
        <button
          onClick={loadFlags}
          className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-300">Feature Flag System</p>
          <p className="text-xs text-blue-400/70 mt-1">
            Toggle features on/off in real-time. Changes take effect immediately for all users.
            Use rollout percentage for gradual feature releases.
          </p>
        </div>
      </div>

      {/* Flags Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className={`rounded-xl border p-5 transition-colors ${
                flag.enabled
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-gray-800 bg-gray-900"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Zap className={`h-4 w-4 ${flag.enabled ? "text-emerald-400" : "text-gray-600"}`} />
                    <h3 className="font-semibold text-white">{flag.name}</h3>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                    {flag.description}
                  </p>
                  <code className="mt-2 inline-block rounded bg-gray-800 px-2 py-0.5 text-[10px] text-gray-500 font-mono">
                    {flag.id}
                  </code>
                </div>
                <button
                  onClick={() => toggleFlag(flag.id, !flag.enabled)}
                  disabled={saving === flag.id}
                  className="shrink-0 transition-transform hover:scale-110"
                >
                  {saving === flag.id ? (
                    <Loader2 className="h-7 w-7 animate-spin text-gray-500" />
                  ) : flag.enabled ? (
                    <ToggleRight className="h-7 w-7 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-gray-600" />
                  )}
                </button>
              </div>

              {/* Rollout Slider */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Rollout</span>
                  <span className={`font-medium ${flag.enabled ? "text-emerald-400" : "text-gray-500"}`}>
                    {flag.rollout_percentage}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={flag.rollout_percentage}
                  onChange={(e) => updateRollout(flag.id, parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-gray-800 cursor-pointer accent-brand-500"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {flag.updated_at && (
                <p className="mt-2 text-[10px] text-gray-600">
                  Last updated: {new Date(flag.updated_at).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
