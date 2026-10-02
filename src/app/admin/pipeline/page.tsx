import { Suspense } from "react";
import { AdminPipeline } from "@/components/admin/AdminPipeline";

export default function AdminPipelinePage() {
  return (
    <Suspense fallback={<p className="text-[color:var(--a-muted)]">Loading…</p>}>
      <AdminPipeline />
    </Suspense>
  );
}
