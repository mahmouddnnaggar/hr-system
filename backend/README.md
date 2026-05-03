# HR Evaluation Exam Backend

Node.js API for the HR Evaluation Exam System.

For the complete full-stack setup guide, see the root `README.md`.

## Features

- Email/password login with bcrypt password hashes and JWT tokens.
- HR and employee registration with admin approval.
- Admin approval and rejection for pending HR/employee accounts.
- Admin exam creation/removal and user removal.
- Audit logs for important backend actions.
- Soft delete for users and exams.
- Pagination, search, and filters on admin lists.
- Seeded admin, HR, and employee accounts.
- Excel-based exam imports from `src/data/exams`.
- HR assignment and results endpoints.
- Employee exam-taking endpoints.
- Required image evidence upload for every answer.
- Automatic final score calculation out of 5.

## Tech Stack

- Node.js
- Express
- MySQL
- Sequelize
- mysql2
- bcrypt
- jsonwebtoken
- dotenv
- cors
- multer
- xlsx
- nodemon

## Environment

Create `.env` from `.env.example`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=hr_evaluation_system
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=1d
```

Optional:

```env
DB_PORT=3306
MYSQL_URL=mysql://user:password@host:3306/database_name
ADMIN_NAME=Default Admin
ADMIN_EMAIL=mahmoudelnaggar@admin.com
ADMIN_PASSWORD=Admin123!
```

If `MYSQL_URL` is set, it takes priority over the separate `DB_*` variables.

## Setup

```bash
npm install
```

Create the MySQL database:

```sql
CREATE DATABASE hr_evaluation_system;
```

Seed the database:

```bash
npm run seed
```

The seed command resets the database and prints the default passwords:

```txt
Default admin: mahmoudelnaggar@admin.com
Default admin password: Admin123!
Demo HR/Employee password: Demo123!
```

Start the development server:

```bash
npm run dev
```

Server URL:

```txt
http://localhost:3000
```

API base URL:

```txt
http://localhost:3000/api
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with nodemon. |
| `npm start` | Start the API with Node. |
| `npm run seed` | Reset and seed the database. |
| `npm run seed:admin` | Create or update one approved admin account without resetting data. |

## Project Structure

```txt
src/
  config/          Database connection
  controllers/     Auth, HR, and employee controllers
  data/exams/      Excel exam source files
  middlewares/     Upload and error middleware
  models/          Sequelize models and associations
  routes/          API routes
  seeders/         Seed scripts
  services/        Excel and seed services
  utils/           Shared backend utilities
uploads/           Local uploaded images
```

## Auth Flow

1. HR or employee registers with `name`, `email`, `password`, and `role`.
2. The backend creates the user as `PENDING`.
3. The user cannot log in until an admin approves the account.
4. Login returns a JWT only for approved users.

Pending login response:

```txt
Your account is waiting for admin approval.
```

## Seeded Login Accounts

Admin:

```txt
mahmoudelnaggar@admin.com / Admin123!
```

HR users:

```txt
hr1@test.com / Demo123!
hr2@test.com / Demo123!
hr3@test.com / Demo123!
```

Employee users:

```txt
employee1@test.com / Demo123!
employee2@test.com / Demo123!
employee3@test.com / Demo123!
employee4@test.com / Demo123!
employee5@test.com / Demo123!
employee6@test.com / Demo123!
employee7@test.com / Demo123!
employee8@test.com / Demo123!
employee9@test.com / Demo123!
employee10@test.com / Demo123!
```

## API Overview

All endpoints are prefixed with `/api`.

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Register an HR or employee for admin approval. |
| `POST` | `/auth/login` | Login with email and password. |

### Admin

