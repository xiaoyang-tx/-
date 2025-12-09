import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import Experience from './components/Experience';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.CHAOS);

  const toggleState = () => {
    setTreeState((prev) => (prev === TreeState.CHAOS ? TreeState.FORMED : TreeState.CHAOS));
  };

  return (
    <div className="relative w-full h-screen bg-[#050505]">
      {/* 3D Canvas */}
      <Canvas
        dpr={[1, 2]} // Handle pixel ratio for sharp rendering
        shadows
        gl={{ antialias: false, stencil: false, alpha: false }} // Optimization for postprocessing
      >
        <color attach="background" args={['#020804']} />
        <Suspense fallback={null}>
          <Experience treeState={treeState} />
        </Suspense>
      </Canvas>
      <Loader />

      {/* Luxury UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-8 z-10">
        
        {/* Header */}
        <header className="flex flex-col items-center mt-8 space-y-2">
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#bf953f] to-transparent"></div>
            <h1 className="font-[Cinzel] text-4xl md:text-6xl tracking-widest text-center luxury-gold-text drop-shadow-lg">
                GRAND LUXURY
            </h1>
            <h2 className="font-[Playfair Display] italic text-xl md:text-2xl text-[#a8b8a0] tracking-wide">
                Interactive Christmas Experience
            </h2>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#bf953f] to-transparent"></div>
        </header>

        {/* Controls */}
        <div className="flex flex-col items-center mb-12 pointer-events-auto">
            <button
                onClick={toggleState}
                className="group relative px-12 py-4 overflow-hidden rounded-sm bg-transparent border border-[#bf953f] transition-all duration-300 hover:shadow-[0_0_20px_rgba(191,149,63,0.5)]"
            >
                <div className="absolute inset-0 w-full h-full bg-[#bf953f] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#bf953f]"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#bf953f]"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#bf953f]"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#bf953f]"></div>
                
                <span className="relative font-[Cinzel] font-bold text-xl text-[#fcf6ba] tracking-[0.2em] group-hover:text-white transition-colors">
                    {treeState === TreeState.CHAOS ? 'ASSEMBLE' : 'SCATTER'}
                </span>
            </button>
            <p className="mt-4 font-[Playfair Display] text-[#556b5c] text-sm tracking-widest uppercase">
                {treeState === TreeState.CHAOS ? 'Awaiting Order' : 'Magnificence Achieved'}
            </p>
        </div>

        {/* Signature/Footer */}
        <div className="absolute bottom-4 right-8 text-right opacity-30">
            <p className="font-[Cinzel] text-xs text-[#bf953f]">EST. 2024</p>
        </div>
      </div>
    </div>
  );
};

export default App;
