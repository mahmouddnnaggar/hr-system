import { motion } from "framer-motion";

export default function ProgressBar({ current, total }) {
  const percent = total ? (current / total) * 100 : 0;

  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
      <motion.div animate={{ width: `${percent}%` }} className="h-full bg-blue-600 shadow-sm" />
    </div>
  );
}
