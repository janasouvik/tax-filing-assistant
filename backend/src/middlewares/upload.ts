import multer from 'multer';
import { AppError } from '../utils/response';

const ALLOWED_MIMETYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/vnd.ms-excel',
];

const MAX_SIZE = 25 * 1024 * 1024; // 25MB

const storage = multer.memoryStorage();

export function detectMimeTypeFromBuffer(buffer: Buffer): string | null {
  if (!buffer || buffer.length === 0) return null;

  // PDF: %PDF- (0x25 0x50 0x44 0x46 0x2D)
  if (buffer.length >= 5 && buffer.subarray(0, 5).equals(Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D]))) {
    return 'application/pdf';
  }

  // PNG: \x89PNG\r\n\x1a\n (0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A)
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))
  ) {
    return 'image/png';
  }

  // JPEG: \xFF\xD8\xFF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // ZIP / XLSX: PK\x03\x04 (0x50 0x4B 0x03 0x04)
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04
  ) {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }

  // OLE CF / legacy XLS: \xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))
  ) {
    return 'application/vnd.ms-excel';
  }

  // Reject executable headers explicitly: MZ (PE/DOS) or ELF
  if (buffer.length >= 2 && buffer[0] === 0x4d && buffer[1] === 0x5a) {
    return null;
  }
  if (buffer.length >= 4 && buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
    return null;
  }

  // Check for CSV / plain text: ensure no null bytes and no HTML/script tags
  const sampleLength = Math.min(buffer.length, 2048);
  const sample = buffer.subarray(0, sampleLength);
  for (let i = 0; i < sampleLength; i++) {
    if (sample[i] === 0x00) {
      return null; // binary file
    }
  }

  const sampleText = sample.toString('utf-8').trim().toLowerCase();
  if (
    sampleText.startsWith('<!doctype html') ||
    sampleText.startsWith('<html') ||
    sampleText.includes('<script') ||
    sampleText.includes('<?php')
  ) {
    return null; // Disguised HTML or script
  }

  // Check for CSV formula injection (DDE execution, shell invocation)
  const lines = sampleText.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[=+\-@\t\r]\s*(cmd|dde|powershell|bash|sh|curl|wget|certutil|rundll32|regsvr32)/i.test(trimmed)) {
      return null; // Malicious executable DDE/formula injection
    }
  }

  return 'text/csv';
}

export const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`File type ${file.mimetype} is not allowed`, 400, 'INVALID_FILE_TYPE'));
    }
  },
});

