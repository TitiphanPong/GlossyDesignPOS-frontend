'use client';

import type { ReactNode } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { thTH } from '@mui/x-date-pickers/locales';
import 'dayjs/locale/th';

export default function GlossyLocalizationProvider({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th" localeText={thTH.components.MuiLocalizationProvider.defaultProps.localeText}>
      {children}
    </LocalizationProvider>
  );
}
