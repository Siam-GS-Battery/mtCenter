import type { Machine, MachineStats } from "../types";

/**
 * สูตร "พร้อมใช้งาน %" กลางจุดเดียว — ใช้ร่วมกันทั้ง Supervisor Dashboard และ
 * 4D Live Floor HUD เพื่อไม่ให้ตัวเลขสองหน้าคลาดเคลื่อนกันอีก เครื่องจักรที่
 * "พร้อมใช้งาน" นับทั้งสถานะ normal และ warning (เตือนแต่ยังทำงานได้)
 */
export function computeReadyRate(input: {
  total: number;
  normal: number;
  warning: number;
}): number | null {
  const { total, normal, warning } = input;
  return total > 0 ? ((normal + warning) / total) * 100 : null;
}

/**
 * แปลง MachineStats (aggregate จาก server) และ/หรือ Machine[] (ในหน่วยความจำ
 * ฝั่ง client) ให้เป็นยอดนับที่ computeReadyRate ต้องการ โดยยึด machineStats
 * เป็นหลักเสมอถ้ามี (เพราะ machines ในบางหน้าจอเป็นแค่ subset ที่แบ่งหน้า)
 * แล้วนับจาก machines เป็นตัวสำรองเมื่อ machineStats ยังไม่โหลด/ไม่มี
 */
export function deriveMachineCounts(
  machines: Machine[],
  machineStats?: MachineStats | null
): { total: number; normal: number; warning: number; error: number; maintenance: number } {
  const total = machineStats?.total ?? machines.length;
  const normal =
    machineStats?.byStatus?.normal ?? machines.filter((m) => m.status === "normal").length;
  const warning =
    machineStats?.byStatus?.warning ?? machines.filter((m) => m.status === "warning").length;
  const error =
    machineStats?.byStatus?.error ?? machines.filter((m) => m.status === "error").length;
  const maintenance =
    machineStats?.byStatus?.maintenance ??
    machines.filter((m) => m.status === "maintenance").length;
  return { total, normal, warning, error, maintenance };
}
