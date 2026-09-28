import React from "react";
import { Sparkles, Star } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

const kidSceneBackground = "url('/images/backgrounds/kids-bg.png')";

interface KidActivitySceneProps {
  children: React.ReactNode;
  padded?: boolean;
  variant?: "chooser" | "experience";
}

export const KidActivityScene: React.FC<KidActivitySceneProps> = ({
  children,
  padded = false,
  variant = "chooser",
}) => {
  void variant;

  return (
    <div
      className={["relative min-h-screen overflow-hidden", padded ? "p-4 md:p-8" : ""].join(" ")}
      style={{
        backgroundImage: kidSceneBackground,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {children}
    </div>
  );
};

interface KidActivityLoadingCardProps {
  title: string;
  description: string;
  pulse?: boolean;
}

export const KidActivityLoadingCard: React.FC<KidActivityLoadingCardProps> = ({
  title,
  description,
  pulse = false,
}) => (
  <div className="flex min-h-screen items-center justify-center p-6">
    <Card variant="kidSection" className="w-full max-w-xl p-8 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-slate-100 bg-white shadow-[0_12px_24px_rgba(32,42,68,0.10)]">
        <Sparkles className={["h-10 w-10 text-blue", pulse ? "animate-pulse" : ""].join(" ")} />
      </div>
      <h1 className="mt-6 text-3xl font-black text-navy">{title}</h1>
      <p className="mt-3 font-bold text-navy/65">{description}</p>
    </Card>
  </div>
);

interface KidActivityPendingCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  onBack: () => void;
}

export const KidActivityPendingCard: React.FC<KidActivityPendingCardProps> = ({
  title,
  description,
  buttonLabel,
  onBack,
}) => (
  <div className="flex min-h-screen items-center justify-center p-6">
    <Card variant="kidSection" className="w-full max-w-xl p-8 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-slate-100 bg-white shadow-[0_12px_24px_rgba(32,42,68,0.10)]">
        <Sparkles className="h-10 w-10 text-blue" />
      </div>
      <h1 className="mt-6 text-3xl font-black text-navy">{title}</h1>
      <p className="mt-3 font-bold text-navy/65">{description}</p>
      <Button type="button" onClick={onBack} variant="kidBlue" className="mt-6">
        {buttonLabel}
      </Button>
    </Card>
  </div>
);

interface KidActivityRewardBurstProps {
  id: number;
  text: string;
}

export const KidActivityRewardBurst: React.FC<KidActivityRewardBurstProps> = ({ id, text }) => (
  <div key={id} className="pointer-events-none absolute left-1/2 top-28 z-40 -translate-x-1/2 kid-success-burst">
    <div className="relative rounded-full border-[3px] border-white bg-gold px-6 py-3 text-lg font-black text-navy shadow-[0_12px_28px_rgba(32,42,68,0.16)]">
      <span className="inline-flex items-center gap-2">
        <Star className="h-5 w-5 fill-current" />
        {text}
        <Star className="h-5 w-5 fill-current" />
      </span>
    </div>
  </div>
);
