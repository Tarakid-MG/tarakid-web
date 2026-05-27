import React from "react";

export function KidTopCard({
  icon,
  label,
  value,
  accent,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  badge?: string;
}) {
  return (
    <div className="rounded-[2.2rem] border-4 border-white/85 bg-white/88 px-5 py-4 shadow-[0_16px_38px_rgba(32,42,68,0.12)] backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="shrink-0">{icon}</div>
        <div className="min-w-0">
          <div className={`text-[11px] font-black uppercase tracking-[0.22em] ${accent}`}>
            {label}
          </div>
          <div className="mt-1 text-lg font-black text-navy leading-tight">
            {value}
          </div>
          {badge && (
            <div className="mt-2 inline-flex rounded-full bg-orange/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange">
              {badge}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
