"use client";

export function TitlePanel() {
  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-8 py-4 rounded-2xl text-sm"
      style={{
        background: "var(--glass-bg-heavy)",
        border: "1px solid var(--glass-border)",
        borderTop: "1px solid var(--glass-border-highlight)",
        backdropFilter: "blur(20px)",
        boxShadow: "var(--glass-shadow)",
      }}
    >
      <p className="text-white/90 font-semibold text-base text-center backdrop-blur-md">
        Voices of Singapore 🇸🇬
      </p>
    </div>
  );
}