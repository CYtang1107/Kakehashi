import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Platform, Pressable, View, type GestureResponderEvent } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { PublicStory } from '@kakehashi/shared';
import { LAND_ROWS } from './landMask';
import { useAccessibilityPreferences } from './design-system/preferences';

// The story globe: every shared story is a light on its town (rounded to about 10 km, never the home).
// Adapted from the EVEth globe in EVE, with real coastlines and a start facing Japan.
const R = 1.6;
const BG = '#121A2A';
const LIGHT = '#F08A4B'; // persimmon: a real story
const EXAMPLE = '#D9B26A'; // gold: an invented example
const ZOOM = { min: 1.8, max: 5.2, start: 2.3 };
const JAPAN = { lat: 36.5, lng: 138 };

// Half-degree land grid from the run lengths in landMask.ts.
const STEP = 0.5, W = 720, H = 360;
const LAND = (() => {
  const grid = new Uint8Array(W * H);
  LAND_ROWS.split(',').forEach((row, j) => {
    let i = 0, v = 0;
    for (const run of row.split('.')) { const n = parseInt(run, 36); if (v) grid.fill(1, j * W + i, j * W + i + n); i += n; v ^= 1; }
  });
  return grid;
})();
// Nothing north of 83.7°N is land (the polar rows of the source data are noisy).
const isLand = (lat: number, lng: number) => lat < 83.7 && LAND[Math.min(H - 1, Math.floor((90 - lat) / STEP)) * W + Math.min(W - 1, Math.floor((lng + 180) / STEP))] === 1;

const toVec = (lat: number, lng: number, r: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
};
// The globe rotation that brings a place to the front.
const facing = (lat: number, lng: number) => {
  const p = toVec(lat, lng, 1);
  return { x: lat * (Math.PI / 180), y: -Math.atan2(p.x, p.z) };
};

