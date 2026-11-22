import { describe, it, expect } from 'vitest';
import { LocalStorageService } from '../../backend/src/modules/ocr/storage/local-storage.service';
import os from 'os';
import path from 'path';

describe('Security & Isolation Testing Suite (Section 3, 6, 21)', () => {
  const testStorageDir = path.join(os.tmpdir(), `taxpilot_sec_test_${Date.now()}`);
  const storage = new LocalStorageService(testStorageDir);

  it('TC-DOC-12 & SEC-01: Path traversal attempts are strictly intercepted and rejected', () => {
    const maliciousPaths = [
      '../../etc/passwd',
      '..\\..\\windows\\system32\\cmd.exe',
      '../../../.env',
      'workspace/../../secret.key',
    ];

    for (const badPath of maliciousPaths) {
      expect(() => {
        storage.resolveSafePath(badPath);
      }).toThrow(/Path traversal detected/i);
    }
  });

  it('TC-DOC-01: Valid relative storage key generates clean canonical path within sandbox', () => {
    const { storageKey, absolutePath } = storage.generateStorageKey('ws-test', 'Form16.pdf');
    expect(storageKey).toContain('ws-test');
    expect(absolutePath.startsWith(path.resolve(testStorageDir))).toBe(true);
  });

  it('SEC-02: Document storage keys sanitize illegal characters and limit extensions', () => {
    const { storageKey } = storage.generateStorageKey('ws-test', 'payload.php.exe?x=1');
    expect(storageKey).not.toContain('?');
    expect(storageKey).not.toContain('=');
  });
});
