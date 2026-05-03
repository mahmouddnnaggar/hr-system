# HR Evaluation Exam Backend

Node.js API for the HR Evaluation Exam System.

For the complete full-stack setup guide, see the root `README.md`.

## Features

- Email/password login with bcrypt password hashes and JWT tokens.
- HR and employee registration with email OTP verification.
- Admin approval and rejection for pending HR/employee accounts.
- Admin exam creation/removal and user removal.
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
- nodemailer
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
OTP_EXPIRES_MINUTES=10
```

Optional:

```env
DB_PORT=3306
MYSQL_URL=mysql://user:password@host:3306/database_name
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

If `MYSQL_URL` is set, it takes priority over the separate `DB_*` variables.

If SMTP is not configured, OTP codes are printed in the backend terminal as `[DEV OTP] email: code`.

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
2. The backend creates the user as `PENDING` and `is_email_verified: false`.
3. An OTP is generated, hashed, stored with an expiry time, and sent by email.
4. `POST /api/auth/verify-otp` verifies the OTP, clears it, and marks email as verified.
5. The user still cannot log in until an admin approves the account.
6. Login returns a JWT only for approved, verified users.

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
| `POST` | `/auth/register` | Register an HR or employee and send OTP. |
| `POST` | `/auth/verify-otp` | Verify the OTP and mark email as verified. |
| `POST` | `/auth/resend-otp` | Send a new OTP for an unverified account. |
| `POST` | `/auth/login` | Login with email and password. |

### Admin

Requires an approved admin JWT.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/admin/pending-users` | List pending HR and employee accounts. |
| `GET` | `/admin/users` | List all users. |
| `PATCH` | `/admin/users/:userId/approve` | Approve a user. |
| `PATCH` | `/admin/users/:userId/reject` | Reject a user. |
| `DELETE` | `/admin/users/:userId` | Remove a user and related records. |
| `GET` | `/admin/exams` | List exams. |
| `POST` | `/admin/exams` | Create an exam from form input. |
| `POST` | `/admin/exams/upload-excel` | Create an exam from an Excel file. |
| `DELETE` | `/admin/exams/:examId` | Remove an exam and related records. |

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

Verify OTP:

```http
POST /api/auth/verify-otp
Content-Type: application/json
```

```json
{
  "email": "new.employee@test.com",
  "otp": "123456"
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
- Configure SMTP in production so OTP messages are sent by email instead of logged to the terminal.
- For production, move evidence uploads to persistent object storage and consider rate limiting for login and OTP routes.
