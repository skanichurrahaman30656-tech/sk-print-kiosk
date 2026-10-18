import React from 'react';
import { Printer, Volume2, VolumeX, ShieldCheck, Languages, MapPin } from 'lucide-react';
import { SHOP_CONFIG } from '../utils/printCalculator.ts';
import { soundFx } from '../utils/audioSynth.ts';

interface HeaderProps {
  activeTab: 'kiosk' | 'queue';
  setActiveTab: (tab: 'kiosk' | 'queue') => void;
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  pendingJobsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  soundEnabled,
  setSoundEnabled,
  pendingJobsCount,
}) => {
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.enabled = next;
    if (next) soundFx.playClick();
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-700 via-purple-700 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <span className="font-black text-lg">SK</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                {SHOP_CONFIG.shopName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                {lang === 'bn' ? 'কাউন্টার সক্রিয়' : 'Counter Ready'}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200" title="Firebase Cloud Database Connected">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Firestore Live</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-600 inline" />
              <span>{lang === 'bn' ? SHOP_CONFIG.locationBn : SHOP_CONFIG.locationEn}</span>
              <span className="text-slate-300">•</span>
              <span className="text-purple-700 font-semibold">PhonePe UPI Accepted</span>
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-sm font-medium">
          <button
            type="button"
            onClick={() => {
              setActiveTab('kiosk');
              soundFx.playClick();
            }}
            className={`px-3 sm:px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'kiosk'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'bn' ? 'সেল্ফ কাউন্টার' : 'Kiosk'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('queue');
              soundFx.playClick();
            }}
            className={`px-3 sm:px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 relative ${
              activeTab === 'queue'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{lang === 'bn' ? 'অর্ডার কিউ ও রেকর্ড' : 'Queue & Sales'}</span>
            {pendingJobsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                {pendingJobsCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick controls: Audio & Language */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            title={soundEnabled ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড চালু করুন'}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-indigo-600" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              const next = lang === 'bn' ? 'en' : 'bn';
              setLang(next);
              soundFx.playClick();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Languages className="w-3.5 h-3.5 text-indigo-600" />
            <span>{lang === 'bn' ? 'English (India)' : 'বাংলা (ভারত)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
