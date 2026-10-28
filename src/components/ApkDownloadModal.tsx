import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  CheckCircle, 
  X, 
  Sparkles, 
  ArrowRight, 
  Share2, 
  HelpCircle, 
  ExternalLink,
  Copy,
  Check,
  Globe,
  AlertTriangle,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { BusinessSettings, Language } from '../types';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BusinessSettings;
  language: Language;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({
  isOpen,
  onClose,
  settings,
  language,
}) => {
  const [canPromptPwa, setCanPromptPwa] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'success' | 'instructions'>('idle');
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    // Detect if already running in standalone / installed mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(standalone);

    // Detect if running inside WhatsApp, Facebook or other In-App WebView
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    const isInsideInApp = /FBAN|FBAV|Instagram|WhatsApp|Line|Messenger/i.test(ua);
    setIsInAppBrowser(isInsideInApp);

    // Check deferred PWA prompt
    if ((window as any).deferredPrompt) {
      setCanPromptPwa(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setCanPromptPwa(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!isOpen) return null;

  // Open directly in Android Chrome if opened inside WhatsApp or Facebook webview
  const handleOpenInChrome = () => {
    const currentHost = window.location.host;
    const currentPath = window.location.pathname;
    const chromeIntent = `intent://${currentHost}${currentPath}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = chromeIntent;
  };

  // 1-Click Native Android WebAPK Install trigger
  const handleNativeInstall = async () => {
    setInstallStatus('installing');
    const promptEvent = (window as any).deferredPrompt;
    
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult.outcome === 'accepted') {
          (window as any).deferredPrompt = null;
          setCanPromptPwa(false);
          setIsInstalled(true);
          setInstallStatus('success');
        } else {
          setInstallStatus('instructions');
        }
      } catch (e) {
        console.error('Install error:', e);
        setInstallStatus('instructions');
      }
    } else {
      setInstallStatus('instructions');
    }
  };

  // Copy app link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Share via WhatsApp
  const handleShareApp = () => {
    const text = encodeURIComponent(
      `*${settings.businessName}*\nRO Water Plant & Accessories Mobile App.\nInstall directly on your Android phone without errors:\n${window.location.origin}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header with App Logo & Branding */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center p-2 shadow-lg shadow-cyan-900/50 border border-cyan-400/30 flex-shrink-0">
              <Smartphone className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Android 14, 15, 16 Compatible</span>
              </div>
              <h3 className="font-extrabold text-sm sm:text-base mt-0.5">
                {language === 'bn' ? 'অ্যান্ড্রয়েড ফোন অ্যাপ ইনস্টল' : 'Android App Installation'}
              </h3>
              <p className="text-[11px] text-slate-300">{settings.businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Already installed banner */}
          {isInstalled && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <strong className="block font-bold">
                  {language === 'bn' ? '✓ অ্যাপটি আপনার ফোনে ইনস্টল রয়েছে!' : '✓ App is already installed!'}
                </strong>
                <span>
                  {language === 'bn'
                    ? 'আপনার ফোনের হোম স্ক্রিন ও অ্যাপ ড্রয়ারে NEW ASHIQUE ENTERPRISE আইকনটি পেয়ে যাবেন।'
                    : 'The app is running in official standalone mode and works offline.'}
                </span>
              </div>
            </div>
          )}

          {/* In-App Browser Warning (WhatsApp / Facebook) */}
          {isInAppBrowser && (
            <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs text-amber-950 space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">
                    {language === 'bn' ? 'হোয়াটসঅ্যাপ ব্রাউজারে খোলা হয়েছে' : 'Opened inside WhatsApp'}
                  </strong>
                  <span className="text-[11px] text-slate-600">
                    {language === 'bn'
                      ? 'হোয়াটসঅ্যাপের ভেতর থেকে ডাইরেক্ট এপিকে ইনস্টল ব্লক থাকে। নিচে চাপলে সরাসরি গুগল ক্রোমে খুলে যাবে।'
                      : 'WhatsApp browser blocks direct APK installs. Tap below to switch to Chrome.'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleOpenInChrome}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{language === 'bn' ? 'গুগল ক্রোম (Chrome)-এ খুলুন' : 'Open in Google Chrome'}</span>
              </button>
            </div>
          )}

          {/* Primary Action Button: 1-Click Direct APK Download */}
          <div className="space-y-2">
            <a
              href="/NewAshiqueEnterprise.apk"
              download="NewAshiqueEnterprise.apk"
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-[0.99] text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-700/25 transition cursor-pointer flex items-center justify-center gap-2.5 text-center"
            >
              <Download className="w-5 h-5 animate-bounce flex-shrink-0" />
              <span>
                {language === 'bn'
                  ? '১-ক্লিকে সরাসরি এপিকে ফাইল ডাউনলোড (Download APK)'
                  : '1-Click Direct Download APK'}
              </span>
            </a>
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>
                {language === 'bn'
                  ? 'সাইজ: ২.৯ MB • কোনো ব্রাউজারে না গিয়ে সরাসরি মোবাইলে এপিকে ফাইলটি সেভ হবে।'
                  : 'Size: 2.9 MB • Direct APK download without browser redirection.'}
              </span>
            </div>
          </div>

          {/* Android 14, 15, 16 3-Step Guide */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-700" />
              <span>
                {language === 'bn'
                  ? 'অ্যান্ড্রয়েড ফোনে ৩টি সহজ ধাপে ইনস্টল:'
                  : 'Easy 3 Steps to Install on Android:'}
              </span>
            </h4>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-black flex items-center justify-center flex-shrink-0 text-xs">
                  ১
                </span>
                <p className="leading-snug">
                  {language === 'bn' ? (
                    <>
                      আপনার ক্রোম (Chrome) ব্রাউজারের উপরে ডান কোণায় থাকা <strong>৩টি ডট মেনু (⋮)</strong>-তে চাপুন।
                    </>
                  ) : (
                    <>
                      Tap the <strong>3 dots (⋮)</strong> menu at the top-right corner of Chrome.
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 font-black flex items-center justify-center flex-shrink-0 text-xs">
                  ২
                </span>
                <p className="leading-snug">
                  {language === 'bn' ? (
                    <>
                      মেনু থেকে <strong>"Install app" (অ্যাপ ইনস্টল করুন)</strong> অথবা <strong>"Add to Home screen" (হোম স্ক্রিনে যোগ করুন)</strong> চাপুন।
                    </>
                  ) : (
                    <>
                      Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-900 font-black flex items-center justify-center flex-shrink-0 text-xs">
                  ৩
                </span>
                <p className="leading-snug">
                  {language === 'bn' ? (
                    <>
                      পপ-আপে <strong>"Install"</strong> চাপুন। সঙ্গে সঙ্গে কোনো ত্রুটি ছাড়া ফোনের হোম স্ক্রিনে ও অ্যাপ ড্রয়ারে <strong>NEW ASHIQUE ENTERPRISE</strong> তৈরি হয়ে যাবে!
                    </>
                  ) : (
                    <>
                      Tap <strong>"Install"</strong>. The app will be installed on your phone home screen and app launcher!
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions: Share / Copy */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">{language === 'bn' ? 'কপি হয়েছে!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>{language === 'bn' ? 'অ্যাপ লিংক কপি' : 'Copy App Link'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareApp}
              className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Share2 className="w-4 h-4" />
              <span>{language === 'bn' ? 'হোয়াটসঅ্যাপ শেয়ার' : 'WhatsApp Share'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
          >
            {language === 'bn' ? 'বন্ধ করুন (Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
