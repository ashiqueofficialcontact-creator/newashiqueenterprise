import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Database, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Layers 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { BusinessSettings, ImportPreviewRow, Language, Product } from '../types';
import { translations } from '../i18n/translations';
import { calculateProfit, formatINRNumber } from '../utils/storage';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onImportProducts: (
    newOrUpdatedProducts: Product[],
    summaryText: string
  ) => void;
  language: Language;
  settings: BusinessSettings;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  products,
  onImportProducts,
  language,
  settings,
}) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [duplicateStrategy, setDuplicateStrategy] = useState<'update' | 'skip' | 'new'>('update');
  const [fileName, setFileName] = useState('');
  const [importSummary, setImportSummary] = useState<string | null>(null);

  if (!isOpen) return null;

  // Download Sample CSV template
  const handleDownloadSampleCsv = () => {
    const sampleData = [
      {
        'Product Name': 'RO Membrane 80 GPD Vontron',
        'Product Code': 'MEM-80G',
        'Category': 'RO Membrane',
        'Unit': 'Piece',
        'MOQ': 5,
        'Purchase Price': 700,
        'Wholesale Price': 900,
        'Retail Price': 1350,
        'Stock Quantity': 30,
        'Description': 'Commercial & Domestic RO filtration membrane',
      },
      {
        'Product Name': '10" Melt Blown Sediment Filter',
        'Product Code': 'SED-10-MB',
        'Category': 'Sediment Cartridge',
        'Unit': 'Piece',
        'MOQ': 50,
        'Purchase Price': 16,
        'Wholesale Price': 25,
        'Retail Price': 50,
        'Stock Quantity': 200,
        'Description': '5 micron sediment filter for dust and dirt',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample_Products');
    XLSX.writeFile(workbook, 'NEW_ASHIQUE_ENTERPRISE_PRODUCT_TEMPLATE.csv');
  };

  // Handle file select (CSV or XLSX)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' }) as any[];

        if (!data || data.length === 0) {
          alert('Spreadsheet is empty or could not be read.');
          return;
        }

        // Map and validate rows
        const currentSkus = new Set(products.map((p) => p.code.toLowerCase()));

        const rows: ImportPreviewRow[] = data.map((row: any) => {
          // Normalize column names
          const name = String(row['Product Name'] || row['name'] || row['Name'] || '').trim();
          const code = String(row['Product Code'] || row['code'] || row['SKU'] || row['Code'] || '').trim();
          const category = String(row['Category'] || row['category'] || 'Other Accessories').trim();
          const unit = String(row['Unit'] || row['unit'] || 'Piece').trim();
          const moq = parseInt(row['MOQ'] || row['moq'] || '1') || 1;
          const purchasePrice = parseFloat(row['Purchase Price'] || row['purchasePrice'] || row['Cost'] || '0') || 0;
          const wholesalePrice = parseFloat(row['Wholesale Price'] || row['wholesalePrice'] || row['Wholesale'] || '0') || 0;
          const retailPrice = parseFloat(row['Retail Price'] || row['retailPrice'] || row['Retail'] || '0') || 0;
          const stockQuantity = parseInt(row['Stock Quantity'] || row['stock'] || '0') || 0;
          const description = String(row['Description'] || row['description'] || '').trim();

          let status: 'new' | 'duplicate' | 'error' = 'new';
          let errorMessage = '';

          if (!name) {
            status = 'error';
            errorMessage = 'Product name is missing';
          } else if (!code) {
            status = 'error';
            errorMessage = 'Product code is missing';
          } else if (currentSkus.has(code.toLowerCase())) {
            status = 'duplicate';
          }

          return {
            name,
            code: code.toUpperCase(),
            category,
            unit,
            moq,
            purchasePrice,
            wholesalePrice,
            retailPrice,
            stockQuantity,
            description,
            status,
            errorMessage,
          };
        });

        setPreviewRows(rows);
      } catch (err) {
        console.error('File parsing error:', err);
        alert('Could not parse this spreadsheet file. Please verify format.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Confirm import
  const handleConfirmImport = () => {
    if (previewRows.length === 0) return;

    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    const existingMap = new Map<string, Product>();
    products.forEach((p) => existingMap.set(p.code.toUpperCase(), { ...p }));

    previewRows.forEach((row) => {
      if (row.status === 'error') {
        skippedCount++;
        return;
      }

      const existing = existingMap.get(row.code);
      const { profitAmount, profitCostPct, profitMarginPct } = calculateProfit(
        row.purchasePrice,
        row.retailPrice
      );

      if (existing) {
        if (duplicateStrategy === 'skip') {
          skippedCount++;
        } else if (duplicateStrategy === 'update') {
          existingMap.set(row.code, {
            ...existing,
            name: row.name,
            category: row.category,
            unit: row.unit,
            moq: row.moq,
            purchasePrice: row.purchasePrice,
            wholesalePrice: row.wholesalePrice,
            retailPrice: row.retailPrice,
            profitAmount,
            profitCostPct,
            profitMarginPct,
            stockQuantity: row.stockQuantity ?? existing.stockQuantity,
            description: row.description || existing.description,
            lastUpdated: new Date().toISOString(),
          });
          updatedCount++;
        } else {
          // 'new' -> create with modified SKU
          const newCode = `${row.code}-COPY`;
          existingMap.set(newCode, {
            id: 'prod_' + Math.random().toString(36).substr(2, 9),
            name: row.name,
            code: newCode,
            category: row.category,
            unit: row.unit,
            moq: row.moq,
            purchasePrice: row.purchasePrice,
            wholesalePrice: row.wholesalePrice,
            retailPrice: row.retailPrice,
            profitAmount,
            profitCostPct,
            profitMarginPct,
            stockQuantity: row.stockQuantity,
            description: row.description,
            lastUpdated: new Date().toISOString(),
            isActive: true,
            isDemo: false,
          });
          addedCount++;
        }
      } else {
        // Brand new
        existingMap.set(row.code, {
          id: 'prod_' + Math.random().toString(36).substr(2, 9),
          name: row.name,
          code: row.code,
          category: row.category,
          unit: row.unit,
          moq: row.moq,
          purchasePrice: row.purchasePrice,
          wholesalePrice: row.wholesalePrice,
          retailPrice: row.retailPrice,
          profitAmount,
          profitCostPct,
          profitMarginPct,
          stockQuantity: row.stockQuantity,
          description: row.description,
          lastUpdated: new Date().toISOString(),
          isActive: true,
          isDemo: false,
        });
        addedCount++;
      }
    });

    const updatedCatalog = Array.from(existingMap.values());
    const summary = `Successfully imported! Added: ${addedCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}.`;
    onImportProducts(updatedCatalog, summary);
    setImportSummary(summary);
    setPreviewRows([]);
  };

  // Export current catalog as CSV
  const handleExportCsv = () => {
    const exportData = products.map((p) => ({
      'Product Name': p.name,
      'Product Code': p.code,
      'Category': p.category,
      'Unit': p.unit,
      'MOQ': p.moq,
      'Purchase Price': p.purchasePrice,
      'Wholesale Price': p.wholesalePrice,
      'Retail Price': p.retailPrice,
      'Profit (₹)': p.profitAmount,
      'Profit Margin %': p.profitMarginPct,
      'Stock Quantity': p.stockQuantity || 0,
      'Supplier': p.supplierName || '',
      'Status': p.isActive ? 'Active' : 'Inactive',
      'Description': p.description || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `NEW_ASHIQUE_ENTERPRISE_PRODUCTS_${today}.csv`);
  };

  // Export as JSON backup
  const handleExportJson = () => {
    const backupObj = {
      exportDate: new Date().toISOString(),
      businessName: settings.businessName,
      productCount: products.length,
      settings,
      products,
    };
    const jsonStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NEW_ASHIQUE_ENTERPRISE_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg">
              {t.importExportTitle}
            </h3>
            <p className="text-xs text-slate-400">
              {settings.businessName} • Bulk Price Updates & Backup
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition ${
              activeTab === 'import'
                ? 'border-blue-900 text-blue-900 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Import Spreadsheet (CSV / Excel)
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition ${
              activeTab === 'export'
                ? 'border-blue-900 text-blue-900 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Export Catalog & Backups
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto space-y-4">
          {importSummary && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center gap-2.5 text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{importSummary}</span>
            </div>
          )}

          {activeTab === 'import' ? (
            <div className="space-y-4">
              {/* Step 1 & 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-blue-900 uppercase block mb-1">
                    Step 1: Download Template
                  </span>
                  <p className="text-xs text-slate-600 mb-3">
                    Use our standard CSV columns to prepare your inventory prices.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadSampleCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-700" />
                    <span>{t.downloadSampleTemplate}</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-blue-900 uppercase block mb-1">
                    Step 2: Upload CSV / Excel
                  </span>
                  <p className="text-xs text-slate-600 mb-3">
                    Select your populated file (.csv, .xlsx, .xls) to preview.
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition shadow-xs cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{fileName ? 'Change File' : t.uploadFileLabel}</span>
                    <input
                      type="file"
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {fileName && (
                    <span className="block text-xs font-medium text-slate-700 mt-2 truncate">
                      Loaded: {fileName}
                    </span>
                  )}
                </div>
              </div>

              {/* Preview table if file loaded */}
              {previewRows.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                      <span>{t.importPreviewTitle} ({previewRows.length} Rows)</span>
                    </h4>

                    {/* Duplicate Strategy */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-700">Duplicates:</span>
                      <select
                        value={duplicateStrategy}
                        onChange={(e) => setDuplicateStrategy(e.target.value as any)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-xs"
                      >
                        <option value="update">{t.duplicateUpdate}</option>
                        <option value="skip">{t.duplicateSkip}</option>
                        <option value="new">{t.duplicateCreateNew}</option>
                      </select>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                        <tr>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Code</th>
                          <th className="p-2.5">Category</th>
                          <th className="p-2.5 text-right">Cost</th>
                          <th className="p-2.5 text-right">Wholesale</th>
                          <th className="p-2.5 text-right">Retail</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {previewRows.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2.5">
                              {r.status === 'duplicate' ? (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                                  Existing SKU
                                </span>
                              ) : r.status === 'error' ? (
                                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                                  {r.errorMessage}
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                  New
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 font-bold text-slate-900">{r.name}</td>
                            <td className="p-2.5 font-mono text-slate-600">{r.code}</td>
                            <td className="p-2.5 text-slate-600">{r.category}</td>
                            <td className="p-2.5 text-right">₹{r.purchasePrice}</td>
                            <td className="p-2.5 text-right font-bold text-blue-900">₹{r.wholesalePrice}</td>
                            <td className="p-2.5 text-right font-bold text-emerald-800">₹{r.retailPrice}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleConfirmImport}
                      className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
                    >
                      {t.confirmImportBtn}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Download your entire inventory database to your device for offline record keeping or bulk editing in Excel.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">
                      Spreadsheet Export (CSV)
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Includes product names, codes, categories, purchase costs, wholesale prices, retail prices, and stock.
                    </p>
                  </div>
                  <button
                    onClick={handleExportCsv}
                    className="mt-4 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.exportProductsCsv}</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center mb-2">
                      <Database className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">
                      Full System JSON Backup
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Complete database backup containing all product details, business settings, and category mappings.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJson}
                    className="mt-4 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.exportProductsJson}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
