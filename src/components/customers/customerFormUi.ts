export function buildCustomerFieldSx(multiline = false) {
  return {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      alignItems: multiline ? 'flex-start' : 'center',
      backgroundColor: '#FFFFFF',
      transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
      '& fieldset': {
        borderColor: '#D7E3F4',
      },
      '&:hover fieldset': {
        borderColor: '#AFC3E6',
      },
      '&.Mui-focused': {
        boxShadow: '0 0 0 4px rgba(43, 98, 238, 0.10)',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#5B6B82',
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
  border: '1px solid #E7EEF8',
  boxShadow: '0 28px 70px rgba(15, 23, 42, 0.18)',
  background: 'linear-gradient(180deg, #FFFFFF 0%, #FBFDFF 100%)',
  width: { xs: 'calc(100% - 24px)', sm: 'auto' },
  maxHeight: { xs: 'calc(100dvh - 24px)', sm: 'calc(100dvh - 48px)' },
  m: { xs: 1.5, sm: 4 },
} as const;
