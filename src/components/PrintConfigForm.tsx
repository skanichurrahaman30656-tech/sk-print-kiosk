import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Minus,
  Plus,
  ArrowRight,
  QrCode,
  Image as ImageIcon,
} from 'lucide-react';
import type { DocCategory, PrintDocument } from '../types.ts';
import {
  calculateSKTotal,
  formatINR,
  translations,
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

  const t = translations[lang] || translations.bn;

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
          ? 'অনুগ্রহ করে প্রথমে একটি ফাইল আপলোড করুন বা নমুনা নির্বাচন করুন।'
          : 'Please upload a file or select a sample first.'
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
    <form id="printForm" onSubmit={handleSubmit} className="space-y-4">
      {/* Step 2: Print Category */}
      <div>
        <label id="lblStep2" htmlFor="docType" className="block text-sm font-semibold text-gray-700 mb-1">
          {t.step2}
        </label>
        
        {/* Exact native select element with options and IDs from user prompt */}
        <select
          id="docType"
          value={docType}
          onChange={(e) => handleDocTypeChange(e.target.value as DocCategory)}
          className="w-full border text-sm p-2.5 rounded-lg bg-slate-50 focus:bg-white focus:outline-indigo-500 font-medium text-slate-900 border-slate-300 shadow-xs cursor-pointer mb-2"
        >
          <option value="5" id="optBW">
            {t.optBW}
          </option>
          <option value="10" id="optColor">
            {t.optColor}
          </option>
          <option value="30" id="optPhoto">
            {t.optPhoto}
          </option>
        </select>

        {/* Visual Cards for 3 categories */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
          {/* 5: B&W */}
          <button
            type="button"
            onClick={() => handleDocTypeChange('5')}
            className={`p-3 rounded-xl border-2 text-left transition-all relative flex flex-col justify-between ${
              docType === '5'
                ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                ₹5/{lang === 'bn' ? 'পেজ' : 'page'}
              </span>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">
                {lang === 'bn' ? 'ব্ল্যাক অ্যান্ড হোয়াইট' : 'Black & White'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {lang === 'bn' ? 'সাধারণ ডকুমেন্ট' : 'Standard text'}
              </p>
            </div>
          </button>

          {/* 10: Color */}
          <button
            type="button"
            onClick={() => handleDocTypeChange('10')}
            className={`p-3 rounded-xl border-2 text-left transition-all relative flex flex-col justify-between ${
              docType === '10'
                ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                ₹10/{lang === 'bn' ? 'পেজ' : 'page'}
              </span>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">
                {lang === 'bn' ? 'কালার প্রিন্ট' : 'Color Print'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {lang === 'bn' ? 'রঙিন ও আধার সাইজ' : 'Vibrant CMYK'}
              </p>
            </div>
          </button>

          {/* 30: Photo Paper */}
          <button
            type="button"
            onClick={() => handleDocTypeChange('30')}
            className={`p-3 rounded-xl border-2 text-left transition-all relative flex flex-col justify-between ${
              docType === '30'
                ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                ₹30/{lang === 'bn' ? 'পেজ' : 'page'}
              </span>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">
                {lang === 'bn' ? 'ফটো পেপার' : 'Photo Paper'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {lang === 'bn' ? 'গ্লসি ও ল্যাব কোয়ালিটি' : 'Glossy finish'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Step 3: Pages & Copies */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label id="lblPages" htmlFor="pageCount" className="block text-sm font-semibold text-gray-700 mb-1">
            {t.pages}
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handlePageChange(pageCount - 1)}
              disabled={pageCount <= 1}
              aria-label="Decrease page count"
              className="w-9 h-9 rounded-lg border border-slate-300 bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 shadow-xs shrink-0"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="number"
              id="pageCount"
              value={pageCount}
              min="1"
              onChange={(e) => handlePageChange(parseInt(e.target.value, 10) || 1)}
              className="w-full border text-sm p-2 rounded-lg bg-slate-50 focus:bg-white focus:outline-indigo-500 font-bold text-center text-slate-900 border-slate-300 shadow-xs"
            />
            <button
              type="button"
              onClick={() => handlePageChange(pageCount + 1)}
              aria-label="Increase page count"
              className="w-9 h-9 rounded-lg border border-slate-300 bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div>
          <label id="lblCopies" htmlFor="copyCount" className="block text-sm font-semibold text-gray-700 mb-1">
            {t.copies}
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleCopyChange(copyCount - 1)}
              disabled={copyCount <= 1}
              aria-label="Decrease copy count"
              className="w-9 h-9 rounded-lg border border-slate-300 bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 shadow-xs shrink-0"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="number"
              id="copyCount"
              value={copyCount}
              min="1"
              onChange={(e) => handleCopyChange(parseInt(e.target.value, 10) || 1)}
              className="w-full border text-sm p-2 rounded-lg bg-slate-50 focus:bg-white focus:outline-indigo-500 font-bold text-center text-slate-900 border-slate-300 shadow-xs"
            />
            <button
              type="button"
              onClick={() => handleCopyChange(copyCount + 1)}
              aria-label="Increase copy count"
              className="w-9 h-9 rounded-lg border border-slate-300 bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Total Price Display */}
      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex justify-between items-center shadow-xs">
        <div>
          <span id="lblTotal" className="text-sm font-bold text-indigo-900 block">
            {t.total}
          </span>
          <span className="text-xs text-indigo-600 font-medium">
            (₹{pricePerPage} × {pageCount} × {copyCount})
          </span>
        </div>
        <span id="totalPrice" className="text-2xl font-extrabold text-indigo-600">
          ₹{totalPrice}
        </span>
      </div>

      {validationError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {validationError}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        id="btnSubmit"
        disabled={isProcessing}
        className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-base"
      >
        <QrCode className="w-5 h-5" />
        <span>{t.btnSubmit}</span>
        <span className="px-2 py-0.5 rounded-full bg-indigo-500/50 text-xs font-mono ml-1">
          ₹{totalPrice}
        </span>
      </button>

      {/* Status indicator */}
      {statusMessage && (
        <div
          id="status"
          className="mt-3 text-center font-semibold text-xs text-slate-600"
        >
          {statusMessage}
        </div>
      )}
    </form>
  );
};
