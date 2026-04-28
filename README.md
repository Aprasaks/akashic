# Akashic

> **당신의 인생을 설계해드립니다.**  
> *Your life. Designed.*

Akashic is a personal AI life assistant — your own Jarvis.  
Not just a notes app. Not just a planner. A single place where everything about your life gets recorded, organized, and retrieved — the way you'd expect a real assistant to handle it.

> *"Hey Akashic, memo this. Save that. Find what I was thinking last Tuesday."*

---

## Vision

We live in an era where people carry their phones almost every waking hour, and AI is evolving faster than anyone predicted. Yet most productivity tools still ask you to adapt to them.

Akashic flips that. You talk (or type), Akashic listens, records, and helps you make sense of it all — across every domain of your life.

**Starting on web. Moving to mobile. Eventually, voice-first.**

---

## Current Features

- **Notes** — Write, categorize, and manage memos with a clean editor
  - Category system with right-click delete
  - Auto-sorts by last modified
  - Instant panel updates via Next.js Parallel Routes + Server Components

- **Auth** — Email/password authentication via Supabase

---

## Roadmap

| Module | Status |
|---|---|
| Notes | ✅ Live |
| Finance (가계부) | 🔜 Next |
| Study Management (공부관리) | 📋 Planned |
| Schedule Management (일정관리) | 📋 Planned |
| Health Management (건강관리) | 📋 Planned |
| AI Voice Input ("Hey Akashic...") | 🎯 Long-term |
| Mobile App | 🎯 Long-term |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database & Auth | Supabase (PostgreSQL) |
| Icons | Lucide React |
| Deployment | Vercel (planned) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Setup

```bash
git clone https://github.com/Aprasaks/akashic.git
cd akashic
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database

Run the following in your Supabase SQL editor:

```sql
-- Categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamptz default now()
);

-- Notes
create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  category_id uuid references categories(id),
  title text,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table categories enable row level security;
alter table notes enable row level security;

create policy "Users manage own categories" on categories for all using (auth.uid() = user_id);
create policy "Users manage own notes" on notes for all using (auth.uid() = user_id);
```

---

## Why "Akashic"?

The Akashic Records — a concept describing a compendium of all universal events, thoughts, words, and intentions across time.  
Every moment of your life, stored. Every piece of information, retrievable.  
That's the goal.

---

## Status

This is an early-stage personal project, actively developed and iterated in public.  
Breaking changes happen. Features ship fast. The vision is long.

---

## License

MIT
