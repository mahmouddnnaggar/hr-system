const path = require('path');
const { Exam, Question } = require('../models');
const { readExamFile } = require('../services/excelService/excel.service');

const seedExamsFromExcel = async () => {
  const examsDir = path.join(__dirname, '../data/exams');

  for (let i = 1; i <= 10; i += 1) {
    const filePath = path.join(examsDir, `exam${i}.xlsx`);
    const rows = readExamFile(filePath);

    if (!rows.length) {
      throw new Error(`exam${i}.xlsx does not contain questions`);
    }

    const firstRow = rows[0];
    const exam = await Exam.create({
      title: firstRow.title,
      difficulty: firstRow.difficulty,
      questions_count: rows.length,
      created_by: firstRow.created_by
    });

    const questions = rows.map((row) => ({
      exam_id: exam.id,
      question_text: row.question_text
    }));

    await Question.bulkCreate(questions);
  }

  console.log('Exams and questions seeded from Excel files successfully');
};

module.exports = seedExamsFromExcel;
