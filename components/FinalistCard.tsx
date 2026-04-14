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
      className={`pressable w-full text-left rounded-2xl transition-all duration-250 overflow-hidden ${
        selected
          ? "glass-strong ring-2 ring-primary shadow-xl shadow-primary/15 scale-[1.015]"
          : "glass hover:shadow-lg hover:ring-1 hover:ring-primary/20"
      }`}
    >
      <div className="flex gap-4 p-4">
        {/* Photo with subtle ring */}
        <div className={`relative w-[72px] h-[72px] rounded-xl overflow-hidden shrink-0 transition-all duration-250 ${
          selected ? "ring-2 ring-primary ring-offset-2 ring-offset-white/50" : ""
        }`}>
          <Image
            src={finalist.photo_url}
            alt={`${finalist.first_name} ${finalist.last_name}`}
            width={72}
            height={72}
            className="w-full h-full object-cover"
            unoptimized
          />
          {/* Overlay gradient on selected */}
          {selected && (
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-[15px] font-bold text-heading leading-tight">
            {finalist.first_name} {finalist.last_name}
          </p>
          <p className={`text-sm font-semibold mt-0.5 leading-tight transition-colors duration-200 ${
            selected ? "text-primary" : "text-primary/70"
          }`}>
            {finalist.project_name}
          </p>
          <p className="text-xs text-muted mt-1.5 leading-relaxed line-clamp-2">
            {finalist.description}
          </p>
        </div>

        {/* Check indicator */}
        <div className="flex items-center shrink-0">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-250 ${
            selected
              ? "bg-gradient-to-br from-primary to-primary-light shadow-lg shadow-primary/30"
              : "border-2 border-border/60 bg-white/50"
          }`}>
            {selected && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="animate-fade-in-scale">
                <path d="M3 7.5L5.5 10L11 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
