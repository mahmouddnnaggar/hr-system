const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const examSamples = [
  {
    file: 'exam1.xlsx',
    title: 'Communication Skills Evaluation',
    difficulty: 'EASY',
    created_by: 1,
    questions: [
      'Does the employee communicate clearly with team members?',
      'Does the employee listen carefully before responding?',
      'Does the employee share updates on assigned tasks?',
      'Does the employee use professional language at work?',
      'Does the employee ask questions when requirements are unclear?'
    ]
  },
  {
    file: 'exam2.xlsx',
    title: 'Teamwork Evaluation',
    difficulty: 'EASY',
    created_by: 2,
    questions: [
      'Does the employee support teammates when needed?',
      'Does the employee participate in team discussions?',
      'Does the employee respect different opinions?',
      'Does the employee complete shared tasks on time?',
      'Does the employee help solve team problems?',
      'Does the employee accept feedback from colleagues?'
    ]
  },
  {
    file: 'exam3.xlsx',
    title: 'Time Management Evaluation',
    difficulty: 'MEDIUM',
    created_by: 3,
    questions: [
      'Does the employee prioritize important tasks?',
      'Does the employee meet task deadlines?',
      'Does the employee avoid unnecessary delays?',
      'Does the employee plan work before starting?',
      'Does the employee handle urgent tasks responsibly?',
      'Does the employee report blockers early?',
      'Does the employee balance multiple assignments effectively?'
    ]
  },
  {
    file: 'exam4.xlsx',
    title: 'Problem Solving Evaluation',
    difficulty: 'MEDIUM',
    created_by: 1,
    questions: [
      'Does the employee identify the real cause of problems?',
      'Does the employee suggest practical solutions?',
      'Does the employee stay calm when issues happen?',
      'Does the employee use available data before deciding?',
      'Does the employee ask for help at the right time?',
      'Does the employee learn from repeated problems?',
      'Does the employee test solutions before final delivery?',
      'Does the employee explain problems clearly to others?'
    ]
  },
  {
    file: 'exam5.xlsx',
    title: 'Leadership Potential Evaluation',
    difficulty: 'HARD',
    created_by: 2,
    questions: [
      'Does the employee take ownership of assigned work?',
      'Does the employee motivate others positively?',
      'Does the employee make responsible decisions?',
      'Does the employee guide less experienced teammates?',
      'Does the employee handle pressure professionally?',
      'Does the employee communicate expectations clearly?',
      'Does the employee follow up on team progress?',
      'Does the employee accept responsibility for mistakes?',
      'Does the employee look for ways to improve team outcomes?'
    ]
  },
  {
    file: 'exam6.xlsx',
    title: 'Customer Service Evaluation',
    difficulty: 'MEDIUM',
    created_by: 3,
    questions: [
      'Does the employee respond politely to customer requests?',
      'Does the employee understand customer needs correctly?',
      'Does the employee follow up until the issue is resolved?',
      'Does the employee document customer issues clearly?',
      'Does the employee stay patient with difficult customers?',
      'Does the employee offer accurate information?',
      'Does the employee escalate serious issues properly?',
      'Does the employee protect customer privacy?',
      'Does the employee represent the company professionally?',
      'Does the employee learn from customer feedback?'
    ]
  },
  {
    file: 'exam7.xlsx',
    title: 'Work Quality Evaluation',
    difficulty: 'HARD',
    created_by: 1,
    questions: [
      'Does the employee review work before submission?',
      'Does the employee follow quality standards?',
      'Does the employee reduce repeated mistakes?',
      'Does the employee deliver complete work?',
      'Does the employee pay attention to important details?'
    ]
  },
  {
    file: 'exam8.xlsx',
    title: 'Adaptability Evaluation',
    difficulty: 'MEDIUM',
    created_by: 2,
    questions: [
      'Does the employee adapt to new procedures?',
      'Does the employee accept changes positively?',
      'Does the employee learn new tools when required?',
      'Does the employee stay productive during changes?',
      'Does the employee ask useful questions about updates?',
      'Does the employee help others understand changes?'
    ]
  },
  {
    file: 'exam9.xlsx',
    title: 'Attendance and Reliability Evaluation',
    difficulty: 'EASY',
    created_by: 3,
    questions: [
      'Does the employee arrive on time?',
      'Does the employee attend scheduled meetings?',
      'Does the employee notify the team about absences early?',
      'Does the employee complete promised work?',
      'Does the employee follow company attendance rules?',
      'Does the employee respond during working hours?',
      'Does the employee maintain consistent work habits?'
    ]
  },
  {
    file: 'exam10.xlsx',
    title: 'Professional Development Evaluation',
    difficulty: 'HARD',
    created_by: 1,
    questions: [
      'Does the employee seek learning opportunities?',
      'Does the employee apply new knowledge at work?',
      'Does the employee accept coaching from managers?',
      'Does the employee set improvement goals?',
      'Does the employee track personal progress?',
      'Does the employee share useful knowledge with others?',
      'Does the employee improve after feedback?',
      'Does the employee show interest in career growth?'
    ]
  }
];

const createExamExcelFiles = () => {
  const examsDir = path.join(__dirname, '../../data/exams');

  if (!fs.existsSync(examsDir)) {
    fs.mkdirSync(examsDir, { recursive: true });
  }

  examSamples.forEach((exam) => {
    const filePath = path.join(examsDir, exam.file);
    const rows = exam.questions.map((questionText) => ({
      title: exam.title,
      difficulty: exam.difficulty,
      created_by: exam.created_by,
      question_text: questionText
    }));

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(rows);

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Questions');
    xlsx.writeFile(workbook, filePath);
  });
};

module.exports = {
  examSamples,
  createExamExcelFiles
};
