export const JOB_TYPES = [
  'Document Printing',
  'Photocopy',
  'Sticker',
  'Business Card',
  'Poster',
  'Vinyl Banner',
  'Packaging',
  'Other',
] as const;

export type JobType = (typeof JOB_TYPES)[number];

export interface UploadFormValues {
  customerName: string;
  phone: string;
  note: string;
  jobType: JobType;
}

export interface UploadApiResponse {
  uploadId: string;
  orderCode: string;
  message: string;
}

export interface UploadValidationError {
  id: string;
  message: string;
}
