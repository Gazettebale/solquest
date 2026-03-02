import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project } from '../data/projects';
import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';

const APP_IDENTITY = { name: 'SolQuest', uri: 'https://solquest.app' };
const RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=979c0654-c79e-4e97-8f8c-a5b6bd03cdde';

// SKR Token
const SKR_MINT = new PublicKey('SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3');
const TREASURY = new PublicKey('Hboo3XYUcXQJL8TfRu48Nac28wxagUnxC8q5SdFL2dEY');
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

// 5 SKR (6 decimals)
const GM_COST = 5_000_000;

function decodeWalletAddress(raw: any): PublicKey {
  if (typeof raw === 'string' && (raw.includes('+') || raw.includes('/') || raw.includes('='))) {
    const bytes = Uint8Array.from(Buffer.from(raw, 'base64'));
    return new PublicKey(bytes);
  } else if (typeof raw === 'string') {
    return new PublicKey(raw);
  } else {
    return new PublicKey(new Uint8Array(raw as any));
  }
}

async function fetchBlockhash(): Promise<string> {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'getLatestBlockhash',
      params: [{ commitment: 'confirmed' }],
    }),
  });
  const json = await response.json();
  return json.result.value.blockhash;
}

async function sendTransaction(serializedTx: Uint8Array): Promise<string> {
  const base64Tx = Buffer.from(serializedTx).toString('base64');
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'sendTransaction',
      params: [base64Tx, { encoding: 'base64', preflightCommitment: 'confirmed' }],
    }),
  });
  const json = await response.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

function getATA(mint: PublicKey, owner: PublicKey): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return address;
}

function buildSplTransfer(source: PublicKey, destination: PublicKey, owner: PublicKey, amount: number): TransactionInstruction {
  const data = Buffer.alloc(9);
  data.writeUInt8(3, 0);
  data.writeUInt32LE(amount & 0xFFFFFFFF, 1);
  data.writeUInt32LE(Math.floor(amount / 0x100000000) & 0xFFFFFFFF, 5);
  return new TransactionInstruction({
    keys: [
      { pubkey: source, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ],
    programId: TOKEN_PROGRAM_ID,
    data,
  });
}

// Shuffle array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface AppContextType {
  savedProjects: Project[];
  currentIndex: number;
  saveProject: (project: Project) => void;
  skipProject: () => void;
  gmStreak: number;
  xp: number;
  addXP: (amount: number) => void;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  claimGM: () => Promise<{ success: boolean; message: string }>;
  gmClaimedToday: boolean;
  resetCards: () => void;
  // Quest tracking — auto
  todaySwipes: number;
  todaySaves: number;
  gameHighScore: number;
  todayGameBest: number;
  updateGameScore: (score: number) => void;
  totalProjects: number;
  // Quest tracking — manual
  todaySwapDone: boolean;
  todayStakeDone: boolean;
  weekSwapDays: number;
  weekStakeDays: number;
  weekStakeTotal: number;
  solStaked: boolean;
  explorerDone: boolean;
  claimSwap: () => void;
  claimStake: (amount: number) => void;
  claimSolStake: () => void;
  claimExplorer: () => void;
  // Shuffled projects
  shuffledProjects: Project[];
  // Quest XP tracking
  claimedQuestXP: Record<string, boolean>;
  claimQuestXP: (questId: string, amount: number) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);
const getTodayKey = () => new Date().toISOString().split('T')[0];

