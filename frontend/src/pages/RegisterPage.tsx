// src/pages/RegisterPage.tsx
import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate for redirection

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'technician' | 'requester'>('requester'); // Default role
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate(); // Hook for navigation

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setSuccessMessage(null);

    if (!username || !email || !password || !role) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        username,
        email,
        password,
        role,
      });
      console.log('Registration successful:', response.data);
      setSuccessMessage('Registration successful! You can now log in.');
      // Optionally, clear form or redirect
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('requester');
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000); 
    } catch (err: any) {
      console.error('Registration error:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div>
      <h1>Register</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="role">Role:</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value as typeof role)} required>
            <option value="requester">Requester</option>
            <option value="technician">Technician</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
