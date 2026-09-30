import { Suspense } from "react";
import { AdminProjects } from "@/components/admin/AdminProjects";

export default function AdminProjectsPage() {
  return (
    <Suspense fallback={<p className="text-[color:var(--a-muted)]">Loading…</p>}>
      <AdminProjects />
    </Suspense>
  );
}
