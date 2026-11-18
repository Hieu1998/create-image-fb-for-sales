/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FacebookRatio,
  ImageAdjustments,
  TemplateDefinition,
  BrandingData,
} from './types';
import { TEMPLATES } from './data/templates';
import { SAMPLE_LOGO, SAMPLE_BEFORE, SAMPLE_AFTER } from './data/presets';
import { renderSurgeryComparisonCanvas } from './utils/canvasRenderer';
import { TopBar } from './components/TopBar';
import { UnifiedControlPanel } from './components/UnifiedControlPanel';
import { InteractiveComparisonPreview } from './components/InteractiveComparisonPreview';
import { ExportModal } from './components/ExportModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Sparkles, Edit3 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'haivan_aesthetic_branding_config_v3';

const DEFAULT_IMAGE_ADJUSTMENTS: ImageAdjustments = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  flipH: false,
  flipV: false,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  smoothSkin: 0,
  privacyBar: {
    enabled: false,
    type: 'black_bar',
    yPercent: 36,
    heightPercent: 8,
  },
};

const DEFAULT_BRANDING: BrandingData = {
  brandName: 'BỆNH VIỆN ĐA KHOA HẢI VÂN - KHOA PHẪU THUẬT THẨM MỸ',
  subTitle: 'UY TÍN · AN TOÀN · CHUẨN Y KHOA',
  logoUrl: SAMPLE_LOGO,
  doctorName: 'ThS. BS CKII NGUYỄN VĂN HÙNG',
  doctorTitle: '15+ năm kinh nghiệm PTTM',
  serviceName: 'NÂNG MŨI CẤU TRÚC SURGIFORM S-LINE',
  beforeLabel: 'TRƯỚC PHẪU THUẬT',
  afterLabel: 'SAU 10 NGÀY CẮT CHỈ',
  hotline: '0988.123.456',
  hotlineLabel: 'TƯ VẤN / ZALO',
  address: '128 Nguyễn Trãi, P. Bến Thành, Q.1, TP.HCM',
  website: 'benhvienhaivan.vn',
  fanpage: 'fb.com/benhvienhaivan',
  showAddress: false,
  showSocial: false,
  showDoctor: true,
  showWatermark: true,
  watermarkText: 'BẢN QUYỀN HÌNH ẢNH BV ĐA KHOA HẢI VÂN',
  trustBadge: 'CAM KẾT BẢO HÀNH TRỌN ĐỜI',
  accentColor: '#D4AF37',
  badgeStyle: 'modern_pill',
};

