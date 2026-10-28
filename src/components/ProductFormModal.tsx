import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Trash2, 
  Check, 
  Plus, 
  Boxes, 
  DollarSign, 
  Percent, 
  Tag, 
  Layers, 
  Info 
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
  onAddCategory,
  language,
  settings,
}) => {
  const t = translations[language];

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState(categories[0] || 'RO Membrane');
  const [unit, setUnit] = useState('Piece');
  const [moq, setMoq] = useState<number>(1);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [wholesalePrice, setWholesalePrice] = useState<number>(0);
  const [retailPrice, setRetailPrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [supplierName, setSupplierName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isActive, setIsActive] = useState(true);

  // Custom category input
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessingImg, setIsProcessingImg] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCode(productToEdit.code);
      setCategory(productToEdit.category);
      setUnit(productToEdit.unit);
      setMoq(productToEdit.moq);
      setPurchasePrice(productToEdit.purchasePrice);
      setWholesalePrice(productToEdit.wholesalePrice);
      setRetailPrice(productToEdit.retailPrice);
      setStockQuantity(productToEdit.stockQuantity || 0);
      setSupplierName(productToEdit.supplierName || '');
      setDescription(productToEdit.description || '');
      setImageUrl(productToEdit.imageUrl || '');
      setIsActive(productToEdit.isActive);
    } else {
      // Defaults for new product
      setName('');
      // Auto-suggest next code
      setCode(`RO-${Math.floor(100 + Math.random() * 900)}`);
      setCategory(categories[0] || 'RO Membrane');
      setUnit('Piece');
      setMoq(1);
      setPurchasePrice(0);
      setWholesalePrice(0);
      setRetailPrice(0);
      setStockQuantity(10);
      setSupplierName('');
      setDescription('');
      setImageUrl('');
      setIsActive(true);
    }
    setErrors({});
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  // Real-time profit calculations
  const { profitAmount, profitCostPct, profitMarginPct } = calculateProfit(
    purchasePrice,
    retailPrice
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

  const handleCreateNewCategory = () => {
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setCategory(newCatName.trim());
    setNewCatName('');
    setIsAddingNewCat(false);
  };

  const handleSubmit = (andAddAnother: boolean = false) => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Product name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const safeCode = code.trim() || productToEdit?.code || `RO-${Math.floor(1000 + Math.random() * 9000)}`;

    onSave(
      {
        name: name.trim(),
        code: safeCode.toUpperCase(),
        category,
        unit,
        moq: Math.max(1, Number(moq) || 1),
        purchasePrice: Math.max(0, Number(purchasePrice) || 0),
        wholesalePrice: Math.max(0, Number(wholesalePrice) || 0),
        retailPrice: Math.max(0, Number(retailPrice) || 0),
        profitAmount,
        profitCostPct,
        profitMarginPct,
        stockQuantity: Number(stockQuantity) || 0,
        supplierName: supplierName.trim(),
        description: description.trim(),
        imageUrl,
        isActive,
        isDemo: false, // Newly added or edited items are genuine shop records
      },
      andAddAnother
    );

    if (andAddAnother) {
      setName('');
      setCode(`RO-${Math.floor(100 + Math.random() * 900)}`);
      setPurchasePrice(0);
      setWholesalePrice(0);
      setRetailPrice(0);
      setDescription('');
      setImageUrl('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg">
              {productToEdit ? t.editProduct : t.addProductBtn}
            </h3>
            <p className="text-xs text-slate-400">
              {settings.businessName} • RO Water Purifiers & Spares
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Row 1: Product Name (SKU code input removed per user request) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {t.formProductName} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. RO Membrane 75 GPD Vontron"
              className={`w-full px-3.5 py-2.5 rounded-xl border ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'
              } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold`}
            />
            {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name}</span>}
          </div>

          {/* Row 2: Category, Unit, MOQ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  {t.formCategory}
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                  className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  + Add New
                </button>
              </div>

              {isAddingNewCat ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="New category..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-blue-400 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewCategory}
                    className="px-2 py-1 bg-blue-700 text-white rounded-lg text-xs font-bold"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t.formUnit}
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

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t.formMoq}
              </label>
              <input
                type="number"
                min="1"
                value={moq}
                onChange={(e) => setMoq(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 3: Prices (Purchase, Wholesale, Retail) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-blue-700" />
              <span>Prices in Indian Rupees (₹)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.formPurchasePrice}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.formWholesalePrice}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-sm focus:ring-2 focus:ring-blue-500 text-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.formRetailPrice}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-sm focus:ring-2 focus:ring-emerald-500 text-emerald-900"
                  />
                </div>
              </div>
            </div>

            {/* Live Profit Preview Box */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
              <span className="font-bold text-slate-600">Calculated Profit:</span>
              <div className="flex items-center gap-3">
                <span className={`font-black ${profitAmount >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  Amount: ₹{formatINRNumber(profitAmount, 2)}
                </span>
                <span className="text-slate-300">|</span>
                <span className="font-bold text-slate-700">
                  Markup: {profitCostPct}%
                </span>
                <span className="text-slate-300">|</span>
                <span className="font-bold text-emerald-700">
                  Margin: {profitMarginPct}%
                </span>
              </div>
            </div>
          </div>

          {/* Row 4: Stock Quantity */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {t.formStock}
            </label>
            <input
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Row 5: Product Photo Upload & Compression */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {t.formImage}
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
                  <span>{isProcessingImg ? 'Compressing...' : t.formUploadImage}</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-1">
                  JPG, PNG, or WebP. Automatically optimized for mobile speed.
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
                {t.formActiveStatus}
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
            {t.cancel}
          </button>

          {!productToEdit && (
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-900 text-xs font-bold transition cursor-pointer"
            >
              {t.saveAndAddAnother}
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{t.saveProduct}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
