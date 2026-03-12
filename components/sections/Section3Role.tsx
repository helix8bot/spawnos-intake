"use client";

import { useState } from "react";
import NavButtons from "../NavButtons";
import OptionCard from "../OptionCard";
import type { IntakeData } from "@/lib/types";

const ROLES = [
  { label: "Founder / CEO", icon: "🚀" },
  { label: "Marketing Lead", icon: "📣" },
  { label: "Sales Lead", icon: "💼" },
  { label: "Operations Manager", icon: "⚙️" },
  { label: "Customer Success", icon: "🤝" },
  { label: "Content Creator", icon: "✍️" },
  { label: "Developer", icon: "💻" },
  { label: "Other", icon: "✨" },
];

const TIME_SINKS = [
  "Email management",
  "Social media posting",
  "Writing content / copy",
  "Lead research / prospecting",
  "Customer support / follow-ups",
  "Reporting & analytics",
  "Scheduling & admin",
  "Hiring / HR tasks",
  "Cold outreach",
  "SEO / blog content",
  "Invoicing / bookkeeping",
  "Technical integrations",
];

interface Props {
  data: IntakeData;
  onChange: (partial: Partial<IntakeData["role"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Section3Role({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleTimeSink(sink: string) {
    const current = data.role.timeSinks;
    const updated = current.includes(sink)
      ? current.filter((s) => s !== sink)
      : [...current, sink];
    onChange({ timeSinks: updated });
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!data.role.mainRole) errs.mainRole = "Please select your primary role";
    if (data.role.timeSinks.length === 0) errs.timeSinks = "Select at least one time sink";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validate()) onNext();
  }

  return (
    <div className="flex flex-col flex-1 px-4 pt-20 pb-8 max-w-lg mx-auto w-full">
      <div className="flex-1">
        <div className="mb-2 text-teal-400 text-xs font-semibold uppercase tracking-widest">Section 3 of 7</div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">What&apos;s your role and where does your time go?</h1>
        <p className="text-white/50 text-sm mb-8">
          Be honest — these are exactly the areas your AI team will take off your plate.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Your primary role <span className="text-teal-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(({ label, icon }) => (
                <OptionCard
                  key={label}
                  label={label}
                  icon={icon}
                  selected={data.role.mainRole === label}
                  onClick={() => onChange({ mainRole: label })}
                />
              ))}
            </div>
            {errors.mainRole && <p className="text-red-400 text-xs mt-1">{errors.mainRole}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Where does your time disappear? <span className="text-teal-400">*</span>
            </label>
            <p className="text-white/40 text-xs mb-2">Select all that apply</p>
            <div className="grid grid-cols-1 gap-2">
              {TIME_SINKS.map((sink) => (
                <OptionCard
                  key={sink}
                  label={sink}
                  selected={data.role.timeSinks.includes(sink)}
                  onClick={() => toggleTimeSink(sink)}
                  multiSelect
                />
              ))}
            </div>
            {errors.timeSinks && <p className="text-red-400 text-xs mt-1">{errors.timeSinks}</p>}
          </div>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={handleNext} />
    </div>
  );
}
