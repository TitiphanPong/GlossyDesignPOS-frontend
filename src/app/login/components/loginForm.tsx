'use client';

import React from 'react';
import styles from './loginForm.module.css';
import styled from 'styled-components';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const StyledWrapper = styled.div``;

interface LoginFormProps {
  username: string;
  password: string;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ username, password, onUsernameChange, onPasswordChange, onSubmit }) => {
  return (
    <StyledWrapper>
      <div className={styles.wrapper}>
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles['flex-column']}>
            <label>Username</label>
          </div>
          <div className={styles.inputForm}>
            <input type="text" className={styles.input} placeholder="Enter your Username" value={username} onChange={onUsernameChange} />
          </div>

          <div className={styles['flex-column']}>
            <label>Password</label>
          </div>
          <div className={styles.inputForm}>
            <input type="password" className={styles.input} placeholder="Enter your Password" value={password} onChange={onPasswordChange} />
          </div>

          <div className={styles['flex-row']} style={{ marginLeft: '5px' }}>
            <div>
              <input type="checkbox" />
              <label> Remember me </label>
            </div>
          </div>

          <button className={styles['button-submit']} type="submit">
            Sign In
          </button>

          <p className={styles.p}>
            Don't have an account? <span className={styles.span}>Sign Up</span>
          </p>
          <p className={styles.p + ' ' + styles.line}></p>
        </form>
      </div>
    </StyledWrapper>
  );
};

export default LoginForm;
