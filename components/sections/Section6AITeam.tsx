"use client";

import { useState } from "react";
import NavButtons from "../NavButtons";
import OptionCard from "../OptionCard";
import type { IntakeData } from "@/lib/types";

const COMMUNICATION_STYLES = [
  { label: "Concise — bullet points and key decisions only", value: "concise" },
  { label: "Detailed — full context and reasoning included", value: "detailed" },
  { label: "Friendly — casual tone, conversational updates", value: "friendly" },
  { label: "Executive — high-level metrics and outcomes", value: "executive" },
];

interface Props {
  data: IntakeData;
  onChange: (partial: Partial<IntakeData["aiTeam"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Section6AITeam({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!data.aiTeam.agentName.trim()) errs.agentName = "Please name your lead AI agent";
    if (!data.aiTeam.communicationStyle) errs.communicationStyle = "Please select a communication style";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validate()) onNext();
  }

  return (
    <div className="flex flex-col flex-1 px-4 pt-20 pb-8 max-w-lg mx-auto w-full">
      <div className="flex-1">
        <div className="mb-2 text-teal-400 text-xs font-semibold uppercase tracking-widest">Section 6 of 7</div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Let&apos;s name your AI team.</h1>
        <p className="text-white/50 text-sm mb-8">
          Your lead AI agent is the one who coordinates everything. What should we call them?
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Name your lead AI agent <span className="text-teal-400">*</span>
            </label>
            <p className="text-white/40 text-xs mb-2">
              This is the primary AI that reports to you. Think: JARVIS, Atlas, Sage…
            </p>
            <input
              type="text"
              value={data.aiTeam.agentName}
              onChange={(e) => onChange({ agentName: e.target.value })}
              placeholder="e.g. Atlas, Sage, Nexus, Aria…"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm transition-colors focus:border-teal-500"
            />
            {errors.agentName && <p className="text-red-400 text-xs mt-1">{errors.agentName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Preferred communication style <span className="text-teal-400">*</span>
            </label>
            <p className="text-white/40 text-xs mb-3">
              How should your AI team communicate with you?
            </p>
            <div className="space-y-2">
              {COMMUNICATION_STYLES.map(({ label, value }) => (
                <OptionCard
                  key={value}
                  label={label}
                  selected={data.aiTeam.communicationStyle === value}
                  onClick={() => onChange({ communicationStyle: value })}
                />
              ))}
            </div>
            {errors.communicationStyle && (
              <p className="text-red-400 text-xs mt-1">{errors.communicationStyle}</p>
            )}
          </div>

          <div className="bg-teal-900/20 border border-teal-500/20 rounded-xl p-4">
            <p className="text-teal-400 text-xs font-semibold mb-1">Pro tip</p>
            <p className="text-white/60 text-xs">
              Naming your AI agent makes it feel more like a team member than a tool — which actually leads to better
              prompt quality and outputs. Take a moment to pick something that resonates with you.
            </p>
          </div>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={handleNext} />
    </div>
  );
}
