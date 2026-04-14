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
      <div className="flex items-center justify-center h-dvh">
        <p className="text-sm text-muted animate-pulse">Chargement des finalistes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-bg-start to-bg-start/80 backdrop-blur-sm px-5 pt-5 pb-3">
        <p className="text-xs font-semibold text-muted uppercase tracking-widest text-center">
          Ton coup de coeur
        </p>
        <h1 className="text-lg font-extrabold text-heading text-center mt-1">
          Choisis un projet
        </h1>
      </div>

      {/* Finalist list */}
      <div className="flex-1 px-5 pb-28 space-y-3">
        {finalists.map((f, i) => (
          <div key={f.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <FinalistCard
              finalist={f}
              selected={selectedId === f.id}
              onSelect={() => setSelectedId(f.id)}
            />
          </div>
        ))}
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white to-white/0">
        {error && (
          <p className="text-sm text-error text-center font-medium mb-3">{error}</p>
        )}
        <button
          onClick={() => setConfirming(true)}
          disabled={!selectedId}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white text-base font-bold shadow-lg shadow-primary/25 disabled:opacity-30 disabled:shadow-none transition-opacity duration-200"
        >
          Voter
        </button>
      </div>

      {/* Confirmation modal */}
      {confirming && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl space-y-4 animate-fade-in-up">
            <p className="text-center text-lg font-bold text-heading">
              Confirmer ton vote ?
            </p>
            <div className="rounded-xl bg-bg-start p-4 text-center">
              <p className="text-base font-bold text-primary">{selected.project_name}</p>
              <p className="text-sm text-muted mt-0.5">
                {selected.first_name} {selected.last_name}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                disabled={submitting}
                className="flex-1 h-12 rounded-xl border-2 border-border text-sm font-semibold text-muted transition-colors hover:bg-bg-start disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold shadow-lg shadow-primary/25 disabled:opacity-50"
              >
                {submitting ? "..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
