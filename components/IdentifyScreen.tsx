"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { getSupabase } from "@/lib/supabase";
import type { Guest } from "@/lib/types";

interface Props {
  onIdentified: (guest: Guest) => void;
}

interface CanvasStar {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  driftAx: number;
  driftAy: number;
  driftBx: number;
  driftBy: number;
  driftSpeed: number;
  r: number;
  g: number;
  b: number;
  spikeLength: number;
}

const STAR_PALETTES: [number, number, number][] = [
  [255, 255, 255],   // white (rare)
  [255, 230, 240],   // warm white-rose
  [244, 114, 182],   // pink-400 (VentureLab rose)
  [251, 113, 133],   // rose-400
  [253, 164, 175],   // rose-300 (soft)
  [236, 72, 153],    // pink-500 (deep VentureLab)
  [219, 39, 119],    // pink-600 (rich)
];

function createStars(count: number): CanvasStar[] {
  return Array.from({ length: count }, () => {
    const palette = STAR_PALETTES[Math.floor(Math.random() * STAR_PALETTES.length)];
    const size = Math.random() * 3 + 0.8;

    // Concentrate stars on edges (top 25% and bottom 25%) to leave
    // the center clear for the form on mobile. ~30% still scatter everywhere
    // for depth, but smaller so they don't compete with UI.
    let y = Math.random();
    let adjustedSize = size;
    const zone = Math.random();
    if (zone < 0.35) {
      y = Math.random() * 0.25;          // top band
    } else if (zone < 0.7) {
      y = 0.75 + Math.random() * 0.25;   // bottom band
    } else {
      adjustedSize = size * 0.6;          // center — smaller stars
    }

    return {
      x: Math.random(),
      y,
      size: adjustedSize,
      baseOpacity: Math.random() * 0.4 + 0.4,
      twinkleSpeed: Math.random() * 1.5 + 0.8,
      twinkleOffset: Math.random() * Math.PI * 2,
      driftAx: (Math.random() - 0.5) * 0.015,
      driftAy: (Math.random() - 0.5) * 0.015,
      driftBx: (Math.random() - 0.5) * 0.008,
      driftBy: (Math.random() - 0.5) * 0.008,
      driftSpeed: Math.random() * 0.3 + 0.15,
      r: palette[0],
      g: palette[1],
      b: palette[2],
      spikeLength: size > 2 ? size * 5 + Math.random() * 8 : size * 3,
    };
  });
}

