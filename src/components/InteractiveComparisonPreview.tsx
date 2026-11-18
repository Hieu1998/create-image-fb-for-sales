import React, { useState, useRef, useEffect } from 'react';
import {
  SlidersHorizontal,
  LayoutGrid,
  Download,
  RefreshCw,
} from 'lucide-react';
import { FacebookRatio, TemplateDefinition, TemplateId } from '../types';
import { TemplateStripSelector } from './TemplateStripSelector';

interface InteractiveComparisonPreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  selectedRatio: FacebookRatio;
  template: TemplateDefinition;
  onSelectTemplate: (template: TemplateDefinition) => void;
  beforeImgUrl: string;
  afterImgUrl: string;
  onOpenExport: () => void;
  isRendering?: boolean;
}

export const InteractiveComparisonPreview: React.FC<InteractiveComparisonPreviewProps> = ({
  canvasRef,
  selectedRatio,
  template,
  onSelectTemplate,
  beforeImgUrl,
  afterImgUrl,
  onOpenExport,
  isRendering,
}) => {
  const [viewMode, setViewMode] = useState<'template' | 'slider'>('template');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 to 100
  const isDraggingRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.min(Math.max((x / rect.width) * 100, 5), 95);
    setSliderPosition(percent);
  };

  const handleMouseDown = () => {
    isDraggingRef.current = true;
  };

  const handleTouchStart = () => {
    isDraggingRef.current = true;
  };

  useEffect(() => {
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        handleSliderMove(e.clientX);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches[0]) {
        handleSliderMove(e.touches[0].clientX);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const getAspectRatioStyle = () => {
    switch (selectedRatio) {
      case '1:1':
        return { aspectRatio: '1 / 1', maxHeight: '520px' };
      case '4:5':
        return { aspectRatio: '4 / 5', maxHeight: '580px' };
      case '9:16':
        return { aspectRatio: '9 / 16', maxHeight: '600px' };
      case '16:9':
        return { aspectRatio: '16 / 9', maxHeight: '440px' };
      case '1.91:1':
        return { aspectRatio: '1.91 / 1', maxHeight: '380px' };
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-3 lg:p-5 space-y-3">
      {/* Top Preview Controls Bar */}
      <div className="w-full max-w-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('template')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'template'
                ? 'bg-slate-800 text-amber-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Khung Mẫu Hoàn Thiện</span>
          </button>
          <button
            onClick={() => setViewMode('slider')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'slider'
                ? 'bg-slate-800 text-amber-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Kéo Trượt So Sánh (Interactive)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isRendering && (
            <span className="flex items-center gap-1 text-[11px] text-amber-400/80 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Đang render...
            </span>
          )}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-semibold text-xs hover:bg-amber-300 transition shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Ảnh Này</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Display Frame */}
      <div
        ref={containerRef}
        style={getAspectRatioStyle()}
        className="w-full max-w-xl bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative flex items-center justify-center select-none"
      >
        <canvas
          ref={canvasRef}
          className={`w-full h-full object-contain ${viewMode === 'template' ? 'block' : 'hidden'}`}
        />

        {viewMode === 'slider' && (
          <div className="relative w-full h-full overflow-hidden select-none">
            <img
              src={afterImgUrl}
              alt="Sau phẫu thuật"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              SAU PHẪU THUẬT
            </div>

            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={beforeImgUrl}
                alt="Trước phẫu thuật"
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{ width: containerRef.current?.clientWidth || '100%', height: '100%' }}
              />
              <div className="absolute top-4 left-4 bg-slate-900/90 text-white px-3 py-1 rounded-full text-xs font-bold border border-slate-700 shadow-lg">
                TRƯỚC PHẪU THUẬT
              </div>
            </div>

            <div
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className="absolute top-0 bottom-0 z-30 flex items-center justify-center cursor-ew-resize group"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-0.5 h-full bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] group-hover:bg-amber-400 transition-colors" />
              <div className="absolute w-9 h-9 rounded-full bg-white text-slate-900 shadow-2xl border-2 border-amber-400 flex items-center justify-center font-bold text-xs group-hover:scale-110 active:scale-95 transition-transform">
                <SlidersHorizontal className="w-4 h-4 text-slate-900" />
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] text-white/90 border border-white/10 pointer-events-none">
              Kéo thanh trượt để so sánh thay đổi
            </div>
          </div>
        )}
      </div>

      {/* QUICK TEMPLATE STRIP SELECTOR (Directly underneath canvas, instant 1-click swap!) */}
      <TemplateStripSelector
        selectedTemplateId={template.id}
        onSelectTemplate={onSelectTemplate}
      />
    </div>
  );
};
