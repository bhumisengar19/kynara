import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function AvatarModel({ isSpeaking, isListening, status }) {
  const group = useRef();
  const leftEye = useRef();
  const rightEye = useRef();
  const mouth = useRef();
  const aura = useRef();

  useFrame((state) => {
    if (!group.current) return;

    const time = state.clock.elapsedTime;

    // Subtle breathing animation (Idle)
    group.current.position.y = -0.2 + Math.sin(time * 1.5) * 0.05;

    // Head look-at cursor (subtle mouse follow)
    const targetX = (state.mouse.x * Math.PI) / 8;
    const targetY = (state.mouse.y * Math.PI) / 8;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetX, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -targetY, 0.05);

    // Blinking logic (procedural)
    const isBlinking = (time % 4) < 0.15;
    if (leftEye.current && rightEye.current) {
        leftEye.current.scale.y = isBlinking ? 0.1 : 1;
        rightEye.current.scale.y = isBlinking ? 0.1 : 1;
    }

    // Mouth synthesis movement & Head Nodding
    if (mouth.current && aura.current) {
        if (isSpeaking) {
            // Simulated speech jitter
            const jitter = Math.sin(time * 25) * 0.4 + 0.6;
            mouth.current.scale.y = 0.2 + (jitter * 0.8);
            mouth.current.material.emissiveIntensity = 2 + Math.random();
            
            // Add subtle "nodding" while speaking
            group.current.rotation.x += Math.sin(time * 10) * 0.02;
            
            aura.current.distort = 0.6 + Math.sin(time * 5) * 0.1;
            aura.current.speed = 5;
        } else {
            // Calm idle mouth
            mouth.current.scale.y = THREE.MathUtils.lerp(mouth.current.scale.y, 0.2, 0.1);
            mouth.current.material.emissiveIntensity = 0.5;
            aura.current.distort = 0.2;
            aura.current.speed = 1.5;
        }
    }

    // Dynamic State Colors
    [leftEye, rightEye, mouth].forEach(ref => {
        if (!ref.current) return;
        
        const targetColor = new THREE.Color();
        if (isListening) targetColor.set('#f43f5e'); // Rose 500
        else if (status !== 'online') targetColor.set('#fbbf24'); // Amber 400
        else if (isSpeaking) targetColor.set('#818cf8'); // Indigo 400
        else targetColor.set('#c084fc'); // Purple 400 (Idle)

        ref.current.material.color.lerp(targetColor, 0.05);
        ref.current.material.emissive.lerp(targetColor, 0.05);
    });
  });

  return (
    <Float floatIntensity={2} speed={2} rotationIntensity={0.2}>
      <group ref={group} position={[0, -0.2, 0]} scale={[1.2, 1.2, 1.2]}>
        
        {/* Core Head Shell */}
        <mesh castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color="#0B0E23" 
            metalness={0.9} 
            roughness={0.1} 
          />
        </mesh>
        
        {/* Glass Outer Casing */}
        <mesh>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshPhysicalMaterial 
            color="#ffffff" 
            transmission={0.9} 
            opacity={1} 
            metalness={0.1} 
            roughness={0.1} 
            ior={1.5} 
            thickness={2} 
            transparent
          />
        </mesh>

        {/* Dynamic Inner Aura */}
        <mesh ref={aura} position={[0, 0, 0]} scale={[0.8, 0.8, 0.8]}>
            <sphereGeometry args={[0.6, 32, 32]} />
            <MeshDistortMaterial
                color={isListening ? "#f43f5e" : status !== 'online' ? "#fbbf24" : "#818cf8"}
                transparent
                opacity={0.3}
                distort={0.4}
                speed={status !== 'online' ? 10 : 2}
            />
        </mesh>

        {/* Neural Halo (Circular Aesthetic) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.8, 0.01, 16, 100]} />
            <meshStandardMaterial 
                color={isListening ? "#f43f5e" : status !== 'online' ? "#fbbf24" : "#818cf8"} 
                emissive={isListening ? "#f43f5e" : status !== 'online' ? "#fbbf24" : "#818cf8"}
                emissiveIntensity={2}
                transparent
                opacity={0.2}
            />
        </mesh>

        {/* Eyes */}
        <mesh ref={leftEye} position={[-0.25, 0.2, 0.51]}>
          <capsuleGeometry args={[0.06, 0.1, 4, 8]} />
          <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={2} />
        </mesh>

        <mesh ref={rightEye} position={[0.25, 0.2, 0.51]}>
          <capsuleGeometry args={[0.06, 0.1, 4, 8]} />
          <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={2} />
        </mesh>

        {/* Animated Mouth */}
        <mesh ref={mouth} position={[0, -0.2, 0.52]}>
          <boxGeometry args={[0.3, 0.05, 0.05]} />
          <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={1} />
        </mesh>

      </group>
    </Float>
  );
}
