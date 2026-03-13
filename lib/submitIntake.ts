import type { IntakeData } from "./types";

const WEBHOOK_URL = "https://hook.us1.make.com/PLACEHOLDER";
const FALLBACK_EMAIL = "hello@spawnos.io";

function buildMailtoBody(data: IntakeData): string {
  const lines = [
    `SpawnOS Audit Submission — ${data.submittedAt}`,
    "",
    `Name: ${data.personal.firstName}`,
    `Email: ${data.personal.email}`,
    `Timezone: ${data.personal.timezone}`,
    "",
    `Business: ${data.business.name} (${data.business.industry})`,
    `Team Size: ${data.business.teamSize}`,
    `Revenue Band: ${data.business.revenueBand}`,
    `Delivery Model: ${data.business.deliveryModel}`,
    `Description: ${data.business.description}`,
    "",
    `Founder Role: ${data.founder.primaryRole}`,
    `Primary Bottleneck: ${data.founder.biggestBottleneck}`,
    `Hours Lost / Week: ${data.founder.hoursLostPerWeek}`,
    `Current Growth Constraint: ${data.founder.currentGrowthConstraint}`,
    "",
    `Communication Load: ${data.diagnostics.communicationLoad}`,
    `Follow-Up Leakage: ${data.diagnostics.followUpLeakage}`,
    `Reporting Burden: ${data.diagnostics.reportingBurden}`,
    `Delegation Friction: ${data.diagnostics.delegationFriction}`,
    `Documentation Weakness: ${data.diagnostics.documentationWeakness}`,
    `Coordination Overhead: ${data.diagnostics.coordinationOverhead}`,
    `Tool Sprawl: ${data.diagnostics.toolSprawl}`,
    `Support Drag: ${data.diagnostics.supportDrag}`,
    `Scale Readiness: ${data.diagnostics.scaleReadiness}`,
    "",
    `Implementation Goal: ${data.goals.implementationGoal}`,
    `6-Month Goals: ${data.goals.sixMonthGoals.join(", ")}`,
    `Desired Outcome: ${data.goals.desiredOutcome}`,
    "",
    `Email Platform: ${data.systems.email}`,
    `Current Tools: ${data.systems.currentTools.join(", ")}`,
    `Tech Comfort: ${data.systems.techComfort}`,
    `Source of Truth: ${data.systems.sourceOfTruth}`,
    "",
    `Preferred Channel: ${data.blueprint.preferredChannel}`,
    `Check-In Frequency: ${data.blueprint.checkInFrequency}`,
    `Blueprint Notes: ${data.blueprint.notesForBlueprint}`,
  ];
  return lines.join("\n");
}

export async function submitIntake(data: IntakeData): Promise<void> {
  const payload = { ...data, submittedAt: new Date().toISOString() };

  console.log("[SpawnOS Audit]", JSON.stringify(payload, null, 2));

  if (typeof window !== "undefined") {
    localStorage.setItem("spawnos-intake", JSON.stringify(payload));
  }

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("[SpawnOS] Webhook POST failed (using mailto fallback):", err);
  }

  if (typeof window !== "undefined") {
    const subject = encodeURIComponent(`SpawnOS Audit: ${data.personal.firstName} — ${data.business.name}`);
    const body = encodeURIComponent(buildMailtoBody(payload));
    window.open(`mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${body}`, "_blank");
  }
}
