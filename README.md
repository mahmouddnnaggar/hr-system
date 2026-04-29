# HR Evaluation Exam System

A full-stack HR evaluation platform for assigning structured exams to employees, collecting image-based evidence for each answer, and calculating final scores for HR review.

The project is split into two applications:

- `backend/` - Node.js, Express, MySQL, and Sequelize API.
- `frontend/` - React, Vite, Tailwind CSS, and Axios client.

## Features

- Email-only demo login for predefined HR and employee users.
- HR dashboard for employees, exams, assignments, and results.
- HR users can assign and unassign exams for employees.
- Employees can view assigned exams, answer questions, upload image evidence, and finish exams.
- Each answer supports `NO`, `PARTIAL`, or `YES` scoring.
- Results are calculated automatically and stored in MySQL.
- Excel-based exam seeding from files in `backend/src/data/exams`.
- Uploaded answer images are stored locally in `backend/uploads` and served by the API.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, TanStack Query, Axios, Tailwind CSS 4, React Hook Form, Zod, Framer Motion, Sonner, Lucide React |
| Backend | Node.js, Express, Sequelize, MySQL, mysql2, multer, xlsx, dotenv |
| Tooling | npm, ESLint, Vercel frontend rewrites |

## Project Structure

```txt
hr-system/
  backend/
    index.js
    package.json
    .env.example
    src/
      config/          Database connection
      controllers/     Auth, HR, and employee request handlers
      data/exams/      Excel exam source files
      middlewares/     Upload and error middleware
      models/          Sequelize models and associations
      routes/          API route modules
      seeders/         Database seed scripts
      services/        Excel and seed helpers
      utils/           Shared backend utilities
    uploads/           Local uploaded evidence images
  frontend/
    package.json
    .env.example
    src/
      components/      Reusable UI and feature components
      context/         Auth and exam state providers
      hooks/           Shared React hooks
      lib/             API URL, validations, utilities, query client
      pages/           Route-level screens
      routes/          Application route tree
      services/        API client modules
```

## Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`.
- npm.
- MySQL server running locally or a hosted MySQL database.

## Environment Configuration

### Backend

Create `backend/.env` from `backend/.env.example`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=hr_evaluation_system
```

Optional variables:

```env
DB_PORT=3306
MYSQL_URL=mysql://user:password@host:3306/database_name
```

If `MYSQL_URL` is provided, the backend uses it instead of the separate `DB_*` values.

### Frontend

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
```

`VITE_API_URL` must point to the backend API base URL and should include `/api`.

For production builds, set this value in the hosting provider before building or redeploying because Vite injects `VITE_*` variables at build time.

## Local Setup

### 1. Install Dependencies

```bash
npm --prefix backend install
npm --prefix frontend install
```

### 2. Create the Database

```sql
CREATE DATABASE hr_evaluation_system;
```

### 3. Configure Environment Files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Update the database credentials in `backend/.env` if your MySQL user, password, host, or database name is different.

### 4. Seed the Database

```bash
npm --prefix backend run seed
```

The seed command resets the database tables, creates demo users, generates or updates exam Excel files, and imports exams and questions.

### 5. Run the Backend

```bash
npm --prefix backend run dev
```

Backend URL:

```txt
http://localhost:3000
```

API base URL:

```txt
http://localhost:3000/api
```

### 6. Run the Frontend

Open another terminal:

```bash
npm --prefix frontend run dev
```

Vite will print the local frontend URL, usually:

```txt
http://localhost:5173
```

## Available Scripts

### Backend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with nodemon. |
| `npm start` | Start the API with Node. |
| `npm run seed` | Reset and seed the MySQL database. |

### Frontend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint. |

## Demo Users

### HR Users

```txt
hr1@test.com
hr2@test.com
hr3@test.com
```

### Employee Users

```txt
employee1@test.com
employee2@test.com
employee3@test.com
employee4@test.com
employee5@test.com
employee6@test.com
employee7@test.com
employee8@test.com
employee9@test.com
employee10@test.com
```

The demo login uses email only. There are no passwords or JWT tokens in this educational version.

## API Overview

All endpoints are prefixed with `/api`.

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/login` | Login by seeded user email. |

### HR

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/hr/employees` | List employee users. |
| `GET` | `/hr/exams` | List available exams. |
| `POST` | `/hr/assign-exam` | Assign an exam to an employee. |
| `GET` | `/hr/assignments` | List exam assignments. |
| `DELETE` | `/hr/assignments/:assignmentId` | Unassign an exam. |
| `GET` | `/hr/results` | List all results. |
| `GET` | `/hr/results/:employeeId` | List results for one employee. |

### Employee

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/employee/:employeeId/exams` | List assigned exams for an employee. |
| `GET` | `/employee/assignment/:assignmentId/start` | Load exam questions for an assignment. |
| `POST` | `/employee/submit-answer` | Submit an answer with image evidence using `multipart/form-data`. |
| `POST` | `/employee/finish-exam` | Complete an assignment and generate its result. |
| `GET` | `/employee/:employeeId/results` | List employee results. |

### Submit Answer Form Data

```txt
assignment_id: 1
question_id: 1
selected_answer: YES
image: image file
```

Allowed values for `selected_answer`:

```txt
NO
PARTIAL
YES
```

## Scoring

```txt
NO = 0
PARTIAL = 1
YES = 2
```

Final score:

```txt
total_score = sum(answer scores)
max_score = number_of_questions * 2
final_score = (total_score / max_score) * 5
```

## Deployment Notes

### Frontend

- The frontend includes `frontend/vercel.json` to rewrite all routes to `index.html` for React Router.
- Set `VITE_API_URL` in Vercel or your hosting provider to the deployed backend URL, including `/api`.
- Rebuild after changing `VITE_API_URL`.

### Backend

- Deploy the backend to a Node.js hosting environment with MySQL access.
- Set either `MYSQL_URL` or all required `DB_*` variables.
- Ensure the runtime can write to `uploads/` if you keep local file uploads.
- For production, consider persistent object storage for uploaded evidence images instead of local disk.

## Troubleshooting

| Issue | Fix |
| --- | --- |
| Frontend cannot reach API | Confirm `frontend/.env` has `VITE_API_URL=http://localhost:3000/api` and restart Vite. |
| Backend cannot connect to MySQL | Check MySQL is running and verify `backend/.env` credentials. |
| No demo data appears | Run `npm run seed` inside `backend/`. |
| Uploaded images do not display | Make sure the backend is running and that files exist in `backend/uploads`. |
| Route refresh fails in production frontend | Confirm the hosting provider rewrites all frontend routes to `index.html`. |

## License

This project is licensed under the ISC license.
