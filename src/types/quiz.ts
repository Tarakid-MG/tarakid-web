export type EnglishLevel = 'NONE' | 'WORDS' | 'SENTENCES' | 'FLUENT';
export type MotherTongueLevel = 'NONE' | 'SOME' | 'FLUENT';
export type Gender = 'BOY' | 'GIRL' | 'OTHER';

export interface QuizData {
    id: string;
    age: number;
    childName: string;
    gender: Gender;
    motherTongueProficiency: MotherTongueLevel;
    englishReadingLevel: EnglishLevel;
    englishSpeakingLevel: EnglishLevel;
    learningDuration: string;
    hobbies: string[];
}

export interface QuizStepProps {
    data: QuizData;
    updateData: (updates: Partial<QuizData>) => void;
    onNext: () => void;
}
