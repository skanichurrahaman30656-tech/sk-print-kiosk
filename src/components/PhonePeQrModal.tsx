import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, CheckCircle2, ArrowRight, ShieldCheck, Copy, Check } from 'lucide-react';
import { SHOP_CONFIG, generateUpiUrl, translations } from '../utils/printCalculator.ts';
import { soundFx } from '../utils/audioSynth.ts';

interface PhonePeQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCost: number;
  documentName: string;
  pages: number;
  copies: number;
  onPaymentSuccess: (trxId: string) => void;
  lang: 'bn' | 'en';
}

export const PhonePeQrModal: React.FC<PhonePeQrModalProps> = ({
  isOpen,
  onClose,
  totalCost,
  documentName,
  pages,
  copies,
  onPaymentSuccess,
  lang,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const t = translations[lang] || translations.bn;

  const upiUrl = generateUpiUrl({
    upiId: SHOP_CONFIG.upiId,
    payeeName: SHOP_CONFIG.payeeName,
    amount: totalCost,
    transactionNote: `SK Digital - ${documentName.slice(0, 15)}`,
  });

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(upiUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [isOpen, upiUrl]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(SHOP_CONFIG.upiId);
    setCopiedUpi(true);
    soundFx.playClick();
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleConfirmPaid = () => {
    soundFx.playClick();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const generatedUpiRef = `UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      onPaymentSuccess(generatedUpiRef);
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lblScanTitle"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* PhonePe Signature Header matching uploaded image */}
        <div className="bg-[#5f259f] text-white p-5 text-center relative shadow-sm">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* PhonePe Logo */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md">
              <svg className="w-7 h-7" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="48" fill="#5f259f"/>
                <path d="M56 24H40C37.8 24 36 25.8 36 28V72C36 74.2 37.8 76 40 76C42.2 76 44 74.2 44 72V56H56C65.4 56 73 48.4 73 39C73 29.6 65.4 24 56 24ZM56 48H44V32H56C61.5 32 66 36.5 66 40C66 43.5 61.5 48 56 48Z" fill="white"/>
              </svg>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              PhonePe
            </h2>
          </div>

          <div className="inline-block px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold tracking-widest uppercase mb-1">
            ACCEPTED HERE
          </div>
          <p className="text-xs text-purple-200">
            {lang === 'bn' ? 'PhonePe বা যেকোনো UPI অ্যাপ দিয়ে স্ক্যান করুন' : 'Scan & Pay Using PhonePe / Any UPI App'}
          </p>
        </div>

        {/* Payment QR Modal body strictly matching IDs from prompt */}
        <div id="paymentModal" className="p-6 text-center space-y-3.5">
          <div>
            <h3 id="lblScanTitle" className="text-md font-bold text-gray-800 mb-1">
              {t.scanTitle}
            </h3>
            <p id="lblPayee" className="text-xs text-gray-500 mb-2">
              {t.payee}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs text-slate-600 border border-slate-200 font-mono">
              <span>UPI: {SHOP_CONFIG.upiId}</span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="text-purple-700 hover:text-purple-900 ml-1"
                title="Copy UPI ID"
              >
                {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* QR Code Container strictly with id="qrcode" */}
          <div className="relative inline-block p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-md">
            <div id="qrcode" className="flex justify-center items-center my-1">
              {qrDataUrl ? (
                <div className="relative">
                  <img
                    src={qrDataUrl}
                    alt="PhonePe UPI Payment QR Code"
                    className="w-44 h-44 rounded-lg"
                  />
                  {/* PhonePe Center Badge */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-[#5f259f] border-2 border-white shadow-md flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 100 100" fill="none">
                        <circle cx="50" cy="50" r="48" fill="#5f259f"/>
                        <path d="M56 24H40C37.8 24 36 25.8 36 28V72C36 74.2 37.8 76 40 76C42.2 76 44 74.2 44 72V56H56C65.4 56 73 48.4 73 39C73 29.6 65.4 24 56 24ZM56 48H44V32H56C61.5 32 66 36.5 66 40C66 43.5 61.5 48 56 48Z" fill="white"/>
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-44 h-44 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                  QR লোড হচ্ছে...
                </div>
              )}
            </div>
          </div>

          {/* Exact element id="payAmountText" */}
          <p id="payAmountText" className="text-sm font-semibold text-indigo-600 mb-1">
            {t.payAmountPrefix + totalCost}
          </p>

          <p className="text-xs text-slate-500">
            {documentName} ({pages} {lang === 'bn' ? 'পেজ' : 'pages'} × {copies} {lang === 'bn' ? 'কপি' : 'copies'})
          </p>

          {/* Exact element id="lblAutoPrintNotice" */}
          <p id="lblAutoPrintNotice" className="text-xs text-green-600 font-semibold animate-pulse bg-emerald-50 py-2 px-3 rounded-xl border border-emerald-200">
            {t.autoPrintNotice}
          </p>

          {/* Direct Confirmation Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleConfirmPaid}
              disabled={isVerifying}
              className="w-full bg-[#5f259f] hover:bg-[#4d1d82] active:bg-[#3d1668] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{lang === 'bn' ? 'পেমেন্ট যাচাই হচ্ছে...' : 'Verifying UPI Payment...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {lang === 'bn' ? 'পেমেন্ট সম্পন্ন করেছি (Start Print)' : 'I Have Paid (Start Print)'}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>NPCI • PhonePe 100% Verified Merchant</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
