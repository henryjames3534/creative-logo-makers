import { Suspense } from "react";
import { AdminOrders } from "@/components/admin/AdminOrders";

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<p className="text-[color:var(--a-muted)]">Loading…</p>}>
      <AdminOrders />
    </Suspense>
  );
}
