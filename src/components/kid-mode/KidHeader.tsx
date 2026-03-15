import React from "react";
import { Star, Trophy, Flame, LogOut } from "lucide-react";

interface KidHeaderProps {
  selectedKid: {
    name: string;
    level?: string;
  };
  loading: boolean;
  nextClassDate: string;
  onExit: () => void;
}

export const KidHeader: React.FC<KidHeaderProps> = ({
  selectedKid,
  loading,
  nextClassDate,
  onExit,
}) => {
  const getKidAvatar = (name: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
  };

  return (
    <header className="max-w-7xl mx-auto flex items-center justify-between mb-8 relative z-50">
      {/* Next Class Pill */}
      <div className="bg-white/90 backdrop-blur-sm rounded-full pl-2 pr-6 py-2 flex items-center gap-3 shadow-lg border-2 border-white/50">
        <div className="w-10 h-10 rounded-full bg-blue/10 flex items-center justify-center overflow-hidden border-2 border-navy/10">
          <img
            src="https://api.dicebear.com/7.x/bottts/svg?seed=owl"
            alt="Owl"
            className="w-full h-full"
          />
        </div>
        <div>
          <p className="text-[10px] font-black text-navy/40 uppercase leading-none mb-0.5">
            Next class:
          </p>
          <p className="text-sm font-black text-navy leading-none">
            {loading ? "..." : nextClassDate}
          </p>
        </div>
      </div>

      {/* Stats & Profile */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 group cursor-default">
            <Star className="w-8 h-8 text-yellow fill-current drop-shadow-sm" />
            <span className="text-2xl font-black text-navy drop-shadow-[0_2px_0_rgba(255,255,255,0.8)]">
              21234
            </span>
          </div>
          <div className="flex items-center gap-1.5 group cursor-default">
            <Trophy className="w-8 h-8 text-blue fill-current drop-shadow-sm" />
            <span className="text-2xl font-black text-navy drop-shadow-[0_2px_0_rgba(255,255,255,0.8)]">
              2344
            </span>
          </div>
          <div className="flex items-center gap-1.5 group cursor-default relative">
            <div className="bg-orange p-1.5 rounded-full shadow-lg">
              <Flame className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-2xl font-black text-navy drop-shadow-[0_2px_0_rgba(255,255,255,0.8)]">
              23
            </span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-full pl-6 pr-2 py-2 flex items-center gap-3 shadow-lg border-2 border-white/50">
          <div className="flex flex-col items-end">
            <span className="text-lg font-black text-navy leading-none">
              {selectedKid.name}
            </span>
            {selectedKid.level && (
              <span className="text-[10px] font-black text-blue uppercase tracking-widest mt-0.5">
                Niveau {selectedKid.level}
              </span>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-orange/20 overflow-hidden border-2 border-orange/50">
            <img
              src={getKidAvatar(selectedKid.name)}
              alt={selectedKid.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <button
          onClick={onExit}
          className="hover:scale-110 transition-transform duration-300"
        >
          <LogOut className="w-6 h-6 text-navy/40" />
        </button>
      </div>
    </header>
  );
};
