"use client";

import { motion } from "framer-motion";

interface OptionCardProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  multiSelect?: boolean;
  icon?: string;
}

export default function OptionCard({ label, selected, onClick, multiSelect, icon }: OptionCardProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-medium
        ${selected
          ? "border-teal-500 bg-teal-500/15 text-white"
          : "border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white"
        }
      `}
    >
      <span className="flex items-center gap-3">
        {multiSelect && (
          <span className={`
            flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all
            ${selected ? "border-teal-500 bg-teal-500" : "border-white/30"}
          `}>
            {selected && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
        )}
        {!multiSelect && (
          <span className={`
            flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
            ${selected ? "border-teal-500" : "border-white/30"}
          `}>
            {selected && <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />}
          </span>
        )}
        {icon && <span className="text-base">{icon}</span>}
        <span>{label}</span>
      </span>
    </motion.button>
  );
}
