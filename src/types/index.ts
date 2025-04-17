export interface Transaction {
  merchantCustomerNo: string;
  merchantName: string;
  mid: string;
  locationName: string;
  merchantTypeDes: string;
  txnCurrency: string;
  currencyDes: string;
  txnAmount: number;
  txnDateTime: string;
  txnTypeCode: string;
  txnTypeDes: string;
  tid: string;
  listenerType: string;
  listnerDes: string;
  channelType: string;
  channelDes: string;
  mcc: string;
  mccDes: string;
  authCode: string;
  rrn: string;
  traceNo: string;
  responseCode: string;
  onOffStatus: string;
  batchNo: string;
  posEntryMode: string;
  canNumber: string;
  cardNumberMasked: string;
  mti: string;
  processingCode: string;
  settlementDate: string;
  lastUpdatedTime: string;
  statusDes: string;
  status: string;
  eodStatus: string;
  eodStatusDes: string;
  createdTime: string;
  refferenceId: string;
}

export interface MerchantAnalytics {
  merchantName: string;
  totalTransactions: number;
  totalAmount: number;
  averageTransactionAmount: number;
  successRate: number;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
} 