const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes/auth.routes');
const adminRoutes = require('./routes/adminRoutes/admin.routes');
const hrRoutes = require('./routes/hrRoutes/hr.routes');
const employeeRoutes = require('./routes/employeeRoutes/employee.routes');
const errorMiddleware = require('./middlewares/errorHandleMiddleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'HR Evaluation Exam System API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/employee', employeeRoutes);

app.use(errorMiddleware);

module.exports = app;
