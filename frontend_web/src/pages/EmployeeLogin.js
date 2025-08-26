import React, { useState } from 'react';
import { AuthAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function EmployeeLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await AuthAPI.employeeLogin({ username, password });
      localStorage.setItem('auth:user', JSON.stringify(data));
      toast.success('Logged in');
      navigate('/employee');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Employee Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} className="border w-full px-3 py-2" />
        <input placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="border w-full px-3 py-2" />
        <button disabled={loading} className="border px-4 py-2">{loading? 'Logging in...' : 'Login'}</button>
      </form>
    </div>
  );
}


