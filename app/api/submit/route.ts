import { NextResponse } from "next/server";
import type { IntakeData } from "@/lib/types";

const TELEGRAM_API_BASE = "https://api.telegram.org";
const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_TELEGRAM_CHAT_ID = "1470176587";
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateLimitStore = new Map<string, number>();

type SubmissionPayload = IntakeData;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getFriendlyValue(value?: string) {
  return value?.trim() || "—";
}

function cleanupRateLimitStore(now: number) {
  for (const [email, timestamp] of rateLimitStore.entries()) {
    if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(email);
    }
  }
}

function buildTelegramSummary(payload: SubmissionPayload) {
  const name = getFriendlyValue(payload.personal.firstName);
  const businessName = getFriendlyValue(payload.business.name);
  const industry = getFriendlyValue(payload.business.industry);
  const email = getFriendlyValue(payload.personal.email);
  const bottleneck = getFriendlyValue(payload.founder.biggestBottleneck);

  return `🧠 New SpawnOS Audit submission: ${name} — ${businessName} (${industry}) — ${email}\nPrimary bottleneck: ${bottleneck}`;
}

function emailShell(title: string, content: string, footer: string) {
  return `
    <div style="margin:0;padding:32px 16px;background-color:#0b0f14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f5f7fa;">
      <div style="max-width:640px;margin:0 auto;background:#111827;border:1px solid #1e293b;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.35);">
        <div style="padding:32px 32px 12px;background:linear-gradient(135deg,#2563EB,#94A3B8);">
          <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;font-weight:700;opacity:0.92;">SpawnOS</div>
          <h1 style="margin:14px 0 0;font-size:28px;line-height:1.2;color:#fff;">${title}</h1>
        </div>
        <div style="padding:32px;line-height:1.7;color:#e5e7eb;font-size:16px;">
          ${content}
        </div>
        <div style="padding:20px 32px;border-top:1px solid #1e293b;color:#94a3b8;font-size:13px;line-height:1.6;">
          ${footer}
        </div>
      </div>
    </div>
  `;
}

function buildConfirmationEmail(payload: SubmissionPayload) {
  const firstName = escapeHtml(payload.personal.firstName || "there");
  const businessName = escapeHtml(getFriendlyValue(payload.business.name));
  const bottleneck = escapeHtml(getFriendlyValue(payload.founder.biggestBottleneck));
  const outcome = escapeHtml(getFriendlyValue(payload.goals.desiredOutcome));

  const content = `
    <p style="margin:0 0 18px;">Thanks for taking the <strong>SpawnOS Audit</strong>, ${firstName}.</p>
    <p style="margin:0 0 18px;">We’re reviewing your operational bottlenecks, AI opportunities, and implementation fit. This is not being treated like a generic signup form — it is the starting point for designing your company’s AI operating blueprint.</p>
    <div style="margin:24px 0;padding:20px;background:#0f172a;border:1px solid #1e293b;border-radius:18px;">
      <div style="font-size:13px;text-transform:uppercase;letter-spacing:0.16em;color:#BFDBFE;font-weight:700;margin-bottom:14px;">Audit snapshot</div>
      <p style="margin:0 0 8px;"><strong>Business:</strong> ${businessName}</p>
      <p style="margin:0 0 8px;"><strong>Primary bottleneck:</strong> ${bottleneck}</p>
      <p style="margin:0;"><strong>Desired outcome:</strong> ${outcome}</p>
    </div>
    <div style="margin:24px 0;padding:20px;background:rgba(37,99,235,0.08);border:1px solid rgba(37,99,235,0.22);border-radius:18px;">
      <div style="font-weight:700;color:#fff;margin-bottom:10px;">What happens next</div>
      <ol style="margin:0;padding-left:22px;">
        <li style="margin-bottom:8px;">We review your bottlenecks, communication load, delegation friction, and AI opportunities.</li>
        <li style="margin-bottom:8px;">If qualified, we come back with the recommended implementation path and fit assessment.</li>
        <li>Your answers are retained as the starting point for implementation, so you won’t need to repeat the same operational context later.</li>
      </ol>
    </div>
    <p style="margin:0;">Questions? Reply to this email.</p>
  `;

  return emailShell("Thanks for taking the SpawnOS Audit", content, "SpawnOS — audit received and under review");
}

