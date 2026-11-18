import React, { useRef } from 'react';
import {
  Building2,
  Phone,
  MapPin,
  Globe,
  Upload,
  ShieldCheck,
  Award,
  Sparkles,
  Save,
  Check,
  Stethoscope,
} from 'lucide-react';
import { BrandingData } from '../types';
import { POPULAR_PROCEDURES, TRUST_BADGES } from '../data/presets';

interface BrandingPanelProps {
  branding: BrandingData;
  onChangeBranding: (data: Partial<BrandingData>) => void;
  onUploadLogo: (file: File) => void;
  onSaveToLocalStorage: () => void;
  savedNotification: boolean;
}

export const BrandingPanel: React.FC<BrandingPanelProps> = ({
  branding,
  onChangeBranding,
  onUploadLogo,
  onSaveToLocalStorage,
  savedNotification,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
      {/* 1. Logo & Brand Name */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <span className="text-xs font-semibold text-white flex items-center gap-1.5 pb-2 border-b border-slate-800">
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Thương Hiệu & Logo Bệnh Viện Thẩm Mỹ</span>
        </span>

        {/* Logo Upload row */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => logoInputRef.current?.click()}
            className="w-14 h-14 rounded-full border border-dashed border-slate-700 bg-slate-950 hover:border-amber-400 cursor-pointer flex items-center justify-center overflow-hidden shrink-0 transition"
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
          <div className="flex-1 space-y-1">
            <button
              onClick={() => logoInputRef.current?.click()}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 block text-left"
            >
              {branding.logoUrl ? 'Thay đổi Logo' : 'Tải lên Logo Thương Hiệu'}
            </button>
            <p className="text-[11px] text-slate-400 leading-tight">
              Khuyên dùng logo tròn hoặc vuông trong suốt (PNG)
            </p>
          </div>
        </div>

        {/* Brand Name */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400">Tên Thẩm Mỹ Viện / Bệnh Viện</label>
          <input
            type="text"
            value={branding.brandName}
            onChange={(e) => onChangeBranding({ brandName: e.target.value })}
            placeholder="VD: BỆNH VIỆN THẨM MỸ QUỐC TẾ AURA"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400">Slogan / Khoa Phẫu Thuật</label>
          <input
            type="text"
            value={branding.subTitle}
            onChange={(e) => onChangeBranding({ subTitle: e.target.value })}
            placeholder="VD: VIỆN TẠO HÌNH THẨM MỸ CÔNG NGHỆ CAO"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* 2. Surgery Procedure & Doctor */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <span className="text-xs font-semibold text-white flex items-center gap-1.5 pb-2 border-b border-slate-800">
          <Stethoscope className="w-3.5 h-3.5 text-amber-400" />
          <span>Dịch Vụ Phẫu Thuật & Bác Sĩ Thực Hiện</span>
        </span>

        {/* Procedure input */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400">Tên Dịch Vụ Phẫu Thuật</label>
          <input
            type="text"
            value={branding.serviceName}
            onChange={(e) => onChangeBranding({ serviceName: e.target.value })}
            placeholder="VD: Nâng Mũi Cấu Trúc Surgiform S-Line"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 font-semibold"
          />
        </div>

        {/* Quick popular procedures */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 block">Chọn nhanh dịch vụ phổ biến:</span>
          <div className="flex flex-wrap gap-1">
            {POPULAR_PROCEDURES.slice(0, 5).map((proc) => (
              <button
                key={proc}
                onClick={() => onChangeBranding({ serviceName: proc })}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-amber-300 transition"
              >
                {proc.split(' ')[0]} {proc.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Name & Title */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Bác Sĩ Phụ Trách</label>
            <input
              type="text"
              value={branding.doctorName}
              onChange={(e) => onChangeBranding({ doctorName: e.target.value })}
              placeholder="VD: ThS. BS CKII Nguyễn Văn Hùng"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Chức Danh / Kinh Nghiệm</label>
            <input
              type="text"
              value={branding.doctorTitle}
              onChange={(e) => onChangeBranding({ doctorTitle: e.target.value })}
              placeholder="VD: 15+ năm kinh nghiệm"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Before / After Labels */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Nhãn Ảnh TRƯỚC</label>
            <input
              type="text"
              value={branding.beforeLabel}
              onChange={(e) => onChangeBranding({ beforeLabel: e.target.value })}
              placeholder="TRƯỚC PHẪU THUẬT"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Nhãn Ảnh SAU</label>
            <input
              type="text"
              value={branding.afterLabel}
              onChange={(e) => onChangeBranding({ afterLabel: e.target.value })}
              placeholder="SAU 10 NGÀY CẮT CHỈ"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* 3. Contact & Hotline (Crucial for Facebook post leads!) */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <span className="text-xs font-semibold text-white flex items-center gap-1.5 pb-2 border-b border-slate-800">
          <Phone className="w-3.5 h-3.5 text-amber-400" />
          <span>Hotline & Thông Tin Khách Hàng (Tối Giản, Cực Nổi Bật)</span>
        </span>

        {/* Hotline Row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Tiêu Đề Nút Hotline</label>
            <input
              type="text"
              value={branding.hotlineLabel || 'TƯ VẤN / ZALO'}
              onChange={(e) => onChangeBranding({ hotlineLabel: e.target.value })}
              placeholder="VD: TƯ VẤN / ZALO"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Số Điện Thoại / Zalo</label>
            <input
              type="text"
              value={branding.hotline}
              onChange={(e) => onChangeBranding({ hotline: e.target.value })}
              placeholder="0988.123.456"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-rose-400 font-bold placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>
        </div>

        {/* Visibility Toggles for uncluttering */}
        <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
          <span className="text-[11px] text-slate-400 font-medium block">
            Tùy chọn hiển thị thông tin phụ (tránh làm rối mắt):
          </span>

          <label className="flex items-center justify-between cursor-pointer text-slate-300">
            <span>Hiện tên Bác sĩ phụ trách</span>
            <input
              type="checkbox"
              checked={branding.showDoctor !== false}
              onChange={(e) => onChangeBranding({ showDoctor: e.target.checked })}
              className="w-4 h-4 rounded text-amber-400 bg-slate-800 border-slate-700 accent-amber-400 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer text-slate-300">
            <span>Hiện địa chỉ chi nhánh</span>
            <input
              type="checkbox"
              checked={!!branding.showAddress}
              onChange={(e) => onChangeBranding({ showAddress: e.target.checked })}
              className="w-4 h-4 rounded text-amber-400 bg-slate-800 border-slate-700 accent-amber-400 cursor-pointer"
            />
          </label>

          {branding.showAddress && (
            <div className="space-y-1 pl-2 border-l-2 border-slate-700">
              <label className="text-[11px] font-medium text-slate-400">Địa chỉ</label>
              <input
                type="text"
                value={branding.address}
                onChange={(e) => onChangeBranding({ address: e.target.value })}
                placeholder="VD: 128 Nguyễn Trãi, Q.1, TP.HCM"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          <label className="flex items-center justify-between cursor-pointer text-slate-300">
            <span>Hiện Fanpage / Website</span>
            <input
              type="checkbox"
              checked={!!branding.showSocial}
              onChange={(e) => onChangeBranding({ showSocial: e.target.checked })}
              className="w-4 h-4 rounded text-amber-400 bg-slate-800 border-slate-700 accent-amber-400 cursor-pointer"
            />
          </label>

          {branding.showSocial && (
            <div className="grid grid-cols-2 gap-2 pl-2 border-l-2 border-slate-700">
              <input
                type="text"
                value={branding.fanpage}
                onChange={(e) => onChangeBranding({ fanpage: e.target.value })}
                placeholder="fb.com/..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
              <input
                type="text"
                value={branding.website}
                onChange={(e) => onChangeBranding({ website: e.target.value })}
                placeholder="website.vn"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. Trust Badges & Watermark Protection */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <span className="text-xs font-semibold text-white flex items-center gap-1.5 pb-2 border-b border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Chứng Nhận Uy Tín & Đóng Dấu Bản Quyền</span>
        </span>

        {/* Trust Badge Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-400">Huy Hiệu Cam Kết An Toàn</label>
          <select
            value={branding.trustBadge}
            onChange={(e) => onChangeBranding({ trustBadge: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            {TRUST_BADGES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Watermark Protection */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 cursor-pointer">
              <span>Đóng Dấu Bản Quyền Ảnh (Chống Lấy Cắp Ca Mổ)</span>
            </label>
            <input
              type="checkbox"
              checked={branding.showWatermark}
              onChange={(e) => onChangeBranding({ showWatermark: e.target.checked })}
              className="w-4 h-4 rounded text-amber-400 bg-slate-800 border-slate-700 accent-amber-400 cursor-pointer"
            />
          </div>

          {branding.showWatermark && (
            <input
              type="text"
              value={branding.watermarkText}
              onChange={(e) => onChangeBranding({ watermarkText: e.target.value })}
              placeholder="VD: BẢN QUYỀN HÌNH ẢNH AURA HOSPITAL"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
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
            <span className="text-emerald-400">Đã Lưu Cấu Hình Thương Hiệu Vào Máy!</span>
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
