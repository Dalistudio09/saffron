import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CATEGORIES,
  DIET_OPTIONS,
  OCCASIONS,
  ORDER_STATUSES,
  PRODUCTS,
  formatAllergies,
  getProduct,
  optionLabel,
} from "@/lib/catalog";
import { formatDateRu, formatPrice } from "@/lib/format";
import {
  getBootstrap,
  listAdminOrders,
  setProductHidden,
  updateOrderStatus,
  type OrderDto,
} from "@/lib/saffron.functions";
import { identityPayload, initTelegramUi } from "@/lib/telegram";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/saffron/app-shell";
import { ScreenHeader } from "@/components/saffron/screen-header";
import { StatusPill } from "@/components/saffron/status-pill";

type Tab = "orders" | "catalog";

export function AdminApp() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("orders");
  const [filter, setFilter] = useState<string>("new");
  const [orders, setOrders] = useState<OrderDto[] | null>(null);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  async function loadSession() {
    const session = await getBootstrap({ data: identityPayload() });
    setAllowed(session.isAdmin);
    setHiddenIds(session.hiddenProductIds);
    return session.isAdmin;
  }

  async function loadOrders(status: string) {
    const rows = await listAdminOrders({
      data: {
        ...identityPayload(),
        status: status === "all" ? undefined : status,
      },
    });
    setOrders(rows);
  }

  useEffect(() => {
    initTelegramUi();
    void (async () => {
      try {
        const ok = await loadSession();
        if (ok) await loadOrders("new");
      } catch (err) {
        setAllowed(false);
        setError(err instanceof Error ? err.message : "Нет доступа");
      }
    })();
  }, []);

  async function changeStatus(
    id: number,
    status: "new" | "confirmed" | "baking" | "ready" | "cancelled",
  ) {
    setError("");
    try {
      await updateOrderStatus({
        data: { ...identityPayload(), id, status },
      });
      await loadOrders(filter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить статус");
    }
  }

  async function toggleHidden(productId: string, hidden: boolean) {
    setError("");
    try {
      const result = await setProductHidden({
        data: { ...identityPayload(), productId, hidden },
      });
      setHiddenIds(result.hiddenProductIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось скрыть торт");
    }
  }

  if (allowed === null) {
    return (
      <AppShell>
        <p className="text-sm text-muted">Открываем админку…</p>
      </AppShell>
    );
  }

  if (!allowed) {
    return (
      <AppShell>
        <ScreenHeader title="Админ" />
        <p className="text-sm leading-relaxed text-muted">
          Админка доступна только кондитеру Saffron.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-saffron px-5 text-sm font-medium text-on-saffron"
        >
          На главную
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ScreenHeader
        title="Админ"
        action={
          <Link to="/" className="text-sm font-medium text-muted">
            К витрине
          </Link>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-surface-2 p-1">
        <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>
          Заказы
        </TabButton>
        <TabButton active={tab === "catalog"} onClick={() => setTab("catalog")}>
          Каталог
        </TabButton>
      </div>

      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

      {tab === "orders" ? (
        <>
          <div className="-mx-5 mb-5 flex gap-2 overflow-x-auto px-5">
            {[
              { id: "new", label: "новые" },
              { id: "all", label: "все" },
              ...ORDER_STATUSES.filter((item) => item.id !== "new"),
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setFilter(item.id);
                  setOrders(null);
                  void loadOrders(item.id).catch((err: unknown) => {
                    setError(
                      err instanceof Error ? err.message : "Не удалось загрузить",
                    );
                    setOrders([]);
                  });
                }}
                className={cn(
                  "h-9 shrink-0 rounded-full px-4 text-sm font-medium",
                  filter === item.id
                    ? "bg-saffron text-on-saffron"
                    : "bg-surface text-muted shadow-card",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          {orders === null ? (
            <p className="text-sm text-muted">Загружаем…</p>
          ) : orders.length === 0 ? (
            <div className="rounded-xl bg-surface p-6 shadow-card">
              <p className="font-medium">Новых заказов нет</p>
              <p className="mt-1 text-sm text-muted">
                Когда клиент закажет торт, заявка появится здесь.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <AdminOrderCard
                  key={order.id}
                  order={order}
                  onStatus={(status) => void changeStatus(order.id, status)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-6">
          {CATEGORIES.map((category) => (
            <section key={category.id}>
              <h2 className="mb-3 font-display text-xl font-medium">
                {category.name}
              </h2>
              <div className="flex flex-col gap-3">
                {PRODUCTS.filter((item) => item.categoryId === category.id).map(
                  (product) => {
                    const hidden = hiddenIds.includes(product.id);
                    return (
                      <div
                        key={product.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 shadow-card"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted">
                            {formatPrice(product.price)}
                            {hidden ? " · скрыт" : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void toggleHidden(product.id, !hidden)}
                          className={cn(
                            "h-9 shrink-0 rounded-full px-3 text-xs font-medium",
                            hidden
                              ? "bg-saffron-soft text-saffron-deep"
                              : "bg-surface-2 text-muted",
                          )}
                        >
                          {hidden ? "Показать" : "Скрыть"}
                        </button>
                      </div>
                    );
                  },
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 rounded-xl text-sm font-medium transition-colors duration-150",
        active ? "bg-surface text-ink shadow-card" : "text-muted",
      )}
    >
      {children}
    </button>
  );
}

function AdminOrderCard({
  order,
  onStatus,
}: {
  order: OrderDto;
  onStatus: (
    status: "new" | "confirmed" | "baking" | "ready" | "cancelled",
  ) => void;
}) {
  const product = getProduct(order.productId);
  const how =
    order.fulfillment === "delivery"
      ? `доставка · ${order.address || "—"}`
      : "самовывоз";
  const kids = order.kidsCake
    ? `да, ${order.kidsAge || "—"} лет`
    : "нет";
  const allergies = formatAllergies(
    order.allergies.split(",").filter(Boolean),
    order.allergyNote,
  );
  return (
    <article className="rounded-xl bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted">Заказ #{order.id}</p>
          <h2 className="mt-1 font-medium leading-snug">{order.productName}</h2>
        </div>
        <StatusPill status={order.status} />
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <Info label="Вес" value={order.weight || "—"} />
        <Info label="Дата" value={formatDateRu(order.pickupDate)} />
        <Info label="Получение" value={how} />
        <Info label="Имя" value={order.clientName} />
        <Info label="Телефон" value={order.phone} />
        <Info label="Надпись" value={order.inscription.trim() || "—"} />
        <Info label="Комментарий" value={order.comment.trim() || "—"} />
        <Info label="Повод" value={optionLabel(OCCASIONS, order.occasion)} />
        <Info label="Аллергии" value={allergies} />
        <Info label="ПП" value={optionLabel(DIET_OPTIONS, order.diet)} />
        <Info label="Детский" value={kids} />
        <Info label="Цвет / референс" value={order.colorNote.trim() || "—"} />
        <Info label="Цена" value={formatPrice(order.price)} />
      </dl>
      {product ? (
        <img
          src={product.image}
          alt=""
          className="mt-4 h-16 w-16 rounded-2xl object-contain bg-cream"
        />
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {ORDER_STATUSES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onStatus(item.id)}
            className={cn(
              "h-10 rounded-2xl text-xs font-medium",
              order.status === item.id
                ? "bg-saffron text-on-saffron"
                : "bg-surface-2 text-muted",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="max-w-[60%] text-right font-medium">{value}</dd>
    </div>
  );
}
