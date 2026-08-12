import Image from 'next/image';
import { CheckCircleRounded, LocalPrintshopOutlined, ReceiptLongOutlined } from '@mui/icons-material';
import styles from './loginForm.module.css';

const capabilities = ['งานพิมพ์และออเดอร์', 'ขายหน้าร้าน', 'ลูกค้าและการชำระเงิน'];

export default function LoginBrandPanel() {
  return (
    <section className={styles.brandPanel} aria-label="Glossy Design POS">
      <div className={styles.brandContent}>
        <div className={styles.brandLockup}>
          <span className={styles.logoFrame}>
            <Image src="/logo/logo.png" alt="" width={48} height={48} priority />
          </span>
          <div>
            <strong>Glossy Design</strong>
            <span>POS System</span>
          </div>
        </div>

        <div className={styles.brandCopy}>
          <span className={styles.brandKicker}>Printing &amp; Business Management</span>
          <h2>ทุกงานหน้าร้าน<br />อยู่ในระบบเดียว</h2>
          <p>จัดการงานพิมพ์ ออเดอร์ และการขายได้อย่างรวดเร็ว เพื่อให้ทีมพร้อมเริ่มงานได้ทันที</p>
        </div>

        <div className={styles.capabilities}>
          {capabilities.map(item => (
            <span key={item}><CheckCircleRounded aria-hidden="true" />{item}</span>
          ))}
        </div>

        <div className={styles.workflowVisual} aria-hidden="true">
          <div className={styles.orderCard}>
            <span className={styles.visualIcon}><LocalPrintshopOutlined /></span>
            <div><small>งานที่กำลังดำเนินการ</small><strong>นามบัตร Premium</strong></div>
            <span className={styles.status}>กำลังพิมพ์</span>
          </div>
          <div className={styles.receiptCard}>
            <ReceiptLongOutlined />
            <div><span /><span /><span /></div>
          </div>
        </div>
      </div>
      <p className={styles.brandFooter}>พื้นที่ทำงานที่ออกแบบมาเพื่อทีม Glossy Design</p>
    </section>
  );
}
