"use client";

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-white/10">
        <div
          className="h-full bg-teal-500 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between items-center px-4 py-2 text-xs text-white/40">
        <span>Step {current} of {total}</span>
        <span>{pct}% complete</span>
      </div>
    </div>
  );
}
