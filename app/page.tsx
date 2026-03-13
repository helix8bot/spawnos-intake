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
    id: "intro",
    section: "Overview",
    title: "Take the SpawnOS Audit",
    subtitle: "In a few minutes, this audit diagnoses your operational bottlenecks, surfaces where AI can help, estimates time and efficiency upside, and gives us the raw material to produce your implementation blueprint if there’s a fit.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "company-profile",
    section: "Company profile",
    title: "Start with the business context.",
    subtitle: "We use this to anchor the audit in your real operating environment, not generic AI advice.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "founder-bottleneck",
    section: "Founder bottleneck",
    title: "Where are you personally still acting as the operating system?",
    subtitle: "This section helps us diagnose bottleneck intensity, role overload, and the drag that still routes through leadership.",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "operational-diagnostics",
    section: "Operational diagnostics",
    title: "Score the friction across the business.",
    subtitle: "These questions are grouped so scoring and implementation recommendations are possible later, even if the full scoring engine is still lightweight today.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "systems-stack",
    section: "Systems stack",
    title: "What systems are carrying the load today?",
    subtitle: "We need to know what your team already uses, where context lives, and how much tool switching is hurting execution.",
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "targets",
    section: "Targets and upside",
    title: "What would a successful implementation actually change?",
    subtitle: "This is where we translate pain into time saved, execution leverage, and business upside.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "blueprint",
    section: "Blueprint inputs",
    title: "Give us the inputs we would use for the implementation blueprint.",
    subtitle: "If you move forward, these answers become the starting point for rollout so you do not have to repeat the same information later.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "summary",
    section: "Summary",
    title: "Review your SpawnOS Audit before submitting.",
    subtitle: "This summary shows the bottleneck pattern we’re seeing and the AI team direction it points toward.",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "done",
    section: "Done",
    title: "Thanks for taking the SpawnOS Audit",
    subtitle: "Your audit is in. We’ll review your bottlenecks and AI opportunities, then come back with the recommended implementation path if there’s a fit.",
    image: "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1600&q=80",
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

const industries = ["Marketing Agency", "E-commerce", "Real Estate", "Health & Wellness", "Finance & Investing", "Legal", "Education", "Tech / SaaS", "Construction", "Restaurant / Food", "Other"];
const industryIcons: Record<string, string> = {
  "Marketing Agency": "📣",
  "E-commerce": "🛒",
  "Real Estate": "🏠",
  "Health & Wellness": "💪",
  "Finance & Investing": "💰",
  Legal: "⚖️",
  Education: "📚",
  "Tech / SaaS": "💻",
  Construction: "🔨",
  "Restaurant / Food": "🍽️",
  Other: "✨",
};

const teamSizes = ["Just me", "2-5 people", "6-20 people", "21-50 people", "50+ people"];
const revenueBands = ["Under $500K", "$500K-$1M", "$1M-$3M", "$3M-$10M", "$10M+"];
const deliveryModels = ["Retainers / recurring services", "Project-based services", "E-commerce / transactions", "Appointments / booked service", "Mixed model"];
const founderRoles = ["Founder / CEO", "Founder-operator", "COO / Head of Operations", "Sales-led founder", "Delivery-led founder", "I wear multiple hats"];
const hoursLostOptions = ["0-5 hours", "6-10 hours", "11-20 hours", "20+ hours"];
const diagnosticLevels = ["Low", "Medium", "High", "Severe"];
const emailTools = ["Gmail / Google Workspace", "Outlook / Microsoft 365", "Superhuman", "Other"];
const currentTools = ["Slack", "Discord", "Telegram", "WhatsApp", "Notion", "Google Sheets", "Airtable", "HubSpot", "Salesforce", "ClickUp / Asana", "Shopify", "QuickBooks", "None of these"];
const sourceOfTruthOptions = ["Mostly in my head", "Scattered across docs and chats", "A few SOPs exist but they’re inconsistent", "We have a clean source of truth"];
const techComfortOptions = ['😰 Minimal', '🤔 Moderate', '😊 Comfortable', '🤓 Technical'];
const sixMonthGoals = ["Buy back founder time", "Increase team throughput", "Tighten follow-up", "Improve reporting visibility", "Scale without immediate hiring", "Reduce execution errors", "Create better SOP coverage", "Improve client/customer response speed"];
const implementationGoals = ["Remove founder bottlenecks", "Install an AI chief-of-staff layer", "Reduce communication drag", "Improve delegation and follow-through", "Create a real operating cadence"];
const primaryChannels = ["Telegram", "Slack", "Email", "Discord", "Web chat only"];
const checkInFrequencies = ["Multiple times a day", "Daily executive briefing", "Only when something needs a decision", "Weekly summary only"];

