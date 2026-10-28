import React from 'react';
import { Film, Sparkles, Clapperboard, ChevronRight, Compass } from 'lucide-react';

interface OpeningScreenProps {
  onEnter: () => void;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({ onEnter }) => {
  return (
    <div
      onClick={onEnter}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onEnter();
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden transition-all duration-700 bg-[#070305]"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 35%, rgba(115, 22, 39, 0.45) 0%, rgba(59, 9, 20, 0.7) 45%, #070305 85%),
          radial-gradient(rgba(245, 181, 200, 0.04) 1px, transparent 0)
        `,
        backgroundSize: '100% 100%, 26px 26px',
      }}
    >
      {/* Top and bottom cinematic letterbox borders with vintage film perfs */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-black/90 border-b border-[#42101b] flex items-center justify-between px-6 z-10">
        <div className="flex items-center space-x-3 text-xs tracking-[0.25em] text-[#e094aa] font-mono-film">
          <Clapperboard className="w-4 h-4 text-[#f5b5c8]" />
          <span>SCENE 01 / TAKE 01</span>
        </div>
        <div className="text-xs tracking-[0.3em] text-[#c4adb5] font-mono-film uppercase">
          Demo Innovation Lab Archives
        </div>
        <div className="text-xs tracking-[0.2em] text-[#f5b5c8]/80 font-mono-film">
          24 FPS • SOUND
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-14 bg-black/90 border-t border-[#42101b] flex items-center justify-between px-6 z-10">
        <div className="text-xs text-[#c4adb5]/80 font-mono-film">
          EST. 2026 • MAKESPACE PROTOCOL
        </div>
        <div className="text-xs text-[#f5b5c8] font-mono-film animate-pulse flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-[#f5b5c8]" />
          <span>TAP ANYWHERE TO ENTER</span>
        </div>
        <div className="text-xs text-[#c4adb5]/80 font-mono-film">
          REEL #042
        </div>
      </div>

      {/* Cozy Vignette & Film Light Beam */}
      <div className="absolute inset-0 pointer-events-none cinema-vignette opacity-80" />
      <div className="absolute -top-32 w-[600px] h-[600px] rounded-full bg-gradient-to-b from-[#f5b5c8]/10 via-[#8a1731]/15 to-transparent blur-3xl pointer-events-none" />

      {/* Main Cinematic Title Card */}
      <div className="relative z-20 max-w-3xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Film Reel Motif Badge */}
        <div className="mb-6 inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#240810]/80 border border-[#8a1731]/60 text-[#f5b5c8] text-xs font-mono-film tracking-widest uppercase shadow-lg shadow-[#5c0f20]/20">
          <Film className="w-3.5 h-3.5 text-[#f5b5c8]" />
          <span>Shared Resource & Makerspace Network</span>
        </div>

        {/* Grand Title: IDLETOIDEA */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black font-cinematic tracking-[0.08em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#fff2f6] via-[#fcd5e0] to-[#f5b5c8] drop-shadow-[0_10px_25px_rgba(245,181,200,0.3)]">
          IDLETOIDEA
        </h1>

        {/* Aesthetic Subtitle */}
        <div className="flex items-center justify-center space-x-4 my-5 w-full">
          <div className="h-[1px] w-16 sm:w-24 bg-gradient-to-r from-transparent via-[#8a1731] to-[#f5b5c8]/50" />
          <p className="text-sm sm:text-base md:text-lg font-serif-cozy italic tracking-wide text-[#fde8ef]">
            Where dormant tools transform into brilliant prototypes
          </p>
          <div className="h-[1px] w-16 sm:w-24 bg-gradient-to-l from-transparent via-[#8a1731] to-[#f5b5c8]/50" />
        </div>

        {/* Narrative / Problem quote in cozy filmy vibe */}
        <div className="mt-2 mb-8 p-5 rounded-2xl bg-[#1a060e]/80 border border-[#5c0f20]/70 backdrop-blur-md max-w-xl text-xs sm:text-sm text-[#e4ccd3] leading-relaxed shadow-2xl relative">
          <span className="text-[#f5b5c8] text-2xl font-serif-cozy absolute -top-3 left-4">“</span>
          <p className="italic pt-1">
            Useful 3D printers, laser cutters, and electronics benches sit idle behind locked doors,
            while creators search for equipment. IDLETOIDEA unlocks them with safety verification,
            fair waitlists, and accountable handovers.
          </p>
          <div className="mt-3 text-[11px] font-mono-film text-[#f5b5c8]/80 text-right">
            — The Makerspace Manifest
          </div>
        </div>

        {/* Tap on screen interactive cue */}
        <div className="group inline-flex items-center space-x-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#5c0f20] via-[#8a1731] to-[#5c0f20] text-[#fff2f6] font-medium text-sm tracking-wide border border-[#f5b5c8]/40 shadow-xl shadow-[#8a1731]/40 hover:scale-105 transition-all duration-300">
          <Compass className="w-4 h-4 text-[#f5b5c8] animate-spin" style={{ animationDuration: '8s' }} />
          <span className="font-semibold tracking-wider">TAP OR CLICK TO ENTER</span>
          <ChevronRight className="w-4 h-4 text-[#f5b5c8] group-hover:translate-x-1 transition-transform" />
        </div>

        <div className="mt-6 flex items-center space-x-6 text-[11px] font-mono-film text-[#c4adb5]/70">
          <span>• FAIR ALLOCATION</span>
          <span>• RISK-BASED SAFETY</span>
          <span>• AUDIT TRAIL</span>
        </div>
      </div>
    </div>
  );
};
