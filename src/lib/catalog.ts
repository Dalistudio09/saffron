export type CategoryId =
  | "bento"
  | "cakes"
  | "wedding"
  | "cheesecake"
  | "pies"
  | "desserts"
  | "healthy"
  | "sets";

export type Audience = "adult" | "kids";
export type CakeSize = "1kg" | "2kg";

export type Category = {
  id: CategoryId;
  name: string;
  image: string;
};

export type Product = {
  id: string;
  categoryId: CategoryId;
  name: string;
  description: string;
  weight: string;
  price: number;
  leadDays: number;
  image: string;
  audience?: Audience;
  size?: CakeSize;
  composition?: string;
};

export const CATEGORIES: Category[] = [
  { id: "bento", name: "Бенто", image: "/images/cat-bento.jpg" },
  { id: "cakes", name: "Торты", image: "/images/cat-cakes.jpg" },
  { id: "wedding", name: "Свадебные", image: "/images/cat-wedding.jpg" },
  { id: "cheesecake", name: "Чизкейки", image: "/images/cat-cheesecake.jpg" },
  { id: "pies", name: "Пироги", image: "/images/cat-pies.jpg" },
  { id: "desserts", name: "Десерты", image: "/images/cat-desserts-v2.jpg" },
  { id: "healthy", name: "ПП десерты", image: "/images/cat-healthy.jpg" },
  { id: "sets", name: "Наборы", image: "/images/cat-sets-v2.jpg" },
];

