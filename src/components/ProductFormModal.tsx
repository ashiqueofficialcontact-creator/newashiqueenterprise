import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Trash2, 
  Check, 
  Boxes, 
  DollarSign
} from 'lucide-react';
import { BusinessSettings, Language, Product } from '../types';
import { translations } from '../i18n/translations';
import { calculateProfit, compressImage, formatINRNumber, PRESET_UNITS } from '../utils/storage';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'lastUpdated'>, andAddAnother?: boolean) => void;
  productToEdit?: Product | null;
  categories: string[];
  onAddCategory: (category: string) => void;
  language: Language;
  settings: BusinessSettings;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  categories,
  language,
  settings,
}) => {
  const t = translations[language];

  // Form states - price inputs start as blank strings "" so no leading 0
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [unit, setUnit] = useState('Piece');
  const [wholesaleMoq, setWholesaleMoq] = useState<string>('1');
  const [distributorMoq, setDistributorMoq] = useState<string>('10');
  const [initialAddQty, setInitialAddQty] = useState<string>('10');
  const [qtyStep, setQtyStep] = useState<string>('1');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [wholesalePrice, setWholesalePrice] = useState<string>('');
  const [retailPrice, setRetailPrice] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState<string>('10');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isActive, setIsActive] = useState(true);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessingImg, setIsProcessingImg] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCode(productToEdit.code);
      setUnit(productToEdit.unit);
      setWholesaleMoq(String(productToEdit.wholesaleMoq || 1));
      const distMoq = productToEdit.distributorMoq || productToEdit.moq || 10;
      setDistributorMoq(String(distMoq));
      setInitialAddQty(String(productToEdit.initialAddQty || distMoq || 1));
      setQtyStep(String(productToEdit.qtyStep || 1));
      setPurchasePrice(productToEdit.purchasePrice ? String(productToEdit.purchasePrice) : '');
      setWholesalePrice(productToEdit.wholesalePrice ? String(productToEdit.wholesalePrice) : '');
      setRetailPrice(productToEdit.retailPrice ? String(productToEdit.retailPrice) : '');
      setStockQuantity(String(productToEdit.stockQuantity || 0));
      setImageUrl(productToEdit.imageUrl || '');
      setIsActive(productToEdit.isActive);
    } else {
      // Defaults for clean new product - blank price strings
      setName('');
      setCode(`RO-${Math.floor(100 + Math.random() * 900)}`);
      setUnit('Piece');
      setWholesaleMoq('1');
      setDistributorMoq('10');
      setInitialAddQty('10');
      setQtyStep('1');
      setPurchasePrice('');
      setWholesalePrice('');
      setRetailPrice('');
      setStockQuantity('10');
      setImageUrl('');
      setIsActive(true);
    }
    setErrors({});
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  // Real-time profit calculations
  const numPurchase = parseFloat(purchasePrice) || 0;
  const numRetail = parseFloat(retailPrice) || 0;
  const numWholesale = parseFloat(wholesalePrice) || 0;

  const { profitAmount, profitCostPct, profitMarginPct } = calculateProfit(
    numPurchase,
    numRetail
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImg(true);
    try {
      const compressedDataUrl = await compressImage(file);
      setImageUrl(compressedDataUrl);
    } catch (err) {
      console.error('Image compression error:', err);
      alert('Could not process this image. Please try a different JPG or PNG.');
    } finally {
      setIsProcessingImg(false);
    }
  };

  const handleSubmit = (andAddAnother: boolean = false) => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Product name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const safeCode = code.trim() || productToEdit?.code || `RO-${Math.floor(1000 + Math.random() * 9000)}`;
    const parsedDistMoq = Math.max(1, parseInt(distributorMoq) || 1);
    const parsedWholesaleMoq = Math.max(1, parseInt(wholesaleMoq) || 1);
    const parsedInitialAdd = Math.max(1, parseInt(initialAddQty) || parsedDistMoq);

    onSave(
      {
        name: name.trim(),
        code: safeCode.toUpperCase(),
        category: productToEdit?.category || 'RO General',
        unit,
        moq: parsedDistMoq,
        distributorMoq: parsedDistMoq,
        wholesaleMoq: parsedWholesaleMoq,
        initialAddQty: parsedInitialAdd,
        qtyStep: Math.max(1, parseInt(qtyStep) || 1),
        purchasePrice: Math.max(0, numPurchase),
        wholesalePrice: Math.max(0, numWholesale),
        retailPrice: Math.max(0, numRetail),
        profitAmount,
        profitCostPct,
        profitMarginPct,
        stockQuantity: parseInt(stockQuantity) || 0,
        supplierName: '',
        description: '',
        imageUrl,
        isActive,
        isDemo: false,
      },
      andAddAnother
    );

    if (andAddAnother) {
      setName('');
      setCode(`RO-${Math.floor(100 + Math.random() * 900)}`);
      setPurchasePrice('');
      setWholesalePrice('');
      setRetailPrice('');
      setImageUrl('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg">
              {productToEdit ? 'Edit Product' : '+ Add New Product'}
            </h3>
            <p className="text-xs text-slate-400">
              {settings.businessName} • RO Water Purifiers & Spares
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Row 1: Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Product Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 100 GPD Booster Pump / RO Membrane"
              className={`w-full px-3.5 py-2.5 rounded-xl border ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'
              } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold`}
            />
            {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name}</span>}
          </div>

          {/* Row 2: Unit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Unit of Measure
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PRESET_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Row 3: Prices in Indian Rupees (₹) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-blue-700" />
              <span>Price in Indian Rupees (₹)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Purchase Price */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Purchase Price (Cost)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Wholesale Price (Distributor Rate) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Distributor Rate
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(e.target.value)}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-sm focus:ring-2 focus:ring-blue-500 text-blue-900"
                  />
                </div>
              </div>

              {/* Retail Price (Wholesale Rate for Open Catalog) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Wholesale Rate
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-sm focus:ring-2 focus:ring-emerald-500 text-emerald-900"
                  />
                </div>
              </div>
            </div>

            {/* Live Profit Preview Box */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
              <span className="font-bold text-slate-600">Calculated Profit:</span>
              <div className="flex items-center gap-3">
                <span className={`font-black ${profitAmount >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  ₹{formatINRNumber(profitAmount, 2)}
                </span>
                <span className="text-slate-300">|</span>
                <span className="font-bold text-slate-700">
                  {profitCostPct}% markup
                </span>
                <span className="text-slate-300">|</span>
                <span className="font-bold text-emerald-700">
                  {profitMarginPct}% margin
                </span>
              </div>
            </div>
          </div>

          {/* Row 4: Stock Quantity */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              placeholder="0"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Row 5: Product Photo Upload & Compression */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Product Photo (Optional)
            </label>
            <div className="flex items-center gap-4 p-3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              {imageUrl ? (
                <div className="relative group">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 text-white rounded-full shadow hover:bg-red-700 cursor-pointer"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400">
                  <Boxes className="w-7 h-7" />
                </div>
              )}

              <div className="flex-1">
                <input
                  type="file"
                  id="product-photo-upload"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="product-photo-upload"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isProcessingImg ? 'Compressing...' : 'Upload Photo'}</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-1">
                  JPG, PNG, or WebP.
                </p>
              </div>
            </div>
          </div>

          {/* Active status checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-xs font-bold text-slate-800">
                In Stock (Active & Visible in Catalog)
              </span>
            </label>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
          >
            Cancel
          </button>

          {!productToEdit && (
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-900 text-xs font-bold transition cursor-pointer"
            >
              Save & Add Another
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Product</span>
          </button>
        </div>
      </div>
    </div>
  );
};
