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
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex justify-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-2xl bg-surface shadow-lg shadow-primary/10 flex items-center justify-center">
            <Image src="/logos/venturelab.svg" alt="VentureLab" width={56} height={56} priority unoptimized />
          </div>
        </div>

        {/* Title */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          <h1 className="text-2xl font-extrabold tracking-tight">Road to Business 2026</h1>
          <p className="text-sm text-muted mt-1.5">Elis ton coup de coeur</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl bg-surface p-6 shadow-xl shadow-primary/5 border border-border space-y-4 animate-fade-in-up" style={{ animationDelay: "160ms" }}>
          <label className="text-xs font-semibold text-muted uppercase tracking-widest block text-center">
            Identifie-toi
          </label>

          <input
            type="text"
            placeholder="Prenom"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            className="w-full h-12 px-4 rounded-xl border border-border bg-[#FAFAFE] text-heading text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-[border-color,box-shadow] duration-200"
          />

          <input
            type="text"
            placeholder="Nom"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            className="w-full h-12 px-4 rounded-xl border border-border bg-[#FAFAFE] text-heading text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-[border-color,box-shadow] duration-200"
          />

          {error && (
            <p className="text-sm text-error text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !firstName.trim() || !lastName.trim()}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold shadow-lg shadow-primary/25 disabled:opacity-30 disabled:shadow-none transition-opacity duration-200"
          >
            {loading ? "Verification..." : "Continuer"}
          </button>
        </form>

        <p className="text-[11px] text-muted/50 text-center">
          VentureLab · Jeudi 17 avril 2026
        </p>
      </div>
    </div>
  );
}