Requires an approved admin JWT.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/admin/pending-users` | List pending HR and employee accounts. |
| `GET` | `/admin/users` | List all users. |
| `PATCH` | `/admin/users/:userId/approve` | Approve a user. |
| `PATCH` | `/admin/users/:userId/reject` | Reject a user. |
| `DELETE` | `/admin/users/:userId` | Soft delete a user. |
| `GET` | `/admin/exams` | List exams. |
| `POST` | `/admin/exams` | Create an exam from form input. |
| `POST` | `/admin/exams/upload-excel` | Create an exam from an Excel file. |
| `DELETE` | `/admin/exams/:examId` | Soft delete an exam. |
| `GET` | `/admin/audit-logs` | List audit logs. |

Admin list query params:

```txt
page=1
limit=10
search=value
includeDeleted=true
```

User filters:

```txt
role=ADMIN|HR|EMPLOYEE
status=PENDING|APPROVED|REJECTED
```

Exam filters:

```txt
difficulty=EASY|MEDIUM|HARD
```

Audit log filters:

```txt
entityType=User|Exam|Assignment
action=CREATE_EXAM
```

### HR

Requires an approved HR JWT.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/hr/employees` | List employee users. |
| `GET` | `/hr/exams` | List exams. |
| `POST` | `/hr/assign-exam` | Assign an exam to an employee. |
| `GET` | `/hr/assignments` | List assignments. |
| `DELETE` | `/hr/assignments/:assignmentId` | Remove an assignment. |
| `GET` | `/hr/results` | List all results. |
| `GET` | `/hr/results/:employeeId` | List results for one employee. |

### Employee

Requires an approved employee JWT.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/employee/:employeeId/exams` | List assigned exams. |
| `GET` | `/employee/assignment/:assignmentId/start` | Load assignment questions. |
| `POST` | `/employee/submit-answer` | Submit an answer with image evidence. |
| `POST` | `/employee/finish-exam` | Complete an exam assignment. |
| `GET` | `/employee/:employeeId/results` | List employee results. |

## Request Examples

Login:

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "hr1@test.com",
  "password": "Demo123!"
}
```

Register:

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "New Employee",
  "email": "new.employee@test.com",
  "password": "Demo123!",
  "role": "EMPLOYEE"
}
```

Create exam from form input:

```http
POST /api/admin/exams
Authorization: Bearer your_admin_token
Content-Type: application/json
```

```json
{
  "title": "Work Quality Evaluation",
  "difficulty": "MEDIUM",
  "questions": [
    "Does the employee review work before submission?",
    "Does the employee follow quality standards?"
  ]
}
```

Upload exam Excel:

```http
POST /api/admin/exams/upload-excel
Authorization: Bearer your_admin_token
Content-Type: multipart/form-data
```

```txt
file: exam.xlsx
```

Excel columns:

```txt
title
difficulty
question_text
```

Allowed difficulty values are `EASY`, `MEDIUM`, and `HARD`.

List users with pagination:

```http
GET /api/admin/users?page=1&limit=10&search=ahmed&role=HR
Authorization: Bearer your_admin_token
```

List audit logs:

```http
GET /api/admin/audit-logs?page=1&limit=10&entityType=User
Authorization: Bearer your_admin_token
```

Soft delete:

```txt
DELETE /api/admin/users/:userId
DELETE /api/admin/exams/:examId
```

These routes set `deleted_at` and `deleted_by` instead of physically deleting the record.

Assign exam:

```http
POST /api/hr/assign-exam
Content-Type: application/json
```

```json
{
  "exam_id": 1,
  "employee_id": 4,
  "assigned_by": 1
}
```

Submit answer:

```http
POST /api/employee/submit-answer
Content-Type: multipart/form-data
```

```txt
assignment_id: 1
question_id: 1
selected_answer: YES
image: image file
```

Finish exam:

```http
POST /api/employee/finish-exam
Content-Type: application/json
```

```json
{
  "assignment_id": 1
}
```

## Scoring

```txt
NO = 0
PARTIAL = 1
YES = 2
```

Final result:

```txt
total_score = sum(answer scores)
max_score = number_of_questions * 2
final_score = (total_score / max_score) * 5
```

## Notes

- Uploaded images are stored in `uploads/`.
- MySQL stores image paths, not binary image data.
- Set a strong `JWT_SECRET` in production.
- For production, move evidence uploads to persistent object storage and consider rate limiting for login and registration routes.