function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<CanvasStar[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    if (starsRef.current.length === 0) {
      // Fewer stars on small screens (mobile portrait ~35, tablet ~45, desktop ~60)
      const screenArea = window.innerWidth * window.innerHeight;
      const count = Math.round(Math.min(60, Math.max(30, screenArea / 15000)));
      starsRef.current = createStars(count);
    }
    const stars = starsRef.current;

    function drawStar(
      cx: number, cy: number, star: CanvasStar, brightness: number
    ) {
      const { r, g, b, size, spikeLength } = star;
      const alpha = brightness;

      // Radial glow
      const glowRadius = size * 6;
      const glow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
      glow.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.5})`);
      glow.addColorStop(0.3, `rgba(${r},${g},${b},${alpha * 0.15})`);
      glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx!.fillStyle = glow;
      ctx!.beginPath();
      ctx!.arc(cx, cy, glowRadius, 0, Math.PI * 2);
      ctx!.fill();

      // Core — bright white center fading to color
      const coreRadius = size * 1.2;
      const core = ctx!.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
      core.addColorStop(0, `rgba(255,255,255,${alpha})`);
      core.addColorStop(0.4, `rgba(${r},${g},${b},${alpha * 0.8})`);
      core.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx!.fillStyle = core;
      ctx!.beginPath();
      ctx!.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx!.fill();

      // Diffraction spikes (4 branches)
      if (size > 1.2) {
        const spikeAlpha = alpha * 0.45;
        ctx!.strokeStyle = `rgba(${r},${g},${b},${spikeAlpha})`;
        ctx!.lineWidth = Math.max(0.5, size * 0.3);
        ctx!.lineCap = "round";

        const len = spikeLength * brightness;
        // Vertical
        ctx!.beginPath();
        ctx!.moveTo(cx, cy - len);
        ctx!.lineTo(cx, cy + len);
        ctx!.stroke();
        // Horizontal
        ctx!.beginPath();
        ctx!.moveTo(cx - len, cy);
        ctx!.lineTo(cx + len, cy);
        ctx!.stroke();

        // Thinner diagonal spikes for bigger stars
        if (size > 2.2) {
          ctx!.lineWidth = Math.max(0.3, size * 0.15);
          ctx!.globalAlpha = spikeAlpha * 0.5;
          const dLen = len * 0.6;
          ctx!.beginPath();
          ctx!.moveTo(cx - dLen, cy - dLen);
          ctx!.lineTo(cx + dLen, cy + dLen);
          ctx!.stroke();
          ctx!.beginPath();
          ctx!.moveTo(cx + dLen, cy - dLen);
          ctx!.lineTo(cx - dLen, cy + dLen);
          ctx!.stroke();
          ctx!.globalAlpha = 1;
        }
      }
    }

    function animate(time: number) {
      const t = time / 1000;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx!.clearRect(0, 0, w, h);

      for (const star of stars) {
        // Twinkle
        const twinkle = Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
        const brightness = star.baseOpacity + twinkle * 0.35;

        // Drift
        const dx = Math.sin(t * star.driftSpeed) * star.driftAx + Math.cos(t * star.driftSpeed * 0.7) * star.driftBx;
        const dy = Math.cos(t * star.driftSpeed) * star.driftAy + Math.sin(t * star.driftSpeed * 0.7) * star.driftBy;

        const cx = (star.x + dx) * w;
        const cy = (star.y + dy) * h;

        drawStar(cx, cy, star, Math.max(0.05, brightness));
      }

      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full"
      style={{ width: "100%", height: "100%" }}
    />
  );
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
        setError("Nom non trouvé dans la liste des invités.");
        setLoading(false);
        return;
      }

      const isAdmin =
        fn.toLowerCase() === "corentin" && ln.toLowerCase() === "christmann";
      if (data.has_voted && !isAdmin) {
        setError("Tu as déjà voté !");
        setLoading(false);
        return;
      }

      onIdentified(data as Guest);
    } catch {
      setError("Erreur de connexion. Réessaie.");
    }
    setLoading(false);
  }

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center px-6 overflow-hidden bg-[#0a0618]">
      {/* Nebula blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-[700px] h-[700px] rounded-full bg-rose-500/[0.12] blur-[140px] animate-nebula-1" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-violet-600/[0.1] blur-[120px] animate-nebula-2" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-rose-400/[0.08] blur-[100px] animate-nebula-3" />
        <div className="absolute bottom-1/3 left-1/4 w-[350px] h-[350px] rounded-full bg-fuchsia-500/[0.06] blur-[90px] animate-nebula-2" />
      </div>

      {/* Starfield canvas */}
      <Starfield />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[380px] space-y-10">
        {/* Logo */}
        <div className="flex justify-center animate-in">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/[0.08] shadow-[0_0_30px_rgba(244,114,182,0.12)] flex items-center justify-center">
            <Image src="/logos/venturelab.svg" alt="VentureLab" width={40} height={40} priority unoptimized />
          </div>
        </div>

        {/* Title */}
        <div className="text-center animate-in" style={{ animationDelay: "60ms" }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-300/90">
            Nuit des étoiles entrepreneuriales
          </p>
          <h1 className="text-[28px] font-extrabold text-white tracking-tight mt-2.5 leading-tight">
            Road to Business 2026
          </h1>
          <p className="text-[15px] text-white/50 mt-2">Élis ton coup de cœur</p>
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
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              className="w-full h-[52px] px-4 rounded-[14px] bg-white/[0.06] backdrop-blur-sm border border-white/[0.1] text-white text-[15px] font-medium placeholder:text-white/30 shadow-[0_2px_8px_rgba(0,0,0,0.2)] focus:outline-none focus:border-rose-400/40 focus:shadow-[0_0_0_3px_rgba(244,114,182,0.12)] transition-all duration-150"
            />
            <input
              type="text"
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              className="w-full h-[52px] px-4 rounded-[14px] bg-white/[0.06] backdrop-blur-sm border border-white/[0.1] text-white text-[15px] font-medium placeholder:text-white/30 shadow-[0_2px_8px_rgba(0,0,0,0.2)] focus:outline-none focus:border-rose-400/40 focus:shadow-[0_0_0_3px_rgba(244,114,182,0.12)] transition-all duration-150"
            />
          </div>

          {error && (
            <div className="rounded-[12px] bg-red-500/10 border border-red-400/20 px-4 py-3 animate-scale-in">
              <p className="text-[13px] text-red-300 text-center font-semibold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !firstName.trim() || !lastName.trim()}
            className="w-full h-[52px] rounded-[14px] bg-gradient-to-r from-rose-500 to-violet-600 text-white text-[15px] font-bold shadow-[0_4px_20px_rgba(244,114,182,0.3)] disabled:opacity-20 disabled:shadow-none active:scale-[0.98] transition-all duration-150"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Vérification...
              </span>
            ) : "Continuer"}
          </button>
        </form>

        <p className="text-[11px] text-white/25 text-center animate-in" style={{ animationDelay: "200ms" }}>
          VentureLab · Jeudi 17 avril 2026
        </p>
      </div>
    </div>
  );
}
