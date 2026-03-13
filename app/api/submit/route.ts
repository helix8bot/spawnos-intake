import { NextResponse } from "next/server";
import type { IntakeData } from "@/lib/types";

const TELEGRAM_API_BASE = "https://api.telegram.org";
const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_TELEGRAM_CHAT_ID = "1470176587";
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateLimitStore = new Map<string, number>();

type SubmissionPayload = IntakeData;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

  return `📋 New SpawnOS audit application: ${name} — ${businessName} (${industry}) — ${email}`;
}

function emailShell(title: string, content: string, footer: string) {
  return `
    <div style="margin:0;padding:32px 16px;background-color:#0b0b0b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f5f5f5;">
      <div style="max-width:640px;margin:0 auto;background:#141414;border:1px solid #27272a;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.35);">
        <div style="padding:32px 32px 12px;background:linear-gradient(135deg,#2563EB,#94A3B8);">
          <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;font-weight:700;opacity:0.92;">SpawnOS</div>
          <h1 style="margin:14px 0 0;font-size:28px;line-height:1.2;color:#fff;">${title}</h1>
        </div>
        <div style="padding:32px;line-height:1.7;color:#e4e4e7;font-size:16px;">
          ${content}
        </div>
        <div style="padding:20px 32px;border-top:1px solid #27272a;color:#a1a1aa;font-size:13px;line-height:1.6;">
          ${footer}
        </div>
      </div>
    </div>
  `;
}

function buildConfirmationEmail(payload: SubmissionPayload) {
  const firstName = escapeHtml(payload.personal.firstName || "there");
  const businessName = escapeHtml(getFriendlyValue(payload.business.name));
  const industry = escapeHtml(getFriendlyValue(payload.business.industry));
  const agentName = escapeHtml(getFriendlyValue(payload.aiTeam.agentName || "Your AI CIO"));
  const communicationStyle = escapeHtml(getFriendlyValue(payload.aiTeam.communicationStyle));

  const content = `
    <p style="margin:0 0 18px;">Hey ${firstName}!</p>
    <p style="margin:0 0 18px;">We received your SpawnOS Audit application and will review it for fit, timing, and implementation readiness.</p>
    <div style="margin:24px 0;padding:20px;background:#0f0f10;border:1px solid #27272a;border-radius:18px;">
      <div style="font-size:13px;text-transform:uppercase;letter-spacing:0.16em;color:#BFDBFE;font-weight:700;margin-bottom:14px;">Your application</div>
      <p style="margin:0 0 8px;"><strong>Business:</strong> ${businessName}</p>
      <p style="margin:0 0 8px;"><strong>Industry:</strong> ${industry}</p>
      <p style="margin:0 0 8px;"><strong>AI assistant:</strong> ${agentName}</p>
      <p style="margin:0;"><strong>Communication style:</strong> ${communicationStyle}</p>
    </div>
    <div style="margin:24px 0;padding:20px;background:rgba(37,99,235,0.08);border:1px solid rgba(37,99,235,0.22);border-radius:18px;">
      <div style="font-weight:700;color:#fff;margin-bottom:10px;">What happens next:</div>
      <ol style="margin:0;padding-left:22px;">
        <li style="margin-bottom:8px;">We review the application for fit, urgency, and operating complexity</li>
        <li style="margin-bottom:8px;">If approved, we’ll send the next step to schedule the audit conversation</li>
        <li>If there’s a fit, the audit leads into a recommended SpawnOS implementation path</li>
      </ol>
    </div>
    <p style="margin:0;">Questions? Reply to this email.</p>
  `;

  return emailShell(
    "SpawnOS Audit application received", 
    content,
    "SpawnOS — Audit application received"
  );
}

