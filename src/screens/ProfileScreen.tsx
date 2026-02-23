import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { projects } from '../data/projects';

const ACHIEVEMENTS = [
  { id: 'a1', title: 'First Look', desc: 'Review your first project', emoji: '👀', rarity: 'Common', color: '#888', check: (r: number, s: number, sk: number) => r >= 1 },
  { id: 'a2', title: 'Curious Mind', desc: 'Review 10 projects', emoji: '🧠', rarity: 'Common', color: '#888', check: (r: number, s: number, sk: number) => r >= 10 },
  { id: 'a3', title: 'Collector', desc: 'Save 5 projects', emoji: '⭐', rarity: 'Uncommon', color: '#4CAF50', check: (r: number, s: number, sk: number) => s >= 5 },
  { id: 'a4', title: 'Seeker Fan', desc: 'Save 5 Seeker apps', emoji: '📱', rarity: 'Uncommon', color: '#4CAF50', check: (r: number, s: number, sk: number) => sk >= 5 },
  { id: 'a5', title: 'Half Way', desc: 'Review half of all projects', emoji: '🎯', rarity: 'Rare', color: '#2196F3', check: (r: number, s: number, sk: number) => r >= Math.floor(projects.length / 2) },
  { id: 'a6', title: 'Dedicated Saver', desc: 'Save 15 projects', emoji: '💾', rarity: 'Rare', color: '#2196F3', check: (r: number, s: number, sk: number) => s >= 15 },
  { id: 'a7', title: 'Explorer', desc: 'Review every project', emoji: '🏆', rarity: 'Epic', color: '#9945FF', check: (r: number, s: number, sk: number) => r >= projects.length },
  { id: 'a8', title: 'Seeker OG', desc: 'Save all Seeker apps', emoji: '🔮', rarity: 'Epic', color: '#9945FF', check: (r: number, s: number, sk: number) => sk >= projects.filter(p => p.isSeeker).length },
  { id: 'a9', title: 'Streak King', desc: '7-day GM streak', emoji: '🔥', rarity: 'Epic', color: '#9945FF', check: () => false },
  { id: 'a10', title: 'Diamond Hands', desc: 'Stake $100+ in SKR', emoji: '💎', rarity: 'Legendary', color: '#FFD700', check: () => false },
  { id: 'a11', title: 'Validator OG', desc: 'Stake 2+ SOL with validator', emoji: '🏛️', rarity: 'Legendary', color: '#FFD700', check: () => false },
  { id: 'a12', title: 'Genesis', desc: 'All achievements unlocked', emoji: '👑', rarity: 'Mythic', color: '#FF4500', check: () => false },
];

