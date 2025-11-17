import * as mongoose from 'mongoose';
import * as moment from 'moment-timezone';
import { CompanyType } from '../common/types/company.types';
import { TIMEZONE } from '../common/constants/timezone.constant';

// Configure timezone to UTC-3 (America/Buenos_Aires)
moment.tz.setDefault(TIMEZONE.NAME);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interbanking';

  const companySchema = new mongoose.Schema({
    cuit: { type: String, required: true, unique: true },
    businessName: { type: String, required: true },
    companyType: { type: String, required: true, enum: Object.values(CompanyType) },
    adhesionDate: { type: Date, required: true },
  }, { timestamps: true });

const transferSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  amount: { type: Number, required: true },
  debitAccount: { type: String, required: true },
  creditAccount: { type: String, required: true },
  transferDate: { type: Date, required: true },
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);
const Transfer = mongoose.model('Transfer', transferSchema);

async function seed() {
  try {
    console.log('[Seed]: Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed]: Connected to MongoDB successfully');

    // Clear existing data
    console.log('[Seed]: Clearing existing data...');
    await Company.deleteMany({});
    await Transfer.deleteMany({});
    console.log('[Seed]: Existing data cleared');

    // Create companies
    console.log('[Seed]: Creating companies...');
    const currentTime = moment.tz(TIMEZONE.NAME);
    console.log(`[Seed]: Current time: ${currentTime.format('DD/MM/YYYY HH:mm:ss')} (${TIMEZONE.DESCRIPTION}${currentTime.format('Z')})`);
    
    // Calculate dates using moment in configured timezone (UTC-3)
    const now = moment.tz(TIMEZONE.NAME);

    console.log('[Seed]: Scenario: 20 companies with varied dates (different months and years)');
    console.log('[Seed]:   - 8 companies: last month (should appear in "joined last month")');
    console.log('[Seed]:   - 12 companies: older dates (various months/years)');

    // OLD COMPANIES - Various dates in the past (should NOT appear in "joined last month")
    const oldCompanies = await Company.insertMany([
      // 2 years ago
      {
        cuit: '20100000001',
        businessName: 'Antigua Corporacion SA',
        companyType: CompanyType.CORPORATE,
        adhesionDate: now.clone().subtract(2, 'years').toDate(),
      },
      {
        cuit: '20100000002',
        businessName: 'Vieja Empresa SRL',
        companyType: CompanyType.SME,
        adhesionDate: now.clone().subtract(18, 'months').toDate(),
      },
      // 1 year ago
      {
        cuit: '20100000003',
        businessName: 'Servicios Historicos SA',
        companyType: CompanyType.CORPORATE,
        adhesionDate: now.clone().subtract(1, 'year').toDate(),
      },
      // 6 months ago
      {
        cuit: '20100000004',
        businessName: 'Comercial Semestral SRL',
        companyType: CompanyType.SME,
        adhesionDate: now.clone().subtract(6, 'months').toDate(),
      },
      // 4 months ago
      {
        cuit: '20100000005',
        businessName: 'Tech Legacy SA',
        companyType: CompanyType.CORPORATE,
        adhesionDate: now.clone().subtract(4, 'months').toDate(),
      },
      // 3 months ago
      {
        cuit: '20100000006',
        businessName: 'Industrias del Pasado SRL',
        companyType: CompanyType.SME,
        adhesionDate: now.clone().subtract(3, 'months').toDate(),
      },
      // 2 months ago
      {
        cuit: '20100000007',
        businessName: 'Logistica Anterior SA',
        companyType: CompanyType.CORPORATE,
        adhesionDate: now.clone().subtract(2, 'months').toDate(),
      },
      {
        cuit: '20100000008',
        businessName: 'Construcciones Viejas SRL',
        companyType: CompanyType.SME,
        adhesionDate: now.clone().subtract(2, 'months').toDate(),
      },
      // Just over 1 month ago (35 days)
      {
        cuit: '20100000009',
        businessName: 'Empresa Limite SA',
        companyType: CompanyType.CORPORATE,
        adhesionDate: now.clone().subtract(35, 'days').toDate(),
      },
      {
        cuit: '20100000010',
        businessName: 'Servicios Frontera SRL',
        companyType: CompanyType.SME,
        adhesionDate: now.clone().subtract(32, 'days').toDate(),
      },
      {
        cuit: '20100000011',
        businessName: 'Comercial Borde SA',
        companyType: CompanyType.CORPORATE,
        adhesionDate: now.clone().subtract(31, 'days').toDate(),
      },
      {
        cuit: '20100000012',
        businessName: 'Tech Pasado SRL',
        companyType: CompanyType.SME,
        adhesionDate: now.clone().subtract(31, 'days').toDate(),
      },
    ]);

    console.log(`[Seed]: Created ${oldCompanies.length} old companies (various dates)`);

    // RECENT COMPANIES - Last month (should appear in "joined last month" query)
    const recentCompanies = await Company.insertMany([
      {
        cuit: '20200000001',
        businessName: 'Innovatech Argentina SA',
        companyType: CompanyType.CORPORATE,
        adhesionDate: now.clone().subtract(28, 'days').toDate(),
      },
      {
        cuit: '20200000002',
        businessName: 'Servicios Modernos SRL',
        companyType: CompanyType.SME,
        adhesionDate: now.clone().subtract(25, 'days').toDate(),
      },
      {
        cuit: '20200000003',
        businessName: 'Logistica Express SA',
        companyType: CompanyType.CORPORATE,
        adhesionDate: now.clone().subtract(20, 'days').toDate(),
      },
      {
        cuit: '20200000004',
        businessName: 'Construcciones del Norte SRL',
        companyType: CompanyType.SME,
        adhesionDate: now.clone().subtract(15, 'days').toDate(),
      },
      {
        cuit: '20200000005',
        businessName: 'Tech Nueva Era SA',
        companyType: CompanyType.CORPORATE,
        adhesionDate: now.clone().subtract(10, 'days').toDate(),
      },
      {
        cuit: '20200000006',
        businessName: 'Comercial Actual SRL',
        companyType: CompanyType.SME,
        adhesionDate: now.clone().subtract(7, 'days').toDate(),
      },
      {
        cuit: '20200000007',
        businessName: 'Industrias Recientes SA',
        companyType: CompanyType.CORPORATE,
        adhesionDate: now.clone().subtract(3, 'days').toDate(),
      },
      {
        cuit: '20200000008',
        businessName: 'Servicios de Hoy SRL',
        companyType: CompanyType.SME,
        adhesionDate: now.clone().subtract(1, 'day').toDate(),
      },
    ]);

    console.log(`[Seed]: Created ${recentCompanies.length} recent companies (last month)`);

    // Create transfers
    console.log('[Seed]: Creating transfers...');

    const allCompanies = [...oldCompanies, ...recentCompanies];

    const transfers = await Transfer.insertMany([
      // Transfers from old companies (within last month)
      {
        companyId: oldCompanies[6]._id, // Logistica Anterior SA (2 months ago company)
        amount: 150000.50,
        debitAccount: '0000003100012345678',
        creditAccount: '0000003200087654321',
        transferDate: now.clone().subtract(20, 'days').toDate(),
      },
      {
        companyId: oldCompanies[7]._id, // Construcciones Viejas SRL
        amount: 75000.00,
        debitAccount: '0000003100098765432',
        creditAccount: '0000003200099988877',
        transferDate: now.clone().subtract(15, 'days').toDate(),
      },
      // Transfers from recent companies (last month)
      {
        companyId: recentCompanies[0]._id, // Innovatech Argentina SA (28 days ago)
        amount: 250000.00,
        debitAccount: '0000003100055566677',
        creditAccount: '0000003200044455566',
        transferDate: now.clone().subtract(27, 'days').toDate(),
      },
      {
        companyId: recentCompanies[1]._id, // Servicios Modernos SRL (25 days ago)
        amount: 30000.00,
        debitAccount: '0000003100011223344',
        creditAccount: '0000003200099887766',
        transferDate: now.clone().subtract(24, 'days').toDate(),
      },
      {
        companyId: recentCompanies[2]._id, // Logistica Express SA (20 days ago)
        amount: 180000.25,
        debitAccount: '0000003100077788899',
        creditAccount: '0000003200055544433',
        transferDate: now.clone().subtract(19, 'days').toDate(),
      },
      {
        companyId: recentCompanies[2]._id, // Logistica Express SA (multiple transfers)
        amount: 95000.00,
        debitAccount: '0000003100077788899',
        creditAccount: '0000003200022211100',
        transferDate: now.clone().subtract(18, 'days').toDate(),
      },
      {
        companyId: recentCompanies[3]._id, // Construcciones del Norte SRL (15 days ago)
        amount: 120000.00,
        debitAccount: '0000003100011122233',
        creditAccount: '0000003200077788899',
        transferDate: now.clone().subtract(14, 'days').toDate(),
      },
      {
        companyId: recentCompanies[4]._id, // Tech Nueva Era SA (10 days ago)
        amount: 200000.75,
        debitAccount: '0000003100099988877',
        creditAccount: '0000003200033344455',
        transferDate: now.clone().subtract(9, 'days').toDate(),
      },
      {
        companyId: recentCompanies[5]._id, // Comercial Actual SRL (7 days ago)
        amount: 85000.50,
        debitAccount: '0000003100066677788',
        creditAccount: '0000003200088899900',
        transferDate: now.clone().subtract(6, 'days').toDate(),
      },
      {
        companyId: recentCompanies[6]._id, // Industrias Recientes SA (3 days ago)
        amount: 300000.00,
        debitAccount: '0000003100055544433',
        creditAccount: '0000003200011122233',
        transferDate: now.clone().subtract(2, 'days').toDate(),
      },
      {
        companyId: recentCompanies[7]._id, // Servicios de Hoy SRL (1 day ago)
        amount: 150000.25,
        debitAccount: '0000003100044433322',
        creditAccount: '0000003200077766655',
        transferDate: now.clone().subtract(1, 'day').toDate(),
      },
      // Old transfers (more than a month ago) - should NOT appear in results
      {
        companyId: oldCompanies[0]._id, // Antigua Corporacion SA
        amount: 100000.00,
        debitAccount: '0000003100012345678',
        creditAccount: '0000003200066655544',
        transferDate: now.clone().subtract(2, 'years').toDate(),
      },
      {
        companyId: oldCompanies[6]._id, // Logistica Anterior SA
        amount: 80000.00,
        debitAccount: '0000003100012345678',
        creditAccount: '0000003200011111111',
        transferDate: now.clone().subtract(2, 'months').toDate(),
      },
    ]);

    console.log(`[Seed]: Created ${transfers.length} transfers`);

    // Summary
    const oneMonthAgo = now.clone().subtract(1, 'month').toDate();
    const transfersLastMonth = transfers.filter(t => t.transferDate >= oneMonthAgo);
    const companiesWithTransfers = new Set(transfersLastMonth.map(t => t.companyId.toString())).size;

    console.log('\n=== SEED SUMMARY ===');
    console.log(`Total companies: ${allCompanies.length}`);
    console.log(`Companies joined last month: ${recentCompanies.length}`);
    console.log(`Transfers in last month: ${transfersLastMonth.length}`);
    console.log(`Companies with transfers last month: ${companiesWithTransfers} (should be returned by endpoint 1)`);
    console.log('\n--- Date Distribution ---');
    console.log('- 2 years ago: 1 company');
    console.log('- 18 months ago: 1 company');
    console.log('- 1 year ago: 1 company');
    console.log('- 6 months ago: 1 company');
    console.log('- 4 months ago: 1 company');
    console.log('- 3 months ago: 1 company');
    console.log('- 2 months ago: 2 companies');
    console.log('- 31-35 days ago: 4 companies (outside "last month")');
    console.log('- Last month (1-28 days): 8 companies ← Should appear in paginated endpoint');
    console.log('\n--- Pagination Test ---');
    console.log('Endpoint: GET /companies/joined/last-month?page=1&limit=5');
    console.log('- Page 1: 5 companies (most recent)');
    console.log('- Page 2: 3 companies (remaining)');
    console.log('\n[Seed]: Database seeded successfully!');

    await mongoose.disconnect();
    console.log('[Seed]: Disconnected from MongoDB');
  } catch (error) {
    console.error('[Seed]: Error seeding database:', error);
    process.exit(1);
  }
}

seed();


