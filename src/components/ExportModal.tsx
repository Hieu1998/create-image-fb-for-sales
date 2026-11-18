import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  X,
  FileImage,
  Sparkles,
  Share2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { FacebookRatio } from '../types';
import { getDimensionsForRatio } from '../utils/templateHelpers';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  ratio: FacebookRatio;
  onExport: (format: 'image/png' | 'image/jpeg', quality: number, scaleMultiplier: number) => Promise<string | null>;
  previewDataUrl: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  ratio,
  onExport,
  previewDataUrl,
}) => {
  const [format, setFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [scale, setScale] = useState<number>(2); // Default to 2x for crisp Retina export
  const [quality, setQuality] = useState<number>(0.95);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const baseDim = getDimensionsForRatio(ratio);
  const exportW = baseDim.width * scale;
  const exportH = baseDim.height * scale;

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const dataUrl = await onExport(format, quality, scale);
      if (!dataUrl) return;

      const link = document.createElement('a');
      link.download = `aura-phauthuat-thammy-${ratio.replace(':', '-')}-${exportW}x${exportH}.${
        format === 'image/png' ? 'png' : 'jpg'
      }`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      setIsExporting(true);
      const dataUrl = await onExport('image/png', 1.0, scale);
      if (!dataUrl) return;

      // Pure in-memory conversion without fetch, works 100% offline
      const parts = dataUrl.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        alert('Trình duyệt không hỗ trợ sao chép ảnh trực tiếp, vui lòng bấm Tải Ảnh Về.');
      }
    } catch (err) {
      console.error('Copy clipboard error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row text-slate-200">
        {/* Left Side: High-res Preview Frame */}
        <div className="flex-1 bg-slate-950 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 relative">
          <div className="relative max-h-[500px] max-w-full rounded-xl overflow-hidden shadow-2xl border border-slate-800">
            {previewDataUrl ? (
              <img
                src={previewDataUrl}
                alt="Bản xem trước xuất ảnh"
                className="max-h-[460px] object-contain"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-slate-500">
                Đang tạo bản xem trước...
              </div>
            )}
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-2">
            <span>Độ phân giải xuất:</span>
            <span className="font-mono font-bold text-amber-400">
              {exportW} × {exportH} px
            </span>
          </div>
        </div>

        {/* Right Side: Export Settings & Actions */}
        <div className="w-full md:w-96 p-6 flex flex-col justify-between space-y-5 bg-slate-900">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Xuất Ảnh Đăng Facebook</h3>
                <p className="text-xs text-slate-400">Tối ưu sắc nét, không bị nén vỡ</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Đóng bảng xuất ảnh"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resolution Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Độ Sắc Nét / Kích Thước
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 1, label: '1x Tiêu chuẩn', res: `${baseDim.width}px` },
                  { value: 2, label: '2x Siêu Nét HD', res: `${baseDim.width * 2}px`, recommended: true },
                  { value: 3, label: '3x Ultra 4K', res: `${baseDim.width * 3}px` },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setScale(s.value)}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      scale === s.value
                        ? 'border-amber-400 bg-amber-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-xs font-semibold">{s.label}</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">{s.res}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Format Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Định Dạng Ảnh</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFormat('image/png')}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    format === 'image/png'
                      ? 'border-amber-400 bg-amber-500/10 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="block text-xs font-bold text-amber-300">PNG (Khuyên Dùng)</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    Chữ & số hotline nét tuyệt đối
                  </span>
                </button>

                <button
                  onClick={() => setFormat('image/jpeg')}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    format === 'image/jpeg'
                      ? 'border-amber-400 bg-amber-500/10 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="block text-xs font-bold">JPEG</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Dung lượng nhẹ hơn</span>
                </button>
              </div>
            </div>

            {/* Facebook Tips */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Mẹo Đăng Facebook Tương Tác Cao:
              </span>
              <p>• Xuất ở độ phân giải <strong>2x HD</strong> để tránh Facebook tự động nén làm mờ da và số điện thoại.</p>
              <p>• Dán trực tiếp vào Facebook bằng nút <strong>Sao Chép</strong> bên dưới.</p>
            </div>

            {/* Offline & Privacy guarantee */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
              <span><strong>Offline 100%:</strong> Xử lý & kết xuất trực tiếp trên máy, ảnh không tải lên bất kỳ máy chủ nào.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold text-sm hover:brightness-105 active:scale-95 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Đang Xử Lý...' : 'Tải Ảnh Về Máy'}</span>
            </button>

            <button
              onClick={handleCopyToClipboard}
              disabled={isExporting}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Đã Sao Chép! Dán Trực Tiếp Vào Facebook</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-300" />
                  <span>Sao Chép Vào Clipboard (Dán Ngay)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
