// app/fonts.ts
import { Prompt, Kanit } from 'next/font/google';

export const prompt = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['300','400','500','600','700'],
  display: 'swap',
  variable: '--font-sans',
});

export const kanit = Kanit({
  subsets: ['thai','latin'],
  weight: ['600','700'],
  display: 'swap',
  variable: '--font-head',
});
