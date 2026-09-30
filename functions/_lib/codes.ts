// Promo code lookup.
//
// ⚠ STUB. The table below is the design's demo data, kept in code so the site
// runs end to end before real storage exists. Replace `lookup` with a D1 (or
// KV) query — the shape of `CodeRecord` is what the endpoint needs back, so
// nothing else has to change.

export interface CodeRecord {
  code: string;
  /** Days of Pro the code grants. */
  days: number;
  /** Epoch ms after which the code no longer works. */
  closesAt?: number;
  /** Epoch ms the code was used, if it has been. */
  usedAt?: number;
}

const DEMO: CodeRecord[] = [
  { code: 'SLEEP90', days: 90 },
  { code: 'USED01', days: 90, usedAt: Date.UTC(2026, 2, 4) },
  { code: 'SUMMER25', days: 30, closesAt: Date.UTC(2026, 7, 31) },
];

export async function lookup(code: string): Promise<CodeRecord | null> {
  return DEMO.find(r => r.code === code) ?? null;
}

/** Same rule as the app's `normalizeCode` (src/core/promoCodes.ts). */
export function normalizeCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 24);
}

export const MIN_CODE_LENGTH = 6;
