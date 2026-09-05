"use client";

import Image from "next/image";
import { useState } from "react";

export type PlayerImageVariant = "hero" | "card" | "squad" | "avatar";

type PlayerImageProps = {
  src?: string | null;
  alt: string;
  variant?: PlayerImageVariant;
  sizes?: string;
  priority?: boolean;
  objectPosition?: string;
  className?: string;
  fill?: boolean;
};

const VARIANT_SIZES: Record<PlayerImageVariant, string> = {
  hero: "(min-width: 1024px) 28vw, 40vw",
  card: "(min-width: 768px) 20vw, 40vw",
  squad: "72px",
  avatar: "48px",
};

const ALLOWED = [
  "resources.premierleague.com",
  "fantasy.premierleague.com",
];

export function playerImageSrc(url?: string | null) {
  const raw = (url || "").trim();
  if (!raw) return "";
  if (raw.startsWith("/")) return raw;
  try {
    const host = new URL(raw).hostname;
    if (ALLOWED.some((h) => host === h || host.endsWith(`.${h}`))) {
      return `/api/player-image?u=${encodeURIComponent(raw)}`;
    }
  } catch {
    return "";
  }
  return "";
}

export function PlayerImage({
  src,
  alt,
  variant = "card",
  sizes,
  priority = false,
  objectPosition = "center 18%",
  className = "",
  fill = true,
}: PlayerImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = playerImageSrc(src);
  const unusable = failed || !resolved;

  if (unusable) {
    return (
      <div
        className={`flex items-end bg-[#d8d1c4] ${fill ? "absolute inset-0" : "relative h-full w-full"} ${className}`}
        role="img"
        aria-label={alt}
      >
        <p className="relative p-3 font-serif text-lg leading-none text-ink/35 sm:p-4">
          {alt}
        </p>
      </div>
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      fill={fill}
      sizes={sizes || VARIANT_SIZES[variant]}
      priority={priority}
      className={`object-cover ${className}`}
      style={{ objectPosition }}
      onError={() => setFailed(true)}
      unoptimized
    />
  );
}
