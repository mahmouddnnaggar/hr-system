const multer = require('multer');
const path = require('path');

const allowedExtensions = ['.xlsx', '.xls'];

const excelUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(extension)) {
      cb(null, true);
      return;
    }

    cb(new Error('Only Excel files are allowed'), false);
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = excelUpload;
