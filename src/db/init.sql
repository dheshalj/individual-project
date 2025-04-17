-- Create the database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'MerchantAnalytics')
BEGIN
    CREATE DATABASE MerchantAnalytics;
END
GO

USE MerchantAnalytics;
GO

-- Create Transactions table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Transactions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Transactions] (
        [Id] BIGINT IDENTITY(1,1) PRIMARY KEY,
        [MerchantCustomerNo] NVARCHAR(50),
        [MerchantName] NVARCHAR(100),
        [MID] NVARCHAR(50),
        [LocationName] NVARCHAR(100),
        [MerchantTypeDes] NVARCHAR(50),
        [TxnCurrency] NVARCHAR(10),
        [CurrencyDes] NVARCHAR(50),
        [TxnAmount] DECIMAL(18,2),
        [TxnDateTime] DATETIME2,
        [TxnTypeCode] NVARCHAR(10),
        [TxnTypeDes] NVARCHAR(50),
        [TID] NVARCHAR(50),
        [ListenerType] NVARCHAR(50),
        [ListnerDes] NVARCHAR(50),
        [ChannelType] NVARCHAR(50),
        [ChannelDes] NVARCHAR(50),
        [MCC] NVARCHAR(10),
        [MCCDes] NVARCHAR(100),
        [AuthCode] NVARCHAR(50),
        [RRN] NVARCHAR(50),
        [TraceNo] NVARCHAR(50),
        [ResponseCode] NVARCHAR(10),
        [OnOffStatus] NVARCHAR(10),
        [BatchNo] NVARCHAR(50),
        [PosEntryMode] NVARCHAR(10),
        [CanNumber] NVARCHAR(50),
        [CardNumberMasked] NVARCHAR(50),
        [MTI] NVARCHAR(10),
        [ProcessingCode] NVARCHAR(50),
        [SettlementDate] DATETIME2,
        [LastUpdatedTime] DATETIME2,
        [StatusDes] NVARCHAR(50),
        [Status] NVARCHAR(10),
        [EODStatus] NVARCHAR(10),
        [EODStatusDes] NVARCHAR(50),
        [CreatedTime] DATETIME2,
        [RefferenceId] NVARCHAR(50),
        [UploadedAt] DATETIME2 DEFAULT GETUTCDATE()
    );

    -- Create indexes for better query performance
    CREATE INDEX [IX_Transactions_MerchantName] ON [dbo].[Transactions] ([MerchantName]);
    CREATE INDEX [IX_Transactions_TxnDateTime] ON [dbo].[Transactions] ([TxnDateTime]);
    CREATE INDEX [IX_Transactions_ResponseCode] ON [dbo].[Transactions] ([ResponseCode]);
END
GO

-- Create view for merchant analytics
IF NOT EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[MerchantAnalytics]'))
BEGIN
    EXEC('
    CREATE VIEW [dbo].[MerchantAnalytics]
    AS
    SELECT 
        MerchantName,
        COUNT(*) as TotalTransactions,
        SUM(TxnAmount) as TotalAmount,
        AVG(TxnAmount) as AverageTransactionAmount,
        CAST(SUM(CASE WHEN ResponseCode = ''00'' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) as SuccessRate
    FROM Transactions
    GROUP BY MerchantName
    ');
END
GO 