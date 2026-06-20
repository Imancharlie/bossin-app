import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { animations } from '@/constants/theme';

// Fade in animation
export function useFadeIn(duration: number = animations.timing.duration, delay: number = 0) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return opacity;
}

// Fade out animation
export function useFadeOut(duration: number = animations.timing.duration) {
  const opacity = useRef(new Animated.Value(1)).current;

  const fadeOut = () => {
    return new Promise<void>((resolve) => {
      Animated.timing(opacity, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  };

  return { opacity, fadeOut };
}

// Slide in animation
export function useSlideIn(direction: 'left' | 'right' | 'up' | 'down' = 'up', distance: number = 50) {
  const translate = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.spring(translate, {
      toValue: 0,
      ...animations.spring,
      useNativeDriver: true,
    }).start();
  }, []);

  return translate;
}

// Scale animation
export function useScale(from: number = 0.9, to: number = 1) {
  const scale = useRef(new Animated.Value(from)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue,
      ...animations.spring,
      useNativeDriver: true,
    }).start();
  }, []);

  return scale;
}

// Pulse animation for loading
export function usePulse() {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: animations.scale.duration,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: animations.scale.duration,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return scale;
}

// Spin animation for loading
export function useSpin() {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return rotate;
}

// Press animation for interactive elements
export function usePressAnimation(scaleDown: number = 0.95) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: scaleDown,
      ...animations.spring,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      ...animations.spring,
      useNativeDriver: true,
    }).start();
  };

  return { scale, pressIn, pressOut };
}

// Staggered animation for lists
export function useStaggeredAnimation(count: number, delay: number = 100) {
  const anims = useRef(
    Array.from({ length: count }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const staggered = anims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: animations.timing.duration,
        delay: index * delay,
        useNativeDriver: true,
      })
    );
    Animated.parallel(staggered).start();
  }, [count, delay]);

  return anims;
}
