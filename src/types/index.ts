export type FacebookRatio = '1:1' | '4:5' | '9:16' | '16:9' | '1.91:1';

export interface RatioOption {
  id: FacebookRatio;
  label: string;
  sublabel: string;
  width: number;
  height: number;
  iconName: string;
}

export type TemplateId =
  | 'luxury_gold'
  | 'diagonal_split'
  | 'minimal_consult'
  | 'minimal_luxe_gold'
  | 'minimal_silk_ivory'
  | 'minimal_diagonal_prism'
  | 'minimal_arch_editorial';

export type TextFontFamily = 'sans' | 'serif';
export type TextAlignOption = 'left' | 'center' | 'right';

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  category: 'Sang trọng' | 'Chuẩn y khoa' | 'Hàn Quốc' | 'Hiện đại';
  description: string;
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  textColor: string;
  fontHeading: 'serif' | 'sans';
  accentGold?: boolean;
}

export interface ImageAdjustments {
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number; // degrees
  flipH: boolean;
  flipV: boolean;
  brightness: number; // 50 to 150 %
  contrast: number; // 50 to 150 %
  saturation: number; // 0 to 200 %
  smoothSkin: number; // 0 to 100 % (soft focus / glow)
  privacyBar: {
    enabled: boolean;
    type: 'black_bar' | 'blur';
    yPercent: number; // 0 to 100 % from top
    heightPercent: number; // height in percent
  };
}

export interface BrandingData {
  brandName: string;
  subTitle: string;
  logoUrl: string;
  doctorName: string;
  doctorTitle: string;
  serviceName: string;
  serviceSubtitle?: string;
  serviceFont?: TextFontFamily;
  serviceAlign?: TextAlignOption;
  doctorFont?: TextFontFamily;
  doctorAlign?: TextAlignOption;
  beforeLabel: string;
  afterLabel: string;
  vsLabel?: string;
  hotline: string;
  hotlineLabel?: string;
  promoText?: string;
  address: string;
  website: string;
  fanpage: string;
  showAddress?: boolean;
  showSocial?: boolean;
  showDoctor?: boolean;
  showWatermark: boolean;
  watermarkText: string;
  trustBadge: string;
  accentColor: string;
  badgeStyle: 'modern_pill' | 'gold_ribbon' | 'clinical_stamp' | 'minimal_text';
}

export interface SurgeryCasePreset {
  id: string;
  title: string;
  service: string;
  beforeLabel: string;
  afterLabel: string;
  beforeImg: string;
  afterImg: string;
}

export type CaptionTone = 'medical_expert' | 'luxury_trust' | 'concise_inbox' | 'storytelling';

export interface CaptionGenerateRequest {
  serviceName: string;
  serviceSubtitle?: string;
  tone: CaptionTone;
  extraNotes?: string;
  includeClinicInfo: boolean;
  clinicInfo?: {
    brandName?: string;
    doctorName?: string;
    doctorTitle?: string;
    hotline?: string;
    hotlineLabel?: string;
    address?: string;
  };
}

export interface GeneratedCaptionItem {
  id: string;
  styleLabel: string;
  hook: string;
  body: string;
  hashtags: string[];
}
