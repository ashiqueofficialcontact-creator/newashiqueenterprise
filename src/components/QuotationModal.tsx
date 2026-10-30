import React, { useState, useMemo } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  FileDown, 
  MessageSquare, 
  FileText, 
  Calendar, 
  User, 
  Phone, 
  Truck, 
  Check, 
  Search,
  CheckCircle2, 
  AlertCircle,
  PackagePlus,
  Layers
} from 'lucide-react';
import { BusinessSettings, Language, Product, Quotation, QuotationItem } from '../types';
import { translations } from '../i18n/translations';
import { formatINRNumber } from '../utils/storage';
import { generateQuotationPDF } from '../utils/pdfGenerator';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  settings: BusinessSettings;
  language: Language;
  onSaveQuotation?: (quote: Quotation) => void;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  products,
  settings,
  language,
  onSaveQuotation,
}) => {
  const t = translations[language];

  const todayStr = new Date().toISOString().split('T')[0];
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(todayStr);
  const [quotationDate] = useState(todayStr);
  const [quotationNumber] = useState(`NAE-QT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [notes, setNotes] = useState(
    '1. Valid for 15 days from date of issue.\n2. 100% genuine spares with manufacturer warranty.\n3. Goods once sold cannot be returned without original packing.'
  );

  // Line items start completely empty (no dummy pre-filled items)
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);

  // Multi-item selector modal state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  // Map of productId -> quantity selected in picker
  const [pickerSelections, setPickerSelections] = useState<Record<string, number>>({});

  // Recalculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
  const grandTotal = Math.max(0, subtotal - (Number(discount) || 0));

  // Open Multi-Product Picker
  const handleOpenPicker = () => {
    // Pre-populate picker with current items
    const existing: Record<string, number> = {};
    items.forEach((it) => {
      existing[it.productId] = it.quantity;
    });
    setPickerSelections(existing);
    setPickerSearch('');
    setIsPickerOpen(true);
  };

  // Toggle item selection in picker
  const handleTogglePickerItem = (product: Product) => {
    setPickerSelections((prev) => {
      const copy = { ...prev };
      if (copy[product.id]) {
        delete copy[product.id];
      } else {
        copy[product.id] = 1;
      }
      return copy;
    });
  };

  // Change quantity in picker
  const handlePickerQtyChange = (productId: string, qty: number) => {
    const safeQty = Math.max(1, qty);
    setPickerSelections((prev) => ({
      ...prev,
      [productId]: safeQty,
    }));
  };

  // Apply selected items from picker to quotation
  const handleApplyPickerSelections = () => {
    const newItems: QuotationItem[] = [];

    // First preserve existing items with updated quantities if still selected
    for (const [pId, qty] of Object.entries(pickerSelections)) {
      if (qty <= 0) continue;
      const product = products.find((p) => p.id === pId);
      if (!product) continue;

      const existingItem = items.find((it) => it.productId === pId);
      const unitPrice = existingItem ? existingItem.unitPrice : product.retailPrice;
      const lineTotal = Number((unitPrice * qty).toFixed(2));

      newItems.push({
        productId: product.id,
        name: product.name,
        code: product.code,
        unit: product.unit,
        quantity: qty,
        unitPrice,
        lineTotal,
      });
    }

    setItems(newItems);
    setIsPickerOpen(false);
  };

  // Individual item modifications
  const handleQuantityChange = (index: number, qty: number) => {
    const safeQty = Math.max(1, qty);
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        quantity: safeQty,
        lineTotal: Number((copy[index].unitPrice * safeQty).toFixed(2)),
      };
      return copy;
    });
  };

  const handlePriceChange = (index: number, price: number) => {
    const safePrice = Math.max(0, price);
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        unitPrice: safePrice,
        lineTotal: Number((safePrice * copy[index].quantity).toFixed(2)),
      };
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const currentQuotationObj: Quotation = {
    id: 'quote_' + Math.random().toString(36).substring(2, 9),
    quotationNumber,
    customerName: customerName.trim() || 'Valued Customer',
    customerPhone: customerPhone.trim(),
    deliveryDate: deliveryDate.trim(),
    date: quotationDate,
    items,
    subtotal,
    discount,
    grandTotal,
    notes,
  };

  const handleDownloadPdf = () => {
    if (items.length === 0) {
      alert('Please select at least one product for the quotation.');
      return;
    }
    generateQuotationPDF(currentQuotationObj, settings);
    if (onSaveQuotation) onSaveQuotation(currentQuotationObj);
  };

  const handleShareWhatsApp = () => {
    if (items.length === 0) {
      alert('Please select at least one product for the quotation.');
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const header = `*${settings.businessName} - ESTIMATE / QUOTATION*\nRef: ${quotationNumber}\nDate: ${quotationDate}\nDelivery Date: ${deliveryDate || 'Prompt'}\nCustomer: *${customerName || 'Valued Customer'}*\nContact: ${customerPhone || 'N/A'}\n\n`;
    const itemsList = items
      .map(
        (it, idx) =>
          `${idx + 1}. *${it.name}*\n   Qty: ${it.quantity} ${it.unit} @ ₹${formatINRNumber(it.unitPrice, 2)} = ₹${formatINRNumber(it.lineTotal, 2)}`
      )
      .join('\n');
    const summary = `\n\n-----------------------\n*Subtotal:* ₹${formatINRNumber(subtotal, 2)}\n*Discount:* -₹${formatINRNumber(discount, 2)}\n*GRAND TOTAL:* ₹${formatINRNumber(grandTotal, 2)}\n-----------------------\n_${settings.address}_\n_Call/WhatsApp: ${settings.phone}_`;

    const fullMessage = encodeURIComponent(header + itemsList + summary);
    if (cleanPhone) {
      const targetPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
      window.open(`https://wa.me/${targetPhone}?text=${fullMessage}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${fullMessage}`, '_blank');
    }
  };

  // Filtered products for multi-select picker
  const filteredPickerProducts = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, pickerSearch]);

  const pickerSelectedCount = Object.keys(pickerSelections).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-purple-950 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-300" />
              <h3 className="font-extrabold text-base sm:text-lg">
                Create Estimate / Quotation
              </h3>
            </div>
            <p className="text-xs text-purple-300">
              Ref: <span className="font-mono font-bold text-white">{quotationNumber}</span> • {settings.businessName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-purple-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Customer Details: Customer Name, Mobile Number, Delivery Date */}
          <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-purple-950 uppercase mb-1">
                Customer Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-600" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter Customer Name"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-purple-200 font-semibold focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-purple-950 uppercase mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-600" />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter 10-digit Mobile"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-purple-200 font-semibold focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-purple-950 uppercase mb-1">
                Delivery Date
              </label>
              <div className="relative">
                <Truck className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-600" />
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-purple-200 font-semibold focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Quotation Line Items Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-extrabold text-sm text-slate-800">
                  Quotation Products ({items.length})
                </h4>
                <p className="text-[11px] text-slate-500">
                  Select products and adjust quantities. Grand total calculates automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenPicker}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <PackagePlus className="w-4 h-4" />
                <span>+ Select Products</span>
              </button>
            </div>

            {/* When no products are added yet */}
            {items.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <PackagePlus className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">No items added yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click the button below to check multiple products at once and specify their quantities in one go.
                </p>
                <button
                  type="button"
                  onClick={handleOpenPicker}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>Select Products to Add</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((item, index) => (
                  <div
                    key={item.productId || index}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Item Name & Unit */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-purple-700 font-bold uppercase tracking-wider">
                        #{index + 1}
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        Unit: {item.unit} {item.code ? `• Code: ${item.code}` : ''}
                      </div>
                    </div>

                    {/* Quantity Control */}
                    <div className="flex items-center gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block uppercase mb-0.5">
                          Quantity
                        </label>
                        <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(index, item.quantity - 1)}
                            className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(index, parseInt(e.target.value) || 1)
                            }
                            className="w-14 py-1 text-center text-xs font-black text-slate-900 border-x border-slate-200 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(index, item.quantity + 1)}
                            className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Unit Rate */}
                      <div className="w-24">
                        <label className="text-[10px] font-bold text-slate-500 block uppercase mb-0.5">
                          Rate (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handlePriceChange(index, parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-right focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      {/* Line Total */}
                      <div className="w-24 text-right">
                        <label className="text-[10px] font-bold text-slate-500 block uppercase mb-0.5">
                          Total
                        </label>
                        <div className="text-sm font-black text-purple-950 py-1 font-mono">
                          ₹{formatINRNumber(item.lineTotal, 2)}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals & Discount Card */}
          <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-1/2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Discount (₹)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="Enter discount amount if any"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold"
              />
            </div>

            <div className="w-full sm:w-1/2 text-right space-y-1">
              <div className="text-xs text-slate-600 flex justify-between">
                <span>Subtotal ({items.length} items):</span>
                <span className="font-bold">₹{formatINRNumber(subtotal, 2)}</span>
              </div>
              <div className="text-xs text-red-600 flex justify-between">
                <span>Discount:</span>
                <span className="font-bold">- ₹{formatINRNumber(discount, 2)}</span>
              </div>
              <div className="text-base sm:text-lg font-black text-purple-950 flex justify-between border-t border-purple-300 pt-1">
                <span>Grand Total:</span>
                <span className="font-mono">₹{formatINRNumber(grandTotal, 2)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Terms & Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
            ></textarea>
            <div className="mt-1 text-[11px] text-purple-800 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Prices are inclusive of applicable taxes. Delivery as per schedule.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleShareWhatsApp}
            disabled={items.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-40"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-200 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={items.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-40"
            >
              <FileDown className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Item Product Selection Sheet / Modal */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Picker Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  Select Products for Quotation
                </h3>
                <p className="text-xs text-slate-400">
                  Check items and set quantities in 1 click
                </p>
              </div>
              <button
                onClick={() => setIsPickerOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search filter */}
            <div className="p-3 bg-slate-50 border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search products by name or code..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Product items list with checkboxes and quantity steppers */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {filteredPickerProducts.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-bold">
                  No matching products found.
                </div>
              ) : (
                filteredPickerProducts.map((p) => {
                  const isSelected = !!pickerSelections[p.id];
                  const currentQty = pickerSelections[p.id] || 1;

                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-purple-50/80 border-purple-400 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Checkbox & Product Info */}
                      <label
                        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          handleTogglePickerItem(p);
                        }}
                      >
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-purple-700 border-purple-700 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-extrabold text-slate-900 text-sm truncate">
                            {p.name}
                          </h5>
                          <div className="text-xs text-slate-500">
                            ₹{formatINRNumber(p.retailPrice, settings.decimalPlaces)} / {p.unit}
                          </div>
                        </div>
                      </label>

                      {/* Quantity stepper (enabled when checked) */}
                      {isSelected && (
                        <div className="flex items-center gap-1.5 flex-shrink-0 animate-in fade-in">
                          <button
                            type="button"
                            onClick={() => handlePickerQtyChange(p.id, currentQty - 1)}
                            className="w-7 h-7 rounded-lg bg-purple-100 text-purple-900 font-bold hover:bg-purple-200 flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={currentQty}
                            onChange={(e) =>
                              handlePickerQtyChange(p.id, parseInt(e.target.value) || 1)
                            }
                            className="w-12 py-1 text-center font-black text-xs border border-purple-300 rounded-lg bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handlePickerQtyChange(p.id, currentQty + 1)}
                            className="w-7 h-7 rounded-lg bg-purple-100 text-purple-900 font-bold hover:bg-purple-200 flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Picker Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                Selected: <strong className="text-purple-950 font-black">{pickerSelectedCount}</strong> items
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPickerOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyPickerSelections}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md"
                >
                  Add Selected ({pickerSelectedCount})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
