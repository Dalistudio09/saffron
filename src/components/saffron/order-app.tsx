import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CakeSlice, Check, Download } from "lucide-react";
import {
  ALLERGY_OPTIONS,
  CATEGORIES,
  DIET_OPTIONS,
  HERO_IMAGE,
  OCCASIONS,
  formatLead,
  getCategory,
  getProduct,
  visibleProducts,
  type AllergyId,
  type Audience,
  type CakeSize,
  type Category,
  type CategoryId,
  type DietId,
  type Fulfillment,
  type OccasionId,
  type Product,
} from "@/lib/catalog";
import {
  dayNumber,
  formatDateRu,
  formatPhoneInput,
  formatPrice,
  isCompletePhone,
  pickupDays,
  weekdayShort,
} from "@/lib/format";
import {
  createOrder,
  getBootstrap,
  listMyOrders,
  type OrderDto,
} from "@/lib/saffron.functions";
import { identityPayload, initTelegramUi, getTelegram } from "@/lib/telegram";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/saffron/app-shell";
import {
  Field,
  InscriptionInput,
  NameInput,
  TextInput,
  UncontrolledInput,
  UncontrolledTextarea,
} from "@/components/saffron/field";
import { ScreenHeader } from "@/components/saffron/screen-header";
import { StatusPill } from "@/components/saffron/status-pill";

type Screen =
  | "home"
  | "audience"
  | "size"
  | "catalog"
  | "product"
  | "form"
  | "success"
  | "orders";

const emptyForm = {
  pickupDate: "",
  fulfillment: "pickup" as Fulfillment,
  address: "",
  clientName: "",
  phone: "",
  inscription: "",
  comment: "",
  occasion: "none" as OccasionId,
  allergies: ["none"] as AllergyId[],
  allergyNote: "",
  diet: "regular" as DietId,
  kidsCake: false,
  kidsAge: "",
  colorNote: "",
};

