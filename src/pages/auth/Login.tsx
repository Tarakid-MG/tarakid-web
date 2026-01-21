import React, { useState } from 'react';
import { Mail, Lock, Star, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Logo } from '../../components/ui/Logo';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login: setAuthToken } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const validateField = (name: string, value: string) => {
        let error = '';
        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) error = 'L\'email est requis';
            else if (!emailRegex.test(value)) error = 'Email invalide';
        } else if (name === 'password') {
            if (!value) error = 'Le mot de passe est requis';
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
            const response = await authService.login(formData);
            setAuthToken(response.access_token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
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

                    <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md mb-6 transform -rotate-2 border-2 border-yellow">
                        <Sparkles className="w-5 h-5 text-orange" />
                        <span className="text-navy font-bold text-sm uppercase tracking-wide">TaraKid Welcome</span>
                    </div>

                    <h1 className="text-4xl font-black text-navy mb-2 leading-tight text-center">
                        Bon de <span className="text-blue italic">retour !</span>
                    </h1>
                    <p className="text-navy/60 font-medium text-center">Continuez l'aventure de votre enfant</p>
                </div>

                <Card className="w-full">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">
                                {error}
                            </div>
                        )}

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
                            rightElement={
                                <Link to="/forgot-password" title="Mot de passe oublié ?" className="text-xs font-bold text-blue hover:underline">Oublié ?</Link>
                            }
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

                        <Button type="submit" fullWidth loading={loading} className="group">
                            <span>Se Connecter</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t-2 border-beige flex flex-col items-center">
                        <p className="text-sm font-bold text-navy/60 mb-4 text-center">Ou se connecter avec</p>
                        <div className="flex space-x-4">
                            <button className="w-12 h-12 rounded-xl border-2 border-beige flex items-center justify-center hover:bg-beige/20 transition-colors">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                            </button>
                            <button className="w-12 h-12 rounded-xl border-2 border-beige flex items-center justify-center hover:bg-beige/20 transition-colors">
                                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </Card>

                <p className="text-center mt-8 text-sm font-bold text-navy/60">
                    Pas encore de compte ?{' '}
                    <Link to="/register" className="text-blue hover:underline">S'inscrire gratuitement</Link>
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

export default Login;
