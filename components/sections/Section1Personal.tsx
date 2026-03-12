"use client";

import { useState } from "react";
import NavButtons from "../NavButtons";
import type { IntakeData } from "@/lib/types";

const TIMEZONES = [
  "America/New_York (ET)",
  "America/Chicago (CT)",
  "America/Denver (MT)",
  "America/Los_Angeles (PT)",
  "America/Phoenix (AZ)",
  "America/Anchorage (AKT)",
  "Pacific/Honolulu (HT)",
  "Europe/London (GMT/BST)",
  "Europe/Paris (CET)",
  "Asia/Dubai (GST)",
  "Asia/Kolkata (IST)",
  "Asia/Singapore (SGT)",
  "Asia/Tokyo (JST)",
  "Australia/Sydney (AEDT)",
];

interface Props {
  data: IntakeData;
  onChange: (partial: Partial<IntakeData["personal"]>) => void;
  onNext: () => void;
}

export default function Section1Personal({ data, onChange, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!data.personal.firstName.trim()) errs.firstName = "First name is required";
    if (!data.personal.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personal.email))
      errs.email = "Enter a valid email address";
    if (!data.personal.timezone) errs.timezone = "Please select your timezone";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validate()) onNext();
  }

  return (
    <div className="flex flex-col flex-1 px-4 pt-20 pb-8 max-w-lg mx-auto w-full">
      <div className="flex-1">
        <div className="mb-2 text-teal-400 text-xs font-semibold uppercase tracking-widest">Section 1 of 7</div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Let&apos;s start with you.</h1>
        <p className="text-white/50 text-sm mb-8">
          Just the basics — we&apos;ll use this to personalize your AI team setup.
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              First name <span className="text-teal-400">*</span>
            </label>
            <input
              type="text"
              value={data.personal.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              placeholder="e.g. Sarah"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm transition-colors focus:border-teal-500"
            />
            {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Work email <span className="text-teal-400">*</span>
            </label>
            <input
              type="email"
              value={data.personal.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="you@company.com"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm transition-colors focus:border-teal-500"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Your timezone <span className="text-teal-400">*</span>
            </label>
            <select
              value={data.personal.timezone}
              onChange={(e) => onChange({ timezone: e.target.value })}
              className="w-full bg-[#0B1426] border border-white/15 rounded-xl px-4 py-3 text-white text-sm transition-colors focus:border-teal-500 appearance-none"
            >
              <option value="" disabled>Select your timezone…</option>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
            {errors.timezone && <p className="text-red-400 text-xs mt-1">{errors.timezone}</p>}
          </div>
        </div>
      </div>

      <NavButtons onNext={handleNext} canGoBack={false} nextLabel="Let's go →" />
    </div>
  );
}
