import { createHmac, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getRequest } from "@tanstack/react-start/server";
import { DIET_OPTIONS, OCCASIONS, optionLabel } from "./catalog";
import { formatDateRu, formatPrice } from "./format";

export const ADMIN_TELEGRAM_ID = "743736933";

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
};

export type ClientSession = {
  telegramId: string;
  isAdmin: boolean;
  firstName: string;
};

export type OrderNotice = {
  id: number;
  product_name: string;
  weight: string;
  pickup_date: string;
  price: number;
  fulfillment: string;
  address: string;
  client_name: string;
  phone: string;
  inscription: string;
  comment: string;
  occasion: string;
  allergies: string;
  diet: string;
  kids_cake: boolean;
  kids_age: string;
  color_note: string;
};

function readEnv(name: string): string {
  const env =
    typeof process === "undefined"
      ? undefined
      : (process.env as Record<string, string | undefined> | undefined);
  const value = env?.[name];
  return typeof value === "string" ? value.trim() : "";
}

function isVercel() {
  return Boolean(readEnv("VERCEL") || readEnv("VERCEL_ENV"));
}

export function getBotToken() {
  return readEnv("TELEGRAM_BOT_TOKEN");
}

function deployedHttpsOrigin() {
  const explicit = readEnv("TELEGRAM_WEBAPP_URL").replace(/\/$/, "");
  if (explicit.startsWith("https://")) return explicit;
  const host = (
    readEnv("VERCEL_PROJECT_PRODUCTION_URL") || readEnv("VERCEL_URL")
  )
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  if (host) return `https://${host}`;
  return "";
}

function webAppUrl() {
  return deployedHttpsOrigin();
}

export function publicOriginFromRequest(request?: Request) {
  const req = request ?? getRequest();
  const url = new URL(req.url);
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  const proto = isVercel()
    ? "https"
    : (req.headers.get("x-forwarded-proto") ??
      (url.protocol === "http:" ? "http" : "https"));
  const fromRequest = `${proto}://${host}`.replace(/\/$/, "");
  if (fromRequest.startsWith("https://")) return fromRequest;
  return deployedHttpsOrigin() || fromRequest;
}

export function verifyInitData(initData: string, token: string) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = createHmac("sha256", "WebAppData").update(token).digest();
  const digest = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");
  const left = Buffer.from(digest, "hex");
  const right = Buffer.from(hash, "hex");
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }
  const authDate = Number(params.get("auth_date") ?? "0");
  if (authDate && Date.now() / 1000 - authDate > 60 * 60 * 24) {
    return null;
  }
  const raw = params.get("user");
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as TelegramUser;
    if (typeof user.id !== "number") return null;
    return user;
  } catch {
    return null;
  }
}

function isAdminId(id: string | number) {
  return String(id) === ADMIN_TELEGRAM_ID;
}

export function resolveClient(input: {
  initData?: string;
  previewId?: string;
}): ClientSession {
  const token = getBotToken();
  const initData = input.initData?.trim() ?? "";
  if (token && initData) {
    const user = verifyInitData(initData, token);
    if (!user) {
      throw new Error("Сессия Telegram недействительна");
    }
    return {
      telegramId: String(user.id),
      isAdmin: isAdminId(user.id),
      firstName: user.first_name ?? "",
    };
  }
  return {
    telegramId: input.previewId?.trim() || "web-guest",
    isAdmin: false,
    firstName: "",
  };
}

export function requireAdmin(input: {
  initData?: string;
  previewId?: string;
}) {
  const session = resolveClient(input);
  if (!session.isAdmin) {
    throw new Error("Нет доступа");
  }
  return session;
}

async function telegramCall(method: string, payload: Record<string, unknown>) {
  const token = getBotToken();
  if (!token) return { ok: false as const, description: "no token" };
  const response = await fetch(
    `https://api.telegram.org/bot${token}/${method}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  return (await response.json()) as {
    ok: boolean;
    description?: string;
  };
}

const startCaption = ["Saffron", "Торты на заказ"].join("\n");

function orderKeyboard(appUrl: string) {
  if (appUrl) {
    return {
      keyboard: [
        [
          {
            text: "Заказать",
            web_app: { url: appUrl },
          },
        ],
      ],
      resize_keyboard: true,
      is_persistent: true,
    };
  }
  return {
    keyboard: [[{ text: "Заказать" }]],
    resize_keyboard: true,
    is_persistent: true,
  };
}

export async function sendStartMessage(chatId: number, origin: string) {
  const httpsOrigin = origin.startsWith("https://")
    ? origin.replace(/\/$/, "")
    : webAppUrl();
  const appUrl = httpsOrigin;
  const markup = orderKeyboard(appUrl);
  const photoUrl = appUrl ? `${appUrl}/images/hero.jpg` : "";
  if (photoUrl) {
    const photoResult = await telegramCall("sendPhoto", {
      chat_id: chatId,
      photo: photoUrl,
      caption: startCaption,
      reply_markup: markup,
    });
    if (photoResult.ok) return;
  }
  const uploaded = await sendLocalHeroPhoto(chatId, markup);
  if (uploaded) return;
  await telegramCall("sendMessage", {
    chat_id: chatId,
    text: startCaption,
    reply_markup: markup,
  });
}

async function sendLocalHeroPhoto(
  chatId: number,
  markup: ReturnType<typeof orderKeyboard>,
) {
  const token = getBotToken();
  if (!token) return false;
  try {
    const bytes = readFileSync(join(process.cwd(), "public/images/hero.jpg"));
    const form = new FormData();
    form.set("chat_id", String(chatId));
    form.set("caption", startCaption);
    if (markup) form.set("reply_markup", JSON.stringify(markup));
    form.set("photo", new Blob([bytes], { type: "image/jpeg" }), "hero.jpg");
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendPhoto`,
      { method: "POST", body: form },
    );
    const body = (await response.json()) as { ok?: boolean };
    return Boolean(body.ok);
  } catch {
    return false;
  }
}