export function OrderApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [isAdmin, setIsAdmin] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);
  const [audience, setAudience] = useState<Audience | null>(null);
  const [cakeSize, setCakeSize] = useState<CakeSize | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<OrderDto | null>(null);
  const [mine, setMine] = useState<OrderDto[] | null>(null);

  const product = productId ? getProduct(productId) : undefined;
  const category = categoryId ? getCategory(categoryId) : undefined;
  const catalog = categoryId
    ? visibleProducts(hiddenIds, categoryId, { audience, size: cakeSize })
    : [];

  useEffect(() => {
    initTelegramUi();
    void getBootstrap({ data: identityPayload() })
      .then((session) => {
        setIsAdmin(session.isAdmin);
        setHiddenIds(session.hiddenProductIds);
      })
      .catch(() => {
        // Catalog still renders from the local seed.
      });
  }, []);

  useEffect(() => {
    const tg = getTelegram();
    if (!tg) return;
    const goBack = () => goBackScreen();
    if (screen === "home" || screen === "success") {
      tg.BackButton.hide();
      return;
    }
    tg.BackButton.show();
    tg.BackButton.onClick(goBack);
    return () => {
      tg.BackButton.offClick(goBack);
      tg.BackButton.hide();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  function patch<K extends keyof typeof emptyForm>(
    key: K,
    value: (typeof emptyForm)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetFlow() {
    setScreen("home");
    setCategoryId(null);
    setAudience(null);
    setCakeSize(null);
    setProductId(null);
    setForm(emptyForm);
    setError("");
    setCreated(null);
  }

  function openCategory(id: CategoryId) {
    setError("");
    setCategoryId(id);
    setProductId(null);
    setAudience(null);
    setCakeSize(null);
    if (id === "bento" || id === "cakes") {
      setScreen("audience");
      return;
    }
    setScreen("catalog");
  }

  function goBackScreen() {
    setError("");
    if (screen === "audience") {
      setScreen("home");
      return;
    }
    if (screen === "size") {
      setCakeSize(null);
      setScreen("audience");
      return;
    }
    if (screen === "catalog") {
      if (categoryId === "cakes") {
        setCakeSize(null);
        setScreen("size");
        return;
      }
      if (categoryId === "bento") {
        setAudience(null);
        setScreen("audience");
        return;
      }
      setScreen("home");
      return;
    }
    if (screen === "product") {
      setScreen("catalog");
      return;
    }
    if (screen === "form") {
      setScreen("product");
      return;
    }
    if (screen === "orders") {
      setScreen("home");
    }
  }

  async function openMine() {
    setError("");
    setScreen("orders");
    setMine(null);
    try {
      setMine(await listMyOrders({ data: identityPayload() }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить заказы");
      setMine([]);
    }
  }

  async function submit() {
    if (!product) return;
    if (!form.pickupDate) {
      setError("Выберите дату");
      return;
    }
    if (form.fulfillment === "delivery" && form.address.trim().length < 4) {
      setError("Напишите район или адрес доставки");
      return;
    }
    if (form.clientName.trim().length < 2) {
      setError("Напишите имя");
      return;
    }
    if (!isCompletePhone(form.phone)) {
      setError("Укажите телефон полностью");
      return;
    }
    if (form.allergies.includes("other") && form.allergyNote.trim().length < 2) {
      setError("Напишите, какая аллергия");
      return;
    }
    if (form.kidsCake && !form.kidsAge.trim()) {
      setError("Укажите возраст ребёнка");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const order = await createOrder({
        data: {
          ...identityPayload(),
          productId: product.id,
          pickupDate: form.pickupDate,
          clientName: form.clientName.trim(),
          phone: formatPhoneInput(form.phone),
          inscription: form.inscription.trim(),
          fulfillment: form.fulfillment,
          address: form.address.trim(),
          comment: form.comment.trim(),
          occasion: form.occasion,
          allergies: form.allergies,
          allergyNote: form.allergyNote.trim(),
          diet: form.diet,
          kidsCake: form.kidsCake,
          kidsAge: form.kidsAge.trim(),
          colorNote: form.colorNote.trim(),
        },
      });
      setCreated(order);
      setScreen("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось отправить заказ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      {screen === "home" && (
        <HomeScreen
          isAdmin={isAdmin}
          onOpenCategory={openCategory}
          onMine={openMine}
        />
      )}

      {screen === "audience" && category && (
        <ChoiceScreen
          title={category.name}
          hint={
            category.id === "cakes"
              ? "Вес и для кого нужны, чтобы торт не оказался маленьким."
              : undefined
          }
          options={[
            { id: "adult", label: "Взрослый", caption: "Классический вкус и спокойный декор" },
            { id: "kids", label: "Детский", caption: "Яркий декор, можно надпись" },
          ]}
          onBack={goBackScreen}
          onPick={(id) => {
            setAudience(id as Audience);
            setError("");
            if (category.id === "cakes") {
              setScreen("size");
              return;
            }
            setScreen("catalog");
          }}
        />
      )}

      {screen === "size" && category && (
        <ChoiceScreen
          title={category.name}
          hint="Вес и для кого нужны, чтобы торт не оказался маленьким."
          options={[
            { id: "1kg", label: "1 кг", caption: "Около 8–10 порций" },
            { id: "2kg", label: "от 2 кг", caption: "На компанию" },
          ]}
          onBack={goBackScreen}
          onPick={(id) => {
            setCakeSize(id as CakeSize);
            setError("");
            setScreen("catalog");
          }}
        />
      )}

      {screen === "catalog" && category && (
        <CatalogScreen
          category={category}
          subtitle={[
            audience === "kids" ? "Детский" : audience === "adult" ? "Взрослый" : "",
            cakeSize === "1kg" ? "1 кг" : cakeSize === "2kg" ? "от 2 кг" : "",
          ]
            .filter(Boolean)
            .join(" · ")}
          products={catalog}
          onBack={goBackScreen}
          onOpen={(id) => {
            setError("");
            setProductId(id);
            setScreen("product");
          }}
        />
      )}

      {screen === "product" && product && (
        <ProductScreen
          product={product}
          onBack={goBackScreen}
          onOrder={() => {
            const days = pickupDays(product.leadDays, 12);
            setForm({
              ...emptyForm,
              pickupDate: days[0] ?? "",
              kidsCake: product.audience === "kids",
            });
            setError("");
            setScreen("form");
          }}
        />
      )}

      {screen === "form" && product && (
        <FormScreen
          product={product}
          form={form}
          error={error}
          submitting={submitting}
          onBack={goBackScreen}
          onPatch={patch}
          onSubmit={() => void submit()}
        />
      )}

      {screen === "success" && created && (
        <SuccessScreen
          order={created}
          onHome={resetFlow}
          onMine={openMine}
        />
      )}

      {screen === "orders" && (
        <MyOrdersScreen
          orders={mine}
          error={error}
          onBack={goBackScreen}
          onHome={resetFlow}
        />
      )}
    </AppShell>
  );
}

function HomeScreen({
  isAdmin,
  onOpenCategory,
  onMine,
}: {
  isAdmin: boolean;
  onOpenCategory: (id: CategoryId) => void;
  onMine: () => void;
}) {
  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-3 saffron-enter">
        <h1 className="font-display text-[2.75rem] font-medium leading-none tracking-tight">
          Saffron
        </h1>
        {isAdmin ? (
          <Link
            to="/admin"
            className="mt-1 text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Админ
          </Link>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl shadow-card saffron-enter saffron-enter-2">
        <img
          src={HERO_IMAGE}
          alt="Торты Saffron"
          className="h-28 w-full object-cover"
        />
      </div>

      <h2 className="mt-5 font-display text-[1.55rem] font-medium leading-snug saffron-enter saffron-enter-3">
        Выберите любимое лакомство
      </h2>

      <div className="relative z-10 mt-3 grid w-full min-w-0 grid-cols-2 gap-3 saffron-enter saffron-enter-3">
        {CATEGORIES.map((item) => (
          <CategoryTile
            key={item.id}
            category={item}
            onClick={() => onOpenCategory(item.id)}
          />
        ))}
      </div>

      <Button variant="secondary" className="mt-6" onClick={onMine}>
        <CakeSlice className="mr-2 size-4" />
        Мои заказы
      </Button>
      {import.meta.env.DEV ? (
        <a
          href="/api/saffron-src"
          download="saffron-vercel.zip"
          className="relative z-10 mt-3 inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-saffron px-5 text-sm font-medium text-on-saffron shadow-card select-none touch-manipulation"
        >
          <Download className="mr-2 size-4" />
          Скачать архив для Vercel
        </a>
      ) : null}
    </>
  );
}

function CategoryTile({
  category,
  onClick,
}: {
  category: Category;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        "relative z-10 flex w-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl bg-surface text-left shadow-card",
        "select-none touch-manipulation",
      )}
    >
      <span className="pointer-events-none block aspect-[4/3] w-full overflow-hidden bg-cream">
        <img
          src={category.image}
          alt=""
          draggable={false}
          className="pointer-events-none h-full w-full object-cover object-center"
        />
      </span>
      <span className="pointer-events-none px-2 py-2.5 text-center font-display text-[0.98rem] font-medium leading-none tracking-tight">
        {category.name}
      </span>
    </button>
  );
}

function Photo({
  src,
  alt,
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  return (
    <span className={cn("pointer-events-none block overflow-hidden bg-cream", className)}>
      <img
        src={src}
        alt={alt ?? ""}
        draggable={false}
        className="pointer-events-none h-full w-full object-cover object-center"
      />
    </span>
  );
}

function ChoiceScreen({
  title,
  hint,
  options,
  onBack,
  onPick,
}: {
  title: string;
  hint?: string;
  options: { id: string; label: string; caption: string }[];
  onBack: () => void;
  onPick: (id: string) => void;
}) {
  return (
    <>
      <ScreenHeader title={title} onBack={onBack} />
      {hint ? (
        <p className="mb-5 text-xs leading-snug text-faint">{hint}</p>
      ) : null}
      <div className="flex flex-col gap-3">
        {options.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onPick(item.id)}
            className="relative z-10 min-h-20 w-full cursor-pointer rounded-2xl bg-surface px-5 py-4 text-left shadow-card select-none touch-manipulation"
          >
            <span className="block font-display text-2xl font-medium leading-none">
              {item.label}
            </span>
            <span className="mt-2 block text-sm leading-snug text-muted">
              {item.caption}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function CatalogScreen({
  category,
  subtitle,
  products,
  onBack,
  onOpen,
}: {
  category: Category;
  subtitle?: string;
  products: Product[];
  onBack: () => void;
  onOpen: (id: string) => void;
}) {
  return (
    <>
      <ScreenHeader title={category.name} onBack={onBack} />
      {subtitle ? (
        <p className="-mt-2 mb-4 text-sm text-muted">{subtitle}</p>
      ) : null}
      <div className="flex flex-col gap-6">
        {products.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item.id)}
            className="relative z-10 w-full min-w-0 cursor-pointer select-none text-left touch-manipulation"
          >
            <span className="block overflow-hidden rounded-2xl bg-surface shadow-card">
              <Photo src={item.image} alt={item.name} className="aspect-[4/3] w-full" />
            </span>
            <span className="mt-3 block font-display text-2xl font-medium leading-snug">
              {item.name}
            </span>
            {item.composition ? (
              <span className="mt-1 block text-sm font-medium text-saffron-deep">
                {item.composition}
              </span>
            ) : null}
            <span className="mt-1 block text-sm leading-snug text-muted">
              {item.description}
            </span>
            <span className="mt-2 flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium">
                {item.weight} · {formatPrice(item.price)}
              </span>
              <span className="text-xs text-muted">срок {formatLead(item.leadDays)}</span>
            </span>
          </button>
        ))}
        {products.length === 0 && (
          <p className="text-sm text-muted">Сейчас нет позиций в этой категории.</p>
        )}
      </div>
    </>
  );
}

function ProductScreen({
  product,
  onBack,
  onOrder,
}: {
  product: Product;
  onBack: () => void;
  onOrder: () => void;
}) {
  return (
    <>
      <ScreenHeader title={product.name} onBack={onBack} />
      <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
        <Photo src={product.image} alt={product.name} className="aspect-[4/3] w-full" />
      </div>
      <p className="mt-5 text-base leading-relaxed text-muted">
        {product.description}
      </p>
      {product.composition ? (
        <p className="mt-3 text-sm font-medium text-saffron-deep">
          Состав: {product.composition}
        </p>
      ) : null}
      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{product.weight}</p>
          <p className="mt-1 font-display text-3xl font-medium leading-none">
            {formatPrice(product.price)}
          </p>
        </div>
        <p className="text-sm text-muted">срок {formatLead(product.leadDays)}</p>
      </div>
      <Button className="mt-8" onClick={onOrder}>
        Заказать
      </Button>
    </>
  );
}

function FormScreen({
  product,
  form,
  error,
  submitting,
  onBack,
  onPatch,
  onSubmit,
}: {
  product: Product;
  form: typeof emptyForm;
  error: string;
  submitting: boolean;
  onBack: () => void;
  onPatch: <K extends keyof typeof emptyForm>(
    key: K,
    value: (typeof emptyForm)[K],
  ) => void;
  onSubmit: () => void;
}) {
  const days = pickupDays(product.leadDays, 8);
  const showOther = form.allergies.includes("other");

  function toggleAllergy(id: AllergyId) {
    if (id === "none") {
      onPatch("allergies", ["none"]);
      return;
    }
    const withoutNone = form.allergies.filter((item) => item !== "none");
    const next = withoutNone.includes(id)
      ? withoutNone.filter((item) => item !== id)
      : [...withoutNone, id];
    onPatch("allergies", next.length ? next : ["none"]);
  }

  return (
    <>
      <ScreenHeader title="Анкета" onBack={onBack} />
      <div className="mb-4 rounded-xl bg-surface p-3 shadow-card">
        <p className="font-medium leading-snug">{product.name}</p>
        <p className="mt-1 text-sm text-muted">
          {product.weight} · {formatPrice(product.price)}
        </p>
      </div>
      <p className="mb-5 text-xs leading-snug text-faint">
        Дата и аллергии нужны, чтобы торт успели и не навредили.
      </p>

      <div className="flex flex-col gap-4">
        <Field label="Дата, к которой нужно">
          <div className="grid grid-cols-4 gap-1.5">
            {days.map((iso) => {
              const selected = iso === form.pickupDate;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => onPatch("pickupDate", iso)}
                  className={cn(
                    "flex h-14 w-full min-w-0 cursor-pointer flex-col items-center justify-center rounded-2xl text-sm select-none touch-manipulation",
                    selected
                      ? "bg-saffron text-on-saffron"
                      : "bg-surface text-ink shadow-card",
                  )}
                >
                  <span className="text-[10px] uppercase text-current opacity-70">
                    {weekdayShort(iso)}
                  </span>
                  <span className="text-sm font-medium">{dayNumber(iso)}</span>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Как забрать">
          <div className="flex flex-wrap gap-2">
            <Chip
              active={form.fulfillment === "pickup"}
              onClick={() => onPatch("fulfillment", "pickup")}
            >
              Самовывоз
            </Chip>
            <Chip
              active={form.fulfillment === "delivery"}
              onClick={() => onPatch("fulfillment", "delivery")}
            >
              Доставка
            </Chip>
          </div>
        </Field>

        {form.fulfillment === "delivery" ? (
          <Field label="Район / адрес" htmlFor="address">
            <UncontrolledInput
              id="address"
              onValue={(value) => onPatch("address", value)}
              maxLength={120}
              placeholder="Район или улица"
            />
          </Field>
        ) : null}

        <Field label="Имя" htmlFor="client-name">
          <NameInput onValue={(value) => onPatch("clientName", value)} />
        </Field>

        <Field label="Телефон" htmlFor="client-phone">
          <TextInput
            id="client-phone"
            value={form.phone}
            onChange={(event) =>
              onPatch("phone", formatPhoneInput(event.target.value))
            }
            inputMode="tel"
            autoComplete="tel"
            maxLength={16}
            placeholder="+7 700 000 00 00"
          />
        </Field>

        <Field label="Надпись на торте" htmlFor="inscription" hint="Можно пропустить">
          <InscriptionInput onValue={(value) => onPatch("inscription", value)} />
        </Field>

        <Field label="Комментарий" htmlFor="comment">
          <UncontrolledTextarea
            id="comment"
            onValue={(value) => onPatch("comment", value)}
            maxLength={200}
            placeholder="Если есть пожелания"
          />
        </Field>
      </div>

      <section className="mt-6 rounded-2xl bg-surface p-4 shadow-card">
        <h2 className="font-display text-xl font-medium">Нюансы</h2>
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Повод">
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((item) => (
                <Chip
                  key={item.id}
                  active={form.occasion === item.id}
                  onClick={() => onPatch("occasion", item.id)}
                >
                  {item.label}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Аллергии">
            <div className="flex flex-wrap gap-2">
              {ALLERGY_OPTIONS.map((item) => (
                <Chip
                  key={item.id}
                  active={form.allergies.includes(item.id)}
                  onClick={() => toggleAllergy(item.id)}
                >
                  {item.label}
                </Chip>
              ))}
            </div>
          </Field>
          {showOther ? (
            <Field label="Какая аллергия" htmlFor="allergy-note">
              <UncontrolledInput
                id="allergy-note"
                onValue={(value) => onPatch("allergyNote", value)}
                maxLength={80}
                placeholder="Например, мёд"
              />
            </Field>
          ) : null}

          <Field label="ПП-ограничения">
            <div className="flex flex-wrap gap-2">
              {DIET_OPTIONS.map((item) => (
                <Chip
                  key={item.id}
                  active={form.diet === item.id}
                  onClick={() => onPatch("diet", item.id)}
                >
                  {item.label}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Детский торт">
            <div className="flex flex-wrap gap-2">
              <Chip
                active={!form.kidsCake}
                onClick={() => onPatch("kidsCake", false)}
              >
                нет
              </Chip>
              <Chip
                active={form.kidsCake}
                onClick={() => onPatch("kidsCake", true)}
              >
                да
              </Chip>
            </div>
          </Field>
          {form.kidsCake ? (
            <Field label="Возраст" htmlFor="kids-age">
              <UncontrolledInput
                id="kids-age"
                onValue={(value) => onPatch("kidsAge", value)}
                maxLength={2}
                inputMode="numeric"
                placeholder="Лет"
                filter={(value) => value.replace(/\D/g, "").slice(0, 2)}
              />
            </Field>
          ) : null}

          <Field label="Цвет или референс" htmlFor="color-note">
            <UncontrolledInput
              id="color-note"
              onValue={(value) => onPatch("colorNote", value)}
              maxLength={80}
              placeholder="Цвет крема или ссылка"
            />
          </Field>
        </div>
      </section>

      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      <Button className="mt-6" disabled={submitting} onClick={onSubmit}>
        {submitting ? "Отправляем…" : "Отправить заявку"}
      </Button>
    </>
  );
}

function Chip({
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
        "h-8 cursor-pointer rounded-full px-3 text-sm font-medium select-none touch-manipulation",
        active ? "bg-saffron text-on-saffron" : "bg-bg text-ink shadow-card",
      )}
    >
      {children}
    </button>
  );
}

function SuccessScreen({
  order,
  onHome,
  onMine,
}: {
  order: OrderDto;
  onHome: () => void;
  onMine: () => void;
}) {
  const how =
    order.fulfillment === "delivery"
      ? `доставка, ${order.address || "—"}`
      : "самовывоз";
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col items-center pt-6 text-center saffron-enter">
        <span className="flex size-14 items-center justify-center rounded-full bg-saffron-soft text-saffron-deep">
          <Check className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-medium leading-tight">
          Заявка принята
        </h1>
        <p className="mt-2 max-w-xs text-base leading-relaxed text-muted">
          Напишем вам в Telegram, когда торт будет готов.
        </p>
      </div>
      <div className="mt-6 rounded-xl bg-surface p-5 text-left shadow-card saffron-enter saffron-enter-3">
        <Row label="Торт" value={`${order.productName} · ${order.weight || "—"}`} />
        <Row label="Дата" value={formatDateRu(order.pickupDate)} />
        <Row label="Получение" value={how} />
        <Row label="Цена" value={formatPrice(order.price)} />
        <Row label="Надпись" value={order.inscription.trim() || "—"} last />
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <Button onClick={onHome}>На главную</Button>
        <Button variant="secondary" onClick={onMine}>
          Мои заказы
        </Button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div className={cn("py-3", !last && "border-b border-line")}>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function MyOrdersScreen({
  orders,
  error,
  onBack,
  onHome,
}: {
  orders: OrderDto[] | null;
  error: string;
  onBack: () => void;
  onHome: () => void;
}) {
  return (
    <>
      <ScreenHeader title="Мои заказы" onBack={onBack} />
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
      {orders === null ? (
        <p className="text-sm text-muted">Загружаем…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-xl bg-surface p-6 shadow-card">
          <p className="font-medium">Пока нет заказов</p>
          <p className="mt-1 text-sm text-muted">
            Выберите торт на главной — заявка займёт пару минут.
          </p>
          <Button className="mt-5" onClick={onHome}>
            К каталогу
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-xl bg-surface p-4 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{order.productName}</p>
                  <p className="mt-1 text-sm text-muted">
                    {formatDateRu(order.pickupDate)} ·{" "}
                    {order.fulfillment === "delivery" ? "доставка" : "самовывоз"}
                  </p>
                </div>
                <StatusPill status={order.status} />
              </div>
              <p className="mt-3 text-sm">{formatPrice(order.price)}</p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
