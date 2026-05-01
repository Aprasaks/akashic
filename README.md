# Akashic

> **당신의 인생을 설계해드립니다.**  
> _Your life. Designed._

Akashic is your personal AI life assistant — your own Jarvis.  
Not just a notes app. Not just a planner. A single place where everything about your life gets recorded, organized, and retrieved.

> _"Hey Akashic, memo this. Save that. Find what I was thinking last Tuesday."_

---

## Vision

We live in an era where people carry their phones almost every waking hour, and AI is evolving faster than anyone predicted. Yet most productivity tools still ask you to adapt to them.

Akashic flips that. You talk, Akashic listens — records, organizes, and helps you make sense of it all across every domain of your life.

**Starting on web. Moving to mobile. Eventually, voice-first.**

---

## Features

### v1.2 — Finance (가계부) `2026.05.01`

> _Your money, understood._

![screenshot v3](public/screenshot%20v3.png)

- Natural language input — just say what you spent, AI parses it automatically
- Confirmation card before saving — review and edit every field AI filled in
- Manual entry form as fallback — type/amount/merchant/category/payment/date/note
- Monthly transaction list with income/expense filter and date grouping
- Click any transaction to edit or delete via modal
- Category breakdown stats with visual bars per month
- AI spending analysis — Claude reads your month and gives personalized insights
- Context panel shows monthly income/expense/balance + recent 5 transactions
- Default categories auto-seeded on first use (식비, 교통, 여가, 쇼핑, 구독...)

---

### v1.1 — Schedule Management `2026.04.29`

> _Your time, visualized._

![screenshot v2](public/screenshot%20v2.png)

- Hourly time grid timeline (0–23h, absolute block positioning)
- Add schedules with date picker, start/end time, location, memo
- Click any block to view details, edit, or delete via modal
- Cross-midnight schedule support — spans to the next day automatically
- Conflict detection — warns on save + highlights overlapping blocks on timeline
- Color-coded blocks per schedule (ID-based, consistent across refreshes)
- Date-grouped context panel — Today / This Week / Next Week / Later

---

### v1.0 — Notes `2026.04.28`

> _Your thoughts, organized._

![screenshot v1](public/screenshot%20v1.png)

- Write and manage memos with a clean 3-column layout
- Organize notes into categories — create, collapse, delete
- Auto-sorts by last modified
- Real-time panel updates without full page reload
- Right-click category to delete with confirmation modal
- New note shortcut from anywhere in the panel

---

## Roadmap

| Module                            | Status       |
| --------------------------------- | ------------ |
| Notes                             | ✅ v1.0      |
| Schedule Management (일정관리)    | ✅ v1.1      |
| Finance (가계부)                  | ✅ v1.2      |
| Health Management (건강관리)      | 📋 Planned   |
| Study Management (공부관리)       | 📋 Planned   |
| AI Voice Input ("Hey Akashic...") | 🎯 Long-term |
| Mobile App                        | 🎯 Long-term |

---

## Tech Stack

| Layer           | Technology              |
| --------------- | ----------------------- |
| Framework       | Next.js 16 (App Router) |
| Language        | TypeScript              |
| Styling         | Tailwind CSS v4         |
| Database & Auth | Supabase (PostgreSQL)   |
| Deployment      | Vercel                  |

---

## Why "Akashic"?

The Akashic Records — a concept describing a compendium of all universal events, thoughts, words, and intentions across time.  
Every moment of your life, stored. Every piece of information, retrievable.  
That's the goal.

---

## Status

Early-stage. Actively developed and iterated in public.  
The vision is long. The build is real.

---

## License

MIT
