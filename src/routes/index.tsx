import { createFileRoute } from "@tanstack/react-router";
import { OrderApp } from "@/components/saffron/order-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <OrderApp />;
}
