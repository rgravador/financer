# Ascendent Font System Reference

Use this guide to replicate the Ascendent typography system in a Next.js app.

---

## Fonts

| Font | Type | Weights | Source |
|------|------|---------|--------|
| **Sora** | Variable geometric sans-serif | 100-800 | [Google Fonts](https://fonts.google.com/specimen/Sora) |
| **Plus Jakarta Sans** | Humanist sans-serif | 400, 500, 600, 700 | [Google Fonts](https://fonts.google.com/specimen/Plus+Jakarta+Sans) |

### Fallback Stack

```
-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
```

---

## Font Allocation

### Sora (Display / UI Font)

Used for elements that need to feel **modern, authoritative, and brand-forward**.

| Element | Weight | Letter Spacing | Notes |
|---------|--------|----------------|-------|
| h1 - h6 | 600 | -0.02em | All headings |
| Buttons | 500 | 0 | No uppercase transform |
| Navigation items | 500 | normal | Sidebar links, tabs, breadcrumbs |
| Card titles | 600 | -0.01em | |
| Dialog/modal titles | 600 | -0.01em | |
| Alert titles | 600 | normal | |
| Toolbar/app bar titles | 600 | normal | |
| Chips/badges | 500 | normal | |

### Plus Jakarta Sans (Body / Data Font)

Used for elements that need **readability, clarity, and data precision**.

| Element | Weight | Variant | Notes |
|---------|--------|---------|-------|
| Body text / paragraphs | 400 | normal | Base `line-height: 1.6` |
| Form inputs | 400 | normal | Text fields, textareas, selects |
| Form labels | 500 | normal | |
| Helper text / hints | 400 | normal | Validation messages, counters |
| Data table cells | 400 | `tabular-nums` | For number alignment |
| Data table headers | 600 | `tabular-nums` | |
| Stat/metric values | 600 | `tabular-nums` | Dashboard numbers, KPIs |
| Currency values | 400-600 | `tabular-nums` | |
| Subtitles / descriptions | 400 | normal | List item subtitles |
| Alerts (body) | 400 | normal | Alert title uses Sora |
| Tooltips | 400 | normal | |
| Snackbar messages | 400 | normal | |

---

## CSS Custom Properties

```css
:root {
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: 'Sora', var(--font-sans);
}
```

---

## Utility Classes

| Class | Font | Extra |
|-------|------|-------|
| `.font-heading` | Sora | For headings |
| `.font-ui` | Sora | For UI elements |
| `.font-body` | Plus Jakarta Sans | For body text |
| `.font-data` | Plus Jakarta Sans | + `font-variant-numeric: tabular-nums` |

---

## Next.js Setup

### Using `next/font` (recommended)

```typescript
// app/fonts.ts
import { Sora, Plus_Jakarta_Sans } from 'next/font/google';

export const sora = Sora({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});
```

### Apply in Root Layout

```tsx
// app/layout.tsx
import { sora, plusJakartaSans } from './fonts';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${plusJakartaSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### Global CSS

```css
/* globals.css */
body {
  font-family: var(--font-sans);
  font-weight: 400;
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: -0.02em;
}

button, [role="button"] {
  font-family: var(--font-display);
  font-weight: 500;
  text-transform: none;
}

input, textarea, select, label {
  font-family: var(--font-sans);
}

table td, table th {
  font-family: var(--font-sans);
  font-variant-numeric: tabular-nums;
}

table th {
  font-weight: 600;
}

.font-heading { font-family: var(--font-display); }
.font-ui      { font-family: var(--font-display); }
.font-body    { font-family: var(--font-sans); }
.font-data    { font-family: var(--font-sans); font-variant-numeric: tabular-nums; }
```

### Tailwind CSS Config (if using Tailwind)

```typescript
// tailwind.config.ts
const config = {
  theme: {
    fontFamily: {
      sans: ['var(--font-sans)'],
      display: ['var(--font-display)'],
    },
  },
};
```

Then use `font-sans` (Plus Jakarta Sans) and `font-display` (Sora) in your markup.

---

## Quick Rule of Thumb

- **Sora** = anything the user **scans** (headings, nav, buttons, titles, chips)
- **Plus Jakarta Sans** = anything the user **reads** (body, forms, tables, descriptions, messages)
