// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Snackbar } from '@mui/material';
import LoginForm from './components/loginForm';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === 'glossydesign' && password === 'glossygmail') {
      localStorage.setItem('auth_token', 'glossy-secret');
      router.push('/dashboard');
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
