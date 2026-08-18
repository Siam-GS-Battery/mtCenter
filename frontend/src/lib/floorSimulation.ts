import { useEffect, useMemo, useRef, useState } from "react";
import type { Machine, MachineStatus } from "../types";

/** Runtime activity of a machine as derived by the simulation (not the stored `status`). */
export type MachineActivity = "running" | "idle" | "setup" | "down" | "maintenance";

/** Thai labels for `MachineActivity`, for HUD/legend display. */
export const ACTIVITY_LABELS: Record<MachineActivity, string> = {
  running: "กำลังเดินเครื่อง",
  idle: "รอคอย",
  setup: "ตั้งเครื่อง",
  down: "หยุด/ขัดข้อง",
  maintenance: "ซ่อมบำรุง",
};

/** Live, per-machine simulated runtime state — mutated in place every `step()`. */
export interface MachineRuntime {
  machineId: string;
  activity: MachineActivity;
  /** 0..1 progress through the current production cycle */
  cycleProgress: number;
  /** seconds for one full cycle for this machine (stable) */
  cycleSeconds: number;
  /** spindle speed, rpm — 0 unless running */
  spindleRpm: number;
  /** live simulated spindle temperature, °C, drifting around the machine's stored value */
  tempC: number;
  /** live simulated vibration, mm/s */
  vibration: number;
  /** 0..1 current load */
  load: number;
  /** cumulative units produced since the simulation started */
  output: number;
  /** true only on the frame/step where a cycle just completed (for spark FX) */
  cycleTick: boolean;
  /** 0..1 animation phase for continuous motion (spindle rotation etc.) */
  phase: number;
}

/** Floor-wide aggregate counters, recomputed every `step()` in the same pass. */
export interface FloorSimulationTotals {
  running: number;
  idle: number;
  setup: number;
  down: number;
  maintenance: number;
  /** total units produced since sim start */
  output: number;
  /** 0..1 mean load across machines */
  avgLoad: number;
  /** units per minute, smoothed */
  throughputPerMin: number;
}

/** Read-only snapshot of the whole simulation at a point in simulated time. */
export interface FloorSimulationSnapshot {
  /** seconds of simulated time elapsed */
  t: number;
  runtimes: Map<string, MachineRuntime>;
  totals: FloorSimulationTotals;
}

/** A deterministic, allocation-free (per step) client-side factory-floor simulation. */
export interface FloorSimulation {
  /** advance the simulation by dt seconds (clamped internally); O(machines), allocation-free */
  step(dt: number): void;
  /** the live internal snapshot object — treat as read-only, do not mutate */
  snapshot(): FloorSimulationSnapshot;
  getRuntime(machineId: string): MachineRuntime | undefined;
  /** re-sync when the machine list changes; preserves runtime state of machines that still exist */
  setMachines(machines: Machine[]): void;
}

// ---------------------------------------------------------------------------
// Seeded PRNG — mulberry32, seeded from a string hash of machine id + seed.
// No Math.random / Date.now anywhere in this module, by design: the sim must
// be fully deterministic given the same machine list + seed.
// ---------------------------------------------------------------------------

/** 32-bit FNV-1a style string hash — cheap, stable, good enough for seeding. */
function hashString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 PRNG factory — returns a function producing floats in [0, 1). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Per-machine stable constants, derived once from the seeded PRNG so a
// machine that leaves and returns (setMachines) gets identical behaviour.
// ---------------------------------------------------------------------------

interface MachineConstants {
  cycleSeconds: number;
  baseLoad: number;
  noiseAmp: number;
  phaseOffset: number;
  rpmTarget: number;
  /** starting temp/vibration derived from real snapshot data (or status defaults) */
  baseTemp: number;
  baseVibration: number;
}

const STATUS_DEFAULTS: Record<MachineStatus, { temp: number; vibration: number }> = {
  normal: { temp: 42, vibration: 1.8 },
  warning: { temp: 58, vibration: 3.6 },
  error: { temp: 74, vibration: 6.2 },
  maintenance: { temp: 35, vibration: 1.0 },
};

function buildConstants(machine: Machine, seed: number): MachineConstants {
  const rnd = mulberry32(hashString(machine.id) ^ seed);
  const defaults = STATUS_DEFAULTS[machine.status];
  return {
    cycleSeconds: 6 + rnd() * 20, // 6..26s
    baseLoad: 0.55 + rnd() * 0.35, // 0.55..0.9
    noiseAmp: 0.6 + rnd() * 0.8,
    phaseOffset: rnd() * Math.PI * 2,
    rpmTarget: 800 + rnd() * 2600, // 800..3400 rpm
    baseTemp: machine.spindleTemp ?? defaults.temp,
    baseVibration: machine.vibrationMms ?? defaults.vibration,
  };
}

interface MachineState {
  machine: Machine;
  constants: MachineConstants;
  runtime: MachineRuntime;
  /** internal PRNG stream used to decide idle/setup interruptions — persists across steps */
  rnd: () => number;
  /** seconds remaining in a transient idle/setup interruption, 0 when not interrupted */
  interruptTimer: number;
}

