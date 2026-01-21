import React, { useState } from 'react';
import { Mail, ArrowRight, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Logo } from '../../components/ui/Logo';
import { authService } from '../../services/auth.service';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.forgotPassword(email);
            setSuccess(response.message);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-lightBlue/10 via-white to-yellow/10 flex items-center justify-center p-4 overflow-hidden relative">
            <div className="absolute top-20 -left-10 w-32 h-32 bg-yellow rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-20 -right-10 w-48 h-48 bg-lightBlue rounded-full blur-3xl opacity-30 animate-bounce"></div>

            <div className="max-w-md w-full relative z-10 flex flex-col items-center">
                <div className="mb-8 flex flex-col items-center">
                    <Logo className="h-16 mb-6" />
                    <h1 className="text-3xl font-black text-navy mb-2 leading-tight text-center">
                        Mot de passe <span className="text-blue italic">perdu ?</span>
                    </h1>
                    <p className="text-navy/60 font-medium text-center">Pas de panique, on s'en occupe !</p>
                </div>

                <Card className="w-full">
                    {success ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-blue/10 text-blue rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-black text-navy mb-3">Email envoyé !</h2>
                            <p className="text-navy/60 text-sm font-medium leading-relaxed">{success}</p>
                            <Link to="/login">
                                <Button variant="outline" fullWidth className="mt-8">
                                    Retour à la connexion
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">
                                    {error}
                                </div>
                            )}

                            <Input
                                label="Adresse Email"
                                icon={Mail}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre@email.com"
                                required
                            />

                            <Button type="submit" fullWidth loading={loading} className="group">
                                <span>Envoyer le lien</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </form>
                    )}
                </Card>

                <p className="text-center mt-8 text-sm font-bold text-navy/60">
                    Vous vous en souvenez ?{' '}
                    <Link to="/login" className="text-blue hover:underline">Se connecter</Link>
                </p>

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

export default ForgotPassword;
