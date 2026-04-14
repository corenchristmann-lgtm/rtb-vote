"use client";

import Image from "next/image";
import type { Finalist } from "@/lib/types";

interface Props {
  finalist: Finalist;
  selected: boolean;
  onSelect: () => void;
}

export function FinalistCard({ finalist, selected, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-[20px] bg-surface overflow-hidden active:scale-[0.98] transition-all duration-200 ${
        selected
          ? "shadow-[0_0_0_2.5px_#7A4AED,0_8px_24px_rgba(122,74,237,0.18)]"
          : "shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)]"
      }`}
    >
      {/* Photo — large, 16:9 crop */}
      <div className="relative w-full aspect-[16/9] bg-bg overflow-hidden">
        <Image
          src={finalist.photo_url}
          alt={`${finalist.first_name} ${finalist.last_name}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
          unoptimized
        />
        {/* Selected badge */}
        {selected && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary shadow-[0_2px_8px_rgba(122,74,237,0.4)] flex items-center justify-center animate-scale-in">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3.5 8.5L6.5 11.5L12.5 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[17px] font-bold text-heading leading-snug">
              {finalist.project_name}
            </h3>
            <p className="text-[13px] font-semibold text-primary mt-0.5">
              {finalist.first_name} {finalist.last_name}
            </p>
          </div>
        </div>
        <p className="text-[13px] text-muted leading-[1.55] mt-2">
          {finalist.description}
        </p>
      </div>
    </button>
  );
}
