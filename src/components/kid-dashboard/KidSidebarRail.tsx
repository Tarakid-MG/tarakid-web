import type { SidebarItem } from "./kidDashboardUtils";
import { KidAvatarBubble } from "./KidAvatarBubble";

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
          return (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={[
                "flex w-full items-center gap-3.5 rounded-[1.75rem] px-5 py-3.5 text-left transition-all",
                item.active
                  ? "bg-linear-to-r from-blue to-lightBlue text-white shadow-[0_10px_20px_rgba(33,158,188,0.22)]"
                  : "text-navy/75 hover:bg-blue/8",
              ].join(" ")}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[15px] font-black whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
