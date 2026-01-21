import React from 'react';
import { Sparkles } from 'lucide-react';
import { type QuizStepProps } from '../../../types/quiz';

const AgeStep: React.FC<QuizStepProps> = ({ data, updateData, onNext }) => {
    return (
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-yellow/10 text-yellow rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-navy mb-4">Quel âge a votre enfant ? 🎂</h2>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((age) => (
                    <button
                        key={age}
                        onClick={() => { updateData({ age }); onNext(); }}
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl border-2 font-black text-xl transition-all ${data.age === age
                                ? 'border-blue bg-blue text-white shadow-lg scale-110'
                                : 'border-beige bg-white text-navy hover:border-blue/30 lg:hover:scale-105'
                            }`}
                    >
                        {age}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AgeStep;
