import { BusinessSettings, Product, Quotation, WholesaleRequest } from '../types';

export const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'NEW ASHIQUE ENTERPRISE',
  subtitle: 'RO PLANT & ACCESSORIES',
  address: 'Baliadanga, Kaliachak, Malda, West Bengal, India',
  phone: '9563340244',
  whatsapp: '9563340244',
  googleMapsUrl: '', // Can be customized by owner in Settings
  currency: 'INR',
  currencySymbol: '₹',
  defaultLanguage: 'en',
  defaultUnit: 'Piece',
  pdfHeaderNote: 'Dealers in all kinds of Domestic & Commercial RO Water Purifiers, Membranes, Booster Pumps & Spares.',
  pdfFooterNote: 'Thank you for choosing NEW ASHIQUE ENTERPRISE. For wholesale bulk orders, please contact 9563340244.',
  ownerPin: '1234',
  wholesalePassword: '1234',
  decimalPlaces: 2,
  enableStock: true,
  gstNumber: '',
};

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'demo-1',
    name: 'RO Membrane 75 GPD Vontron',
    code: 'MEM-75G-VON',
    category: 'RO Membrane',
    unit: 'Piece',
    moq: 5,
    purchasePrice: 650,
    wholesalePrice: 850,
    retailPrice: 1200,
    profitAmount: 550,
    profitCostPct: 84.62,
    profitMarginPct: 45.83,
    stockQuantity: 45,
    supplierName: 'National Membrane Co.',
    description: 'High rejection 75 GPD domestic reverse osmosis membrane for high TDS water purification.',
    lastUpdated: '2026-10-28T00:00:00.000Z',
    isActive: true,
    isDemo: true,
  },
  {
    id: 'demo-2',
    name: 'RO Booster Pump 100 GPD Copper Winded',
    code: 'PMP-100G-COP',
    category: 'RO Pump',
    unit: 'Piece',
    moq: 2,
    purchasePrice: 950,
    wholesalePrice: 1250,
    retailPrice: 1650,
    profitAmount: 700,
    profitCostPct: 73.68,
    profitMarginPct: 42.42,
    stockQuantity: 28,
    supplierName: 'Apex Water Pumps India',
    description: 'Heavy duty 100 GPD DC pump with pure copper winding and high pressure output.',
    lastUpdated: '2026-10-28T00:00:00.000Z',
    isActive: true,
    isDemo: true,
  },
  {
    id: 'demo-3',
    name: '10" Pre-Filter Housing Heavy Duty (Blue)',
    code: 'HSG-10-BLU',
    category: 'Filter Housing',
    unit: 'Piece',
    moq: 10,
    purchasePrice: 110,
    wholesalePrice: 150,
    retailPrice: 240,
    profitAmount: 130,
    profitCostPct: 118.18,
    profitMarginPct: 54.17,
    stockQuantity: 120,
    supplierName: 'Supreme Plastics',
    description: 'Food grade virgin plastic pre-filter housing with double O-ring leak-proof design.',
    lastUpdated: '2026-10-28T00:00:00.000Z',
    isActive: true,
    isDemo: true,
  },
  {
    id: 'demo-4',
    name: '10" Spun Polypropylene Sediment Cartridge 5 Micron',
    code: 'FLT-SED-10-5M',
    category: 'Sediment Cartridge',
    unit: 'Piece',
    moq: 50,
    purchasePrice: 18,
    wholesalePrice: 28,
    retailPrice: 60,
    profitAmount: 42,
    profitCostPct: 233.33,
    profitMarginPct: 70.0,
    stockQuantity: 350,
    supplierName: 'Fiber Filtration Ltd',
    description: '100% pure Polypropylene fiber sediment cartridge for trapping sand, rust, and silt.',
    lastUpdated: '2026-10-28T00:00:00.000Z',
    isActive: true,
    isDemo: true,
  },
  {
    id: 'demo-5',
    name: 'Activated Carbon Block (CTO) Filter 10"',
    code: 'FLT-CTO-10',
    category: 'Carbon Filter',
    unit: 'Piece',
    moq: 25,
    purchasePrice: 45,
    wholesalePrice: 70,
    retailPrice: 120,
    profitAmount: 75,
    profitCostPct: 166.67,
    profitMarginPct: 62.5,
    stockQuantity: 90,
    supplierName: 'Carbon Matrix Industries',
    description: 'Coconut shell carbon block for chlorine, odor, taste, and VOC reduction.',
    lastUpdated: '2026-10-28T00:00:00.000Z',
    isActive: true,
    isDemo: true,
  },
  {
    id: 'demo-6',
    name: 'Multiport Valve 1" Top Mount Manual (Runxin)',
    code: 'VLV-MPV-1IN',
    category: 'Multiport Valve',
    unit: 'Piece',
    moq: 1,
    purchasePrice: 1400,
    wholesalePrice: 1850,
    retailPrice: 2500,
    profitAmount: 1100,
    profitCostPct: 78.57,
    profitMarginPct: 44.0,
    stockQuantity: 14,
    supplierName: 'Runxin Valves India',
    description: 'Manual 3-way/5-way multiport valve for commercial water treatment filters and softeners.',
    lastUpdated: '2026-10-28T00:00:00.000Z',
    isActive: true,
    isDemo: true,
  },
  {
    id: 'demo-7',
    name: 'FRP Pressure Vessel 1054 for Commercial RO',
    code: 'VSL-FRP-1054',
    category: 'Pressure Vessel',
    unit: 'Piece',
    moq: 1,
    purchasePrice: 1900,
    wholesalePrice: 2400,
    retailPrice: 3200,
    profitAmount: 1300,
    profitCostPct: 68.42,
    profitMarginPct: 40.63,
    stockQuantity: 8,
    supplierName: 'Composite Vessels Corp',
    description: 'High-strength fiberglass reinforced polymer vessel for commercial sand and carbon filters.',
    lastUpdated: '2026-10-28T00:00:00.000Z',
    isActive: true,
    isDemo: true,
  },
  {
    id: 'demo-8',
    name: 'Water Treatment Ion Exchange Softener Resin (25L Bag)',
    code: 'RSN-SFT-25L',
    category: 'Water Treatment Media',
    unit: 'Bag',
    moq: 1,
    purchasePrice: 3200,
    wholesalePrice: 3900,
    retailPrice: 4800,
    profitAmount: 1600,
    profitCostPct: 50.0,
    profitMarginPct: 33.33,
    stockQuantity: 12,
    supplierName: 'Thermax Chemical Resins',
    description: 'Premium cationic exchange resin for water softening, removes calcium and magnesium.',
    lastUpdated: '2026-10-28T00:00:00.000Z',
    isActive: true,
    isDemo: true,
  },
  {
    id: 'demo-9',
    name: 'Commercial RO Antiscalant Chemical (20 Kg Can)',
    code: 'CHM-ANT-20KG',
    category: 'Water Treatment Chemicals',
    unit: 'Can',
    moq: 2,
    purchasePrice: 1100,
    wholesalePrice: 1450,
    retailPrice: 1900,
    profitAmount: 800,
    profitCostPct: 72.73,
    profitMarginPct: 42.11,
    stockQuantity: 22,
    supplierName: 'Aqua Pure Chemicals',
    description: 'Prevents scaling and mineral deposits on RO membranes, extending plant lifespan.',
    lastUpdated: '2026-10-28T00:00:00.000Z',
    isActive: true,
    isDemo: true,
  },
  {
    id: 'demo-10',
    name: '1/4" Food Grade RO Pipe Roll (100m)',
    code: 'PIP-RO-14-100M',
    category: 'Pipes and Fittings',
    unit: 'Roll',
    moq: 2,
    purchasePrice: 320,
    wholesalePrice: 440,
    retailPrice: 650,
    profitAmount: 330,
    profitCostPct: 103.13,
    profitMarginPct: 50.77,
    stockQuantity: 30,
    supplierName: 'Plasto Tubes Ltd',
    description: 'High pressure virgin white food-grade polyethylene tubing for domestic RO water filters.',
    lastUpdated: '2026-10-28T00:00:00.000Z',
    isActive: true,
    isDemo: true,
  },
];

