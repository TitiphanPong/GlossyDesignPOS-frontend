'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Alert, CircularProgress, IconButton } from '@mui/material';
import { LockOutlined, PersonOutline, VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material';
import styles from './loginForm.module.css';

interface LoginFormProps {
  username: string;
  password: string;
  errorMessage?: string | null;
  submitDisabled?: boolean;
  onUsernameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent) => void;
}

export default function LoginForm({
  username,
  password,
  errorMessage,
  submitDisabled = false,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className={styles.form} onSubmit={onSubmit} aria-busy={submitDisabled}>
      <div className={styles.heading}>
        <span className={styles.eyebrow}>สำหรับพนักงาน</span>
        <h1>ยินดีต้อนรับกลับมา</h1>
        <p>เข้าสู่ระบบ Glossy Design เพื่อเริ่มจัดการงานหน้าร้าน</p>
      </div>

      <div className={styles.alertSlot} aria-live="polite">
        {errorMessage ? (
          <Alert severity="error" variant="outlined" className={styles.alert}>
            <strong>ไม่สามารถเข้าสู่ระบบได้</strong>
            <span>{errorMessage}</span>
          </Alert>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="login-username">ชื่อผู้ใช้</label>
        <div className={styles.inputShell}>
          <PersonOutline aria-hidden="true" className={styles.fieldIcon} />
          <input
            id="login-username"
            type="text"
            placeholder="กรอกชื่อผู้ใช้ของคุณ"
            value={username}
            onChange={onUsernameChange}
            disabled={submitDisabled}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            autoFocus
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="login-password">รหัสผ่าน</label>
        <div className={styles.inputShell}>
          <LockOutlined aria-hidden="true" className={styles.fieldIcon} />
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="กรอกรหัสผ่านของคุณ"
            value={password}
            onChange={onPasswordChange}
            disabled={submitDisabled}
            autoComplete="current-password"
            required
          />
          <IconButton
            type="button"
            className={styles.visibilityButton}
            onClick={() => setShowPassword(current => !current)}
            disabled={submitDisabled}
            aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
            aria-pressed={showPassword}
            edge="end"
          >
            {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
          </IconButton>
        </div>
      </div>

      <button className={styles.submitButton} type="submit" disabled={submitDisabled}>
        {submitDisabled ? (
          <>
            <CircularProgress size={18} thickness={5} color="inherit" />
            กำลังเข้าสู่ระบบ...
          </>
        ) : (
          'เข้าสู่ระบบ'
        )}
      </button>

      <p className={styles.supportText}>ระบบสำหรับการใช้งานภายในร้าน Glossy Design</p>
    </form>
  );
}
