require('dotenv').config();

const { sequelize } = require('./src/models');
const app = require('./src/app');
const ensureDateColumns = require('./src/utils/ensureDateColumns');

const PORT = process.env.PORT || 3000;

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
