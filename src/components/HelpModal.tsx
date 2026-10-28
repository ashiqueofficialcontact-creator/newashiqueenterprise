import React from 'react';
import { HelpCircle, X, CheckCircle, FileDown, Calculator, ShieldCheck, Phone } from 'lucide-react';
import { BusinessSettings, Language } from '../types';
import { translations } from '../i18n/translations';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  settings: BusinessSettings;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  language,
  settings,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-teal-300" />
            <h3 className="font-extrabold text-base sm:text-lg">{t.helpTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-teal-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="p-3.5 bg-teal-50 rounded-2xl border border-teal-200">
            <h4 className="font-bold text-teal-950 text-sm mb-1">
              {settings.businessName} System Guide
            </h4>
            <p className="text-xs text-teal-800">
              {language === 'bn' 
                ? 'এই সিস্টেমটি বিশেষভাবে আরও প্ল্যান্ট, ফিল্টার, মেমব্রেন ও এক্সেসরিজ ব্যবসার পাইকারি ও খুচরো হিসাব সহজ করার জন্য তৈরি।'
                : 'Designed for smartphone and desktop use by RO water plant owners and spare parts shopkeepers.'}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-900 mt-0.5">
                <FileDown className="w-4 h-4" />
              </span>
              <div>
                <strong className="text-slate-900 block font-bold">1. Wholesale Catalog PDF (হোলসেল ক্যাটালগ)</strong>
                <p className="text-xs text-slate-500 mt-0.5">
                  Go to <strong>Wholesale</strong> → tap <strong>Download Wholesale PDF</strong> to generate a clean A4 sheet showing MOQ and rates without revealing your purchase cost.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-900 mt-0.5">
                <Calculator className="w-4 h-4" />
              </span>
              <div>
                <strong className="text-slate-900 block font-bold">2. Retail Price & Profit Calculator (রিটেইল ও লাভ)</strong>
                <p className="text-xs text-slate-500 mt-0.5">
                  Edit Purchase and Retail prices directly in the table to see real-time Profit Amount, Markup on Cost, and Profit Margin %.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-900 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <strong className="text-slate-900 block font-bold">3. Customer View Mode (কাস্টমার ভিউ)</strong>
                <p className="text-xs text-slate-500 mt-0.5">
                  Switch to Customer View before showing your phone to clients. It completely locks and hides purchase costs and profits.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="p-1.5 rounded-lg bg-purple-100 text-purple-900 mt-0.5">
                <Phone className="w-4 h-4" />
              </span>
              <div>
                <strong className="text-slate-900 block font-bold">4. WhatsApp Sharing (হোয়াটসঅ্যাপে রেট পাঠানো)</strong>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tap WhatsApp icons to instantly send ready-made quotations or wholesale rate lists directly to customer chats.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600">
            <strong>Shop Contact:</strong> Baliadanga, Kaliachak, Malda • Phone: 9563340244
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-teal-950 text-white font-bold text-xs hover:bg-teal-900 cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
