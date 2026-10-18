import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Minus,
  Plus,
  ArrowRight,
  QrCode,
  Tag,
  CheckCircle,
} from 'lucide-react';
import type { DocCategory, PrintDocument } from '../types.ts';
import {
  calculateSKTotal,
  formatINR,
  SHOP_CONFIG,
} from '../utils/printCalculator.ts';
import { soundFx } from '../utils/audioSynth.ts';

interface PrintConfigFormProps {
  document: PrintDocument | null;
  onSubmit: (params: {
    docCategory: DocCategory;
    pricePerPage: number;
    pages: number;
    copies: number;
    totalCost: number;
  }) => void;
  lang: 'bn' | 'en';
  isProcessing: boolean;
  statusMessage: string;
}

export const PrintConfigForm: React.FC<PrintConfigFormProps> = ({
  document,
  onSubmit,
  lang,
  isProcessing,
  statusMessage,
}) => {
  const [docType, setDocType] = useState<DocCategory>('5');
  const [pageCount, setPageCount] = useState<number>(1);
  const [copyCount, setCopyCount] = useState<number>(1);
  const [validationError, setValidationError] = useState<string>('');

  // Sync document detected page count if available
  useEffect(() => {
    if (document?.pageCount) {
      setPageCount(document.pageCount);
    }
  }, [document]);

  const pricePerPage = parseInt(docType, 10);
  const totalPrice = calculateSKTotal({
    pricePerPage,
    pages: pageCount,
    copies: copyCount,
  });

  const handleDocTypeChange = (newVal: DocCategory) => {
    soundFx.playClick();
    setDocType(newVal);
  };

  const handlePageChange = (val: number) => {
    setPageCount(Math.max(1, Math.min(500, val || 1)));
  };

  const handleCopyChange = (val: number) => {
    soundFx.playClick();
    setCopyCount(Math.max(1, Math.min(100, val || 1)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) {
      setValidationError(
        lang === 'bn'
          ? 'অনুগ্রহ করে প্রথমে একটি ডকুমেন্ট আপলোড করুন বা নমুনা ফাইল নির্বাচন করুন।'
          : 'Please upload a document or select a sample file first.'
      );
      return;
    }
    setValidationError('');
    soundFx.playClick();

    onSubmit({
      docCategory: docType,
      pricePerPage,
      pages: pageCount,
      copies: copyCount,
      totalCost: totalPrice,
    });
  };

  return (
    <form id="printForm" onSubmit={handleSubmit} className="space-y-5">
      {/* ২. প্রিন্টের ক্যাটাগরি বেছে নিন: (select id="docType") */}
      <div>
        <label htmlFor="docType" className="block text-sm font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
          <span>
            {lang === 'bn' ? '২. প্রিন্টের ক্যাটাগরি বেছে নিন:' : '2. Select Print Category:'}
          </span>
          <span className="text-xs text-indigo-600 font-bold">
            {docType === '5' ? '₹৫/পেজ' : '₹১০/পেজ'}
          </span>
        </label>

        {/* Native select as requested in user's prompt */}
        <select
          id="docType"
          value={docType}
          onChange={(e) => handleDocTypeChange(e.target.value as DocCategory)}
          className="w-full border text-sm p-3 rounded-xl bg-slate-50 focus:bg-white focus:outline-indigo-500 font-medium text-slate-900 border-slate-300 shadow-xs mb-2 cursor-pointer"
        >
          <option value="5">ছোট ডকুমেন্টস (₹৫ প্রতি পেজ)</option>
          <option value="10">বড় ডকুমেন্টস / ফটো বা আধার সাইজ (₹১০ প্রতি পেজ)</option>
        </select>

        {/* Visual Category Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          <button
            type="button"
            onClick={() => handleDocTypeChange('5')}
            className={`p-3.5 rounded-xl border-2 text-left transition-all relative flex items-center justify-between ${
              docType === '5'
                ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  {lang === 'bn' ? 'ছোট ডকুমেন্টস' : 'Small Documents'}
                </p>
                <p className="text-xs text-slate-500">
                  {lang === 'bn' ? 'বায়োডাটা, সাধারণ A4 পেপার' : 'Standard A4 texts'}
                </p>
              </div>
            </div>
            <span className="text-sm font-extrabold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
              ₹5/{lang === 'bn' ? 'পেজ' : 'page'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleDocTypeChange('10')}
            className={`p-3.5 rounded-xl border-2 text-left transition-all relative flex items-center justify-between ${
              docType === '10'
                ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#5f259f] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  {lang === 'bn' ? 'বড় / ফটো / আধার সাইজ' : 'Photo / Aadhaar Print'}
                </p>
                <p className="text-xs text-slate-500">
                  {lang === 'bn' ? 'আধার কার্ড, কালার ছবি' : 'Aadhaar, Color card'}
                </p>
              </div>
            </div>
            <span className="text-sm font-extrabold text-[#5f259f] bg-white px-2.5 py-1 rounded-lg border border-purple-200">
              ₹10/{lang === 'bn' ? 'পেজ' : 'page'}
            </span>
          </button>
        </div>
      </div>

      {/* পেজ ও কপি সংখ্যা row (input id="pageCount" and id="copyCount") */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* মোট পেজ সংখ্যা */}
        <div>
          <label htmlFor="pageCount" className="block text-sm font-semibold text-slate-700 mb-1">
            {lang === 'bn' ? 'মোট পেজ সংখ্যা:' : 'Total Pages:'}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(pageCount - 1)}
              disabled={pageCount <= 1}
              aria-label="Decrease page count"
              className="w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 shadow-xs"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              id="pageCount"
              value={pageCount}
              min="1"
              onChange={(e) => handlePageChange(parseInt(e.target.value, 10) || 1)}
              required
              className="flex-1 text-center font-bold text-base border text-sm p-2.5 rounded-lg bg-slate-50 focus:bg-white border-slate-300 focus:outline-indigo-500 text-slate-900 shadow-xs"
            />
            <button
              type="button"
              onClick={() => handlePageChange(pageCount + 1)}
              aria-label="Increase page count"
              className="w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 shadow-xs"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* কপির সংখ্যা */}
        <div>
          <label htmlFor="copyCount" className="block text-sm font-semibold text-slate-700 mb-1">
            {lang === 'bn' ? 'কপির সংখ্যা:' : 'Number of Copies:'}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopyChange(copyCount - 1)}
              disabled={copyCount <= 1}
              aria-label="Decrease copy count"
              className="w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 shadow-xs"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              id="copyCount"
              value={copyCount}
              min="1"
              onChange={(e) => handleCopyChange(parseInt(e.target.value, 10) || 1)}
              required
              className="flex-1 text-center font-bold text-base border text-sm p-2.5 rounded-lg bg-slate-50 focus:bg-white border-slate-300 focus:outline-indigo-500 text-slate-900 shadow-xs"
            />
            <button
              type="button"
              onClick={() => handleCopyChange(copyCount + 1)}
              aria-label="Increase copy count"
              className="w-10 h-10 rounded-lg border border-slate-300 bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 shadow-xs"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* মোট পেমেন্ট বক্স (Strictly matching: <span id="totalPrice" class="text-2xl font-extrabold text-indigo-600">₹5</span>) */}
      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex justify-between items-center shadow-xs">
        <div>
          <span className="text-sm font-bold text-indigo-900 block">
            {lang === 'bn' ? 'মোট পেমেন্ট করতে হবে:' : 'Total Amount Payable:'}
          </span>
          <span className="text-xs text-indigo-600 font-medium">
            (₹{pricePerPage} × {pageCount} {lang === 'bn' ? 'পেজ' : 'pg'} × {copyCount} {lang === 'bn' ? 'কপি' : 'c'})
          </span>
        </div>
        <span id="totalPrice" className="text-2xl font-extrabold text-indigo-600">
          {formatINR(totalPrice)}
        </span>
      </div>

      {validationError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {validationError}
        </div>
      )}

      {/* পেমেন্ট ও প্রিন্ট বাটন (Strictly matching: "স্ক্যান কিউআর ও পেমেন্ট করুন") */}
      <button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2.5 text-base cursor-pointer"
      >
        <QrCode className="w-5 h-5" />
        <span>
          {lang === 'bn' ? 'স্ক্যান কিউআর ও পেমেন্ট করুন' : 'Scan QR & Pay'}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-indigo-500/50 text-xs font-mono ml-1">
          {formatINR(totalPrice)}
        </span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Status indicator */}
      {statusMessage && (
        <div
          id="status"
          className="mt-4 text-center font-semibold text-xs text-slate-600"
        >
          {statusMessage}
        </div>
      )}
    </form>
  );
};
