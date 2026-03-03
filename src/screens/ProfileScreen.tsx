import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';

const XP_PER_LEVEL = 800;

export default function ProfileScreen() {
  const {
    savedProjects, currentIndex, resetCards, walletAddress,
    connectWallet, disconnectWallet, xp, gmStreak, gmClaimedToday,
    todaySwipes, gameHighScore, shuffledProjects,
    weekSwapDays, weekStakeDays, weekStakeTotal, solStaked, explorerDone,
  } = useApp();

  const reviewed = currentIndex;
  const total = shuffledProjects.length || 35;
  const seekerCount = savedProjects.filter(p => p.isSeeker).length;
  const categories = [...new Set(savedProjects.map(p => p.category))];
  const progress = Math.round((reviewed / total) * 100);
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInLevel = xp % XP_PER_LEVEL;

  const shortAddress = walletAddress
    ? walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4)
    : null;

  const ACHIEVEMENTS = [
    { id: 'a1', title: 'First Look', desc: 'Review your first project', emoji: '👀', rarity: 'Common', color: '#888', unlocked: reviewed >= 1 },
    { id: 'a2', title: 'Curious Mind', desc: 'Review 10 projects', emoji: '🧠', rarity: 'Common', color: '#888', unlocked: reviewed >= 10 },
    { id: 'a3', title: 'Collector', desc: 'Save 5 projects', emoji: '⭐', rarity: 'Uncommon', color: '#4CAF50', unlocked: savedProjects.length >= 5 },
    { id: 'a4', title: 'Seeker Fan', desc: 'Save 5 Seeker apps', emoji: '📱', rarity: 'Uncommon', color: '#4CAF50', unlocked: seekerCount >= 5 },
    { id: 'a5', title: 'Half Way', desc: 'Review half of all projects', emoji: '🎯', rarity: 'Rare', color: '#2196F3', unlocked: reviewed >= Math.floor(total / 2) },
    { id: 'a6', title: 'Dedicated Saver', desc: 'Save 15 projects', emoji: '💾', rarity: 'Rare', color: '#2196F3', unlocked: savedProjects.length >= 15 },
    { id: 'a7', title: 'Explorer', desc: 'Review every project', emoji: '🏆', rarity: 'Epic', color: '#9945FF', unlocked: reviewed >= total },
    { id: 'a8', title: 'Seeker OG', desc: 'Save all Seeker apps', emoji: '🔮', rarity: 'Epic', color: '#9945FF', unlocked: seekerCount >= shuffledProjects.filter(p => p.isSeeker).length },
    { id: 'a9', title: 'Streak King', desc: '7-day GM streak', emoji: '🔥', rarity: 'Epic', color: '#9945FF', unlocked: gmStreak >= 7 },
    { id: 'a10', title: 'Diamond Hands', desc: 'Stake 140+ SKR total', emoji: '💎', rarity: 'Legendary', color: '#FFD700', unlocked: weekStakeTotal >= 140 },
    { id: 'a11', title: 'Validator OG', desc: 'Stake 2+ SOL with validator', emoji: '🏛️', rarity: 'Legendary', color: '#FFD700', unlocked: solStaked },
    { id: 'a12', title: 'Genesis', desc: 'All achievements unlocked', emoji: '👑', rarity: 'Mythic', color: '#FF4500', unlocked: false },
  ];

  const othersUnlocked = ACHIEVEMENTS.slice(0, 11).every(a => a.unlocked);
  ACHIEVEMENTS[11].unlocked = othersUnlocked;

  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length;

  return (
    <ScrollView style={styles.container} bounces={false}>
      <Text style={styles.title}>Profile</Text>

      {/* Level card */}
      <View style={styles.levelCard}>
        <View style={styles.levelTop}>
          <View>
            <Text style={styles.levelLabel}>LEVEL</Text>
            <Text style={styles.levelNumber}>{level}</Text>
          </View>
          <View style={styles.levelRight}>
            <Text style={styles.totalXP}>{xp} XP</Text>
            <Text style={styles.nextLevel}>{XP_PER_LEVEL - xpInLevel} XP to Level {level + 1}</Text>
          </View>
        </View>
        <View style={styles.levelBar}>
          <View style={[styles.levelFill, { width: `${(xpInLevel / XP_PER_LEVEL) * 100}%` }]} />
        </View>
      </View>

      {/* Wallet */}
      {walletAddress ? (
        <View style={styles.walletConnected}>
          <View style={styles.walletRow}>
            <Text style={styles.walletConnectedEmoji}>✅</Text>
            <View style={styles.walletInfo}>
              <Text style={styles.walletConnectedTitle}>Wallet Connected</Text>
              <Text style={styles.walletAddressText}>{shortAddress}</Text>
            </View>
            <TouchableOpacity style={styles.disconnectBtn} onPress={disconnectWallet}>
              <Text style={styles.disconnectBtnText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
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

      {/* Today's activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Activity</Text>
        <View style={styles.activityRow}>
          <View style={styles.activityCard}>
            <Text style={styles.activityEmoji}>{gmClaimedToday ? '✅' : '☀️'}</Text>
            <Text style={styles.activityValue}>{gmClaimedToday ? 'Done!' : 'Not yet'}</Text>
            <Text style={styles.activityLabel}>GM</Text>
          </View>
          <View style={styles.activityCard}>
            <Text style={styles.activityEmoji}>👆</Text>
            <Text style={styles.activityValue}>{todaySwipes}</Text>
            <Text style={styles.activityLabel}>Swipes</Text>
          </View>
          <View style={styles.activityCard}>
            <Text style={styles.activityEmoji}>🔥</Text>
            <Text style={styles.activityValue}>{gmStreak}</Text>
            <Text style={styles.activityLabel}>Streak</Text>
          </View>
          <View style={styles.activityCard}>
            <Text style={styles.activityEmoji}>🎮</Text>
            <Text style={styles.activityValue}>{gameHighScore}</Text>
            <Text style={styles.activityLabel}>High Score</Text>
          </View>
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stats</Text>
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
            <Text style={[styles.statNumber, { color: '#FF9500' }]}>{categories.length}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>
      </View>

      {/* Discovery Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Discovery Progress</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{reviewed}/{total} projects reviewed ({progress}%)</Text>
      </View>

      {/* Categories */}
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

      {/* Achievements */}
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
          {ACHIEVEMENTS.map(a => (
            <View key={a.id} style={[styles.achievement, a.unlocked ? { borderColor: a.color, borderWidth: 1, opacity: 1 } : {}]}>
              <View style={[styles.achieveRarityBar, { backgroundColor: a.unlocked ? a.color : '#333' }]} />
              <Text style={styles.achieveEmoji}>{a.unlocked ? a.emoji : '🔒'}</Text>
              <Text style={[styles.achieveTitle, a.unlocked && { color: '#fff' }]}>{a.title}</Text>
              <Text style={styles.achieveDesc}>{a.desc}</Text>
              <Text style={[styles.achieveRarity, { color: a.unlocked ? a.color : '#444' }]}>{a.rarity}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* About */}
      <View style={styles.aboutSection}>
        <View style={styles.aboutHeader}>
          <Text style={styles.aboutLogo}>SolQuest</Text>
          <Text style={styles.aboutVersion}>v1.0.0</Text>
        </View>
        <Text style={styles.aboutTagline}>Discover. Explore. Earn.</Text>
        <Text style={styles.aboutDesc}>
          SolQuest helps you discover the best Solana dApps through an engaging, gamified experience. Built for the Solana Seeker.
        </Text>
        <View style={styles.aboutDivider} />
        <View style={styles.aboutBadges}>
          <View style={styles.aboutBadge}>
            <Text style={styles.aboutBadgeText}>Solana Seeker</Text>
          </View>
          <View style={[styles.aboutBadge, { borderColor: '#FF9500' }]}>
            <Text style={[styles.aboutBadgeText, { color: '#FF9500' }]}>MONOLITH Hackathon</Text>
          </View>
          <View style={[styles.aboutBadge, { borderColor: '#14F195' }]}>
            <Text style={[styles.aboutBadgeText, { color: '#14F195' }]}>Solana</Text>
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

  levelCard: {
    marginHorizontal: 16, backgroundColor: '#1a1a2e', borderRadius: 16,
    padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#9945FF44',
  },
  levelTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  levelLabel: { color: '#9945FF', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  levelNumber: { color: '#9945FF', fontSize: 40, fontWeight: 'bold', marginTop: -4 },
  levelRight: { alignItems: 'flex-end' },
  totalXP: { color: '#FFD700', fontSize: 20, fontWeight: 'bold' },
  nextLevel: { color: '#666', fontSize: 11, marginTop: 2 },
  levelBar: { height: 8, backgroundColor: '#0f0f1a', borderRadius: 4, overflow: 'hidden' },
  levelFill: { height: '100%', backgroundColor: '#9945FF', borderRadius: 4 },

  walletBox: {
    marginHorizontal: 16, backgroundColor: '#1a1a2e', borderRadius: 16,
    padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#9945FF44',
    borderStyle: 'dashed', marginBottom: 16,
  },
  walletEmoji: { fontSize: 32, marginBottom: 8 },
  walletTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  walletHint: { color: '#888', fontSize: 12, marginBottom: 12, textAlign: 'center' },
  walletBtn: { backgroundColor: '#9945FF', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 8 },
  walletBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  walletConnected: {
    marginHorizontal: 16, backgroundColor: '#14F19510', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#14F19544', marginBottom: 16,
  },
  walletRow: { flexDirection: 'row', alignItems: 'center' },
  walletConnectedEmoji: { fontSize: 24, marginRight: 12 },
  walletInfo: { flex: 1 },
  walletConnectedTitle: { color: '#14F195', fontSize: 14, fontWeight: 'bold' },
  walletAddressText: { color: '#888', fontSize: 12, marginTop: 2 },
  disconnectBtn: {
    backgroundColor: '#E9456022', borderWidth: 1, borderColor: '#E94560',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5,
  },
  disconnectBtnText: { color: '#E94560', fontSize: 11, fontWeight: 'bold' },

  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },

  activityRow: { flexDirection: 'row', gap: 8 },
  activityCard: {
    flex: 1, backgroundColor: '#1a1a2e', borderRadius: 12,
    padding: 12, alignItems: 'center',
  },
  activityEmoji: { fontSize: 20, marginBottom: 4 },
  activityValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  activityLabel: { color: '#666', fontSize: 10, marginTop: 2 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: {
    backgroundColor: '#1a1a2e', borderRadius: 12, padding: 14,
    width: '48%', flexGrow: 1, alignItems: 'center',
  },
  statNumber: { color: '#9945FF', fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 12, marginTop: 4 },

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
    backgroundColor: '#1a1a2e', borderRadius: 12, padding: 12,
    width: '48%', flexGrow: 1, opacity: 0.5, borderWidth: 1, borderColor: '#222',
  },
  achieveRarityBar: { height: 3, borderRadius: 2, marginBottom: 8 },
  achieveEmoji: { fontSize: 24, marginBottom: 4 },
  achieveTitle: { color: '#888', fontSize: 13, fontWeight: 'bold' },
  achieveDesc: { color: '#555', fontSize: 11, marginTop: 2 },
  achieveRarity: { fontSize: 10, marginTop: 4, fontWeight: 'bold' },

  aboutSection: {
    marginHorizontal: 16, backgroundColor: '#1a1a2e', borderRadius: 16,
    padding: 20, borderWidth: 1, borderColor: '#9945FF33',
  },
  aboutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  aboutLogo: { color: '#9945FF', fontSize: 22, fontWeight: 'bold' },
  aboutVersion: { color: '#666', fontSize: 12 },
  aboutTagline: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  aboutDesc: { color: '#888', fontSize: 13, lineHeight: 20, marginBottom: 16 },
  aboutDivider: { height: 1, backgroundColor: '#333', marginBottom: 16 },
  aboutBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  aboutBadge: { borderWidth: 1, borderColor: '#9945FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  aboutBadgeText: { color: '#9945FF', fontSize: 11, fontWeight: 'bold' },

  resetBtn: {
    marginHorizontal: 16, marginTop: 16, backgroundColor: '#E9456022',
    borderWidth: 1, borderColor: '#E94560', borderRadius: 12, padding: 14, alignItems: 'center',
  },
  resetBtnText: { color: '#E94560', fontSize: 14, fontWeight: 'bold' },
});