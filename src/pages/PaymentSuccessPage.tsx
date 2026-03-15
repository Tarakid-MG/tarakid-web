import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, ArrowRight, Calendar, RefreshCcw } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Navbar } from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContextDefinition";
import { subscriptionService } from "../services/subscription.service";
import { type Subscription } from "../types/auth";

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshProfile, user } = useAuth();
  const subscriptionId = searchParams.get("subscriptionId");
  const [newSubscription, setNewSubscription] =
    React.useState<Subscription | null>(null);

  useEffect(() => {
    const finalize = async () => {
      await refreshProfile();
      if (subscriptionId) {
        try {
          const sub = await subscriptionService.getSubscription(subscriptionId);
          setNewSubscription(sub);
        } catch (error) {
          console.error(
            "PaymentSuccessPage: Failed to fetch subscription details",
            error,
          );
        }
      }
    };
    finalize();
  }, [refreshProfile, subscriptionId]);
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="h-20 w-20 rounded-full bg-turquoise/20 border-2 border-turquoise flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-teal" />
        </div>
        <h1 className="text-4xl font-black text-navy mb-4">
          Paiement Réussi !
        </h1>
        <p className="text-navy/60 text-lg mb-4 max-w-md">
          Merci pour votre confiance. Votre abonnement est maintenant activé.
        </p>

        {newSubscription && (
          <div className="bg-blue/5 border border-blue/20 rounded-2xl p-6 mb-4 max-w-md w-full">
            <div className="text-navy/60 text-sm font-semibold uppercase tracking-wider mb-2">
              Nouveau forfait : {newSubscription.planName}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-navy font-bold">Crédits reçus</div>
              <div className="text-3xl font-black text-blue">
                +{newSubscription.totalCredits}
              </div>
            </div>
          </div>
        )}

        {user && (
          <div className="bg-turquoise/10 border border-turquoise/20 rounded-2xl p-4 mb-8 relative max-w-md w-full">
            <div className="text-navy/60 text-sm">
              Total des crédits disponibles
            </div>
            <div className="text-2xl font-black text-teal">{user.credits}</div>
            <button
              onClick={() => refreshProfile()}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white border border-slate-200 text-navy/40 hover:text-blue transition shadow-sm"
              title="Actualiser mes crédits"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          {subscriptionId ? (
            <Button
              onClick={() =>
                navigate(`/book-classes?subscriptionId=${subscriptionId}`)
              }
              variant="primary"
              size="lg"
            >
              Réserver mes cours <Calendar className="ml-2 w-5 h-5" />
            </Button>
          ) : (
            <Button onClick={() => navigate("/schedule")} variant="primary">
              Voir mon planning <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
          <Button onClick={() => navigate("/dashboard")} variant="secondary">
            Tableau de bord
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccessPage;
