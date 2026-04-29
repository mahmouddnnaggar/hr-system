const scoreMap = {
  NO: 0,
  PARTIAL: 1,
  YES: 2
};

const calculateAnswerScore = (selectedAnswer) => {
  return scoreMap[selectedAnswer];
};

const calculateFinalScore = (totalScore, questionsCount) => {
  const maxScore = questionsCount * 2;

  if (!maxScore) {
    return 0;
  }

  return Number(((totalScore / maxScore) * 5).toFixed(2));
};

module.exports = {
  scoreMap,
  calculateAnswerScore,
  calculateFinalScore
};
