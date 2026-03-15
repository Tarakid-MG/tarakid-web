import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Check, ArrowLeft, Zap, Star, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContextDefinition";
import { Button } from "../components/ui/Button";
import { subscriptionService } from "../services/subscription.service";
import { paymentService } from "../services/payment.service";

interface PricingPlan {
  duration: number;
  frequency: string;
  features: string[];
  pricePerMonth: {
    monthly: number;
    threeMonths: number;
    sixMonths: number;
  };
  pricePerLesson: {
    monthly: number;
    threeMonths: number;
    sixMonths: number;
  };
  creditsPerMonth: number;
}

type Commitment = "monthly" | "threeMonths" | "sixMonths";

export const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [commitment, setCommitment] = useState<Commitment>("monthly");
  const [loading, setLoading] = useState(false);
  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);

  // Auto-select kid if only one exists
  useEffect(() => {
    if (user?.kids && user.kids.length === 1) {
      setSelectedKidId(user.kids[0].id.toString());
    }
  }, [user]);

  const commitmentLabels: Record<Commitment, string> = {
    monthly: "Mensuel",
    threeMonths: "3 mois",
    sixMonths: "6 mois",
  };

  const commitmentTypeMap = {
    monthly: "MONTHLY" as const,
    threeMonths: "THREE_MONTHS" as const,
    sixMonths: "SIX_MONTHS" as const,
  };

  const discountLabel = (c: Commitment) => {
    if (c === "threeMonths") return "-10%";
    if (c === "sixMonths") return "-20%";
    return null;
  };

  const commonFeatures = useMemo(
    () => [
      "Leçons interactives amusantes",
      "Jeux et supports d’étude gratuits",
      "Support client prioritaire",
    ],
    [],
  );

  const plans: { [key: number]: PricingPlan[] } = useMemo(
    () => ({
      25: [
        {
          duration: 25,
          frequency: "1x / semaine",
          features: ["Développer sa confiance", ...commonFeatures],
          pricePerMonth: {
            monthly: 108000,
            threeMonths: 97000,
            sixMonths: 86000,
          },
          pricePerLesson: {
            monthly: 27000,
            threeMonths: 24000,
            sixMonths: 22000,
          },
          creditsPerMonth: 4,
        },
        {
          duration: 25,
          frequency: "2x / semaine",
          features: ["Devenir bilingue", ...commonFeatures],
          pricePerMonth: {
            monthly: 200000,
            threeMonths: 180000,
            sixMonths: 160000,
          },
          pricePerLesson: {
            monthly: 25000,
            threeMonths: 23000,
            sixMonths: 20000,
          },
          creditsPerMonth: 8,
        },
        {
          duration: 25,
          frequency: "3x / semaine",
          features: ["Parler couramment", ...commonFeatures],
          pricePerMonth: {
            monthly: 264000,
            threeMonths: 238000,
            sixMonths: 211000,
          },
          pricePerLesson: {
            monthly: 22000,
            threeMonths: 20000,
            sixMonths: 18000,
          },
          creditsPerMonth: 12,
        },
      ],
    }),
    [commonFeatures],
  );

  const handleSubscribe = async (plan: PricingPlan) => {
    if (user?.kids && user.kids.length > 1 && !selectedKidId) {
      alert("Veuillez sélectionner un enfant pour cet abonnement.");
      return;
    }

    setLoading(true);
    try {
      const frequencyNum = parseInt(plan.frequency.split("x")[0], 10);

      const subscription = await subscriptionService.create({
        kidId: selectedKidId || undefined,
        planName: `${plan.frequency} - ${commitment}`,
        frequency: frequencyNum,
        commitmentType: commitmentTypeMap[commitment],
        creditsPerMonth: plan.creditsPerMonth,
        pricePerMonth: plan.pricePerMonth[commitment],
      });

      // After creating the subscription (which is now PENDING_PAYMENT),
      // create a Stripe checkout session
      const { url } = await paymentService.createCheckoutSession(
        subscription.id,
      );

      // Redirect to Stripe
      window.location.href = url;
    } catch (error) {
      console.error("Subscription failed", error);
      alert("Une erreur est survenue lors de la souscription.");
    } finally {
      setLoading(false);
    }
  };

  const kidRequired = Boolean(user?.kids && user.kids.length > 1);

  // Choose which plan is “recommended” (middle one looks best)
  const recommendedIndex = 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6 md:space-y-8">
        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-navy/60 font-semibold hover:text-blue transition"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </button>

        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-2xl bg-blue/10 border border-blue/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-navy">
                Choisissez votre formule
              </h1>
              <p className="text-navy/60 mt-1">
                Des forfaits simples, clairs, et adaptés au rythme de votre
                enfant.
              </p>
            </div>
          </div>
        </div>

        {/* Kid selection */}
        {kidRequired && (
          <div className="bg-white border border-slate-200 rounded-2xl p-0 overflow-hidden">
            {/* Accent bar */}
            <div className="h-1.5 bg-gold" />

            <div className="p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-navy">
                    Pour qui est cet abonnement ?
                  </div>
                  <div className="text-sm text-navy/60 mt-1">
                    Sélectionnez l’enfant qui bénéficiera de l’abonnement.
                  </div>
                </div>

                {selectedKidId ? (
                  <span className="inline-flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-turquoise/20 border border-turquoise/30 text-teal">
                    <span className="w-2 h-2 rounded-full bg-teal" />
                    Sélectionné
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-orange/15 border border-orange/30 text-orange">
                    <span className="w-2 h-2 rounded-full bg-orange" />
                    Requis
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {user?.kids?.map((kid) => {
                  const active = selectedKidId === kid.id.toString();

                  return (
                    <button
                      key={kid.id}
                      type="button"
                      onClick={() => setSelectedKidId(kid.id.toString())}
                      className={[
                        "w-full text-left rounded-2xl p-4 border transition",
                        "focus:outline-none focus:ring-2 focus:ring-blue/30",
                        active
                          ? "border-blue bg-blue/5 shadow-sm"
                          : "border-slate-200 bg-white hover:border-blue/25 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div
                          className={[
                            "h-11 w-11 rounded-2xl border flex items-center justify-center font-black",
                            active
                              ? "bg-blue text-white border-blue"
                              : "bg-yellow/15 text-navy border-yellow/25",
                          ].join(" ")}
                        >
                          {kid.name?.[0]?.toUpperCase() || "K"}
                        </div>

                        {/* Text */}
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-navy truncate">
                            {kid.name}
                          </div>
                          <div className="text-sm text-navy/60">
                            {kid.age} ans
                          </div>
                        </div>

                        {/* Selected indicator */}
                        {active ? (
                          <div className="inline-flex items-center gap-2">
                            <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-blue text-white">
                              Actif
                            </span>
                            <div className="h-8 w-8 rounded-xl bg-blue/10 border border-blue/20 flex items-center justify-center">
                              <Check
                                className="w-4 h-4 text-blue"
                                strokeWidth={3}
                              />
                            </div>
                          </div>
                        ) : (
                          <ArrowRight className="w-4 h-4 text-navy/25" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Commitment tabs (minimal pills) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 md:p-4">
          <div className="flex flex-wrap justify-center gap-2">
            {(["monthly", "threeMonths", "sixMonths"] as const).map((tab) => {
              const active = commitment === tab;
              const disc = discountLabel(tab);

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setCommitment(tab)}
                  className={[
                    "px-4 py-3 rounded-2xl border text-sm font-semibold transition",
                    "flex items-center gap-2",
                    active
                      ? "border-blue bg-blue text-white shadow-sm"
                      : "border-slate-200 bg-white text-navy/70 hover:bg-slate-50 hover:border-blue/20",
                  ].join(" ")}
                >
                  <span>{commitmentLabels[tab]}</span>

                  {disc && (
                    <span
                      className={[
                        "text-[11px] font-bold px-2 py-1 rounded-lg border",
                        active
                          ? "bg-white/15 border-white/30 text-white"
                          : "bg-gold/20 border-gold/30 text-navy",
                      ].join(" ")}
                    >
                      {disc}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {plans[25].map((plan, idx) => {
            const isRecommended = idx === recommendedIndex;

            return (
              <div
                key={idx}
                className={[
                  "bg-white rounded-2xl border p-5 md:p-6 flex flex-col",
                  isRecommended ? "border-gold shadow-sm" : "border-slate-200",
                ].join(" ")}
              >
                {/* Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-navy/60 uppercase tracking-wide">
                      {plan.frequency}
                    </div>

                    <div className="mt-2 flex items-end gap-2">
                      <div className="text-3xl font-semibold text-navy leading-none">
                        {plan.pricePerMonth[commitment].toLocaleString()} Ar
                      </div>
                      <div className="text-sm text-navy/50 mb-0.5">/ mois</div>
                    </div>
                  </div>

                  {isRecommended ? (
                    <span className="inline-flex items-center gap-2 text-[11px] font-bold px-2 py-1 rounded-lg bg-gold/15 border border-gold/25 text-navy">
                      <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                      Recommandé
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-navy/60">
                      Simple
                    </span>
                  )}
                </div>

                {/* Key metrics */}
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-navy/60">
                        Prix / leçon
                      </div>
                      <div className="text-lg font-semibold text-blue">
                        {plan.pricePerLesson[commitment].toLocaleString()} Ar
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold text-navy/60">
                        Crédits / mois
                      </div>
                      <div className="text-lg font-semibold text-navy">
                        {plan.creditsPerMonth}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <ul className="mt-5 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-blue/10 border border-blue/20 flex items-center justify-center mt-0.5 shrink-0">
                        <Check className="w-4 h-4 text-blue" strokeWidth={3} />
                      </div>
                      <div
                        className={[
                          "text-sm",
                          i === 0 ? "font-semibold text-navy" : "text-navy/70",
                        ].join(" ")}
                      >
                        {feature}
                      </div>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-6 pt-2">
                  {isRecommended ? (
                    <Button
                      variant="primary"
                      onClick={() => handleSubscribe(plan)}
                      loading={loading}
                      fullWidth
                      size="lg"
                    >
                      Choisir ce plan
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => handleSubscribe(plan)}
                      loading={loading}
                      fullWidth
                      size="lg"
                    >
                      Choisir ce plan
                    </Button>
                  )}

                  {kidRequired && !selectedKidId ? (
                    <div className="mt-2 text-xs text-orange font-semibold">
                      Sélectionnez un enfant pour continuer.
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="text-center text-sm text-navy/50">
          Paiement mensuel selon engagement. Vous pourrez réserver vos cours
          après souscription.
        </div>
      </main>
    </div>
  );
};

export default SubscriptionPage;
