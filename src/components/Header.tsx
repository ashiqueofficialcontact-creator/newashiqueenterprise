import React, { useState } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Copy, 
  Share2, 
  MapPin, 
  Droplet, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  ExternalLink,
  PlusCircle,
  Smartphone,
  Download
} from 'lucide-react';
import { BusinessSettings, Language, UserRole } from '../types';
import { translations } from '../i18n/translations';

interface HeaderProps {
  settings: BusinessSettings;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  userRole: UserRole;
  onToggleRole: () => void;
  onOpenSettings: () => void;
  onOpenAddProduct?: () => void;
  onOpenApkModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  language,
  onLanguageChange,
  userRole,
  onToggleRole,
  onOpenSettings,
  onOpenAddProduct,
  onOpenApkModal,
}) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(settings.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: settings.businessName,
          text: `${settings.businessName} - ${settings.subtitle}\nWholesale & Retail RO Plants & Accessories.\nCall/WhatsApp: ${settings.phone}\n${settings.address}`,
          url: window.location.href,
        });
      } catch (e) {
        // user cancelled or failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openWhatsApp = () => {
    const cleanPhone = settings.whatsapp.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const text = encodeURIComponent(`Hello ${settings.businessName}, I would like to inquire about RO Plants & spare parts.`);
    window.open(`https://wa.me/${phoneWithCode}?text=${text}`, '_blank');
  };

  const openAddress = () => {
    if (settings.googleMapsUrl) {
      window.open(settings.googleMapsUrl, '_blank');
    } else {
      const query = encodeURIComponent(`${settings.businessName}, ${settings.address}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-lg sticky top-0 z-30">
      {/* Top utility row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 border-b border-blue-900/60 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Droplet className="w-3 h-3 mr-1 text-cyan-400 animate-pulse" />
            ISO Quality Spares & RO Plants
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-300">Baliadanga, Kaliachak, Malda</span>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* Direct 1-Click APK Download Button */}
          <a
            href="/NewAshiqueEnterprise.apk"
            download="NewAshiqueEnterprise.apk"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer animate-in fade-in"
            title="Direct 1-Click APK Download"
          >
            <Download className="w-3.5 h-3.5 text-white animate-bounce" />
            <span>{language === 'bn' ? 'এপিকে ডাউনলোড' : 'Download APK'}</span>
          </a>

          {/* Add Product Button (ONLY in Owner Mode in the top corner) */}
          {userRole === 'owner' && onOpenAddProduct && (
            <button
              onClick={onOpenAddProduct}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs cursor-pointer animate-in fade-in"
              title="Add New Product (Owner Only)"
            >
              <PlusCircle className="w-3.5 h-3.5 text-cyan-200" />
              <span>{language === 'bn' ? '+ প্রোডাক্ট' : '+ Add'}</span>
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => onLanguageChange(language === 'en' ? 'bn' : 'en')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-blue-900/60 hover:bg-blue-800 text-slate-200 border border-blue-700/50 transition font-medium cursor-pointer"
            title="Switch Language / ভাষা পরিবর্তন করুন"
          >
            <span className={language === 'en' ? 'text-cyan-300 font-bold' : 'text-slate-400'}>EN</span>
            <span className="text-slate-500">|</span>
            <span className={language === 'bn' ? 'text-cyan-300 font-bold font-bengali' : 'text-slate-400'}>বাংলা</span>
          </button>

          {/* Role Mode Toggle: Polite label for customer ("সম্মানিত অতিথি" / "Guest View") */}
          <button
            onClick={onToggleRole}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer border ${
              userRole === 'owner'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50 hover:bg-emerald-900'
                : 'bg-indigo-950/80 text-cyan-200 border-indigo-600/50 hover:bg-indigo-900'
            }`}
            title="Toggle View Mode"
          >
            {userRole === 'owner' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'bn' ? 'ওনার মোড' : 'Owner'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === 'bn' ? 'সম্মানিত অতিথি' : 'Guest View'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Brand & Actions Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Business Info & Water Drop Logo */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/40 p-2 flex-shrink-0 border border-cyan-400/30">
              <div className="relative flex items-center justify-center">
                <Droplet className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white/80" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-blue-900"></span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white uppercase">
                  {settings.businessName}
                </h1>
              </div>
              <p className="text-xs sm:text-sm font-semibold tracking-wide text-cyan-400">
                {settings.subtitle}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" />
                <span>{settings.address}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons for Shop */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 md:pt-0">
            {/* Call button */}
            <a
              href={`tel:${settings.phone}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{t.callShop}</span>
            </a>

            {/* WhatsApp button */}
            <button
              onClick={openWhatsApp}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold text-xs transition shadow-sm cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t.whatsappShop}</span>
            </button>

            {/* Copy phone */}
            <button
              onClick={handleCopyNumber}
              className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Copy Shop Mobile Number"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Share app */}
            <button
              onClick={handleShareApp}
              className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Share Shop Details"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* View Map / Address */}
            <button
              onClick={openAddress}
              className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="View on Google Maps"
            >
              <ExternalLink className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
