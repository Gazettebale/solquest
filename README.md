# SolQuest

**Discover. Explore. Earn.**

A gamified mobile app for exploring the Solana ecosystem — swipe through curated dApps, complete daily quests, earn XP, and interact with the blockchain on-chain.

> Built for the **MONOLITH Hackathon** (Solana Seeker) — work in progress, not fully complete. This is a personal project I'm continuing to build as I learn mobile + web3 dev.

![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Solana](https://img.shields.io/badge/Solana-Mainnet-9945FF?logo=solana&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Screenshots

> *Screenshots coming soon — the app runs on Solana Seeker (Android)*

---

## Features

### Swipe Discovery
Browse 35+ curated Solana dApps with a Tinder-style card interface. Filter by category (DeFi, Trading, Games, NFT & Social, Lifestyle), save projects you like, skip the rest.

### GM Streak (On-Chain)
Say "GM" to Solana every day by sending 5 SKR tokens to a treasury address. Fully on-chain via SPL token transfer through Mobile Wallet Adapter. Maintain streaks for escalating XP bonuses.

### Quest System
Daily, weekly, and special quests with auto-detection where possible:
- **Daily**: GM check-in, swipe 5 projects, score 30+ in Solana Runner, swap, stake
- **Weekly**: 7-day GM streak, collector, high scorer, swap/stake streaks, stake 140+ SKR
- **Special**: connect wallet, explore all projects, star on GitHub, stake 2 SOL on validator

### Solana Runner
Built-in endless runner mini-game with jump, double-jump, and slam mechanics. 12 unlockable characters.

### Profile & Achievements
12 achievement badges (Common → Mythic), level progression (800 XP/level), and discovery stats by category.

---

## Tech Stack

| | |
|---|---|
| **Framework** | React Native 0.81 + Expo SDK 54 |
| **Language** | TypeScript (strict) |
| **Blockchain** | Solana Mainnet via Helius RPC |
| **Wallet** | Mobile Wallet Adapter (Phantom, Solflare, Backpack) |
| **Tokens** | SPL Token — manual instruction building |
| **Storage** | AsyncStorage |
| **Navigation** | React Navigation v7 |

---

## Getting Started

```bash
# 1. Clone and install
git clone https://github.com/Gazettebale/solquest.git
cd solquest
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and add your Helius API key (https://dev.helius.xyz/)

# 3. Start dev server
npx expo start --clear

# 4. Build for Seeker device (requires EAS)
eas build --profile development --platform android
```

> The app is designed for the **Solana Seeker** device. Mobile Wallet Adapter won't work on web or standard Android emulator without a compatible wallet installed.

---

## Architecture Notes

A few non-obvious implementation details:

- **Base64 wallet address decoding** — Phantom/Solflare on Seeker return addresses in base64 instead of base58, requiring manual decoding
- **Pre-transact blockhash fetching** — RPC calls happen before opening the wallet modal to avoid networking issues during MWA sessions
- **Raw `fetch()` for RPC** — More reliable than using `Connection` class on React Native
- **Manual SPL transfer instructions** — Built without `@solana/spl-token` to avoid Buffer/BigInt polyfill issues in React Native

---

## Project Structure

```
src/
├── context/AppContext.tsx      # Global state, wallet, GM streak, quests
├── components/
│   ├── ProjectCard.tsx         # Swipeable card with animations
│   ├── MiniGame.tsx            # Solana Runner game
│   └── QuestToast.tsx          # Toast notifications
├── screens/
│   ├── HomeScreen.tsx          # Discovery feed + GM modal
│   ├── QuestsScreen.tsx        # Quest system
│   ├── SavedScreen.tsx         # Saved projects
│   ├── ProfileScreen.tsx       # Profile + achievements
│   └── OnboardingScreen.tsx    # 3-page onboarding
└── data/projects.ts            # 35 curated Solana projects
```

---

## Roadmap

- [ ] On-chain quest verification (replace honor system for swap/stake)
- [ ] NFT achievement badges
- [ ] Social features (friends, shared leaderboards, referrals)
- [ ] Dynamic project feed (API instead of static data)
- [ ] SKR token rewards distribution
- [ ] Push notifications (daily GM reminders, streak alerts)
- [ ] Global game leaderboard

---

## Token Info

| | |
|---|---|
| **SKR Mint** | `SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3` |
| **Treasury** | `Hboo3XYUcXQJL8TfRu48Nac28wxagUnxC8q5SdFL2dEY` |
| **GM Cost** | 5 SKR per daily check-in |

---

## License

MIT — [@gazettebale](https://github.com/gazettebale)
