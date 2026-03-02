import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const PAGES = [
  {
    emoji: '🧭',
    title: 'Discover Solana',
    description: 'Swipe through curated Solana projects.\nRight to save, left to skip.',
    accent: '#9945FF',
    bgEmoji: '👆',
  },
  {
    emoji: '⚔️',
    title: 'Complete Quests',
    description: 'Daily, weekly & special quests.\nEarn XP and level up your profile.',
    accent: '#14F195',
    bgEmoji: '🏆',
  },
  {
    emoji: '☀️',
    title: 'Say GM On-Chain',
    description: 'Connect your wallet, claim your daily GM.\nBuild streaks, earn rewards.',
    accent: '#FF9500',
    bgEmoji: '🔥',
  },
];

interface Props {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const emojiSpin = useRef(new Animated.Value(0)).current;

  // Animate in on mount and page change
  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    scaleAnim.setValue(0.5);
    emojiSpin.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(emojiSpin, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  };

  useState(() => { animateIn(); });

  const goToNext = () => {
    if (currentPage < PAGES.length - 1) {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setCurrentPage(prev => prev + 1);
        animateIn();
      });
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem('onboardingDone', 'true');
    onComplete();
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboardingDone', 'true');
    onComplete();
  };

  const page = PAGES[currentPage];
  const isLast = currentPage === PAGES.length - 1;

  const spin = emojiSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container]}>
      {/* Background decoration */}
      <Text style={[styles.bgEmoji, { opacity: 0.03 }]}>{page.bgEmoji}</Text>

      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <Animated.View style={[styles.content, {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }]}>
        {/* Emoji with animation */}
        <Animated.View style={[styles.emojiContainer, {
          transform: [{ scale: scaleAnim }, { rotate: spin }],
          borderColor: page.accent + '44',
        }]}>
          <Text style={styles.emoji}>{page.emoji}</Text>
        </Animated.View>

        {/* Glow effect */}
        <View style={[styles.glow, { backgroundColor: page.accent, shadowColor: page.accent }]} />

        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.description}>{page.description}</Text>
      </Animated.View>

      {/* Bottom section */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {PAGES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentPage && [styles.dotActive, { backgroundColor: page.accent }],
              ]}
            />
          ))}
        </View>

        {/* Button */}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: page.accent }]}
          onPress={goToNext}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>
            {isLast ? "Let's Quest! 🚀" : 'Next'}
          </Text>
        </TouchableOpacity>

        {/* Branding */}
        <Text style={styles.brand}>SolQuest × Solana Seeker</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgEmoji: {
    position: 'absolute',
    fontSize: 300,
    top: height * 0.15,
    alignSelf: 'center',
  },
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff11',
    borderRadius: 20,
  },
  skipText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 24,
  },
  emoji: {
    fontSize: 56,
  },
  glow: {
    position: 'absolute',
    top: 30,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.15,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  description: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
  },
  bottom: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  dots: {
    flexDirection: 'row',
    marginBottom: 28,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
  },
  btn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  brand: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
});