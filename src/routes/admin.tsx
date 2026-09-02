import { createFileRoute } from "@tanstack/react-router";
import { AdminApp } from "@/components/saffron/admin-app";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  return <AdminApp />;
}
