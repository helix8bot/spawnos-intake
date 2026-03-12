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
  };
  role: {
    mainRole: string;
    timeSinks: string[];
  };
  goals: {
    biggestProblem: string;
    sixMonthGoals: string[];
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
}

export const defaultIntakeData: IntakeData = {
  submittedAt: "",
  personal: { firstName: "", email: "", timezone: "" },
  business: { name: "", industry: "", description: "", teamSize: "" },
  role: { mainRole: "", timeSinks: [] },
  goals: { biggestProblem: "", sixMonthGoals: [] },
  tools: { email: "", currentTools: [], techComfort: "" },
  aiTeam: { agentName: "", communicationStyle: "" },
  communication: { primaryChannel: "", checkInFrequency: "" },
};

export interface AIAgent {
  name: string;
  role: string;
  description: string;
  icon: string;
}
