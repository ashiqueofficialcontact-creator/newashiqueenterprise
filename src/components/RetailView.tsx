import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  X, 
  MessageSquare, 
  Plus, 
  Minus
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
  language,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

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

  const handleQuantityChange = (product: Product, delta: number) => {
    const initialJump = product.initialAddQty || product.wholesaleMoq || 1;
    const step = product.qtyStep && product.qtyStep > 0 ? product.qtyStep : 1;
    setSelectedItems((prev) => {
      const current = prev[product.id] || 0;
      if (current === 0 && delta > 0) {
        // First click jumps to the initial quantity set by owner (e.g., 100)
        return { ...prev, [product.id]: initialJump };
      }
      const next = current + delta * step;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      }
      return { ...prev, [product.id]: next };
    });
  };

  const handleDirectQuantity = (productId: string, val: string) => {
    const num = parseInt(val) || 0;
    setSelectedItems((prev) => {
      if (num <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: num };
    });
  };

  const selectedCount = Object.keys(selectedItems).length;
  const totalOrderAmount = useMemo(() => {
    return Object.entries(selectedItems).reduce((sum, [pId, qty]) => {
      const prod = products.find((p) => p.id === pId);
      return sum + (prod ? prod.retailPrice * qty : 0);
    }, 0);
  }, [selectedItems, products]);

  const handleSendOrderWhatsApp = () => {
    if (selectedCount === 0) return;

    const cleanPhone = settings.whatsapp.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    const lines: string[] = [];
    lines.push(`🛒 *${settings.businessName} - Wholesale Order*`);
    lines.push(`📍 ${settings.address}`);
    lines.push(`📞 Phone: ${settings.phone}`);
    lines.push(`----------------------------------`);
    lines.push(`📋 *Order Items:*`);

    let itemNum = 1;
    for (const [pId, qty] of Object.entries(selectedItems)) {
      const prod = products.find((p) => p.id === pId);
      if (prod) {
        const itemTotal = prod.retailPrice * qty;
        lines.push(`${itemNum}. *${prod.name}*`);
        lines.push(`   Qty: ${qty} ${prod.unit} × ₹${formatINRNumber(prod.retailPrice, settings.decimalPlaces)} = ₹${formatINRNumber(itemTotal, settings.decimalPlaces)}`);
        itemNum++;
      }
    }

    lines.push(`----------------------------------`);
    lines.push(`💰 *Total Estimated Amount: ₹${formatINRNumber(totalOrderAmount, settings.decimalPlaces)}*`);
    lines.push(`----------------------------------`);
    lines.push(`Please confirm stock availability and dispatch. Thank you!`);

    const encoded = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${phoneWithCode}?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-28 max-w-5xl mx-auto px-3 sm:px-6 pt-3">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Wholesale Catalog & Rates</span>
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
          Total Products: <strong className="text-slate-800">{filteredProducts.length}</strong>
        </span>
        {selectedCount > 0 && (
          <span className="text-emerald-700 font-bold">
            {selectedCount} items selected
          </span>
        )}
      </div>

      {/* Retail Products with Clean Divider between Name and Price */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="font-bold">No products found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => {
            const qty = selectedItems[product.id] || 0;
            const isSelected = qty > 0;
            const initialJump = product.initialAddQty || product.wholesaleMoq || 1;

            return (
              <div
                key={product.id}
                className={`bg-white rounded-3xl p-4 sm:p-5 shadow-xs border transition-all ${
                  isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/15' : 'border-slate-200'
                }`}
              >
                {/* 1. Product Name & Quantity Controls */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                      {product.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[11px] text-slate-500 font-medium">
                        per {product.unit}
                      </span>
                      {product.wholesaleMoq && product.wholesaleMoq > 1 ? (
                        <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded-md border border-amber-200">
                          Min: {product.wholesaleMoq} {product.unit}s
                        </span>
                      ) : null}
                      {product.qtyStep && product.qtyStep > 1 ? (
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded-md border border-blue-200">
                          Step: +{product.qtyStep}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200">
                    <button
                      onClick={() => handleQuantityChange(product, -1)}
                      disabled={qty === 0}
                      className="w-7 h-7 rounded-xl bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                      title="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={qty === 0 ? '' : qty}
                      placeholder="0"
                      onChange={(e) => handleDirectQuantity(product.id, e.target.value)}
                      className="w-14 text-center font-bold text-xs text-slate-900 font-mono bg-white rounded-lg border border-slate-200 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleQuantityChange(product, 1)}
                      className="w-7 h-7 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                      title={qty === 0 ? `Add ${initialJump}` : `Add ${product.qtyStep || 1}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Distinct Divider Line Between Name and Price */}
                <div className="border-t border-slate-200/90 my-3"></div>

                {/* 3. Wholesale Selling Price */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Wholesale Rate:
                  </span>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl font-black text-emerald-800 font-mono">
                      ₹{formatINRNumber(product.retailPrice, settings.decimalPlaces)}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">/ {product.unit}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Order Cart Bar when items are selected */}
      {selectedCount > 0 && (
        <div className="fixed bottom-24 sm:bottom-28 left-3.5 right-3.5 sm:left-auto sm:right-auto sm:w-[480px] sm:left-1/2 sm:-translate-x-1/2 z-40 animate-in slide-in-from-bottom duration-200">
          <div className="bg-slate-950 text-white p-3.5 rounded-3xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-emerald-400 font-bold">
                {selectedCount} items selected in order
              </div>
              <div className="text-base sm:text-lg font-black text-white font-mono">
                ₹{formatINRNumber(totalOrderAmount, settings.decimalPlaces)}
              </div>
            </div>

            <button
              onClick={handleSendOrderWhatsApp}
              className="py-2.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Order via WhatsApp</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
