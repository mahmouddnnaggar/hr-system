import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/common/Button";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingState from "../components/common/LoadingState";
import ProgressBar from "../components/exams/ProgressBar";
import QuestionSlide from "../components/exams/QuestionSlide";
import { useAuth } from "../context/AuthContext";
import { useExam } from "../context/ExamContext";
import useAsyncData from "../hooks/useAsyncData";
import { examAnswerSchema } from "../lib/validations/examAnswer";
import { getErrorMessage } from "../lib/utils";
import { employeeApi } from "../services/employeeApi";

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

export default function ExamSlides() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { answers, startExamSession, updateAnswer, clearExam } = useExam();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { data: assignment, loading, error } = useAsyncData(() => employeeApi.startAssignment(assignmentId), [assignmentId]);

  const questions = useMemo(() => assignment?.exam?.questions || [], [assignment]);
  const currentQuestion = questions[step];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  const {
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(examAnswerSchema),
    defaultValues: {
      selected_answer: undefined,
      image: null,
    },
  });

  useEffect(() => {
    if (assignment) {
      startExamSession(assignment);
    }
  }, [assignment, startExamSession]);

  useEffect(() => {
    reset({
      selected_answer: currentAnswer?.selected_answer,
      image: currentAnswer?.image || currentAnswer?.imageUrl || null,
    });
  }, [currentQuestion?.id, currentAnswer?.selected_answer, currentAnswer?.image, currentAnswer?.imageUrl, reset]);

  const handleSelectAnswer = (selected_answer) => {
    setValue("selected_answer", selected_answer, { shouldValidate: true });
    updateAnswer(currentQuestion.id, { selected_answer });
  };

  const handleFileChange = async (file) => {
    const previewUrl = await fileToDataUrl(file);
    setValue("image", file, { shouldValidate: true });
    updateAnswer(currentQuestion.id, { image: file, imageUrl: previewUrl, submitted: false });
  };

  const saveCurrentAnswer = async () => {
    const valid = await trigger();
    if (!valid || !currentQuestion) return null;

    const answer = answers[currentQuestion.id];
    if (!answer?.selected_answer || (!answer.image && !answer.imageUrl)) return null;

    if (!answer.image && answer.imageUrl && answer.submitted) {
      return answer;
    }

    if (!answer.image) {
      throw new Error("Image proof is required");
    }

    const response = await employeeApi.submitAnswer({
      assignment_id: assignment.id,
      question_id: currentQuestion.id,
      selected_answer: answer.selected_answer,
      image: answer.image,
    });

    const savedAnswer = {
      ...answer,
      score: response.answer.score,
      imageUrl: response.answer.image_url,
      submitted: true,
    };

    updateAnswer(currentQuestion.id, savedAnswer);
    return savedAnswer;
  };

  const handleNext = async () => {
    try {
      setSubmitting(true);
      setSubmitError("");
      const savedAnswer = await saveCurrentAnswer();
      if (!savedAnswer) return;

      if (step < questions.length - 1) {
        setStep((current) => current + 1);
        return;
      }

      const finalAnswers = {
        ...answers,
        [currentQuestion.id]: savedAnswer,
      };

      const missing = questions.find((question) => {
        const answer = finalAnswers[question.id];
        return !answer?.selected_answer || (!answer.image && !answer.imageUrl);
      });

      if (missing) {
        setSubmitError("Please answer all questions before finishing.");
        return;
      }

      const finishResponse = await employeeApi.finishExam(assignment.id);
      clearExam();
      navigate(`/employee/results/${currentUser.id}/${finishResponse.result.id}`);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((current) => current - 1);
  };

  if (loading) return <LoadingState label="Loading exam session" />;
  if (error) return <ErrorMessage message={error} />;
  if (!currentQuestion) return <ErrorMessage message="No questions found for this exam." />;

  const fieldErrors = {
    selected_answer: errors.selected_answer?.message,
    image: errors.image?.message,
  };

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col pt-4 sm:pt-10">
      <div className="mb-8 sm:mb-12">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase text-slate-400">Verification Session</p>
            <h2 className="text-xl font-bold text-slate-900">{assignment.exam?.title}</h2>
          </div>
          <p className="text-sm font-bold uppercase text-slate-400">
            Metric <span className="text-blue-600">{step + 1}</span> <span className="mx-1">/</span> {questions.length}
          </p>
        </div>
        <ProgressBar current={step + 1} total={questions.length} />
      </div>

      <QuestionSlide
        question={currentQuestion}
        step={step}
        total={questions.length}
        selectedAnswer={currentAnswer?.selected_answer}
        imagePreview={currentAnswer?.imageUrl}
        onSelectAnswer={handleSelectAnswer}
        onFileChange={handleFileChange}
        errors={fieldErrors}
      />

      <ErrorMessage message={submitError} />

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Button variant="outline" onClick={handleBack} disabled={step === 0} className="sm:px-10">
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={submitting}
          variant={step === questions.length - 1 ? "success" : "primary"}
          className="flex-grow uppercase"
        >
          {submitting ? "Saving..." : step === questions.length - 1 ? "Commit Findings" : "Confirm Criteria"}
        </Button>
      </div>
    </div>
  );
}
