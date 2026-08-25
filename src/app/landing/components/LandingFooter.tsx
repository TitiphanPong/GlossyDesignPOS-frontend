import Image from 'next/image';
import Link from 'next/link';
import { landingContact, landingFooterLinks } from '../landingData';
import styles from '../landing.module.css';

export function LandingFooter() {
  return (
    <footer id="contact" tabIndex={-1} className={`${styles.footer} ${styles.sectionAnchor}`}>
      <div className={`${styles.sectionShell} ${styles.footerMain}`}>
        <div className={styles.footerBrand}>
          <Link href="/landing" className={styles.footerLogo} aria-label="Glossy Design หน้าแรก">
            <span className={styles.footerLogoMark}>
              <Image src="/logo/logo.png" alt="" fill sizes="48px" className={styles.coverImage} />
            </span>
            <span className={styles.footerLogoText}>
              <strong>Glossy Design</strong>
              <span>Print · Media · Production</span>
            </span>
          </Link>
          <p className={styles.footerDescription}>งานพิมพ์ งานออกแบบ และสื่อการผลิตสำหรับคนที่อยากให้งานจริงออกมาครบทั้งรายละเอียดและการใช้งาน</p>
        </div>

        <div>
          <h2 className={styles.footerHeading}>Explore</h2>
          <ul className={styles.footerLinks}>
            {landingFooterLinks.navigation.slice(1, 6).map(link => (
              <li key={link.href}>
                <a href={link.href} className={styles.footerLink}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={styles.footerHeading}>Start</h2>
          <ul className={styles.footerLinks}>
            {landingFooterLinks.actions.map(link => (
              <li key={link.href}>
                <Link href={link.href} className={styles.footerLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.footerContact}>
          <h2 className={styles.footerHeading}>Contact</h2>
          <ul className={styles.footerLinks}>
            <li>
              <a href={landingContact.phoneHref} className={styles.footerLink}>
                {landingContact.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={landingContact.emailHref} className={styles.footerLink}>
                {landingContact.email}
              </a>
            </li>
            <li className={styles.footerText}>{landingContact.address}</li>
          </ul>
        </div>
      </div>

      <div className={`${styles.sectionShell} ${styles.footerBottom}`}>
        <span>© {new Date().getFullYear()} Glossy Design. All rights reserved.</span>
        <div className={styles.footerLegal}>
          {landingFooterLinks.legal.map(link => (
            <Link key={link.href} href={link.href} className={styles.footerLink}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className={styles.footerColorBar} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
    </footer>
  );
}
