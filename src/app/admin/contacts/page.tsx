import { Suspense } from "react";
import { AdminContacts } from "@/components/admin/AdminContacts";

export default function AdminContactsPage() {
  return (
    <Suspense fallback={<p className="text-[color:var(--a-muted)]">Loading…</p>}>
      <AdminContacts />
    </Suspense>
  );
}
