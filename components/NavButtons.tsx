"use client";

import { motion } from "framer-motion";

interface NavButtonsProps {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  loading?: boolean;
  canGoBack?: boolean;
}

export default function NavButtons({
  onBack,
  onNext,
  nextLabel = "Continue",
  loading = false,
  canGoBack = true,
}: NavButtonsProps) {
  return (
    <div className="flex items-center justify-between gap-4 mt-8">
      {canGoBack && onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      ) : (
        <div />
      )}

      <motion.button
        type="button"
        onClick={onNext}
        disabled={loading}
        whileTap={{ scale: 0.97 }}
        className="
          flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
          bg-teal-600 hover:bg-teal-500 text-white transition-colors
          disabled:opacity-60 disabled:cursor-not-allowed
          shadow-lg shadow-teal-900/30
        "
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Submitting…
          </>
        ) : (
          <>
            {nextLabel}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </motion.button>
    </div>
  );
}
