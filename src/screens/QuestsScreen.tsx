import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Modal, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

const XP_PER_LEVEL = 800;

interface QuestDef {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: string;
  type: 'daily' | 'weekly' | 'special';
  claimable?: boolean; // requires manual "I did it" button
}

const DAILY_QUESTS: QuestDef[] = [
  { id: 'd1', title: 'GM Check-in', description: 'Say GM to Solana (costs 5 SKR)', xp: 50, icon: '☀️', type: 'daily' },
  { id: 'd2', title: 'Swipe Session', description: 'Swipe through 5 projects today', xp: 20, icon: '👆', type: 'daily' },
  { id: 'd3', title: 'Solana Runner', description: 'Score 30+ in Solana Runner', xp: 30, icon: '🏃', type: 'daily' },
  { id: 'd4', title: 'Daily Swap', description: 'Make a swap on Seeker wallet', xp: 15, icon: '🔄', type: 'daily', claimable: true },
  { id: 'd5', title: 'Daily SKR Stake', description: 'Stake SKR on Seeker wallet', xp: 25, icon: '💎', type: 'daily', claimable: true },
];

const WEEKLY_QUESTS: QuestDef[] = [
  { id: 'w1', title: '7-Day GM Streak', description: 'Maintain a 7-day GM streak', xp: 500, icon: '🔥', type: 'weekly' },
  { id: 'w2', title: 'Collector', description: 'Save 15 projects total', xp: 200, icon: '🔖', type: 'weekly' },
  { id: 'w3', title: 'High Scorer', description: 'Score 200+ in Solana Runner', xp: 300, icon: '🎮', type: 'weekly' },
  { id: 'w4', title: 'Swap Streak', description: 'Swap 7 days in a row', xp: 200, icon: '🔄', type: 'weekly' },
  { id: 'w5', title: 'Stake Streak', description: 'Stake SKR 7 days in a row', xp: 250, icon: '💎', type: 'weekly' },
  { id: 'w6', title: 'SKR Believer', description: 'Stake 140+ SKR total this week', xp: 350, icon: '🚀', type: 'weekly' },
];

const SPECIAL_QUESTS: QuestDef[] = [
  { id: 's1', title: 'Connect Wallet', description: 'Link your Solana wallet to SolQuest', xp: 100, icon: '🔗', type: 'special' },
  { id: 's2', title: 'Explorer', description: 'Review every project in SolQuest', xp: 500, icon: '🏆', type: 'special' },
  { id: 's3', title: 'Rate SolQuest', description: 'Leave a review on the dApp Store', xp: 300, icon: '⭐', type: 'special' },
  { id: 's4', title: 'SOL Validator OG', description: 'Stake 2+ SOL on Solana Mobile validator', xp: 1500, icon: '🏛️', type: 'special', claimable: true },
];

