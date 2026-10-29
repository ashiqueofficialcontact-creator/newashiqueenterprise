import React, { useState } from 'react';
import { Lock, X, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin: string;
  language: Language;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  correctPin,
  language,
}) => {
  const t = translations[language];
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handlePinInput = (val: string) => {
    // Only accept numeric digits
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    setPin(cleaned);
    setError(false);

    // Auto-verify on 4th digit
    if (cleaned.length === 4) {
      const targetPin = correctPin || '1234';
      if (cleaned === targetPin) {
        setPin('');
        setError(false);
        onSuccess();
      } else {
        setError(true);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPin = correctPin || '1234';
    if (pin === targetPin) {
      setError(false);
      setPin('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-xs bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95">
        <div className="w-14 h-14 bg-blue-100 text-blue-900 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-7 h-7 text-blue-900" />
        </div>

        <div className="text-center">
          <h3 className="font-extrabold text-base text-slate-900">
            {t.enterPin}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Enter 4-digit security PIN
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            maxLength={4}
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => handlePinInput(e.target.value)}
            placeholder="••••"
            className={`w-full text-center text-3xl font-mono tracking-widest py-3 px-4 rounded-2xl border ${
              error ? 'border-red-500 bg-red-50 text-red-900' : 'border-slate-300 bg-slate-50'
            } focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600`}
          />

          {error && (
            <p className="text-xs text-red-600 text-center font-bold flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Incorrect PIN. Try again.</span>
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setPin('');
                setError(false);
                onClose();
              }}
              className="py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={pin.length < 4}
              className="py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" />
              <span>Unlock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
