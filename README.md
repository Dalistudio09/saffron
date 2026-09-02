# Saffron — Telegram Mini App

Торты на заказ. Каталог, анкета, заявки в бота и в админку.

Админ только Telegram ID `743736933`. Поля токена на экране нет.

## Vercel

| | |
|---|---|
| **Install Command** | `npm install` |
| **Build Command** | `npm run build` |
| **Output Directory** | не указывать — Nitro пишет `.vercel/output` (Build Output API) |
| **Node** | `22.x` |
| **Framework Preset** | Other |

В проекте Vercel: Settings → General → Node.js Version → 22.x.

После деплоя скопируйте Production URL (`https://….vercel.app`) — он нужен боту.

## Env Vars

Settings → Environment Variables. Добавить в **Production** и **Preview**. Без префикса `VITE_`.

| Name | Required | Notes |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | да | Токен бота. Только сервер. Не в коде, не в клиенте. |
| `TELEGRAM_WEBAPP_URL` | да | `https://ВАШ-ПРОЕКТ.vercel.app` без слэша в конце |
| `DATABASE_URL` | да | Neon или Vercel Postgres. Иначе заявки не копятся в админке между запросами. |
| `ADMIN_TELEGRAM_ID` | нет | Уже задан в коде: `743736933` |

`DATABASE_URL` должен быть доступен и на **Build**, и на **Runtime** — миграции идут во время `npm run build`.

## BotFather — сменить URL на новый

После деплоя откройте [@BotFather](https://t.me/BotFather) → ваш бот.

1. **Bot Settings → Menu Button → Configure menu button**  
   URL: `https://ВАШ-ПРОЕКТ.vercel.app`  
   Текст кнопки: `Заказать`
2. **Bot Settings → Configure Mini App**  
   Mini App URL: `https://ВАШ-ПРОЕКТ.vercel.app`
3. **`/setdomain`**  
   Домен без `https://`: `ВАШ-ПРОЕКТ.vercel.app`
4. **`/setmenubutton`** — то же URL, если меню не обновилось
5. **Webhook** — один раз откройте в браузере:  
   `https://ВАШ-ПРОЕКТ.vercel.app/api/telegram/webhook`  
   Приложение само вызовет `setWebhook` на  
   `https://ВАШ-ПРОЕКТ.vercel.app/api/telegram/webhook`

Проверка: в боте `/start` — текст «Saffron / Торты на заказ» и кнопка **Заказать**. Кнопка открывает Mini App с нового URL.

Старый URL (превью / другой домен) в Menu Button, Mini App и Domain нужно заменить, иначе Telegram откроет прошлое приложение.

## После деплоя

1. Админ открывает бота и нажимает **Старт** — иначе Telegram не даст писать в чат.
2. Клиент: торт → анкета (дата, самовывоз/доставка, имя, телефон `+7`, аллергии, надпись) → заявка.
3. Заявка уходит в бота админу (`743736933`) и в админку Mini App.
4. Админка по адресу `/admin` видна только этому ID. Остальным — «нет доступа».

## Локально

```bash
npm install
npm run build
```

Токен в `.env` не кладите в git и не заливайте в архив. Для Vercel — только Env Vars.
