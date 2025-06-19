// src/pages/EditTicketPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EditTicketPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('open');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const fetchTicket = async () => {
      if (!token) return;
      try {
        const response = await axios.get(`http://localhost:3001/api/tickets/${ticketId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { title, description, priority, status } = response.data;
        setTitle(title);
        setDescription(description);
        setPriority(priority);
        setStatus(status);
      } catch (err) {
        setError('Failed to load ticket data.');
      }
    };
    fetchTicket();
  }, [ticketId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('You must be logged in to edit a ticket.');
      return;
    }

    try {
      await axios.put(`http://localhost:3001/api/tickets/${ticketId}`,
        { title, description, priority, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Ticket updated successfully!');
      setTimeout(() => navigate(`/tickets/${ticketId}`), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update ticket.');
    }
  };

  return (
    <div>
      <h2>Edit Ticket</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <button type="submit">Update Ticket</button>
      </form>
    </div>
  );
};

export default EditTicketPage;
