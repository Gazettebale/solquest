import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { Project } from '../data/projects';

const APP_IDENTITY = {
  name: 'SolQuest',
  uri: 'https://solquest.app',
  icon: 'favicon.ico',
};

interface AppContextType {
  savedProjects: Project[];
  currentIndex: number;
  saveProject: (project: Project) => void;
  skipProject: () => void;
  gmStreak: number;
  xp: number;
  addXP: (amount: number) => void;
  resetCards: () => void;
  walletAddress: string | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode }) {
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gmStreak, setGmStreak] = useState(1);
  const [xp, setXp] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('savedProjects');
        const indexData = await AsyncStorage.getItem('currentIndex');
        const xpData = await AsyncStorage.getItem('xp');
        const streakData = await AsyncStorage.getItem('gmStreak');
        const walletData = await AsyncStorage.getItem('walletAddress');

        if (savedData) setSavedProjects(JSON.parse(savedData));
        if (indexData) setCurrentIndex(JSON.parse(indexData));
        if (xpData) setXp(JSON.parse(xpData));
        if (streakData) setGmStreak(JSON.parse(streakData));
        if (walletData) setWalletAddress(walletData);
      } catch (e) {
        console.log('Error loading data', e);
      }
      setLoaded(true);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem('savedProjects', JSON.stringify(savedProjects));
  }, [savedProjects, loaded]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem('currentIndex', JSON.stringify(currentIndex));
  }, [currentIndex, loaded]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem('xp', JSON.stringify(xp));
  }, [xp, loaded]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem('gmStreak', JSON.stringify(gmStreak));
  }, [gmStreak, loaded]);

  const saveProject = (project: Project) => {
    setSavedProjects(prev => [...prev, project]);
    setCurrentIndex(prev => prev + 1);
  };

  const skipProject = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const addXP = (amount: number) => {
    setXp(prev => prev + amount);
  };

  const resetCards = async () => {
    setCurrentIndex(0);
    setSavedProjects([]);
    await AsyncStorage.setItem('currentIndex', '0');
    await AsyncStorage.setItem('savedProjects', '[]');
  };

  const connectWallet = async () => {
    try {
      const result = await transact(async (wallet: Web3MobileWallet) => {
        const auth = await wallet.authorize({
          cluster: 'solana:mainnet',
          identity: APP_IDENTITY,
        });
        return auth;
      });

      const account = result.accounts[0];
      const address = account.address;
      setWalletAddress(address);
      await AsyncStorage.setItem('walletAddress', address);
    } catch (e) {
      console.log('Wallet connection error:', e);
    }
  };

  const disconnectWallet = async () => {
    setWalletAddress(null);
    await AsyncStorage.removeItem('walletAddress');
  };

  if (!loaded) return null;

  return (
    <AppContext.Provider value={{
      savedProjects, currentIndex, saveProject, skipProject,
      gmStreak, xp, addXP, resetCards,
      walletAddress, connectWallet, disconnectWallet,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);