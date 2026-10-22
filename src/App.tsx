import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { FileUploader } from './components/FileUploader.tsx';
import { PrintConfigForm } from './components/PrintConfigForm.tsx';
import { PhonePeQrModal } from './components/PhonePeQrModal.tsx';
import { PrinterAnimationModal } from './components/PrinterAnimationModal.tsx';
import { ReceiptModal } from './components/ReceiptModal.tsx';
import { AdminQueueView } from './components/AdminQueueView.tsx';
import { KioskForm } from './components/KioskForm.tsx';
import { SAMPLE_DOCUMENTS } from './data/sampleDocs.ts';
import { DEFAULT_RATES, SHOP_CONFIG, generateToken } from './utils/printCalculator.ts';
import { testConnection, savePrintJobToFirestore, subscribePrintJobs } from './firebase.ts';
import type {
  PrintDocument,
  PrintJob,
  PricingRates,
  DocCategory,
} from './types.ts';

export default function App() {
  const [isCustomerMode, setIsCustomerMode] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'customer' || window.location.hash.includes('customer');
  });

  const [activeTab, setActiveTab] = useState<'kiosk' | 'queue'>(isCustomerMode ? 'kiosk' : 'kiosk');
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [rates, setRates] = useState<PricingRates>(DEFAULT_RATES);
  const [isFirebaseLive, setIsFirebaseLive] = useState<boolean>(false);

  // Initialize Firebase connection and live Firestore sync
  React.useEffect(() => {
    testConnection().then((connected) => {
      setIsFirebaseLive(connected);
    });

    const unsubscribe = subscribePrintJobs(
      (remoteJobs) => {
        if (remoteJobs && remoteJobs.length > 0) {
          setJobs(remoteJobs);
        }
      },
      (error) => {
        console.warn('Firestore subscription fallback:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Pre-selected document for instant testing
  const [selectedDocument, setSelectedDocument] = useState<PrintDocument | null>(
    SAMPLE_DOCUMENTS[1] // Default to Aadhaar / Photo card
  );

  const [jobs, setJobs] = useState<PrintJob[]>([
    {
      id: 'job-init-1',
      tokenNumber: 'SK-4892',
      document: SAMPLE_DOCUMENTS[1],
      docCategory: '10',
      categoryLabel: 'বড় ডকুমেন্টস / ফটো বা আধার সাইজ (₹১০ প্রতি পেজ)',
      paperSize: 'a4',
      pageRangeMode: 'all',
      effectivePages: 1,
      copies: 2,
      duplexMode: 'single',
      binding: 'none',
      totalCost: 20,
      paymentMethod: 'phonepe',
      paymentTrxId: 'UPI904820194821',
      status: 'completed',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      printedPagesCount: 2,
    },
    {
      id: 'job-init-2',
      tokenNumber: 'SK-2184',
      document: SAMPLE_DOCUMENTS[0],
      docCategory: '5',
      categoryLabel: 'ছোট ডকুমেন্টস (₹৫ প্রতি পেজ)',
      paperSize: 'a4',
      pageRangeMode: 'all',
      effectivePages: 2,
      copies: 1,
      duplexMode: 'single',
      binding: 'none',
      totalCost: 10,
      paymentMethod: 'phonepe',
      paymentTrxId: 'UPI491029381048',
      status: 'completed',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      printedPagesCount: 2,
    },
  ]);

  const [pendingJobData, setPendingJobData] = useState<{
    docCategory: DocCategory;
    pricePerPage: number;
    pages: number;
    copies: number;
    totalCost: number;
  } | null>(null);

  const [showPhonePeModal, setShowPhonePeModal] = useState<boolean>(false);
  const [activePrintingJob, setActivePrintingJob] = useState<PrintJob | null>(null);
  const [completedJob, setCompletedJob] = useState<PrintJob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Handle Form Submission -> Open PhonePe QR Modal
  const handleConfigSubmit = (params: {
    docCategory: DocCategory;
    pricePerPage: number;
    pages: number;
    copies: number;
    totalCost: number;
  }) => {
    setPendingJobData(params);
    setStatusMessage(
      lang === 'bn'
        ? 'পেমেন্ট কিউআর কোড প্রস্তুত হচ্ছে...'
        : 'Generating PhonePe UPI QR Code...'
    );
    setShowPhonePeModal(true);
  };

  // Handle Payment Confirmation
  const handlePaymentSuccess = (trxId: string) => {
    setShowPhonePeModal(false);
    if (!pendingJobData || !selectedDocument) return;

    setIsProcessing(true);
    setStatusMessage(
      lang === 'bn'
        ? 'পেমেন্ট সফল হওয়ার সাথে সাথে প্রিন্টার থেকে কাগজ বেরিয়ে আসবে...'
        : 'Payment received! Printer is now outputting sheets...'
    );

    const newJob: PrintJob = {
      id: `job-${Date.now()}`,
      tokenNumber: generateToken(),
      document: selectedDocument,
      docCategory: pendingJobData.docCategory,
      categoryLabel:
        pendingJobData.docCategory === '5'
          ? 'ছোট ডকুমেন্টস (₹৫ প্রতি পেজ)'
          : 'বড় ডকুমেন্টস / ফটো বা আধার সাইজ (₹১০ প্রতি পেজ)',
      printType: pendingJobData.docCategory === '10' ? 'color' : 'bw',
      paperSize: 'a4',
      pageRangeMode: 'all',
      effectivePages: pendingJobData.pages,
      copies: pendingJobData.copies,
      duplexMode: 'single',
      binding: 'none',
      totalCost: pendingJobData.totalCost,
      paymentMethod: 'phonepe',
      paymentTrxId: trxId,
      status: 'printing',
      createdAt: new Date().toISOString(),
      printedPagesCount: pendingJobData.pages * pendingJobData.copies,
    };

    setActivePrintingJob(newJob);
  };

  const handleKioskOrderSubmit = (jobData: {
    docCategory: '5' | '10' | '30';
    pages: number;
    copies: number;
    totalCost: number;
    document: PrintDocument;
    croppedDataUrl?: string;
  }) => {
    setIsProcessing(true);
    setStatusMessage(
      lang === 'bn'
        ? 'পেমেন্ট সফল হওয়ার সাথে সাথে প্রিন্টার থেকে কাগজ বেরিয়ে আসবে...'
        : 'Payment received! Printer is now outputting sheets...'
    );

    const categoryText =
      jobData.docCategory === '5'
        ? 'ব্ল্যাক অ্যান্ড হোয়াইট প্রিন্ট (₹৫ / পেজ)'
        : jobData.docCategory === '10'
        ? 'কালার প্রিন্ট (₹১০ / পেজ)'
        : 'ফটো পেপার প্রিন্ট (₹৩০ / পেজ)';

    const newJob: PrintJob = {
      id: `job-${Date.now()}`,
      tokenNumber: generateToken(),
      document: jobData.document,
      docCategory: jobData.docCategory,
      categoryLabel: categoryText,
      printType: jobData.docCategory === '30' ? 'photo' : jobData.docCategory === '10' ? 'color' : 'bw',
      paperSize: 'a4',
      pageRangeMode: 'all',
      effectivePages: jobData.pages,
      copies: jobData.copies,
      duplexMode: 'single',
      binding: 'none',
      totalCost: jobData.totalCost,
      paymentMethod: 'phonepe',
      paymentTrxId: `UPI${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      status: 'printing',
      createdAt: new Date().toISOString(),
      printedPagesCount: jobData.pages * jobData.copies,
    };

    setActivePrintingJob(newJob);
  };

  // Handle Printer Finish & Save to Firestore
  const handlePrinterAnimationFinish = () => {
    if (!activePrintingJob) return;

    const finishedJob: PrintJob = {
      ...activePrintingJob,
      status: 'completed',
      completedAt: new Date().toISOString(),
    };

    // Save to Firestore for permanent persistence
    savePrintJobToFirestore(finishedJob).catch((err) => {
      console.warn('Error saving to Firestore:', err);
    });

    setJobs((prev) => [finishedJob, ...prev]);
    setCompletedJob(finishedJob);
    setActivePrintingJob(null);
    setIsProcessing(false);
  };

  const handleStartNewJob = () => {
    setCompletedJob(null);
    setPendingJobData(null);
    setStatusMessage('');
  };

  const handleRePrint = (job: PrintJob) => {
    setActivePrintingJob({
      ...job,
      id: `reprint-${Date.now()}`,
      tokenNumber: generateToken(),
      status: 'printing',
    });
    setActiveTab('kiosk');
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col font-['Hind_Siliguri',sans-serif]">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        pendingJobsCount={jobs.filter((j) => j.status === 'printing').length}
        isCustomerMode={isCustomerMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 sm:px-6 flex flex-col items-center justify-center">
        {activeTab === 'kiosk' || isCustomerMode ? (
          <div className="w-full flex justify-center">
            {completedJob ? (
              <ReceiptModal
                job={completedJob}
                onReset={handleStartNewJob}
                lang={lang}
              />
            ) : (
              <KioskForm
                lang={lang}
                onLanguageChange={setLang}
                onOpenAdminPanel={() => setActiveTab('queue')}
                isCustomerMode={isCustomerMode}
                onSubmitOrder={handleKioskOrderSubmit}
              />
            )}
          </div>
        ) : (
          /* Operator / Admin Queue View */
          <AdminQueueView
            jobs={jobs}
            rates={rates}
            onUpdateRates={setRates}
            onRePrint={handleRePrint}
            onClearJobs={() => setJobs([])}
            lang={lang}
          />
        )}
      </main>

      {/* PhonePe UPI QR Modal */}
      {showPhonePeModal && pendingJobData && selectedDocument && (
        <PhonePeQrModal
          isOpen={showPhonePeModal}
          onClose={() => setShowPhonePeModal(false)}
          totalCost={pendingJobData.totalCost}
          documentName={selectedDocument.name}
          pages={pendingJobData.pages}
          copies={pendingJobData.copies}
          onPaymentSuccess={handlePaymentSuccess}
          lang={lang}
        />
      )}

      {/* Printer Animation Modal */}
      {activePrintingJob && (
        <PrinterAnimationModal
          job={activePrintingJob}
          onFinish={handlePrinterAnimationFinish}
          lang={lang}
        />
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white print:hidden">
        <p>
          © 2026 {SHOP_CONFIG.shopName} — {lang === 'bn' ? SHOP_CONFIG.locationBn : SHOP_CONFIG.locationEn}
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> | </span>
          PhonePe Merchant: <span className="font-semibold text-slate-700">{SHOP_CONFIG.payeeName}</span> ({SHOP_CONFIG.upiId})
        </p>
      </footer>
    </div>
  );
}
