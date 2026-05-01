# Akashic

AI-powered personal assistant — notes, schedule, and finance in one place.

![screenshot](public/screenshot%20v3.png)

[한국어](README.md)

---

## Features

### Notes `v1.0`
- Write and manage notes by category
- Auto-sorted by last modified
- Create / delete / collapse categories
- Real-time panel updates

### Schedule Management `v1.1`
- Hourly timeline view (0–23h, absolute block positioning)
- Cross-midnight schedules — automatically spans to the next day
- Conflict detection — warns on save + highlights overlapping blocks
- Consistent color per schedule ID across refreshes
- Date-grouped context panel (Today / This Week / Next Week / Later)

### Finance `v1.2`
- Natural language input → AI auto-parsing (Claude Haiku)
- Confirmation card after parsing — edit before saving
- Manual entry form as fallback
- Click any transaction to edit or delete
- Monthly income / expense / balance summary
- Category breakdown stats
- AI spending pattern analysis

---

## Roadmap

| Module | Status |
| ------ | ------ |
| Notes | ✅ v1.0 |
| Schedule Management | ✅ v1.1 |
| Finance | ✅ v1.2 |
| Health Management | 📋 Planned |
| Study Management | 📋 Planned |
| AI Voice Input | 🎯 Long-term |
| Mobile App | 🎯 Long-term |

---

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| DB / Auth | Supabase (PostgreSQL) |
| AI | Claude — Anthropic |
| Deployment | Vercel |

---

MIT License
