import { GET } from '../route';
import { NextRequest } from 'next/server';
import { getConnection } from '@/lib/db';

// Mock the database connection
jest.mock('@/lib/db', () => ({
  getConnection: jest.fn().mockResolvedValue({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
  }),
}));

describe('Analytics API', () => {
  it('should return analytics data with default parameters', async () => {
    const mockTransactions = [
      {
        MERCHANTNAME: 'Test Merchant',
        MID: '123',
        TID: '456',
        TXNDATETIME: '2024-01-01T12:00:00Z',
        TXNAMOUNT: '100.00',
        RESPONSECODE: '00',
        LISTNERDES: 'Online',
        CHANNELDES: 'Web',
        ONOFFSTSTUS: 'Online',
        MCC: '5411',
        MCCDES: 'Grocery Stores',
      },
    ];

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: mockTransactions, error: null }),
    };

    (getConnection as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new NextRequest('http://localhost:3000/api/analytics');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('merchantName');
    expect(data[0]).toHaveProperty('totalTransactions');
    expect(data[0]).toHaveProperty('totalAmount');
  });

  it('should handle date range filters', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/analytics?startDate=2024-01-01&endDate=2024-01-31'
    );

    const response = await GET(request);
    expect(response.status).toBe(200);
  });

  it('should handle merchant name filter', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/analytics?merchantName=Test'
    );

    const response = await GET(request);
    expect(response.status).toBe(200);
  });

  it('should handle MID and TID filters', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/analytics?mid=123&tid=456'
    );

    const response = await GET(request);
    expect(response.status).toBe(200);
  });

  it('should handle sorting parameters', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/analytics?sortBy=totalAmount&sortOrder=desc'
    );

    const response = await GET(request);
    expect(response.status).toBe(200);
  });
}); 