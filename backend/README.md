# HR Evaluation Exam System

Backend-only educational project using Node.js, Express.js, MySQL, Sequelize ORM, multer, and Excel exam imports.

## Features

- Simple email-only login for predefined users
- 3 seeded HR users and 10 seeded employee users
- 10 predefined exams imported from Excel files in `src/data/exams`
- HR users can assign exams to employees
- Employees answer each question with `NO`, `PARTIAL`, or `YES`
- Every answer requires an uploaded image proof
- Results are calculated from 5 and stored in MySQL

## Tech Stack

- Node.js
- Express.js
- MySQL
- Sequelize ORM
- mysql2
- dotenv
- cors
- multer
- xlsx
- nodemon

## Project Structure

```txt
src/
  config/
    db.js
  controllers/
    authController/
    hrController/
    employeeController/
  models/
    User/
    Exam/
    Question/
    Assignment/
    Answer/
    Result/
    index.js
  routes/
    authRoutes/
    hrRoutes/
    employeeRoutes/
  middlewares/
    upload/
    errorHandleMiddleware/
  services/
    excelService/
    seedService/
  seeders/
  data/
    exams/
  utils/
uploads/
index.js
package.json
.env.example
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a MySQL database:

```sql
CREATE DATABASE hr_evaluation_system;
```

3. Create `.env` from `.env.example`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=hr_evaluation_system
```

4. Seed the database:

```bash
npm run seed
```

The seed command resets the tables, creates users, generates/updates the Excel files, and imports exams/questions from Excel.

5. Start the server:

```bash
npm run dev
```

Server URL:

```txt
http://localhost:3000
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

## Score Rules

```txt
NO = 0
PARTIAL = 1
YES = 2
```

Final result:

```txt
total_score = sum of answer scores
max_score = number of questions * 2
final_score = (total_score / max_score) * 5
```

## Postman Examples

### Auth

#### Login

`POST /api/auth/login`

Body JSON:

```json
{
  "email": "hr1@test.com"
}
```

Response:

```json
{
  "id": 1,
  "name": "HR User 1",
  "email": "hr1@test.com",
  "role": "HR"
}
```

### HR

#### Get Employees

`GET /api/hr/employees`

#### Get Exams

`GET /api/hr/exams`

#### Assign Exam

`POST /api/hr/assign-exam`

Body JSON:

```json
{
  "exam_id": 1,
  "employee_id": 4,
  "assigned_by": 1
}
```

#### Get All Results

`GET /api/hr/results`

#### Get Results For One Employee

`GET /api/hr/results/4`

### Employee

#### Get Employee Assigned Exams

`GET /api/employee/4/exams`

#### Start Assignment

`GET /api/employee/assignment/1/start`

#### Submit Answer

`POST /api/employee/submit-answer`

Use `multipart/form-data`.

Fields:

```txt
assignment_id: 1
question_id: 1
selected_answer: YES
image: choose an image file
```

Allowed answers:

```txt
NO
PARTIAL
YES
```

#### Finish Exam

`POST /api/employee/finish-exam`

Body JSON:

```json
{
  "assignment_id": 1
}
```

The employee must submit answers with images for every question before finishing.

#### Get Employee Results

`GET /api/employee/4/results`

## Notes

- This project intentionally has no JWT, passwords, registration, frontend, Socket.io, Cloudinary, payments, or email services.
- Uploaded images are stored in the local `uploads` folder.
- MySQL stores only the image path, not binary image data.
- This is a beginner-friendly educational backend, so the code favors simple controllers and clear validation.
