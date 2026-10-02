"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/Section";

type InvoicePayload = {
  invoice: {
    id: string;
    title: string;
    details?: string;
    amount: number;
    currency: string;
    status: string;
    paidAt?: string;
  };
  project: {
    id: string;
    orderId: string;
    title?: string;
    customerName?: string;
    customerEmail?: string;
    packageName?: string;
    amount?: number;
  };
};

function money(n: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(n);
  } catch {
    return `$${n.toLocaleString("en-US")}`;
  }
}

function PayUpsellInner() {
  const searchParams = useSearchParams();
  const token = (searchParams.get("token") || "").trim();
  const [data, setData] = useState<InvoicePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Missing invoice token.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/crm/upsell/pay?token=${encodeURIComponent(token)}`,
          { cache: "no-store" },
        );
        const json = (await res.json()) as InvoicePayload & {
          ok?: boolean;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || !json.ok) {
          setError(json.error || "Invoice not found");
          setLoading(false);
          return;
        }
        setData(json);
        if (json.invoice?.status === "paid") setDone(true);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("Could not load invoice");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onPay(e: FormEvent) {
    e.preventDefault();
    if (!token || paying) return;
    setPaying(true);
    setError(null);
    try {
      const res = await fetch("/api/crm/upsell/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error || "Payment failed");
        setPaying(false);
        return;
      }
      setDone(true);
      setData((prev) =>
        prev
          ? {
              ...prev,
              invoice: { ...prev.invoice, status: "paid" },
            }
          : prev,
      );
    } catch {
      setError("Payment failed");
    } finally {
      setPaying(false);
    }
  }

  return (
    <section className="min-h-[70vh] bg-[#f3f2f0] py-16">
      <Container className="max-w-lg">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
          Creative Logo Makers
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Upsell invoice</h1>

        {loading ? (
          <p className="mt-8 text-muted">Loading invoice…</p>
        ) : error && !data ? (
          <div className="mt-8 rounded-2xl border border-coral/30 bg-coral/5 p-6">
            <p className="font-semibold text-ink">{error}</p>
            <Link
              href="/account"
              className="mt-4 inline-block text-sm font-semibold text-violet hover:underline"
            >
              Go to account portal
            </Link>
          </div>
        ) : data ? (
          <div className="mt-8 space-y-5">
            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                {data.project.orderId} · {data.project.packageName}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-ink">
                {data.invoice.title}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {data.project.title || "Project"} ·{" "}
                {data.project.customerName || data.project.customerEmail}
              </p>
              {data.invoice.details ? (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
                  {data.invoice.details}
                </p>
              ) : null}
              <p className="mt-5 text-2xl font-bold text-ink">
                {money(Number(data.invoice.amount) || 0, data.invoice.currency)}
              </p>
              <p className="mt-1 text-xs capitalize text-muted">
                Status: {done || data.invoice.status === "paid" ? "paid" : data.invoice.status}
              </p>
            </div>

            {error ? (
              <p className="text-sm text-coral">{error}</p>
            ) : null}

            {done || data.invoice.status === "paid" ? (
              <div className="rounded-2xl border border-green/30 bg-green/5 p-5">
                <p className="font-semibold text-ink">Invoice paid</p>
                <p className="mt-1 text-sm text-muted">
                  This upsell is now attached under your project totals in the
                  CRM and your portal.
                </p>
                <Link
                  href="/account"
                  className="mt-4 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold !text-white"
                >
                  Open portal
                </Link>
              </div>
            ) : (
              <form onSubmit={onPay} className="space-y-3">
                <button
                  type="submit"
                  disabled={paying}
                  className="w-full rounded-full bg-[#00a581] px-5 py-3.5 text-sm font-semibold !text-white disabled:opacity-50"
                >
                  {paying ? "Confirming…" : "Pay invoice"}
                </button>
                <p className="text-center text-xs text-muted">
                  Have an account?{" "}
                  <Link href="/account" className="font-semibold text-violet hover:underline">
                    View in portal
                  </Link>
                </p>
              </form>
            )}
          </div>
        ) : null}
      </Container>
    </section>
  );
}

export default function PayUpsellPage() {
  return (
    <Suspense
      fallback={
        <section className="py-24">
          <Container>
            <p className="text-center text-muted">Loading…</p>
          </Container>
        </section>
      }
    >
      <PayUpsellInner />
    </Suspense>
  );
}
