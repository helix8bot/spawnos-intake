import type { AIAgent, IntakeData } from "./types";

const agentPool: Record<string, AIAgent> = {
  contentWriter: {
    name: "Nova",
    role: "Content Writer",
    description: "Writes emails, blog posts, offers, and social content in your brand voice.",
    icon: "✍️",
  },
  emailAutomation: {
    name: "Relay",
    role: "Inbox & Follow-Up Agent",
    description: "Handles messages, follow-ups, and simple email routines so nothing slips.",
    icon: "📧",
  },
  leadResearch: {
    name: "Scout",
    role: "Lead Research Agent",
    description: "Finds good-fit prospects, collects useful details, and keeps your pipeline warm.",
    icon: "🔎",
  },
  socialMedia: {
    name: "Pulse",
    role: "Social Media Agent",
    description: "Plans posts, drafts captions, and helps keep your brand active online.",
    icon: "📱",
  },
  customerSupport: {
    name: "Aria",
    role: "Customer Support Agent",
    description: "Answers common questions fast and flags anything that needs a human.",
    icon: "💬",
  },
  dataAnalysis: {
    name: "Lens",
    role: "Data Insight Agent",
    description: "Turns numbers into simple reports, trends, and next-step ideas.",
    icon: "📊",
  },
  projectManager: {
    name: "Atlas",
    role: "Operations Coordinator",
    description: "Keeps tasks, deadlines, and moving pieces organized behind the scenes.",
    icon: "🗂️",
  },
  salesOutreach: {
    name: "Forge",
    role: "Sales Outreach Agent",
    description: "Writes outreach, follows up, and helps turn interest into booked calls.",
    icon: "🎯",
  },
  financeAdmin: {
    name: "Ledger",
    role: "Finance Helper",
    description: "Supports invoices, payment follow-ups, and money-related admin work.",
    icon: "💰",
  },
  techSupport: {
    name: "Nexus",
    role: "Tool Setup Agent",
    description: "Connects tools, keeps automations healthy, and helps with setup steps.",
    icon: "⚙️",
  },
};

const timeSinkMap: Record<string, string[]> = {
  "Responding to emails & messages": ["emailAutomation", "customerSupport"],
  "Finding new customers": ["leadResearch", "salesOutreach"],
  "Managing existing clients": ["customerSupport", "projectManager"],
  "Social media & marketing": ["socialMedia", "contentWriter"],
  "Scheduling & calendar": ["projectManager", "emailAutomation"],
  "Invoicing & payments": ["financeAdmin", "dataAnalysis"],
  "Tracking inventory / orders": ["projectManager", "dataAnalysis"],
  "Writing content (blogs, emails, posts)": ["contentWriter", "socialMedia"],
  "Research & analysis": ["dataAnalysis", "leadResearch"],
  "Managing my team": ["projectManager", "dataAnalysis"],
  "Paperwork & compliance": ["projectManager", "financeAdmin"],
  Other: ["projectManager", "techSupport"],
};

const industryMap: Record<string, string[]> = {
  "Real Estate": ["leadResearch", "salesOutreach", "customerSupport"],
  "E-commerce": ["customerSupport", "emailAutomation", "socialMedia"],
  "Health & Wellness": ["customerSupport", "contentWriter", "emailAutomation"],
  "Finance & Investing": ["financeAdmin", "dataAnalysis", "customerSupport"],
  "Marketing Agency": ["contentWriter", "projectManager", "salesOutreach"],
  Legal: ["projectManager", "financeAdmin", "customerSupport"],
  Education: ["contentWriter", "emailAutomation", "customerSupport"],
  "Tech / SaaS": ["techSupport", "dataAnalysis", "projectManager"],
  Construction: ["projectManager", "financeAdmin", "customerSupport"],
  "Restaurant / Food": ["customerSupport", "socialMedia", "projectManager"],
  Other: ["projectManager", "contentWriter", "techSupport"],
};

const roleMap: Record<string, string[]> = {
  "I run the whole thing (Owner/CEO)": ["projectManager", "dataAnalysis", "salesOutreach"],
  "I handle sales & marketing": ["salesOutreach", "socialMedia", "contentWriter"],
  "I manage operations": ["projectManager", "dataAnalysis", "financeAdmin"],
  "I handle finance & accounting": ["financeAdmin", "dataAnalysis", "projectManager"],
  "I do the technical stuff": ["techSupport", "projectManager", "dataAnalysis"],
  "A bit of everything": ["projectManager", "emailAutomation", "contentWriter"],
};

export function suggestAITeam(data: IntakeData): AIAgent[] {
  const scores: Record<string, number> = {};

  const add = (keys: string[], weight: number) => {
    keys.forEach((key, index) => {
      scores[key] = (scores[key] || 0) + Math.max(weight - index, 1);
    });
  };

  data.role.timeSinks.forEach((sink) => add(timeSinkMap[sink] || timeSinkMap.Other, 4));
  add(industryMap[data.business.industry] || industryMap.Other, 3);
  add(roleMap[data.role.mainRole] || roleMap["A bit of everything"], 3);

  const ordered = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => agentPool[key])
    .filter(Boolean);

  const unique: AIAgent[] = [];
  const seen = new Set<string>();

  for (const agent of ordered) {
    if (!seen.has(agent.name)) {
      unique.push(agent);
      seen.add(agent.name);
    }
    if (unique.length >= 4) break;
  }

  for (const fallback of [agentPool.projectManager, agentPool.emailAutomation, agentPool.contentWriter]) {
    if (unique.length >= 4) break;
    if (!seen.has(fallback.name)) {
      unique.push(fallback);
      seen.add(fallback.name);
    }
  }

  return unique;
}

export function getSuggestedRole(data: IntakeData) {
  const industry = data.business.industry || "Business";
  const role = data.role.mainRole || "Operator";

  if (industry === "Marketing Agency") return "Growth-focused client delivery team";
  if (industry === "E-commerce") return "Sales and support automation team";
  if (industry === "Real Estate") return "Lead capture and follow-up team";
  if (industry === "Tech / SaaS") return "Operations and product support team";
  if (role.includes("Owner/CEO")) return "Executive AI chief of staff team";
  if (role.includes("operations")) return "Operations automation team";

  return `${industry} AI support team`;
}
