import React, { useState } from 'react';
import { 
  Home, 
  Package, 
  ShoppingBag, 
  Boxes, 
  Menu, 
  PlusCircle, 
  FileSpreadsheet, 
  BarChart3, 
  Database, 
  Settings, 
  Sparkles, 
  HelpCircle, 
  FileText,
  ShieldCheck,
  Smartphone,
  Download,
  X 
} from 'lucide-react';
import { Language, MoreSubView, UserRole, ViewTab } from '../types';
import { translations } from '../i18n/translations';

interface BottomNavProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  language: Language;
  userRole: UserRole;
  isWholesaleHidden?: boolean;
  onSelectMoreAction: (subView: MoreSubView) => void;
  onToggleRole: () => void;
  pendingRequestsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  language,
  userRole,
  isWholesaleHidden = false,
  onSelectMoreAction,
  onToggleRole,
  pendingRequestsCount = 0,
}) => {
  const t = translations[language];
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleMoreClick = () => {
    setIsMoreOpen(true);
  };

  const handleSubAction = (action: MoreSubView) => {
    setIsMoreOpen(false);
    onSelectMoreAction(action);
  };

  const showWholesaleInNav = userRole === 'owner' || !isWholesaleHidden;
  const navGridCols = userRole === 'owner' ? 'grid-cols-5' : showWholesaleInNav ? 'grid-cols-4' : 'grid-cols-3';

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className={`max-w-md mx-auto grid ${navGridCols} h-16`}>
          {/* 1. Home */}
          <button
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
              currentTab === 'home'
                ? 'text-blue-900 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${currentTab === 'home' ? 'bg-blue-100 text-blue-900' : ''}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[11px] leading-tight">{t.tabHome}</span>
          </button>

          {/* 2. Wholesale (Hidden for customers if isWholesaleHidden is true) */}
          {showWholesaleInNav && (
            <button
              onClick={() => onTabChange('wholesale')}
              className={`flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer relative ${
                currentTab === 'wholesale'
                  ? 'text-blue-900 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className={`p-1 rounded-xl transition relative ${currentTab === 'wholesale' ? 'bg-blue-100 text-blue-900' : ''}`}>
                <Boxes className="w-5 h-5" />
                {userRole === 'owner' && isWholesaleHidden && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white" title="Hidden from visitors" />
                )}
              </div>
              <span className="text-[11px] leading-tight flex items-center gap-0.5">
                <span>{t.tabWholesale}</span>
                {userRole === 'owner' && isWholesaleHidden && (
                  <span className="text-[9px] text-rose-600 font-bold">(লুকানো)</span>
                )}
              </span>
            </button>
          )}

          {/* 3. Retail */}
          <button
            onClick={() => onTabChange('retail')}
            className={`flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
              currentTab === 'retail'
                ? 'text-emerald-800 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${currentTab === 'retail' ? 'bg-emerald-100 text-emerald-800' : ''}`}>
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-[11px] leading-tight">{t.tabRetail}</span>
          </button>

          {/* 4. Products (ONLY visible in Owner Mode - completely hidden in Guest Mode) */}
          {userRole === 'owner' && (
            <button
              onClick={() => onTabChange('products')}
              className={`flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                currentTab === 'products'
                  ? 'text-blue-900 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className={`p-1 rounded-xl transition ${currentTab === 'products' ? 'bg-blue-100 text-blue-900' : ''}`}>
                <Package className="w-5 h-5" />
              </div>
              <span className="text-[11px] leading-tight">{t.tabProducts}</span>
            </button>
          )}

          {/* Last Tab: More (মেনু / আরও) */}
          <button
            onClick={handleMoreClick}
            className={`flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
              isMoreOpen
                ? 'text-blue-900 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${isMoreOpen ? 'bg-blue-100 text-blue-900' : ''}`}>
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[11px] leading-tight">{t.tabMore}</span>
          </button>
        </div>
      </nav>

      {/* More Options Drawer Modal (Accessible for additional tools) */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base tracking-wide">
                  {language === 'bn' ? 'আরও সুবিধাসমূহ ও সেটিংস' : 'Business Tools & Actions'}
                </h3>
                <p className="text-xs text-slate-400">NEW ASHIQUE ENTERPRISE</p>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items Grid */}
            <div className="p-4 grid grid-cols-2 gap-2.5 overflow-y-auto">
              {/* Owner Profit Desk (Exclusive to Owner Mode) */}
              {userRole === 'owner' && (
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    onTabChange('owner-desk');
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white transition text-left cursor-pointer shadow-md col-span-2"
                >
                  <div className="p-2.5 bg-blue-700/60 text-white rounded-xl border border-blue-400/30">
                    <ShieldCheck className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div>
                    <div className="font-black text-xs sm:text-sm">
                      {language === 'bn' ? 'মালিক হিসাব ও রেট ডেস্ক (Owner Profit Desk)' : 'Owner Profit Desk & Costing'}
                    </div>
                    <div className="text-[11px] text-cyan-200">
                      {language === 'bn' ? 'কেনা দাম বসানো, লাভ হিসাব ও স্টক অন/অফ' : 'Purchase cost, profit margin & stock visibility'}
                    </div>
                  </div>
                </button>
              )}

              {/* Download Full APK Directly (Available in BOTH Guest & Owner Modes) */}
              <a
                href="/NewAshiqueEnterprise.apk"
                download="NewAshiqueEnterprise.apk"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-md transition text-left cursor-pointer col-span-2"
              >
                <div className="p-2.5 bg-emerald-800/60 text-white rounded-xl border border-emerald-400/30">
                  <Download className="w-6 h-6 text-white animate-bounce" />
                </div>
                <div className="flex-1">
                  <div className="font-black text-xs sm:text-sm flex items-center justify-between">
                    <span>{language === 'bn' ? 'ডাইরেক্ট এপিকে ডাউনলোড (1-Click APK)' : 'Direct Download Full APK'}</span>
                    <span className="text-[10px] bg-white/20 font-bold px-2 py-0.5 rounded-full">2.9 MB • Full APK</span>
                  </div>
                  <div className="text-[11px] text-emerald-100">
                    {language === 'bn' ? 'এক ক্লিকেই সরাসরি সম্পূর্ণ এপিকে ফাইল ডাউনলোড ও ফোনে ইনস্টল' : 'Direct full Android APK file download & install'}
                  </div>
                </div>
              </a>

              {/* Wholesale Approvals (Owner Only) */}
              {userRole === 'owner' && (
                <button
                  onClick={() => handleSubAction('wholesale-approvals')}
                  className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/80 hover:bg-amber-100 text-amber-950 border border-amber-200 transition text-left cursor-pointer"
                >
                  <div className="p-2 bg-amber-600 text-white rounded-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      <span>{language === 'bn' ? 'হোলসেল অনুমোদন' : 'Wholesale Approvals'}</span>
                      {(pendingRequestsCount ?? 0) > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black">
                          {pendingRequestsCount}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {language === 'bn' ? 'অনুরোধ চেক ও এপ্রুভ' : 'Approve customer requests'}
                    </div>
                  </div>
                </button>
              )}

              {/* Add Product (if owner) */}
              {userRole === 'owner' && (
                <button
                  onClick={() => handleSubAction('add-product')}
                  className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100 text-blue-900 border border-blue-200/70 transition text-left cursor-pointer"
                >
                  <div className="p-2 bg-blue-600 text-white rounded-lg">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">{t.addProductBtn}</div>
                    <div className="text-[10px] text-slate-500">Create new item</div>
                  </div>
                </button>
              )}

              {/* Quotation Generator */}
              <button
                onClick={() => handleSubAction('quotations')}
                className="flex items-center gap-3 p-3 rounded-xl bg-purple-50/70 hover:bg-purple-100 text-purple-900 border border-purple-200/70 transition text-left cursor-pointer"
              >
                <div className="p-2 bg-purple-600 text-white rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm">{t.createQuotation}</div>
                  <div className="text-[10px] text-slate-500">Estimate & PDF</div>
                </div>
              </button>

              {/* Import / Export (owner) */}
              {userRole === 'owner' && (
                <button
                  onClick={() => handleSubAction('import-export')}
                  className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/70 transition text-left cursor-pointer"
                >
                  <div className="p-2 bg-emerald-600 text-white rounded-lg">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">{t.importExportBtn}</div>
                    <div className="text-[10px] text-slate-500">Excel / CSV data</div>
                  </div>
                </button>
              )}

              {/* Reports (owner) */}
              {userRole === 'owner' && (
                <button
                  onClick={() => handleSubAction('reports')}
                  className="flex items-center gap-3 p-3 rounded-xl bg-cyan-50/70 hover:bg-cyan-100 text-cyan-900 border border-cyan-200/70 transition text-left cursor-pointer"
                >
                  <div className="p-2 bg-cyan-600 text-white rounded-lg">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">Reports & Margin</div>
                    <div className="text-[10px] text-slate-500">Analytics & stock</div>
                  </div>
                </button>
              )}

              {/* Backup & Restore (owner) */}
              {userRole === 'owner' && (
                <button
                  onClick={() => handleSubAction('backup')}
                  className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/70 hover:bg-amber-100 text-amber-900 border border-amber-200/70 transition text-left cursor-pointer"
                >
                  <div className="p-2 bg-amber-600 text-white rounded-lg">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">Backup & Restore</div>
                    <div className="text-[10px] text-slate-500">Save data offline</div>
                  </div>
                </button>
              )}

              {/* Role Toggle */}
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  onToggleRole();
                }}
                className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/70 transition text-left cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-indigo-600 text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm">
                    {userRole === 'customer' ? 'মালিক মোড (Owner)' : 'সম্মানিত অতিথি (Guest)'}
                  </div>
                  <div className="text-[10px] text-slate-500">Switch display mode</div>
                </div>
              </button>

              {/* Settings (owner) */}
              {userRole === 'owner' && (
                <button
                  onClick={() => handleSubAction('settings')}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 text-slate-900 border border-slate-200 transition text-left cursor-pointer"
                >
                  <div className="p-2 bg-slate-700 text-white rounded-lg">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">{t.settingsTitle}</div>
                    <div className="text-[10px] text-slate-500">Shop info, Map</div>
                  </div>
                </button>
              )}

              {/* Help & Guide */}
              <button
                onClick={() => handleSubAction('help')}
                className="flex items-center gap-3 p-3 rounded-xl bg-teal-50/70 hover:bg-teal-100 text-teal-900 border border-teal-200/70 transition text-left cursor-pointer"
              >
                <div className="p-2 bg-teal-600 text-white rounded-lg">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm">{t.helpTitle}</div>
                  <div className="text-[10px] text-slate-500">User guide & FAQs</div>
                </div>
              </button>
            </div>

            {/* Bottom close button */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsMoreOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
