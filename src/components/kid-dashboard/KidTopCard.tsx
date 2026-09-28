import React from "react";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

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
    <Card
      variant="parentPanel"
      className="kid-pop-in rounded-[2.2rem] border-4 border-white/85 bg-white/88 px-5 py-4 transition hover:-translate-y-0.5"
    >
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
            <Badge
              variant="orange"
              className="mt-2 bg-orange/10 px-2.5 py-1 text-[10px] tracking-[0.18em] shadow-none"
            >
              {badge}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
