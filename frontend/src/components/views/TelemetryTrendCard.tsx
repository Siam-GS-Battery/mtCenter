import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Label,
} from "recharts";
import { Machine, TelemetryMetric, TelemetryReading } from "../../types";
import { getMachineReadings } from "../../services/apiService";
import { NO_DATA } from "../../lib/format";
import { MachineSelect } from "../MachineSelect";
import {
  SPINDLE_TEMP_WARNING,
  SPINDLE_TEMP_ERROR,
  VIBRATION_WARNING,
  VIBRATION_ERROR,
  HEALTH_SCORE_WARNING,
  HEALTH_SCORE_ERROR,
  spindleTempLevel,
  vibrationLevel,
  healthScoreLevel,
  readingAvailability,
  SensorLevel,
} from "../../lib/thresholds";

interface TelemetryTrendCardProps {
  machines: Machine[];
  /** Extra classes for the card root — lets the dashboard place it in a grid slot. */
  className?: string;
}

type RangeHours = 24 | 168 | 720;

const METRIC_TABS: { metric: TelemetryMetric; label: string }[] = [
  { metric: "spindleTemp", label: "อุณหภูมิสปินเดิล (°C)" },
  { metric: "vibrationMms", label: "แรงสั่นสะเทือน (mm/s)" },
  { metric: "healthScore", label: "คะแนนสุขภาพ (%)" },
];

const RANGE_OPTIONS: { hours: RangeHours; label: string }[] = [
  { hours: 24, label: "24 ชม." },
  { hours: 168, label: "7 วัน" },
  { hours: 720, label: "30 วัน" },
];

/**
 * The seeded telemetry history ends at migration time and nothing writes readings
 * continuously yet. The backend now anchors the `hours` window to the newest
 * available reading rather than wall-clock now, so every range (24 ชม. included)
 * returns data — it just may not be recent. 7 days stays the default for a wider
 * first view; see formatDataFreshness below for surfacing how stale it is.
 */
const DEFAULT_RANGE_HOURS: RangeHours = 168;

/** Beyond this age, the newest reading is stale enough that the chart could look
 *  "live" while actually anchored in the past — worth a note near the controls. */
const STALE_DATA_THRESHOLD_MS = 2 * 60 * 60 * 1000;

const METRIC_META: Record<
  TelemetryMetric,
  {
    unit: string;
    warning: number;
    error: number;
    inverted: boolean;
    warningLabel: string;
    errorLabel: string;
    // Real machines have no telemetry on file for these fields (see
    // formatMetricValue's comment below) — the underlying level functions
    // (spindleTempLevel/etc.) already treat a missing reading as "normal"
    // (unknown is never an alarm), so the signature here must accept that.
    level: (value: number | null | undefined) => SensorLevel;
    /** Decimals to show — vibration drifts in hundredths, health score is whole. */
    decimals: number;
  }
> = {
  spindleTemp: {
    unit: "°C",
    warning: SPINDLE_TEMP_WARNING,
    error: SPINDLE_TEMP_ERROR,
    inverted: false,
    warningLabel: `เฝ้าระวัง ${SPINDLE_TEMP_WARNING}`,
    errorLabel: `อันตราย ${SPINDLE_TEMP_ERROR}`,
    level: spindleTempLevel,
    decimals: 1,
  },
  vibrationMms: {
    unit: "mm/s",
    warning: VIBRATION_WARNING,
    error: VIBRATION_ERROR,
    inverted: false,
    warningLabel: `เฝ้าระวัง ${VIBRATION_WARNING}`,
    errorLabel: `อันตราย ${VIBRATION_ERROR}`,
    level: vibrationLevel,
    decimals: 2,
  },
  healthScore: {
    unit: "%",
    warning: HEALTH_SCORE_WARNING,
    error: HEALTH_SCORE_ERROR,
    inverted: true,
    warningLabel: `เฝ้าระวัง ต่ำกว่า ${HEALTH_SCORE_WARNING}`,
    errorLabel: `อันตราย ต่ำกว่า ${HEALTH_SCORE_ERROR}`,
    level: healthScoreLevel,
    decimals: 0,
  },
};

const STATUS_LABEL: Record<SensorLevel, string> = {
  normal: "ปกติ",
  warning: "ต้องเฝ้าระวัง",
  error: "อันตราย",
};

const STATUS_COLOR: Record<SensorLevel, string> = {
  normal: "text-emerald-600",
  warning: "text-amber-600",
  error: "text-rose-600",
};

