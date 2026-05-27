import { LogOut } from "lucide-react";
import { KidAvatarBubble } from "./KidAvatarBubble";

export function KidProfileCard({
  kidName,
  kidLevel,
  avatarSrc,
  onAvatarClick,
  onExit,
}: {
  kidName: string;
  kidLevel: string;
  avatarSrc: string;
  onAvatarClick: () => void;
  onExit: () => void;
}) {
  return (
    <div className="rounded-[2.2rem] border-4 border-white/85 bg-white/88 px-5 py-4 shadow-[0_16px_38px_rgba(32,42,68,0.12)] backdrop-blur-md">
      <div className="flex items-center gap-3 justify-between">
        <div className="min-w-0">
          <div className="text-xl font-black text-navy truncate">{kidName}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue">
              Niveau {kidLevel}
            </span>
            <span className="rounded-full bg-orange/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-orange">
              Super kid
            </span>
            <button
              type="button"
              onClick={onAvatarClick}
              className="rounded-full bg-navy/6 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-navy/70 hover:bg-blue/10 hover:text-blue transition-colors"
            >
              Avatar
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onAvatarClick}
            className="relative h-16 w-16 rounded-full overflow-hidden border-4 border-white shadow-[0_10px_22px_rgba(33,158,188,0.20)] bg-linear-to-br from-orange/25 to-yellow/30 flex items-center justify-center"
          >
            <KidAvatarBubble
              avatarSrc={avatarSrc}
              kidName={kidName}
              className="h-full w-full"
              placeholderClassName="text-xl font-black"
            />
          </button>
          <button
            type="button"
            onClick={onExit}
            className="h-11 w-11 rounded-2xl bg-navy/5 text-navy/50 hover:bg-red-50 hover:text-red-500 transition"
          >
            <LogOut className="w-5 h-5 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
}
