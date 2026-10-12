import { PrismaClient, TaxRegime } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Tax Rules...');

  const versions = [
    {
      version: 'AY2024-25-v1',
      effectiveFrom: new Date('2024-04-01T00:00:00Z'),
      effectiveTo: new Date('2025-03-31T23:59:59Z'),
      slabsNew: [
        { upTo: 300000, rate: 0 },
        { upTo: 600000, rate: 0.05 },
        { upTo: 900000, rate: 0.1 },
        { upTo: 1200000, rate: 0.15 },
        { upTo: 1500000, rate: 0.2 },
        { upTo: 9999999999, rate: 0.3 },
      ],
      rebateNew: { maxIncome: 700000, maxRebate: 25000 },
      dedLimitsNew: { '16(ia)': 50000, STANDARD_DEDUCTION: 50000, '80CCD(2)': 750000, SEC_80CCD2: 750000 },
    },
    {
      version: 'AY2025-26-v1',
      effectiveFrom: new Date('2025-04-01T00:00:00Z'),
      effectiveTo: new Date('2026-03-31T23:59:59Z'),
      slabsNew: [
        { upTo: 300000, rate: 0 },
        { upTo: 700000, rate: 0.05 },
        { upTo: 1000000, rate: 0.1 },
        { upTo: 1200000, rate: 0.15 },
        { upTo: 1500000, rate: 0.2 },
        { upTo: 9999999999, rate: 0.3 },
      ],
      rebateNew: { maxIncome: 700000, maxRebate: 25000 },
      dedLimitsNew: { '16(ia)': 75000, STANDARD_DEDUCTION: 75000, '80CCD(2)': 750000, SEC_80CCD2: 750000 },
    },
    {
      version: 'AY2026-27-v1',
      effectiveFrom: new Date('2026-04-01T00:00:00Z'),
      effectiveTo: new Date('2027-03-31T23:59:59Z'),
      slabsNew: [
        { upTo: 400000, rate: 0 },
        { upTo: 800000, rate: 0.05 },
        { upTo: 1200000, rate: 0.1 },
        { upTo: 1600000, rate: 0.15 },
        { upTo: 2000000, rate: 0.2 },
        { upTo: 2400000, rate: 0.25 },
        { upTo: 9999999999, rate: 0.3 },
      ],
      rebateNew: { maxIncome: 1200000, maxRebate: 60000 },
      dedLimitsNew: { '16(ia)': 75000, STANDARD_DEDUCTION: 75000, '80CCD(2)': 750000, SEC_80CCD2: 750000 },
    },
    {
      version: 'TY2026-27-v1',
      effectiveFrom: new Date('2026-04-01T00:00:00Z'),
      effectiveTo: new Date('2027-03-31T23:59:59Z'),
      slabsNew: [
        { upTo: 400000, rate: 0 },
        { upTo: 800000, rate: 0.05 },
        { upTo: 1200000, rate: 0.1 },
        { upTo: 1600000, rate: 0.15 },
        { upTo: 2000000, rate: 0.2 },
        { upTo: 2400000, rate: 0.25 },
        { upTo: 9999999999, rate: 0.3 },
      ],
      rebateNew: { maxIncome: 1200000, maxRebate: 60000 },
      dedLimitsNew: { '16(ia)': 75000, STANDARD_DEDUCTION: 75000, '80CCD(2)': 750000, SEC_80CCD2: 750000 },
    },
    {
      version: '2025-26-v1', // Legacy alias
      effectiveFrom: new Date('2025-04-01T00:00:00Z'),
      effectiveTo: new Date('2026-03-31T23:59:59Z'),
      slabsNew: [
        { upTo: 300000, rate: 0 },
        { upTo: 700000, rate: 0.05 },
        { upTo: 1000000, rate: 0.1 },
        { upTo: 1200000, rate: 0.15 },
        { upTo: 1500000, rate: 0.2 },
        { upTo: 9999999999, rate: 0.3 },
      ],
      rebateNew: { maxIncome: 700000, maxRebate: 25000 },
      dedLimitsNew: { '16(ia)': 75000, STANDARD_DEDUCTION: 75000, '80CCD(2)': 750000, SEC_80CCD2: 750000 },
    },
  ];

  for (const v of versions) {
    const rules = [
      {
        code: 'SLABS_NEW',
        version: v.version,
        title: `Tax Slabs - New Regime (${v.version})`,
        category: 'SLAB',
        regime: TaxRegime.NEW,
        parameters: v.slabsNew,
        effectiveFrom: v.effectiveFrom,
        effectiveTo: v.effectiveTo,
      },
      {
        code: 'SLABS_OLD',
        version: v.version,
        title: `Tax Slabs - Old Regime (${v.version})`,
        category: 'SLAB',
        regime: TaxRegime.OLD,
        parameters: [
          { upTo: 250000, rate: 0 },
          { upTo: 500000, rate: 0.05 },
          { upTo: 1000000, rate: 0.2 },
          { upTo: 9999999999, rate: 0.3 },
        ],
        effectiveFrom: v.effectiveFrom,
        effectiveTo: v.effectiveTo,
      },
      {
        code: 'REBATE_87A_NEW',
        version: v.version,
        title: `Rebate u/s 87A - New Regime (${v.version})`,
        category: 'REBATE',
        regime: TaxRegime.NEW,
        parameters: v.rebateNew,
        effectiveFrom: v.effectiveFrom,
        effectiveTo: v.effectiveTo,
      },
      {
        code: 'REBATE_87A_OLD',
        version: v.version,
        title: `Rebate u/s 87A - Old Regime (${v.version})`,
        category: 'REBATE',
        regime: TaxRegime.OLD,
        parameters: { maxIncome: 500000, maxRebate: 12500 },
        effectiveFrom: v.effectiveFrom,
        effectiveTo: v.effectiveTo,
      },
      {
        code: 'DED_LIMITS_NEW',
        version: v.version,
        title: `Deduction Limits - New Regime (${v.version})`,
        category: 'DEDUCTION_LIMIT',
        regime: TaxRegime.NEW,
        parameters: v.dedLimitsNew,
        effectiveFrom: v.effectiveFrom,
        effectiveTo: v.effectiveTo,
      },
      {
        code: 'DED_LIMITS_OLD',
        version: v.version,
        title: `Deduction Limits - Old Regime (${v.version})`,
        category: 'DEDUCTION_LIMIT',
        regime: TaxRegime.OLD,
        parameters: {
          '16(ia)': 50000,
          STANDARD_DEDUCTION: 50000,
          SEC_80C: 150000,
          '80C': 150000,
          SEC_80CCD1: 150000,
          '80CCD(1)': 150000,
          '80CCD1': 150000,
          SEC_80CCD1B: 50000,
          '80CCD(1B)': 50000,
          SEC_80D: 25000,
          '80D': 25000,
          SEC_80TTA: 10000,
          '80TTA': 10000,
          SEC_80TTB: 50000,
          '80TTB': 50000,
          SEC_24B: 200000,
          '24(b)': 200000,
          HRA: 9999999999,
          SEC_80CCD2: 750000,
          '80CCD(2)': 750000,
          SEC_80E: 9999999999,
          '80E': 9999999999,
          SEC_80G: 9999999999,
          '80G': 9999999999,
        },
        effectiveFrom: v.effectiveFrom,
        effectiveTo: v.effectiveTo,
      },
      {
        code: 'SURCHARGE_RATES',
        version: v.version,
        title: `Surcharge Rates (${v.version})`,
        category: 'SURCHARGE',
        parameters: [
          { incomeAbove: 50000000, rate: 0.37 },
          { incomeAbove: 20000000, rate: 0.25 },
          { incomeAbove: 10000000, rate: 0.15 },
          { incomeAbove: 5000000, rate: 0.1 },
        ],
        effectiveFrom: v.effectiveFrom,
        effectiveTo: v.effectiveTo,
      },
      {
        code: 'CESS_RATE',
        version: v.version,
        title: `Health & Education Cess (${v.version})`,
        category: 'CESS',
        parameters: { rate: 0.04 },
        effectiveFrom: v.effectiveFrom,
        effectiveTo: v.effectiveTo,
      },
    ];

    for (const rule of rules) {
      await prisma.taxRule.upsert({
        where: {
          code_version: {
            code: rule.code,
            version: rule.version,
          },
        },
        update: rule,
        create: rule,
      });
    }
  }

  console.log('Tax Rules seeded successfully for all versions!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