export const PRODUCTS: Product[] = [
  {
    id: "bento-berry",
    categoryId: "bento",
    audience: "adult",
    name: "Бенто «Ягода»",
    description: "Мини-торт 11 см с клубникой и малиной. На двоих.",
    weight: "11 см",
    price: 7500,
    leadDays: 1,
    image: "/images/bento-berry.jpg",
  },
  {
    id: "bento-chocolate",
    categoryId: "bento",
    audience: "adult",
    name: "Бенто «Шоколад»",
    description: "Плотный шоколадный бисквит и ганаш в коробочке.",
    weight: "11 см",
    price: 7500,
    leadDays: 1,
    image: "/images/bento-chocolate.jpg",
  },
  {
    id: "bento-carrot",
    categoryId: "bento",
    audience: "adult",
    name: "Бенто «Морковь»",
    description: "Морковный бисквит, кремчиз и грецкий орех.",
    weight: "11 см",
    price: 8000,
    leadDays: 1,
    image: "/images/bento-carrot.jpg",
  },
  {
    id: "bento-pistachio",
    categoryId: "bento",
    audience: "adult",
    name: "Бенто «Фисташка»",
    description: "Фисташковый крем и малина. Коробка на двоих.",
    weight: "11 см",
    price: 8500,
    leadDays: 1,
    image: "/images/bento-pistachio.jpg",
  },
  {
    id: "bento-caramel",
    categoryId: "bento",
    audience: "adult",
    name: "Бенто «Карамель»",
    description: "Солёная карамель и ванильный бисквит.",
    weight: "11 см",
    price: 8000,
    leadDays: 1,
    image: "/images/bento-caramel.jpg",
  },
  {
    id: "bento-kids-rainbow",
    categoryId: "bento",
    audience: "kids",
    name: "Бенто «Радуга»",
    description: "Яркий мини-торт с посыпкой. Можно надпись.",
    weight: "11 см",
    price: 8500,
    leadDays: 1,
    image: "/images/bento-kids-rainbow.jpg",
  },
  {
    id: "bento-kids-pink",
    categoryId: "bento",
    audience: "kids",
    name: "Бенто «Ягодка»",
    description: "Розовый крем и свежая клубника. Для маленького праздника.",
    weight: "11 см",
    price: 8500,
    leadDays: 1,
    image: "/images/bento-kids-pink.jpg",
  },
  {
    id: "bento-kids-unicorn",
    categoryId: "bento",
    audience: "kids",
    name: "Бенто «Единорог»",
    description: "Цветной крем и рожок. Надпись — в анкете.",
    weight: "11 см",
    price: 9000,
    leadDays: 1,
    image: "/images/bento-kids-unicorn.jpg",
  },
  {
    id: "bento-kids-cupcake",
    categoryId: "bento",
    audience: "kids",
    name: "Бенто «Капкейк»",
    description: "Красный бархат в коробочке, как большой капкейк.",
    weight: "11 см",
    price: 8000,
    leadDays: 1,
    image: "/images/dessert-cupcake.jpg",
  },

  {
    id: "cake-vanilla",
    categoryId: "cakes",
    audience: "adult",
    size: "1kg",
    name: "Торт «Ваниль-малина»",
    description: "Ванильный бисквит, крем и свежая малина.",
    weight: "1 кг",
    price: 18000,
    leadDays: 2,
    image: "/images/cake-vanilla.jpg",
  },
  {
    id: "cake-pistachio",
    categoryId: "cakes",
    audience: "adult",
    size: "1kg",
    name: "Торт «Фисташка»",
    description: "Фисташковый крем и малина. Около 8–10 порций.",
    weight: "1 кг",
    price: 22000,
    leadDays: 2,
    image: "/images/cake-pistachio.jpg",
  },
  {
    id: "cake-chocolate",
    categoryId: "cakes",
    audience: "adult",
    size: "1kg",
    name: "Торт «Шоколад»",
    description: "Влажный шоколадный бисквит и ганаш.",
    weight: "1 кг",
    price: 20000,
    leadDays: 2,
    image: "/images/cake-chocolate.jpg",
  },
  {
    id: "cake-truffle-1",
    categoryId: "cakes",
    audience: "adult",
    size: "1kg",
    name: "Торт «Трюфель»",
    description: "Тёмный шоколад и вишня. Плотный, не сладкий.",
    weight: "1 кг",
    price: 24000,
    leadDays: 2,
    image: "/images/cake-truffle.jpg",
  },
  {
    id: "cake-honey",
    categoryId: "cakes",
    audience: "adult",
    size: "2kg",
    name: "Торт «Медовик»",
    description: "Тонкие медовые коржи и сметанный крем. 12–16 порций.",
    weight: "2 кг",
    price: 32000,
    leadDays: 3,
    image: "/images/cake-honey.jpg",
  },
  {
    id: "cake-velvet",
    categoryId: "cakes",
    audience: "adult",
    size: "2kg",
    name: "Торт «Красный бархат»",
    description: "Красный бархат с кремчизом на большую компанию.",
    weight: "2 кг",
    price: 36000,
    leadDays: 3,
    image: "/images/cake-velvet.jpg",
  },
  {
    id: "cake-napoleon",
    categoryId: "cakes",
    audience: "adult",
    size: "2kg",
    name: "Торт «Наполеон»",
    description: "Слоёные коржи и заварной крем. От 2 кг.",
    weight: "2 кг",
    price: 34000,
    leadDays: 3,
    image: "/images/cake-napoleon.jpg",
  },
  {
    id: "cake-truffle-2",
    categoryId: "cakes",
    audience: "adult",
    size: "2kg",
    name: "Торт «Трюфель» большой",
    description: "Шоколадный торт на 16–20 порций.",
    weight: "2,5 кг",
    price: 42000,
    leadDays: 3,
    image: "/images/cake-truffle.jpg",
  },
  {
    id: "cake-kids-rainbow-1",
    categoryId: "cakes",
    audience: "kids",
    size: "1kg",
    name: "Детский «Радуга»",
    description: "Цветная посыпка и ванильный бисквит. 1 кг.",
    weight: "1 кг",
    price: 19000,
    leadDays: 2,
    image: "/images/cake-kids-rainbow.jpg",
  },
  {
    id: "cake-kids-pink-1",
    categoryId: "cakes",
    audience: "kids",
    size: "1kg",
    name: "Детский «Ягодка»",
    description: "Розовый крем и клубника. Надпись — в анкете.",
    weight: "1 кг",
    price: 19000,
    leadDays: 2,
    image: "/images/cake-kids-pink.jpg",
  },
  {
    id: "cake-kids-macaron",
    categoryId: "cakes",
    audience: "kids",
    size: "1kg",
    name: "Детский «Макарон»",
    description: "Нежный торт с макаронами сверху.",
    weight: "1 кг",
    price: 23000,
    leadDays: 2,
    image: "/images/cake-kids-macaron.jpg",
  },
  {
    id: "cake-kids-birthday-1",
    categoryId: "cakes",
    audience: "kids",
    size: "1kg",
    name: "Детский «Праздник»",
    description: "Классический торт на день рождения, 1 кг.",
    weight: "1 кг",
    price: 20000,
    leadDays: 2,
    image: "/images/birthday.jpg",
  },
  {
    id: "cake-kids-unicorn",
    categoryId: "cakes",
    audience: "kids",
    size: "2kg",
    name: "Детский «Единорог»",
    description: "Большой цветной торт с рожком. От 2 кг.",
    weight: "2 кг",
    price: 38000,
    leadDays: 3,
    image: "/images/cake-kids-unicorn.jpg",
  },
  {
    id: "cake-kids-birthday-2",
    categoryId: "cakes",
    audience: "kids",
    size: "2kg",
    name: "Детский «Праздник» большой",
    description: "На компанию детей и взрослых. 1,5–2 кг.",
    weight: "1,5 кг",
    price: 38000,
    leadDays: 3,
    image: "/images/birthday.jpg",
  },
  {
    id: "cake-kids-rainbow-2",
    categoryId: "cakes",
    audience: "kids",
    size: "2kg",
    name: "Детский «Радуга» большой",
    description: "Яркая посыпка, от 2 кг.",
    weight: "2 кг",
    price: 36000,
    leadDays: 3,
    image: "/images/cake-kids-rainbow.jpg",
  },
  {
    id: "cake-kids-pink-2",
    categoryId: "cakes",
    audience: "kids",
    size: "2kg",
    name: "Детский «Принцесса»",
    description: "Розовый крем на большую компанию.",
    weight: "2 кг",
    price: 36000,
    leadDays: 3,
    image: "/images/cake-kids-pink.jpg",
  },

  {
    id: "wedding-1tier",
    categoryId: "wedding",
    name: "Свадебный, 1 ярус",
    description: "Один ярус, айвори крем и цветы. Камерная церемония.",
    weight: "2 кг",
    price: 45000,
    leadDays: 7,
    image: "/images/wedding-1tier.jpg",
  },
  {
    id: "wedding-classic",
    categoryId: "wedding",
    name: "Свадебный, 2 яруса",
    description: "Два яруса, айвори крем и цветы. Около 30 порций.",
    weight: "3 кг",
    price: 85000,
    leadDays: 7,
    image: "/images/wedding-ivory.jpg",
  },
  {
    id: "wedding-3tier",
    categoryId: "wedding",
    name: "Свадебный, 3 яруса",
    description: "Три яруса с живыми цветами. Большая свадьба.",
    weight: "5 кг",
    price: 125000,
    leadDays: 7,
    image: "/images/wedding-3tier.jpg",
  },
  {
    id: "wedding-garden",
    categoryId: "wedding",
    name: "Свадебный «Пионы»",
    description: "Два яруса с пионами. Камерная свадьба.",
    weight: "2,5 кг",
    price: 72000,
    leadDays: 7,
    image: "/images/wedding-peony.jpg",
  },

  {
    id: "cheesecake-ny",
    categoryId: "cheesecake",
    name: "Чизкейк «Нью-Йорк»",
    description: "Классика: песочная основа и плотный сливочный слой.",
    weight: "1 кг",
    price: 14000,
    leadDays: 2,
    image: "/images/cheesecake-ny.jpg",
  },
  {
    id: "cheesecake-berry",
    categoryId: "cheesecake",
    name: "Чизкейк ягодный",
    description: "Сливочный чизкейк с клубникой и голубикой.",
    weight: "1 кг",
    price: 15000,
    leadDays: 2,
    image: "/images/cheesecake-berry.jpg",
  },
  {
    id: "cheesecake-choc",
    categoryId: "cheesecake",
    name: "Чизкейк шоколадный",
    description: "Какао, ганаш и хрустящая основа.",
    weight: "1 кг",
    price: 15000,
    leadDays: 2,
    image: "/images/cheesecake-choc.jpg",
  },
  {
    id: "cheesecake-caramel",
    categoryId: "cheesecake",
    name: "Чизкейк «Солёная карамель»",
    description: "Карамельный топпинг и щепотка соли.",
    weight: "1 кг",
    price: 16000,
    leadDays: 2,
    image: "/images/cheesecake-caramel.jpg",
  },

  {
    id: "pie-apple",
    categoryId: "pies",
    name: "Пирог яблочный",
    description: "Песочное тесто и яблоки с корицей. Тёплый, праздничный.",
    weight: "1 кг",
    price: 8000,
    leadDays: 1,
    image: "/images/pie-apple.jpg",
  },
  {
    id: "pie-cherry",
    categoryId: "pies",
    name: "Пирог вишнёвый",
    description: "Решётка из теста и кислая вишня.",
    weight: "1 кг",
    price: 8500,
    leadDays: 1,
    image: "/images/pie-cherry.jpg",
  },
  {
    id: "pie-smetannik",
    categoryId: "pies",
    name: "Сметанник",
    description: "Нежный сметанный пирог. К чаю и к празднику.",
    weight: "1 кг",
    price: 7500,
    leadDays: 1,
    image: "/images/pie-smetannik.jpg",
  },
  {
    id: "pie-berry",
    categoryId: "pies",
    name: "Пирог ягодный",
    description: "Открытый пирог с сезонными ягодами.",
    weight: "1 кг",
    price: 8500,
    leadDays: 1,
    image: "/images/pie-berry.jpg",
  },

  {
    id: "dessert-tubes",
    categoryId: "desserts",
    name: "Трубочки",
    description: "Хрустящие трубочки с ванильным кремом. 6 шт.",
    weight: "6 шт",
    price: 5500,
    leadDays: 1,
    image: "/images/dessert-tubes.jpg",
  },
  {
    id: "dessert-walnuts",
    categoryId: "desserts",
    name: "Орешки",
    description: "Печенье «орешки» со варёной сгущёнкой. 12 шт.",
    weight: "12 шт",
    price: 4500,
    leadDays: 1,
    image: "/images/dessert-walnuts.jpg",
  },
  {
    id: "dessert-eclairs",
    categoryId: "desserts",
    name: "Эклеры",
    description: "Заварное тесто и ванильный крем. 6 шт.",
    weight: "6 шт",
    price: 7000,
    leadDays: 1,
    image: "/images/dessert-eclairs.jpg",
  },
  {
    id: "dessert-cupcakes",
    categoryId: "desserts",
    name: "Капкейки",
    description: "Ваниль и шоколад с кремом. Коробка 6 шт.",
    weight: "6 шт",
    price: 9000,
    leadDays: 1,
    image: "/images/cupcakes-6.jpg",
  },
  {
    id: "dessert-trifle",
    categoryId: "desserts",
    name: "Трайфлы",
    description: "Слои бисквита, крема и ягод в стаканчиках. 4 шт.",
    weight: "4 шт",
    price: 8000,
    leadDays: 1,
    image: "/images/dessert-trifle.jpg",
  },
  {
    id: "dessert-popsicle",
    categoryId: "desserts",
    name: "Эскимо",
    description: "Фруктовое эскимо на палочке. 5 шт.",
    weight: "5 шт",
    price: 6000,
    leadDays: 1,
    image: "/images/dessert-eskimo.jpg",
  },

  {
    id: "healthy-nosugar",
    categoryId: "healthy",
    name: "Чизкейк без сахара",
    description: "Творожный чизкейк с ягодами. Без добавленного сахара.",
    weight: "1 кг",
    price: 12000,
    leadDays: 2,
    image: "/images/healthy-cheesecake.jpg",
  },
  {
    id: "healthy-lactose",
    categoryId: "healthy",
    name: "Десерт без лактозы",
    description: "Кокосовый крем и ягоды. Без молока.",
    weight: "порция",
    price: 6500,
    leadDays: 1,
    image: "/images/healthy-lactose.jpg",
  },
  {
    id: "healthy-fitness",
    categoryId: "healthy",
    name: "Фитнес-чизкейк",
    description: "Лёгкий творожный чизкейк. Меньше сахара и жира.",
    weight: "1 кг",
    price: 13000,
    leadDays: 2,
    image: "/images/healthy-fitness.jpg",
  },
  {
    id: "healthy-bento",
    categoryId: "healthy",
    name: "Ягодный ПП-бенто",
    description: "Мини-десерт из ягод и йогурта без сахара.",
    weight: "11 см",
    price: 7000,
    leadDays: 1,
    image: "/images/healthy-berries.jpg",
  },

  {
    id: "set-cupcakes",
    categoryId: "sets",
    name: "Набор «Капкейки»",
    description: "Бенто в коробочке и три капкейка.",
    composition: "бенто + 3 капкейка",
    weight: "набор",
    price: 14000,
    leadDays: 2,
    image: "/images/cupcakes-6.jpg",
  },
  {
    id: "set-trifle",
    categoryId: "sets",
    name: "Набор «Трайфлы»",
    description: "Бенто и четыре стаканчика трайфла.",
    composition: "бенто + 4 трайфла",
    weight: "набор",
    price: 16000,
    leadDays: 2,
    image: "/images/dessert-trifle.jpg",
  },
  {
    id: "set-popsicle",
    categoryId: "sets",
    name: "Набор «Эскимо»",
    description: "Бенто и пять эскимо на палочке.",
    composition: "бенто + 5 эскимо",
    weight: "набор",
    price: 15000,
    leadDays: 2,
    image: "/images/set-popsicle.jpg",
  },
  {
    id: "set-mix",
    categoryId: "sets",
    name: "Набор «Микс»",
    description: "Бенто и ассорти десертов в одной коробке.",
    composition: "бенто + 2 капкейка + 2 трайфла + эскимо",
    weight: "набор",
    price: 18000,
    leadDays: 2,
    image: "/images/set-mix.jpg",
  },
];

