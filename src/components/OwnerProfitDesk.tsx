import React, { useState } from 'react';
import { 
  Calculator, 
  Search, 
  Percent, 
  X, 
  ShieldCheck, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { BusinessSettings, Language, Product } from '../types';
import { calculateProfit, formatINRNumber } from '../utils/storage';

interface OwnerProfitDeskProps {
  products: Product[];
  settings: BusinessSettings;
  language: Language;
  onUpdateProductPrices: (
    productId: string,
    purchasePrice: number,
    retailPrice: number
  ) => void;
  onToggleActive?: (productId: string) => void;
}

export const OwnerProfitDesk: React.FC<OwnerProfitDeskProps> = ({
  products,
  settings,
  language,
  onUpdateProductPrices,
  onToggleActive,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handlePriceChange = (
    productId: string,
    field: 'purchasePrice' | 'retailPrice',
    rawVal: string
  ) => {
    const val = parseFloat(rawVal) || 0;
    const currentProd = products.find((p) => p.id === productId);
    if (!currentProd) return;

    if (field === 'purchasePrice') {
      onUpdateProductPrices(productId, val, currentProd.retailPrice);
    } else {
      onUpdateProductPrices(productId, currentProd.purchasePrice, val);
    }
  };

  // Summary statistics
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

  return (
    <div className="space-y-4 pb-28 max-w-4xl mx-auto px-3 sm:px-6 pt-3">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'মালিকের লাভ-ক্ষতি হিসাব' : 'Owner Profit & Margin Desk'}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {language === 'bn' ? 'প্রোডাক্ট লাভ ও মার্জিন স্টেটমেন্ট' : 'PROFIT & LOSS STATEMENT'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'bn' 
                ? 'এক পেজের মধ্যে কেনা দাম, বিক্রয় মূল্য, মোট লাভ এবং লাভের হার (%)।' 
                : 'Compact single-page statement: Purchase Cost, Retail Price, Profit Amount & Margin %.'}
            </p>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 self-start sm:self-auto">
            <Percent className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>
              {language === 'bn' ? 'গড় মার্জিন:' : 'Avg Margin:'}{' '}
              <strong className="font-black text-sm">{avgMargin}%</strong>
            </span>
          </div>
        </div>

        {/* Clean Search */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'প্রোডাক্টের নাম দিয়ে খুঁজুন...' : 'Search product name...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Showing count indicator */}
      <div className="text-xs text-slate-500 px-1">
        {language === 'bn' ? 'মোট প্রোডাক্ট:' : 'Showing Items:'}{' '}
        <strong className="text-slate-800">{filteredProducts.length}</strong>
      </div>

      {/* Compact Vertical Profit & Loss Card List (Zero Horizontal Scrolling) */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200">
          <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="font-bold">{language === 'bn' ? 'কোনো প্রোডাক্ট পাওয়া যায়নি।' : 'No products found.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product, idx) => {
            const { profitAmount, profitMarginPct } = calculateProfit(
              product.purchasePrice,
              product.retailPrice
            );
            const isLoss = profitAmount < 0;
            const isZero = profitAmount === 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200 hover:border-blue-300 transition"
              >
                {/* 1. Product Name */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-[11px] font-bold text-slate-400 block mb-0.5">#{idx + 1}</span>
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                      {product.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {language === 'bn' ? 'একক:' : 'Unit:'} {product.unit}
                    </span>
                  </div>

                  {/* Stock status toggle */}
                  {onToggleActive && (
                    <button
                      onClick={() => onToggleActive(product.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                        product.isActive
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-50 text-rose-700 border border-rose-300'
                      }`}
                      title={product.isActive ? 'স্টকে আছে' : 'স্টক নাই'}
                    >
                      {product.isActive ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{language === 'bn' ? 'স্টকে আছে' : 'In Stock'}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>{language === 'bn' ? 'হাইড' : 'Hidden'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Divider Line */}
                <div className="border-t border-slate-100 my-3"></div>

                {/* 2, 3, 4, 5: The 4 Core Numbers (Purchase, Retail, Profit, Margin %) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  {/* Purchase Cost */}
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      {language === 'bn' ? 'ক্রয় মূল্য (কেনা)' : 'Purchase Cost'}
                    </span>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={product.purchasePrice}
                        onChange={(e) => handlePriceChange(product.id, 'purchasePrice', e.target.value)}
                        className="w-full pl-5 pr-1 py-1 rounded-lg border border-slate-300 bg-white font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Retail Price */}
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      {language === 'bn' ? 'বিক্রয় মূল্য (খুচরো)' : 'Retail Price'}
                    </span>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={product.retailPrice}
                        onChange={(e) => handlePriceChange(product.id, 'retailPrice', e.target.value)}
                        className="w-full pl-5 pr-1 py-1 rounded-lg border border-slate-300 bg-white font-mono font-bold text-xs text-emerald-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Net Profit */}
                  <div className={`p-2.5 rounded-2xl border ${
                    isLoss ? 'bg-red-50 border-red-200' : isZero ? 'bg-slate-50 border-slate-200' : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      {language === 'bn' ? 'মোট লাভ' : 'Profit Amount'}
                    </span>
                    <div className={`text-sm sm:text-base font-black font-mono mt-1 ${
                      isLoss ? 'text-red-700' : isZero ? 'text-slate-600' : 'text-emerald-800'
                    }`}>
                      ₹{formatINRNumber(profitAmount, 2)}
                    </div>
                  </div>

                  {/* Margin % */}
                  <div className={`p-2.5 rounded-2xl border ${
                    isLoss ? 'bg-red-50 border-red-200' : isZero ? 'bg-slate-50 border-slate-200' : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      {language === 'bn' ? 'লাভের হার' : 'Profit Margin'}
                    </span>
                    <div className={`text-sm sm:text-base font-black font-mono mt-1 ${
                      isLoss ? 'text-red-700' : isZero ? 'text-slate-600' : 'text-emerald-800'
                    }`}>
                      {profitMarginPct}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
