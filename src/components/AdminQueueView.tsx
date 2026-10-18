import React, { useState } from 'react';
import {
  Printer,
  FileText,
  DollarSign,
  TrendingUp,
  Layers,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sliders,
  Save,
  Trash2,
} from 'lucide-react';
import type { PrintJob, PricingRates } from '../types.ts';
import { formatINR } from '../utils/printCalculator.ts';
import { soundFx } from '../utils/audioSynth.ts';

interface AdminQueueViewProps {
  jobs: PrintJob[];
  rates: PricingRates;
  onUpdateRates: (rates: PricingRates) => void;
  onRePrint: (job: PrintJob) => void;
  onClearJobs: () => void;
  lang: 'bn' | 'en';
}

export const AdminQueueView: React.FC<AdminQueueViewProps> = ({
  jobs,
  rates,
  onUpdateRates,
  onRePrint,
  onClearJobs,
  lang,
}) => {
  const [editingRates, setEditingRates] = useState<PricingRates>({ ...rates });
  const [rateSaved, setRateSaved] = useState(false);

  const totalRevenue = jobs.reduce((sum, j) => sum + j.totalCost, 0);
  const totalSheetsPrinted = jobs.reduce(
    (sum, j) => sum + Math.ceil(j.effectivePages / (j.duplexMode === 'double' ? 2 : 1)) * j.copies,
    0
  );

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    onUpdateRates(editingRates);
    setRateSaved(true);
    setTimeout(() => setRateSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Total revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">
              {lang === 'bn' ? 'আজকের মোট আয়' : "Today's Revenue"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">{formatINR(totalRevenue)}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {lang === 'bn' ? 'সরাসরি UPI ও ক্যাশ জমা' : '100% digital & cash collected'}
          </p>
        </div>

        {/* Total Sheets */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">
              {lang === 'bn' ? 'ব্যবহৃত কাগজের শিট' : 'Sheets Used'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalSheetsPrinted}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {lang === 'bn' ? 'A4 এবং Legal সাইজ পেপার' : 'Across all print jobs'}
          </p>
        </div>

        {/* Total Jobs */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">
              {lang === 'bn' ? 'মোট প্রিন্ট অর্ডার' : 'Total Print Orders'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{jobs.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {lang === 'bn' ? 'কাস্টমার সেল্ফ-সার্ভিস' : 'Kiosk counter jobs'}
          </p>
        </div>

        {/* Printer Status */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">
              {lang === 'bn' ? 'কাউন্টার প্রিন্টার' : 'Kiosk Printer'}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
          </div>
          <p className="text-base font-bold text-slate-900">HP Laser Pro 400</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {lang === 'bn' ? 'অনলাইন ও সক্রিয়' : 'Online & Ready'}
          </p>
        </div>
      </div>

      {/* Printer Consumables Level Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
          <Printer className="w-4 h-4 text-blue-600" />
          <span>{lang === 'bn' ? 'প্রিন্টার টোনার ও পেপার লেভেল' : 'Hardware Consumable Levels'}</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          {/* Black Toner */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>{lang === 'bn' ? 'ব্ল্যাক টোনার (K)' : 'Black Toner'}</span>
              <span>78%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-900 w-[78%]"></div>
            </div>
          </div>

          {/* Color Cyan/Magenta/Yellow */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>{lang === 'bn' ? 'কালার টোনার (CMY)' : 'Color CMY'}</span>
              <span>65%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 w-[65%]"></div>
            </div>
          </div>

          {/* A4 Paper Tray */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>{lang === 'bn' ? 'A4 পেপার ট্রে' : 'A4 Paper Tray'}</span>
              <span>85%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-[85%]"></div>
            </div>
          </div>

          {/* Legal Tray */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>{lang === 'bn' ? 'Legal পেপার ট্রে' : 'Legal Paper Tray'}</span>
              <span>60%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 w-[60%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main split: Queue Table & Rate Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">
                {lang === 'bn' ? 'প্রিন্ট কিউ ও সাম্প্রতিক অর্ডার' : 'Recent Print Jobs Queue'}
              </h3>
            </div>
            {jobs.length > 0 && (
              <button
                type="button"
                onClick={onClearJobs}
                className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'লিস্ট পরিষ্কার' : 'Clear List'}</span>
              </button>
            )}
          </div>

          {jobs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium">
                {lang === 'bn'
                  ? 'এখনো কোনো প্রিন্ট জব কিউতে নেই।'
                  : 'No print jobs submitted yet.'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'bn'
                  ? 'সেল্ফ-সার্ভিস কাউন্টার থেকে প্রিন্ট অর্ডার দিলে এখানে রিয়েলটাইমে দৃশ্যমান হবে।'
                  : 'Submitting a print from the kiosk counter will show up here in real time.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">{lang === 'bn' ? 'টোকেন' : 'Token'}</th>
                    <th className="px-4 py-3">{lang === 'bn' ? 'ডকুমেন্ট' : 'Document'}</th>
                    <th className="px-4 py-3">{lang === 'bn' ? 'টাইপ ও সাইজ' : 'Type & Size'}</th>
                    <th className="px-4 py-3">{lang === 'bn' ? 'বিল' : 'Bill'}</th>
                    <th className="px-4 py-3">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                    <th className="px-4 py-3 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">
                        #{job.tokenNumber}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 max-w-[150px] truncate">
                        {job.document.name}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] uppercase ${
                            job.docCategory === '10' || job.printType === 'color'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {job.docCategory === '10' ? '₹10/Photo' : '₹5/Std'} • {job.paperSize}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {job.effectivePages}p × {job.copies}c
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 font-mono">
                        {formatINR(job.totalCost)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {lang === 'bn' ? 'সম্পন্ন' : 'Printed'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            onRePrint(job);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{lang === 'bn' ? 'রি-প্রিন্ট' : 'Re-print'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pricing Rate Manager (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              {lang === 'bn' ? 'রেট ও মূল্য তালিকা সেটিং' : 'Pricing Rate Settings'}
            </h3>
          </div>

          <form onSubmit={handleSaveRates} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'bn' ? 'ব্ল্যাক অ্যান্ড হোয়াইট (প্রতি পাতা ৳):' : 'B&W Rate (per page ৳):'}
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={editingRates.bwPerPage}
                onChange={(e) =>
                  setEditingRates({ ...editingRates, bwPerPage: parseFloat(e.target.value) || 1 })
                }
                className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'bn' ? 'কালার প্রিন্ট (প্রতি পাতা ৳):' : 'Color Rate (per page ৳):'}
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={editingRates.colorPerPage}
                onChange={(e) =>
                  setEditingRates({ ...editingRates, colorPerPage: parseFloat(e.target.value) || 1 })
                }
                className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'bn' ? 'ফটো পেপার রেট (প্রতি পাতা ৳):' : 'Photo Rate (per page ৳):'}
              </label>
              <input
                type="number"
                min="5"
                step="1"
                value={editingRates.photoPerPage}
                onChange={(e) =>
                  setEditingRates({ ...editingRates, photoPerPage: parseFloat(e.target.value) || 5 })
                }
                className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {lang === 'bn' ? 'Legal পেপার অতিরিক্ত ফি (৳):' : 'Legal Paper Add-on (৳):'}
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={editingRates.legalPaperAddon}
                onChange={(e) =>
                  setEditingRates({
                    ...editingRates,
                    legalPaperAddon: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer mt-4"
            >
              <Save className="w-4 h-4" />
              <span>{lang === 'bn' ? 'মূল্য তালিকা আপডেট করুন' : 'Update Pricing Rates'}</span>
            </button>

            {rateSaved && (
              <p className="text-center font-semibold text-emerald-600 text-xs animate-fade-in">
                {lang === 'bn' ? 'রেট সফলভাবে আপডেট হয়েছে!' : 'Rates saved successfully!'}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
