export interface IntakeData {
  submittedAt: string;
  personal: {
    firstName: string;
    email: string;
    timezone: string;
  };
  business: {
    name: string;
    industry: string;
    description: string;
    teamSize: string;
    revenueBand: string;
    deliveryModel: string;
  };
  founder: {
    primaryRole: string;
    biggestBottleneck: string;
    hoursLostPerWeek: string;
    currentGrowthConstraint: string;
  };
  diagnostics: {
    communicationLoad: string;
    followUpLeakage: string;
    reportingBurden: string;
    delegationFriction: string;
    documentationWeakness: string;
    coordinationOverhead: string;
    toolSprawl: string;
    supportDrag: string;
    scaleReadiness: string;
  };
  goals: {
    implementationGoal: string;
    sixMonthGoals: string[];
    desiredOutcome: string;
    biggestProblem: string;
  };
  systems: {
    email: string;
    currentTools: string[];
    techComfort: string;
    sourceOfTruth: string;
  };
  tools: {
    email: string;
    currentTools: string[];
    techComfort: string;
  };
  aiTeam: {
    agentName: string;
    communicationStyle: string;
  };
  communication: {
    primaryChannel: string;
    checkInFrequency: string;
  };
  blueprint: {
    preferredChannel: string;
    checkInFrequency: string;
    notesForBlueprint: string;
  };
}

export const defaultIntakeData: IntakeData = {
  submittedAt: "",
  personal: { firstName: "", email: "", timezone: "" },
  business: { name: "", industry: "", description: "", teamSize: "", revenueBand: "", deliveryModel: "" },
  founder: { primaryRole: "", biggestBottleneck: "", hoursLostPerWeek: "", currentGrowthConstraint: "" },
  diagnostics: {
    communicationLoad: "",
    followUpLeakage: "",
    reportingBurden: "",
    delegationFriction: "",
    documentationWeakness: "",
    coordinationOverhead: "",
    toolSprawl: "",
    supportDrag: "",
    scaleReadiness: "",
  },
  goals: { implementationGoal: "", sixMonthGoals: [], desiredOutcome: "", biggestProblem: "" },
  systems: { email: "", currentTools: [], techComfort: "", sourceOfTruth: "" },
  tools: { email: "", currentTools: [], techComfort: "" },
  aiTeam: { agentName: "", communicationStyle: "" },
  communication: { primaryChannel: "", checkInFrequency: "" },
  blueprint: { preferredChannel: "", checkInFrequency: "", notesForBlueprint: "" },
};

export interface AIAgent {
  name: string;
  role: string;
  description: string;
  icon: string;
}
