"use client";

import { useState, useEffect } from "react";
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

    try {
      const { error: voteErr } = await getSupabase()
        .from("rtb_votes")
        .insert({ guest_id: guest.id, finalist_id: selectedId });

      if (voteErr) {
        if (voteErr.code === "23505") {
          setError("Tu as deja vote !");
        } else {
          setError("Erreur lors du vote. Reessaie.");
        }
        setSubmitting(false);
        setConfirming(false);
        return;
      }

      await getSupabase()
        .from("rtb_guests")
        .update({ has_voted: true, voted_at: new Date().toISOString() })
        .eq("id", guest.id);

      onVoted();
    } catch {
      setError("Erreur de connexion. Reessaie.");
      setSubmitting(false);
      setConfirming(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh gap-4 relative">
        <div className="bg-ambient" />
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted font-medium">Chargement des finalistes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col relative">
      {/* Ambient blobs */}
      <div className="bg-ambient" />

      {/* Header */}
      <div className="sticky top-0 z-20 glass-strong border-b border-white/30 px-5 pt-5 pb-3">
        <p className="text-[11px] font-bold text-primary uppercase tracking-[0.15em] text-center">
          Soiree des pitchs
        </p>
        <h1 className="text-xl font-extrabold text-heading text-center mt-1">
          Choisis ton coup de coeur
        </h1>
        <p className="text-xs text-muted text-center mt-1">
          {guest.first_name}, selectionne le projet qui t&apos;a le plus inspire
        </p>
      </div>

      {/* Finalist list */}
      <div className="flex-1 px-5 pt-4 pb-28 space-y-3 relative z-10">
        {finalists.map((f, i) => (
          <div key={f.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 70}ms` }}>
            <FinalistCard
              finalist={f}
              selected={selectedId === f.id}
              onSelect={() => setSelectedId(f.id)}
            />
          </div>
        ))}
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 p-5 pb-6">
        <div className="absolute inset-0 bg-gradient-to-t from-bg-start via-bg-start/95 to-transparent" />
        <div className="relative z-10">
          {error && (
            <div className="rounded-xl bg-error/8 border border-error/15 px-4 py-2.5 mb-3 animate-fade-in-scale">
              <p className="text-sm text-error text-center font-semibold">{error}</p>
            </div>
          )}
          <button
            onClick={() => setConfirming(true)}
            disabled={!selectedId}
            className="btn-glow pressable w-full h-14 rounded-2xl bg-gradient-to-r from-primary via-primary to-primary-light text-white text-base font-bold shadow-xl shadow-primary/30 disabled:opacity-20 disabled:shadow-none transition-all duration-200 relative z-10"
          >
            {selectedId ? "Voter" : "Selectionne un projet"}
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirming && selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-5 animate-fade-in-scale" style={{ animationDuration: "200ms" }}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-heading/40 backdrop-blur-md" onClick={() => !submitting && setConfirming(false)} />

          {/* Modal */}
          <div className="relative w-full max-w-sm glass-strong rounded-3xl p-7 shadow-2xl shadow-primary/10 space-y-5 mb-2 sm:mb-0">
            {/* Decorative top bar */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-border mt-3 sm:hidden" />

            <div className="pt-2">
              <p className="text-center text-lg font-extrabold text-heading">
                Confirmer ton vote ?
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-primary/8 to-primary/5 border border-primary/10 p-5 text-center">
              <div className="w-14 h-14 rounded-xl overflow-hidden mx-auto mb-3 ring-2 ring-primary/20 ring-offset-2 ring-offset-white/50">
                <img src={selected.photo_url} alt="" className="w-full h-full object-cover" />
              </div>
              <p className="text-lg font-extrabold text-primary">{selected.project_name}</p>
              <p className="text-sm text-muted mt-0.5 font-medium">
                {selected.first_name} {selected.last_name}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                disabled={submitting}
                className="pressable flex-1 h-13 rounded-2xl glass border border-border/40 text-sm font-semibold text-muted transition-all hover:bg-white/80 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="btn-glow pressable flex-1 h-13 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold shadow-lg shadow-primary/25 disabled:opacity-50 relative z-10"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </span>
                ) : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
