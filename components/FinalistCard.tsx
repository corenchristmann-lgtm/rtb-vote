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
      className={`w-full text-left rounded-2xl bg-surface border-2 shadow-sm transition-all duration-200 overflow-hidden ${
        selected
          ? "border-primary shadow-lg shadow-primary/15 scale-[1.01]"
          : "border-transparent hover:border-primary/20 hover:shadow-md"
      }`}
    >
      <div className="flex gap-4 p-4">
        {/* Photo */}
        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-bg-start">
          <Image
            src={finalist.photo_url}
            alt={`${finalist.first_name} ${finalist.last_name}`}
            width={80}
            height={80}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-base font-bold text-heading leading-tight">
            {finalist.first_name} {finalist.last_name}
          </p>
          <p className="text-sm font-semibold text-primary mt-0.5 leading-tight">
            {finalist.project_name}
          </p>
          <p className="text-xs text-muted mt-1 leading-relaxed line-clamp-2">
            {finalist.description}
          </p>
        </div>

        {/* Check indicator */}
        <div className="flex items-center shrink-0">
          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            selected
              ? "bg-primary border-primary"
              : "border-border bg-transparent"
          }`}>
            {selected && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7.5L5.5 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
