import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Copy, 
  CheckCircle, 
  XCircle, 
  ArrowUpDown, 
  FileSpreadsheet, 
  Boxes, 
  AlertTriangle,
  X 
} from 'lucide-react';
import { BusinessSettings, Language, Product, UserRole } from '../types';
import { translations } from '../i18n/translations';
import { formatINRNumber } from '../utils/storage';

interface ProductsViewProps {
  products: Product[];
  settings: BusinessSettings;
  language: Language;
  userRole: UserRole;
  categories: string[];
  onOpenAddModal: () => void;
  onOpenEditModal: (product: Product) => void;
  onDuplicateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onToggleActive: (productId: string) => void;
  onOpenImportExport: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  settings,
  language,
  userRole,
  categories,
  onOpenAddModal,
  onOpenEditModal,
  onDuplicateProduct,
  onDeleteProduct,
  onToggleActive,
  onOpenImportExport,
}) => {
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'retail' | 'wholesale'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Delete confirmation modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat =
        selectedCategory === 'All' || product.category === selectedCategory;
      return matchSearch && matchCat;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'code') {
        comparison = a.code.localeCompare(b.code);
      } else if (sortBy === 'retail') {
        comparison = a.retailPrice - b.retailPrice;
      } else if (sortBy === 'wholesale') {
        comparison = a.wholesalePrice - b.wholesalePrice;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [products, searchQuery, selectedCategory, sortBy, sortOrder]);

  const confirmDeleteAction = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-5 pb-24 max-w-6xl mx-auto px-3 sm:px-6 pt-3">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold mb-2">
              <Package className="w-3.5 h-3.5 text-blue-700" />
              <span>Catalog Database ({products.length} Items)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {t.manageProductsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t.manageProductsSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenImportExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>{t.importExportBtn}</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-900/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addProductBtn}</span>
            </button>
          </div>
        </div>

        {/* 1-Click Stock Visibility Control Notice */}
        <div className="mt-4 p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <p className="leading-relaxed">
            {language === 'bn' ? (
              <>
                <strong>এক ক্লিকে স্টক নিয়ন্ত্রণ:</strong> কোনো আইটেমের{' '}
                <span className="font-bold text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                  ✓ স্টকে আছে
                </span>{' '}
                বাটনে চাপলে ওটা{' '}
                <span className="font-bold text-rose-800 bg-white px-1.5 py-0.5 rounded border border-rose-200">
                  ✕ স্টক নাই
                </span>{' '}
                হয়ে যাবে এবং ডিস্ট্রিবিউটর ও হোলসেল উভয় কাস্টমার ভিউ থেকে তাৎক্ষণিক হাইড থাকবে। স্টক এলে পুনরায় চাপলে আবার উভয় জায়গায় দৃশ্যমান হবে।
              </>
            ) : (
              <>
                <strong>1-Click Instant Stock Toggle:</strong> Clicking the stock button toggles the product between{' '}
                <strong>In Stock (Live)</strong> and <strong>Out of Stock (Hidden)</strong> across both Wholesale & Retail catalogs simultaneously.
              </>
            )}
          </p>
        </div>

        {/* Search, Filter, and Sort Controls */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or code..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">{t.allCategories} ({products.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({products.filter((p) => p.category === cat).length})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="code">Sort by SKU Code</option>
              <option value="retail">Sort by Retail Price</option>
              <option value="wholesale">Sort by Wholesale Price</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs"
              title="Toggle Ascending / Descending"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product List Table & Mobile Cards */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">{t.noProductsFound}</h4>
          <p className="text-xs text-slate-400 mt-1">Try another search or add a new product.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold w-12 text-center">#</th>
                  <th className="py-3.5 px-4 font-semibold">Product Name</th>
                  <th className="py-3.5 px-4 font-semibold">Code / SKU</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold text-center">MOQ</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Wholesale (₹)</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Retail (₹)</th>
                  <th className="py-3.5 px-4 font-semibold text-center min-w-[140px]">
                    {language === 'bn' ? 'স্টক স্ট্যাটাস' : 'Stock Status'}
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-center w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedProducts.map((product, idx) => (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 text-center font-bold text-slate-400 text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                            <Boxes className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{product.name}</div>
                          <div className="text-xs text-slate-500">Unit: {product.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-bold text-slate-700">
                      {product.code}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-xs font-semibold">
                      {product.moq} {product.unit}s
                    </td>
                    <td className="py-3 px-4 text-right font-black text-blue-900">
                      ₹{formatINRNumber(product.wholesalePrice, settings.decimalPlaces)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-800">
                      ₹{formatINRNumber(product.retailPrice, settings.decimalPlaces)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onToggleActive(product.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shadow-xs ${
                          product.isActive
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
                        }`}
                        title={
                          product.isActive
                            ? 'ক্লিক করলে হোলসেল ও রিটেল থেকে হাইড হবে'
                            : 'ক্লিক করলে হোলসেল ও রিটেলে দৃশ্যমান হবে'
                        }
                      >
                        {product.isActive ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? '✓ স্টকে আছে (Show)' : '✓ In Stock (Live)'}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? '✕ স্টক নাই (Hide)' : '✕ Out of Stock (Hidden)'}</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenEditModal(product)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                          title={t.editProduct}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDuplicateProduct(product)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                          title={t.duplicateProduct}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(product)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                          title={t.deleteProduct}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card Layout */}
          <div className="lg:hidden space-y-3">
            {filteredAndSortedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3"
              >
                <div className="flex items-start gap-3">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <Boxes className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {product.category}
                      </span>
                      <button
                        onClick={() => onToggleActive(product.id)}
                        className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg cursor-pointer transition shadow-xs ${
                          product.isActive
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                        }`}
                        title={
                          product.isActive
                            ? 'হোলসেল ও রিটেল থেকে হাইড করতে ক্লিক করুন'
                            : 'হোলসেল ও রিটেলে দৃশ্যমান করতে ক্লিক করুন'
                        }
                      >
                        {product.isActive ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? '✓ স্টকে আছে' : '✓ In Stock'}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? '✕ স্টক নাই' : '✕ Out of Stock'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mt-1 leading-snug">
                      {product.name}
                    </h4>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      SKU: {product.code} • Unit: {product.unit}
                    </div>
                  </div>
                </div>

                {/* Price tags */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Wholesale Rate</span>
                    <span className="font-black text-blue-900 text-sm">
                      ₹{formatINRNumber(product.wholesalePrice, settings.decimalPlaces)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Min MOQ: {product.moq} {product.unit}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">Retail Selling Rate</span>
                    <span className="font-black text-emerald-800 text-sm">
                      ₹{formatINRNumber(product.retailPrice, settings.decimalPlaces)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Margin: {product.profitMarginPct}%</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => onDuplicateProduct(product)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => onOpenEditModal(product)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold hover:bg-blue-100 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setProductToDelete(product)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal (Protects real products from accidental deletion) */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-extrabold text-lg text-slate-900">
                {t.deleteConfirmTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong className="text-slate-800">{productToDelete.name}</strong> ({productToDelete.code})?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={confirmDeleteAction}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                {t.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
