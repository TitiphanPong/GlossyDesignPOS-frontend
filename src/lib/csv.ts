const UTF8_BOM = '\uFEFF';
const CSV_LINE_ENDING = '\r\n';

function escapeCsvCell(value: unknown): string {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

/** Creates UTF-8 CSV that Microsoft Excel recognizes without relying on the Windows ANSI code page. */
export function createExcelCompatibleCsv(rows: ReadonlyArray<ReadonlyArray<unknown>>): string {
  const content = rows.map(row => row.map(escapeCsvCell).join(',')).join(CSV_LINE_ENDING);
  return `${UTF8_BOM}${content}`;
}

export function createCsvBlob(csv: string): Blob {
  return new Blob([csv], { type: 'text/csv; charset=utf-8' });
}

export function downloadCsvFile(csv: string, filename: string): void {
  const blob = createCsvBlob(csv);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
