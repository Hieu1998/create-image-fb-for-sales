import React, { useEffect, useState } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  MessageSquareText,
  Hash,
} from 'lucide-react';
import { BrandingData, CaptionTone, GeneratedCaptionItem } from '../types';
import { CAPTION_TONE_OPTIONS, formatCaptionForCopy } from '../utils/captionHelpers';

interface FacebookCaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: BrandingData;
}

const QUICK_NOTE_CHIPS = [
  'Dáng tự nhiên, hài hòa khuôn mặt',
  'Ít sưng nề, hồi phục nhanh',
  'Bác sĩ CKII trực tiếp thực hiện',
  'Quy trình vô khuẩn chuẩn Bệnh viện',
];

export const FacebookCaptionModal: React.FC<FacebookCaptionModalProps> = ({
  isOpen,
  onClose,
  branding,
}) => {
  const [serviceInput, setServiceInput] = useState<string>('');
  const [extraNotes, setExtraNotes] = useState<string>('');
  const [tone, setTone] = useState<CaptionTone>('medical_expert');
  const [includeClinicInfo, setIncludeClinicInfo] = useState<boolean>(true);
  const [includeHashtags, setIncludeHashtags] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [captions, setCaptions] = useState<GeneratedCaptionItem[]>([]);
  const [editableTexts, setEditableTexts] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setServiceInput((prev) => prev || branding.serviceName || '');
      if (!extraNotes && branding.afterLabel) {
        setExtraNotes(branding.afterLabel);
      }
    }
  }, [isOpen, branding.serviceName, branding.afterLabel, extraNotes]);

  // Keep synced with updated serviceName whenever modal re-opens
  useEffect(() => {
    if (isOpen && branding.serviceName) {
      setServiceInput(branding.serviceName);
    }
  }, [isOpen, branding.serviceName]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    const cleanService = serviceInput.trim();
    if (!cleanService) {
      setErrorMsg('Vui lòng nhập Tên dịch vụ phẫu thuật trước khi tạo caption.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/gemini/captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName: cleanService,
          serviceSubtitle: branding.serviceSubtitle ?? '',
          tone,
          extraNotes: extraNotes.trim(),
          includeClinicInfo,
          clinicInfo: {
            brandName: branding.brandName,
            doctorName: branding.doctorName,
            doctorTitle: branding.doctorTitle,
            hotline: branding.hotline,
            hotlineLabel: branding.hotlineLabel,
            address: branding.showAddress ? branding.address : '',
          },
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        captions?: GeneratedCaptionItem[];
        error?: string;
      };

      if (!response.ok || !Array.isArray(payload.captions)) {
        throw new Error(
          payload.error ||
            'Không thể kết nối máy chủ tạo caption AI. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.'
        );
      }

      setCaptions(payload.captions);
      const nextEditable: Record<string, string> = {};
      payload.captions.forEach((item) => {
        nextEditable[item.id] = formatCaptionForCopy(item, includeHashtags);
      });
      setEditableTexts(nextEditable);
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : 'Không thể tạo caption AI lúc này. Vui lòng thử lại.';
      setErrorMsg(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleHashtags = (checked: boolean) => {
    setIncludeHashtags(checked);
    if (captions.length > 0) {
      const updated: Record<string, string> = {};
      captions.forEach((item) => {
        updated[item.id] = formatCaptionForCopy(item, checked);
      });
      setEditableTexts(updated);
    }
  };

  const handleCopyCaption = async (id: string) => {
    const text = editableTexts[id] ?? '';
    if (!text.trim()) return;
    setCopyNotice(null);

    let copied = false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied) {
      try {
        const helper = document.createElement('textarea');
        helper.value = text;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.top = '-9999px';
        helper.style.left = '-9999px';
        document.body.appendChild(helper);
        helper.focus();
        helper.select();
        helper.setSelectionRange(0, text.length);
        copied = document.execCommand('copy');
        document.body.removeChild(helper);
      } catch {
        copied = false;
      }
    }

    if (copied) {
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((curr) => (curr === id ? null : curr));
      }, 2500);
    } else {
      setCopyNotice('Trình duyệt chặn quyền Clipboard tự động. Bạn có thể chạm giữ hoặc bôi đen văn bản trong khung để sao chép.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="facebook-caption-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2.5 sm:p-4"
    >
      <div className="w-full max-w-4xl max-h-[92dvh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <MessageSquareText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 id="facebook-caption-modal-title" className="text-sm sm:text-base font-bold text-white truncate">
                Gợi Ý Caption Facebook (AI)
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Tạo nhanh 3 mẫu bài đăng chuẩn y khoa & hút khách theo loại dịch vụ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng gợi ý caption"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Input Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 space-y-3">
              <div className="space-y-1">
                <label htmlFor="caption-service-input" className="text-xs font-semibold text-slate-300 block">
                  Loại Dịch Vụ Phẫu Thuật
                </label>
                <input
                  id="caption-service-input"
                  type="text"
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  placeholder="VD: Nâng mũi cấu trúc Surgiform S-Line"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-amber-300 font-semibold placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="caption-notes-input" className="text-xs font-semibold text-slate-300 block">
                  Điểm Nhấn Ca Phẫu Thuật / Tình Trạng (Tùy chọn)
                </label>
                <input
                  id="caption-notes-input"
                  type="text"
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                  placeholder="VD: Sau 10 ngày cắt chỉ, đầu mũi bay mềm mại..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {QUICK_NOTE_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        setExtraNotes((prev) =>
                          prev.trim()
                            ? prev.includes(chip)
                              ? prev
                              : `${prev.trim()} · ${chip}`
                            : chip
                        )
                      }
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition border border-slate-700/60"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tone & Options */}
            <div className="lg:col-span-5 space-y-3">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-300 block">
                  Phong Cách Bài Đăng
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {CAPTION_TONE_OPTIONS.map((item) => {
                    const active = tone === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTone(item.id)}
                        className={`p-2.5 rounded-xl text-left border transition ${
                          active
                            ? 'bg-amber-500/15 border-amber-400 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className={`block text-xs font-bold ${active ? 'text-amber-300' : 'text-white'}`}>
                          {item.label}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                          {item.shortDesc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={includeClinicInfo}
                    onChange={(e) => setIncludeClinicInfo(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                  />
                  <span>Chèn Tên BV, Bác sĩ & Zalo</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={includeHashtags}
                    onChange={(e) => handleToggleHashtags(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                  />
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kèm Hashtag</span>
                </label>
              </div>
            </div>
          </div>

          {/* Primary Generate Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-105 active:scale-[0.99] transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI Đang Soạn 3 Mẫu Caption...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{captions.length > 0 ? 'Tạo Lại 3 Mẫu Khác' : 'Tạo 3 Mẫu Caption AI'}</span>
                </>
              )}
            </button>

            <span className="text-[11px] text-slate-400 text-center sm:text-right">
              Bạn có thể chỉnh sửa trực tiếp từng chữ trước khi sao chép lên Facebook
            </span>
          </div>

          {/* Error Feedback */}
          {errorMsg && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="font-semibold text-rose-300">Chưa thể tạo caption AI</p>
                <p className="leading-relaxed">{errorMsg}</p>
              </div>
              <button
                type="button"
                onClick={handleGenerate}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 font-semibold shrink-0"
              >
                Thử lại
              </button>
            </div>
          )}

          {copyNotice && (
            <div
              role="status"
              className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-2"
            >
              <span>{copyNotice}</span>
              <button
                type="button"
                onClick={() => setCopyNotice(null)}
                className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 font-semibold shrink-0"
              >
                Đóng
              </button>
            </div>
          )}

          {/* Generated Caption Cards */}
          {isGenerating && captions.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-64 rounded-xl bg-slate-950/70 border border-slate-800 p-4 animate-pulse space-y-3"
                >
                  <div className="h-4 w-2/3 bg-slate-800 rounded" />
                  <div className="h-3 w-full bg-slate-800/80 rounded" />
                  <div className="h-3 w-5/6 bg-slate-800/80 rounded" />
                  <div className="h-3 w-4/5 bg-slate-800/80 rounded" />
                  <div className="h-3 w-3/5 bg-slate-800/80 rounded" />
                </div>
              ))}
            </div>
          )}

          {captions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
              {captions.map((item) => {
                const isCopied = copiedId === item.id;
                const value = editableTexts[item.id] ?? formatCaptionForCopy(item, includeHashtags);
                return (
                  <div
                    key={item.id}
                    className="rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col overflow-hidden"
                  >
                    <div className="px-3.5 py-2.5 border-b border-slate-800/80 flex items-center justify-between gap-2 bg-slate-900/50">
                      <span className="text-xs font-bold text-amber-300 truncate">
                        {item.styleLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCaption(item.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition shrink-0 ${
                          isCopied
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-white'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>

                    <textarea
                      aria-label={`Chỉnh sửa nội dung ${item.styleLabel}`}
                      value={value}
                      onChange={(e) =>
                        setEditableTexts((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      rows={10}
                      className="w-full flex-1 p-3.5 bg-transparent text-xs text-slate-200 leading-relaxed resize-y focus:outline-none focus:bg-slate-950"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
