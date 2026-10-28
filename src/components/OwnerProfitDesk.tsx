import React, { useState } from 'react';
import { 
  Calculator, 
  Search, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  X, 
  Check, 
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  XCircle
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
    <div className="space-y-4 pb-24 max-w-5xl mx-auto px-3 sm:px-6 pt-3">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'মালিকের নিজস্ব ডায়েরি' : 'Owner Secret Margin Desk'}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {language === 'bn' ? 'মালিক হিসাব: কেনা দাম ও লাভ' : 'OWNER PROFIT & COST DESK'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'bn' 
                ? 'এখানে কেনা দাম বসিয়ে সরাসরি মোট লাভ (টাকা) ও মার্জিন (%) হিসাব করুন।' 
                : 'Private internal purchase costs, retail rates, and instant profit calculations.'}
            </p>
          </div>

          <div className="px-3 py-2 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <Percent className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>
              {language === 'bn' ? 'গড় প্রফিট মার্জিন:' : 'Average Margin:'}{' '}
              <strong className="font-black text-sm">{avgMargin}%</strong>
            </span>
          </div>
        </div>

        {/* Search */}
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

      {/* Owner Cost & Margin Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold">{language === 'bn' ? 'কোনো প্রোডাক্ট পাওয়া যায়নি।' : 'No products found.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[680px]">
              <thead>
                <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold w-12 text-center">#</th>
                  <th className="py-3.5 px-4 font-semibold">
                    {language === 'bn' ? 'প্রোডাক্টের নাম' : 'Product Name'}
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-right w-36">
                    {language === 'bn' ? 'কেনা দাম (ক্রয় ₹)' : 'Purchase Cost (₹)'}
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-right w-36">
                    {language === 'bn' ? 'বিক্রয় দর (খুচরো ₹)' : 'Retail Price (₹)'}
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-right w-36">
                    {language === 'bn' ? 'মোট লাভ (টাকা ₹)' : 'Total Profit (₹)'}
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-right w-32">
                    {language === 'bn' ? 'লাভের হার (%)' : 'Margin (%)'}
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-center min-w-[130px]">
                    {language === 'bn' ? 'স্টক স্ট্যাটাস' : 'Stock Status'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product, idx) => {
                  const { profitAmount, profitMarginPct } = calculateProfit(
                    product.purchasePrice,
                    product.retailPrice
                  );
                  const isLoss = profitAmount < 0;
                  const isZero = profitAmount === 0;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 text-center font-bold text-slate-400 text-xs">
                        {idx + 1}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {product.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {language === 'bn' ? 'একক:' : 'Unit:'} {product.unit}
                        </div>
                      </td>

                      {/* Purchase Cost Input (Editable by Owner) */}
                      <td className="py-3 px-4 text-right">
                        <div className="relative inline-block w-28">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={product.purchasePrice}
                            onChange={(e) =>
                              handlePriceChange(product.id, 'purchasePrice', e.target.value)
                            }
                            className="w-full pl-6 pr-2 py-1.5 text-right font-black text-slate-800 bg-amber-50/70 hover:bg-white focus:bg-white border border-amber-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            placeholder="0"
                          />
                        </div>
                      </td>

                      {/* Retail Price Input (Editable by Owner) */}
                      <td className="py-3 px-4 text-right">
                        <div className="relative inline-block w-28">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={product.retailPrice}
                            onChange={(e) =>
                              handlePriceChange(product.id, 'retailPrice', e.target.value)
                            }
                            className="w-full pl-6 pr-2 py-1.5 text-right font-black text-emerald-900 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            placeholder="0"
                          />
                        </div>
                      </td>

                      {/* Total Profit in Rupees */}
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-black ${
                            isLoss
                              ? 'bg-red-100 text-red-700'
                              : isZero
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          ₹{formatINRNumber(profitAmount, 2)}
                        </span>
                      </td>

                      {/* Margin % */}
                      <td className="py-3 px-4 text-right">
                        <div
                          className={`text-xs font-black ${
                            isLoss
                              ? 'text-red-600'
                              : isZero
                              ? 'text-slate-500'
                              : 'text-emerald-800'
                          }`}
                        >
                          {profitMarginPct}%
                        </div>
                      </td>

                      {/* Stock Visibility Toggle */}
                      <td className="py-3 px-4 text-center">
                        {onToggleActive && (
                          <button
                            onClick={() => onToggleActive(product.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shadow-xs ${
                              product.isActive
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
                            }`}
                            title={
                              product.isActive
                                ? 'ক্লিক করলে হোলসেল ও রিটেল উভয় লিস্ট থেকে হাইড হবে'
                                : 'ক্লিক করলে হোলসেল ও রিটেল উভয় লিস্টে লাইভ হবে'
                            }
                          >
                            {product.isActive ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>{language === 'bn' ? '✓ আছে (Show)' : '✓ Live'}</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>{language === 'bn' ? '✕ নাই (Hide)' : '✕ Hidden'}</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
