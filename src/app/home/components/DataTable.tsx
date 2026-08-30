'use client';

import * as React from 'react';
import { Box, Chip, Skeleton, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography, type SxProps, type Theme } from '@mui/material';
import { EmptyState } from './dashboardUi';

// Shared visual language for admin tables, based on the orders page table design.
export const dataTableHeaderRowSx = {
  '& th': {
    background: '#FAFAFA',
    color: '#9CA3AF',
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: '0.3px',
    borderBottom: '1px solid #F3F4F6',
    py: 1.5,
    px: 2,
    whiteSpace: 'nowrap',
  },
} satisfies SxProps<Theme>;

export const dataTableBodyRowSx = {
  '& td': {
    py: 1.6,
    px: 2,
    borderBottom: '1px solid #F9FAFB',
    fontSize: 13,
    verticalAlign: 'top',
  },
  '&:hover': { bgcolor: '#FBFCFF' },
} satisfies SxProps<Theme>;

export type DataTableColumn<T> = {
  key: string;
  header: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  headerAlign?: 'left' | 'right' | 'center';
  width?: number | string;
  padding?: 'normal' | 'checkbox' | 'none';
  render?: (row: T, index: number) => React.ReactNode;
};

export type DataTablePaginationProps = {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
  labelDisplayedRows?: (info: { from: number; to: number; count: number }) => string;
};

export type DataTableEmptyStateProps = {
  icon?: React.ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export type DataTableSectionHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  countLabel?: React.ReactNode;
};

export function DataTableSectionHeader({ title, subtitle, countLabel }: Readonly<DataTableSectionHeaderProps>) {
  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 2.6 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, borderBottom: '1px solid #F3F4F6', bgcolor: '#FFFFFF' }}>
      <Box>
        <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#1A1035', letterSpacing: '-0.2px' }}>{title}</Typography>
        {subtitle ? <Typography sx={{ mt: 0.35, fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{subtitle}</Typography> : null}
      </Box>
      {countLabel ? <Chip label={countLabel} sx={{ borderRadius: '999px', bgcolor: '#F5F0FF', color: '#6C4DFF', fontWeight: 700 }} /> : null}
    </Box>
  );
}

export type DataTableRowRenderArgs<T> = {
  row: T;
  index: number;
  cells: React.ReactNode;
  defaultRow: React.ReactNode;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => React.Key;
  onRowClick?: (row: T) => void;
  stickyHeader?: boolean;
  size?: 'small' | 'medium';
  minWidth?: number | string;
  maxHeight?: number | string;
  emptyState?: DataTableEmptyStateProps;
  pagination?: DataTablePaginationProps;
  loading?: boolean;
  skeletonRowCount?: number;
  renderRow?: (args: DataTableRowRenderArgs<T>) => React.ReactNode;
  wrapRows?: (rows: React.ReactNode) => React.ReactNode;
  sectionHeader?: DataTableSectionHeaderProps;
};

const defaultLabelDisplayedRows = ({ from, to, count }: { from: number; to: number; count: number }) =>
  `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`;

export default function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  stickyHeader = true,
  size = 'small',
  minWidth,
  maxHeight,
  emptyState,
  pagination,
  loading = false,
  skeletonRowCount = 5,
  renderRow,
  wrapRows,
  sectionHeader,
}: Readonly<DataTableProps<T>>) {
  const renderedRows = !loading
    ? rows.map((row, index) => {
        const key = getRowKey(row, index);
        const cells = columns.map(column => (
          <TableCell key={column.key} align={column.align} padding={column.padding}>
            {column.render?.(row, index) ?? null}
          </TableCell>
        ));
        const defaultRow = (
          <TableRow
            key={key}
            hover
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            sx={{ ...dataTableBodyRowSx, cursor: onRowClick ? 'pointer' : 'default' }}>
            {cells}
          </TableRow>
        );

        return renderRow ? (
          <React.Fragment key={key}>{renderRow({ row, index, cells, defaultRow })}</React.Fragment>
        ) : defaultRow;
      })
    : null;

  return (
    <>
      {sectionHeader ? <DataTableSectionHeader {...sectionHeader} /> : null}
      <Box sx={{ width: '100%', maxHeight, overflow: 'auto' }}>
        <Table stickyHeader={stickyHeader} size={size} sx={{ minWidth }}>
          <TableHead>
            <TableRow sx={dataTableHeaderRowSx}>
              {columns.map(column => (
                <TableCell key={column.key} align={column.headerAlign ?? column.align} padding={column.padding} sx={{ width: column.width }}>
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: skeletonRowCount }, (_, index) => (
                  <TableRow key={`skeleton-${index}`} sx={dataTableBodyRowSx}>
                    {columns.map(column => (
                      <TableCell key={column.key} align={column.align} padding={column.padding}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}

            {!loading && rows.length === 0 && emptyState ? (
              <TableRow sx={dataTableBodyRowSx}>
                <TableCell colSpan={columns.length}>
                  <EmptyState compact icon={emptyState.icon} eyebrow={emptyState.eyebrow} title={emptyState.title} subtitle={emptyState.subtitle} />
                </TableCell>
              </TableRow>
            ) : null}

            {renderedRows ? (wrapRows ? wrapRows(renderedRows) : renderedRows) : null}
          </TableBody>
        </Table>
      </Box>

      {pagination ? (
        <TablePagination
          component="div"
          count={pagination.count}
          page={pagination.page}
          onPageChange={(_, nextPage) => pagination.onPageChange(nextPage)}
          rowsPerPage={pagination.rowsPerPage}
          onRowsPerPageChange={event => pagination.onRowsPerPageChange?.(Number.parseInt(event.target.value, 10))}
          rowsPerPageOptions={pagination.rowsPerPageOptions ?? [10, 25, 50, 100]}
          labelRowsPerPage="จำนวนรายการต่อหน้า"
          labelDisplayedRows={pagination.labelDisplayedRows ?? defaultLabelDisplayedRows}
        />
      ) : null}
    </>
  );
}
