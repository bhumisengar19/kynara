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

    // Head look-at cursor (subtle mouse follow)
    const targetX = (state.mouse.x * Math.PI) / 6;
    const targetY = (state.mouse.y * Math.PI) / 6;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetX, 0.1);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -targetY, 0.1);

    const time = state.clock.elapsedTime;
    
    // Blinking logic (procedural)
    const isBlinking = (time % 4) < 0.15;
    if (leftEye.current && rightEye.current) {
        leftEye.current.scale.y = isBlinking ? 0.1 : 1;
        rightEye.current.scale.y = isBlinking ? 0.1 : 1;
    }

    // Mouth synthesis movement
    if (mouth.current && aura.current) {
        if (isSpeaking) {
            // Jitter scale to simulate talking
            const talkScale = 0.2 + Math.random() * 0.8;
            mouth.current.scale.y = talkScale;
            mouth.current.material.emissiveIntensity = 2;
            aura.current.distort = 0.6; // Aura gets chaotic
            aura.current.speed = 5;
        } else {
            // Calm idle mouth
            mouth.current.scale.y = THREE.MathUtils.lerp(mouth.current.scale.y, 0.2, 0.2);
            mouth.current.material.emissiveIntensity = 0.5;
            aura.current.distort = 0.2; // Aura calms down
            aura.current.speed = 1.5;
        }
    }

    // Dynamic State Colors
    [leftEye, rightEye, mouth].forEach(ref => {
        if (!ref.current) return;
        
        const targetColor = new THREE.Color();
        if (isListening) targetColor.set('#ef4444'); // Red Listening
        else if (status !== 'online') targetColor.set('#eab308'); // Yellow Thinking/Generating
        else targetColor.set('#c084fc'); // Idle Lavender

        ref.current.material.color.lerp(targetColor, 0.1);
        ref.current.material.emissive.lerp(targetColor, 0.1);
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
                color={isListening ? "#ef4444" : status !== 'online' ? "#eab308" : "#818cf8"}
                transparent
                opacity={0.3}
                distort={0.4}
                speed={2}
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
