import React from 'react';
import { type QuizStepProps, type EnglishLevel } from '../../../types/quiz';

const EnglishSpeakingStep: React.FC<QuizStepProps> = ({ data, updateData, onNext }) => {
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-black text-navy mb-8 text-center text-balance">
                Et pour <span className="text-orange italic">Parler</span> ? 🗣️
            </h2>
            <div className="grid grid-cols-1 gap-4">
                {[
                    { val: 'FLUENT', label: 'Conversation fluide 💬', sub: 'Peut discuter de tout' },
                    { val: 'SENTENCES', label: 'Phrases complètes 🗣️', sub: 'Sait s\'exprimer simplement' },
                    { val: 'WORDS', label: 'Mots isolés 👋', sub: 'Hello, water, mama...' },
                    { val: 'NONE', label: 'Rien du tout 🤐', sub: 'Débutant complet' }
                ].map((opt) => (
                    <button
                        key={opt.val}
                        onClick={() => { updateData({ englishSpeakingLevel: opt.val as EnglishLevel }); onNext(); }}
                        className={`p-5 rounded-4xl border-4 text-left transition-all ${data.englishSpeakingLevel === opt.val
                                ? 'border-orange bg-orange/5 shadow-xl scale-[1.02]'
                                : 'border-beige hover:border-orange/30'
                            }`}
                    >
                        <p className="font-black text-xl text-navy mb-1">{opt.label}</p>
                        <p className="font-bold text-navy/40">{opt.sub}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default EnglishSpeakingStep;
