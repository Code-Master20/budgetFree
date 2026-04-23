import { motion as Motion } from "framer-motion";

export default function LoadingScreen({
  label = "Preparing your experience...",
}) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <div className="glass-panel flex w-full max-w-md flex-col items-center gap-4 rounded-[28px] px-6 py-8 text-center">
        <Motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, ease: "linear", repeat: Infinity }}
          className="h-12 w-12 rounded-full border-4 border-emerald-900/10 border-t-emerald-700"
        />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">
            BudgetFree
          </p>
          <p className="mt-2 text-sm text-slate-600">{label}</p>
        </div>
      </div>
    </div>
  );
}
