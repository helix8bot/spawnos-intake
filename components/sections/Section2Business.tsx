"use client";

import { useState } from "react";
import NavButtons from "../NavButtons";
import OptionCard from "../OptionCard";
import type { IntakeData } from "@/lib/types";

const INDUSTRIES = [
  { label: "E-commerce", icon: "🛒" },
  { label: "SaaS / Software", icon: "💻" },
  { label: "Agency / Consulting", icon: "🏢" },
  { label: "Health & Wellness", icon: "🌿" },
  { label: "Real Estate", icon: "🏠" },
  { label: "Finance / Fintech", icon: "📈" },
  { label: "Education", icon: "🎓" },
  { label: "Media / Publishing", icon: "📰" },
  { label: "Retail / CPG", icon: "🛍️" },
  { label: "Other", icon: "✨" },
];

const TEAM_SIZES = ["Just me", "2–5", "6–15", "16–50", "50+"];

interface Props {
  data: IntakeData;
  onChange: (partial: Partial<IntakeData["business"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Section2Business({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!data.business.name.trim()) errs.name = "Business name is required";
    if (!data.business.industry) errs.industry = "Please select your industry";
    if (!data.business.teamSize) errs.teamSize = "Please select team size";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validate()) onNext();
  }

  return (
    <div className="flex flex-col flex-1 px-4 pt-20 pb-8 max-w-lg mx-auto w-full">
      <div className="flex-1">
        <div className="mb-2 text-teal-400 text-xs font-semibold uppercase tracking-widest">Section 2 of 7</div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Tell us about your business.</h1>
        <p className="text-white/50 text-sm mb-8">
          This helps us map the right AI agents to your exact context.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Business name <span className="text-teal-400">*</span>
            </label>
            <input
              type="text"
              value={data.business.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="e.g. Momentum Labs"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm transition-colors focus:border-teal-500"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Industry <span className="text-teal-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {INDUSTRIES.map(({ label, icon }) => (
                <OptionCard
                  key={label}
                  label={label}
                  icon={icon}
                  selected={data.business.industry === label}
                  onClick={() => onChange({ industry: label })}
                />
              ))}
            </div>
            {errors.industry && <p className="text-red-400 text-xs mt-1">{errors.industry}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Brief description <span className="text-white/30 text-xs">(optional)</span>
            </label>
            <textarea
              value={data.business.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="What does your business do? What problem do you solve?"
              rows={3}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm resize-none transition-colors focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Team size <span className="text-teal-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TEAM_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChange({ teamSize: size })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    data.business.teamSize === size
                      ? "border-teal-500 bg-teal-500/15 text-white"
                      : "border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {errors.teamSize && <p className="text-red-400 text-xs mt-1">{errors.teamSize}</p>}
          </div>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={handleNext} />
    </div>
  );
}
