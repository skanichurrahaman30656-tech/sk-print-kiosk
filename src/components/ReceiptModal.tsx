import React from 'react';
import { CheckCircle, Printer, QrCode, ArrowLeft, Download, Share2 } from 'lucide-react';
import type { PrintJob } from '../types.ts';
import { formatINR } from '../utils/printCalculator.ts';
import { soundFx } from '../utils/audioSynth.ts';

interface ReceiptModalProps {
  job: PrintJob;
  onReset: () => void;
  lang: 'bn' | 'en';
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  job,
  onReset,
  lang,
}) => {
  const handlePrintReceipt = () => {
    soundFx.playClick();
    window.print();
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6 print:m-0 print:shadow-none print:border-none">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 text-center relative">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-xs">
          <CheckCircle className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold">
          {lang === 'bn' ? 'পেমেন্ট ও প্রিন্ট সফল!' : 'Payment & Print Successful!'}
        </h2>
        <p className="text-xs text-emerald-100 mt-1">
          {lang === 'bn'
            ? 'আপনার প্রিন্ট পেপার ট্রে থেকে সংগ্রহ করুন'
            : 'Please collect your printed pages from the kiosk tray'}
        </p>

        {/* Big Token Number */}
        <div className="mt-4 bg-white text-slate-900 rounded-xl p-3 shadow-md inline-block min-w-[200px]">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {lang === 'bn' ? 'টোকেন নাম্বার (Token No)' : 'Kiosk Token ID'}
          </p>
          <p className="text-2xl font-black font-mono text-emerald-700 tracking-wider">
            #{job.tokenNumber}
          </p>
        </div>
      </div>

      {/* Itemized Receipt Details */}
      <div className="p-6 space-y-4">
        {/* QR Code graphic */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white p-1 rounded-lg border border-slate-300 flex items-center justify-center">
              <QrCode className="w-10 h-10 text-slate-800" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {lang === 'bn' ? 'ডিজিটাল যাচাইকরণ কিউআর (UPI QR)' : 'Digital QR Verification'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Ref: {job.paymentTrxId || 'UPI-REF-AUTO'}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            PAID
          </span>
        </div>

        {/* Invoice Items Table */}
        <div className="border-t border-b border-dashed border-slate-300 py-3 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>{lang === 'bn' ? 'ডকুমেন্ট নাম:' : 'Document:'}</span>
            <span className="font-semibold text-slate-800 max-w-[180px] truncate text-right">
              {job.document.name}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>{lang === 'bn' ? 'ক্যাটাগরি / টাইপ:' : 'Category / Type:'}</span>
            <span className="font-semibold text-slate-800 text-right">
              {job.categoryLabel || (job.printType === 'color' ? 'কালার প্রিন্ট (Color)' : 'ব্ল্যাক অ্যান্ড হোয়াইট (B&W)')}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>{lang === 'bn' ? 'কাগজের সাইজ ও সাইড:' : 'Paper Size & Side:'}</span>
            <span className="font-semibold text-slate-800 uppercase">
              {job.paperSize} • {job.duplexMode === 'double' ? 'উভয় পিঠ (Duplex)' : 'এক পিঠ (Single)'}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>{lang === 'bn' ? 'কপি ও পৃষ্ঠা সংখ্যা:' : 'Copies & Pages:'}</span>
            <span className="font-semibold text-slate-800">
              {job.effectivePages} {lang === 'bn' ? 'পৃষ্ঠা' : 'pages'} × {job.copies} {lang === 'bn' ? 'কপি' : 'copies'}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>{lang === 'bn' ? 'তারিখ ও সময়:' : 'Date & Time:'}</span>
            <span className="font-mono text-slate-700">
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}{' '}
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
          </div>
        </div>

        {/* Total Price */}
        <div className="flex items-center justify-between pt-1">
          <span className="font-bold text-slate-800 text-sm">
            {lang === 'bn' ? 'পরিশোধিত মোট টাকা:' : 'Total Paid:'}
          </span>
          <span className="text-2xl font-black text-emerald-700">
            {formatINR(job.totalCost)}
          </span>
        </div>

        {/* Buttons (Hidden in print) */}
        <div className="space-y-2 pt-3 print:hidden">
          <button
            type="button"
            onClick={handlePrintReceipt}
            className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'bn' ? 'রসিদ প্রিন্ট / সংরক্ষণ' : 'Print / Save Receipt'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onReset();
            }}
            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-blue-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নতুন প্রিন্ট শুরু করুন' : 'Start New Print Job'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
