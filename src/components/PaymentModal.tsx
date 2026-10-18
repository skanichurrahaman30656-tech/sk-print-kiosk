import React, { useState } from 'react';
import { X, Check, ShieldCheck, Lock, Smartphone, CreditCard, Banknote, Sparkles, QrCode } from 'lucide-react';
import type { PaymentMethod } from '../types.ts';
import { formatINR } from '../utils/printCalculator.ts';
import { soundFx } from '../utils/audioSynth.ts';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCost: number;
  documentName: string;
  onPaymentSuccess: (method: PaymentMethod, trxId: string) => void;
  lang: 'bn' | 'en';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalCost,
  documentName,
  onPaymentSuccess,
  lang,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState<string>('9876543210@paytm');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSubTab, setPaymentSubTab] = useState<'qr' | 'upi_id'>('qr');

  if (!isOpen) return null;

  const handleQuickDemoFill = () => {
    soundFx.playClick();
    setUpiId('rahul.sen@okhdfcbank');
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setIsSubmitting(true);

    // Simulate authentic Indian UPI / Banking processing
    setTimeout(() => {
      setIsSubmitting(false);
      const generatedTrxId = `UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`; // 12-digit UTR
      onPaymentSuccess(selectedMethod, generatedTrxId);
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header with UPI/GPay/PhonePe styling */}
        <div
          className={`px-6 py-4 text-white flex items-center justify-between transition-colors ${
            selectedMethod === 'upi'
              ? 'bg-[#0f766e]'
              : selectedMethod === 'gpay'
              ? 'bg-[#1a73e8]'
              : selectedMethod === 'phonepe'
              ? 'bg-[#5f259f]'
              : selectedMethod === 'paytm'
              ? 'bg-[#002e6e]'
              : selectedMethod === 'card'
              ? 'bg-slate-900'
              : 'bg-emerald-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            <h3 id="payment-modal-title" className="font-bold text-lg">
              {selectedMethod === 'upi'
                ? lang === 'bn' ? 'UPI পেমেন্ট (Google Pay / PhonePe / QR)' : 'UPI Instant Payment'
                : selectedMethod === 'gpay'
                ? 'Google Pay (GPay UPI)'
                : selectedMethod === 'phonepe'
                ? 'PhonePe UPI Gateway'
                : selectedMethod === 'paytm'
                ? 'Paytm UPI & Wallet'
                : selectedMethod === 'card'
                ? lang === 'bn' ? 'RuPay / Visa / Master ডেবিট কার্ড' : 'Debit / Credit Card (RuPay/Visa)'
                : lang === 'bn' ? 'কাউন্টার ক্যাশ পেমেন্ট স্লিপ' : 'Cash at Counter'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment modal"
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Summary Ribbon */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="truncate max-w-[240px]">
            <p className="text-xs text-slate-500">
              {lang === 'bn' ? 'ডকুমেন্ট:' : 'Document:'}
            </p>
            <p className="text-xs font-semibold text-slate-800 truncate">
              {documentName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">
              {lang === 'bn' ? 'মোট প্রদেয় টাকা:' : 'Total Amount:'}
            </p>
            <p className="text-xl font-bold text-blue-700">
              {formatINR(totalCost)}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              {lang === 'bn' ? 'পেমেন্ট মাধ্যম বেছে নিন:' : 'Select Payment Method:'}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {/* UPI */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('upi');
                  soundFx.playClick();
                }}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  selectedMethod === 'upi'
                    ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-600/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-[10px]">
                  UPI
                </div>
                <span className="text-[11px] font-bold text-slate-800">UPI QR</span>
              </button>

              {/* GPay */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('gpay');
                  soundFx.playClick();
                }}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  selectedMethod === 'gpay'
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-xs">
                  G
                </div>
                <span className="text-[11px] font-bold text-slate-800">GPay</span>
              </button>

              {/* PhonePe */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('phonepe');
                  soundFx.playClick();
                }}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  selectedMethod === 'phonepe'
                    ? 'border-[#5f259f] bg-purple-50 ring-2 ring-[#5f259f]/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#5f259f] text-white flex items-center justify-center font-bold text-xs">
                  Pe
                </div>
                <span className="text-[11px] font-bold text-slate-800">PhonePe</span>
              </button>

              {/* Paytm */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('paytm');
                  soundFx.playClick();
                }}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  selectedMethod === 'paytm'
                    ? 'border-[#002e6e] bg-sky-50 ring-2 ring-[#002e6e]/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#002e6e] text-white flex items-center justify-center font-bold text-[10px]">
                  Paytm
                </div>
                <span className="text-[11px] font-bold text-slate-800">Paytm</span>
              </button>

              {/* Card (RuPay/Visa) */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('card');
                  soundFx.playClick();
                }}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  selectedMethod === 'card'
                    ? 'border-slate-900 bg-slate-100 ring-2 ring-slate-900/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800">RuPay</span>
              </button>

              {/* Counter Cash */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('counter_cash');
                  soundFx.playClick();
                }}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  selectedMethod === 'counter_cash'
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  <Banknote className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800">{lang === 'bn' ? 'ক্যাশ' : 'Cash'}</span>
              </button>
            </div>
          </div>

          {/* Payment Form Input Fields */}
          <form onSubmit={handlePay} className="space-y-4">
            {selectedMethod === 'upi' || selectedMethod === 'gpay' || selectedMethod === 'phonepe' || selectedMethod === 'paytm' ? (
              <div className="space-y-3">
                {/* Tabs: QR Code vs UPI ID */}
                <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentSubTab('qr');
                      soundFx.playClick();
                    }}
                    className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1 ${
                      paymentSubTab === 'qr'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'স্ক্যান করুন (UPI QR Code)' : 'Scan UPI QR'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentSubTab('upi_id');
                      soundFx.playClick();
                    }}
                    className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1 ${
                      paymentSubTab === 'upi_id'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'UPI ID লিখুন' : 'Enter UPI ID / VPA'}</span>
                  </button>
                </div>

                {paymentSubTab === 'qr' ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                    <p className="text-xs text-slate-600 font-medium">
                      {lang === 'bn'
                        ? 'যেকোনো UPI অ্যাপ (GPay, PhonePe, Paytm, BHIM) দিয়ে স্ক্যান করুন:'
                        : 'Scan with any UPI App (GPay, PhonePe, Paytm, BHIM):'}
                    </p>
                    {/* Simulated Authentic Indian UPI QR Code */}
                    <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-slate-300 shadow-xs flex flex-col items-center justify-center">
                      <QrCode className="w-28 h-28 text-slate-900" />
                      <span className="text-[10px] font-bold text-teal-800">
                        BHIM UPI • {formatINR(totalCost)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Merchant: <span className="font-semibold text-slate-800">Digital Print & Xerox Counter</span>
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'bn' ? 'আপনার UPI ID (VPA):' : 'Your UPI ID (VPA):'}
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@okhdfcbank / mobile@upi"
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : selectedMethod === 'card' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    RuPay / Debit Card Number:
                  </label>
                  <input
                    type="text"
                    required
                    defaultValue="6074 •••• •••• 1289"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry (MM/YY):</label>
                    <input
                      type="text"
                      defaultValue="08/29"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">CVV:</label>
                    <input
                      type="password"
                      defaultValue="524"
                      maxLength={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <p className="font-bold text-sm mb-1">
                  {lang === 'bn' ? 'দোকানের কাউন্টারে ক্যাশ পেমেন্ট' : 'Cash at Shop Counter'}
                </p>
                <p>
                  {lang === 'bn'
                    ? 'কনফার্ম বাটন চাপলে প্রিন্ট কমান্ডটি কিউতে চলে যাবে এবং একটি ডিজিটাল টোকেন নম্বর তৈরি হবে। কাউন্টারে নগদ টাকা দিয়ে প্রিন্ট কপি সংগ্রহ করতে পারবেন।'
                    : 'Confirming will send the job to the queue and issue a Token ID. Pay cash at the store counter to collect your prints.'}
                </p>
              </div>
            )}

            {/* Sandbox auto fill button */}
            <div className="flex justify-between items-center text-xs pt-1">
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium underline"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'টেস্ট তথ্য অটো-পূরণ করুন' : 'Auto-fill Demo Sandbox'}</span>
              </button>
              <span className="text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>NPCI / 256-bit Secure</span>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedMethod === 'upi'
                  ? 'bg-teal-700 hover:bg-teal-800'
                  : selectedMethod === 'gpay'
                  ? 'bg-[#1a73e8] hover:bg-[#1557b0]'
                  : selectedMethod === 'phonepe'
                  ? 'bg-[#5f259f] hover:bg-[#4d1d82]'
                  : selectedMethod === 'paytm'
                  ? 'bg-[#002e6e] hover:bg-[#001f4d]'
                  : selectedMethod === 'card'
                  ? 'bg-slate-900 hover:bg-black'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{lang === 'bn' ? 'UPI পেমেন্ট যাচাই হচ্ছে...' : 'Verifying Payment...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>
                    {lang === 'bn'
                      ? `${formatINR(totalCost)} প্রদান নিশ্চিত করুন`
                      : `Confirm & Pay ${formatINR(totalCost)}`}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
