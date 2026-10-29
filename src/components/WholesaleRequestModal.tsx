import React, { useState } from 'react';
import { MessageSquare, X, Send, Store, Phone, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';
import { BusinessSettings, Language } from '../types';
import { addWholesaleRequest } from '../utils/storage';

interface WholesaleRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BusinessSettings;
  language: Language;
  onRequestSubmitted: (customerName: string, customerPhone: string) => void;
}

export const WholesaleRequestModal: React.FC<WholesaleRequestModalProps> = ({
  isOpen,
  onClose,
  settings,
  language,
  onRequestSubmitted,
}) => {
  const [customerName, setCustomerName] = useState(
    () => localStorage.getItem('nae_saved_cust_name_v1') || ''
  );
  const [customerPhone, setCustomerPhone] = useState(
    () => localStorage.getItem('nae_saved_cust_phone_v1') || ''
  );
  const [customerAddress, setCustomerAddress] = useState(
    () => localStorage.getItem('nae_saved_cust_addr_v1') || ''
  );
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError(language === 'bn' ? 'অনুগ্রহ করে আপনার বা দোকানের নাম লিখুন।' : 'Please enter your name or shop name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      setError(language === 'bn' ? 'সঠিক ১০ সংখ্যার মোবাইল নম্বর দিন।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setError('');

    // Save for next time
    localStorage.setItem('nae_saved_cust_name_v1', customerName.trim());
    localStorage.setItem('nae_saved_cust_phone_v1', customerPhone.trim());
    localStorage.setItem('nae_saved_cust_addr_v1', customerAddress.trim());

    // Register request locally in storage
    const req = addWholesaleRequest({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
    });

    // Generate direct approval link for the owner
    const currentBaseUrl = window.location.origin + window.location.pathname;
    const approvalUrl = `${currentBaseUrl}?action=approve_wholesale&req_id=${req.id}&name=${encodeURIComponent(customerName.trim())}&phone=${encodeURIComponent(customerPhone.trim())}`;

    // Format rich WhatsApp message to shop owner (9563340244)
    const cleanShopPhone = settings.whatsapp.replace(/\D/g, '');
    const shopPhoneWithCode = cleanShopPhone.startsWith('91') ? cleanShopPhone : `91${cleanShopPhone}`;

    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
    
    const message = 
      `💧 *Wholesale Rate Access Request (NEW ASHIQUE ENTERPRISE)*\n` +
      `------------------------------------------\n` +
      `👤 *Name / Shop:* ${customerName.trim()}\n` +
      `📞 *Mobile:* ${customerPhone.trim()}\n` +
      (customerAddress.trim() ? `📍 *Address / Area:* ${customerAddress.trim()}\n` : '') +
      `⏰ *Time:* ${now}\n\n` +
      `👉 *Direct One-Click Approval Link for Owner:*\n` +
      `${approvalUrl}\n\n` +
      `_(Click this link and enter your Owner PIN to approve wholesale access in 1 tap)_`;

    window.open(`https://wa.me/${shopPhoneWithCode}?text=${encodeURIComponent(message)}`, '_blank');

    onRequestSubmitted(customerName.trim(), customerPhone.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-700/60 rounded-xl border border-blue-400/30">
              <MessageSquare className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">
                Request Wholesale Access
              </h3>
              <p className="text-[11px] text-blue-200">{settings.businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200/80 text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Submitting this will send an instant one-click approval link to the shop owner on WhatsApp (<strong>{settings.phone}</strong>). Once approved, wholesale rates will unlock immediately.
            </p>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
              {error}
            </div>
          )}

          {/* Customer / Shop Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-blue-700" />
              <span>Your Name / Shop Name *</span>
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Rahim Water Solution / Md Ashique"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-semibold"
            />
          </div>

          {/* Customer Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-700" />
              <span>Your Mobile Number *</span>
            </label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="98XXXXXXXX"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-mono font-bold"
            />
          </div>

          {/* Address / Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Address / Area (Optional)</span>
            </label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="e.g. Kaliachak, Malda"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
