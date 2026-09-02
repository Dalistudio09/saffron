import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import {
  ALLERGY_OPTIONS,
  DIET_OPTIONS,
  OCCASIONS,
  formatAllergies,
  getProduct,
} from "@/lib/catalog";
import {
  addDaysIso,
  formatPhoneInput,
  isCompletePhone,
  todayIso,
} from "@/lib/format";
import {
  ensureTelegramWebhook,
  notifyOrder,
  requireAdmin,
  resolveClient,
} from "@/lib/telegram.server";

const identitySchema = z.object({
  initData: z.string().optional(),
  previewId: z.string().optional(),
});

const occasionIds = OCCASIONS.map((item) => item.id) as [string, ...string[]];
const dietIds = DIET_OPTIONS.map((item) => item.id) as [string, ...string[]];
const allergyIds = ALLERGY_OPTIONS.map((item) => item.id) as [
  string,
  ...string[],
];

export type OrderDto = {
  id: number;
  telegramId: string;
  clientName: string;
  phone: string;
  productId: string;
  productName: string;
  weight: string;
  price: number;
  leadDays: number;
  pickupDate: string;
  fulfillment: string;
  address: string;
  inscription: string;
  comment: string;
  occasion: string;
  allergies: string;
  allergyNote: string;
  diet: string;
  kidsCake: boolean;
  kidsAge: string;
  colorNote: string;
  status: string;
  createdAt: string;
};

type OrderRow = {
  id: number;
  telegram_id: string;
  client_name: string;
  phone: string;
  product_id: string;
  product_name: string;
  weight: string | null;
  price: number;
  lead_days: number;
  pickup_date: string;
  fulfillment: string | null;
  address: string | null;
  inscription: string;
  comment: string | null;
  occasion: string | null;
  allergies: string | null;
  allergy_note: string | null;
  diet: string | null;
  kids_cake: boolean | null;
  kids_age: string | null;
  color_note: string | null;
  status: string;
  created_at: Date | string;
};

