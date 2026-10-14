import React, { useMemo, useRef } from 'react';
import { PanResponder, Platform, View } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Item, Room, SafetyFix } from '@kakehashi/shared';
import { colors, decisionColor } from './theme';
import { FLOORS, ROOM_FLOOR, grassTile, spriteFor, spritePixels, wallTile } from './pixelArt';

// Pixel-art 3D view of the home, built from the same floor-plan numbers (40 grid units = 1 block).
// Floors, walls and grass are tiny pixel textures; each item is a pixel sprite that always faces the camera.
// Memory mode re-lights the house at dusk: sprites ignore the lights, so items with stories glow like lanterns.
// Colour by rings each item by her choice or its story; evening light shows the house at night with its night lights.
const S = 1 / 40;
const toX = (x: number) => x * S - 4;
const toZ = (y: number) => y * S - 3;
const WALL_H = 0.45;
const WALL_T = 0.06;
const PIXEL_RATIO = 0.42; // render at low resolution, then scale up without smoothing

export const memoryColors = {
  sky: '#1F1B17',
  ground: '#2E2822',
  floor: '#463C32',
  wall: '#6B5E50',
  lantern: '#F2C46D',
  glow: '#F2A93B',
  quiet: '#5C544C',
} as const;

type Drag = { yaw: number; active: boolean };

export type ColorBy = 'none' | 'decision' | 'stories' | 'fixes';
export type Evening = 'off' | 'today' | 'plan';
export const hasStory = (i: Item) => Boolean(i.story || i.storyJa || i.audioUrl);

// Evening light: which night lights are on (tonight = installed; with her plan = also the ones she agreed to),
// and which fall risks (handrail, step, slippery floor) are still unfixed.
const HAZARDS = new Set(['handrail', 'step', 'nonslip']);
export function eveningState(fixes: SafetyFix[], evening: Evening) {
  const on = (f: SafetyFix) => f.status === 'done' || (evening === 'plan' && f.status === 'agreed');
  const lights = fixes.filter((f) => f.kind === 'light' && on(f));
  const risks = fixes.filter((f) => HAZARDS.has(f.kind) && f.status !== 'not-now' && !on(f));
  const litRooms = new Set(lights.map((f) => f.roomId));
  const darkRooms = [...new Set(risks.map((f) => f.roomId))].filter((r) => !litRooms.has(r));
  return { lights, risks, litRooms: [...litRooms], darkRooms };
}

const FIX_COLOR: Record<SafetyFix['status'], string> = { suggested: colors.kaki, agreed: colors.ai, done: colors.moss, 'not-now': colors.inkSoft };

function makeTexture(px: { data: Uint8Array; w: number; h: number }, repeatX = 1, repeatY = 1) {
  // DataTexture rows run bottom-up, so flip the top-first pixel rows.
  const flipped = new Uint8Array(px.data.length);
  const row = px.w * 4;
  for (let y = 0; y < px.h; y++) flipped.set(px.data.subarray(y * row, (y + 1) * row), (px.h - 1 - y) * row);
  const tex = new THREE.DataTexture(flipped, px.w, px.h, THREE.RGBAFormat);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function RoomBlock({ room, memory, evening }: { room: Room; memory: boolean; evening: boolean }) {
  const cx = toX(room.x + room.w / 2), cz = toZ(room.y + room.h / 2), w = room.w * S, d = room.h * S;
  // One floor tile per half block; walls repeat their plaster-and-beam tile along their length.
  const floor = useMemo(() => makeTexture(FLOORS[ROOM_FLOOR[room.id] ?? 'wood'](), w * 2, d * 2), [room.id, w, d]);
  const wallW = useMemo(() => makeTexture(wallTile(), w * 2, 1), [w]);
  const wallD = useMemo(() => makeTexture(wallTile(), d * 2, 1), [d]);
  const tint = memory ? '#8F7D66' : evening ? '#6A7491' : room.status === 'later' ? '#C8C2B6' : '#FFFFFF';
  return (
    <group position={[cx, 0, cz]}>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[w - 0.02, 0.08, d - 0.02]} />
        <meshStandardMaterial map={floor} color={tint} />
      </mesh>
      <mesh position={[0, WALL_H / 2, -d / 2]}><boxGeometry args={[w, WALL_H, WALL_T]} /><meshStandardMaterial map={wallW} color={tint} /></mesh>
      <mesh position={[0, WALL_H / 2, d / 2]}><boxGeometry args={[w, WALL_H, WALL_T]} /><meshStandardMaterial map={wallW} color={tint} /></mesh>
      <mesh position={[-w / 2, WALL_H / 2, 0]}><boxGeometry args={[WALL_T, WALL_H, d]} /><meshStandardMaterial map={wallD} color={tint} /></mesh>
      <mesh position={[w / 2, WALL_H / 2, 0]}><boxGeometry args={[WALL_T, WALL_H, d]} /><meshStandardMaterial map={wallD} color={tint} /></mesh>
    </group>
  );
}