function buildAuditReviewEmail(payload: SubmissionPayload) {
  const firstName = escapeHtml(payload.personal.firstName || "there");
  const preferredChannel = escapeHtml(getFriendlyValue(payload.blueprint.preferredChannel));
  const teamSize = escapeHtml(getFriendlyValue(payload.business.teamSize));
  const notes = escapeHtml(getFriendlyValue(payload.blueprint.notesForBlueprint));

  const content = `
    <p style="margin:0 0 18px;">Hey ${firstName} — here’s what your audit submission is being used to produce.</p>
    <div style="margin:24px 0;padding:20px;background:#0f172a;border:1px solid #1e293b;border-radius:18px;">
      <div style="font-weight:700;color:#fff;margin-bottom:10px;">Your review is aimed at:</div>
      <ul style="margin:0;padding-left:20px;">
        <li style="margin-bottom:8px;">Diagnosing the founder bottleneck and key operational drag points</li>
        <li style="margin-bottom:8px;">Mapping where AI can take work out of communication, follow-up, reporting, and coordination</li>
        <li style="margin-bottom:8px;">Recommending the right AI team structure for your current stage</li>
        <li>Defining the implementation blueprint if there is a fit</li>
      </ul>
    </div>
    <div style="margin:24px 0;padding:20px;background:rgba(37,99,235,0.08);border:1px solid rgba(37,99,235,0.22);border-radius:18px;">
      <p style="margin:0 0 8px;"><strong>Team size:</strong> ${teamSize}</p>
      <p style="margin:0 0 8px;"><strong>Preferred channel:</strong> ${preferredChannel}</p>
      <p style="margin:0;"><strong>Implementation notes:</strong> ${notes}</p>
    </div>
    <p style="margin:0;">If we move forward, these answers become the implementation starting point so your team does not have to restate the same context during onboarding.</p>
  `;

  return emailShell("Your SpawnOS Audit is now in review", content, "SpawnOS — bottleneck and AI opportunity review in progress");
}

