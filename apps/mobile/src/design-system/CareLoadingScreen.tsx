import React, { useEffect, useRef, useState } from 'react';
import { Animated, AppState, Easing, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { colors, elderlyCareColors as care, spacing } from '../theme';
import { useI18n } from '../i18n';
import { AppText } from './AppText';
import { useAccessibilityPreferences } from './preferences';

const calm = Easing.bezier(0.77, 0, 0.175, 1);
const ink = '#584362';
const skin = '#F3D9C9';
const svgProps = { width: '100%', height: '100%', viewBox: '0 0 320 260' } as const;

export function CareLoadingScreen({ fullScreen = false }: { fullScreen?: boolean }) {
  const { t } = useI18n();
  const { palette, reducedMotion } = useAccessibilityPreferences();
  const { width, height } = useWindowDimensions();
  const [active, setActive] = useState(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  const breathing = useRef(new Animated.Value(0)).current;
  const hand = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const heart = useRef(new Animated.Value(0)).current;
  const dots = useRef(new Animated.Value(0)).current;
  const sceneWidth = Math.max(0, Math.min(340, width - 64, height * 0.52));

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => setActive(state === 'active'));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' || reducedMotion || !active) return;
    const timing = (value: Animated.Value, toValue: number, duration: number, easing = calm) =>
      Animated.timing(value, { toValue, duration, easing, useNativeDriver: true, isInteraction: false });
    const animations = [
      Animated.loop(Animated.sequence([timing(breathing, 1, 2200), timing(breathing, 0, 2200)])),
      Animated.loop(Animated.sequence([timing(hand, 1, 1800), timing(hand, 0, 1800)])),
      Animated.loop(Animated.sequence([timing(blink, 1, 3400, Easing.linear), timing(blink, 0.12, 90), timing(blink, 1, 130)])),
      Animated.loop(Animated.sequence([timing(heart, 1, 2100), timing(heart, 0, 2100)])),
      Animated.loop(timing(dots, 1, 1800, Easing.linear)),
    ];
    animations.forEach(animation => animation.start());
    return () => {
      animations.forEach(animation => animation.stop());
      breathing.setValue(0); hand.setValue(0); blink.setValue(1); heart.setValue(0); dots.setValue(0);
    };
  }, [active, reducedMotion, breathing, hand, blink, heart, dots]);

  // Separate vector layers let the native driver move characters without redrawing SVG paths.
  const content = <View testID="care-loading-screen" nativeID={!reducedMotion && active ? 'care-loading-motion' : undefined} style={styles.content}>
    <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={{ width: sceneWidth, height: sceneWidth * 260 / 320 }}>
      <View style={[styles.canvas, { transform: [{ scale: sceneWidth / 320 }] }]}>
        <Svg {...svgProps} style={styles.layer}>
          <Path d="M35 211V130C35 61 84 24 160 24S285 61 285 130V211Z" fill={palette.warningSurface} />
          <Rect x="242" y="63" width="34" height="45" rx="12" fill={palette.surface} />
          <Path d="M259 64V107M243 85H275" stroke={palette.warningSurface} strokeWidth="3" />
          <Ellipse cx="160" cy="235" rx="131" ry="10" fill={palette.secondary} />
          <Path d="M279 201V161M279 182Q256 181 263 164Q280 162 279 182M280 174Q296 172 294 154Q277 153 280 174" fill={care.avocado} stroke={care.mocha} strokeWidth="2" strokeLinecap="round" />
          <Path d="M267 197H292L288 219H271Z" fill={care.umami} />
          <Rect x="52" y="131" width="110" height="81" rx="29" fill={care.avocado} />
          <Rect x="48" y="172" width="120" height="43" rx="18" fill={care.avocado} />
          <Path d="M62 212L60 230M153 212L156 230" stroke={care.mocha} strokeWidth="7" strokeLinecap="round" />
          <Rect x="195" y="191" width="60" height="13" rx="6.5" fill={care.umami} />
          <Path d="M203 201L199 230M246 201L251 230" stroke={care.mocha} strokeWidth="6" strokeLinecap="round" />
        </Svg>

        <Animated.View testID="care-elder" style={[styles.layer, { transform: [
          { translateY: breathing.interpolate({ inputRange: [0, 1], outputRange: [0, -1.5] }) },
        ] }]}>
          <Svg {...svgProps}>
            <Path d="M90 191L91 224M126 192L130 224" stroke={care.lavender} strokeWidth="19" strokeLinecap="round" />
            <Path d="M93 220H82Q74 220 73 230H101V226Q101 220 93 220M131 220H139Q149 220 149 230H122V226Q122 220 131 220" fill={ink} />
            <Path d="M76 157Q78 134 104 134Q135 134 140 161L146 190H73Z" fill={care.lavender} />
            <Path d="M96 135Q106 145 117 135" fill="none" stroke={care.astra} strokeWidth="5" strokeLinecap="round" />
            <Circle cx="106" cy="87" r="28" fill={colors.paper} />
            <Circle cx="86" cy="100" r="19" fill={colors.paper} />
            <Circle cx="128" cy="99" r="19" fill={colors.paper} />
            <Circle cx="77" cy="112" r="7" fill={skin} />
            <Circle cx="139" cy="112" r="7" fill={skin} />
            <Rect x="80" y="84" width="57" height="54" rx="27" fill={skin} />
            <Path d="M80 101Q77 76 101 77Q117 68 135 90L137 100Q118 100 108 88Q98 101 80 101" fill={colors.paper} />
            <Path d="M99 123Q107 130 115 122" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
            <Ellipse cx="91" cy="120" rx="6" ry="3.5" fill={care.umami} />
            <Ellipse cx="126" cy="120" rx="6" ry="3.5" fill={care.umami} />
            <G fill="none" stroke={care.mocha} strokeWidth="1.5">
              <Circle cx="96" cy="111" r="9" /><Circle cx="121" cy="111" r="9" />
              <Path d="M105 110Q108 108 112 110" />
            </G>
            <Path d="M80 155Q71 177 96 178" fill="none" stroke={skin} strokeWidth="13" strokeLinecap="round" />
            <Path d="M79 179Q105 169 136 180L147 205H76Z" fill={care.astra} />
            <Path d="M88 187Q108 183 134 190" fill="none" stroke={care.umami} strokeWidth="2" strokeLinecap="round" />
            <Path d="M123 169L140 174" stroke={skin} strokeWidth="12" strokeLinecap="round" />
          </Svg>
          <Animated.View testID="care-blink" style={[styles.eyes, { transform: [{ scaleY: blink }] }]}>
            <Svg width="34" height="8" viewBox="0 0 34 8">
              <Ellipse cx="5" cy="4" rx="2" ry="3" fill={ink} />
              <Ellipse cx="30" cy="4" rx="2" ry="3" fill={ink} />
            </Svg>
          </Animated.View>
        </Animated.View>

        <Animated.View testID="care-caregiver" style={[styles.layer, { transform: [
          { translateY: breathing.interpolate({ inputRange: [0, 1], outputRange: [0, -1.1] }) },
        ] }]}>
          <Svg {...svgProps}>
            <Path d="M218 185L207 205L208 225M239 186L237 207L240 225" fill="none" stroke={care.mocha} strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M209 221H197Q189 221 187 231H217V226Q217 221 209 221M241 221H249Q259 221 260 231H232V227Q232 221 241 221" fill={care.lavender} />
            <Path d="M204 155Q204 134 226 132Q250 131 252 157L256 190Q227 199 201 187Z" fill={care.avocado} />
            <Path d="M219 135Q226 143 234 135" fill="none" stroke={palette.surface} strokeWidth="4" strokeLinecap="round" />
            <Path d="M248 153L250 173Q249 183 239 182" fill="none" stroke={skin} strokeWidth="12" strokeLinecap="round" />
            <Path d="M213 144L207 157" stroke={care.avocado} strokeWidth="21" strokeLinecap="round" />
            <Circle cx="233" cy="83" r="24" fill={ink} />
            <Circle cx="205" cy="110" r="6" fill={skin} />
            <Circle cx="256" cy="108" r="6" fill={skin} />
            <Rect x="205" y="83" width="51" height="51" rx="24" fill={skin} />
            <Path d="M204 104Q195 80 217 73Q246 60 258 91L256 103Q235 101 226 87Q220 101 204 104" fill={ink} />
            <Path d="M215 111Q218 107 221 111M237 110Q240 106 243 110M224 121Q231 127 238 119" fill="none" stroke={ink} strokeWidth="2.3" strokeLinecap="round" />
            <Ellipse cx="214" cy="118" rx="5" ry="3" fill={care.umami} />
            <Ellipse cx="246" cy="117" rx="5" ry="3" fill={care.umami} />
          </Svg>
          <Animated.View testID="care-hand" style={[styles.hand, { transform: [{ rotate: hand.interpolate({
            inputRange: [0, 1], outputRange: ['0deg', '2deg'],
          }) }] }]}>
            <Svg width="88" height="58" viewBox="0 0 88 58">
              <Path d="M72 15Q48 42 12 32" fill="none" stroke={skin} strokeWidth="13" strokeLinecap="round" />
              <Path d="M8 31L17 34" stroke={care.mocha} strokeWidth="1.4" strokeLinecap="round" />
            </Svg>
          </Animated.View>
        </Animated.View>

        <Animated.View testID="care-heart" style={[styles.layer, { opacity: heart.interpolate({
          inputRange: [0, 1], outputRange: [0.45, 0.9],
        }), transform: [{ translateY: heart.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }] }]}>
          <Svg {...svgProps}>
            <Path d="M170 105C165 100 153 93 153 85C153 76 164 74 170 82C176 74 187 76 187 85C187 93 175 100 170 105Z" fill={care.umami} />
          </Svg>
        </Animated.View>
      </View>
    </View>
    <View accessibilityLiveRegion="polite" accessibilityState={{ busy: true }} style={styles.copy}>
      {fullScreen ? <AppText variant="eyebrow" style={{ color: palette.primary, letterSpacing: 2 }}>KAKEHASHI 架け橋</AppText> : null}
      <AppText style={styles.message}>{t('dsCareLoading')}</AppText>
    </View>
    <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.dots}>
      {[0, 1, 2].map(index => <Animated.View key={index} testID={`care-dot-${index}`} style={[styles.dot, {
        backgroundColor: palette.primary,
        opacity: reducedMotion ? 0.55 : dots.interpolate({
          inputRange: [0, index * 0.2 + 0.1, index * 0.2 + 0.3, index * 0.2 + 0.5, 1],
          outputRange: [0.35, 0.35, 1, 0.35, 0.35],
        }),
      }]} />)}
    </View>
  </View>;

  return fullScreen ? <ScrollView style={{ flex: 1, backgroundColor: palette.paper }} contentContainerStyle={styles.screen}>
    {content}
  </ScrollView> : content;
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  content: { alignItems: 'center', justifyContent: 'center', gap: spacing.lg, width: '100%', paddingVertical: spacing.xl },
  canvas: { position: 'absolute', width: 320, height: 260, left: '50%', top: '50%', marginLeft: -160, marginTop: -130 },
  layer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  eyes: { position: 'absolute', left: 91, top: 107, width: 34, height: 8 },
  hand: { position: 'absolute', left: 139, top: 140, width: 88, height: 58, transformOrigin: '82% 26%' },
  copy: { alignItems: 'center', gap: spacing.sm, width: '100%', maxWidth: 340 },
  message: { textAlign: 'center' },
  dots: { flexDirection: 'row', gap: spacing.sm, padding: spacing.xs },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
