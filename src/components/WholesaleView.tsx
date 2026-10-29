import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileDown, 
  Search, 
  MessageSquare, 
  Boxes, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  EyeOff, 
  PhoneCall, 
  UserCheck,
  Sparkles,
  Eye,
  X,
  Phone,
  Lock,
  ArrowRight,
  Store
} from 'lucide-react';
import { BusinessSettings, Language, Product, UserRole, WholesaleRequest } from '../types';
import { translations } from '../i18n/translations';
import { 
  formatINRNumber, 
  loadWholesaleApproval, 
  loadWholesaleRequests,
  loadCurrentCustomerPhone,
  saveCurrentCustomerPhone,
  loadCurrentCustomerName,
  getCustomerWholesaleStatus,
  normalizePhone
} from '../utils/storage';
import { generateWholesalePDF } from '../utils/pdfGenerator';
import { WholesaleRequestModal } from './WholesaleRequestModal';

interface WholesaleViewProps {
  products: Product[];
  settings: BusinessSettings;
  language: Language;
  userRole: UserRole;
  isWholesaleApproved: boolean;
  isWholesaleHidden?: boolean;
  onToggleWholesaleHidden?: () => void;
  onApproveWholesale: () => void;
  onRevokeWholesale: () => void;
  onRequestWholesale: () => void;
  onOpenApprovalModal?: (customerName: string, customerPhone: string, requestId?: string) => void;
}

