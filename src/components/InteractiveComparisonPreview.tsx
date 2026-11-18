import React, { useRef, useState } from 'react';
import {
  LayoutGrid,
  Download,
  RefreshCw,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Check,
  Sparkles,
} from 'lucide-react';
import { FacebookRatio, ImageAdjustments, TemplateDefinition } from '../types';
import { TemplateStripSelector } from './TemplateStripSelector';
import { RatioSelector } from './RatioSelector';

interface InteractiveComparisonPreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  selectedRatio: FacebookRatio;
  onSelectRatio: (ratio: FacebookRatio) => void;
  template: TemplateDefinition;
  onSelectTemplate: (template: TemplateDefinition) => void;
  onOpenExport: () => void;
  onOpenCaptionAI?: () => void;
  isRendering?: boolean;
  beforeAdj: ImageAdjustments;
  afterAdj: ImageAdjustments;
  onChangeBeforeAdj: (patch: Partial<ImageAdjustments>) => void;
  onChangeAfterAdj: (patch: Partial<ImageAdjustments>) => void;
  onResetBeforeAdj: () => void;
  onResetAfterAdj: () => void;
}

export const InteractiveComparisonPreview: React.FC<InteractiveComparisonPreviewProps> = ({
  canvasRef,
  selectedRatio,
  onSelectRatio,
  template,
  onSelectTemplate,
  onOpenExport,
  onOpenCaptionAI,
  isRendering,
  beforeAdj,
  afterAdj,
  onChangeBeforeAdj,
  onChangeAfterAdj,
  onResetBeforeAdj,
  onResetAfterAdj,
}) => {
  const [isAdjustMode, setIsAdjustMode] = useState<boolean>(false);
  const [activeSide, setActiveSide] = useState<'before' | 'after'>('before');
  const dragStateRef = useRef<{
    side: 'before' | 'after';
    startX: number;
    startY: number;
    initialOffsetX: number;
    initialOffsetY: number;
  } | null>(null);

  const getAspectRatioStyle = (): React.CSSProperties => {
    switch (selectedRatio) {
      case '1:1':
        return { aspectRatio: '1 / 1', maxHeight: 'min(54vh, 520px)' };
      case '4:5':
        return { aspectRatio: '4 / 5', maxHeight: 'min(58vh, 580px)' };
      case '9:16':
        return { aspectRatio: '9 / 16', maxHeight: 'min(60vh, 600px)' };
      case '16:9':
        return { aspectRatio: '16 / 9', maxHeight: 'min(48vh, 440px)' };
      case '1.91:1':
        return { aspectRatio: '1.91 / 1', maxHeight: 'min(44vh, 380px)' };
    }
  };

  const activeAdj = activeSide === 'before' ? beforeAdj : afterAdj;
  const updateActiveAdj = activeSide === 'before' ? onChangeBeforeAdj : onChangeAfterAdj;
  const resetActiveAdj = activeSide === 'before' ? onResetBeforeAdj : onResetAfterAdj;

  const detectSideFromPointer = (clientX: number, _clientY: number, rect: DOMRect): 'before' | 'after' => {
    return clientX - rect.left < rect.width / 2 ? 'before' : 'after';
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Allow direct touch panning when Chỉnh Ảnh mode is active, or mouse dragging anytime on desktop
    if (!isAdjustMode && e.pointerType !== 'mouse') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const side = detectSideFromPointer(e.clientX, e.clientY, rect);
    setActiveSide(side);
    const current = side === 'before' ? beforeAdj : afterAdj;

    dragStateRef.current = {
      side,
      startX: e.clientX,
      startY: e.clientY,
      initialOffsetX: current.offsetX,
      initialOffsetY: current.offsetY,
    };

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // Ignore synthetic event errors
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragStateRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ratioScale = rect.width > 0 ? canvas.width / rect.width : 1.8;
    const dx = (e.clientX - drag.startX) * ratioScale;
    const dy = (e.clientY - drag.startY) * ratioScale;

    const updater = drag.side === 'before' ? onChangeBeforeAdj : onChangeAfterAdj;
    updater({
      offsetX: drag.initialOffsetX + dx,
      offsetY: drag.initialOffsetY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragStateRef.current = null;
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
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
      <div className="w-full max-w-xl flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 text-amber-400 font-semibold shadow-sm min-w-0">
          <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Xem Trước: {template.name}</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isRendering && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-amber-400/80 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Đang render...</span>
            </span>
          )}

          {onOpenCaptionAI && (
            <button
              type="button"
              onClick={onOpenCaptionAI}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-300 font-semibold text-xs hover:bg-amber-500/15 hover:border-amber-400 transition shadow-sm active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gợi ý Caption AI</span>
              <span className="sm:hidden">Caption AI</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAdjustMode((v) => !v)}
            aria-pressed={isAdjustMode}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg font-semibold text-xs transition shadow-sm active:scale-95 whitespace-nowrap border ${
              isAdjustMode
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400 hover:text-amber-300'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            <span>{isAdjustMode ? 'Đang Chỉnh Ảnh' : 'Chỉnh Ảnh'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg bg-amber-400 text-slate-950 font-semibold text-xs hover:bg-amber-300 transition shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tải Ảnh Này</span>
            <span className="sm:hidden">Tải Về</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Display Frame */}
      <div
        style={getAspectRatioStyle()}
        className={`w-full max-w-xl bg-slate-950 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl relative flex items-center justify-center select-none mx-auto transition-all ${
          isAdjustMode
            ? 'border-2 border-emerald-400 ring-2 ring-emerald-500/20'
            : 'border border-slate-800'
        }`}
      >
        <canvas
          ref={canvasRef}
          data-testid="comparison-canvas"
          data-template-id={template.id}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`w-full h-full object-contain block ${
            isAdjustMode ? 'touch-none cursor-grab active:cursor-grabbing' : 'lg:cursor-grab lg:active:cursor-grabbing'
          }`}
        />
      </div>

      {/* Inline Mobile & Desktop Quick Photo Adjust Strip when Chỉnh Ảnh is active */}
      {isAdjustMode && (
        <div className="w-full max-w-xl p-3 rounded-xl bg-slate-900/95 border border-emerald-500/40 shadow-lg space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveSide('before')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  activeSide === 'before'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Ảnh TRƯỚC
              </button>
              <button
                type="button"
                onClick={() => setActiveSide('after')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  activeSide === 'after'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Ảnh SAU
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={resetActiveAdj}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAdjustMode(false)}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Xong</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-emerald-300/90">
            Chạm kéo trực tiếp trên ảnh Trước / Sau hoặc dùng nút bên dưới:
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Quick Zoom Controls */}
            <div className="flex items-center gap-2 w-full sm:flex-1 min-w-0">
              <button
                type="button"
                aria-label="Thu nhỏ trên xem trước"
                onClick={() => updateActiveAdj({ scale: activeAdj.scale - 0.1 })}
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center shrink-0"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                aria-label="Thanh zoom nhanh"
                min={0.5}
                max={2.5}
                step={0.02}
                value={activeAdj.scale}
                onChange={(e) => updateActiveAdj({ scale: parseFloat(e.target.value) })}
                className="flex-1 min-w-0 accent-amber-400 cursor-pointer"
              />
              <button
                type="button"
                aria-label="Phóng to trên xem trước"
                onClick={() => updateActiveAdj({ scale: activeAdj.scale + 0.1 })}
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center shrink-0"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono text-amber-300 font-bold w-11 text-right shrink-0">
                {Math.round(activeAdj.scale * 100)}%
              </span>
            </div>

            {/* Quick Directional Nudge Buttons */}
            <div className="flex items-center justify-center sm:justify-end gap-1.5 shrink-0">
              <button
                type="button"
                aria-label="Dịch trái"
                onClick={() => updateActiveAdj({ offsetX: activeAdj.offsetX - 15 })}
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Dịch lên"
                onClick={() => updateActiveAdj({ offsetY: activeAdj.offsetY - 15 })}
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Dịch xuống"
                onClick={() => updateActiveAdj({ offsetY: activeAdj.offsetY + 15 })}
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Dịch phải"
                onClick={() => updateActiveAdj({ offsetX: activeAdj.offsetX + 15 })}
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK TEMPLATE STRIP SELECTOR (Directly underneath canvas, instant 1-click swap!) */}
      <TemplateStripSelector
        selectedTemplateId={template.id}
        onSelectTemplate={onSelectTemplate}
      />
    </div>
  );
};
