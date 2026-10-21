import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'cropperjs';
import QRCode from 'qrcode';
import { CheckCircle2, ArrowRight, ShieldCheck, Copy, Check, FileText, ImageIcon, Sparkles } from 'lucide-react';
import { SHOP_CONFIG, generateUpiUrl, formatINR, translations, calculateSKTotal } from '../utils/printCalculator.ts';
import { soundFx } from '../utils/audioSynth.ts';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocs.ts';
import type { PrintDocument } from '../types.ts';

interface KioskFormProps {
  lang: 'bn' | 'en';
  onLanguageChange: (newLang: 'bn' | 'en') => void;
  onOpenAdminPanel: () => void;
  onSubmitOrder: (jobData: {
    docCategory: '5' | '10' | '30';
    pages: number;
    copies: number;
    totalCost: number;
    document: PrintDocument;
    croppedDataUrl?: string;
  }) => void;
}

export const KioskForm: React.FC<KioskFormProps> = ({
  lang,
  onLanguageChange,
  onOpenAdminPanel,
  onSubmitOrder,
}) => {
  const t = translations[lang] || translations.bn;

  const [docType, setDocType] = useState<'5' | '10' | '30'>('5');
  const [pageCount, setPageCount] = useState<number>(1);
  const [copyCount, setCopyCount] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState<string>('নমুনা_আধার_কার্ড_Aadhaar.jpg');
  const [previewSrc, setPreviewSrc] = useState<string>(SAMPLE_DOCUMENTS[1].previewUrl);

  // Cropper State
  const [showCrop, setShowCrop] = useState<boolean>(false);
  const [cropperInstance, setCropperInstance] = useState<any>(null);
  const imageElementRef = useRef<HTMLImageElement>(null);
  const [cropSuccessAlert, setCropSuccessAlert] = useState<boolean>(false);

  // Modal State
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showShopQrModal, setShowShopQrModal] = useState<boolean>(false);
  const [shopQrUrl, setShopQrUrl] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);

  // Shop QR Modal Handlers
  const generateShopQR = async () => {
    soundFx.playClick();
    const currentUrl = window.location.href;
    try {
      const dataUrl = await QRCode.toDataURL(currentUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      });
      setShopQrUrl(dataUrl);
    } catch {
      setShopQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}`);
    }
    setShowShopQrModal(true);
  };

  const closeShopQR = () => {
    soundFx.playClick();
    setShowShopQrModal(false);
  };

  useEffect(() => {
    (window as any).generateShopQR = generateShopQR;
    (window as any).closeShopQR = closeShopQR;
    (window as any).openAdminPanel = onOpenAdminPanel;
    return () => {
      delete (window as any).generateShopQR;
      delete (window as any).closeShopQR;
      delete (window as any).openAdminPanel;
    };
  }, [onOpenAdminPanel]);

  const pricePerPage = parseInt(docType, 10);
  const total = calculateSKTotal({
    pricePerPage,
    pages: pageCount,
    copies: copyCount,
  });

  const upiUrl = generateUpiUrl({
    upiId: SHOP_CONFIG.upiId,
    payeeName: SHOP_CONFIG.payeeName,
    amount: total,
    transactionNote: `SK Digital Deganga - ${documentName.slice(0, 15)}`,
  });

  // Generate QR Code when payment modal opens
  useEffect(() => {
    if (showPaymentModal) {
      QRCode.toDataURL(upiUrl, {
        width: 220,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [showPaymentModal, upiUrl]);

  // Clean up cropper on unmount
  useEffect(() => {
    return () => {
      if (cropperInstance) {
        cropperInstance.destroy();
      }
    };
  }, [cropperInstance]);

  // File Selection Handler matching handleFileSelect(event)
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    soundFx.playClick();
    setSelectedFile(file);
    setDocumentName(file.name);

    if (cropperInstance) {
      cropperInstance.destroy();
      setCropperInstance(null);
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setPreviewSrc(src);
        setShowCrop(true);
        setPageCount(1);

        // Initialize Cropper on next tick when image renders
        setTimeout(() => {
          if (imageElementRef.current) {
            const CropperClass: any = (window as any).Cropper || Cropper;
            const instance = new CropperClass(imageElementRef.current, {
              viewMode: 1,
              autoCropArea: 0.8,
              responsive: true,
            });
            setCropperInstance(instance);
          }
        }, 100);
      };
      reader.readAsDataURL(file);
    } else {
      setShowCrop(false);
      // Estimate pages for PDF based on size
      const estPages = Math.max(1, Math.min(20, Math.ceil(file.size / (150 * 1024))));
      setPageCount(estPages);
    }
  };

  // Sample document quick select
  const handleSelectSample = (sample: PrintDocument) => {
    soundFx.playClick();
    setDocumentName(sample.name);
    setPreviewSrc(sample.previewUrl);
    setPageCount(sample.pageCount);

    if (cropperInstance) {
      cropperInstance.destroy();
      setCropperInstance(null);
    }

    if (sample.type.startsWith('image/')) {
      setShowCrop(true);
      setTimeout(() => {
        if (imageElementRef.current) {
          const CropperClass: any = (window as any).Cropper || Cropper;
          const instance = new CropperClass(imageElementRef.current, {
            viewMode: 1,
            autoCropArea: 0.8,
            responsive: true,
          });
          setCropperInstance(instance);
        }
      }, 100);
    } else {
      setShowCrop(false);
    }
  };

  // Confirm Crop function matching confirmCrop()
  const confirmCrop = () => {
    soundFx.playClick();
    if (cropperInstance) {
      const croppedCanvas = typeof cropperInstance.getCroppedCanvas === 'function'
        ? cropperInstance.getCroppedCanvas()
        : null;
      if (croppedCanvas) {
        const croppedDataUrl = croppedCanvas.toDataURL('image/jpeg');
        setPreviewSrc(croppedDataUrl);
      }
    }
    setCropSuccessAlert(true);
    setTimeout(() => setCropSuccessAlert(false), 3000);
  };

  const handleCopyUpi = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(SHOP_CONFIG.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setShowPaymentModal(true);
    setTimeout(() => {
      document.getElementById('paymentModal')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Confirm Payment & Trigger Printing
  const handleConfirmPaid = () => {
    soundFx.playClick();
    setIsVerifyingPayment(true);

    setTimeout(() => {
      setIsVerifyingPayment(false);
      setShowPaymentModal(false);

      const activeDoc: PrintDocument = {
        id: `doc-${Date.now()}`,
        name: documentName,
        sizeBytes: selectedFile?.size || 450000,
        type: selectedFile?.type || (documentName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
        pageCount: pageCount,
        previewUrl: previewSrc,
      };

      onSubmitOrder({
        docCategory: docType,
        pages: pageCount,
        copies: copyCount,
        totalCost: total,
        document: activeDoc,
        croppedDataUrl: previewSrc,
      });
    }, 1200);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Admin Bar (শুধুমাত্র দোকানদারের জন্য) */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-3 px-2">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
            ● কাউন্টার সক্রিয় (Firestore Live)
          </span>
          <span className="hidden sm:inline-block text-xs font-semibold text-gray-600">
            PhonePe UPI Accepted
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={generateShopQR}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
          >
            📲 <span>দোকানের QR কোড</span>
          </button>
          <button
            type="button"
            onClick={onOpenAdminPanel}
            className="px-3 py-1.5 bg-indigo-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
          >
            🛡️ <span>অর্ডার কিউ ও রেকর্ড</span>
          </button>
        </div>
      </div>

      {/* Main Card Container (ফুল চওড়া এবং সুন্দর লেআউট) */}
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-300 p-6 md:p-10">
        {/* Header Section */}
        <div className="flex justify-between items-start border-b pb-5 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-700">
              SK Digital Service
            </h1>
            <p id="subtitle" className="text-sm font-semibold text-gray-500 mt-1">
              {t.subtitle}
            </p>
          </div>
          {/* Language Switcher */}
          <select
            id="langSelect"
            value={lang}
            onChange={(e) => onLanguageChange(e.target.value as 'bn' | 'en')}
            className="border-2 border-indigo-200 text-sm p-2 rounded-xl bg-indigo-50 font-bold text-indigo-700 focus:outline-none cursor-pointer"
          >
            <option value="bn">বাংলা</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Quick Sample Document Selector for 1-click Testing */}
        <div className="mb-6 p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold text-slate-600 mb-2">
            {lang === 'bn'
              ? 'অথবা দ্রুত টেস্ট করতে নমুনা ডকুমেন্ট বেছে নিন:'
              : 'Or pick a sample file to test in 1-click:'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SAMPLE_DOCUMENTS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={`p-2 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col justify-between ${
                  documentName === sample.name
                    ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-900 ring-2 ring-indigo-500/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="truncate block font-semibold">{sample.name.split('_')[0]}</span>
                <span className="text-[10px] text-slate-500">{sample.pageCount} {lang === 'bn' ? 'পেজ' : 'pg'}</span>
              </button>
            ))}
          </div>
        </div>

        <form id="printForm" onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: File Upload */}
          <div>
            <label id="lblStep1" htmlFor="fileInput" className="block text-base font-bold text-gray-800 mb-2">
              {t.step1}
            </label>
            <input
              type="file"
              id="fileInput"
              accept=".pdf,image/*"
              onChange={handleFileSelect}
              className="w-full border-2 border-gray-300 p-3.5 rounded-2xl bg-gray-50 text-gray-800 font-medium focus:outline-none focus:border-indigo-600 cursor-pointer"
            />
            {documentName && (
              <div className="mt-2 text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>নির্বাচিত ফাইল: {documentName} ({pageCount} পেজ)</span>
              </div>
            )}
          </div>

          {/* Image Crop Preview Section */}
          <div
            id="cropContainer"
            className={`${showCrop ? 'block' : 'hidden'} border-2 border-indigo-200 rounded-2xl p-4 bg-indigo-50/50 text-center`}
          >
            <p id="lblCropInstruction" className="text-sm font-bold text-gray-700 mb-2">
              {t.cropInstruction}
            </p>
            <div className="max-h-80 overflow-hidden flex justify-center bg-gray-200 rounded-xl">
              <img
                id="cropImage"
                ref={imageElementRef}
                src={previewSrc}
                alt="Crop preview"
                className="max-w-full"
              />
            </div>
            <button
              type="button"
              onClick={confirmCrop}
              id="btnConfirmCrop"
              className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 px-6 rounded-xl transition shadow cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>{t.btnConfirmCrop}</span>
            </button>
            {cropSuccessAlert && (
              <p className="mt-2 text-xs font-bold text-emerald-700 animate-bounce">
                {lang === 'bn' ? '✓ ছবিটি সফলভাবে ক্রপ করা হয়েছে!' : '✓ Image cropped successfully!'}
              </p>
            )}
          </div>

          {/* Step 2: Print Category */}
          <div>
            <label id="lblStep2" htmlFor="docType" className="block text-base font-bold text-gray-800 mb-2">
              {t.step2}
            </label>
            <select
              id="docType"
              value={docType}
              onChange={(e) => {
                soundFx.playClick();
                setDocType(e.target.value as '5' | '10' | '30');
              }}
              className="w-full border-2 border-gray-300 p-3.5 rounded-2xl bg-gray-50 text-gray-800 font-bold focus:outline-none focus:border-indigo-600 cursor-pointer text-base"
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
          </div>

          {/* Step 3: Pages & Copies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label id="lblPages" htmlFor="pageCount" className="block text-base font-bold text-gray-800 mb-2">
                {t.pages}
              </label>
              <input
                type="number"
                id="pageCount"
                value={pageCount}
                min="1"
                onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full border-2 border-gray-300 p-3.5 rounded-2xl bg-gray-50 text-gray-800 font-bold focus:outline-none focus:border-indigo-600 text-base"
              />
            </div>
            <div>
              <label id="lblCopies" htmlFor="copyCount" className="block text-base font-bold text-gray-800 mb-2">
                {t.copies}
              </label>
              <input
                type="number"
                id="copyCount"
                value={copyCount}
                min="1"
                onChange={(e) => setCopyCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full border-2 border-gray-300 p-3.5 rounded-2xl bg-gray-50 text-gray-800 font-bold focus:outline-none focus:border-indigo-600 text-base"
              />
            </div>
          </div>

          {/* Total Amount Section */}
          <div className="bg-indigo-50 p-5 rounded-2xl border-2 border-indigo-100 flex justify-between items-center shadow-xs">
            <span id="lblTotal" className="text-xl font-extrabold text-indigo-950">
              {t.total}
            </span>
            <span id="totalPrice" className="text-3xl font-black text-indigo-600">
              ₹{total}
            </span>
          </div>

          {/* Footer & Submit Button */}
          <div className="border-t pt-4">
            <p id="lblFooterNotice" className="text-sm text-center text-gray-600 font-semibold mb-3">
              {t.footerNotice}
            </p>
            <button
              type="submit"
              id="btnSubmit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-lg py-4 rounded-2xl transition shadow-xl hover:shadow-indigo-300 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{t.btnSubmit}</span>
              <span className="text-sm px-2.5 py-0.5 rounded-full bg-indigo-500/60 font-sans font-bold">
                ₹{total}
              </span>
            </button>
          </div>
        </form>

        {/* Payment Modal Section */}
        <div
          id="paymentModal"
          className={`${showPaymentModal ? 'block' : 'hidden'} mt-8 text-center border-t-2 pt-6 animate-fade-in`}
        >
          <h3 id="lblScanTitle" className="text-xl font-bold text-gray-800 mb-1">
            {t.scanTitle}
          </h3>
          <p id="lblPayee" className="text-sm text-gray-500 mb-2">
            {t.payee}
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-xs text-slate-700 font-mono border border-slate-300 mb-3">
            <span>UPI: {SHOP_CONFIG.upiId}</span>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="text-purple-700 hover:text-purple-900 ml-1 cursor-pointer"
              title="Copy UPI ID"
            >
              {copiedUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* QR Code Container */}
          <div id="qrcode" className="flex justify-center my-4">
            {qrCodeDataUrl ? (
              <div className="relative p-2 bg-white rounded-2xl border-4 border-indigo-100 shadow-md">
                <img
                  id="qrImage"
                  src={qrCodeDataUrl}
                  alt="UPI QR Code"
                  className="w-56 h-56 rounded-xl"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-11 h-11 rounded-full bg-[#5f259f] border-2 border-white shadow-md flex items-center justify-center">
                    <span className="text-white font-bold text-sm">पे</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-56 h-56 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                QR লোড হচ্ছে...
              </div>
            )}
          </div>

          <p id="payAmountText" className="text-xl md:text-2xl font-black text-indigo-600 mb-2">
            {t.payAmountPrefix + total}
          </p>
          <p id="lblAutoPrintNotice" className="text-sm text-green-600 font-bold animate-pulse mb-4">
            {t.autoPrintNotice}
          </p>

          {/* Direct Confirmation Action */}
          <button
            type="button"
            onClick={handleConfirmPaid}
            disabled={isVerifyingPayment}
            className="w-full max-w-sm mx-auto bg-[#5f259f] hover:bg-[#4d1d82] active:bg-[#3d1668] text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isVerifyingPayment ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>পেমেন্ট যাচাই হচ্ছে...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>পেমেন্ট নিশ্চিত করুন ও প্রিন্ট দিন</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>NPCI • PhonePe 100% Verified Merchant</span>
          </p>
        </div>
      </div>

      {/* Shop QR Modal (দোকানের কিউআর তৈরির জন্য) */}
      <div
        id="shopQrModal"
        className={`${showShopQrModal ? 'flex' : 'hidden'} fixed inset-0 bg-black/60 items-center justify-center p-4 z-50 animate-fade-in`}
      >
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">দোকানের জন্য কাস্টমার QR কোড</h3>
          <p className="text-xs text-gray-500 mb-4">
            এই QR কোডটি প্রিন্ট করে দোকানে লাগিয়ে রাখুন। গ্রাহক এটি স্ক্যান করেই এই পেজে আসবে।
          </p>
          <div className="flex justify-center mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <img
              id="shopQrImg"
              src={shopQrUrl}
              alt="Shop Counter QR Code"
              className="w-52 h-52 border p-2 rounded-xl bg-white shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm shadow cursor-pointer"
            >
              প্রিন্ট করুন 🖨️
            </button>
            <button
              type="button"
              onClick={closeShopQR}
              className="flex-1 bg-gray-800 hover:bg-black text-white py-2.5 rounded-xl font-bold text-sm shadow cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
