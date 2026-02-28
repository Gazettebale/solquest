import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const GAME_WIDTH = width - 32;
const GAME_HEIGHT = 140;
const PLAYER_LEFT = 40;
const PLAYER_SIZE = 28;
const OBSTACLE_SIZE = 24;
const TICK = 20;

const CHARACTERS = ['🚀', '🦊', '🐸', '🦁', '🐉', '🦅', '🐺', '🦈', '🔥', '💎', '🛸', '🐒'];

export default function MiniGame() {
  const { updateGameScore, gameHighScore } = useApp();

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(gameHighScore);
  const [playerBottom, setPlayerBottom] = useState(0);
  const [obstacleLeft, setObstacleLeft] = useState(GAME_WIDTH);
  const [character, setCharacter] = useState('🚀');

  const velocityRef = useRef(0);
  const playerBottomRef = useRef(0);
  const obstacleLeftRef = useRef(GAME_WIDTH);
  const scoreRef = useRef(0);
  const speedRef = useRef(4.5);
  const loopRef = useRef<any>(null);
  const isPlayingRef = useRef(false);
  const tapCountRef = useRef(0);

  // Keep highScore in sync with context
  useEffect(() => {
    if (gameHighScore > highScore) {
      setHighScore(gameHighScore);
    }
  }, [gameHighScore]);

  const leaderboard = [
    { name: 'SolWhale', score: 142 },
    { name: 'DegenKing', score: 98 },
    { name: 'NFTHunter', score: 76 },
    { name: 'You', score: highScore },
    { name: 'AirdropFan', score: 45 },
  ].sort((a, b) => b.score - a.score);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    if (loopRef.current) clearInterval(loopRef.current);
    setIsPlaying(false);
    setGameOver(true);
    const finalScore = scoreRef.current;
    if (finalScore > highScore) setHighScore(finalScore);
    // Send score to AppContext for quest tracking
    updateGameScore(finalScore);
  }, [highScore, updateGameScore]);

  const handleTap = () => {
    if (!isPlayingRef.current) return;
    tapCountRef.current += 1;
    const taps = tapCountRef.current;
    if (taps === 1) {
      velocityRef.current = 9;
    } else if (taps === 2) {
      velocityRef.current = 7.5;
    } else if (taps >= 3) {
      velocityRef.current = -12;
    }
  };

  const start = () => {
    const newChar = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    setCharacter(newChar);
    scoreRef.current = 0;
    speedRef.current = 4.5;
    velocityRef.current = 0;
    playerBottomRef.current = 0;
    obstacleLeftRef.current = GAME_WIDTH;
    tapCountRef.current = 0;
    setScore(0);
    setPlayerBottom(0);
    setObstacleLeft(GAME_WIDTH);
    setGameOver(false);
    setIsPlaying(true);
    isPlayingRef.current = true;

    loopRef.current = setInterval(() => {
      if (!isPlayingRef.current) return;

      velocityRef.current -= 0.55;
      playerBottomRef.current += velocityRef.current;
      if (playerBottomRef.current <= 0) {
        playerBottomRef.current = 0;
        velocityRef.current = 0;
        tapCountRef.current = 0;
      }

      obstacleLeftRef.current -= speedRef.current;
      if (obstacleLeftRef.current < -OBSTACLE_SIZE) {
        obstacleLeftRef.current = GAME_WIDTH + Math.random() * 150 + 50;
        scoreRef.current += 1;
        speedRef.current = 4.5 + scoreRef.current * 0.2;
      }

      const playerRight = PLAYER_LEFT + PLAYER_SIZE;
      const obsLeft = obstacleLeftRef.current;
      const obsRight = obsLeft + OBSTACLE_SIZE;
      if (
        playerRight > obsLeft + 4 &&
        PLAYER_LEFT < obsRight - 4 &&
        playerBottomRef.current < OBSTACLE_SIZE - 4
      ) {
        stop();
        return;
      }

      setPlayerBottom(playerBottomRef.current);
      setObstacleLeft(obstacleLeftRef.current);
      setScore(scoreRef.current);
    }, TICK);
  };

  useEffect(() => {
    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={1} onPress={isPlaying ? handleTap : start} style={styles.gameArea}>
        <View style={styles.ground} />
        <View style={[styles.player, { bottom: 22 + playerBottom }]}>
          <Text style={styles.playerText}>{character}</Text>
        </View>
        <View style={[styles.obstacle, { left: obstacleLeft }]}>
          <Text style={styles.obstacleText}>🌵</Text>
        </View>
        {!isPlaying && !gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>Solana Runner</Text>
            <Text style={styles.overlayHint}>1st tap: jump | 2nd: double jump | 3rd: slam!</Text>
            <Text style={styles.overlayBtn}>TAP TO PLAY</Text>
          </View>
        )}
        {gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.overlayScore}>Score: {score}</Text>
            <Text style={styles.overlayBtn}>TAP TO RETRY</Text>
          </View>
        )}
        {isPlaying && (
          <View style={styles.liveScore}>
            <Text style={styles.liveScoreText}>{score}</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.bestText}>Best: {highScore}</Text>
      </View>

      <View style={styles.leaderboard}>
        <Text style={styles.lbTitle}>Leaderboard</Text>
        {leaderboard.map((entry, i) => (
          <View key={i} style={[styles.lbRow, entry.name === 'You' && styles.lbRowYou]}>
            <Text style={[styles.lbRank, entry.name === 'You' && styles.lbYou]}>{i + 1}.</Text>
            <Text style={[styles.lbName, entry.name === 'You' && styles.lbYou]}>{entry.name}</Text>
            <Text style={[styles.lbScore, entry.name === 'You' && styles.lbYou]}>{entry.score}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24, paddingHorizontal: 16 },
  gameArea: {
    height: GAME_HEIGHT,
    backgroundColor: '#12121f',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#222',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 22,
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  player: {
    position: 'absolute',
    left: PLAYER_LEFT,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
  },
  playerText: { fontSize: 24 },
  obstacle: {
    position: 'absolute',
    bottom: 22,
    width: OBSTACLE_SIZE,
    height: OBSTACLE_SIZE,
  },
  obstacleText: { fontSize: 22 },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000099',
  },
  overlayTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  overlayHint: { color: '#888', fontSize: 10, marginBottom: 8, textAlign: 'center', paddingHorizontal: 20 },
  overlayScore: { color: '#fff', fontSize: 16, marginBottom: 4 },
  overlayBtn: { color: '#9945FF', fontSize: 16, fontWeight: 'bold' },
  liveScore: { position: 'absolute', top: 8, right: 12 },
  liveScoreText: { color: '#9945FF', fontSize: 18, fontWeight: 'bold' },
  footer: { alignItems: 'flex-end', marginTop: 4 },
  bestText: { color: '#666', fontSize: 12 },
  leaderboard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  lbTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  lbRow: { flexDirection: 'row', paddingVertical: 5 },
  lbRowYou: {
    backgroundColor: '#9945FF15',
    borderRadius: 8,
    marginHorizontal: -4,
    paddingHorizontal: 4,
  },
  lbRank: { color: '#666', fontSize: 12, width: 24 },
  lbName: { color: '#888', fontSize: 12, flex: 1 },
  lbScore: { color: '#888', fontSize: 12 },
  lbYou: { color: '#9945FF', fontWeight: 'bold' },
});