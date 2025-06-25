// src/pages/ReportingPage.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface ReportData {
  byStatus: { status: string; count: string }[];
  byPriority: { priority: string; count: string }[];
}

const ReportingPage: React.FC = () => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();

  useEffect(() => {
    const fetchReport = async () => {
      if (user?.role !== 'admin') {
        setError('You are not authorized to view this page.');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get('http://localhost:3001/api/reports/summary', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReport(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch report.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [token, user]);

  if (loading) return <p>Loading report...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!report) return <p>No report data available.</p>;

  return (
    <div>
      <h2>Tickets Dashboard</h2>
      
      <div style={{ display: 'flex', gap: '40px' }}>
        <div>
          <h3>Tickets by Status</h3>
          <ul>
            {report.byStatus.map(item => (
              <li key={item.status}>{item.status}: {item.count}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3>Tickets by Priority</h3>
          <ul>
            {report.byPriority.map(item => (
              <li key={item.priority}>{item.priority}: {item.count}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReportingPage;
