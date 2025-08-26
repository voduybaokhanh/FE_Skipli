import React, { useEffect, useState } from 'react';
import { EmployeesAPI, TasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function OwnerDashboard() {
  const { logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', role: 'employee', schedule: '' });

  async function loadEmployees() {
    setLoading(true);
    try {
      const { data } = await EmployeesAPI.list();
      setEmployees(data || []);
    } catch (e) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEmployees(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await EmployeesAPI.create(form);
      toast.success('Employee added. Invitation email sent');
      setForm({ name: '', phone: '', email: '', role: 'employee', schedule: '' });
      loadEmployees();
    } catch (e) {
      toast.error('Failed to add employee');
    }
  }

  async function handleUpdate(id, partial) {
    try {
      await EmployeesAPI.update(id, partial);
      toast.success('Employee updated');
      loadEmployees();
    } catch (e) {
      toast.error('Failed to update');
    }
  }

  async function handleDelete(id) {
    try {
      await EmployeesAPI.remove(id);
      toast.success('Employee removed');
      loadEmployees();
    } catch (e) {
      toast.error('Failed to delete');
    }
  }

  async function assignTask(employeeId) {
    const title = prompt('Task title');
    if (!title) return;
    try {
      await TasksAPI.assign({ employeeId, title });
      toast.success('Task assigned');
    } catch (e) {
      toast.error('Failed to assign');
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Owner Dashboard</h1>
        <button onClick={logout} className="text-sm underline">Logout</button>
      </div>

      <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-white p-4 rounded shadow">
        <input className="border rounded px-3 py-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <input className="border rounded px-3 py-2" placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
        <input className="border rounded px-3 py-2" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <select className="border rounded px-3 py-2" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
          <option value="employee">Employee</option>
          <option value="owner">Owner</option>
        </select>
        <input className="border rounded px-3 py-2" placeholder="Schedule" value={form.schedule} onChange={e=>setForm({...form,schedule:e.target.value})} />
        <button type="submit" className="bg-blue-600 text-white rounded px-4">Add</button>
      </form>

      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Phone</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Role</th>
              <th className="text-left p-2">Schedule</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="p-4" colSpan={6}>Loading...</td></tr>
            )}
            {!loading && employees.map(emp => (
              <tr key={emp.id} className="border-t">
                <td className="p-2">
                  <input className="border rounded px-2 py-1 w-full" defaultValue={emp.name} onBlur={(e)=>handleUpdate(emp.id,{name:e.target.value})} />
                </td>
                <td className="p-2">
                  <input className="border rounded px-2 py-1 w-full" defaultValue={emp.phone} onBlur={(e)=>handleUpdate(emp.id,{phone:e.target.value})} />
                </td>
                <td className="p-2">
                  <input className="border rounded px-2 py-1 w-full" defaultValue={emp.email} onBlur={(e)=>handleUpdate(emp.id,{email:e.target.value})} />
                </td>
                <td className="p-2">
                  <select className="border rounded px-2 py-1" defaultValue={emp.role} onChange={(e)=>handleUpdate(emp.id,{role:e.target.value})}>
                    <option value="employee">Employee</option>
                    <option value="owner">Owner</option>
                  </select>
                </td>
                <td className="p-2">
                  <input className="border rounded px-2 py-1 w-full" defaultValue={emp.schedule} onBlur={(e)=>handleUpdate(emp.id,{schedule:e.target.value})} />
                </td>
                <td className="p-2 space-x-2">
                  <button onClick={()=>assignTask(emp.id)} className="text-blue-600">Assign task</button>
                  <button onClick={()=>handleDelete(emp.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


