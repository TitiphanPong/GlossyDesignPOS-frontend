import type { SxProps, Theme } from '@mui/material/styles';

export const adminSurface = {
  pageMaxWidth: '1600px',
  sectionGap: 2.5,
  cardRadius: 3,
  cardPadding: { xs: 1.75, md: 2.25 },
  cardBorder: '1px solid',
  cardBorderColor: 'divider',
  cardShadow: '0 8px 26px rgba(15, 23, 42, 0.06)',
  cardShadowHover: '0 16px 34px rgba(15, 23, 42, 0.12)',
  transition: 'all 0.22s ease',
  rowHeight: 54,
  headerHeight: 50,
  buttonHeight: 40,
  buttonRadius: 2,
};

export const uiCardSx: SxProps<Theme> = {
  borderRadius: adminSurface.cardRadius,
  border: adminSurface.cardBorder,
  borderColor: adminSurface.cardBorderColor,
  boxShadow: adminSurface.cardShadow,
  bgcolor: 'background.paper',
  transition: adminSurface.transition,
};

export const interactiveCardSx: SxProps<Theme> = {
  ...uiCardSx,
  '&:hover': {
    boxShadow: adminSurface.cardShadowHover,
    transform: 'translateY(-2px)',
  },
};

export const topActionBarSx: SxProps<Theme> = {
  ...uiCardSx,
  p: adminSurface.cardPadding,
};

export const sectionTitleSx: SxProps<Theme> = {
  fontSize: { xs: '1rem', md: '1.1rem' },
  fontWeight: 700,
  lineHeight: 1.3,
};

export const dataGridSx: SxProps<Theme> = {
  border: 'none',
  '& .MuiDataGrid-columnHeaders': {
    bgcolor: 'grey.50',
    minHeight: `${adminSurface.headerHeight}px !important`,
    maxHeight: `${adminSurface.headerHeight}px !important`,
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 700,
    fontSize: 13,
  },
  '& .MuiDataGrid-cell': {
    py: 1,
    alignItems: 'center',
    borderColor: 'divider',
  },
  '& .MuiDataGrid-row': {
    minHeight: `${adminSurface.rowHeight}px !important`,
    maxHeight: `${adminSurface.rowHeight}px !important`,
    transition: adminSurface.transition,
  },
  '& .MuiDataGrid-row:hover': {
    bgcolor: 'rgba(108, 77, 255, 0.06)',
  },
  '& .MuiDataGrid-footerContainer': {
    minHeight: `${adminSurface.headerHeight}px`,
    borderTop: '1px solid',
    borderColor: 'divider',
  },
};

export const tableShellSx: SxProps<Theme> = {
  '& .MuiTableCell-head': {
    bgcolor: 'grey.50',
    fontWeight: 700,
    fontSize: 13,
    py: 1.25,
    borderBottomColor: 'divider',
  },
  '& .MuiTableCell-body': {
    py: 1.25,
    borderBottomColor: 'divider',
  },
  '& .MuiTableRow-root': {
    transition: adminSurface.transition,
    height: `${adminSurface.rowHeight}px`,
  },
  '& .MuiTableRow-hover:hover': {
    bgcolor: 'rgba(108, 77, 255, 0.06)',
  },
};

export const commonButtonSx: SxProps<Theme> = {
  minHeight: adminSurface.buttonHeight,
  borderRadius: adminSurface.buttonRadius,
  px: 1.8,
  fontWeight: 700,
  whiteSpace: 'nowrap',
};

export const statusChipSx: SxProps<Theme> = {
  borderRadius: 1.5,
  fontWeight: 600,
  '& .MuiChip-label': { px: 1.1 },
};

