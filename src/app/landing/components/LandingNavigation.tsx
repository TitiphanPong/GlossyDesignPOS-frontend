'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { landingNavItems } from '../landingData';
import styles from './LandingNavigation.module.css';

type NavigationItem = {
  label: string;
  href: `#${string}`;
  sectionId: string;
};

const NAVIGATION_ITEMS: NavigationItem[] = landingNavItems.filter(item => item.href !== '#top').map(item => ({ ...item, sectionId: item.href.slice(1) }));

const MOBILE_MENU_ID = 'landing-mobile-navigation';
const DESKTOP_MEDIA_QUERY = '(min-width: 70rem)';
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function LandingNavigation() {
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const closeMobileMenu = useCallback((returnFocus = false, focusSectionId?: string) => {
    setIsMobileMenuOpen(false);

    window.requestAnimationFrame(() => {
      if (focusSectionId) {
        document.getElementById(focusSectionId)?.focus({ preventScroll: true });
      } else if (returnFocus) {
        menuButtonRef.current?.focus();
      }
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
      if (window.scrollY < 120) setActiveSection(null);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = NAVIGATION_ITEMS.map(item => document.getElementById(item.sectionId)).filter((section): section is HTMLElement => Boolean(section));
    if (sections.length === 0 || !('IntersectionObserver' in window)) return;

    const visibleSections = new Map<string, number>();
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            visibleSections.set(entry.target.id, Math.abs(entry.boundingClientRect.top - window.innerHeight * 0.28));
          } else {
            visibleSections.delete(entry.target.id);
          }
        });

        const closestSection = [...visibleSections.entries()].sort((left, right) => left[1] - right[1])[0]?.[0];
        if (closestSection) setActiveSection(closestSection);
      },
      {
        rootMargin: '-18% 0px -58% 0px',
        threshold: [0, 0.1, 0.35],
      }
    );

    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const bodyOverflow = document.body.style.overflow;
    const bodyPaddingRight = document.body.style.paddingRight;
    const documentOverflow = document.documentElement.style.overflow;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const panel = mobilePanelRef.current;
    const focusFrame = window.requestAnimationFrame(() => {
      panel?.querySelector<HTMLElement>('[data-mobile-menu-autofocus]')?.focus();
    });

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileMenu(true);
        return;
      }

      if (event.key !== 'Tab' || !panel) return;

      const focusableElements = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(element => element.offsetParent !== null);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);
      if (!firstElement || !lastElement) return;

      if (!panel.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? lastElement : firstElement).focus();
      } else if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = bodyOverflow;
      document.body.style.paddingRight = bodyPaddingRight;
      document.documentElement.style.overflow = documentOverflow;
    };
  }, [closeMobileMenu, isMobileMenuOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsMobileMenuOpen(false);
    };

    desktopQuery.addEventListener('change', handleViewportChange);
    return () => desktopQuery.removeEventListener('change', handleViewportChange);
  }, []);

  const handleSectionSelection = (sectionId: string) => {
    setActiveSection(sectionId);
    closeMobileMenu(false, sectionId);
  };

  return (
    <header className={styles.header} data-open={isMobileMenuOpen ? 'true' : 'false'}>
      <div className={`${styles.shell} ${isScrolled || isMobileMenuOpen ? styles.shellElevated : ''}`}>
        <nav className={styles.navigation} aria-label="เมนูหลัก">
          <Link href="/landing" className={styles.brand} aria-label="Glossy Design — กลับหน้าแรก">
            <span className={styles.logoFrame}>
              <Image src="/logo/logo.png" alt="" width={44} height={44} className={styles.logo} />
            </span>
            <span className={styles.brandCopy}>
              <span className={styles.brandName}>Glossy Design</span>
              <span className={styles.brandDescriptor}>
                <span className={styles.registrationDots} aria-hidden="true">
                  <span className={styles.dotCyan} />
                  <span className={styles.dotMagenta} />
                  <span className={styles.dotYellow} />
                  <span className={styles.dotBlack} />
                </span>
                Print · Design · Finish
              </span>
            </span>
          </Link>

          <div className={styles.desktopNavigation}>
            {NAVIGATION_ITEMS.map(item => {
              const isActive = activeSection === item.sectionId;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                  aria-current={isActive ? 'location' : undefined}
                  onClick={() => setActiveSection(item.sectionId)}>
                  {item.label}
                </a>
              );
            })}
          </div>

          <div className={styles.desktopActions}>
            <Link href="/login" className={styles.staffLink}>
              สำหรับพนักงาน
            </Link>
            <Link href="/upload" className={styles.uploadLink}>
              ส่งไฟล์งาน
              <span className={styles.uploadArrow} aria-hidden="true">
                ↗
              </span>
            </Link>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            className={styles.mobileToggle}
            aria-label={isMobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            aria-expanded={isMobileMenuOpen}
            aria-controls={MOBILE_MENU_ID}
            aria-haspopup="dialog"
            onClick={() => setIsMobileMenuOpen(open => !open)}>
            {isMobileMenuOpen ? <X size={20} strokeWidth={1.8} aria-hidden="true" /> : <Menu size={20} strokeWidth={1.8} aria-hidden="true" />}
          </button>
        </nav>
      </div>

      {isMobileMenuOpen ? (
        <>
          <button type="button" className={styles.backdrop} tabIndex={-1} aria-hidden="true" onClick={() => closeMobileMenu(true)} />
          <div className={styles.mobileSheetPosition}>
            <div ref={mobilePanelRef} id={MOBILE_MENU_ID} className={styles.mobileSheet} role="dialog" aria-modal="true" aria-label="เมนูเว็บไซต์">
              <div className={styles.mobileSheetHeader}>
                <div>
                  <p className={styles.mobileEyebrow}>Explore Glossy Design</p>
                  <p className={styles.mobileTitle}>เลือกสิ่งที่คุณกำลังมองหา</p>
                </div>
                <button type="button" className={styles.mobileClose} aria-label="ปิดเมนู" onClick={() => closeMobileMenu(true)}>
                  <X size={19} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </div>

              <div className={styles.mobileLinks}>
                {NAVIGATION_ITEMS.map((item, index) => {
                  const isActive = activeSection === item.sectionId;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      data-mobile-menu-autofocus={index === 0 ? '' : undefined}
                      className={`${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`}
                      aria-current={isActive ? 'location' : undefined}
                      onClick={() => handleSectionSelection(item.sectionId)}>
                      <span className={styles.mobileLinkIndex}>{String(index + 1).padStart(2, '0')}</span>
                      <span className={styles.mobileLinkLabel}>{item.label}</span>
                      <span className={styles.mobileLinkArrow} aria-hidden="true">
                        ↘
                      </span>
                    </a>
                  );
                })}
              </div>

              <div className={styles.mobileActions}>
                <Link href="/upload" className={styles.mobileUploadLink} onClick={() => setIsMobileMenuOpen(false)}>
                  ส่งไฟล์งาน
                  <span aria-hidden="true">↗</span>
                </Link>
                <Link href="/login" className={styles.mobileStaffLink} onClick={() => setIsMobileMenuOpen(false)}>
                  สำหรับพนักงาน
                </Link>
              </div>
              <p className={styles.mobileNote}>พร้อมช่วยตรวจไฟล์และแนะนำงานพิมพ์ก่อนเริ่มผลิต</p>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
