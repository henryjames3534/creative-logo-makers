import { AdminNotificationDetail } from "@/components/admin/AdminNotificationDetail";

type Props = {
  params: Promise<{ kind: string; id: string }>;
};

export default async function AdminNotificationDetailPage({ params }: Props) {
  const { kind, id } = await params;
  return <AdminNotificationDetail kind={kind} id={decodeURIComponent(id)} />;
}
