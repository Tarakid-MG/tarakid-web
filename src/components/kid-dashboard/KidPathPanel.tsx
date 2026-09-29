import { Star } from "lucide-react";
import { Card } from "../ui/Card";

export function KidPathPanel({ starsProgress }: { starsProgress: number }) {
  return (
    <Card
      variant="parentPanel"
      className="kid-pop-in overflow-hidden rounded-[2.5rem] border-4 border-white/85 shadow-[0_16px_42px_rgba(32,42,68,0.10)]"
    >
      <div className="bg-linear-to-br from-lightBlue via-white to-turquoise/35 px-5 py-4">
        <div className="text-xl font-black text-blue uppercase tracking-[0.12em]">
          Mon parcours
        </div>
      </div>
      <div className="relative h-[215px] overflow-hidden bg-[linear-gradient(180deg,#8ed7ff_0%,#cff4ff_42%,#c8f7a8_100%)]">
        <div className="absolute inset-x-0 top-0 h-12 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.8),transparent_18%),radial-gradient(circle_at_65%_30%,rgba(255,255,255,0.75),transparent_16%),radial-gradient(circle_at_80%_65%,rgba(255,255,255,0.78),transparent_12%)]" />
        <div className="absolute left-1/2 top-7 -translate-x-1/2 h-16 w-16 rounded-[1.4rem] bg-[#d8d0ff] border-4 border-white shadow-[0_10px_16px_rgba(126,91,239,0.18)]" />
        <div className="kid-float-slow absolute left-1/2 top-[22px] -translate-x-1/2 text-4xl">🏰</div>
        <div className="absolute inset-x-10 bottom-10 h-7 rounded-full bg-white/78 border border-white shadow-inner" />
        <div className="kid-dance absolute left-[14%] bottom-[41px] h-6 w-6 rounded-full bg-yellow border-4 border-white shadow-md flex items-center justify-center">
          <Star className="w-3.5 h-3.5 text-navy fill-current" />
        </div>
        {[34, 57, 79].map((left, index) => (
          <div
            key={left}
            className="absolute bottom-[39px] h-10 w-10 rounded-full border-4 border-white bg-white/88 shadow-md flex items-center justify-center"
            style={{ left: `${left}%` }}
          >
            {index < starsProgress - 1 ? (
              <Star className="kid-sparkle w-5 h-5 text-yellow fill-current" />
            ) : (
              <span className="kid-wiggle inline-block text-lg">🔒</span>
            )}
          </div>
        ))}
        <div className="absolute left-8 bottom-4 h-16 w-16 rounded-full bg-teal/22 blur-xl" />
        <div className="absolute right-8 top-16 h-14 w-14 rounded-full bg-yellow/18 blur-xl" />
      </div>
    </Card>
  );
}