// Real imported machines have no telemetry on file (spindle_temp/vibration_mms/
// health_score have no Excel source — see docs/data-import-spec.md) so `value`
// can genuinely be null/undefined at runtime despite the numeric type on
// Machine — guard instead of crashing the whole dashboard on `null.toFixed()`.
function formatMetricValue(value: number | null | undefined, metric: TelemetryMetric): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(METRIC_META[metric].decimals);
}

function pickDefaultMachine(machines: Machine[]): Machine | null {
  if (machines.length === 0) return null;
  return (
    machines.find((m) => m.status === "error") ||
    machines.find((m) => m.status === "warning") ||
    machines[0]
  );
}

function formatTimestamp(iso: string, hours: RangeHours): string {
  const date = new Date(iso);
  if (hours === 24) {
    return date.toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  return date.toLocaleString("th-TH", { day: "numeric", month: "short" });
}

/**
 * Tells the user how current the chart is. The range window is now anchored to
 * the newest reading, not to wall-clock now, so "24 ชม." can silently return a
 * window that ended days ago — returns null when the data is fresh (or there is
 * none) so the card stays quiet in the common case.
 */
function formatDataFreshness(newestRecordedAt: string | undefined): string | null {
  if (!newestRecordedAt) return null;
  const newest = new Date(newestRecordedAt);
  const ageMs = Date.now() - newest.getTime();
  if (ageMs <= STALE_DATA_THRESHOLD_MS) return null;
  const ageHours = ageMs / (60 * 60 * 1000);
  const ageLabel = ageHours >= 24 ? `เก่า ${Math.floor(ageHours / 24)} วัน` : `เก่า ${Math.floor(ageHours)} ชม.`;
  const timestamp = newest.toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `ข้อมูลล่าสุด ${timestamp} (${ageLabel})`;
}

/**
 * The metric tabs a fleet actually has data for.
 *
 * Nothing writes spindle temperature or vibration today (no sensors installed —
 * see lib/thresholds.ts), so offering those tabs produced a chart of dashes over
 * an empty axis. A tab appears the moment any machine reports a real value for
 * its metric, so installing sensors brings the tab back with no code change.
 */
export function availableMetricTabs(machines: readonly Machine[]) {
  const available = readingAvailability(machines);
  return METRIC_TABS.filter((tab) => available[tab.metric]);
}

export const TelemetryTrendCard: React.FC<TelemetryTrendCardProps> = ({ machines, className = "" }) => {
  const metricTabs = useMemo(() => availableMetricTabs(machines), [machines]);
  const [machineId, setMachineId] = useState<string>(() => pickDefaultMachine(machines)?.id || "");
  const [metric, setMetric] = useState<TelemetryMetric>(
    () => availableMetricTabs(machines)[0]?.metric ?? "spindleTemp"
  );
  const [hours, setHours] = useState<RangeHours>(DEFAULT_RANGE_HOURS);
  const [readings, setReadings] = useState<TelemetryReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    // Covers both the initial seed (no machineId yet) and the fleet refreshing
    // out from under the current selection (machineId no longer in the list) —
    // the latter subsumes the former, so one check handles both.
    if (machines.length > 0 && !machines.some((m) => m.id === machineId)) {
      setMachineId(pickDefaultMachine(machines)?.id || "");
    }
    // Only re-run the default pick when the machine list identity changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machines]);

  // Keep the selected metric on a tab that still exists. Readings can start or
  // stop arriving between renders (a sensor is installed, the derivation job
  // lands), and a selection left pointing at a vanished tab would render a chart
  // nothing can populate.
  useEffect(() => {
    if (metricTabs.length === 0) return;
    if (!metricTabs.some((tab) => tab.metric === metric)) {
      setMetric(metricTabs[0].metric);
    }
  }, [metricTabs, metric]);

  useEffect(() => {
    if (!machineId) return;
    let ignore = false;
    // Drop the previous metric/machine/range series immediately, otherwise the
    // summary line would keep showing the old number under the new unit — and
    // would keep showing it forever if this fetch fails.
    setReadings([]);
    setLoading(true);
    setError(null);
    getMachineReadings(machineId, metric, hours)
      .then((data) => {
        if (ignore) return;
        setReadings(data);
        setLoading(false);
      })
      .catch((err: any) => {
        if (ignore) return;
        setError(err?.message || "ไม่สามารถโหลดข้อมูลย้อนหลังได้");
        setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [machineId, metric, hours, retryToken]);

  // Memoized to avoid an O(n) scan over the full fleet array (~1000 machines)
  // on every render — not for object identity, since `.find()` already returns
  // an existing element reference and MachineSelect isn't wrapped in React.memo.
  const selectedMachine = useMemo(
    () => machines.find((m) => m.id === machineId) || null,
    [machines, machineId]
  );
  const meta = METRIC_META[metric];
  const rangeLabel = RANGE_OPTIONS.find((o) => o.hours === hours)?.label || "";

  const chartData = useMemo(
    () =>
      [...readings]
        .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
        .map((r) => ({
          recordedAt: r.recordedAt,
          label: formatTimestamp(r.recordedAt, hours),
          value: r.value,
        })),
    [readings, hours]
  );

  const dataFreshness = useMemo(
    () => formatDataFreshness(chartData[chartData.length - 1]?.recordedAt),
    [chartData]
  );

  const yDomain = useMemo((): [number, number] => {
    const values = chartData.map((d) => d.value);
    const dataMin = values.length > 0 ? Math.min(...values) : meta.warning;
    const dataMax = values.length > 0 ? Math.max(...values) : meta.error;
    const min = Math.min(dataMin, meta.warning, meta.error);
    const max = Math.max(dataMax, meta.warning, meta.error);
    const pad = Math.max((max - min) * 0.1, 1);
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [chartData, meta]);

  const summary = useMemo(() => {
    if (chartData.length === 0) return null;
    const latest = chartData[chartData.length - 1].value;
    const start = chartData[0].value;
    const delta = latest - start;
    const level = meta.level(latest);
    // A rising health score is good; a rising temperature is not. Colour follows
    // the direction of improvement, the arrow follows the raw sign.
    const improving = delta === 0 ? null : meta.inverted ? delta > 0 : delta < 0;
    return { latest, delta, level, improving };
  }, [chartData, meta]);

  const widerRanges = RANGE_OPTIONS.filter((o) => o.hours > hours);
  const emptyMessage =
    widerRanges.length > 0
      ? `ยังไม่มีข้อมูลในช่วง ${rangeLabel} ล่าสุด — ลองเลือก ${widerRanges
          .map((o) => o.label)
          .join(" หรือ ")}`
      : `ยังไม่มีข้อมูลย้อนหลังในช่วง ${rangeLabel} ล่าสุด`;

  // No metric has a single real value across the whole fleet — an axis, a
  // threshold band and a row of dashes would only look like a broken chart. Draw
  // nothing at all; the card returns the moment any reading arrives. (Must stay
  // below every hook so the hook order never changes with the data.)
  if (metricTabs.length === 0) return null;

  return (
    <div className={`bg-white rounded-[18px] border border-hairline p-5 md:p-6 space-y-4 ${className}`}>
      <div className="flex flex-col gap-3">
        <div>
          {/* With the selector gone (one metric available) the heading has to name
              the metric, or the chart below would have no label at all. */}
          <h3 className="text-base font-semibold text-ink">
            {metricTabs.length > 1
              ? "ค่าที่วัดได้และแนวโน้มเทียบกับเกณฑ์เฝ้าระวัง"
              : `${metricTabs[0].label} — แนวโน้มเทียบกับเกณฑ์เฝ้าระวัง`}
          </h3>
          <p className="text-xs text-ink-faint">
            เลือกเครื่องจักรเพื่อดูแนวโน้มย้อนหลังเทียบกับเกณฑ์เฝ้าระวัง
          </p>
          {dataFreshness && <p className="text-xs text-ink-faint">{dataFreshness}</p>}
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* With a single available metric there is nothing to choose between —
              a one-button "tablist" is just a label pretending to be a control.
              The selector reappears as soon as a second metric has data. */}
          {metricTabs.length > 1 && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-ink-faint">ค่าที่ต้องการดู</span>
            <div role="tablist" aria-label="เลือกค่าที่ต้องการดู" className="flex flex-wrap gap-1.5">
              {metricTabs.map((tab) => (
                <button
                  key={tab.metric}
                  type="button"
                  role="tab"
                  aria-selected={metric === tab.metric}
                  onClick={() => setMetric(tab.metric)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-[11px] text-xs font-semibold border transition-colors cursor-pointer ${
                    metric === tab.metric
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-ink-muted border-hairline hover:border-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          )}

          <div className="flex flex-col gap-1 md:ml-auto">
            <span className="text-xs font-semibold text-ink-faint">ช่วงเวลา</span>
            <div role="group" aria-label="เลือกช่วงเวลา" className="flex gap-1.5">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.hours}
                  type="button"
                  aria-pressed={hours === opt.hours}
                  onClick={() => setHours(opt.hours)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-[11px] text-xs font-semibold border transition-colors cursor-pointer ${
                    hours === opt.hours
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-ink-muted border-hairline hover:border-primary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Machine picker — same dropdown used across the app (search + status filter
          + recents), fed the full fleet. A one-button-per-machine chip row here
          used to render and re-sort over the entire fleet on every metric change,
          which was both unusable and a perf hazard once the fleet reached ~1000
          machines. */}
      {machines.length > 0 && (
        <div className="max-w-md">
          <MachineSelect
            machines={machines}
            activeMachine={selectedMachine}
            onSelectMachine={(m) => setMachineId(m.id)}
            label="เลือกเครื่องจักร"
          />
        </div>
      )}

      <div className="pt-1 border-t border-divider">
        <p className="text-xs text-ink-faint">
          แนวโน้มย้อนหลัง{" "}
          <span className="font-semibold text-ink">
            {selectedMachine ? `${selectedMachine.code ?? NO_DATA} — ${selectedMachine.name}` : "ยังไม่ได้เลือกเครื่องจักร"}
          </span>{" "}
          · ช่วง {rangeLabel}
        </p>
      </div>

      <div
        className="h-[280px] w-full"
        aria-label={`กราฟแนวโน้ม ${METRIC_TABS.find((t) => t.metric === metric)?.label} ของเครื่อง ${
          selectedMachine ? `${selectedMachine.code ?? NO_DATA} — ${selectedMachine.name}` : ""
        }`}
        role="img"
      >
        {loading ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-ink-faint">
            กำลังโหลด…
          </div>
        ) : error ? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-xs text-rose-600">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setRetryToken((t) => t + 1)}
              className="min-h-[36px] px-3 py-1.5 rounded-[11px] bg-rose-50 border border-rose-200 text-rose-700 font-semibold cursor-pointer"
            >
              ลองใหม่
            </button>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-center px-4 text-xs text-ink-faint">
            {emptyMessage}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#7a7a7a" }} />
              <YAxis
                domain={yDomain}
                tick={{ fontSize: 11, fill: "#7a7a7a" }}
                label={{ value: meta.unit, angle: -90, position: "insideLeft", fontSize: 11, fill: "#7a7a7a" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelFormatter={(_, payload) =>
                  payload && payload[0]
                    ? new Date(payload[0].payload.recordedAt).toLocaleString("th-TH")
                    : ""
                }
                formatter={(value: number) => [
                  `${formatMetricValue(value, metric)} ${meta.unit}`,
                  "ค่าที่วัดได้",
                ]}
              />
              {!meta.inverted && (
                <ReferenceArea y1={meta.error} y2={yDomain[1]} fill="#e11d48" fillOpacity={0.06} />
              )}
              {meta.inverted && (
                <ReferenceArea y1={yDomain[0]} y2={meta.error} fill="#e11d48" fillOpacity={0.06} />
              )}
              <ReferenceLine y={meta.warning} stroke="#f59e0b" strokeDasharray="4 4">
                <Label value={meta.warningLabel} position="insideTopRight" fontSize={10} fill="#f59e0b" />
              </ReferenceLine>
              <ReferenceLine y={meta.error} stroke="#e11d48" strokeDasharray="4 4">
                <Label value={meta.errorLabel} position="insideTopRight" fontSize={10} fill="#e11d48" />
              </ReferenceLine>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0066cc"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {!loading && !error && readings.length > 0 && summary && (
        <p className="text-xs text-ink-faint pt-1 border-t border-divider">
          ค่าล่าสุด{" "}
          <span className="font-semibold text-ink">
            {formatMetricValue(summary.latest, metric)} {meta.unit}
          </span>{" "}
          เปลี่ยนแปลงจากต้นช่วงเวลา{" "}
          <span
            className={`font-semibold ${
              summary.improving === null
                ? "text-ink-muted"
                : summary.improving
                  ? "text-emerald-600"
                  : "text-rose-600"
            }`}
          >
            {summary.delta > 0 ? "▲ +" : summary.delta < 0 ? "▼ " : ""}
            {formatMetricValue(summary.delta, metric)} {meta.unit}
          </span>{" "}
          · สถานะ <span className={`font-semibold ${STATUS_COLOR[summary.level]}`}>{STATUS_LABEL[summary.level]}</span>
        </p>
      )}
    </div>
  );
};
