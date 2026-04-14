"use client";

import { useState } from "react";
import Image from "next/image";
import { getSupabase } from "@/lib/supabase";
import type { Guest } from "@/lib/types";

interface Props {
  onIdentified: (guest: Guest) => void;
}

export function IdentifyScreen({ onIdentified }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!fn || !ln) { setError("Remplis les deux champs."); return; }

    setLoading(true);
    setError(null);

    try {
      const { data, error: dbErr } = await getSupabase()
        .from("rtb_guests")
        .select("*")
        .ilike("first_name", fn)
        .ilike("last_name", ln)
        .single();

      if (dbErr || !data) {
        setError("Nom non trouve dans la liste des invites.");
        setLoading(false);
        return;
      }

      if (data.has_voted) {
        setError("Tu as deja vote !");
        setLoading(false);
        return;
      }

      onIdentified(data as Guest);
    } catch {
      setError("Erreur de connexion. Reessaie.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative">
      {/* Ambient blobs */}
      <div className="bg-ambient" />

      <div className="w-full max-w-sm space-y-8 relative z-10">
        {/* Logo with glow */}
        <div className="flex justify-center animate-fade-in-up">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl scale-125" />
            <div className="relative w-22 h-22 rounded-3xl bg-white shadow-xl shadow-primary/15 flex items-center justify-center ring-1 ring-white/50">
              <Image src="/logos/venturelab.svg" alt="VentureLab" width={56} height={56} priority unoptimized />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Soiree des pitchs</p>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-heading via-heading to-primary bg-clip-text text-transparent">
            Road to Business
          </h1>
          <p className="text-sm text-muted mt-2 font-medium">Elis ton coup de coeur parmi les finalistes</p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="glass-strong rounded-3xl p-7 shadow-2xl shadow-primary/8 space-y-5 animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <label className="text-[11px] font-bold text-muted uppercase tracking-[0.15em] block text-center">
            Identifie-toi
          </label>

          <div className="space-y-3">
            <div className="relative group">
              <input
                type="text"
                placeholder="Prenom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                className="w-full h-13 px-5 rounded-2xl border border-border/60 bg-white/60 text-heading text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 focus:bg-white transition-all duration-200"
              />
            </div>

            <div className="relative group">
              <input
                type="text"
                placeholder="Nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                className="w-full h-13 px-5 rounded-2xl border border-border/60 bg-white/60 text-heading text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-error/8 border border-error/15 px-4 py-3 animate-fade-in-scale">
              <p className="text-sm text-error text-center font-semibold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !firstName.trim() || !lastName.trim()}
            className="btn-glow pressable w-full h-13 rounded-2xl bg-gradient-to-r from-primary via-primary to-primary-light text-white text-sm font-bold shadow-xl shadow-primary/30 disabled:opacity-25 disabled:shadow-none transition-all duration-200 relative z-10"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verification...
              </span>
            ) : "Continuer"}
          </button>
        </form>

        <p className="text-[11px] text-muted/40 text-center font-medium animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          VentureLab · Jeudi 17 avril 2026
        </p>
      </div>
    </div>
  );
}
