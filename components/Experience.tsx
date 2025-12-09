import React from 'react';
import { PerspectiveCamera, OrbitControls, Environment, Float, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { TreeState } from '../types';
import Foliage from './Foliage';
import Ornaments from './Ornaments';

interface ExperienceProps {
  treeState: TreeState;
}

const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 22]} fov={50} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={40}
        rotateSpeed={0.5}
      />

      {/* Lighting & Environment */}
      <Environment preset="lobby" background={false} />
      <ambientLight intensity={0.2} color="#001a10" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={200} 
        color="#fffae0" 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={50} color="#00ff88" />

      {/* The Tree Assembly */}
      <group position={[0, -2, 0]}>
        <Float 
          speed={treeState === TreeState.FORMED ? 1 : 0.2} 
          rotationIntensity={treeState === TreeState.FORMED ? 0.1 : 0.5} 
          floatIntensity={treeState === TreeState.FORMED ? 0.2 : 1}
        >
            <Foliage state={treeState} count={12000} />
            <Ornaments state={treeState} type="GIFT" count={30} />
            <Ornaments state={treeState} type="BALL" count={200} />
            <Ornaments state={treeState} type="LIGHT" count={400} />
        </Float>
      </group>
      
      {/* Floor Reflections */}
      <ContactShadows 
        opacity={0.7} 
        scale={40} 
        blur={2} 
        far={10} 
        resolution={256} 
        color="#000000" 
        position={[0, -8, 0]}
      />

      {/* Post Processing for Cinematic Glow */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} 
          intensity={1.5} 
          levels={9} 
          mipmapBlur 
        />
        <Vignette offset={0.1} darkness={0.6} eskil={false} blendFunction={BlendFunction.NORMAL} />
        <ToneMapping />
      </EffectComposer>
    </>
  );
};

export default Experience;
