import * as React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

export function SearchBar({ q, setQ }: Readonly<{ q: string; setQ: (value: string) => void }>) {
  return (
    <TextField
      size="small"
      placeholder="ค้นหาสินค้า..."
      value={q}
      onChange={e => setQ(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon sx={{ color: '#6B7A90' }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        width: '100%',
        '& .MuiOutlinedInput-root': {
          height: 46,
          borderRadius: 3,
          boxShadow: '0 8px 18px rgba(38, 63, 102, 0.08)',
          bgcolor: '#FFFFFF',
        },
      }}
    />
  );
}
