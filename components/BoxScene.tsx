
"use client";

import { OrbitControls, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect } from "react";

export type FaceImages = {
  front: string | null;
  back: string | null;
  left: string | null;
  right: string | null;
  top: string | null;
  bottom: string | null;
};

type Props = {
  faceImages: FaceImages;
  width: number;
  height: number;
  depth: number;
  boxColor: string;
  backgroundColor: string;
  rotationY: number;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
};

function ArtworkMaterial({
  url,
  boxColor,
}: {
  url: string | null;
  boxColor: string;
}) {
  if (!url) {
    return (
      <meshStandardMaterial
        color={boxColor}
        roughness={0.38}
        metalness={0.02}
      />
    );
  }

  return <ArtworkTexture url={url} boxColor={boxColor} />;
}

function ArtworkTexture({
  url,
  boxColor,
}: {
  url: string;
  boxColor: string;
}) {
  const texture = useTexture(url);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    return () => texture.dispose();
  }, [texture]);

  return (
    <meshStandardMaterial
      map={texture}
      color="#ffffff"
      roughness={0.42}
      metalness={0.01}
      side={THREE.FrontSide}
    />
  );
}

function ProductBox({
  faceImages,
  width,
  height,
  depth,
  boxColor,
  rotationY,
}: Omit<Props, "backgroundColor" | "onCanvasReady">) {
  const w = width / 10;
  const h = height / 10;
  const d = depth / 10;
  const z = d / 2 + 0.002;
  const x = w / 2 + 0.002;
  const y = h / 2 + 0.002;

  return (
    <group rotation={[0, THREE.MathUtils.degToRad(rotationY), 0]}>
      {/* Base box shell */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={boxColor}
          roughness={0.4}
          metalness={0.02}
        />
      </mesh>

      {/* FRONT */}
      <mesh position={[0, 0, z]} rotation={[0, 0, 0]} renderOrder={2}>
        <planeGeometry args={[w * 0.985, h * 0.985]} />
        <ArtworkMaterial url={faceImages.front} boxColor={boxColor} />
      </mesh>

      {/* BACK */}
      <mesh
        position={[0, 0, -z]}
        rotation={[0, Math.PI, 0]}
        renderOrder={2}
      >
        <planeGeometry args={[w * 0.985, h * 0.985]} />
        <ArtworkMaterial url={faceImages.back} boxColor={boxColor} />
      </mesh>

      {/* RIGHT */}
      <mesh
        position={[x, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        renderOrder={2}
      >
        <planeGeometry args={[d * 0.985, h * 0.985]} />
        <ArtworkMaterial url={faceImages.right} boxColor={boxColor} />
      </mesh>

      {/* LEFT */}
      <mesh
        position={[-x, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        renderOrder={2}
      >
        <planeGeometry args={[d * 0.985, h * 0.985]} />
        <ArtworkMaterial url={faceImages.left} boxColor={boxColor} />
      </mesh>

      {/* TOP */}
      <mesh
        position={[0, y, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={2}
      >
        <planeGeometry args={[w * 0.985, d * 0.985]} />
        <ArtworkMaterial url={faceImages.top} boxColor={boxColor} />
      </mesh>

      {/* BOTTOM */}
      <mesh
        position={[0, -y, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        renderOrder={2}
      >
        <planeGeometry args={[w * 0.985, d * 0.985]} />
        <ArtworkMaterial url={faceImages.bottom} boxColor={boxColor} />
      </mesh>
    </group>
  );
}

export default function BoxScene(props: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [5.2, 3.6, 6.5], fov: 38 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
        props.onCanvasReady(gl.domElement);
      }}
    >
      <color attach="background" args={[props.backgroundColor]} />

      <ambientLight intensity={1.6} />

      <directionalLight
        castShadow
        position={[5, 8, 6]}
        intensity={3.2}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <directionalLight position={[-5, 2, -4]} intensity={1.2} />

      <ProductBox
        faceImages={props.faceImages}
        width={props.width}
        height={props.height}
        depth={props.depth}
        boxColor={props.boxColor}
        rotationY={props.rotationY}
      />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -props.height / 20 - 0.2, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.18} />
      </mesh>

      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={10}
      />
    </Canvas>
  );
}
