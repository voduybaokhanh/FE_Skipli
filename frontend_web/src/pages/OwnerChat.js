import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { EmployeesAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function OwnerChat() {
  const [employees, setEmployees] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const socket = useMemo(() => io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000'), []);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await EmployeesAPI.list();
        setEmployees(data || []);
      } catch (e) {
        toast.error('Failed to load employees');
      }
    }
    load();
  }, []);

  useEffect(() => {
    socket.on('message', (msg) => setMessages((m) => [...m, msg]));
    return () => {
      socket.off('message');
      socket.disconnect();
    };
  }, [socket]);

  function send() {
    if (!activeId || !input.trim()) return;
    const msg = { from: 'owner', text: input, ts: Date.now() };
    socket.emit('private-message', { to: `employee:${activeId}`, message: msg });
    setMessages((m) => [...m, msg]);
    setInput('');
  }

  return (
    <div className="grid grid-cols-3 h-[70vh] bg-white rounded shadow overflow-hidden">
      <div className="border-r overflow-y-auto">
        {employees.map((e) => (
          <button
            key={e.id}
            className={`block w-full text-left px-3 py-2 border-b ${activeId===e.id? 'bg-gray-100':''}`}
            onClick={() => setActiveId(e.id)}
          >
            {e.name || e.email}
          </button>
        ))}
      </div>
      <div className="col-span-2 flex flex-col">
        <div className="flex-1 p-3 overflow-y-auto space-y-2">
          {messages
            .filter((m) => !activeId || m.roomId === activeId || m.to === `employee:${activeId}`)
            .map((m, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-semibold mr-2">{m.from}:</span>
                <span>{m.text}</span>
              </div>
            ))}
        </div>
        <div className="p-3 border-t flex gap-2">
          <input className="flex-1 border rounded px-3 py-2" value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Type message" />
          <button onClick={send} className="bg-blue-600 text-white rounded px-4">Send</button>
        </div>
      </div>
    </div>
  );
}


