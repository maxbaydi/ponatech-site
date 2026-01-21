import { extname } from 'node:path';

export const REQUEST_ATTACHMENT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const REQUEST_ATTACHMENT_MAX_FILES = 10;

export const REQUEST_ATTACHMENT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.ms-excel.sheet.macroEnabled.12',
  'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/csv',
  'application/csv',
  'text/plain',
  'application/rtf',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
];

export const REQUEST_ATTACHMENT_ALLOWED_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'xlsm',
  'xlsb',
  'csv',
  'txt',
  'rtf',
  'odt',
  'ods',
  'odp',
  'ppt',
  'pptx',
]);

const UNKNOWN_MIME_TYPES = new Set(['', 'application/octet-stream']);

export const getAttachmentExtension = (filename: string): string => {
  const extension = extname(filename).toLowerCase();
  return extension.startsWith('.') ? extension.slice(1) : extension;
};

export const isKnownMimeType = (mimeType: string | undefined): boolean => {
  const normalized = mimeType?.toLowerCase() ?? '';
  return !UNKNOWN_MIME_TYPES.has(normalized);
};

export const isAllowedAttachmentMimeType = (mimeType: string | undefined): boolean => {
  const normalized = mimeType?.toLowerCase() ?? '';
  return REQUEST_ATTACHMENT_ALLOWED_MIME_TYPES.includes(normalized);
};

export const isAllowedAttachmentExtension = (filename: string): boolean => {
  const extension = getAttachmentExtension(filename);
  return extension.length > 0 && REQUEST_ATTACHMENT_ALLOWED_EXTENSIONS.has(extension);
};

export const isAllowedAttachmentType = (filename: string, mimeType: string | undefined): boolean => {
  if (isAllowedAttachmentMimeType(mimeType)) {
    return true;
  }
  if (!isKnownMimeType(mimeType) && isAllowedAttachmentExtension(filename)) {
    return true;
  }
  return false;
};
