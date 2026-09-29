import { CheckCircle, Plus, Users } from "lucide-react";
import { ParentKidAvatar } from "../parent-dashboard";
import type { Kid } from "../../types/auth";

export function SettingsKidsSection({
  kids,
  selectedKidId,
  onSelectKid,
  onAddKid,
}: {
  kids: Kid[];
  selectedKidId?: string | null;
  onSelectKid: (kid: Kid) => void;
  onAddKid: () => void;
}) {
  return (
    <section className="relative mt-5 overflow-hidden rounded-4xl border border-white/88 bg-white/94 p-6 shadow-[0_28px_60px_rgba(32,42,68,0.08)] backdrop-blur-xl md:p-7">
      <div className="pointer-events-none absolute -right-10 top-12 hidden h-44 w-44 rounded-full bg-gold/10 blur-3xl lg:block" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue/10 text-blue shadow-[inset_0_0_0_1px_rgba(33,158,188,0.08)]">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-[1.8rem] font-black tracking-[-0.04em] text-navy">
                Profils enfants
              </h2>
              <p className="mt-1 text-[15px] font-medium text-navy/55">
                Sélectionnez un enfant à modifier ou ajoutez-en un autre.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {kids.map((kid) => {
              const active = selectedKidId === kid.id;
              return (
                <button
                  key={kid.id}
                  type="button"
                  onClick={() => onSelectKid(kid)}
                  className={[
                    "group flex min-w-[220px] items-center gap-4 rounded-[1.6rem] border px-4 py-3.5 text-left transition-all",
                    active
                      ? "border-blue/18 bg-blue/6 shadow-[0_18px_34px_rgba(33,158,188,0.10)]"
                      : "border-slate-200/90 bg-slate-50/78 hover:border-blue/15 hover:bg-white hover:shadow-[0_14px_28px_rgba(32,42,68,0.06)]",
                  ].join(" ")}
                >
                  <div className="h-16 w-16 overflow-hidden rounded-[1.2rem] border-2 border-white bg-white shadow-[0_10px_24px_rgba(32,42,68,0.10)]">
                    <ParentKidAvatar
                      kidName={kid.name}
                      avatarSrc={kid.avatarUrl}
                      className="h-full w-full"
                      fallbackClassName="text-lg font-black bg-slate-100"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-lg font-black text-navy">
                      {kid.name}
                    </div>
                    <div className="mt-1 text-sm font-medium text-navy/55">
                      {kid.age} ans
                    </div>
                  </div>
                  {active ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue text-white shadow-[0_8px_20px_rgba(33,158,188,0.22)]">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-start lg:justify-end">
          <button
            type="button"
            onClick={onAddKid}
            className="inline-flex min-h-16 items-center justify-center gap-3 rounded-[1.7rem] bg-linear-to-r from-yellow via-gold to-orange px-7 py-4 text-lg font-black text-white shadow-[0_20px_38px_rgba(247,181,0,0.26)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-6 w-6" />
            Ajouter un enfant
          </button>
        </div>
      </div>
    </section>
  );
}
