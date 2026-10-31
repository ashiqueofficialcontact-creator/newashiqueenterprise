/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BusinessSettings, Language, MoreSubView, Product, Quotation, UserRole, ViewTab, WholesaleRequest 
} from './types';
import { 
  DEFAULT_SETTINGS, SAMPLE_PRODUCTS, calculateProfit, loadCategories, loadProducts, loadQuotations, loadSettings,
  loadWholesaleApproval, loadWholesaleHidden, loadWholesaleRequests, saveCategory, saveProducts, saveQuotations, 
  saveSettings, saveWholesaleApproval, saveWholesaleHidden, saveCurrentCustomerPhone, saveCurrentCustomerName,
  getCustomerWholesaleStatus, addWholesaleRequest, normalizePhone
} from './utils/storage';
import { Header } from './components/Header';
import { CustomerViewBanner } from './components/CustomerViewBanner';
import { BottomNav } from './components/BottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { WholesaleView } from './components/WholesaleView';
import { RetailView } from './components/RetailView';
import { OwnerProfitDesk } from './components/OwnerProfitDesk';
import { ProductsView } from './components/ProductsView';
import { ProductFormModal } from './components/ProductFormModal';
import { ImportExportModal } from './components/ImportExportModal';
import { QuotationModal } from './components/QuotationModal';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { PinModal } from './components/PinModal';
import { HelpModal } from './components/HelpModal';
import { WholesaleApprovalModal } from './components/WholesaleApprovalModal';
import { WholesaleApprovalsView } from './components/WholesaleApprovalsView';
import { CheckCircle2, AlertCircle } from 'lucide-react';

