'use client';

import * as React from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';

export default function BillNote({ value, onChange }: Readonly<{ value: string; onChange: (value: string) => void }>) {
  const [open, setOpen] = React.useState(false);
  const editorId = React.useId();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const hasNote = Boolean(value.trim());
  const closeEditor = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <Box sx={{ mt: 1.5, p: 1.25, border: '1px dashed #CBD5E1', borderRadius: 2.5, bgcolor: '#FFFFFF', minWidth: 0 }}>
      <Button
        ref={triggerRef}
        size="small"
        startIcon={hasNote ? <EditNoteRoundedIcon /> : <AddRoundedIcon />}
        aria-expanded={open}
        aria-controls={open ? editorId : undefined}
        onClick={() => open ? closeEditor() : setOpen(true)}
        sx={{ minHeight: 36, px: 0.75, borderRadius: 2, fontWeight: 700, color: hasNote ? '#334155' : '#1463E9' }}>
        {hasNote ? 'หมายเหตุของบิล' : 'เพิ่มหมายเหตุของบิล'}
      </Button>
      {!open && hasNote ? (
        <Typography fontSize={13} color="#52657C" sx={{ mt: 0.5, px: 0.75, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {value.trim()}
        </Typography>
      ) : null}
      {open ? (
        <Stack
          id={editorId}
          gap={1}
          sx={{ mt: 1 }}
          onKeyDown={event => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              closeEditor();
            }
          }}>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={2}
            maxRows={5}
            label="หมายเหตุของบิล"
            placeholder="เช่น แยกใส่ถุง 2 ชุด"
            value={value}
            onChange={event => onChange(event.target.value)}
            helperText="บันทึกพร้อมการขาย และแสดงบนเอกสารพิมพ์ให้ลูกค้าเห็น"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 14 }, '& .MuiFormHelperText-root': { mx: 0, fontSize: 11 } }}
          />
          <Stack direction="row" justifyContent="space-between" gap={1}>
            <Button
              size="small"
              color="inherit"
              disabled={!value}
              onClick={() => {
                onChange('');
                closeEditor();
              }}
              sx={{ minHeight: 36, borderRadius: 2, color: '#64748B' }}>
              ลบหมายเหตุ
            </Button>
            <Button size="small" variant="outlined" startIcon={<CheckRoundedIcon />} onClick={closeEditor} sx={{ minHeight: 36, borderRadius: 2 }}>
              เสร็จ
            </Button>
          </Stack>
        </Stack>
      ) : null}
    </Box>
  );
}
