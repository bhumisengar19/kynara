import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Orb() {
    const mesh = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        mesh.current.rotation.x = t * 0.2;
        mesh.current.rotation.y = t * 0.3;
    });

    return (
        <group>
            {/* Main Core */}
            <Sphere ref={mesh} args={[1.2, 64, 64]}>
                <MeshDistortMaterial
                    color="#D8B4FE"
                    emissive="#A855F7"
                    emissiveIntensity={1.5}
                    speed={1.5}
                    distort={0.3}
                    radius={1}
                />
            </Sphere>

            {/* Outer Glow */}
            <Sphere args={[1.3, 64, 64]}>
                <meshStandardMaterial
                    color="#C084FC"
                    transparent
                    opacity={0.05}
                    emissive="#D8B4FE"
                    emissiveIntensity={0.5}
                />
            </Sphere>

            {/* Neural Rings/Trails */}
            {Array.from({ length: 12 }).map((_, i) => (
                <Ring key={i} index={i} />
            ))}
        </group>
    );
}

function Ring({ index }) {
    const ref = useRef();
    const speed = useMemo(() => 0.1 + Math.random() * 0.3, []);
    const axis = useMemo(() => new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
    ).normalize(), []);

    const color = useMemo(() => {
        const colors = ['#D8B4FE', '#A855F7', '#C084FC', '#818CF8'];
        return colors[index % colors.length];
    }, [index]);

    const radius = useMemo(() => 1.4 + Math.random() * 0.6, []);
    const tube = useMemo(() => 0.005 + Math.random() * 0.01, []);

    useFrame((state) => {
        ref.current.rotateOnAxis(axis, 0.015);
    });

    return (
        <mesh ref={ref}>
            <torusGeometry args={[radius, tube, 12, 120]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={3}
                transparent
                opacity={0.6}
            />
        </mesh>
    );
}

export default function NeuralOrb() {
    return (
        <div className="w-full h-full relative">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={2} />
                <pointLight position={[-10, -10, -10]} color="#8b5cf6" intensity={1} />
                <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                    <Orb />
                </Float>
            </Canvas>
        </div>
    );
}
