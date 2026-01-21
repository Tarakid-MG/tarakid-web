import React from 'react';
import { User } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { type QuizStepProps } from '../../../types/quiz';

const IdentityStep: React.FC<QuizStepProps> = ({ data, updateData }) => {
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-black text-navy mb-8 text-center text-balance">Faisons connaissance ! 👋</h2>
            <div className="space-y-8">
                <Input
                    label="Comment s'appelle votre enfant ?"
                    icon={User}
                    value={data.childName}
                    onChange={(e) => updateData({ childName: e.target.value })}
                    placeholder="Prénom de l'enfant"
                    className="text-lg"
                />
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-navy tracking-tight">C'est...</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => updateData({ gender: 'BOY' })}
                            className={`p-6 rounded-3xl border-4 text-center transition-all ${data.gender === 'BOY'
                                    ? 'border-blue bg-blue/5 text-blue scale-105 shadow-xl'
                                    : 'border-beige text-navy/40 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                                }`}
                        >
                            <div className="text-4xl mb-3">👦</div>
                            <p className="font-black uppercase tracking-wider">Un garçon</p>
                        </button>
                        <button
                            onClick={() => updateData({ gender: 'GIRL' })}
                            className={`p-6 rounded-3xl border-4 text-center transition-all ${data.gender === 'GIRL'
                                    ? 'border-pink-500 bg-pink-50 text-pink-500 scale-105 shadow-xl'
                                    : 'border-beige text-navy/40 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                                }`}
                        >
                            <div className="text-4xl mb-3">👧</div>
                            <p className="font-black uppercase tracking-wider">Une fille</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdentityStep;
