import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { popularServices } from '../landingData';
import styles from '../landing.module.css';

export function PopularServicesSection() {
  return (
    <section id="popular" tabIndex={-1} className={`${styles.popularSection} ${styles.sectionAnchor}`} aria-labelledby="popular-services-title">
      <div className={styles.sectionShell}>
        <div className={styles.popularHeader}>
          <div>
            <p className={styles.eyebrow}>Popular print menu</p>
            <h2 id="popular-services-title" className={styles.popularTitle}>
              งานที่สั่งบ่อย เลือกแล้วส่งไฟล์ได้เลย
            </h2>
          </div>
          <Link href="/upload" className={styles.textLink}>
            เริ่มส่งไฟล์
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <ul className={styles.popularList}>
          {popularServices.map((service, index) => (
            <li key={service.id} className={styles.popularItem}>
              <Link href={service.href} className={styles.popularLink} aria-label={`ส่งไฟล์สำหรับ${service.title}`}>
                <span className={styles.popularCode}>{String(index + 1).padStart(2, '0')}</span>
                <span>
                  <span className={styles.popularName}>{service.title}</span>
                  <span className={styles.popularMeta}>{service.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className={styles.popularHint} aria-hidden="true">
          เลื่อนเพื่อดูงานยอดนิยมเพิ่มเติม →
        </p>
      </div>
    </section>
  );
}
