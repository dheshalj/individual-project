# Merchant Transaction Analytics Portal

A web-based portal for merchants to upload and analyze their daily transaction data. Built with Next.js, React, and SQL Server.

## Features

- Secure user authentication with Firebase
- Excel file upload and processing
- Real-time transaction analytics
- Interactive data visualization
- Top merchant performance tracking
- Success rate analysis

## Prerequisites

- Node.js 18 or higher
- SQL Server 2019 or higher
- Firebase account

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd merchant-analytics
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Database Configuration
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SERVER=localhost
DB_NAME=MerchantAnalytics
```

4. Initialize the database:
- Open SQL Server Management Studio
- Connect to your SQL Server instance
- Run the SQL script in `src/db/init.sql`

5. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Usage

1. Log in using your Firebase credentials
2. Navigate to the dashboard
3. Upload your transaction Excel file
4. View analytics and insights

## File Format

The Excel file should contain the following columns:
- MERCHANTCUSTOMERNO
- MERCHANTNAME
- MID
- LOCATIONNAME
- MERCHANT TYPE DES
- TXNCURRENCY
- CURRENCYDES
- TXNAMOUNT
- TXNDATETIME
- TXNTYPECODE
- TXNTYPEDES
- TID
- LISTENERTYPE
- LISTNERDES
- CHANNELTYPE
- CHANNELDES
- MCC
- MCCDES
- AUTHCODE
- RRN
- TRACENO
- RESPONSECODE
- ONOFFSTSTUS
- BATCHNO
- POSENTRYMODE
- CAN NUMBER
- CARDNUMBER MASKED
- MTI
- PROCESSINGCODE
- SETTLEMENTDATE
- LASTUPDATEDTIME
- STATUSDES
- STATUS
- EODSTATUS
- EODSTATUSDES
- CREATEDTIME
- REFFERENCEID

## Development

The project uses:
- Next.js for the frontend and API routes
- Tailwind CSS for styling
- Chart.js for data visualization
- SQL Server for data storage
- Firebase for authentication

## License

MIT