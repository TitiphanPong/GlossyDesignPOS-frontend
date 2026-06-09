import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import type { ReactElement } from 'react';

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png']);
const SHEET_EXTENSIONS = new Set(['xls', 'xlsx', 'csv']);
const DESIGN_EXTENSIONS = new Set(['ai', 'psd']);
const ZIP_EXTENSIONS = new Set(['zip']);
const DOCUMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx']);

export const ACCEPTED_EXTENSIONS = [
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'ai',
  'psd',
  'zip',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'csv',
];

export const MAX_FILE_SIZE_BYTES = 7_500_000;
export const QUICK_UPLOADER_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'ai', 'psd', 'zip'] as const;
export const QUICK_UPLOADER_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/postscript',
  'image/vnd.adobe.photoshop',
  'application/zip',
  'application/x-zip-compressed',
]);

export function getFileExtension(fileName: string): string {
  const ext = fileName.split('.').pop();
  return (ext ?? '').toLowerCase();
}

export function buildAcceptAttribute(extensions: readonly string[]): string {
  return extensions.map(extension => `.${extension}`).join(',');
}

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const size = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / 1024 ** size;
  let precision = 2;
  if (value >= 100) precision = 0;
  else if (value >= 10) precision = 1;
  return `${value.toFixed(precision)} ${units[size]}`;
}

export function getFileTypeLabel(fileName: string): string {
  const ext = getFileExtension(fileName);
  if (!ext) return 'Unknown';
  return ext.toUpperCase();
}

export function getFileIcon(fileName: string): ReactElement {
  const ext = getFileExtension(fileName);

  if (IMAGE_EXTENSIONS.has(ext)) return <ImageRoundedIcon color="primary" />;
  if (SHEET_EXTENSIONS.has(ext)) return <TableChartRoundedIcon color="success" />;
  if (DESIGN_EXTENSIONS.has(ext)) return <PaletteRoundedIcon sx={{ color: '#7E57C2' }} />;
  if (ZIP_EXTENSIONS.has(ext)) return <ArchiveRoundedIcon sx={{ color: '#FB8C00' }} />;
  if (DOCUMENT_EXTENSIONS.has(ext)) return <DescriptionRoundedIcon color="action" />;

  return <InsertDriveFileRoundedIcon color="disabled" />;
}

export function isValidUploadFile(file: File): boolean {
  const ext = getFileExtension(file.name);
  return ACCEPTED_EXTENSIONS.includes(ext);
}

export function validateUploadFile(
  file: File,
  {
    acceptedExtensions = ACCEPTED_EXTENSIONS,
    maxFileSizeBytes = MAX_FILE_SIZE_BYTES,
    acceptedMimeTypes,
  }: Readonly<{
    acceptedExtensions?: readonly string[];
    maxFileSizeBytes?: number;
    acceptedMimeTypes?: ReadonlySet<string>;
  }> = {}
): { valid: true } | { valid: false; reason: 'extension' | 'mime' | 'size' } {
  const ext = getFileExtension(file.name);
  if (!acceptedExtensions.includes(ext)) {
    return { valid: false, reason: 'extension' };
  }

  if (acceptedMimeTypes && file.type && !acceptedMimeTypes.has(file.type)) {
    return { valid: false, reason: 'mime' };
  }

  if (file.size > maxFileSizeBytes) {
    return { valid: false, reason: 'size' };
  }

  return { valid: true };
}
