import type { AIAgent, IntakeData } from "./types";

const agentPool: Record<string, AIAgent> = {
  chiefOfStaff: {
    name: "Atlas",
    role: "AI Chief of Staff",
    description: "Owns executive briefings, decision support, and cross-functional follow-through.",
    icon: "🧭",
  },
  communication: {
    name: "Relay",
    role: "Communication Triage Agent",
    description: "Sorts inbox and team chatter, drafts replies, and surfaces what actually needs founder attention.",
    icon: "📨",
  },
  followUp: {
    name: "Pulse",
    role: "Follow-Up Agent",
    description: "Keeps open loops moving so approvals, tasks, and client commitments stop leaking.",
    icon: "🔁",
  },
  reporting: {
    name: "Lens",
    role: "Reporting Agent",
    description: "Turns scattered updates into structured reports, summaries, and performance briefs.",
    icon: "📊",
  },
  delegation: {
    name: "Forge",
    role: "Delegation Coordinator",
    description: "Converts meetings and messages into routed tasks, next steps, and accountability.",
    icon: "🗂️",
  },
  knowledge: {
    name: "Archive",
    role: "Knowledge & SOP Agent",
    description: "Captures recurring processes, decisions, and business memory so context stops living in one head.",
    icon: "🧠",
  },
  support: {
    name: "Aria",
    role: "Customer Support Agent",
    description: "Handles intake, FAQs, and support routing so customer-facing work stops creating internal drag.",
    icon: "💬",
  },
};

const intensityWeight: Record<string, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Severe: 4,
};

export function suggestAITeam(data: IntakeData): AIAgent[] {
  const scores: Record<string, number> = {
    chiefOfStaff: 2,
  };

  const add = (key: keyof typeof scores | string, score: number) => {
    scores[key] = (scores[key] || 0) + score;
  };

  const d = data.diagnostics;

  add("communication", intensityWeight[d.communicationLoad] || 0);
  add("followUp", intensityWeight[d.followUpLeakage] || 0);
  add("reporting", intensityWeight[d.reportingBurden] || 0);
  add("delegation", intensityWeight[d.delegationFriction] || 0);
  add("knowledge", intensityWeight[d.documentationWeakness] || 0);
  add("chiefOfStaff", intensityWeight[d.coordinationOverhead] || 0);
  add("chiefOfStaff", intensityWeight[d.toolSprawl] || 0);
  add("support", intensityWeight[d.supportDrag] || 0);
  add("chiefOfStaff", intensityWeight[d.scaleReadiness] || 0);

  if (data.founder.hoursLostPerWeek === "20+ hours") add("chiefOfStaff", 2);
  if (data.business.teamSize === "21-50 people" || data.business.teamSize === "50+ people") add("chiefOfStaff", 2);
  if (data.business.industry === "Marketing Agency") add("reporting", 1);
  if (data.business.industry === "E-commerce") add("support", 1);

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => agentPool[key])
    .filter(Boolean)
    .slice(0, 4);
}

export function getSuggestedRole(data: IntakeData) {
  const severeCount = Object.values(data.diagnostics).filter((value) => value === "Severe").length;

  if (severeCount >= 3) return "AI chief-of-staff layer with specialist support pods";
  if (data.diagnostics.reportingBurden === "High" || data.diagnostics.reportingBurden === "Severe") {
    return "Executive reporting and coordination layer";
  }
  if (data.diagnostics.supportDrag === "High" || data.diagnostics.supportDrag === "Severe") {
    return "Client-facing intake and support layer";
  }
  if (data.diagnostics.delegationFriction === "High" || data.diagnostics.delegationFriction === "Severe") {
    return "Delegation and follow-through layer";
  }

  return "Core AI operating layer with founder support";
}
