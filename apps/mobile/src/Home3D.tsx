import React, { useMemo, useRef } from 'react';
import { PanResponder, View } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Item, Room } from '@kakehashi/shared';
import { colors, decisionColor, roomColor } from './theme';

// Block-style 3D view of the home built from the same floor-plan numbers (40 grid units = 1 metre-ish block).
// Memory mode re-lights the house at dusk: every item that ever lived here, stories glowing like lanterns.
const S = 1 / 40;
const toX = (x: number) => x * S - 4;
const toZ = (y: number) => y * S - 3;
const WALL_H = 0.45;
const WALL_T = 0.05;

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

function RoomBlock({ room, memory }: { room: Room; memory: boolean }) {
  const cx = toX(room.x + room.w / 2), cz = toZ(room.y + room.h / 2), w = room.w * S, d = room.h * S;
  const wallColor = memory ? memoryColors.wall : '#CFCAB9';
  return (
    <group position={[cx, 0, cz]}>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[w - 0.02, 0.08, d - 0.02]} />
        <meshStandardMaterial color={memory ? memoryColors.floor : roomColor[room.status]} />
      </mesh>
      <mesh position={[0, WALL_H / 2, -d / 2]}><boxGeometry args={[w, WALL_H, WALL_T]} /><meshStandardMaterial color={wallColor} /></mesh>
      <mesh position={[0, WALL_H / 2, d / 2]}><boxGeometry args={[w, WALL_H, WALL_T]} /><meshStandardMaterial color={wallColor} /></mesh>
      <mesh position={[-w / 2, WALL_H / 2, 0]}><boxGeometry args={[WALL_T, WALL_H, d]} /><meshStandardMaterial color={wallColor} /></mesh>
      <mesh position={[w / 2, WALL_H / 2, 0]}><boxGeometry args={[WALL_T, WALL_H, d]} /><meshStandardMaterial color={wallColor} /></mesh>
    </group>
  );
}

function Pin({ item, selected, memory, onSelect }: { item: Item; selected: boolean; memory: boolean; onSelect: (id: string) => void }) {
  const ref = useRef<THREE.Group>(null);
  const hasStory = Boolean(item.story || item.audioUrl);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const bob = selected ? Math.sin(t * 3) * 0.06 : memory && hasStory ? Math.sin(t * 1.4 + item.x) * 0.03 : 0;
    ref.current.position.y = 0.42 + bob;
  });
  const color = memory ? (hasStory ? memoryColors.lantern : memoryColors.quiet) : decisionColor[item.decision].fg;
  const glow = memory && hasStory ? (selected ? 1.6 : 0.8) : 0;
  return (
    <group ref={ref} position={[toX(item.x), 0.42, toZ(item.y)]} scale={selected ? 1.35 : 1}>
      <mesh onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}>
        <boxGeometry args={[0.26, 0.26, 0.26]} />
        <meshStandardMaterial color={color} emissive={memory && hasStory ? memoryColors.glow : '#000000'} emissiveIntensity={glow} />
      </mesh>
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 6]} />
        <meshStandardMaterial color={memory ? memoryColors.wall : color} />
      </mesh>
      {memory && selected ? <pointLight color={memoryColors.glow} intensity={2.2} distance={2.4} position={[0, 0.3, 0]} /> : null}
    </group>
  );
}

function House({ rooms, items, selected, onSelect, drag, memory }: { rooms: Room[]; items: Item[]; selected?: string; onSelect: (id: string) => void; drag: React.MutableRefObject<Drag>; memory: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!group.current) return;
    if (!drag.current.active) drag.current.yaw += dt * (memory ? 0.06 : 0.12);
    group.current.rotation.y = drag.current.yaw;
  });
  return (
    <group ref={group}>
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[9, 0.04, 7]} />
        <meshStandardMaterial color={memory ? memoryColors.ground : colors.paper} />
      </mesh>
      {rooms.map((r) => <RoomBlock key={r.id} room={r} memory={memory} />)}
      {items.map((it) => <Pin key={it.id} item={it} memory={memory} selected={selected === it.id} onSelect={onSelect} />)}
    </group>
  );
}

export function Home3D(props: { rooms: Room[]; items: Item[]; selected?: string; onSelect: (id: string) => void; memory?: boolean }) {
  const memory = Boolean(props.memory);
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
    <View {...pan.panHandlers} style={{ width: '100%', aspectRatio: 1.15, borderRadius: 14, overflow: 'hidden', backgroundColor: memory ? memoryColors.sky : colors.sheet }}>
      <Canvas camera={{ position: [0, 8.2, 7.6], fov: 42 }} gl={{ preserveDrawingBuffer: true }} onCreated={({ camera }) => camera.lookAt(0, 0, 0)}>
        {memory ? (
          <>
            <ambientLight intensity={0.35} color="#FFE2B8" />
            <directionalLight position={[-5, 4, 3]} intensity={0.5} color="#FFB870" />
          </>
        ) : (
          <>
            <ambientLight intensity={0.85} />
            <directionalLight position={[4, 8, 5]} intensity={1.1} />
          </>
        )}
        <House {...props} memory={memory} drag={drag} />
      </Canvas>
    </View>
  );
}
