import { ArrowLeft } from "lucide-react";

export function SettingsHero({
  onBack,
}: {
  onBack: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2.2rem] border border-white/75 bg-white/28 px-5 pb-6 pt-5 shadow-[0_22px_48px_rgba(32,42,68,0.06)] backdrop-blur-[2px] md:px-7 md:pb-7 md:pt-6">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-36 rounded-full bg-white/55 blur-3xl" />
      <div className="pointer-events-none absolute left-8 top-6 h-28 w-28 rounded-full bg-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute right-16 top-2 h-20 w-32 rounded-full bg-gold/12 blur-3xl" />
      <div className="relative flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={onBack}
            className="mt-1 flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-white/85 bg-white/92 text-navy shadow-[0_20px_40px_rgba(32,42,68,0.08)] transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-7 w-7" />
          </button>
          <div>
            <h1 className="text-[2.2rem] font-black tracking-[-0.05em] text-navy md:text-[3.4rem]">
              Paramètres <span className="ml-2">⚙️</span>
            </h1>
            <p className="mt-2 text-[15px] font-medium leading-7 text-navy/58 md:text-lg">
              Gérez votre compte et les profils de vos enfants.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
