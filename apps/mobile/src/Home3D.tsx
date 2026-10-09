import React, { useMemo, useRef } from 'react';
import { PanResponder, View } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Item, Room } from '@kakehashi/shared';
import { colors, decisionColor, roomColor } from './theme';

// Block-style 3D view of the home built from the same floor-plan numbers (40 grid units = 1 metre-ish block).
const S = 1 / 40;
const toX = (x: number) => x * S - 4;
const toZ = (y: number) => y * S - 3;
const WALL_H = 0.45;
const WALL_T = 0.05;

type Drag = { yaw: number; active: boolean };

function RoomBlock({ room }: { room: Room }) {
  const cx = toX(room.x + room.w / 2), cz = toZ(room.y + room.h / 2), w = room.w * S, d = room.h * S;
  const wallColor = '#CFCAB9';
  return (
    <group position={[cx, 0, cz]}>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[w - 0.02, 0.08, d - 0.02]} />
        <meshStandardMaterial color={roomColor[room.status]} />
      </mesh>
      <mesh position={[0, WALL_H / 2, -d / 2]}><boxGeometry args={[w, WALL_H, WALL_T]} /><meshStandardMaterial color={wallColor} /></mesh>
      <mesh position={[0, WALL_H / 2, d / 2]}><boxGeometry args={[w, WALL_H, WALL_T]} /><meshStandardMaterial color={wallColor} /></mesh>
      <mesh position={[-w / 2, WALL_H / 2, 0]}><boxGeometry args={[WALL_T, WALL_H, d]} /><meshStandardMaterial color={wallColor} /></mesh>
      <mesh position={[w / 2, WALL_H / 2, 0]}><boxGeometry args={[WALL_T, WALL_H, d]} /><meshStandardMaterial color={wallColor} /></mesh>
    </group>
  );
}

function Pin({ item, selected, onSelect }: { item: Item; selected: boolean; onSelect: (id: string) => void }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.position.y = 0.42 + (selected ? Math.sin(state.clock.elapsedTime * 3) * 0.06 : 0);
  });
  const color = decisionColor[item.decision].fg;
  return (
    <group ref={ref} position={[toX(item.x), 0.42, toZ(item.y)]} scale={selected ? 1.35 : 1}>
      <mesh onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}>
        <boxGeometry args={[0.26, 0.26, 0.26]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function House({ rooms, items, selected, onSelect, drag }: { rooms: Room[]; items: Item[]; selected?: string; onSelect: (id: string) => void; drag: React.MutableRefObject<Drag> }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!group.current) return;
    if (!drag.current.active) drag.current.yaw += dt * 0.12;
    group.current.rotation.y = drag.current.yaw;
  });
  return (
    <group ref={group}>
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[9, 0.04, 7]} />
        <meshStandardMaterial color={colors.paper} />
      </mesh>
      {rooms.map((r) => <RoomBlock key={r.id} room={r} />)}
      {items.map((it) => <Pin key={it.id} item={it} selected={selected === it.id} onSelect={onSelect} />)}
    </group>
  );
}

export function Home3D(props: { rooms: Room[]; items: Item[]; selected?: string; onSelect: (id: string) => void }) {
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
    <View {...pan.panHandlers} style={{ width: '100%', aspectRatio: 1.15, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.sheet }}>
      <Canvas camera={{ position: [0, 8.2, 7.6], fov: 42 }} gl={{ preserveDrawingBuffer: true }} onCreated={({ camera }) => camera.lookAt(0, 0, 0)}>
        <ambientLight intensity={0.85} />
        <directionalLight position={[4, 8, 5]} intensity={1.1} />
        <House {...props} drag={drag} />
      </Canvas>
    </View>
  );
}
