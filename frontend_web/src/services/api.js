import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth:user');
  if (stored) {
    const user = JSON.parse(stored);
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

// Auth endpoints
export const AuthAPI = {
  requestCode: (phoneNumber) => api.post('/auth/request-code', { phoneNumber }),
  verifyCode: (phoneNumber, accessCode) => api.post('/auth/verify-code', { phoneNumber, accessCode }),
  employeeSetup: (payload) => api.post('/auth/employee-setup', payload),
  employeeLogin: (payload) => api.post('/auth/employee-login', payload),
};

// Employees CRUD
export const EmployeesAPI = {
  list: () => api.get('/employees'),
  create: (payload) => api.post('/employees', payload),
  update: (id, payload) => api.put(`/employees/${id}`, payload),
  remove: (id) => api.delete(`/employees/${id}`),
};

// Tasks
export const TasksAPI = {
  listByEmployee: (employeeId) => api.get(`/employees/${employeeId}/tasks`),
  assign: (payload) => api.post('/tasks', payload),
  markDone: (taskId) => api.post(`/tasks/${taskId}/done`),
};

// Profiles
export const ProfileAPI = {
  me: () => api.get('/me'),
  updateMe: (payload) => api.put('/me', payload),
};



