import { NextRequest, NextResponse } from "next/server";
import {
  buildLiveChatSystemPrompt,
  matchSiteChatAnswer,
} from "@/lib/live-chat-site-brain";
import { generateBotReply } from "@/lib/live-chat";

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

function localEnglishReply(message: string, agentName?: string) {
  const site = matchSiteChatAnswer(message);
  if (site) {
    return { body: site.answer, agentName, source: "site-brain" as const };
  }
  const legacy = generateBotReply(message, agentName);
  return { ...legacy, source: "knowledge" as const };
}

async function aiReply(
  message: string,
  history: HistoryItem[],
  path?: string,
): Promise<string | null> {
  const cfg = getAiConfig();
  if (!cfg) return null;

  const system = buildLiveChatSystemPrompt();
  const recent = history.slice(-10).map((h) => ({
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
      temperature: 0.4,
      max_tokens: 280,
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
  // Force English-looking output; reject obvious non-Latin dumps
  const latinRatio =
    (text.match(/[A-Za-z]/g)?.length ?? 0) / Math.max(text.length, 1);
  if (latinRatio < 0.55) return null;
  return text.slice(0, 1200);
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

  // Admin has the chat — never invent a bot answer
  if (body.adminTakeover) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "admin_takeover",
    });
  }

  const agentName = body.agentName;
  const history = Array.isArray(body.history) ? body.history : [];

  try {
    const ai = await aiReply(message, history, body.path);
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

  const local = localEnglishReply(message, agentName);
  return NextResponse.json({ ok: true, ...local });
}
