import type { ReactNode } from "react";

export function ParentPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-[1.85rem] border border-white/90 bg-white/92 shadow-[0_18px_44px_rgba(32,42,68,0.07)] backdrop-blur-xl",
        "ring-1 ring-slate-900/2",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function ParentOrb({
  children,
  accent = "blue",
  className = "",
}: {
  children: ReactNode;
  accent?: "blue" | "gold" | "turquoise" | "orange" | "purple" | "red";
  className?: string;
}) {
  const palette =
    accent === "gold"
      ? "from-[#fff7c4] via-yellow to-gold text-orange shadow-[0_14px_28px_rgba(239,191,4,0.28)]"
      : accent === "turquoise"
        ? "from-[#d9fff8] via-turquoise/75 to-teal/80 text-teal shadow-[0_14px_28px_rgba(64,224,208,0.22)]"
        : accent === "orange"
          ? "from-[#ffedd8] via-[#ffb56c] to-orange text-orange shadow-[0_14px_28px_rgba(247,127,0,0.22)]"
          : accent === "purple"
            ? "from-[#efe9ff] via-[#c8b6ff] to-[#8b5cf6] text-[#6d28d9] shadow-[0_14px_28px_rgba(139,92,246,0.20)]"
            : accent === "red"
              ? "from-[#ffe5e5] via-[#ff9e9e] to-[#ff5c5c] text-red-500 shadow-[0_14px_28px_rgba(239,68,68,0.18)]"
              : "from-[#e1f7ff] via-lightBlue/80 to-blue text-blue shadow-[0_14px_28px_rgba(33,158,188,0.20)]";

  return (
    <div
      className={[
        "flex h-13 w-13 items-center justify-center rounded-[1.2rem] border border-white/90 bg-linear-to-br",
        "shadow-inner shadow-white/25",
        palette,
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
