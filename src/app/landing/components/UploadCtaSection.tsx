import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import styles from '../landing.module.css';

const fileChecks = [
  ['รูปแบบไฟล์', 'พร้อมตรวจ'],
  ['ขนาดและระยะตัด', 'เช็กก่อนผลิต'],
  ['รายละเอียดงาน', 'แนบได้ในระบบ'],
] as const;

const supportedFormats = ['PDF', 'JPG', 'PNG', 'AI', 'PSD', 'ZIP', 'DOC', 'XLS'] as const;

export function UploadCtaSection() {
  return (
    <section className={styles.uploadSection} aria-labelledby="upload-cta-title">
      <div className={`${styles.sectionShell} ${styles.uploadGrid}`}>
        <div>
          <p className={styles.eyebrow}>Ready when you are</p>
          <h2 id="upload-cta-title" className={styles.uploadTitle}>
            มีไฟล์พร้อมแล้ว?
          </h2>
          <p className={styles.uploadCopy}>ส่งไฟล์และรายละเอียดมาให้ทีมตรวจได้เลย ยังไม่แน่ใจเรื่องวัสดุหรือสเปกก็เริ่มจากไฟล์ที่มีได้</p>
          <Link href="/upload" className={styles.uploadButton}>
            ส่งไฟล์ให้เราดู
            <ArrowUpRight className={styles.buttonArrow} size={18} aria-hidden="true" />
          </Link>
        </div>

        <aside className={styles.fileTicket} aria-label="ข้อมูลที่ทีม Glossy Design ช่วยตรวจ">
          <div className={styles.fileTicketHeader}>
            <span>File check ticket</span>
            <span>Online upload</span>
          </div>
          <h3 className={styles.fileTicketTitle}>ส่งครั้งเดียว แล้วคุยรายละเอียดต่อได้เลย</h3>
          <ul className={styles.fileChecklist}>
            {fileChecks.map(([label, value]) => (
              <li key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </li>
            ))}
          </ul>
          <ul className={styles.formatList} aria-label="รูปแบบไฟล์ที่รองรับ">
            {supportedFormats.map(format => (
              <li key={format} className={styles.formatChip}>
                {format}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
