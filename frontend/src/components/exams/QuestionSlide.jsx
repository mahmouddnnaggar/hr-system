import { AnimatePresence, motion } from "framer-motion";
import ImageUpload from "../forms/ImageUpload";
import { answerScores, cn } from "../../lib/utils";

export default function QuestionSlide({
  question,
  step,
  selectedAnswer,
  imagePreview,
  onSelectAnswer,
  onFileChange,
  errors,
}) {
  return (
    <div className="grid grid-cols-1 gap-8 pb-12 lg:grid-cols-2 lg:gap-16">
      <AnimatePresence mode="wait">
        <motion.div
          key={question?.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          className="flex flex-col justify-center"
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase text-blue-700">
                Metric Unit {String(step + 1).padStart(2, "0")}
              </div>
              <h3 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">{question?.question_text}</h3>
              <p className="text-sm font-medium text-slate-500">
                Please assess the compliance status for this criterion based on direct evidence.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase text-slate-400">Select Fulfillment Status</p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {["NO", "PARTIAL", "YES"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onSelectAnswer(option)}
                    className={cn(
                      "relative flex min-h-24 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl border-2 bg-white px-2 py-6 font-bold transition-all",
                      selectedAnswer === option
                        ? "border-blue-600 text-blue-700 shadow-xl shadow-blue-50"
                        : "border-slate-100 text-slate-400 hover:border-slate-200",
                    )}
                  >
                    <span className="text-sm">{option}</span>
                    <span className={cn("text-[9px] uppercase", selectedAnswer === option ? "text-blue-500/60" : "text-slate-300")}>
                      {answerScores[option]} Points
                    </span>
                    {selectedAnswer === option ? <motion.div layoutId="active-answer" className="absolute inset-x-0 bottom-0 h-1 bg-blue-600" /> : null}
                  </button>
                ))}
              </div>
              {errors?.selected_answer ? <p className="text-xs font-medium text-rose-600">{errors.selected_answer}</p> : null}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <ImageUpload previewUrl={imagePreview} onFileChange={onFileChange} error={errors?.image} />
      </div>
    </div>
  );
}
