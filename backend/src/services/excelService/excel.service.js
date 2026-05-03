const xlsx = require('xlsx');

const readExamFile = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  return xlsx.utils.sheet_to_json(sheet);
};

const readExamBuffer = (buffer) => {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  return xlsx.utils.sheet_to_json(sheet);
};

module.exports = {
  readExamFile,
  readExamBuffer
};
