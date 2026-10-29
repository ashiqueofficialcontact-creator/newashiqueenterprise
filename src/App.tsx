/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  BusinessSettings, 
  Language, 
  MoreSubView, 
  Product, 
  Quotation, 
  UserRole, 
  ViewTab,
  WholesaleRequest 
} from './types';
import { 
  DEFAULT_SETTINGS, 
  SAMPLE_PRODUCTS, 
  calculateProfit, 
  loadCategories, 
  loadProducts, 
  loadQuotations, 
  loadSettings,
  loadWholesaleApproval,
  loadWholesaleHidden,
  loadWholesaleRequests,
  saveCategory, 
  saveProducts, 
  saveQuotations, 
  saveSettings,
  saveWholesaleApproval,
  saveWholesaleHidden,
  saveCurrentCustomerPhone,
  saveCurrentCustomerName,
  getCustomerWholesaleStatus,
  addWholesaleRequest,
  normalizePhone
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

export default function App() {
  // Primary application data state
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [settings, setSettings] = useState<BusinessSettings>(() => loadSettings());
  const [quotations, setQuotations] = useState<Quotation[]>(() => loadQuotations());
  const [categories, setCategories] = useState<string[]>(() => loadCategories());

  // Preferences & active view state
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('nae_language_choice_v1') as Language) || settings.defaultLanguage || 'en';
  });

  // App must always launch in 'customer' (Guest View) mode by default
  const [userRole, setUserRole] = useState<UserRole>('customer');

  const [currentTab, setCurrentTab] = useState<ViewTab>('home');

  // Sub-view overlays from "More" menu
  const [activeSubView, setActiveSubView] = useState<MoreSubView>('none');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [approvalModalData, setApprovalModalData] = useState<{
    isOpen: boolean;
    customerName: string;
    customerPhone: string;
    requestId?: string;
  }>({
    isOpen: false,
    customerName: '',
    customerPhone: '',
  });

  const [wholesaleRequests, setWholesaleRequests] = useState<WholesaleRequest[]>(() =>
    loadWholesaleRequests()
  );

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Persist language and role changes
  useEffect(() => {
    localStorage.setItem('nae_language_choice_v1', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('nae_current_role_v1', userRole);
  }, [userRole]);

  // Wholesale section access approval flow (Owner approval instead of passwords)
  const [isWholesaleApproved, setIsWholesaleApproved] = useState(() => loadWholesaleApproval());
  const [isWholesaleHidden, setIsWholesaleHidden] = useState<boolean>(() => loadWholesaleHidden());
  const [hasWholesaleRequest, setHasWholesaleRequest] = useState(() => {
    return loadWholesaleRequests().some((r) => r.status === 'pending');
  });

  // Capture beforeinstallprompt for native PWA WebAPK install
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Check URL parameters on mount (WhatsApp approval link or unlock link)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const reqName = params.get('name') || params.get('customer_name') || '';
      const reqPhone = params.get('phone') || params.get('customer_phone') || '';
      const reqId = params.get('req_id') || '';
      const wholesaleParam = params.get('wholesale');

      if (action === 'approve_wholesale') {
        // Ensure request is registered in the owner's database with customer details
        if (reqPhone && reqName) {
          addWholesaleRequest({
            customerName: reqName,
            customerPhone: reqPhone,
          });
          setWholesaleRequests(loadWholesaleRequests());
        }
        setApprovalModalData({
          isOpen: true,
          customerName: reqName,
          customerPhone: reqPhone,
          requestId: reqId,
        });
      } else if (wholesaleParam === 'open') {
        if (reqPhone) {
          saveCurrentCustomerPhone(reqPhone);
        }
        if (reqName) {
          saveCurrentCustomerName(reqName);
        }
        setIsWholesaleApproved(true);
        saveWholesaleApproval(true);
        setCurrentTab('wholesale');
        showToast(language === 'bn' ? 'হোলসেল রেট আনলক হয়েছে।' : 'Wholesale rates unlocked.');
      }
    } catch (e) {
      console.error('URL parse error:', e);
    }
  }, []);

  // Swipe gesture navigation for horizontal sliding between Wholesale, Retail, and Home
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const target = e.target as HTMLElement;
    // Don't intercept swipe when user is typing, scrolling an input, or inside a modal
    if (target.closest('input, textarea, select, [data-no-swipe]')) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    if (activeSubView !== 'none') {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    // Minimum swipe distance threshold (50px) and must be horizontal gesture
    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY) * 1.4) {
      return;
    }

    const visibleTabs: ViewTab[] =
      userRole === 'owner'
        ? ['home', 'wholesale', 'retail', 'products', 'owner-desk']
        : isWholesaleHidden
        ? ['home', 'retail']
        : ['home', 'wholesale', 'retail'];

    const currentIndex = visibleTabs.indexOf(currentTab);
    if (currentIndex === -1) return;

    if (deltaX < 0) {
      // Swiped Left (finger moves right to left) -> Advance to next tab
      if (currentIndex < visibleTabs.length - 1) {
        setCurrentTab(visibleTabs[currentIndex + 1]);
      }
    } else {
      // Swiped Right (finger moves left to right) -> Go back to previous tab
      if (currentIndex > 0) {
        setCurrentTab(visibleTabs[currentIndex - 1]);
      }
    }
  };

  // Handle switching roles (polite label: সম্মানিত অতিথি / Guest View)
  const handleToggleRole = () => {
    if (userRole === 'owner') {
      setUserRole('customer');
      showToast(language === 'bn' ? 'সম্মানিত অতিথি ভিউ চালু হয়েছে।' : 'Switched to Guest View.');
    } else {
      // Switching back to owner mode requires Owner PIN
      setIsPinModalOpen(true);
    }
  };

  const handleApproveWholesale = () => {
    setIsWholesaleApproved(true);
    saveWholesaleApproval(true);
    setHasWholesaleRequest(false);
    setWholesaleRequests(loadWholesaleRequests());
    showToast(language === 'bn' ? 'হোলসেল রেট দেখতে অনুমোদন দেওয়া হয়েছে!' : 'Wholesale access approved!');
  };

  const handleRevokeWholesale = () => {
    setIsWholesaleApproved(false);
    saveWholesaleApproval(false);
    showToast(language === 'bn' ? 'হোলসেল রেট আবার হাইড করা হয়েছে।' : 'Wholesale access hidden.');
  };

  const handleToggleWholesaleHidden = () => {
    const nextVal = !isWholesaleHidden;
    setIsWholesaleHidden(nextVal);
    saveWholesaleHidden(nextVal);
    showToast(
      language === 'bn'
        ? nextVal
          ? 'হোলসেল অপশন ড্যাশবোর্ড থেকে হাইড করা হয়েছে (কাস্টমাররা দেখতে পাবে না)।'
          : 'হোলসেল অপশন আবার ড্যাশবোর্ডে দৃশ্যমান করা হয়েছে।'
        : nextVal
        ? 'Wholesale hidden from Dashboard (invisible to visitors).'
        : 'Wholesale is now visible on Dashboard.'
    );
  };

  const handleRequestWholesale = () => {
    setHasWholesaleRequest(true);
    setWholesaleRequests(loadWholesaleRequests());
    showToast(language === 'bn' ? 'অনুমোদনের অনুরোধ পাঠানো হয়েছে।' : 'Wholesale access request sent.');
  };

  const handlePinSuccess = () => {
    setUserRole('owner');
    setIsPinModalOpen(false);
    showToast(language === 'bn' ? 'মালিক মোড আনলক হয়েছে।' : 'Unlocked Owner Mode.');
  };

  // Add / Edit Product
  const handleSaveProduct = (
    productData: Omit<Product, 'id' | 'lastUpdated'>,
    andAddAnother: boolean = false
  ) => {
    if (editingProduct) {
      // Update existing
      const updatedList = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              ...productData,
              lastUpdated: new Date().toISOString(),
            }
          : p
      );
      setProducts(updatedList);
      saveProducts(updatedList);
      showToast('Product updated successfully!');
      setEditingProduct(null);
      setIsProductModalOpen(false);
    } else {
      // Add new
      const newProduct: Product = {
        ...productData,
        id: 'prod_' + Math.random().toString(36).substr(2, 9),
        lastUpdated: new Date().toISOString(),
      };
      const updatedList = [newProduct, ...products];
      setProducts(updatedList);
      saveProducts(updatedList);
      showToast('New product added to inventory!');

      if (!andAddAnother) {
        setIsProductModalOpen(false);
      }
    }
  };

  // Duplicate Product
  const handleDuplicateProduct = (product: Product) => {
    const duplicated: Product = {
      ...product,
      id: 'prod_' + Math.random().toString(36).substr(2, 9),
      name: `${product.name} (Copy)`,
      code: `${product.code}-COPY`,
      lastUpdated: new Date().toISOString(),
    };
    const updatedList = [duplicated, ...products];
    setProducts(updatedList);
    saveProducts(updatedList);
    showToast(`Duplicated ${product.name}`);
  };

  // Delete Product
  const handleDeleteProduct = (productId: string) => {
    const updatedList = products.filter((p) => p.id !== productId);
    setProducts(updatedList);
    saveProducts(updatedList);
    showToast('Product removed.');
  };

  // Toggle Active/Inactive (Live in Wholesale & Retail or Hidden)
  const handleToggleActive = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    const willBeActive = target ? !target.isActive : true;
    const updatedList = products.map((p) =>
      p.id === productId ? { ...p, isActive: !p.isActive } : p
    );
    setProducts(updatedList);
    saveProducts(updatedList);
    showToast(
      language === 'bn'
        ? willBeActive
          ? '✓ স্টকে আছে: হোলসেল ও রিটেল উভয় লিস্টে লাইভ হয়েছে।'
          : '✕ স্টক নাই: হোলসেল ও রিটেল উভয় লিস্ট থেকে হাইড করা হয়েছে।'
        : willBeActive
        ? '✓ In Stock: Now Live in Wholesale & Retail.'
        : '✕ Out of Stock: Hidden from Wholesale & Retail.'
    );
  };

  // Inline Price Updates from Retail View
  const handleUpdateProductPrices = (
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
    <div className={`min-h-screen bg-slate-50 flex flex-col font-sans ${language === 'bn' ? 'font-bengali' : ''}`}>
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

      {/* Main Content Area (With smooth horizontal swipe gestures between tabs and elevated clearance) */}
      <main 
        className="flex-1 pb-36 sm:pb-40 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* If a subview from More is active (e.g. Reports or Settings) */}
        {activeSubView === 'reports' ? (
          <div className="pt-2">
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
          <div className="pt-2">
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
        ) : (
          /* Normal Tab Views */
          <>
            {currentTab === 'home' && (
              <HomeDashboard
                products={products}
                settings={settings}
                language={language}
                userRole={userRole}
                onNavigate={(tab) => {
                  setActiveSubView('none');
                  setCurrentTab(tab);
                }}
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

            {currentTab === 'wholesale' && (
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

            {currentTab === 'retail' && (
              <RetailView
                products={products}
                settings={settings}
                language={language}
              />
            )}

            {currentTab === 'products' && (
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

            {currentTab === 'owner-desk' && (
              <OwnerProfitDesk
                products={products}
                settings={settings}
                language={language}
                onUpdateProductPrices={handleUpdateProductPrices}
                onToggleActive={handleToggleActive}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => {
          setActiveSubView('none');
          setCurrentTab(tab);
        }}
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
    </div>
  );
}
