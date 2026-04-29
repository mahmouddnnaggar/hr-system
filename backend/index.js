const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./src/models');
const authRoutes = require('./src/routes/authRoutes/auth.routes');
const hrRoutes = require('./src/routes/hrRoutes/hr.routes');
const employeeRoutes = require('./src/routes/employeeRoutes/employee.routes');
const errorMiddleware = require('./src/middlewares/errorHandleMiddleware/error.middleware');
const ensureDateColumns = require('./src/utils/ensureDateColumns');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'HR Evaluation Exam System API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/employee', employeeRoutes);

app.use(errorMiddleware);

sequelize
  .authenticate()
  .then(async () => {
    await ensureDateColumns(sequelize);
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to database:', error.message);
  });
