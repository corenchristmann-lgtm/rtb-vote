"use client";

import { useState } from "react";
import Image from "next/image";
import type { Finalist } from "@/lib/types";

interface Props {
  finalist: Finalist;
  selected: boolean;
  expanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
}

export function FinalistCard({ finalist, selected, expanded, onToggle, onSelect }: Props) {
  return (
    <div
      role="option"
      aria-selected={selected}
      className={`rounded-[16px] overflow-hidden transition-all duration-200 ${
        selected
          ? "bg-primary/[0.04] shadow-[0_0_0_2.5px_#7A4AED,0_4px_16px_rgba(122,74,237,0.15)]"
          : "bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.08),0_2px_12px_rgba(0,0,0,0.05)]"
      } ${selected ? "animate-select-bounce" : ""}`}
    >
      {/* Header row — tap to select + expand */}
      <button
        onClick={() => { onSelect(); if (!expanded) onToggle(); }}
        className="w-full flex items-center gap-3.5 px-4 py-3.5 active:bg-bg/50 transition-colors"
      >
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-full overflow-hidden shrink-0 bg-bg transition-all duration-200 ${
          selected ? "ring-2 ring-primary ring-offset-2" : ""
        }`}>
          <Image
            src={finalist.photo_url}
            alt={`${finalist.first_name} ${finalist.last_name}`}
            width={48}
            height={48}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>

        {/* Name + project */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[15px] font-bold text-heading leading-tight truncate">
            {finalist.first_name} {finalist.last_name}
          </p>
          <p className="text-[13px] font-semibold text-primary leading-tight mt-0.5 truncate">
            {finalist.project_name}
          </p>
        </div>

        {/* Selected check or chevron */}
        {selected ? (
          <div className="w-7 h-7 rounded-full bg-primary shrink-0 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3.5 8.5L6.5 11.5L12.5 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : (
          <svg
            width="20" height="20" viewBox="0 0 20 20" fill="none"
            className={`shrink-0 text-subtle transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Expandable detail */}
      <div
        className="grid transition-[grid-template-rows] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">
            {/* Separator */}
            <div className="h-px bg-border/60 mb-3.5" />

            {/* Photo large */}
            <div className="relative w-full aspect-[16/9] rounded-[12px] overflow-hidden bg-bg">
              <Image
                src={finalist.photo_url}
                alt=""
                fill
                className={`object-cover ${finalist.first_name === "Florence" ? "object-top" : "object-center"}`}
                sizes="(max-width: 768px) 100vw, 400px"
                unoptimized
              />
            </div>

            {/* Description */}
            <p className="text-[14px] text-muted leading-[1.6] mt-3">
              {finalist.description}
            </p>

            {/* Vote button */}
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className={`w-full h-[48px] rounded-[12px] mt-4 text-[14px] font-bold transition-all duration-150 active:scale-[0.98] ${
                selected
                  ? "bg-primary/10 text-primary border-2 border-primary/25"
                  : "bg-primary text-white shadow-[0_4px_14px_rgba(122,74,237,0.3)]"
              }`}
            >
              {selected ? (
                <span className="flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3.5 8.5L6.5 11.5L12.5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Sélectionné
                </span>
              ) : "Choisir ce projet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
