Real-Time Employee Task Management Tool (Frontend)
=================================================

Overview
--------
Frontend for a real-time employee task management tool. Owners authenticate with phone + access code, manage employees (CRUD, schedules, tasks) and chat with employees in real-time. Employees set up credentials from email, log in, view/complete tasks, chat with the owner, and edit their profile.

Tech Stack
----------
- React (Create React App)
- Tailwind CSS
- React Router DOM
- Axios
- socket.io-client
- React Toastify

Roles & Features
----------------

Owner
- Login via phone number + 6-digit access code (2-step)
- Manage employees: list, add, edit, delete
- Set work schedules (hours/days)
- Assign tasks to employees
- Real-time chat with employees

Employee
- Account setup via emailed verification link (username/password)
- Login with credentials
- View assigned tasks and mark done
- Real-time chat with owner
- Edit profile (name, phone, email)

Project Structure (frontend_web)
--------------------------------
- `src/pages/Login.js` – 2-step owner login (phone → code)
- `src/pages/OwnerDashboard.js` – employee CRUD, schedule, task assign
- `src/pages/OwnerChat.js` – owner chat with employee list
- `src/pages/EmployeeDashboard.js` – tasks + chat for employees
- `src/pages/EmployeeSetup.js` – setup username/password via token
- `src/pages/EmployeeLogin.js` – employee credential login
- `src/pages/EmployeeProfile.js` – profile edit
- `src/context/AuthContext.js` – auth state and actions
- `src/services/api.js` – axios instance and API wrappers
- `src/App.js` – routes and guards
- `tailwind.config.js`, `postcss.config.js`, `src/index.css` – Tailwind

Environment
-----------
Create `.env` in `frontend_web` with:

```
REACT_APP_API_BASE_URL=http://localhost:4000/api
REACT_APP_SOCKET_URL=http://localhost:4000
```

Setup & Run
-----------
1) Mock API (optional for local testing)

```
cd mock_api
npm install
npm start
```

This starts an Express + Socket.IO mock on http://localhost:4000 implementing:
- POST `/api/auth/request-code`
- POST `/api/auth/verify-code`
- POST `/api/auth/employee-setup`
- POST `/api/auth/employee-login`
- GET/POST/PUT/DELETE `/api/employees`
- GET `/api/employees/:id/tasks`
- POST `/api/tasks` and `/api/tasks/:id/done`
- GET/PUT `/api/me`

2) Frontend

```
cd frontend_web
npm install
npm start
```

Authentication Flows
--------------------

Owner (phone + code)
1. Enter phone → frontend calls `POST /auth/request-code` → backend saves + sends 6-digit SMS code.
2. Enter code → frontend calls `POST /auth/verify-code`.
3. On success, user saved to localStorage and redirect to `/owner`.

Employee (setup + login)
1. Owner creates employee → backend emails verification link `.../employee-setup?token=...`.
2. Employee sets username/password (stored hashed by backend).
3. Employee logs in on `/employee-login` → token/user saved → redirect to `/employee`.

Real-time Chat
--------------
- socket.io-client connects to `REACT_APP_SOCKET_URL`.
- Employees join a room (e.g., `employee:{id}` or phone) and receive messages.
- Owner sends private messages to the selected employee room.

Security Notes
--------------
- Use HTTPS in production.
- Backend should hash passwords and issue JWTs.
- Axios attaches `Authorization: Bearer <token>` if present in localStorage.
