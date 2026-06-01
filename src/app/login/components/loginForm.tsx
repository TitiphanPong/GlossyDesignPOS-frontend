'use client';

import React from 'react';
import styles from './loginForm.module.css';
import styled from 'styled-components';

const StyledWrapper = styled.div``;

interface LoginFormProps {
  username: string;
  password: string;
  submitDisabled?: boolean;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ username, password, submitDisabled = false, onUsernameChange, onPasswordChange, onSubmit }) => {
  return (
    <StyledWrapper>
      <div className={styles.wrapper}>
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles['flex-column']}>
            <label htmlFor="login-username">Username</label>
          </div>
          <div className={styles.inputForm}>
            <input id="login-username" type="text" className={styles.input} placeholder="Enter your Username" value={username} onChange={onUsernameChange} disabled={submitDisabled} />
          </div>

          <div className={styles['flex-column']}>
            <label htmlFor="login-password">Password</label>
          </div>
          <div className={styles.inputForm}>
            <input id="login-password" type="password" className={styles.input} placeholder="Enter your Password" value={password} onChange={onPasswordChange} disabled={submitDisabled} />
          </div>

          <button className={styles['button-submit']} type="submit" disabled={submitDisabled}>
            {submitDisabled ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </StyledWrapper>
  );
};

export default LoginForm;
