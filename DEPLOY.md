# 🚀 Руководство по развертыванию ZenSpace

ZenSpace полностью оптимизирован для мгновенного развертывания на **Vercel**, **Netlify**, **Cloudflare Pages** или любом статическом хостинге.

---

## Способ 1: Автоматический деплой через Vercel Dashboard (Рекомендуется)

1. Откройте [Vercel Dashboard](https://vercel.com/new).
2. Выберите репозиторий: **`ilyachu/zenspace`**.
3. Настройки проекта подтягиваются автоматически из `vercel.json`:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Нажмите **Deploy**.
5. Проект будет опубликован через ~30 секунд на глобальном CDN с автоматическим SSL и кешированием аудио!

---

## Способ 2: Деплой через Vercel CLI

```bash
cd /Users/ilyachumachenkov/Documents/zenspace
npx vercel --prod
```

---

## Способ 3: Развертывание в Docker

```bash
docker build -t zenspace .
docker run -p 80:80 zenspace
```
