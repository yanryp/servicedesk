// src/hooks/useFileDownloader.ts
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Attachment {
  id: number;
  filename?: string;
  file_name?: string; // API uses snake_case
}

export const useFileDownloader = () => {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const { token } = useAuth();

  const downloadFile = async (attachment: Attachment) => {
    if (!token) {
      setDownloadError('Authentication token not found.');
      return;
    }

    setDownloadingId(attachment.id);
    setDownloadError(null);

    try {
      const response = await axios.get(`http://localhost:3001/api/tickets/attachments/${attachment.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      // Check if server provided a filename in Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download.txt';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // Fall back to attachment data if no header filename
      if (filename === 'download.txt') {
        filename = attachment.filename || attachment.file_name || 'download.txt';
      }

      // Create blob with correct content type
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setDownloadError(err.response?.data?.message || 'Failed to download file.');
      console.error('Download error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  return { downloadFile, downloadingId, downloadError };
};
