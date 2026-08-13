'use client';

import * as React from 'react';
import { Box, CircularProgress, IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';

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
        sx={{ width: 142, minHeight: 42, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #D9E2EF', bgcolor: '#FFF', borderRadius: 1.5, px: 1.5, font: 'inherit', fontWeight: 650, cursor: 'pointer', color: '#15213B', transition: 'border-color 140ms ease, box-shadow 140ms ease', '&:hover, &:focus-visible': { borderColor: '#2463EB', boxShadow: '0 0 0 3px rgba(36,99,235,.09)', outline: 'none' } }}>
        <span>{value.toFixed(2)}</span><EditRoundedIcon sx={{ fontSize: 17, color: '#53647E' }} />
      </Box>
    </Tooltip>
  );

  return <Box sx={{ display: 'flex', alignItems: 'center', gap: .25, minWidth: 168 }}>
    <TextField autoFocus size="small" type="number" value={draft} error={invalid} disabled={saving}
      inputProps={{ min: 0, step: .01, 'aria-label': 'ราคา (บาท)' }}
      InputProps={{ startAdornment: <InputAdornment position="start">฿</InputAdornment> }}
      onFocus={event => event.target.select()} onChange={event => setDraft(event.target.value)}
      onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); void save(); } if (event.key === 'Escape') cancel(); }}
      sx={{ width: 118, '& input': { py: .9, px: .25 } }} />
    <IconButton size="small" color="success" disabled={invalid || saving} onClick={() => void save()} aria-label="บันทึกราคา">{saving ? <CircularProgress size={18} /> : <CheckRoundedIcon fontSize="small" />}</IconButton>
    <IconButton size="small" disabled={saving} onClick={cancel} aria-label="ยกเลิก"><CloseRoundedIcon fontSize="small" /></IconButton>
  </Box>;
}
