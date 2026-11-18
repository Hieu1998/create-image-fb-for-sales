import React from 'react';
import { Download } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { FacebookRatio } from '../types';
import { RatioSelector } from './RatioSelector';

interface TopBarProps {
  onOpenExport: () => void;
  selectedRatio: FacebookRatio;
  onSelectRatio: (ratio: FacebookRatio) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenExport,
  selectedRatio,
  onSelectRatio,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Brand wordmark */}
      <div className="flex items-center gap-3">
        <a href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center text-slate-950 font-black text-base shadow-sm">
            A
          </span>
          <span className="font-serif tracking-wide">AuraAesthetic</span>
        </a>
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium" title="Ứng dụng hoạt động 100% trong máy, không cần mạng internet">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>100% Offline</span>
        </div>
      </div>

      {/* Zone 2: Clean single-line Facebook Ratio selector */}
      <div className="hidden md:flex items-center gap-3">
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Tỷ lệ Facebook:</span>
        <RatioSelector selectedRatio={selectedRatio} onSelectRatio={onSelectRatio} />
      </div>

      {/* Zone 3: 1 primary action (+ PWA install button) */}
      <div className="flex items-center gap-3 shrink-0">
        <PWAInstallButton />
        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 rounded-lg hover:brightness-105 active:scale-95 transition-all shadow-md shadow-amber-500/20 whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Xuất Ảnh Facebook HD</span>
        </button>
      </div>
    </header>
  );
};
