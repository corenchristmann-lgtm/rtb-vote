"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getSupabase } from "@/lib/supabase";
import { FinalistCard } from "./FinalistCard";
import type { Guest, Finalist } from "@/lib/types";

interface Props {
  guest: Guest;
  onVoted: () => void;
}

export function VoteScreen({ guest, onVoted }: Props) {
  const [finalists, setFinalists] = useState<Finalist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await getSupabase()
        .from("rtb_finalists")
        .select("*")
        .order("display_order");
      if (data) setFinalists(data as Finalist[]);
      setLoading(false);
    }
    load();
  }, []);

  const selected = finalists.find((f) => f.id === selectedId);

  async function handleConfirm() {
    if (!selectedId) return;
    setSubmitting(true);
    setError(null);

    const MAX_RETRIES = 3;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const { error: rpcErr } = await getSupabase()
          .rpc("cast_vote", { p_guest_id: guest.id, p_finalist_id: selectedId });

        if (rpcErr) {
          if (rpcErr.code === "23505") {
            setError("Tu as déjà voté !");
            setSubmitting(false);
            setConfirming(false);
            return;
          }
          // Retry on transient errors
          if (attempt < MAX_RETRIES - 1) continue;
          setError("Erreur lors du vote. Réessaie.");
          setSubmitting(false);
          setConfirming(false);
          return;
        }

        onVoted();
        return;
      } catch {
        if (attempt < MAX_RETRIES - 1) continue;
        setError("Erreur de connexion. Réessaie.");
        setSubmitting(false);
        setConfirming(false);
      }
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh gap-3 bg-bg">
        <div className="w-8 h-8 border-[2.5px] border-primary/15 border-t-primary rounded-full animate-spin" />
        <p className="text-[13px] text-muted font-medium">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-bg/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-5 pt-[max(env(safe-area-inset-top),16px)] pb-4">
          <p className="text-[13px] font-medium text-muted text-center">
            Bonjour {guest.first_name}
          </p>
          <h1 className="text-[20px] font-extrabold text-heading text-center mt-0.5 tracking-tight">
            Ton coup de cœur ?
          </h1>
          <p className="text-[13px] text-muted text-center mt-1 italic">
            Choisis l'entrepreneur qui t'a le plus convaincu
          </p>
        </div>
      </div>

      {/* Finalist list */}
      <div className="flex-1 px-5 pt-5 pb-32">
        <div className="space-y-3" role="listbox" aria-label="Liste des finalistes">
          {finalists.map((f, i) => (
            <div key={f.id} className="animate-in" style={{ animationDelay: `${i * 50}ms` }}>
              <FinalistCard
                finalist={f}
                selected={selectedId === f.id}
                expanded={expandedId === f.id}
                onToggle={() => setExpandedId(expandedId === f.id ? null : f.id)}
                onSelect={() => { setSelectedId(f.id); setExpandedId(null); }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="bg-gradient-to-t from-bg from-60% to-transparent h-8" />
        <div className="bg-bg px-5 pb-[max(env(safe-area-inset-bottom),20px)]">
          {error && (
            <div className="rounded-[12px] bg-error/6 px-4 py-2.5 mb-3 animate-scale-in">
              <p className="text-[13px] text-error text-center font-semibold">{error}</p>
            </div>
          )}
          <button
            onClick={() => setConfirming(true)}
            disabled={!selectedId}
            className="w-full h-[56px] rounded-[16px] bg-primary text-white text-[16px] font-bold shadow-[0_4px_14px_rgba(122,74,237,0.35)] disabled:bg-heading/8 disabled:text-muted/40 disabled:shadow-none active:scale-[0.98] transition-all duration-150"
          >
            {selectedId ? (
              <span className="flex items-center justify-center gap-2 max-w-full px-2">
                <span className="truncate">Voter pour {selected?.project_name}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-80 shrink-0">
                  <path d="M5 12h14m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            ) : "Sélectionne un projet"}
          </button>
        </div>
      </div>

      {/* Confirmation bottom sheet */}
      {confirming && selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-heading/50 animate-overlay"
            onClick={() => !submitting && setConfirming(false)}
          />

          {/* Sheet */}
          <div className="relative w-full max-w-[440px] bg-surface rounded-t-[28px] animate-slide-up shadow-[0_-8px_40px_rgba(0,0,0,0.12)]">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-[5px] rounded-full bg-heading/10" />
            </div>

            <div className="px-6 pb-[max(env(safe-area-inset-bottom),24px)] pt-2">
              <p className="text-[20px] font-extrabold text-heading text-center">
                Confirmer ton vote
              </p>
              <p className="text-[14px] text-muted text-center mt-1">
                Cette action est définitive
              </p>

              {/* Selected project recap */}
              <div className="mt-5 rounded-[16px] overflow-hidden border border-border shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                <div className="relative w-full aspect-[21/9] bg-bg overflow-hidden">
                  <Image src={selected.photo_url} alt="" fill className="object-cover" sizes="440px" unoptimized />
                </div>
                <div className="px-4 py-3">
                  <p className="text-[16px] font-bold text-heading">{selected.project_name}</p>
                  <p className="text-[13px] text-primary font-semibold">{selected.first_name} {selected.last_name}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="w-full h-[52px] rounded-[14px] bg-primary text-white text-[15px] font-bold shadow-[0_4px_14px_rgba(122,74,237,0.35)] disabled:opacity-60 active:scale-[0.98] transition-all duration-150"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi...
                    </span>
                  ) : "Confirmer mon vote"}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  disabled={submitting}
                  className="w-full h-[48px] rounded-[14px] text-[15px] font-semibold text-muted active:bg-bg transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
