import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  X, 
  MessageSquare
} from 'lucide-react';
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

  const handleInquireProduct = (product: Product) => {
    const cleanPhone = settings.whatsapp.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const text = encodeURIComponent(
      `Hello ${settings.businessName},\nI would like to inquire about this item:\n\n*Product:* ${product.name}\n*Wholesale Rate:* ₹${formatINRNumber(product.retailPrice, settings.decimalPlaces)} / ${product.unit}`
    );
    window.open(`https://wa.me/${phoneWithCode}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-28 max-w-5xl mx-auto px-3 sm:px-6 pt-3">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Wholesale Catalog & Direct Rates</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              WHOLESALE PRICE LIST
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
              placeholder="Search product name..."
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
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Total Wholesale Products: <strong className="text-slate-800">{filteredProducts.length}</strong>
        </span>
      </div>

      {/* Product List: Name First and Beside it Item Rate (No Cart / Quantity Controls) */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="font-bold">No products found.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredProducts.map((product) => {
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* 1. Item Name First */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-900 text-base sm:text-lg leading-snug tracking-tight">
                    {product.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                      Unit: {product.unit}
                    </span>
                    {product.description && (
                      <span className="text-xs text-slate-500 line-clamp-1">
                        {product.description}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Beside it Item Rate */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Wholesale Rate
                    </span>
                    <div className="text-lg sm:text-2xl font-black text-emerald-700 font-mono">
                      ₹{formatINRNumber(product.retailPrice, settings.decimalPlaces)}
                      <span className="text-xs font-semibold text-slate-500 ml-1">/ {product.unit}</span>
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
