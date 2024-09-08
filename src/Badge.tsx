import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  PixelRatio,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { clamp, debug, getBadgeValue } from './helpers';

const MIN_SIZE = 15;
const MAX_SIZE = 45;

export enum BadgePositions {
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right',
}

export interface Props extends ViewProps {
  size?: number;
  color?: string;
  radius?: number;
  animate?: boolean;
  value?: React.ReactNode;  // 修改 value 的類型
  limit?: number;
  parentRadius?: number;
  position?: `${BadgePositions}`;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Badge = ({
  size = 20,
  color = '#00000000',
  radius,
  animate = true,
  value,
  limit = 9,
  parentRadius = 0,
  position,
  style,
  textStyle,
  ...props
}: Props) => {
  const toValue = value ? 1 : 0;
  const animatedValue = useRef(new Animated.Value(toValue)).current;
  const hasContent = typeof value === 'number' || typeof value === 'string';
  const minHeight = clamp(size, MIN_SIZE, MAX_SIZE) / 2;
  const height = hasContent ? clamp(size, MIN_SIZE, MAX_SIZE) : minHeight;

  useEffect(() => {
    if (animate) {
      if (toValue === 1) {
        Animated.spring(animatedValue, {
          toValue,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }).start();
      } else {
        animatedValue.setValue(0);
      }
    }
  }, [animate, animatedValue, toValue]);

  const offset = useMemo(() => {
    const edgeOffset = parentRadius * (1 - Math.sin((45 * Math.PI) / 180));
    const selfOffset = (1 + clamp(parentRadius / height, 0, 1)) * (height / 4);
    return PixelRatio.roundToNearestPixel(edgeOffset - selfOffset);
  }, [height, parentRadius]);

  if (!value) {
    return null;
  }

  const rootStyles: Animated.AnimatedProps<ViewStyle[]> = [
    {
      ...styles.root,
      height,
      minWidth: height,
      backgroundColor: color,
      borderRadius: radius ?? height / 2,
      transform: [{ scale: animatedValue }],
    },
  ];

  if (position) {
    const [badgeY, badgeX] = position.split('-');
    rootStyles.push({
      ...styles.position,
      [badgeY]: offset,
      [badgeX]: offset,
    });
  }

  debug('RENDER <Badge>', value);

  return (
    <Animated.View {...props} style={[rootStyles, style]}>
      {hasContent ? (
        <Text style={[styles.text, textStyle]} numberOfLines={1} ellipsizeMode="clip">
          {getBadgeValue(value as string | number, limit)}
        </Text>
      ) : (
        value  // 渲染傳遞的 ReactNode
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  position: {
    zIndex: 1,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  text: {
    color: '#fff',
    fontWeight: '400',
    fontFamily: 'System',
    includeFontPadding: false,
    textAlignVertical: 'center',
    backgroundColor: 'transparent',
  },
});

export default React.memo(Badge);
