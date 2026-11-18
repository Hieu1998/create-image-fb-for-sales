import { SurgeryCasePreset } from '../types';
import sampleLogoImg from '../assets/images/aesthetic_clinic_luxury_logo_1794984631651.jpg';
import sampleBeforeImg from '../assets/images/vietnamese_beauty_portrait_1_1794984631697.jpg';
import sampleAfterImg from '../assets/images/vietnamese_beauty_portrait_2_1794984631652.jpg';

export const SAMPLE_LOGO = sampleLogoImg;
export const SAMPLE_BEFORE = sampleBeforeImg;
export const SAMPLE_AFTER = sampleAfterImg;

export const SURGERY_PRESETS: SurgeryCasePreset[] = [
  {
    id: 'rhinoplasty',
    title: 'Nâng Mũi Cấu Trúc Surgiform S-Line',
    service: 'Nâng Mũi Cấu Trúc S-Line Surgiform',
    beforeLabel: 'TRƯỚC PT (Sống mũi gãy, đầu mũi thô)',
    afterLabel: 'SAU 14 NGÀY (Sống mũi bay, đầu mũi giọt nước)',
    beforeImg: SAMPLE_BEFORE,
    afterImg: SAMPLE_AFTER,
  },
  {
    id: 'blepharoplasty',
    title: 'Cắt Mí Mini Deep Plasma & Mở Rộng Góc Mắt',
    service: 'Cắt Mí Mini Deep Plasma Chuẩn Y Khoa',
    beforeLabel: 'TRƯỚC PT (Mí lót, da chùng)',
    afterLabel: 'SAU 7 NGÀY (Mí 2 mí đều đặn, sắc nét)',
    beforeImg: SAMPLE_BEFORE,
    afterImg: SAMPLE_AFTER,
  },
  {
    id: 'chin_filler',
    title: 'Độn Cằm V-Line & Tạo Hình Viền Hàm',
    service: 'Độn Cằm V-Line Sụn Sinh Học Hoa Kỳ',
    beforeLabel: 'TRƯỚC PT (Cằm lẹm, thiếu độ nhô)',
    afterLabel: 'SAU 1 THÁNG (Cằm chuẩn tỷ lệ vàng V-Line)',
    beforeImg: SAMPLE_BEFORE,
    afterImg: SAMPLE_AFTER,
  },
  {
    id: 'facelift',
    title: 'Căng Chỉ Collagen & Trẻ Hóa Toàn Diện',
    service: 'Căng Chỉ Collagen Kim Cương Không Phẫu Thuật',
    beforeLabel: 'TRƯỚC PT (Nếp nhăn rãnh cười sâu)',
    afterLabel: 'SAU 20 PHÚT (Cơ mặt nâng săn chắc, trẻ 10 tuổi)',
    beforeImg: SAMPLE_BEFORE,
    afterImg: SAMPLE_AFTER,
  },
];

export const POPULAR_PROCEDURES = [
  'Nâng Mũi Cấu Trúc Surgiform S-Line',
  'Cắt Mí Mini Deep Plasma Tự Nhiên',
  'Độn Cằm V-Line Sụn Sinh Học',
  'Nâng Ngực Nội Soi Túi Nano Chip',
  'Hút Mỡ Bụng Siêu Âm Lipo Ultrasound',
  'Cấy Mỡ Tự Thân Baby Face',
  'Căng Da Mặt Nội Soi Trẻ Hoá',
  'Tiêm Filler & Botox Tạo Hình Thẩm Mỹ',
  'Trị Nám Chuyên Sâu Laser PicoSure',
];

export const TRUST_BADGES = [
  'CAM KẾT BẢO HÀNH TRỌN ĐỜI',
  'CHUẨN Y KHOA - BỘ Y TẾ CẤP PHÉP',
  'BÁC SĨ CKII 15+ NĂM KINH NGHIỆM',
  'CHẤT LIỆU CHÍNH HÃNG FDA HOA KỲ',
  'KHÔNG ĐAU - KHÔNG SẸO - VỀ TRONG NGÀY',
  'BẢO HÀNH CHẤT LIỆU TOÀN CẦU',
];
