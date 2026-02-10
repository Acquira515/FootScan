'use client';

import { useState } from 'react';
import { Settings, Info } from 'lucide-react';
import { THEME } from '@/constants/theme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
}

export const SettingsModal = ({ isOpen, onClose, onSave, currentKey }: SettingsModalProps) => {
  const [key, setKey] = useState(currentKey || '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className={`${THEME.card} border ${THEME.border} rounded-2xl w-full max-w-md shadow-2xl overflow-hidden`}>
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-red-600" />
            System Configuration
          </h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Football-API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-all font-mono"
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
            <p className="text-xs text-slate-500 mt-2">
              Your key is stored locally in your browser session. It is never transmitted to our servers.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-red-600" />
              How to get a key
            </h3>
            <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside">
              <li>Visit <a href="https://www.api-football.com/" target="_blank" rel="noreferrer" className="text-red-500 hover:underline">api-football.com</a></li>
              <li>Sign up for a free account (100 req/day).</li>
              <li>Copy your API Key from the dashboard.</li>
              <li>Paste it above to enable live data.</li>
            </ol>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-950/30">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(key)}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20 text-sm"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
