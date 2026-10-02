"use client";

import { captureVisitorEmail } from "@/lib/capture-visitor";
import {
  upsertContact,
  upsertDeal,
  upsertLead,
  upsertOrder,
  type VisitorSource,
} from "@/lib/crm-storage";
import type { LeadFormPayload } from "@/lib/form-mail";

function parsePackageMeta(payload: LeadFormPayload) {
  const message = payload.message || "";
  const topic = payload.topic || "";
  const packageLine = message.match(/Package:\s*([^(]+?)(?:\s*\(([^)]*)\))?/i);
  const categoryLine = message.match(/Category:\s*(.+)/i);
  const packageName =
    (packageLine?.[1] || topic.split("·")[1] || "Package").trim() || "Package";
  const packagePriceRaw = (packageLine?.[2] || "").trim();
  const amount = Number(String(packagePriceRaw).replace(/[^0-9.]/g, "")) || 0;
  const categoryName =
    (categoryLine?.[1] || topic.split("·")[0] || payload.form).trim() ||
    "Design";
  return { packageName, amount, categoryName };
}

/** Persist a public form fill into admin CRM (lead + contact + deal/order). */
export function captureFormLead(payload: LeadFormPayload) {
  if (typeof window === "undefined") return;
  const email = payload.email.trim().toLowerCase();
  const name = payload.name.trim() || email.split("@")[0];
  if (!email) return;

  const sourceLabel =
    payload.form === "contact"
      ? "Contact form"
      : payload.form === "studio"
        ? "Studio form"
        : payload.form === "package"
          ? "Package brief"
          : "Signup";

  const source: VisitorSource =
    payload.form === "signup" ? "signup_form" : "manual";

  const meta =
    payload.form === "package" ? parsePackageMeta(payload) : null;
  const valueEstimate =
    payload.form === "studio"
      ? 999
      : payload.form === "package"
        ? meta?.amount || 699
        : 499;

  const notes = [
    payload.message?.trim() || "",
    payload.page ? `Page: ${payload.page}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    upsertContact({
      name,
      email,
      title: payload.form === "package" ? "Customer" : undefined,
      tags: [
        payload.form,
        payload.form === "package" ? "package-brief" : "website-form",
      ],
    });
  } catch {
    /* ignore */
  }

  try {
    upsertLead({
      name,
      email,
      source: sourceLabel,
      interest: payload.topic || payload.form,
      notes,
      score:
        payload.form === "studio" ? 70 : payload.form === "package" ? 80 : 55,
      status: "new",
      valueEstimate,
    });
  } catch {
    /* ignore */
  }

  if (payload.form === "package" || payload.form === "studio") {
    try {
      upsertDeal({
        title:
          payload.form === "package"
            ? `${meta?.categoryName || "Design"} — ${name}`
            : `Studio — ${name}`,
        value: valueEstimate,
        stage: payload.form === "package" ? "brief" : "qualified",
        packageName:
          payload.form === "package" ? meta?.packageName : "Studio",
        probability: payload.form === "package" ? 45 : 35,
        ownerId: "own_admin",
        category: meta?.categoryName,
      });
    } catch {
      /* ignore */
    }
  }

  if (payload.form === "package") {
    try {
      upsertOrder({
        customerName: name,
        customerEmail: email,
        categoryName: meta?.categoryName || "Design",
        packageName: meta?.packageName || "Package",
        amount: meta?.amount || valueEstimate,
        status: "brief_submitted",
        paymentStatus: "pending",
        title: `${meta?.categoryName || "Design"} — ${name}`,
      });
    } catch {
      /* ignore */
    }
  }

  try {
    captureVisitorEmail({
      email,
      name,
      source,
      signedIn: payload.form === "signup",
      silent: true,
    });
  } catch {
    /* ignore */
  }
}
