import StatusBadge from "../common/StatusBadge";
import { getFileUrl } from "../../lib/utils";

export default function ResultEvidenceList({ questions = [], answers = [] }) {
  return (
    <div className="space-y-12 p-5 sm:p-10 sm:space-y-16">
      {answers.map((answer, index) => {
        const question = questions.find((item) => item.id === answer.question_id);

        return (
          <div key={answer.id || answer.question_id} className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
            <div className="space-y-6 md:col-span-5">
              <div className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-xs font-bold text-slate-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-lg font-bold leading-snug text-slate-900">{question?.question_text}</p>
              </div>
              <div className="ml-12 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={answer.selected_answer} />
                  <span className="text-[10px] font-bold uppercase text-slate-400">Points Earned: {answer.score}</span>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-medium italic leading-relaxed text-slate-500">
                    Assessed as <span className="font-bold lowercase">{answer.selected_answer}</span> fulfillment.
                  </p>
                </div>
              </div>
            </div>
            <div className="md:col-span-7">
              <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 shadow-inner">
                <img src={getFileUrl(answer.image_url)} alt="Submitted evidence" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
