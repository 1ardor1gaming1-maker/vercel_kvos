import React, { useState } from "react";
import { Heart } from "lucide-react";
import { translations, Language } from "../utils/translations";

export default function Memorial({ language }: { language: Language }) {
  const [lit, setLit] = useState(true);
  const [ripCount, setRipCount] = useState(228); // build 228 is the build number, sweet!
  const [claimed, setClaimed] = useState(false);

  const t = translations[language];

  const handleRipAction = () => {
    if (!claimed) {
      setRipCount(prev => prev + 1);
      setClaimed(true);
    } else {
      setRipCount(prev => prev - 1);
      setClaimed(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto" id="memorial-container">
      <div className="relative overflow-hidden rounded-3xl glass border border-white/5 shadow-2xl p-6 md:p-8 text-center flex flex-col items-center backdrop-blur-md">
        
        {/* Soft atmospheric radial gradient behind candle */}
        <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full filter blur-[100px] transition-all duration-1000 ${
          lit ? "bg-amber-500/10" : "bg-slate-900/0"
        }`} />

        {/* Floating dust-like background sparkles */}
        {lit && (
          <div className="absolute inset-0 pointer-events-none opacity-25 animate-pulse">
            <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></div>
            <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-amber-400 rounded-full animate-ping delay-200"></div>
            <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-amber-300 rounded-full"></div>
          </div>
        )}

        {/* Small subtitle indicator */}
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-6 select-none">
          {t.memorial_card_tribute}
        </div>

        {/* Candle Vector Animation */}
        <div className="relative mb-6 cursor-pointer" onClick={() => setLit(!lit)} title="Click to Light/Extinguish candle">
          
          {/* Candle Fire */}
          {lit ? (
            <div className="relative w-8 h-12 mx-auto animate-pulse flex justify-center">
              {/* Outer yellow fire-glow halo */}
              <div className="absolute bottom-0 w-6 h-10 bg-amber-500/40 rounded-full blur-[3px] animate-bounce" />
              {/* Mid orange core */}
              <div className="absolute bottom-0 w-4 h-8 bg-amber-600 rounded-full blur-[1.5px]" style={{ animationDelay: "150ms" }} />
              {/* Inner blue base */}
              <div className="absolute bottom-0 w-2.5 h-4 bg-sky-400/90 rounded-full" />
              {/* Candle flame tip trailing */}
              <div className="absolute -top-1 w-1.5 h-3 bg-amber-300 rounded-full blur-[0.5px]" />
            </div>
          ) : (
            // Extinguished smoke trail effect
            <div className="w-8 h-12 mx-auto flex items-end justify-center select-none">
              <div className="w-0.5 h-5 bg-slate-700/50 rounded animate-pulse" />
            </div>
          )}

          {/* Wick */}
          <div className="w-0.5 h-3 bg-slate-800 mx-auto" />

          {/* Candle Body */}
          <div className="w-9 h-14 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 rounded-t-sm shadow-md border-r border-slate-500/10 flex flex-col justify-end">
            {/* Dripping wax layout */}
            <div className="w-2.5 h-6 bg-slate-50/90 rounded-b-full ml-1" />
            <div className="w-1.5 h-3 bg-slate-50/90 rounded-b-full ml-5 -mt-3" />
            <div className="w-1 h-2 bg-slate-50/90 rounded-b-full ml-3" />
            {/* Candle base */}
            <div className="w-11 h-1.5 bg-slate-500 rounded-sm -mx-1 self-center" />
          </div>

          {/* Candle holder dish */}
          <div className="w-16 h-2 bg-slate-800 rounded-full border-t border-slate-700/20 shadow-md flex items-center justify-center -mt-0.5">
            <div className="w-12 h-1 bg-slate-900 rounded" />
          </div>

        </div>

        {/* Heartfelt Epitaph Quote */}
        <h2 className="text-xl md:text-2xl font-serif text-slate-100 font-medium italic tracking-wide">
          {t.memorial_title}
        </h2>
        
        {/* Cat years/dates */}
        <div className="text-sm font-mono text-amber-500/90 font-bold tracking-widest mt-2">
          04.10.2023 — 15.05.2026
        </div>

        {/* Loving paragraph describing Musya's place in the KV/OS project */}
        <p className="text-xs md:text-sm text-slate-400 max-w-lg leading-relaxed mt-4 font-sans font-light">
          {t.memorial_desc}
        </p>

        {/* Interactivity RIP counter action button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleRipAction}
            className={`px-5 py-2.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer ${
              claimed
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25 border-transparent"
                : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-slate-100 border border-white/10"
            }`}
            id="rip-tribute-btn"
          >
            <Heart className={`w-4 h-4 ${claimed ? "fill-current scale-110" : "text-indigo-400"}`} />
            {claimed ? t.memorial_btn_sent : t.memorial_btn_honor}
          </button>

          <span className="text-xs font-mono text-slate-400 bg-white/3 px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
            {t.memorial_lit_by.replace("{count}", ripCount.toString())}
          </span>
        </div>

      </div>
    </div>
  );
}