// Evenly spread dots (a golden spiral), kept where the colour function says, as plain number arrays (fast to build).
function dots(count: number, radius: number, colour: (lat: number, lng: number) => [number, number, number] | null) {
  const pos: number[] = [], col: number[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  const deg = 180 / Math.PI;
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = golden * i;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    let lng = Math.atan2(z, -x) * deg - 180;
    if (lng < -180) lng += 360;
    const c = colour(90 - Math.acos(y) * deg, lng);
    if (!c) continue;
    pos.push(x * radius, y * radius, z * radius);
    col.push(c[0], c[1], c[2]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return g;
}
const rgb = (hex: string): [number, number, number] => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };
const LAND_A = rgb('#E9DFC8'), LAND_B = rgb('#CFC3A6'), SEA = rgb('#2E4A78');

type Drag = { x: number; y: number; active: boolean };
type Picker = { current: ((nx: number, ny: number) => string | null) | null };

function Globe({ stories, selected, drag, zoom, picker }: { stories: PublicStory[]; selected: string | null; drag: React.MutableRefObject<Drag>; zoom: React.MutableRefObject<number>; picker: Picker }) {
  const { reducedMotion } = useAccessibilityPreferences();
  const spin = useRef<THREE.Group>(null);
  const markers = useRef<THREE.Group>(null);
  const globe = useRef<THREE.Mesh>(null);
  const rings = useRef<Record<string, THREE.Mesh | null>>({});
  const { camera, raycaster } = useThree();

  const land = useMemo(() => dots(170000, R, (lat, lng) => (isLand(lat, lng) ? (Math.sin(lat * 0.3) > 0 ? LAND_A : LAND_B) : null)), []);
  const sea = useMemo(() => {
    let i = 0;
    return dots(40000, R, (lat, lng) => (!isLand(lat, lng) && i++ % 4 === 0 ? SEA : null));
  }, []);

  useFrame((state) => {
    const g = spin.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // A gentle sway while nobody is touching it, so it feels alive without spinning Japan away.
    const sway = reducedMotion || drag.current.active || selected ? 0 : Math.sin(t * 0.35) * 0.08;
    g.rotation.y = drag.current.y + sway;
    g.rotation.x = drag.current.x;
    camera.position.z += (zoom.current - camera.position.z) * (reducedMotion ? 1 : 0.12);
    // Lights keep the same size on screen at any zoom.
    const s = camera.position.z / ZOOM.start;
    markers.current?.children.forEach((m) => m.scale.setScalar(s));
    Object.entries(rings.current).forEach(([id, m]) => {
      if (!m) return;
      const k = reducedMotion ? 1 : 1 + ((t * 0.8 + id.length * 0.17) % 1) * 0.9;
      m.scale.setScalar(k);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - (k - 1) / 0.9);
    });
  });

  useEffect(() => {
    picker.current = (nx, ny) => {
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
      const hit = raycaster.intersectObjects([globe.current!, ...(markers.current?.children ?? [])], true)[0];
      let o: THREE.Object3D | null = hit?.object ?? null;
      while (o && !o.userData.id) o = o.parent;
      return (o?.userData.id as string) ?? null;
    };
    return () => { picker.current = null; };
  }, [camera, raycaster, picker]);

  return (
    <group ref={spin}>
      <mesh ref={globe}>
        <sphereGeometry args={[R - 0.012, 64, 64]} />
        <meshBasicMaterial color={BG} />
      </mesh>
      <mesh>
        <sphereGeometry args={[R + 0.18, 48, 48]} />
        <meshBasicMaterial color="#7FA3D9" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      <points geometry={sea}><pointsMaterial size={0.012} vertexColors sizeAttenuation /></points>
      <points geometry={land}><pointsMaterial size={0.011} vertexColors sizeAttenuation /></points>
      <group ref={markers}>
        {stories.map((st, i) => {
          // Stories from the same town sit side by side instead of on top of each other.
          const k = stories.slice(0, i).filter((o) => o.lat === st.lat && o.lng === st.lng).length;
          const p = toVec(st.lat + (k ? 0.35 * Math.sin(k * 2.1) : 0), st.lng + (k ? 0.45 * Math.cos(k * 2.1) : 0), R + 0.012);
          const on = st.id === selected;
          const colour = st.example ? EXAMPLE : LIGHT;
          return (
            <group key={st.id} userData={{ id: st.id }} position={p} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), p.clone().normalize())}>
              <mesh><sphereGeometry args={[on ? 0.016 : 0.01, 16, 16]} /><meshBasicMaterial color={on ? '#FFFFFF' : colour} /></mesh>
              <mesh position={[0, 0, 0.003]} ref={(m) => { rings.current[st.id] = m; }}>
                <ringGeometry args={[0.012, 0.0155, 32]} /><meshBasicMaterial color={colour} transparent opacity={0.5} side={THREE.DoubleSide} />
              </mesh>
              {/* a larger, invisible area so a thumb can hit it */}
              <mesh><sphereGeometry args={[0.04, 8, 8]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

export function StoryGlobe({ stories, selected, onSelect, height = 360, fill, labels }: {
  stories: PublicStory[]; selected: string | null; onSelect: (id: string | null) => void; height?: number; fill?: boolean;
  labels: { zoomIn: string; zoomOut: string; japan: string };
}) {
  const drag = useRef<Drag>({ ...facing(JAPAN.lat, JAPAN.lng), active: false });
  const zoom = useRef(ZOOM.start);
  const start = useRef({ x: 0, y: 0 });
  const picker: Picker = useRef(null);
  const [size, setSize] = useState({ w: 1, h: 1 });
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const clampZoom = (z: number) => Math.max(ZOOM.min, Math.min(ZOOM.max, z));
  // Pinch to zoom on phones: the distance between two fingers, compared with where the pinch began.
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);
  const pinched = useRef(false);
  const fingers = (e: GestureResponderEvent) => {
    const t = e.nativeEvent.touches;
    return t.length >= 2 ? Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY) : 0;
  };

  // Scroll (mouse wheel or trackpad) to zoom on the web. The page does not scroll while the pointer is on the globe.
  const surface = useRef<View>(null);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const el = surface.current as unknown as HTMLElement | null;
    if (!el?.addEventListener) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const px = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY; // lines to pixels
      zoom.current = clampZoom(zoom.current * Math.exp(px * (e.ctrlKey ? 0.01 : 0.0015)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { drag.current.active = true; pinch.current = null; pinched.current = false; start.current = { x: drag.current.x, y: drag.current.y }; },
    onPanResponderMove: (e, g) => {
      const d = fingers(e);
      if (d) {
        pinched.current = true;
        if (!pinch.current) pinch.current = { dist: d, zoom: zoom.current };
        else zoom.current = clampZoom(pinch.current.zoom * (pinch.current.dist / d));
        return;
      }
      if (pinched.current) return; // lifting one finger after a pinch should not spin the globe
      // Slower when zoomed in, so a small drag doesn't fling Japan off the screen.
      const k = zoom.current / ZOOM.max;
      drag.current.y = start.current.y + g.dx * 0.011 * k;
      drag.current.x = Math.max(-1.3, Math.min(1.3, start.current.x + g.dy * 0.008 * k));
    },
    onPanResponderRelease: (e, g) => {
      drag.current.active = false;
      if (!pinched.current && Math.abs(g.dx) < 6 && Math.abs(g.dy) < 6) {
        const { w, h } = sizeRef.current;
        const { locationX, locationY } = e.nativeEvent;
        onSelectRef.current(picker.current?.((locationX / w) * 2 - 1, -(locationY / h) * 2 + 1) ?? null);
      }
    },
    onPanResponderTerminate: () => { drag.current.active = false; },
  }), []);

  const zoomBy = (f: number) => { zoom.current = clampZoom(zoom.current * f); };
  const home = () => { Object.assign(drag.current, facing(JAPAN.lat, JAPAN.lng)); zoom.current = ZOOM.start; };

  return (
    <View style={{ ...(fill ? { flex: 1, minHeight: 0 } : { height }), borderRadius: 16, overflow: 'hidden', backgroundColor: BG }} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <Canvas camera={{ position: [0, 0, ZOOM.start], fov: 40 }}>
        <Globe stories={stories} selected={selected} drag={drag} zoom={zoom} picker={picker} />
      </Canvas>
      <View ref={surface} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} {...pan.panHandlers} />
      <View style={{ position: 'absolute', right: 10, top: 10, gap: 8 }}>
        <GlobeButton icon="plus" label={labels.zoomIn} onPress={() => zoomBy(0.8)} />
        <GlobeButton icon="minus" label={labels.zoomOut} onPress={() => zoomBy(1.25)} />
        <GlobeButton icon="crosshair" label={labels.japan} onPress={home} />
      </View>
    </View>
  );
}

function GlobeButton({ icon, label, onPress }: { icon: React.ComponentProps<typeof Feather>['name']; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={4}
      style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: '#235A46', borderWidth: 1, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
      <Feather name={icon} size={17} color="#FAFBF8" />
    </Pressable>
  );
}
