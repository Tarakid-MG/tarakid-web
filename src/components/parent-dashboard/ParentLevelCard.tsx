import { Star } from "lucide-react";
import { ParentKidAvatar } from "./ParentKidAvatar";
import { ParentPanel } from "./ParentPanel";

export function ParentLevelCard({
  kidName,
  kidLevel,
  levelLabel,
  progress,
  avatarSrc,
  onAvatarClick,
}: {
  kidName: string;
  kidLevel: string;
  levelLabel: string;
  progress: number;
  avatarSrc?: string;
  onAvatarClick: () => void;
}) {
  return (
    <button type="button" onClick={onAvatarClick} className="group w-full text-left">
      <ParentPanel className="relative overflow-hidden bg-linear-to-br from-blue via-lightBlue to-[#27c2f3] p-5 text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(33,158,188,0.18)] md:p-6">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/12" />
        <div className="absolute -bottom-14 right-20 h-36 w-36 rounded-full bg-white/10" />
        <div className="absolute left-6 top-6 h-2 w-2 rounded-full bg-white/65" />
        <div className="absolute left-20 top-11 h-1.5 w-1.5 rounded-full bg-white/50" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow text-yellow" />
              <span className="text-[0.95rem] font-bold uppercase tracking-[0.08em]">Niveau {kidLevel}</span>
            </div>
            <p className="mt-2 text-[1.65rem] font-bold leading-tight tracking-[-0.03em]">{levelLabel}</p>
            <p className="mt-6 text-sm font-medium text-white/86">Progression de l&apos;apprentissage</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="h-4 flex-1 overflow-hidden rounded-full bg-white/22">
                <div
                  className="h-full rounded-full bg-linear-to-r from-[#83ffd9] to-[#24e0c1] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-2xl font-bold tracking-[-0.03em]">{progress}%</span>
            </div>
          </div>

          <div className="hidden shrink-0 md:block">
            <div className="h-36 w-36 overflow-hidden rounded-full border-4 border-white/70 shadow-[0_18px_34px_rgba(32,42,68,0.18)] transition group-hover:scale-[1.03]">
              <ParentKidAvatar
                kidName={kidName}
                avatarSrc={avatarSrc}
                className="h-full w-full"
                fallbackClassName="text-4xl font-black text-white"
              />
            </div>
          </div>
        </div>
      </ParentPanel>
    </button>
  );
}
