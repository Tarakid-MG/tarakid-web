import React from 'react';
import { type QuizStepProps } from '../../../types/quiz';

const DurationStep: React.FC<QuizStepProps> = ({ data, updateData, onNext }) => {
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-black text-navy mb-8 text-center text-balance">
                Depuis combien de temps apprend-il ? ⏳
            </h2>
            <div className="grid grid-cols-1 gap-3">
                {[
                    'C\'est sa toute première fois ! 🌟',
                    'Moins de 6 mois 🌿',
                    'Entre 6 mois et 1 an 🌳',
                    'Plus de 1 an 🚀',
                    'Plus de 2 ans 🏆'
                ].map((val) => (
                    <button
                        key={val}
                        onClick={() => { updateData({ learningDuration: val }); onNext(); }}
                        className={`p-6 rounded-4xl border-4 text-center transition-all ${data.learningDuration === val
                                ? 'border-blue bg-blue/5 shadow-xl scale-[1.02]'
                                : 'border-beige hover:border-blue/30'
                            }`}
                    >
                        <p className="font-black text-xl text-navy">{val}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DurationStep;
