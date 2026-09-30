import { Suspense } from "react";
import { AdminVisitors } from "@/components/admin/AdminVisitors";

export default function AdminVisitorsPage() {
  return (
    <Suspense fallback={<p className="text-[color:var(--a-muted)]">Loading…</p>}>
      <AdminVisitors />
    </Suspense>
  );
}
