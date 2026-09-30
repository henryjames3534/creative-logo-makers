"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AdminCard, Badge, SectionTitle } from "@/components/admin/AdminUi";
import {
  formatDuration,
  hydrateCrmFromServer,
  loadCrm,
  money,
  relativeDay,
  type CrmActivity,
  type CrmContact,
  type CrmDeal,
  type CrmLead,
  type CrmOrder,
  type CrmState,
  type CrmVisitor,
} from "@/lib/crm-storage";

export type NotifKind =
  | "activity"
  | "lead"
  | "visitor"
  | "order"
  | "contact"
  | "deal"
  | "company";

type Props = {
  kind: string;
  id: string;
};

function Row({ label, value }: { label: string; value?: ReactNode }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-2 border-b border-[color:var(--a-border)] py-2 text-sm last:border-0 sm:grid-cols-[9rem_1fr]">
      <dt className="text-[color:var(--a-faint)]">{label}</dt>
      <dd className="break-words text-[var(--a-text)]">{value}</dd>
    </div>
  );
}

function listHref(kind: NotifKind, id: string) {
  if (kind === "lead") return `/admin/leads?id=${encodeURIComponent(id)}`;
  if (kind === "visitor") return `/admin/visitors?id=${encodeURIComponent(id)}`;
  if (kind === "order") return `/admin/projects?id=${encodeURIComponent(id)}`;
  if (kind === "contact") return `/admin/contacts?id=${encodeURIComponent(id)}`;
  if (kind === "deal") return `/admin/pipeline?id=${encodeURIComponent(id)}`;
  if (kind === "company") return `/admin/companies?id=${encodeURIComponent(id)}`;
  return "/admin/activity";
}

function contactFormListHref(id: string) {
  return `/admin/contact-form-entries?id=${encodeURIComponent(id)}`;
}

function relatedActivities(state: CrmState, type: string, id: string) {
  return (state.activities || []).filter(
    (a) => a.relatedType === type && a.relatedId === id,
  );
}

