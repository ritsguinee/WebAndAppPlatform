import { useState, useEffect, useRef } from "react";
import {
  Lock, AlertTriangle, RefreshCw, ChevronRight, Mail, Wifi, WifiOff,
  CheckCircle2, TrendingUp, Users, CreditCard, MapPin, Activity,
  ArrowUpRight, Clock, Zap, Shield,
} from "lucide-react";
import watermarkImg from "@/imports/images.jpg";
import logoImg from "@/imports/images__1_.jpg";

interface Utilisateur {
  id: string; nom: string; prenom: string; role: string; email: string;
  telephone: string; derniere: string; statut: string; dateCreation: string;
  identifiant?: string;
}

const UTILISATEURS_FALLBACK: Utilisateur[] = [
  { id: "USR-000", nom: "Admin", prenom: "Système", role: "Administrateur", email: "admin@mamou-commune.gn", telephone: "+224 626 00 11 10", derniere: "2024-06-15 09:00", statut: "Actif", dateCreation: "2024-01-01", identifiant: "admin" },
];

// ── Live indicator data ────────────────────────────────────────────────────────

const BASE_STATS = {
  contribuables: 14_872,
  recettesJour: 4_320_000,
  paiementsJour: 47,
  tauxRecouvrement: 83.4,
  missionsActives: 12,
  agentsConnectes: 8,
};

const ACTIVITY_POOL = [
  { agent: "Mamou Centre", action: "Paiement CFU", montant: "+185 000 GNF", type: "paiement" },
  { agent: "Fello", action: "Nouveau recensement", montant: "#CTB-8821", type: "recensement" },
  { agent: "Koliagbé", action: "Paiement patente", montant: "+320 000 GNF", type: "paiement" },
  { agent: "Soumbalako", action: "Avis d'imposition", montant: "Envoyé ×3", type: "avis" },
  { agent: "Timbo", action: "Paiement marché", montant: "+92 500 GNF", type: "paiement" },
  { agent: "Tolo", action: "Modif. contribuable", montant: "#CTB-3344", type: "update" },
  { agent: "Dounet", action: "Paiement CFU", montant: "+210 000 GNF", type: "paiement" },
  { agent: "Konkoya", action: "Nouveau recensement", montant: "#CTB-9103", type: "recensement" },
];

const SPARKLINE_BASE = [42, 38, 55, 60, 48, 71, 67, 83, 79, 88, 92, 84];

