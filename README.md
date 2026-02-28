# SolQuest 🧭

**Discover. Explore. Earn.**

SolQuest is a gamified discovery app for the Solana ecosystem, built for the **Solana Seeker** device. Swipe through curated Solana dApps, complete daily quests, earn XP, and engage with the Solana blockchain — all from your mobile.

Built for the **MONOLITH Hackathon** 🏗️

## Features

### 🧭 Swipe Discovery
Browse 35+ curated Solana projects with a Tinder-style card interface. Save projects you like, skip the rest. Each project includes category tags, difficulty level, and direct links.

### ☀️ GM Streak (On-Chain)
Say "GM" to Solana every day by sending 5 SKR tokens to the treasury. Maintain daily streaks for escalating XP bonuses. Fully on-chain via SPL token transfer.

### ⚔️ Quest System
Complete daily, weekly, and special quests to earn XP and level up:

- **Daily Quests**: GM Check-in, Swipe 5 projects, Score 30+ in Solana Runner, Daily Swap, Daily SKR Stake
- **Weekly Quests**: 7-Day GM Streak, Save 15 projects, Score 200+ in Runner, 7-day Swap/Stake streaks, Stake 140+ SKR
- **Special Quests**: Connect Wallet, Review all projects, Rate on dApp Store, Stake 2 SOL on validator

Quests auto-detect completion when possible (swipes, game scores, wallet connection). Swap and stake quests use an honor system for now.

### 🏃 Solana Runner
Built-in mini-game with jump, double-jump, and slam mechanics. Compete against a leaderboard and complete game-related quests.

### 👤 Profile & Achievements
Track your discovery progress, categories explored, and unlock 12 achievements from Common to Mythic rarity.

## Tech Stack

- **React Native** with Expo (SDK 54)
- **TypeScript**
- **Solana Mobile Wallet Adapter** (Phantom, Solflare, Backpack)
- **SPL Token** transactions (manual instruction building, no BigInt dependency)
- **Helius RPC** for reliable mainnet connectivity
- **AsyncStorage** for local state persistence

## Architecture Highlights

- **Base64 wallet address decoding**: Handles Phantom/Solflare returning addresses in base64 instead of base58 on Seeker devices
- **Pre-transact blockhash fetching**: Network calls are made before opening the wallet interface to avoid mobile networking issues during wallet sessions
- **Manual fetch for RPC**: Uses raw `fetch()` instead of `Connection` class for reliable mobile RPC communication
- **Manual SPL transfer instructions**: Built without `@solana/spl-token` to avoid Buffer/BigInt polyfill issues in React Native

## Getting Started

```bash
# Install dependencies
npm install

# Start Expo dev server
npx expo start --clear

# For Seeker device (requires dev build)
eas build --profile development --platform android
```

## Project Structure

```
src/
├── context/
│   └── AppContext.tsx      # Global state, wallet, GM streak, quest tracking
├── components/
│   ├── ProjectCard.tsx     # Swipeable project card
│   └── MiniGame.tsx        # Solana Runner game
├── screens/
│   ├── HomeScreen.tsx      # Discovery feed + GM modal
│   ├── QuestsScreen.tsx    # Quest system with auto-detection
│   ├── SavedScreen.tsx     # Saved projects list
│   └── ProfileScreen.tsx   # Profile, stats, achievements
├── data/
│   └── projects.ts         # Curated Solana projects database
└── navigation/
    └── ...
```

## Roadmap (Post-Hackathon)

- [ ] **On-chain quest verification**: Replace honor system with blockchain transaction verification for swap/stake quests
- [ ] **NFT achievement badges**: Mint achievement NFTs on completion
- [ ] **Social features**: Friends, shared leaderboards, referral system
- [ ] **Dynamic project feed**: Fetch projects from API instead of static data
- [ ] **SKR token rewards**: Distribute SKR tokens for quest completion
- [ ] **Push notifications**: Daily GM reminders and streak alerts

## Token Info

- **SKR Token**: `SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3` (6 decimals)
- **Treasury**: `Hboo3XYUcXQJL8TfRu48Nac28wxagUnxC8q5SdFL2dEY`
- **GM Cost**: 5 SKR per daily check-in

## License

MIT

---

*Built with 💜 for the Solana ecosystem by [@gazettebale](https://github.com/gazettebale)*