import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { read, utils } from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = utils.sheet_to_json(worksheet);
    const totalRecords = data.length;

    const supabase = await getConnection();
    
    // Transform data to match database table structure
    const transactions = data.map((row: any) => ({
      MERCHANTCUSTOMERNO: row.MERCHANTCUSTOMERNO,
      MERCHANTNAME: row.MERCHANTNAME,
      MID: row.MID,
      LOCATIONNAME: row.LOCATIONNAME,
      MERCHANT_TYPE_DES: row['MERCHANT TYPE DES'],
      TXNCURRENCY: row.TXNCURRENCY,
      CURRENCYDES: row.CURRENCYDES,
      TXNAMOUNT: row.TXNAMOUNT,
      TXNDATETIME: row.TXNDATETIME,
      TXNTYPECODE: row.TXNTYPECODE,
      TXNTYPEDES: row.TXNTYPEDES,
      TID: row.TID,
      LISTENERTYPE: row.LISTENERTYPE,
      LISTNERDES: row.LISTNERDES,
      CHANNELTYPE: row.CHANNELTYPE,
      CHANNELDES: row.CHANNELDES,
      MCC: row.MCC,
      MCCDES: row.MCCDES,
      AUTHCODE: row.AUTHCODE,
      RRN: row.RRN,
      TRACENO: row.TRACENO,
      RESPONSECODE: row.RESPONSECODE,
      ONOFFSTSTUS: row.ONOFFSTSTUS,
      BATCHNO: row.BATCHNO,
      POSENTRYMODE: row.POSENTRYMODE,
      POSCONDITIONCODE: row.POSCONDITIONCODE,
      MTI: row.MTI,
      PROCESSINGCODE: row.PROCESSINGCODE,
      SETTLEMENTDATE: row.SETTLEMENTDATE,
      LASTUPDATEDTIME: row.LASTUPDATEDTIME,
      STATUSDES: row.STATUSDES,
      STATUS: row.STATUS,
      EODSTATUS: row.EODSTATUS,
      EODSTATUSDES: row.EODSTATUSDES,
      CREATEDTIME: row.CREATEDTIME,
      REFFERENCEID: row.REFFERENCEID,
      CAN: row['CAN NUMBER'],
      CARDNUMBER_MASKED: row['CARDNUMBER MASKED'],
      IRD: row.IRD
    }));

    // Insert data in batches of 1000 to avoid hitting limits
    const batchSize = 1000;
    let processedRecords = 0;
    let savedRecords = 0;
    let errors = 0;

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      processedRecords += batch.length;

      try {
        const { error } = await supabase
          .from('txns')
          .insert(batch);
        
        if (error) {
          console.error('Error inserting batch:', error);
          errors += batch.length;
        } else {
          savedRecords += batch.length;
        }

        // Send progress update
        const progress = {
          processed: processedRecords,
          saved: savedRecords,
          errors: errors,
          total: totalRecords,
          percentage: Math.round((processedRecords / totalRecords) * 100)
        };

        // Create a new Response with the progress data
        const encoder = new TextEncoder();
        const progressData = encoder.encode(JSON.stringify(progress) + '\n');
        
        // This will be handled by the client's event source
        return new Response(progressData, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } catch (error) {
        console.error('Error processing batch:', error);
        errors += batch.length;
      }
    }

    return NextResponse.json({
      message: 'File upload completed',
      totalRecords,
      savedRecords,
      errors
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Error processing file' },
      { status: 500 }
    );
  }
} 