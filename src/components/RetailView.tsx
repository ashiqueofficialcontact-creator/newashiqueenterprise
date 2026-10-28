import React, { useState, useMemo } from 'react';
import { ShoppingBag, Search, X, Tag } from 'lucide-react';
import { BusinessSettings, Language, Product } from '../types';
import { formatINRNumber } from '../utils/storage';

interface RetailViewProps {
  products: Product[];
  settings: BusinessSettings;
  language: Language;
}

export const RetailView: React.FC<RetailViewProps> = ({
  products,
  settings,
  language,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Active products only
  const displayableProducts = useMemo(() => {
    return products.filter((p) => p.isActive);
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return displayableProducts;
    return displayableProducts.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [displayableProducts, searchQuery]);

  return (
    <div className="space-y-4 pb-24 max-w-5xl mx-auto px-3 sm:px-6 pt-3">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'খুচরো বিক্রয় তালিকা' : 'Retail Price Catalog'}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {language === 'bn' ? 'রিটেইল প্রাইজ লিস্ট' : 'RETAIL PRICE LIST'}
            </h2>
            <p className="text-xs text-slate-500">
              {settings.businessName} • {settings.address} • Ph: {settings.phone}
            </p>
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
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

      {/* Clean Retail Table (ONLY Product Name and Retail Selling Price) */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold">{language === 'bn' ? 'কোনো প্রোডাক্ট পাওয়া যায়নি।' : 'No products found.'}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table: Product Name, Retail Price, Unit */}
            <div className="hidden md:block">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-5 font-semibold w-12 text-center">#</th>
                    <th className="py-3.5 px-5 font-semibold">
                      {language === 'bn' ? 'প্রোডাক্টের নাম' : 'Product Name'}
                    </th>
                    <th className="py-3.5 px-5 font-semibold text-right w-44">
                      {language === 'bn' ? 'খুচরো বিক্রয় মূল্য (₹)' : 'Retail Price (₹)'}
                    </th>
                    <th className="py-3.5 px-5 font-semibold text-center w-28">
                      {language === 'bn' ? 'একক' : 'Unit'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product, idx) => (
                    <tr key={product.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-5 text-center font-bold text-slate-400 text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {product.name}
                        </div>
                        {product.description && (
                          <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {product.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right font-black text-emerald-800 text-base">
                        ₹{formatINRNumber(product.retailPrice, settings.decimalPlaces)}
                      </td>
                      <td className="py-3.5 px-5 text-center text-xs text-slate-600 font-bold">
                        {product.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {product.name}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {language === 'bn' ? 'প্রতি' : 'per'} {product.unit}
                    </span>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-base font-black text-emerald-800">
                      ₹{formatINRNumber(product.retailPrice, settings.decimalPlaces)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