export function AppProvider({ children }: { children: ReactNode }) {
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gmStreak, setGmStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [lastGmDate, setLastGmDate] = useState<string | null>(null);

  // Quest tracking — auto
  const [todaySwipes, setTodaySwipes] = useState(0);
  const [todaySaves, setTodaySaves] = useState(0);
  const [gameHighScore, setGameHighScore] = useState(0);
  const [todayGameBest, setTodayGameBest] = useState(0);
  const [lastActivityDate, setLastActivityDate] = useState<string | null>(null);

  // Quest tracking — manual
  const [todaySwapDone, setTodaySwapDone] = useState(false);
  const [todayStakeDone, setTodayStakeDone] = useState(false);
  const [weekSwapDays, setWeekSwapDays] = useState(0);
  const [weekStakeDays, setWeekStakeDays] = useState(0);
  const [weekStakeTotal, setWeekStakeTotal] = useState(0);
  const [solStaked, setSolStaked] = useState(false);
  const [explorerDone, setExplorerDone] = useState(false);

  // Shuffled projects list (Phantom first, rest shuffled)
  const [shuffledProjects, setShuffledProjects] = useState<Project[]>([]);

  // Track which quest XP has been claimed (prevent double-counting)
  const [claimedQuestXP, setClaimedQuestXP] = useState<Record<string, boolean>>({});

  const gmClaimedToday = lastGmDate === getTodayKey();

  // Reset daily counters if it's a new day
  useEffect(() => {
    const today = getTodayKey();
    if (loaded && lastActivityDate !== today) {
      setTodaySwipes(0);
      setTodaySaves(0);
      setTodayGameBest(0);
      setTodaySwapDone(false);
      setTodayStakeDone(false);
      setLastActivityDate(today);
      // Reset daily quest XP claims
      setClaimedQuestXP(prev => {
        const newClaims: Record<string, boolean> = {};
        // Keep weekly and special claims, reset daily
        Object.keys(prev).forEach(key => {
          if (!key.startsWith('d')) newClaims[key] = prev[key];
        });
        return newClaims;
      });
      AsyncStorage.setItem('lastActivityDate', today);
      AsyncStorage.setItem('todaySwipes', '0');
      AsyncStorage.setItem('todaySaves', '0');
      AsyncStorage.setItem('todayGameBest', '0');
      AsyncStorage.setItem('todaySwapDone', 'false');
      AsyncStorage.setItem('todayStakeDone', 'false');
    }
  }, [loaded, lastActivityDate]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('savedProjects');
        const indexData = await AsyncStorage.getItem('currentIndex');
        const xpData = await AsyncStorage.getItem('xp');
        const streakData = await AsyncStorage.getItem('gmStreak');
        const walletData = await AsyncStorage.getItem('walletAddress');
        const lastGmData = await AsyncStorage.getItem('lastGmDate');
        const swipesData = await AsyncStorage.getItem('todaySwipes');
        const savesData = await AsyncStorage.getItem('todaySaves');
        const gameData = await AsyncStorage.getItem('gameHighScore');
        const todayGameData = await AsyncStorage.getItem('todayGameBest');
        const activityData = await AsyncStorage.getItem('lastActivityDate');
        const swapData = await AsyncStorage.getItem('todaySwapDone');
        const stakeData = await AsyncStorage.getItem('todayStakeDone');
        const weekSwapData = await AsyncStorage.getItem('weekSwapDays');
        const weekStakeData = await AsyncStorage.getItem('weekStakeDays');
        const weekStakeTotalData = await AsyncStorage.getItem('weekStakeTotal');
        const solStakedData = await AsyncStorage.getItem('solStaked');
        const explorerData = await AsyncStorage.getItem('explorerDone');
        const shuffleData = await AsyncStorage.getItem('shuffledProjectIds');
        const claimedXPData = await AsyncStorage.getItem('claimedQuestXP');

        if (savedData) setSavedProjects(JSON.parse(savedData));
        if (indexData) setCurrentIndex(JSON.parse(indexData));
        if (xpData) setXp(JSON.parse(xpData));
        if (streakData) setGmStreak(JSON.parse(streakData));
        if (walletData) setWalletAddress(walletData);
        if (lastGmData) setLastGmDate(lastGmData);
        if (swipesData) setTodaySwipes(JSON.parse(swipesData));
        if (savesData) setTodaySaves(JSON.parse(savesData));
        if (gameData) setGameHighScore(JSON.parse(gameData));
        if (todayGameData) setTodayGameBest(JSON.parse(todayGameData));
        if (activityData) setLastActivityDate(activityData);
        if (swapData) setTodaySwapDone(JSON.parse(swapData));
        if (stakeData) setTodayStakeDone(JSON.parse(stakeData));
        if (weekSwapData) setWeekSwapDays(JSON.parse(weekSwapData));
        if (weekStakeData) setWeekStakeDays(JSON.parse(weekStakeData));
        if (weekStakeTotalData) setWeekStakeTotal(JSON.parse(weekStakeTotalData));
        if (solStakedData) setSolStaked(JSON.parse(solStakedData));
        if (explorerData) setExplorerDone(JSON.parse(explorerData));
        if (claimedXPData) setClaimedQuestXP(JSON.parse(claimedXPData));

        // Load shuffled project order
        if (shuffleData) {
          const { projects: allProjects } = require('../data/projects');
          const ids: string[] = JSON.parse(shuffleData);
          const ordered = ids.map(id => allProjects.find((p: Project) => p.id === id)).filter(Boolean);
          if (ordered.length === allProjects.length) {
            setShuffledProjects(ordered);
          } else {
            // Fallback: reshuffle
            const phantom = allProjects[0];
            const rest = shuffleArray(allProjects.slice(1));
            const newOrder = [phantom, ...rest];
            setShuffledProjects(newOrder);
            AsyncStorage.setItem('shuffledProjectIds', JSON.stringify(newOrder.map((p: Project) => p.id)));
          }
        } else {
          // First launch: shuffle
          const { projects: allProjects } = require('../data/projects');
          const phantom = allProjects[0];
          const rest = shuffleArray(allProjects.slice(1));
          const newOrder = [phantom, ...rest];
          setShuffledProjects(newOrder);
          AsyncStorage.setItem('shuffledProjectIds', JSON.stringify(newOrder.map((p: Project) => p.id)));
        }
      } catch (e) {
        console.log('Error loading data', e);
      }
      setLoaded(true);
    };
    loadData();
  }, []);

  // Persist state
  useEffect(() => { if (loaded) AsyncStorage.setItem('savedProjects', JSON.stringify(savedProjects)); }, [savedProjects, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('currentIndex', JSON.stringify(currentIndex)); }, [currentIndex, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('xp', JSON.stringify(xp)); }, [xp, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('gmStreak', JSON.stringify(gmStreak)); }, [gmStreak, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('todaySwipes', JSON.stringify(todaySwipes)); }, [todaySwipes, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('todaySaves', JSON.stringify(todaySaves)); }, [todaySaves, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('gameHighScore', JSON.stringify(gameHighScore)); }, [gameHighScore, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('todayGameBest', JSON.stringify(todayGameBest)); }, [todayGameBest, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('weekSwapDays', JSON.stringify(weekSwapDays)); }, [weekSwapDays, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('weekStakeDays', JSON.stringify(weekStakeDays)); }, [weekStakeDays, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('weekStakeTotal', JSON.stringify(weekStakeTotal)); }, [weekStakeTotal, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('solStaked', JSON.stringify(solStaked)); }, [solStaked, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('explorerDone', JSON.stringify(explorerDone)); }, [explorerDone, loaded]);
  useEffect(() => { if (loaded) AsyncStorage.setItem('claimedQuestXP', JSON.stringify(claimedQuestXP)); }, [claimedQuestXP, loaded]);

  const saveProject = (project: Project) => {
    setSavedProjects(prev => [...prev, project]);
    setCurrentIndex(prev => prev + 1);
    setTodaySwipes(prev => prev + 1);
    setTodaySaves(prev => prev + 1);
  };

  const skipProject = () => {
    setCurrentIndex(prev => prev + 1);
    setTodaySwipes(prev => prev + 1);
  };

  const addXP = (amount: number) => setXp(prev => prev + amount);

  const resetCards = () => {
    setCurrentIndex(0);
    setSavedProjects([]);
    // Reshuffle: keep Phantom first, shuffle the rest
    const { projects: allProjects } = require('../data/projects');
    const phantom = allProjects[0];
    const rest = shuffleArray(allProjects.slice(1));
    const newOrder = [phantom, ...rest];
    setShuffledProjects(newOrder);
    AsyncStorage.setItem('shuffledProjectIds', JSON.stringify(newOrder.map((p: Project) => p.id)));
  };

  const updateGameScore = (score: number) => {
    if (score > todayGameBest) setTodayGameBest(score);
    if (score > gameHighScore) setGameHighScore(score);
  };

  // Claim quest XP (only once per quest per period)
  const claimQuestXP = (questId: string, amount: number) => {
    if (!claimedQuestXP[questId]) {
      setXp(prev => prev + amount);
      setClaimedQuestXP(prev => {
        const updated = { ...prev, [questId]: true };
        AsyncStorage.setItem('claimedQuestXP', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Manual quest claims
  const claimSwap = () => {
    if (!todaySwapDone) {
      setTodaySwapDone(true);
      setWeekSwapDays(prev => prev + 1);
      AsyncStorage.setItem('todaySwapDone', 'true');
    }
  };

  const claimStake = (amount: number) => {
    if (!todayStakeDone) {
      setTodayStakeDone(true);
      setWeekStakeDays(prev => prev + 1);
      setWeekStakeTotal(prev => prev + amount);
      AsyncStorage.setItem('todayStakeDone', 'true');
    }
  };

  const claimSolStake = () => {
    setSolStaked(true);
    AsyncStorage.setItem('solStaked', 'true');
  };

  const claimExplorer = () => {
    setExplorerDone(true);
    AsyncStorage.setItem('explorerDone', 'true');
  };

  const connectWallet = async () => {
    console.log('=== CONNECT WALLET CALLED ===');
    try {
      const result = await transact(async (wallet: Web3MobileWallet) => {
        return await wallet.authorize({ chain: 'solana:mainnet', identity: APP_IDENTITY });
      });
      const account = result.accounts[0];
      const pubkey = decodeWalletAddress(account.address);
      const address = pubkey.toBase58();
      console.log('WALLET ADDRESS (base58):', address);
      setWalletAddress(address);
      await AsyncStorage.setItem('walletAddress', address);
    } catch (e) {
      console.log('Wallet connect error:', e);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    AsyncStorage.removeItem('walletAddress');
  };

  const claimGM = async (): Promise<{ success: boolean; message: string }> => {
    console.log('=== CLAIM GM START ===');
    if (!walletAddress) return { success: false, message: 'Connect your wallet first!' };
    if (gmClaimedToday) return { success: false, message: 'GM already claimed today! Come back tomorrow.' };

    try {
      const userPubkey = new PublicKey(walletAddress);
      const userTokenAccount = getATA(SKR_MINT, userPubkey);
      const treasuryTokenAccount = getATA(SKR_MINT, TREASURY);
      const blockhash = await fetchBlockhash();

      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: userPubkey,
      }).add(buildSplTransfer(userTokenAccount, treasuryTokenAccount, userPubkey, GM_COST));

      const signedTx = await transact(async (wallet: Web3MobileWallet) => {
        await wallet.authorize({ chain: 'solana:mainnet', identity: APP_IDENTITY });
        const signedTxs = await wallet.signTransactions({ transactions: [tx] });
        return signedTxs[0];
      });

      const sig = await sendTransaction(signedTx.serialize());
      console.log('GM SUCCESS! Signature:', sig);

      const today = getTodayKey();
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const newStreak = lastGmDate === yesterday ? gmStreak + 1 : 1;
      const xpGain = 50 * newStreak;

      setGmStreak(newStreak);
      setLastGmDate(today);
      setXp(prev => prev + xpGain);

      await AsyncStorage.setItem('gmStreak', JSON.stringify(newStreak));
      await AsyncStorage.setItem('lastGmDate', today);

      return { success: true, message: `GM! Day ${newStreak} streak! +${xpGain} XP` };
    } catch (e: any) {
      console.log('GM claim error:', e);
      if (e?.message?.includes('0x1') || e?.message?.includes('insufficient')) {
        return { success: false, message: 'Not enough SKR! You need 5 SKR.' };
      }
      return { success: false, message: `Error: ${e?.message || e}` };
    }
  };

  if (!loaded) return null;

  return (
    <AppContext.Provider value={{
      savedProjects, currentIndex, saveProject, skipProject,
      gmStreak, xp, addXP, walletAddress, connectWallet,
      disconnectWallet, claimGM, gmClaimedToday, resetCards,
      todaySwipes, todaySaves, gameHighScore, todayGameBest,
      updateGameScore, totalProjects: shuffledProjects.length || 35,
      todaySwapDone, todayStakeDone, weekSwapDays, weekStakeDays,
      weekStakeTotal, solStaked, explorerDone, claimSwap, claimStake,
      claimSolStake, claimExplorer, shuffledProjects,
      claimedQuestXP, claimQuestXP,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);