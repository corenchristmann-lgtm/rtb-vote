"use client";

import Image from "next/image";

export function ThanksScreen() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="bg-ambient" />

      {/* Confetti dots */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 30}%`,
              backgroundColor: ["#7A4AED", "#E879A8", "#10B981", "#F59E0B", "#6366F1"][i % 5],
              animation: `confetti-fall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 1.5}s both`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-sm space-y-8 text-center relative z-20">
        {/* Animated check with glow */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full bg-success/20" style={{ animation: "pulse-ring 1.5s ease-out 0.3s both" }} />
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-success/15 to-success/5 glass flex items-center justify-center shadow-xl shadow-success/15">
              <svg
                className="animate-check"
                width="52"
                height="52"
                viewBox="0 0 48 48"
                fill="none"
              >
                <circle cx="24" cy="24" r="21" stroke="#10B981" strokeWidth="2.5" opacity="0.3" />
                <circle cx="24" cy="24" r="21" stroke="#10B981" strokeWidth="2.5" strokeDasharray="132" strokeDashoffset="132" style={{ animation: "checkmark 0.8s ease-out 0.2s forwards" }} />
                <path
                  d="M14 24L21 31L34 18"
                  stroke="#10B981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <h1 className="text-3xl font-extrabold bg-gradient-to-br from-heading to-primary bg-clip-text text-transparent">
            Merci pour ton vote !
          </h1>
          <p className="text-sm text-muted mt-3 font-medium leading-relaxed">
            Le resultat sera annonce ce soir.<br />
            Profite bien de la soiree !
          </p>
        </div>

        {/* Logo */}
        <div className="animate-fade-in-up pt-6" style={{ animationDelay: "600ms" }}>
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-xl glass flex items-center justify-center shadow-lg shadow-primary/10">
              <Image src="/logos/venturelab.svg" alt="VentureLab" width={32} height={32} unoptimized />
            </div>
          </div>
          <p className="text-[11px] text-muted/40 mt-3 font-medium tracking-wide">
            Road to Business 2026
          </p>
        </div>
      </div>
    </div>
  );
}
