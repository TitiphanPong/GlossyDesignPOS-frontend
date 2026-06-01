'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Snackbar } from '@mui/material';
import LoginForm from './components/loginForm';
import { ADMIN_LOGIN_REDIRECT_PATH, clearAdminAuthSession } from '@/lib/admin-auth';

type AdminSessionStatus = {
  authenticated?: boolean;
};

type AdminLoginError = {
  message?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectTo, setRedirectTo] = useState(ADMIN_LOGIN_REDIRECT_PATH);

  useEffect(() => {
    clearAdminAuthSession(window.localStorage);
    const redirectParam = new URLSearchParams(window.location.search).get('redirectTo');
    setRedirectTo(redirectParam || ADMIN_LOGIN_REDIRECT_PATH);

    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/session', {
          credentials: 'same-origin',
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as AdminSessionStatus;
        if (payload.authenticated) {
          router.replace(redirectParam || ADMIN_LOGIN_REDIRECT_PATH);
        }
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
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as AdminLoginError | null;
        setErrorMessage(payload?.message || 'Invalid username or password.');
        setSnackbarOpen(true);
        return;
      }

      router.push(redirectTo);
    } catch {
      setErrorMessage('Unable to reach the login service.');
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <LoginForm
        username={username}
        password={password}
        submitDisabled={isSubmitting}
        onUsernameChange={event => setUsername(event.target.value)}
        onPasswordChange={event => setPassword(event.target.value)}
        onSubmit={handleLogin}
      />

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" variant="filled" sx={{ width: '100%' }}>
          {errorMessage || 'Invalid username or password.'}
        </Alert>
      </Snackbar>
    </>
  );
}
