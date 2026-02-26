import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import MiniGame from '../components/MiniGame';
import { projects } from '../data/projects';
import { useApp } from '../context/AppContext';

export default function HomeScreen() {
  const {
    currentIndex, skipProject, saveProject, savedProjects,
    gmStreak, gmClaimedToday, claimGM, walletAddress, connectWallet,
    xp, resetCards,
  } = useApp();

  const [showGmModal, setShowGmModal] = useState(false);
  const [gmLoading, setGmLoading] = useState(false);
  const [gmResult, setGmResult] = useState<{ success: boolean; message: string } | null>(null);

  const currentProject = projects[currentIndex];
  const nextProject = projects[currentIndex + 1];

  const level = Math.floor(xp / 800) + 1;

  const handleGmPress = () => {
    setGmResult(null);
    setShowGmModal(true);
  };

  const handleClaimGm = async () => {
    setGmLoading(true);
    const result = await claimGM();
    setGmResult(result);
    setGmLoading(false);
  };

  const handleConnectAndClaim = async () => {
    setGmLoading(true);
    await connectWallet();
    setGmLoading(false);
  };

  return (
    <ScrollView style={styles.container} bounces={false}>
      <StatusBar style="light" />

      <View style={styles.topBar}>
        <Text style={styles.logo}>SolQuest</Text>
        <TouchableOpacity
          onPress={handleGmPress}
          style={[
            styles.streakBox,
            gmClaimedToday && styles.streakBoxDone,
          ]}
        >
          <Text style={[styles.streakText, gmClaimedToday && styles.streakTextDone]}>
            {gmClaimedToday ? `✅ GM Day ${gmStreak}` : `☀️ Say GM`}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.subBar}>
        <Text style={styles.counter}>{Math.min(currentIndex + 1, projects.length)}/{projects.length} projects</Text>
        <Text style={styles.levelText}>Lvl {level} · {xp} XP</Text>
        <Text style={styles.savedText}>{savedProjects.length} saved</Text>
      </View>

      {currentProject ? (
        <>
          <View style={styles.cardStack}>
            {nextProject && (
              <View style={styles.nextCard}>
                <View style={[styles.nextCardInner, { borderColor: nextProject.color }]}>
                  <Text style={styles.nextIcon}>{nextProject.icon}</Text>
                  <Text style={styles.nextName}>{nextProject.name}</Text>
                </View>
              </View>
            )}
            <ProjectCard
              key={currentProject.id}
              project={currentProject}
              onSwipeLeft={skipProject}
              onSwipeRight={() => saveProject(currentProject)}
            />
          </View>
          <MiniGame />
        </>
      ) : (
        <View style={styles.done}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneText}>You have seen all projects!</Text>
          <Text style={styles.savedCount}>{savedProjects.length} projects saved</Text>
          <TouchableOpacity style={styles.resetBtn} onPress={resetCards}>
            <Text style={styles.resetText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* GM Modal */}
      <Modal visible={showGmModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => !gmLoading && setShowGmModal(false)}>
          <View style={styles.gmModal}>
            <Text style={styles.gmModalEmoji}>{gmClaimedToday ? '✅' : '☀️'}</Text>
            <Text style={styles.gmModalTitle}>
              {gmClaimedToday ? `GM Claimed! Day ${gmStreak}` : 'Say GM to Solana!'}
            </Text>

            {!walletAddress && !gmResult && (
              <>
                <Text style={styles.gmModalDesc}>Connect your wallet first to claim your daily GM.</Text>
                <TouchableOpacity style={styles.gmBtn} onPress={handleConnectAndClaim} disabled={gmLoading}>
                  {gmLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.gmBtnText}>Connect Wallet</Text>}
                </TouchableOpacity>
              </>
            )}

            {walletAddress && !gmClaimedToday && !gmResult && (
              <>
                <Text style={styles.gmModalDesc}>
                  Sign a tiny transaction (0.000005 SOL) to prove your daily GM.{'\n'}
                  Streak bonus: +{50 * (gmStreak + 1)} XP!
                </Text>
                <TouchableOpacity style={styles.gmBtn} onPress={handleClaimGm} disabled={gmLoading}>
                  {gmLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.gmBtnText}>☀️ Claim GM</Text>}
                </TouchableOpacity>
              </>
            )}

            {gmClaimedToday && !gmResult && (
              <Text style={styles.gmModalDesc}>
                Come back tomorrow to keep your streak going!{'\n'}
                Current streak: {gmStreak} day{gmStreak > 1 ? 's' : ''} 🔥
              </Text>
            )}

            {gmResult && (
              <View style={[styles.gmResultBox, gmResult.success ? styles.gmSuccess : styles.gmFail]}>
                <Text style={styles.gmResultText}>{gmResult.message}</Text>
              </View>
            )}

            <TouchableOpacity onPress={() => setShowGmModal(false)} style={styles.gmClose}>
              <Text style={styles.gmCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 60 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  logo: { color: '#9945FF', fontSize: 24, fontWeight: 'bold' },
  streakBox: {
    backgroundColor: '#FF950022',
    borderWidth: 1,
    borderColor: '#FF9500',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  streakBoxDone: {
    backgroundColor: '#14F19522',
    borderColor: '#14F195',
  },
  streakText: { color: '#FF9500', fontSize: 13, fontWeight: 'bold' },
  streakTextDone: { color: '#14F195' },
  subBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  counter: { color: '#666', fontSize: 13 },
  levelText: { color: '#FFD700', fontSize: 13, fontWeight: '600' },
  savedText: { color: '#9945FF', fontSize: 13 },
  cardStack: {
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 420,
  },
  nextCard: {
    position: 'absolute',
    top: 8,
    width: '95%',
    opacity: 0.5,
  },
  nextCardInner: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  nextIcon: { fontSize: 28 },
  nextName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  done: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  doneEmoji: { fontSize: 64, marginBottom: 16 },
  doneText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  savedCount: { color: '#9945FF', fontSize: 16, marginTop: 8 },
  resetBtn: {
    marginTop: 24,
    backgroundColor: '#9945FF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resetText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  bottomPadding: { height: 100 },

  // GM Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000CC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  gmModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF950044',
  },
  gmModalEmoji: { fontSize: 48, marginBottom: 12 },
  gmModalTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  gmModalDesc: { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  gmBtn: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  gmBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  gmResultBox: {
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginBottom: 12,
  },
  gmSuccess: { backgroundColor: '#14F19522', borderWidth: 1, borderColor: '#14F195' },
  gmFail: { backgroundColor: '#E9456022', borderWidth: 1, borderColor: '#E94560' },
  gmResultText: { color: '#fff', fontSize: 14, textAlign: 'center', fontWeight: '600' },
  gmClose: { paddingVertical: 8 },
  gmCloseText: { color: '#666', fontSize: 14 },
});