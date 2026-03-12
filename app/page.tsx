"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSuggestedRole, suggestAITeam } from "@/lib/aiTeamLogic";
import { defaultIntakeData, type IntakeData } from "@/lib/types";

type Step = {
  id: string;
  section: string;
  title: string;
  subtitle: string;
  image: string;
};

const steps: Step[] = [
  {
    id: "about-you",
    section: "About you",
    title: "Let’s start with the basics.",
    subtitle: "A few quick details so we know where to send your package.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "business",
    section: "Your business",
    title: "Tell us about the business behind the scenes.",
    subtitle: "This helps us shape the right AI team around real work, not guesses.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "role",
    section: "Your role",
    title: "Where are you spending your energy right now?",
    subtitle: "Pick what feels most true today — no need to make it perfect.",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "goals",
    section: "Your goals",
    title: "Nice. Now let’s aim this at something that matters.",
    subtitle: "The clearer the goal, the better your AI team can help.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "tools",
    section: "Your tools",
    title: "What are you already using today?",
    subtitle: "We’ll keep your setup practical and matched to your comfort level.",
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "ai-team",
    section: "Your AI team",
    title: "Give your assistant a personality.",
    subtitle: "This is where it starts to feel like your team, not just software.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "communication",
    section: "Communication",
    title: "Last thing — how should your AI keep in touch?",
    subtitle: "Almost there. Let’s make sure it fits your day-to-day rhythm.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "summary",
    section: "Summary",
    title: "Here’s your AI team preview.",
    subtitle: "Take a quick look before we build your package.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "done",
    section: "Done",
    title: "🚀 Your AI Team is Being Built!",
    subtitle: "Your submission is in. Check your email for confirmation and install instructions.",
    image:
      "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1600&q=80",
  },
];

const timezoneOptions = [
  "Pacific (LA/Seattle)",
  "Mountain (Denver/Phoenix)",
  "Central (Dallas/Chicago)",
  "Eastern (NYC/Miami)",
  "Atlantic (Halifax)",
  "UK / Ireland",
  "Europe (Paris/Berlin)",
  "Asia (Singapore/Hong Kong)",
  "Australia (Sydney/Melbourne)",
  "Other",
];

const industries = [
  "Real Estate",
  "E-commerce",
  "Health & Wellness",
  "Finance & Investing",
  "Marketing Agency",
  "Legal",
  "Education",
  "Tech / SaaS",
  "Construction",
  "Restaurant / Food",
  "Other",
];

const industryIcons: Record<string, string> = {
  "Real Estate": "🏠",
  "E-commerce": "🛒",
  "Health & Wellness": "💪",
  "Finance & Investing": "💰",
  "Marketing Agency": "📣",
  Legal: "⚖️",
  Education: "📚",
  "Tech / SaaS": "💻",
  Construction: "🔨",
  "Restaurant / Food": "🍽️",
  Other: "✨",
};

const teamSizes = ["Just me", "2-5 people", "6-20 people", "21-50 people", "50+ people"];
const roles = [
  "I run the whole thing (Owner/CEO)",
  "I handle sales & marketing",
  "I manage operations",
  "I handle finance & accounting",
  "I do the technical stuff",
  "A bit of everything",
];
const timeSinks = [
  "Responding to emails & messages",
  "Finding new customers",
  "Managing existing clients",
  "Social media & marketing",
  "Scheduling & calendar",
  "Invoicing & payments",
  "Tracking inventory / orders",
  "Writing content (blogs, emails, posts)",
  "Research & analysis",
  "Managing my team",
  "Paperwork & compliance",
  "Other",
];
const sixMonthGoals = [
  "More revenue",
  "More free time",
  "Better organized",
  "Faster response times",
  "More customers",
  "Lower costs",
  "Less stress",
  "Automated marketing",
  "Better data & insights",
  "Scaling without hiring",
];
const emailTools = ["Gmail / Google Workspace", "Outlook / Microsoft 365", "Yahoo", "Other"];
const currentTools = [
  "Slack",
  "Discord",
  "Telegram",
  "WhatsApp",
  "Notion",
  "Google Sheets",
  "Salesforce",
  "HubSpot",
  "Shopify",
  "WordPress / WooCommerce",
  "QuickBooks",
  "None of these",
];
const communicationStyles = [
  'Keep it casual ("Hey! Here’s what I found...")',
  'Professional but friendly ("Good morning. Here’s your daily update.")',
  'Straight to business ("Revenue up 12%. 3 tasks pending.")',
  'Challenge me ("Your pricing is wrong. Here’s why.")',
];
const primaryChannels = ["Telegram", "Discord", "Slack", "Email only", "Web chat only"];
const checkInFrequencies = [
  "Multiple times a day",
  "Once in the morning, once at night",
  "Only when something important happens",
  "I’ll come to it when I need it",
];
const techComfortOptions = [
  '😰 "What’s a terminal?"',
  '🤔 "I can Google my way through most things"',
  '😊 "I’m pretty comfortable"',
  '🤓 "I write code for fun"',
];

