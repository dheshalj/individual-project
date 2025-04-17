'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import FileUpload from '@/components/FileUpload';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ArcElement
);

interface MerchantAnalytics {
  merchantName: string;
  mid: string;
  tid: string;
  totalTransactions: number;
  totalAmount: number;
  averageTransactionAmount: number;
  successRate: number;
  hourlyVolumes: number[];
  dailyVolumes: Array<{
    date: string;
    count: number;
  }>;
  listnerDesDistribution: { [key: string]: number };
  channelDesDistribution: { [key: string]: number };
  onOffStatusDistribution: { [key: string]: number };
  mccCounts: Array<{
    mcc: string;
    mccDes: string;
    count: number;
  }>;
}

interface FilterState {
  startDate: string;
  endDate: string;
  merchantName: string;
  mid: string;
  tid: string;
  sortBy: string;
  sortOrder: string;
}

export default function Home() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<MerchantAnalytics[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    merchantName: '',
    mid: '',
    tid: '',
    sortBy: 'totalAmount',
    sortOrder: 'desc'
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, filters]);

  const fetchAnalytics = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await fetch(`/api/analytics?${queryParams.toString()}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const transactionAmountData = {
    labels: analytics.map(item => item.merchantName),
    datasets: [
      {
        label: 'Total Amount',
        data: analytics.map(item => item.totalAmount),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const hourlyVolumeData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: analytics.slice(0, 3).map((merchant, index) => ({
      label: merchant.merchantName,
      data: merchant.hourlyVolumes,
      borderColor: `hsl(${index * 120}, 70%, 50%)`,
      fill: false,
    })),
  };

  const dailyVolumeData = {
    labels: analytics[0]?.dailyVolumes.map(v => v.date) || [],
    datasets: analytics.slice(0, 3).map((merchant, index) => ({
      label: merchant.merchantName,
      data: merchant.dailyVolumes.map(v => v.count),
      borderColor: `hsl(${index * 120}, 70%, 50%)`,
      fill: false,
    })),
  };

  const generatePieData = (distribution: { [key: string]: number }, label: string) => ({
    labels: Object.keys(distribution),
    datasets: [
      {
        label,
        data: Object.values(distribution),
        backgroundColor: Object.keys(distribution).map((_, i) => 
          `hsl(${(i * 360) / Object.keys(distribution).length}, 70%, 50%)`
        ),
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
          displayFormats: {
            day: 'MMM d'
          }
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Transactions'
        }
      }
    }
  };

  if (loadingAnalytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Transaction Analytics Dashboard</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={signOut}
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <FileUpload onUpload={fetchAnalytics} />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Merchant Name</label>
                <input
                  type="text"
                  name="merchantName"
                  value={filters.merchantName}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">MID</label>
                <input
                  type="text"
                  name="mid"
                  value={filters.mid}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">TID</label>
                <input
                  type="text"
                  name="tid"
                  value={filters.tid}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sort By</label>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="totalAmount">Total Amount</option>
                  <option value="totalTransactions">Total Transactions</option>
                  <option value="merchantName">Merchant Name</option>
                  <option value="successRate">Success Rate</option>
                  <option value="averageTransactionAmount">Average Transaction</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                <select
                  name="sortOrder"
                  value={filters.sortOrder}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Transaction Amount Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Transaction Amounts</h2>
              <div className="h-80">
                <Bar data={transactionAmountData} options={chartOptions} />
              </div>
            </div>

            {/* Hourly Volume Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Hourly Transaction Volume</h2>
              <div className="h-80">
                <Line data={hourlyVolumeData} options={chartOptions} />
              </div>
            </div>

            {/* Daily Volume Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Daily Transaction Volume</h2>
              <div className="h-80">
                <Line data={dailyVolumeData} options={chartOptions} />
              </div>
            </div>

            {/* Distribution Charts */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Listener Distribution</h2>
              <div className="h-80">
                <Pie 
                  data={generatePieData(analytics[0]?.listnerDesDistribution || {}, 'Listener Types')} 
                  options={chartOptions} 
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Channel Distribution</h2>
              <div className="h-80">
                <Pie 
                  data={generatePieData(analytics[0]?.channelDesDistribution || {}, 'Channel Types')} 
                  options={chartOptions} 
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">On/Off Status Distribution</h2>
              <div className="h-80">
                <Pie 
                  data={generatePieData(analytics[0]?.onOffStatusDistribution || {}, 'Status')} 
                  options={chartOptions} 
                />
              </div>
            </div>
          </div>

          {/* MCC Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">MCC Distribution</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MCC Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction Count
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics[0]?.mccCounts.map((mcc) => (
                    <tr key={mcc.mcc}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {mcc.mcc}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mcc.mccDes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mcc.count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
