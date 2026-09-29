import { ArrowRight, Zap } from "lucide-react";
import { ParentOrb, ParentPanel } from "../layout/ParentPanel";
import { Card } from "../ui/Card";
import type { ParentQuickAction } from "./parentDashboardUtils";

export function ParentQuickActionsCard({
  actions,
}: {
  actions: ParentQuickAction[];
}) {
  return (
    <ParentPanel className="bg-linear-to-br from-white via-white to-[#fffaf0] p-5 md:p-6">
      <div className="flex items-start gap-3">
        <ParentOrb accent="gold" className="h-12 w-12 rounded-[1.1rem]">
          <Zap className="h-5 w-5" />
        </ParentOrb>
        <div>
          <h3 className="text-[1.45rem] font-bold tracking-[-0.02em] text-navy">
            Actions rapides
          </h3>
          <p className="mt-1 text-[15px] text-navy/58">
            Accès direct aux pages importantes
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <Card
            key={action.title}
            onClick={action.onClick}
            className="group rounded-[1.45rem] border-slate-200/90 bg-white/92 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-blue/15 hover:shadow-[0_16px_36px_rgba(32,42,68,0.08)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-navy/42">
                  {action.eyebrow}
                </p>
                <p className="mt-2 text-[1.15rem] font-bold tracking-[-0.02em] text-navy">
                  {action.title}
                </p>
              </div>
              <div
                className={[
                  "flex h-10 w-10 items-center justify-center rounded-full transition group-hover:translate-x-1",
                  action.accent === "gold"
                    ? "bg-gold/12 text-orange"
                    : "bg-blue/10 text-blue",
                ].join(" ")}
              >
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-navy/58">
              {action.description}
            </p>
          </Card>
        ))}
      </div>
    </ParentPanel>
  );
}
