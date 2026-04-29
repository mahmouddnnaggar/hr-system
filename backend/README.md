# HR Evaluation Exam Backend

Node.js API for the HR Evaluation Exam System.

For the complete full-stack setup guide, see the root `README.md`.

## Features

- Email-only demo login for predefined users.
- Seeded HR and employee accounts.
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
```

Optional:

```env
DB_PORT=3306
MYSQL_URL=mysql://user:password@host:3306/database_name
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

## Seeded Login Emails

HR users:

```txt
hr1@test.com
hr2@test.com
hr3@test.com
```

Employee users:

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
| `GET` | `/hr/exams` | List exams. |
| `POST` | `/hr/assign-exam` | Assign an exam to an employee. |
| `GET` | `/hr/assignments` | List assignments. |
| `DELETE` | `/hr/assignments/:assignmentId` | Remove an assignment. |
| `GET` | `/hr/results` | List all results. |
| `GET` | `/hr/results/:employeeId` | List results for one employee. |

### Employee

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
  "email": "hr1@test.com"
}
```

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
- The current demo authentication model has no passwords, registration, or JWT tokens.
- For production, move evidence uploads to persistent object storage and add a stronger authentication model.