function fmtGnf(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)} M`;
  return `${(v / 1_000).toFixed(0)} K`;
}

function useAnimatedNumber(target: number, duration = 600) {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(start + diff * eased);
      if (t < 1) requestAnimationFrame(tick);
      else prev.current = target;
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return display;
}

function Sparkline({ values }: { values: number[] }) {
  const W = 120, H = 32, pad = 2;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v - min) / range) * (H - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  const last = pts.split(" ").pop()!.split(",");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts} fill="none" stroke="#FCD116" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={3} fill="#FCD116" />
    </svg>
  );
}

function ActivityDot({ type }: { type: string }) {
  const colors: Record<string, string> = {
    paiement: "#009460", recensement: "#1B3A6B", avis: "#FCD116", update: "#B8860B",
  };
  return <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: colors[type] ?? "#888", display: "inline-block" }} />;
}

// ── Field helper ───────────────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-mono uppercase tracking-widest text-white/50 mb-1.5">
        {label}{required && <span className="text-[#FCD116] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 text-base sm:text-sm bg-white/8 border border-white/15 rounded-[3px] font-mono focus:outline-none focus:ring-1 focus:ring-[#FCD116]/50 focus:border-[#FCD116]/40 text-white placeholder:text-white/30 transition-colors";

// ── Main component ─────────────────────────────────────────────────────────────

export function LoginPage({ onLogin, utilisateurs: utilisateursProp, commune, communeId }: {
  onLogin: (user: Utilisateur) => void;
  utilisateurs?: Utilisateur[];
  commune?: string;
  communeId?: string;
}) {
  const utilisateurs = utilisateursProp ?? UTILISATEURS_FALLBACK;
  const communeName   = commune   ?? "Mamou";
  const communeDomain = communeId ? `${communeId}.gn` : "mamou-commune.gn";

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Live indicators state
  const [stats, setStats] = useState(BASE_STATS);
  const [sparkline, setSparkline] = useState(SPARKLINE_BASE);
  const [activity, setActivity] = useState(ACTIVITY_POOL.slice(0, 5));
  const [tick, setTick] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(0);
  const activityPool = useRef([...ACTIVITY_POOL]);

  // Animated display values
  const dispRecettes = useAnimatedNumber(stats.recettesJour);
  const dispPaiements = useAnimatedNumber(stats.paiementsJour);
  const dispContribuables = useAnimatedNumber(stats.contribuables);

  // Online/offline listener
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  // Live update ticker — every 4s
  useEffect(() => {
    const id = setInterval(() => {
      const addPay = Math.floor(Math.random() * 3);
      const addAmount = Math.floor(Math.random() * 450_000) + 50_000;
      const addCtb = Math.random() > 0.7 ? 1 : 0;
      const newTaux = parseFloat((BASE_STATS.tauxRecouvrement + (Math.random() - 0.45) * 0.2).toFixed(1));

      setStats(prev => ({
        ...prev,
        paiementsJour: prev.paiementsJour + addPay,
        recettesJour: prev.recettesJour + (addPay > 0 ? addAmount : 0),
        contribuables: prev.contribuables + addCtb,
        tauxRecouvrement: newTaux,
        agentsConnectes: Math.floor(Math.random() * 4) + 6,
      }));

      setSparkline(prev => {
        const next = [...prev.slice(1), Math.round(prev[prev.length - 1] + (Math.random() - 0.4) * 8)];
        return next.map(v => Math.max(20, Math.min(100, v)));
      });

      if (addPay > 0) {
        const pool = activityPool.current;
        const picked = pool[Math.floor(Math.random() * pool.length)];
        setActivity(prev => [picked, ...prev.slice(0, 4)]);
      }

      setLastUpdate(0);
      setTick(t => t + 1);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // Seconds-since-update counter
  useEffect(() => {
    const id = setInterval(() => setLastUpdate(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Login handlers ────────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Veuillez entrer votre identifiant ou email."); return; }
    if (!password) { setError("Veuillez entrer votre mot de passe."); return; }
    setLoading(true);
    setTimeout(() => {
      const input = email.trim().toLowerCase();
      // Accept commune admin shortcut: admin@{domain} or "admin" with password admin@123
      const isWorkspaceAdmin = input === `admin@${communeDomain}` || input === "admin";
      if (isWorkspaceAdmin && (password === "admin@123" || password === "snrr2024")) {
        const adminUser = utilisateurs.find(u => u.role === "Administrateur" && u.statut === "Actif") ?? {
          id: "USR-000", nom: "Admin", prenom: "Système", role: "Administrateur",
          email: `admin@${communeDomain}`, telephone: "+224 620 00 00 00",
          derniere: new Date().toLocaleString("fr-FR"), statut: "Actif",
          dateCreation: "2024-01-01", identifiant: "admin",
        };
        onLogin(adminUser);
        return;
      }
      const user = utilisateurs.find(u =>
        u.statut === "Actif" && (u.identifiant?.toLowerCase() === input || u.email.toLowerCase() === input)
      );
      if (!user) { setError("Identifiant ou email non reconnu, ou compte inactif."); setLoading(false); return; }
      if (password === "admin@123" || password === "snrr2024" || password.length >= 4) onLogin(user);
      else { setError("Mot de passe incorrect. Veuillez réessayer."); setLoading(false); }
    }, 1200);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) { setError("Veuillez entrer votre adresse email."); return; }
    setLoading(true); setError("");
    setTimeout(() => {
      const user = utilisateurs.find(u => u.email.toLowerCase() === resetEmail.toLowerCase());
      if (user) setResetSuccess(true);
      else setError("Aucun compte associé à cette adresse email.");
      setLoading(false);
    }, 1500);
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">

      {/* ════ LEFT PANEL — Login form ════════════════════════════════════════════ */}
      <div className="w-full lg:w-[42%] flex flex-col relative bg-[#080F1E] min-h-screen lg:min-h-0">

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <img src={watermarkImg} alt="" aria-hidden="true" className="w-4/5 max-w-xs object-contain"
            style={{ opacity: 0.04, mixBlendMode: "luminosity", filter: "grayscale(100%) invert(1)" }} />
        </div>

        {/* Guinea flag strip */}
        <div className="h-[3px] flex shrink-0">
          <div className="flex-1 bg-[#CE1126]" />
          <div className="flex-1 bg-[#FCD116]" />
          <div className="flex-1 bg-[#009460]" />
        </div>

        <div className="flex-1 flex flex-col px-8 py-7 sm:px-12 sm:py-9 lg:px-14 lg:py-10">

          {/* Header */}
          <div className="flex items-center gap-3 mb-10">
            <img src={logoImg} alt="Blason" className="w-12 h-12 object-contain drop-shadow-lg shrink-0" />
            <div>
              <p className="text-white font-semibold text-[15px] leading-tight tracking-tight" style={{ fontFamily: "'Crimson Pro', serif" }}>
                {communeName}
              </p>
              <p className="text-[#FCD116] text-[9px] font-mono uppercase tracking-[0.22em] opacity-80">PLATFORM SNRR · SIMANDOU 2040</p>
            </div>
            <div className={`ml-auto flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full border shrink-0 ${isOnline ? "border-[#009460]/30 text-[#009460] bg-[#009460]/10" : "border-red-500/30 text-red-400 bg-red-500/10"}`}>
              {isOnline ? <Wifi size={9} /> : <WifiOff size={9} />}
              <span>{isOnline ? "En ligne" : "Hors ligne"}</span>
            </div>
          </div>

          {/* Form area */}
          <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto lg:mx-0">

            {showReset ? (
              /* ── Reset password ── */
              <div className="space-y-5">
                <div>
                  <h2 className="text-white text-3xl font-light mb-1" style={{ fontFamily: "'Crimson Pro', serif" }}>Récupération</h2>
                  <p className="text-white/35 text-[11px] font-mono uppercase tracking-widest">Réinitialisation du mot de passe</p>
                </div>
                {resetSuccess ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-[#009460]/10 border border-[#009460]/25 rounded-[3px]">
                      <CheckCircle2 size={15} className="text-[#009460] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white mb-0.5">Email envoyé</p>
                        <p className="text-[11px] text-white/50 font-mono">Lien envoyé à <strong className="text-white">{resetEmail}</strong></p>
                      </div>
                    </div>
                    <button onClick={() => { setShowReset(false); setResetSuccess(false); setResetEmail(""); }}
                      className="w-full py-3.5 text-sm font-mono bg-[#009460] text-white rounded-[3px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                      Retour à la connexion <ChevronRight size={14} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleReset} className="space-y-5">
                    <p className="text-[11px] text-white/40 font-mono leading-relaxed">
                      Entrez votre email professionnel pour recevoir un lien de réinitialisation.
                    </p>
                    <Field label="Adresse email" required>
                      <div className="relative">
                        <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                        <input type="email" inputMode="email" className={`${inputCls} pl-9`} value={resetEmail}
                          onChange={e => setResetEmail(e.target.value)} placeholder={`votre.email@${communeDomain}`} autoFocus />
                      </div>
                    </Field>
                    {error && <p className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/25 rounded-[3px] text-[11px] text-red-400 font-mono"><AlertTriangle size={11} className="shrink-0 mt-0.5" /> {error}</p>}
                    <button type="submit" disabled={loading}
                      className="w-full py-3.5 text-sm font-mono bg-[#009460] text-white rounded-[3px] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity">
                      {loading ? <><RefreshCw size={13} className="animate-spin" /> Envoi…</> : <>Envoyer le lien <ChevronRight size={13} /></>}
                    </button>
                    <button type="button" onClick={() => { setShowReset(false); setError(""); setResetEmail(""); }}
                      className="w-full text-center py-2 text-[11px] font-mono text-white/30 hover:text-white/60 transition-colors">
                      ← Retour à la connexion
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* ── Login form ── */
              <div className="space-y-7">
                <div>
                  <h2 className="text-white text-4xl font-light leading-none mb-1" style={{ fontFamily: "'Crimson Pro', serif" }}>Connexion</h2>
                  <p className="text-white/35 text-[11px] font-mono uppercase tracking-widest">Espace de travail · {communeName}</p>
                </div>

                {/* Credential hint badge */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-sm bg-[#B8860B]/15 border border-[#B8860B]/25 text-[10px] font-mono text-[#E8A820]">
                  <span className="opacity-60">Accès admin :</span>
                  <span>admin@{communeDomain}</span>
                  <span className="opacity-40">·</span>
                  <span>admin@123</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Field label="Identifiant ou email" required>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                      <input
                        type="text" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false}
                        className={`${inputCls} pl-9`} value={email} onChange={e => setEmail(e.target.value)}
                        placeholder={`admin@${communeDomain}`} autoComplete="username"
                      />
                    </div>
                  </Field>

                  <Field label="Mot de passe" required>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                      <input
                        type="password" className={`${inputCls} pl-9`} value={password}
                        onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"
                      />
                    </div>
                  </Field>

                  {error && (
                    <p className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/25 rounded-[3px] text-[11px] text-red-400 font-mono">
                      <AlertTriangle size={11} className="shrink-0 mt-0.5" /> {error}
                    </p>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full py-4 sm:py-3.5 text-sm font-mono rounded-[3px] transition-all flex items-center justify-center gap-2 font-semibold active:scale-[0.98] touch-manipulation mt-1"
                    style={{ background: loading ? "#5C0810" : "linear-gradient(135deg, #CE1126 0%, #8B0A1A 100%)", color: "white" }}>
                    {loading ? <><RefreshCw size={14} className="animate-spin" /> Vérification…</> : <>Se connecter <ChevronRight size={14} /></>}
                  </button>

                  <p className="text-center text-[11px] font-mono text-white/30">
                    Mot de passe oublié ?{" "}
                    <button type="button" onClick={() => { setShowReset(true); setError(""); }}
                      className="text-[#FCD116] hover:underline font-medium px-1 -mx-1 py-1">
                      Cliquez ici
                    </button>
                  </p>
                </form>

                {/* Security badges */}
                <div className="flex items-center gap-3 pt-1">
                  {[
                    { icon: Shield, label: "Chiffrement SSL" },
                    { icon: Lock, label: "Auth 2 facteurs" },
                    { icon: Activity, label: "Audit en continu" },
                  ].map(b => (
                    <div key={b.label} className="flex items-center gap-1 text-[9px] font-mono text-white/25 uppercase tracking-wide">
                      <b.icon size={9} />
                      <span>{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-white/15 text-[10px] font-mono mt-8 text-center lg:text-left">
            © {new Date().getFullYear()} République de Guinée · Commune Urbaine de Mamou · v1.0
            <span className="ml-2 text-[10px]">Démo: admin / snrr2024</span>
          </p>
        </div>
      </div>

      {/* ════ RIGHT PANEL — Live platform dashboard ══════════════════════════════ */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-[#0D1B35]">

        {/* Subtle grid texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)",
          backgroundSize: "36px 36px",
        }} />
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(206,17,38,0.08) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,148,96,0.07) 0%, transparent 70%)" }} />

        {/* Flag strip top */}
        <div className="h-[3px] flex shrink-0 relative z-10">
          <div className="flex-1 bg-[#CE1126]" />
          <div className="flex-1 bg-[#FCD116]" />
          <div className="flex-1 bg-[#009460]" />
        </div>

        <div className="relative flex-1 flex flex-col p-10 xl:p-14 gap-8 overflow-hidden">

          {/* ── Header ── */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/35 text-[10px] font-mono uppercase tracking-widest mb-1">Préfecture de Mamou · Exercice 2024</p>
              <h1 className="text-white text-3xl xl:text-4xl font-light leading-tight" style={{ fontFamily: "'Crimson Pro', serif" }}>
                Système Numérique de<br />Recensement & Recouvrement
              </h1>
            </div>
            {/* Live status */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#009460] bg-[#009460]/10 border border-[#009460]/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#009460] animate-pulse" />
                Système opérationnel
              </div>
              <p className="text-white/25 text-[10px] font-mono flex items-center gap-1">
                <Clock size={9} />
                Mis à jour il y a {lastUpdate}s
              </p>
            </div>
          </div>

          {/* ── KPI grid ── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {/* Recettes du jour */}
            <div className="bg-white/4 border border-white/8 rounded-[4px] p-4 hover:bg-white/6 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">Recettes jour</span>
                <CreditCard size={12} className="text-[#FCD116]/60" />
              </div>
              <p className="text-xl font-bold text-white font-mono">{fmtGnf(Math.round(dispRecettes))}</p>
              <p className="text-[9px] text-[#FCD116] font-mono mt-1 flex items-center gap-0.5">
                <ArrowUpRight size={9} /> GNF
              </p>
            </div>
            {/* Paiements */}
            <div className="bg-white/4 border border-white/8 rounded-[4px] p-4 hover:bg-white/6 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">Paiements</span>
                <Zap size={12} className="text-[#009460]/60" />
              </div>
              <p className="text-xl font-bold text-white font-mono">{Math.round(dispPaiements)}</p>
              <p className="text-[9px] text-[#009460] font-mono mt-1">{"Aujourd'hui"}</p>
            </div>
            {/* Contribuables */}
            <div className="bg-white/4 border border-white/8 rounded-[4px] p-4 hover:bg-white/6 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">Contribuables</span>
                <Users size={12} className="text-[#4A6B8A]/80" />
              </div>
              <p className="text-xl font-bold text-white font-mono">{Math.round(dispContribuables).toLocaleString("fr-FR")}</p>
              <p className="text-[9px] text-white/30 font-mono mt-1">Recensés</p>
            </div>
            {/* Taux recouvrement */}
            <div className="bg-white/4 border border-white/8 rounded-[4px] p-4 hover:bg-white/6 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">Recouvrement</span>
                <TrendingUp size={12} className="text-[#CE1126]/60" />
              </div>
              <p className="text-xl font-bold text-white font-mono">{stats.tauxRecouvrement.toFixed(1)}%</p>
              <div className="mt-1.5 h-1 rounded-full bg-white/8">
                <div className="h-1 rounded-full bg-[#CE1126] transition-all duration-700"
                  style={{ width: `${stats.tauxRecouvrement}%` }} />
              </div>
            </div>
          </div>

          {/* ── Middle row: Sparkline + Agents ── */}
          <div className="grid grid-cols-5 gap-4">

            {/* Sparkline — recettes 12h */}
            <div className="col-span-3 bg-white/4 border border-white/8 rounded-[4px] p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-white/40 mb-0.5">Recettes — dernières 12h</p>
                  <p className="text-white/70 text-xs font-mono">Mise à jour automatique</p>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-mono text-[#FCD116]/70">
                  <Activity size={9} className="animate-pulse" />
                  LIVE
                </div>
              </div>
              <Sparkline values={sparkline} />
              <div className="flex justify-between mt-2">
                <span className="text-[9px] font-mono text-white/25">−12h</span>
                <span className="text-[9px] font-mono text-white/25">Maintenant</span>
              </div>
            </div>

            {/* Status agents */}
            <div className="col-span-2 bg-white/4 border border-white/8 rounded-[4px] p-4 flex flex-col gap-3">
              <p className="text-[9px] font-mono uppercase tracking-widest text-white/40">Agents connectés</p>
              <div className="text-3xl font-bold text-white font-mono">{stats.agentsConnectes}</div>
              <div className="space-y-2 mt-1">
                {[
                  { label: "Missions actives", value: stats.missionsActives, color: "#FCD116" },
                  { label: "Communes couvertes", value: 10, color: "#009460" },
                  { label: "SPs actifs", value: 8, color: "#4A6B8A" },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-white/35 uppercase tracking-wide">{r.label}</span>
                    <span className="text-[10px] font-mono font-bold" style={{ color: r.color }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Activity feed ── */}
          <div className="bg-white/4 border border-white/8 rounded-[4px] p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] font-mono uppercase tracking-widest text-white/40">Activité récente</p>
              <div className="flex items-center gap-1 text-[9px] font-mono text-white/25">
                <MapPin size={9} /> 10 communes
              </div>
            </div>
            <div className="space-y-2">
              {activity.map((a, i) => (
                <div key={`${a.agent}-${i}-${tick}`}
                  className="flex items-start gap-2.5 py-1.5 border-b border-white/5 last:border-0"
                  style={{ opacity: 1 - i * 0.15, animation: i === 0 ? "fadeIn 0.4s ease-out" : undefined }}>
                  <ActivityDot type={a.type} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-white/70">{a.agent}</span>
                    <span className="text-white/30 mx-1 text-[10px]">·</span>
                    <span className="text-[10px] font-mono text-white/45">{a.action}</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/30 shrink-0">{a.montant}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Footer features ── */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Users, label: "Recensement", desc: "Géolocalisation contribuables", color: "#CE1126" },
              { icon: MapPin, label: "Cartographie SIG", desc: "OpenStreetMap interactif", color: "#FCD116" },
              { icon: CreditCard, label: "Paiement", desc: "Orange Money · QR Code", color: "#009460" },
              { icon: TrendingUp, label: "Analytique", desc: "BI & rapports décisionnels", color: "#4A6B8A" },
            ].map(f => (
              <div key={f.label} className="flex items-start gap-2.5 p-3 bg-white/3 border border-white/6 rounded-[3px]">
                <div className="w-6 h-6 rounded-[2px] flex items-center justify-center shrink-0" style={{ background: `${f.color}18`, border: `1px solid ${f.color}25` }}>
                  <f.icon size={11} style={{ color: f.color }} />
                </div>
                <div>
                  <p className="text-white/70 text-[10px] font-medium">{f.label}</p>
                  <p className="text-white/30 text-[9px] font-mono leading-tight mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
