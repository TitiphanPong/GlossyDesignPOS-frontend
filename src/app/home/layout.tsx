'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppShell from './shell';

type HomeLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function HomeLayout({ children }: HomeLayoutProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token === 'glossy-secret') {
      setIsChecking(false); // ✅ auth ok
      return;
    }

    router.push('/login');
  }, [router]);

  if (isChecking) return null; // หรือ return <Loading /> ก็ได้

  return <AppShell>{children}</AppShell>;
}