function ItemSprite({ item, selected, memory, colorBy, evening, onSelect }: { item: Item; selected: boolean; memory: boolean; colorBy: ColorBy; evening: boolean; onSelect: (id: string) => void }) {
  const ref = useRef<THREE.Group>(null);
  const story = hasStory(item);
  const tex = useMemo(() => makeTexture(spritePixels(spriteFor(item))), [item.id, item.name, item.icon?.fromId]);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const bob = selected ? Math.sin(t * 3) * 0.05 : memory && story ? Math.sin(t * 1.4 + item.x) * 0.025 : 0;
    ref.current.position.y = 0.48 + bob;
  });
  // In memory mode, items with stories stay bright (sprites are unlit); the rest fade into the dusk.
  // Colour by: a coloured ring under each item; items outside the chosen view fade back.
  const faded = (colorBy === 'stories' && !story) || colorBy === 'fixes';
  const tint = memory ? (story ? '#FFE9C2' : '#4A433C') : evening ? '#59617A' : faded ? '#8E8E8E' : '#FFFFFF';
  const ring = memory || evening ? null : colorBy === 'decision' ? decisionColor[item.decision].fg : colorBy === 'stories' && story ? '#E2A63B' : null;
  const size = selected ? 0.95 : 0.78;
  return (
    <group position={[toX(item.x), 0, toZ(item.y)]}>
      <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[ring ? 0.3 : 0.24, 12]} />
        <meshBasicMaterial color={ring ?? '#000000'} transparent opacity={ring ? 0.95 : 0.22} />
      </mesh>
      <group ref={ref} position={[0, 0.48, 0]}>
        <sprite scale={[size, size, 1]} onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}>
          <spriteMaterial map={tex} color={tint} transparent alphaTest={0.5} />
        </sprite>
        {memory && selected ? <pointLight color={memoryColors.glow} intensity={2.2} distance={2.4} position={[0, 0.2, 0]} /> : null}
      </group>
    </group>
  );
}

// A safer-home fix: a small spinning diamond over the floor, coloured by her decision.
// In the evening, unfixed fall risks turn red and pulse.
function FixMarker({ fix, risk }: { fix: SafetyFix; risk: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 1.5;
    ref.current.position.y = 0.42 + Math.sin(t * 2 + fix.x) * 0.04;
    if (risk) ref.current.scale.setScalar(1 + Math.sin(t * 5) * 0.15);
  });
  return (
    <group position={[toX(fix.x), 0, toZ(fix.y)]}>
      <mesh ref={ref} position={[0, 0.42, 0]}>
        <octahedronGeometry args={[0.13, 0]} />
        <meshBasicMaterial color={risk ? '#E0453A' : FIX_COLOR[fix.status]} />
      </mesh>
    </group>
  );
}

// A night light: a warm pool of light on the floor (drawn, so it shows on every device) plus a real point light.
function NightLight({ fix }: { fix: SafetyFix }) {
  return (
    <group position={[toX(fix.x), 0, toZ(fix.y)]}>
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.85, 20]} />
        <meshBasicMaterial color="#FFC861" transparent opacity={0.45} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
        <meshBasicMaterial color="#FFE7A8" />
      </mesh>
      <pointLight color="#FFB54D" intensity={2.4} distance={2.6} position={[0, 0.5, 0]} />
    </group>
  );
}

