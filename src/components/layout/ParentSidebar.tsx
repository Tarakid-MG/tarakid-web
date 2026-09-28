import { Sparkles, Trophy } from "lucide-react";
import { ParentPanel } from "./ParentPanel";
import { Badge } from "../ui/Badge";
import type { ParentSidebarItem } from "../parent-dashboard/parentDashboardUtils";

export function ParentSidebar({
  kidName,
  items,
}: {
  kidName: string;
  items: ParentSidebarItem[];
}) {
  return (
    <div className="space-y-5">
      <ParentPanel className="px-4 py-5">
        <img
          src="/logo/tarakid-logo.png"
          alt="TaraKid"
          className="w-34 object-contain"
        />

        <p className="mt-6 px-2 text-[11px] font-black uppercase tracking-[0.22em] text-navy/32">
          Navigation
        </p>

        <nav className="mt-3 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                disabled={item.disabled}
                className={[
                  "group flex w-full items-center gap-3 rounded-[1.2rem] px-4 py-3 text-left transition-all duration-200",
                  item.active
                    ? "bg-blue/8 text-blue shadow-[inset_0_0_0_1px_rgba(33,158,188,0.10)]"
                    : item.disabled
                      ? "cursor-default text-navy/35"
                      : "text-navy/68 hover:bg-slate-50 hover:text-navy",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0_8px_18px_rgba(32,42,68,0.08)] transition",
                    item.active ? "text-blue" : "group-hover:text-blue",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="whitespace-nowrap text-[15px] font-medium tracking-[-0.01em]">
                    {item.label}
                  </div>
                </div>
                {item.badge ? (
                  <Badge variant="yellow" className="px-2 py-1 text-[10px]">
                    {item.badge}
                  </Badge>
                ) : null}
              </button>
            );
          })}
        </nav>
      </ParentPanel>

      <ParentPanel className="overflow-hidden bg-linear-to-b from-[#f4f0ff] via-[#ebe9ff] to-white p-5">
        <div className="flex items-start justify-between">
          <Sparkles className="h-5 w-5 text-gold" />
          <Trophy className="h-8 w-8 text-orange/55" />
        </div>

        <div className="mx-auto mt-3 flex h-28 w-28 items-center justify-center rounded-full bg-white/80 shadow-[0_18px_36px_rgba(32,42,68,0.10)]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-yellow via-gold to-orange shadow-[0_10px_22px_rgba(247,127,0,0.24)]">
            <Trophy className="h-10 w-10 text-white" />
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-lg font-bold tracking-[-0.02em] text-navy">
            Encouragez {kidName}
          </p>
          <p className="mt-2 text-sm leading-6 text-navy/65">
            Chaque étape compte dans son apprentissage !
          </p>
        </div>
      </ParentPanel>
    </div>
  );
}
