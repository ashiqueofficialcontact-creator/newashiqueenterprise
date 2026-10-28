import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, X, MessageSquare, Lock, Phone, User, Store, ArrowRight, Share2 } from 'lucide-react';
import { BusinessSettings, Language, UserRole } from '../types';
import { approveWholesaleRequest, rejectWholesaleRequest } from '../utils/storage';

interface WholesaleApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  customerPhone: string;
  requestId?: string;
  settings: BusinessSettings;
  language: Language;
  userRole: UserRole;
  onApproveSuccess: () => void;
}

export const WholesaleApprovalModal: React.FC<WholesaleApprovalModalProps> = ({
  isOpen,
  onClose,
  customerName,
  customerPhone,
  requestId,
  settings,
  language,
  userRole,
  onApproveSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  if (!isOpen) return null;

  const handleApprove = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // If not in owner mode, verify PIN
    if (userRole !== 'owner') {
      const correctPin = settings.ownerPin || '1234';
      if (pin !== correctPin) {
        setPinError(true);
        return;
      }
    }

    setPinError(false);
    approveWholesaleRequest(requestId || customerPhone || customerName);
    setIsApproved(true);
    onApproveSuccess();
  };

  const handleReject = () => {
    if (requestId) {
      rejectWholesaleRequest(requestId);
    }
    onClose();
  };

  const handleSendConfirmationWhatsApp = () => {
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const baseUrl = window.location.origin + window.location.pathname;

    const message = 
      `✅ *হোলসেল অ্যাক্সেস অনুমোদিত হয়েছে!*\n` +
      `*${settings.businessName}*\n` +
      `📍 ${settings.address}\n` +
      `📞 হেল্পলাইন: ${settings.phone}\n\n` +
      `প্রিয় *${customerName || 'সম্মানিত কাস্টমার'}*,\n` +
      `আপনার হোলসেল পাইকারি দর দেখার অনুরোধ সফলভাবে অনুমোদন করা হয়েছে।\n\n` +
      `👉 *হোলসেল রেট দেখতে নিচের লিংকে ক্লিক করুন:*\n` +
      `${baseUrl}?customer_phone=${cleanPhone}&wholesale=open\n\n` +
      `ধন্যবাদ!\n` +
      `*NEW ASHIQUE ENTERPRISE*`;

    window.open(`https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/80 rounded-xl border border-blue-400/30">
              <ShieldCheck className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">
                {language === 'bn' ? 'হোলসেল অ্যাক্সেস অনুমোদন (Owner Approval)' : 'Approve Wholesale Access'}
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

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {!isApproved ? (
            <>
              {/* Customer Request Details Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {language === 'bn' ? 'অনুরোধকারী কাস্টমারের তথ্য:' : 'Customer Information:'}
                </div>

                <div className="flex items-center gap-2.5 text-sm font-extrabold text-slate-900">
                  <User className="w-4 h-4 text-blue-700 flex-shrink-0" />
                  <span>{customerName || (language === 'bn' ? 'নাম উল্লেখ নেই' : 'Unspecified')}</span>
                </div>

                {customerPhone && (
                  <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 font-mono">
                    <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{customerPhone}</span>
                  </div>
                )}

                <div className="pt-1 text-[11px] text-slate-500">
                  {language === 'bn'
                    ? 'এই কাস্টমার আপনার দোকানের হোলসেল পাইকারি দর দেখার অনুমতি চেয়েছেন।'
                    : 'This customer has requested permission to view wholesale bulk trade prices.'}
                </div>
              </div>

              {/* PIN input if not already in Owner Mode */}
              {userRole !== 'owner' && (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'মালিক পিন দিয়ে অনুমোদন করুন' : 'Enter Owner PIN'}</span>
                  </div>
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setPinError(false);
                    }}
                    placeholder="••••"
                    className="w-full text-center text-xl font-mono tracking-widest py-2 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {pinError && (
                    <div className="text-[11px] text-red-600 font-bold text-center">
                      {language === 'bn' ? 'ভুল পিন! পুনরায় চেষ্টা করুন।' : 'Incorrect PIN. Try again.'}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleReject}
                  className="py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Dismiss'}
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove()}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'bn' ? '✅ অনুমোদন দিন' : 'Approve Access'}</span>
                </button>
              </div>
            </>
          ) : (
            /* Approved State */
            <div className="text-center space-y-4 py-2 animate-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-3xl mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900">
                  {language === 'bn' ? 'হোলসেল রেট অনুমোদন সফল হয়েছে!' : 'Wholesale Access Approved!'}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {language === 'bn'
                    ? `কাস্টমার ${customerName || ''}-এর জন্য হোলসেল রেট আনলক করা হয়েছে।`
                    : `Wholesale rates have been unlocked for ${customerName || 'customer'}.`}
                </p>
              </div>

              {customerPhone && (
                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleSendConfirmationWhatsApp}
                    className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{language === 'bn' ? 'কাস্টমারকে হোয়াটসঅ্যাপে জানিয়ে দিন' : 'Send Confirmation via WhatsApp'}</span>
                  </button>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                {language === 'bn' ? 'সম্পন্ন (Close)' : 'Done'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