export function formatOrderNotice(order: OrderNotice) {
  const how =
    order.fulfillment === "delivery"
      ? `доставка, ${order.address.trim() || "адрес не указан"}`
      : "самовывоз";
  const kids = order.kids_cake
    ? `да, ${order.kids_age || "возраст не указан"}`
    : "нет";
  return [
    `Новый заказ #${order.id}`,
    `Товар: ${order.product_name}`,
    `Вес: ${order.weight || "—"}`,
    `Цена: ${formatPrice(order.price)}`,
    `Дата: ${formatDateRu(order.pickup_date)}`,
    `Получение: ${how}`,
    `Имя: ${order.client_name}`,
    `Телефон: ${order.phone}`,
    `Надпись: ${order.inscription.trim() || "—"}`,
    `Комментарий: ${order.comment.trim() || "—"}`,
    `Повод: ${optionLabel(OCCASIONS, order.occasion)}`,
    `Аллергии: ${order.allergies}`,
    `ПП: ${optionLabel(DIET_OPTIONS, order.diet)}`,
    `Детский торт: ${kids}`,
    `Цвет / референс: ${order.color_note.trim() || "—"}`,
  ].join("\n");
}

export async function notifyOrder(order: OrderNotice, clientTelegramId: string) {
  const token = getBotToken();
  if (!token) {
    console.error("[saffron] notifyOrder skipped: no TELEGRAM_BOT_TOKEN");
    return;
  }
  const text = formatOrderNotice(order);
  try {
    const adminResult = await telegramCall("sendMessage", {
      chat_id: Number(ADMIN_TELEGRAM_ID),
      text,
      disable_web_page_preview: true,
    });
    if (!adminResult.ok) {
      console.error("[saffron] admin notify failed:", adminResult.description);
    }
  } catch (err) {
    console.error("[saffron] admin notify error:", err);
  }

  const clientId = Number(clientTelegramId);
  if (!Number.isFinite(clientId) || clientId <= 0) return;
  try {
    const clientResult = await telegramCall("sendMessage", {
      chat_id: clientId,
      text: `Ваш заказ принят\n\n${text}`,
      disable_web_page_preview: true,
    });
    if (!clientResult.ok) {
      console.error("[saffron] client notify failed:", clientResult.description);
    }
  } catch (err) {
    console.error("[saffron] client notify error:", err);
  }
}

let webhookReadyFor: string | null = null;

export async function ensureTelegramWebhook(origin?: string) {
  const token = getBotToken();
  if (!token) return { ok: false, reason: "no token" as const };
  const resolved = origin ?? publicOriginFromRequest();
  if (!resolved.startsWith("https://")) {
    return { ok: false, reason: "http" as const };
  }
  const url = `${resolved}/api/telegram/webhook`;
  if (webhookReadyFor === url) return { ok: true, url };
  await telegramCall("setMyCommands", { commands: [] });
  const result = await telegramCall("setWebhook", {
    url,
    allowed_updates: ["message"],
    drop_pending_updates: false,
  });
  if (result.ok) {
    webhookReadyFor = url;
    await telegramCall("setChatMenuButton", {
      menu_button: {
        type: "web_app",
        text: "Заказать",
        web_app: { url: resolved.replace(/\/$/, "") },
      },
    });
  }
  return { ok: result.ok, url, description: result.description };
}

export async function handleTelegramUpdate(
  update: { message?: { chat?: { id?: number }; text?: string } },
  origin: string,
) {
  const text = update.message?.text?.trim() ?? "";
  const chatId = update.message?.chat?.id;
  if (!chatId) return;
  if (text.startsWith("/start") || text === "Заказать") {
    await sendStartMessage(chatId, origin);
  }
}

type GlobalPoll = typeof globalThis & {
  __saffronTelegramPoll?: boolean;
};

export function startTelegramPolling() {
  if (isVercel()) return;
  if (!getBotToken()) return;
  const pollHost = globalThis as GlobalPoll;
  if (pollHost.__saffronTelegramPoll) return;
  pollHost.__saffronTelegramPoll = true;
  void pollTelegramUpdates();
}

async function pollTelegramUpdates() {
  let offset = 0;
  while (true) {
    if (isVercel()) return;
    const token = getBotToken();
    if (!token) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/getUpdates`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            offset,
            timeout: 25,
            allowed_updates: ["message"],
          }),
        },
      );
      const data = (await response.json()) as {
        ok?: boolean;
        result?: Array<{
          update_id: number;
          message?: { chat?: { id?: number }; text?: string };
        }>;
        description?: string;
      };
      if (!data.ok) {
        if (data.description?.toLowerCase().includes("webhook")) return;
        await new Promise((resolve) => setTimeout(resolve, 3000));
        continue;
      }
      const origin = webAppUrl();
      for (const update of data.result ?? []) {
        offset = update.update_id + 1;
        await handleTelegramUpdate(update, origin);
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}
