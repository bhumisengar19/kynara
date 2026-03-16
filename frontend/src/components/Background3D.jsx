import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 800 }) {
    const mesh = useRef();

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 10 + Math.random() * 50;
            const speed = 0.005 + Math.random() / 500;
            const xFactor = -100 + Math.random() * 200;
            const yFactor = -100 + Math.random() * 200;
            const zFactor = -100 + Math.random() * 200;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        particles.forEach((particle, i) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
            t = particle.t += speed;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t) * 0.5 + 0.5;

            dummy.position.set(
                xFactor + Math.cos((t / 10) * factor) * 10,
                yFactor + Math.sin((t / 10) * factor) * 10,
                zFactor + Math.cos((t / 10) * factor) * 10
            );
            dummy.scale.set(s * 0.5, s * 0.5, s * 0.5);
            dummy.rotation.set(s * 5, s * 5, s * 5);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color="#6366f1" emissive="#8b5cf6" emissiveIntensity={1} transparent opacity={0.3} />
        </instancedMesh>
    );
}

export default function Background3D() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30 dark:opacity-60 overflow-hidden">
            <Canvas camera={{ position: [0, 0, 100], fov: 75 }}>
                <ambientLight intensity={0.4} />
                <pointLight position={[50, 50, 50]} intensity={1.5} color="#8b5cf6" />
                <pointLight position={[-50, -50, -50]} intensity={1} color="#4338ca" />
                <Particles />
            </Canvas>
        </div>
    );
}
