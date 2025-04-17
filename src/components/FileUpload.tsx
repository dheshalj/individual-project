'use client';

import { useState, useCallback } from 'react';

interface FileUploadProps {
  onUpload: () => void;
}

interface UploadProgress {
  processed: number;
  saved: number;
  errors: number;
  total: number;
  percentage: number;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setProgress(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n').filter(Boolean);
        
        for (const line of lines) {
          try {
            const progressData = JSON.parse(line);
            setProgress(progressData);
          } catch (e) {
            console.error('Error parsing progress data:', e);
          }
        }
      }

      onUpload();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label className="block">
          <span className="sr-only">Choose file</span>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
            disabled={isUploading}
          />
        </label>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Uploading...</span>
            <span>{progress?.percentage || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full"
              style={{ width: `${progress?.percentage || 0}%` }}
            ></div>
          </div>
          {progress && (
            <div className="text-sm text-gray-600">
              <p>Processed: {progress.processed} of {progress.total}</p>
              <p>Saved: {progress.saved}</p>
              {progress.errors > 0 && (
                <p className="text-red-600">Errors: {progress.errors}</p>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
} 