function LeadDetail({ lead, state }: { lead: CrmLead; state: CrmState }) {
  const acts = relatedActivities(state, "lead", lead.id);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">{lead.status}</Badge>
        <Badge tone="gold">Score {lead.score}</Badge>
        <Badge tone="green">{money(lead.valueEstimate)}</Badge>
      </div>
      <dl>
        <Row label="Name" value={lead.name} />
        <Row
          label="Email"
          value={
            <a className="text-[#5ee0bf] hover:underline" href={`mailto:${lead.email}`}>
              {lead.email}
            </a>
          }
        />
        <Row label="Phone" value={lead.phone} />
        <Row label="Company" value={lead.company} />
        <Row label="Source" value={lead.source} />
        <Row label="Interest" value={lead.interest} />
        <Row label="Created" value={relativeDay(lead.createdAt)} />
        <Row label="Updated" value={relativeDay(lead.updatedAt)} />
        <Row
          label="Notes"
          value={
            lead.notes ? (
              <pre className="whitespace-pre-wrap font-sans text-sm">{lead.notes}</pre>
            ) : (
              "—"
            )
          }
        />
      </dl>
      {acts.length ? (
        <div>
          <SectionTitle title="Related activity" />
          <ul className="mt-2 space-y-2">
            {acts.slice(0, 12).map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-[color:var(--a-border)] px-3 py-2 text-sm"
              >
                <p className="font-medium text-[var(--a-text)]">{a.title}</p>
                <p className="text-xs text-[color:var(--a-muted)]">{a.body}</p>
                <p className="mt-1 text-[10px] text-[color:var(--a-faint)]">
                  {relativeDay(a.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function VisitorDetail({ visitor }: { visitor: CrmVisitor }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="blue">{visitor.source}</Badge>
        {visitor.signedIn ? <Badge tone="green">Signed in</Badge> : null}
        <Badge tone="neutral">{visitor.hits} hits</Badge>
      </div>
      <dl>
        <Row label="Name" value={visitor.name || "Anonymous"} />
        <Row
          label="Email"
          value={
            visitor.email ? (
              <a
                className="text-[#5ee0bf] hover:underline"
                href={`mailto:${visitor.email}`}
              >
                {visitor.email}
              </a>
            ) : (
              "—"
            )
          }
        />
        <Row label="Path" value={visitor.path || "/"} />
        <Row label="First seen" value={relativeDay(visitor.firstSeenAt)} />
        <Row label="Last seen" value={relativeDay(visitor.lastSeenAt)} />
        <Row label="Visits" value={String(visitor.visitCount)} />
        <Row label="Time on site" value={formatDuration(visitor.totalDurationMs)} />
        <Row label="IP" value={visitor.geo?.ip} />
        <Row label="Country" value={visitor.geo?.country || visitor.geo?.countryCode} />
        <Row label="Region" value={visitor.geo?.region} />
        <Row label="City" value={visitor.geo?.city} />
        <Row label="ISP" value={visitor.geo?.isp} />
        <Row
          label="Coords"
          value={
            visitor.geo?.latitude != null && visitor.geo?.longitude != null
              ? `${visitor.geo.latitude}, ${visitor.geo.longitude}`
              : undefined
          }
        />
        <Row label="Language" value={visitor.language} />
        <Row label="User agent" value={visitor.userAgent} />
        <Row label="Visitor key" value={visitor.visitorKey} />
      </dl>
      {visitor.pageViews?.length ? (
        <div>
          <SectionTitle title="Page views" />
          <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-sm">
            {visitor.pageViews.slice(-20).reverse().map((p) => (
              <li key={p.id} className="flex justify-between gap-2 text-[color:var(--a-muted)]">
                <span className="truncate">{p.path}</span>
                <span className="shrink-0 text-[10px] text-[color:var(--a-faint)]">
                  {relativeDay(p.enteredAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {visitor.geoHistory?.length ? (
        <div>
          <SectionTitle title="IP history" />
          <ul className="mt-2 space-y-1 text-sm text-[color:var(--a-muted)]">
            {visitor.geoHistory.slice(0, 10).map((g, i) => (
              <li key={`${g.ip}-${i}`}>
                {g.ip}
                {g.city ? ` · ${g.city}` : ""}
                {g.country ? ` · ${g.country}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function OrderDetail({ order }: { order: CrmOrder }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="gold">{order.status}</Badge>
        <Badge tone={order.paymentStatus === "paid" ? "green" : "coral"}>
          {order.paymentStatus}
        </Badge>
        <Badge tone="neutral">{money(order.amount)}</Badge>
      </div>
      <dl>
        <Row label="Order ID" value={order.orderId} />
        <Row label="Title" value={order.title} />
        <Row label="Customer" value={order.customerName} />
        <Row
          label="Email"
          value={
            <a
              className="text-[#5ee0bf] hover:underline"
              href={`mailto:${order.customerEmail}`}
            >
              {order.customerEmail}
            </a>
          }
        />
        <Row label="Category" value={order.categoryName} />
        <Row label="Package" value={order.packageName} />
        <Row label="Designers" value={String(order.designerCount)} />
        <Row
          label="Revisions"
          value={`${order.revisionsUsed}/${order.revisionLimit}`}
        />
        <Row label="Created" value={relativeDay(order.createdAt)} />
        <Row label="Updated" value={relativeDay(order.updatedAt)} />
      </dl>
      {order.revisions?.length ? (
        <div>
          <SectionTitle title="Revisions" />
          <ul className="mt-2 space-y-2">
            {order.revisions.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-[color:var(--a-border)] px-3 py-2 text-sm"
              >
                <p className="font-medium text-[var(--a-text)]">
                  Round {r.round}: {r.title}
                </p>
                <p className="text-xs text-[color:var(--a-muted)]">{r.note}</p>
                <p className="mt-1 text-[10px] text-[color:var(--a-faint)]">
                  {r.status} · {relativeDay(r.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {order.messages?.length ? (
        <div>
          <SectionTitle title="Messages" />
          <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto">
            {order.messages.map((m) => (
              <li
                key={m.id}
                className="rounded-xl border border-[color:var(--a-border)] px-3 py-2 text-sm"
              >
                <p className="text-[11px] text-[color:var(--a-faint)]">
                  {m.from} · {m.author} · {relativeDay(m.createdAt)}
                </p>
                <p className="mt-1 text-[color:var(--a-muted)]">{m.body}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function ContactDetail({ contact, state }: { contact: CrmContact; state: CrmState }) {
  const company = state.companies.find((c) => c.id === contact.companyId);
  return (
    <dl>
      <Row label="Name" value={contact.name} />
      <Row
        label="Email"
        value={
          <a className="text-[#5ee0bf] hover:underline" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
        }
      />
      <Row label="Phone" value={contact.phone} />
      <Row label="Title" value={contact.title} />
      <Row label="Company" value={company?.name} />
      <Row label="Tags" value={contact.tags?.join(", ")} />
      <Row label="Created" value={relativeDay(contact.createdAt)} />
      <Row label="Last touch" value={relativeDay(contact.lastTouchAt)} />
    </dl>
  );
}

function DealDetail({ deal, state }: { deal: CrmDeal; state: CrmState }) {
  const company = state.companies.find((c) => c.id === deal.companyId);
  const contact = state.contacts.find((c) => c.id === deal.contactId);
  const lead = state.leads.find((l) => l.id === deal.leadId);
  return (
    <dl>
      <Row label="Title" value={deal.title} />
      <Row label="Stage" value={deal.stage} />
      <Row label="Value" value={money(deal.value)} />
      <Row label="Probability" value={`${deal.probability}%`} />
      <Row label="Category" value={deal.category} />
      <Row label="Package" value={deal.packageName} />
      <Row label="Company" value={company?.name} />
      <Row label="Contact" value={contact ? `${contact.name} <${contact.email}>` : undefined} />
      <Row label="Lead" value={lead ? `${lead.name} <${lead.email}>` : undefined} />
      <Row label="Close date" value={relativeDay(deal.closeDate)} />
      <Row label="Notes" value={deal.notes} />
    </dl>
  );
}

function ActivityDetail({
  activity,
  state,
}: {
  activity: CrmActivity;
  state: CrmState;
}) {
  const related =
    activity.relatedType && activity.relatedId
      ? activity.relatedType === "lead"
        ? state.leads.find((l) => l.id === activity.relatedId)
        : activity.relatedType === "order" || activity.relatedType === "project"
          ? state.orders.find((o) => o.id === activity.relatedId)
          : activity.relatedType === "contact"
            ? state.contacts.find((c) => c.id === activity.relatedId)
            : activity.relatedType === "deal"
              ? state.deals.find((d) => d.id === activity.relatedId)
              : activity.relatedType === "company"
                ? state.companies.find((c) => c.id === activity.relatedId)
                : null
      : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="blue">{activity.type}</Badge>
        {activity.relatedType ? (
          <Badge tone="neutral">{activity.relatedType}</Badge>
        ) : null}
      </div>
      <dl>
        <Row label="Title" value={activity.title} />
        <Row
          label="Body"
          value={
            <pre className="whitespace-pre-wrap font-sans text-sm">{activity.body}</pre>
          }
        />
        <Row label="When" value={relativeDay(activity.createdAt)} />
        <Row label="Related id" value={activity.relatedId} />
      </dl>
      {related && activity.relatedType === "lead" ? (
        <AdminCard className="p-4">
          <SectionTitle title="Linked lead" />
          <div className="mt-2">
            <LeadDetail lead={related as CrmLead} state={state} />
          </div>
        </AdminCard>
      ) : null}
      {related &&
      (activity.relatedType === "order" || activity.relatedType === "project") ? (
        <AdminCard className="p-4">
          <SectionTitle title="Linked project / order" />
          <div className="mt-2">
            <OrderDetail order={related as CrmOrder} />
          </div>
        </AdminCard>
      ) : null}
      {related && activity.relatedType === "contact" ? (
        <AdminCard className="p-4">
          <SectionTitle title="Linked contact" />
          <div className="mt-2">
            <ContactDetail contact={related as CrmContact} state={state} />
          </div>
        </AdminCard>
      ) : null}
      {related && activity.relatedType === "deal" ? (
        <AdminCard className="p-4">
          <SectionTitle title="Linked deal" />
          <div className="mt-2">
            <DealDetail deal={related as CrmDeal} state={state} />
          </div>
        </AdminCard>
      ) : null}
    </div>
  );
}

export function AdminNotificationDetail({ kind, id }: Props) {
  const [state, setState] = useState<CrmState | null>(null);
  const safeKind = (kind || "activity").toLowerCase() as NotifKind;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await hydrateCrmFromServer();
      } catch {
        /* ignore */
      }
      if (!cancelled) setState(loadCrm());
    })();
    return () => {
      cancelled = true;
    };
  }, [kind, id]);

  const resolved = useMemo(() => {
    if (!state) return null;
    if (safeKind === "lead") {
      const lead = state.leads.find((l) => l.id === id);
      const contactForm =
        (lead?.source || "").toLowerCase() === "contact form";
      return lead
        ? {
            title: contactForm
              ? `Contact form · ${lead.name}`
              : `Lead · ${lead.name}`,
            subtitle: lead.email,
            node: <LeadDetail lead={lead} state={state} />,
            list: contactForm
              ? contactFormListHref(id)
              : listHref("lead", id),
          }
        : null;
    }
    if (safeKind === "visitor") {
      const visitor = state.visitors.find((v) => v.id === id || v.visitorKey === id);
      return visitor
        ? {
            title: `Visitor · ${visitor.name || visitor.email || "Anonymous"}`,
            subtitle: visitor.geo?.ip || visitor.path || visitor.id,
            node: <VisitorDetail visitor={visitor} />,
            list: listHref("visitor", visitor.id),
          }
        : null;
    }
    if (safeKind === "order") {
      const order = state.orders.find((o) => o.id === id || o.orderId === id);
      return order
        ? {
            title: `Project · ${order.orderId}`,
            subtitle: `${order.customerName} · ${order.packageName}`,
            node: <OrderDetail order={order} />,
            list: listHref("order", order.id),
          }
        : null;
    }
    if (safeKind === "contact") {
      const contact = state.contacts.find((c) => c.id === id);
      return contact
        ? {
            title: `Contact · ${contact.name}`,
            subtitle: contact.email,
            node: <ContactDetail contact={contact} state={state} />,
            list: listHref("contact", id),
          }
        : null;
    }
    if (safeKind === "deal") {
      const deal = state.deals.find((d) => d.id === id);
      return deal
        ? {
            title: `Deal · ${deal.title}`,
            subtitle: money(deal.value),
            node: <DealDetail deal={deal} state={state} />,
            list: listHref("deal", id),
          }
        : null;
    }
    if (safeKind === "company") {
      const company = state.companies.find((c) => c.id === id);
      return company
        ? {
            title: `Company · ${company.name}`,
            subtitle: company.industry,
            node: (
              <dl>
                <Row label="Name" value={company.name} />
                <Row label="Industry" value={company.industry} />
                <Row label="Website" value={company.website} />
                <Row label="Size" value={company.size} />
                <Row label="Country" value={company.country} />
                <Row label="Notes" value={company.notes} />
              </dl>
            ),
            list: listHref("company", id),
          }
        : null;
    }

    // activity (default) — also try resolving if id looks like another entity
    const activity = state.activities.find((a) => a.id === id);
    if (activity) {
      return {
        title: activity.title,
        subtitle: activity.body,
        node: <ActivityDetail activity={activity} state={state} />,
        list: "/admin/activity",
      };
    }
    const lead = state.leads.find((l) => l.id === id);
    if (lead) {
      return {
        title: `Lead · ${lead.name}`,
        subtitle: lead.email,
        node: <LeadDetail lead={lead} state={state} />,
        list: listHref("lead", id),
      };
    }
    const visitor = state.visitors.find((v) => v.id === id);
    if (visitor) {
      return {
        title: `Visitor · ${visitor.name || "Anonymous"}`,
        subtitle: visitor.email || visitor.geo?.ip,
        node: <VisitorDetail visitor={visitor} />,
        list: listHref("visitor", id),
      };
    }
    const order = state.orders.find((o) => o.id === id);
    if (order) {
      return {
        title: `Project · ${order.orderId}`,
        subtitle: order.customerName,
        node: <OrderDetail order={order} />,
        list: listHref("order", id),
      };
    }
    return null;
  }, [state, safeKind, id]);

  if (!state) {
    return <p className="text-[color:var(--a-muted)]">Loading notification…</p>;
  }

  if (!resolved) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-[var(--a-text)]">
          Notification not found
        </h1>
        <p className="text-sm text-[color:var(--a-muted)]">
          This item may have been deleted. Open the activity feed or list pages
          instead.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/activity"
            className="rounded-full bg-[#00a581] px-4 py-2 text-sm font-semibold text-white"
          >
            Activity feed
          </Link>
          <Link
            href="/admin/leads"
            className="rounded-full border border-[color:var(--a-border)] px-4 py-2 text-sm text-[color:var(--a-muted)]"
          >
            Leads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--a-faint)]">
            Notification detail
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--a-text)]">
            {resolved.title}
          </h1>
          {resolved.subtitle ? (
            <p className="mt-1 line-clamp-2 text-sm text-[color:var(--a-muted)]">
              {resolved.subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={resolved.list}
            className="rounded-full bg-[#00a581] px-4 py-2 text-sm font-semibold text-white hover:bg-[#008f70]"
          >
            Open in list
          </Link>
          <Link
            href="/admin/activity"
            className="rounded-full border border-[color:var(--a-border)] px-4 py-2 text-sm text-[color:var(--a-muted)] hover:bg-[var(--a-hover)]"
          >
            All activity
          </Link>
        </div>
      </div>

      <AdminCard className="p-5">{resolved.node}</AdminCard>
    </div>
  );
}
