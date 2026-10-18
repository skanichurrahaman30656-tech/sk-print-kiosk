export type DocCategory = '5' | '10'; // 5: ছোট ডকুমেন্টস, 10: বড় ডকুমেন্টস / ফটো বা আধার সাইজ

export type PrintType = 'bw' | 'color' | 'photo';

export type PaperSize = 'a4' | 'legal' | 'letter' | 'a3';

export type PageRangeMode = 'all' | 'custom';

export type DuplexMode = 'single' | 'double';

export type BindingOption = 'none' | 'staple' | 'spiral';

export type PaymentMethod = 'phonepe' | 'upi' | 'gpay' | 'paytm' | 'card' | 'counter_cash';

export type JobStatus = 'draft' | 'pending_payment' | 'paid' | 'spooling' | 'printing' | 'completed' | 'cancelled';

export interface PricingRates {
  smallDocPerPage: number;      // ₹5 (ছোট ডকুমেন্টস)
  largeAadhaarPerPage: number;  // ₹10 (বড় ডকুমেন্টস / ফটো বা আধার সাইজ)
  bwPerPage: number;            // ₹5
  colorPerPage: number;         // ₹10
  photoPerPage: number;         // ₹25
  legalPaperAddon: number;      // ₹2
  a3PaperAddon: number;         // ₹5
  duplexDiscountRatio: number;  // 0.15
  stapleFee: number;            // ₹5
  spiralFee: number;            // ₹30
}

export interface PrintDocument {
  id: string;
  name: string;
  sizeBytes: number;
  type: string;
  previewUrl: string;
  pageCount: number;
}

export interface PrintJob {
  id: string;
  tokenNumber: string; // e.g. PRN-7429
  document: PrintDocument;
  docCategory: DocCategory;
  categoryLabel: string;
  printType?: PrintType;
  paperSize: PaperSize;
  pageRangeMode: PageRangeMode;
  customPagesString?: string;
  effectivePages: number;
  copies: number;
  duplexMode: DuplexMode;
  binding: BindingOption;
  totalCost: number;
  paymentMethod: PaymentMethod;
  paymentTrxId?: string;
  upiUrl?: string;
  status: JobStatus;
  createdAt: string;
  completedAt?: string;
  printedPagesCount: number;
}

export interface CostBreakdown {
  pricePerPage: number;
  effectivePages: number;
  copies: number;
  totalPagesToPrint: number;
  sheetsNeeded: number;
  totalCost: number;
}