export const HERO_IMAGE = "/images/hero.jpg";

export const ORDER_STATUSES = [
  { id: "new", label: "новый" },
  { id: "confirmed", label: "принят" },
  { id: "baking", label: "печётся" },
  { id: "ready", label: "готов" },
  { id: "cancelled", label: "отменён" },
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number]["id"];

export const OCCASIONS = [
  { id: "birthday", label: "день рождения" },
  { id: "wedding", label: "свадьба" },
  { id: "corporate", label: "корпоратив" },
  { id: "none", label: "без повода" },
] as const;

export const ALLERGY_OPTIONS = [
  { id: "none", label: "нет" },
  { id: "gluten", label: "глютен" },
  { id: "lactose", label: "лактоза" },
  { id: "nuts", label: "орехи" },
  { id: "egg", label: "яйцо" },
  { id: "dye", label: "красители" },
  { id: "other", label: "другое" },
] as const;

export const DIET_OPTIONS = [
  { id: "regular", label: "обычный" },
  { id: "no-sugar", label: "без сахара" },
  { id: "lactose-free", label: "без лактозы" },
  { id: "vegan", label: "веган" },
] as const;

export type OccasionId = (typeof OCCASIONS)[number]["id"];
export type AllergyId = (typeof ALLERGY_OPTIONS)[number]["id"];
export type DietId = (typeof DIET_OPTIONS)[number]["id"];
export type Fulfillment = "pickup" | "delivery";

