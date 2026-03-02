import { View, Text, StyleSheet, Dimensions, Animated, PanResponder, Image, Vibration } from 'react-native';
import { useRef, useEffect, useState } from 'react';
import { Project } from '../data/projects';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

const QUOTES = [
  "Consistency is key 🔑",
  "Every day counts 📅",
  "Build in silence, let success make noise 🤫",
  "The harvest comes at the end 🌾",
  "Small steps, big results 👣",
  "Stay focused, stay grinding 💪",
  "Trust the process 🎯",
  "Fortune favors the bold 🍀",
  "Discipline beats motivation ⚡",
  "WAGMI 🤝",
  "Diamond hands always win 💎",
  "The best time to start was yesterday ⏰",
  "One day or day one, you decide 🔥",
  "The musicians get paid at the end of the ball 🎵",
  "Your future self will thank you 🙏",
  "Winners never quit 🏆",
  "Stack daily, shine forever ✨",
];

interface Props {
  project: Project;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export default function ProjectCard({ project, onSwipeLeft, onSwipeRight }: Props) {
  const pan = useRef(new Animated.ValueXY()).current;
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const quoteScale = useRef(new Animated.Value(0.5)).current;
  const quoteFade = useRef(new Animated.Value(0)).current;
  const [flashColor, setFlashColor] = useState('#6CBF6C');
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.8, duration: 900, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: false }),
      ])
    ).start();

    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(quoteScale, { toValue: 1, friction: 6, useNativeDriver: false }),
        Animated.timing(quoteFade, { toValue: 1, duration: 400, useNativeDriver: false }),
      ]),
    ]).start();
  }, []);

  const triggerFlash = (color: string) => {
    setFlashColor(color);
    flashOpacity.setValue(0.4);
    Animated.timing(flashOpacity, { toValue: 0, duration: 400, useNativeDriver: false }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 5,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          triggerFlash('#6CBF6C');
          Vibration.vibrate(50); // Haptic on save
          Animated.timing(pan.x, { toValue: width * 1.5, duration: 300, useNativeDriver: false }).start(() => onSwipeRight());
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          triggerFlash('#E94560');
          Vibration.vibrate(30); // Lighter haptic on skip
          Animated.timing(pan.x, { toValue: -width * 1.5, duration: 300, useNativeDriver: false }).start(() => onSwipeLeft());
        } else {
          Animated.spring(pan.x, { toValue: 0, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  const rotate = pan.x.interpolate({ inputRange: [-width, 0, width], outputRange: ['-15deg', '0deg', '15deg'] });
  const skipOpacity = pan.x.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const exploreOpacity = pan.x.interpolate({ inputRange: [0, SWIPE_THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <View>
      <Animated.View style={[styles.quoteBox, { opacity: quoteFade, transform: [{ scale: quoteScale }] }]}>
        <Text style={styles.quoteText}>{quote}</Text>
      </Animated.View>

      <Animated.View style={[styles.flash, { backgroundColor: flashColor, opacity: flashOpacity }]} pointerEvents="none" />

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.card, { borderColor: project.color, transform: [{ translateX: pan.x }, { rotate }] }]}
      >
        <Animated.View style={[styles.labelLeft, { opacity: skipOpacity }]}>
          <Text style={styles.labelLeftText}>SKIP</Text>
        </Animated.View>
        <Animated.View style={[styles.labelRight, { opacity: exploreOpacity }]}>
          <Text style={styles.labelRightText}>EXPLORE</Text>
        </Animated.View>

        {project.isSeeker && (
          <View style={styles.seekerBadge}>
            <Text style={styles.seekerText}>Seeker dApp Store</Text>
          </View>
        )}

        <View style={styles.header}>
          {project.logo ? (
            <Image source={project.logo} style={styles.logo} />
          ) : (
            <Text style={styles.icon}>{project.icon}</Text>
          )}
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: project.color + '33' }]}>
              <Text style={[styles.badgeText, { color: project.color }]}>{project.category}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#333' }]}>
              <Text style={styles.badgeText}>{project.difficulty}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.name}>{project.name}</Text>
        <Text style={styles.description}>{project.description}</Text>

        <View style={styles.rewardBox}>
          <Text style={styles.rewardLabel}>Reward</Text>
          <Text style={styles.rewardText}>{project.reward}</Text>
        </View>

        <View style={styles.linkBox}>
          <Text style={styles.linkLabel}>{project.link}</Text>
        </View>

        <Animated.View style={[styles.tutorial, { opacity: pulseAnim }]}>
          <View style={styles.tutorialRow}>
            <View style={styles.tutorialArrowLeft}>
              <Text style={styles.tutorialArrowTextRed}>SKIP</Text>
            </View>
            <Text style={styles.tutorialSwipe}>SWIPE</Text>
            <View style={styles.tutorialArrowRight}>
              <Text style={styles.tutorialArrowTextGreen}>SAVE</Text>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  quoteBox: {
    backgroundColor: '#9945FF15',
    borderWidth: 1,
    borderColor: '#9945FF44',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteText: { color: '#9945FF', fontSize: 13, fontWeight: '600', fontStyle: 'italic', textAlign: 'center' },
  flash: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    zIndex: 100,
  },
  card: {
    width: width - 32,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    alignSelf: 'center',
  },
  labelLeft: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#E94560',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 10,
  },
  labelLeftText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  labelRight: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#6CBF6C',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 10,
  },
  labelRightText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  seekerBadge: {
    backgroundColor: '#14F19522',
    borderWidth: 1,
    borderColor: '#14F195',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  seekerText: { color: '#14F195', fontSize: 12, fontWeight: 'bold' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  icon: { fontSize: 48 },
  badges: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  name: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  description: { color: '#aaa', fontSize: 15, lineHeight: 22, marginBottom: 16 },
  rewardBox: {
    backgroundColor: '#0f0f1a',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rewardLabel: { color: '#888', fontSize: 14 },
  rewardText: { color: '#9945FF', fontSize: 14, fontWeight: 'bold' },
  linkBox: {
    backgroundColor: '#0f0f1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  linkLabel: { color: '#666', fontSize: 13 },
  tutorial: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9945FF',
    backgroundColor: '#9945FF15',
  },
  tutorialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  tutorialArrowLeft: {
    backgroundColor: '#E9456033',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E94560',
  },
  tutorialArrowTextRed: { color: '#E94560', fontSize: 14, fontWeight: 'bold' },
  tutorialSwipe: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  tutorialArrowRight: {
    backgroundColor: '#6CBF6C33',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#6CBF6C',
  },
  tutorialArrowTextGreen: { color: '#6CBF6C', fontSize: 14, fontWeight: 'bold' },
});