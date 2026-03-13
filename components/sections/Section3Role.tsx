"use client";

import { useState } from "react";
import NavButtons from "../NavButtons";
import OptionCard from "../OptionCard";
import type { IntakeData } from "@/lib/types";

const ROLES = [
  { label: "Founder / CEO", icon: "🚀" },
  { label: "Founder-operator", icon: "🧠" },
  { label: "COO / Head of Operations", icon: "⚙️" },
  { label: "Sales-led founder", icon: "💼" },
  { label: "Delivery-led founder", icon: "📦" },
  { label: "I wear multiple hats", icon: "✨" },
];

const BOTTLENECKS = [
  "Communication overload",
  "Follow-up leakage",
  "Reporting burden",
  "Delegation friction",
  "Tool sprawl",
  "Customer support drag",
];

interface Props {
  data: IntakeData;
  onChange: (partial: Partial<IntakeData["founder"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Section3Role({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!data.founder.primaryRole) errs.primaryRole = "Please select your primary role";
    if (!data.founder.biggestBottleneck) errs.biggestBottleneck = "Select the biggest bottleneck";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validate()) onNext();
  }

  return (
    <div className="flex flex-col flex-1 px-4 pt-20 pb-8 max-w-lg mx-auto w-full">
      <div className="flex-1">
        <div className="mb-2 text-teal-400 text-xs font-semibold uppercase tracking-widest">Founder bottleneck</div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Where are you still acting as the operating system?</h1>
        <p className="text-white/50 text-sm mb-8">This legacy section now points toward diagnostic bottlenecks instead of generic role intake.</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Your primary role</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(({ label, icon }) => (
                <OptionCard key={label} label={label} icon={icon} selected={data.founder.primaryRole === label} onClick={() => onChange({ primaryRole: label })} />
              ))}
            </div>
            {errors.primaryRole && <p className="text-red-400 text-xs mt-1">{errors.primaryRole}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Primary bottleneck</label>
            <div className="grid grid-cols-1 gap-2">
              {BOTTLENECKS.map((sink) => (
                <OptionCard key={sink} label={sink} selected={data.founder.biggestBottleneck === sink} onClick={() => onChange({ biggestBottleneck: sink })} />
              ))}
            </div>
            {errors.biggestBottleneck && <p className="text-red-400 text-xs mt-1">{errors.biggestBottleneck}</p>}
          </div>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={handleNext} />
    </div>
  );
}
