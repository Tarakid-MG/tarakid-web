import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContextDefinition';
import { Button } from '../components/ui/Button';
import { subscriptionService } from '../services/subscription.service';

// Copying Plan definition
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
    creditsPerMonth: number; // Added this logic
}

export const SubscriptionPage: React.FC = () => {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [commitment, setCommitment] = useState<'monthly' | 'threeMonths' | 'sixMonths'>('monthly');
    const [loading, setLoading] = useState(false);
    const [selectedKidId, setSelectedKidId] = useState<string | null>(null);

    // Auto-select kid if only one exists
    useEffect(() => {
        if (user?.kids && user.kids.length === 1) {
            setSelectedKidId(user.kids[0].id.toString());
        }
    }, [user]);

    const commitmentLabels = {
        monthly: 'Mensuel',
        threeMonths: '3 Mois',
        sixMonths: '6 Mois'
    };

    const commitmentTypeMap = {
        monthly: 'MONTHLY' as const,
        threeMonths: 'THREE_MONTHS' as const,
        sixMonths: 'SIX_MONTHS' as const,
    };

    const commonFeatures = [
        "Leçons interactives amusantes",
        "Jeux et supports d'étude gratuits",
        "Support client prioritaire"
    ];

    const plans: { [key: number]: PricingPlan[] } = {
        25: [
            {
                duration: 25,
                frequency: "1x / semaine",
                features: ["Développer sa confiance", ...commonFeatures],
                pricePerMonth: { monthly: 108000, threeMonths: 97000, sixMonths: 86000 },
                pricePerLesson: { monthly: 27000, threeMonths: 24000, sixMonths: 22000 },
                creditsPerMonth: 4
            },
            {
                duration: 25,
                frequency: "2x / semaine",
                features: ["Devenir bilingue", ...commonFeatures],
                pricePerMonth: { monthly: 200000, threeMonths: 180000, sixMonths: 160000 },
                pricePerLesson: { monthly: 25000, threeMonths: 23000, sixMonths: 20000 },
                creditsPerMonth: 8
            },
            {
                duration: 25,
                frequency: "3x / semaine",
                features: ["Parler couramment", ...commonFeatures],
                pricePerMonth: { monthly: 264000, threeMonths: 238000, sixMonths: 211000 },
                pricePerLesson: { monthly: 22000, threeMonths: 20000, sixMonths: 18000 },
                creditsPerMonth: 12
            },
        ]
    };

    const handleSubscribe = async (plan: PricingPlan) => {
        // Check if kid selection is required
        if (user?.kids && user.kids.length > 1 && !selectedKidId) {
            alert('Veuillez sélectionner un enfant pour cet abonnement.');
            return;
        }

        setLoading(true);
        try {
            // Extract frequency number from string (e.g., "2x / semaine" -> 2)
            const frequencyNum = parseInt(plan.frequency.split('x')[0]);

            const subscription = await subscriptionService.create({
                kidId: selectedKidId || undefined,
                planName: `${plan.frequency} - ${commitment}`,
                frequency: frequencyNum,
                commitmentType: commitmentTypeMap[commitment],
                creditsPerMonth: plan.creditsPerMonth,
                pricePerMonth: plan.pricePerMonth[commitment],
            });

            await refreshProfile();

            // Redirect to booking calendar with subscription ID
            navigate(`/book-classes?subscriptionId=${subscription.id}`);
        } catch (error) {
            console.error('Subscription failed', error);
            alert('Une erreur est survenue lors de la souscription.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <button onClick={() => navigate('/dashboard')} className="mb-8 flex items-center text-navy/60 font-bold hover:text-blue">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Retour au tableau de bord
                    </button>

                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-black text-navy mb-4">Choisissez votre formule 🚀</h1>
                        <p className="text-xl text-navy/60 font-medium">Investissez dans l'avenir de votre enfant avec nos forfaits flexibles.</p>
                    </div>

                    {/* Child Selection (if multiple kids) */}
                    {user?.kids && user.kids.length > 1 && (
                        <div className="max-w-2xl mx-auto mb-12">
                            <div className="bg-linear-to-br from-blue/5 to-lightBlue/10 rounded-3xl p-8 border-2 border-blue/10">
                                <h2 className="text-2xl font-black text-navy mb-4 text-center">Pour qui est cet abonnement ?</h2>
                                <p className="text-navy/60 font-medium text-center mb-6">Sélectionnez l'enfant qui bénéficiera de cet abonnement</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {user.kids.map((kid) => (
                                        <button
                                            key={kid.id}
                                            onClick={() => setSelectedKidId(kid.id.toString())}
                                            className={`p-6 rounded-2xl border-2 transition-all ${selectedKidId === kid.id.toString()
                                                ? 'border-blue bg-blue text-white shadow-lg scale-105'
                                                : 'border-beige bg-white hover:border-blue/50 hover:shadow-md'
                                                }`}
                                        >
                                            <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden border-4 border-white shadow-md">
                                                <img
                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${kid.name}`}
                                                    alt={kid.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <p className={`font-black text-lg ${selectedKidId === kid.id.toString() ? 'text-white' : 'text-navy'}`}>
                                                {kid.name}
                                            </p>
                                            <p className={`text-sm font-bold ${selectedKidId === kid.id.toString() ? 'text-white/80' : 'text-navy/60'}`}>
                                                {kid.age} ans
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Commitment Tabs */}
                    <div className="flex justify-center mb-16">
                        <div className="bg-beige/30 p-2 rounded-4xl flex flex-wrap justify-center gap-2 border-2 border-beige shadow-inner max-w-full overflow-x-hidden">
                            {(['monthly', 'threeMonths', 'sixMonths'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setCommitment(tab)}
                                    className={`px-4 py-2.5 md:px-8 md:py-4 rounded-3xl font-black transition-all text-xs md:text-base flex-1 min-w-[100px] md:min-w-[150px] ${commitment === tab
                                        ? 'bg-blue text-white shadow-lg scale-105'
                                        : 'text-navy/50 hover:bg-white'
                                        }`}
                                >
                                    {commitmentLabels[tab]}
                                    {tab !== 'monthly' && (
                                        <span className="block text-[10px] uppercase tracking-widest mt-0.5 opacity-80">
                                            -{tab === 'threeMonths' ? '10%' : '20%'} remise
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pricing Grids */}
                    <div className="space-y-20 max-w-7xl mx-auto">
                        {[25].map((sessionDuration) => (
                            <div key={sessionDuration} className="relative">
                                <div className="grid md:grid-cols-3 gap-8 pt-6">
                                    {plans[sessionDuration].map((plan, idx) => (
                                        <div
                                            key={idx}
                                            className={`bg-white rounded-[2.5rem] p-6 lg:p-8 border-4 transition-all hover:shadow-2xl group ${idx === 2 ? 'border-yellow md:scale-105 shadow-xl relative z-20' : 'border-beige'
                                                }`}
                                        >
                                            <div className="mb-8">
                                                <h4 className="text-navy/40 font-black uppercase tracking-widest text-sm mb-1">{plan.frequency}</h4>
                                                <div className="flex items-end space-x-1">
                                                    <span className="text-4xl lg:text-3xl xl:text-5xl font-black text-navy leading-none">{(plan.pricePerMonth[commitment]).toLocaleString()}Ar</span>
                                                    <span className="text-navy/40 font-bold mb-1">/ mois</span>
                                                </div>
                                            </div>

                                            <div className="bg-lightBlue/5 rounded-2xl p-4 mb-8 border-2 border-lightBlue/10 italic flex justify-between items-center">
                                                <div>
                                                    <span className="text-blue font-black text-xl">{(plan.pricePerLesson[commitment]).toLocaleString()}Ar</span>
                                                    <span className="text-navy/60 font-bold ml-2 text-xs">/leçon</span>
                                                </div>
                                                <div className="bg-white px-3 py-1 rounded-lg text-xs font-black text-blue shadow-sm">
                                                    {plan.creditsPerMonth} Crédits/mois
                                                </div>
                                            </div>

                                            <ul className="space-y-4 mb-10">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className={`flex items-start text-sm font-bold text-navy/70 ${i === 0 ? 'text-navy font-black text-base' : ''}`}>
                                                        <div className="w-6 h-6 rounded-full bg-lightBlue/20 flex items-center justify-center mr-3 mt-0.5 shrink-0">
                                                            <Check className={`w-4 h-4 ${i === 0 ? 'text-blue' : 'text-blue/60'}`} strokeWidth={3} />
                                                        </div>
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <Button
                                                onClick={() => handleSubscribe(plan)}
                                                loading={loading}
                                                fullWidth
                                                size="lg"
                                                variant={idx === 2 ? 'primary' : 'secondary'}
                                                className={`py-5 rounded-2xl font-black text-lg shadow-lg border-b-4 border-black/20 ${idx === 2 ? 'bg-yellow text-navy hover:bg-yellow/90' : 'bg-blue text-white hover:bg-blue/90'}`}
                                            >
                                                CHOISIR CE PLAN
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SubscriptionPage;
