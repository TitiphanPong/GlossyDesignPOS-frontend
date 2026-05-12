import * as React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

export function SearchBar({ q, setQ }: { q: string; setQ: (v: string) => void }) {
  return (
    <TextField
      size="small"
      placeholder="ค้นหา…"
      value={q}
      onChange={e => setQ(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchRoundedIcon />
          </InputAdornment>
        ),
      }}
      sx={{ minWidth: 750 }}
    />
  );
}
