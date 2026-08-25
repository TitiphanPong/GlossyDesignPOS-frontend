import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { mainServices } from '../landingData';
import styles from '../landing.module.css';
import { SectionHeading } from './SectionHeading';

const serviceTags = ['Everyday print', 'Identity', 'Label & cut', 'Large format', 'Document', 'Office', 'Custom made', 'Creative'] as const;

const serviceVisuals = {
  'document-printing': {
    src: '/covers/document.png',
    alt: 'โต๊ะผลิตงานพิมพ์เอกสารพร้อมเครื่องพิมพ์และชุดเอกสาร',
  },
  stamp: {
    src: '/covers/stamp.png',
    alt: 'ตัวอย่างตรายางสำหรับสำนักงานและธุรกิจ',
  },
} as const;

const toneClassNames = ['', styles.serviceCardDark, styles.serviceCardYellow, styles.serviceCardCyan, '', '', styles.serviceCardDark, ''] as const;

export function ServicesSection() {
  return (
    <section id="services" tabIndex={-1} className={`${styles.servicesSection} ${styles.section} ${styles.sectionAnchor}`} aria-labelledby="services-title">
      <div className={`${styles.sectionShell} ${styles.servicesInner}`}>
        <SectionHeading
          eyebrow="What we print"
          title="ตั้งแต่งานหนึ่งแผ่น ไปจนถึงภาพของทั้งแบรนด์"
          lead="เลือกประเภทงานที่ใกล้เคียง แล้วส่งไฟล์มาให้ทีมช่วยดูสเปก วัสดุ และรายละเอียดที่เหมาะกับการใช้งานจริง"
          titleId="services-title"
        />

        <div className={styles.servicesGrid}>
          {mainServices.map((service, index) => {
            const visual = service.id in serviceVisuals ? serviceVisuals[service.id as keyof typeof serviceVisuals] : undefined;
            const cardClassName = [styles.serviceCard, toneClassNames[index], visual ? styles.serviceCardWithImage : ''].filter(Boolean).join(' ');

            const content = (
              <>
                <div className={styles.serviceTopline}>
                  <span className={styles.serviceNumber}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.serviceTag}>{serviceTags[index]}</span>
                </div>
                <div>
                  <h3 className={styles.serviceName}>{service.title}</h3>
                  <p className={styles.serviceDescription}>{service.description}</p>
                  <span className={styles.serviceAction}>
                    ไปหน้าส่งไฟล์
                    <ArrowUpRight className={styles.buttonArrow} size={16} aria-hidden="true" />
                  </span>
                </div>
              </>
            );

            return (
              <Link key={service.id} href={service.href} className={cardClassName} data-layout={service.layout} aria-label={`${service.title}: ไปหน้าส่งไฟล์`}>
                {visual ? (
                  <>
                    <div className={styles.serviceImage}>
                      <Image src={visual.src} alt={visual.alt} fill quality={75} sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 58vw" className={styles.coverImage} />
                    </div>
                    <div className={styles.serviceImageContent}>{content}</div>
                  </>
                ) : (
                  content
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
