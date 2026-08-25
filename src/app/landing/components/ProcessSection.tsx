import { processSteps } from '../landingData';
import styles from '../landing.module.css';
import { SectionHeading } from './SectionHeading';

export function ProcessSection() {
  return (
    <section id="process" tabIndex={-1} className={`${styles.processSection} ${styles.section} ${styles.sectionAnchor}`} aria-labelledby="process-title">
      <div className={styles.sectionShell}>
        <SectionHeading
          eyebrow="From file to finish"
          title="ห้าจังหวะ จากไฟล์ถึงมือคุณ"
          lead="ส่งรายละเอียดให้ครบ ที่เหลือเราจะช่วยไล่เช็กและพางานผ่านแต่ละขั้นแบบไม่ซับซ้อน"
          titleId="process-title"
        />

        <ol className={styles.processList}>
          {processSteps.map(step => (
            <li key={step.step} className={styles.processStep}>
              <span className={styles.processNumber} aria-hidden="true">
                {step.step}
              </span>
              <h3 className={styles.processName}>{step.title}</h3>
              <p className={styles.processDescription}>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
