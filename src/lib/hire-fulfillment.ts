/** After client pays for a package / direct hire → local CRM + server CRM */

import type { PendingBrief } from "@/lib/auth-storage";
import {
  assignDesignerToProject,
  assignTaskToDesigner,
  loadCrm,
  saveCrm,
  upsertContact,
  upsertDeal,
  upsertLead,
  upsertOrder,
  type CrmOrder,
} from "@/lib/crm-storage";

function parseAmount(raw: string) {
  const n = Number(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

function pushFulfillToServer(input: {
  customerEmail: string;
  customerName: string;
  brief: PendingBrief;
  serviceId: string;
  orderId: string;
  amount: number;
}) {
  const brief = input.brief;
  void fetch("/api/crm/fulfill", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      categoryName: brief.categoryName,
      packageName: brief.packageName,
      packagePrice: brief.packagePrice,
      amount: input.amount,
      orderId: input.orderId,
      serviceId: input.serviceId,
      hireMode: brief.hireMode || "contest",
      designerId: brief.designerId,
      designerName: brief.designerName,
      designerHandle: brief.designerHandle,
      paymentStatus: "paid",
    }),
  }).catch(() => null);
}

export function fulfillDirectHireAfterPayment(input: {
  customerEmail: string;
  customerName: string;
  brief: PendingBrief;
  serviceId: string;
  orderId: string;
  amount: number;
}) {
  if (typeof window === "undefined") return;
  const brief = input.brief;
  const state = loadCrm();
  const now = new Date().toISOString();
  const amount = input.amount || parseAmount(brief.packagePrice);
  const isDirect = brief.hireMode === "direct" && brief.designerId;
  const email = input.customerEmail.toLowerCase();

  try {
    upsertContact({
      name: input.customerName,
      email,
      title: "Customer",
      tags: ["package", isDirect ? "direct-hire" : "contest", "paid"],
    });
  } catch {
    /* ignore */
  }

  try {
    upsertLead({
      name: input.customerName,
      email,
      source: "Package brief",
      interest: `${brief.categoryName} · ${brief.packageName}`,
      notes: [
        `Package: ${brief.packageName} (${brief.packagePrice})`,
        `Mode: ${isDirect ? "direct hire" : "contest"}`,
        brief.designerName
          ? `Designer: ${brief.designerName}${brief.designerHandle ? ` (@${brief.designerHandle})` : ""}`
          : "",
        `Order: ${input.orderId}`,
      ]
        .filter(Boolean)
        .join("\n"),
      score: 90,
      status: "qualified",
      valueEstimate: amount || 699,
    });
  } catch {
    /* ignore */
  }

  try {
    upsertDeal({
      title: `${brief.categoryName} — ${input.customerName}`,
      value: amount || 699,
      stage: "won",
      packageName: brief.packageName,
      probability: 100,
      ownerId: "own_admin",
      category: brief.categoryName,
      closeDate: now,
      orderCode: input.orderId,
    });
  } catch {
    /* ignore */
  }

  // Upsert CRM project linked to customer service
  let project =
    state.orders.find((o) => o.serviceId === input.serviceId) ||
    state.orders.find((o) => o.orderId === input.orderId);

  if (!project) {
    const revisionLimit = brief.packageName.toLowerCase().includes("platinum")
      ? 5
      : brief.packageName.toLowerCase().includes("gold")
        ? 4
        : 3;
    project = {
      id: uid("or"),
      orderId: input.orderId,
      title: isDirect
        ? `${brief.categoryName} — ${brief.designerName || "1-to-1"}`
        : `${brief.categoryName} — ${input.customerName}`,
      customerName: input.customerName,
      customerEmail: email,
      categoryName: brief.categoryName,
      packageName: brief.packageName,
      amount,
      status: isDirect ? "designs_incoming" : "brief_submitted",
      paymentStatus: "paid",
      createdAt: now,
      updatedAt: now,
      designerCount: isDirect ? 1 : 0,
      revisionLimit,
      revisionsUsed: 0,
      revisions: [],
      messages: [],
      serviceId: input.serviceId,
      assignedDesignerIds: [],
    } satisfies CrmOrder;
    state.orders.unshift(project);
    state.activities.unshift({
      id: uid("ac"),
      type: "payment",
      title: isDirect ? "Direct hire paid" : "Contest paid",
      body: `${input.customerEmail} · ${brief.packageName} · ${brief.packagePrice}`,
      createdAt: now,
      ownerId: "own_admin",
      relatedType: "order",
      relatedId: project.id,
    });
    saveCrm(state);
  } else {
    project.paymentStatus = "paid";
    project.serviceId = input.serviceId;
    project.updatedAt = now;
    saveCrm(state);
  }

  try {
    upsertOrder({
      id: project.id,
      orderId: project.orderId,
      customerName: project.customerName,
      customerEmail: project.customerEmail,
      categoryName: project.categoryName,
      packageName: project.packageName,
      amount: project.amount,
      status: project.status,
      paymentStatus: "paid",
      serviceId: project.serviceId,
      designerCount: project.designerCount,
      revisionLimit: project.revisionLimit,
      title: project.title,
    });
  } catch {
    /* ignore */
  }

  // Server source of truth for admin on any device
  pushFulfillToServer(input);

  if (!isDirect || !brief.designerId || !brief.designerName) return;

  assignDesignerToProject({
    projectId: project.id,
    designerId: brief.designerId,
    designerName: brief.designerName,
    createKickoffTask: true,
  });

  assignTaskToDesigner({
    title: `Deliver ${brief.categoryName} for ${input.customerName}`,
    designerId: brief.designerId,
    designerName: brief.designerName,
    projectId: project.id,
    priority: "high",
    notes: `Direct hire after payment · ${brief.packageName} · ${brief.packagePrice}`,
  });
}