function mapOrder(row: OrderRow): OrderDto {
  return {
    id: row.id,
    telegramId: row.telegram_id,
    clientName: row.client_name,
    phone: row.phone,
    productId: row.product_id,
    productName: row.product_name,
    weight: row.weight ?? "",
    price: row.price,
    leadDays: row.lead_days,
    pickupDate: row.pickup_date,
    fulfillment: row.fulfillment ?? "pickup",
    address: row.address ?? "",
    inscription: row.inscription ?? "",
    comment: row.comment ?? "",
    occasion: row.occasion ?? "none",
    allergies: row.allergies ?? "none",
    allergyNote: row.allergy_note ?? "",
    diet: row.diet ?? "regular",
    kidsCake: Boolean(row.kids_cake),
    kidsAge: row.kids_age ?? "",
    colorNote: row.color_note ?? "",
    status: row.status,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

async function hiddenIds() {
  const sql = await getSql();
  const rows = await sql<{ product_id: string }>`
    select product_id from hidden_products
  `;
  return rows.map((row) => row.product_id);
}

export const getBootstrap = createServerFn({ method: "POST" })
  .validator(identitySchema)
  .handler(async ({ data }) => {
    const session = resolveClient(data);
    try {
      await ensureTelegramWebhook();
    } catch {
      // Preview / missing token — ignore.
    }
    return {
      telegramId: session.telegramId,
      isAdmin: session.isAdmin,
      firstName: session.firstName,
      hiddenProductIds: await hiddenIds(),
    };
  });

export const listMyOrders = createServerFn({ method: "POST" })
  .validator(identitySchema)
  .handler(async ({ data }) => {
    const session = resolveClient(data);
    const sql = await getSql();
    const rows = await sql<OrderRow>`
      select * from orders
      where telegram_id = ${session.telegramId}
      order by created_at desc
    `;
    return rows.map(mapOrder);
  });

export const createOrder = createServerFn({ method: "POST" })
  .validator(
    identitySchema.extend({
      productId: z.string(),
      pickupDate: z.string(),
      clientName: z.string().min(2).max(80),
      phone: z.string().min(5).max(32),
      inscription: z.string().max(80).optional(),
      fulfillment: z.enum(["pickup", "delivery"]),
      address: z.string().max(120).optional(),
      comment: z.string().max(200).optional(),
      occasion: z.enum(occasionIds),
      allergies: z.array(z.enum(allergyIds)).min(1),
      allergyNote: z.string().max(80).optional(),
      diet: z.enum(dietIds),
      kidsCake: z.boolean(),
      kidsAge: z.string().max(8).optional(),
      colorNote: z.string().max(80).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const session = resolveClient(data);
    const product = getProduct(data.productId);
    if (!product) throw new Error("Торт не найден");
    const hidden = await hiddenIds();
    if (hidden.includes(product.id)) {
      throw new Error("Этот торт сейчас недоступен");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.pickupDate)) {
      throw new Error("Выберите дату");
    }
    const earliest = addDaysIso(todayIso(), product.leadDays);
    if (data.pickupDate < earliest) {
      throw new Error("Эта дата слишком рано — нужен срок на приготовление");
    }
    const name = data.clientName.trim();
    if (name.length < 2) throw new Error("Напишите имя");
    const phone = formatPhoneInput(data.phone);
    if (!isCompletePhone(phone)) {
      throw new Error("Укажите телефон полностью");
    }
    const inscription = (data.inscription ?? "").trim();
    const fulfillment = data.fulfillment;
    const address = (data.address ?? "").trim();
    if (fulfillment === "delivery" && address.length < 4) {
      throw new Error("Напишите район или адрес доставки");
    }
    const allergies = data.allergies.includes("none")
      ? ["none"]
      : data.allergies.filter((id) => id !== "none");
    const allergyNote = (data.allergyNote ?? "").trim();
    if (allergies.includes("other") && allergyNote.length < 2) {
      throw new Error("Напишите, какая аллергия");
    }
    const kidsAge = data.kidsCake ? (data.kidsAge ?? "").trim() : "";
    if (data.kidsCake && !kidsAge) {
      throw new Error("Укажите возраст ребёнка");
    }

    const sql = await getSql();
    const inserted = await sql<OrderRow>`
      insert into orders (
        telegram_id, client_name, phone,
        product_id, product_name, weight, price, lead_days,
        pickup_date, fulfillment, address, inscription, comment,
        occasion, allergies, allergy_note, diet,
        kids_cake, kids_age, color_note, status
      ) values (
        ${session.telegramId}, ${name}, ${phone},
        ${product.id}, ${product.name}, ${product.weight}, ${product.price}, ${product.leadDays},
        ${data.pickupDate}, ${fulfillment}, ${address}, ${inscription},
        ${(data.comment ?? "").trim()},
        ${data.occasion}, ${allergies.join(",")}, ${allergyNote}, ${data.diet},
        ${data.kidsCake}, ${kidsAge}, ${(data.colorNote ?? "").trim()},
        'new'
      )
      returning *
    `;
    const row = inserted[0];
    if (!row) throw new Error("Не удалось сохранить заказ");
    const order = mapOrder(row);
    try {
      await notifyOrder(
        {
          id: order.id,
          product_name: order.productName,
          weight: order.weight,
          pickup_date: order.pickupDate,
          price: order.price,
          fulfillment: order.fulfillment,
          address: order.address,
          client_name: order.clientName,
          phone: order.phone,
          inscription: order.inscription,
          comment: order.comment,
          occasion: order.occasion,
          allergies: formatAllergies(
            order.allergies.split(",").filter(Boolean),
            order.allergyNote,
          ),
          diet: order.diet,
          kids_cake: order.kidsCake,
          kids_age: order.kidsAge,
          color_note: order.colorNote,
        },
        session.telegramId,
      );
    } catch {
      // Заказ уже в базе — сбой Telegram не откатывает запись.
    }
    return order;
  });

export const listAdminOrders = createServerFn({ method: "POST" })
  .validator(identitySchema.extend({ status: z.string().optional() }))
  .handler(async ({ data }) => {
    requireAdmin(data);
    const sql = await getSql();
    const status = data.status?.trim() || "";
    const rows =
      status && status !== "all"
        ? await sql<OrderRow>`
            select *
            from orders
            where status = ${status}
            order by created_at desc
          `
        : await sql<OrderRow>`
            select *
            from orders
            order by case when status = 'new' then 0 else 1 end, created_at desc
          `;
    return rows.map(mapOrder);
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .validator(
    identitySchema.extend({
      id: z.number(),
      status: z.enum(["new", "confirmed", "baking", "ready", "cancelled"]),
    }),
  )
  .handler(async ({ data }) => {
    requireAdmin(data);
    const sql = await getSql();
    const rows = await sql<OrderRow>`
      update orders set status = ${data.status}
      where id = ${data.id}
      returning *
    `;
    if (!rows[0]) throw new Error("Заказ не найден");
    return mapOrder(rows[0]);
  });

export const setProductHidden = createServerFn({ method: "POST" })
  .validator(
    identitySchema.extend({
      productId: z.string(),
      hidden: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    requireAdmin(data);
    if (!getProduct(data.productId)) throw new Error("Торт не найден");
    const sql = await getSql();
    if (data.hidden) {
      await sql`
        insert into hidden_products (product_id)
        values (${data.productId})
        on conflict (product_id) do nothing
      `;
    } else {
      await sql`
        delete from hidden_products where product_id = ${data.productId}
      `;
    }
    return { hiddenProductIds: await hiddenIds() };
  });
