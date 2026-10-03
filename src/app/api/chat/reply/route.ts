import { NextRequest, NextResponse } from "next/server";
import {
  buildLiveChatSystemPrompt,
  matchSiteChatAnswer,
} from "@/lib/live-chat-site-brain";
import { PACKAGE_DISCOUNT_PERCENT } from "@/data/packages";
import { resolveConversationalReply } from "@/lib/live-chat-conversation";
import { ensureSalePricingCopy, generateBotReply } from "@/lib/live-chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HistoryItem = { role: "visitor" | "bot" | "admin"; body: string };

function getAiConfig(): {
  apiKey: string;
  baseUrl: string;
  model: string;
} | null {
  const openai = (process.env.OPENAI_API_KEY ?? "").trim();
  if (openai) {
    return {
      apiKey: openai,
      baseUrl: (
        process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"
      ).replace(/\/$/, ""),
      model: (process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini").trim(),
    };
  }
  const groq = (process.env.GROQ_API_KEY ?? "").trim();
  if (groq) {
    return {
      apiKey: groq,
      baseUrl: "https://api.groq.com/openai/v1",
      model: (process.env.GROQ_CHAT_MODEL ?? "llama-3.3-70b-versatile").trim(),
    };
  }
  return null;
}

function groundedReply(
  message: string,
  history: HistoryItem[],
  path: string | undefined,
  agentName?: string,
) {
  const convo = resolveConversationalReply(message, history, path);
  if (convo) {
    return {
      body: ensureSalePricingCopy(convo.body),
      agentName,
      source: "conversation" as const,
    };
  }

  const site = matchSiteChatAnswer(message);
  if (site) {
    return {
      body: ensureSalePricingCopy(site.answer),
      agentName,
      source: "site-brain" as const,
    };
  }

  const legacy = generateBotReply(message, agentName, history);
  return {
    body: ensureSalePricingCopy(legacy.body),
    agentName: legacy.agentName,
    source: "knowledge" as const,
  };
}

async function aiReply(
  message: string,
  history: HistoryItem[],
  path?: string,
): Promise<string | null> {
  const cfg = getAiConfig();
  if (!cfg) return null;

  const system = `${buildLiveChatSystemPrompt()}

MULTI-TURN RULES:
- Use the full chat history. Short replies like "pricing", "basic", "bronze", or "yes" refer to the previous topic.
- If the visitor asks for a basic/starter package, that means Bronze contest tier on sale.
- Never repeat the same clarifying question twice. If still unclear, give Bronze sale pricing and ask which service.
- Always mention the live ${PACKAGE_DISCOUNT_PERCENT}% package sale and sale starting price when discussing packages.`;

  const recent = history.slice(-12).map((h) => ({
    role: h.role === "visitor" ? ("user" as const) : ("assistant" as const),
    content: h.body.slice(0, 800),
  }));

  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0.35,
      max_tokens: 320,
      messages: [
        { role: "system", content: system },
        ...recent,
        {
          role: "user",
          content: path
            ? `Visitor is on page: ${path}\n\nMessage: ${message}`
            : message,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("chat AI error", res.status, errText.slice(0, 300));
    return null;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) return null;
  const latinRatio =
    (text.match(/[A-Za-z]/g)?.length ?? 0) / Math.max(text.length, 1);
  if (latinRatio < 0.55) return null;

  // Block AI from looping the old clarify script
  if (
    /pricing, turnaround, contests, or hiring a designer/i.test(text) &&
    history.some((h) =>
      /pricing, turnaround, contests, or hiring a designer/i.test(h.body),
    )
  ) {
    return null;
  }

  return ensureSalePricingCopy(text.slice(0, 1200));
}

export async function POST(req: NextRequest) {
  let body: {
    message?: string;
    agentName?: string;
    path?: string;
    history?: HistoryItem[];
    adminTakeover?: boolean;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const message = String(body.message ?? "").trim();
  if (!message || message.length > 2000) {
    return NextResponse.json(
      { ok: false, error: "Message required" },
      { status: 400 },
    );
  }

  if (body.adminTakeover) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "admin_takeover",
    });
  }

  const agentName = body.agentName;
  const history = Array.isArray(body.history) ? body.history : [];
  const path = body.path;

  // Grounded multi-turn engine first (works without AI keys)
  const grounded = groundedReply(message, history, path, agentName);
  if (grounded.source === "conversation" || grounded.source === "site-brain") {
    return NextResponse.json({ ok: true, ...grounded });
  }

  // Optional AI for open-ended questions only
  try {
    const ai = await aiReply(message, history, path);
    if (ai) {
      return NextResponse.json({
        ok: true,
        body: ai,
        agentName,
        source: "ai",
      });
    }
  } catch (e) {
    console.error("chat AI exception", e);
  }

  return NextResponse.json({ ok: true, ...grounded });
}