function House({ rooms, items, selected, onSelect, drag, memory, fixes = [], colorBy = 'none', evening = 'off' }: {
  rooms: Room[]; items: Item[]; selected?: string; onSelect: (id: string) => void; drag: React.MutableRefObject<Drag>; memory: boolean;
  fixes?: SafetyFix[]; colorBy?: ColorBy; evening?: Evening;
}) {
  const night = evening !== 'off' && !memory;
  const ev = useMemo(() => eveningState(fixes, evening), [fixes, evening]);
  const riskIds = new Set(ev.risks.map((f) => f.id));
  const markers = night ? ev.risks : colorBy === 'fixes' ? fixes.filter((f) => f.status !== 'not-now') : [];
  const group = useRef<THREE.Group>(null);
  const grass = useMemo(() => makeTexture(grassTile(), 9, 7), []);
  useFrame((_, dt) => {
    if (!group.current) return;
    if (!drag.current.active) drag.current.yaw += dt * (memory || night ? 0.06 : 0.12);
    group.current.rotation.y = drag.current.yaw;
  });
  return (
    <group ref={group}>
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[9, 0.04, 7]} />
        <meshStandardMaterial map={grass} color={memory ? '#3A3A30' : night ? '#4A5266' : '#FFFFFF'} />
      </mesh>
      {rooms.map((r) => <RoomBlock key={r.id} room={r} memory={memory} evening={night} />)}
      {items.map((it) => <ItemSprite key={it.id} item={it} memory={memory} colorBy={colorBy} evening={night} selected={selected === it.id} onSelect={onSelect} />)}
      {markers.map((f) => <FixMarker key={f.id} fix={f} risk={night && riskIds.has(f.id)} />)}
      {night ? ev.lights.map((f) => <NightLight key={f.id} fix={f} />) : null}
    </group>
  );
}

export function Home3D(props: { rooms: Room[]; items: Item[]; selected?: string; onSelect: (id: string) => void; memory?: boolean; fixes?: SafetyFix[]; colorBy?: ColorBy; evening?: Evening; fill?: boolean }) {
  const memory = Boolean(props.memory);
  const night = !memory && (props.evening ?? 'off') !== 'off';
  const drag = useRef<Drag>({ yaw: -0.5, active: false });
  const start = useRef(0);
  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6,
    onPanResponderGrant: () => { drag.current.active = true; start.current = drag.current.yaw; },
    onPanResponderMove: (_, g) => { drag.current.yaw = start.current + g.dx * 0.01; },
    onPanResponderRelease: () => { drag.current.active = false; },
    onPanResponderTerminate: () => { drag.current.active = false; },
  }), []);

  return (
    <View {...pan.panHandlers} style={{ width: '100%', ...(props.fill ? { flex: 1 } : { aspectRatio: 1.15 }), borderRadius: 14, overflow: 'hidden', backgroundColor: memory ? memoryColors.sky : night ? '#141A2B' : '#BFD8E8' }}>
      {/* Rebuilt when the lighting changes: three.js keeps stale shaders when lights are removed. */}
      <Canvas
        key={memory ? 'memory' : night ? 'night' : 'day'}
        dpr={PIXEL_RATIO}
        camera={{ position: [0, 8.2, 7.6], fov: 42 }}
        gl={{ preserveDrawingBuffer: true, antialias: false }}
        onCreated={({ camera, gl }) => {
          camera.lookAt(0, 0, 0);
          // Scale the low-resolution render up with hard pixel edges (web).
          if (Platform.OS === 'web' && gl.domElement) gl.domElement.style.imageRendering = 'pixelated';
        }}>
        {memory ? (
          <>
            <ambientLight intensity={0.35} color="#FFE2B8" />
            <directionalLight position={[-5, 4, 3]} intensity={0.5} color="#FFB870" />
          </>
        ) : night ? (
          <>
            <ambientLight intensity={1.0} color="#8FA3D6" />
            <directionalLight position={[-4, 6, -3]} intensity={0.5} color="#9DB2E8" />
          </>
        ) : (
          <>
            <ambientLight intensity={1.2} />
            <directionalLight position={[4, 8, 5]} intensity={0.9} />
          </>
        )}
        <House {...props} memory={memory} drag={drag} />
      </Canvas>
    </View>
  );
}