export function getCategory(id: string) {
  return CATEGORIES.find((item) => item.id === id);
}

export function getProduct(id: string) {
  return PRODUCTS.find((item) => item.id === id);
}

export function visibleProducts(
  hiddenIds: string[],
  categoryId?: CategoryId,
  filters?: { audience?: Audience | null; size?: CakeSize | null },
) {
  const hidden = new Set(hiddenIds);
  return PRODUCTS.filter((item) => {
    if (hidden.has(item.id)) return false;
    if (categoryId && item.categoryId !== categoryId) return false;
    if (filters?.audience && item.audience && item.audience !== filters.audience) {
      return false;
    }
    if (filters?.size && item.size && item.size !== filters.size) {
      return false;
    }
    return true;
  });
}

export function statusLabel(status: string) {
  return ORDER_STATUSES.find((item) => item.id === status)?.label ?? status;
}

export function optionLabel(
  list: readonly { id: string; label: string }[],
  id: string,
) {
  return list.find((item) => item.id === id)?.label ?? id;
}

export function formatLead(days: number) {
  const n = Math.abs(days) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return `${days} дней`;
  if (n1 === 1) return `${days} день`;
  if (n1 >= 2 && n1 <= 4) return `${days} дня`;
  return `${days} дней`;
}

export function formatAllergies(ids: string[], note: string) {
  if (!ids.length || ids.includes("none")) return "нет";
  const labels = ids
    .map((id) => optionLabel(ALLERGY_OPTIONS, id))
    .filter((label) => label !== "другое");
  if (ids.includes("other") && note.trim()) labels.push(note.trim());
  else if (ids.includes("other")) labels.push("другое");
  return labels.join(", ") || "нет";
}
