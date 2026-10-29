import React from 'react';
import { 
  Boxes, 
  ShoppingBag, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Bell, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  Trash2,
  Check
} from 'lucide-react';
import { BusinessSettings, Language, Product, UserRole, ViewTab } from '../types';
import { translations } from '../i18n/translations';
import { loadWholesaleRequests } from '../utils/storage';

interface HomeDashboardProps {
  products: Product[];
  settings: BusinessSettings;
  language: Language;
  userRole: UserRole;
  onNavigate: (tab: ViewTab) => void;
  onOpenAddProduct: () => void;
  onClearDemoData: () => void;
  isWholesaleApproved: boolean;
  isWholesaleHidden: boolean;
  onToggleWholesaleHidden: () => void;
  hasWholesaleRequest: boolean;
  onApproveWholesale: () => void;
  onRevokeWholesale: () => void;
  onOpenApprovalModal?: (customerName: string, customerPhone: string, requestId?: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  products,
  settings,
  language,
  userRole,
  onNavigate,
  onOpenAddProduct,
  onClearDemoData,
  isWholesaleApproved,
  isWholesaleHidden,
  onToggleWholesaleHidden,
  hasWholesaleRequest,
  onApproveWholesale,
  onRevokeWholesale,
  onOpenApprovalModal,
}) => {
  const t = translations[language];

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const lowStockProducts = products.filter((p) => (p.stockQuantity ?? 99) < 5).length;
  const hasDemoProducts = products.some((p) => p.isDemo);

  const pendingRequests = userRole === 'owner' ? loadWholesaleRequests().filter(r => r.status === 'pending') : [];
  const showPendingAlert = userRole === 'owner' && (hasWholesaleRequest || pendingRequests.length > 0) && !isWholesaleApproved;

  // Should the Wholesale card be visible on Dashboard?
  // If user is owner: always visible (with indicator if hidden)
  // If user is customer/guest: ONLY visible if NOT isWholesaleHidden
  const showWholesaleCard = userRole === 'owner' || !isWholesaleHidden;

  return (
    <div className="space-y-4 pb-20 max-w-5xl mx-auto px-3 sm:px-6 pt-3">
      {/* OWNER WHOLESALE APPROVAL LIVE NOTIFICATION (If visitor requested access) */}
      {showPendingAlert && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white p-3.5 rounded-2xl shadow-lg border border-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl flex-shrink-0 animate-bounce">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-xs sm:text-sm">
                🔔 New Distributor Access Request!
              </div>
              <div className="text-[11px] text-amber-100">
                {pendingRequests.length > 0
                  ? `${pendingRequests[0].customerName} (${pendingRequests[0].customerPhone}) requested access.`
                  : 'A visitor has requested permission to view distributor rates.'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => {
                if (pendingRequests.length > 0 && onOpenApprovalModal) {
                  onOpenApprovalModal(
                    pendingRequests[0].customerName,
                    pendingRequests[0].customerPhone,
                    pendingRequests[0].id
                  );
                } else {
                  onApproveWholesale();
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-black hover:bg-slate-100 shadow-md cursor-pointer transition flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Approve</span>
            </button>
          </div>
        </div>
      )}

      {/* OWNER WHOLESALE VISIBILITY / HIDE STATUS BANNER */}
      {userRole === 'owner' && (
        <div className={`p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border transition ${
          isWholesaleHidden
            ? 'bg-rose-50 border-rose-300 text-rose-950'
            : 'bg-emerald-50 border-emerald-300 text-emerald-950'
        }`}>
          <div className="flex items-center gap-2">
            {isWholesaleHidden ? (
              <>
                <div className="p-1.5 rounded-lg bg-rose-200 text-rose-800 flex-shrink-0">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-rose-900 block sm:inline">
                    Distributor section is currently HIDDEN
                  </span>
                  <span className="text-[11px] text-rose-700 sm:ml-1">
                    — Hidden from visitor dashboard.
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="p-1.5 rounded-lg bg-emerald-200 text-emerald-800 flex-shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-emerald-900 block sm:inline">
                    Distributor section is currently VISIBLE
                  </span>
                  <span className="text-[11px] text-emerald-700 sm:ml-1">
                    — Visible on visitor dashboard.
                  </span>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onToggleWholesaleHidden}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition self-start sm:self-auto ${
              isWholesaleHidden
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {isWholesaleHidden ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Unhide Distributor</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide Distributor</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* DASHBOARD CARDS */}
      <div className={`grid gap-2.5 sm:gap-4 ${showWholesaleCard ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* CARD 1: DISTRIBUTOR */}
        {showWholesaleCard && (
          <div 
            onClick={() => onNavigate('wholesale')}
            className={`group relative bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 border-2 cursor-pointer flex flex-col justify-between ${
              isWholesaleHidden ? 'border-dashed border-rose-300 bg-rose-50/20' : 'border-blue-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-md ${
                  isWholesaleHidden ? 'bg-slate-700 text-white' : 'bg-blue-900 text-white shadow-blue-900/20'
                }`}>
                  <Boxes className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Owner-only badge if Distributor is currently hidden */}
                {userRole === 'owner' && isWholesaleHidden && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-200 flex items-center gap-1">
                    <EyeOff className="w-3 h-3 text-rose-600" />
                    <span>Hidden</span>
                  </span>
                )}
              </div>

              <h3 className="text-sm sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                Distributor
              </h3>
              <p className="text-[10px] sm:text-xs font-semibold text-blue-700 mt-0.5 line-clamp-1">
                Distributor Rates & Catalog
              </p>

              <p className="hidden sm:block text-xs text-slate-500 mt-1.5 leading-relaxed">
                Special bulk trade rates and minimum order quantities for approved dealers.
              </p>
            </div>

            <div className="mt-3 pt-2">
              <div className="w-full py-2 sm:py-2.5 px-3 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all uppercase tracking-wider">
                <span>OPEN</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* CARD 2: WHOLESALE */}
        <div 
          onClick={() => onNavigate('retail')}
          className={`group relative bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 border-2 border-emerald-200 cursor-pointer flex flex-col justify-between ${
            !showWholesaleCard ? 'py-6 sm:py-8' : ''
          }`}
        >
          <div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-2.5 shadow-md shadow-emerald-900/20">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <h3 className="text-sm sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
              Wholesale
            </h3>
            <p className="text-[10px] sm:text-xs font-semibold text-emerald-700 mt-0.5 line-clamp-1">
              Wholesale Price Catalog
            </p>

            <p className={`${!showWholesaleCard ? 'block' : 'hidden sm:block'} text-xs text-slate-500 mt-1.5 leading-relaxed`}>
              Open catalog with wholesale rates for all RO purifiers and spare parts.
            </p>
          </div>

          <div className="mt-3 pt-2">
            <div className="w-full py-2 sm:py-2.5 px-3 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all uppercase tracking-wider">
              <span>OPEN</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* QUICK INVENTORY SUMMARY STATS (Compact Row) */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
          <div>
            <span className="text-[10px] sm:text-xs text-slate-500 font-semibold block">
              Total Items
            </span>
            <span className="text-base sm:text-xl font-black text-slate-900">
              {totalProducts}
            </span>
          </div>

          <div>
            <span className="text-[10px] sm:text-xs text-slate-500 font-semibold block">
              Active Items
            </span>
            <span className="text-base sm:text-xl font-black text-emerald-700">
              {activeProducts}
            </span>
          </div>

          <div>
            <span className="text-[10px] sm:text-xs text-slate-500 font-semibold block">
              Low Stock (&lt;5)
            </span>
            <span className="text-base sm:text-xl font-black text-amber-700">
              {lowStockProducts}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
