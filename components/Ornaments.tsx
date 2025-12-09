import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';

interface OrnamentsProps {
  state: TreeState;
  type: 'GIFT' | 'BALL' | 'LIGHT';
  count: number;
}

const tempObject = new THREE.Object3D();
const tempPos = new THREE.Vector3();
const tempTarget = new THREE.Vector3();
const tempChaos = new THREE.Vector3();

const Ornaments: React.FC<OrnamentsProps> = ({ state, type, count }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [targetProgress] = useState({ value: 0 }); // Local state to track progress

  // Configuration based on type
  const config = useMemo(() => {
    switch (type) {
      case 'GIFT':
        return {
          geometry: new THREE.BoxGeometry(0.8, 0.8, 0.8),
          color: ['#D4AF37', '#800020', '#FFFFFF'], // Gold, Burgundy, White
          lerpSpeed: 1.0, // Heavy
          baseScale: 1,
        };
      case 'BALL':
        return {
          geometry: new THREE.SphereGeometry(0.5, 32, 32),
          color: ['#FFD700', '#C0C0C0', '#B22222', '#004225'], // Gold, Silver, Red, Emerald
          lerpSpeed: 2.0, // Medium
          baseScale: 1,
        };
      case 'LIGHT':
        return {
          geometry: new THREE.SphereGeometry(0.15, 16, 16),
          color: ['#FFFFE0', '#FFD700'], // Warm White, Gold
          lerpSpeed: 4.0, // Light/Fast
          baseScale: 1,
        };
    }
  }, [type]);

  // Generate data
  const data = useMemo(() => {
    const items = [];
    const treeHeight = 14;
    const treeBaseRadius = 5.5;

    for (let i = 0; i < count; i++) {
      // Chaos Position
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const rChaos = 30 * Math.cbrt(Math.random());
      
      const chaos = new THREE.Vector3(
        rChaos * Math.sin(phi) * Math.cos(theta),
        rChaos * Math.sin(phi) * Math.sin(theta),
        rChaos * Math.cos(phi)
      );

      // Target Position
      let y, rCone, target;
      
      if (type === 'GIFT') {
        // Gifts at the bottom
        y = -treeHeight / 2 - 1 + (Math.random() * 2); // Base of tree
        const angle = Math.random() * Math.PI * 2;
        const dist = (Math.random() * 3) + 2; // Scatter around base
        target = new THREE.Vector3(dist * Math.cos(angle), y, dist * Math.sin(angle));
      } else {
        // Ornaments on the tree surface
        const yNorm = Math.random();
        y = yNorm * treeHeight - (treeHeight / 2);
        rCone = (1 - yNorm) * treeBaseRadius;
        // Bias towards surface
        const rPos = rCone * (0.8 + 0.2 * Math.random()); 
        const angle = Math.random() * Math.PI * 2;
        target = new THREE.Vector3(rPos * Math.cos(angle), y, rPos * Math.sin(angle));
      }

      const color = new THREE.Color(config.color[Math.floor(Math.random() * config.color.length)]);
      const scale = config.baseScale * (0.8 + Math.random() * 0.4);

      items.push({ chaos, target, color, scale, current: chaos.clone() });
    }
    return items;
  }, [count, type, config]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    // Initialize colors
    data.forEach((item, i) => {
        meshRef.current!.setColorAt(i, item.color);
    });
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [data]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Determine target based on global state
    const destinationValue = thisState === TreeState.FORMED ? 1 : 0;
    
    // Lerp our local progress
    // We adjust the speed based on delta, but we also manually move the positions
    // Actually, simpler approach: Lerp the position of each instance directly
    
    const isForming = thisState === TreeState.FORMED;
    
    data.forEach((item, i) => {
        const dest = isForming ? item.target : item.chaos;
        
        // Dynamic lerp speed based on distance to add "weight" feel
        // Gifts move slower, lights move faster
        const dist = item.current.distanceTo(dest);
        const speed = config.lerpSpeed + (dist * 0.1); 
        
        item.current.lerp(dest, speed * delta * 0.5);

        // Update Matrix
        tempObject.position.copy(item.current);
        tempObject.scale.setScalar(item.scale);
        
        // Rotate ornaments slightly for realism
        if (type !== 'LIGHT') {
            tempObject.rotation.y += delta * 0.5 * (i % 2 === 0 ? 1 : -1);
            tempObject.rotation.z = Math.sin(state.clock.elapsedTime + i) * 0.1;
        }
        
        // Twinkle lights
        if (type === 'LIGHT' && isForming) {
            const scalePulse = item.scale * (1 + Math.sin(state.clock.elapsedTime * 5 + i) * 0.3);
            tempObject.scale.setScalar(scalePulse);
        }

        tempObject.updateMatrix();
        meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Hack to access prop state inside useFrame without closure staleness
  const thisState = state;

  return (
    <instancedMesh
      ref={meshRef}
      args={[config.geometry, undefined, count]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={0xffffff} // Colors are set per instance
        roughness={type === 'GIFT' ? 0.3 : 0.15}
        metalness={type === 'GIFT' ? 0.4 : 0.9}
        emissive={type === 'LIGHT' ? '#FFD700' : '#000000'}
        emissiveIntensity={type === 'LIGHT' ? 2 : 0}
        envMapIntensity={2} // High gloss from HDRI
      />
    </instancedMesh>
  );
};

export default Ornaments;
