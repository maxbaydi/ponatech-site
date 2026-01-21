export const REQUEST_ATTACHMENT_MAX_SIZE = 10 * 1024 * 1024;
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

export const REQUEST_ATTACHMENT_ALLOWED_EXTENSIONS = [
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
];

const UNKNOWN_MIME_TYPES = new Set(['', 'application/octet-stream']);
const REQUEST_ATTACHMENT_EXTENSION_SET = new Set(REQUEST_ATTACHMENT_ALLOWED_EXTENSIONS);
const REQUEST_ATTACHMENT_MIME_SET = new Set(REQUEST_ATTACHMENT_ALLOWED_MIME_TYPES);

export type RequestAttachmentIssue = 'empty' | 'too_large' | 'unsupported';

export const REQUEST_ATTACHMENT_ACCEPT = [
  ...REQUEST_ATTACHMENT_ALLOWED_MIME_TYPES,
  ...REQUEST_ATTACHMENT_ALLOWED_EXTENSIONS.map((ext) => `.${ext}`),
].join(',');

export const getRequestAttachmentExtension = (filename: string): string => {
  const parts = filename.split('.');
  if (parts.length <= 1) return '';
  return parts[parts.length - 1].toLowerCase();
};

export const isRequestAttachmentImage = (mimeType?: string | null): boolean =>
  Boolean(mimeType && mimeType.startsWith('image/'));

const isAllowedRequestAttachment = (file: File): boolean => {
  const mime = file.type?.toLowerCase() ?? '';
  const extension = getRequestAttachmentExtension(file.name);

  if (REQUEST_ATTACHMENT_MIME_SET.has(mime)) {
    return true;
  }

  if (UNKNOWN_MIME_TYPES.has(mime) && REQUEST_ATTACHMENT_EXTENSION_SET.has(extension)) {
    return true;
  }

  return false;
};

export const getRequestAttachmentIssue = (file: File): RequestAttachmentIssue | null => {
  if (file.size <= 0) {
    return 'empty';
  }
  if (file.size > REQUEST_ATTACHMENT_MAX_SIZE) {
    return 'too_large';
  }
  if (!isAllowedRequestAttachment(file)) {
    return 'unsupported';
  }
  return null;
};

export const getRequestAttachmentKey = (file: File): string =>
  `${file.name}-${file.size}-${file.lastModified}`;
