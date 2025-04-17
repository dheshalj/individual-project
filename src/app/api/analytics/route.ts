import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const merchantName = searchParams.get('merchantName');
    const mid = searchParams.get('mid');
    const tid = searchParams.get('tid');
    const sortBy = searchParams.get('sortBy') || 'totalAmount';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const supabase = await getConnection();

    let query = supabase
      .from('txns')
      .select('*');

    if (startDate) {
      query = query.gte('TXNDATETIME', startDate);
    }
    if (endDate) {
      query = query.lte('TXNDATETIME', endDate);
    }
    if (merchantName) {
      query = query.ilike('MERCHANTNAME', `%${merchantName}%`);
    }
    if (mid) {
      query = query.eq('MID', mid);
    }
    if (tid) {
      query = query.eq('TID', tid);
    }

    const { data: transactions, error } = await query;

    if (error) {
      throw error;
    }

    // Group transactions by merchant
    const merchantGroups = transactions.reduce((groups: { [key: string]: any[] }, txn) => {
      const key = `${txn.MERCHANTNAME}-${txn.MID}-${txn.TID}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(txn);
      return groups;
    }, {});

    // Calculate analytics for each merchant
    const analytics = Object.entries(merchantGroups).map(([key, merchantTxns]) => {
      const [merchantName, mid, tid] = key.split('-');
      
      // Calculate hourly volumes
      const hourlyVolumes = new Array(24).fill(0);
      merchantTxns.forEach(txn => {
        const hour = new Date(txn.TXNDATETIME).getHours();
        hourlyVolumes[hour]++;
      });

      // Calculate daily volumes
      const dailyGroups = transactions.reduce((groups: { [key: string]: number }, txn) => {
        const date = new Date(txn.TXNDATETIME).toISOString().split('T')[0];
        groups[date] = (groups[date] || 0) + 1;
        return groups;
      }, {});

      const dailyVolumes = Object.entries(dailyGroups)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate distribution data
      const listnerDesDistribution = merchantTxns.reduce((dist: { [key: string]: number }, txn) => {
        dist[txn.LISTNERDES] = (dist[txn.LISTNERDES] || 0) + 1;
        return dist;
      }, {});

      const channelDesDistribution = merchantTxns.reduce((dist: { [key: string]: number }, txn) => {
        dist[txn.CHANNELDES] = (dist[txn.CHANNELDES] || 0) + 1;
        return dist;
      }, {});

      const onOffStatusDistribution = merchantTxns.reduce((dist: { [key: string]: number }, txn) => {
        dist[txn.ONOFFSTSTUS] = (dist[txn.ONOFFSTSTUS] || 0) + 1;
        return dist;
      }, {});

      // Calculate MCC counts
      const mccGroups = transactions.reduce((groups: { [key: string]: { count: number, mccDes: string } }, txn) => {
        if (!groups[txn.MCC]) {
          groups[txn.MCC] = { count: 0, mccDes: txn.MCCDES };
        }
        groups[txn.MCC].count++;
        return groups;
      }, {});

      const mccCounts = Object.entries(mccGroups)
        .map(([mcc, data]) => ({
          mcc,
          mccDes: data.mccDes,
          count: data.count
        }))
        .sort((a, b) => b.count - a.count);

      return {
        merchantName,
        mid,
        tid,
        totalTransactions: merchantTxns.length,
        totalAmount: merchantTxns.reduce((sum, txn) => sum + Number(txn.TXNAMOUNT), 0),
        averageTransactionAmount: merchantTxns.reduce((sum, txn) => sum + Number(txn.TXNAMOUNT), 0) / merchantTxns.length,
        successRate: merchantTxns.filter(txn => txn.RESPONSECODE === '00').length / merchantTxns.length,
        hourlyVolumes,
        dailyVolumes,
        listnerDesDistribution,
        channelDesDistribution,
        onOffStatusDistribution,
        mccCounts
      };
    });

    // Sort analytics based on user preference
    analytics.sort((a: any, b: any) => {
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      return (a[sortBy] - b[sortBy]) * multiplier;
    });

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Error fetching analytics' },
      { status: 500 }
    );
  }
} 