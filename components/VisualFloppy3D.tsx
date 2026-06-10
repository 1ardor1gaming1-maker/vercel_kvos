import React, { useState } from "react";
import { Language } from "../utils/translations";

interface VisualFloppy3DProps {
  language: Language;
  checksum?: string;
  isCompiling?: boolean;
  uploadedFileName?: string;
}

export default function VisualFloppy3D({
  language,
  checksum,
  isCompiling,
  uploadedFileName,
}: VisualFloppy3DProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; //x position within the element
    const y = e.clientY - rect.top;  //y position within the element
    
    // Calculate tilt relative to the center
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = (centerY - y) / 6; // Max 15 degrees tilt
    const tiltY = (x - centerX) / 6;

    setRotate({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-950/40 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden" id="interactive-3d-floppy-section">
      <div className="absolute top-3 left-4 flex items-center gap-1.5 z-10">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
        <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">
          {language === "ru" ? "3D Эмуляция дискеты" : "Retro 3D Floppy Mockup"}
        </span>
      </div>

      <p className="text-[10px] text-slate-500 font-mono mb-6 mt-2 text-center max-w-xs">
        {language === "ru" 
          ? "Проведите курсором для интерактивного 3D вращения" 
          : "Hover and move cursor for spatial 3D feedback"}
      </p>

      {/* Main 3D Container with Perspective */}
      <div 
        className="relative w-44 h-44 cursor-grab active:cursor-grabbing select-none"
        style={{ perspective: "1000px" }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Actual 3D Floppy Body */}
        <div 
          className="w-full h-full rounded-xl shadow-2xl transition-all duration-300 relative border border-white/10"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) ${isHovered ? "scale(1.05)" : "scale(1)"}`,
            backgroundColor: "#11141e",
            boxShadow: isHovered 
              ? "0 25px 40px -10px rgba(99, 102, 241, 0.25)" 
              : "0 15px 30px -15px rgba(0, 0, 0, 0.7)",
          }}
        >
          {/* Subtle Outer 3D Bevel Edge Layers for realistic physical depth */}
          <div 
            className="absolute inset-0 rounded-xl bg-slate-900 pointer-events-none" 
            style={{ transform: "translateZ(-3px)", border: "1px solid rgba(255,255,255,0.05)" }}
          />
          <div 
            className="absolute inset-0 rounded-xl bg-black pointer-events-none" 
            style={{ transform: "translateZ(-6px)" }}
          />

          {/* Front Face Panel */}
          <div className="absolute inset-0 p-3 flex flex-col justify-between" style={{ transform: "translateZ(1px)" }}>
            
            {/* Upper part: Sliding Metal Shutter */}
            <div className="flex justify-between items-start">
              {/* Write Protect Notch cutout on top-right */}
              <div className="w-4 h-4 bg-transparent border-t-2 border-r-2 border-slate-950/80 rounded-tr" />
              
              {/* Metal Slide Cover with standard spring grooves */}
              <div 
                className="w-16 h-12 bg-gradient-to-r from-zinc-300 via-zinc-400 to-zinc-200 rounded-b border border-zinc-500 shadow-md flex items-center justify-around px-1.5 transition-all duration-500 relative"
                style={{
                  transform: isCompiling ? "translateX(-20px)" : "translateX(0)",
                }}
              >
                {/* Grooves */}
                <div className="w-1 h-8 bg-zinc-650 opacity-30 rounded-full" />
                <div className="w-1 h-8 bg-zinc-650 opacity-30 rounded-full" />
                <div className="w-1 h-8 bg-zinc-650 opacity-30 rounded-full" />
                
                {/* Arrow indicator */}
                <div className="absolute bottom-1 right-2 text-[8px] font-mono text-zinc-600 font-bold">▲</div>
              </div>
            </div>

            {/* Middle cutout ring for floppy wheel spindle (indicated nicely layout wise) */}
            <div className="absolute top-[45%] left-4 w-5 h-5 rounded-full border border-zinc-800 bg-[#07090f] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            </div>

            {/* Bottom Section: Custom Floppy Paper Sticker Label */}
            <div className="w-full bg-slate-100 rounded-lg p-2 flex flex-col text-[#0c0f16] shadow-inner select-none min-h-[64px] border border-white">
              
              {/* Stripe Accent Indicator */}
              <div className="w-full h-1.5 bg-indigo-600 rounded-full mb-1.5 animate-pulse" />
              
              {/* Title text */}
              <div className="text-[10px] font-mono font-black tracking-tighter uppercase truncate">
                {uploadedFileName ? uploadedFileName : "KV/OS v0.11.1"}
              </div>
              
              {/* Sub-label info */}
              <div className="text-[8px] font-mono leading-none text-slate-500 font-bold uppercase mt-1">
                {checksum ? (
                  <span className="text-indigo-600 tracking-wider text-[7px]">{checksum}</span>
                ) : isCompiling ? (
                  <span className="animate-pulse text-amber-600">COMPILING...</span>
                ) : (
                  <span>FAT12 FORMAT</span>
                )}
              </div>

              {/* Grid layout decoration */}
              <div className="flex justify-between items-center mt-auto border-t border-slate-200 pt-0.5 text-[6px] text-slate-400 font-mono">
                <span>1.44 MB</span>
                <span>CH: 80 / S: 18</span>
              </div>
            </div>

          </div>

          {/* Write protect sliding plastic tab (bottom left) */}
          <div className="absolute bottom-3 left-3 w-3 h-3 bg-red-600 rounded-sm shadow-inner flex items-center justify-center text-[5px] text-white font-mono font-bold">
            🔒
          </div>

          {/* Back side of the floppy disk */}
          <div 
            className="absolute inset-0 rounded-xl bg-slate-950 p-3 flex flex-col justify-between" 
            style={{ 
              transform: "translateZ(-10px) rotateY(180deg)",
              border: "1px solid rgba(255,255,255,0.05)"
            }}
          >
            {/* Hub disk with standard metal ring */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-zinc-400 via-zinc-100 to-zinc-500 border-2 border-zinc-600 shadow-inner flex items-center justify-center absolute top-12 left-16">
              <div className="w-3 h-3 bg-zinc-800 rounded relative">
                <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-yellow-500 rounded" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating details banner */}
      <div className="mt-5 text-[10px] font-mono text-slate-400 border border-white/5 bg-white/2 p-2 rounded-xl text-center w-full">
        {isCompiling ? (
          <span className="text-amber-400 animate-pulse">
            {language === "ru" ? "⚠️ Диск вращается по спирали..." : "⚠️ Drive spindle rotating..."}
          </span>
        ) : checksum ? (
          <span className="text-emerald-400 font-bold">
            {language === "ru" ? "✓ Диск успешно смонтирован" : "✓ Floppy image mounted"}
          </span>
        ) : (
          <span>{language === "ru" ? "Дисковод готов к сборке" : "Drive ready for conjoining"}</span>
        )}
      </div>
    </div>
  );
}
