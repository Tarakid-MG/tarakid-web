import { LogOut, Shield } from "lucide-react";

export function SettingsAccountSection({
  onLogout,
}: {
  onLogout: () => void;
}) {
  return (
    <section className="mt-8 rounded-4xl border border-red-100 bg-white/95 p-6 shadow-[0_28px_60px_rgba(32,42,68,0.08)]">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-500 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.08)]">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-[1.9rem] font-black tracking-[-0.04em] text-navy">
              Compte
            </h2>
            <p className="mt-1 text-[15px] font-medium text-navy/55">
              Déconnectez-vous de votre espace parent en toute sécurité.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex min-h-16 items-center justify-center gap-3 rounded-3xl border border-red-200 bg-white px-6 py-4 text-lg font-black text-red-600 shadow-[0_16px_30px_rgba(239,68,68,0.06)] transition-all hover:scale-[1.01] hover:bg-red-50 active:scale-[0.99]"
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </button>
      </div>
    </section>
  );
}
