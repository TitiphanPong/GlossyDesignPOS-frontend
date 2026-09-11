export function buildCustomerFieldSx(multiline = false) {
  return {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      alignItems: multiline ? 'flex-start' : 'center',
      backgroundColor: 'var(--glossy-surface-card)',
      transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
      '& fieldset': {
        borderColor: 'var(--glossy-border-default)',
      },
      '&:hover fieldset': {
        borderColor: 'var(--glossy-border-strong)',
      },
      '&.Mui-focused': {
        boxShadow: '0 0 0 4px var(--glossy-action-primary-soft)',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'var(--glossy-text-secondary)',
      fontWeight: 600,
    },
    '& .MuiFormHelperText-root': {
      marginLeft: 0.25,
      marginTop: 0.85,
    },
  };
}

export const customerDialogPaperSx = {
  borderRadius: { xs: 4, sm: 5 },
  overflow: 'hidden',
  border: '1px solid var(--glossy-border-default)',
  boxShadow: 12,
  background: 'linear-gradient(180deg, var(--glossy-surface-card) 0%, var(--glossy-surface-raised) 100%)',
  width: { xs: 'calc(100% - 24px)', sm: 'auto' },
  maxHeight: { xs: 'calc(100dvh - 24px)', sm: 'calc(100dvh - 48px)' },
  m: { xs: 1.5, sm: 4 },
} as const;
