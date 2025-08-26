import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { TasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const socket = useMemo(() => io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000'), []);

  useEffect(() => {
    async function load() {
      try {
        if (user?.id) {
          const { data } = await TasksAPI.listByEmployee(user.id);
          setTasks(data || []);
        }
      } catch (e) {
        toast.error('Failed to load tasks');
      }
    }
    load();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    socket.emit('join', { room: `employee:${user.phoneNumber}` });
    socket.on('message', (msg) => setMessages((m) => [...m, msg]));
    return () => {
      socket.off('message');
      socket.disconnect();
    };
  }, [socket, user]);

  async function markDone(taskId) {
    try {
      await TasksAPI.markDone(taskId);
      setTasks((t) => t.map((x) => (x.id === taskId ? { ...x, status: 'done' } : x)));
      toast.success('Task marked done');
    } catch (e) {
      toast.error('Failed to update');
    }
  }

  function sendMessage() {
    if (!input.trim()) return;
    const msg = { from: user?.username || user?.phoneNumber, text: input, ts: Date.now() };
    socket.emit('private-message', { to: 'owner', message: msg });
    setMessages((m) => [...m, msg]);
    setInput('');
  }

  return (
    <div className="p-6 grid md:grid-cols-2 gap-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">My Tasks</h1>
          <button onClick={logout} className="text-sm underline">Logout</button>
        </div>
        <div className="bg-white rounded shadow divide-y">
          {tasks.map((t) => (
            <div key={t.id} className="p-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="text-xs text-gray-500">{t.status}</p>
              </div>
              {t.status !== 'done' && (
                <button onClick={() => markDone(t.id)} className="text-green-700">Mark done</button>
              )}
            </div>
          ))}
          {tasks.length === 0 && <div className="p-4 text-sm text-gray-600">No tasks</div>}
        </div>
      </div>
      <div className="bg-white rounded shadow flex flex-col h-[60vh]">
        <div className="p-3 border-b font-medium">Chat with Owner</div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.map((m, idx) => (
            <div key={idx} className="text-sm">
              <span className="font-semibold mr-2">{m.from}:</span>
              <span>{m.text}</span>
            </div>
          ))}
        </div>
        <div className="p-3 border-t flex gap-2">
          <input
            className="flex-1 border rounded px-3 py-2"
            placeholder="Type a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={sendMessage} className="bg-blue-600 text-white rounded px-4">Send</button>
        </div>
      </div>
    </div>
  );
}


