export type Language = 'en' | 'bn';
export type UserRole = 'owner' | 'customer';

export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  imageUrl?: string;
  unit: string;
  moq: number;
  wholesaleMoq?: number;
  distributorMoq?: number;
  initialAddQty?: number;
  qtyStep?: number;
  purchasePrice: number;
  wholesalePrice: number;
  retailPrice: number;
  profitAmount: number;
  profitCostPct: number;
  profitMarginPct: number;
  stockQuantity?: number;
  supplierName?: string;
  description?: string;
  lastUpdated: string;
  isActive: boolean;
  isDemo?: boolean;
}

export interface BusinessSettings {
  businessName: string;
  subtitle: string;
  address: string;
  phone: string;
  whatsapp: string;
  googleMapsUrl: string;
  currency: string;
  currencySymbol: string;
  defaultLanguage: Language;
  defaultUnit: string;
  pdfHeaderNote: string;
  pdfFooterNote: string;
  ownerPin: string;
  wholesalePassword: string;
  decimalPlaces: number;
  enableStock: boolean;
  gstNumber?: string;
}

export interface QuotationItem {
  productId: string;
  name: string;
  code: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  date: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  notes?: string;
}

export interface ImportPreviewRow {
  name: string;
  code: string;
  category: string;
  unit: string;
  moq: number;
  purchasePrice: number;
  wholesalePrice: number;
  retailPrice: number;
  stockQuantity?: number;
  description?: string;
  status: 'new' | 'duplicate' | 'error';
  errorMessage?: string;
}

export interface WholesaleRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  approvedAt?: string;
  notes?: string;
}

export type ViewTab = 'home' | 'wholesale' | 'retail' | 'products' | 'owner-desk' | 'more';
export type MoreSubView = 
  | 'none' 
  | 'add-product' 
  | 'import-export' 
  | 'quotations' 
  | 'reports' 
  | 'backup' 
  | 'settings' 
  | 'help'
  | 'apk-download'
  | 'wholesale-approvals';
