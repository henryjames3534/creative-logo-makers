/** After client pays for a direct designer hire → CRM project + designer portal */

import type { PendingBrief } from "@/lib/auth-storage";
import {
  assignDesignerToProject,
  assignTaskToDesigner,
  loadCrm,
  saveCrm,
  type CrmOrder,
} from "@/lib/crm-storage";

function parseAmount(raw: string) {
  const n = Number(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
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
      customerEmail: input.customerEmail.toLowerCase(),
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
      type: "deal",
      title: isDirect ? "Direct hire paid" : "Contest paid",
      body: `${input.customerEmail} · ${brief.packageName} · ${brief.packagePrice}`,
      createdAt: now,
      ownerId: "own_admin",
      relatedType: "project",
      relatedId: project.id,
    });
    saveCrm(state);
  } else {
    project.paymentStatus = "paid";
    project.serviceId = input.serviceId;
    project.updatedAt = now;
    saveCrm(state);
  }

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
