<div align="center">

# ✦ AUREX

### *Your Premium Precious Metals Tracker*

[![Built with Expo](https://img.shields.io/badge/Built%20with-Expo-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=white)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)

*A fintech-grade mobile app for tracking live gold, silver, and platinum prices — built with a premium dark/light UI, seamless animations, and real-time market data.*

</div>

---

## 📱 App Overview

**Aurex** is a React Native mobile application that brings real-time precious metal market data to your fingertips. Designed with a fintech-grade aesthetic, Aurex combines **live price tracking**, **portfolio summaries**, and **detailed market analytics** in a sleek, premium interface.

Whether you're a seasoned investor monitoring your gold holdings or a curious buyer checking today's silver rate, Aurex gives you everything you need — beautifully.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📡 **Live Price Engine** | Real-time prices for Gold (XAU), Silver (XAG), and Platinum (XPT) via `goldapi.io` with a 5-minute session cache |
| 💱 **INR / USD Toggle** | Instantly switch between Indian Rupee and US Dollar with a live exchange rate from `frankfurter.app` |
| 📊 **Dual Chart Modes** | Toggle between a smooth **Line Chart** and a professional **Candlestick Chart** (OHLC) for 7-day historical trends |
| 🎨 **Circular Reveal Theme** | A premium dark/light mode toggle with a **circular ripple animation** that originates from the toggle button and sweeps across the entire screen |
| 🌙 **Icon Morph Transition** | The Sun and Moon icons **cross-fade and scale** into each other — giving the toggle a satisfying, organic "morph" feel |
| 🏆 **Bento Grid Pricing** | Karat and weight breakdowns displayed in a modern **Bento-style grid**, with a Hero card (24K/1g) at the top carrying a metal-specific gradient |
| 📋 **Market Stats Info Rows** | Open, Close, High and Low prices presented as clean **info rows with dividers** — no cluttered cards |
| 💼 **Portfolio Summary** | A horizontally scrollable **portfolio card carousel** per metal with invested amount, current value, and P&L percentage |
| ⬇️ **Pull to Refresh** | Swipe down on the home screen to force a fresh price fetch from the live API, clearing the session cache |
| 💀 **Loading Skeletons** | Elegant shimmer skeleton placeholders appear during all data-fetching states — no blank screens or loading spinners |
| ⚠️ **Global Error Banners** | A persistent error banner appears when API calls fail, with a clear retry CTA |
| 🔄 **Smart Caching** | Metal prices are cached for 5 minutes and exchange rates for 1 hour to respect API rate limits |

---

## 🛠 Tech Stack

### Core
| Technology | Purpose |
|---|---|
| [Expo](https://expo.dev) `~54.0.33` | App framework & build toolchain |
| [React Native](https://reactnative.dev) `0.81.5` | Cross-platform mobile UI |
| [TypeScript](https://typescriptlang.org) `~5.9.2` | Type-safe development |

### Navigation
| Package | Purpose |
|---|---|
| `@react-navigation/native` `^7.2.2` | Core navigation container |
| `@react-navigation/native-stack` `^7.14.11` | Stack-based screen navigation |
| `@react-navigation/bottom-tabs` `^7.4.0` | Bottom tab bar navigation |

### Animations & UI
| Package | Purpose |
|---|---|
| `react-native-reanimated` `~4.1.1` | High-performance animations (circular reveal, icon morph) |
| `expo-linear-gradient` `~15.0.8` | Metal-specific gradient backgrounds for Hero cards & portfolio cards |
| `expo-haptics` `~15.0.8` | Tactile feedback on interactions |
| `react-native-gesture-handler` `~2.28.0` | Swipe gestures & touch handling |
| `@expo/vector-icons` `^15.0.3` | Ionicons for UI icons |

### Charts & Data Visualization
| Package | Purpose |
|---|---|
| `react-native-chart-kit` `^6.12.0` | Smooth bezier line charts for price history |
| `react-native-svg` `15.12.1` | Custom SVG-based Candlestick chart (OHLC) |

### APIs
| Service | Purpose |
|---|---|
| [goldapi.io](https://goldapi.io) | Real-time precious metal spot prices |
| [frankfurter.app](https://frankfurter.app) | Live USD → INR exchange rate |

### Utilities
| Package | Purpose |
|---|---|
| `axios` `^1.15.0` | HTTP client for API requests |
| `react-native-safe-area-context` `~5.6.0` | Safe area insets for notch/status bar handling |
| `react-native-screens` `~4.16.0` | Native screen components for performance |
| `expo-constants` `~18.0.13` | Access to app config & environment variables |

---

## 📁 Folder Structure

```
aurex/
├── src/
│   ├── components/
│   │   ├── CandlestickChart.tsx   # Custom SVG candlestick (OHLC) chart
│   │   ├── LoaderSkeleton.tsx     # Shimmer skeleton placeholder
│   │   ├── MetalCard.tsx          # Home screen price card per metal
│   │   ├── PortfolioCard.tsx      # Portfolio summary card with gradient
│   │   ├── QuickStats.tsx         # Quick market snapshot component
│   │   └── StatCard.tsx           # Bento grid card (supports Hero + tinted variants)
│   │
│   ├── context/
│   │   └── ThemeContext.tsx       # Global theme state + circular reveal animation
│   │
│   ├── screens/
│   │   ├── HomeScreen.tsx         # Live price list + portfolio carousel + theme toggle
│   │   └── DetailScreen.tsx       # Metal detail: chart, karat grid, market stats
│   │
│   └── services/
│       └── goldApi.ts             # API service: live prices, exchange rate, mock history
│
├── App.tsx                        # Root navigator + ThemeProvider
├── app.json                       # Expo app configuration
├── .env                           # Environment variables (API keys)
└── package.json
```

---

## 🚀 How to Run

### Step 1 — Install Expo CLI

If you don't have Expo CLI installed globally, do it first:

```bash
npm install -g expo-cli
```

### Step 2 — Clone the Repository

```bash
git clone https://github.com/abhayahlawat/aurex.git
cd aurex
```

### Step 3 — Install Dependencies

```bash
npm install
```

### Step 4 — Configure Your API Key

Create a `.env` file in the root directory and add your Gold API key:

```env
EXPO_PUBLIC_GOLD_API_KEY=your_goldapi_io_key_here
```

> 🔑 Get your free API key from [goldapi.io](https://goldapi.io). The free tier includes 100 requests/day.

### Step 5 — Start the App

```bash
npx expo start
```

This will launch the **Expo Dev Server** and display a **QR code** in your terminal.

### Step 6 — View on Your Phone

1. Download the **Expo Go** app on your phone:
   - [Android — Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS — Apple App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Open **Expo Go** and tap **"Scan QR Code"**

3. Point your camera at the QR code in the terminal

4. **Aurex** will load directly on your device — no build required! 🎉

---

## 🎨 Design Decisions

### 1. Circular Reveal Theme Transition
Instead of a standard instant theme swap, Aurex uses a **full-screen circular ripple** that expands from the toggle button's exact position. This was implemented using `react-native-reanimated` with a `withTiming` scale animation on an absolutely-positioned overlay. The overlay is **70% opaque**, so the content beneath remains subtly visible during the transition — making the experience feel translucent and non-destructive.

### 2. Icon Morph Sequence
The Sun ↔ Moon transition is a two-layer animation. Both icons exist simultaneously; the outgoing icon **shrinks and fades out** while the incoming icon **scales up and fades in** from the center. The icon morph fires **300ms before** the background ripple begins, creating a "casting a spell" effect where the icon leads the transition.

### 3. Bento Grid with Metal-Synced Hero Cards
The Karat/Weight pricing section uses a **Bento-style grid** with a prominent Hero card at the top (24K for Gold, 1 Gram for Silver/Platinum). The Hero card carries a gradient that is sourced from the same color palette as the **Portfolio Summary card** for that metal — creating a cohesive visual identity per asset class.

### 4. Market Stats as Info Rows
The market statistics (Open, Close, High, Low) are rendered as **horizontal info rows with dividers** inside a single unified card — inspired by settings panels in native iOS/Android design. This is much cleaner and more scannable than using individual bento boxes for secondary data.

### 5. Session-Level API Caching
To respect the 100 req/day free tier limit on `goldapi.io`, live prices are cached in memory for **5 minutes** per session. The exchange rate from `frankfurter.app` is cached for **1 hour**. Historical chart data is generated via a seeded mock-variance algorithm to avoid costly historical API endpoints entirely.

---

<div align="center">

Made with ❤️ using **React Native** & **Expo**

</div>
