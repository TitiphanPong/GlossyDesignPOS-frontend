import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { showcaseItems } from '../landingData';
import styles from '../landing.module.css';
import { SectionHeading } from './SectionHeading';

export function ShowcaseSection() {
  return (
    <section id="showcase" tabIndex={-1} className={`${styles.showcaseSection} ${styles.section} ${styles.sectionAnchor}`} aria-labelledby="showcase-title">
      <div className={styles.sectionShell}>
        <SectionHeading
          eyebrow="Print possibilities"
          title="งานจริงมีทั้งผิวสัมผัส ขนาด และวิธีใช้งาน"
          lead="ดูภาพรวมของงานที่ร้านรองรับ แล้วใช้ตัวอย่างเหล่านี้เป็นจุดเริ่มต้นในการบอกสิ่งที่คุณต้องการ"
          titleId="showcase-title"
        />

        <div className={styles.showcaseGrid}>
          {showcaseItems.map((item, index) => (
            <article key={item.id} className={styles.showcaseItem}>
              <Link href={item.href} className={styles.showcaseCard} aria-label={`${item.title}: ส่งไฟล์เพื่อเริ่มงาน`}>
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  quality={75}
                  sizes={index === 0 ? '(max-width: 600px) 82vw, (max-width: 1024px) 55vw, 58vw' : '(max-width: 600px) 82vw, (max-width: 1024px) 40vw, 34vw'}
                  className={`${styles.coverImage} ${styles.showcaseImage}`}
                />
                <span className={styles.showcaseContent}>
                  <span>
                    <span className={styles.showcaseType}>{item.description}</span>
                    <span className={styles.showcaseName}>{item.title}</span>
                  </span>
                  <span className={styles.showcaseArrow}>
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </article>
          ))}
        </div>
        <p className={styles.showcaseHint} aria-hidden="true">
          เลื่อนเพื่อดูตัวอย่างงาน →
        </p>
      </div>
    </section>
  );
}