const MIN_INTERRUPT = 1.5;
const MAX_INTERRUPT = 6;

/** Clamp a value into [lo, hi]. */
function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function activityForStatus(status: MachineStatus): MachineActivity | null {
  if (status === "error") return "down";
  if (status === "maintenance") return "maintenance";
  return null; // normal/warning resolved dynamically below
}

function makeRuntime(machineId: string, constants: MachineConstants, status: MachineStatus): MachineRuntime {
  const forced = activityForStatus(status);
  return {
    machineId,
    activity: forced ?? "running",
    cycleProgress: 0,
    cycleSeconds: constants.cycleSeconds,
    spindleRpm: 0,
    tempC: clamp(constants.baseTemp, 20, 110),
    vibration: clamp(constants.baseVibration, 0, 12),
    load: 0,
    output: 0,
    cycleTick: false,
    phase: constants.phaseOffset,
  };
}

function makeState(machine: Machine, seed: number): MachineState {
  const constants = buildConstants(machine, seed);
  const runtime = makeRuntime(machine.id, constants, machine.status);
  return {
    machine,
    constants,
    runtime,
    rnd: mulberry32(hashString(machine.id) ^ seed ^ 0x9e3779b9),
    interruptTimer: 0,
  };
}

/**
 * Creates a deterministic client-side floor simulation seeded from the given
 * machines' ids. Cheap enough for ~1000 machines: `step()` is a single O(n)
 * loop with no per-call allocation.
 */
