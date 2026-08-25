import { advantages } from '../landingData';
import styles from '../landing.module.css';

export function WhyGlossySection() {
  return (
    <section id="why" tabIndex={-1} className={`${styles.whySection} ${styles.section} ${styles.sectionAnchor}`} aria-labelledby="why-title">
      <div className={`${styles.sectionShell} ${styles.whyGrid}`}>
        <div className={styles.whyIntro}>
          <p className={styles.eyebrow}>Why Glossy Design</p>
          <h2 id="why-title" className={styles.whyStatement}>
            งานสวย เริ่มจากการ<span>เช็กให้ครบ</span>
          </h2>
          <p className={styles.sectionLead}>เราดูทั้งไฟล์ วัสดุ จำนวน และการนำไปใช้ เพื่อให้งานจริงใกล้กับสิ่งที่คุณตั้งใจมากที่สุด</p>

          <aside className={styles.proofNote} aria-label="หลักการทำงานของ Glossy Design">
            <div className={styles.proofNoteTop}>
              <span>Quality note</span>
              <span>Approved</span>
            </div>
            <p>ไม่ใช่แค่กดพิมพ์ แต่ช่วยดูความพร้อมตั้งแต่ไฟล์ก่อนหมึกลงกระดาษ</p>
          </aside>
        </div>

        <ol className={styles.advantagesList}>
          {advantages.map((advantage, index) => (
            <li key={advantage.title} className={styles.advantage}>
              <span className={styles.advantageNumber}>{String(index + 1).padStart(2, '0')}</span>
              <h3 className={styles.advantageName}>{advantage.title}</h3>
              <p className={styles.advantageDescription}>{advantage.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
