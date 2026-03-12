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
                    color="#8b5cf6"
                    emissive="#3b82f6"
                    emissiveIntensity={2}
                    speed={2}
                    distort={0.4}
                    radius={1}
                />
            </Sphere>

            {/* Outer Glow */}
            <Sphere args={[1.3, 64, 64]}>
                <meshStandardMaterial
                    color="#4f46e5"
                    transparent
                    opacity={0.1}
                    emissive="#8b5cf6"
                    emissiveIntensity={1}
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
    const speed = useMemo(() => 0.2 + Math.random() * 0.5, []);
    const axis = useMemo(() => new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
    ).normalize(), []);

    const color = useMemo(() => {
        const colors = ['#8b5cf6', '#3b82f6', '#0ea5e9', '#6366f1'];
        return colors[index % colors.length];
    }, [index]);

    const radius = useMemo(() => 1.5 + Math.random() * 0.8, []);
    const tube = useMemo(() => 0.01 + Math.random() * 0.02, []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime() * speed;
        ref.current.rotateOnAxis(axis, 0.02);
        ref.current.scale.setScalar(1 + Math.sin(t) * 0.05);
    });

    return (
        <mesh ref={ref}>
            <torusGeometry args={[radius, tube, 16, 100]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={4}
                transparent
                opacity={0.8}
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
