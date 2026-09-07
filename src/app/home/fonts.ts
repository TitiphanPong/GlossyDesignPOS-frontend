import localFont from 'next/font/local';
import { Prompt } from 'next/font/google';

const promptSans = Prompt({
  subsets: ['thai', 'latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const documentThaiSans = localFont({
  src: '../../assets/fonts/NotoSansThai-Variable.ttf',
  display: 'swap',
  variable: '--font-document-thai',
  weight: '100 900',
  style: 'normal',
});

export const prompt = promptSans;
export const documentThai = documentThaiSans;
