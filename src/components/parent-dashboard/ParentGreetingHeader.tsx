import type { ReactNode } from "react";
import { ArrowRight, Gamepad2, Sparkles } from "lucide-react";
import { ParentOrb, ParentPanel } from "./ParentPanel";

export function ParentGreetingHeader({
  parentName,
  kidName,
  onKidMode,
  onSubscription,
}: {
  parentName: string;
  kidName: string;
  onKidMode: () => void;
  onSubscription: () => void;
}) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue/10 bg-white/70 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-blue shadow-[0_10px_24px_rgba(32,42,68,0.06)]">
            <Sparkles className="h-4 w-4 text-gold" />
            Espace parent
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-navy md:text-[3.2rem] md:leading-[1.05]">
            Bonjour, <span className="text-blue">{parentName}</span>
            <span className="ml-2 inline-block rotate-12 text-gold">👋</span>
          </h1>
          <p className="mt-3 text-base leading-7 text-navy/62 md:text-lg">
            Voici un aperçu clair des cours, progrès et activités de {kidName} aujourd&apos;hui.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 xl:w-auto xl:auto-rows-fr xl:grid-cols-2">
          <ParentFeatureButton
            title="Mode Enfant"
            subtitle="Jeux & activités"
            accent="blue"
            icon={<Gamepad2 className="h-5 w-5" />}
            onClick={onKidMode}
          />
          <ParentFeatureButton
            title="Abonnement"
            subtitle="Des cours 1 à 1"
            accent="gold"
            icon={<Sparkles className="h-5 w-5" />}
            onClick={onSubscription}
          />
        </div>
      </div>
    </section>
  );
}

function ParentFeatureButton({
  title,
  subtitle,
  accent,
  icon,
  onClick,
}: {
  title: string;
  subtitle: string;
  accent: "blue" | "gold";
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group h-full w-full text-left xl:w-[315px]"
    >
      <ParentPanel
        className={[
          "relative h-full min-h-[132px] overflow-hidden transition duration-200",
          accent === "blue"
            ? "bg-linear-to-br from-blue via-lightBlue to-[#27c2f3] p-4 text-white hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(33,158,188,0.18)]"
            : "flex items-center gap-4 px-3 py-3 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(32,42,68,0.13)]",
        ].join(" ")}
      >
        {accent === "blue" ? (
          <>
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/12" />
            <div className="absolute -bottom-14 right-20 h-36 w-36 rounded-full bg-white/10" />
            <div className="absolute left-6 top-6 h-2 w-2 rounded-full bg-white/65" />
            <div className="absolute left-20 top-11 h-1.5 w-1.5 rounded-full bg-white/50" />

            <div className="relative flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/30 bg-white/14 text-white shadow-[0_14px_28px_rgba(32,42,68,0.14)]">
                    {icon}
                  </span>
                  <span className="text-[0.95rem] font-bold uppercase tracking-[0.08em] text-white/88">
                    Immersion
                  </span>
                </div>
                <p className="mt-2 text-[1.35rem] font-bold leading-tight tracking-[-0.03em]">
                  {title}
                </p>
                <p className="mt-2 max-w-md text-sm font-medium text-white/86">
                  {subtitle}
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/14 text-white transition group-hover:translate-x-1">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="h-16 w-16 rounded-full border-4 border-white shadow-[0_14px_30px_rgba(32,42,68,0.13)]">
              <ParentOrb accent="gold" className="h-full w-full rounded-full border-0 shadow-none">
                {icon}
              </ParentOrb>
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-xl font-black text-navy">{title}</p>
              <p className="mt-1 text-sm font-medium text-navy/55">{subtitle}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-navy/55 transition group-hover:translate-x-1">
              <ArrowRight className="h-5 w-5" />
            </div>
          </>
        )}
      </ParentPanel>
    </button>
  );
}
