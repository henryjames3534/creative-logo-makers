"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/Button";
import { Container } from "@/components/Section";
import { categoryDetailsHref } from "@/data/serviceRoutes";
import {
  formatMoney,
  statusLabel,
  type ServiceMessage,
  type UserService,
} from "@/lib/auth-storage";
import { getDesignerByHandle } from "@/data/designers";

function resolveDesignerId(nameOrId: string, fallbackName: string) {
  if (nameOrId && !nameOrId.startsWith("name:") && nameOrId !== "general") {
    return { id: nameOrId, name: fallbackName };
  }
  const hit = getDesignerByHandle(fallbackName);
  if (hit) return { id: hit.id, name: hit.name };
  return {
    id: `custom_${fallbackName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    name: fallbackName,
  };
}

type Tab = "overview" | "services" | "purchases" | "activity";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusTone(status: UserService["status"]) {
  switch (status) {
    case "completed":
      return "bg-green/15 text-green";
    case "revisions":
      return "bg-violet/15 text-violet";
    case "designs_incoming":
      return "bg-blue/15 text-blue";
    case "selecting":
      return "bg-hero/15 text-hero";
    default:
      return "bg-ink/10 text-ink";
  }
}

function ProgressTrack({ service }: { service: UserService }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-ink">Work progress</span>
        <span className="font-bold text-violet">{service.progress}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[#e8e6e3]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet to-[#6b4cff] transition-all duration-500"
          style={{ width: `${service.progress}%` }}
        />
      </div>
      <ol className="mt-5 space-y-3">
        {service.steps.map((step) => (
          <li key={step.id} className="flex gap-3">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                step.done
                  ? "bg-green !text-white"
                  : step.active
                    ? "bg-violet !text-white ring-4 ring-violet/20"
                    : "bg-[#e4e3e0] text-muted"
              }`}
            >
              {step.done ? "✓" : ""}
            </span>
            <div>
              <p
                className={`text-sm font-semibold ${
                  step.active ? "text-violet" : "text-ink"
                }`}
              >
                {step.label}
              </p>
              <p className="text-xs text-muted">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function MessageThread({
  messages,
  onSend,
}: {
  messages: ServiceMessage[];
  onSend: (body: string) => void;
}) {
  const [text, setText] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  }
  return (
    <div>
      <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
        {messages.map((m) => (
          <li
            key={m.id}
            className={`rounded-xl px-3.5 py-3 text-sm ${
              m.from === "you"
                ? "ml-6 bg-violet/10"
                : m.from === "admin"
                  ? "mr-4 border border-line bg-paper-soft"
                  : m.from === "designer"
                    ? "mr-4 border border-coral/25 bg-coral/5"
                    : "mr-4 bg-white ring-1 ring-line"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted">
                {m.author}
                {m.from === "designer" && m.body.startsWith("Action needed:")
                  ? " · Action needed"
                  : ""}
              </span>
              <span className="text-[11px] text-muted">{timeAgo(m.createdAt)}</span>
            </div>
            <p className="mt-1 leading-relaxed text-ink">{m.body}</p>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message admin or designers…"
          className="flex-1 rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-violet"
        />
        <button
          type="submit"
          className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold !text-white hover:bg-black"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function ProjectReviewForm({
  service,
  onDone,
}: {
  service: UserService;
  onDone: () => void;
}) {
  const { completeWithReview } = useAuth();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const designerOptions = useMemo(() => {
    const opts: { id: string; name: string }[] = [];
    if (service.designerId) {
      opts.push({
        id: service.designerId,
        name: service.designerName || "Hired designer",
      });
    }
    for (const c of service.concepts) {
      if (c.selected || c.liked) {
        const id = `name:${c.designerName}`;
        if (!opts.some((o) => o.name === c.designerName)) {
          opts.push({ id: service.designerId || id, name: c.designerName });
        }
      }
    }
    for (const c of service.concepts) {
      if (!opts.some((o) => o.name === c.designerName)) {
        opts.push({
          id: service.designerId || `name:${c.designerName}`,
          name: c.designerName,
        });
      }
    }
    if (!opts.length) {
      opts.push({ id: "general", name: "Creative Logo Makers team" });
    }
    return opts;
  }, [service]);

  const [designerKey, setDesignerKey] = useState(designerOptions[0]?.id || "");

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const chosen =
      designerOptions.find((d) => d.id === designerKey) || designerOptions[0];
    const resolved = resolveDesignerId(chosen.id, chosen.name);
    const res = completeWithReview({
      serviceId: service.id,
      rating,
      body,
      designerId: resolved.id,
      designerName: resolved.name,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onDone();
  }

  if (service.reviewId && service.reviewStatus !== "rejected") {
    return (
      <div className="rounded-2xl border border-green/30 bg-green/5 p-5">
        <p className="font-semibold text-ink">Review submitted</p>
        <p className="mt-1 text-sm text-muted">
          Status:{" "}
          <span className="font-semibold text-ink">
            {service.reviewStatus === "approved"
              ? "Approved — live on the designer profile"
              : "Pending admin approval"}
          </span>
          . Thank you for rating this project.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-coral/30 bg-coral/5 p-5"
    >
      <h3 className="text-lg font-semibold text-ink">
        Project done — leave a required review
      </h3>
      <p className="mt-1 text-sm text-muted">
        Rating + feedback is mandatory when you mark a project complete. It goes
        live on the website after admin approval.
      </p>

      <label className="mt-4 block text-sm font-semibold text-ink">
        Designer
        <select
          value={designerKey}
          onChange={(e) => setDesignerKey(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-violet"
        >
          {designerOptions.map((d) => (
            <option key={d.id + d.name} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4">
        <p className="text-sm font-semibold text-ink">Your rating</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`h-10 w-10 rounded-lg text-lg transition ${
                n <= rating
                  ? "bg-coral !text-white"
                  : "border border-line bg-white text-muted hover:border-coral/40"
              }`}
              aria-label={`${n} stars`}
            >
              ★
            </button>
          ))}
          <span className="ml-2 self-center text-sm font-semibold text-ink">
            {rating}/5
          </span>
        </div>
      </div>

      <label className="mt-4 block text-sm font-semibold text-ink">
        Your review
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          required
          minLength={12}
          placeholder="How was the quality, communication, and final delivery?"
          className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-violet"
        />
      </label>

      {error ? (
        <p className="mt-3 text-sm font-medium text-coral">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="mt-4 w-full rounded-full bg-cta px-5 py-3 text-sm font-semibold !text-white hover:bg-cta-hover disabled:opacity-60 sm:w-auto"
      >
        {busy ? "Submitting…" : "Submit review & complete project"}
      </button>
    </form>
  );
}

function ServiceDetail({
  service,
  onBack,
}: {
  service: UserService;
  onBack: () => void;
}) {
  const {
    requestRevisionOn,
    sendMessageOn,
    likeConcept,
    selectWinner,
    refreshUpdates,
  } = useAuth();
  const [revisionNote, setRevisionNote] = useState("");
  const [panel, setPanel] = useState<
    "progress" | "concepts" | "revisions" | "messages" | "review"
  >("progress");
  const [reviewFlash, setReviewFlash] = useState(false);

  const needsReview =
    !service.reviewId || service.reviewStatus === "rejected";
  const canComplete =
    needsReview &&
    (service.status === "revisions" ||
      service.status === "selecting" ||
      service.status === "completed" ||
      service.progress >= 70);

  function submitRevision(e: FormEvent) {
    e.preventDefault();
    requestRevisionOn(service.id, revisionNote);
    setRevisionNote("");
    setPanel("revisions");
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-semibold text-violet hover:underline"
      >
        ← All services
      </button>

      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
              {service.orderId} · {service.packageName}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">
              {service.categoryName}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Purchased {formatDate(service.createdAt)} · Due{" "}
              {formatDate(service.deadline)}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${statusTone(service.status)}`}
            >
              {statusLabel[service.status]}
            </span>
            <p className="mt-2 text-lg font-bold text-ink">
              {formatMoney(service.amountPaid, service.currency)}
            </p>
            <p className="text-xs text-muted">
              {service.paymentStatus} · {service.paymentMethod}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {[
            { l: "Designers", v: String(service.designerCount) },
            { l: "Concepts", v: String(service.concepts.length) },
            {
              l: "Revisions left",
              v: String(
                Math.max(0, service.revisionLimit - service.revisionsUsed),
              ),
            },
            { l: "Progress", v: `${service.progress}%` },
          ].map((x) => (
            <div
              key={x.l}
              className="rounded-xl bg-paper-soft px-4 py-3 text-center"
            >
              <p className="text-lg font-bold text-ink">{x.v}</p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                {x.l}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(
            [
              ["progress", "Progress"],
              ["concepts", "Concepts"],
              ["revisions", "Revisions"],
              ["messages", "Messages"],
              ["review", "Review"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setPanel(id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                panel === id
                  ? "bg-ink !text-white"
                  : "border border-line text-ink hover:border-ink/40"
              }`}
            >
              {label}
              {id === "review" && needsReview ? (
                <span className="ml-1 text-coral">·</span>
              ) : null}
            </button>
          ))}
          {canComplete ? (
            <button
              type="button"
              onClick={() => setPanel("review")}
              className="rounded-full bg-coral px-3.5 py-1.5 text-sm font-semibold !text-white hover:brightness-95"
            >
              Mark done & review
            </button>
          ) : null}
          <button
            type="button"
            onClick={refreshUpdates}
            className="ml-auto text-sm font-semibold text-violet hover:underline"
          >
            Sync admin progress
          </button>
        </div>
      </div>

      {canComplete && panel !== "review" ? (
        <div className="rounded-2xl border border-coral/25 bg-coral/5 px-5 py-4 text-sm text-ink">
          Project looks ready to close.{" "}
          <button
            type="button"
            onClick={() => setPanel("review")}
            className="font-semibold text-coral underline underline-offset-2"
          >
            Leave a required rating & review
          </button>{" "}
          to mark it complete.
        </div>
      ) : null}

      {reviewFlash ? (
        <div className="rounded-2xl border border-green/30 bg-green/5 px-5 py-4 text-sm font-semibold text-ink">
          Review submitted — waiting for admin approval before it lists publicly.
        </div>
      ) : null}

      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
        {panel === "progress" ? <ProgressTrack service={service} /> : null}

        {panel === "review" ? (
          <ProjectReviewForm
            service={service}
            onDone={() => {
              setReviewFlash(true);
              setPanel("progress");
            }}
          />
        ) : null}

        {panel === "concepts" ? (
          <div>
            <h3 className="font-semibold text-ink">Designer concepts</h3>
            <p className="mt-1 text-sm text-muted">
              Like favorites, then select a winner to open revisions.
            </p>
            {service.concepts.length === 0 ? (
              <p className="mt-6 text-sm text-muted">
                No concepts yet — hit “Sync admin progress” or wait for
                designers.
              </p>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {service.concepts.map((c) => (
                  <div
                    key={c.id}
                    className={`overflow-hidden rounded-xl border ${
                      c.selected
                        ? "border-violet ring-2 ring-violet/30"
                        : "border-line"
                    }`}
                  >
                    <div className="relative aspect-[4/3] bg-paper-soft">
                      <Image
                        src={c.image}
                        alt={c.title}
                        fill
                        sizes="280px"
                        className="object-cover"
                      />
                      {c.selected ? (
                        <span className="absolute left-2 top-2 rounded-full bg-violet px-2 py-0.5 text-[10px] font-bold !text-white">
                          Winner
                        </span>
                      ) : null}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-ink">{c.title}</p>
                      <p className="text-xs text-muted">{c.designerName}</p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => likeConcept(service.id, c.id)}
                          className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold ${
                            c.liked
                              ? "border-coral bg-coral/10 text-coral"
                              : "border-line text-ink"
                          }`}
                        >
                          {c.liked ? "Liked" : "Like"}
                        </button>
                        {!c.selected ? (
                          <button
                            type="button"
                            onClick={() => selectWinner(service.id, c.id)}
                            className="flex-1 rounded-lg bg-ink px-2 py-1.5 text-xs font-semibold !text-white"
                          >
                            Select
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {panel === "revisions" ? (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="font-semibold text-ink">Revision requests</h3>
                <p className="mt-1 text-sm text-muted">
                  {service.revisionsUsed} / {service.revisionLimit} used · Admin
                  & designers respond here
                </p>
              </div>
            </div>

            <form onSubmit={submitRevision} className="mt-4 space-y-3">
              <textarea
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                rows={3}
                placeholder="Describe changes clearly (colors, spacing, typography, what to keep)…"
                className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-violet"
              />
              <button
                type="submit"
                disabled={
                  service.revisionsUsed >= service.revisionLimit ||
                  revisionNote.trim().length < 8
                }
                className="rounded-full bg-violet px-5 py-2.5 text-sm font-semibold !text-white hover:bg-[#3200a8] disabled:opacity-50"
              >
                Send revision request
              </button>
            </form>

            <ul className="mt-6 space-y-3">
              {service.revisions.length === 0 ? (
                <li className="text-sm text-muted">No revision requests yet.</li>
              ) : (
                service.revisions.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-xl border border-line bg-paper-soft p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          r.status === "delivered"
                            ? "bg-green/15 text-green"
                            : r.status === "in_progress"
                              ? "bg-blue/15 text-blue"
                              : "bg-ink/10 text-ink"
                        }`}
                      >
                        {r.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-muted">
                        {timeAgo(r.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-ink">{r.note}</p>
                    {r.adminReply ? (
                      <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs text-muted">
                        Admin: {r.adminReply}
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-muted">
                        Waiting on designer / admin response…
                      </p>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        ) : null}

        {panel === "messages" ? (
          <div>
            <h3 className="mb-4 font-semibold text-ink">
              Messages · admin & designers
            </h3>
            <p className="mb-3 text-sm text-muted">
              Designers can leave remarks or request files / feedback here. Reply
              below when something is marked Action needed.
            </p>
            <MessageThread
              messages={service.messages}
              onSend={(body) => sendMessageOn(service.id, body)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AccountDashboard() {
  const {
    user,
    ready,
    signOut,
    refreshUpdates,
    seedDemo,
  } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !user) {
      router.replace("/login?next=/account");
    }
  }, [ready, user, router]);

  useEffect(() => {
    if (user && user.services.length > 0) {
      refreshUpdates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const stats = useMemo(() => {
    if (!user) {
      return { spent: 0, active: 0, concepts: 0, revisions: 0 };
    }
    return {
      spent: user.services.reduce((n, s) => n + (s.amountPaid || 0), 0),
      active: user.services.filter((s) => s.status !== "completed").length,
      concepts: user.services.reduce((n, s) => n + s.concepts.length, 0),
      revisions: user.services.reduce((n, s) => n + s.revisions.length, 0),
    };
  }, [user]);

  const allUpdates = useMemo(() => {
    if (!user) return [];
    return user.services
      .flatMap((s) =>
        s.updates.map((u) => ({
          ...u,
          serviceName: s.categoryName,
          packageName: s.packageName,
          serviceId: s.id,
        })),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [user]);

  if (!ready || !user) {
    return (
      <section className="py-24">
        <Container>
          <p className="text-center text-muted">Loading your account…</p>
        </Container>
      </section>
    );
  }

  const activeService =
    user.services.find((s) => s.id === activeServiceId) ?? null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "services", label: "My services" },
    { id: "purchases", label: "Purchase history" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <div className="min-h-screen bg-[#f3f2f0]">
      <section className="border-b border-line bg-[#1c1b1a] !text-white">
        <Container className="py-8 md:py-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-center gap-4">
              {user.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.picture}
                  alt=""
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-white/20"
                />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-violet text-lg font-bold !text-white">
                  {user.name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
              )}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] !text-white/50">
                  Customer dashboard
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight !text-white md:text-3xl">
                  Hi, {user.name.split(" ")[0]}
                </h1>
                <p className="mt-1 text-sm !text-white/60">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button href="/get-started" variant="lime">
                Launch a contest
              </Button>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  router.push("/");
                }}
                className="rounded-full border border-white/25 px-5 py-3 text-sm font-semibold !text-white hover:bg-white/10"
              >
                Log out
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                l: "Total spent",
                v: formatMoney(stats.spent),
                h: "All paid packages",
              },
              {
                l: "Active services",
                v: String(stats.active),
                h: "In progress now",
              },
              {
                l: "Concepts received",
                v: String(stats.concepts),
                h: "Across contests",
              },
              {
                l: "Revisions sent",
                v: String(stats.revisions),
                h: "Change requests",
              },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur"
              >
                <p className="text-[11px] font-bold uppercase tracking-wide !text-white/45">
                  {s.l}
                </p>
                <p className="mt-1 text-2xl font-bold !text-white">{s.v}</p>
                <p className="text-xs !text-white/40">{s.h}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-6">
        <div className="flex flex-wrap gap-2 border-b border-line pb-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setActiveServiceId(null);
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === t.id
                  ? "bg-ink !text-white"
                  : "bg-white text-ink ring-1 ring-line hover:ring-ink/30"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Container>

      <Container className="pb-16">
        {activeService ? (
          <ServiceDetail
            service={activeService}
            onBack={() => setActiveServiceId(null)}
          />
        ) : null}

        {!activeService && tab === "overview" ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">
                  Latest from admin & designers
                </h2>
                <button
                  type="button"
                  onClick={refreshUpdates}
                  className="text-sm font-semibold text-violet hover:underline"
                >
                  Refresh
                </button>
              </div>

              {allUpdates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
                  <h3 className="text-lg font-semibold text-ink">
                    No active work yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                    Launch a contest to track purchases, progress, concepts,
                    revisions, and admin updates in one place.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button href="/logo-design/details" variant="lime">
                      Start logo design
                    </Button>
                    <button
                      type="button"
                      onClick={seedDemo}
                      className="rounded-full border border-line bg-white px-6 py-3.5 text-sm font-semibold text-ink hover:border-ink/40"
                    >
                      Load demo contest
                    </button>
                  </div>
                </div>
              ) : (
                <ul className="space-y-3">
                  {allUpdates.slice(0, 8).map((u) => (
                    <li
                      key={u.id}
                      className="cursor-pointer rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:border-violet/30"
                      onClick={() => {
                        setActiveServiceId(u.serviceId);
                        setTab("services");
                      }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                            {u.serviceName} · {u.packageName}
                            {u.from ? ` · ${u.from}` : ""}
                          </p>
                          <h3 className="mt-1 font-semibold text-ink">
                            {u.title}
                          </h3>
                        </div>
                        <span className="text-xs font-medium text-muted">
                          {timeAgo(u.createdAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-ink/70">
                        {u.body}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-muted">
                  Active services
                </h3>
                {user.services.length === 0 ? (
                  <p className="mt-3 text-sm text-muted">None yet.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {user.services.slice(0, 4).map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveServiceId(s.id);
                            setTab("services");
                          }}
                          className="w-full rounded-xl border border-line bg-paper-soft p-3 text-left hover:border-violet/40"
                        >
                          <p className="font-semibold text-ink">
                            {s.categoryName}
                          </p>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e4e3e0]">
                            <div
                              className="h-full bg-violet"
                              style={{ width: `${s.progress}%` }}
                            />
                          </div>
                          <p className="mt-1.5 text-xs text-muted">
                            {s.progress}% · {statusLabel[s.status]}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-muted">
                  Quick links
                </h3>
                <ul className="mt-3 space-y-2 text-sm font-medium">
                  <li>
                    <Link
                      href="/designers/search"
                      className="text-ink hover:text-violet"
                    >
                      Find a designer
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/get-started"
                      className="text-ink hover:text-violet"
                    >
                      Start a new brief
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="text-ink hover:text-violet">
                      Compare packages
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-ink hover:text-violet">
                      Contact support
                    </Link>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        ) : null}

        {!activeService && tab === "services" ? (
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-ink">
                Your contests & projects
              </h2>
              {user.services.length === 0 ? (
                <button
                  type="button"
                  onClick={seedDemo}
                  className="text-sm font-semibold text-violet hover:underline"
                >
                  Load demo contest
                </button>
              ) : null}
            </div>
            {user.services.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
                <p className="font-semibold text-ink">No services yet</p>
                <p className="mt-2 text-sm text-muted">
                  Launch a contest to track progress, concepts, and revisions.
                </p>
                <div className="mt-5">
                  <Button href="/get-started" variant="primary">
                    Launch a contest
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {user.services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveServiceId(s.id)}
                    className="rounded-2xl border border-line bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet/30 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                          {s.orderId}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-ink">
                          {s.categoryName}
                        </h3>
                        <p className="text-sm text-muted">
                          {s.packageName} · {s.packagePrice}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusTone(s.status)}`}
                      >
                        {statusLabel[s.status]}
                      </span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e8e6e3]">
                      <div
                        className="h-full bg-violet"
                        style={{ width: `${s.progress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      {s.progress}% complete · {s.concepts.length} concepts ·{" "}
                      {s.revisions.length} revisions
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {!activeService && tab === "purchases" ? (
          <div>
            <h2 className="mb-5 text-lg font-semibold text-ink">
              Purchase history
            </h2>
            {user.services.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
                <p className="font-semibold text-ink">No purchases yet</p>
                <p className="mt-2 text-sm text-muted">
                  Orders appear here after you launch a paid contest package.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                <div className="hidden grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_0.6fr] gap-3 border-b border-line bg-paper-soft px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-muted md:grid">
                  <span>Order</span>
                  <span>Package</span>
                  <span>Date</span>
                  <span>Payment</span>
                  <span className="text-right">Amount</span>
                </div>
                <ul>
                  {user.services.map((s) => (
                    <li
                      key={s.id}
                      className="grid gap-2 border-b border-line px-5 py-4 last:border-0 md:grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_0.6fr] md:items-center md:gap-3"
                    >
                      <div>
                        <p className="font-semibold text-ink">{s.orderId}</p>
                        <p className="text-sm text-muted">{s.categoryName}</p>
                        <Link
                          href={categoryDetailsHref(s.categorySlug)}
                          className="text-xs font-semibold text-violet hover:underline"
                        >
                          View category
                        </Link>
                      </div>
                      <p className="text-sm text-ink">{s.packageName}</p>
                      <p className="text-sm text-muted">
                        {formatDate(s.createdAt)}
                      </p>
                      <p className="text-sm text-muted">
                        {s.paymentStatus} · {s.paymentMethod}
                      </p>
                      <p className="text-sm font-bold text-ink md:text-right">
                        {formatMoney(s.amountPaid, s.currency)}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between border-t border-line bg-paper-soft px-5 py-4 text-sm">
                  <span className="font-medium text-muted">Total spent</span>
                  <span className="font-bold text-ink">
                    {formatMoney(stats.spent)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {!activeService && tab === "activity" ? (
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">
                Full activity feed
              </h2>
              <button
                type="button"
                onClick={refreshUpdates}
                className="text-sm font-semibold text-violet hover:underline"
              >
                Sync from admin
              </button>
            </div>
            {allUpdates.length === 0 ? (
              <p className="text-sm text-muted">No activity yet.</p>
            ) : (
              <ul className="space-y-3">
                {allUpdates.map((u) => (
                  <li
                    key={u.id}
                    className="rounded-2xl border border-line bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                          {u.serviceName} · {u.kind}
                          {u.from ? ` · ${u.from}` : ""}
                        </p>
                        <h3 className="mt-1 font-semibold text-ink">{u.title}</h3>
                      </div>
                      <span className="text-xs text-muted">
                        {timeAgo(u.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-ink/70">{u.body}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveServiceId(u.serviceId);
                        setTab("services");
                      }}
                      className="mt-3 text-sm font-semibold text-violet hover:underline"
                    >
                      Open service →
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </Container>
    </div>
  );
}
