import type { SidebarItem, SidebarItemTone } from "./kidDashboardUtils";
import { KidAvatarBubble } from "./KidAvatarBubble";

const toneStyles: Record<
  SidebarItemTone,
  { active: string; idle: string; iconBubble: string }
> = {
  blue: {
    active: "bg-linear-to-r from-blue to-lightBlue text-white shadow-[0_10px_20px_rgba(33,158,188,0.28)]",
    idle: "bg-blue/8 text-navy hover:bg-blue/14",
    iconBubble: "bg-white/25",
  },
  turquoise: {
    active: "bg-linear-to-r from-turquoise to-lightBlue text-white shadow-[0_10px_20px_rgba(64,224,208,0.28)]",
    idle: "bg-turquoise/10 text-navy hover:bg-turquoise/18",
    iconBubble: "bg-white/25",
  },
  yellow: {
    active: "bg-linear-to-r from-yellow to-gold text-navy shadow-[0_10px_20px_rgba(239,191,4,0.28)]",
    idle: "bg-yellow/12 text-navy hover:bg-yellow/20",
    iconBubble: "bg-white/45",
  },
  orange: {
    active: "bg-linear-to-r from-orange to-yellow text-white shadow-[0_10px_20px_rgba(247,127,0,0.28)]",
    idle: "bg-orange/10 text-navy hover:bg-orange/18",
    iconBubble: "bg-white/25",
  },
  slate: {
    active: "bg-navy text-white shadow-[0_10px_20px_rgba(32,42,68,0.22)]",
    idle: "bg-slate-100 text-navy/70 hover:bg-slate-200",
    iconBubble: "bg-white/60",
  },
};

export function KidSidebarRail({
  kidName,
  avatarSrc,
  items,
  onAvatarClick,
}: {
  kidName: string;
  avatarSrc: string;
  items: SidebarItem[];
  onAvatarClick: () => void;
}) {
  return (
    <div className="inline-flex h-auto w-full flex-col items-center self-start overflow-hidden rounded-[2.8rem] border-4 border-white/85 bg-white/92 px-6 py-6 shadow-[0_18px_52px_rgba(32,42,68,0.14)] backdrop-blur-xl">
      <img src="/logo/tarakid-logo.png" alt="TaraKid" className="w-32 object-contain" />
      <button
        type="button"
        onClick={onAvatarClick}
        className="mt-7 flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-linear-to-br from-lightBlue/28 to-white shadow-[0_14px_30px_rgba(33,158,188,0.18)]"
      >
        <KidAvatarBubble
          avatarSrc={avatarSrc}
          kidName={kidName}
          className="h-full w-full"
          placeholderClassName="bg-lightBlue/18 text-[16px] font-medium"
        />
      </button>

      <nav className="mt-8 w-full space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          const style = toneStyles[item.tone];
          return (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={[
                "flex w-full items-center gap-4 rounded-[1.75rem] px-4 py-3.5 text-left transition-all",
                item.active ? style.active : style.idle,
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                  item.active ? style.iconBubble : "bg-white",
                ].join(" ")}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-[17px] font-black whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
