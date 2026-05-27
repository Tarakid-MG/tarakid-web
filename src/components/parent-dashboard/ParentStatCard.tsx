import type { ParentDashboardStat } from "./parentDashboardUtils";

export function ParentKpiPath({
  stats,
  onStatClick,
}: {
  stats: ParentDashboardStat[];
  onStatClick: (key: ParentDashboardStat["key"]) => void;
}) {
  return (
    <div className="rounded-4xl border border-white/80 bg-white/75 p-5 shadow-[0_18px_50px_rgba(32,42,68,0.08)] backdrop-blur-xl">
      <div className="mb-5">
        <h3 className="text-xl font-black text-navy">Résumé des cours</h3>
        <p className="mt-1 text-sm text-navy/55">
          Suivez rapidement la situation de votre enfant.
        </p>
      </div>

      <div className="relative grid grid-cols-1 gap-5 md:grid-cols-5">
        <div className="absolute left-8 right-8 top-[2.1rem] hidden h-1 rounded-full bg-slate-100 md:block" />

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <button
              key={stat.key}
              type="button"
              onClick={() => onStatClick(stat.key)}
              className="group relative flex items-center gap-4 text-left md:flex-col md:items-center md:text-center"
            >
              <div
                className={[
                  "relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white shadow-[0_14px_28px_rgba(32,42,68,0.12)] transition group-hover:-translate-y-1",
                  stat.accent === "gold" ? "bg-gold/20 text-orange" : "",
                  stat.accent === "blue" ? "bg-blue/12 text-blue" : "",
                  stat.accent === "turquoise" ? "bg-turquoise/15 text-teal" : "",
                  stat.accent === "orange" ? "bg-orange/12 text-orange" : "",
                ].join(" ")}
              >
                <Icon className="h-6 w-6" />
              </div>

              <div>
                <p className="text-3xl font-black leading-none text-navy">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-black leading-tight text-navy">
                  {stat.label}
                </p>
                <p className="mt-1 hidden text-xs leading-5 text-navy/50 lg:block">
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