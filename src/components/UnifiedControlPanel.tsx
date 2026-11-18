import React, { useRef } from 'react';
import {
  Upload,
  ArrowLeftRight,
  Building2,
  Stethoscope,
  Phone,
  ShieldCheck,
  Save,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { BrandingData } from '../types';
import { POPULAR_PROCEDURES, TRUST_BADGES } from '../data/presets';

interface UnifiedControlPanelProps {
  beforeImgUrl: string;
  afterImgUrl: string;
  onUploadBefore: (file: File) => void;
  onUploadAfter: (file: File) => void;
  onSwapImages: () => void;
  branding: BrandingData;
  onChangeBranding: (data: Partial<BrandingData>) => void;
  onUploadLogo: (file: File) => void;
  onSaveToLocalStorage: () => void;
  savedNotification: boolean;
}

export const UnifiedControlPanel: React.FC<UnifiedControlPanelProps> = ({
  beforeImgUrl,
  afterImgUrl,
  onUploadBefore,
  onUploadAfter,
  onSwapImages,
  branding,
  onChangeBranding,
  onUploadLogo,
  onSaveToLocalStorage,
  savedNotification,
}) => {
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4 p-4 lg:p-5">
      {/* 1. UPLOAD 2 IMAGES (BEFORE & AFTER) */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
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
                }}
              />
            </div>
          </div>

          {/* Swap Button */}
          <button
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
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. SURGERY PROCEDURE & LABELS */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <span className="text-xs font-bold text-white flex items-center gap-1.5 pb-2 border-b border-slate-800">
          <Stethoscope className="w-3.5 h-3.5 text-amber-400" />
          <span>Dịch Vụ Phẫu Thuật & Nhãn So Sánh</span>
        </span>

        {/* Procedure Name */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400">Tên Dịch Vụ Phẫu Thuật (Hiện to trên ảnh)</label>
          <input
            type="text"
            value={branding.serviceName}
            onChange={(e) => onChangeBranding({ serviceName: e.target.value })}
            placeholder="VD: Nâng Mũi Cấu Trúc Surgiform S-Line"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-amber-300 font-bold placeholder-slate-600 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Quick procedures selector */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {POPULAR_PROCEDURES.slice(0, 5).map((proc) => (
            <button
              key={proc}
              onClick={() => onChangeBranding({ serviceName: proc })}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-amber-300 transition"
            >
              {proc.split(' ')[0]} {proc.split(' ')[1]}
            </button>
          ))}
        </div>

        {/* Before & After Labels */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Nhãn Ảnh TRƯỚC</label>
            <input
              type="text"
              value={branding.beforeLabel}
              onChange={(e) => onChangeBranding({ beforeLabel: e.target.value })}
              placeholder="TRƯỚC PHẪU THUẬT"
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Nhãn Ảnh SAU</label>
            <input
              type="text"
              value={branding.afterLabel}
              onChange={(e) => onChangeBranding({ afterLabel: e.target.value })}
              placeholder="SAU 10 NGÀY CẮT CHỈ"
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
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
            className="w-12 h-12 rounded-full border border-dashed border-slate-700 bg-slate-950 hover:border-amber-400 cursor-pointer flex items-center justify-center overflow-hidden shrink-0 transition"
          >
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-cover" />
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

        {/* Brand Name */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400">Tên Bệnh Viện / Viện Thẩm Mỹ</label>
          <input
            type="text"
            value={branding.brandName}
            onChange={(e) => onChangeBranding({ brandName: e.target.value })}
            placeholder="VD: BỆNH VIỆN THẨM MỸ QUỐC TẾ AURA"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-semibold placeholder-slate-600 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Doctor Name & Subtitle */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Bác Sĩ Phụ Trách</label>
            <input
              type="text"
              value={branding.doctorName}
              onChange={(e) => onChangeBranding({ doctorName: e.target.value })}
              placeholder="VD: ThS. BS CKII Nguyễn Văn Hùng"
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Kinh Nghiệm / Chức Danh</label>
            <input
              type="text"
              value={branding.doctorTitle}
              onChange={(e) => onChangeBranding({ doctorTitle: e.target.value })}
              placeholder="VD: 15+ năm kinh nghiệm"
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
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

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Tiêu đề nút</label>
            <input
              type="text"
              value={branding.hotlineLabel || 'TƯ VẤN / ZALO'}
              onChange={(e) => onChangeBranding({ hotlineLabel: e.target.value })}
              placeholder="VD: TƯ VẤN / ZALO"
              className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Số Điện Thoại</label>
            <input
              type="text"
              value={branding.hotline}
              onChange={(e) => onChangeBranding({ hotline: e.target.value })}
              placeholder="0988.123.456"
              className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-rose-400 font-bold placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>
        </div>

        {/* Trust badge */}
        <div className="space-y-1 pt-1">
          <label className="text-[11px] font-medium text-slate-400">Huy Hiệu Cam Kết An Toàn</label>
          <select
            value={branding.trustBadge}
            onChange={(e) => onChangeBranding({ trustBadge: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            {TRUST_BADGES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Watermark checkbox & custom text input */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="toggle-watermark" className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <span>Đóng Dấu Bản Quyền Ảnh</span>
            </label>
            <input
              id="toggle-watermark"
              type="checkbox"
              checked={branding.showWatermark}
              onChange={(e) => onChangeBranding({ showWatermark: e.target.checked })}
              className="w-4 h-4 rounded text-amber-400 bg-slate-800 border-slate-700 accent-amber-400 cursor-pointer"
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
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
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
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>
      </div>

      {/* Save Button for LocalStorage */}
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
  );
};
