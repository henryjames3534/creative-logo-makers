import { Suspense } from "react";
import { AdminContactFormEntries } from "@/components/admin/AdminContactFormEntries";

export default function AdminContactFormEntriesPage() {
  return (
    <Suspense fallback={<p className="text-[color:var(--a-muted)]">Loading…</p>}>
      <AdminContactFormEntries />
    </Suspense>
  );
}
