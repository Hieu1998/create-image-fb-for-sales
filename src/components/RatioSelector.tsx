import React from 'react';
import { Square, RectangleVertical, Smartphone, RectangleHorizontal, Image as ImageIcon } from 'lucide-react';
import { FacebookRatio } from '../types';
import { RATIO_OPTIONS } from '../utils/templateHelpers';

interface RatioSelectorProps {
  selectedRatio: FacebookRatio;
  onSelectRatio: (ratio: FacebookRatio) => void;
}

export const RatioSelector: React.FC<RatioSelectorProps> = ({ selectedRatio, onSelectRatio }) => {
  const getIcon = (id: FacebookRatio) => {
    switch (id) {
      case '1:1':
        return <Square className="w-3.5 h-3.5" />;
      case '4:5':
        return <RectangleVertical className="w-3.5 h-3.5" />;
      case '9:16':
        return <Smartphone className="w-3.5 h-3.5" />;
      case '16:9':
        return <RectangleHorizontal className="w-3.5 h-3.5" />;
      case '1.91:1':
        return <ImageIcon className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
      {RATIO_OPTIONS.map((ratio) => {
        const isActive = selectedRatio === ratio.id;
        return (
          <button
            key={ratio.id}
            onClick={() => onSelectRatio(ratio.id)}
            title={ratio.sublabel}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              isActive
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {getIcon(ratio.id)}
            <span>{ratio.label}</span>
          </button>
        );
      })}
    </div>
  );
};
