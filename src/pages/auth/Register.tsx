import React, { useState } from 'react';
import { Mail, Lock, User, Star, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Logo } from '../../components/ui/Logo';
import { authService } from '../../services/auth.service';
import type { AccountType, UserRole } from '../../types/auth';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'CLIENT' as UserRole,
        accountType: 'PARENT' as AccountType,
    });

    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    });

    const validateField = (name: string, value: string) => {
        let error = '';
        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) error = 'L\'email est requis';
            else if (!emailRegex.test(value)) error = 'Email invalide';
        } else if (name === 'password') {
            if (!value) error = 'Le mot de passe est requis';
            else if (value.length < 8) error = 'Minimum 8 caractères';
        } else if (name === 'firstName' || name === 'lastName') {
            if (!value) error = 'Ce champ est requis';
        }
        setFieldErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.register(formData);
            setSuccess(response.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-lightBlue/10 via-white to-yellow/10 flex items-center justify-center p-4 overflow-hidden relative">
            <div className="absolute top-20 -left-10 w-32 h-32 bg-yellow rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-20 -right-10 w-48 h-48 bg-lightBlue rounded-full blur-3xl opacity-30 animate-bounce"></div>

            <div className="max-w-xl w-full relative z-10 flex flex-col items-center">
                <div className="mb-6 flex flex-col items-center">
                    <Logo className="h-14 mb-4" />
                    <h1 className="text-3xl font-black text-navy mb-2 leading-tight text-center">
                        Créer un <span className="text-orange italic">compte</span>
                    </h1>
                    <p className="text-navy/60 font-medium">Rejoignez la communauté TaraKid</p>
                </div>

                <Card className="w-full">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Star className="w-10 h-10 fill-current" />
                            </div>
                            <h2 className="text-2xl font-black text-navy mb-4">Inscription réussie !</h2>
                            <p className="text-navy/60 font-medium">{success}</p>
                            <p className="mt-4 text-sm text-blue font-bold italic">Redirection vers la page de connexion...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input
                                    label="Prénom"
                                    name="firstName"
                                    icon={User}
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Sophie"
                                    error={fieldErrors.firstName}
                                    required
                                />
                                <Input
                                    label="Nom"
                                    name="lastName"
                                    icon={User}
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Dubois"
                                    error={fieldErrors.lastName}
                                    required
                                />
                            </div>

                            <Input
                                label="Adresse Email"
                                name="email"
                                icon={Mail}
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="votre@email.com"
                                error={fieldErrors.email}
                                required
                            />

                            <Input
                                label="Mot de passe"
                                name="password"
                                icon={Lock}
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                error={fieldErrors.password}
                                required
                                rightAction={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-navy/30 hover:text-navy/50 transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                }
                            />

                            <Button type="submit" fullWidth loading={loading} className="group mt-4">
                                <span>C'est parti !</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>

                            <div className="mt-8 pt-6 border-t-2 border-beige flex flex-col items-center">
                                <p className="text-sm font-bold text-navy/60 mb-4 text-center">Ou se connecter avec</p>
                                <div className="flex space-x-4">
                                    <button type="button" className="w-12 h-12 rounded-xl border-2 border-beige flex items-center justify-center hover:bg-beige/20 transition-colors">
                                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                                    </button>
                                    <button type="button" className="w-12 h-12 rounded-xl border-2 border-beige flex items-center justify-center hover:bg-beige/20 transition-colors">
                                        <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </Card>

                <p className="text-center mt-6 text-sm font-bold text-navy/60">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="text-blue hover:underline">Se connecter</Link>
                </p>

                <div className="mt-8 flex justify-center space-x-6 text-xs font-bold text-navy/40">
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

export default Register;
