import type { CostBreakdown, DocCategory, PricingRates } from '../types.ts';

export const SHOP_CONFIG = {
  shopName: 'SK Digital Service',
  shopNameBn: 'এসকে ডিজিটাল সার্ভিস',
  locationBn: 'সেল্ফ-সার্ভিস প্রিন্ট কাউন্টার (দেগঙ্গা)',
  locationEn: 'Self-Service Print Kiosk (Deganga, WB)',
  payeeName: 'SK ANISUR RAHAMAN',
  upiId: '9775743613-2@axl',
};

export const DEFAULT_RATES: PricingRates = {
  smallDocPerPage: 5,        // ₹5 ছোট ডকুমেন্টস
  largeAadhaarPerPage: 10,   // ₹10 বড় ডকুমেন্টস / ফটো বা আধার সাইজ
  bwPerPage: 5,
  colorPerPage: 10,
  photoPerPage: 25,
  legalPaperAddon: 2,
  a3PaperAddon: 5,
  duplexDiscountRatio: 0.15,
  stapleFee: 5,
  spiralFee: 30,
};

/**
 * Calculates total print cost based on SK Digital Service formula:
 * প্রতি পেজের দাম × পেজ সংখ্যা × কপির সংখ্যা
 */
export function calculateSKTotal(params: {
  pricePerPage: number;
  pages: number;
  copies: number;
}): number {
  const rate = Math.max(1, params.pricePerPage || 5);
  const p = Math.max(1, Math.floor(params.pages || 1));
  const c = Math.max(1, Math.floor(params.copies || 1));
  return rate * p * c;
}

/**
 * Detailed breakdown
 */
export function calculatePrintCost(params: {
  pricePerPage: number;
  pageCount: number;
  copies: number;
}): CostBreakdown {
  const pricePerPage = Math.max(1, params.pricePerPage || 5);
  const effectivePages = Math.max(1, Math.floor(params.pageCount || 1));
  const copies = Math.max(1, Math.floor(params.copies || 1));
  const totalPagesToPrint = effectivePages * copies;
  const sheetsNeeded = totalPagesToPrint;
  const totalCost = pricePerPage * effectivePages * copies;

  return {
    pricePerPage,
    effectivePages,
    copies,
    totalPagesToPrint,
    sheetsNeeded,
    totalCost,
  };
}

/**
 * Generates official NPCI UPI Deep Link for PhonePe / GPay / Paytm
 */
export function generateUpiUrl(params: {
  upiId?: string;
  payeeName?: string;
  amount: number;
  transactionNote?: string;
}): string {
  const pa = params.upiId || SHOP_CONFIG.upiId;
  const pn = encodeURIComponent(params.payeeName || SHOP_CONFIG.payeeName);
  const am = params.amount;
  const tn = encodeURIComponent(params.transactionNote || 'SK Digital Print');
  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
}

/**
 * Format INR Indian Rupee (₹)
 */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export const formatBDT = formatINR;
export const formatBDTEn = formatINR;

/**
 * Parse custom page ranges (e.g. "1-3, 5")
 */
export function parsePageRange(rangeStr: string, totalDocPages: number): number[] {
  if (!rangeStr || !rangeStr.trim()) {
    return Array.from({ length: totalDocPages }, (_, i) => i + 1);
  }

  const pagesSet = new Set<number>();
  const parts = rangeStr.split(/[,;\s]+/).map(p => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(totalDocPages, Math.max(start, end));
        for (let p = min; p <= max; p++) {
          pagesSet.add(p);
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalDocPages) {
        pagesSet.add(pageNum);
      }
    }
  }

  const result = Array.from(pagesSet).sort((a, b) => a - b);
  return result.length > 0 ? result : Array.from({ length: totalDocPages }, (_, i) => i + 1);
}

/**
 * Generate unique token
 */
export function generateToken(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `SK-${num}`;
}

/**
 * Format file bytes
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