export default function QuestsScreen() {
  const {
    xp, gmClaimedToday, todaySwipes, todayGameBest,
    gmStreak, savedProjects, walletAddress, currentIndex, gameHighScore,
    totalProjects, todaySwapDone, todayStakeDone, weekSwapDays,
    weekStakeDays, weekStakeTotal, solStaked,
    claimSwap, claimStake, claimSolStake,
  } = useApp();

  const [filter, setFilter] = useState<'daily' | 'weekly' | 'special'>('daily');
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [pendingClaimId, setPendingClaimId] = useState<string | null>(null);

  const getQuestStatus = (quest: QuestDef): { completed: boolean; progress: string } => {
    switch (quest.id) {
      // Daily — auto
      case 'd1': return { completed: gmClaimedToday, progress: gmClaimedToday ? 'Done!' : 'Say GM' };
      case 'd2': return { completed: todaySwipes >= 5, progress: `${Math.min(todaySwipes, 5)}/5` };
      case 'd3': return { completed: todayGameBest >= 30, progress: todayGameBest >= 30 ? 'Done!' : `Best: ${todayGameBest}` };
      // Daily — manual
      case 'd4': return { completed: todaySwapDone, progress: todaySwapDone ? 'Done!' : 'Tap to claim' };
      case 'd5': return { completed: todayStakeDone, progress: todayStakeDone ? 'Done!' : 'Tap to claim' };

      // Weekly
      case 'w1': return { completed: gmStreak >= 7, progress: `${Math.min(gmStreak, 7)}/7 days` };
      case 'w2': return { completed: savedProjects.length >= 15, progress: `${Math.min(savedProjects.length, 15)}/15` };
      case 'w3': return { completed: gameHighScore >= 200, progress: gameHighScore >= 200 ? 'Done!' : `Best: ${gameHighScore}` };
      case 'w4': return { completed: weekSwapDays >= 7, progress: `${Math.min(weekSwapDays, 7)}/7 days` };
      case 'w5': return { completed: weekStakeDays >= 7, progress: `${Math.min(weekStakeDays, 7)}/7 days` };
      case 'w6': return { completed: weekStakeTotal >= 140, progress: `${Math.min(weekStakeTotal, 140)}/140 SKR` };

      // Special
      case 's1': return { completed: !!walletAddress, progress: walletAddress ? 'Connected!' : 'Not connected' };
      case 's2': return { completed: currentIndex >= totalProjects, progress: `${Math.min(currentIndex, totalProjects)}/${totalProjects}` };
      case 's3': return { completed: false, progress: 'Tap to rate' };
      case 's4': return { completed: solStaked, progress: solStaked ? 'Done!' : 'Tap to claim' };

      default: return { completed: false, progress: '' };
    }
  };

  const handleQuestPress = (quest: QuestDef) => {
    const { completed } = getQuestStatus(quest);
    if (completed) return;

    if (quest.id === 's3') {
      Linking.openURL('https://solquest.app').catch(() => {});
      return;
    }

    // Manual claim quests
    if (quest.id === 'd4' && !todaySwapDone) {
      Alert.alert(
        '🔄 Daily Swap',
        'Did you make a swap on the Seeker wallet today?',
        [
          { text: 'Not yet', style: 'cancel' },
          { text: 'Yes, I did it!', onPress: () => claimSwap() },
        ]
      );
      return;
    }

    if (quest.id === 'd5' && !todayStakeDone) {
      setPendingClaimId('d5');
      setStakeAmount('');
      setShowStakeModal(true);
      return;
    }

    if (quest.id === 's4' && !solStaked) {
      Alert.alert(
        '🏛️ SOL Validator OG',
        'Did you stake 2+ SOL on the Solana Mobile validator via Seeker wallet?',
        [
          { text: 'Not yet', style: 'cancel' },
          { text: 'Yes, I did it!', onPress: () => claimSolStake() },
        ]
      );
      return;
    }
  };

  const handleStakeConfirm = () => {
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid SKR amount.');
      return;
    }
    claimStake(amount);
    setShowStakeModal(false);
    setStakeAmount('');
    setPendingClaimId(null);
  };

  const getQuests = () => {
    if (filter === 'daily') return DAILY_QUESTS;
    if (filter === 'weekly') return WEEKLY_QUESTS;
    return SPECIAL_QUESTS;
  };

  const filtered = getQuests();
  const completedCount = filtered.filter(q => getQuestStatus(q).completed).length;
  const totalCount = filtered.length;

  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInLevel = xp % XP_PER_LEVEL;

  const getTypeLabel = () => {
    if (filter === 'daily') return 'Resets every day';
    if (filter === 'weekly') return 'Resets every Monday';
    return 'One-time rewards';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quests</Text>

      <View style={styles.levelRow}>
        <View style={styles.levelLeft}>
          <Text style={styles.levelText}>Level {level}</Text>
          <View style={styles.levelBar}>
            <View style={[styles.levelFill, { width: `${(xpInLevel / XP_PER_LEVEL) * 100}%` }]} />
          </View>
          <Text style={styles.levelXP}>{xpInLevel}/{XP_PER_LEVEL} XP to next level</Text>
        </View>
        <View style={styles.totalXPBox}>
          <Text style={styles.totalXPNumber}>{xp}</Text>
          <Text style={styles.totalXPLabel}>Total XP</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setFilter('daily')} style={[styles.tab, filter === 'daily' && styles.tabActive]}>
          <Text style={[styles.tabText, filter === 'daily' && styles.tabTextActive]}>Daily</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('weekly')} style={[styles.tab, filter === 'weekly' && styles.tabActive]}>
          <Text style={[styles.tabText, filter === 'weekly' && styles.tabTextActive]}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('special')} style={[styles.tab, filter === 'special' && styles.tabActive]}>
          <Text style={[styles.tabText, filter === 'special' && styles.tabTextActive]}>Special</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }]} />
        </View>
        <Text style={styles.progressText}>{completedCount}/{totalCount}</Text>
      </View>
      <Text style={styles.typeLabel}>{getTypeLabel()}</Text>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map(quest => {
          const { completed, progress } = getQuestStatus(quest);
          const isClaimable = quest.claimable && !completed;
          return (
            <TouchableOpacity
              key={quest.id}
              style={[styles.questCard, completed && styles.questDone, isClaimable && styles.questClaimable]}
              onPress={() => handleQuestPress(quest)}
              activeOpacity={0.7}
            >
              <View style={styles.questLeft}>
                <View style={[styles.questIconBox, completed && styles.questIconBoxDone]}>
                  <Text style={styles.questIcon}>{completed ? '✅' : quest.icon}</Text>
                </View>
                <View style={styles.questInfo}>
                  <Text style={[styles.questTitle, completed && styles.questTitleDone]}>{quest.title}</Text>
                  <Text style={styles.questDesc}>{quest.description}</Text>
                  <Text style={[styles.questProgress, completed && styles.questProgressDone]}>
                    {isClaimable ? '👆 Tap to claim' : progress}
                  </Text>
                </View>
              </View>
              <View style={[styles.xpBadge, completed && styles.xpBadgeDone]}>
                <Text style={[styles.questXP, completed && styles.questXPDone]}>+{quest.xp}</Text>
                <Text style={[styles.questXPLabel, completed && styles.questXPDone]}>XP</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* On-chain notice */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeIcon}>🔮</Text>
          <Text style={styles.noticeText}>
            Swap & stake quests use honor system for now.{'\n'}
            On-chain verification coming post-hackathon!
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Stake Amount Modal */}
      <Modal visible={showStakeModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowStakeModal(false)}>
          <View style={styles.stakeModal}>
            <Text style={styles.stakeModalEmoji}>💎</Text>
            <Text style={styles.stakeModalTitle}>How much SKR did you stake?</Text>
            <TextInput
              style={styles.stakeInput}
              placeholder="Enter SKR amount"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={stakeAmount}
              onChangeText={setStakeAmount}
              autoFocus
            />
            <TouchableOpacity style={styles.stakeBtn} onPress={handleStakeConfirm}>
              <Text style={styles.stakeBtnText}>Confirm Stake</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowStakeModal(false)} style={styles.stakeClose}>
              <Text style={styles.stakeCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 60 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 12 },
  levelRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
    gap: 12,
  },
  levelLeft: { flex: 1 },
  levelText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  levelBar: {
    height: 8,
    backgroundColor: '#1a1a2e',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  levelFill: { height: '100%', backgroundColor: '#9945FF', borderRadius: 4 },
  levelXP: { color: '#888', fontSize: 11 },
  totalXPBox: {
    backgroundColor: '#9945FF15',
    borderWidth: 1,
    borderColor: '#9945FF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 70,
  },
  totalXPNumber: { color: '#9945FF', fontSize: 22, fontWeight: 'bold' },
  totalXPLabel: { color: '#888', fontSize: 10, marginTop: 2 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  tabActive: { backgroundColor: '#9945FF22', borderColor: '#9945FF' },
  tabText: { color: '#888', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#9945FF' },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 4,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#1a1a2e',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#9945FF', borderRadius: 3 },
  progressText: { color: '#888', fontSize: 12 },
  typeLabel: { color: '#666', fontSize: 11, paddingHorizontal: 20, marginBottom: 10 },
  list: { paddingHorizontal: 16 },
  questCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  questDone: { borderColor: '#14F19544', backgroundColor: '#14F19508' },
  questClaimable: { borderColor: '#FF950066', borderStyle: 'dashed' },
  questLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  questIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#0f0f1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questIconBoxDone: { backgroundColor: '#14F19522' },
  questIcon: { fontSize: 20 },
  questInfo: { flex: 1 },
  questTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  questTitleDone: { color: '#14F195' },
  questDesc: { color: '#888', fontSize: 11, marginTop: 2 },
  questProgress: { color: '#9945FF', fontSize: 11, marginTop: 3, fontWeight: '600' },
  questProgressDone: { color: '#14F195' },
  xpBadge: {
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    marginLeft: 8,
  },
  xpBadgeDone: { backgroundColor: '#14F19522' },
  questXP: { color: '#666', fontSize: 14, fontWeight: 'bold' },
  questXPLabel: { color: '#666', fontSize: 9 },
  questXPDone: { color: '#14F195' },

  // Notice box
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9945FF11',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#9945FF33',
    gap: 10,
  },
  noticeIcon: { fontSize: 20 },
  noticeText: { color: '#888', fontSize: 11, flex: 1, lineHeight: 16 },

  // Stake modal
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000CC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  stakeModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9945FF44',
  },
  stakeModalEmoji: { fontSize: 48, marginBottom: 12 },
  stakeModalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  stakeInput: {
    backgroundColor: '#0f0f1a',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 18,
    width: '100%',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  stakeBtn: {
    backgroundColor: '#9945FF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  stakeBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  stakeClose: { paddingVertical: 8 },
  stakeCloseText: { color: '#666', fontSize: 14 },
});