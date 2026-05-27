import { ArrowRight } from "lucide-react";
import type { ActionTone, KidAction } from "./kidDashboardUtils";

export function KidActionTile({
  title,
  subtitle,
  tone,
  art,
  onClick,
}: KidAction) {
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
      onClick={onClick}
      className={`relative overflow-hidden rounded-[2.3rem] border-4 border-white bg-linear-to-br ${style.card} px-5 py-6 text-left hover:-translate-y-1 transition min-h-[285px]`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.10] bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-size-[18px_18px]" />
      <div className="pointer-events-none absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/14" />
      <div className="relative flex h-full min-h-[235px] flex-col justify-between">
        <div>
          <div className={`text-[11px] font-black uppercase tracking-[0.2em] ${style.text}`}>
            {subtitle}
          </div>
          <div className="mt-3 text-[2.15rem] font-black leading-[1.02]">{title}</div>
        </div>

        <div className="flex justify-center py-2">
          <img src={art} alt="" className="h-32 w-32 object-contain kid-float-slow" />
        </div>

        <div className="flex items-center justify-between">
          <span className={`rounded-full px-4 py-2 text-sm font-black ${style.pill}`}>
            OUVRIR
          </span>
          <span className="inline-flex items-center gap-2 font-black">
            GO <ArrowRight className="w-5 h-5" />
          </span>
        </div>
      </div>
    </button>
  );
}