export default function App() {
  const [selectedRatio, setSelectedRatio] = useState<FacebookRatio>('1:1');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition>(TEMPLATES[0]);

  const [beforeImgUrl, setBeforeImgUrl] = useState<string>(SAMPLE_BEFORE);
  const [afterImgUrl, setAfterImgUrl] = useState<string>(SAMPLE_AFTER);

  const [branding, setBranding] = useState<BrandingData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_BRANDING, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return DEFAULT_BRANDING;
  });

  const [savedNotification, setSavedNotification] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<'preview' | 'edit'>('preview');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const beforeImgRef = useRef<HTMLImageElement | null>(null);
  const afterImgRef = useRef<HTMLImageElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);

  const loadImage = useCallback((src: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      if (!src) {
        resolve(null);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn('Could not load image:', src);
        resolve(null);
      };
      img.src = src;
    });
  }, []);

  useEffect(() => {
    let isCancelled = false;
    Promise.all([
      loadImage(beforeImgUrl),
      loadImage(afterImgUrl),
      loadImage(branding.logoUrl),
    ]).then(([beforeImg, afterImg, logoImg]) => {
      if (isCancelled) return;
      beforeImgRef.current = beforeImg;
      afterImgRef.current = afterImg;
      logoImgRef.current = logoImg;
      triggerCanvasRender();
    });

    return () => {
      isCancelled = true;
    };
  }, [beforeImgUrl, afterImgUrl, branding.logoUrl, loadImage]);

  const triggerCanvasRender = useCallback(() => {
    if (!canvasRef.current) return;
    setIsRendering(true);

    try {
      renderSurgeryComparisonCanvas({
        canvas: canvasRef.current,
        ratio: selectedRatio,
        template: selectedTemplate,
        beforeImg: beforeImgRef.current,
        afterImg: afterImgRef.current,
        logoImg: logoImgRef.current,
        beforeAdj: DEFAULT_IMAGE_ADJUSTMENTS,
        afterAdj: DEFAULT_IMAGE_ADJUSTMENTS,
        branding,
        scaleMultiplier: 1,
      });

      try {
        setPreviewDataUrl(canvasRef.current.toDataURL('image/png'));
      } catch (e) {
        console.warn('Canvas export preview warning:', e);
      }
    } finally {
      setIsRendering(false);
    }
  }, [selectedRatio, selectedTemplate, branding]);

  useEffect(() => {
    triggerCanvasRender();
  }, [triggerCanvasRender]);

  const handleUploadBefore = (file: File) => {
    const url = URL.createObjectURL(file);
    setBeforeImgUrl(url);
  };

  const handleUploadAfter = (file: File) => {
    const url = URL.createObjectURL(file);
    setAfterImgUrl(url);
  };

  const handleUploadLogo = (file: File) => {
    const url = URL.createObjectURL(file);
    setBranding((prev) => ({ ...prev, logoUrl: url }));
  };

  const handleSwapImages = () => {
    setBeforeImgUrl(afterImgUrl);
    setAfterImgUrl(beforeImgUrl);
  };

  const handleSaveBranding = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(branding));
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 3000);
    } catch (e) {
      console.warn('Could not save branding:', e);
    }
  };

  const handleExportHighRes = async (
    format: 'image/png' | 'image/jpeg',
    quality: number,
    scaleMultiplier: number
  ): Promise<string | null> => {
    const offscreenCanvas = document.createElement('canvas');

    renderSurgeryComparisonCanvas({
      canvas: offscreenCanvas,
      ratio: selectedRatio,
      template: selectedTemplate,
      beforeImg: beforeImgRef.current,
      afterImg: afterImgRef.current,
      logoImg: logoImgRef.current,
      beforeAdj: DEFAULT_IMAGE_ADJUSTMENTS,
      afterAdj: DEFAULT_IMAGE_ADJUSTMENTS,
      branding,
      scaleMultiplier,
    });

    return offscreenCanvas.toDataURL(format, quality);
  };

  return (
    <div className="min-h-[100dvh] bg-[#070b14] text-slate-100 flex flex-col font-sans overflow-x-hidden">
      {/* 1. Sticky Header + Mobile Switcher Bar */}
      <div className="sticky top-0 z-40">
        <TopBar
          onOpenExport={() => setIsExportModalOpen(true)}
          selectedRatio={selectedRatio}
          onSelectRatio={setSelectedRatio}
        />

        {/* Mobile Switcher Bar */}
        <div className="lg:hidden flex items-center gap-1.5 p-1.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
          <button
            onClick={() => setMobileView('preview')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              mobileView === 'preview'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white bg-slate-950/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Xem Ảnh & Đổi Mẫu</span>
          </button>
          <button
            onClick={() => setMobileView('edit')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              mobileView === 'edit'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white bg-slate-950/40'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Nhập Thông Tin & Tải Ảnh</span>
          </button>
        </div>
      </div>

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden max-w-[1600px] w-full mx-auto">
        {/* Left Side: Direct Unified Input Panel (Photos, Brand, Service, Hotline) */}
        <aside
          className={`w-full lg:w-[440px] bg-slate-950/70 lg:border-r border-slate-800 flex-col shrink-0 lg:max-h-[calc(100vh-65px)] overflow-y-auto pb-8 lg:pb-0 ${
            mobileView === 'edit' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <UnifiedControlPanel
            beforeImgUrl={beforeImgUrl}
            afterImgUrl={afterImgUrl}
            onUploadBefore={handleUploadBefore}
            onUploadAfter={handleUploadAfter}
            onSwapImages={handleSwapImages}
            branding={branding}
            onChangeBranding={(data) => setBranding((p) => ({ ...p, ...data }))}
            onUploadLogo={handleUploadLogo}
            onSaveToLocalStorage={handleSaveBranding}
            savedNotification={savedNotification}
          />
        </aside>

        {/* Center / Right: Live Canvas Preview with Instant Template Selector underneath! */}
        <section
          className={`flex-1 bg-gradient-to-b from-[#090d19] to-[#04060c] items-start lg:items-center justify-center relative pb-8 lg:pb-0 ${
            mobileView === 'preview' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <InteractiveComparisonPreview
            canvasRef={canvasRef}
            selectedRatio={selectedRatio}
            onSelectRatio={setSelectedRatio}
            template={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
            onOpenExport={() => setIsExportModalOpen(true)}
            isRendering={isRendering}
          />
        </section>
      </main>

      {/* 3. Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        ratio={selectedRatio}
        onExport={handleExportHighRes}
        previewDataUrl={previewDataUrl}
      />

      <OfflineIndicator />
    </div>
  );
}
