import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Crown,
  Lock,
  Sparkles,
  Star,
  WandSparkles,
} from "lucide-react";
import { useKidMode } from "../hooks/useKidMode";
import { useAuth } from "../context/AuthContextDefinition";
import {
  kidService,
  type KidAvatarOption,
} from "../services/kid.service";
import axios from "axios";

const KidAvatarPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedKid, isKidMode, updateSelectedKid } = useKidMode();
  const { refreshProfile } = useAuth();
  const [avatars, setAvatars] = useState<KidAvatarOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isKidMode || !selectedKid?.id) {
      navigate("/kid-dashboard", { replace: true });
      return;
    }

    const fetchAvatars = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await kidService.getAvatarOptions(selectedKid.id);
        setAvatars(data);
      } catch (fetchError) {
        console.error("Failed to load kid avatars", fetchError);
        setError("Impossible de charger les avatars pour le moment.");
      } finally {
        setLoading(false);
      }
    };

    fetchAvatars();
  }, [isKidMode, navigate, selectedKid?.id]);

  const currentStars = selectedKid?.stars || 0;
  const freeAvatars = useMemo(
    () => avatars.filter((avatar) => avatar.cost === 0),
    [avatars],
  );
  const premiumAvatars = useMemo(
    () => avatars.filter((avatar) => avatar.cost > 0),
    [avatars],
  );

  const handleSelectAvatar = async (avatar: KidAvatarOption) => {
    if (!selectedKid?.id) return;

    try {
      setSavingKey(avatar.key);
      setError("");
      const updatedKid = await kidService.selectAvatar(selectedKid.id, avatar.key);
      updateSelectedKid(updatedKid);
      setAvatars((prev) =>
        prev.map((item) => ({
          ...item,
          owned: item.key === avatar.key ? true : item.owned,
          selected: item.key === avatar.key,
        })),
      );
      await refreshProfile();
    } catch (selectError: unknown) {
      console.error("Failed to select avatar", selectError);
      const message = axios.isAxiosError(selectError)
        ? selectError.response?.data?.message
        : null;
      setError(
        (Array.isArray(message) ? message.join(" ") : message) ||
          "Impossible de choisir cet avatar.",
      );
    } finally {
      setSavingKey(null);
    }
  };

  const renderAvatarSection = (
    title: string,
    subtitle: string,
    items: KidAvatarOption[],
  ) => (
    <section className="kid-cloud-card relative overflow-hidden rounded-[2.8rem] border-4 border-white/80 bg-white/90 p-5 md:p-7 shadow-[0_18px_48px_rgba(32,42,68,0.14)] backdrop-blur-md">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-lightBlue/20 blur-2xl" />
      <div className="absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-yellow/20 blur-2xl" />
      <div className="relative flex items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-2xl font-black text-navy flex items-center gap-2">
            <WandSparkles className="w-6 h-6 text-blue" />
            {title}
          </h2>
          <p className="text-sm font-bold text-navy/50 mt-1">{subtitle}</p>
        </div>
        <span className="rounded-full bg-blue/10 border border-blue/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-blue">
          {items.length} avatars
        </span>
      </div>

      <div className="relative grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {items.map((avatar) => {
          const isSaving = savingKey === avatar.key;
          const isLocked = !avatar.owned;
          const canAfford = currentStars >= avatar.cost;

          return (
            <button
              key={avatar.key}
              type="button"
              onClick={() => handleSelectAvatar(avatar)}
              disabled={isSaving || (isLocked && !canAfford)}
              className={`group relative overflow-hidden rounded-[2.2rem] border-4 p-4 text-center transition-all ${
                avatar.selected
                  ? "border-blue bg-[linear-gradient(180deg,rgba(33,158,188,0.14)_0%,rgba(255,255,255,0.96)_100%)] shadow-[0_16px_28px_rgba(33,158,188,0.16)]"
                  : "border-white bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.95)_100%)] hover:-translate-y-1.5 hover:shadow-[0_16px_24px_rgba(32,42,68,0.12)]"
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-white/75 to-transparent pointer-events-none" />
              <div className="pointer-events-none absolute right-4 top-4 h-7 w-7 rounded-full bg-yellow/25 blur-md" />

              <div className="relative mx-auto flex h-34 w-34 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,212,0,0.32),transparent_48%),radial-gradient(circle_at_bottom,rgba(76,201,240,0.28),transparent_52%)]" />
                <div className="absolute inset-[8%] rounded-full border-4 border-dashed border-white/80" />
                <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white bg-linear-to-br from-blue/10 via-white to-yellow/20 shadow-[0_10px_20px_rgba(32,42,68,0.12)]">
                  <img
                    src={avatar.url}
                    alt={avatar.label}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="relative mt-4 flex items-start justify-between gap-2 text-left">
                <div>
                  <p className="text-sm font-black text-navy">{avatar.label}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-navy/40 mt-1">
                    {avatar.selected
                      ? "Choisi"
                      : avatar.owned
                        ? "Débloqué"
                        : "Premium"}
                  </p>
                </div>

                {avatar.selected ? (
                  <span className="h-10 w-10 rounded-full bg-blue text-white flex items-center justify-center shadow-[0_6px_0_rgba(29,111,163,0.35)]">
                    <Check className="w-4 h-4" />
                  </span>
                ) : isLocked ? (
                  <span className="rounded-full bg-gold/20 px-3 py-2 flex items-center gap-1 text-[11px] font-black text-orange">
                    <Lock className="w-3.5 h-3.5" />
                    {avatar.cost}
                  </span>
                ) : (
                  <span className="rounded-full bg-teal/10 px-3 py-2 text-[11px] font-black text-teal">
                    OK
                  </span>
                )}
              </div>

              <div className="relative mt-4">
                <span
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] ${
                    avatar.selected
                      ? "bg-blue text-white"
                      : avatar.owned
                        ? "bg-navy text-white"
                        : canAfford
                          ? "bg-yellow text-navy"
                          : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isSaving ? (
                    "Patiente..."
                  ) : avatar.selected ? (
                    "Choisi"
                  ) : avatar.owned ? (
                    "Utiliser"
                  ) : (
                    <>
                      <Crown className="w-3.5 h-3.5" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      Acheter
                    </>
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );

  return (
    <div
      className="min-h-screen relative overflow-hidden p-4 md:p-8"
      style={{
        backgroundImage: "url('/images/kids-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-linear-to-b from-lightBlue/15 via-white/10 to-yellow/10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-120 bg-[radial-gradient(circle_at_top_left,rgba(255,212,0,0.24),transparent_42%),radial-gradient(circle_at_top_right,rgba(76,201,240,0.24),transparent_35%),radial-gradient(circle_at_center,rgba(33,158,188,0.1),transparent_45%)]" />
      <div className="pointer-events-none absolute left-[8%] top-[20%] h-22 w-22 rounded-full bg-orange/20 blur-2xl kid-float-slow" />
      <div className="pointer-events-none absolute right-[10%] top-[14%] h-24 w-24 rounded-full bg-lightBlue/20 blur-2xl kid-float-fast" />
      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/kid-dashboard")}
              className="h-14 w-14 rounded-[1.25rem] bg-white/90 border-4 border-white text-navy shadow-[0_10px_24px_rgba(32,42,68,0.12)] flex items-center justify-center hover:-translate-y-0.5 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-black text-blue uppercase tracking-[0.22em]">
                <Sparkles className="w-4 h-4" />
                Atelier avatar
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-navy mt-1">
                Choisis ton avatar
              </h1>
              <p className="text-sm md:text-base font-bold text-navy/50 mt-2">
                {selectedKid?.name}, tu reçois un avatar cadeau et tu peux aussi
                débloquer des avatars spéciaux avec tes étoiles.
              </p>
            </div>
          </div>

          <div className="kid-cloud-card rounded-[2.2rem] border-4 border-white/80 bg-white/90 px-5 py-4 shadow-[0_14px_40px_rgba(32,42,68,0.14)]">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-[1.3rem] bg-yellow border-4 border-white flex items-center justify-center shadow-[0_8px_0_rgba(239,191,4,0.4)]">
                <Star className="w-7 h-7 text-navy fill-current" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-navy/45">
                  Tes étoiles
                </p>
                <p className="text-3xl font-black text-navy leading-none">
                  {currentStars}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-[1.6rem] border-2 border-red-200 bg-red-50 px-5 py-4 text-sm font-black text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="kid-cloud-card rounded-[2.8rem] border-4 border-white/80 bg-white/90 p-8 shadow-[0_18px_48px_rgba(32,42,68,0.14)] text-center">
            <p className="text-lg font-black text-navy">Chargement des avatars...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {renderAvatarSection(
              "Avatars gratuits",
              "Ceux-ci sont offerts, tu peux les changer quand tu veux.",
              freeAvatars,
            )}
            {premiumAvatars.length > 0 &&
              renderAvatarSection(
                "Avatars premium",
                "Ces avatars spéciaux se débloquent avec tes étoiles.",
                premiumAvatars,
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KidAvatarPage;
