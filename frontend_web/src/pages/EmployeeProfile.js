import React, { useEffect, useState } from 'react';
import { ProfileAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function EmployeeProfile() {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await ProfileAPI.me();
        setForm({ name: data?.name || '', phone: data?.phone || '', email: data?.email || '' });
      } catch (e) {
        toast.error('Failed to load profile');
      }
    }
    load();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await ProfileAPI.updateMe(form);
      toast.success('Profile updated');
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-xl font-semibold mb-4">My Profile</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="border w-full px-3 py-2" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
        <input className="border w-full px-3 py-2" placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} />
        <input className="border w-full px-3 py-2" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
        <button disabled={loading} className="border px-4 py-2">{loading? 'Saving...' : 'Save'}</button>
      </form>
    </div>
  );
}


