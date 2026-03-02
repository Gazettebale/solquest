import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef, useState, createContext, useContext } from 'react';

interface ToastData {
  title: string;
  xp: number;
  icon: string;
}

interface ToastContextType {
  showToast: (data: ToastData) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const showToast = (data: ToastData) => {
    setToast(data);
    slideAnim.setValue(-100);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      // Auto hide after 2.5 seconds
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, { toValue: -100, duration: 300, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => setToast(null));
      }, 2500);
    });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View style={[
          styles.toast,
          { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
        ]}>
          <View style={styles.toastContent}>
            <Text style={styles.toastIcon}>{toast.icon}</Text>
            <View style={styles.toastInfo}>
              <Text style={styles.toastTitle}>Quest Completed!</Text>
              <Text style={styles.toastQuest}>{toast.title}</Text>
            </View>
            <View style={styles.toastXP}>
              <Text style={styles.toastXPText}>+{toast.xp}</Text>
              <Text style={styles.toastXPLabel}>XP</Text>
            </View>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toastContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#14F19566',
    shadowColor: '#14F195',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  toastIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  toastInfo: {
    flex: 1,
  },
  toastTitle: {
    color: '#14F195',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toastQuest: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  toastXP: {
    backgroundColor: '#14F19522',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  toastXPText: {
    color: '#14F195',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toastXPLabel: {
    color: '#14F195',
    fontSize: 9,
  },
});