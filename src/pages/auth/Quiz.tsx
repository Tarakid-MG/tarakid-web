import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Logo } from "../../components/ui/Logo";
import { type QuizData } from "../../types/quiz";
import { useAuth } from "../../context/AuthContextDefinition";
import api from "../../api/client";

// Step Components
import AgeStep from "../../components/quiz/steps/AgeStep";
import IdentityStep from "../../components/quiz/steps/IdentityStep";
import MotherTongueSpeakStep from "../../components/quiz/steps/MotherTongueSpeakStep";
import MotherTongueReadStep from "../../components/quiz/steps/MotherTongueReadStep";
import EnglishReadingStep from "../../components/quiz/steps/EnglishReadingStep";
import EnglishSpeakingStep from "../../components/quiz/steps/EnglishSpeakingStep";
import DurationStep from "../../components/quiz/steps/DurationStep";
import HobbiesStep from "../../components/quiz/steps/HobbiesStep";

const STORAGE_KEY = "tarakid_onboarding";

const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showTransition, setShowTransition] = useState(false);
  const [data, setData] = useState<QuizData>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load quiz data", e);
      }
    }
    return {
      id: crypto.randomUUID(),
      age: 7,
      childName: "",
      gender: "BOY",
      motherTongueSpeakingLevel: "FLUENT",
      motherTongueReadingLevel: "FLUENT",
      englishReadingLevel: "NONE",
      englishSpeakingLevel: "NONE",
      learningDuration: "Just starting",
      hobbies: [],
    };
  });

  const { user, isAuthenticated, refreshProfile } = useAuth();

  useEffect(() => {
    if (showTransition) {
      const finishQuiz = async () => {
        if (isAuthenticated && user) {
          try {
            await api.post("/kids", data);
            await refreshProfile();
            // Redirect directly to booking
            navigate(`/free-trial-booking?userId=${user?.id}`);
          } catch (err) {
            console.error("Failed to save quiz for existing user", err);
            // Fallback to register if something goes wrong, or error state
            navigate("/register");
          }
        } else {
          const timer = setTimeout(() => {
            navigate("/register");
          }, 3000);
          return () => clearTimeout(timer);
        }
      };

      finishQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTransition, navigate, isAuthenticated, user, refreshProfile]);

  useEffect(() => {
    // If user already has kids and tries to access quiz, maybe redirect?
    // But let them add more kids if they want.
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const handleNext = () => {
    if (step < 8) {
      setStep(step + 1);
    } else {
      setShowTransition(true);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateData = (updates: Partial<QuizData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const progress = (step / 8) * 100;

  const renderStep = () => {
    const props = { data, updateData, onNext: handleNext };
    switch (step) {
      case 1:
        return <AgeStep {...props} />;
      case 2:
        return <IdentityStep {...props} />;
      case 3:
        return <MotherTongueSpeakStep {...props} />;
      case 4:
        return <MotherTongueReadStep {...props} />;
      case 5:
        return <EnglishReadingStep {...props} />;
      case 6:
        return <EnglishSpeakingStep {...props} />;
      case 7:
        return <DurationStep {...props} />;
      case 8:
        return <HobbiesStep {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-lightBlue/10 via-white to-yellow/10 flex flex-col items-center p-4 md:p-8 overflow-hidden relative">
      <div className="absolute top-20 -left-10 w-32 h-32 bg-yellow rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 -right-10 w-48 h-48 bg-lightBlue rounded-full blur-3xl opacity-30 animate-bounce"></div>

      <div className="max-w-2xl w-full relative z-10 flex flex-col items-center">
        <Logo className="h-12 mb-8" />

        <div className="w-full mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-navy font-black uppercase tracking-wider text-xs">
              Aventure TaraKid
            </span>
            <span className="text-blue font-black text-xs">{step} / 8</span>
          </div>
          <div className="h-3 w-full bg-beige rounded-full overflow-hidden border-2 border-white shadow-inner">
            <div
              className="h-full bg-blue transition-all duration-500 ease-out rounded-full shadow-lg"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <Card className="w-full min-h-[450px] flex flex-col overflow-hidden relative p-8">
          <div className="grow flex flex-col">
            {showTransition ? (
              <div className="grow flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in-95 duration-700">
                <div className="w-24 h-24 bg-blue/10 rounded-full flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 bg-blue/20 rounded-full animate-ping"></div>
                  <div className="bg-blue text-white p-4 rounded-full relative z-10">
                    <Sparkles className="w-10 h-10 animate-spin-slow" />
                  </div>
                </div>

                <h2 className="text-3xl font-black text-navy mb-6">
                  Presque fini ! ✨
                </h2>

                <div className="space-y-4">
                  <p className="text-xl font-bold text-navy/70 leading-relaxed max-w-md mx-auto">
                    Pour continuer, vous devez{" "}
                    <span className="text-blue">créer un compte</span>
                  </p>

                  <div className="flex items-center justify-center gap-2 text-blue font-black uppercase tracking-widest text-xs mt-8">
                    <div className="w-2 h-2 bg-blue rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-blue rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-blue rounded-full animate-bounce"></div>
                    <span className="ml-2">Redirection...</span>
                  </div>
                </div>
              </div>
            ) : (
              renderStep()
            )}
          </div>

          {!showTransition && (
            <div className="mt-12 flex items-center justify-between pt-8 border-t-2 border-beige">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className={`flex items-center space-x-2 font-black uppercase tracking-wider text-sm ${
                  step === 1
                    ? "text-navy/10 cursor-not-allowed"
                    : "text-navy/40 hover:text-navy transition-colors"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </button>
              <Button
                onClick={handleNext}
                className="group min-w-[140px]"
                disabled={step === 2 && !data.childName}
              >
                <span className="mr-2">Continuer</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
