"use client";

import * as THREE from "three";

/**
 * Lightweight stylized furniture so each floor reads instantly at a glance:
 * rows of desks for classrooms, a rug + round tables for the accessible
 * floor, a reception desk for the ground floor, simple office furniture for
 * the admin mezzanines, and two plain training rooms for the basement.
 * Everything is built from primitives on purpose — no external 3D assets.
 */

const WOOD = "#C9A27A";
const METAL = "#9CA3AF";
const DARK = "#4B5563";

function Desk({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[0.5, 0.05, 0.32]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
      <mesh castShadow position={[0, 0.11, 0.1]}>
        <boxGeometry args={[0.3, 0.22, 0.05]} />
        <meshStandardMaterial color={DARK} />
      </mesh>
    </group>
  );
}

export function ClassroomProps({ width, depth }: { width: number; depth: number }) {
  const cols = 4;
  const rows = 2;
  const spanX = width * 0.6;
  const spanZ = depth * 0.35;
  const desks = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = -spanX / 2 + (c / (cols - 1)) * spanX;
      const z = -spanZ / 2 + (r / (rows - 1)) * spanZ + depth * 0.08;
      desks.push(<Desk key={`${r}-${c}`} position={[x, 0, z]} />);
    }
  }
  return (
    <group>
      {desks}
      {/* whiteboard on the back wall */}
      <mesh position={[0, 0.9, -depth / 2 + 0.06]}>
        <planeGeometry args={[width * 0.5, 0.7]} />
        <meshStandardMaterial color="#F8FAFC" />
      </mesh>
    </group>
  );
}

export function AccessibleFloorProps({ width, depth }: { width: number; depth: number }) {
  const chairColors = ["#F97316", "#22C55E", "#3B82F6", "#EAB308"];
  const chairs = chairColors.map((c, i) => {
    const angle = (i / chairColors.length) * Math.PI * 2;
    return (
      <mesh key={i} castShadow position={[Math.cos(angle) * 0.55, 0.14, Math.sin(angle) * 0.55]}>
        <boxGeometry args={[0.22, 0.28, 0.22]} />
        <meshStandardMaterial color={c} />
      </mesh>
    );
  });
  return (
    <group>
      {/* warm rug */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[Math.min(width, depth) * 0.32, 32]} />
        <meshStandardMaterial color="#FDE68A" />
      </mesh>
      <group position={[0, 0, 0]}>
        <mesh castShadow position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.04, 24]} />
          <meshStandardMaterial color={WOOD} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.24, 12]} />
          <meshStandardMaterial color={METAL} />
        </mesh>
        {chairs}
      </group>
    </group>
  );
}

export function ReceptionProps({ width, depth }: { width: number; depth: number }) {
  return (
    <group>
      {/* reception desk */}
      <mesh castShadow position={[-width * 0.22, 0.3, -depth * 0.15]}>
        <boxGeometry args={[1.4, 0.6, 0.5]} />
        <meshStandardMaterial color="#1D8CF8" />
      </mesh>
      {/* sofa */}
      <mesh castShadow position={[width * 0.24, 0.2, depth * 0.1]}>
        <boxGeometry args={[1, 0.4, 0.5]} />
        <meshStandardMaterial color="#0B5FC4" />
      </mesh>
      {/* staircase block, central */}
      <mesh castShadow position={[0, 0.35, depth * 0.28]}>
        <boxGeometry args={[0.8, 0.7, 0.9]} />
        <meshStandardMaterial color={METAL} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

export function AdminProps({ width, depth, meetingRoom }: { width: number; depth: number; meetingRoom?: boolean }) {
  return (
    <group>
      <mesh castShadow position={[-width * 0.2, 0.25, 0]}>
        <boxGeometry args={[1, 0.5, 0.6]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
      {meetingRoom && (
        <mesh castShadow position={[width * 0.2, 0.22, 0]}>
          <boxGeometry args={[1.2, 0.4, 0.7]} />
          <meshStandardMaterial color={DARK} />
        </mesh>
      )}
    </group>
  );
}

export function BasementProps({ width, depth }: { width: number; depth: number }) {
  return (
    <group>
      {/* divider wall between the two training rooms */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.08, 1.2, depth * 0.9]} />
        <meshStandardMaterial color="#E5E7EB" />
      </mesh>
      <mesh position={[-width * 0.25, 0.9, -depth / 2 + 0.06]}>
        <planeGeometry args={[width * 0.35, 0.55]} />
        <meshStandardMaterial color="#F8FAFC" />
      </mesh>
      <mesh position={[width * 0.25, 0.9, -depth / 2 + 0.06]}>
        <planeGeometry args={[width * 0.35, 0.55]} />
        <meshStandardMaterial color="#F8FAFC" />
      </mesh>
    </group>
  );
}
