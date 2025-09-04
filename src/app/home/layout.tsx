'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppShell from './shell';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token !== 'glossy-secret') {
      router.push('/login');
    } else {
      setIsChecking(false); // ✅ auth ok
    }
  }, []);

  if (isChecking) return null; // หรือ return <Loading /> ก็ได้

  return <AppShell>{children}</AppShell>;
}
