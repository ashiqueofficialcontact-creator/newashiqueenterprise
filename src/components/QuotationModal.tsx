import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  FileDown, 
  MessageSquare, 
  FileText, 
  DollarSign, 
  Percent, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle 
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
  const [customerAddress, setCustomerAddress] = useState('');
  const [quotationDate, setQuotationDate] = useState(todayStr);
  const [quotationNumber] = useState(`NAE-QT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [notes, setNotes] = useState(
    '1. Valid for 15 days from date of issue.\n2. 100% genuine spares with manufacturer warranty.\n3. Goods once sold cannot be returned without original packing.'
  );

  // Line items
  const [items, setItems] = useState<QuotationItem[]>([
    {
      productId: products[0]?.id || '1',
      name: products[0]?.name || 'RO Membrane',
      code: products[0]?.code || 'MEM',
      unit: products[0]?.unit || 'Piece',
      quantity: 1,
      unitPrice: products[0]?.retailPrice || 1000,
      lineTotal: products[0]?.retailPrice || 1000,
    },
  ]);

  const [discount, setDiscount] = useState<number>(0);

  if (!isOpen) return null;

  // Recalculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
  const grandTotal = Math.max(0, subtotal - (Number(discount) || 0));

  const handleAddItem = () => {
    const firstProd = products[0];
    if (!firstProd) return;

    setItems([
      ...items,
      {
        productId: firstProd.id,
        name: firstProd.name,
        code: firstProd.code,
        unit: firstProd.unit,
        quantity: 1,
        unitPrice: firstProd.retailPrice,
        lineTotal: firstProd.retailPrice,
      },
    ]);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setItems((prev) => {
      const copy = [...prev];
      const qty = copy[index].quantity || 1;
      copy[index] = {
        ...copy[index],
        productId: prod.id,
        name: prod.name,
        code: prod.code,
        unit: prod.unit,
        unitPrice: prod.retailPrice,
        lineTotal: prod.retailPrice * qty,
      };
      return copy;
    });
  };

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
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const currentQuotationObj: Quotation = {
    id: 'quote_' + Math.random().toString(36).substr(2, 9),
    quotationNumber,
    customerName: customerName.trim() || 'Valued Customer',
    customerPhone: customerPhone.trim(),
    customerAddress: customerAddress.trim(),
    date: quotationDate,
    items,
    subtotal,
    discount,
    grandTotal,
    notes,
  };

  const handleDownloadPdf = () => {
    generateQuotationPDF(currentQuotationObj, settings);
    if (onSaveQuotation) onSaveQuotation(currentQuotationObj);
  };

  const handleShareWhatsApp = () => {
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const header = `*${settings.businessName} - ESTIMATE / QUOTATION*\nRef: ${quotationNumber} | Date: ${quotationDate}\nFor: ${customerName || 'Customer'}\n\n`;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-purple-950 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-300" />
              <h3 className="font-extrabold text-base sm:text-lg">
                {t.quotationsTitle}
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
          {/* Customer Details Box */}
          <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-purple-950 uppercase mb-1">
                {t.customerName}
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-600" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Mondal"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-purple-200 font-semibold focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-purple-950 uppercase mb-1">
                {t.customerPhone}
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-600" />
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-purple-200 font-semibold focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-purple-950 uppercase mb-1">
                {t.quotationDate}
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-600" />
                <input
                  type="date"
                  value={quotationDate}
                  onChange={(e) => setQuotationDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-purple-200 font-semibold focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block font-bold text-purple-950 uppercase mb-1">
                {t.customerAddress}
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-600" />
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="e.g. Kaliachak Market, Malda"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-purple-200 font-semibold focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Line items table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-extrabold text-sm text-slate-800">Quotation Line Items</h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-950 text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addItem}</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-2.5"
                >
                  {/* Select product */}
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase mb-0.5">
                      Item #{index + 1}
                    </label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleProductSelect(index, e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:ring-2 focus:ring-purple-500"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code}) - Retail ₹{p.retailPrice}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="w-24">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase mb-0.5">
                      Qty ({item.unit})
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(index, parseInt(e.target.value) || 1)
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-center focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Unit price */}
                  <div className="w-28">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase mb-0.5">
                      Unit Rate (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handlePriceChange(index, parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-right focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Line Total */}
                  <div className="w-28 text-right">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase mb-0.5">
                      Total
                    </label>
                    <div className="text-sm font-black text-purple-950 py-1">
                      ₹{formatINRNumber(item.lineTotal, 2)}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <div className="self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length <= 1}
                      className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Discount Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                <span>Subtotal:</span>
                <span className="font-bold">₹{formatINRNumber(subtotal, 2)}</span>
              </div>
              <div className="text-xs text-red-600 flex justify-between">
                <span>Discount:</span>
                <span className="font-bold">- ₹{formatINRNumber(discount, 2)}</span>
              </div>
              <div className="text-base sm:text-lg font-black text-purple-950 flex justify-between border-t border-slate-300 pt-1">
                <span>Grand Total:</span>
                <span>₹{formatINRNumber(grandTotal, 2)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Disclaimer */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {t.notes}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
            ></textarea>
            <div className="mt-1 text-[11px] text-amber-700 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t.taxDisclaimer}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t.shareQuoteWhatsapp}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-200 cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-white text-xs font-bold shadow-md transition cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>{t.downloadQuotePdf}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
