import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import styles from '../landing.module.css';

const proofDetails = [
  ['FILE', 'READY'],
  ['COLOR', 'CMYK'],
  ['STATUS', 'CHECKED'],
] as const;

const heroAssurances = ['ตรวจไฟล์ก่อนผลิต', 'รองรับงานด่วน', 'ชิ้นเดียวถึงล็อตใหญ่'] as const;

export function HeroSection() {
  return (
    <section id="top" tabIndex={-1} className={`${styles.hero} ${styles.sectionAnchor}`} aria-labelledby="landing-hero-title">
      <div className={`${styles.sectionShell} ${styles.heroInner}`}>
        <div className={styles.heroTopline} aria-hidden="true">
          <div className={styles.heroToplineGroup}>
            <span>Glossy Design / Bangkok</span>
            <span>Print · Media · Production</span>
          </div>
          <span>Proof No. GD—001</span>
        </div>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.heroKicker}>
              <span className={styles.heroKickerDot} aria-hidden="true" />
              Creative printing studio
            </p>
            <h1 id="landing-hero-title" className={styles.heroTitle}>
              <span className={styles.heroTitleFirst}>งานพิมพ์</span>
              <span className={styles.heroTitleSecond}>ที่คิดมาครบ</span>
            </h1>

            <div className={styles.heroIntro}>
              <div>
                <p className={styles.heroDescription}>ตั้งแต่ถ่ายเอกสาร นามบัตร สติกเกอร์ ไปจนถึง Inkjet และสินค้าพรีเมียม—ส่งไฟล์ออนไลน์ แล้วให้ทีมช่วยดูรายละเอียดก่อนเริ่มผลิตจริง</p>
                <div className={styles.heroActions}>
                  <Link href="/upload" className={styles.primaryButton}>
                    ส่งไฟล์งาน
                    <ArrowUpRight className={styles.buttonArrow} size={17} aria-hidden="true" />
                  </Link>
                  <a href="#services" className={styles.secondaryButton}>
                    ดูบริการ
                    <ArrowDown className={styles.buttonArrow} size={16} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <figure className={styles.heroProof}>
            <div className={styles.proofStage}>
              <div className={styles.proofShadow} aria-hidden="true" />
              <div className={styles.proofSheet} aria-hidden="true" />
              <div className={styles.proofPhoto}>
                <Image
                  src="/covers/namecard.png"
                  alt="ตัวอย่างการผลิตนามบัตรบนโต๊ะงานพิมพ์"
                  fill
                  priority
                  quality={75}
                  sizes="(max-width: 900px) 88vw, (max-width: 1280px) 38vw, 500px"
                  className={styles.coverImage}
                />
              </div>
              <div className={styles.proofCaption} aria-hidden="true">
                <div>
                  <strong>Print proof / 01</strong>
                  <span>paper · ink · finishing</span>
                </div>
                <div className={styles.colorStrip}>
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>

              <div className={styles.proofSample}>
                <Image src="/covers/sticker.png" alt="ตัวอย่างสติกเกอร์ฉลากสินค้าหลากหลายรูปแบบ" fill quality={75} sizes="(max-width: 600px) 44vw, 230px" className={styles.coverImage} />
              </div>

              <div className={styles.jobTicket} aria-hidden="true">
                <div className={styles.ticketHeader}>
                  <span>Print ticket</span>
                  <span>GD 2929</span>
                </div>
                <div className={styles.ticketBody}>
                  {proofDetails.map(([label, value]) => (
                    <div key={label} className={styles.ticketRow}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                  <span className={styles.ticketStatus}>พร้อมตรวจปรู๊ฟ</span>
                </div>
              </div>
              <span className={styles.registrationMark} aria-hidden="true" />
            </div>
            <figcaption className={styles.visuallyHidden}>ตัวอย่างกระบวนการตรวจปรู๊ฟ นามบัตร และสติกเกอร์ของ Glossy Design</figcaption>
          </figure>
        </div>

        <ul className={styles.heroFootnotes} aria-label="จุดเด่นของบริการ">
          {heroAssurances.map((item, index) => (
            <li key={item} className={styles.heroFootnote}>
              <span className={styles.heroFootnoteNumber}>{String(index + 1).padStart(2, '0')}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