async function sendTelegramMessage(botToken: string, chatId: string, text: string) {
  const response = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram notification failed: ${errorText}`);
  }
}

async function sendResendEmail(apiKey: string, payload: { to: string; subject: string; html: string }) {
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "SpawnOS <build@spawnos.io>",
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Email delivery failed: ${errorText}`);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SubmissionPayload>;

    const firstName = body.personal?.firstName?.trim() || "";
    const email = body.personal?.email?.trim().toLowerCase() || "";

    if (!firstName || !email) {
      return NextResponse.json({ success: false, error: "Please enter your first name and email to continue." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    const now = Date.now();
    cleanupRateLimitStore(now);
    const lastSubmissionAt = rateLimitStore.get(email);
    if (lastSubmissionAt && now - lastSubmissionAt < RATE_LIMIT_WINDOW_MS) {
      return NextResponse.json(
        { success: false, error: "We just received a submission for this email. Please wait about a minute and try again." },
        { status: 429 }
      );
    }
    rateLimitStore.set(email, now);

    const payload: SubmissionPayload = {
      submittedAt: body.submittedAt || new Date().toISOString(),
      personal: {
        firstName,
        email,
        timezone: body.personal?.timezone?.trim() || "",
      },
      business: {
        name: body.business?.name?.trim() || "",
        industry: body.business?.industry?.trim() || "",
        description: body.business?.description?.trim() || "",
        teamSize: body.business?.teamSize?.trim() || "",
        revenueBand: body.business?.revenueBand?.trim() || "",
        deliveryModel: body.business?.deliveryModel?.trim() || "",
      },
      founder: {
        primaryRole: body.founder?.primaryRole?.trim() || "",
        biggestBottleneck: body.founder?.biggestBottleneck?.trim() || "",
        hoursLostPerWeek: body.founder?.hoursLostPerWeek?.trim() || "",
        currentGrowthConstraint: body.founder?.currentGrowthConstraint?.trim() || "",
      },
      diagnostics: {
        communicationLoad: body.diagnostics?.communicationLoad?.trim() || "",
        followUpLeakage: body.diagnostics?.followUpLeakage?.trim() || "",
        reportingBurden: body.diagnostics?.reportingBurden?.trim() || "",
        delegationFriction: body.diagnostics?.delegationFriction?.trim() || "",
        documentationWeakness: body.diagnostics?.documentationWeakness?.trim() || "",
        coordinationOverhead: body.diagnostics?.coordinationOverhead?.trim() || "",
        toolSprawl: body.diagnostics?.toolSprawl?.trim() || "",
        supportDrag: body.diagnostics?.supportDrag?.trim() || "",
        scaleReadiness: body.diagnostics?.scaleReadiness?.trim() || "",
      },
      goals: {
        implementationGoal: body.goals?.implementationGoal?.trim() || "",
        sixMonthGoals: Array.isArray(body.goals?.sixMonthGoals) ? body.goals.sixMonthGoals.filter(Boolean) : [],
        desiredOutcome: body.goals?.desiredOutcome?.trim() || "",
        biggestProblem: body.goals?.biggestProblem?.trim() || body.founder?.biggestBottleneck?.trim() || "",
      },
      systems: {
        email: body.systems?.email?.trim() || "",
        currentTools: Array.isArray(body.systems?.currentTools) ? body.systems.currentTools.filter(Boolean) : [],
        techComfort: body.systems?.techComfort?.trim() || "",
        sourceOfTruth: body.systems?.sourceOfTruth?.trim() || "",
      },
      tools: {
        email: body.tools?.email?.trim() || body.systems?.email?.trim() || "",
        currentTools: Array.isArray(body.tools?.currentTools)
          ? body.tools.currentTools.filter(Boolean)
          : Array.isArray(body.systems?.currentTools)
            ? body.systems.currentTools.filter(Boolean)
            : [],
        techComfort: body.tools?.techComfort?.trim() || body.systems?.techComfort?.trim() || "",
      },
      aiTeam: {
        agentName: body.aiTeam?.agentName?.trim() || "",
        communicationStyle: body.aiTeam?.communicationStyle?.trim() || "",
      },
      communication: {
        primaryChannel: body.communication?.primaryChannel?.trim() || body.blueprint?.preferredChannel?.trim() || "",
        checkInFrequency: body.communication?.checkInFrequency?.trim() || body.blueprint?.checkInFrequency?.trim() || "",
      },
      blueprint: {
        preferredChannel: body.blueprint?.preferredChannel?.trim() || body.communication?.primaryChannel?.trim() || "",
        checkInFrequency: body.blueprint?.checkInFrequency?.trim() || body.communication?.checkInFrequency?.trim() || "",
        notesForBlueprint: body.blueprint?.notesForBlueprint?.trim() || "",
      },
    };

    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID || DEFAULT_TELEGRAM_CHAT_ID;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!telegramBotToken || !resendApiKey) {
      rateLimitStore.delete(email);
      return NextResponse.json(
        {
          success: false,
          error:
            "This audit form is almost live, but the notification settings are not configured yet. Please try again shortly or contact hello@spawnos.io.",
          missing: {
            telegramBotToken: !telegramBotToken,
            resendApiKey: !resendApiKey,
          },
        },
        { status: 503 }
      );
    }

    await sendTelegramMessage(telegramBotToken, telegramChatId, buildTelegramSummary(payload));

    await sendResendEmail(resendApiKey, {
      to: email,
      subject: "Thanks for taking the SpawnOS Audit",
      html: buildConfirmationEmail(payload),
    });

    await sendResendEmail(resendApiKey, {
      to: email,
      subject: "Your SpawnOS Audit is now in review",
      html: buildAuditReviewEmail(payload),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SpawnOS submit route error", error);
    return NextResponse.json(
      {
        success: false,
        error: "We hit a snag while submitting your audit. Please try again in a moment, or email hello@spawnos.io if it keeps happening.",
      },
      { status: 500 }
    );
  }
}
