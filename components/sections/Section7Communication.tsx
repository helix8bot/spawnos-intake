"use client";

import { useState } from "react";
import NavButtons from "../NavButtons";
import OptionCard from "../OptionCard";
import type { IntakeData } from "@/lib/types";

const CHANNELS = [
  { label: "Email", icon: "📧" },
  { label: "Slack", icon: "💬" },
  { label: "WhatsApp", icon: "📱" },
  { label: "Telegram", icon: "✈️" },
  { label: "Discord", icon: "🎮" },
  { label: "SMS / Text", icon: "📲" },
  { label: "Dashboard / Portal", icon: "🖥️" },
];

const CHECK_IN_FREQUENCIES = [
  "Real-time — notify me as things happen",
  "Daily digest — one morning summary",
  "Weekly briefing — Monday morning report",
  "On-demand — I'll check in when I want",
];

interface Props {
  data: IntakeData;
  onChange: (partial: Partial<IntakeData["communication"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Section7Communication({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!data.communication.primaryChannel) errs.primaryChannel = "Please select your primary channel";
    if (!data.communication.checkInFrequency) errs.checkInFrequency = "Please select check-in frequency";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validate()) onNext();
  }

  return (
    <div className="flex flex-col flex-1 px-4 pt-20 pb-8 max-w-lg mx-auto w-full">
      <div className="flex-1">
        <div className="mb-2 text-teal-400 text-xs font-semibold uppercase tracking-widest">Section 7 of 7</div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">How should your AI team reach you?</h1>
        <p className="text-white/50 text-sm mb-8">
          Last one. We want your AI team to fit into your life — not add more noise.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Where do you live in your work day? <span className="text-teal-400">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {CHANNELS.map(({ label, icon }) => (
                <OptionCard
                  key={label}
                  label={label}
                  icon={icon}
                  selected={data.communication.primaryChannel === label}
                  onClick={() => onChange({ primaryChannel: label })}
                />
              ))}
            </div>
            {errors.primaryChannel && <p className="text-red-400 text-xs mt-1">{errors.primaryChannel}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              How often should your AI team check in? <span className="text-teal-400">*</span>
            </label>
            <div className="space-y-2">
              {CHECK_IN_FREQUENCIES.map((freq) => (
                <OptionCard
                  key={freq}
                  label={freq}
                  selected={data.communication.checkInFrequency === freq}
                  onClick={() => onChange({ checkInFrequency: freq })}
                />
              ))}
            </div>
            {errors.checkInFrequency && (
              <p className="text-red-400 text-xs mt-1">{errors.checkInFrequency}</p>
            )}
          </div>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={handleNext} nextLabel="See my AI team →" />
    </div>
  );
}
