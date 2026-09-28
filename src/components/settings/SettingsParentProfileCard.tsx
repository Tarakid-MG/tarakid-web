import { Loader2, MapPin, Phone, Save, User as UserIcon } from "lucide-react";
import { SettingsInputField, SettingsTextAreaField } from "./SettingsFormField";

export type ParentInfoState = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
};

export function SettingsParentProfileCard({
  parentInfo,
  isLoading,
  onSubmit,
  onChange,
}: {
  parentInfo: ParentInfoState;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (patch: Partial<ParentInfoState>) => void;
}) {
  return (
    <section className="overflow-hidden rounded-4xl border border-cyan-100 bg-white/95 shadow-[0_28px_60px_rgba(32,42,68,0.08)]">
      <div className="h-full border-l-4 border-cyan-400 p-6 md:p-7">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-50 text-cyan-600 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.10)]">
              <UserIcon className="h-8 w-8" />
            </div>
            <h2 className="text-[1.9rem] font-black tracking-[-0.04em] text-navy">
              Profil Parent
            </h2>
          </div>
          <div className="rounded-full border border-cyan-100 bg-white px-5 py-2.5 text-sm font-black text-cyan-700 shadow-[0_12px_24px_rgba(32,42,68,0.05)]">
            Modifier
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <SettingsInputField
              label="Prénom"
              value={parentInfo.firstName}
              onChange={(value) => onChange({ firstName: value })}
              icon={<UserIcon className="h-5 w-5" />}
              className="focus:border-cyan-200 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.08)]"
            />
            <SettingsInputField
              label="Nom"
              value={parentInfo.lastName}
              onChange={(value) => onChange({ lastName: value })}
              icon={<UserIcon className="h-5 w-5" />}
              className="focus:border-cyan-200 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.08)]"
            />
          </div>

          <SettingsInputField
            label="Numéro de téléphone"
            type="tel"
            value={parentInfo.phoneNumber}
            onChange={(value) => onChange({ phoneNumber: value })}
            icon={<Phone className="h-5 w-5" />}
            placeholder="06 00 00 00 00"
            className="focus:border-cyan-200 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.08)]"
          />

          <SettingsTextAreaField
            label="Adresse"
            value={parentInfo.address}
            onChange={(value) => onChange({ address: value })}
            icon={<MapPin className="h-5 w-5" />}
            placeholder="Votre adresse complète"
            className="focus:border-cyan-200 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.08)]"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-3xl bg-linear-to-r from-[#16b7d8] via-blue to-[#17b0cb] py-4 text-lg font-black text-white shadow-[0_18px_34px_rgba(33,158,188,0.24)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Enregistrer
          </button>
        </form>
      </div>
    </section>
  );
}
