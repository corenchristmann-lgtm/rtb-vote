"use client";

import Image from "next/image";

export function ThanksScreen() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-[320px] text-center">
        {/* Check circle */}
        <div className="flex justify-center animate-in">
          <div className="w-20 h-20 rounded-full bg-success/8 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
              <circle
                cx="25" cy="25" r="23"
                stroke="#10B981"
                strokeWidth="2"
                strokeDasharray="157"
                style={{ animation: "circleDraw 0.6s ease-out 0.1s both" }}
              />
              <path
                d="M15 25.5L22 32.5L36 18"
                stroke="#10B981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="30"
                style={{ animation: "checkDraw 0.4s ease-out 0.5s both" }}
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="mt-8 animate-in" style={{ animationDelay: "300ms" }}>
          <h1 className="text-[26px] font-extrabold text-heading tracking-tight">
            Merci !
          </h1>
          <p className="text-[15px] text-muted mt-3 leading-relaxed">
            Ton vote a bien ete enregistre.<br />
            Le resultat sera annonce ce soir.
          </p>
        </div>

        {/* Logo */}
        <div className="mt-12 animate-in" style={{ animationDelay: "500ms" }}>
          <div className="flex justify-center">
            <Image src="/logos/venturelab.svg" alt="VentureLab" width={28} height={28} unoptimized />
          </div>
          <p className="text-[11px] text-subtle mt-2">
            Road to Business 2026
          </p>
        </div>
      </div>
    </div>
  );
}
