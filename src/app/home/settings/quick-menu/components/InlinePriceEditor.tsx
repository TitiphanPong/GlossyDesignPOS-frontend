'use client';

import * as React from 'react';
import { Box, CircularProgress, IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

type Props = {
  value: number;
  disabled?: boolean;
  onSave: (value: number) => Promise<void>;
};

export default function InlinePriceEditor({ value, disabled, onSave }: Readonly<Props>) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value.toFixed(2));
  const [saving, setSaving] = React.useState(false);
  const parsed = Number(draft);
  const invalid = draft.trim() === '' || !Number.isFinite(parsed) || parsed < 0;

  React.useEffect(() => setDraft(value.toFixed(2)), [value]);
  const cancel = () => { setDraft(value.toFixed(2)); setEditing(false); };
  const save = async () => {
    if (invalid || saving || parsed === value) { if (!invalid) setEditing(false); return; }
    setSaving(true);
    try { await onSave(parsed); setEditing(false); } finally { setSaving(false); }
  };

  if (!editing) return (
    <Tooltip title="คลิกเพื่อแก้ราคา">
      <Box component="button" type="button" disabled={disabled} onClick={() => setEditing(true)}
        sx={{ border: '1px solid transparent', bgcolor: 'transparent', borderRadius: 1.5, px: 1, py: .65, font: 'inherit', fontWeight: 800, cursor: 'pointer', color: 'text.primary', '&:hover, &:focus-visible': { borderColor: 'primary.main', bgcolor: 'primary.50', outline: 'none' } }}>
        ฿{value.toFixed(2)}
      </Box>
    </Tooltip>
  );

  return <Box sx={{ display: 'flex', alignItems: 'center', gap: .25, minWidth: 168 }}>
    <TextField autoFocus size="small" type="number" value={draft} error={invalid} disabled={saving}
      inputProps={{ min: 0, step: .01, 'aria-label': 'ราคา (บาท)' }}
      InputProps={{ startAdornment: <InputAdornment position="start">฿</InputAdornment> }}
      onFocus={event => event.target.select()} onChange={event => setDraft(event.target.value)}
      onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); void save(); } if (event.key === 'Escape') cancel(); }}
      sx={{ width: 112, '& input': { py: .75, px: .25 } }} />
    <IconButton size="small" color="success" disabled={invalid || saving} onClick={() => void save()} aria-label="บันทึกราคา">{saving ? <CircularProgress size={18} /> : <CheckRoundedIcon fontSize="small" />}</IconButton>
    <IconButton size="small" disabled={saving} onClick={cancel} aria-label="ยกเลิก"><CloseRoundedIcon fontSize="small" /></IconButton>
  </Box>;
}