export const PRESET_CATEGORIES = [
  'RO Membrane',
  'RO Pump',
  'Filter Housing',
  'Pressure Vessel',
  'Multiport Valve',
  'Sediment Cartridge',
  'Carbon Filter',
  'Water Treatment Media',
  'Commercial RO Accessories',
  'Domestic RO Accessories',
  'Pipes and Fittings',
  'Water Treatment Chemicals',
  'Fittings & Connectors',
  'Other Accessories',
];

export const PRESET_UNITS = [
  'Piece',
  'Set',
  'Meter',
  'Kilogram',
  'Litre',
  'Box',
  'Packet',
  'Pair',
  'Roll',
  'Bag',
  'Can',
];

const STORAGE_KEYS = {
  PRODUCTS: 'nae_products_data_v1',
  SETTINGS: 'nae_settings_data_v1',
  QUOTATIONS: 'nae_quotations_data_v1',
  CUSTOM_CATEGORIES: 'nae_custom_categories_v1',
  LANGUAGE: 'nae_language_choice_v1',
  USER_ROLE: 'nae_current_role_v1',
  WHOLESALE_REQUESTS: 'nae_wholesale_pending_requests_v1',
  WHOLESALE_APPROVED: 'nae_wholesale_approved_status_v1',
  WHOLESALE_HIDDEN: 'nae_wholesale_hidden_v1',
  CURRENT_CUSTOMER_PHONE: 'nae_my_customer_phone_v1',
  CURRENT_CUSTOMER_NAME: 'nae_my_customer_name_v1',
};

