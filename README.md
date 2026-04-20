# 🐭 JeFocus: Focus with Aura

![JeFocus Hero](public/hero.png)

A premium, interactive Pomodoro timer designed for modern focus. **JeFocus** transforms the standard focus timer into an emotionally engaging experience featuring a living mascot, premium aesthetic, and intelligent tracking.

## ✨ Features

- **Obsidian Aura Design System**: A sleek, minimalism-focused dark theme with advanced glassmorphism, soft ambient glows, and tactile micro-interactions.
- **Interactive Mascot (Je)**: Meet Je, your focus companion. Je reacts to your focus sessions and provides emotional companionship during long work blocks.
- **Daily Focus Tracking**: Visualized progress through a dynamic "Bottom Sheet" tracker. Monitor your sessions, daily targets, and focus history at a glance.
- **Multi-Channel Ambient Mixer**: Craft your perfect workspace with customizable ambient sound layers (Rain, Coffee Shop, Forest, White Noise).
- **Flexible Timer Settings**: Ditch the rigid presets. Adjust your focus duration on the fly with a precise slider or direct input for total control.
- **Progressive Web App (PWA)**: Fully installable on all devices with offline support and system-level notifications.

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4.0 (Custom Glass System)
- **State Management**: Zustand (Client) + TanStack Query & tRPC
- **Database**: Prisma + PostgreSQL
- **Animations**: Framer Motion
- **Audio Logic**: Howler.js
- **Auth**: NextAuth.js 5

## 🚀 Getting Started

1. **Clone & Install**:
   ```bash
   git clone https://github.com/phantranthelinh/je-pomo.git
   cd je-pomo
   yarn install
   ```

2. **Environment Setup**:
   Create a `.env` file based on `.env.example` with your `DATABASE_URL`, `NEXTAUTH_SECRET`, and OAuth credentials.

3. **Run Development**:
   ```bash
   yarn dev
   ```

4. **Build for Production**:
   ```bash
   yarn build
   yarn start
   ```

## 📐 Design Philosophy

JeFocus follows the **Obsidian Aura** design principles:
- **Calmness**: Neutral backgrounds with soft, high-contrast typography.
- **Feedback**: Every action has a subtle, high-quality animation.
- **Engagement**: The mascot provides a sense of companionship during long focus sessions.

---

Built with ❤️ by [Phan Tran The Linh](https://github.com/phantranthelinh)
