import React, { useState, useEffect } from "react";
import { PlatformLogo, PlatformLogoMark } from "./SaasLanding";
import {
  LayoutDashboard, Users, CreditCard, Settings, LogOut, Building2,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Plus, Search,
  ChevronRight, RefreshCw, Edit2,
  Globe, Download, Bell, ArrowUpRight, ArrowDownRight,
  Shield, Zap, X, Check, Mail, Phone, Calendar, Eye,
  Play, Pause, Layers, ToggleRight, Copy, ExternalLink,
  Database, Server, Activity, Lock,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Plan = "trial" | "pro" | "enterprise";
type Status = "active" | "trial" | "suspended" | "expired" | "pending";
type InvoiceStatus = "paid" | "pending" | "overdue" | "cancelled";

type TenantType = "commune" | "prefecture";

interface Tenant {
  id: string;
  commune: string;
  country: string;
  contact: string;
  email: string;
  phone: string;
  plan: Plan;
  status: Status;
  agents: number;
  contribuables: number;
  mrr: number; // GNF/month
  createdAt: string;
  trialEndsAt?: string;
  nextBilling?: string;
  locale: "fr" | "en";
  features: string[];
  logo?: string;
  tenantType?: TenantType;   // "commune" (default) or "prefecture"
  prefectureId?: string;     // communes: parent prefecture id; prefectures: own region id
  region?: string;           // human-readable region name
}

interface Invoice {
  id: string;
  tenantId: string;
  commune: string;
  amount: number;
  status: InvoiceStatus;
  date: string;
  dueDate: string;
  plan: Plan;
  period: string;
}

// ─── Sample data ───────────────────────────────────────────────────────────────

// Prefecture definitions — when a prefecture subscribes it sees all child communes
const PREFECTURES_GN = [
  { id: "pref-conakry",    nom: "Préfecture de Conakry",    region: "Conakry",     nbCommunes: 5  },
  { id: "pref-kindia",     nom: "Préfecture de Kindia",     region: "Kindia",      nbCommunes: 5  },
  { id: "pref-boke",       nom: "Préfecture de Boké",       region: "Boké",        nbCommunes: 5  },
  { id: "pref-mamou",      nom: "Préfecture de Mamou",      region: "Mamou",       nbCommunes: 3  },
  { id: "pref-labe",       nom: "Préfecture de Labé",       region: "Labé",        nbCommunes: 5  },
  { id: "pref-faranah",    nom: "Préfecture de Faranah",    region: "Faranah",     nbCommunes: 4  },
  { id: "pref-kankan",     nom: "Préfecture de Kankan",     region: "Kankan",      nbCommunes: 5  },
  { id: "pref-nzerekore",  nom: "Préfecture de N'Zérékoré", region: "N'Zérékoré", nbCommunes: 6  },
];

// All 38 active Guinean communes — login: admin@{id}.gn / admin@123
const COMMUNES_GN = [
  { id: "conakry-kaloum", nom: "Kaloum",      region: "Conakry",     prefId: "pref-conakry",   agents: 52, pop: 42000 },
  { id: "conakry-dixinn", nom: "Dixinn",      region: "Conakry",     prefId: "pref-conakry",   agents: 38, pop: 60000 },
  { id: "conakry-ratoma", nom: "Ratoma",      region: "Conakry",     prefId: "pref-conakry",   agents: 64, pop: 120000 },
  { id: "conakry-matam",  nom: "Matam",       region: "Conakry",     prefId: "pref-conakry",   agents: 41, pop: 78000 },
  { id: "conakry-matoto", nom: "Matoto",      region: "Conakry",     prefId: "pref-conakry",   agents: 55, pop: 135000 },
  { id: "coyah",          nom: "Coyah",       region: "Kindia",      prefId: "pref-kindia",    agents: 14, pop: 32000 },
  { id: "dubreka",        nom: "Dubréka",     region: "Kindia",      prefId: "pref-kindia",    agents: 11, pop: 24000 },
  { id: "forecariah",     nom: "Forécariah",  region: "Kindia",      prefId: "pref-kindia",    agents: 10, pop: 18000 },
  { id: "kindia",         nom: "Kindia",      region: "Kindia",      prefId: "pref-kindia",    agents: 22, pop: 68000 },
  { id: "telimele",       nom: "Télimélé",    region: "Kindia",      prefId: "pref-kindia",    agents: 9,  pop: 21000 },
  { id: "boffa",          nom: "Boffa",       region: "Boké",        prefId: "pref-boke",      agents: 8,  pop: 16000 },
  { id: "boke",           nom: "Boké",        region: "Boké",        prefId: "pref-boke",      agents: 13, pop: 38000 },
  { id: "fria",           nom: "Fria",        region: "Boké",        prefId: "pref-boke",      agents: 10, pop: 22000 },
  { id: "gaoual",         nom: "Gaoual",      region: "Boké",        prefId: "pref-boke",      agents: 7,  pop: 12000 },
  { id: "koundara",       nom: "Koundara",    region: "Boké",        prefId: "pref-boke",      agents: 6,  pop: 10000 },
  { id: "dalaba",         nom: "Dalaba",      region: "Mamou",       prefId: "pref-mamou",     agents: 9,  pop: 20000 },
  { id: "mamou",          nom: "Mamou",       region: "Mamou",       prefId: "pref-mamou",     agents: 18, pop: 50000 },
  { id: "pita",           nom: "Pita",        region: "Mamou",       prefId: "pref-mamou",     agents: 11, pop: 28000 },
  { id: "koubia",         nom: "Koubia",      region: "Labé",        prefId: "pref-labe",  agents: 6,  pop: 9000 },
  { id: "labe",           nom: "Labé",        region: "Labé",        prefId: "pref-labe",  agents: 22, pop: 65000 },
  { id: "lelouma",        nom: "Lélouma",     region: "Labé",        prefId: "pref-labe",  agents: 8,  pop: 17000 },
  { id: "mali",           nom: "Mali",        region: "Labé",        prefId: "pref-labe",      agents: 7,  pop: 14000 },
  { id: "tougue",         nom: "Tougué",      region: "Labé",        prefId: "pref-labe",      agents: 7,  pop: 13000 },
  { id: "dabola",         nom: "Dabola",      region: "Faranah",     prefId: "pref-faranah",   agents: 10, pop: 23000 },
  { id: "dinguiraye",     nom: "Dinguiraye",  region: "Faranah",     prefId: "pref-faranah",   agents: 8,  pop: 18000 },
  { id: "faranah",        nom: "Faranah",     region: "Faranah",     prefId: "pref-faranah",   agents: 14, pop: 40000 },
  { id: "kissidougou",    nom: "Kissidougou", region: "Faranah",     prefId: "pref-faranah",   agents: 13, pop: 37000 },
  { id: "kankan",         nom: "Kankan",      region: "Kankan",      prefId: "pref-kankan",    agents: 28, pop: 92000 },
  { id: "kerouane",       nom: "Kérouané",    region: "Kankan",      prefId: "pref-kankan",    agents: 9,  pop: 20000 },
  { id: "kouroussa",      nom: "Kouroussa",   region: "Kankan",      prefId: "pref-kankan",    agents: 10, pop: 24000 },
  { id: "mandiana",       nom: "Mandiana",    region: "Kankan",      prefId: "pref-kankan",    agents: 9,  pop: 21000 },
  { id: "siguiri",        nom: "Siguiri",     region: "Kankan",      prefId: "pref-kankan",    agents: 15, pop: 48000 },
  { id: "beyla",          nom: "Beyla",       region: "N'Zérékoré",  prefId: "pref-nzerekore", agents: 9,  pop: 20000 },
  { id: "gueckedou",      nom: "Guéckédou",   region: "N'Zérékoré",  prefId: "pref-nzerekore", agents: 16, pop: 52000 },
  { id: "lola",           nom: "Lola",        region: "N'Zérékoré",  prefId: "pref-nzerekore", agents: 10, pop: 26000 },
  { id: "macenta",        nom: "Macenta",     region: "N'Zérékoré",  prefId: "pref-nzerekore", agents: 14, pop: 42000 },
  { id: "nzerekore",      nom: "N'Zérékoré",  region: "N'Zérékoré",  prefId: "pref-nzerekore", agents: 31, pop: 95000 },
  { id: "yomou",          nom: "Yomou",       region: "N'Zérékoré",  prefId: "pref-nzerekore", agents: 7,  pop: 14000 },
];

// need to also add prefId to the middle communes not yet updated
const COMMUNES_GN_EXTRA_PREF: Record<string,string> = {
  "koubia": "pref-labe", "labe": "pref-labe", "lelouma": "pref-labe",
};

function seedContrib(pop: number) { return Math.round(pop * 0.28 + Math.random() * 500); }

const COMMUNE_TENANTS: Tenant[] = COMMUNES_GN.map((c, i) => {
  const contrib = seedContrib(c.pop);
  const plan: Plan = "pro";
  const mrr = 5000000;
  return {
    id: c.id,
    commune: c.nom,
    country: "Guinée",
    contact: "Administrateur",
    email: `admin@${c.id}.gn`,
    phone: `+224 6${String(20 + (i % 10)).padStart(2,"0")} ${String(10 + (i * 3) % 90).padStart(2,"0")} ${String(11 + (i * 7) % 88).padStart(2,"0")} ${String(10 + (i * 13) % 89).padStart(2,"0")}`,
    plan,
    status: "active" as Status,
    agents: c.agents,
    contribuables: contrib,
    mrr,
    createdAt: "2024-01-01",
    nextBilling: "2024-08-01",
    locale: "fr",
    features: ["all"],
    tenantType: "commune" as TenantType,
    prefectureId: (c as { prefId?: string }).prefId ?? COMMUNES_GN_EXTRA_PREF[c.id],
    region: c.region,
  };
});

// Prefecture tenants — each covers all communes in its territory
const PREFECTURE_TENANTS: Tenant[] = PREFECTURES_GN.map((p, i) => {
  const childCommunes = COMMUNES_GN.filter(c => (c as { prefId?: string }).prefId === p.id);
  const totalAgents = childCommunes.reduce((s, c) => s + c.agents, 0);
  const totalPop = childCommunes.reduce((s, c) => s + c.pop, 0);
  return {
    id: p.id,
    commune: p.nom,
    country: "Guinée",
    contact: "Gouverneur de Région",
    email: `admin@${p.id}.gn`,
    phone: `+224 6${String(20 + i).padStart(2,"0")} 00 00 ${String(10 + i).padStart(2,"0")}`,
    plan: "enterprise" as Plan,
    status: "active" as Status,
    agents: totalAgents,
    contribuables: Math.round(totalPop * 0.28),
    mrr: childCommunes.length * 5000000, // covers all communes
    createdAt: "2024-01-01",
    nextBilling: "2024-08-01",
    locale: "fr",
    features: ["all", "prefecture-dashboard"],
    tenantType: "prefecture" as TenantType,
    prefectureId: p.id,
    region: p.region,
  };
});

const TENANTS: Tenant[] = [...PREFECTURE_TENANTS, ...COMMUNE_TENANTS];

const INVOICES: Invoice[] = [
  { id: "INV-2024-0156", tenantId: "conakry-kaloum", commune: "Kaloum", amount: 5000000, status: "paid", date: "2024-06-01", dueDate: "2024-06-15", plan: "enterprise", period: "Juin 2024" },
  { id: "INV-2024-0155", tenantId: "labe", commune: "Labé", amount: 5000000, status: "paid", date: "2024-06-10", dueDate: "2024-06-25", plan: "pro", period: "Juin 2024" },
  { id: "INV-2024-0154", tenantId: "mamou", commune: "Mamou", amount: 5000000, status: "pending", date: "2024-06-15", dueDate: "2024-06-30", plan: "pro", period: "Juin 2024" },
  { id: "INV-2024-0153", tenantId: "kankan", commune: "Kankan", amount: 5000000, status: "paid", date: "2024-06-01", dueDate: "2024-06-15", plan: "pro", period: "Juin 2024" },
  { id: "INV-2024-0152", tenantId: "nzerekore", commune: "N'Zérékoré", amount: 5000000, status: "overdue", date: "2024-05-20", dueDate: "2024-06-05", plan: "pro", period: "Mai 2024" },
  { id: "INV-2024-0151", tenantId: "conakry-ratoma", commune: "Ratoma", amount: 5000000, status: "paid", date: "2024-05-01", dueDate: "2024-05-15", plan: "enterprise", period: "Mai 2024" },
  { id: "INV-2024-0150", tenantId: "kindia", commune: "Kindia", amount: 5000000, status: "paid", date: "2024-05-10", dueDate: "2024-05-25", plan: "pro", period: "Mai 2024" },
  { id: "INV-2024-0149", tenantId: "faranah", commune: "Faranah", amount: 5000000, status: "paid", date: "2024-05-15", dueDate: "2024-05-30", plan: "pro", period: "Mai 2024" },
  { id: "INV-2024-0148", tenantId: "siguiri", commune: "Siguiri", amount: 4000000, status: "paid", date: "2024-05-01", dueDate: "2024-05-15", plan: "pro", period: "Mai 2024 (annuel –20%)" },
  { id: "INV-2024-0147", tenantId: "gueckedou", commune: "Guéckédou", amount: 4000000, status: "paid", date: "2024-04-01", dueDate: "2024-04-15", plan: "pro", period: "Avril 2024 (annuel –20%)" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtGnf(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)} M GNF`;
  return `${(v / 1_000).toFixed(0)} K GNF`;
}

const STATUS_COLORS: Record<Status, { bg: string; text: string; label: string }> = {
  active: { bg: "#009460/15", text: "#009460", label: "Actif" },
  trial: { bg: "#FCD116/15", text: "#FCD116", label: "Essai" },
  suspended: { bg: "#CE1126/15", text: "#CE1126", label: "Suspendu" },
  expired: { bg: "white/8", text: "rgba(255,255,255,0.4)", label: "Expiré" },
  pending: { bg: "#4A6B8A/15", text: "#4A6B8A", label: "En attente" },
};

const PLAN_LABELS: Record<Plan, string> = { trial: "Essai gratuit", pro: "Pro", enterprise: "Préfecture" };

const INV_COLORS: Record<InvoiceStatus, { text: string; label: string }> = {
  paid: { text: "#009460", label: "Payée" },
  pending: { text: "#FCD116", label: "En attente" },
  overdue: { text: "#CE1126", label: "En retard" },
  cancelled: { text: "rgba(255,255,255,0.35)", label: "Annulée" },
};

function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_COLORS[status];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium"
      style={{ background: `rgba(${s.text === "#009460" ? "0,148,96" : s.text === "#FCD116" ? "252,209,22" : s.text === "#CE1126" ? "206,17,38" : "74,107,138"},0.12)`, color: s.text }}>
      <span className="w-1 h-1 rounded-full" style={{ background: s.text }} />
      {s.label}
    </span>
  );
}

function PlanBadge({ plan }: { plan: Plan }) {
  const colors: Record<Plan, string> = { trial: "#B8860B", pro: "#1B3A6B", enterprise: "#8B0A5A" };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold"
      style={{ background: `${colors[plan]}20`, color: colors[plan], border: `1px solid ${colors[plan]}30` }}>
      {PLAN_LABELS[plan]}
    </span>
  );
}

// ─── Login screen ──────────────────────────────────────────────────────────────

// ─── Workspaces tab ────────────────────────────────────────────────────────────

type WsView = "list" | "detail";

// Persistent credential store keyed by tenant.id: { login, password, apiKey }
type CredStore = Record<string, { login: string; password: string; apiKey: string }>;

const CREDS_LS_KEY = "snrr_workspace_creds";
function saveCredsLS(c: CredStore) {
  try { localStorage.setItem(CREDS_LS_KEY, JSON.stringify(c)); } catch {}
}
function loadCredsLS(): CredStore {
  try { return JSON.parse(localStorage.getItem(CREDS_LS_KEY) ?? "{}"); } catch { return {}; }
}

function initCreds(tenants: Tenant[]): CredStore {
  const stored = loadCredsLS();
  const defaults = Object.fromEntries(tenants.map(t => [t.id, {
    login: t.email,
    password: "admin@123",
    apiKey: `sk-${t.id.replace(/-/g, "").slice(0, 16)}${Math.random().toString(36).slice(2, 6)}`,
  }]));
  // Merge: stored values override defaults (preserves admin-set creds across refresh)
  return { ...defaults, ...stored };
}
function genPassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789@#!";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
function genApiKey(id: string) {
  return `sk-${id.replace(/-/g, "").slice(0, 12)}${Math.random().toString(36).slice(2, 10)}`;
}

function WorkspacesTab({ tenants, setTenants }: { tenants: Tenant[]; setTenants: React.Dispatch<React.SetStateAction<Tenant[]>> }) {
  const [view, setView] = useState<WsView>("list");
  const [selected, setSelected] = useState<Tenant | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "commune" | "prefecture">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ commune: "", country: "Guinée", contact: "", email: "", plan: "trial" as Plan, agents: "5", tenantType: "commune" as TenantType, prefectureId: "" });
  const [createLoading, setCreateLoading] = useState(false);
  const [copied, setCopied] = useState("");
  const [creds, setCreds] = useState<CredStore>(() => initCreds(tenants));

  // Persist creds to localStorage so LoginModal can verify them
  useEffect(() => { saveCredsLS(creds); }, [creds]);

  const [showReset, setShowReset] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [newLogin, setNewLogin] = useState("");
  // Card-level quick reset (from list view, without navigating to detail)
  const [cardResetTenant, setCardResetTenant] = useState<Tenant | null>(null);
  const [cardResetPwd, setCardResetPwd] = useState("");
  const [cardResetDone, setCardResetDone] = useState(false);
  const [cardCopied, setCardCopied] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);

  const COUNTRIES = ["Guinée", "Sénégal", "Côte d'Ivoire", "Mali", "Burkina Faso", "Niger", "Bénin", "Togo", "Cameroun", "Madagascar", "RDC", "Other"];
  const MODULES = ["CFU & Taxes", "Patentes", "Marchés", "Paiements électroniques", "Cartographie SIG", "Business Intelligence", "Gestion utilisateurs", "Audit & Sécurité"];

  const prefectures = tenants.filter(t => t.tenantType === "prefecture");
  const communes = tenants.filter(t => t.tenantType === "commune");

  const filtered = tenants.filter(t => {
    const q = search.toLowerCase();
    const matchQ = t.commune.toLowerCase().includes(q) || t.country.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
    const matchType = typeFilter === "all" || (typeFilter === "prefecture" ? t.tenantType === "prefecture" : t.tenantType !== "prefecture");
    return matchQ && matchType;
  });

  const toId = (name: string) => name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").slice(0, 32) || "workspace";

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };

  const trialDaysLeft = (t: Tenant) => t.trialEndsAt ? Math.max(0, Math.ceil((new Date(t.trialEndsAt).getTime() - Date.now()) / 864e5)) : 0;

  const createWorkspace = () => {
    if (!createForm.commune || !createForm.email) return;
    setCreateLoading(true);
    setTimeout(() => {
      const id = toId(createForm.commune);
      const isPrefType = createForm.tenantType === "prefecture";
      const plan = isPrefType ? "enterprise" as Plan : createForm.plan;
      const newTenant: Tenant = {
        id, commune: createForm.commune, country: createForm.country,
        contact: createForm.contact, email: createForm.email, phone: "",
        plan, status: plan === "trial" ? "trial" : "active",
        agents: Number(createForm.agents), contribuables: 0,
        mrr: plan === "pro" ? 5000000 : plan === "enterprise" ? 25000000 : 0,
        createdAt: new Date().toISOString().slice(0, 10), locale: "fr",
        features: isPrefType ? ["all", "prefecture-dashboard"] : ["all"],
        trialEndsAt: plan === "trial" ? new Date(Date.now() + 14 * 864e5).toISOString() : undefined,
        nextBilling: plan !== "trial" ? new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10) : undefined,
        tenantType: createForm.tenantType,
        prefectureId: isPrefType ? id : (createForm.prefectureId || undefined),
      };
      setTenants(prev => [newTenant, ...prev]);
      setCreateLoading(false);
      setShowCreate(false);
      setCreateForm({ commune: "", country: "Guinée", contact: "", email: "", plan: "trial", agents: "5", tenantType: "commune", prefectureId: "" });
      setSelected(newTenant);
      setView("detail");
    }, 1200);
  };

  const inp = "w-full px-3 py-2 text-[12px] bg-white/4 border border-white/10 rounded-[3px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]/50 font-mono transition-colors";

  if (view === "detail" && selected) {
    const wsId = selected.id;
    const wsUrl = `${wsId}.platform-snrr.com`;
    const isPref = selected.tenantType === "prefecture";
    const childCommunes = isPref ? communes.filter(c => c.prefectureId === selected.id) : [];
    const parentPref = !isPref && selected.prefectureId ? tenants.find(p => p.id === selected.prefectureId) : null;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { setView("list"); setSelected(null); }} className="flex items-center gap-1.5 text-[11px] font-mono text-white/40 hover:text-white transition-colors">
            <ChevronRight size={12} className="rotate-180" /> Tous les workspaces
          </button>
          <span className="text-white/15">/</span>
          {parentPref && (
            <>
              <button onClick={() => setSelected(parentPref)} className="text-[11px] font-mono text-[#8B0A5A]/80 hover:text-[#FFB0CC] transition-colors flex items-center gap-1">
                <Shield size={10} /> {parentPref.commune}
              </button>
              <span className="text-white/15">/</span>
            </>
          )}
          <span className="text-[11px] font-mono text-white/60">{selected.commune}</span>
          {isPref && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#8B0A5A]/20 text-[#FFB0CC] border border-[#8B0A5A]/25">Préfecture · {childCommunes.length} communes</span>}
        </div>

        {/* Prefecture alert banner */}
        {isPref && (
          <div className="flex items-center gap-3 p-3 bg-[#8B0A5A]/10 border border-[#8B0A5A]/25 rounded-[3px]">
            <Shield size={14} className="text-[#FFB0CC] shrink-0" />
            <div>
              <p className="text-[11px] font-mono text-[#FFB0CC] font-semibold">Accès Préfecture — Vue consolidée</p>
              <p className="text-[10px] font-mono text-white/40">La préfecture accède aux données de {childCommunes.length} communes de la région {selected.region}. Chaque commune reste une entité indépendante.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {/* Main info */}
          <div className="col-span-2 space-y-4">
            {/* Header card */}
            <div className={`border rounded-[3px] p-5 ${isPref ? "bg-[#8B0A5A]/8 border-[#8B0A5A]/20" : "bg-white/3 border-white/8"}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-[3px] flex items-center justify-center text-lg font-bold text-white ${isPref ? "bg-gradient-to-br from-[#8B0A5A] to-[#CE1126]" : "bg-gradient-to-br from-[#CE1126] to-[#1B3A6B]"}`}>
                    {isPref ? <Shield size={18} /> : selected.commune.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-white font-medium text-base">{selected.commune}</h2>
                    <p className="text-white/35 text-[11px] font-mono">{wsUrl}</p>
                    {parentPref && <p className="text-[10px] font-mono text-[#8B0A5A]/70 mt-0.5">Sous {parentPref.commune}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={selected.status} />
                  <PlanBadge plan={selected.plan} />
                </div>
              </div>

              {/* URL row */}
              <div className="flex items-center gap-2 p-2.5 bg-white/4 border border-white/8 rounded-[3px]">
                <ExternalLink size={11} className="text-white/30 shrink-0" />
                <span className="text-[11px] font-mono text-[#4A6B8A] flex-1">{wsUrl}</span>
                <button onClick={() => copyText(wsUrl, "url")} className="text-[10px] font-mono text-white/30 hover:text-white transition-colors flex items-center gap-1">
                  <Copy size={10} /> {copied === "url" ? "Copié!" : "Copier"}
                </button>
              </div>
            </div>

            {/* Prefecture: child communes panel */}
            {isPref && childCommunes.length > 0 && (
              <div className="bg-white/3 border border-white/8 rounded-[3px] p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">Communes rattachées ({childCommunes.length})</p>
                  <span className="text-[9px] font-mono text-[#009460]">Accès données activé</span>
                </div>
                <div className="space-y-2">
                  {childCommunes.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-2.5 bg-white/3 border border-white/6 rounded-[3px] hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => setSelected(c)}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-[2px] bg-gradient-to-br from-[#CE1126]/30 to-[#1B3A6B]/30 flex items-center justify-center text-[10px] font-bold text-white">{c.commune.charAt(0)}</div>
                        <div>
                          <p className="text-[12px] font-medium text-white">{c.commune}</p>
                          <p className="text-[9px] font-mono text-white/30">{c.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[10px] font-mono text-white/60">{c.agents} agents</p>
                          <p className="text-[9px] font-mono text-[#009460]">{fmtGnf(c.mrr)}</p>
                        </div>
                        <StatusBadge status={c.status} />
                        <ChevronRight size={12} className="text-white/20" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/6 grid grid-cols-3 gap-3">
                  {[
                    { l: "Total agents", v: String(childCommunes.reduce((s,c) => s + c.agents, 0)) },
                    { l: "Total contribuables", v: childCommunes.reduce((s,c) => s + c.contribuables, 0).toLocaleString("fr-FR") },
                    { l: "MRR consolidé", v: fmtGnf(childCommunes.reduce((s,c) => s + c.mrr, 0)) },
                  ].map(r => (
                    <div key={r.l} className="text-center p-2 bg-white/3 rounded">
                      <p className="text-[12px] font-bold font-mono text-white">{r.v}</p>
                      <p className="text-[9px] font-mono text-white/30 uppercase">{r.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modules */}
            <div className="bg-white/3 border border-white/8 rounded-[3px] p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">Modules activés</p>
                <span className="text-[10px] font-mono text-[#009460]">{MODULES.length} / {MODULES.length}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {MODULES.map((m, i) => (
                  <div key={m} className="flex items-center justify-between p-2.5 bg-white/3 border border-white/6 rounded-[3px]">
                    <span className="text-[11px] font-mono text-white/60">{m}</span>
                    <ToggleRight size={16} className="text-[#009460] shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Infrastructure */}
            <div className="bg-white/3 border border-white/8 rounded-[3px] p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-4">Infrastructure</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Server, label: "Région", value: "Afrique Ouest", status: "ok" },
                  { icon: Database, label: "Base de données", value: "PostgreSQL 15", status: "ok" },
                  { icon: Activity, label: "Uptime", value: "99.97%", status: "ok" },
                  { icon: Lock, label: "SSL", value: "Actif · TLS 1.3", status: "ok" },
                  { icon: Shield, label: "Backup", value: "Quotidien", status: "ok" },
                  { icon: Zap, label: "API Gateway", value: "Opérationnel", status: "ok" },
                ].map(r => (
                  <div key={r.label} className="p-3 bg-white/3 border border-white/6 rounded-[3px]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <r.icon size={11} className="text-white/25" />
                      <span className="text-[9px] font-mono uppercase tracking-wide text-white/30">{r.label}</span>
                    </div>
                    <p className="text-[11px] font-mono text-white/65">{r.value}</p>
                    <span className="text-[9px] font-mono text-[#009460]">● Actif</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick stats */}
            <div className="bg-white/3 border border-white/8 rounded-[3px] p-4 space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">Statistiques</p>
              {[
                { label: "Agents", value: String(selected.agents), color: "#4A6B8A" },
                { label: "Contribuables", value: selected.contribuables.toLocaleString("fr-FR"), color: "#1B3A6B" },
                { label: "MRR", value: selected.mrr > 0 ? fmtGnf(selected.mrr) : "Essai", color: "#009460" },
                { label: "Client depuis", value: selected.createdAt, color: "#B8860B" },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-white/35">{s.label}</span>
                  <span className="text-[11px] font-mono font-medium" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
              {selected.status === "trial" && (
                <div className="flex items-center justify-between pt-1 border-t border-white/6">
                  <span className="text-[10px] font-mono text-white/35">Essai restant</span>
                  <span className="text-[11px] font-mono font-bold text-[#FCD116]">{trialDaysLeft(selected)}j</span>
                </div>
              )}
            </div>

            {/* Credentials */}
            {(() => {
              const sc = creds[selected.id] ?? { login: selected.email, password: "admin@123", apiKey: "sk-…" };
              const credRows = [
                { label: "URL workspace", value: wsUrl, key: "wsurl", mask: false },
                { label: "Login admin", value: sc.login, key: "login", mask: false },
                { label: "Mot de passe", value: sc.password, key: "pwd", mask: true },
                { label: "Clé API", value: sc.apiKey, key: "api", mask: true },
              ];
              return (
                <div className="bg-white/3 border border-white/8 rounded-[3px] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">Identifiants d{"'"}accès</p>
                    <div className="flex gap-1.5">
                      <button onClick={() => { setNewLogin(sc.login); setNewPwd(""); setSessionDone(false); setShowSession(true); }}
                        className="text-[9px] font-mono px-2 py-0.5 border border-[#1B3A6B]/50 text-[#4A9FFF] rounded hover:bg-[#1B3A6B]/20 transition-colors">
                        + Session
                      </button>
                      <button onClick={() => { setNewPwd(genPassword()); setResetDone(false); setShowReset(true); }}
                        className="text-[9px] font-mono px-2 py-0.5 border border-[#B8860B]/40 text-[#FCD116] rounded hover:bg-[#B8860B]/15 transition-colors">
                        Réinitialiser
                      </button>
                    </div>
                  </div>
                  {credRows.map(c => (
                    <div key={c.key}>
                      <p className="text-[9px] font-mono text-white/25 uppercase mb-0.5">{c.label}</p>
                      <div className="flex items-center gap-1.5 bg-white/3 rounded px-2 py-1.5">
                        <span className="text-[10px] font-mono text-white/60 flex-1 truncate">
                          {c.mask ? "••••••••••••" : c.value}
                        </span>
                        {c.mask && (
                          <button onClick={() => navigator.clipboard?.writeText(c.value)} title="Copier (valeur réelle)" className="text-white/15 hover:text-white/50 transition-colors">
                            <Eye size={10} />
                          </button>
                        )}
                        <button onClick={() => copyText(c.value, c.key)} className="text-white/20 hover:text-white transition-colors shrink-0">
                          {copied === c.key ? <Check size={10} className="text-[#009460]" /> : <Copy size={10} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Actions */}
            <div className="bg-white/3 border border-white/8 rounded-[3px] p-4 space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3">Actions rapides</p>
              {selected.status === "trial" && (
                <button onClick={() => { setTenants(p => p.map(t => t.id === selected.id ? { ...t, status: "active", plan: "pro", mrr: 5000000, trialEndsAt: undefined } : t)); setSelected(prev => prev ? { ...prev, status: "active", plan: "pro", mrr: 5000000 } : null); }}
                  className="w-full py-2.5 text-[11px] font-mono font-semibold rounded-[3px] text-center transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #009460, #006640)", color: "white" }}>
                  Convertir en Pro
                </button>
              )}
              {selected.status === "active" && (
                <button onClick={() => { setTenants(p => p.map(t => t.id === selected.id ? { ...t, status: "suspended" } : t)); setSelected(prev => prev ? { ...prev, status: "suspended" } : null); }}
                  className="w-full py-2 text-[11px] font-mono rounded-[3px] text-center border border-[#CE1126]/30 text-[#CE1126] hover:bg-[#CE1126]/10 transition-all">
                  Suspendre le workspace
                </button>
              )}
              {selected.status === "suspended" && (
                <button onClick={() => { setTenants(p => p.map(t => t.id === selected.id ? { ...t, status: "active" } : t)); setSelected(prev => prev ? { ...prev, status: "active" } : null); }}
                  className="w-full py-2 text-[11px] font-mono rounded-[3px] text-center border border-[#009460]/30 text-[#009460] hover:bg-[#009460]/10 transition-all">
                  Réactiver
                </button>
              )}
              <button onClick={() => { setCreds(p => ({ ...p, [selected.id]: { ...(p[selected.id] ?? { login: selected.email, password: "", apiKey: "" }), apiKey: genApiKey(selected.id) } })); }}
                className="w-full py-2 text-[11px] font-mono rounded-[3px] text-center border border-white/10 text-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-1.5">
                <RefreshCw size={10} /> Régénérer clé API
              </button>
              <button onClick={() => {
                const data = JSON.stringify({ workspace: selected, exportedAt: new Date().toISOString() }, null, 2);
                const blob = new Blob([data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = `workspace-${selected.id}.json`; a.click(); URL.revokeObjectURL(url);
              }} className="w-full py-2 text-[11px] font-mono rounded-[3px] text-center border border-white/10 text-white/40 hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-1.5">
                <Download size={10} /> Exporter les données
              </button>
            </div>

            {/* Reset password modal */}
            {showReset && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#0A1628] border border-white/10 rounded-[4px] w-full max-w-sm shadow-2xl">
                  <div className="h-[3px] bg-[#FCD116] rounded-t-[4px]" />
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white text-base font-light" style={{ fontFamily: "'Crimson Pro', serif" }}>Réinitialiser le mot de passe</h3>
                        <p className="text-white/35 text-[10px] font-mono mt-0.5">{selected.commune} — {selected.email}</p>
                      </div>
                      <button onClick={() => setShowReset(false)} className="text-white/30 hover:text-white p-1"><X size={16} /></button>
                    </div>
                    {resetDone ? (
                      <div className="text-center space-y-3 py-2">
                        <CheckCircle2 size={32} className="text-[#009460] mx-auto" />
                        <p className="text-[#009460] text-[12px] font-mono font-semibold">Mot de passe mis à jour</p>
                        <div className="bg-white/4 border border-white/10 rounded px-3 py-2 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono text-[#FCD116]">{newPwd}</span>
                          <button onClick={() => copyText(newPwd, "reset-pwd")} className="text-white/30 hover:text-white">
                            {copied === "reset-pwd" ? <Check size={12} className="text-[#009460]" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <p className="text-[9px] font-mono text-white/25">Copiez et transmettez ce mot de passe au client de manière sécurisée.</p>
                        <button onClick={() => setShowReset(false)} className="w-full py-2.5 text-[11px] font-mono font-semibold rounded-[3px] border border-white/15 text-white hover:bg-white/6 transition-all">Fermer</button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[9px] font-mono uppercase tracking-widest text-white/35 mb-1.5">Nouveau mot de passe</label>
                          <div className="flex gap-2">
                            <input className="flex-1 px-3 py-2 text-[12px] bg-white/5 border border-white/12 rounded-[3px] text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#FCD116]/30"
                              value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                            <button type="button" onClick={() => setNewPwd(genPassword())}
                              className="px-3 py-2 text-[9px] font-mono border border-white/10 rounded-[3px] text-white/40 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap">
                              <RefreshCw size={10} />
                            </button>
                          </div>
                        </div>
                        <p className="text-[9px] font-mono text-white/25">Le nouveau mot de passe remplacera immédiatement les identifiants actuels du workspace.</p>
                        <button onClick={() => { if (!newPwd) return; setCreds(p => ({ ...p, [selected.id]: { ...(p[selected.id] ?? { login: selected.email, apiKey: genApiKey(selected.id) }), password: newPwd } })); setResetDone(true); }}
                          className="w-full py-2.5 text-[11px] font-mono font-semibold rounded-[3px] transition-all hover:opacity-90"
                          style={{ background: "linear-gradient(135deg, #B8860B, #7A5500)", color: "white" }}>
                          Confirmer la réinitialisation
                        </button>
                        <button onClick={() => setShowReset(false)} className="w-full py-2 text-[11px] font-mono text-white/35 hover:text-white transition-colors">Annuler</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Create session modal */}
            {showSession && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#0A1628] border border-white/10 rounded-[4px] w-full max-w-sm shadow-2xl">
                  <div className="h-[3px] bg-[#4A9FFF] rounded-t-[4px]" />
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white text-base font-light" style={{ fontFamily: "'Crimson Pro', serif" }}>Créer une session d{"'"}accès</h3>
                        <p className="text-white/35 text-[10px] font-mono mt-0.5">{selected.commune} — Nouvel identifiant admin</p>
                      </div>
                      <button onClick={() => setShowSession(false)} className="text-white/30 hover:text-white p-1"><X size={16} /></button>
                    </div>
                    {sessionDone ? (
                      <div className="text-center space-y-3 py-2">
                        <CheckCircle2 size={32} className="text-[#4A9FFF] mx-auto" />
                        <p className="text-[#4A9FFF] text-[12px] font-mono font-semibold">Session créée avec succès</p>
                        {[{ label: "Login", val: newLogin }, { label: "Mot de passe", val: newPwd || "admin@123" }].map(r => (
                          <div key={r.label} className="bg-white/4 border border-white/10 rounded px-3 py-2 flex items-center justify-between gap-2 text-left">
                            <div>
                              <p className="text-[9px] font-mono text-white/30 uppercase">{r.label}</p>
                              <p className="text-[11px] font-mono text-[#FCD116]">{r.val}</p>
                            </div>
                            <button onClick={() => copyText(r.val, `session-${r.label}`)} className="text-white/30 hover:text-white shrink-0">
                              {copied === `session-${r.label}` ? <Check size={12} className="text-[#009460]" /> : <Copy size={12} />}
                            </button>
                          </div>
                        ))}
                        <p className="text-[9px] font-mono text-white/25">Transmettez ces identifiants au client de façon sécurisée.</p>
                        <button onClick={() => setShowSession(false)} className="w-full py-2.5 text-[11px] font-mono font-semibold rounded-[3px] border border-white/15 text-white hover:bg-white/6 transition-all">Fermer</button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[9px] font-mono uppercase tracking-widest text-white/35 mb-1.5">Identifiant (login)</label>
                          <input className="w-full px-3 py-2 text-[12px] bg-white/5 border border-white/12 rounded-[3px] text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#4A9FFF]/30"
                            value={newLogin} onChange={e => setNewLogin(e.target.value)} placeholder={`admin@${selected.id}.gn`} />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono uppercase tracking-widest text-white/35 mb-1.5">Mot de passe</label>
                          <div className="flex gap-2">
                            <input className="flex-1 px-3 py-2 text-[12px] bg-white/5 border border-white/12 rounded-[3px] text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#4A9FFF]/30"
                              value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Laisser vide = admin@123" />
                            <button type="button" onClick={() => setNewPwd(genPassword())} className="px-2.5 py-2 text-[9px] border border-white/10 rounded-[3px] text-white/35 hover:text-white hover:bg-white/5 transition-all">
                              <RefreshCw size={10} />
                            </button>
                          </div>
                        </div>
                        <p className="text-[9px] font-mono text-white/25">Cette session remplace les identifiants actuels du workspace.</p>
                        <button onClick={() => { setCreds(p => ({ ...p, [selected.id]: { login: newLogin || selected.email, password: newPwd || "admin@123", apiKey: (p[selected.id]?.apiKey ?? genApiKey(selected.id)) } })); setSessionDone(true); }}
                          className="w-full py-2.5 text-[11px] font-mono font-semibold rounded-[3px] transition-all hover:opacity-90"
                          style={{ background: "linear-gradient(135deg, #1B3A6B, #0E1F3D)", color: "white" }}>
                          Créer la session
                        </button>
                        <button onClick={() => setShowSession(false)} className="w-full py-2 text-[11px] font-mono text-white/35 hover:text-white transition-colors">Annuler</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hierarchy banner */}
      <div className="flex items-center gap-4 p-3 bg-[#1B3A6B]/15 border border-[#1B3A6B]/25 rounded-[3px]">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-[#4A9FFF]" />
          <span className="text-[11px] font-mono text-white/70 font-semibold">Structure hiérarchique</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-white/45">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#8B0A5A]" /> {prefectures.length} Préfectures — voient toutes leurs communes</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#1B3A6B]" /> {communes.length} Communes — entités indépendantes</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
          <input className="w-full pl-9 pr-3.5 py-2 text-[12px] bg-white/4 border border-white/10 rounded-[3px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]/50 font-mono"
            value={search} onChange={e => setSearch(e.target.value)} placeholder="Chercher workspace…" />
        </div>
        <div className="flex gap-1">
          {(["all", "prefecture", "commune"] as const).map(f => (
            <button key={f} onClick={() => setTypeFilter(f)}
              className={`text-[10px] font-mono px-2.5 py-1.5 rounded-[2px] border transition-colors ${typeFilter === f ? "bg-[#1B3A6B]/30 border-[#1B3A6B]/50 text-white" : "border-white/8 text-white/40 hover:border-white/20 hover:text-white/70"}`}>
              {f === "all" ? "Tous" : f === "prefecture" ? "Préfectures" : "Communes"}
            </button>
          ))}
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-mono font-semibold rounded-[3px] transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #CE1126 0%, #8B0A1A 100%)", color: "white" }}>
          <Plus size={13} /> Nouveau workspace
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map(t => {
          const isPref = t.tenantType === "prefecture";
          const childCommunes = isPref ? communes.filter(c => c.prefectureId === t.id) : [];
          const parentPref = !isPref && t.prefectureId ? tenants.find(p => p.id === t.prefectureId) : null;
          return (
            <div key={t.id} onClick={() => { setSelected(t); setView("detail"); }}
              className={`border rounded-[3px] p-4 hover:bg-white/5 transition-all cursor-pointer group ${isPref ? "bg-[#8B0A5A]/8 border-[#8B0A5A]/25 hover:border-[#8B0A5A]/40" : "bg-white/3 border-white/8 hover:border-white/14"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-[2px] border flex items-center justify-center text-sm font-bold text-white ${isPref ? "bg-gradient-to-br from-[#8B0A5A]/60 to-[#CE1126]/40 border-[#8B0A5A]/30" : "bg-gradient-to-br from-[#CE1126]/30 to-[#1B3A6B]/30 border-white/8"}`}>
                    {isPref ? <Shield size={14} className="text-[#FFB0CC]" /> : t.commune.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[13px] font-medium text-white leading-tight">{t.commune}</p>
                      {isPref && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#8B0A5A]/30 text-[#FFB0CC] border border-[#8B0A5A]/30">Préfecture</span>}
                    </div>
                    <p className="text-[9px] font-mono text-white/30">{t.id}.platform-snrr.com</p>
                    {parentPref && <p className="text-[9px] font-mono text-[#8B0A5A]/70 mt-0.5">↑ {parentPref.commune}</p>}
                  </div>
                </div>
                <StatusBadge status={t.status} />
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: isPref ? "Communes" : "Agents", value: isPref ? String(childCommunes.length) : String(t.agents) },
                  { label: "Contribuables", value: t.contribuables > 0 ? `${(t.contribuables / 1000).toFixed(1)}K` : "—" },
                  { label: "MRR", value: t.mrr > 0 ? `${(t.mrr / 1_000_000).toFixed(1)}M` : "Essai" },
                ].map(s => (
                  <div key={s.label} className="text-center bg-white/3 rounded-[2px] p-1.5">
                    <p className={`text-[11px] font-bold font-mono ${isPref ? "text-[#FFB0CC]" : "text-white"}`}>{s.value}</p>
                    <p className="text-[8px] font-mono text-white/25 uppercase">{s.label}</p>
                  </div>
                ))}
              </div>

              {isPref && childCommunes.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {childCommunes.slice(0, 4).map(c => (
                    <span key={c.id} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/4 text-white/40 border border-white/6">{c.commune}</span>
                  ))}
                  {childCommunes.length > 4 && <span className="text-[9px] font-mono text-white/25">+{childCommunes.length - 4}</span>}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlanBadge plan={t.plan} />
                  {t.status === "trial" && (
                    <span className="text-[9px] font-mono text-[#FCD116]/70">{trialDaysLeft(t)}j restants</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCardResetTenant(t);
                      setCardResetPwd(genPassword());
                      setCardResetDone(false);
                      setCardCopied(false);
                    }}
                    title="Réinitialiser MDP admin"
                    className="opacity-0 group-hover:opacity-100 transition-all p-1 rounded bg-[#FCD116]/10 text-[#FCD116]/60 hover:bg-[#FCD116]/20 hover:text-[#FCD116]">
                    <Lock size={10} />
                  </button>
                  <span className="text-[10px] font-mono text-white/20 group-hover:text-white/50 transition-colors flex items-center gap-1">
                    Gérer <ChevronRight size={10} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-white/25 text-[12px] font-mono">
          <Layers size={24} className="mx-auto mb-3 opacity-30" />
          Aucun workspace trouvé
        </div>
      )}

      {/* Card-level quick reset password modal */}
      {cardResetTenant && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A1628] border border-white/10 rounded-[4px] w-full max-w-sm shadow-2xl">
            <div className="h-[3px] bg-[#FCD116] rounded-t-[4px]" />
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white text-base font-light" style={{ fontFamily: "'Crimson Pro', serif" }}>Réinitialiser MDP administrateur</h3>
                  <p className="text-white/35 text-[10px] font-mono mt-0.5">{cardResetTenant.commune} — {cardResetTenant.email}</p>
                </div>
                <button onClick={() => setCardResetTenant(null)} className="text-white/30 hover:text-white p-1"><X size={16} /></button>
              </div>

              {cardResetDone ? (
                <div className="text-center space-y-3 py-2">
                  <CheckCircle2 size={32} className="text-[#009460] mx-auto" />
                  <p className="text-[#009460] text-[12px] font-mono font-semibold">Mot de passe mis à jour</p>
                  <div className="bg-white/4 border border-white/10 rounded px-3 py-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-[#FCD116]">{cardResetPwd}</span>
                    <button onClick={() => { navigator.clipboard.writeText(cardResetPwd); setCardCopied(true); }}
                      className="text-white/30 hover:text-white transition-colors">
                      {cardCopied ? <Check size={12} className="text-[#009460]" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <p className="text-[9px] font-mono text-white/25">Copiez et transmettez ce mot de passe au client de manière sécurisée.</p>
                  <button onClick={() => setCardResetTenant(null)}
                    className="w-full py-2.5 text-[11px] font-mono font-semibold rounded-[3px] border border-white/15 text-white hover:bg-white/6 transition-all">
                    Fermer
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-white/3 border border-white/8 rounded-[3px]">
                    <p className="text-[9px] font-mono text-white/35 uppercase mb-1">Identifiant actuel</p>
                    <p className="text-[11px] font-mono text-white/60">{creds[cardResetTenant.id]?.login ?? cardResetTenant.email}</p>
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-widest text-white/35 mb-1.5">Nouveau mot de passe</label>
                    <div className="flex gap-2">
                      <input className="flex-1 px-3 py-2 text-[12px] bg-white/5 border border-white/12 rounded-[3px] text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#FCD116]/30"
                        value={cardResetPwd} onChange={e => setCardResetPwd(e.target.value)} />
                      <button type="button" onClick={() => setCardResetPwd(genPassword())}
                        className="px-3 py-2 text-[9px] font-mono border border-white/10 rounded-[3px] text-white/40 hover:text-white hover:bg-white/5 transition-all">
                        <RefreshCw size={10} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[9px] font-mono text-white/25">Le nouveau mot de passe remplacera immédiatement les identifiants actuels du workspace.</p>
                  <button
                    onClick={() => {
                      if (!cardResetPwd) return;
                      setCreds(p => ({ ...p, [cardResetTenant.id]: { ...(p[cardResetTenant.id] ?? { login: cardResetTenant.email, apiKey: genApiKey(cardResetTenant.id) }), password: cardResetPwd } }));
                      setCardResetDone(true);
                    }}
                    className="w-full py-2.5 text-[11px] font-mono font-semibold rounded-[3px] transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #B8860B, #7A5500)", color: "white" }}>
                    Confirmer la réinitialisation
                  </button>
                  <button onClick={() => setCardResetTenant(null)} className="w-full py-2 text-[11px] font-mono text-white/35 hover:text-white transition-colors">Annuler</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create workspace modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A1628] border border-white/10 rounded-[4px] w-full max-w-md shadow-2xl">
            <div className="h-[3px] flex rounded-t-[4px] overflow-hidden">
              <div className="flex-1 bg-[#CE1126]" /><div className="flex-1 bg-[#FCD116]" /><div className="flex-1 bg-[#009460]" />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-lg font-light" style={{ fontFamily: "'Crimson Pro', serif" }}>Nouveau workspace</h3>
                <button onClick={() => setShowCreate(false)} className="text-white/30 hover:text-white transition-colors"><X size={18} /></button>
              </div>

              <div className="space-y-3">
                {/* Type selector */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Type d{"'"}entité</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["commune", "prefecture"] as const).map(t => (
                      <button key={t} type="button" onClick={() => setCreateForm(f => ({ ...f, tenantType: t, plan: t === "prefecture" ? "enterprise" : f.plan }))}
                        className={`py-2.5 text-[11px] font-mono rounded-[3px] border transition-all flex items-center justify-center gap-1.5 ${createForm.tenantType === t ? (t === "prefecture" ? "bg-[#8B0A5A]/20 border-[#8B0A5A]/50 text-[#FFB0CC]" : "bg-[#1B3A6B]/20 border-[#1B3A6B]/50 text-white") : "border-white/10 text-white/35 hover:border-white/20 hover:text-white/60"}`}>
                        {t === "prefecture" ? <><Shield size={11} /> Préfecture</> : <><Building2 size={11} /> Commune</>}
                      </button>
                    ))}
                  </div>
                  {createForm.tenantType === "prefecture" && (
                    <p className="text-[9px] font-mono text-[#FFB0CC]/60 mt-1.5 flex items-center gap-1"><Shield size={9} /> La préfecture accédera aux données de toutes ses communes</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">{createForm.tenantType === "prefecture" ? "Nom de la préfecture" : "Commune"} *</label>
                  <input className={inp} value={createForm.commune} onChange={e => setCreateForm(f => ({ ...f, commune: e.target.value }))} placeholder={createForm.tenantType === "prefecture" ? "Préfecture de Kindia" : "Commune de Kindia"} autoFocus />
                  {createForm.commune.length >= 2 && (
                    <p className="text-[9px] font-mono text-[#FCD116]/60 mt-1">{toId(createForm.commune)}.platform-snrr.com</p>
                  )}
                </div>
                {createForm.tenantType === "commune" && prefectures.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Préfecture parente (optionnel)</label>
                    <select className={inp} value={createForm.prefectureId} onChange={e => setCreateForm(f => ({ ...f, prefectureId: e.target.value }))}>
                      <option value="">Aucune (commune indépendante)</option>
                      {prefectures.map(p => <option key={p.id} value={p.id}>{p.commune}</option>)}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Pays</label>
                    <select className={inp} value={createForm.country} onChange={e => setCreateForm(f => ({ ...f, country: e.target.value }))}>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Plan</label>
                    <select className={inp} value={createForm.plan} onChange={e => setCreateForm(f => ({ ...f, plan: e.target.value as Plan }))} disabled={createForm.tenantType === "prefecture"}>
                      <option value="trial">Essai 14j</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Préfecture</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Contact principal *</label>
                  <input className={inp} value={createForm.contact} onChange={e => setCreateForm(f => ({ ...f, contact: e.target.value }))} placeholder="Nom du responsable" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Email admin *</label>
                  <input className={inp} type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} placeholder="admin@commune.gov.gn" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Agents autorisés</label>
                  <input className={inp} type="number" min="1" value={createForm.agents} onChange={e => setCreateForm(f => ({ ...f, agents: e.target.value }))} />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 text-[11px] font-mono border border-white/10 rounded-[3px] text-white/40 hover:bg-white/5 transition-all">
                  Annuler
                </button>
                <button onClick={createWorkspace} disabled={createLoading || !createForm.commune || !createForm.email}
                  className="flex-1 py-2.5 text-[12px] font-mono font-semibold rounded-[3px] flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #CE1126 0%, #8B0A1A 100%)", color: "white" }}>
                  {createLoading ? <><RefreshCw size={12} className="animate-spin" /> Création…</> : <>Créer le workspace <ChevronRight size={12} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SuperAdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    setTimeout(() => {
      const validLogin = ["admin@snrr-platform.gn", "SuperAdmin", "Superadmin"].includes(email.trim());
      const validPwd = ["Superadmin@snrr27", "SaasAdmin@snrr27"].includes(password);
      if (validLogin && validPwd) onLogin();
      else { setError("Identifiants incorrects."); setLoading(false); }
    }, 800);
  };

  const inp = "w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/12 rounded-[3px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]/60 font-mono transition-colors";

  return (
    <div className="min-h-screen bg-[#060E1C] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <PlatformLogoMark size={64} />
          <div className="mt-4 text-center">
            <h1 className="text-white text-2xl font-light mb-1" style={{ fontFamily: "'Crimson Pro', serif" }}>Administration</h1>
            <p className="text-white/35 text-[10px] font-mono uppercase tracking-[0.2em]">Accès restreint · Super Admin</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/45 mb-1.5">Identifiant</label>
            <input className={inp} value={email} onChange={e => setEmail(e.target.value)} placeholder="superadmin" autoFocus autoComplete="off" />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-white/45 mb-1.5">Mot de passe</label>
            <input className={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          </div>
          {error && <p className="text-[11px] text-red-400 font-mono flex items-center gap-1.5"><AlertTriangle size={10} />{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 text-sm font-mono font-semibold rounded-[3px] flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #0E1F3D 100%)", color: "white" }}>
            {loading ? <><RefreshCw size={13} className="animate-spin" /> Connexion…</> : <>Accéder <ChevronRight size={13} /></>}
          </button>
          <p className="text-center text-[9px] font-mono text-white/12">Accès restreint — PLATFORM SNRR Administration</p>
        </form>
      </div>
    </div>
  );
}

// ─── Dashboard tab ─────────────────────────────────────────────────────────────

function DashboardTab({ tenants, invoices }: { tenants: Tenant[]; invoices: Invoice[] }) {
  const communes = tenants.filter(t => t.tenantType !== "prefecture");
  const prefectures = tenants.filter(t => t.tenantType === "prefecture");
  const active = communes.filter(t => t.status === "active").length;
  const trial = communes.filter(t => t.status === "trial").length;
  const mrr = tenants.reduce((s, t) => s + t.mrr, 0);
  const overdue = invoices.filter(i => i.status === "overdue").length;

  const monthlyRevenue = [
    { m: "Jan", v: 65000000 }, { m: "Fév", v: 80000000 }, { m: "Mar", v: 95000000 },
    { m: "Avr", v: 105000000 }, { m: "Mai", v: 110000000 }, { m: "Jun", v: mrr },
  ];
  const maxRev = Math.max(...monthlyRevenue.map(m => m.v));

  const byCountry = Object.entries(communes.reduce((acc, t) => {
    acc[t.country] = (acc[t.country] ?? 0) + 1; return acc;
  }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]);

  const kpis = [
    { label: "Communes actives", value: communes.length, icon: Building2, color: "#1B3A6B", delta: "+3 ce mois", up: true },
    { label: "Préfectures", value: prefectures.length, icon: Shield, color: "#8B0A5A", delta: "Vue consolidée", up: true },
    { label: "En essai", value: trial, icon: Clock, color: "#FCD116", delta: "14j max", up: false },
    { label: "MRR consolidé", value: fmtGnf(mrr), icon: TrendingUp, color: "#CE1126", delta: "+12% vs mai", up: true },
    { label: "Factures en retard", value: overdue, icon: AlertTriangle, color: "#B8860B", delta: "Action requise", up: false },
    { label: "Agents totaux", value: communes.reduce((s, t) => s + t.agents, 0), icon: Users, color: "#4A6B8A", delta: "+15 ce mois", up: true },
  ];

  return (
    <div className="space-y-6">
      {/* Hierarchy summary */}
      <div className="bg-[#1B3A6B]/10 border border-[#1B3A6B]/20 rounded-[3px] p-4">
        <p className="text-[9px] font-mono uppercase tracking-widest text-white/35 mb-3">Structure hiérarchique de souscription</p>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#8B0A5A]/20 border border-[#8B0A5A]/30 flex items-center justify-center"><Shield size={14} className="text-[#FFB0CC]" /></div>
            <div>
              <p className="text-[13px] font-bold text-white font-mono">{prefectures.length}</p>
              <p className="text-[9px] font-mono text-[#FFB0CC]/70">Préfectures</p>
            </div>
          </div>
          <div className="flex-1 h-px bg-white/8 relative">
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-mono text-white/25 bg-[#0A1628] px-1">accès aux données de</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#1B3A6B]/20 border border-[#1B3A6B]/30 flex items-center justify-center"><Building2 size={14} className="text-[#4A9FFF]" /></div>
            <div>
              <p className="text-[13px] font-bold text-white font-mono">{communes.length}</p>
              <p className="text-[9px] font-mono text-[#4A9FFF]/70">Communes</p>
            </div>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] font-mono text-white/35">Chaque commune souscrit indépendamment.</p>
            <p className="text-[10px] font-mono text-white/35">Quand une préfecture souscrit, elle voit toutes ses communes.</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white/3 border border-white/8 rounded-[3px] p-5 hover:bg-white/5 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-[2px] flex items-center justify-center" style={{ background: `${k.color}15` }}>
                <k.icon size={14} style={{ color: k.color }} />
              </div>
              <span className={`text-[10px] font-mono flex items-center gap-0.5 ${k.up ? "text-[#009460]" : "text-[#CE1126]"}`}>
                {k.up ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
                {k.delta}
              </span>
            </div>
            <p className="text-2xl font-bold text-white font-mono">{String(k.value)}</p>
            <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="col-span-2 bg-white/3 border border-white/8 rounded-[3px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-0.5">Revenus mensuels</p>
              <p className="text-white text-sm font-medium">Janv – Juin 2024</p>
            </div>
            <span className="text-[10px] font-mono text-[#009460] bg-[#009460]/10 border border-[#009460]/20 px-2 py-0.5 rounded-full">+18% YoY</span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {monthlyRevenue.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-sm transition-all" style={{
                  height: `${(m.v / maxRev) * 80}px`,
                  background: i === monthlyRevenue.length - 1 ? "linear-gradient(180deg, #CE1126, #8B0A1A)" : "#1B3A6B",
                  opacity: i === monthlyRevenue.length - 1 ? 1 : 0.6 + i * 0.06,
                }} />
                <span className="text-[9px] font-mono text-white/30">{m.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By country */}
        <div className="bg-white/3 border border-white/8 rounded-[3px] p-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-4">Par pays</p>
          <div className="space-y-3">
            {byCountry.map(([country, count]) => (
              <div key={country}>
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="text-white/60">{country}</span>
                  <span className="text-white font-bold">{count}</span>
                </div>
                <div className="h-1 bg-white/6 rounded-full overflow-hidden">
                  <div className="h-1 bg-[#CE1126] rounded-full" style={{ width: `${(count / tenants.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white/3 border border-white/8 rounded-[3px] p-5">
        <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-4">Activité récente</p>
        <div className="space-y-2.5">
          {[
            { icon: CheckCircle2, color: "#009460", text: "Conakry CU — Paiement reçu 500 000 GNF", time: "il y a 2h" },
            { icon: Clock, color: "#FCD116", text: "Abidjan Yopougon — Inscription en attente de validation", time: "il y a 4h" },
            { icon: AlertTriangle, color: "#CE1126", text: "Nzérékoré Préfecture — Facture INV-2024-0152 en retard", time: "il y a 6h" },
            { icon: Building2, color: "#4A6B8A", text: "Kindia Fiscale — 4 jours restants dans l'essai", time: "il y a 8h" },
            { icon: Users, color: "#1B3A6B", text: "Dakar Arrondissement 3 — 15 agents actifs", time: "il y a 12h" },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/4 last:border-0">
              <a.icon size={13} style={{ color: a.color }} className="shrink-0" />
              <p className="text-[12px] font-mono text-white/60 flex-1">{a.text}</p>
              <span className="text-[10px] font-mono text-white/25 shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Clients tab ───────────────────────────────────────────────────────────────

function ClientsTab({ tenants, setTenants }: { tenants: Tenant[]; setTenants: React.Dispatch<React.SetStateAction<Tenant[]>> }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [selected, setSelected] = useState<Tenant | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ commune: "", country: "Guinée", contact: "", email: "", plan: "trial" as Plan, agents: "5" });
  const [addLoading, setAddLoading] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [showInvGen, setShowInvGen] = useState(false);
  const [invGenDone, setInvGenDone] = useState(false);
  const [invRef, setInvRef] = useState("");
  const COUNTRIES_C = ["Guinée", "Sénégal", "Côte d'Ivoire", "Mali", "Burkina Faso", "Niger", "Bénin", "Togo", "Cameroun", "Madagascar", "RDC"];
  const toIdC = (name: string) => name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").slice(0, 32) || "workspace";
  const addClient = () => {
    if (!addForm.commune || !addForm.email) return;
    setAddLoading(true);
    setTimeout(() => {
      const id = toIdC(addForm.commune);
      const nt: Tenant = {
        id, commune: addForm.commune, country: addForm.country, contact: addForm.contact,
        email: addForm.email, phone: "", plan: addForm.plan,
        status: addForm.plan === "trial" ? "trial" : "active",
        agents: Number(addForm.agents), contribuables: 0,
        mrr: addForm.plan === "pro" ? 5000000 : addForm.plan === "enterprise" ? 25000000 : 0,
        createdAt: new Date().toISOString().slice(0, 10), locale: "fr", features: ["all"],
        trialEndsAt: addForm.plan === "trial" ? new Date(Date.now() + 14 * 864e5).toISOString() : undefined,
        nextBilling: addForm.plan !== "trial" ? new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10) : undefined,
      };
      setTenants(prev => [nt, ...prev]);
      setAddLoading(false);
      setShowAdd(false);
      setAddForm({ commune: "", country: "Guinée", contact: "", email: "", plan: "trial", agents: "5" });
    }, 1000);
  };

  const [typeFilter, setTypeFilter] = useState<"all" | "commune" | "prefecture">("all");

  const filtered = tenants.filter(t => {
    const q = search.toLowerCase();
    const matchQ = t.commune.toLowerCase().includes(q) || t.country.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
    const matchS = filterStatus === "all" || t.status === filterStatus;
    const matchType = typeFilter === "all" || (typeFilter === "prefecture" ? t.tenantType === "prefecture" : t.tenantType !== "prefecture");
    return matchQ && matchS && matchType;
  });

  const toggleStatus = (tenant: Tenant, newStatus: Status) => {
    setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, status: newStatus } : t));
    if (selected?.id === tenant.id) setSelected(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const trialDaysLeft = (t: Tenant) => {
    if (!t.trialEndsAt) return 0;
    return Math.max(0, Math.ceil((new Date(t.trialEndsAt).getTime() - Date.now()) / 864e5));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
          <input className="w-full pl-9 pr-3.5 py-2 text-[12px] bg-white/4 border border-white/10 rounded-[3px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]/50 font-mono"
            value={search} onChange={e => setSearch(e.target.value)} placeholder="Chercher commune, préfecture, pays, email…" />
        </div>
        <div className="flex gap-1">
          {(["all", "prefecture", "commune"] as const).map(f => (
            <button key={f} onClick={() => setTypeFilter(f)}
              className={`text-[10px] font-mono px-2.5 py-1.5 rounded-[2px] border transition-colors ${typeFilter === f ? "bg-[#8B0A5A]/25 border-[#8B0A5A]/45 text-[#FFB0CC]" : "border-white/8 text-white/40 hover:border-white/20 hover:text-white/70"}`}>
              {f === "all" ? "Tous" : f === "prefecture" ? "Préfectures" : "Communes"}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(["all","active","trial","suspended"] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`text-[10px] font-mono px-2.5 py-1.5 rounded-[2px] border transition-colors ${filterStatus === s ? "bg-[#1B3A6B]/30 border-[#1B3A6B]/50 text-white" : "border-white/8 text-white/40 hover:border-white/20 hover:text-white/70"}`}>
              {s === "all" ? "Statut: tous" : STATUS_COLORS[s].label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-mono font-semibold rounded-[3px] transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #CE1126 0%, #8B0A1A 100%)", color: "white" }}>
          <Plus size={13} /> Nouveau client
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/3 border border-white/8 rounded-[3px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6">
                {["Entité", "Pays", "Plan", "Statut", "Agents", "Contribuables", "MRR", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[9px] font-mono uppercase tracking-widest text-white/35">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const isPref = t.tenantType === "prefecture";
                return (
                <tr key={t.id} className={`border-b border-white/4 last:border-0 transition-colors ${isPref ? "hover:bg-[#8B0A5A]/8 bg-[#8B0A5A]/4" : "hover:bg-white/3"}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      {isPref && <Shield size={12} className="text-[#FFB0CC] shrink-0 mt-0.5" />}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[12px] font-medium text-white">{t.commune}</p>
                          {isPref && <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-[#8B0A5A]/25 text-[#FFB0CC] border border-[#8B0A5A]/20">Préfecture</span>}
                        </div>
                        <p className="text-[10px] font-mono text-white/35">{t.email}</p>
                        {t.region && <p className="text-[9px] font-mono text-white/20">{t.region}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-mono text-white/50">{t.country}</span>
                  </td>
                  <td className="px-4 py-3"><PlanBadge plan={t.plan} /></td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <StatusBadge status={t.status} />
                      {t.status === "trial" && (
                        <p className="text-[9px] font-mono text-[#FCD116]/70">{trialDaysLeft(t)}j restants</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="text-[12px] font-mono text-white/70">{t.agents}</span></td>
                  <td className="px-4 py-3"><span className="text-[12px] font-mono text-white/70">{t.contribuables.toLocaleString("fr-FR")}</span></td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-mono" style={{ color: t.mrr > 0 ? "#009460" : "rgba(255,255,255,0.3)" }}>
                      {t.mrr > 0 ? fmtGnf(t.mrr) : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setSelected(t)} className="p-1.5 text-white/30 hover:text-white transition-colors" title="Voir détails"><Eye size={13} /></button>
                      {t.status === "active" && (
                        <button onClick={() => toggleStatus(t, "suspended")} className="p-1.5 text-[#CE1126]/50 hover:text-[#CE1126] transition-colors" title="Suspendre"><Pause size={13} /></button>
                      )}
                      {t.status === "suspended" && (
                        <button onClick={() => toggleStatus(t, "active")} className="p-1.5 text-[#009460]/50 hover:text-[#009460] transition-colors" title="Réactiver"><Play size={13} /></button>
                      )}
                      {t.status === "trial" && (
                        <button onClick={() => toggleStatus(t, "active")} className="p-1.5 text-[#FCD116]/50 hover:text-[#FCD116] transition-colors" title="Convertir en Pro"><Zap size={13} /></button>
                      )}
                      {t.status === "pending" && (
                        <button onClick={() => toggleStatus(t, "trial")} className="p-1.5 text-[#009460]/50 hover:text-[#009460] transition-colors" title="Valider"><Check size={13} /></button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-white/25 text-[12px] font-mono">Aucun client trouvé</div>
        )}
      </div>

      {/* New client modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A1628] border border-white/10 rounded-[4px] w-full max-w-md shadow-2xl">
            <div className="h-[3px] flex rounded-t-[4px] overflow-hidden">
              <div className="flex-1 bg-[#CE1126]"/><div className="flex-1 bg-[#FCD116]"/><div className="flex-1 bg-[#009460]"/>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-lg font-light" style={{ fontFamily: "'Crimson Pro', serif" }}>Nouveau client</h3>
                <button onClick={() => setShowAdd(false)} className="text-white/30 hover:text-white transition-colors"><X size={18} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Commune / Préfecture *</label>
                  <input className="w-full px-3 py-2 text-[12px] bg-white/4 border border-white/10 rounded-[3px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]/50 font-mono" value={addForm.commune} onChange={e => setAddForm(f => ({ ...f, commune: e.target.value }))} placeholder="Commune de…" autoFocus />
                  {addForm.commune.length >= 2 && <p className="text-[9px] font-mono text-[#FCD116]/60 mt-1">{toIdC(addForm.commune)}.platform-snrr.com</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Pays</label>
                    <select className="w-full px-3 py-2 text-[12px] bg-white/4 border border-white/10 rounded-[3px] text-white focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]/50 font-mono" value={addForm.country} onChange={e => setAddForm(f => ({ ...f, country: e.target.value }))}>
                      {COUNTRIES_C.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Plan</label>
                    <select className="w-full px-3 py-2 text-[12px] bg-white/4 border border-white/10 rounded-[3px] text-white focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]/50 font-mono" value={addForm.plan} onChange={e => setAddForm(f => ({ ...f, plan: e.target.value as Plan }))}>
                      <option value="trial">Essai 14j</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Préfecture</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Contact principal</label>
                  <input className="w-full px-3 py-2 text-[12px] bg-white/4 border border-white/10 rounded-[3px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]/50 font-mono" value={addForm.contact} onChange={e => setAddForm(f => ({ ...f, contact: e.target.value }))} placeholder="Nom du responsable" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Email admin *</label>
                  <input className="w-full px-3 py-2 text-[12px] bg-white/4 border border-white/10 rounded-[3px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]/50 font-mono" type="email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} placeholder="admin@commune.gov.gn" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Agents autorisés</label>
                  <input className="w-full px-3 py-2 text-[12px] bg-white/4 border border-white/10 rounded-[3px] text-white focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]/50 font-mono" type="number" min="1" value={addForm.agents} onChange={e => setAddForm(f => ({ ...f, agents: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 text-[11px] font-mono border border-white/10 rounded-[3px] text-white/40 hover:bg-white/5 transition-all">Annuler</button>
                <button onClick={addClient} disabled={addLoading || !addForm.commune || !addForm.email}
                  className="flex-1 py-2.5 text-[12px] font-mono font-semibold rounded-[3px] flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #CE1126, #8B0A1A)", color: "white" }}>
                  {addLoading ? <><RefreshCw size={12} className="animate-spin" /> Création…</> : <>Créer le client <ChevronRight size={12} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send email modal */}
      {showEmail && selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A1628] border border-white/10 rounded-[4px] w-full max-w-md shadow-2xl">
            <div className="h-[3px] bg-[#4A9FFF] rounded-t-[4px]" />
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white text-base font-light" style={{ fontFamily: "'Crimson Pro', serif" }}>Envoyer un email</h3>
                  <p className="text-white/35 text-[10px] font-mono mt-0.5">{selected.email}</p>
                </div>
                <button onClick={() => setShowEmail(false)} className="text-white/30 hover:text-white p-1"><X size={16} /></button>
              </div>
              {emailSent ? (
                <div className="text-center space-y-3 py-4">
                  <CheckCircle2 size={32} className="text-[#009460] mx-auto" />
                  <p className="text-[#009460] text-[12px] font-mono font-semibold">Email envoyé avec succès</p>
                  <p className="text-white/40 text-[10px] font-mono">Destinataire : {selected.email}</p>
                  <button onClick={() => setShowEmail(false)} className="w-full py-2.5 text-[11px] font-mono font-semibold rounded-[3px] border border-white/15 text-white hover:bg-white/6 transition-all">Fermer</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-widest text-white/35 mb-1.5">Objet</label>
                    <input className="w-full px-3 py-2 text-[12px] bg-white/5 border border-white/12 rounded-[3px] text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#4A9FFF]/30" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-widest text-white/35 mb-1.5">Message</label>
                    <textarea className="w-full px-3 py-2 text-[12px] bg-white/5 border border-white/12 rounded-[3px] text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#4A9FFF]/30 resize-none" rows={5} value={emailBody} onChange={e => setEmailBody(e.target.value)} />
                  </div>
                  <button onClick={() => setEmailSent(true)}
                    className="w-full py-2.5 text-[11px] font-mono font-semibold rounded-[3px] transition-all hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #1B3A6B, #0E1F3D)", color: "white" }}>
                    <Mail size={12} /> Envoyer
                  </button>
                  <button onClick={() => setShowEmail(false)} className="w-full py-2 text-[11px] font-mono text-white/35 hover:text-white transition-colors">Annuler</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generate invoice modal */}
      {showInvGen && selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A1628] border border-white/10 rounded-[4px] w-full max-w-sm shadow-2xl">
            <div className="h-[3px] bg-[#009460] rounded-t-[4px]" />
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white text-base font-light" style={{ fontFamily: "'Crimson Pro', serif" }}>Générer une facture</h3>
                  <p className="text-white/35 text-[10px] font-mono mt-0.5">{selected.commune} — {PLAN_LABELS[selected.plan]}</p>
                </div>
                <button onClick={() => setShowInvGen(false)} className="text-white/30 hover:text-white p-1"><X size={16} /></button>
              </div>
              {invGenDone ? (
                <div className="text-center space-y-3 py-2">
                  <CheckCircle2 size={32} className="text-[#009460] mx-auto" />
                  <p className="text-[#009460] text-[12px] font-mono font-semibold">Facture générée</p>
                  <div className="bg-white/4 border border-white/10 rounded px-4 py-3 text-left space-y-2">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-white/40">Référence</span><span className="text-[#FCD116]">{invRef}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-white/40">Client</span><span className="text-white">{selected.commune}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-white/40">Montant</span><span className="text-[#009460] font-bold">{fmtGnf(selected.mrr || 5000000)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-white/40">Période</span><span className="text-white/70">{new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span>
                    </div>
                  </div>
                  <p className="text-[9px] font-mono text-white/25">La facture a été enregistrée et un email a été envoyé au client.</p>
                  <button onClick={() => setShowInvGen(false)} className="w-full py-2.5 text-[11px] font-mono font-semibold rounded-[3px] border border-white/15 text-white hover:bg-white/6 transition-all">Fermer</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white/3 border border-white/8 rounded px-4 py-3 space-y-2">
                    {[
                      { l: "Client", v: selected.commune },
                      { l: "Plan", v: PLAN_LABELS[selected.plan] },
                      { l: "Montant", v: fmtGnf(selected.mrr || 5000000) },
                      { l: "Période", v: new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) },
                      { l: "Référence", v: invRef },
                    ].map(r => (
                      <div key={r.l} className="flex justify-between text-[11px] font-mono">
                        <span className="text-white/35">{r.l}</span><span className="text-white/70">{r.v}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setInvGenDone(true)}
                    className="w-full py-2.5 text-[11px] font-mono font-semibold rounded-[3px] transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #009460, #006640)", color: "white" }}>
                    Confirmer et envoyer
                  </button>
                  <button onClick={() => setShowInvGen(false)} className="w-full py-2 text-[11px] font-mono text-white/35 hover:text-white transition-colors">Annuler</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Client detail panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end" onClick={() => setSelected(null)}>
          <div className="bg-[#0A1628] border-l border-white/8 h-full w-full max-w-md overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="h-[3px] flex"><div className="flex-1 bg-[#CE1126]"/><div className="flex-1 bg-[#FCD116]"/><div className="flex-1 bg-[#009460]"/></div>
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-white text-xl font-light mb-0.5" style={{ fontFamily: "'Crimson Pro', serif" }}>{selected.commune}</h2>
                  <p className="text-white/40 text-[10px] font-mono">{selected.id}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white p-1"><X size={18} /></button>
              </div>

              <div className="flex gap-2"><StatusBadge status={selected.status} /><PlanBadge plan={selected.plan} /></div>

              {/* Info grid */}
              <div className="space-y-2.5">
                {[
                  { icon: Globe, label: "Pays", value: selected.country },
                  { icon: Users, label: "Contact", value: `${selected.contact}` },
                  { icon: Mail, label: "Email", value: selected.email },
                  { icon: Phone, label: "Téléphone", value: selected.phone },
                  { icon: Calendar, label: "Client depuis", value: selected.createdAt },
                  { icon: Building2, label: "Agents", value: `${selected.agents} agents` },
                  { icon: Users, label: "Contribuables", value: `${selected.contribuables.toLocaleString("fr-FR")} enregistrés` },
                  { icon: TrendingUp, label: "MRR", value: selected.mrr > 0 ? fmtGnf(selected.mrr) : "Essai gratuit" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <r.icon size={12} className="text-white/25 shrink-0" />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-wide text-white/35 w-24 shrink-0">{r.label}</span>
                      <span className="text-[12px] font-mono text-white/70 truncate">{r.value}</span>
                    </div>
                  </div>
                ))}
                {selected.trialEndsAt && (
                  <div className="flex items-center gap-3">
                    <Clock size={12} className="text-[#FCD116]/60 shrink-0" />
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-[10px] font-mono uppercase tracking-wide text-white/35 w-24 shrink-0">Fin essai</span>
                      <span className="text-[12px] font-mono text-[#FCD116]">{selected.trialEndsAt}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-white/6 pt-4 space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/35 mb-3">Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {selected.status === "trial" && (
                    <button onClick={() => { toggleStatus(selected, "active"); }}
                      className="py-2.5 text-[11px] font-mono font-semibold rounded-[3px] text-center transition-all hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #009460, #006640)", color: "white" }}>
                      Convertir en Pro
                    </button>
                  )}
                  {selected.status === "active" && (
                    <button onClick={() => toggleStatus(selected, "suspended")}
                      className="py-2.5 text-[11px] font-mono rounded-[3px] text-center border border-[#CE1126]/30 text-[#CE1126] hover:bg-[#CE1126]/10 transition-all">
                      Suspendre
                    </button>
                  )}
                  {selected.status === "suspended" && (
                    <button onClick={() => toggleStatus(selected, "active")}
                      className="py-2.5 text-[11px] font-mono rounded-[3px] text-center border border-[#009460]/30 text-[#009460] hover:bg-[#009460]/10 transition-all">
                      Réactiver
                    </button>
                  )}
                  <button onClick={() => { setEmailSubject(`Votre abonnement PLATFORM SNRR — ${selected?.commune}`); setEmailBody(`Bonjour,\n\nNous vous contactons concernant votre abonnement PLATFORM SNRR pour la commune de ${selected?.commune}.\n\nCordialement,\nL'équipe PLATFORM SNRR`); setEmailSent(false); setShowEmail(true); }}
                    className="py-2.5 text-[11px] font-mono rounded-[3px] text-center border border-white/12 text-white/50 hover:bg-white/5 transition-all">
                    Envoyer email
                  </button>
                  <button onClick={() => { setInvRef(`INV-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900)+100)}`); setInvGenDone(false); setShowInvGen(true); }}
                    className="py-2.5 text-[11px] font-mono rounded-[3px] text-center border border-white/12 text-white/50 hover:bg-white/5 transition-all">
                    Générer facture
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Billing tab ───────────────────────────────────────────────────────────────

function BillingTab({ invoices, tenants }: { invoices: Invoice[]; tenants: Tenant[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | "all">("all");
  const [viewInv, setViewInv] = useState<Invoice | null>(null);

  const exportCSV = () => {
    const headers = ["Facture", "Commune", "Plan", "Période", "Montant GNF", "Date", "Échéance", "Statut"];
    const rows = invoices.map(i => [i.id, i.commune, i.plan, i.period, String(i.amount), i.date, i.dueDate, INV_COLORS[i.status].label]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `factures-snrr-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const downloadInvoice = (inv: Invoice) => {
    const txt = `PLATFORM SNRR\n${"─".repeat(40)}\nFACTURE ${inv.id}\n\nClient  : ${inv.commune}\nPlan    : ${PLAN_LABELS[inv.plan]}\nPériode : ${inv.period}\nDate    : ${inv.date}\nÉchéance: ${inv.dueDate}\nStatut  : ${INV_COLORS[inv.status].label}\n\n${"─".repeat(40)}\nMontant total : ${fmtGnf(inv.amount)}\n${"─".repeat(40)}\n\nRépublique de Guinée — Fiscalité locale\nPLATFORM SNRR · support@platform-snrr.com\n`;
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${inv.id}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    return (inv.commune.toLowerCase().includes(q) || inv.id.toLowerCase().includes(q)) &&
           (filterStatus === "all" || inv.status === filterStatus);
  });

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-5">
      {/* Billing KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Encaissé (juin)", value: fmtGnf(totalPaid), color: "#009460", icon: CheckCircle2 },
          { label: "En attente", value: fmtGnf(totalPending), color: "#FCD116", icon: Clock },
          { label: "En retard", value: fmtGnf(totalOverdue), color: "#CE1126", icon: AlertTriangle },
        ].map((k, i) => (
          <div key={i} className="bg-white/3 border border-white/8 rounded-[3px] p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-[2px] flex items-center justify-center shrink-0" style={{ background: `${k.color}15` }}>
              <k.icon size={16} style={{ color: k.color }} />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-white/35">{k.label}</p>
              <p className="text-base font-bold text-white font-mono">{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
          <input className="w-full pl-9 pr-3.5 py-2 text-[12px] bg-white/4 border border-white/10 rounded-[3px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]/50 font-mono"
            value={search} onChange={e => setSearch(e.target.value)} placeholder="Chercher facture, commune…" />
        </div>
        <div className="flex gap-1.5">
          {(["all","paid","pending","overdue"] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`text-[10px] font-mono px-2.5 py-1.5 rounded-[2px] border transition-colors ${filterStatus === s ? "bg-[#1B3A6B]/30 border-[#1B3A6B]/50 text-white" : "border-white/8 text-white/40 hover:text-white/70 hover:border-white/20"}`}>
              {s === "all" ? "Toutes" : INV_COLORS[s].label}
            </button>
          ))}
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-mono text-white/50 border border-white/10 rounded-[3px] hover:bg-white/5 hover:text-white transition-all">
          <Download size={12} /> Export CSV
        </button>
      </div>

      {/* Invoice table */}
      <div className="bg-white/3 border border-white/8 rounded-[3px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6">
                {["Facture", "Commune", "Plan", "Période", "Montant", "Date", "Échéance", "Statut", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[9px] font-mono uppercase tracking-widest text-white/35">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, i) => {
                const sc = INV_COLORS[inv.status];
                return (
                  <tr key={inv.id} className="border-b border-white/4 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3"><span className="text-[11px] font-mono text-[#4A6B8A]">{inv.id}</span></td>
                    <td className="px-4 py-3"><span className="text-[12px] font-medium text-white">{inv.commune}</span></td>
                    <td className="px-4 py-3"><PlanBadge plan={inv.plan} /></td>
                    <td className="px-4 py-3"><span className="text-[11px] font-mono text-white/45">{inv.period}</span></td>
                    <td className="px-4 py-3"><span className="text-[12px] font-mono font-bold text-white">{fmtGnf(inv.amount)}</span></td>
                    <td className="px-4 py-3"><span className="text-[11px] font-mono text-white/40">{inv.date}</span></td>
                    <td className="px-4 py-3"><span className="text-[11px] font-mono text-white/40">{inv.dueDate}</span></td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono" style={{ color: sc.text }}>
                        <span className="w-1 h-1 rounded-full" style={{ background: sc.text }} />
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => downloadInvoice(inv)} className="p-1 text-white/25 hover:text-white transition-colors" title="Télécharger"><Download size={12} /></button>
                        <button onClick={() => setViewInv(inv)} className="p-1 text-white/25 hover:text-white transition-colors" title="Voir"><Eye size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-white/25 text-[12px] font-mono">Aucune facture trouvée</div>
        )}
      </div>

      {/* Upcoming renewals */}
      <div className="bg-white/3 border border-white/8 rounded-[3px] p-5">
        <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-4">Prochains renouvellements</p>
        <div className="space-y-2">
          {tenants.filter(t => t.nextBilling).sort((a,b) => a.nextBilling!.localeCompare(b.nextBilling!)).map(t => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b border-white/4 last:border-0">
              <div>
                <p className="text-[12px] font-medium text-white">{t.commune}</p>
                <p className="text-[10px] font-mono text-white/35">{t.nextBilling}</p>
              </div>
              <div className="flex items-center gap-3">
                <PlanBadge plan={t.plan} />
                <span className="text-[11px] font-mono font-bold text-[#009460]">{fmtGnf(t.mrr)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice view modal */}
      {viewInv && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewInv(null)}>
          <div className="bg-[#0A1628] border border-white/10 rounded-[4px] w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="h-[3px] flex rounded-t-[4px] overflow-hidden">
              <div className="flex-1 bg-[#CE1126]"/><div className="flex-1 bg-[#FCD116]"/><div className="flex-1 bg-[#009460]"/>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white text-base font-light" style={{ fontFamily: "'Crimson Pro', serif" }}>Détail facture</h3>
                  <p className="text-[#4A9FFF] text-[11px] font-mono">{viewInv.id}</p>
                </div>
                <button onClick={() => setViewInv(null)} className="text-white/30 hover:text-white p-1"><X size={16} /></button>
              </div>
              <div className="bg-white/3 border border-white/8 rounded px-4 py-4 space-y-3">
                {[
                  { l: "Client", v: viewInv.commune },
                  { l: "Plan", v: PLAN_LABELS[viewInv.plan] },
                  { l: "Période", v: viewInv.period },
                  { l: "Date émission", v: viewInv.date },
                  { l: "Échéance", v: viewInv.dueDate },
                  { l: "Statut", v: INV_COLORS[viewInv.status].label },
                ].map(r => (
                  <div key={r.l} className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-white/35">{r.l}</span>
                    <span className="text-[11px] font-mono text-white/70">{r.v}</span>
                  </div>
                ))}
                <div className="border-t border-white/8 pt-3 flex justify-between items-center">
                  <span className="text-[11px] font-mono text-white/50">Montant total</span>
                  <span className="text-lg font-bold font-mono text-white">{fmtGnf(viewInv.amount)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { downloadInvoice(viewInv); setViewInv(null); }}
                  className="flex-1 py-2.5 text-[11px] font-mono font-semibold rounded-[3px] flex items-center justify-center gap-2 border border-white/12 text-white/60 hover:bg-white/5 transition-all">
                  <Download size={12} /> Télécharger
                </button>
                <button onClick={() => setViewInv(null)}
                  className="flex-1 py-2.5 text-[11px] font-mono font-semibold rounded-[3px] transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #1B3A6B, #0E1F3D)", color: "white" }}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Settings tab ──────────────────────────────────────────────────────────────

function SettingsTab() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    platformName: "PLATFORM SNRR",
    supportEmail: "support@platform-snrr.com",
    trialDays: "14",
    proPrice: "150000",
    enterprisePrice: "500000",
    currency: "GNF",
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    maintenanceMode: false,
    allowSignups: true,
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const inp = "w-full px-3 py-2 text-[12px] bg-white/5 border border-white/10 rounded-[3px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]/50 font-mono transition-colors";

  return (
    <div className="space-y-5 max-w-2xl">
      {[
        { title: "Plateforme", fields: [
          { key: "platformName", label: "Nom de la plateforme", type: "text" },
          { key: "supportEmail", label: "Email support", type: "email" },
          { key: "currency", label: "Devise", type: "text" },
        ]},
        { title: "Tarification", fields: [
          { key: "trialDays", label: "Durée essai (jours)", type: "number" },
          { key: "proPrice", label: "Prix Pro (GNF/mois)", type: "number" },
          { key: "enterprisePrice", label: "Prix Préfecture (GNF/mois)", type: "number" },
        ]},
        { title: "Email SMTP", fields: [
          { key: "smtpHost", label: "Hôte SMTP", type: "text" },
          { key: "smtpPort", label: "Port", type: "text" },
        ]},
      ].map(section => (
        <div key={section.title} className="bg-white/3 border border-white/8 rounded-[3px] p-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-4">{section.title}</p>
          <div className="space-y-3">
            {section.fields.map(f => (
              <div key={f.key}>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">{f.label}</label>
                <input className={inp} type={f.type} value={String(form[f.key as keyof typeof form])} onChange={set(f.key as keyof typeof form)} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Toggles */}
      <div className="bg-white/3 border border-white/8 rounded-[3px] p-5">
        <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-4">Contrôles</p>
        <div className="space-y-3">
          {[
            { key: "maintenanceMode", label: "Mode maintenance", desc: "Bloquer l'accès à toutes les plateformes clientes", danger: true },
            { key: "allowSignups", label: "Inscriptions ouvertes", desc: "Autoriser les nouvelles inscriptions via la landing page" },
          ].map(toggle => (
            <div key={toggle.key} className="flex items-center justify-between py-2">
              <div>
                <p className={`text-[12px] font-medium ${toggle.danger ? "text-[#CE1126]" : "text-white"}`}>{toggle.label}</p>
                <p className="text-[10px] font-mono text-white/35">{toggle.desc}</p>
              </div>
              <button onClick={() => setForm(f => ({ ...f, [toggle.key]: !f[toggle.key as keyof typeof form] }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${form[toggle.key as keyof typeof form] ? (toggle.danger ? "bg-[#CE1126]" : "bg-[#009460]") : "bg-white/10"}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${form[toggle.key as keyof typeof form] ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}
          className="px-5 py-3 text-[12px] font-mono font-semibold rounded-[3px] transition-all hover:opacity-90 flex items-center gap-2"
          style={{ background: "linear-gradient(135deg, #1B3A6B, #0E1F3D)", color: "white" }}>
          {saved ? <><Check size={13} /> Sauvegardé</> : "Sauvegarder les paramètres"}
        </button>
        {saved && <span className="text-[11px] font-mono text-[#009460] flex items-center gap-1.5"><CheckCircle2 size={13} /> Paramètres mis à jour</span>}
      </div>
    </div>
  );
}

// ─── Main SuperAdmin component ─────────────────────────────────────────────────

type SATab = "dashboard" | "clients" | "workspaces" | "billing" | "settings";

export function SuperAdmin({ onExit }: { onExit: () => void }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<SATab>("dashboard");
  const [tenants, setTenants] = useState<Tenant[]>(TENANTS);
  const [invoices] = useState<Invoice[]>(INVOICES);
  const [alerts, setAlerts] = useState(2);
  const [showNotifs, setShowNotifs] = useState(false);
  const NOTIFS = [
    { icon: AlertTriangle, color: "#CE1126", text: "N'Zérékoré — Facture INV-2024-0152 en retard", time: "il y a 6h", read: false },
    { icon: Clock, color: "#FCD116", text: "Mamou — Facture INV-2024-0154 en attente depuis 15j", time: "il y a 12h", read: false },
    { icon: CheckCircle2, color: "#009460", text: "Kaloum — Paiement reçu 5 M GNF", time: "il y a 2h", read: true },
    { icon: Building2, color: "#4A6B8A", text: "Kindia — Essai expire dans 4 jours", time: "il y a 8h", read: true },
    { icon: Users, color: "#1B3A6B", text: "15 nouveaux agents enregistrés ce mois", time: "hier", read: true },
  ];

  const navItems: { id: SATab; icon: typeof LayoutDashboard; label: string }[] = [
    { id: "dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
    { id: "clients", icon: Building2, label: "Clients" },
    { id: "workspaces", icon: Layers, label: "Workspaces" },
    { id: "billing", icon: CreditCard, label: "Facturation" },
    { id: "settings", icon: Settings, label: "Paramètres" },
  ];

  if (!authenticated) return <SuperAdminLogin onLogin={() => setAuthenticated(true)} />;

  return (
    <div className="min-h-screen bg-[#060E1C] flex">
      {/* ── Sidebar ── */}
      <aside className="w-56 shrink-0 bg-[#040B18] border-r border-white/6 flex flex-col">
        <div className="h-[3px] flex"><div className="flex-1 bg-[#CE1126]"/><div className="flex-1 bg-[#FCD116]"/><div className="flex-1 bg-[#009460]"/></div>

        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/6">
          <PlatformLogo height={30} />
          <p className="text-white/25 text-[9px] font-mono mt-1.5 tracking-widest uppercase">Super Admin</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[3px] text-[12px] font-mono transition-colors ${tab === n.id ? "bg-white/8 text-white" : "text-white/40 hover:bg-white/4 hover:text-white/70"}`}>
              <n.icon size={14} className="shrink-0" />
              {n.label}
              {n.id === "billing" && alerts > 0 && (
                <span className="ml-auto w-4 h-4 rounded-full bg-[#CE1126] text-white text-[9px] font-mono flex items-center justify-center">{alerts}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/6 space-y-0.5">
          <div className="px-3 py-2">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#009460] animate-pulse" />
              {tenants.filter(t=>t.tenantType==="prefecture").length} préf · {tenants.filter(t=>t.tenantType!=="prefecture").length} communes
            </div>
            <div className="text-[9px] font-mono text-white/20 mt-0.5">MRR {fmtGnf(tenants.reduce((s,t)=>s+t.mrr,0))}</div>
          </div>
          <button onClick={onExit}
            className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-mono text-white/30 hover:text-[#CE1126] rounded-[3px] hover:bg-[#CE1126]/8 transition-colors">
            <LogOut size={13} /> Quitter Super Admin
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-white/6 px-8 flex items-center justify-between shrink-0 bg-[#040B18]">
          <div>
            <h1 className="text-white text-base font-light" style={{ fontFamily: "'Crimson Pro', serif" }}>
              {navItems.find(n => n.id === tab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => { setShowNotifs(p => !p); setAlerts(0); }} className="relative p-2 text-white/30 hover:text-white transition-colors">
                <Bell size={16} />
                {alerts > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#CE1126]" />}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-10 w-80 bg-[#0A1628] border border-white/10 rounded-[4px] shadow-2xl z-50">
                  <div className="h-[2px] bg-[#CE1126] rounded-t-[4px]" />
                  <div className="p-3 border-b border-white/6 flex items-center justify-between">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">Notifications</p>
                    <button onClick={() => setShowNotifs(false)} className="text-white/25 hover:text-white"><X size={13} /></button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {NOTIFS.map((n, i) => (
                      <div key={i} className={`flex items-start gap-3 px-4 py-3 border-b border-white/4 last:border-0 ${n.read ? "opacity-50" : ""}`}>
                        <n.icon size={13} style={{ color: n.color }} className="shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-mono text-white/70 leading-snug">{n.text}</p>
                          <p className="text-[9px] font-mono text-white/25 mt-0.5">{n.time}</p>
                        </div>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#CE1126] shrink-0 mt-1" />}
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-white/6">
                    <button onClick={() => setShowNotifs(false)} className="w-full text-[10px] font-mono text-white/30 hover:text-white transition-colors">Tout marquer comme lu</button>
                  </div>
                </div>
              )}
            </div>
            <div className="h-5 w-px bg-white/8" />
            <div className="flex items-center gap-2 text-[11px] font-mono text-white/40">
              <div className="w-6 h-6 rounded-full bg-[#CE1126]/20 border border-[#CE1126]/30 flex items-center justify-center text-[10px] text-[#CE1126] font-bold">SA</div>
              Super Admin
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">
          {tab === "dashboard" && <DashboardTab tenants={tenants} invoices={invoices} />}
          {tab === "clients" && <ClientsTab tenants={tenants} setTenants={setTenants} />}
          {tab === "workspaces" && <WorkspacesTab tenants={tenants} setTenants={setTenants} />}
          {tab === "billing" && <BillingTab invoices={invoices} tenants={tenants} />}
          {tab === "settings" && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}