// Calculation helpers
export function calculateProfit(purchasePrice: number, retailPrice: number) {
  const p = Number(purchasePrice) || 0;
  const r = Number(retailPrice) || 0;
  const profitAmount = Number((r - p).toFixed(2));
  const profitCostPct = p > 0 ? Number(((profitAmount / p) * 100).toFixed(2)) : 0;
  const profitMarginPct = r > 0 ? Number(((profitAmount / r) * 100).toFixed(2)) : 0;

  return {
    profitAmount,
    profitCostPct,
    profitMarginPct,
  };
}

// Storage functions
export function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      saveProducts(SAMPLE_PRODUCTS);
      return SAMPLE_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveProducts(SAMPLE_PRODUCTS);
      return SAMPLE_PRODUCTS;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading products from storage:', err);
    return SAMPLE_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (err) {
    console.error('Error saving products:', err);
  }
}

export function loadSettings(): BusinessSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: BusinessSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

export function loadQuotations(): Quotation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQuotations(quotes: Quotation[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotes));
  } catch (err) {
    console.error('Error saving quotations:', err);
  }
}

export function loadCategories(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
    if (!raw) return PRESET_CATEGORIES;
    const custom = JSON.parse(raw);
    const combined = Array.from(new Set([...PRESET_CATEGORIES, ...custom]));
    return combined;
  } catch {
    return PRESET_CATEGORIES;
  }
}

export function saveCategory(category: string): string[] {
  try {
    const trimmed = category.trim();
    if (!trimmed) return loadCategories();
    const current = loadCategories();
    if (!current.includes(trimmed)) {
      const updated = [...current, trimmed];
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CATEGORIES, JSON.stringify(updated.filter(c => !PRESET_CATEGORIES.includes(c))));
      return updated;
    }
    return current;
  } catch {
    return PRESET_CATEGORIES;
  }
}

// Compress image to lightweight data URL (max 600px width/height, 0.75 JPEG)
export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

// Currency formatter
export function formatINR(val: number, decimals: number = 2): string {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

// Plain INR number formatter
export function formatINRNumber(val: number, decimals: number = 2): string {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

// Clean phone numbers helper
export function normalizePhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  return digits;
}

// Wholesale customer registry - start clean with real requests only (no mock data)
export const SAMPLE_WHOLESALE_CUSTOMERS: WholesaleRequest[] = [];

// Current Client Device Customer Identification
export function loadCurrentCustomerPhone(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_CUSTOMER_PHONE) || '';
  } catch {
    return '';
  }
}

