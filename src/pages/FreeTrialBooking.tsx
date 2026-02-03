import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextDefinition';
import {
    Calendar,
    Clock,
    Sparkles,
    Star,
    CheckCircle2,
    Sun,
    Sunrise,
    Moon,
    ArrowLeft
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { freeTrialService, type FreeTrialSession } from '../services/free-trial.service';
import BookingCalendar from '../components/quiz/BookingCalendar';

const FreeTrialBooking: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, refreshProfile } = useAuth(); // Use auth context
    const urlUserId = searchParams.get('userId');
    const userId = user?.id?.toString() || urlUserId; // Prefer auth user but fallback to URL

    const [sessions, setSessions] = useState<FreeTrialSession[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedSession, setSelectedSession] = useState<number | null>(null);
    const [selectedKidId, setSelectedKidId] = useState<number | null>(null);
    const [step, setStep] = useState(1); // 1: Kid Select (if multiple), 2: Date, 3: Time
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const availableDates = Array.from(new Set(sessions.map(s => s.date.split('T')[0])));
    const filteredSessions = selectedDate
        ? sessions.filter(s => s.date.split('T')[0] === selectedDate)
        : [];

    useEffect(() => {
        if (!userId) {
            navigate('/register');
            return;
        }

        const fetchSessions = async () => {
            // If user has kids, determine initial step
            if (user?.kids && user.kids.length > 1) {
                setStep(1);
            } else if (user?.kids && user.kids.length === 1) {
                setSelectedKidId(user.kids[0].id);
                setStep(2);
            } else {
                setStep(2); // No kids or not loaded yet, proceed (or maybe redirect to add kid?)
            }

            try {
                const data = await freeTrialService.getAvailableSessions();
                setSessions(data);
            } catch (err) {
                setError('Impossible de charger les sessions disponibles.');
            } finally {
                setLoading(false);
            }
        };

        if (userId) { // Ensure we have a user context or ID
            fetchSessions();
        }
    }, [userId, navigate, user]); // Add user to dependency

    const handleBook = async () => {
        if (!selectedSession || !userId) return;

        setBooking(true);
        setError('');
        try {
            await freeTrialService.bookSession(selectedSession, parseInt(userId), selectedKidId || undefined);
            setSuccess(true);
            await refreshProfile();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Une erreur est survenue lors de la réservation.');
        } finally {
            setBooking(false);
        }
    };

    const formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);

        const date = new Date(year, month - 1, day);

        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };


    const getTimeIcon = (time: string) => {
        const hour = parseInt(time.split(':')[0]);
        if (hour < 12) return <Sunrise className="w-5 h-5" />;
        if (hour < 18) return <Sun className="w-5 h-5" />;
        return <Moon className="w-5 h-5" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-lightBlue/10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-lightBlue/10 via-white to-yellow/10 p-4 md:p-8 relative overflow-hidden">
            <div className="absolute top-20 -left-10 w-32 h-32 bg-yellow rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-20 -right-10 w-48 h-48 bg-lightBlue rounded-full blur-3xl opacity-30 animate-bounce"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col items-center mb-10 text-center">
                    <Logo className="h-12 mb-6" />
                    <h1 className="text-4xl font-black text-navy mb-4 leading-tight">
                        Réservez votre <span className="text-orange italic">cours d'essai gratuit</span> !
                    </h1>
                    <p className="text-navy/60 font-medium max-w-xl">
                        Félicitations pour votre inscription ! Choisissez un créneau pour découvrir l'expérience TaraKid avec l'un de nos professeurs.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 text-sm font-bold text-navy/60 hover:text-blue transition-colors"
                    >
                        Passer cette étape →
                    </button>
                </div>

                {success ? (
                    <Card className="max-w-xl mx-auto text-center py-12 px-8 overflow-hidden relative">
                        <div className="absolute top-0 inset-x-0 h-2 bg-green-500"></div>
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-100">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-black text-navy mb-4">Génial, c'est réservé ! 🚀</h2>
                        <p className="text-navy/60 font-bold mb-8 leading-relaxed">
                            Votre cours d'essai a été réservé avec succès. Vous allez recevoir un email magique avec tous les détails.
                        </p>
                        <Button onClick={() => navigate('/dashboard')} fullWidth size="lg">
                            Accéder à mon tableau de bord
                        </Button>
                        <button
                            onClick={() => navigate(`/free-trial-booking?userId=${userId}`)}
                            className="text-sm font-bold text-blue hover:underline mt-4"
                        >
                            Réserver un autre cours
                        </button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Step 1: Kid Selection (Conditional) */}
                        {user?.kids && user.kids.length > 1 && (
                            <div className={`lg:col-span-12 space-y-6 ${step !== 1 ? 'hidden' : ''}`}>
                                <h3 className="text-xl font-black text-navy flex items-center mb-6">
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mr-4 text-orange border border-slate-100">
                                        <span className="text-lg">👶</span>
                                    </div>
                                    Pour qui est ce cours ?
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {user.kids.map(kid => (
                                        <Card
                                            key={kid.id}
                                            className={`cursor-pointer transition-all hover:scale-105 ${selectedKidId === kid.id ? 'border-orange ring-4 ring-orange/20' : 'hover:border-orange/50'}`}
                                            onClick={() => {
                                                setSelectedKidId(kid.id);
                                                setStep(2);
                                            }}
                                        >
                                            <div className="flex flex-col items-center p-4">
                                                <div className="w-24 h-24 rounded-full bg-slate-100 mb-4 overflow-hidden border-4 border-white shadow-md">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${kid.name}`} alt={kid.name} className="w-full h-full object-cover" />
                                                </div>
                                                <h4 className="text-xl font-black text-navy">{kid.name}</h4>
                                                <p className="text-sm text-navy/60 font-bold">{kid.age} ans</p>
                                                <Button className="mt-4 w-full" variant="outline" size="sm">C'est pour {kid.name}</Button>
                                            </div>
                                        </Card>
                                    ))}
                                    <Card
                                        className="cursor-pointer border-dashed border-2 border-slate-200 hover:border-blue bg-white/50 hover:bg-white flex flex-col items-center justify-center min-h-[250px]"
                                        onClick={() => navigate('/quiz')}
                                    >
                                        <div className="w-16 h-16 rounded-full bg-blue/10 flex items-center justify-center text-blue mb-4">
                                            <span className="text-2xl">+</span>
                                        </div>
                                        <h4 className="font-black text-navy/60">Ajouter un autre enfant</h4>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {/* Step 2 & 3: Calendar & Time (Visible if step >= 2) */}
                        <div className={`lg:col-span-5 space-y-8 ${step < 2 ? 'hidden' : 'animate-in fade-in slide-in-from-right-8 duration-500'}`}>
                            {user?.kids && user.kids.length > 1 && (
                                <button onClick={() => setStep(1)} className="flex items-center text-sm font-bold text-navy/40 hover:text-blue mb-4 transition-colors">
                                    <ArrowLeft className="w-4 h-4 mr-1" /> Retour au choix de l'enfant
                                </button>
                            )}
                            <section>
                                <h3 className="text-xl font-black text-navy flex items-center mb-6">
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mr-4 text-blue border border-slate-100">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    1. Choisissez une date
                                </h3>
                                <BookingCalendar
                                    availableDates={availableDates}
                                    selectedDate={selectedDate}
                                    onDateSelect={(date) => {
                                        setSelectedDate(date);
                                        setSelectedSession(null);
                                    }}
                                />
                            </section>

                            <Card variant="navy" className="flex items-center space-x-4">
                                <div className="p-3 bg-white/10 rounded-2xl">
                                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                                </div>
                                <p className="text-sm font-bold leading-relaxed">
                                    Saviez-vous que <span className="text-yellow-400">95% des enfants</span> adorent leur premier cours ?
                                </p>
                            </Card>


                        </div>

                        {/* Step 2: Time Slots */}
                        <div className="lg:col-span-7 space-y-6">
                            {selectedDate ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-navy flex items-center">
                                            <div className="w-10 h-10 bg-blue/10 rounded-2xl flex items-center justify-center mr-4 text-blue">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            2. Choisissez votre heure
                                        </h3>
                                        <span className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-navy/40 uppercase tracking-widest shadow-sm">
                                            {formatDate(selectedDate)}
                                        </span>
                                    </div>

                                    {filteredSessions.length === 0 ? (
                                        <div className="bg-white border-2 border-dashed border-beige rounded-[40px] p-20 text-center">
                                            <Clock className="w-12 h-12 text-beige mx-auto mb-4" />
                                            <p className="text-navy/40 font-bold italic">Oups ! Aucun créneau n'est disponible pour cette date.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                                            {filteredSessions.map((session) => (
                                                <button
                                                    key={session.id}
                                                    onClick={() => setSelectedSession(session.id)}
                                                    className={`p-4 rounded-[28px] border-2 transition-all text-left flex flex-col justify-between group h-full min-h-[110px] relative overflow-hidden
                                                        ${selectedSession === session.id
                                                            ? 'border-blue bg-blue shadow-xl shadow-blue/20 scale-[1.05] z-10'
                                                            : 'border-white bg-white hover:border-blue/20 shadow-sm hover:shadow-md'}`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${selectedSession === session.id ? 'bg-white/20 text-white' : 'bg-blue/5 text-blue'}`}>
                                                            {getTimeIcon(session.startTime)}
                                                        </div>
                                                        {selectedSession === session.id && (
                                                            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-blue">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className={`text-xl font-black ${selectedSession === session.id ? 'text-white' : 'text-navy'}`}>
                                                            {session.startTime}
                                                        </p>
                                                        <p className={`text-[8px] font-black uppercase tracking-widest ${selectedSession === session.id ? 'text-white/60' : 'text-navy/20'}`}>
                                                            25 min
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Action Summary */}
                                    {selectedSession && (
                                        <div className="pt-8 border-t-2 border-white animate-in slide-in-from-bottom-4 duration-500">
                                            <Card className="p-8 border-none shadow-2xl shadow-blue/10 bg-white relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                                    <Sparkles className="w-24 h-24" />
                                                </div>
                                                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                                                    <div className="flex-grow text-center md:text-left">
                                                        <h4 className="text-2xl font-black text-navy mb-2">Presque prêt ! ✨</h4>
                                                        <p className="text-navy/60 font-bold">
                                                            Vous allez réserver le créneau du <span className="text-blue">{formatDate(selectedDate)}</span>                                                        </p>
                                                    </div>
                                                    <Button
                                                        onClick={handleBook}
                                                        loading={booking}
                                                        size="lg"
                                                        className="min-w-[200px] shadow-xl shadow-blue/20"
                                                    >
                                                        Confirmer ma place
                                                    </Button>
                                                </div>
                                            </Card>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full min-h-[400px] bg-white rounded-[40px] border-2 border-dashed border-blue/10 flex flex-col items-center justify-center text-center p-12">
                                    <div className="w-20 h-20 bg-blue/5 rounded-[30px] flex items-center justify-center text-blue mb-6 animate-bounce">
                                        <ArrowLeft className="w-8 h-8 rotate-90 lg:rotate-0" />
                                    </div>
                                    <h3 className="text-xl font-black text-navy mb-2">Prochaine étape...</h3>
                                    <p className="text-navy/40 font-bold max-w-xs">
                                        Sélectionnez une date dans le calendrier pour découvrir les heures magiques disponibles !
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-3xl text-sm font-bold animate-in shake-in duration-300">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FreeTrialBooking;
