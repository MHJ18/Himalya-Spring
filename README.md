# Himaliya Spring Water — Admin Dashboard

Admin portal for **Himaliya Spring Water** built on the Light Blue React template. Manage customers, daily sales, analytics, and settings with localStorage persistence (backend-ready architecture).

## Run

```bash
npm install --legacy-peer-deps
npm start
```

Login: any email + password (demo: `admin@himaliya.com` / `admin123`)

## Features

- **Original Light Blue UI** — Map, Rickshaw chart, Calendar, animated widgets, page transitions
- **Dashboard** — Live stats from customer/sales data
- **Add Customer** — Phone (+92), photo upload, validation
- **Customer Records** — Search, pagination, purchase history table, PDF export
- **Daily Sales** — Find customer by phone, record sales
- **Analytics** — Recharts (revenue, daily sales, bottle mix, growth), CSV export
- **Settings** — Dark mode toggle, business profile, clear data
- **Seed data** — 15 customers with photos and sample transactions (auto on first load)

## Structure

```
src/
├── context/          Customer, Sales, Analytics, Settings providers
├── pages/himalaya/   App pages
├── components/       Forms, charts, tables, layout
├── services/         API abstraction + seed data
└── utils/            Analytics, export, validation
```

## Reset sample data

Settings → **Clear All Data**, then refresh.

## License

MIT