export function saveCurrentCustomerPhone(phone: string): void {
  try {
    const clean = normalizePhone(phone);
    if (clean) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_CUSTOMER_PHONE, clean);
    }
  } catch (err) {
    console.error('Error saving customer phone:', err);
  }
}

export function loadCurrentCustomerName(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_CUSTOMER_NAME) || '';
  } catch {
    return '';
  }
}

export function saveCurrentCustomerName(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CUSTOMER_NAME, name.trim());
  } catch (err) {
    console.error('Error saving customer name:', err);
  }
}

// Wholesale Customers Registry Management
export function loadWholesaleRequests(): WholesaleRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WHOLESALE_REQUESTS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    // Filter out old mock dummy records ('cust-1', 'cust-2', or mock names)
    const cleaned = parsed.filter(
      (r) =>
        r &&
        r.id !== 'cust-1' &&
        r.id !== 'cust-2' &&
        !r.customerName?.includes('আলমগীর') &&
        !r.customerName?.includes('রহিম ওয়াটার')
    );
    // If old mock records were stripped, persist the cleaned list
    if (cleaned.length !== parsed.length) {
      saveWholesaleRequests(cleaned);
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveWholesaleRequests(requests: WholesaleRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WHOLESALE_REQUESTS, JSON.stringify(requests));
  } catch (err) {
    console.error('Error saving wholesale requests:', err);
  }
}

// Add customer via WhatsApp request form
export function addWholesaleRequest(req: {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
}): WholesaleRequest {
  const list = loadWholesaleRequests();
  const cleanPhone = normalizePhone(req.customerPhone);
  
  // Save locally on client device so customer doesn't re-enter info
  saveCurrentCustomerPhone(cleanPhone);
  saveCurrentCustomerName(req.customerName.trim());

  // Check if customer already exists in registry
  const existingIndex = list.findIndex(r => normalizePhone(r.customerPhone) === cleanPhone);

  if (existingIndex >= 0) {
    const existing = list[existingIndex];
    // If existing was hidden or rejected, leave it or update info
    const updatedCustomer: WholesaleRequest = {
      ...existing,
      customerName: req.customerName.trim() || existing.customerName,
      customerAddress: req.customerAddress?.trim() || existing.customerAddress,
      requestedAt: new Date().toISOString(),
      // If was rejected, reopen as pending; if already approved, keep approved
      status: existing.status === 'approved' ? 'approved' : 'pending',
    };
    list[existingIndex] = updatedCustomer;
    saveWholesaleRequests(list);
    return updatedCustomer;
  }

  const newReq: WholesaleRequest = {
    id: 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    customerName: req.customerName.trim(),
    customerPhone: cleanPhone,
    customerAddress: req.customerAddress?.trim() || '',
    requestedAt: new Date().toISOString(),
    status: 'pending',
  };

  const updated = [newReq, ...list];
  saveWholesaleRequests(updated);
  return newReq;
}

// Add customer directly by Owner without request
export function addDirectWholesaleCustomer(customer: {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  notes?: string;
}): WholesaleRequest {
  const list = loadWholesaleRequests();
  const cleanPhone = normalizePhone(customer.customerPhone);

  const existingIndex = list.findIndex(r => normalizePhone(r.customerPhone) === cleanPhone);
  if (existingIndex >= 0) {
    const existing = list[existingIndex];
    const updated: WholesaleRequest = {
      ...existing,
      customerName: customer.customerName.trim(),
      customerAddress: customer.customerAddress?.trim() || existing.customerAddress,
      notes: customer.notes?.trim() || existing.notes,
      status: 'approved',
      approvedAt: existing.approvedAt || new Date().toISOString(),
    };
    list[existingIndex] = updated;
    saveWholesaleRequests(list);
    return updated;
  }

  const newCustomer: WholesaleRequest = {
    id: 'cust_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    customerName: customer.customerName.trim(),
    customerPhone: cleanPhone,
    customerAddress: customer.customerAddress?.trim() || '',
    notes: customer.notes?.trim() || 'মালিক কর্তৃক সরাসরি অন্তর্ভুক্ত',
    requestedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    status: 'approved',
  };

  const updated = [newCustomer, ...list];
  saveWholesaleRequests(updated);
  return newCustomer;
}

