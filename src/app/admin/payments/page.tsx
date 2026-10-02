import { Suspense } from "react";
import { AdminPayments } from "@/components/admin/AdminPayments";

export default function AdminPaymentsPage() {
  return (
    <Suspense
      fallback={<p className="text-[color:var(--a-muted)]">Loading…</p>}
    >
      <AdminPayments />
    </Suspense>
  );
}
