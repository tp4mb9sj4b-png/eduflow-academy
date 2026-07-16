"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { FloorDTO } from "@/types";
import { useUIStore } from "@/lib/store";
import {
  AccessibleFloorProps,
  AdminProps,
  BasementProps,
  ClassroomProps,
  ReceptionProps,
} from "./FloorProps";
import { cn } from "@/lib/utils";

interface Floor3DProps {
  floor: FloorDTO;
  y: number;
  height: number;
  width: number;
  depth: number;
  wallThickness: number;
}

export function Floor3D({ floor, y, height, width, depth, wallThickness }: Floor3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const interiorMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const [localHover, setLocalHover] = useState(false);

  const hoveredFloorId = useUIStore((s) => s.hoveredFloorId);
  const selectedFloorId = useUIStore((s) => s.selectedFloorId);
  const highlightedFloorId = useUIStore((s) => s.highlightedFloorId);
  const setHoveredFloor = useUIStore((s) => s.setHoveredFloor);
  const selectFloor = useUIStore((s) => s.selectFloor);

  const isHovered = hoveredFloorId === floor.id;
  const isSelected = selectedFloorId === floor.id;
  const isHighlighted = highlightedFloorId === floor.id;

  const baseColor = new THREE.Color(floor.color);
  const targetY = useRef(0);
  const currentY = useRef(0);

  useFrame((_, delta) => {
    const lift = isHovered || isSelected ? 0.18 : isHighlighted ? 0.08 : 0;
    targetY.current = lift;
    currentY.current = THREE.MathUtils.damp(currentY.current, targetY.current, 6, delta);
    if (groupRef.current) {
      groupRef.current.position.y = y + currentY.current;
    }
    if (interiorMatRef.current) {
      const targetEmissive = isHovered || isSelected ? 0.55 : isHighlighted ? 0.35 : 0.08;
      interiorMatRef.current.emissiveIntensity = THREE.MathUtils.damp(
        interiorMatRef.current.emissiveIntensity,
        targetEmissive,
        6,
        delta
      );
    }
  });

  const kind = floor.kind;
  const interiorW = width - wallThickness * 2 - 0.05;
  const interiorD = depth - wallThickness * 2 - 0.05;

  return (
    <group
      ref={groupRef}
      position={[0, y, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredFloor(floor.id);
        setLocalHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHoveredFloor(null);
        setLocalHover(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectFloor(floor.id);
      }}
    >
      {/* slab */}
      <mesh receiveShadow castShadow position={[0, -0.03, 0]}>
        <boxGeometry args={[width, 0.06, depth]} />
        <meshStandardMaterial color="#F1F5F9" />
      </mesh>

      {/* back wall */}
      <mesh receiveShadow castShadow position={[0, height / 2, -depth / 2 + wallThickness / 2]}>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      {/* left wall */}
      <mesh receiveShadow castShadow position={[-width / 2 + wallThickness / 2, height / 2, 0]}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial color="#F8FAFC" />
      </mesh>
      {/* right wall */}
      <mesh receiveShadow castShadow position={[width / 2 - wallThickness / 2, height / 2, 0]}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial color="#F8FAFC" />
      </mesh>

      {/* interior occupancy-colored floor */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[interiorW, interiorD]} />
        <meshStandardMaterial
          ref={interiorMatRef}
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={0.08}
          roughness={0.6}
        />
      </mesh>

      {/* stylized props per floor kind */}
      <group position={[0, 0, 0]}>
        {kind === "classroom" && <ClassroomProps width={width} depth={depth} />}
        {kind === "accessible" && <AccessibleFloorProps width={width} depth={depth} />}
        {kind === "reception" && <ReceptionProps width={width} depth={depth} />}
        {kind === "admin" && <AdminProps width={width} depth={depth} meetingRoom={floor.name.includes("Administration")} />}
        {kind === "basement" && <BasementProps width={width} depth={depth} />}
      </group>

      {/* floor label, shown on hover/select */}
      <Html
        position={[width / 2 + 0.3, height / 2, 0]}
        center={false}
        distanceFactor={8}
        occlude={false}
        style={{ pointerEvents: "none", transition: "opacity 0.25s ease" }}
      >
        <div
          className={cn(
            "whitespace-nowrap rounded-xl2 bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 shadow-soft border border-slate-200 dark:border-slate-700 transition-all duration-200",
            isHovered || isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
        >
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">{floor.name}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{floor.subtitle}</div>
          {floor.studentFacing && (
            <div className="mt-0.5 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: floor.color }} />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {floor.occupancyPercent}% occupé
              </span>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
