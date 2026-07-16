"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import { Floor3D } from "./Floor3D";
import { useFloors } from "@/hooks/useData";
import { useUIStore } from "@/lib/store";

const WIDTH = 4.6;
const DEPTH = 3.4;
const WALL_THICKNESS = 0.12;
const MAX_TILT = THREE.MathUtils.degToRad(10);

const HEIGHT_BY_KIND: Record<string, number> = {
  basement: 1.9,
  reception: 2.4,
  admin: 1.5,
  classroom: 2.2,
  accessible: 2.2,
};

function BuildingRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const entrance = useRef(0);

  useFrame((_, delta) => {
    if (!group.current) return;
    entrance.current = THREE.MathUtils.damp(entrance.current, 1, 2.2, delta);
    const scale = THREE.MathUtils.lerp(0.75, 1, entrance.current);
    group.current.scale.setScalar(scale);

    const targetRotY = pointer.x * MAX_TILT;
    const targetRotX = -pointer.y * MAX_TILT * 0.5;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetRotY, 5, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetRotX, 5, delta);
  });

  return <group ref={group}>{children}</group>;
}

function BuildingScene() {
  const weekOffset = useUIStore((s) => s.weekOffset);
  const { data: floors } = useFloors(weekOffset);

  const layout = useMemo(() => {
    if (!floors) return { items: [], totalHeight: 0 };
    const sorted = [...floors].sort((a, b) => a.level - b.level);
    let cursor = 0;
    const items = sorted.map((floor) => {
      const height = HEIGHT_BY_KIND[floor.kind] ?? 2.2;
      const y = cursor + height / 2;
      cursor += height;
      return { floor, y, height };
    });
    return { items, totalHeight: cursor };
  }, [floors]);

  const offsetY = -layout.totalHeight / 2;

  return (
    <BuildingRig>
      <group position={[0, offsetY, 0]}>
        {layout.items.map(({ floor, y, height }) => (
          <Floor3D
            key={floor.id}
            floor={floor}
            y={y}
            height={height}
            width={WIDTH}
            depth={DEPTH}
            wallThickness={WALL_THICKNESS}
          />
        ))}
      </group>
    </BuildingRig>
  );
}

export function Building3D() {
  return (
    <div className="relative h-[560px] w-full select-none md:h-[640px]">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <color attach="background" args={["transparent"]} />
        <OrthographicCamera makeDefault position={[9, 7, 9]} zoom={78} near={0.1} far={100} />
        <ambientLight intensity={0.65} />
        <directionalLight
          position={[6, 10, 4]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
        />
        <directionalLight position={[-6, 4, -4]} intensity={0.3} />
        <Suspense fallback={null}>
          <BuildingScene />
          <ContactShadows position={[0, -2.6, 0]} opacity={0.35} scale={14} blur={2.4} far={6} />
        </Suspense>
      </Canvas>
    </div>
  );
}
