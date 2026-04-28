const AVATAR_COLORS = [
  "linear-gradient(135deg, #3b82f6, #2dd4bf)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #f59e0b, #d946ef)",
  "linear-gradient(135deg, #10b981, #3b82f6)",
  "linear-gradient(135deg, #6366f1, #a855f7)",
];

export function getAvatarGradient(name: string | null | undefined) {
  if (!name) return AVATAR_COLORS[0];
  const hash = name.split("").reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}
