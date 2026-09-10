import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Machine } from "../../types";
import {
  MetricRange,
  TrendMetric,
  TREND_METRIC_LABELS,
  getMachineTrendSeries,
} from "../../lib/machineMetricsMock";

interface MachineMetricsChartProps {
  machine: Machine;
  className?: string;
}

const RANGE_OPTIONS: { value: MetricRange; label: string }[] = [
  { value: "24h", label: "24 ชม." },
  { value: "7d", label: "7 วัน" },
];

const METRIC_OPTIONS: TrendMetric[] = [
  "oee",
  "cycleTime",
  "energyElectrical",
  "spindleTemp",
  "vibration",
];

/**
 * กราฟแนวโน้ม (mock/demo) ของเครื่องจักรหนึ่งเครื่อง — สลับช่วงเวลา (24 ชม. / 7 วัน)
 * และตัวชี้วัดได้ ใช้ recharts เหมือน TelemetryTrendCard เพื่อไม่เพิ่ม dependency ใหม่
 */
export const MachineMetricsChart: React.FC<MachineMetricsChartProps> = ({ machine, className = "" }) => {
  const [range, setRange] = useState<MetricRange>("24h");
  const [metric, setMetric] = useState<TrendMetric>("oee");

  const data = useMemo(() => getMachineTrendSeries(machine, metric, range), [machine, metric, range]);
  const meta = TREND_METRIC_LABELS[metric];

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {METRIC_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                metric === m
                  ? "bg-primary text-white"
                  : "bg-divider text-ink-muted hover:bg-primary/10"
              }`}
            >
              {TREND_METRIC_LABELS[m].label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-full bg-divider p-1 shrink-0">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                range === opt.value ? "bg-white text-ink shadow-sm" : "text-ink-faint hover:text-ink-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 w-full rounded-[18px] border border-hairline bg-white p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 12, left: 4, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef0f2" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
              label={{
                value: range === "24h" ? "เวลา" : "วันที่",
                position: "insideBottom",
                offset: -8,
                fontSize: 11,
                fill: "#7a7a7a",
              }}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              width={56}
              label={{
                value: `${meta.shortLabel} (${meta.unit})`,
                angle: -90,
                position: "insideLeft",
                fontSize: 11,
                fill: "#7a7a7a",
              }}
            />
            <Tooltip
              formatter={(value: number) => [`${value} ${meta.unit}`, meta.label]}
              labelFormatter={(label) => `เวลา: ${label}`}
            />
            <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
