"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { getSupabase } from "@/lib/supabase";
import type { Guest, Finalist } from "@/lib/types";

const ADMIN_FIRST = "corentin";
const ADMIN_LAST = "christmann";

interface VoteRow {
  id: number;
  guest_id: number;
  finalist_id: number;
  created_at: string;
}

interface RankedFinalist extends Finalist {
  votes: number;
  rank: number;
  voters: { name: string; time: string }[];
}

type Tab = "ranking" | "voters" | "vote";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [finalists, setFinalists] = useState<Finalist[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [votes, setVotes] = useState<VoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("ranking");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Admin login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const fn = firstName.trim().toLowerCase();
    const ln = lastName.trim().toLowerCase();
    if (fn !== ADMIN_FIRST || ln !== ADMIN_LAST) {
      setLoginError("Accès réservé à l'administrateur.");
      return;
    }
    setLoginLoading(true);
    setLoginError(null);

    const { data } = await getSupabase()
      .from("rtb_guests")
      .select("*")
      .ilike("first_name", fn)
      .ilike("last_name", ln)
      .single();

    if (!data) {
      setLoginError("Compte non trouvé dans la base.");
      setLoginLoading(false);
      return;
    }
    setAuthed(true);
    setLoginLoading(false);
  }

  // Fetch all data
  const fetchAll = useCallback(async () => {
    const supabase = getSupabase();
    const [fRes, gRes, vRes] = await Promise.all([
      supabase.from("rtb_finalists").select("*").order("display_order"),
      supabase.from("rtb_guests").select("*").order("last_name"),
      supabase.from("rtb_votes").select("*").order("created_at", { ascending: false }),
    ]);
    if (fRes.data) setFinalists(fRes.data as Finalist[]);
    if (gRes.data) setGuests(gRes.data as Guest[]);
    if (vRes.data) setVotes(vRes.data as VoteRow[]);
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  // Debounced refetch — coalesce rapid realtime events into a single fetch
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedFetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchAll(), 800);
  }, [fetchAll]);

  // Initial load + real-time subscription
  useEffect(() => {
    if (!authed) return;
    fetchAll();

    const supabase = getSupabase();
    const channel = supabase
      .channel("admin-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "rtb_votes" }, () => debouncedFetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "rtb_guests" }, () => debouncedFetch())
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [authed, fetchAll, debouncedFetch]);

  // Build ranked finalists
  const ranked: RankedFinalist[] = finalists
    .map((f) => {
      const fVotes = votes.filter((v) => v.finalist_id === f.id);
      const voters = fVotes.map((v) => {
        const g = guests.find((g) => g.id === v.guest_id);
        return {
          name: g ? `${g.first_name} ${g.last_name}` : `Invité #${v.guest_id}`,
          time: new Date(v.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        };
      });
      return { ...f, votes: fVotes.length, rank: 0, voters };
    })
    .sort((a, b) => b.votes - a.votes)
    .map((f, i) => ({ ...f, rank: i + 1 }));

  const totalGuests = guests.length;
  const totalVotes = votes.length;
  const participation = totalGuests > 0 ? Math.round((totalVotes / totalGuests) * 100) : 0;
  const votedGuests = guests.filter((g) => g.has_voted).sort((a, b) => {
    const ta = a.voted_at ? new Date(a.voted_at).getTime() : 0;
    const tb = b.voted_at ? new Date(b.voted_at).getTime() : 0;
    return tb - ta;
  });

  // ── Login screen ──
  if (!authed) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-bg">
        <div className="w-full max-w-[380px] space-y-8">
          <div className="text-center animate-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-heading/5 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-[24px] font-extrabold text-heading tracking-tight">Admin</h1>
            <p className="text-[14px] text-muted mt-1">Accès réservé</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3 animate-in" style={{ animationDelay: "80ms" }}>
            <input
              type="text"
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full h-[52px] px-4 rounded-[14px] bg-surface border border-border text-heading text-[15px] font-medium placeholder:text-subtle shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(122,74,237,0.1)] transition-all duration-150"
            />
            <input
              type="text"
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full h-[52px] px-4 rounded-[14px] bg-surface border border-border text-heading text-[15px] font-medium placeholder:text-subtle shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(122,74,237,0.1)] transition-all duration-150"
            />
            {loginError && (
              <div className="rounded-[12px] bg-error/6 px-4 py-2.5 animate-scale-in">
                <p className="text-[13px] text-error text-center font-semibold">{loginError}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loginLoading || !firstName.trim() || !lastName.trim()}
              className="w-full h-[52px] rounded-[14px] bg-primary text-white text-[15px] font-bold shadow-[0_4px_14px_rgba(122,74,237,0.35)] disabled:opacity-30 disabled:shadow-none active:scale-[0.98] transition-all duration-150"
            >
              {loginLoading ? "Vérification..." : "Accéder"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh gap-3 bg-bg">
        <div className="w-8 h-8 border-[2.5px] border-primary/15 border-t-primary rounded-full animate-spin" />
        <p className="text-[13px] text-muted font-medium">Chargement...</p>
      </div>
    );
  }

  // ── Dashboard ──
  return (
    <div className="min-h-dvh bg-bg pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-bg/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-5 pt-[max(env(safe-area-inset-top),12px)] pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[18px] font-extrabold text-heading tracking-tight">Admin RTB</h1>
              <p className="text-[11px] text-muted font-medium mt-0.5">
                Mise à jour : {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </p>
            </div>
            <a
              href="/"
              className="h-9 px-4 rounded-[10px] bg-primary/8 text-primary text-[13px] font-bold flex items-center gap-1.5 active:scale-[0.97] transition-transform"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Voter
            </a>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="px-5 pt-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[14px] bg-surface p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Votes</p>
            <p className="text-[28px] font-extrabold text-heading mt-1 leading-none">{totalVotes}</p>
          </div>
          <div className="rounded-[14px] bg-surface p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Invités</p>
            <p className="text-[28px] font-extrabold text-heading mt-1 leading-none">{totalGuests}</p>
          </div>
          <div className="rounded-[14px] bg-surface p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Taux</p>
            <p className="text-[28px] font-extrabold text-primary mt-1 leading-none">{participation}%</p>
          </div>
        </div>

        {/* Participation bar */}
        <div className="mt-3 rounded-[10px] bg-surface p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[12px] font-semibold text-muted">Participation</p>
            <p className="text-[12px] font-bold text-heading">{totalVotes}/{totalGuests}</p>
          </div>
          <div className="h-2.5 rounded-full bg-border/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-700 ease-out"
              style={{ width: `${participation}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mt-5">
        <div className="flex gap-1 p-1 rounded-[12px] bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          {([
            { key: "ranking" as Tab, label: "Classement" },
            { key: "voters" as Tab, label: "Votants" },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 h-[38px] rounded-[9px] text-[13px] font-bold transition-all duration-150 ${
                tab === key
                  ? "bg-primary text-white shadow-[0_2px_8px_rgba(122,74,237,0.3)]"
                  : "text-muted active:bg-bg"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-5 mt-4">
        {tab === "ranking" && (
          <div className="space-y-2.5">
            {ranked.map((f) => (
              <div
                key={f.id}
                className={`rounded-[14px] bg-surface overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${
                  f.rank === 1 && f.votes > 0 ? "ring-2 ring-primary/30" : ""
                }`}
              >
                <div className="flex items-center gap-3.5 px-4 py-3.5">
                  {/* Rank badge */}
                  <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-[15px] font-extrabold ${
                    f.rank === 1 && f.votes > 0
                      ? "bg-primary text-white"
                      : f.rank === 2 && f.votes > 0
                        ? "bg-primary/12 text-primary"
                        : f.rank === 3 && f.votes > 0
                          ? "bg-primary/6 text-primary/70"
                          : "bg-heading/5 text-muted"
                  }`}>
                    {f.rank}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-bg">
                    <Image
                      src={f.photo_url}
                      alt={`${f.first_name} ${f.last_name}`}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-heading leading-tight truncate">
                      {f.project_name}
                    </p>
                    <p className="text-[12px] text-muted leading-tight mt-0.5 truncate">
                      {f.first_name} {f.last_name}
                    </p>
                  </div>

                  {/* Vote count */}
                  <div className="text-right shrink-0">
                    <p className="text-[20px] font-extrabold text-heading leading-none">{f.votes}</p>
                    <p className="text-[10px] font-semibold text-muted mt-0.5">
                      {f.votes === 1 ? "vote" : "votes"}
                    </p>
                  </div>
                </div>

                {/* Vote bar */}
                {totalVotes > 0 && (
                  <div className="px-4 pb-3">
                    <div className="h-1.5 rounded-full bg-border/40 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/60 transition-all duration-500"
                        style={{ width: `${(f.votes / totalVotes) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Voter names */}
                {f.voters.length > 0 && (
                  <div className="px-4 pb-3 pt-0.5 border-t border-border/40">
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {f.voters.map((v, i) => (
                        <span key={i} className="text-[11px] text-muted bg-bg rounded-full px-2.5 py-1 font-medium">
                          {v.name} · {v.time}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "voters" && (
          <div className="space-y-1">
            {/* Voted */}
            <p className="text-[12px] font-bold text-success uppercase tracking-wider mb-2 px-1">
              A voté ({votedGuests.length})
            </p>
            {votedGuests.map((g) => {
              const vote = votes.find((v) => v.guest_id === g.id);
              const finalist = vote ? finalists.find((f) => f.id === vote.finalist_id) : null;
              return (
                <div key={g.id} className="flex items-center gap-3 px-4 py-2.5 rounded-[10px] bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="w-2 h-2 rounded-full bg-success shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-heading truncate">
                      {g.first_name} {g.last_name}
                    </p>
                    {finalist && (
                      <p className="text-[11px] text-primary font-medium truncate mt-0.5">
                        → {finalist.project_name}
                      </p>
                    )}
                  </div>
                  <p className="text-[11px] text-muted font-medium shrink-0">
                    {g.voted_at
                      ? new Date(g.voted_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </p>
                </div>
              );
            })}

            {/* Not voted */}
            {guests.filter((g) => !g.has_voted).length > 0 && (
              <>
                <p className="text-[12px] font-bold text-muted uppercase tracking-wider mt-5 mb-2 px-1">
                  Pas encore voté ({guests.filter((g) => !g.has_voted).length})
                </p>
                {guests.filter((g) => !g.has_voted).map((g) => (
                  <div key={g.id} className="flex items-center gap-3 px-4 py-2.5 rounded-[10px] bg-surface/60">
                    <div className="w-2 h-2 rounded-full bg-border shrink-0" />
                    <p className="text-[13px] font-medium text-muted truncate">
                      {g.first_name} {g.last_name}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-8 pb-4">
        <p className="text-[11px] text-subtle">Admin · Road to Business 2026</p>
      </div>
    </div>
  );
}
