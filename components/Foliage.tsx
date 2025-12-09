import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';

// Custom Shader Material for the Foliage
const FoliageShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uColor: { value: new THREE.Color('#004225') }, // Deep Emerald
    uGold: { value: new THREE.Color('#FFD700') },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    attribute vec3 aChaosPos;
    attribute vec3 aTargetPos;
    attribute float aRandom;
    
    varying float vRandom;
    varying vec3 vPos;

    void main() {
      vRandom = aRandom;
      
      // Cubic easing for smoother transition in vertex shader
      float t = uProgress;
      float ease = t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;

      // Interpolate position
      vec3 pos = mix(aChaosPos, aTargetPos, ease);
      vPos = pos;
      
      // Add subtle wind movement when formed
      if (uProgress > 0.8) {
        pos.x += sin(uTime * 2.0 + pos.y) * 0.05 * (1.0 - pos.y/10.0);
        pos.z += cos(uTime * 1.5 + pos.y) * 0.05 * (1.0 - pos.y/10.0);
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Size attenuation
      gl_PointSize = (8.0 * aRandom + 4.0) * (10.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform vec3 uGold;
    varying float vRandom;
    
    void main() {
      // Circular particle
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      if (dist > 0.5) discard;

      // Mix Emerald with a touch of Gold based on randomness for luxury feel
      vec3 finalColor = mix(uColor, uGold, vRandom * 0.15);
      
      // High gloss simulation
      float shine = 1.0 - smoothstep(0.0, 0.4, dist);
      finalColor += vec3(0.2) * shine;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

interface FoliageProps {
  state: TreeState;
  count?: number;
}

const Foliage: React.FC<FoliageProps> = ({ state, count = 15000 }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Animation progress ref
  const progressRef = useRef(0);
  const targetProgress = state === TreeState.FORMED ? 1 : 0;

  const { attributes, geometry } = useMemo(() => {
    const chaosPositions = new Float32Array(count * 3);
    const targetPositions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);

    const treeHeight = 14;
    const treeBaseRadius = 5.5;

    for (let i = 0; i < count; i++) {
      // Chaos: Random sphere distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 25 * Math.cbrt(Math.random()); // Spread within radius 25
      
      chaosPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      chaosPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      chaosPositions[i * 3 + 2] = r * Math.cos(phi);

      // Target: Cone distribution (The Tree)
      // Height from -6 to +8
      const yNorm = Math.random(); // 0 to 1
      const y = yNorm * treeHeight - (treeHeight / 2); // Center tree vertically
      const rCone = (1 - yNorm) * treeBaseRadius;
      
      // Spiral distribution for nice coverage
      const angle = i * 0.1 + (Math.random() * 0.5);
      const radiusJitter = rCone * Math.sqrt(Math.random()); // Uniform disk distribution at this height
      
      targetPositions[i * 3] = radiusJitter * Math.cos(angle);
      targetPositions[i * 3 + 1] = y;
      targetPositions[i * 3 + 2] = radiusJitter * Math.sin(angle);

      randoms[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3)); // Dummy, shader uses attributes
    geo.setAttribute('aChaosPos', new THREE.BufferAttribute(chaosPositions, 3));
    geo.setAttribute('aTargetPos', new THREE.BufferAttribute(targetPositions, 3));
    geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

    return { attributes: { chaosPositions, targetPositions, randoms }, geometry: geo };
  }, [count]);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smooth interpolation for the tree form
      const speed = 1.5;
      const diff = targetProgress - progressRef.current;
      progressRef.current += diff * speed * delta;
      
      materialRef.current.uniforms.uProgress.value = progressRef.current;
    }
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        args={[FoliageShaderMaterial]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;
