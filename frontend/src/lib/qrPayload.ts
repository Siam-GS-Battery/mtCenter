import type { Machine } from '../types';

/**
 * ผลลัพธ์การจับคู่ QR กับเครื่องจักร พร้อมเหตุผลว่าจับคู่ด้วยวิธีไหน
 * เพื่อให้ debug ง่ายเวลาสแกนแล้วได้เครื่องผิด
 */
export interface QrMatchResult {
  machine: Machine | null;
  normalized: string;
  reason:
    | 'exact-id'
    | 'exact-code'
    | 'qr-url'
    | 'related-code'
    | 'fuzzy-code'
    | 'not-found';
}

// ตัด zero-width chars ที่มักติดมากับ QR scanner บางรุ่น (เช่น ZWSP, BOM)
const ZERO_WIDTH_RE = /[​-‍﻿]/g;

/**
 * ทำความสะอาดข้อความจาก QR: ตัดช่องว่าง/quote ครอบ/zero-width, ยุบช่องว่างซ้ำ, ทำเป็นตัวพิมพ์ใหญ่
 * ป้าย QR ในหน้างานไม่มีมาตรฐาน จึงต้อง normalize ก่อนเทียบเสมอ
 */
export function normalizeQrText(raw: string): string {
  let text = (raw ?? '').replace(ZERO_WIDTH_RE, '').trim();
  // ตัด quote ที่ครอบอยู่รอบข้อความ (บาง QR encode มาเป็น "GR-1141")
  if (
    text.length >= 2 &&
    ((text.startsWith('"') && text.endsWith('"')) ||
      (text.startsWith("'") && text.endsWith("'")))
  ) {
    text = text.slice(1, -1).trim();
  }
  text = text.replace(/\s+/g, ' ');
  return text.toUpperCase();
}

// เอาไว้เทียบแบบ fuzzy: ตัดอักขระที่ไม่ใช่ตัวอักษร/ตัวเลขออกให้หมด
function alnumOnly(s: string): string {
  return s.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

function looksLikeUrl(raw: string): boolean {
  return raw.includes('://') || raw.toLowerCase().startsWith('www.');
}

// ดึง token ที่น่าจะเป็นรหัสเครื่องจาก URL: query param ที่รู้จัก + path segment สุดท้าย
function extractUrlCandidates(raw: string): string[] {
  const candidates: string[] = [];
  try {
    const url = new URL(looksLikeUrl(raw) && raw.includes('://') ? raw : `https://${raw}`);
    const paramKeys = ['code', 'machine', 'machineCode', 'id', 'm'];
    for (const key of paramKeys) {
      const value = url.searchParams.get(key);
      if (value) candidates.push(value);
    }
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length > 0) candidates.push(segments[segments.length - 1]);
  } catch {
    // URL parse ไม่ผ่าน (malformed) — ไม่ throw แค่ไม่มี candidate เพิ่ม
  }
  return candidates;
}

/**
 * จับคู่ข้อความที่สแกนได้จาก QR กับรายการเครื่องจักร
 * ลองไล่ตามลำดับความน่าเชื่อถือ: id ตรงเป๊ะ -> code ตรงเป๊ะ -> qr-url -> related/prefix -> fuzzy code
 */
export function resolveMachineFromQr(raw: string, machines: Machine[]): QrMatchResult {
  const normalized = normalizeQrText(raw);
  const trimmedRaw = (raw ?? '').replace(ZERO_WIDTH_RE, '').trim();

  // 1) exact-id: เทียบ case-sensitive ก่อน แล้วค่อย case-insensitive
  let machine = machines.find((m) => m.id === trimmedRaw);
  if (!machine) {
    machine = machines.find((m) => m.id.toUpperCase() === trimmedRaw.toUpperCase());
  }
  if (machine) return { machine, normalized, reason: 'exact-id' };

  // 2) exact-code
  machine = machines.find((m) => !!m.code && m.code.trim().toUpperCase() === normalized);
  if (machine) return { machine, normalized, reason: 'exact-code' };

  // 3) qr-url
  if (looksLikeUrl(trimmedRaw)) {
    // ลองเทียบ qrCodeUrl ทั้งก้อนก่อน (case-insensitive)
    machine = machines.find(
      (m) => !!m.qrCodeUrl && m.qrCodeUrl.trim().toUpperCase() === normalized
    );
    if (machine) return { machine, normalized, reason: 'qr-url' };

    // ไม่เจอ ลองแกะ token จาก path/query แล้วเทียบกับ code/id
    const candidates = extractUrlCandidates(trimmedRaw);
    for (const candidate of candidates) {
      const upper = candidate.trim().toUpperCase();
      if (!upper) continue;
      machine = machines.find(
        (m) => (!!m.code && m.code.trim().toUpperCase() === upper) || m.id.toUpperCase() === upper
      );
      if (machine) return { machine, normalized, reason: 'qr-url' };
    }
  }

  // 4) related-code: relatedQrCode / qrPrefix
  machine = machines.find(
    (m) => !!m.relatedQrCode && m.relatedQrCode.trim().toUpperCase() === normalized
  );
  if (!machine) {
    machine = machines.find(
      (m) => !!m.qrPrefix && m.qrPrefix.trim().toUpperCase() === normalized
    );
  }
  if (machine) return { machine, normalized, reason: 'related-code' };

  // 5) fuzzy-code: ตัดอักขระพิเศษออกแล้วเทียบ ต้องไม่กำกวม (match ได้เครื่องเดียวเท่านั้น)
  const normalizedAlnum = alnumOnly(normalized);
  if (normalizedAlnum) {
    const fuzzyMatches = machines.filter(
      (m) => !!m.code && alnumOnly(m.code) === normalizedAlnum
    );
    if (fuzzyMatches.length === 1) {
      return { machine: fuzzyMatches[0], normalized, reason: 'fuzzy-code' };
    }
  }

  return { machine: null, normalized, reason: 'not-found' };
}
