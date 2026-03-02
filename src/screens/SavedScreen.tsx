import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Modal, Image, Alert } from 'react-native';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Project } from '../data/projects';

// Extract Android package name from dApp Store link
// e.g. "solanadappstore://details?id=app.phantom" => "app.phantom"
function getPackageName(dappStoreLink: string | null): string | null {
  if (!dappStoreLink) return null;
  const match = dappStoreLink.match(/id=([^&]+)/);
  return match ? match[1] : null;
}

export default function SavedScreen() {
  const { savedProjects } = useApp();
  const [filter, setFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categories = ['All', ...new Set(savedProjects.map(p => p.category))];
  const filtered = filter === 'All' ? savedProjects : savedProjects.filter(p => p.category === filter);

  // Try to open the app directly, fallback to dApp Store, then website
  const openApp = (project: Project) => {
  const packageName = getPackageName(project.dappStoreLink);

  if (packageName) {
    Linking.openURL(`android-app://${packageName}`);
  } else {
    Linking.openURL(project.link);
  }
};

  // Leave a Review always opens the dApp Store page
  const openReview = (project: Project) => {
    if (project.dappStoreLink) {
      Linking.openURL(project.dappStoreLink).catch(() => {
        Linking.openURL(project.link);
      });
    } else {
      Linking.openURL(project.link);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Projects</Text>
      <Text style={styles.subtitle}>{savedProjects.length} projects saved</Text>

      {savedProjects.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyText}>No projects saved yet</Text>
          <Text style={styles.emptyHint}>Swipe right on Discover to save projects!</Text>
        </View>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setFilter(cat)}
                style={[styles.filterBtn, filter === cat && styles.filterBtnActive]}
              >
                <Text style={[styles.filterText, filter === cat && styles.filterTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {filtered.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[styles.card, { borderLeftColor: project.color, borderLeftWidth: 3 }]}
                onPress={() => setSelectedProject(project)}
                activeOpacity={0.7}
              >
                <View style={styles.cardTop}>
                  {project.logo ? (
                    <Image source={project.logo} style={styles.cardLogo} />
                  ) : (
                    <Text style={styles.cardIcon}>{project.icon}</Text>
                  )}
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{project.name}</Text>
                    <View style={styles.cardBadges}>
                      <Text style={[styles.cardCategory, { color: project.color }]}>{project.category}</Text>
                      {project.isSeeker && <Text style={styles.seekerTag}>Seeker</Text>}
                    </View>
                  </View>
                  <Text style={styles.cardArrow}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
            <View style={{ height: 100 }} />
          </ScrollView>
        </>
      )}

      <Modal visible={selectedProject !== null} animationType="slide" transparent>
        {selectedProject && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  {selectedProject.logo ? (
                    <Image source={selectedProject.logo} style={styles.modalLogo} />
                  ) : (
                    <Text style={styles.modalIcon}>{selectedProject.icon}</Text>
                  )}
                  <TouchableOpacity onPress={() => setSelectedProject(null)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {selectedProject.isSeeker && (
                  <View style={styles.seekerBadgeBig}>
                    <Text style={styles.seekerBadgeText}>Seeker dApp Store</Text>
                  </View>
                )}

                <Text style={styles.modalName}>{selectedProject.name}</Text>

                <View style={styles.modalBadges}>
                  <View style={[styles.modalBadge, { backgroundColor: selectedProject.color + '33' }]}>
                    <Text style={[styles.modalBadgeText, { color: selectedProject.color }]}>{selectedProject.category}</Text>
                  </View>
                  <View style={[styles.modalBadge, { backgroundColor: '#333' }]}>
                    <Text style={styles.modalBadgeText}>{selectedProject.difficulty}</Text>
                  </View>
                </View>

                <Text style={styles.modalDesc}>{selectedProject.description}</Text>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Reward</Text>
                  <View style={styles.modalReward}>
                    <Text style={styles.modalRewardText}>{selectedProject.reward}</Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Things to do</Text>
                  <View style={styles.todoItem}>
                    <Text style={styles.todoCheck}>○</Text>
                    <Text style={styles.todoText}>Visit {selectedProject.name} and create an account</Text>
                  </View>
                  <View style={styles.todoItem}>
                    <Text style={styles.todoCheck}>○</Text>
                    <Text style={styles.todoText}>Complete your first action on the platform</Text>
                  </View>
                  {selectedProject.isSeeker && (
                    <>
                      <View style={styles.todoItem}>
                        <Text style={styles.todoCheck}>○</Text>
                        <Text style={styles.todoText}>Use the app directly from your Seeker</Text>
                      </View>
                      <View style={styles.todoItem}>
                        <Text style={styles.todoCheck}>⭐</Text>
                        <Text style={styles.todoTextHighlight}>Leave a review on the dApp Store</Text>
                      </View>
                    </>
                  )}
                  {selectedProject.category === 'DeFi' && (
                    <View style={styles.todoItem}>
                      <Text style={styles.todoCheck}>○</Text>
                      <Text style={styles.todoText}>Make your first swap or deposit</Text>
                    </View>
                  )}
                  {selectedProject.category === 'Game' && (
                    <View style={styles.todoItem}>
                      <Text style={styles.todoCheck}>○</Text>
                      <Text style={styles.todoText}>Play your first game and earn rewards</Text>
                    </View>
                  )}
                  {selectedProject.category === 'NFT' && (
                    <View style={styles.todoItem}>
                      <Text style={styles.todoCheck}>○</Text>
                      <Text style={styles.todoText}>Browse collections and make your first bid</Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: selectedProject.color + '22', borderColor: selectedProject.color }]}
                    onPress={() => openApp(selectedProject)}
                  >
                    <Text style={[styles.actionBtnText, { color: selectedProject.color }]}>
                      {selectedProject.isSeeker ? '🚀 Open App' : '🌐 Visit Website'}
                    </Text>
                  </TouchableOpacity>

                  {selectedProject.isSeeker && (
                    <TouchableOpacity
                      style={styles.reviewBtn}
                      onPress={() => openReview(selectedProject)}
                    >
                      <Text style={styles.reviewBtnText}>⭐ Leave a Review</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.modalLink}>
                  <Text style={styles.modalLinkText}>{selectedProject.link}</Text>
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', paddingTop: 60 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', paddingHorizontal: 20 },
  subtitle: { color: '#9945FF', fontSize: 14, paddingHorizontal: 20, marginTop: 4, marginBottom: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  emptyHint: { color: '#888', fontSize: 14, marginTop: 8 },
  filters: { paddingHorizontal: 16, marginBottom: 12, maxHeight: 36 },
  filterBtn: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterBtnActive: { backgroundColor: '#9945FF22', borderColor: '#9945FF' },
  filterText: { color: '#888', fontSize: 13 },
  filterTextActive: { color: '#9945FF', fontWeight: 'bold' },
  list: { paddingHorizontal: 16 },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLogo: { width: 36, height: 36, borderRadius: 8, marginRight: 10 },
  cardIcon: { fontSize: 28, marginRight: 10 },
  cardInfo: { flex: 1 },
  cardName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cardBadges: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  cardCategory: { fontSize: 12, fontWeight: '600' },
  seekerTag: { color: '#14F195', fontSize: 10, fontWeight: 'bold', backgroundColor: '#14F19522', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  cardArrow: { color: '#666', fontSize: 28 },

  modalOverlay: { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#0f0f1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderColor: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalLogo: { width: 64, height: 64, borderRadius: 16 },
  modalIcon: { fontSize: 56 },
  closeBtn: {
    backgroundColor: '#1a1a2e',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: '#888', fontSize: 18 },
  seekerBadgeBig: {
    backgroundColor: '#14F19522',
    borderWidth: 1,
    borderColor: '#14F195',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  seekerBadgeText: { color: '#14F195', fontSize: 13, fontWeight: 'bold' },
  modalName: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  modalBadges: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  modalBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  modalBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  modalDesc: { color: '#aaa', fontSize: 15, lineHeight: 22, marginBottom: 20 },
  modalSection: { marginBottom: 20 },
  modalSectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  modalReward: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 12 },
  modalRewardText: { color: '#9945FF', fontSize: 14, fontWeight: 'bold' },
  todoItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  todoCheck: { color: '#9945FF', fontSize: 16, marginTop: 1 },
  todoText: { color: '#aaa', fontSize: 14, flex: 1, lineHeight: 20 },
  todoTextHighlight: { color: '#FF9500', fontSize: 14, flex: 1, fontWeight: '600', lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1 },
  actionBtnText: { fontSize: 14, fontWeight: 'bold' },
  reviewBtn: {
    flex: 1,
    backgroundColor: '#FF950015',
    borderWidth: 1,
    borderColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  reviewBtnText: { color: '#FF9500', fontSize: 14, fontWeight: 'bold' },
  modalLink: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 10, alignItems: 'center', marginBottom: 20 },
  modalLinkText: { color: '#666', fontSize: 12 },
});