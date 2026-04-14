"use client";

import Image from "next/image";

export function ThanksScreen() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Animated check */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center">
            <svg
              className="animate-check"
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
            >
              <circle cx="24" cy="24" r="22" stroke="#10B981" strokeWidth="3" />
              <path
                d="M14 24L21 31L34 18"
                stroke="#10B981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <h1 className="text-2xl font-extrabold text-heading">
            Merci pour ton vote !
          </h1>
          <p className="text-sm text-muted mt-2">
            Le resultat sera annonce ce soir.
          </p>
        </div>

        {/* Logo */}
        <div className="animate-fade-in-up pt-4" style={{ animationDelay: "500ms" }}>
          <div className="flex justify-center">
            <Image src="/logos/venturelab.svg" alt="VentureLab" width={40} height={40} unoptimized />
          </div>
          <p className="text-[11px] text-muted/50 mt-2">
            Road to Business 2026
          </p>
        </div>
      </div>
    </div>
  );
}
