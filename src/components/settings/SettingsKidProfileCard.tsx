import { Baby, Camera, Loader2, Save } from "lucide-react";
import { SettingsInputField } from "./SettingsFormField";

export type KidInfoState = {
  name: string;
  age: number;
  gender: string;
  motherTongueProficiency: string;
  englishReadingLevel: string;
  englishSpeakingLevel: string;
  learningDuration: string;
  hobbies: unknown[];
};

export function SettingsKidProfileCard({
  selectedKid,
  kidInfo,
  avatarPreview,
  isLoading,
  onSubmit,
  onChange,
  onAvatarChange,
}: {
  selectedKid: { id: string } | null;
  kidInfo: KidInfoState;
  avatarPreview: string | null;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (patch: Partial<KidInfoState>) => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <section className="overflow-hidden rounded-4xl border border-gold/35 bg-white/95 shadow-[0_28px_60px_rgba(32,42,68,0.08)]">
      <div className="h-full border-l-4 border-gold p-6 md:p-7">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gold/12 text-gold shadow-[inset_0_0_0_1px_rgba(255,194,14,0.18)]">
              <Baby className="h-8 w-8" />
            </div>
            <h2 className="text-[1.9rem] font-black tracking-[-0.04em] text-navy">
              Profil Enfant
            </h2>
          </div>
          <div className="rounded-full border border-gold/28 bg-white px-5 py-2.5 text-sm font-black text-orange shadow-[0_12px_24px_rgba(32,42,68,0.05)]">
            Modifier
          </div>
        </div>

        {!selectedKid ? (
          <div className="rounded-[1.6rem] border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <p className="font-medium text-navy/60">
              Veuillez sélectionner un enfant pour modifier ses paramètres.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:items-start">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="h-44 w-44 overflow-hidden rounded-full border-[5px] border-gold/70 bg-white shadow-[0_22px_42px_rgba(255,194,14,0.18)]">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-5xl font-black text-navy/25">
                        {kidInfo.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-gold text-white shadow-[0_16px_30px_rgba(255,194,14,0.28)] transition hover:scale-105 active:scale-95">
                    <Camera className="h-6 w-6" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={onAvatarChange}
                    />
                  </label>
                </div>
                <p className="mt-5 text-sm font-black text-navy/65">
                  Changer la photo
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <SettingsInputField
                    label="Prénom"
                    value={kidInfo.name}
                    onChange={(value) => onChange({ name: value })}
                    icon={<Baby className="h-5 w-5" />}
                    className="focus:border-gold/40 focus:shadow-[0_0_0_4px_rgba(255,194,14,0.10)]"
                  />
                  <SettingsInputField
                    label="Âge"
                    type="number"
                    value={kidInfo.age}
                    onChange={(value) =>
                      onChange({ age: Number.parseInt(value || "0", 10) || 0 })
                    }
                    icon={<Baby className="h-5 w-5" />}
                    className="focus:border-gold/40 focus:shadow-[0_0_0_4px_rgba(255,194,14,0.10)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-8 flex w-full items-center justify-center gap-3 rounded-3xl bg-linear-to-r from-yellow via-gold to-orange py-4 text-lg font-black text-white shadow-[0_18px_34px_rgba(255,194,14,0.24)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  Enregistrer l&apos;enfant
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
