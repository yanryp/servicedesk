// src/hooks/useFileDownloader.ts
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Attachment {
  id: number;
  filename: string;
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

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.filename);
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
