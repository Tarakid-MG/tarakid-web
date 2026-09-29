import { LogOut } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
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
    <Card
      variant="parentPanel"
      className="kid-pop-in kid-stagger-2 rounded-[2.2rem] border-4 border-white/85 bg-white/88 px-5 py-4 transition hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3 justify-between">
        <div className="min-w-0">
          <div className="text-xl font-black text-navy truncate">{kidName}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              variant="blue"
              className="bg-blue/10 px-3 py-1 text-[10px] tracking-[0.2em] shadow-none"
            >
              Niveau {kidLevel}
            </Badge>
            <Badge
              variant="orange"
              className="bg-orange/10 px-3 py-1 text-[10px] tracking-[0.2em] shadow-none"
            >
              Super kid
            </Badge>
            <Button
              onClick={onAvatarClick}
              variant="ghost"
              className="rounded-full bg-navy/6 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-navy/70 hover:bg-blue/10 hover:text-blue"
            >
              Avatar
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={onAvatarClick}
            variant="ghost"
            className="kid-tap-bounce relative h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-linear-to-br from-orange/25 to-yellow/30 p-0 shadow-[0_10px_22px_rgba(33,158,188,0.20)] hover:scale-110"
          >
            <KidAvatarBubble
              avatarSrc={avatarSrc}
              kidName={kidName}
              className="h-full w-full"
              placeholderClassName="text-xl font-black"
            />
          </Button>
          <Button
            onClick={onExit}
            variant="ghost"
            size="iconSm"
            className="rounded-2xl bg-navy/5 text-navy/50 hover:bg-red-50 hover:text-red-500"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
