import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  DollarSign, 
  Boxes, 
  PieChart, 
  CheckCircle2, 
  Percent, 
  Lock 
} from 'lucide-react';
import { BusinessSettings, Language, Product, UserRole } from '../types';
import { translations } from '../i18n/translations';
import { formatINRNumber } from '../utils/storage';

interface ReportsViewProps {
  products: Product[];
  settings: BusinessSettings;
  language: Language;
  userRole: UserRole;
  onPromptUnlockOwner: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  products,
  settings,
  language,
  userRole,
  onPromptUnlockOwner,
}) => {
  const t = translations[language];

  if (userRole === 'customer') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">
          {language === 'bn' ? 'মালিক মোড প্রয়োজন' : 'Owner Access Required'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {language === 'bn' 
            ? 'আর্থিক রিপোর্ট ও প্রফিট অ্যানালিটিক্স শুধুমাত্র দোকানের মালিকের জন্য সংরক্ষিত।'
            : 'Financial and inventory analytics are restricted to Owner Mode.'}
        </p>
        <button
          onClick={onPromptUnlockOwner}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition cursor-pointer"
        >
          <Lock className="w-4 h-4 text-amber-400" />
          <span>{t.switchMode}</span>
        </button>
      </div>
    );
  }

  // Calculations
  const totalProducts = products.length;
  const activeCount = products.filter((p) => p.isActive).length;
  const missingPrices = products.filter(
    (p) => p.purchasePrice <= 0 || p.retailPrice <= 0
  );

  // Valuation based on stock if available, else 1 unit
  const totalInventoryCost = products.reduce((sum, p) => {
    const qty = p.stockQuantity ?? 1;
    return sum + p.purchasePrice * qty;
  }, 0);

  const totalRetailPotential = products.reduce((sum, p) => {
    const qty = p.stockQuantity ?? 1;
    return sum + p.retailPrice * qty;
  }, 0);

  // Average Margin %
  const validProducts = products.filter((p) => p.retailPrice > 0);
  const avgMargin =
    validProducts.length > 0
      ? Number(
          (
            validProducts.reduce((sum, p) => sum + p.profitMarginPct, 0) /
            validProducts.length
          ).toFixed(1)
        )
      : 0;

  // Highest and lowest margin products
  const sortedByMargin = [...validProducts].sort(
    (a, b) => b.profitMarginPct - a.profitMarginPct
  );
  const topProfitProducts = sortedByMargin.slice(0, 5);
  const lowestProfitProducts = sortedByMargin.slice(-5).reverse();

  // Category counts
  const categoryCounts: Record<string, number> = {};
  products.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto px-3 sm:px-6 pt-3">
      {/* Title */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-900 text-xs font-bold mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Business Intelligence</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
          {t.reportsTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t.reportsSubtitle} • {settings.businessName}
        </p>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost Valuation */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>{t.repTotalInventoryValue}</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{formatINRNumber(totalInventoryCost, 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Calculated across current stocked units
          </p>
        </div>

        {/* Potential Retail Value */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>{t.repTotalRetailValue}</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-800">
            ₹{formatINRNumber(totalRetailPotential, 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Full retail turnover potential
          </p>
        </div>

        {/* Average Profit Margin */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>{t.repAvgMargin}</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-purple-900">
            {avgMargin}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Across {validProducts.length} priced items
          </p>
        </div>

        {/* Missing Prices Alert */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>{t.repProductsMissingPrices}</span>
            <span className={`p-2 rounded-xl ${missingPrices.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {missingPrices.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {missingPrices.length === 0 ? 'All products priced properly' : 'Requires price review'}
          </p>
        </div>
      </div>

      {/* Highest & Lowest Margins */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Top 5 High Margin */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>{t.repHighestMargin}</span>
          </h3>

          <div className="space-y-2.5">
            {topProfitProducts.map((p, idx) => (
              <div
                key={p.id}
                className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{idx + 1}. {p.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Cost: ₹{p.purchasePrice} → Sell: ₹{p.retailPrice}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-800">
                    {p.profitMarginPct}%
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold">
                    +₹{p.profitAmount} profit
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Lowest Margin */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-amber-600" />
            <span>{t.repLowestMargin}</span>
          </h3>

          <div className="space-y-2.5">
            {lowestProfitProducts.map((p, idx) => (
              <div
                key={p.id}
                className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{idx + 1}. {p.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Cost: ₹{p.purchasePrice} → Sell: ₹{p.retailPrice}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-amber-800">
                    {p.profitMarginPct}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold">
                    +₹{p.profitAmount} profit
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Distribution Breakdown */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200">
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2 mb-4">
          <Boxes className="w-5 h-5 text-blue-700" />
          <span>{t.repCategoryBreakdown}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
          {Object.entries(categoryCounts).map(([cat, count]) => {
            const pct = Math.round((count / totalProducts) * 100);
            return (
              <div
                key={cat}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between"
              >
                <div className="font-bold text-slate-800 truncate" title={cat}>
                  {cat}
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-lg font-black text-blue-900">{count} items</span>
                  <span className="text-slate-400 font-semibold">{pct}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
