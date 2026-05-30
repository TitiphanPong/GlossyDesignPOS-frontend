// src/app/login/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Snackbar } from '@mui/material';
import LoginForm from './components/loginForm';
import { ADMIN_AUTH_STORAGE_KEY, ADMIN_LOGIN_REDIRECT_PATH, canAdminLogin, createAdminSession, isValidAdminToken } from '@/lib/admin-auth';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    if (isValidAdminToken(storedToken)) {
      router.replace(ADMIN_LOGIN_REDIRECT_PATH);
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (canAdminLogin(username, password)) {
      localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, createAdminSession());
      router.push(ADMIN_LOGIN_REDIRECT_PATH);
    } else {
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <LoginForm username={username} password={password} onUsernameChange={e => setUsername(e.target.value)} onPasswordChange={e => setPassword(e.target.value)} onSubmit={handleLogin} />

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" variant="filled" sx={{ width: '100%' }}>
          ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
        </Alert>
      </Snackbar>
    </>
  );
}