export default function ProfileScreen() {
  const { savedProjects, currentIndex, resetCards, walletAddress, connectWallet, disconnectWallet } = useApp();
  const reviewed = currentIndex;
  const total = projects.length;
  const seekerCount = savedProjects.filter(p => p.isSeeker).length;
  const categories = [...new Set(savedProjects.map(p => p.category))];
  const progress = Math.round((reviewed / total) * 100);

  const unlockedCount = ACHIEVEMENTS.filter(a => a.check(reviewed, savedProjects.length, seekerCount)).length;

  const shortAddress = walletAddress
    ? walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4)
    : null;

  return (
    <ScrollView style={styles.container} bounces={false}>
      <Text style={styles.title}>Profile</Text>

      {walletAddress ? (
        <View style={styles.walletConnected}>
          <Text style={styles.walletConnectedEmoji}>✅</Text>
          <Text style={styles.walletConnectedTitle}>Wallet Connected</Text>
          <Text style={styles.walletAddressText}>{shortAddress}</Text>
          <TouchableOpacity style={styles.disconnectBtn} onPress={disconnectWallet}>
            <Text style={styles.disconnectBtnText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.walletBox}>
          <Text style={styles.walletEmoji}>🔗</Text>
          <Text style={styles.walletTitle}>Connect Wallet</Text>
          <Text style={styles.walletHint}>Link your Solana wallet to claim rewards</Text>
          <TouchableOpacity style={styles.walletBtn} onPress={connectWallet}>
            <Text style={styles.walletBtnText}>Connect</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{savedProjects.length}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{reviewed}</Text>
          <Text style={styles.statLabel}>Reviewed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#14F195' }]}>{seekerCount}</Text>
          <Text style={styles.statLabel}>Seeker Apps</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#FF9500' }]}>1</Text>
          <Text style={styles.statLabel}>GM Streak</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Discovery Progress</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{reviewed}/{total} projects reviewed ({progress}%)</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories Explored</Text>
        <View style={styles.tags}>
          {categories.length > 0 ? categories.map(cat => (
            <View key={cat} style={styles.tag}>
              <Text style={styles.tagText}>{cat}</Text>
            </View>
          )) : (
            <Text style={styles.emptyText}>Start swiping to explore categories!</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.achieveHeader}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <Text style={styles.achieveCount}>{unlockedCount}/{ACHIEVEMENTS.length}</Text>
        </View>

        <View style={styles.rarityLegend}>
          <Text style={[styles.rarityDot, { color: '#888' }]}>● Common</Text>
          <Text style={[styles.rarityDot, { color: '#4CAF50' }]}>● Uncommon</Text>
          <Text style={[styles.rarityDot, { color: '#2196F3' }]}>● Rare</Text>
          <Text style={[styles.rarityDot, { color: '#9945FF' }]}>● Epic</Text>
          <Text style={[styles.rarityDot, { color: '#FFD700' }]}>● Legendary</Text>
          <Text style={[styles.rarityDot, { color: '#FF4500' }]}>● Mythic</Text>
        </View>

        <View style={styles.achievements}>
          {ACHIEVEMENTS.map(a => {
            const unlocked = a.check(reviewed, savedProjects.length, seekerCount);
            return (
              <View key={a.id} style={[styles.achievement, unlocked ? { borderColor: a.color, borderWidth: 1, opacity: 1 } : {}]}>
                <View style={[styles.achieveRarityBar, { backgroundColor: unlocked ? a.color : '#333' }]} />
                <Text style={styles.achieveEmoji}>{unlocked ? a.emoji : '🔒'}</Text>
                <Text style={[styles.achieveTitle, unlocked && { color: '#fff' }]}>{a.title}</Text>
                <Text style={styles.achieveDesc}>{a.desc}</Text>
                <Text style={[styles.achieveRarity, { color: unlocked ? a.color : '#444' }]}>{a.rarity}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.aboutSection}>
        <View style={styles.aboutHeader}>
          <Text style={styles.aboutLogo}>SolQuest</Text>
          <Text style={styles.aboutVersion}>v1.0.0</Text>
        </View>
        <Text style={styles.aboutTagline}>Discover. Explore. Earn.</Text>
        <Text style={styles.aboutDesc}>
          SolQuest helps you discover the best Solana dApps through an engaging, gamified experience. Swipe through curated projects, complete daily quests, earn XP, and unlock achievements — all built for the Solana Seeker.
        </Text>
        <View style={styles.aboutDivider} />
        <Text style={styles.aboutLabel}>Built for</Text>
        <View style={styles.aboutBadges}>
          <View style={styles.aboutBadge}>
            <Text style={styles.aboutBadgeText}>Solana Seeker</Text>
          </View>
          <View style={[styles.aboutBadge, { borderColor: '#FF9500' }]}>
            <Text style={[styles.aboutBadgeText, { color: '#FF9500' }]}>MONOLITH Hackathon</Text>
          </View>
        </View>
        <Text style={styles.aboutLabel}>Powered by</Text>
        <View style={styles.aboutBadges}>
          <View style={[styles.aboutBadge, { borderColor: '#14F195' }]}>
            <Text style={[styles.aboutBadgeText, { color: '#14F195' }]}>Solana</Text>
          </View>
          <View style={[styles.aboutBadge, { borderColor: '#E040FB' }]}>
            <Text style={[styles.aboutBadgeText, { color: '#E040FB' }]}>SKR Token</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.resetBtn} onPress={resetCards}>
        <Text style={styles.resetBtnText}>Reset All Cards</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 60 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 16 },
  walletBox: {
    marginHorizontal: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9945FF44',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  walletEmoji: { fontSize: 32, marginBottom: 8 },
  walletTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  walletHint: { color: '#888', fontSize: 12, marginBottom: 12, textAlign: 'center' },
  walletBtn: {
    backgroundColor: '#9945FF',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  walletBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  walletConnected: {
    marginHorizontal: 16,
    backgroundColor: '#14F19515',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#14F195',
    marginBottom: 16,
  },
  walletConnectedEmoji: { fontSize: 32, marginBottom: 8 },
  walletConnectedTitle: { color: '#14F195', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  walletAddressText: { color: '#fff', fontSize: 14, marginBottom: 12 },
  disconnectBtn: {
    backgroundColor: '#E9456022',
    borderWidth: 1,
    borderColor: '#E94560',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  disconnectBtnText: { color: '#E94560', fontSize: 12, fontWeight: 'bold' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 14,
    width: '48%',
    flexGrow: 1,
    alignItems: 'center',
  },
  statNumber: { color: '#9945FF', fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 12, marginTop: 4 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  progressBar: { height: 8, backgroundColor: '#1a1a2e', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: '#9945FF', borderRadius: 4 },
  progressText: { color: '#888', fontSize: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#9945FF22', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 },
  tagText: { color: '#9945FF', fontSize: 12, fontWeight: '600' },
  emptyText: { color: '#666', fontSize: 13 },
  achieveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  achieveCount: { color: '#9945FF', fontSize: 14, fontWeight: 'bold' },
  rarityLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  rarityDot: { fontSize: 10 },
  achievements: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  achievement: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    flexGrow: 1,
    opacity: 0.5,
    borderWidth: 1,
    borderColor: '#222',
  },
  achieveRarityBar: { height: 3, borderRadius: 2, marginBottom: 8 },
  achieveEmoji: { fontSize: 24, marginBottom: 4 },
  achieveTitle: { color: '#888', fontSize: 13, fontWeight: 'bold' },
  achieveDesc: { color: '#555', fontSize: 11, marginTop: 2 },
  achieveRarity: { fontSize: 10, marginTop: 4, fontWeight: 'bold' },
  aboutSection: {
    marginHorizontal: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#9945FF33',
  },
  aboutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  aboutLogo: { color: '#9945FF', fontSize: 22, fontWeight: 'bold' },
  aboutVersion: { color: '#666', fontSize: 12 },
  aboutTagline: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  aboutDesc: { color: '#888', fontSize: 13, lineHeight: 20, marginBottom: 16 },
  aboutDivider: { height: 1, backgroundColor: '#333', marginBottom: 16 },
  aboutLabel: { color: '#666', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  aboutBadges: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  aboutBadge: { borderWidth: 1, borderColor: '#9945FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  aboutBadgeText: { color: '#9945FF', fontSize: 11, fontWeight: 'bold' },
  resetBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#E9456022',
    borderWidth: 1,
    borderColor: '#E94560',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  resetBtnText: { color: '#E94560', fontSize: 14, fontWeight: 'bold' },
});