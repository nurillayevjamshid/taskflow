# Taskly

Trello va Atlassian uslubidagi doska, ustun va kartalar bilan jamoa ishini oson boshqaring.

- Next.js 16 (Turbopack) + TypeScript + Tailwind CSS 4
- Zustand + localStorage persist (client-side)
- dnd-kit bilan drag & drop
- Base UI komponentlari, premium dizayn

## Boshlash

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # -> /out (static export)
```

`next.config.ts` da `output: 'export'` yoqilgan, shuning uchun har qanday
static hosting (Netlify, GitHub Pages, Cloudflare Pages) da ishlaydi.
