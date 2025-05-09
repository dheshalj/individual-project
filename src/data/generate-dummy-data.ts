import { join } from 'node:path';
import * as XLSX from 'xlsx';
import * as fs from 'node:fs';

// Constants
const MERCHANT_COUNT = 200;
const TIDS_PER_MID = 3;
const MAX_RECORDS = 1000;
const PEAK_HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18];
const LISTENERS = ['POS', 'IPG', 'LQR'];
const CHANNELS = ['CUP', 'VISA', 'MASTER'];
const ON_OFF_STATUS = ['On Us', 'Off Us'];
const MCC_CODES = [
  { code: '5411', description: 'Grocery Stores, Supermarkets' },
  { code: '5812', description: 'Eating Places, Restaurants' },
  { code: '5311', description: 'Department Stores' },
  { code: '5732', description: 'Electronics Stores' },
  { code: '5912', description: 'Drug Stores, Pharmacies' },
  { code: '5541', description: 'Service Stations' },
  { code: '5814', description: 'Fast Food Restaurants' },
  { code: '5651', description: 'Family Clothing Stores' },
  { code: '5941', description: 'Sporting Goods Stores' },
  { code: '5999', description: 'Miscellaneous Retail Stores' }
];
const CURRENCIES = [
  { code: 144, description: 'Sri Lankan Rupee' },
  { code: 840, description: 'US Dollar' },
  { code: 978, description: 'Euro' },
  { code: 826, description: 'British Pound' }
];

// Generate merchant data
function generateMerchants() {
  const merchants = [];
  for (let i = 0; i < MERCHANT_COUNT; i++) {
    const mid = i + 1;
    const tids = Array.from({ length: TIDS_PER_MID }, (_, j) => j + 1);
    const mcc = MCC_CODES[Math.floor(Math.random() * MCC_CODES.length)];
    
    merchants.push({
      mid,
      tids,
      mcc,
      merchantName: `Merchant ${i + 1}`,
      locationName: `Location ${i + 1}`,
      merchantTypeDes: ['Retail', 'Service', 'Food'][Math.floor(Math.random() * 3)]
    });
  }
  return merchants;
}

// Helper function to get random amount based on currency
function getRandomAmount(currencyCode: number): number {
  switch (currencyCode) {
    case 144: // LKR
      return Math.floor(Math.random() * 100000) + 1000; // 1,000 to 100,000 LKR
    case 840: // USD
      return Math.floor(Math.random() * 1000) + 10; // 10 to 1,000 USD
    case 978: // EUR
      return Math.floor(Math.random() * 1000) + 10; // 10 to 1,000 EUR
    case 826: // GBP
      return Math.floor(Math.random() * 1000) + 10; // 10 to 1,000 GBP
    default:
      return Math.floor(Math.random() * 1000) + 10;
  }
}

// Generate transactions for a day
function generateTransactions(date: Date, merchants: any[]) {
  const transactions = [];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  let totalTransactions = 0;
  
  for (const hour of hours) {
    if (totalTransactions >= MAX_RECORDS) break;
    
    const isPeakHour = PEAK_HOURS.includes(hour);
    const baseTransactions = isPeakHour ? 100 : 30;
    const transactionsThisHour = Math.min(
      baseTransactions,
      MAX_RECORDS - totalTransactions
    );
    
    for (let i = 0; i < transactionsThisHour; i++) {
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const tid = merchant.tids[Math.floor(Math.random() * merchant.tids.length)];
      
      // 70% chance for LKR, 30% for other currencies
      const currency = Math.random() < 0.7 
        ? CURRENCIES[0] // LKR
        : CURRENCIES[Math.floor(Math.random() * (CURRENCIES.length - 1)) + 1];
      
      const amount = getRandomAmount(currency.code);
      
      const transaction = {
        MERCHANTCUSTOMERNO: Math.floor(Math.random() * 10000),
        MERCHANTNAME: merchant.merchantName,
        MID: merchant.mid,
        LOCATIONNAME: merchant.locationName,
        MERCHANT_TYPE_DES: merchant.merchantTypeDes,
        TXNCURRENCY: currency.code,
        CURRENCYDES: currency.description,
        TXNAMOUNT: amount,
        TXNDATETIME: new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60)).toISOString(),
        TXNTYPECODE: 1,
        TXNTYPEDES: 'Purchase',
        TID: tid,
        LISTENERTYPE: Math.floor(Math.random() * LISTENERS.length),
        LISTNERDES: LISTENERS[Math.floor(Math.random() * LISTENERS.length)],
        CHANNELTYPE: Math.floor(Math.random() * CHANNELS.length),
        CHANNELDES: CHANNELS[Math.floor(Math.random() * CHANNELS.length)],
        MCC: merchant.mcc.code,
        MCCDES: merchant.mcc.description,
        AUTHCODE: String(Math.floor(Math.random() * 1000000)).padStart(6, '0'),
        RRN: String(Math.floor(Math.random() * 1000000000)).padStart(9, '0'),
        TRACENO: String(Math.floor(Math.random() * 1000000)).padStart(6, '0'),
        RESPONSECODE: Math.random() > 0.1 ? '00' : '05',
        ONOFFSTSTUS: ON_OFF_STATUS[Math.floor(Math.random() * ON_OFF_STATUS.length)],
        BATCHNO: String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
        POSENTRYMODE: '021',
        POSCONDITIONCODE: '00',
        MTI: '0200',
        PROCESSINGCODE: '000000',
        SETTLEMENTDATE: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString().split('T')[0],
        LASTUPDATEDTIME: new Date().toISOString(),
        STATUSDES: 'Completed',
        STATUS: '00',
        EODSTATUS: 'Y',
        EODSTATUSDES: 'End of Day Processed',
        CREATEDTIME: new Date().toISOString(),
        REFFERENCEID: `REF${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
        CAN: `CAN${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
        CARDNUMBER_MASKED: `****${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        IRD: String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
      };
      
      transactions.push(transaction);
      totalTransactions++;
    }
  }
  
  return transactions;
}

// Main function to generate and save the Excel file
export function generateDummyData() {
  const date = new Date("2025-04-24");
  const merchants = generateMerchants();
  const transactions = generateTransactions(date, merchants);
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(transactions);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
  
  // Create dummy directory if it doesn't exist
  const dir = join(process.cwd(), 'dummy');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  
  // Save the file
  const filename = `transactions_${date.toISOString().split('T')[0]}.xlsx`;
  const filepath = join(dir, filename);
  XLSX.writeFile(wb, filepath);
  
  console.log(`Generated dummy data file: ${filepath}`);
}

// Run the generator
generateDummyData(); 