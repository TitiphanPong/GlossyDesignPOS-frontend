'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginBrandPanel from './components/LoginBrandPanel';
import LoginForm from './components/loginForm';
import styles from './components/loginForm.module.css';
import { ADMIN_LOGIN_REDIRECT_PATH, clearAdminAuthSession } from '@/lib/admin-auth';

type AdminSessionStatus = { authenticated?: boolean };
type AdminLoginError = { message?: string };

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectTo, setRedirectTo] = useState(ADMIN_LOGIN_REDIRECT_PATH);

  useEffect(() => {
    clearAdminAuthSession(globalThis.localStorage);
    const redirectParam = new URLSearchParams(globalThis.location.search).get('redirectTo');
    setRedirectTo(redirectParam || ADMIN_LOGIN_REDIRECT_PATH);

    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/session', { credentials: 'same-origin' });
        if (!response.ok) return;
        const payload = (await response.json()) as AdminSessionStatus;
        if (payload.authenticated) router.replace(redirectParam || ADMIN_LOGIN_REDIRECT_PATH);
      } catch {
        // Keep the login form available if the status check fails.
      }
    };

    void checkSession();
  }, [router]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as AdminLoginError | null;
        setErrorMessage(payload?.message || 'กรุณาตรวจสอบชื่อผู้ใช้หรือรหัสผ่านอีกครั้ง');
        return;
      }

      router.push(redirectTo);
    } catch {
      setErrorMessage('ไม่สามารถเชื่อมต่อบริการเข้าสู่ระบบได้ กรุณาลองอีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <LoginBrandPanel />
      <section className={styles.loginPanel} aria-label="เข้าสู่ระบบ">
        <div className={styles.mobileBrand}>
          <Image src="/logo/logo.png" alt="" width={38} height={38} priority />
          <div><strong>Glossy Design</strong><span>POS SYSTEM</span></div>
        </div>
        <LoginForm
          username={username}
          password={password}
          errorMessage={errorMessage}
          submitDisabled={isSubmitting}
          onUsernameChange={event => setUsername(event.target.value)}
          onPasswordChange={event => setPassword(event.target.value)}
          onSubmit={handleLogin}
        />
      </section>
    </main>
  );
}
