import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  MessageSquare, 
  Clock, 
  User, 
  Share2, 
  Copy, 
  Check, 
  Eye, 
  EyeOff,
  UserPlus,
  Search,
  Trash2,
  Lock,
  Unlock,
  AlertCircle,
  X
} from 'lucide-react';
import { BusinessSettings, Language, WholesaleRequest } from '../types';
import { 
  approveWholesaleRequest, 
  rejectWholesaleRequest, 
  addDirectWholesaleCustomer,
  toggleCustomerWholesaleAccess,
  deleteWholesaleCustomer,
  normalizePhone
} from '../utils/storage';

interface WholesaleApprovalsViewProps {
  requests: WholesaleRequest[];
  settings: BusinessSettings;
  language: Language;
  isWholesaleApproved: boolean;
  isWholesaleHidden?: boolean;
  onToggleWholesaleHidden?: () => void;
  onApproveWholesale: () => void;
  onRevokeWholesale: () => void;
  onRefreshRequests: () => void;
  onBack: () => void;
}

export const WholesaleApprovalsView: React.FC<WholesaleApprovalsViewProps> = ({
  requests,
  settings,
  language,
  isWholesaleApproved,
  isWholesaleHidden = false,
  onToggleWholesaleHidden,
  onApproveWholesale,
  onRevokeWholesale,
  onRefreshRequests,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'approved' | 'hidden' | 'pending'>('all');
  const [copiedLinkFor, setCopiedLinkFor] = useState<string | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  
  // Add Customer Form state
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustNotes, setNewCustNotes] = useState('');
  const [addError, setAddError] = useState('');

  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const handleApprove = (req: WholesaleRequest) => {
    approveWholesaleRequest(req.id);
    onApproveWholesale();
    onRefreshRequests();
  };

  const handleReject = (reqId: string) => {
    rejectWholesaleRequest(reqId);
    onRefreshRequests();
  };

  const handleToggleCustomerAccess = (req: WholesaleRequest, newStatus: 'approved' | 'hidden') => {
    toggleCustomerWholesaleAccess(req.id, newStatus);
    onRefreshRequests();
  };

  const handleDeleteCustomerPrompt = (id: string, name: string) => {
    setConfirmDelete({ id, name });
  };

  const handleConfirmDeleteExecute = () => {
    if (confirmDelete) {
      deleteWholesaleCustomer(confirmDelete.id);
      setConfirmDelete(null);
      onRefreshRequests();
    }
  };

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      setAddError(language === 'bn' ? 'গ্রাহকের নাম বা দোকানের নাম লিখুন।' : 'Enter customer name.');
      return;
    }
    const clean = normalizePhone(newCustPhone);
    if (!clean || clean.length < 10) {
      setAddError(language === 'bn' ? 'সঠিক ১০ সংখ্যার মোবাইল নম্বর দিন।' : 'Enter valid 10-digit phone number.');
      return;
    }

    addDirectWholesaleCustomer({
      customerName: newCustName.trim(),
      customerPhone: clean,
      customerAddress: newCustAddress.trim(),
      notes: newCustNotes.trim(),
    });

    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setNewCustNotes('');
    setAddError('');
    setIsAddCustomerOpen(false);
    onRefreshRequests();
  };

  const handleSendApprovalWhatsApp = (req: WholesaleRequest) => {
    const cleanPhone = normalizePhone(req.customerPhone);
    const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const baseUrl = window.location.origin + window.location.pathname;
    const unlockUrl = `${baseUrl}?customer_phone=${cleanPhone}&wholesale=open`;

    const message = 
      `✅ *হোলসেল অ্যাক্সেস অনুমোদিত হয়েছে!*\n` +
      `*${settings.businessName}*\n` +
      `📍 ${settings.address}\n` +
      `📞 হেল্পলাইন: ${settings.phone}\n\n` +
      `প্রিয় *${req.customerName}*,\n` +
      `আপনার হোলসেল রেট দেখার অনুরোধ অনুমোদন করা হয়েছে। আপনার বারবার রিকোয়েস্ট পাঠাতে হবে না।\n\n` +
      `👉 *হোলসেল রেট দেখতে সরাসরি নিচের লিংকে প্রবেশ করুন:*\n` +
      `${unlockUrl}\n\n` +
      `ধন্যবাদ!\n` +
      `*NEW ASHIQUE ENTERPRISE*`;

    window.open(`https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCopyCustomerLink = (req: WholesaleRequest) => {
    const cleanPhone = normalizePhone(req.customerPhone);
    const baseUrl = window.location.origin + window.location.pathname;
    const unlockUrl = `${baseUrl}?customer_phone=${cleanPhone}&wholesale=open`;
    navigator.clipboard.writeText(unlockUrl);
    setCopiedLinkFor(req.id);
    setTimeout(() => setCopiedLinkFor(null), 2500);
  };

  // Filter requests
  const filteredList = useMemo(() => {
    return requests.filter((r) => {
      // Tab filter
      if (filterTab === 'approved' && r.status !== 'approved') return false;
      if (filterTab === 'hidden' && r.status !== 'hidden') return false;
      if (filterTab === 'pending' && r.status !== 'pending') return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        r.customerName.toLowerCase().includes(q) ||
        r.customerPhone.includes(q) ||
        (r.customerAddress && r.customerAddress.toLowerCase().includes(q))
      );
    });
  }, [requests, filterTab, searchQuery]);

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const hiddenCount = requests.filter(r => r.status === 'hidden').length;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-3 pb-28 space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <button
              onClick={onBack}
              className="text-xs font-bold text-blue-900 hover:underline mb-2 block cursor-pointer"
            >
              ← {language === 'bn' ? 'ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'মালিক নিয়ন্ত্রণ ও কাস্টমার রেজিস্ট্রি' : 'Wholesale Customer Registry'}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              {language === 'bn' ? 'হোলসেল কাস্টমার কন্ট্রোল ও অনুমোদন' : 'Wholesale Customers & Access Control'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'bn'
                ? 'একবার রিকোয়েস্ট করা কাস্টমারদের নাম স্থায়ীভাবে সেভ থাকে। যেকোনো কাস্টমারের জন্য হোলসেল চালু (অন) বা হাইড (অফ) করুন।'
                : 'Permanent customer directory. Toggle wholesale access ON or OFF for any individual customer anytime.'}
            </p>
          </div>

          {/* Quick Actions: Global Hide / Unhide & Add Customer */}
          <div className="flex flex-wrap items-center gap-2">
            {onToggleWholesaleHidden && (
              <button
                onClick={onToggleWholesaleHidden}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold shadow-xs transition cursor-pointer ${
                  isWholesaleHidden
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                }`}
                title={isWholesaleHidden ? 'Show Wholesale on Dashboard' : 'Hide Wholesale on Dashboard'}
              >
                {isWholesaleHidden ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>{language === 'bn' ? 'হোলসেল আনহাইড' : 'Unhide Wholesale'}</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>{language === 'bn' ? 'হোলসেল হাইড' : 'Hide Wholesale'}</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-900/20 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'bn' ? '+ কাস্টমার যোগ' : '+ Add Customer'}</span>
            </button>
          </div>
        </div>

        {/* Global Wholesale Hidden Notice */}
        {isWholesaleHidden && (
          <div className="mt-3.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-rose-700 flex-shrink-0" />
            <span>
              {language === 'bn'
                ? '⚠️ হোলসেল সেকশনটি বর্তমানে সাধারণ দর্শকদের ড্যাশবোর্ড থেকে গ্লোবালি হাইড (লুকানো) রয়েছে।'
                : '⚠️ Wholesale is currently hidden globally from the public dashboard.'}
            </span>
          </div>
        )}

        {/* Search & Filter Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'নাম, মোবাইল নম্বর বা এলাকা দিয়ে খুঁজুন...' : 'Search by customer name, phone, area...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm font-semibold transition"
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

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {language === 'bn' ? 'সকল কাস্টমার' : 'All Customers'} ({requests.length})
            </button>

            <button
              onClick={() => setFilterTab('approved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                filterTab === 'approved'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সক্রিয় / অন' : 'Active / Approved'} ({approvedCount})</span>
            </button>

            <button
              onClick={() => setFilterTab('hidden')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                filterTab === 'hidden'
                  ? 'bg-rose-700 text-white'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'হাইড করা / অফ' : 'Hidden / Paused'} ({hiddenCount})</span>
            </button>

            {pendingCount > 0 && (
              <button
                onClick={() => setFilterTab('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterTab === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'পেন্ডিং অনুমোদন' : 'Pending'} ({pendingCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customer Registry List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-2">
            <User className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">
              {language === 'bn' ? 'কোনো কাস্টমার পাওয়া যায়নি।' : 'No customers match the filter.'}
            </h4>
            <p className="text-xs text-slate-400">
              {language === 'bn'
                ? 'উপরে "+ কাস্টমার যোগ" বোতাম চেপে সরাসরি কোনো ডিলার বা কাস্টমারকে অন্তর্ভুক্ত করতে পারেন।'
                : 'Click "+ Add Customer" above to add a client directly.'}
            </p>
          </div>
        ) : (
          filteredList.map((req) => {
            const cleanPhone = normalizePhone(req.customerPhone);
            const isApproved = req.status === 'approved';
            const isHidden = req.status === 'hidden';
            const isPending = req.status === 'pending';

            return (
              <div
                key={req.id}
                className={`bg-white rounded-3xl p-4 sm:p-5 shadow-sm border transition-all ${
                  isApproved
                    ? 'border-emerald-200 hover:border-emerald-300'
                    : isHidden
                    ? 'border-rose-200 bg-rose-50/15'
                    : 'border-amber-200 bg-amber-50/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Customer Information */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm sm:text-base">
                        {req.customerName}
                      </span>

                      {/* Status Badges */}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{language === 'bn' ? 'অন (হোলসেল দেখতে পারবে)' : 'Active (Access Granted)'}</span>
                        </span>
                      )}

                      {isHidden && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-300">
                          <EyeOff className="w-3 h-3 text-rose-600" />
                          <span>{language === 'bn' ? 'অফ (হোলসেল হাইড করা)' : 'Hidden (Access Paused)'}</span>
                        </span>
                      )}

                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>{language === 'bn' ? 'অনুমোদনের অপেক্ষায়' : 'Pending Request'}</span>
                        </span>
                      )}
                    </div>

                    {/* Phone & Address */}
                    <div className="text-xs text-slate-600 font-mono flex flex-wrap items-center gap-2">
                      <span className="font-bold flex items-center gap-1 text-slate-800">
                        <Phone className="w-3 h-3 text-blue-700" />
                        {cleanPhone}
                      </span>
                      {req.customerAddress && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="font-sans text-slate-500">{req.customerAddress}</span>
                        </>
                      )}
                      {req.notes && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="font-sans text-blue-600 italic">{req.notes}</span>
                        </>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-400">
                      {language === 'bn' ? 'সংযুক্ত: ' : 'Registered: '}
                      {new Date(req.requestedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Customer Action Controls */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* 1. Toggle ON / OFF (Individual Access Control) */}
                    {isApproved && (
                      <button
                        onClick={() => handleToggleCustomerAccess(req, 'hidden')}
                        className="py-2 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        title="Click to hide wholesale prices for this customer"
                      >
                        <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                        <span>{language === 'bn' ? 'হোলসেল হাইড করুন (অফ)' : 'Hide Rates (Turn OFF)'}</span>
                      </button>
                    )}

                    {isHidden && (
                      <button
                        onClick={() => handleToggleCustomerAccess(req, 'approved')}
                        className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm transition cursor-pointer flex items-center gap-1.5"
                        title="Click to enable wholesale prices for this customer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'হোলসেল চালু করুন (অন)' : 'Enable Rates (Turn ON)'}</span>
                      </button>
                    )}

                    {isPending && (
                      <>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="py-2 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                        >
                          {language === 'bn' ? 'বাতিল' : 'Reject'}
                        </button>
                        <button
                          onClick={() => handleApprove(req)}
                          className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'অনুমোদন দিন' : 'Approve'}</span>
                        </button>
                      </>
                    )}

                    {/* 2. WhatsApp Notify & Link Sharing */}
                    <button
                      onClick={() => handleSendApprovalWhatsApp(req)}
                      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      title="Send WhatsApp confirmation with personal unlock link"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{language === 'bn' ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}</span>
                    </button>

                    {/* 3. Copy Personalized Direct Unlock Link */}
                    <button
                      onClick={() => handleCopyCustomerLink(req)}
                      className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                      title="Copy 1-click unlock link for this customer"
                    >
                      {copiedLinkFor === req.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden sm:inline text-emerald-700">{language === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{language === 'bn' ? 'লিংক' : 'Link'}</span>
                        </>
                      )}
                    </button>

                    {/* 4. Direct Phone Call */}
                    <a
                      href={`tel:${cleanPhone}`}
                      className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                      title="Call customer directly"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-700" />
                    </a>

                    {/* 5. Delete Customer */}
                    <button
                      onClick={() => handleDeleteCustomerPrompt(req.id, req.customerName)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete customer permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-cyan-300" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  {language === 'bn' ? 'নতুন হোলসেল কাস্টমার যোগ করুন' : 'Add Wholesale Customer'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddCustomerOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="p-4 sm:p-6 space-y-3.5">
              <p className="text-xs text-slate-500">
                {language === 'bn'
                  ? 'এখানে সরাসরি কাস্টমার যোগ করলে তাকে স্বয়ংক্রিয়ভাবে হোলসেল রেট দেখার অনুমোদন দেওয়া হবে।'
                  : 'Adding a customer directly will automatically grant them wholesale viewing access.'}
              </p>

              {addError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
                  {addError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {language === 'bn' ? 'কাস্টমারের নাম / দোকানের নাম *' : 'Customer / Shop Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: ভাই ভাই এন্টারপ্রাইজ' : 'e.g. Bhai Bhai Enterprise'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {language === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                </label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {language === 'bn' ? 'ঠিকানা / এলাকা (ঐচ্ছিক)' : 'Address / Area (Optional)'}
                </label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: কালিয়াচক চক' : 'e.g. Kaliachak'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {language === 'bn' ? 'নোট / বিবরণ (ঐচ্ছিক)' : 'Notes / Remarks (Optional)'}
                </label>
                <input
                  type="text"
                  value={newCustNotes}
                  onChange={(e) => setNewCustNotes(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: কমার্শিয়াল আরও পার্টস বায়ার' : 'e.g. Regular RO dealer'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'bn' ? 'কাস্টমার সংরক্ষণ করুন' : 'Save Customer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {language === 'bn' ? 'কাস্টমার মুছে ফেলতে চান?' : 'Delete Customer?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {language === 'bn' ? (
                  <>
                    আপনি কি নিশ্চিত যে <strong>"{confirmDelete.name}"</strong>-কে তালিকা থেকে মুছে ফেলতে চান? মুছে ফেললে তার হোলসেল এক্সেস বন্ধ হয়ে যাবে এবং দেখতে হলে তাকে পুনরায় রিকোয়েস্ট পাঠাতে হবে।
                  </>
                ) : (
                  <>
                    Are you sure you want to permanently delete <strong>"{confirmDelete.name}"</strong>? Their wholesale access will be revoked immediately.
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmDeleteExecute}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
