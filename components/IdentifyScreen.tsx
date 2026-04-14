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
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-[380px] space-y-10">
        {/* Logo */}
        <div className="flex justify-center animate-in">
          <div className="w-16 h-16 rounded-2xl bg-surface shadow-[0_2px_16px_rgba(122,74,237,0.12)] flex items-center justify-center">
            <Image src="/logos/venturelab.svg" alt="VentureLab" width={40} height={40} priority unoptimized />
          </div>
        </div>

        {/* Title */}
        <div className="text-center animate-in" style={{ animationDelay: "60ms" }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Soiree des pitchs</p>
          <h1 className="text-[28px] font-extrabold text-heading tracking-tight mt-2 leading-tight">
            Road to Business 2026
          </h1>
          <p className="text-[15px] text-muted mt-2">Elis ton coup de coeur</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 animate-in"
          style={{ animationDelay: "120ms" }}
        >
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Prenom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              className="w-full h-[52px] px-4 rounded-[14px] bg-surface border border-border text-heading text-[15px] font-medium placeholder:text-subtle shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(122,74,237,0.1)] transition-all duration-150"
            />
            <input
              type="text"
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              className="w-full h-[52px] px-4 rounded-[14px] bg-surface border border-border text-heading text-[15px] font-medium placeholder:text-subtle shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(122,74,237,0.1)] transition-all duration-150"
            />
          </div>

          {error && (
            <div className="rounded-[12px] bg-error/6 px-4 py-3 animate-scale-in">
              <p className="text-[13px] text-error text-center font-semibold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !firstName.trim() || !lastName.trim()}
            className="w-full h-[52px] rounded-[14px] bg-primary text-white text-[15px] font-bold shadow-[0_4px_14px_rgba(122,74,237,0.35)] disabled:opacity-30 disabled:shadow-none active:scale-[0.98] transition-all duration-150"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verification...
              </span>
            ) : "Continuer"}
          </button>
        </form>

        <p className="text-[11px] text-subtle text-center animate-in" style={{ animationDelay: "200ms" }}>
          VentureLab · Jeudi 17 avril 2026
        </p>
      </div>
    </div>
  );
}
