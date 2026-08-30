'use client';

import * as React from 'react';
import { Box, Skeleton, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, type SxProps, type Theme } from '@mui/material';
import { EmptyState } from './dashboardUi';

// Shared visual language for admin tables, based on the orders page table design.
export const dataTableHeaderRowSx: SxProps<Theme> = {
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
};

export const dataTableBodyRowSx: SxProps<Theme> = {
  '& td': {
    py: 1.6,
    px: 2,
    borderBottom: '1px solid #F9FAFB',
    fontSize: 13,
    verticalAlign: 'top',
  },
  '&:hover': { bgcolor: '#FBFCFF' },
};

export type DataTableColumn<T> = {
  key: string;
  header: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  headerAlign?: 'left' | 'right' | 'center';
  width?: number | string;
  render: (row: T, index: number) => React.ReactNode;
};

export type DataTablePaginationProps = {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
  labelDisplayedRows?: (info: { from: number; to: number; count: number }) => string;
};

export type DataTableEmptyStateProps = {
  icon?: React.ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => React.Key;
  onRowClick?: (row: T) => void;
  stickyHeader?: boolean;
  size?: 'small' | 'medium';
  minWidth?: number | string;
  emptyState?: DataTableEmptyStateProps;
  pagination?: DataTablePaginationProps;
  loading?: boolean;
  skeletonRowCount?: number;
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
  emptyState,
  pagination,
  loading = false,
  skeletonRowCount = 5,
}: Readonly<DataTableProps<T>>) {
  return (
    <>
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Table stickyHeader={stickyHeader} size={size} sx={{ minWidth }}>
          <TableHead>
            <TableRow sx={dataTableHeaderRowSx}>
              {columns.map(column => (
                <TableCell key={column.key} align={column.headerAlign ?? column.align} sx={{ width: column.width }}>
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: skeletonRowCount }, (_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {columns.map(column => (
                      <TableCell key={column.key} align={column.align}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}

            {!loading && rows.length === 0 && emptyState ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <EmptyState compact icon={emptyState.icon} eyebrow={emptyState.eyebrow} title={emptyState.title} subtitle={emptyState.subtitle} />
                </TableCell>
              </TableRow>
            ) : null}

            {!loading &&
              rows.map((row, index) => (
                <TableRow
                  key={getRowKey(row, index)}
                  hover
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{ ...dataTableBodyRowSx, cursor: onRowClick ? 'pointer' : 'default' }}>
                  {columns.map(column => (
                    <TableCell key={column.key} align={column.align}>
                      {column.render(row, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
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
          onRowsPerPageChange={event => pagination.onRowsPerPageChange(Number.parseInt(event.target.value, 10))}
          rowsPerPageOptions={pagination.rowsPerPageOptions ?? [10, 25, 50, 100]}
          labelRowsPerPage="จำนวนรายการต่อหน้า"
          labelDisplayedRows={pagination.labelDisplayedRows ?? defaultLabelDisplayedRows}
        />
      ) : null}
    </>
  );
}