function buildInstallInstructionsEmail(payload: SubmissionPayload) {
  const firstName = escapeHtml(payload.personal.firstName || "there");
  const agentName = escapeHtml(payload.aiTeam.agentName || "your preferred assistant name");
  const primaryChannel = escapeHtml(getFriendlyValue(payload.communication.primaryChannel));
  const communicationStyle = escapeHtml(getFriendlyValue(payload.aiTeam.communicationStyle));

  const content = `
    <p style="margin:0 0 18px;">Hey ${firstName} — here’s what to expect from the SpawnOS Audit process.</p>
    <div style="margin:24px 0;padding:20px;background:#0f0f10;border:1px solid #27272a;border-radius:18px;">
      <p style="margin:0 0 8px;"><strong>Preferred assistant name:</strong> ${agentName}</p>
      <p style="margin:0 0 8px;"><strong>Communication style:</strong> ${communicationStyle}</p>
      <p style="margin:0;"><strong>Preferred channel:</strong> ${primaryChannel}</p>
    </div>
    <div style="margin:24px 0;">
      <div style="font-weight:700;color:#fff;margin-bottom:10px;">What the audit is designed to do</div>
      <ol style="margin:0;padding-left:22px;">
        <li style="margin-bottom:8px;">Diagnose where leadership is still acting as the operating system</li>
        <li style="margin-bottom:8px;">Map the workflows where follow-up, reporting, and delegation break down</li>
        <li style="margin-bottom:8px;">Identify the highest-leverage AI team opportunities</li>
        <li>Recommend the right SpawnOS install path if there is a fit</li>
      </ol>
    </div>
    <div style="margin:24px 0;padding:20px;background:rgba(37,99,235,0.08);border:1px solid rgba(37,99,235,0.22);border-radius:18px;">
      <div style="font-weight:700;color:#fff;margin-bottom:10px;">Helpful before the conversation</div>
      <ul style="margin:0;padding-left:20px;">
        <li style="margin-bottom:8px;">Be ready to describe the main operating bottlenecks in the business</li>
        <li style="margin-bottom:8px;">Know which tools and communication channels your team already relies on</li>
        <li>Have the decision-maker available if implementation would require approval</li>
      </ul>
    </div>
    <p style="margin:0;">Need help? Reply to this email and we’ll point you in the right direction.</p>
  `;

  return emailShell(
    "What to expect from your SpawnOS Audit",
    content,
    "SpawnOS — audit process and next steps"
  );
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
      return NextResponse.json(
        { success: false, error: "Please enter your first name and email to continue." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const now = Date.now();
    cleanupRateLimitStore(now);
    const lastSubmissionAt = rateLimitStore.get(email);
    if (lastSubmissionAt && now - lastSubmissionAt < RATE_LIMIT_WINDOW_MS) {
      return NextResponse.json(
        {
          success: false,
          error: "We just received a submission for this email. Please wait about a minute and try again.",
        },
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
      },
      role: {
        mainRole: body.role?.mainRole?.trim() || "",
        timeSinks: Array.isArray(body.role?.timeSinks) ? body.role!.timeSinks.filter(Boolean) : [],
      },
      goals: {
        biggestProblem: body.goals?.biggestProblem?.trim() || "",
        sixMonthGoals: Array.isArray(body.goals?.sixMonthGoals) ? body.goals!.sixMonthGoals.filter(Boolean) : [],
      },
      tools: {
        email: body.tools?.email?.trim() || "",
        currentTools: Array.isArray(body.tools?.currentTools) ? body.tools!.currentTools.filter(Boolean) : [],
        techComfort: body.tools?.techComfort?.trim() || "",
      },
      aiTeam: {
        agentName: body.aiTeam?.agentName?.trim() || "",
        communicationStyle: body.aiTeam?.communicationStyle?.trim() || "",
      },
      communication: {
        primaryChannel: body.communication?.primaryChannel?.trim() || "",
        checkInFrequency: body.communication?.checkInFrequency?.trim() || "",
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
            "This intake form is almost live, but the notification settings are not configured yet. Please try again shortly or contact hello@spawnos.io.",
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
      subject: "SpawnOS Audit application received",
      html: buildConfirmationEmail(payload),
    });

    await sendResendEmail(resendApiKey, {
      to: email,
      subject: "What to expect from your SpawnOS Audit",
      html: buildInstallInstructionsEmail(payload),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SpawnOS submit route error", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "We hit a snag while submitting your intake. Please try again in a moment, or email hello@spawnos.io if it keeps happening.",
      },
      { status: 500 }
    );
  }
}