// Owner approves pending request
export function approveWholesaleRequest(idOrPhone: string): boolean {
  const list = loadWholesaleRequests();
  const cleanQuery = normalizePhone(idOrPhone);
  let found = false;

  const updated = list.map((r) => {
    if (r.id === idOrPhone || normalizePhone(r.customerPhone) === cleanQuery || r.customerName.toLowerCase() === idOrPhone.toLowerCase()) {
      found = true;
      return { 
        ...r, 
        status: 'approved' as const, 
        approvedAt: new Date().toISOString() 
      };
    }
    return r;
  });

  saveWholesaleRequests(updated);
  saveWholesaleApproval(true);
  return found;
}

// Owner toggles individual customer access between approved (ON) and hidden (OFF)
export function toggleCustomerWholesaleAccess(idOrPhone: string, newStatus: 'approved' | 'hidden'): WholesaleRequest[] {
  const list = loadWholesaleRequests();
  const cleanQuery = normalizePhone(idOrPhone);

  const updated = list.map((r) => {
    if (r.id === idOrPhone || normalizePhone(r.customerPhone) === cleanQuery) {
      return {
        ...r,
        status: newStatus,
        approvedAt: newStatus === 'approved' ? (r.approvedAt || new Date().toISOString()) : r.approvedAt,
      };
    }
    return r;
  });

  saveWholesaleRequests(updated);
  return updated;
}

// Delete wholesale customer from registry permanently
export function deleteWholesaleCustomer(id: string): WholesaleRequest[] {
  const list = loadWholesaleRequests();
  const target = list.find((r) => r.id === id);
  const updated = list.filter((r) => r.id !== id);
  saveWholesaleRequests(updated);

  // If deleted customer is current device's customer, revoke approval
  if (target) {
    const currentPhone = loadCurrentCustomerPhone();
    if (normalizePhone(currentPhone) === normalizePhone(target.customerPhone)) {
      saveWholesaleApproval(false);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_CUSTOMER_PHONE);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_CUSTOMER_NAME);
    }
  }

  return updated;
}

// Reject wholesale request
export function rejectWholesaleRequest(id: string): void {
  const list = loadWholesaleRequests();
  const updated = list.map((r) => (r.id === id ? { ...r, status: 'rejected' as const } : r));
  saveWholesaleRequests(updated);
}

// Check customer wholesale status by phone
export function getCustomerWholesaleStatus(phone?: string): WholesaleRequest | null {
  if (!phone) return null;
  const clean = normalizePhone(phone);
  if (!clean) return null;
  const list = loadWholesaleRequests();
  return list.find((r) => normalizePhone(r.customerPhone) === clean) || null;
}

export function loadWholesaleApproval(): boolean {
  try {
    // If client device has a registered phone, verify that its status is currently 'approved' in registry
    const currentPhone = loadCurrentCustomerPhone();
    if (currentPhone) {
      const rec = getCustomerWholesaleStatus(currentPhone);
      if (rec) {
        return rec.status === 'approved';
      }
    }
    return localStorage.getItem(STORAGE_KEYS.WHOLESALE_APPROVED) === 'true';
  } catch {
    return false;
  }
}

export function saveWholesaleApproval(isApproved: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WHOLESALE_APPROVED, isApproved ? 'true' : 'false');
  } catch (err) {
    console.error('Error saving wholesale approval:', err);
  }
}

export function loadWholesaleHidden(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.WHOLESALE_HIDDEN) === 'true';
  } catch {
    return false;
  }
}

export function saveWholesaleHidden(hidden: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WHOLESALE_HIDDEN, hidden ? 'true' : 'false');
  } catch (err) {
    console.error('Error saving wholesale hidden state:', err);
  }
}
