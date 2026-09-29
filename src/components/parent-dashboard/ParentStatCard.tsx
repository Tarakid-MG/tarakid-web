import type { ParentDashboardStat } from "./parentDashboardUtils";

export function ParentKpiPath({
  stats,
  onStatClick,
}: {
  stats: ParentDashboardStat[];
  onStatClick: (key: ParentDashboardStat["key"]) => void;
}) {
  return (
    <div className="rounded-4xl border border-white/80 bg-white/80 p-5 shadow-[0_18px_50px_rgba(32,42,68,0.08)] backdrop-blur-xl md:p-6">
      <div className="mb-6">
        <h3 className="text-[1.25rem] font-black tracking-[-0.02em] text-navy">
          Résumé des cours
        </h3>
        <p className="mt-1 text-sm text-navy/55">
          Suivez rapidement la situation de votre enfant.
        </p>
      </div>

      <div className="relative grid grid-cols-1 gap-3 md:grid-cols-5 md:gap-4">
        <div className="absolute left-10 right-10 top-[2.65rem] hidden h-px rounded-full bg-linear-to-r from-transparent via-slate-200 to-transparent md:block" />

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <button
              key={stat.key}
              type="button"
              onClick={() => onStatClick(stat.key)}
              className="group relative flex items-center gap-4 rounded-[1.5rem] border border-slate-100/80 bg-white/92 px-4 py-4 text-left shadow-[0_10px_24px_rgba(32,42,68,0.04)] transition hover:-translate-y-0.5 hover:border-blue/12 hover:shadow-[0_18px_38px_rgba(32,42,68,0.08)] md:min-h-[176px] md:flex-col md:items-center md:justify-start md:px-3 md:py-5 md:text-center"
            >
              <div
                className={[
                  "relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white shadow-[0_14px_28px_rgba(32,42,68,0.10)] transition group-hover:-translate-y-1",
                  stat.accent === "gold" ? "bg-gold/20 text-orange" : "",
                  stat.accent === "blue" ? "bg-blue/12 text-blue" : "",
                  stat.accent === "turquoise" ? "bg-turquoise/15 text-teal" : "",
                  stat.accent === "orange" ? "bg-orange/12 text-orange" : "",
                ].join(" ")}
              >
                <Icon className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <p className="text-[2rem] font-black leading-none tracking-[-0.03em] text-navy">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-black leading-tight text-navy">
                  {stat.label}
                </p>
                <p className="mt-2 text-xs leading-5 text-navy/50">
                  {stat.hint}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