const navigableSteps = steps.filter((step) => step.id !== "done");

export default function Home() {
  const [stepIndex, setStepIndex] = useState(0);
  const [otherIndustry, setOtherIndustry] = useState("");
  const [otherTimeSink, setOtherTimeSink] = useState("");
  const [otherEmailTool, setOtherEmailTool] = useState("");
  const [data, setData] = useState<IntakeData>(defaultIntakeData);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const hasInitializedHistory = useRef(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("spawnos-intake-draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as IntakeData;
        setData(parsed);
      } catch {}
    }

    const params = new URLSearchParams(window.location.search);
    const requestedStep = params.get("step");
    if (requestedStep) {
      const foundIndex = steps.findIndex((step) => step.id === requestedStep);
      if (foundIndex >= 0) {
        setStepIndex(foundIndex);
      }
    }

    const handlePopState = () => {
      const nextParams = new URLSearchParams(window.location.search);
      const requested = nextParams.get("step") || steps[0].id;
      const nextIndex = steps.findIndex((step) => step.id === requested);
      setErrors([]);
      setSubmitError(null);
      if (nextIndex >= 0) setStepIndex(nextIndex);
    };

    const initialUrl = new URL(window.location.href);
    initialUrl.searchParams.set("step", steps[requestedStep ? Math.max(steps.findIndex((step) => step.id === requestedStep), 0) : 0].id);
    window.history.replaceState({ step: initialUrl.searchParams.get("step") }, "", initialUrl);
    hasInitializedHistory.current = true;

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("spawnos-intake-draft", JSON.stringify(data));
  }, [data]);

  const currentStep = steps[stepIndex];
  const progress = Math.round((Math.min(stepIndex, navigableSteps.length - 1) / (navigableSteps.length - 1)) * 100);
  const suggestedTeam = useMemo(() => suggestAITeam(data), [data]);
  const suggestedRole = useMemo(() => getSuggestedRole(data), [data]);

  const setField = (section: keyof IntakeData, patch: Record<string, string | string[]>) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, string | string[]>),
        ...patch,
      },
    } as IntakeData));
  };

  const goToStep = (nextIndex: number, options?: { replace?: boolean }) => {
    const safeIndex = Math.max(0, Math.min(nextIndex, steps.length - 1));
    setErrors([]);
    setSubmitError(null);
    setStepIndex(safeIndex);

    if (typeof window !== "undefined" && hasInitializedHistory.current) {
      const url = new URL(window.location.href);
      url.searchParams.set("step", steps[safeIndex].id);
      const method = options?.replace ? "replaceState" : "pushState";
      window.history[method]({ step: steps[safeIndex].id }, "", url);
    }
  };

  const toggleListValue = (section: "role" | "goals" | "tools", key: string, value: string, max?: number) => {
    setData((prev) => {
      const current = [...(prev[section][key as keyof IntakeData[typeof section]] as string[])];
      let next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
      if (section === "tools" && value === "None of these" && !current.includes(value)) next = ["None of these"];
      if (section === "tools" && value !== "None of these") next = next.filter((item) => item !== "None of these");
      if (max && next.length > max) return prev;
      return { ...prev, [section]: { ...prev[section], [key]: next } };
    });
  };

  const validateStep = () => {
    const nextErrors: string[] = [];

    if (currentStep.id === "about-you") {
      if (!data.personal.firstName.trim()) nextErrors.push("Please add your first name.");
      if (!data.personal.email.trim() || !data.personal.email.includes("@")) nextErrors.push("Please add a valid email.");
      if (!data.personal.timezone) nextErrors.push("Please pick your timezone.");
    }

    if (currentStep.id === "business") {
      if (!data.business.name.trim()) nextErrors.push("Please add your business name.");
      if (!data.business.industry.trim()) nextErrors.push("Please choose your industry.");
      if (!data.business.description.trim()) nextErrors.push("Please describe your business in one sentence.");
      if (!data.business.teamSize.trim()) nextErrors.push("Please choose your team size.");
    }

    if (currentStep.id === "role") {
      if (!data.role.mainRole) nextErrors.push("Please choose your main role.");
      if (data.role.timeSinks.length === 0) nextErrors.push("Please pick at least one time-drain.");
    }

    if (currentStep.id === "goals") {
      if (!data.goals.biggestProblem.trim()) nextErrors.push("Tell us the one problem you want solved first.");
      if (data.goals.sixMonthGoals.length === 0) nextErrors.push("Pick at least one 6-month goal.");
    }

    if (currentStep.id === "tools") {
      if (!data.tools.email.trim()) nextErrors.push("Please choose your email setup.");
      if (!data.tools.techComfort.trim()) nextErrors.push("Please tell us your comfort level with tech.");
    }

    if (currentStep.id === "ai-team") {
      if (!data.aiTeam.communicationStyle.trim()) nextErrors.push("Please choose how your AI should talk to you.");
    }

    if (currentStep.id === "communication") {
      if (!data.communication.primaryChannel.trim()) nextErrors.push("Please choose your main channel.");
      if (!data.communication.checkInFrequency.trim()) nextErrors.push("Please choose a check-in rhythm.");
    }

    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const nextStep = () => {
    if (validateStep()) goToStep(stepIndex + 1);
  };

  const prevStep = () => {
    goToStep(stepIndex - 1);
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setErrors([]);

    const payload: IntakeData = { ...data, submittedAt: new Date().toISOString() };
    window.localStorage.setItem("spawnos-intake-submission", JSON.stringify(payload));

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as { success?: boolean; error?: string } | null;

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "We couldn’t submit your intake right now. Please try again.");
      }

      setData(payload);
      goToStep(steps.length - 1);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We couldn’t submit your intake right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const baseCard =
    "rounded-[28px] border border-[#1F1F1F] bg-[#141414]/92 backdrop-blur-xl shadow-2xl shadow-black/40";

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA]">
      <div className="relative min-h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${currentStep.image})` }}
        />
        <div className="absolute inset-0 bg-[#0A0A0A]/82" />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
          <header className="mb-6 flex items-center justify-between gap-4 pt-2">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-red-400">SpawnOS</div>
              <h1 className="mt-2 text-lg font-semibold text-[#FAFAFA] sm:text-xl">Build your custom AI team</h1>
            </div>
            <div className="rounded-full border border-[#1F1F1F] bg-[#141414]/90 px-4 py-2 text-sm text-[#A1A1AA]">
              {progress}% complete
            </div>
          </header>

          <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-[#141414]">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500" animate={{ width: `${progress}%` }} />
          </div>

          <div className="grid flex-1 items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <AnimatePresence mode="wait">
              <motion.section
                key={currentStep.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.28 }}
                className={`${baseCard} flex min-h-[560px] flex-col p-6 sm:p-8`}
              >
                <div className="mb-6">
                  <div className="mb-3 inline-flex rounded-full bg-red-500/15 px-3 py-1 text-sm font-medium text-red-300">
                    {currentStep.section}
                  </div>
                  <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">{currentStep.title}</h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-[#A1A1AA]">{currentStep.subtitle}</p>
                </div>

                {currentStep.id === "about-you" && (
                  <div className="space-y-5">
                    <Field label="What’s your first name?">
                      <input className={inputClass} value={data.personal.firstName} onChange={(e) => setField("personal", { firstName: e.target.value })} placeholder="e.g. Perry" />
                    </Field>
                    <Field label="What’s your email?">
                      <input type="email" className={inputClass} value={data.personal.email} onChange={(e) => setField("personal", { email: e.target.value })} placeholder="you@company.com" />
                    </Field>
                    <Field label="What timezone are you in?">
                      <select className={inputClass} value={data.personal.timezone} onChange={(e) => setField("personal", { timezone: e.target.value })}>
                        <option value="">Choose one</option>
                        {timezoneOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </Field>
                  </div>
                )}

                {currentStep.id === "business" && (
                  <div className="space-y-5">
                    <Field label="What’s your business called?">
                      <input className={inputClass} value={data.business.name} onChange={(e) => setField("business", { name: e.target.value })} placeholder="Your company name" />
                    </Field>
                    <Field label="What industry are you in?">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {industries.map((industry) => (
                          <ChoiceButton key={industry} active={data.business.industry === industry || (industry === "Other" && !!data.business.industry && !industries.includes(data.business.industry))} onClick={() => setField("business", { industry })}>
                            <span className="text-2xl">{industryIcons[industry]}</span>
                            <span>{industry}</span>
                          </ChoiceButton>
                        ))}
                      </div>
                      {data.business.industry === "Other" && (
                        <input
                          className={`${inputClass} mt-3`}
                          value={otherIndustry}
                          onChange={(e) => {
                            setOtherIndustry(e.target.value);
                            setField("business", { industry: e.target.value || "Other" });
                          }}
                          placeholder="Tell us your industry"
                        />
                      )}
                    </Field>
                    <Field label="How would you describe your business in one sentence?">
                      <input className={inputClass} value={data.business.description} onChange={(e) => setField("business", { description: e.target.value })} placeholder="e.g. I manage rental properties in Austin" />
                    </Field>
                    <Field label="How many people work in your business?">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {teamSizes.map((size) => <ChoiceButton key={size} active={data.business.teamSize === size} onClick={() => setField("business", { teamSize: size })}>{size}</ChoiceButton>)}
                      </div>
                    </Field>
                  </div>
                )}

                {currentStep.id === "role" && (
                  <div className="space-y-5">
                    <Field label="What’s your main role?">
                      <div className="grid gap-3">
                        {roles.map((role) => <ChoiceButton key={role} active={data.role.mainRole === role} onClick={() => setField("role", { mainRole: role })}>{role}</ChoiceButton>)}
                      </div>
                    </Field>
                    <Field label="What takes up most of your time right now? (pick up to 3)">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {timeSinks.map((sink) => (
                          <ChoiceButton key={sink} active={data.role.timeSinks.includes(sink) || (sink === "Other" && data.role.timeSinks.some((item) => !timeSinks.includes(item)))} onClick={() => toggleListValue("role", "timeSinks", sink, 3)}>
                            {sink}
                          </ChoiceButton>
                        ))}
                      </div>
                      {data.role.timeSinks.includes("Other") && (
                        <input
                          className={`${inputClass} mt-3`}
                          value={otherTimeSink}
                          onChange={(e) => {
                            setOtherTimeSink(e.target.value);
                            setData((prev) => ({ ...prev, role: { ...prev.role, timeSinks: prev.role.timeSinks.filter((item) => item !== "Other" && timeSinks.includes(item)).concat(e.target.value ? [e.target.value] : ["Other"]).slice(0, 3) } }));
                          }}
                          placeholder="What else is eating up your time?"
                        />
                      )}
                    </Field>
                  </div>
                )}

                {currentStep.id === "goals" && (
                  <div className="space-y-5">
                    <Field label="If your AI team could solve ONE problem tomorrow, what would it be?">
                      <textarea className={`${inputClass} min-h-36`} value={data.goals.biggestProblem} onChange={(e) => setField("goals", { biggestProblem: e.target.value })} placeholder="Don’t overthink it — just write what frustrates you most" />
                    </Field>
                    <Field label="What does success look like 6 months from now? (pick up to 3)">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {sixMonthGoals.map((goal) => <ChoiceButton key={goal} active={data.goals.sixMonthGoals.includes(goal)} onClick={() => toggleListValue("goals", "sixMonthGoals", goal, 3)}>{goal}</ChoiceButton>)}
                      </div>
                    </Field>
                  </div>
                )}

                {currentStep.id === "tools" && (
                  <div className="space-y-5">
                    <Field label="What do you currently use for email?">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {emailTools.map((tool) => <ChoiceButton key={tool} active={data.tools.email === tool || (tool === "Other" && !!data.tools.email && !emailTools.includes(data.tools.email))} onClick={() => setField("tools", { email: tool })}>{tool}</ChoiceButton>)}
                      </div>
                      {data.tools.email === "Other" && (
                        <input
                          className={`${inputClass} mt-3`}
                          value={otherEmailTool}
                          onChange={(e) => {
                            setOtherEmailTool(e.target.value);
                            setField("tools", { email: e.target.value || "Other" });
                          }}
                          placeholder="Tell us what you use"
                        />
                      )}
                    </Field>
                    <Field label="Do you use any of these tools?">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {currentTools.map((tool) => <ChoiceButton key={tool} active={data.tools.currentTools.includes(tool)} onClick={() => toggleListValue("tools", "currentTools", tool)}>{tool}</ChoiceButton>)}
                      </div>
                    </Field>
                    <Field label="How would you describe your comfort with technology?">
                      <div className="grid gap-3">
                        {techComfortOptions.map((option) => <ChoiceButton key={option} active={data.tools.techComfort === option} onClick={() => setField("tools", { techComfort: option })}>{option}</ChoiceButton>)}
                      </div>
                    </Field>
                  </div>
                )}

                {currentStep.id === "ai-team" && (
                  <div className="space-y-5">
                    <Field label="What should your AI assistant’s name be?">
                      <input className={inputClass} value={data.aiTeam.agentName} onChange={(e) => setField("aiTeam", { agentName: e.target.value })} placeholder="e.g. Atlas, Nova, or leave blank and we’ll pick one" />
                    </Field>
                    <Field label="How should your AI talk to you?">
                      <div className="grid gap-3">
                        {communicationStyles.map((style) => <ChoiceButton key={style} active={data.aiTeam.communicationStyle === style} onClick={() => setField("aiTeam", { communicationStyle: style })}>{style}</ChoiceButton>)}
                      </div>
                    </Field>
                  </div>
                )}

                {currentStep.id === "communication" && (
                  <div className="space-y-5">
                    <Field label="How do you want your AI to reach you?">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {primaryChannels.map((channel) => <ChoiceButton key={channel} active={data.communication.primaryChannel === channel} onClick={() => setField("communication", { primaryChannel: channel })}>{channel}{channel === "Telegram" ? " (recommended — works on phone)" : ""}</ChoiceButton>)}
                      </div>
                    </Field>
                    <Field label="How often should your AI check in?">
                      <div className="grid gap-3">
                        {checkInFrequencies.map((frequency) => <ChoiceButton key={frequency} active={data.communication.checkInFrequency === frequency} onClick={() => setField("communication", { checkInFrequency: frequency })}>{frequency}</ChoiceButton>)}
                      </div>
                    </Field>
                  </div>
                )}

                {currentStep.id === "summary" && (
                  <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <SummaryCard title="About you" lines={[data.personal.firstName || "—", data.personal.email || "—", data.personal.timezone || "—"]} />
                      <SummaryCard title="Business" lines={[data.business.name || "—", data.business.industry || "—", data.business.teamSize || "—"]} />
                      <SummaryCard title="Role + goals" lines={[data.role.mainRole || "—", ...data.goals.sixMonthGoals.slice(0, 2)]} />
                      <SummaryCard title="Tools + channel" lines={[data.tools.email || "—", data.communication.primaryChannel || "—", data.communication.checkInFrequency || "—"]} />
                    </div>

                    <div className="rounded-[24px] border border-red-500/30 bg-red-500/10 p-5">
                      <div className="text-sm font-semibold uppercase tracking-[0.2em] text-red-300">Your AI Team Preview</div>
                      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="space-y-3">
                          <PreviewRow label="Agent name" value={data.aiTeam.agentName || suggestedTeam[0]?.name || "We’ll pick one for you"} />
                          <PreviewRow label="Role" value={suggestedRole} />
                          <PreviewRow label="Communication" value={data.communication.primaryChannel || "Telegram"} />
                          <PreviewRow label="Main pain points" value={data.role.timeSinks.join(", ") || "We’ll help identify these with you"} />
                        </div>
                        <div>
                          <div className="mb-3 text-sm font-medium text-[#A1A1AA]">Suggested team members</div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {suggestedTeam.map((agent) => (
                              <div key={agent.name} className="rounded-2xl border border-[#1F1F1F] bg-[#141414] p-4">
                                <div className="text-2xl">{agent.icon}</div>
                                <div className="mt-2 font-semibold">{agent.name}</div>
                                <div className="text-sm text-red-300">{agent.role}</div>
                                <p className="mt-2 text-sm leading-6 text-[#A1A1AA]">{agent.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-[#A1A1AA]">We’ll send your custom install package to {data.personal.email || "your email"} within 24 hours.</p>
                    </div>
                  </div>
                )}

                {currentStep.id === "done" && (
                  <div className="space-y-5">
                    <div className="rounded-[24px] border border-red-500/30 bg-red-500/10 p-5">
                      <h3 className="text-2xl font-semibold">🚀 Your AI Team is Being Built!</h3>
                      <p className="mt-3 text-[#E4E4E7]">Check your email ({data.personal.email || "your inbox"}) for:</p>
                      <ul className="mt-4 space-y-3 text-[#E4E4E7]">
                        <li>✅ Confirmation of your submission</li>
                        <li>✅ Install instructions (arriving shortly)</li>
                      </ul>
                    </div>
                    <div className="rounded-[24px] border border-[#1F1F1F] bg-[#141414] p-5">
                      <p className="text-[#A1A1AA]">While you wait, here’s what to have ready:</p>
                      <ul className="mt-4 space-y-3 text-[#E4E4E7]">
                        <li>• A computer (Mac or Linux recommended)</li>
                        <li>• An internet connection</li>
                        <li>• 10 minutes for the initial setup</li>
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <a href="https://spawnos.io" target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-red-500 px-5 py-3 font-semibold text-[#FAFAFA] transition hover:bg-red-600">Visit SpawnOS</a>
                      <a href="mailto:hello@spawnos.io" className="inline-flex rounded-full border border-[#1F1F1F] px-5 py-3 font-semibold text-[#FAFAFA] transition hover:border-red-500/40 hover:bg-[#1A1A1A]">Questions? Email hello@spawnos.io</a>
                    </div>
                  </div>
                )}

                {errors.length > 0 && (
                  <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">
                    {errors.map((error) => <div key={error}>• {error}</div>)}
                  </div>
                )}

                {submitError && (
                  <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-50">
                    <div>{submitError}</div>
                    <button onClick={submit} disabled={submitting} className="mt-3 inline-flex rounded-full bg-[#141414] px-4 py-2 font-semibold text-[#FAFAFA] transition hover:bg-[#1A1A1A] disabled:opacity-50">
                      {submitting ? "Retrying..." : "Retry submission"}
                    </button>
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                  <button onClick={prevStep} disabled={stepIndex === 0} className="rounded-full border border-[#1F1F1F] px-5 py-3 text-sm font-medium text-[#A1A1AA] transition hover:bg-[#141414] disabled:cursor-not-allowed disabled:opacity-30">Back</button>
                  {currentStep.id === "summary" ? (
                    <button onClick={submit} disabled={submitting} className="rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-[#FAFAFA] transition hover:bg-red-600 disabled:opacity-60">
                      {submitting ? "Submitting your intake..." : "Build My AI Team 🚀"}
                    </button>
                  ) : currentStep.id === "done" ? (
                    <button onClick={() => goToStep(0)} className="rounded-full bg-[#141414] px-6 py-3 text-sm font-semibold text-[#FAFAFA] transition hover:border-red-500/40 hover:bg-[#1A1A1A]">Start again</button>
                  ) : (
                    <button onClick={nextStep} className="rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-[#FAFAFA] transition hover:bg-red-600">Continue</button>
                  )}
                </div>
              </motion.section>
            </AnimatePresence>

            <aside className={`${baseCard} flex flex-col gap-5 p-6 sm:p-7`}>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-red-300">Why this works</div>
                <h3 className="mt-2 text-2xl font-semibold">This should feel like a conversation.</h3>
                <p className="mt-3 text-sm leading-7 text-[#A1A1AA]">Short screens. Friendly choices. Clear progress. Less typing. Enough detail to build a serious AI setup without making people feel like they’re filling out taxes.</p>
              </div>

              <div className="rounded-[24px] border border-[#1F1F1F] bg-[#141414] p-5">
                <div className="text-sm font-semibold text-[#FAFAFA]">Question count</div>
                <div className="mt-2 text-4xl font-bold text-red-400">18</div>
                <p className="mt-2 text-sm text-[#71717A]">Across 7 sections, plus summary and thank-you screens.</p>
              </div>

              <div className="rounded-[24px] border border-[#1F1F1F] bg-[#141414] p-5">
                <div className="text-sm font-semibold text-[#FAFAFA]">Jump to any section</div>
                <div className="mt-4 grid gap-2">
                  {navigableSteps.map((step, index) => (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => goToStep(index)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        stepIndex === index
                          ? "border-red-400 bg-red-500/20 text-[#FAFAFA]"
                          : "border-[#1F1F1F] bg-[#101010] text-[#A1A1AA] hover:border-red-500/40 hover:text-[#FAFAFA]"
                      }`}
                    >
                      <div className="font-semibold">{index + 1}. {step.section}</div>
                      <div className="mt-1 text-xs text-inherit opacity-80">{step.title}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#1F1F1F] bg-[#141414] p-5">
                <div className="text-sm font-semibold text-[#FAFAFA]">What we’ll use this for</div>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-[#A1A1AA]">
                  <li>• Pick the right agent roles for the business</li>
                  <li>• Match tone, tools, and communication style</li>
                  <li>• Build a custom install package, not a generic demo</li>
                </ul>
              </div>

              <div className="rounded-[24px] border border-[#1F1F1F] bg-[#141414] p-5">
                <div className="text-sm font-semibold text-[#FAFAFA]">Draft is saved automatically</div>
                <p className="mt-3 text-sm leading-6 text-[#A1A1AA]">If someone closes the tab, their answers stay in local storage so they can come back without starting over.</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-[#FAFAFA]">{label}</div>
      {children}
    </label>
  );
}

function ChoiceButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-14 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-center text-sm font-medium transition ${
        active
          ? "border-red-400 bg-red-500/20 text-[#FAFAFA] shadow-lg shadow-red-950/40"
          : "border-[#1F1F1F] bg-[#141414] text-[#A1A1AA] hover:border-red-500/40 hover:bg-[#1A1A1A] hover:text-[#FAFAFA]"
      }`}
    >
      {children}
    </button>
  );
}

function SummaryCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-[22px] border border-[#1F1F1F] bg-[#141414] p-4">
      <div className="text-sm font-semibold text-red-300">{title}</div>
      <div className="mt-3 space-y-2 text-sm text-[#A1A1AA]">
        {lines.filter(Boolean).map((line) => <div key={line}>{line}</div>)}
      </div>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#1F1F1F] bg-[#141414] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#71717A]">{label}</div>
      <div className="mt-2 text-sm text-[#FAFAFA]">{value}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-[#1F1F1F] bg-[#141414] px-4 py-3 text-[#FAFAFA] placeholder:text-[#71717A] transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20";
