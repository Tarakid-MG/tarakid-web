import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Sparkles, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Logo } from '../../components/ui/Logo';
import { authService } from '../../services/auth.service';

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Vérification de votre compte en cours...');

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Jeton de vérification manquant.');
            return;
        }

        const verify = async () => {
            try {
                const response = await authService.verifyEmail(token);
                setStatus('success');
                setMessage(response.message);
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Échec de la vérification.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-lightBlue/10 via-white to-yellow/10 flex items-center justify-center p-4 overflow-hidden relative">
            <div className="absolute top-20 -left-10 w-32 h-32 bg-yellow rounded-full blur-3xl opacity-30"></div>
            <div className="absolute bottom-20 -right-10 w-48 h-48 bg-lightBlue rounded-full blur-3xl opacity-30"></div>

            <div className="max-w-md w-full relative z-10 flex flex-col items-center">
                <Logo className="h-16 mb-8" />

                <Card className="w-full text-center py-8">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-16 h-16 text-blue animate-spin mb-6" />
                            <h2 className="text-2xl font-black text-navy mb-2">Un instant...</h2>
                            <p className="text-navy/60 font-medium">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-12 h-12" />
                            </div>
                            <h2 className="text-2xl font-black text-navy mb-4">Génial !</h2>
                            <p className="text-navy/60 font-medium mb-8">{message}</p>
                            <Button fullWidth onClick={() => navigate('/login')}>
                                Se connecter
                            </Button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                                <XCircle className="w-12 h-12" />
                            </div>
                            <h2 className="text-2xl font-black text-navy mb-4">Mince !</h2>
                            <p className="text-navy/60 font-medium mb-8 text-center">{message}</p>
                            <Button variant="outline" fullWidth onClick={() => navigate('/register')}>
                                Réessayer l'inscription
                            </Button>
                        </div>
                    )}
                </Card>

                <div className="mt-12 flex justify-center space-x-6 text-xs font-bold text-navy/40">
                    <span className="flex items-center">
                        <Star className="w-3 h-3 mr-1 fill-current" /> 10k+ Élèves
                    </span>
                    <span className="flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" /> Leçons de 25 min
                    </span>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
