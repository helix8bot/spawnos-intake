"use client";

import { useState } from "react";
import NavButtons from "../NavButtons";
import OptionCard from "../OptionCard";
import type { IntakeData } from "@/lib/types";

const EMAIL_PLATFORMS = [
  "Gmail / Google Workspace",
  "Outlook / Microsoft 365",
  "Klaviyo",
  "ActiveCampaign",
  "Mailchimp",
  "ConvertKit / Kit",
  "HubSpot",
  "Other",
];

const CURRENT_TOOLS = [
  "Slack",
  "Notion",
  "Asana / Monday.com",
  "HubSpot CRM",
  "Salesforce",
  "Zapier / Make",
  "Stripe",
  "Shopify",
  "WordPress",
  "Webflow",
  "Airtable",
  "Google Analytics",
  "Meta Ads",
  "Google Ads",
  "None of these",
];

const TECH_LEVELS = [
  { label: "Beginner — I avoid tech when possible", value: "beginner" },
  { label: "Intermediate — I can figure most things out", value: "intermediate" },
  { label: "Comfortable — I learn new tools quickly", value: "comfortable" },
  { label: "Power user — I love automation and APIs", value: "power" },
];

interface Props {
  data: IntakeData;
  onChange: (partial: Partial<IntakeData["tools"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Section5Tools({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleTool(tool: string) {
    const current = data.tools.currentTools;
    const updated = current.includes(tool)
      ? current.filter((t) => t !== tool)
      : [...current, tool];
    onChange({ currentTools: updated });
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!data.tools.email) errs.email = "Please select your email platform";
    if (!data.tools.techComfort) errs.techComfort = "Please select your tech comfort level";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validate()) onNext();
  }

  return (
    <div className="flex flex-col flex-1 px-4 pt-20 pb-8 max-w-lg mx-auto w-full">
      <div className="flex-1">
        <div className="mb-2 text-teal-400 text-xs font-semibold uppercase tracking-widest">Section 5 of 7</div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">What&apos;s already in your stack?</h1>
        <p className="text-white/50 text-sm mb-8">
          Your AI team integrates directly with the tools you already use.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Primary email platform <span className="text-teal-400">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {EMAIL_PLATFORMS.map((platform) => (
                <OptionCard
                  key={platform}
                  label={platform}
                  selected={data.tools.email === platform}
                  onClick={() => onChange({ email: platform })}
                />
              ))}
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Tools you currently use <span className="text-white/30 text-xs">(optional)</span>
            </label>
            <p className="text-white/40 text-xs mb-2">Select all that apply</p>
            <div className="grid grid-cols-1 gap-2">
              {CURRENT_TOOLS.map((tool) => (
                <OptionCard
                  key={tool}
                  label={tool}
                  selected={data.tools.currentTools.includes(tool)}
                  onClick={() => toggleTool(tool)}
                  multiSelect
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Your tech comfort level <span className="text-teal-400">*</span>
            </label>
            <div className="space-y-2">
              {TECH_LEVELS.map(({ label, value }) => (
                <OptionCard
                  key={value}
                  label={label}
                  selected={data.tools.techComfort === value}
                  onClick={() => onChange({ techComfort: value })}
                />
              ))}
            </div>
            {errors.techComfort && <p className="text-red-400 text-xs mt-1">{errors.techComfort}</p>}
          </div>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={handleNext} />
    </div>
  );
}
