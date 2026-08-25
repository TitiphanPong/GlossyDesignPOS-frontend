import type { Metadata } from 'next';
import { LandingFooter } from './components/LandingFooter';
import { LandingNavigation } from './components/LandingNavigation';
import { PopularServicesSection } from './components/PopularServicesSection';
import { ProcessSection } from './components/ProcessSection';
import { ServicesSection } from './components/ServicesSection';
import { ShowcaseSection } from './components/ShowcaseSection';
import { UploadCtaSection } from './components/UploadCtaSection';
import { WhyGlossySection } from './components/WhyGlossySection';
import styles from './landing.module.css';
import { HeroSection } from './sections/HeroSection';

export const metadata: Metadata = {
  title: 'Glossy Design | งานพิมพ์ งานออกแบบ และสื่อการผลิต',
  description: 'Glossy Design ให้บริการถ่ายเอกสาร นามบัตร สติกเกอร์ Inkjet โปสเตอร์ งานเข้าเล่ม ตรายาง สินค้าพรีเมียม และงานออกแบบ พร้อมระบบส่งไฟล์ออนไลน์',
};

export default function LandingPage() {
  return (
    <div className={styles.landing}>
      <a href="#main-content" className={styles.skipLink}>
        ข้ามไปยังเนื้อหาหลัก
      </a>
      <LandingNavigation />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <ServicesSection />
        <PopularServicesSection />
        <ShowcaseSection />
        <ProcessSection />
        <WhyGlossySection />
        <UploadCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
