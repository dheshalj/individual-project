import { POST } from '../route';
import { NextRequest } from 'next/server';
import { getConnection } from '@/lib/db';

// Mock the database connection
jest.mock('@/lib/db', () => ({
  getConnection: jest.fn().mockResolvedValue({
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ error: null }),
  }),
}));

describe('Upload API', () => {
  it('should return 400 when no file is provided', async () => {
    const formData = new FormData();
    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('No file uploaded');
  });

  it('should handle file upload and return progress updates', async () => {
    // Create a mock Excel file
    const mockFile = new File(['mock data'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const formData = new FormData();
    formData.append('file', mockFile);

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    
    // The response should be a stream with progress updates
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
    expect(response.headers.get('Connection')).toBe('keep-alive');
  });
});