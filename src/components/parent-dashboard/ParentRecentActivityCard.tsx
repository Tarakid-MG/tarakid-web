import { ArrowRight } from "lucide-react";
import { ParentPanel } from "./ParentPanel";
import { getActivityIcon, type ParentActivity } from "./parentDashboardUtils";

export function ParentRecentActivityCard({
  activities,
  onViewAll,
}: {
  activities: ParentActivity[];
  onViewAll: () => void;
}) {
  return (
    <ParentPanel className="p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-[1.5rem] font-bold tracking-[-0.02em] text-navy">Activité récente</h3>
          <p className="mt-1 text-[15px] text-navy/58">Historique des activités et progrès.</p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-blue/18 bg-white px-4 py-2 text-sm font-bold text-blue transition hover:bg-blue/6"
        >
          Voir tout
        </button>
      </div>

      <div className="mt-5 space-y-2">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);

          return (
            <button
              key={activity.id}
              type="button"
              onClick={onViewAll}
              className="group flex w-full items-center gap-4 rounded-[1.35rem] px-3 py-3 text-left transition hover:bg-slate-50/90"
            >
              <div
                className={[
                  "flex h-12 w-12 items-center justify-center rounded-2xl shadow-[0_10px_22px_rgba(32,42,68,0.08)]",
                  activity.type === "video"
                    ? "bg-red-50 text-red-500"
                    : activity.type === "achievement"
                      ? "bg-gold/14 text-orange"
                      : "bg-purple-50 text-purple-500",
                ].join(" ")}
              >
                <Icon className="h-6 w-6" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[1.05rem] font-medium tracking-[-0.01em] text-navy">{activity.title}</p>
                <p className="mt-1 text-sm text-navy/55">{activity.date}</p>
              </div>

              {activity.score ? (
                <span className="rounded-full bg-turquoise/15 px-3 py-2 text-sm font-bold text-teal">{activity.score}</span>
              ) : null}

              <ArrowRight className="h-4 w-4 text-navy/25 transition group-hover:translate-x-1 group-hover:text-blue" />
            </button>
          );
        })}
      </div>
    </ParentPanel>
  );
}
