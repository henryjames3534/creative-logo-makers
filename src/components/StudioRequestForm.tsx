"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/Button";

export function StudioRequestForm({ defaultTopic }: { defaultTopic: string }) {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      sessionStorage.setItem(
        "clm_studio_request",
        JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          topic: fd.get("topic"),
          message: fd.get("message"),
          at: new Date().toISOString(),
        }),
      );
    } catch {
      /* ignore */
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-10 text-center shadow-sm">
        <p className="text-2xl font-bold text-ink">Request received</p>
        <p className="mt-3 text-muted">
          A Brand Strategist will be in touch soon — usually within one business
          day.
        </p>
        <div className="mt-6">
          <Button href="/studio" variant="primary">
            Back to Studio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-xl space-y-4 rounded-2xl border border-line bg-white p-8 shadow-sm"
    >
      <input type="hidden" name="topic" value={defaultTopic} />
      <label className="block text-sm">
        <span className="font-medium text-ink">Name</span>
        <input
          name="name"
          required
          className="mt-1.5 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-violet"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-ink">Work email</span>
        <input
          name="email"
          type="email"
          required
          className="mt-1.5 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-violet"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-ink">What do you need?</span>
        <textarea
          name="message"
          rows={4}
          required
          placeholder="Stage of business, timeline, logo already done or not…"
          className="mt-1.5 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-violet"
        />
      </label>
      <button
        type="submit"
        className="focus-ring inline-flex w-full items-center justify-center rounded-full bg-cta px-7 py-3.5 text-sm font-semibold !text-white transition-colors hover:bg-cta-hover"
      >
        Request a call
      </button>
      <p className="text-center text-xs text-muted">
        Circlemakers Studio · English & German
      </p>
    </form>
  );
}
