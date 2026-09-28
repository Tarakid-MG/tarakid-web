import { ArrowRight } from "lucide-react";
import type { ActionTone, KidAction } from "./kidDashboardUtils";

const staggerClasses = ["", "kid-stagger-1", "kid-stagger-2", "kid-stagger-3"];

export function KidActionTile({
  title,
  subtitle,
  tone,
  art,
  onClick,
  comingSoon,
  index = 0,
}: KidAction & { index?: number }) {
  const toneStyles: Record<ActionTone, { card: string; pill: string; text: string }> = {
    yellow: {
      card: "from-yellow to-gold text-navy shadow-[0_12px_0_rgba(239,191,4,0.38)]",
      pill: "bg-white text-navy",
      text: "text-navy/70",
    },
    turquoise: {
      card: "from-turquoise to-lightBlue text-white shadow-[0_12px_0_rgba(64,224,208,0.34)]",
      pill: "bg-white text-navy",
      text: "text-white/80",
    },
    purple: {
      card: "from-[#a271ff] to-[#7e5bef] text-white shadow-[0_12px_0_rgba(126,91,239,0.34)]",
      pill: "bg-white text-navy",
      text: "text-white/80",
    },
    orange: {
      card: "from-yellow to-orange text-white shadow-[0_12px_0_rgba(247,127,0,0.36)]",
      pill: "bg-white text-navy",
      text: "text-white/82",
    },
    blue: {
      card: "from-blue to-lightBlue text-white shadow-[0_12px_0_rgba(33,158,188,0.34)]",
      pill: "bg-white text-navy",
      text: "text-white/82",
    },
  };

  const style = toneStyles[tone];

  return (
    <button
      type="button"
      onClick={comingSoon ? undefined : onClick}
      aria-disabled={comingSoon}
      className={`kid-pop-in ${staggerClasses[index % staggerClasses.length]} relative overflow-hidden rounded-[2.3rem] border-4 border-white bg-linear-to-br ${style.card} px-5 py-6 text-left transition min-h-[285px] ${
        comingSoon
          ? "cursor-not-allowed opacity-80 saturate-[0.6]"
          : "kid-tap-bounce hover:-translate-y-1"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.10] bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-size-[18px_18px]" />
      <div className="pointer-events-none absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/14" />

      {comingSoon ? (
        <span className="absolute right-4 top-4 z-10 -rotate-6 rounded-xl bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.1em] text-navy shadow-md">
          Bientôt
        </span>
      ) : null}

      <div className="relative flex h-full min-h-[235px] flex-col justify-between">
        <div>
          <div className={`text-[11px] font-black uppercase tracking-[0.2em] ${style.text}`}>
            {subtitle}
          </div>
          <div className="mt-3 text-[2.15rem] font-black leading-[1.02]">{title}</div>
        </div>

        <div className="flex justify-center py-2">
          <img
            src={art}
            alt=""
            className={`h-32 w-32 object-contain ${comingSoon ? "kid-float-slow" : "kid-dance"}`}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className={`rounded-full px-4 py-2 text-sm font-black ${style.pill}`}>
            {comingSoon ? "PATIENCE !" : "OUVRIR"}
          </span>
          {!comingSoon && (
            <span className="inline-flex items-center gap-2 font-black">
              GO <ArrowRight className="w-5 h-5" />
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
