import React from 'react';
import { LayoutGrid, Download, RefreshCw } from 'lucide-react';
import { FacebookRatio, TemplateDefinition } from '../types';
import { TemplateStripSelector } from './TemplateStripSelector';
import { RatioSelector } from './RatioSelector';

interface InteractiveComparisonPreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  selectedRatio: FacebookRatio;
  onSelectRatio: (ratio: FacebookRatio) => void;
  template: TemplateDefinition;
  onSelectTemplate: (template: TemplateDefinition) => void;
  onOpenExport: () => void;
  isRendering?: boolean;
}

export const InteractiveComparisonPreview: React.FC<InteractiveComparisonPreviewProps> = ({
  canvasRef,
  selectedRatio,
  onSelectRatio,
  template,
  onSelectTemplate,
  onOpenExport,
  isRendering,
}) => {
  const getAspectRatioStyle = (): React.CSSProperties => {
    switch (selectedRatio) {
      case '1:1':
        return { aspectRatio: '1 / 1', maxHeight: 'min(56vh, 520px)' };
      case '4:5':
        return { aspectRatio: '4 / 5', maxHeight: 'min(60vh, 580px)' };
      case '9:16':
        return { aspectRatio: '9 / 16', maxHeight: 'min(62vh, 600px)' };
      case '16:9':
        return { aspectRatio: '16 / 9', maxHeight: 'min(48vh, 440px)' };
      case '1.91:1':
        return { aspectRatio: '1.91 / 1', maxHeight: 'min(44vh, 380px)' };
    }
  };

  return (
    <div className="flex flex-col items-center justify-start lg:justify-center w-full h-full px-3 py-3 sm:p-4 lg:p-5 space-y-3 overflow-y-auto">
      {/* Mobile Facebook Ratio Selector (visible on < md where TopBar hides it) */}
      <div className="w-full max-w-xl md:hidden space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
          <span className="font-medium">Tỷ lệ khung Facebook:</span>
          <span className="text-amber-400 font-semibold">{selectedRatio}</span>
        </div>
        <RatioSelector selectedRatio={selectedRatio} onSelectRatio={onSelectRatio} />
      </div>

      {/* Top Preview Controls Bar */}
      <div className="w-full max-w-xl flex items-center justify-between gap-2 sm:gap-3 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 text-amber-400 font-semibold shadow-sm min-w-0">
          <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Xem Trước: {template.name}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isRendering && (
            <span className="flex items-center gap-1 text-[11px] text-amber-400/80 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span className="hidden sm:inline">Đang render...</span>
            </span>
          )}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-amber-400 text-slate-950 font-semibold text-xs hover:bg-amber-300 transition shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Ảnh Này</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Display Frame */}
      <div
        style={getAspectRatioStyle()}
        className="w-full max-w-xl bg-slate-950 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative flex items-center justify-center select-none mx-auto"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain block"
        />
      </div>

      {/* QUICK TEMPLATE STRIP SELECTOR (Directly underneath canvas, instant 1-click swap!) */}
      <TemplateStripSelector
        selectedTemplateId={template.id}
        onSelectTemplate={onSelectTemplate}
      />
    </div>
  );
};
