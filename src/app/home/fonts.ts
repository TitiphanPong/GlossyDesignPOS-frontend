import { Prompt } from 'next/font/google';

const promptSans = Prompt({
  subsets: ['thai', 'latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

const promptHead = Prompt({
  subsets: ['thai', 'latin'],
  display: 'swap',
  variable: '--font-head',
  weight: ['400', '500', '600', '700', '800'],
});

export const prompt = promptSans;
export const kanit = promptHead;
