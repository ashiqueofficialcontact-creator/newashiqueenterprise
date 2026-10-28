import React, { useState } from 'react';
import { 
  Settings, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Building, 
  Lock, 
  Database, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  Upload, 
  Download, 
  CloudOff, 
  ShieldCheck, 
  Info,
  ExternalLink 
} from 'lucide-react';
import { BusinessSettings, Language, Product, UserRole } from '../types';
import { translations } from '../i18n/translations';
import { SAMPLE_PRODUCTS } from '../utils/storage';

interface SettingsViewProps {
  settings: BusinessSettings;
  onSaveSettings: (settings: BusinessSettings) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  userRole: UserRole;
  products: Product[];
  onRestoreProducts: (products: Product[]) => void;
  onResetDemoData: () => void;
  onPromptUnlockOwner: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  language,
  onLanguageChange,
  userRole,
  products,
  onRestoreProducts,
  onResetDemoData,
  onPromptUnlockOwner,
}) => {
  const t = translations[language];

  // Editable settings state
  const [formData, setFormData] = useState<BusinessSettings>({ ...settings });
  const [savedAlert, setSavedAlert] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [restoreJsonFile, setRestoreJsonFile] = useState<File | null>(null);
  const [restorePreview, setRestorePreview] = useState<any | null>(null);

  if (userRole === 'customer') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">
          {language === 'bn' ? 'মালিক মোড প্রয়োজন' : 'Owner Access Required'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {language === 'bn' 
            ? 'দোকানের সেটিংস ও গোপন তথ্য পরিবর্তনের জন্য অনুগ্রহ করে মালিক পিন ব্যবহার করে আনলক করুন।'
            : 'Business configurations and backup controls require Owner Mode.'}
        </p>
        <button
          onClick={onPromptUnlockOwner}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition cursor-pointer"
        >
          <Lock className="w-4 h-4 text-amber-400" />
          <span>{t.switchMode}</span>
        </button>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  const handleRestoreJsonSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreJsonFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed && Array.isArray(parsed.products)) {
          setRestorePreview(parsed);
        } else if (Array.isArray(parsed)) {
          setRestorePreview({ products: parsed, productCount: parsed.length });
        } else {
          alert('Invalid backup file. Could not detect product records.');
          setRestoreJsonFile(null);
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
        setRestoreJsonFile(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = () => {
    if (!restorePreview || !restorePreview.products) return;
    onRestoreProducts(restorePreview.products);
    if (restorePreview.settings) {
      onSaveSettings(restorePreview.settings);
    }
    setRestorePreview(null);
    setRestoreJsonFile(null);
    alert('Backup successfully restored into inventory!');
  };

  return (
    <div className="space-y-6 pb-28 max-w-4xl mx-auto px-3 sm:px-6 pt-3">
      {/* Title */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold mb-2">
          <Settings className="w-3.5 h-3.5 text-blue-700" />
          <span>Shop Profile & System Configuration</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
          {t.settingsTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t.settingsSubtitle}
        </p>
      </div>

      {savedAlert && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-2 text-sm font-bold animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-700 flex-shrink-0" />
          <span>{t.settingsSavedSuccess}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-5">
        {/* Business Profile */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building className="w-4 h-4 text-blue-700" />
            <span>Business Information (Shown on Quotes & Home)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t.settingsBusinessName}
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Business Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t.settingsAddress}
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t.settingsMobile}
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t.settingsWhatsapp}
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t.settingsGoogleMaps}
              </label>
              <input
                type="url"
                value={formData.googleMapsUrl}
                onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                placeholder="https://maps.app.goo.gl/... (Optional link to shop location)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Paste your exact Google Maps location link here. It will open when users click "View Address".
              </p>
            </div>
          </div>
        </div>

        {/* Security & Preferences */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Security & App Preferences</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t.settingsOwnerPin}
              </label>
              <input
                type="password"
                maxLength={6}
                value={formData.ownerPin}
                onChange={(e) => setFormData({ ...formData, ownerPin: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-sm focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400">Used to unlock Owner Mode from Customer View</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {language === 'bn' ? 'হোলসেল পাসওয়ার্ড (Wholesale Password)' : 'Wholesale Password'}
              </label>
              <input
                type="text"
                value={formData.wholesalePassword || '1234'}
                onChange={(e) => setFormData({ ...formData, wholesalePassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm focus:ring-2 focus:ring-blue-900"
              />
              <span className="text-[10px] text-slate-400">
                {language === 'bn' ? 'হোলসেল প্রাইস লিস্ট সুরক্ষিত রাখার পাসওয়ার্ড' : 'Password required to open wholesale section'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Default Currency
              </label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Decimal Places
              </label>
              <select
                value={formData.decimalPlaces}
                onChange={(e) => setFormData({ ...formData, decimalPlaces: parseInt(e.target.value) || 2 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm"
              >
                <option value={0}>0 (e.g. ₹150)</option>
                <option value={2}>2 (e.g. ₹150.00)</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {t.settingsPdfNotes}
              </label>
              <textarea
                rows={2}
                value={formData.pdfFooterNote}
                onChange={(e) => setFormData({ ...formData, pdfFooterNote: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{t.saveSettings}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Storage & Cloud Architecture Status */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 space-y-4">
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
          <Database className="w-4 h-4 text-purple-700" />
          <span>Storage Status & Backup</span>
        </h3>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-900 flex-shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Current Storage: Persistent Local Device Storage</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                ACTIVE & FAST
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              All {products.length} products, categories, photos, and settings are saved securely in this browser's local persistent database.
              They remain intact across sessions, page refreshes, and app restarts.
            </p>
            <p className="text-slate-500 pt-1">
              * Note: To safeguard your data across multiple phones or laptops, use the JSON Backup feature below or export your CSV regularly.
            </p>
          </div>
        </div>

        {/* Restore JSON Backup */}
        <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-3">
          <h4 className="font-bold text-xs sm:text-sm text-purple-950 flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-purple-700" />
            <span>Restore from Previous JSON Backup</span>
          </h4>
          <p className="text-xs text-purple-800">
            Select a previous <code className="font-mono bg-purple-100 px-1 rounded">.json</code> backup file to restore product data and settings.
          </p>

          <input
            type="file"
            accept=".json,application/json"
            onChange={handleRestoreJsonSelect}
            className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-900 file:text-white hover:file:bg-purple-800 cursor-pointer"
          />

          {restorePreview && (
            <div className="p-3 bg-white rounded-xl border border-purple-200 text-xs space-y-2">
              <div className="font-bold text-slate-900">
                Backup Preview: Found {restorePreview.products?.length || 0} Products
              </div>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="px-4 py-2 rounded-xl bg-purple-950 text-white font-bold text-xs hover:bg-purple-900 cursor-pointer"
              >
                Confirm & Restore This Backup
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reset Demo Data (Protected Danger Zone) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-red-200 space-y-3">
        <h3 className="font-extrabold text-sm sm:text-base text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Demo Data & Factory Reset</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Need to test the initial state or reload the default sample RO accessories catalog? You can restore the original sample inventory here.
        </p>

        {!showResetConfirm ? (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetAllData}</span>
          </button>
        ) : (
          <div className="p-4 bg-red-50 rounded-2xl border border-red-300 space-y-3 animate-in fade-in">
            <div className="text-xs font-bold text-red-900">
              ⚠️ Are you sure? This will replace your current catalog with the sample demo inventory.
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
              >
                Yes, Restore Demo Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
