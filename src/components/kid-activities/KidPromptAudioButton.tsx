import React from "react";
import { Volume2 } from "lucide-react";
import { Button } from "../ui/Button";

interface KidPromptAudioButtonProps {
  disabled?: boolean;
  label?: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export const KidPromptAudioButton: React.FC<KidPromptAudioButtonProps> = ({
  disabled = false,
  label = "Listen",
  onClick,
}) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    variant="kidYellow"
    className={[
      "kid-listen-nudge w-fit gap-3 rounded-[1.7rem] border-[3px] border-white/90",
      "bg-linear-to-r from-yellow via-gold to-orange px-5 py-3 text-lg shadow-[0_16px_0_rgba(199,126,8,0.26),0_18px_34px_rgba(8,15,40,0.2)]",
      disabled ? "cursor-not-allowed opacity-60" : "",
    ].join(" ")}
  >
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-orange shadow-[0_8px_16px_rgba(255,255,255,0.35)]">
      <Volume2 className="kid-listen-icon h-5 w-5" />
    </span>
    <span className="flex flex-col items-start leading-none">
      <span className="text-[10px] uppercase tracking-[0.18em] text-navy/65">
        Tap Here
      </span>
      <span>{label}</span>
    </span>
  </Button>
);