const navigableSteps = steps.filter((step) => step.id !== "done");

export default function Home() {
  const [stepIndex, setStepIndex] = useState(0);
  const [otherIndustry, setOtherIndustry] = useState("");
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
        setData(JSON.parse(saved) as IntakeData);
      } catch {}
    }

    const params = new URLSearchParams(window.location.search);
    const requestedStep = params.get("step");
    if (requestedStep) {
      const foundIndex = steps.findIndex((step) => step.id === requestedStep);
      if (foundIndex >= 0) setStepIndex(foundIndex);
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
  const diagnosticCards = [
    ["Communication load", data.diagnostics.communicationLoad],
    ["Follow-up leakage", data.diagnostics.followUpLeakage],
    ["Reporting burden", data.diagnostics.reportingBurden],
    ["Delegation friction", data.diagnostics.delegationFriction],
    ["Documentation weakness", data.diagnostics.documentationWeakness],
    ["Coordination overhead", data.diagnostics.coordinationOverhead],
    ["Tool sprawl", data.diagnostics.toolSprawl],
    ["Support drag", data.diagnostics.supportDrag],
    ["Scale readiness gap", data.diagnostics.scaleReadiness],
  ] as const;

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

  const toggleListValue = (section: "goals" | "systems", key: string, value: string, max?: number) => {
    setData((prev) => {
      const current = [...(prev[section][key as keyof IntakeData[typeof section]] as string[])];
      let next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
      if (section === "systems" && value === "None of these" && !current.includes(value)) next = ["None of these"];
      if (section === "systems" && value !== "None of these") next = next.filter((item) => item !== "None of these");
      if (max && next.length > max) return prev;
      return { ...prev, [section]: { ...prev[section], [key]: next } };
    });
  };

  const validateStep = () => {
    const nextErrors: string[] = [];

    if (currentStep.id === "intro") {
      if (!data.personal.firstName.trim()) nextErrors.push("Please add your first name.");
      if (!data.personal.email.trim() || !data.personal.email.includes("@")) nextErrors.push("Please add a valid email.");
      if (!data.personal.timezone) nextErrors.push("Please pick your timezone.");
    }

    if (currentStep.id === "company-profile") {
      if (!data.business.name.trim()) nextErrors.push("Please add your business name.");
      if (!data.business.industry.trim()) nextErrors.push("Please choose your industry.");
      if (!data.business.description.trim()) nextErrors.push("Please describe your business.");
      if (!data.business.teamSize.trim()) nextErrors.push("Please choose your team size.");
      if (!data.business.revenueBand.trim()) nextErrors.push("Please choose your revenue band.");
    }

    if (currentStep.id === "founder-bottleneck") {
      if (!data.founder.primaryRole.trim()) nextErrors.push("Please choose your primary role.");
      if (!data.founder.biggestBottleneck.trim()) nextErrors.push("Please describe the main bottleneck.");
      if (!data.founder.hoursLostPerWeek.trim()) nextErrors.push("Please estimate hours lost per week.");
      if (!data.founder.currentGrowthConstraint.trim()) nextErrors.push("Please describe what’s constraining growth.");
    }

    if (currentStep.id === "operational-diagnostics") {
      if (diagnosticCards.some(([, value]) => !value)) nextErrors.push("Please score each diagnostic category so we can map the bottlenecks correctly.");
    }

    if (currentStep.id === "systems-stack") {
      if (!data.systems.email.trim()) nextErrors.push("Please choose your email setup.");
      if (!data.systems.sourceOfTruth.trim()) nextErrors.push("Please tell us how documented your operation is.");
      if (!data.systems.techComfort.trim()) nextErrors.push("Please tell us your tech comfort level.");
    }

    if (currentStep.id === "targets") {
      if (!data.goals.implementationGoal.trim()) nextErrors.push("Please choose the main implementation goal.");
      if (data.goals.sixMonthGoals.length === 0) nextErrors.push("Please pick at least one 6-month target.");
      if (!data.goals.desiredOutcome.trim()) nextErrors.push("Please describe the outcome you want this audit to unlock.");
    }

    if (currentStep.id === "blueprint") {
      if (!data.blueprint.preferredChannel.trim()) nextErrors.push("Please choose your preferred channel.");
      if (!data.blueprint.checkInFrequency.trim()) nextErrors.push("Please choose a check-in rhythm.");
      if (!data.blueprint.notesForBlueprint.trim()) nextErrors.push("Please add implementation notes for the blueprint.");
    }

    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const nextStep = () => {
    if (validateStep()) goToStep(stepIndex + 1);
  };

  const prevStep = () => goToStep(stepIndex - 1);

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
      if (!response.ok || !result?.success) throw new Error(result?.error || "We couldn’t submit your audit right now. Please try again.");

      setData(payload);
      goToStep(steps.length - 1);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We couldn’t submit your audit right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const baseCard = "rounded-[28px] border border-[#1E293B] bg-[#111827]/92 backdrop-blur-xl shadow-2xl shadow-black/40";

  return (
    <main className="min-h-screen bg-[#0B0F14] text-[#FAFAFA]">
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${currentStep.image})` }} />
        <div className="absolute inset-0 bg-[#0B0F14]/84" />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
          <header className="mb-6 flex items-center justify-between gap-4 pt-2">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">SpawnOS</div>
              <h1 className="mt-2 text-lg font-semibold text-[#FAFAFA] sm:text-xl">Take the SpawnOS Audit</h1>
            </div>
            <div className="rounded-full border border-[#1E293B] bg-[#111827]/90 px-4 py-2 text-sm text-[#94A3B8]">{progress}% complete</div>
          </header>

          <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-[#111827]">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#94A3B8]" animate={{ width: `${progress}%` }} />
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
                  <div className="mb-3 inline-flex rounded-full bg-[#2563EB]/15 px-3 py-1 text-sm font-medium text-[#BFDBFE]">{currentStep.section}</div>
                  <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">{currentStep.title}</h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-[#94A3B8]">{currentStep.subtitle}</p>
                </div>

                {currentStep.id === "intro" && (
                  <div className="space-y-5">
                    <div className="rounded-[24px] border border-[#2563EB]/30 bg-[#2563EB]/10 p-5 text-sm leading-7 text-[#E2E8F0]">
                      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#BFDBFE]">What you get</div>
                      <ul className="mt-3 space-y-2">
                        <li>• A diagnostic view of your founder bottlenecks and operating drag</li>
                        <li>• An AI opportunity map and recommended team structure</li>
                        <li>• Estimated time-saved and efficiency / revenue-upside framing</li>
                        <li>• The implementation starting point if you move forward</li>
                      </ul>
                    </div>
                    <Field label="What’s your first name?">
                      <input className={inputClass} value={data.personal.firstName} onChange={(e) => setField("personal", { firstName: e.target.value })} placeholder="e.g. Alex" />
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

                {currentStep.id === "company-profile" && (
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
                        <input className={`${inputClass} mt-3`} value={otherIndustry} onChange={(e) => {
                          setOtherIndustry(e.target.value);
                          setField("business", { industry: e.target.value || "Other" });
                        }} placeholder="Tell us your industry" />
                      )}
                    </Field>
                    <Field label="Describe the business in one sentence.">
                      <input className={inputClass} value={data.business.description} onChange={(e) => setField("business", { description: e.target.value })} placeholder="Who you serve, what you deliver, and how the business runs" />
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Team size">
                        <div className="grid grid-cols-2 gap-3">
                          {teamSizes.map((size) => <ChoiceButton key={size} active={data.business.teamSize === size} onClick={() => setField("business", { teamSize: size })}>{size}</ChoiceButton>)}
                        </div>
                      </Field>
                      <Field label="Revenue band">
                        <div className="grid gap-3">
                          {revenueBands.map((band) => <ChoiceButton key={band} active={data.business.revenueBand === band} onClick={() => setField("business", { revenueBand: band })}>{band}</ChoiceButton>)}
                        </div>
                      </Field>
                    </div>
                    <Field label="Which delivery model is closest to yours?">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {deliveryModels.map((model) => <ChoiceButton key={model} active={data.business.deliveryModel === model} onClick={() => setField("business", { deliveryModel: model })}>{model}</ChoiceButton>)}
                      </div>
                    </Field>
                  </div>
                )}

                {currentStep.id === "founder-bottleneck" && (
                  <div className="space-y-5">
                    <Field label="What best describes your role right now?">
                      <div className="grid gap-3">
                        {founderRoles.map((role) => <ChoiceButton key={role} active={data.founder.primaryRole === role} onClick={() => setField("founder", { primaryRole: role })}>{role}</ChoiceButton>)}
                      </div>
                    </Field>
                    <Field label="What is the main bottleneck you want this audit to diagnose first?">
                      <textarea className={`${inputClass} min-h-32`} value={data.founder.biggestBottleneck} onChange={(e) => setField("founder", { biggestBottleneck: e.target.value })} placeholder="Example: everything still routes through me for approvals, reporting, follow-up, or client communication" />
                    </Field>
                    <Field label="Roughly how many founder hours disappear each week into coordination, follow-up, reporting, or context recovery?">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {hoursLostOptions.map((option) => <ChoiceButton key={option} active={data.founder.hoursLostPerWeek === option} onClick={() => setField("founder", { hoursLostPerWeek: option })}>{option}</ChoiceButton>)}
                      </div>
                    </Field>
                    <Field label="What is currently constraining growth or execution the most?">
                      <textarea className={`${inputClass} min-h-28`} value={data.founder.currentGrowthConstraint} onChange={(e) => setField("founder", { currentGrowthConstraint: e.target.value })} placeholder="Tell us what breaks when volume increases" />
                    </Field>
                  </div>
                )}

                {currentStep.id === "operational-diagnostics" && (
                  <div className="space-y-5">
                    {[
                      ["communicationLoad", "Communication load", "How heavy is the founder/team communication burden across inboxes, chat, and updates?"],
                      ["followUpLeakage", "Follow-up leakage", "How often do tasks, approvals, leads, or client commitments fall through the cracks?"],
                      ["reportingBurden", "Reporting burden", "How painful is assembling updates, summaries, and leadership visibility?"],
                      ["delegationFriction", "Delegation friction", "How often does delegated work boomerang back because context or clarity is missing?"],
                      ["documentationWeakness", "Process / documentation weakness", "How weak is the company’s SOP and searchable business-memory layer?"],
                      ["coordinationOverhead", "Team coordination overhead", "How much time is lost to task-routing, clarification, and cross-functional wrangling?"],
                      ["toolSprawl", "Tool sprawl / context switching", "How fragmented is the operation across tools, tabs, and channels?"],
                      ["supportDrag", "Customer support / intake drag", "How much operational drag comes from customer questions, lead intake, or front-door triage?"],
                      ["scaleReadiness", "Scale readiness", "How confident are you that the business could absorb more volume without breaking internally?"],
                    ].map(([key, title, description]) => (
                      <Field key={key} label={`${title} — ${description}`}>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {diagnosticLevels.map((level) => (
                            <ChoiceButton key={level} active={data.diagnostics[key as keyof IntakeData["diagnostics"]] === level} onClick={() => setField("diagnostics", { [key]: level })}>
                              {level}
                            </ChoiceButton>
                          ))}
                        </div>
                      </Field>
                    ))}
                  </div>
                )}

                {currentStep.id === "systems-stack" && (
                  <div className="space-y-5">
                    <Field label="What do you currently use for email?">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {emailTools.map((tool) => <ChoiceButton key={tool} active={data.systems.email === tool || (tool === "Other" && !!data.systems.email && !emailTools.includes(data.systems.email))} onClick={() => setField("systems", { email: tool })}>{tool}</ChoiceButton>)}
                      </div>
                      {data.systems.email === "Other" && (
                        <input className={`${inputClass} mt-3`} value={otherEmailTool} onChange={(e) => {
                          setOtherEmailTool(e.target.value);
                          setField("systems", { email: e.target.value || "Other" });
                        }} placeholder="Tell us what you use" />
                      )}
                    </Field>
                    <Field label="Which of these tools are in the mix today?">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {currentTools.map((tool) => <ChoiceButton key={tool} active={data.systems.currentTools.includes(tool)} onClick={() => toggleListValue("systems", "currentTools", tool)}>{tool}</ChoiceButton>)}
                      </div>
                    </Field>
                    <Field label="Where does your operational source of truth live today?">
                      <div className="grid gap-3">
                        {sourceOfTruthOptions.map((option) => <ChoiceButton key={option} active={data.systems.sourceOfTruth === option} onClick={() => setField("systems", { sourceOfTruth: option })}>{option}</ChoiceButton>)}
                      </div>
                    </Field>
                    <Field label="How technically comfortable is your team?">
                      <div className="grid gap-3">
                        {techComfortOptions.map((option) => <ChoiceButton key={option} active={data.systems.techComfort === option} onClick={() => setField("systems", { techComfort: option })}>{option}</ChoiceButton>)}
                      </div>
                    </Field>
                  </div>
                )}

                {currentStep.id === "targets" && (
                  <div className="space-y-5">
                    <Field label="What is the main implementation goal?">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {implementationGoals.map((goal) => <ChoiceButton key={goal} active={data.goals.implementationGoal === goal} onClick={() => setField("goals", { implementationGoal: goal })}>{goal}</ChoiceButton>)}
                      </div>
                    </Field>
                    <Field label="What should materially improve in the next 6 months? (pick up to 3)">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {sixMonthGoals.map((goal) => <ChoiceButton key={goal} active={data.goals.sixMonthGoals.includes(goal)} onClick={() => toggleListValue("goals", "sixMonthGoals", goal, 3)}>{goal}</ChoiceButton>)}
                      </div>
                    </Field>
                    <Field label="What would make this audit feel obviously valuable to you?">
                      <textarea className={`${inputClass} min-h-32`} value={data.goals.desiredOutcome} onChange={(e) => setField("goals", { desiredOutcome: e.target.value })} placeholder="Example: show me where AI saves 15 hours/week, what team structure I need, and what we’d implement first" />
                    </Field>
                  </div>
                )}

                {currentStep.id === "blueprint" && (
                  <div className="space-y-5">
                    <div className="rounded-[24px] border border-[#2563EB]/30 bg-[#2563EB]/10 p-5 text-sm leading-7 text-[#E2E8F0]">
                      If you move forward, your audit answers become the starting point for implementation. That means no repetitive re-onboarding just to restate the same business context later.
                    </div>
                    <Field label="If we were to build around one primary communication channel, what should it be?">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {primaryChannels.map((channel) => <ChoiceButton key={channel} active={data.blueprint.preferredChannel === channel} onClick={() => setField("blueprint", { preferredChannel: channel })}>{channel}</ChoiceButton>)}
                      </div>
                    </Field>
                    <Field label="What reporting / briefing rhythm would fit best?">
                      <div className="grid gap-3">
                        {checkInFrequencies.map((frequency) => <ChoiceButton key={frequency} active={data.blueprint.checkInFrequency === frequency} onClick={() => setField("blueprint", { checkInFrequency: frequency })}>{frequency}</ChoiceButton>)}
                      </div>
                    </Field>
                    <Field label="Anything else we should know when designing the implementation blueprint?">
                      <textarea className={`${inputClass} min-h-32`} value={data.blueprint.notesForBlueprint} onChange={(e) => setField("blueprint", { notesForBlueprint: e.target.value })} placeholder="Share constraints, decision-makers, tool requirements, security concerns, or non-negotiables" />
                    </Field>
                  </div>
                )}

                {currentStep.id === "summary" && (
                  <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <SummaryCard title="Business context" lines={[data.business.name || "—", data.business.industry || "—", data.business.teamSize || "—", data.business.revenueBand || "—"]} />
                      <SummaryCard title="Founder bottleneck" lines={[data.founder.primaryRole || "—", data.founder.hoursLostPerWeek || "—", data.founder.biggestBottleneck || "—"]} />
                      <SummaryCard title="Implementation target" lines={[data.goals.implementationGoal || "—", ...data.goals.sixMonthGoals.slice(0, 2)]} />
                      <SummaryCard title="Blueprint inputs" lines={[data.blueprint.preferredChannel || "—", data.blueprint.checkInFrequency || "—", data.systems.sourceOfTruth || "—"]} />
                    </div>

                    <div className="rounded-[24px] border border-[#2563EB]/30 bg-[#2563EB]/10 p-5">
                      <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#BFDBFE]">Diagnostic preview</div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {diagnosticCards.map(([label, value]) => (
                          <PreviewRow key={label} label={label} value={value || "Not scored"} />
                        ))}
                      </div>
                      <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="space-y-3">
                          <PreviewRow label="Recommended operating layer" value={suggestedRole} />
                          <PreviewRow label="Estimated founder time currently at risk" value={data.founder.hoursLostPerWeek || "Not set"} />
                          <PreviewRow label="Desired business outcome" value={data.goals.desiredOutcome || "—"} />
                        </div>
                        <div>
                          <div className="mb-3 text-sm font-medium text-[#94A3B8]">Likely AI team structure</div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {suggestedTeam.map((agent) => (
                              <div key={agent.name} className="rounded-2xl border border-[#1E293B] bg-[#111827] p-4">
                                <div className="text-2xl">{agent.icon}</div>
                                <div className="mt-2 font-semibold">{agent.name}</div>
                                <div className="text-sm text-[#BFDBFE]">{agent.role}</div>
                                <p className="mt-2 text-sm leading-6 text-[#94A3B8]">{agent.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-[#94A3B8]">This audit will be reviewed and turned into an AI operating blueprint / fit assessment if there’s a qualified implementation path.</p>
                    </div>
                  </div>
                )}

                {currentStep.id === "done" && (
                  <div className="space-y-5">
                    <div className="rounded-[24px] border border-[#2563EB]/30 bg-[#2563EB]/10 p-5">
                      <h3 className="text-2xl font-semibold">Thanks for taking the SpawnOS Audit.</h3>
                      <p className="mt-3 text-[#E4E4E7]">We’re reviewing your bottlenecks, AI opportunities, and implementation fit. If qualified, we’ll come back with the recommended path forward.</p>
                      <ul className="mt-4 space-y-3 text-[#E4E4E7]">
                        <li>✅ Audit submission received</li>
                        <li>✅ Bottleneck and AI opportunity review queued</li>
                        <li>✅ Your answers saved for reuse if implementation moves forward</li>
                      </ul>
                    </div>
                    <div className="rounded-[24px] border border-[#1E293B] bg-[#111827] p-5">
                      <p className="text-[#94A3B8]">What happens next:</p>
                      <ul className="mt-4 space-y-3 text-[#E4E4E7]">
                        <li>• We review the operational bottlenecks and likely AI intervention points</li>
                        <li>• We assess fit for a SpawnOS implementation blueprint</li>
                        <li>• If there’s a fit, we come back with the recommended implementation path</li>
                      </ul>
                    </div>
                  </div>
                )}

                {errors.length > 0 && <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">{errors.map((error) => <div key={error}>• {error}</div>)}</div>}

                {submitError && (
                  <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-50">
                    <div>{submitError}</div>
                    <button onClick={submit} disabled={submitting} className="mt-3 inline-flex rounded-full bg-[#111827] px-4 py-2 font-semibold text-[#FAFAFA] transition hover:bg-[#1A1A1A] disabled:opacity-50">
                      {submitting ? "Retrying..." : "Retry submission"}
                    </button>
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                  <button onClick={prevStep} disabled={stepIndex === 0} className="rounded-full border border-[#1E293B] px-5 py-3 text-sm font-medium text-[#94A3B8] transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-30">Back</button>
                  {currentStep.id === "summary" ? (
                    <button onClick={submit} disabled={submitting} className="rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-[#FAFAFA] transition hover:bg-[#1D4ED8] disabled:opacity-60">
                      {submitting ? "Submitting your audit..." : "Submit SpawnOS Audit"}
                    </button>
                  ) : currentStep.id === "done" ? (
                    <button onClick={() => goToStep(0)} className="rounded-full bg-[#111827] px-6 py-3 text-sm font-semibold text-[#FAFAFA] transition hover:border-[#2563EB]/40 hover:bg-[#1A1A1A]">Start again</button>
                  ) : (
                    <button onClick={nextStep} className="rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-[#FAFAFA] transition hover:bg-[#1D4ED8]">Continue</button>
                  )}
                </div>
              </motion.section>
            </AnimatePresence>

            <aside className={`${baseCard} flex flex-col gap-5 p-6 sm:p-7`}>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#BFDBFE]">Premium diagnostic</div>
                <h3 className="mt-2 text-2xl font-semibold">This is the first step in designing your AI operating system.</h3>
                <p className="mt-3 text-sm leading-7 text-[#94A3B8]">Not a generic application form. The audit is structured to diagnose bottlenecks, make scoring possible, and feed directly into implementation if there’s a fit.</p>
              </div>

              <div className="rounded-[24px] border border-[#1E293B] bg-[#111827] p-5">
                <div className="text-sm font-semibold text-[#FAFAFA]">Audit outputs</div>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-[#94A3B8]">
                  <li>• Founder bottleneck diagnosis</li>
                  <li>• AI opportunity map</li>
                  <li>• Recommended AI team structure</li>
                  <li>• Time-saved and efficiency upside framing</li>
                  <li>• Implementation blueprint inputs</li>
                </ul>
              </div>

              <div className="rounded-[24px] border border-[#1E293B] bg-[#111827] p-5">
                <div className="text-sm font-semibold text-[#FAFAFA]">Diagnostic categories</div>
                <div className="mt-4 grid gap-2">
                  {diagnosticCards.map(([label]) => (
                    <div key={label} className="rounded-2xl border border-[#1E293B] bg-[#101010] px-4 py-3 text-sm text-[#94A3B8]">{label}</div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#1E293B] bg-[#111827] p-5">
                <div className="text-sm font-semibold text-[#FAFAFA]">Jump to any section</div>
                <div className="mt-4 grid gap-2">
                  {navigableSteps.map((step, index) => (
                    <button key={step.id} type="button" onClick={() => goToStep(index)} className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${stepIndex === index ? "border-[#2563EB]/50 bg-[#2563EB]/18 text-[#FAFAFA]" : "border-[#1E293B] bg-[#101010] text-[#94A3B8] hover:border-[#2563EB]/40 hover:text-[#FAFAFA]"}`}>
                      <div className="font-semibold">{index + 1}. {step.section}</div>
                      <div className="mt-1 text-xs text-inherit opacity-80">{step.title}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#1E293B] bg-[#111827] p-5">
                <div className="text-sm font-semibold text-[#FAFAFA]">Draft is saved automatically</div>
                <p className="mt-3 text-sm leading-6 text-[#94A3B8]">Close the tab and come back later — your audit answers stay saved locally.</p>
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
        active ? "border-[#2563EB]/50 bg-[#2563EB]/18 text-[#FAFAFA] shadow-lg shadow-[#0B1120]/40" : "border-[#1E293B] bg-[#111827] text-[#94A3B8] hover:border-[#2563EB]/40 hover:bg-[#1A1A1A] hover:text-[#FAFAFA]"
      }`}
    >
      {children}
    </button>
  );
}

function SummaryCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-[22px] border border-[#1E293B] bg-[#111827] p-4">
      <div className="text-sm font-semibold text-[#BFDBFE]">{title}</div>
      <div className="mt-3 space-y-2 text-sm text-[#94A3B8]">
        {lines.filter(Boolean).map((line) => <div key={line}>{line}</div>)}
      </div>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#1E293B] bg-[#111827] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">{label}</div>
      <div className="mt-2 text-sm text-[#FAFAFA]">{value}</div>
    </div>
  );
}

const inputClass = "w-full rounded-2xl border border-[#1E293B] bg-[#111827] px-4 py-3 text-[#FAFAFA] placeholder:text-[#64748B] transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20";