// ফায়ারবেস সেটআপ
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, update } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCTOpPb5ezcWsKaH7g5LF6DVJ2agwuVW2o",
  authDomain: "new-ashique-enterprise.firebaseapp.com",
  projectId: "new-ashique-enterprise",
  storageBucket: "new-ashique-enterprise.firebasestorage.app",
  messagingSenderId: "90702515820",
  appId: "1:90702515820:web:62c1e1b129c7e3a338d249",
  databaseURL: "https://new-ashique-enterprise-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [settings, setSettings] = useState<BusinessSettings>(() => loadSettings());
  const [quotations, setQuotations] = useState<Quotation[]>(() => loadQuotations());
  const [categories, setCategories] = useState<string[]>(() => loadCategories());

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('nae_language_choice_v1') as Language) || settings.defaultLanguage || 'en';
  });

  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [currentTab, setCurrentTab] = useState<ViewTab>('home');
  const [activeSubView, setActiveSubView] = useState<MoreSubView>('none');

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [approvalModalData, setApprovalModalData] = useState<{
    isOpen: boolean; customerName: string; customerPhone: string; requestId?: string;
  }>({ isOpen: false, customerName: '', customerPhone: '' });

  const historyStackRef = useRef<Array<{ tab: ViewTab; subView: MoreSubView }>>([{ tab: 'home', subView: 'none' }]);

  const currentTabRef = useRef(currentTab); currentTabRef.current = currentTab;
  const activeSubViewRef = useRef(activeSubView); activeSubViewRef.current = activeSubView;
  const isExitModalOpenRef = useRef(isExitModalOpen); isExitModalOpenRef.current = isExitModalOpen;
  const isProductModalOpenRef = useRef(isProductModalOpen); isProductModalOpenRef.current = isProductModalOpen;
  const isImportExportOpenRef = useRef(isImportExportOpen); isImportExportOpenRef.current = isImportExportOpen;
  const isQuotationOpenRef = useRef(isQuotationOpen); isQuotationOpenRef.current = isQuotationOpen;
  const isPinModalOpenRef = useRef(isPinModalOpen); isPinModalOpenRef.current = isPinModalOpen;
  const isHelpOpenRef = useRef(isHelpOpen); isHelpOpenRef.current = isHelpOpen;
  const approvalModalDataRef = useRef(approvalModalData); approvalModalDataRef.current = approvalModalData;

  const [wholesaleRequests, setWholesaleRequests] = useState<WholesaleRequest[]>(() => loadWholesaleRequests());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTabChange = (newTab: ViewTab) => {
    if (currentTab !== newTab || activeSubView !== 'none') {
      historyStackRef.current.push({ tab: newTab, subView: 'none' });
      try { window.history.pushState({ naeApp: true }, ''); } catch (e) {}
      setCurrentTab(newTab);
      setActiveSubView('none');
    }
  };

  useEffect(() => {
    try { window.history.replaceState({ naeApp: true }, ''); window.history.pushState({ naeApp: true }, ''); } catch (e) {}

    const onPopState = () => {
      if (isExitModalOpenRef.current) { setIsExitModalOpen(false); try { window.history.pushState({ naeApp: true }, ''); } catch (e) {} return; }
      if (isProductModalOpenRef.current) { setIsProductModalOpen(false); try { window.history.pushState({ naeApp: true }, ''); } catch (e) {} return; }
      if (isImportExportOpenRef.current) { setIsImportExportOpen(false); try { window.history.pushState({ naeApp: true }, ''); } catch (e) {} return; }
      if (isQuotationOpenRef.current) { setIsQuotationOpen(false); try { window.history.pushState({ naeApp: true }, ''); } catch (e) {} return; }
      if (isPinModalOpenRef.current) { setIsPinModalOpen(false); try { window.history.pushState({ naeApp: true }, ''); } catch (e) {} return; }
      if (isHelpOpenRef.current) { setIsHelpOpen(false); try { window.history.pushState({ naeApp: true }, ''); } catch (e) {} return; }
      if (approvalModalDataRef.current.isOpen) {
        setApprovalModalData((prev) => ({ ...prev, isOpen: false }));
        try { window.history.pushState({ naeApp: true }, ''); } catch (e) {} return;
      }
      if (activeSubViewRef.current !== 'none') {
        setActiveSubView('none');
        try { window.history.pushState({ naeApp: true }, ''); } catch (e) {} return;
      }
      if (currentTabRef.current !== 'home') {
        if (historyStackRef.current.length > 1) {
          historyStackRef.current.pop();
          const prev = historyStackRef.current[historyStackRef.current.length - 1];
          if (prev) { setCurrentTab(prev.tab); setActiveSubView(prev.subView || 'none'); } 
          else { setCurrentTab('home'); setActiveSubView('none'); }
        } else { setCurrentTab('home'); setActiveSubView('none'); }
        try { window.history.pushState({ naeApp: true }, ''); } catch (e) {} return;
      }
      setIsExitModalOpen(true);
      try { window.history.pushState({ naeApp: true }, ''); } catch (e) {}
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => { if (e.touches.length === 1) { touchStartY = e.touches[0].clientY; } };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touchCurrentY = e.touches[0].clientY;
        const currentScrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        if (currentScrollTop <= 0 && touchCurrentY > touchStartY) {
          if (e.cancelable) { e.preventDefault(); }
        }
      }
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => { window.removeEventListener('touchstart', onTouchStart); window.removeEventListener('touchmove', onTouchMove); };
  }, []);

  useEffect(() => { localStorage.setItem('nae_language_choice_v1', language); }, [language]);
  useEffect(() => { localStorage.setItem('nae_current_role_v1', userRole); }, [userRole]);

  // ফায়ারবেস থেকে লাইভ রিকোয়েস্ট সিঙ্ক
  useEffect(() => {
    if (userRole === 'owner') {
      const reqRef = ref(db, 'requests/');
      const unsubscribe = onValue(reqRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const requestsArray = Object.values(data) as WholesaleRequest[];
          setWholesaleRequests(requestsArray);
        }
      });
      return () => unsubscribe();
    }
  }, [userRole]);

  const [isWholesaleApproved, setIsWholesaleApproved] = useState(() => loadWholesaleApproval());
  const [isWholesaleHidden, setIsWholesaleHidden] = useState<boolean>(() => loadWholesaleHidden());
  const [hasWholesaleRequest, setHasWholesaleRequest] = useState(() => {
    return loadWholesaleRequests().some((r) => r.status === 'pending');
  });

  const visibleTabs: ViewTab[] = useMemo(() => {
    if (userRole === 'owner') return ['home', 'wholesale', 'retail', 'products', 'owner-desk'];
    return isWholesaleHidden ? ['home', 'retail'] : ['home', 'wholesale', 'retail'];
  }, [userRole, isWholesaleHidden]);

  const currentTabIdx = useMemo(() => {
    const idx = visibleTabs.indexOf(currentTab);
    return idx >= 0 ? idx : 0;
  }, [visibleTabs, currentTab]);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); (window as any).deferredPrompt = e; };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const reqName = params.get('name') || params.get('customer_name') || '';
      const reqPhone = params.get('phone') || params.get('customer_phone') || '';
      const reqId = params.get('req_id') || '';
      const wholesaleParam = params.get('wholesale');

      if (action === 'approve_wholesale') {
        if (reqPhone && reqName) {
          addWholesaleRequest({ customerName: reqName, customerPhone: reqPhone });
          setWholesaleRequests(loadWholesaleRequests());
        }
        setApprovalModalData({ isOpen: true, customerName: reqName, customerPhone: reqPhone, requestId: reqId });
      } else if (wholesaleParam === 'open') {
        if (reqPhone) saveCurrentCustomerPhone(reqPhone);
        if (reqName) saveCurrentCustomerName(reqName);
        setIsWholesaleApproved(true);
        saveWholesaleApproval(true);
        setCurrentTab('wholesale');
        showToast('Wholesale rates unlocked.');
      }
    } catch (e) { console.error('URL parse error:', e); }
  }, []);

  const swipeContainerRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const isHorizontalGesture = useRef<boolean | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const target = e.target as HTMLElement;
    if (target.closest('input, textarea, select, [data-no-swipe]')) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDraggingRef.current = true;
    isHorizontalGesture.current = null;
    if (swipeContainerRef.current) { swipeContainerRef.current.style.transition = 'none'; }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || touchStartX.current === null || touchStartY.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    if (isHorizontalGesture.current === null) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) { isHorizontalGesture.current = Math.abs(diffX) > Math.abs(diffY); }
    }

    if (isHorizontalGesture.current === false) return;

    if (isHorizontalGesture.current === true && swipeContainerRef.current) {
      const pageWidth = window.innerWidth;
      let moveX = -(currentTabIdx * pageWidth) + diffX;
      if (moveX > 0) moveX = 0;
      const maxMove = -((visibleTabs.length - 1) * pageWidth);
      if (moveX < maxMove) moveX = maxMove;
      // ১২০fps স্মুথ স্লাইড 
      swipeContainerRef.current.style.transform = `translate3d(${moveX}px, 0, 0)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || touchStartX.current === null) {
      isDraggingRef.current = false;
      return;
    }
    isDraggingRef.current = false;
    if (swipeContainerRef.current) { swipeContainerRef.current.style.transition = 'transform 0.25s ease-out'; }
    
    const endX = e.changedTouches[0].clientX;
    const diff = endX - touchStartX.current;
    const isHorizontal = isHorizontalGesture.current;

    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalGesture.current = null;

    if (activeSubView !== 'none') return;

    if (isHorizontal) {
      if (diff < -60 && currentTabIdx < visibleTabs.length - 1) {
        handleTabChange(visibleTabs[currentTabIdx + 1]);
        return;
      } else if (diff > 60 && currentTabIdx > 0) {
        handleTabChange(visibleTabs[currentTabIdx - 1]);
        return;
      }
    }
    // ১২০fps স্মুথ স্লাইড
    if (swipeContainerRef.current) {
      swipeContainerRef.current.style.transform = `translate3d(-${(currentTabIdx / visibleTabs.length) * 100}%, 0, 0)`;
    }
  };

  useEffect(() => {
    if (swipeContainerRef.current) {
      swipeContainerRef.current.style.transition = 'transform 0.25s ease-out';
      swipeContainerRef.current.style.transform = `translate3d(-${(currentTabIdx / visibleTabs.length) * 100}%, 0, 0)`;
    }
  }, [currentTabIdx, visibleTabs.length]);

  // ব্যাক বাটন এক্সিট কন্ট্রোল
  const handleConfirmExit = () => {
    window.close(); 
    setTimeout(() => { window.history.go(-3); }, 100);
  };
  
  const handleCancelExit = () => {
    setIsExitModalOpen(false);
    try { window.history.pushState({ naeApp: true }, ''); } catch (e) {}
  };

  const handleToggleRole = () => {
    if (userRole === 'owner') { setUserRole('customer'); handleTabChange('home'); showToast('Switched to Guest View.'); } 
    else { setIsPinModalOpen(true); }
  };

  const handlePinSuccess = () => {
    setUserRole('owner'); setIsPinModalOpen(false); handleTabChange('home'); showToast('Unlocked Owner Mode.');
  };

  // ফায়ারবেস রিকোয়েস্ট একসেপ্ট 
  const handleApproveWholesale = () => {
    const phone = approvalModalData.customerPhone;
    if (phone) {
      update(ref(db, 'requests/' + phone), { status: 'approved' });
    }
    setIsWholesaleApproved(true); saveWholesaleApproval(true); setHasWholesaleRequest(false);
    showToast('হোলসেল রিকোয়েস্ট একসেপ্ট করা হয়েছে!');
  };

  const handleRevokeWholesale = () => {
    setIsWholesaleApproved(false); saveWholesaleApproval(false); showToast('Wholesale access hidden.');
  };

  const handleToggleWholesaleHidden = () => {
    const nextVal = !isWholesaleHidden;
    setIsWholesaleHidden(nextVal); saveWholesaleHidden(nextVal);
    showToast(nextVal ? 'Wholesale hidden from Dashboard.' : 'Wholesale is now visible on Dashboard.');
  };

  // ফায়ারবেস রিকোয়েস্ট সেন্ড
  const handleRequestWholesale = () => {
    const customerPhone = prompt("আপনার মোবাইল নম্বর দিন (যেমন: 9563340244):");
    const customerName = prompt("আপনার নাম দিন:");
    
    if (customerPhone && customerName) {
      set(ref(db, 'requests/' + customerPhone), {
        customerName: customerName,
        customerPhone: customerPhone,
        status: 'pending',
        time: new Date().toISOString()
      });
      setHasWholesaleRequest(true);
      showToast('রিকোয়েস্ট পাঠানো হয়েছে। অনুমোদনের অপেক্ষা করুন।');
    } else {
      showToast('নাম এবং মোবাইল নম্বর দেওয়া বাধ্যতামূলক!');
    }
  };

  const handleSaveProduct = (productData: Omit<Product, 'id' | 'lastUpdated'>, andAddAnother: boolean = false) => {
    if (editingProduct) {
      const updatedList = products.map((p) => p.id === editingProduct.id ? { ...p, ...productData, lastUpdated: new Date().toISOString(), } : p );
      setProducts(updatedList); saveProducts(updatedList); showToast('Product updated successfully!'); setEditingProduct(null); setIsProductModalOpen(false);
    } else {
      const newProduct: Product = { ...productData, id: 'prod_' + Math.random().toString(36).substr(2, 9), lastUpdated: new Date().toISOString(), };
      const updatedList = [newProduct, ...products];
      setProducts(updatedList); saveProducts(updatedList); showToast('New product added to inventory!');
      if (!andAddAnother) { setIsProductModalOpen(false); }
    }
  };

  const handleDuplicateProduct = (product: Product) => {
    const duplicated: Product = { ...product, id: 'prod_' + Math.random().toString(36).substr(2, 9), name: `${product.name} (Copy)`, code: `${product.code}-COPY`, lastUpdated: new Date().toISOString(), };
    const updatedList = [duplicated, ...products];
    setProducts(updatedList); saveProducts(updatedList); showToast(`Duplicated ${product.name}`);
  };

  const handleDeleteProduct = (productId: string) => {
    const updatedList = products.filter((p) => p.id !== productId);
    setProducts(updatedList); saveProducts(updatedList); showToast('Product removed.');
  };

  const handleToggleActive = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    const willBeActive = target ? !target.isActive : true;
    const updatedList = products.map((p) => p.id === productId ? { ...p, isActive: !p.isActive } : p );
    setProducts(updatedList); saveProducts(updatedList);
    showToast(willBeActive ? '✓ In Stock: Now Live in Wholesale & Retail.' : '✕ Out of Stock: Hidden from Wholesale & Retail.');
  };

  // Exit Modal এর ভেতরে কাজ করার জন্য গ্লোবাল ফাংশন
  (window as any).handleConfirmExit = handleConfirmExit;
  (window as any).handleCancelExit = handleCancelExit;

  const handleUpdateProductPrices = (productId: string, purchasePrice: number, retailPrice: number) => {
    const { profitAmount, profitCostPct, profitMarginPct } = calculateProfit( = (
    productId: string,
    purchasePrice: number,
    retailPrice: number
  ) => {
    const { profitAmount, profitCostPct, profitMarginPct } = calculateProfit(
      purchasePrice,
      retailPrice
    );

    const updatedList = products.map((p) =>
      p.id === productId
        ? {
            ...p,
            purchasePrice,
            retailPrice,
            profitAmount,
            profitCostPct,
            profitMarginPct,
            lastUpdated: new Date().toISOString(),
          }
        : p
    );
    setProducts(updatedList);
    saveProducts(updatedList);
    showToast('Prices updated.');
  };

  // Add custom category
  const handleAddCategory = (catName: string) => {
    const updated = saveCategory(catName);
    setCategories(updated);
  };

  // Clear demo data
  const handleClearDemoData = () => {
    const realProductsOnly = products.filter((p) => !p.isDemo);
    setProducts(realProductsOnly);
    saveProducts(realProductsOnly);
    showToast('Sample demo products cleared. You can now add your shop stock!');
  };

  // Reset to default sample inventory
  const handleResetDemoData = () => {
    setProducts(SAMPLE_PRODUCTS);
    saveProducts(SAMPLE_PRODUCTS);
    showToast('Demo catalog restored.');
  };

  // Restore products from JSON
  const handleRestoreProducts = (restoredList: Product[]) => {
    setProducts(restoredList);
    saveProducts(restoredList);
    showToast('Inventory successfully restored!');
  };

  // Save settings
  const handleSaveSettings = (newSettings: BusinessSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    showToast('Settings saved successfully.');
  };

  // Save quotation
  const handleSaveQuotation = (newQuote: Quotation) => {
    const updatedQuotes = [newQuote, ...quotations];
    setQuotations(updatedQuotes);
    saveQuotations(updatedQuotes);
    showToast('Quotation saved to history.');
  };

  // Handle More subview actions
  const handleSelectMoreAction = (action: MoreSubView) => {
    historyStackRef.current.push({ tab: currentTab, subView: action });
    try {
      window.history.pushState({ naeApp: true }, '');
    } catch (e) {}

    switch (action) {
      case 'add-product':
        setEditingProduct(null);
        setIsProductModalOpen(true);
        break;
      case 'import-export':
        setIsImportExportOpen(true);
        break;
      case 'quotations':
        setIsQuotationOpen(true);
        break;
      case 'reports':
        setActiveSubView('reports');
        break;
      case 'backup':
      case 'settings':
        setActiveSubView('settings');
        break;
      case 'wholesale-approvals':
        setActiveSubView('wholesale-approvals');
        break;
      case 'help':
        setIsHelpOpen(true);
        break;
      default:
        setActiveSubView('none');
        break;
    }
  };

  return (
    <div className={`fixed inset-0 overflow-hidden bg-slate-50 flex flex-col font-sans select-none ${language === 'bn' ? 'font-bengali' : ''}`}>
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-bold border border-slate-700 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        settings={settings}
        language={language}
        onLanguageChange={setLanguage}
        userRole={userRole}
        onToggleRole={handleToggleRole}
        onOpenSettings={() => setActiveSubView('settings')}
        onOpenAddProduct={() => {
          setEditingProduct(null);
          setIsProductModalOpen(true);
        }}
      />

      {/* Main Content Area (WhatsApp Style Continuous Horizontal Sliding Track) */}
      <main className="flex-1 w-full overflow-hidden relative">
        {/* If a subview from More is active (e.g. Reports or Settings) */}
        {activeSubView === 'reports' ? (
          <div className="page-scroll-view pt-2 pb-44 sm:pb-48">
            <div className="max-w-6xl mx-auto px-3 sm:px-6 mb-2">
              <button
                onClick={() => setActiveSubView('none')}
                className="text-xs font-bold text-blue-900 hover:underline cursor-pointer"
              >
                ← Back to Dashboard
              </button>
            </div>
            <ReportsView
              products={products}
              settings={settings}
              language={language}
              userRole={userRole}
              onPromptUnlockOwner={() => setIsPinModalOpen(true)}
            />
          </div>
        ) : activeSubView === 'settings' ? (
          <div className="page-scroll-view pt-2 pb-44 sm:pb-48">
            <div className="max-w-4xl mx-auto px-3 sm:px-6 mb-2">
              <button
                onClick={() => setActiveSubView('none')}
                className="text-xs font-bold text-blue-900 hover:underline cursor-pointer"
              >
                ← Back to Dashboard
              </button>
            </div>
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              language={language}
              onLanguageChange={setLanguage}
              userRole={userRole}
              products={products}
              onRestoreProducts={handleRestoreProducts}
              onResetDemoData={handleResetDemoData}
              onPromptUnlockOwner={() => setIsPinModalOpen(true)}
            />
          </div>
        ) : activeSubView === 'wholesale-approvals' ? (
          <div className="page-scroll-view pb-44 sm:pb-48">
            <WholesaleApprovalsView
              requests={wholesaleRequests}
              settings={settings}
              language={language}
              isWholesaleApproved={isWholesaleApproved}
              isWholesaleHidden={isWholesaleHidden}
              onToggleWholesaleHidden={handleToggleWholesaleHidden}
              onApproveWholesale={handleApproveWholesale}
              onRevokeWholesale={handleRevokeWholesale}
              onRefreshRequests={() => setWholesaleRequests(loadWholesaleRequests())}
              onBack={() => setActiveSubView('none')}
            />
          </div>
        ) : (
          /* WhatsApp Style Continuous Horizontal Sliding Track */
          <div
            ref={swipeContainerRef}
            className="swipe-container"
            style={{
              width: `${visibleTabs.length * 100}%`,
              transform: `translateX(-${(currentTabIdx / visibleTabs.length) * 100}%)`,
              transition: 'transform 0.25s ease-out',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {visibleTabs.map((tabKey) => (
              <div
                key={tabKey}
                className="page-scroll-view pb-44 sm:pb-48"
                style={{
                  width: `${100 / visibleTabs.length}%`,
                }}
              >
                {tabKey === 'home' && (
                  <HomeDashboard
                    products={products}
                    settings={settings}
                    language={language}
                    userRole={userRole}
                    onNavigate={handleTabChange}
                    onOpenAddProduct={() => {
                      setEditingProduct(null);
                      setIsProductModalOpen(true);
                    }}
                    onClearDemoData={handleClearDemoData}
                    isWholesaleApproved={isWholesaleApproved}
                    isWholesaleHidden={isWholesaleHidden}
                    onToggleWholesaleHidden={handleToggleWholesaleHidden}
                    hasWholesaleRequest={hasWholesaleRequest}
                    onApproveWholesale={handleApproveWholesale}
                    onRevokeWholesale={handleRevokeWholesale}
                    onOpenApprovalModal={(name, phone, reqId) =>
                      setApprovalModalData({
                        isOpen: true,
                        customerName: name,
                        customerPhone: phone,
                        requestId: reqId,
                      })
                    }
                  />
                )}

                {tabKey === 'wholesale' && (
                  <WholesaleView
                    products={products}
                    settings={settings}
                    language={language}
                    userRole={userRole}
                    isWholesaleApproved={isWholesaleApproved}
                    isWholesaleHidden={isWholesaleHidden}
                    onToggleWholesaleHidden={handleToggleWholesaleHidden}
                    onApproveWholesale={handleApproveWholesale}
                    onRevokeWholesale={handleRevokeWholesale}
                    onRequestWholesale={handleRequestWholesale}
                    onOpenApprovalModal={(name, phone, reqId) =>
                      setApprovalModalData({
                        isOpen: true,
                        customerName: name,
                        customerPhone: phone,
                        requestId: reqId,
                      })
                    }
                  />
                )}

                {tabKey === 'retail' && (
                  <RetailView
                    products={products}
                    settings={settings}
                    language={language}
                  />
                )}

                {tabKey === 'products' && (
                  <ProductsView
                    products={products}
                    settings={settings}
                    language={language}
                    userRole={userRole}
                    categories={categories}
                    onOpenAddModal={() => {
                      setEditingProduct(null);
                      setIsProductModalOpen(true);
                    }}
                    onOpenEditModal={(product) => {
                      setEditingProduct(product);
                      setIsProductModalOpen(true);
                    }}
                    onDuplicateProduct={handleDuplicateProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onToggleActive={handleToggleActive}
                    onOpenImportExport={() => setIsImportExportOpen(true)}
                  />
                )}

                {tabKey === 'owner-desk' && (
                  <OwnerProfitDesk
                    products={products}
                    settings={settings}
                    language={language}
                    onUpdateProductPrices={handleUpdateProductPrices}
                    onToggleActive={handleToggleActive}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={handleTabChange}
        language={language}
        userRole={userRole}
        isWholesaleHidden={isWholesaleHidden}
        onSelectMoreAction={handleSelectMoreAction}
        onToggleRole={handleToggleRole}
        pendingRequestsCount={wholesaleRequests.filter((r) => r.status === 'pending').length}
      />

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        productToEdit={editingProduct}
        categories={categories}
        onAddCategory={handleAddCategory}
        language={language}
        settings={settings}
      />

      {/* Import / Export Modal */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        products={products}
        onImportProducts={(updatedCatalog, summary) => {
          setProducts(updatedCatalog);
          saveProducts(updatedCatalog);
          showToast(summary);
        }}
        language={language}
        settings={settings}
      />

      {/* Quotation Generator Modal */}
      <QuotationModal
        isOpen={isQuotationOpen}
        onClose={() => setIsQuotationOpen(false)}
        products={products}
        settings={settings}
        language={language}
        onSaveQuotation={handleSaveQuotation}
      />

      {/* PIN Unlock Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        correctPin={settings.ownerPin}
        language={language}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        language={language}
        settings={settings}
      />

      {/* Wholesale Approval Modal (Triggered by WhatsApp Link or Owner Click) */}
      <WholesaleApprovalModal
        isOpen={approvalModalData.isOpen}
        onClose={() => setApprovalModalData((prev) => ({ ...prev, isOpen: false }))}
        customerName={approvalModalData.customerName}
        customerPhone={approvalModalData.customerPhone}
        requestId={approvalModalData.requestId}
        settings={settings}
        language={language}
        userRole={userRole}
        onApproveSuccess={() => {
          handleApproveWholesale();
          setWholesaleRequests(loadWholesaleRequests());
        }}
      />

      {/* Android Back Button Exit Confirmation Warning Modal */}
      {isExitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 mx-auto flex items-center justify-center border border-teal-200">
              <AlertCircle className="w-6 h-6 text-[#075e54]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Do you really want to exit?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Do you want to exit NEW ASHIQUE ENTERPRISE?
              </p>
            </div>
            <div className="flex justify-between gap-2.5 pt-2">
              <button
                onClick={() => setIsExitModalOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition cursor-pointer"
              >
                No
              </button>
              <button
                onClick={() => {
                  setIsExitModalOpen(false);
                  try {
                    window.open('', '_self', '');
                    window.close();
                  } catch (e) {}
                  setTimeout(() => {
                    window.location.href = 'about:blank';
                  }, 100);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#075e54] hover:bg-[#064e46] text-white font-bold text-sm shadow-md transition cursor-pointer"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