export function createFloorSimulation(machines: Machine[], seed = 0): FloorSimulation {
  const states = new Map<string, MachineState>();
  const runtimes = new Map<string, MachineRuntime>();

  const totals: FloorSimulationTotals = {
    running: 0,
    idle: 0,
    setup: 0,
    down: 0,
    maintenance: 0,
    output: 0,
    avgLoad: 0,
    throughputPerMin: 0,
  };

  const snapshotObj: FloorSimulationSnapshot = { t: 0, runtimes, totals };

  // rolling state for the smoothed throughput estimate
  let cyclesSinceLastEstimate = 0;
  let throughputAccumSeconds = 0;

  function addMachine(machine: Machine): void {
    const state = makeState(machine, seed);
    states.set(machine.id, state);
    runtimes.set(machine.id, state.runtime);
  }

  for (const m of machines) addMachine(m);

  function setMachines(nextMachines: Machine[]): void {
    const nextIds = new Set<string>();
    for (const m of nextMachines) {
      nextIds.add(m.id);
      const existing = states.get(m.id);
      if (existing) {
        // Keep existing runtime state; refresh the machine reference and any
        // status-forced activity change (e.g. it went into maintenance).
        existing.machine = m;
        const forced = activityForStatus(m.status);
        if (forced) existing.runtime.activity = forced;
      } else {
        addMachine(m);
      }
    }
    for (const id of Array.from(states.keys())) {
      if (!nextIds.has(id)) {
        states.delete(id);
        runtimes.delete(id);
      }
    }
  }

  /**
   * Decide activity transitions for a "normal"/"warning" machine that just
   * finished a cycle (or, for down/maintenance, is a no-op since activity is
   * pinned by status). `warning` machines interrupt more often and drift
   * hotter/rougher than `normal` ones.
   */
  function maybeInterrupt(state: MachineState): void {
    const isWarning = state.machine.status === "warning";
    const interruptChance = isWarning ? 0.55 : 0.2;
    if (state.rnd() < interruptChance) {
      const goSetup = state.rnd() < 0.35;
      state.runtime.activity = goSetup ? "setup" : "idle";
      state.interruptTimer = MIN_INTERRUPT + state.rnd() * (MAX_INTERRUPT - MIN_INTERRUPT);
      if (goSetup) state.runtime.cycleProgress = 0;
    }
  }

  function stepMachine(state: MachineState, dt: number, t: number): void {
    const { runtime, constants, machine } = state;
    const status = machine.status;
    const forced = activityForStatus(status);

    runtime.cycleTick = false;

    if (forced === "down" || forced === "maintenance") {
      runtime.activity = forced;
    } else if (state.interruptTimer > 0) {
      state.interruptTimer -= dt;
      if (state.interruptTimer <= 0) {
        state.interruptTimer = 0;
        runtime.activity = "running";
      }
    }

    const isWarning = status === "warning";
    const isDown = runtime.activity === "down";
    const isMaintenance = runtime.activity === "maintenance";
    const isRunning = runtime.activity === "running";

    // --- cycle progress / output ---
    if (isRunning) {
      runtime.cycleProgress += dt / runtime.cycleSeconds;
      if (runtime.cycleProgress >= 1) {
        runtime.cycleProgress -= Math.floor(runtime.cycleProgress);
        runtime.output += 1;
        runtime.cycleTick = true;
        cyclesSinceLastEstimate += 1;
        maybeInterrupt(state);
      }
    } else if (runtime.activity === "setup") {
      // slow reset toward 0 while setting up
      runtime.cycleProgress = Math.max(0, runtime.cycleProgress - dt / (runtime.cycleSeconds * 2));
    }
    // idle/down/maintenance: cycleProgress holds.

    // --- spindle rpm: smooth ramp toward target ---
    const rpmTarget = runtime.activity === "running" ? constants.rpmTarget : 0;
    const rampRate = 4; // 1/s — larger = snappier ramp, still smooth (exponential approach)
    runtime.spindleRpm += (rpmTarget - runtime.spindleRpm) * Math.min(1, rampRate * dt);

    // --- load: oscillates around base load while running, low otherwise ---
    if (isRunning) {
      const osc = Math.sin(t * 0.7 + constants.phaseOffset) * 0.08;
      runtime.load = clamp(constants.baseLoad + osc, 0, 1);
    } else if (runtime.activity === "setup") {
      runtime.load = 0.15;
    } else {
      runtime.load = 0.03;
    }

    // --- temp/vibration: layered sine drift + seeded noise, clamped ---
    const driftSlow = Math.sin(t * 0.05 + constants.phaseOffset) * 1.2;
    const driftFast = Math.sin(t * 0.9 + constants.phaseOffset * 1.7) * 0.4;
    const activityHeat = isRunning ? 1 : isDown ? 1.4 : isMaintenance ? 0.2 : 0.5;
    const warningBoost = isWarning ? 1.6 : 1;
    const tempTarget =
      constants.baseTemp + (driftSlow + driftFast) * constants.noiseAmp * activityHeat * warningBoost;
    runtime.tempC = clamp(runtime.tempC + (tempTarget - runtime.tempC) * Math.min(1, 0.5 * dt), 20, 110);

    const vibDriftSlow = Math.sin(t * 0.11 + constants.phaseOffset * 0.6) * 0.3;
    const vibDriftFast = Math.sin(t * 1.3 + constants.phaseOffset * 2.1) * 0.15;
    const vibTarget =
      constants.baseVibration + (vibDriftSlow + vibDriftFast) * constants.noiseAmp * activityHeat * warningBoost;
    runtime.vibration = clamp(runtime.vibration + (vibTarget - runtime.vibration) * Math.min(1, 0.5 * dt), 0, 12);

    // --- phase: continuous rotation, scaled by current rpm ---
    const phaseSpeed = runtime.spindleRpm / 60; // revolutions per second
    runtime.phase = (runtime.phase + phaseSpeed * dt) % 1;
  }

  function step(dtRaw: number): void {
    const dt = clamp(dtRaw, 0, 0.25);
    snapshotObj.t += dt;

    totals.running = 0;
    totals.idle = 0;
    totals.setup = 0;
    totals.down = 0;
    totals.maintenance = 0;
    totals.output = 0;
    let loadSum = 0;
    let count = 0;

    for (const state of states.values()) {
      stepMachine(state, dt, snapshotObj.t);
      const runtime = state.runtime;
      totals[runtime.activity] += 1;
      totals.output += runtime.output;
      loadSum += runtime.load;
      count += 1;
    }

    totals.avgLoad = count > 0 ? loadSum / count : 0;

    // Exponentially-smoothed throughput/min, refreshed roughly once per
    // simulated second so it settles quickly without jittering per-step.
    throughputAccumSeconds += dt;
    if (throughputAccumSeconds >= 1) {
      const instantPerMin = (cyclesSinceLastEstimate / throughputAccumSeconds) * 60;
      const smoothing = 0.3;
      totals.throughputPerMin += (instantPerMin - totals.throughputPerMin) * smoothing;
      cyclesSinceLastEstimate = 0;
      throughputAccumSeconds = 0;
    }
  }

  function snapshot(): FloorSimulationSnapshot {
    return snapshotObj;
  }

  function getRuntime(machineId: string): MachineRuntime | undefined {
    return runtimes.get(machineId);
  }

  return { step, snapshot, getRuntime, setMachines };
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

/**
 * Creates (and memoises) a `FloorSimulation` for `machines`, refreshing a
 * snapshot `hz` times per second so HUD consumers re-render at a sane rate.
 * The 3D scene should call `sim.step(dt)` itself from its render loop; pass
 * `autoStep: true` for HUD-only usage where nothing else drives the sim.
 */
export function useFloorSimulation(
  machines: Machine[],
  options?: { hz?: number; seed?: number; autoStep?: boolean }
): { sim: FloorSimulation; snapshot: FloorSimulationSnapshot; tick: number } {
  const hz = clamp(options?.hz ?? 2, 0.5, 10);
  const seed = options?.seed ?? 0;
  const autoStep = options?.autoStep ?? false;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sim = useMemo(() => createFloorSimulation(machines, seed), [machines]);

  const [tick, setTick] = useState(0);

  useEffect(() => {
    sim.setMachines(machines);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machines]);

  const autoStepRef = useRef(autoStep);
  autoStepRef.current = autoStep;

  useEffect(() => {
    const intervalMs = 1000 / hz;
    const id = setInterval(() => {
      if (autoStepRef.current) {
        sim.step(1 / hz);
      }
      setTick((t) => t + 1);
    }, intervalMs);
    return () => clearInterval(id);
  }, [sim, hz]);

  return { sim, snapshot: sim.snapshot(), tick };
}
