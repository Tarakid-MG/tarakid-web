import { useState } from "react";

export function KidAvatarBubble({
  avatarSrc,
  kidName,
  className = "",
  placeholderClassName = "",
}: {
  avatarSrc: string;
  kidName: string;
  className?: string;
  placeholderClassName?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const canRenderImage = Boolean(avatarSrc) && failedSrc !== avatarSrc;

  if (canRenderImage) {
    return (
      <img
        src={avatarSrc}
        alt={kidName}
        className={`${className} object-cover`}
        onError={() => setFailedSrc(avatarSrc)}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center text-center text-navy ${placeholderClassName}`}
    >
      {kidName.trim().charAt(0).toUpperCase() || "K"}
    </div>
  );
}
