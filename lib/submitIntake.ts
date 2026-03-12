import type { IntakeData } from "./types";

const WEBHOOK_URL = "https://hook.us1.make.com/PLACEHOLDER";
const FALLBACK_EMAIL = "hello@peptidelaunch.com";

function buildMailtoBody(data: IntakeData): string {
  const lines = [
    `SpawnOS Intake Submission — ${data.submittedAt}`,
    "",
    `Name: ${data.personal.firstName}`,
    `Email: ${data.personal.email}`,
    `Timezone: ${data.personal.timezone}`,
    "",
    `Business: ${data.business.name} (${data.business.industry})`,
    `Team Size: ${data.business.teamSize}`,
    `Description: ${data.business.description}`,
    "",
    `Role: ${data.role.mainRole}`,
    `Time Sinks: ${data.role.timeSinks.join(", ")}`,
    "",
    `Biggest Problem: ${data.goals.biggestProblem}`,
    `6-Month Goals: ${data.goals.sixMonthGoals.join(", ")}`,
    "",
    `Email Platform: ${data.tools.email}`,
    `Current Tools: ${data.tools.currentTools.join(", ")}`,
    `Tech Comfort: ${data.tools.techComfort}`,
    "",
    `Agent Name: ${data.aiTeam.agentName}`,
    `Communication Style: ${data.aiTeam.communicationStyle}`,
    "",
    `Primary Channel: ${data.communication.primaryChannel}`,
    `Check-In Frequency: ${data.communication.checkInFrequency}`,
  ];
  return lines.join("\n");
}

export async function submitIntake(data: IntakeData): Promise<void> {
  const payload = { ...data, submittedAt: new Date().toISOString() };

  // 1. Console log
  console.log("[SpawnOS Intake]", JSON.stringify(payload, null, 2));

  // 2. LocalStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("spawnos-intake", JSON.stringify(payload));
  }

  // 3. POST to webhook (best-effort)
  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("[SpawnOS] Webhook POST failed (using mailto fallback):", err);
  }

  // 4. Mailto fallback
  if (typeof window !== "undefined") {
    const subject = encodeURIComponent(`SpawnOS Intake: ${data.personal.firstName} — ${data.business.name}`);
    const body = encodeURIComponent(buildMailtoBody(payload));
    window.open(`mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${body}`, "_blank");
  }
}
