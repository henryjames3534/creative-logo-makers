import { Suspense } from "react";
import { AdminLeads } from "@/components/admin/AdminLeads";

export default function AdminLeadsPage() {
  return (
    <Suspense fallback={<p className="text-[color:var(--a-muted)]">Loading…</p>}>
      <AdminLeads />
    </Suspense>
  );
}
