import React, { useRef, useState } from 'react';
import {
  Upload,
  ArrowLeftRight,
  Building2,
  Stethoscope,
  Phone,
  Save,
  Check,
  Image as ImageIcon,
  Eye,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import { BrandingData, ImageAdjustments, TextAlignOption, TextFontFamily } from '../types';
import { POPULAR_PROCEDURES, TRUST_BADGES } from '../data/presets';

interface UnifiedControlPanelProps {
  beforeImgUrl: string;
  afterImgUrl: string;
  beforeAdj: ImageAdjustments;
  afterAdj: ImageAdjustments;
  onChangeBeforeAdj: (patch: Partial<ImageAdjustments>) => void;
  onChangeAfterAdj: (patch: Partial<ImageAdjustments>) => void;
  onResetBeforeAdj: () => void;
  onResetAfterAdj: () => void;
  onUploadBefore: (file: File) => void;
  onUploadAfter: (file: File) => void;
  onSwapImages: () => void;
  branding: BrandingData;
  onChangeBranding: (data: Partial<BrandingData>) => void;
  onUploadLogo: (file: File) => void;
  onSaveToLocalStorage: () => void;
  savedNotification: boolean;
  onGoToPreview?: () => void;
  onOpenCaptionAI?: () => void;
}

export const UnifiedControlPanel: React.FC<UnifiedControlPanelProps> = ({
  beforeImgUrl,
  afterImgUrl,
  beforeAdj,
  afterAdj,
  onChangeBeforeAdj,
  onChangeAfterAdj,
  onResetBeforeAdj,
  onResetAfterAdj,
  onUploadBefore,
  onUploadAfter,
  onSwapImages,
  branding,
  onChangeBranding,
  onUploadLogo,
  onSaveToLocalStorage,
  savedNotification,
  onGoToPreview,
  onOpenCaptionAI,
}) => {
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoSide, setActivePhotoSide] = useState<'before' | 'after'>('before');

  const currentAdj = activePhotoSide === 'before' ? beforeAdj : afterAdj;
  const updateCurrentAdj = activePhotoSide === 'before' ? onChangeBeforeAdj : onChangeAfterAdj;
  const resetCurrentAdj = activePhotoSide === 'before' ? onResetBeforeAdj : onResetAfterAdj;
  const isCurrentAdjusted =
    currentAdj.scale !== 1 || currentAdj.offsetX !== 0 || currentAdj.offsetY !== 0;

  const renderTypographyControls = (
    groupLabel: string,
    fontValue: TextFontFamily,
    alignValue: TextAlignOption,
    onChangeFont: (font: TextFontFamily) => void,
    onChangeAlign: (align: TextAlignOption) => void
  ) => (
    <div
      className="flex flex-wrap items-center justify-between gap-2 pt-1"
      aria-label={groupLabel}
    >
      {/* Font Selector: Sans-serif vs Serif */}
      <div className="inline-flex rounded-lg bg-slate-950 border border-slate-800 p-0.5">
        <button
          type="button"
          onClick={() => onChangeFont('sans')}
          aria-label={`${groupLabel} - Font Sans-Serif`}
          className={`px-2.5 py-1.5 sm:py-1 rounded-md text-[11px] font-semibold transition min-h-[34px] sm:min-h-0 ${
            fontValue === 'sans'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Sans-Serif
        </button>
        <button
          type="button"
          onClick={() => onChangeFont('serif')}
          aria-label={`${groupLabel} - Font Serif`}
          className={`px-2.5 py-1.5 sm:py-1 rounded-md text-[11px] font-serif font-semibold transition min-h-[34px] sm:min-h-0 ${
            fontValue === 'serif'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Serif (Có chân)
        </button>
      </div>

      {/* Alignment Selector: Left / Center / Right */}
      <div className="inline-flex rounded-lg bg-slate-950 border border-slate-800 p-0.5">
        {[
          { id: 'left' as TextAlignOption, label: 'Căn trái', icon: AlignLeft },
          { id: 'center' as TextAlignOption, label: 'Căn giữa', icon: AlignCenter },
          { id: 'right' as TextAlignOption, label: 'Căn phải', icon: AlignRight },
        ].map((item) => {
          const Icon = item.icon;
          const active = alignValue === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeAlign(item.id)}
              title={item.label}
              aria-label={`${groupLabel} - ${item.label}`}
              className={`px-2.5 py-1.5 sm:py-1 rounded-md transition flex items-center justify-center min-h-[34px] min-w-[36px] sm:min-h-0 sm:min-w-[30px] ${
                active
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      {/* 1. UPLOAD 2 IMAGES (BEFORE & AFTER) + POSITION & ZOOM */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <span className="text-xs font-bold text-white flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Hình Ảnh Phẫu Thuật (Trước & Sau)</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1" title="Ảnh lưu trên RAM máy, không gửi lên mạng">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Xử lý nội bộ 100%
          </span>
        </span>

        <div className="grid grid-cols-2 gap-3 relative">
          {/* Upload Before */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-slate-300">
              <span>ẢNH TRƯỚC</span>
            </div>
            <div
              onClick={() => beforeInputRef.current?.click()}
              className="group relative h-32 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/80 hover:border-amber-400 cursor-pointer overflow-hidden transition-all flex flex-col items-center justify-center p-1 text-center"
            >
              {beforeImgUrl ? (
                <img
                  src={beforeImgUrl}
                  alt="Trước phẫu thuật"
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="space-y-1">
                  <Upload className="w-5 h-5 mx-auto text-slate-400 group-hover:text-amber-400" />
                  <span className="text-[11px] text-slate-400 block">Tải ảnh Trước</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                <span className="text-xs text-white font-semibold bg-black/70 px-2.5 py-1 rounded-lg">Đổi ảnh</span>
              </div>
              <input
                ref={beforeInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadBefore(file);
                  e.target.value = '';
                }}
              />
            </div>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={onSwapImages}
            title="Đổi chỗ 2 ảnh Trước - Sau"
            aria-label="Đổi vị trí hai ảnh Trước và Sau"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-slate-800 border-2 border-amber-400 text-amber-300 hover:bg-slate-700 flex items-center justify-center shadow-xl transition-transform active:scale-90"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          {/* Upload After */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-slate-300">
              <span>ẢNH SAU</span>
            </div>
            <div
              onClick={() => afterInputRef.current?.click()}
              className="group relative h-32 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/80 hover:border-amber-400 cursor-pointer overflow-hidden transition-all flex flex-col items-center justify-center p-1 text-center"
            >
              {afterImgUrl ? (
                <img
                  src={afterImgUrl}
                  alt="Sau phẫu thuật"
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="space-y-1">
                  <Upload className="w-5 h-5 mx-auto text-slate-400 group-hover:text-amber-400" />
                  <span className="text-[11px] text-slate-400 block">Tải ảnh Sau</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                <span className="text-xs text-white font-semibold bg-black/70 px-2.5 py-1 rounded-lg">Đổi ảnh</span>
              </div>
              <input
                ref={afterInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadAfter(file);
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        </div>

        {/* Photo Position & Zoom Controls */}
        <div className="pt-2.5 border-t border-slate-800/80 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-amber-400" />
              <span>Chỉnh Vị Trí & Phóng To / Thu Nhỏ</span>
            </span>

            {isCurrentAdjusted && (
              <button
                type="button"
                onClick={resetCurrentAdj}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại</span>
              </button>
            )}
          </div>

          {/* Target photo switcher */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setActivePhotoSide('before')}
              className={`py-2 sm:py-1.5 px-2 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                activePhotoSide === 'before'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Ảnh TRƯỚC</span>
              <span className="text-[10px] opacity-80 font-mono">
                {Math.round(beforeAdj.scale * 100)}%
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActivePhotoSide('after')}
              className={`py-2 sm:py-1.5 px-2 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                activePhotoSide === 'after'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Ảnh SAU</span>
              <span className="text-[10px] opacity-80 font-mono">
                {Math.round(afterAdj.scale * 100)}%
              </span>
            </button>
          </div>

          {/* Zoom slider + buttons */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Phóng to / Thu nhỏ</span>
              <span className="font-mono font-bold text-amber-300">
                {Math.round(currentAdj.scale * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Thu nhỏ ảnh"
                onClick={() => updateCurrentAdj({ scale: currentAdj.scale - 0.1 })}
                className="w-9 h-9 sm:w-7 sm:h-7 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-center shrink-0 active:scale-95"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                aria-label="Phóng to hoặc thu nhỏ ảnh"
                min={0.5}
                max={2.5}
                step={0.02}
                value={currentAdj.scale}
                onChange={(e) => updateCurrentAdj({ scale: parseFloat(e.target.value) })}
                className="flex-1 accent-amber-400 cursor-pointer h-2"
              />
              <button
                type="button"
                aria-label="Phóng to ảnh"
                onClick={() => updateCurrentAdj({ scale: currentAdj.scale + 0.1 })}
                className="w-9 h-9 sm:w-7 sm:h-7 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-center shrink-0 active:scale-95"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Offset X & Y Sliders + Nudge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Dịch Trái / Phải</span>
                <span className="font-mono text-slate-300">{currentAdj.offsetX}px</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Dịch ảnh sang trái"
                  onClick={() => updateCurrentAdj({ offsetX: currentAdj.offsetX - 15 })}
                  className="w-8 h-8 sm:w-7 sm:h-7 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  aria-label="Vị trí ngang ảnh"
                  min={-300}
                  max={300}
                  step={2}
                  value={currentAdj.offsetX}
                  onChange={(e) => updateCurrentAdj({ offsetX: parseInt(e.target.value, 10) })}
                  className="flex-1 accent-amber-400 cursor-pointer min-w-0"
                />
                <button
                  type="button"
                  aria-label="Dịch ảnh sang phải"
                  onClick={() => updateCurrentAdj({ offsetX: currentAdj.offsetX + 15 })}
                  className="w-8 h-8 sm:w-7 sm:h-7 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Dịch Lên / Xuống</span>
                <span className="font-mono text-slate-300">{currentAdj.offsetY}px</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Dịch ảnh lên trên"
                  onClick={() => updateCurrentAdj({ offsetY: currentAdj.offsetY - 15 })}
                  className="w-8 h-8 sm:w-7 sm:h-7 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  aria-label="Vị trí dọc ảnh"
                  min={-300}
                  max={300}
                  step={2}
                  value={currentAdj.offsetY}
                  onChange={(e) => updateCurrentAdj({ offsetY: parseInt(e.target.value, 10) })}
                  className="flex-1 accent-amber-400 cursor-pointer min-w-0"
                />
                <button
                  type="button"
                  aria-label="Dịch ảnh xuống dưới"
                  onClick={() => updateCurrentAdj({ offsetY: currentAdj.offsetY + 15 })}
                  className="w-8 h-8 sm:w-7 sm:h-7 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SURGERY PROCEDURE & LABELS */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-amber-400" />
            <span>Dịch Vụ Phẫu Thuật & Nhãn So Sánh</span>
          </span>
          {onOpenCaptionAI && (
            <button
              type="button"
              onClick={onOpenCaptionAI}
              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] font-semibold flex items-center gap-1 transition shrink-0"
            >
              <Sparkles className="w-3 h-3" />
              <span>Viết Caption AI</span>
            </button>
          )}
        </div>

        {/* Procedure Name + Font & Alignment */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-400">Tên Dịch Vụ Phẫu Thuật (Hiện to trên ảnh)</label>
          <input
            type="text"
            value={branding.serviceName}
            onChange={(e) => onChangeBranding({ serviceName: e.target.value })}
            placeholder="VD: Nâng Mũi Cấu Trúc Surgiform S-Line"
            className="w-full px-3 py-2.5 sm:py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm sm:text-xs text-amber-300 font-bold placeholder-slate-600 focus:outline-none focus:border-amber-400"
          />
          {renderTypographyControls(
            'Kiểu chữ Tên Dịch Vụ',
            branding.serviceFont ?? 'sans',
            branding.serviceAlign ?? 'left',
            (font) => onChangeBranding({ serviceFont: font }),
            (align) => onChangeBranding({ serviceAlign: align })
          )}
        </div>

        {/* Editable text below service name (Doctor / Subtitle) + Font & Alignment */}
        <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="service-subtitle-input" className="text-[11px] font-medium text-slate-400">
              Chữ Dưới Tên Dịch Vụ (Tên bác sĩ / Mô tả nổi bật)
            </label>
            {branding.doctorName && (
              <button
                type="button"
                onClick={() => {
                  const docTitle = branding.doctorTitle ? ` · ${branding.doctorTitle}` : '';
                  onChangeBranding({
                    serviceSubtitle: `👨‍⚕️ Bác sĩ thực hiện: ${branding.doctorName}${docTitle}`,
                  });
                }}
                className="text-[11px] sm:text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer shrink-0"
              >
                Lấy theo Bác sĩ
              </button>
            )}
          </div>
          <input
            id="service-subtitle-input"
            type="text"
            value={branding.serviceSubtitle ?? ''}
            onChange={(e) => onChangeBranding({ serviceSubtitle: e.target.value })}
            placeholder="VD: Bảo hành trọn đời · Đẹp tự nhiên không sưng nề..."
            className="w-full px-3 py-2.5 sm:py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm sm:text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
          />
          {renderTypographyControls(
            'Kiểu chữ Tên Bác Sĩ / Mô Tả',
            branding.doctorFont ?? 'sans',
            branding.doctorAlign ?? 'left',
            (font) => onChangeBranding({ doctorFont: font }),
            (align) => onChangeBranding({ doctorAlign: align })
          )}
        </div>

        {/* Quick procedures selector */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {POPULAR_PROCEDURES.slice(0, 5).map((proc) => (
            <button
              type="button"
              key={proc}
              onClick={() => onChangeBranding({ serviceName: proc })}
              className="text-[11px] sm:text-[10px] px-2.5 py-1 sm:px-2 sm:py-0.5 rounded-md bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-amber-300 transition"
            >
              {proc.split(' ')[0]} {proc.split(' ')[1]}
            </button>
          ))}
        </div>

        {/* Before, Center VS & After Labels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-2 pt-1">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Nhãn Ảnh TRƯỚC</label>
            <input
              type="text"
              value={branding.beforeLabel}
              onChange={(e) => onChangeBranding({ beforeLabel: e.target.value })}
              placeholder="TRƯỚC PHẪU THUẬT"
              className="w-full px-3 sm:px-2.5 py-2 sm:py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sm sm:text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="vs-label-input" className="text-[11px] font-medium text-slate-400">
              Chữ Giữa 2 Ảnh
            </label>
            <input
              id="vs-label-input"
              type="text"
              value={branding.vsLabel ?? 'VS'}
              onChange={(e) => onChangeBranding({ vsLabel: e.target.value })}
              placeholder="VS (trống = ẩn)"
              className="w-full px-3 sm:px-2.5 py-2 sm:py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sm sm:text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Nhãn Ảnh SAU</label>
            <input
              type="text"
              value={branding.afterLabel}
              onChange={(e) => onChangeBranding({ afterLabel: e.target.value })}
              placeholder="SAU 10 NGÀY CẮT CHỈ"
              className="w-full px-3 sm:px-2.5 py-2 sm:py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sm sm:text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* 3. BRAND & LOGO & DOCTOR */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <span className="text-xs font-bold text-white flex items-center gap-1.5 pb-2 border-b border-slate-800">
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Thương Hiệu & Logo Bệnh Viện</span>
        </span>

        {/* Logo row */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => logoInputRef.current?.click()}
            className="w-12 h-12 rounded-full border border-slate-600 bg-white hover:border-amber-400 cursor-pointer flex items-center justify-center overflow-hidden shrink-0 transition p-1"
          >
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Upload className="w-4 h-4 text-slate-500" />
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadLogo(file);
                e.target.value = '';
              }}
            />
          </div>
          <div className="flex-1 space-y-0.5">
            <button
              onClick={() => logoInputRef.current?.click()}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 block text-left"
            >
              {branding.logoUrl ? 'Thay đổi Logo' : 'Tải lên Logo Thương Hiệu'}
            </button>
            <p className="text-[10px] text-slate-400">Logo dạng tròn hoặc vuông trong suốt (PNG)</p>
          </div>
        </div>

        {/* Brand Name & Header Subtitle */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400">Tên Bệnh Viện / Viện Thẩm Mỹ</label>
          <input
            type="text"
            value={branding.brandName}
            onChange={(e) => onChangeBranding({ brandName: e.target.value })}
            placeholder="VD: BỆNH VIỆN ĐA KHOA HẢI VÂN"
            className="w-full px-3 py-2.5 sm:py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm sm:text-xs text-white font-semibold placeholder-slate-600 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="brand-subtitle-input" className="text-[11px] font-medium text-slate-400">
            Khoa / Phụ Đề Đầu Ảnh (Dòng 2 dưới tên BV)
          </label>
          <input
            id="brand-subtitle-input"
            type="text"
            value={branding.subTitle ?? ''}
            onChange={(e) => onChangeBranding({ subTitle: e.target.value })}
            placeholder="VD: KHOA PHẪU THUẬT THẨM MỸ (trống = ẩn)"
            className="w-full px-3 py-2 sm:py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sm sm:text-xs text-amber-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Doctor Name & Subtitle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Bác Sĩ Phụ Trách</label>
            <input
              type="text"
              value={branding.doctorName}
              onChange={(e) => {
                const nextName = e.target.value;
                const docTitle = branding.doctorTitle ? ` · ${branding.doctorTitle}` : '';
                onChangeBranding({
                  doctorName: nextName,
                  serviceSubtitle: nextName ? `👨‍⚕️ Bác sĩ thực hiện: ${nextName}${docTitle}` : '',
                });
              }}
              placeholder="VD: ThS. BS CKII Nguyễn Văn Hùng"
              className="w-full px-3 sm:px-2.5 py-2 sm:py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sm sm:text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Kinh Nghiệm / Chức Danh</label>
            <input
              type="text"
              value={branding.doctorTitle}
              onChange={(e) => {
                const nextTitle = e.target.value;
                const docTitle = nextTitle ? ` · ${nextTitle}` : '';
                onChangeBranding({
                  doctorTitle: nextTitle,
                  ...(branding.doctorName
                    ? { serviceSubtitle: `👨‍⚕️ Bác sĩ thực hiện: ${branding.doctorName}${docTitle}` }
                    : {}),
                });
              }}
              placeholder="VD: 15+ năm kinh nghiệm"
              className="w-full px-3 sm:px-2.5 py-2 sm:py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sm sm:text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* 4. HOTLINE / ZALO & TRUST BADGE */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <span className="text-xs font-bold text-white flex items-center gap-1.5 pb-2 border-b border-slate-800">
          <Phone className="w-3.5 h-3.5 text-amber-400" />
          <span>Hotline / Zalo Tư Vấn (Cực Kì Nổi Bật)</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Tiêu đề nút</label>
            <input
              type="text"
              value={branding.hotlineLabel ?? ''}
              onChange={(e) => onChangeBranding({ hotlineLabel: e.target.value })}
              placeholder="VD: TƯ VẤN / ZALO"
              className="w-full px-3 sm:px-2.5 py-2.5 sm:py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm sm:text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Số Điện Thoại</label>
            <input
              type="tel"
              value={branding.hotline}
              onChange={(e) => onChangeBranding({ hotline: e.target.value })}
              placeholder="0988.123.456"
              className="w-full px-3 sm:px-2.5 py-2.5 sm:py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm sm:text-xs text-rose-400 font-bold placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>
        </div>

        {/* Promo / CTA text right of hotline */}
        <div className="space-y-1">
          <label htmlFor="promo-text-input" className="text-[11px] font-medium text-slate-400">
            Chữ Khuyến Mãi / Ghi Chú (Bên phải Hotline)
          </label>
          <input
            id="promo-text-input"
            type="text"
            value={branding.promoText ?? ''}
            onChange={(e) => onChangeBranding({ promoText: e.target.value })}
            placeholder="VD: ⚡ TƯ VẤN 24/7 · NHẬN ƯU ĐÃI THÁNG NÀY"
            className="w-full px-3 py-2 sm:py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sm sm:text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Trust badge (Editable + Quick presets) */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="trust-badge-input" className="text-[11px] font-medium text-slate-400">
              Huy Hiệu Cam Kết (Góc trên phải)
            </label>
            <select
              aria-label="Chọn nhanh mẫu huy hiệu"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  onChangeBranding({ trustBadge: e.target.value });
                }
              }}
              className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] sm:text-[10px] text-amber-300 focus:outline-none focus:border-amber-400"
            >
              <option value="">Chọn mẫu có sẵn...</option>
              {TRUST_BADGES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <input
            id="trust-badge-input"
            type="text"
            value={branding.trustBadge ?? ''}
            onChange={(e) => onChangeBranding({ trustBadge: e.target.value })}
            placeholder="VD: CAM KẾT BẢO HÀNH TRỌN ĐỜI (trống = ẩn)"
            className="w-full px-3 py-2 sm:py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sm sm:text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Watermark checkbox & custom text input */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs py-1">
            <label htmlFor="toggle-watermark" className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <span>Đóng Dấu Bản Quyền Ảnh</span>
            </label>
            <input
              id="toggle-watermark"
              type="checkbox"
              checked={branding.showWatermark}
              onChange={(e) => onChangeBranding({ showWatermark: e.target.checked })}
              className="w-5 h-5 sm:w-4 sm:h-4 rounded text-amber-400 bg-slate-800 border-slate-700 accent-amber-400 cursor-pointer"
            />
          </div>

          {branding.showWatermark && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="watermark-text-input" className="text-[11px] font-medium text-slate-400">
                  Nội dung chữ bản quyền
                </label>
                {branding.brandName && (
                  <button
                    type="button"
                    onClick={() =>
                      onChangeBranding({
                        watermarkText: `BẢN QUYỀN ${branding.brandName.toUpperCase()}`,
                      })
                    }
                    className="text-[11px] sm:text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Lấy theo tên thương hiệu
                  </button>
                )}
              </div>
              <input
                id="watermark-text-input"
                type="text"
                value={branding.watermarkText}
                onChange={(e) => onChangeBranding({ watermarkText: e.target.value })}
                placeholder="VD: BẢN QUYỀN THẨM MỸ VIỆN..."
                className="w-full px-3 py-2.5 sm:py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm sm:text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>
      </div>

      {/* Save Button for LocalStorage */}
      <div className="space-y-2.5">
        {onGoToPreview && (
          <button
            type="button"
            onClick={onGoToPreview}
            className="lg:hidden w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition"
          >
            <Eye className="w-4 h-4" />
            <span>Xem Ảnh Kết Quả Ngay</span>
          </button>
        )}

        <button
          onClick={onSaveToLocalStorage}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-2 transition"
        >
          {savedNotification ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Đã Lưu Thông Tin Thương Hiệu Vào Máy!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-amber-400" />
              <span>Lưu Thông Tin Thương Hiệu (Lần Sau Mở Là Có)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
