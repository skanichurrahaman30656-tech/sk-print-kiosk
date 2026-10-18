import React, { useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, CheckCircle2, RefreshCw, Eye } from 'lucide-react';
import type { PrintDocument } from '../types.ts';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocs.ts';
import { formatBytes } from '../utils/printCalculator.ts';
import { soundFx } from '../utils/audioSynth.ts';

interface FileUploaderProps {
  document: PrintDocument | null;
  onSelectDocument: (doc: PrintDocument | null) => void;
  lang: 'bn' | 'en';
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  document,
  onSelectDocument,
  lang,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundFx.playClick();
    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = (event) => {
      const previewUrl = (event.target?.result as string) || '';
      const estimatedPages = isImage ? 1 : Math.max(1, Math.min(15, Math.ceil(file.size / (150 * 1024))));

      const newDoc: PrintDocument = {
        id: `upload-${Date.now()}`,
        name: file.name,
        sizeBytes: file.size,
        type: file.type || 'application/octet-stream',
        previewUrl: previewUrl,
        pageCount: estimatedPages,
      };
      onSelectDocument(newDoc);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      soundFx.playClick();
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();
      reader.onload = (event) => {
        const previewUrl = (event.target?.result as string) || '';
        const estimatedPages = isImage ? 1 : Math.max(1, Math.min(15, Math.ceil(file.size / (150 * 1024))));
        const newDoc: PrintDocument = {
          id: `upload-${Date.now()}`,
          name: file.name,
          sizeBytes: file.size,
          type: file.type || 'application/octet-stream',
          previewUrl: previewUrl,
          pageCount: estimatedPages,
        };
        onSelectDocument(newDoc);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Box matching: <label>১. আপনার ডকুমেন্ট (PDF / Image) আপলোড করুন:</label> */}
      <div>
        <label
          htmlFor="fileInput"
          className="block text-sm font-semibold text-slate-800 mb-1 flex items-center justify-between"
        >
          <span>
            {lang === 'bn'
              ? '১. আপনার ডকুমেন্ট (PDF / Image) আপলোড করুন:'
              : '1. Upload your document (PDF / Image):'}
          </span>
          <span className="text-xs font-normal text-slate-500">
            {lang === 'bn' ? 'সর্বোচ্চ ২৫ মেগাবাইট' : 'Max 25 MB'}
          </span>
        </label>

        {/* Always rendered native input as requested in prompt */}
        <input
          type="file"
          id="fileInput"
          ref={fileInputRef}
          accept=".pdf,image/*"
          onChange={handleFileUpload}
          className="w-full border text-sm p-2 rounded-lg bg-slate-50 focus:outline-indigo-500 text-slate-800 border-slate-300 mb-2 cursor-pointer"
        />

        {document && (
          /* Active Document Preview Card */
          <div className="border border-indigo-200 bg-indigo-50/40 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3 transition-all">
            <div className="w-16 h-20 bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex items-center justify-center shrink-0 relative group">
              {document.previewUrl ? (
                <img
                  src={document.previewUrl}
                  alt={document.name}
                  className="w-full h-full object-cover"
                />
              ) : document.type.startsWith('image/') ? (
                <ImageIcon className="w-6 h-6 text-indigo-500" />
              ) : (
                <FileText className="w-6 h-6 text-indigo-600" />
              )}
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1 text-emerald-600 text-xs font-semibold mb-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {lang === 'bn' ? 'ফাইল প্রিন্টের জন্য প্রস্তুত' : 'Ready for Printing'}
                </span>
              </div>
              <p className="font-bold text-slate-900 truncate text-sm">
                {document.name}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-600 mt-1">
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-indigo-700">
                  {lang === 'bn' ? `পৃষ্ঠা: ${document.pageCount} টি` : `Pages: ${document.pageCount}`}
                </span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                  {formatBytes(document.sizeBytes)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
            >
              {lang === 'bn' ? 'পরিবর্তন করুন' : 'Change'}
            </button>
          </div>
        )}
      </div>

      {/* Quick Sample Document Picker for instant testing */}
      <div className="pt-0.5">
        <p className="text-xs font-medium text-slate-500 mb-1.5">
          {lang === 'bn'
            ? 'অথবা দ্রুত টেস্ট করতে নমুনা ডকুমেন্ট বেছে নিন:'
            : 'Or select a sample document to test in 1-click:'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_DOCUMENTS.map((sample) => {
            const isSelected = document?.id === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onSelectDocument(sample);
                }}
                className={`text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                      sample.type.startsWith('image')
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {sample.type.startsWith('image') ? (
                      <ImageIcon className="w-3.5 h-3.5" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className="font-semibold text-slate-800 truncate text-[11px]">
                    {sample.name.split('_')[0]}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{sample.pageCount} {lang === 'bn' ? 'পেজ' : 'pg'}</span>
                  <span>{formatBytes(sample.sizeBytes)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
