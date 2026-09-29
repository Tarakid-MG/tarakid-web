import React from "react";
import { Sparkles, Star, User, VideoOff } from "lucide-react";
import type { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";

interface VideoPanelProps {
  localRef: React.RefObject<HTMLDivElement | null>;
  remoteRef: React.RefObject<HTMLDivElement | null>;
  remoteUser: IAgoraRTCRemoteUser | null;
  videoEnabled: boolean;
  stars: number;
  totalStars?: number;
  isTeacher: boolean;
  starBurstKey: number;
  isAwardingStar?: boolean;
  onAddStar: () => void;
}

export const VideoPanel: React.FC<VideoPanelProps> = ({
  localRef,
  remoteRef,
  remoteUser,
  videoEnabled,
  stars,
  totalStars = 0,
  isTeacher,
  starBurstKey,
  isAwardingStar = false,
  onAddStar,
}) => {
  return (
    <div className="w-80 xl:w-[22rem] bg-[linear-gradient(180deg,#f8fbfd_0%,#f2f9fb_100%)] flex flex-col border-l border-slate-100/70">
      <div className="px-5 pt-5 pb-3 border-b border-slate-100/80">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black text-navy/40 uppercase tracking-[0.18em]">
              Salle vidéo
            </div>
            <div className="text-sm font-black text-navy">
              {isTeacher ? "Coach + élève" : "Professeur + toi"}
            </div>
          </div>
          <div className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-orange shadow-sm">
            Live
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[220px] bg-slate-200 relative overflow-hidden m-4 mb-3 rounded-[1.8rem] border-4 border-white shadow-[0_14px_26px_rgba(32,42,68,0.10)]">
        {remoteUser ? (
          <div ref={remoteRef} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,rgba(76,201,240,0.14),transparent_30%),linear-gradient(180deg,#e8f3f7,#dce9ef)] gap-2">
            <User className="w-12 h-12 text-slate-400" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              {isTeacher ? "Élève" : "Professeur"}
            </p>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-blue/90 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm border border-white/20">
          {isTeacher ? "Élève" : "Maître"}
        </div>
      </div>

      <div className="mx-4 mb-3 rounded-[1.8rem] bg-white flex flex-col items-center justify-center p-5 border-4 border-white relative overflow-hidden shadow-[0_14px_26px_rgba(32,42,68,0.10)]">
        <div className="absolute inset-x-0 top-0 h-2 bg-linear-to-r from-yellow via-orange to-lightBlue" />
        <div className="absolute inset-x-6 top-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Récompenses
            </p>
            <p className="text-xs font-bold text-navy/40">
              {isTeacher ? "Clique pour encourager" : "Étoiles de la leçon"}
            </p>
          </div>
          <div className="rounded-2xl bg-gold/15 border border-gold/30 px-3 py-2 text-right">
            <div className="flex items-center justify-end gap-1 text-gold font-black">
              <Star className="w-4 h-4 fill-gold" />
              {totalStars}
            </div>
            <div className="text-[9px] font-black text-navy/35 uppercase">
              total
            </div>
          </div>
        </div>

        {starBurstKey > 0 && (
          <div key={starBurstKey} className="pointer-events-none absolute inset-0 flex items-center justify-center z-20">
            <div className="classroom-star-burst">
              <Star className="w-16 h-16 text-gold fill-gold drop-shadow-xl" />
              <Sparkles className="absolute -top-4 -right-5 w-7 h-7 text-yellow fill-yellow animate-ping" />
              <Sparkles className="absolute -bottom-3 -left-4 w-6 h-6 text-orange fill-orange animate-ping" />
            </div>
            <div className="classroom-star-float classroom-star-float-a">⭐</div>
            <div className="classroom-star-float classroom-star-float-b">⭐</div>
            <div className="classroom-star-float classroom-star-float-c">⭐</div>
          </div>
        )}

        <div className="grid grid-cols-5 gap-3 mt-16">
          {[...Array(10)].map((_, i) => (
            <button
              type="button"
              key={i}
              disabled={!isTeacher || isAwardingStar || stars >= 10}
              onClick={onAddStar}
              className={[
                "transition-transform active:scale-90 disabled:cursor-default",
                isTeacher && stars < 10 ? "cursor-pointer hover:scale-125" : "",
                i === stars - 1 && starBurstKey > 0 ? "classroom-star-pop" : "",
              ].join(" ")}
              aria-label={isTeacher ? "Donner une étoile" : undefined}
            >
              <svg
                viewBox="0 0 24 24"
                className={`w-7 h-7 drop-shadow-sm transition-colors ${i < stars ? "fill-yellow-400" : "fill-slate-100"}`}
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </button>
          ))}
        </div>

        <p className="mt-3 text-[10px] font-black text-blue uppercase tracking-widest">
          +{stars} cette leçon
        </p>
      </div>

      <div className="flex-1 min-h-[220px] bg-slate-200 relative overflow-hidden m-4 mt-0 rounded-[1.8rem] border-4 border-white shadow-[0_14px_26px_rgba(32,42,68,0.10)]">
        <div ref={localRef} className="w-full h-full object-cover scale-x-[-1]" />
        {!videoEnabled && (
          <div className="absolute inset-0 bg-slate-300/50 backdrop-blur-sm flex items-center justify-center">
            <VideoOff className="w-12 h-12 text-white/50" />
          </div>
        )}
        <div className="absolute bottom-4 left-4">
          <div className="bg-teal text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm border border-white/20">
            Moi
          </div>
        </div>
      </div>
    </div>
  );
};
