import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
app.use(cors({ origin: ['http://localhost:3000'], credentials: true }));
app.use(express.json());

// In-memory stores for demonstration only
const phoneToCode = new Map();
const employees = new Map();
const tasks = new Map();
let employeeAutoId = 1;
let taskAutoId = 1;

// Auth: request/verify code (Owner)
app.post('/api/auth/request-code', (req, res) => {
  const { phoneNumber } = req.body || {};
  if (!phoneNumber) return res.status(400).json({ message: 'phoneNumber is required' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  phoneToCode.set(phoneNumber, code);
  console.log(`[mock] send code ${code} to ${phoneNumber}`);
  return res.json({ ok: true });
});

app.post('/api/auth/verify-code', (req, res) => {
  const { phoneNumber, accessCode } = req.body || {};
  if (!phoneNumber || !accessCode) return res.status(400).json({ message: 'Invalid payload' });
  const stored = phoneToCode.get(phoneNumber);
  if (stored && stored === accessCode) {
    return res.json({ ok: true, role: 'owner', phoneNumber, token: 'mock-owner-token' });
  }
  return res.status(401).json({ message: 'Invalid access code' });
});

// Auth: employee setup and login
app.post('/api/auth/employee-setup', (req, res) => {
  const { token, username, password } = req.body || {};
  if (!token || !username || !password) return res.status(400).json({ message: 'Invalid payload' });
  // For mock, accept any token and create employee
  const id = employeeAutoId++;
  const emp = { id, name: username, email: `${username}@example.com`, phone: '', role: 'employee', schedule: '' };
  employees.set(id, { ...emp, username, password });
  return res.json({ ok: true, id });
});

app.post('/api/auth/employee-login', (req, res) => {
  const { username, password } = req.body || {};
  for (const [, e] of employees) {
    if (e.username === username && e.password === password) {
      return res.json({ id: e.id, username, role: 'employee', token: 'mock-emp-token' });
    }
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

// Employees CRUD
app.get('/api/employees', (_req, res) => {
  return res.json(Array.from(employees.values()).map(({ password, ...rest }) => rest));
});

app.post('/api/employees', (req, res) => {
  const { name, phone, email, role = 'employee', schedule = '' } = req.body || {};
  if (!name || !email) return res.status(400).json({ message: 'name and email are required' });
  const id = employeeAutoId++;
  const emp = { id, name, phone: phone || '', email, role, schedule };
  employees.set(id, emp);
  console.log(`[mock] send invitation email to ${email}`);
  return res.json(emp);
});

app.put('/api/employees/:id', (req, res) => {
  const id = Number(req.params.id);
  const prev = employees.get(id);
  if (!prev) return res.status(404).json({ message: 'Not found' });
  const next = { ...prev, ...req.body };
  employees.set(id, next);
  return res.json(next);
});

app.delete('/api/employees/:id', (req, res) => {
  const id = Number(req.params.id);
  employees.delete(id);
  return res.json({ ok: true });
});

// Tasks
app.get('/api/employees/:id/tasks', (req, res) => {
  const id = Number(req.params.id);
  const list = tasks.get(id) || [];
  return res.json(list);
});

app.post('/api/tasks', (req, res) => {
  const { employeeId, title } = req.body || {};
  if (!employeeId || !title) return res.status(400).json({ message: 'Invalid payload' });
  const list = tasks.get(employeeId) || [];
  const item = { id: taskAutoId++, title, status: 'open' };
  list.push(item);
  tasks.set(employeeId, list);
  return res.json(item);
});

app.post('/api/tasks/:id/done', (req, res) => {
  const tid = Number(req.params.id);
  for (const [empId, list] of tasks) {
    const idx = list.findIndex((t) => t.id === tid);
    if (idx >= 0) {
      list[idx].status = 'done';
      tasks.set(empId, list);
      return res.json(list[idx]);
    }
  }
  return res.status(404).json({ message: 'Not found' });
});

// Profile
app.get('/api/me', (_req, res) => {
  // For demo, return a fixed profile
  return res.json({ name: 'John Employee', phone: '+100000000', email: 'john@example.com' });
});

app.put('/api/me', (req, res) => {
  // Accept updates and return them
  return res.json({ ok: true, ...req.body });
});

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: ['http://localhost:3000'] },
});

io.on('connection', (socket) => {
  socket.on('join', ({ room }) => {
    if (room) socket.join(room);
  });

  socket.on('private-message', ({ to, message }) => {
    if (to) io.to(to).emit('message', message);
  });
});

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Mock API running on http://localhost:${PORT}`);
});


