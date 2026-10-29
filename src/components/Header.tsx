import React, { useState } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Copy, 
  Share2, 
  MapPin, 
  Droplet, 
  ShieldCheck, 
  Lock,
  Check, 
  PlusCircle
} from 'lucide-react';
import { BusinessSettings, Language, UserRole } from '../types';

interface HeaderProps {
  settings: BusinessSettings;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  userRole: UserRole;
  onToggleRole: () => void;
  onOpenSettings: () => void;
  onOpenAddProduct?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  language,
  userRole,
  onToggleRole,
  onOpenAddProduct,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(settings.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareShop = async () => {
    const shareText = 
      `💧 *${settings.businessName}*\n` +
      `ISO Quality RO Water Purifier & Commercial Plants\n` +
      `📍 ${settings.address}\n` +
      `📞 যোগাযোগ / WhatsApp: ${settings.phone}\n` +
      `ডিস্ট্রিবিউটর ও হোলসেল RO স্পেয়ার পার্টস সুলভ মূল্যে পাওয়া যায়।`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: settings.businessName,
          text: shareText,
          url: window.location.href,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (e) {
        navigator.clipboard.writeText(shareText);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  const openWhatsApp = () => {
    const cleanPhone = settings.whatsapp.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const text = encodeURIComponent(`Hello ${settings.businessName}, I would like to inquire about RO Purifier Plants & spare parts.`);
    window.open(`https://wa.me/${phoneWithCode}?text=${text}`, '_blank');
  };

  const openShopLocation = () => {
    if (settings.googleMapsUrl) {
      window.open(settings.googleMapsUrl, '_blank');
    } else {
      const query = encodeURIComponent(`New Ashique Enterprise Baliadanga Eid Gaha Market Kaliachak Malda`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  return (
    <header className="bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white shadow-xl sticky top-0 z-30 border-b border-blue-900/60">
      <div className="max-w-4xl mx-auto px-4 py-3.5 space-y-2.5">
        {/* Line 1: Business Brand Title + Single Unified Mode Switcher at Top-Right */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg p-2 flex-shrink-0 border border-cyan-400/50 shadow-cyan-500/20">
              <Droplet className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="min-w-0">
              <h1 className="title-3d-text text-sm sm:text-lg font-black tracking-wider uppercase leading-tight">
                {settings.businessName}
              </h1>
            </div>
          </div>

          {/* Top-Right Single Unified Mode Switcher Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {userRole === 'owner' && onOpenAddProduct && (
              <button
                onClick={onOpenAddProduct}
                className="inline-flex items-center gap-1.5 py-2 px-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md cursor-pointer"
                title="Add New Product"
              >
                <PlusCircle className="w-4 h-4 text-cyan-200" />
                <span className="hidden sm:inline">+ Product</span>
              </button>
            )}

            {/* The ONE and ONLY Mode Switcher Button */}
            <button
              onClick={onToggleRole}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-lg border ${
                userRole === 'owner'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white border-emerald-400 ring-2 ring-emerald-500/30'
                  : 'bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-cyan-200 border-cyan-400/50'
              }`}
              title={userRole === 'owner' ? 'Click to switch to Guest View' : 'Click to unlock Owner Mode'}
            >
              {userRole === 'owner' ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span>Owner Mode</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-cyan-300" />
                  <span>Guest View</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Line 2: Tagline */}
        <div>
          <p className="text-xs sm:text-sm font-semibold text-cyan-300 tracking-wide font-sans">
            ISO Quality RO Spare Parts & Commercial Plants
          </p>
        </div>

        {/* Line 3: Full Shop Address */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
          <span className="leading-snug">{settings.address}</span>
        </div>

        {/* Shop Contact & Action Buttons: ONLY VISIBLE IN GUEST MODE (Hidden in Owner Mode) */}
        {userRole === 'customer' && (
          <div className="pt-2 space-y-2 animate-in fade-in duration-200">
            {/* Row 1: Full-width Call Shop */}
            <a
              href={`tel:${settings.phone}`}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40 transition cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Call: {settings.phone}</span>
            </a>

            {/* Row 2: WhatsApp + Copy Phone */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* WhatsApp */}
              <button
                onClick={openWhatsApp}
                className="py-2.5 px-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold flex items-center justify-center gap-2 shadow-md shadow-green-950/30 transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span>WhatsApp</span>
              </button>

              {/* Copy Phone */}
              <button
                onClick={handleCopyNumber}
                className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold flex items-center justify-center gap-2 shadow-md shadow-amber-950/30 transition cursor-pointer"
                title="Copy Mobile Number"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-white flex-shrink-0" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-200 flex-shrink-0" />
                    <span>Copy Phone</span>
                  </>
                )}
              </button>
            </div>

            {/* Row 3: Share Shop Info + Shop Location */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Share Shop Info */}
              <button
                onClick={handleShareShop}
                className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 text-white font-extrabold flex items-center justify-center gap-2 shadow-md shadow-purple-950/30 transition cursor-pointer"
                title="Share Shop Info"
              >
                {shareSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                    <span>Shared!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-purple-200 flex-shrink-0" />
                    <span>Share Shop</span>
                  </>
                )}
              </button>

              {/* Shop Location (Google Maps) */}
              <button
                onClick={openShopLocation}
                className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700 text-white font-extrabold flex items-center justify-center gap-2 shadow-md shadow-rose-950/30 transition cursor-pointer"
                title="Open Shop on Google Maps"
              >
                <MapPin className="w-4 h-4 text-rose-200 flex-shrink-0" />
                <span>Shop Location</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
