import { motion } from "framer-motion";

export default function StatCard({ label, value, icon: Icon, color = "text-blue-600", bg = "bg-blue-50", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className={`mb-4 w-fit rounded-lg p-2.5 ${bg} ${color}`}>
        <Icon size={20} />
      </div>
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </motion.div>
  );
}
