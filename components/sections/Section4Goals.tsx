"use client";

import { useState } from "react";
import NavButtons from "../NavButtons";
import OptionCard from "../OptionCard";
import type { IntakeData } from "@/lib/types";

const SIX_MONTH_GOALS = [
  "Double revenue",
  "Launch a new product / service",
  "Reduce my working hours",
  "Build a repeatable sales process",
  "Grow my email list to 10k+",
  "Hire and scale the team",
  "Improve customer retention",
  "Expand to new markets",
  "Automate 80%+ of operations",
  "Raise funding / close investors",
  "Improve brand awareness",
  "Build a content engine",
];

interface Props {
  data: IntakeData;
  onChange: (partial: Partial<IntakeData["goals"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Section4Goals({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleGoal(goal: string) {
    const current = data.goals.sixMonthGoals;
    const updated = current.includes(goal)
      ? current.filter((g) => g !== goal)
      : [...current, goal];
    onChange({ sixMonthGoals: updated });
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!data.goals.biggestProblem.trim()) errs.biggestProblem = "Please share your biggest problem";
    if (data.goals.sixMonthGoals.length === 0) errs.goals = "Select at least one goal";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validate()) onNext();
  }

  return (
    <div className="flex flex-col flex-1 px-4 pt-20 pb-8 max-w-lg mx-auto w-full">
      <div className="flex-1">
        <div className="mb-2 text-teal-400 text-xs font-semibold uppercase tracking-widest">Section 4 of 7</div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">What are you trying to solve?</h1>
        <p className="text-white/50 text-sm mb-8">
          The clearer you are, the more precisely we can deploy your AI team.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              What&apos;s your single biggest business problem right now? <span className="text-teal-400">*</span>
            </label>
            <textarea
              value={data.goals.biggestProblem}
              onChange={(e) => onChange({ biggestProblem: e.target.value })}
              placeholder="e.g. I can't keep up with leads and follow-ups are falling through the cracks..."
              rows={4}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm resize-none transition-colors focus:border-teal-500"
            />
            {errors.biggestProblem && <p className="text-red-400 text-xs mt-1">{errors.biggestProblem}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Your 6-month goals <span className="text-teal-400">*</span>
            </label>
            <p className="text-white/40 text-xs mb-2">Pick everything that applies</p>
            <div className="grid grid-cols-1 gap-2">
              {SIX_MONTH_GOALS.map((goal) => (
                <OptionCard
                  key={goal}
                  label={goal}
                  selected={data.goals.sixMonthGoals.includes(goal)}
                  onClick={() => toggleGoal(goal)}
                  multiSelect
                />
              ))}
            </div>
            {errors.goals && <p className="text-red-400 text-xs mt-1">{errors.goals}</p>}
          </div>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={handleNext} />
    </div>
  );
}
