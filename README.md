# Vichar Bhandar

A personal, mobile-first dashboard built to seamlessly capture thoughts, manage reminders, and organize ideas. Formerly known as *thought-dumper*, this project is designed as a Progressive Web App (PWA) with quick capture capabilities and web push notifications.

## 🚀 Features

- **Quick Capture:** Frictionless interface to immediately dump thoughts or set reminders.
- **PWA Ready:** Installable on mobile devices with an optimized, app-like experience.
- **Web Push Notifications:** Automated reminder alerts powered by Vercel Cron.
- **Timeline View:** chronological overview of all captured thoughts and tasks.
- **Modern UI/UX:** Responsive design with smooth micro-interactions, dark mode, and mobile-first layouts.

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router & Server Actions)
- **Database:** [Turso](https://turso.tech/) (Edge SQLite) with [Drizzle ORM](https://orm.drizzle.team/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [shadcn/ui](https://ui.shadcn.com/) & [21st.dev](https://21st.dev/)
- **State Management & Data Fetching:** TanStack Query (with optimistic updates)
- **Deployment:** Vercel

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm / npm / yarn / bun
- A Turso account and database

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:rehanhalai/vichar-no-bhandaro.git
   cd vichar-no-bhandaro
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or npm install, yarn install, bun install
   ```

3. Set up environment variables. Create a `.env.local` file based on your `.env.example` (if present) and add your Turso credentials:
   ```env
   TURSO_DATABASE_URL="your-database-url"
   TURSO_AUTH_TOKEN="your-auth-token"
   ```

4. Run database migrations (using Drizzle):
   ```bash
   pnpm db:push
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📱 PWA & Notifications

To fully utilize the PWA features and web push notifications, ensure the application is served over HTTPS (which is required by Service Workers). Notifications are orchestrated via a server-side Vercel Cron job that triggers alerts for pending reminders.
