import React, { useEffect, useState } from 'react';
import { CheckCircle2, Printer, Sparkles } from 'lucide-react';
import type { PrintJob } from '../types.ts';
import { soundFx } from '../utils/audioSynth.ts';

interface PrinterAnimationModalProps {
  job: PrintJob;
  onFinish: () => void;
  lang: 'bn' | 'en';
}

export const PrinterAnimationModal: React.FC<PrinterAnimationModalProps> = ({
  job,
  onFinish,
  lang,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [progressPercent, setProgressPercent] = useState<number>(10);
  const [isDone, setIsDone] = useState<boolean>(false);

  const totalSheets = Math.max(1, job.effectivePages * job.copies);

  useEffect(() => {
    // Step 1: Processing
    soundFx.playPageFeed();
    const timer1 = setTimeout(() => {
      setCurrentStep(1); // Payment successful & printer spooling
      setProgressPercent(30);
    }, 1000);

    // Step 2: Paper printing loop
    const timer2 = setTimeout(() => {
      setCurrentStep(2); // Printing & paper rolling
      setProgressPercent(50);
      soundFx.playPageFeed();
    }, 2200);

    const timer3 = setTimeout(() => {
      setCurrentPage(Math.min(2, totalSheets));
      setProgressPercent(80);
      soundFx.playPageFeed();
    }, 3600);

    // Step 3: Complete
    const timer4 = setTimeout(() => {
      setCurrentStep(3);
      setCurrentPage(totalSheets);
      setProgressPercent(100);
      setIsDone(true);
      soundFx.playSuccessChime();
    }, 4800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [totalSheets]);

  const statusMessages = {
    0: lang === 'bn' ? 'ফাইল আপলোড এবং প্রসেসিং হচ্ছে...' : 'Uploading and preparing document...',
    1: lang === 'bn' ? 'পেমেন্ট সফল! প্রিন্টার ডাটা রিসিভ করছে...' : 'Payment verified! Printer spooling...',
    2: lang === 'bn' ? `প্রিন্টার থেকে পেপার বের হচ্ছে... (${currentPage}/${totalSheets} পাতা)` : `Ejecting paper from printer... (${currentPage}/${totalSheets})`,
    3: lang === 'bn' ? 'প্রিন্ট সম্পন্ন হয়েছে! পেপার ট্রে থেকে সংগ্রহ করুন।' : 'Printing completed! Please collect your sheets from the output tray.',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="printer-animation-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 text-center relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Kiosk Job Header */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            {lang === 'bn' ? `টোকেন: #${job.tokenNumber}` : `Token: #${job.tokenNumber}`}
          </span>
          <h2 id="printer-animation-title" className="text-xl sm:text-2xl font-bold text-slate-900">
            {lang === 'bn' ? 'স্বয়ংক্রিয় প্রিন্টিং চলছে' : 'Printing in Progress'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 truncate max-w-xs mx-auto">
            {job.document.name}
          </p>
        </div>

        {/* Physical Printer Machine Visual Simulation */}
        <div className="my-6 mx-auto max-w-[340px] relative">
          {/* Top Paper Feed Infeed */}
          <div className="w-40 h-8 mx-auto bg-slate-200 border-2 border-slate-300 rounded-t-lg relative flex items-center justify-center overflow-hidden">
            <div className="w-32 h-1.5 bg-slate-400 rounded-full"></div>
            {/* White paper sheet feeding into printer */}
            <div
              className={`absolute w-28 h-6 bg-white border border-slate-300 rounded-xs shadow-xs transition-transform duration-700 ${
                currentStep >= 1 ? 'translate-y-4 opacity-40' : '-translate-y-1'
              }`}
            ></div>
          </div>

          {/* Printer Chassis Body */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-4 shadow-xl border-2 border-slate-700 relative text-left text-white">
            {/* Front Panel & Status Lights */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-mono tracking-wider font-semibold text-slate-300">
                  LASER-JET PRO 400
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Status LED */}
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    isDone
                      ? 'bg-emerald-400 ring-4 ring-emerald-400/30'
                      : 'bg-amber-400 ring-4 ring-amber-400/30 animate-pulse'
                  }`}
                ></div>
                <span className="text-[10px] uppercase font-mono text-slate-400">
                  {isDone ? 'READY' : 'BUSY'}
                </span>
              </div>
            </div>

            {/* Paper Ejection Output Slot */}
            <div className="h-20 bg-slate-950 rounded-xl border border-slate-800 relative flex items-center justify-center overflow-hidden px-4">
              {/* Laser beam sweep effect */}
              {!isDone && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent w-full animate-[pulse_1s_infinite]"></div>
              )}

              {/* Emerging printed paper sheet */}
              <div
                className={`w-48 bg-white text-slate-800 p-2 rounded shadow-lg border border-slate-200 transition-all duration-1000 ${
                  currentStep >= 2
                    ? 'translate-y-0 opacity-100 scale-100'
                    : 'translate-y-8 opacity-0 scale-95'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div
                    className={`h-1.5 rounded-full ${
                      job.docCategory === '10' || job.printType === 'color' ? 'w-16 bg-purple-500' : 'w-12 bg-slate-700'
                    }`}
                  ></div>
                  <span className="text-[9px] font-mono text-slate-400">
                    {currentPage}/{totalSheets}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-1 bg-slate-300 rounded w-full"></div>
                  <div className="h-1 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-1 bg-slate-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>

            {/* Bottom catch tray */}
            <div className="w-44 h-3 mx-auto mt-2 bg-slate-700/80 rounded-b-md"></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">
              {lang === 'bn' ? 'প্রিন্ট অগ্রগতি:' : 'Progress:'}
            </span>
            <span className="font-mono text-blue-600 font-bold">{progressPercent}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Status Message (Strictly matches: "পেমেন্ট সফল! প্রিন্টার থেকে পেপার বের হচ্ছে...") */}
        <div
          className={`p-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            isDone
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-blue-50 border-blue-200 text-blue-700 animate-pulse'
          }`}
        >
          {isDone ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
          )}
          <span>{statusMessages[currentStep as 0 | 1 | 2 | 3]}</span>
        </div>

        {/* Action button once completed */}
        {isDone && (
          <div className="mt-6 animate-fade-in">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onFinish();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>
                {lang === 'bn' ? 'রসিদ ও টোকেন দেখুন' : 'View Receipt & Token'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
