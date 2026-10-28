import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface CustomerViewBannerProps {
  language: Language;
  onExit: () => void;
}

export const CustomerViewBanner: React.FC<CustomerViewBannerProps> = ({ language, onExit }) => {
  const t = translations[language];

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-900 px-4 py-2 shadow-md flex items-center justify-between text-xs sm:text-sm font-semibold sticky top-[108px] z-20">
      <div className="flex items-center space-x-2">
        <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 flex-shrink-0 animate-bounce" />
        <span>{t.customerViewBanner}</span>
      </div>
      <button
        onClick={onExit}
        className="inline-flex items-center gap-1 bg-slate-950 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-slate-900 transition shadow cursor-pointer ml-2 flex-shrink-0"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{t.exitCustomerView}</span>
      </button>
    </div>
  );
};
