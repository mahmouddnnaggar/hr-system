/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ExamContext = createContext(null);

export function ExamProvider({ children }) {
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [answers, setAnswers] = useState({});

  const startExamSession = useCallback((assignment) => {
    const savedAnswers = {};

    assignment?.answers?.forEach((answer) => {
      savedAnswers[answer.question_id] = {
        selected_answer: answer.selected_answer,
        score: answer.score,
        imageUrl: answer.image_url,
        submitted: true,
      };
    });

    setCurrentAssignment(assignment);
    setAnswers(savedAnswers);
  }, []);

  const updateAnswer = useCallback((questionId, answer) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: {
        ...current[questionId],
        ...answer,
        submitted: answer.submitted ?? false,
      },
    }));
  }, []);

  const clearExam = useCallback(() => {
    setCurrentAssignment(null);
    setAnswers({});
  }, []);

  const value = useMemo(
    () => ({
      currentAssignment,
      answers,
      startExamSession,
      updateAnswer,
      clearExam,
    }),
    [currentAssignment, answers, startExamSession, updateAnswer, clearExam],
  );

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExam() {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error("useExam must be used inside ExamProvider");
  }
  return context;
}
