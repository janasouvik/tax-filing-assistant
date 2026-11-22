import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const TEST_DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:1245@localhost:5432/taxpilot_test_db';

const prisma = new PrismaClient({
  datasources: {
    db: { url: TEST_DATABASE_URL },
  },
});

describe('Database Integration & Integrity Suite (Section 19: PostgreSQL)', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('DB-INT-01: Verifies active connection to isolated taxpilot_test_db', async () => {
    const result = await prisma.$queryRaw<any[]>`SELECT current_database();`;
    expect(result[0].current_database).toBe('taxpilot_test_db');
  });

  it('DB-INT-02: Verifies statutory TaxRule table is seeded with assessment year slabs', async () => {
    const rules = await prisma.taxRule.findMany();
    expect(rules.length).toBeGreaterThan(0);
    const versions = rules.map(r => r.version);
    expect(versions).toContain('AY2024-25-v1');
    expect(versions).toContain('AY2025-26-v1');
    expect(versions).toContain('AY2026-27-v1');
  });

  it('DB-INT-03: Enforces foreign key constraints on orphaned income entries', async () => {
    await expect(
      prisma.incomeEntry.create({
        data: {
          taxReturnId: 'non-existent-return-id',
          incomeType: 'SALARY',
          source: 'Invalid Test',
          amount: 50000,
        },
      })
    ).rejects.toThrow();
  });
});