export const WholesaleView: React.FC<WholesaleViewProps> = ({
  products,
  settings,
  language,
  userRole,
  isWholesaleApproved,
  isWholesaleHidden = false,
  onToggleWholesaleHidden,
  onApproveWholesale,
  onRevokeWholesale,
  onRequestWholesale,
  onOpenApprovalModal,
}) => {
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [pdfScope, setPdfScope] = useState<'all' | 'filtered'>('filtered');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [wholesaleOrder, setWholesaleOrder] = useState<Record<string, number>>({});

  // Registered customer identity state
  const [customerPhone, setCustomerPhone] = useState<string>(() => loadCurrentCustomerPhone());
  const [customerRecord, setCustomerRecord] = useState<WholesaleRequest | null>(() => 
    getCustomerWholesaleStatus(loadCurrentCustomerPhone())
  );

  // Phone lookup box state (for customers returning or switching devices)
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [lookupInput, setLookupInput] = useState('');
  const [lookupMessage, setLookupMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleWholesaleQty = (product: Product, delta: number) => {
    const initialJump = product.initialAddQty || product.distributorMoq || product.moq || 1;
    const step = Math.max(1, product.qtyStep || 1);
    setWholesaleOrder((prev) => {
      const current = prev[product.id] || 0;
      if (current === 0 && delta > 0) {
        // First click jumps to the exact initial quantity set by the owner (e.g. 100)
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

  const handleDirectWholesaleQty = (productId: string, val: string) => {
    const num = parseInt(val) || 0;
    setWholesaleOrder((prev) => {
      if (num <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: num };
    });
  };

  const selectedWholesaleCount = Object.keys(wholesaleOrder).length;
  const totalWholesaleAmount = useMemo(() => {
    return Object.entries(wholesaleOrder).reduce((sum, [pId, qty]) => {
      const prod = products.find((p) => p.id === pId);
      return sum + (prod ? prod.wholesalePrice * qty : 0);
    }, 0);
  }, [wholesaleOrder, products]);

  const handleSendWholesaleOrderWhatsApp = () => {
    if (selectedWholesaleCount === 0) return;
    const cleanPhone = settings.whatsapp.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    const lines: string[] = [];
    lines.push(`📦 *${settings.businessName} - Distributor Order*`);
    if (customerRecord?.customerName) {
      lines.push(`👤 Distributor / Dealer: *${customerRecord.customerName}* (${customerRecord.customerPhone})`);
    }
    lines.push(`📍 ${settings.address}`);
    lines.push(`📞 Shop Phone: ${settings.phone}`);
    lines.push(`----------------------------------`);
    lines.push(`📋 *Order Items:*`);

    let idx = 1;
    for (const [pId, qty] of Object.entries(wholesaleOrder)) {
      const prod = products.find((p) => p.id === pId);
      if (prod) {
        const itemTotal = prod.wholesalePrice * qty;
        lines.push(`${idx}. *${prod.name}*`);
        lines.push(`   Qty: ${qty} ${prod.unit} × ₹${formatINRNumber(prod.wholesalePrice, settings.decimalPlaces)} = ₹${formatINRNumber(itemTotal, settings.decimalPlaces)}`);
        idx++;
      }
    }

    lines.push(`----------------------------------`);
    lines.push(`💰 *Total Estimated Amount: ₹${formatINRNumber(totalWholesaleAmount, settings.decimalPlaces)}*`);
    lines.push(`----------------------------------`);
    lines.push(`Please confirm distributor stock availability and prepare invoice.`);

    const encoded = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${phoneWithCode}?text=${encoded}`, '_blank');
  };

  // Sync customer record when phone changes or approval state changes
  useEffect(() => {
    const sync = () => {
      const current = loadCurrentCustomerPhone();
      setCustomerPhone(current);
      if (current) {
        const rec = getCustomerWholesaleStatus(current);
        setCustomerRecord(rec);
        if (rec?.status === 'approved' && !isWholesaleApproved) {
          onApproveWholesale();
        } else if (rec?.status === 'hidden' && isWholesaleApproved) {
          onRevokeWholesale();
        }
      } else {
        setCustomerRecord(null);
      }
    };

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    const timer = setInterval(sync, 2500);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      clearInterval(timer);
    };
  }, [isWholesaleApproved, onApproveWholesale, onRevokeWholesale]);

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

  // Request access via WhatsApp
  const handleOpenRequestModal = () => {
    setIsRequestModalOpen(true);
  };

  const handleRequestSubmitted = (custName: string, custPhone: string) => {
    const clean = normalizePhone(custPhone);
    setCustomerPhone(clean);
    saveCurrentCustomerPhone(clean);
    setCustomerRecord(getCustomerWholesaleStatus(clean));
    onRequestWholesale();
  };

  // Quick Phone Lookup
  const handleVerifyPhone = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizePhone(lookupInput);
    if (!clean || clean.length < 10) {
      setLookupMessage({
        text: language === 'bn' ? 'সঠিক ১০ সংখ্যার মোবাইল নম্বর দিন।' : 'Enter a valid 10-digit mobile number.',
        type: 'error',
      });
      return;
    }

    const found = getCustomerWholesaleStatus(clean);
    if (!found) {
      setLookupMessage({
        text: language === 'bn'
          ? 'এই নম্বরে কোনো অনুমোদন রেকর্ড পাওয়া যায়নি। নিচে রিকোয়েস্ট পাঠান।'
          : 'No record found for this number. Please submit a request.',
        type: 'error',
      });
      return;
    }

    saveCurrentCustomerPhone(clean);
    setCustomerPhone(clean);
    setCustomerRecord(found);

    if (found.status === 'approved') {
      onApproveWholesale();
      setLookupMessage({
        text: language === 'bn' ? '✓ অভিনন্দন! আপনার হোলসেল রেট আনলক হয়েছে।' : '✓ Wholesale rates unlocked.',
        type: 'success',
      });
    } else if (found.status === 'hidden') {
      setLookupMessage({
        text: language === 'bn'
          ? 'আপনার অ্যাকাউন্টে হোলসেল রেট সাময়িক বন্ধ রাখা আছে। শপ মালিকের সাথে যোগাযোগ করুন।'
          : 'Your wholesale access is currently paused by the shop.',
        type: 'info',
      });
    } else {
      setLookupMessage({
        text: language === 'bn' ? 'আপনার অনুরোধটি মালিকের অনুমোদনের অপেক্ষায় আছে।' : 'Request pending approval.',
        type: 'info',
      });
    }
  };

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      const targetProducts =
        pdfScope === 'all'
          ? displayableProducts
          : filteredProducts;

      generateWholesalePDF({
        products: targetProducts,
        settings,
        includeImages: false,
      });
      setIsPdfModalOpen(false);
    } catch (err) {
      console.error('PDF error:', err);
      alert('PDF generation encountered an error. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareWholesaleWhatsApp = () => {
    const header = `*${settings.businessName} - WHOLESALE PRICE LIST*\n📍 ${settings.address}\n📞 Tel: ${settings.phone}\n\n`;
    const itemsText = filteredProducts
      .slice(0, 35)
      .map(
        (p, idx) =>
          `${idx + 1}. *${p.name}*\n   • Min Order: ${p.moq} ${p.unit}s\n   • Wholesale: ₹${formatINRNumber(p.wholesalePrice, settings.decimalPlaces)} / ${p.unit}`
      )
      .join('\n\n');

    const footer = `\n\n_Note: Bulk trade rates. Contact 9563340244 for inquiries._`;
    const fullMessage = encodeURIComponent(header + itemsText + footer);
    window.open(`https://wa.me/?text=${fullMessage}`, '_blank');
  };

  // Determine Wholesale Access Status for Customer
  const isOwner = userRole === 'owner';
  const isCustomerApproved = isOwner || (customerRecord !== null && customerRecord.status === 'approved');
  const isCustomerHidden = !isOwner && customerRecord?.status === 'hidden';
  const isCustomerPending = !isOwner && customerRecord?.status === 'pending';

  // 1. IF WHOLESALE IS GLOBALLY HIDDEN BY OWNER:
  if (isWholesaleHidden && !isOwner) {
    return (
      <div className="max-w-md mx-auto px-4 pt-8 pb-36 text-center animate-in zoom-in-95">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-800 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
            <EyeOff className="w-8 h-8 text-rose-700" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Distributor Section Currently Hidden
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Distributor trade pricing is temporarily offline. Please check our Wholesale catalog from the dashboard or call the shop directly.
            </p>
          </div>
          <div className="pt-2">
            <a
              href={`tel:${settings.phone}`}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              <span>Call Shop: {settings.phone}</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 2. IF CUSTOMER IS INDIVIDUALLY HIDDEN BY OWNER:
  if (isCustomerHidden) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-36 text-center animate-in zoom-in-95">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-800 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
            <EyeOff className="w-8 h-8 text-rose-700" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-bold mb-2">
              <EyeOff className="w-3.5 h-3.5 text-rose-600" />
              <span>Distributor Access Paused</span>
            </span>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {customerRecord?.customerName ? `Dear ${customerRecord.customerName}, Distributor Rates Paused` : 'Distributor Rates Paused'}
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Distributor trade pricing has been temporarily paused for your account by the shop owner. You do not need to request again; once turned ON by the owner, rates will automatically reappear.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Status auto-syncs live in real-time</span>
            </div>

            <a
              href={`tel:${settings.phone}`}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Call Owner: {settings.phone}</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3. IF CUSTOMER IS PENDING APPROVAL:
  if (isCustomerPending) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6 pb-36 text-center animate-in zoom-in-95">
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
            <Clock className="w-7 h-7 text-amber-700 animate-pulse" />
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Request Pending Approval
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              {customerRecord?.customerName ? `Dear ${customerRecord.customerName}, ` : ''}Your distributor access request is awaiting owner approval. Once approved, rates will unlock automatically on this phone.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 text-left font-mono space-y-1">
            <div className="font-bold font-sans text-slate-900">{customerRecord?.customerName}</div>
            <div>Ph: {customerRecord?.customerPhone}</div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Auto-unlocks once owner approves</span>
            </div>

            <a
              href={`tel:${settings.phone}`}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              <span>Call Owner</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 4. IF NOT APPROVED YET (First time visitor / No access):
  if (!isCustomerApproved) {
    return (
      <div className="max-w-md mx-auto px-4 pt-4 pb-36 text-center animate-in zoom-in-95">
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 bg-blue-100 text-blue-900 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
            <Lock className="w-7 h-7 text-blue-900" />
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Distributor Access Approval Required
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Viewing distributor bulk rates requires shop owner approval. Submit a request once to send an approval notification to the owner.
            </p>
          </div>

          {/* Business Info */}
          <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-950 text-left space-y-1">
            <div className="font-extrabold flex items-center gap-1.5 text-blue-900">
              <Store className="w-4 h-4 text-blue-700 flex-shrink-0" />
              <span>{settings.businessName}</span>
            </div>
            <p className="text-[11px] text-slate-600">
              {settings.address} • Ph: {settings.phone}
            </p>
          </div>

          {/* Primary Action: Request via WhatsApp */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleOpenRequestModal}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Request Access via WhatsApp</span>
            </button>

            {/* Quick Phone Verification (if already requested/approved before) */}
            <button
              onClick={() => setIsLookupOpen(!isLookupOpen)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Already Approved? Verify Phone Number</span>
            </button>

            {/* Inline Phone Lookup Form */}
            {isLookupOpen && (
              <form onSubmit={handleVerifyPhone} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 animate-in fade-in">
                <input
                  type="tel"
                  value={lookupInput}
                  onChange={(e) => setLookupInput(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs transition cursor-pointer"
                >
                  Verify Status
                </button>
                {lookupMessage && (
                  <div className={`p-2 rounded-lg text-[11px] font-bold ${
                    lookupMessage.type === 'success'
                      ? 'bg-emerald-100 text-emerald-900'
                      : lookupMessage.type === 'info'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-red-100 text-red-900'
                  }`}>
                    {lookupMessage.text}
                  </div>
                )}
              </form>
            )}

            <a
              href={`tel:${settings.phone}`}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
              <span>Call Shop Directly</span>
            </a>
          </div>
        </div>

        {/* Structured Request Modal */}
        <WholesaleRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          settings={settings}
          language={language}
          onRequestSubmitted={handleRequestSubmitted}
        />
      </div>
    );
  }

  // 5. APPROVED WHOLESALE VIEW (Visible for Approved Customers & Shop Owner):
  const pendingRequestsForOwner = isOwner ? loadWholesaleRequests().filter(r => r.status === 'pending') : [];

  return (
    <div className="space-y-4 pb-28 max-w-5xl mx-auto px-3 sm:px-6 pt-3">
      {/* Pending requests alert for Owner */}
      {isOwner && pendingRequestsForOwner.length > 0 && (
        <div className="bg-amber-500/10 border-2 border-amber-400 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900">
                {pendingRequestsForOwner.length} Distributor Access Request Pending
              </div>
              <div className="text-xs text-slate-600">
                {pendingRequestsForOwner[0].customerName} ({pendingRequestsForOwner[0].customerPhone})
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (onOpenApprovalModal) {
                onOpenApprovalModal(
                  pendingRequestsForOwner[0].customerName,
                  pendingRequestsForOwner[0].customerPhone,
                  pendingRequestsForOwner[0].id
                );
              }
            }}
            className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve Now</span>
          </button>
        </div>
      )}

      {/* Customer Approved Badge (For logged in customer) */}
      {!isOwner && customerRecord && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 text-xs text-emerald-950 flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Approved Distributor: <strong className="text-emerald-900">{customerRecord.customerName}</strong>
            </span>
          </div>
          <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
            Distributor Active
          </span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
                <Boxes className="w-3.5 h-3.5" />
                <span>Distributor Trade Catalog</span>
              </span>

              {/* Owner Hide / Unhide Toggle Button */}
              {isOwner && onToggleWholesaleHidden && (
                <button
                  onClick={onToggleWholesaleHidden}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition cursor-pointer shadow-xs ${
                    isWholesaleHidden
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                      : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-200'
                  }`}
                  title={isWholesaleHidden ? 'Click to make Distributor visible' : 'Click to hide Distributor from visitors'}
                >
                  {isWholesaleHidden ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Unhide Distributor</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide Distributor</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              DISTRIBUTOR PRICE LIST
            </h2>
            <p className="text-xs text-slate-500">
              {settings.businessName} • {settings.address} • Ph: {settings.phone}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Download PDF button */}
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-900/20 transition cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            {/* Support / WhatsApp Share */}
            <button
              onClick={handleShareWholesaleWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold transition"
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
        Showing Products: <strong className="text-slate-800">{filteredProducts.length}</strong>
      </div>

      {/* Products Display: Desktop Table & Mobile Cards */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h4 className="text-base font-bold text-slate-700">No products found.</h4>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-5 font-semibold w-12 text-center">#</th>
                  <th className="py-3.5 px-5 font-semibold">Product Name</th>
                  <th className="py-3.5 px-5 font-semibold text-center w-48">Minimum Order (MOQ)</th>
                  <th className="py-3.5 px-5 font-semibold text-right w-44">Distributor Rate (₹)</th>
                  <th className="py-3.5 px-5 font-semibold text-center w-28">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product, idx) => (
                  <tr key={product.id} className="hover:bg-blue-50/40 transition">
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
                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        Min {product.distributorMoq || product.moq || 1} {product.unit}s
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="text-base font-black text-blue-900">
                        ₹{formatINRNumber(product.wholesalePrice, settings.decimalPlaces)}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-center text-xs text-slate-600 font-bold">
                      {product.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredProducts.map((product) => {
              const qty = wholesaleOrder[product.id] || 0;
              const isSelected = qty > 0;

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-3xl p-4 sm:p-5 shadow-xs border transition-all ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-500/15' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {language === 'bn' ? 'প্রতি' : 'per'} {product.unit}
                        </span>
                        {product.qtyStep && product.qtyStep > 1 ? (
                          <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded-md border border-blue-200">
                            ধাপ: +{product.qtyStep}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Quantity Picker for Bulk Order */}
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200 flex-shrink-0">
                      <button
                        onClick={() => handleWholesaleQty(product, -1)}
                        disabled={qty === 0}
                        className="w-7 h-7 rounded-xl bg-white hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                        title="Decrease"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={qty === 0 ? '' : qty}
                        placeholder="0"
                        onChange={(e) => handleDirectWholesaleQty(product.id, e.target.value)}
                        className="w-14 text-center font-bold text-xs text-slate-900 font-mono bg-white rounded-lg border border-slate-200 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={() => handleWholesaleQty(product, 1)}
                        className="w-7 h-7 rounded-xl bg-blue-900 hover:bg-blue-800 text-white flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                        title={qty === 0 ? `Add ${product.initialAddQty || product.distributorMoq || product.moq || 1}` : `Add ${product.qtyStep || 1}`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Clean Divider Line Between Name and Price */}
                  <div className="border-t border-slate-200/90 my-3"></div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block">
                        Minimum Order (MOQ)
                      </span>
                      <span className="font-bold text-xs text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 inline-block">
                        Min {product.distributorMoq || product.moq || 1} {product.unit}s
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">
                        Distributor Rate
                      </span>
                      <div className="text-base sm:text-lg font-black text-blue-900 font-mono">
                        ₹{formatINRNumber(product.wholesalePrice, settings.decimalPlaces)}
                        <span className="text-[11px] font-normal text-slate-500 ml-1">
                          / {product.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Floating Wholesale Order Cart Bar */}
      {selectedWholesaleCount > 0 && (
        <div className="fixed bottom-24 sm:bottom-28 left-3.5 right-3.5 sm:left-auto sm:right-auto sm:w-[480px] sm:left-1/2 sm:-translate-x-1/2 z-40 animate-in slide-in-from-bottom duration-200">
          <div className="bg-slate-950 text-white p-3.5 rounded-3xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-cyan-400 font-bold">
                {selectedWholesaleCount} items selected in distributor order
              </div>
              <div className="text-base sm:text-lg font-black text-white font-mono">
                ₹{formatINRNumber(totalWholesaleAmount, settings.decimalPlaces)}
              </div>
            </div>

            <button
              onClick={handleSendWholesaleOrderWhatsApp}
              className="py-2.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Order via WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* PDF Download Options Modal */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-blue-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base">{t.pdfModalTitle}</h3>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  {t.pdfScopeLabel}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="pdfScope"
                      checked={pdfScope === 'filtered'}
                      onChange={() => setPdfScope('filtered')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {t.pdfFilteredProducts}
                      </div>
                      <div className="text-xs text-slate-500">
                        Includes {filteredProducts.length} items currently showing
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="pdfScope"
                      checked={pdfScope === 'all'}
                      onChange={() => setPdfScope('all')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {t.pdfAllProducts}
                      </div>
                      <div className="text-xs text-slate-500">
                        Includes all {displayableProducts.length} active products
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/70 rounded-2xl text-xs text-blue-900 space-y-1">
                <div className="font-bold">PDF Format: Standard A4 Portrait</div>
                <div>Filename: NEW_ASHIQUE_ENTERPRISE_WHOLESALE_{new Date().toISOString().split('T')[0]}.pdf</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FileDown className="w-4 h-4" />
                  <span>{isGeneratingPdf ? t.pdfGenerating : t.pdfDownloadBtn}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
