'use client';

import { Activity, Settings } from 'lucide-react';
import { THEME } from '@/constants/theme';

interface HeaderProps {
  onSettingsClick: () => void;
  hasKey: boolean;
}

export const Header = ({ onSettingsClick, hasKey }: HeaderProps) => (
  <header className={`${THEME.bg} ${THEME.border} border-b p-4 sticky top-0 z-50 flex justify-between items-center shadow-lg shadow-black/50`}>
    <div className="flex items-center gap-2">
      <div className={`p-2 ${THEME.accentBg} rounded-lg`}>
        <Activity className="text-white w-6 h-6" />
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tighter text-white">
          FOOT<span className={THEME.accent}>SCAN</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono">INTELLIGENT PREDICTION SYSTEM</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
       {!hasKey && (
         <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 hidden sm:block font-bold">
           Simulation Mode ( API Key Needed ) - Example Data
         </span>
       )}
      <button 
        onClick={onSettingsClick}
        className={`p-2 rounded-full ${THEME.card} ${THEME.border} border hover:border-slate-600 transition-colors text-slate-300`}
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  </header>
);
