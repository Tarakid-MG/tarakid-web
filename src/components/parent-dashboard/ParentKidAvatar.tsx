import { useState } from "react";

export function ParentKidAvatar({
  kidName,
  avatarSrc,
  className = "",
  fallbackClassName = "",
}: {
  kidName: string;
  avatarSrc?: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const canRenderImage = Boolean(avatarSrc) && failedSrc !== avatarSrc;

  if (canRenderImage) {
    return (
      <img
        src={avatarSrc}
        alt={kidName}
        className={`${className} object-cover`}
        onError={() => setFailedSrc(avatarSrc || "")}
      />
    );
  }

  return (
    <div
      className={[
        "flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-[#fff4c7] via-[#dff8ff] to-blue/15 text-navy",
        "shadow-inner shadow-white/50",
        fallbackClassName,
      ].join(" ")}
    >
      {kidName.trim().charAt(0).toUpperCase() || "K"}
    </div>
  );
}

