import React, { useState, useEffect } from "react";
import {
  Users, MapPin, CreditCard, FileBarChart2, BarChart2, Globe,
  ChevronRight, Check, Star, Menu, X, ArrowRight, Zap, Shield,
  Clock, TrendingUp, Play, Languages, Phone, Mail,
  CheckCircle2, AlertCircle, ChevronDown,
} from "lucide-react";
import type { TenantConfig } from "../App";

// ─── Logo Components ───────────────────────────────────────────────────────────

// Pointy-top hexagon — Guinea tricolor (red/yellow/green) + white Crimson Pro "S"
const HEX = "20,2.5 35.5,11.25 35.5,28.75 20,37.5 4.5,28.75 4.5,11.25";

export function PlatformLogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} fill="none" aria-label="PLATFORM SNRR">
      <defs>
        <clipPath id="mark-hex">
          <polygon points={HEX} />
        </clipPath>
      </defs>
      {/* Tricolor — Guinea flag vertical bands mapped to horizontal zones */}
      <rect x="0" y="0"  width="40" height="14" fill="#CE1126" clipPath="url(#mark-hex)" />
      <rect x="0" y="13" width="40" height="14" fill="#FCD116" clipPath="url(#mark-hex)" />
      <rect x="0" y="26" width="40" height="14" fill="#009460" clipPath="url(#mark-hex)" />
      {/* Navy overlay — unifies colors, lets white S read */}
      <polygon points={HEX} fill="rgba(6,14,28,0.62)" />
      {/* "S" — serif institutional weight, centered on yellow band */}
      <text x="20" y="28" textAnchor="middle"
        fontSize="22" fontWeight="700"
        fontFamily="'Crimson Pro', Georgia, 'Times New Roman', serif"
        fill="white" letterSpacing="-0.5">
        S
      </text>
      {/* Thin border */}
      <polygon points={HEX} stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

export function PlatformLogo({ height = 36, mono = false }: { height?: number; mono?: boolean }) {
  const scale = height / 40;
  return (
    <svg viewBox="0 0 198 40" height={height} width={Math.round(198 * scale)} fill="none" aria-label="PLATFORM SNRR">
      <defs>
        <clipPath id="logo-hex">
          <polygon points={HEX} />
        </clipPath>
        <linearGradient id="logo-accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#CE1126" stopOpacity="0.7" />
          <stop offset="50%"  stopColor="#FCD116" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#009460" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Badge mark */}
      <rect x="0" y="0"  width="40" height="14" fill={mono ? "rgba(255,255,255,0.6)" : "#CE1126"} clipPath="url(#logo-hex)" />
      <rect x="0" y="13" width="40" height="14" fill={mono ? "rgba(255,255,255,0.8)" : "#FCD116"} clipPath="url(#logo-hex)" />
      <rect x="0" y="26" width="40" height="14" fill={mono ? "rgba(255,255,255,0.6)" : "#009460"} clipPath="url(#logo-hex)" />
      <polygon points={HEX} fill={mono ? "rgba(255,255,255,0.10)" : "rgba(6,14,28,0.62)"} />
      <text x="20" y="28" textAnchor="middle"
        fontSize="22" fontWeight="700"
        fontFamily="'Crimson Pro', Georgia, 'Times New Roman', serif"
        fill="white" letterSpacing="-0.5">
        S
      </text>
      <polygon points={HEX} stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" fill="none" />

      {/* Wordmark */}
      <text x="52" y="16"
        fontSize="8.5" fontWeight="400" letterSpacing="3.8"
        fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
        fill={mono ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.45)"}>
        PLATFORM
      </text>
      {/* Tricolor accent rule */}
      <rect x="52" y="21" width="68" height="1" fill="url(#logo-accent)" rx="0.5" />
      {/* SNRR */}
      <text x="51" y="37"
        fontSize="23" fontWeight="700" letterSpacing="0.5"
        fontFamily="'Crimson Pro', Georgia, 'Times New Roman', serif"
        fill="white">
        SNRR
      </text>
    </svg>
  );
}

// ─── i18n ──────────────────────────────────────────────────────────────────────

const T = {
  fr: {
    nav: { features: "Fonctionnalités", pricing: "Tarifs", testimonials: "Témoignages", contact: "Contact", login: "Se connecter", trial: "Essai gratuit 14j" },
    hero: {
      badge: "Plateforme certifiée Ministère de l'Administration Territoriale",
      h1a: "La plateforme fiscale",
      h1b: "des communes africaines",
      sub: "Recensez, taxez et recouvrez vos recettes communales avec SNRR — conçu pour l'Afrique francophone, déployé en 48h.",
      cta1: "Démarrer l'essai gratuit",
      cta2: "Voir la démo",
      social: "Déjà utilisé par",
      communes: "communes",
    },
    stats: [
      { v: "40+", l: "Communes actives" },
      { v: "2.4 Mrd", l: "GNF recouvrés" },
      { v: "98%", l: "Satisfaction client" },
      { v: "48h", l: "Délai de déploiement" },
    ],
    features: {
      title: "Tout ce dont votre commune a besoin",
      sub: "Six modules intégrés pour une gestion fiscale complète, de la géolocalisation au recouvrement.",
      items: [
        { icon: Users, title: "Recensement contribuables", desc: "Identification, géolocalisation GPS et gestion des contribuables avec photos et documents.", color: "#CE1126" },
        { icon: MapPin, title: "Cartographie SIG", desc: "Carte interactive multi-couches — satellite, topographie, mode sombre — avec localisation précise.", color: "#B8860B" },
        { icon: CreditCard, title: "Paiement électronique", desc: "Orange Money, MTN MoMo, virement bancaire, QR Code fiscal et reçu numérique instantané.", color: "#009460" },
        { icon: FileBarChart2, title: "Rapports & exports", desc: "Rapports PDF/Excel automatisés, tableaux de bord en temps réel, avis d'imposition.", color: "#1B3A6B" },
        { icon: BarChart2, title: "Business Intelligence", desc: "Analyses prédictives, détection d'anomalies, tendances de recouvrement et prévisions.", color: "#4A6B8A" },
        { icon: Globe, title: "Multi-sites & multi-langue", desc: "Gérez plusieurs communes depuis une seule console. Interface en français, anglais et plus.", color: "#8B0A5A" },
      ],
    },
    how: {
      title: "Opérationnel en 48 heures",
      steps: [
        { n: "01", t: "Inscription", d: "Créez votre compte et configurez votre profil communal en quelques minutes." },
        { n: "02", t: "Configuration", d: "Importez vos données existantes, personnalisez les modules selon vos besoins." },
        { n: "03", t: "Déploiement", d: "Formez vos agents et démarrez le recouvrement. Notre équipe vous accompagne." },
      ],
    },
    pricing: {
      title: "Des tarifs transparents",
      sub: "Essayez gratuitement 14 jours, sans carte bancaire. Souscription mensuelle ou annuelle (–20%).",
      toggleMonthly: "Mensuel",
      toggleAnnual: "Annuel",
      saveBadge: "Économisez 20%",
      annualNote: "Facturé annuellement",
      monthlyNote: "Facturé chaque mois",
      trial: {
        name: "Essai gratuit",
        price: "0",
        period: "14 jours",
        desc: "Toutes les fonctionnalités, sans engagement",
        features: ["Tous les modules inclus", "Jusqu'à 5 agents", "Support email", "Migration de données incluse", "Formation en ligne"],
        cta: "Démarrer gratuitement",
      },
      pro: {
        name: "Pro",
        priceMonthly: "5 000 000",
        priceAnnual: "4 000 000",
        currency: "GNF",
        period: "/mois",
        desc: "Pour les communes avec besoins avancés",
        features: ["Modules illimités", "Agents illimités", "Support prioritaire 24/7", "Formation sur site", "Personnalisation avancée", "API & intégrations", "SLA 99.9%"],
        cta: "Souscrire maintenant",
      },
      enterprise: {
        name: "Préfecture",
        price: "Sur devis",
        desc: "Pour les préfectures et régions multi-communes",
        features: ["Multi-communes illimité", "Console centrale préfecture", "Rapports consolidés", "Intégration systèmes nationaux", "Accompagnement dédié", "SLA personnalisé"],
        cta: "Nous contacter",
      },
      payments: {
        title: "Moyens de paiement acceptés",
        methods: [
          { key: "visa",    label: "VISA / Mastercard",    detail: "Carte bancaire internationale" },
          { key: "orange",  label: "Orange Money",          detail: "Paiement mobile en GNF" },
          { key: "bank",    label: "Virement bancaire",     detail: "Compte bancaire local ou international" },
          { key: "cash",    label: "Espèce en agence",      detail: "Paiement en cash dans nos agences partenaires" },
        ],
      },
    },
    testimonials: {
      title: "Ce que disent nos clients",
      items: [
        { name: "Mamadou Diallo", role: "Maire, Commune de Kindia", text: "SNRR a transformé notre recouvrement. En 6 mois, notre taux est passé de 42% à 78%. Nos agents sont enfin efficaces sur le terrain.", rating: 5 },
        { name: "Fatoumata Camara", role: "Directrice Fiscale, Conakry CU", text: "L'interface est simple et les rapports sont parfaits pour nos réunions avec le Ministère. Le support est réactif et professionnel.", rating: 5 },
        { name: "Ibrahima Bah", role: "Secrétaire Général, Labé", text: "Grâce à la cartographie SIG, nous avons identifié 3 200 contribuables que nous ne connaissions pas. Un investissement qui se rentabilise en quelques semaines.", rating: 5 },
      ],
    },
    cta: {
      title: "Rejoignez 40+ communes qui font confiance à SNRR",
      sub: "14 jours d'essai gratuit. Aucune carte bancaire requise. Déploiement en 48h.",
      btn: "Démarrer maintenant",
    },
    footer: {
      tagline: "La plateforme fiscale des communes africaines.",
      links: ["Politique de confidentialité", "Conditions d'utilisation", "Support technique"],
      copy: "République de Guinée · Tous droits réservés",
    },
    form: {
      title: "Démarrez votre essai gratuit",
      sub: "14 jours, toutes les fonctionnalités, sans engagement.",
      commune: "Nom de la commune / préfecture *",
      country: "Pays *",
      contact: "Votre nom complet *",
      email: "Email professionnel *",
      phone: "Téléphone",
      agents: "Nombre d'agents",
      submit: "Activer l'essai gratuit",
      loading: "Activation en cours…",
      success: "Votre essai de 14 jours est activé !",
      successSub: "Vous allez être redirigé vers la plateforme…",
      entering: "Accéder à la plateforme",
    },
    login: {
      title: "Accéder à la plateforme",
      sub: "Entrez vos identifiants ou choisissez votre commune.",
      tenantId: "Identifiant commune (ex: mamou-commune)",
      submit: "Se connecter",
    },
  },
  en: {
    nav: { features: "Features", pricing: "Pricing", testimonials: "Testimonials", contact: "Contact", login: "Log in", trial: "Free 14-day trial" },
    hero: {
      badge: "Certified by the Ministry of Territorial Administration",
      h1a: "The fiscal platform for",
      h1b: "African municipalities",
      sub: "Register, assess and collect your municipal revenues with SNRR — built for Francophone Africa, deployed in 48h.",
      cta1: "Start free trial",
      cta2: "Watch demo",
      social: "Already trusted by",
      communes: "municipalities",
    },
    stats: [
      { v: "40+", l: "Active municipalities" },
      { v: "2.4 Bn", l: "GNF collected" },
      { v: "98%", l: "Client satisfaction" },
      { v: "48h", l: "Deployment time" },
    ],
    features: {
      title: "Everything your municipality needs",
      sub: "Six integrated modules for complete fiscal management, from geolocation to collection.",
      items: [
        { icon: Users, title: "Taxpayer registration", desc: "Identify, geolocate and manage taxpayers with photos and documents.", color: "#CE1126" },
        { icon: MapPin, title: "GIS Mapping", desc: "Multi-layer interactive map — satellite, topo, dark mode — with precise fiscal location.", color: "#B8860B" },
        { icon: CreditCard, title: "Electronic payment", desc: "Orange Money, MTN MoMo, bank transfer, fiscal QR Code and instant digital receipt.", color: "#009460" },
        { icon: FileBarChart2, title: "Reports & exports", desc: "Automated PDF/Excel reports, real-time dashboards, tax notices.", color: "#1B3A6B" },
        { icon: BarChart2, title: "Business Intelligence", desc: "Predictive analytics, anomaly detection, collection trends and forecasts.", color: "#4A6B8A" },
        { icon: Globe, title: "Multi-site & multilingual", desc: "Manage several municipalities from one console. UI in French, English and more.", color: "#8B0A5A" },
      ],
    },
    how: {
      title: "Live in 48 hours",
      steps: [
        { n: "01", t: "Sign up", d: "Create your account and configure your municipal profile in minutes." },
        { n: "02", t: "Configure", d: "Import your existing data, customize modules to your needs." },
        { n: "03", t: "Deploy", d: "Train your agents and start collecting. Our team supports you every step." },
      ],
    },
    pricing: {
      title: "Transparent pricing",
      sub: "Try free for 14 days, no credit card. Upgrade to Pro when ready.",
      trial: { name: "Free trial", price: "0", period: "14 days", desc: "All features, no commitment", features: ["All modules included", "Up to 5 agents", "Email support", "Data migration included", "Online training"], cta: "Start for free" },
      toggleMonthly: "Monthly", toggleAnnual: "Annual", saveBadge: "Save 20%", annualNote: "Billed annually", monthlyNote: "Billed monthly",
      pro: { name: "Pro", priceMonthly: "5 000 000", priceAnnual: "4 000 000", currency: "GNF", period: "/month", desc: "For municipalities with advanced needs", features: ["Unlimited modules", "Unlimited agents", "Priority 24/7 support", "On-site training", "Advanced customization", "API & integrations", "99.9% SLA"], cta: "Subscribe now" },
      enterprise: { name: "Prefecture", price: "Custom", desc: "For prefectures and multi-municipality regions", features: ["Unlimited multi-site", "Central prefecture console", "Consolidated reports", "National system integration", "Dedicated support", "Custom SLA"], cta: "Contact us" },
      payments: { title: "Accepted payment methods", methods: [{ key: "visa", label: "VISA / Mastercard", detail: "International credit card" }, { key: "orange", label: "Orange Money", detail: "Mobile payment in GNF" }, { key: "bank", label: "Bank transfer", detail: "Local or international bank account" }, { key: "cash", label: "Cash at agency", detail: "Cash payment at partner agencies" }] },
    },
    testimonials: {
      title: "What our clients say",
      items: [
        { name: "Mamadou Diallo", role: "Mayor, Kindia Municipality", text: "SNRR transformed our collections. In 6 months, our rate went from 42% to 78%. Our agents are finally effective in the field.", rating: 5 },
        { name: "Fatoumata Camara", role: "Fiscal Director, Conakry CU", text: "The interface is simple and reports are perfect for our Ministry meetings. Support is responsive and professional.", rating: 5 },
        { name: "Ibrahima Bah", role: "Secretary General, Labé", text: "Thanks to GIS mapping, we identified 3,200 taxpayers we didn't know about. An investment that pays for itself in weeks.", rating: 5 },
      ],
    },
    cta: {
      title: "Join 40+ municipalities that trust SNRR",
      sub: "14-day free trial. No credit card required. Deploy in 48h.",
      btn: "Get started now",
    },
    footer: {
      tagline: "The fiscal platform for African municipalities.",
      links: ["Privacy Policy", "Terms of Service", "Technical Support"],
      copy: "Republic of Guinea · All rights reserved",
    },
    form: {
      title: "Start your free trial",
      sub: "14 days, all features, no commitment.",
      commune: "Municipality / prefecture name *",
      country: "Country *",
      contact: "Your full name *",
      email: "Professional email *",
      phone: "Phone",
      agents: "Number of agents",
      submit: "Activate free trial",
      loading: "Activating…",
      success: "Your 14-day trial is active!",
      successSub: "You will be redirected to the platform…",
      entering: "Go to platform",
    },
    login: {
      title: "Access the platform",
      sub: "Enter your credentials or choose your municipality.",
      tenantId: "Municipality ID (e.g. mamou-commune)",
      submit: "Log in",
    },
  },
} as const;

type Lang = "fr" | "en";

// ─── Communes de Guinée ────────────────────────────────────────────────────────

interface CommuneEntry { id: string; nom: string; region: string; }

const COMMUNES_GUINEE: CommuneEntry[] = [
  // Conakry — communes urbaines
  { id: "conakry-kaloum",   nom: "Kaloum",           region: "Conakry" },
  { id: "conakry-dixinn",   nom: "Dixinn",            region: "Conakry" },
  { id: "conakry-ratoma",   nom: "Ratoma",            region: "Conakry" },
  { id: "conakry-matam",    nom: "Matam",             region: "Conakry" },
  { id: "conakry-matoto",   nom: "Matoto",            region: "Conakry" },
  // Basse Guinée
  { id: "coyah",            nom: "Coyah",             region: "Kindia" },
  { id: "dubreka",          nom: "Dubréka",           region: "Kindia" },
  { id: "forecariah",       nom: "Forécariah",        region: "Kindia" },
  { id: "kindia",           nom: "Kindia",            region: "Kindia" },
  { id: "telimele",         nom: "Télimélé",          region: "Kindia" },
  { id: "boffa",            nom: "Boffa",             region: "Boké" },
  { id: "boke",             nom: "Boké",              region: "Boké" },
  { id: "fria",             nom: "Fria",              region: "Boké" },
  { id: "gaoual",           nom: "Gaoual",            region: "Boké" },
  { id: "koundara",         nom: "Koundara",          region: "Boké" },
  // Moyenne Guinée
  { id: "dalaba",           nom: "Dalaba",            region: "Mamou" },
  { id: "mamou",            nom: "Mamou",             region: "Mamou" },
  { id: "pita",             nom: "Pita",              region: "Mamou" },
  { id: "koubia",           nom: "Koubia",            region: "Labé" },
  { id: "labe",             nom: "Labé",              region: "Labé" },
  { id: "lelouma",          nom: "Lélouma",           region: "Labé" },
  { id: "mali",             nom: "Mali",              region: "Labé" },
  { id: "tougue",           nom: "Tougué",            region: "Labé" },
  // Haute Guinée
  { id: "dabola",           nom: "Dabola",            region: "Faranah" },
  { id: "dinguiraye",       nom: "Dinguiraye",        region: "Faranah" },
  { id: "faranah",          nom: "Faranah",           region: "Faranah" },
  { id: "kissidougou",      nom: "Kissidougou",       region: "Faranah" },
  { id: "kankan",           nom: "Kankan",            region: "Kankan" },
  { id: "kerouane",         nom: "Kérouané",          region: "Kankan" },
  { id: "kouroussa",        nom: "Kouroussa",         region: "Kankan" },
  { id: "mandiana",         nom: "Mandiana",          region: "Kankan" },
  { id: "siguiri",          nom: "Siguiri",           region: "Kankan" },
  // Guinée Forestière
  { id: "beyla",            nom: "Beyla",             region: "N'Zérékoré" },
  { id: "gueckedou",        nom: "Guéckédou",         region: "N'Zérékoré" },
  { id: "lola",             nom: "Lola",              region: "N'Zérékoré" },
  { id: "macenta",          nom: "Macenta",           region: "N'Zérékoré" },
  { id: "nzerekore",        nom: "N'Zérékoré",        region: "N'Zérékoré" },
  { id: "yomou",            nom: "Yomou",             region: "N'Zérékoré" },
];

const COMMUNE_PASSWORD = "admin@123";

const DEMO_TENANTS: TenantConfig[] = COMMUNES_GUINEE.map(c => ({
  id: c.id,
  name: `${c.nom} — Commune`,
  commune: c.nom,
  country: "Guinée",
  locale: "fr",
  plan: "pro" as const,
  features: ["all"],
  primaryColor: "#1B3A6B",
}));

const COUNTRIES = ["Guinée", "Sénégal", "Côte d'Ivoire", "Mali", "Burkina Faso", "Niger", "Bénin", "Togo", "Cameroun", "Madagascar", "DRC", "Other"];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function Stars({ n }: { n: number }) {
  return <div className="flex gap-0.5">{Array.from({ length: n }).map((_, i) => <Star key={i} size={12} fill="#FCD116" stroke="#FCD116" />)}</div>;
}

// ─── Workspace ID generator ────────────────────────────────────────────────────

function toWorkspaceId(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32) || "mon-espace";
}

// ─── Workspace creation modal ──────────────────────────────────────────────────

type FormStep = "workspace" | "admin" | "creating" | "success";

function TrialModal({ t, onClose, onSuccess }: { t: typeof T.fr; onClose: () => void; onSuccess: (tenant: TenantConfig) => void }) {
  const [step, setStep] = useState<FormStep>("workspace");
  const [wsForm, setWsForm] = useState({ commune: "", country: "Guinée", agents: "5", modules: ["cfu", "patentes", "marches", "paiements", "cartographie", "rapports"] });
  const [adminForm, setAdminForm] = useState({ contact: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [creatingStep, setCreatingStep] = useState(0);

  const workspaceId = toWorkspaceId(wsForm.commune);
  const inp = "w-full px-3.5 py-2.5 text-sm bg-[#0F1929] border border-white/12 rounded-[3px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]/60 focus:border-[#1B3A6B]/50 transition-colors font-mono";

  const MODULES = [
    { id: "cfu", label: "CFU & Taxes" },
    { id: "patentes", label: "Patentes" },
    { id: "marches", label: "Marchés" },
    { id: "paiements", label: "Paiements" },
    { id: "cartographie", label: "Cartographie SIG" },
    { id: "rapports", label: "Rapports & BI" },
  ];

  const CREATING_STEPS = [
    "Création de l'espace de travail…",
    "Configuration des modules…",
    "Initialisation de la base de données…",
    "Génération des accès administrateur…",
    "Workspace prêt !",
  ];

  const validateWorkspace = () => {
    if (!wsForm.commune.trim()) { setError("Le nom de la commune est obligatoire."); return false; }
    if (wsForm.commune.trim().length < 3) { setError("Le nom doit contenir au moins 3 caractères."); return false; }
    setError(""); return true;
  };

  const validateAdmin = () => {
    if (!adminForm.contact.trim()) { setError("Le nom du responsable est obligatoire."); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminForm.email)) { setError("Email invalide."); return false; }
    if (adminForm.password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return false; }
    if (adminForm.password !== adminForm.confirmPassword) { setError("Les mots de passe ne correspondent pas."); return false; }
    setError(""); return true;
  };

  const startCreation = () => {
    if (!validateAdmin()) return;
    setStep("creating");
    let i = 0;
    const tick = setInterval(() => {
      i++;
      setCreatingStep(i);
      if (i >= CREATING_STEPS.length - 1) { clearInterval(tick); setTimeout(() => setStep("success"), 600); }
    }, 700);
  };

  const proceed = () => {
    onSuccess({
      id: workspaceId,
      name: wsForm.commune,
      commune: wsForm.commune,
      country: wsForm.country,
      locale: "fr",
      plan: "trial",
      trialEndsAt: new Date(Date.now() + 14 * 864e5).toISOString(),
      features: wsForm.modules,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0A1628] border border-white/10 rounded-[4px] w-full max-w-lg shadow-2xl my-auto">
        {/* Flag strip */}
        <div className="h-[3px] flex rounded-t-[4px] overflow-hidden">
          <div className="flex-1 bg-[#CE1126]" /><div className="flex-1 bg-[#FCD116]" /><div className="flex-1 bg-[#009460]" />
        </div>

        {/* Progress bar (steps 1 & 2) */}
        {(step === "workspace" || step === "admin") && (
          <div className="px-8 pt-6">
            <div className="flex items-center gap-3 mb-1">
              {[
                { n: 1, label: "Workspace" },
                { n: 2, label: "Administrateur" },
              ].map((s, i) => (
                <div key={s.n} className="flex items-center gap-2">
                  {i > 0 && <div className={`flex-1 h-px w-8 ${step === "admin" ? "bg-[#009460]/40" : "bg-white/8"}`} />}
                  <div className={`flex items-center gap-1.5 text-[10px] font-mono ${(step === "workspace" && s.n === 1) || (step === "admin" && s.n === 2) ? "text-white" : step === "admin" && s.n === 1 ? "text-[#009460]" : "text-white/30"}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${(step === "workspace" && s.n === 1) || (step === "admin" && s.n === 2) ? "bg-[#CE1126] text-white" : step === "admin" && s.n === 1 ? "bg-[#009460]/20 text-[#009460]" : "bg-white/8 text-white/30"}`}>
                      {step === "admin" && s.n === 1 ? <Check size={10} /> : s.n}
                    </span>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-8 pt-5">
          {/* ── Step 1: Workspace ── */}
          {step === "workspace" && (
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-white text-2xl font-light mb-0.5" style={{ fontFamily: "'Crimson Pro', serif" }}>Créer votre workspace</h2>
                  <p className="text-white/40 text-[11px] font-mono">Configurez votre espace de travail communal</p>
                </div>
                <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1 mt-1"><X size={18} /></button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-white/45 mb-1.5">Nom de la commune / préfecture *</label>
                  <input className={inp} value={wsForm.commune}
                    onChange={e => setWsForm(f => ({ ...f, commune: e.target.value }))}
                    placeholder="Commune de Mamou" autoFocus />
                  {wsForm.commune.trim().length >= 2 && (
                    <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-white/35">
                      <span>Identifiant workspace :</span>
                      <span className="text-[#FCD116]/80 bg-[#FCD116]/8 px-1.5 py-0.5 rounded border border-[#FCD116]/15">
                        {workspaceId}.platform-snrr.com
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-white/45 mb-1.5">Pays *</label>
                    <select className={inp} value={wsForm.country} onChange={e => setWsForm(f => ({ ...f, country: e.target.value }))}>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-white/45 mb-1.5">Agents prévus</label>
                    <input className={inp} type="number" min="1" max="500" value={wsForm.agents}
                      onChange={e => setWsForm(f => ({ ...f, agents: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-white/45 mb-2">Modules à activer</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {MODULES.map(m => {
                      const active = wsForm.modules.includes(m.id);
                      return (
                        <button key={m.id} type="button"
                          onClick={() => setWsForm(f => ({
                            ...f,
                            modules: active ? f.modules.filter(x => x !== m.id) : [...f.modules, m.id],
                          }))}
                          className={`px-2.5 py-1.5 text-[10px] font-mono rounded-[2px] border transition-all text-left ${active ? "bg-[#1B3A6B]/30 border-[#1B3A6B]/50 text-white" : "border-white/8 text-white/35 hover:border-white/20 hover:text-white/60"}`}>
                          {active && <Check size={8} className="inline mr-1 text-[#FCD116]" />}
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {error && <p className="flex items-start gap-2 text-[11px] text-red-400 font-mono"><AlertCircle size={11} className="shrink-0 mt-0.5" /> {error}</p>}

              <button onClick={() => validateWorkspace() && setStep("admin")}
                className="w-full py-3.5 text-sm font-mono font-semibold rounded-[3px] flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #CE1126 0%, #8B0A1A 100%)", color: "white" }}>
                Continuer — Compte administrateur <ChevronRight size={14} />
              </button>
              <p className="text-center text-[10px] font-mono text-white/20">
                <Shield size={9} className="inline mr-1" />Aucune carte bancaire · 14 jours gratuits
              </p>
            </div>
          )}

          {/* ── Step 2: Admin account ── */}
          {step === "admin" && (
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-white text-2xl font-light mb-0.5" style={{ fontFamily: "'Crimson Pro', serif" }}>Compte administrateur</h2>
                  <p className="text-white/40 text-[11px] font-mono">Accès principal au workspace <span className="text-[#FCD116]/70">{workspaceId}</span></p>
                </div>
                <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1 mt-1"><X size={18} /></button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-white/45 mb-1.5">Nom du responsable *</label>
                  <input className={inp} value={adminForm.contact}
                    onChange={e => setAdminForm(f => ({ ...f, contact: e.target.value }))}
                    placeholder="Ibrahima Sory Diallo" autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-white/45 mb-1.5">Email professionnel *</label>
                    <input className={inp} type="email" value={adminForm.email}
                      onChange={e => setAdminForm(f => ({ ...f, email: e.target.value }))}
                      placeholder={`admin@${workspaceId || "commune"}.gov.gn`} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-white/45 mb-1.5">Téléphone</label>
                    <input className={inp} value={adminForm.phone}
                      onChange={e => setAdminForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+224 6XX XX XX XX" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-white/45 mb-1.5">Mot de passe *</label>
                    <input className={inp} type="password" value={adminForm.password}
                      onChange={e => setAdminForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Min. 8 caractères" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-white/45 mb-1.5">Confirmation *</label>
                    <input className={inp} type="password" value={adminForm.confirmPassword}
                      onChange={e => setAdminForm(f => ({ ...f, confirmPassword: e.target.value }))}
                      placeholder="••••••••" />
                  </div>
                </div>
              </div>

              {/* Workspace summary */}
              <div className="bg-white/3 border border-white/8 rounded-[3px] p-3 space-y-1.5">
                <p className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-2">Récapitulatif workspace</p>
                {[
                  ["Commune", wsForm.commune],
                  ["Pays", wsForm.country],
                  ["Identifiant", `${workspaceId}.platform-snrr.com`],
                  ["Modules", `${wsForm.modules.length} activés`],
                  ["Essai", "14 jours gratuits"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-white/35">{k}</span>
                    <span className="text-white/70">{v}</span>
                  </div>
                ))}
              </div>

              {error && <p className="flex items-start gap-2 text-[11px] text-red-400 font-mono"><AlertCircle size={11} className="shrink-0 mt-0.5" /> {error}</p>}

              <div className="flex gap-2">
                <button onClick={() => { setStep("workspace"); setError(""); }}
                  className="px-4 py-3.5 text-[11px] font-mono border border-white/12 rounded-[3px] text-white/50 hover:bg-white/5 transition-all">
                  ← Retour
                </button>
                <button onClick={startCreation}
                  className="flex-1 py-3.5 text-sm font-mono font-semibold rounded-[3px] flex items-center justify-center gap-2 transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #009460 0%, #006640 100%)", color: "white" }}>
                  Créer le workspace <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Creating ── */}
          {step === "creating" && (
            <div className="py-8 space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full border-2 border-[#CE1126]/30 border-t-[#CE1126] animate-spin mx-auto mb-4" />
                <h2 className="text-white text-xl font-light" style={{ fontFamily: "'Crimson Pro', serif" }}>Création du workspace</h2>
                <p className="text-white/40 text-[11px] font-mono mt-1">{workspaceId}.platform-snrr.com</p>
              </div>
              <div className="space-y-2.5">
                {CREATING_STEPS.map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 text-[12px] font-mono transition-all ${i <= creatingStep ? "text-white/70" : "text-white/20"}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${i < creatingStep ? "bg-[#009460]/20" : i === creatingStep ? "bg-[#CE1126]/20" : "bg-white/5"}`}>
                      {i < creatingStep ? <Check size={9} className="text-[#009460]" /> : i === creatingStep ? <span className="w-1.5 h-1.5 rounded-full bg-[#CE1126] animate-pulse" /> : <span className="w-1 h-1 rounded-full bg-white/15" />}
                    </span>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 4: Success ── */}
          {step === "success" && (
            <div className="space-y-5 py-2">
              <div className="flex items-start justify-between">
                <div />
                <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1"><X size={18} /></button>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#009460]/12 border border-[#009460]/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} className="text-[#009460]" />
                </div>
                <div>
                  <h2 className="text-white text-2xl font-light mb-1" style={{ fontFamily: "'Crimson Pro', serif" }}>Workspace créé !</h2>
                  <p className="text-white/45 text-[12px] font-mono">{t.form.successSub}</p>
                </div>
              </div>

              {/* Workspace card */}
              <div className="bg-[#0E1F3D]/60 border border-[#1B3A6B]/40 rounded-[3px] p-4 space-y-2.5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-[2px] bg-gradient-to-br from-[#CE1126] to-[#1B3A6B] flex items-center justify-center text-[11px] font-bold text-white">
                    {wsForm.commune.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-[13px] font-medium">{wsForm.commune}</p>
                    <p className="text-white/35 text-[10px] font-mono">{workspaceId}.platform-snrr.com</p>
                  </div>
                  <span className="ml-auto text-[10px] font-mono text-[#FCD116] bg-[#FCD116]/10 border border-[#FCD116]/20 px-2 py-0.5 rounded-full">
                    Essai 14j
                  </span>
                </div>
                {[
                  ["Email admin", adminForm.email],
                  ["Modules actifs", `${wsForm.modules.length} / ${MODULES.length}`],
                  ["Fin d'essai", new Date(Date.now() + 14 * 864e5).toLocaleDateString("fr-FR")],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-[10px] font-mono border-t border-white/5 pt-2">
                    <span className="text-white/30">{k}</span>
                    <span className="text-white/65">{v}</span>
                  </div>
                ))}
              </div>

              <button onClick={proceed}
                className="w-full py-4 text-sm font-mono font-semibold rounded-[3px] flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #CE1126 0%, #8B0A1A 100%)", color: "white" }}>
                Accéder à mon workspace <ChevronRight size={14} />
              </button>
              <p className="text-center text-[10px] font-mono text-white/20">
                Un email de confirmation a été envoyé à {adminForm.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Login modal ───────────────────────────────────────────────────────────────

const REGIONS_GUINEE = ["Toutes", "Conakry", "Kindia", "Boké", "Mamou", "Labé", "Faranah", "Kankan", "N'Zérékoré"];

const SUPER_ADMIN_LOGIN = "Superadmin";
const SUPER_ADMIN_PASSWORD = "Superadmin@snrr27";

function LoginModal({ t, onClose, onSuccess, onSuperAdmin }: { t: typeof T.fr; onClose: () => void; onSuccess: (tenant: TenantConfig) => void; onSuperAdmin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("Toutes");
  const [showPicker, setShowPicker] = useState(false);

  const inp = "w-full px-3.5 py-2.5 text-sm bg-[#0F1929] border border-white/12 rounded-[3px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]/60 font-mono transition-colors";

  // Resolve commune from email: admin@{id}.gn
  const resolveFromEmail = (email: string): TenantConfig | null => {
    const m = email.trim().toLowerCase().match(/^admin@(.+)\.gn$/);
    if (!m) return null;
    const id = m[1];
    return DEMO_TENANTS.find(t => t.id === id) ?? null;
  };

  const selectCommune = (c: CommuneEntry) => {
    setEmail(`admin@${c.id}.gn`);
    setShowPicker(false);
  };

  const filtered = COMMUNES_GUINEE.filter(c => {
    const q = search.toLowerCase();
    const matchQ = c.nom.toLowerCase().includes(q) || c.id.includes(q);
    const matchR = region === "Toutes" || c.region === region;
    return matchQ && matchR;
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Entrez votre identifiant ou email."); return; }
    if (!password) { setError("Entrez votre mot de passe."); return; }
    setLoading(true);
    setTimeout(() => {
      // Super admin shortcut
      if (email.trim() === SUPER_ADMIN_LOGIN && password === SUPER_ADMIN_PASSWORD) {
        onClose();
        onSuperAdmin();
        return;
      }
      // Commune admin login
      if (password !== COMMUNE_PASSWORD) {
        setError("Mot de passe incorrect.");
        setLoading(false);
        return;
      }
      const tenant = resolveFromEmail(email);
      if (tenant) {
        onSuccess(tenant);
      } else {
        setError("Identifiant non reconnu. Format commune : admin@commune.gn");
        setLoading(false);
      }
    }, 900);
  };

  // Preview commune from typed email
  const preview = resolveFromEmail(email);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A1628] border border-white/10 rounded-[4px] w-full max-w-md shadow-2xl">
        <div className="h-[3px] flex rounded-t-[4px] overflow-hidden">
          <div className="flex-1 bg-[#CE1126]" /><div className="flex-1 bg-[#FCD116]" /><div className="flex-1 bg-[#009460]" />
        </div>
        <div className="p-7 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-white text-xl font-light mb-0.5" style={{ fontFamily: "'Crimson Pro', serif" }}>Accès à votre workspace</h2>
              <p className="text-white/40 text-[11px] font-mono">Connectez-vous avec votre compte administrateur</p>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1"><X size={18} /></button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {/* Email field */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-white/45 mb-1.5">Email administrateur *</label>
              <div className="flex gap-2">
                <input className={`${inp} flex-1`} type="email" autoComplete="username"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@mamou.gn" autoFocus />
                <button type="button" onClick={() => setShowPicker(p => !p)}
                  className="px-3 py-2.5 text-[10px] font-mono border border-white/12 rounded-[3px] text-white/40 hover:bg-white/6 hover:text-white transition-all whitespace-nowrap">
                  Choisir commune
                </button>
              </div>
              {preview && (
                <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-[#009460]">
                  <Check size={9} /> Commune identifiée : <strong>{preview.commune}</strong> — {preview.id}.platform-snrr.com
                </div>
              )}
            </div>

            {/* Commune picker dropdown */}
            {showPicker && (
              <div className="bg-[#060E1C] border border-white/10 rounded-[3px] overflow-hidden">
                <div className="p-2.5 border-b border-white/6 space-y-2">
                  <input className="w-full px-3 py-1.5 text-[11px] bg-white/5 border border-white/10 rounded-[2px] text-white placeholder:text-white/25 focus:outline-none font-mono"
                    placeholder="Rechercher une commune…" value={search} onChange={e => setSearch(e.target.value)} />
                  <div className="flex flex-wrap gap-1">
                    {REGIONS_GUINEE.map(r => (
                      <button key={r} type="button" onClick={() => setRegion(r)}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full border transition-colors ${region === r ? "bg-[#1B3A6B]/40 border-[#1B3A6B]/50 text-white" : "border-white/8 text-white/30 hover:text-white/60"}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <p className="text-center text-[11px] font-mono text-white/25 py-4">Aucune commune</p>
                  ) : filtered.map(c => (
                    <button key={c.id} type="button" onClick={() => selectCommune(c)}
                      className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-white/5 transition-colors text-left">
                      <span className="text-[12px] font-medium text-white/70">{c.nom}</span>
                      <span className="text-[9px] font-mono text-white/25">{c.region}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-white/45 mb-1.5">Mot de passe *</label>
              <input className={inp} type="password" autoComplete="current-password"
                value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-[11px] text-red-400 font-mono">
                <AlertCircle size={10} className="shrink-0" /> {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 text-sm font-mono font-semibold rounded-[3px] flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #0E1F3D 100%)", color: "white" }}>
              {loading
                ? <><span className="animate-spin inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full" /> Connexion…</>
                : <>Accéder au workspace <ChevronRight size={14} /></>}
            </button>
          </form>

          {/* Hint */}
          <div className="border-t border-white/6 pt-4 space-y-1.5">
            <p className="text-[10px] font-mono text-white/20 text-center">
              Commune : <span className="text-white/40">admin@</span><span className="text-[#FCD116]/50">commune</span><span className="text-white/40">.gn</span>
              &nbsp;·&nbsp; {COMMUNES_GUINEE.length} espaces actifs
            </p>
            <p className="text-[9px] font-mono text-white/12 text-center">Accès administrateur plateforme via identifiant dédié</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Modal ─────────────────────────────────────────────────────────────

type PayMethod = "visa" | "orange" | "bank" | "agency";
type PayStep = "method" | "form" | "processing" | "otp" | "success";

function fmtCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function fmtExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
}
function genRef() {
  return "SNRR-" + Math.random().toString(36).toUpperCase().slice(2, 8) + "-" + Date.now().toString().slice(-4);
}

function PaymentModal({ plan, annual, onClose, onSuccess }: {
  plan: { name: string; priceMonthly: string; priceAnnual: string; currency: string };
  annual: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [method, setMethod] = useState<PayMethod>("visa");
  const [step, setStep] = useState<PayStep>("method");
  const [card, setCard] = useState({ num: "", exp: "", cvv: "", name: "" });
  const [orange, setOrange] = useState({ phone: "", otp: "" });
  const [bank, setBank] = useState({ holder: "", iban: "", bankName: "", amount: "" });
  const [agency, setAgency] = useState({ wilaya: "", nom: "", phone: "" });
  const [ref] = useState(genRef);
  const [otpSent, setOtpSent] = useState(false);
  const [err, setErr] = useState("");

  const price = annual ? plan.priceAnnual : plan.priceMonthly;
  const totalLabel = annual ? `${plan.priceAnnual} GNF × 12 = 48 000 000 GNF` : `${plan.priceMonthly} GNF`;

  const METHODS: { id: PayMethod; label: string; sub: string; icon: React.ReactNode }[] = [
    {
      id: "visa", label: "Carte bancaire", sub: "VISA · Mastercard",
      icon: <svg viewBox="0 0 38 24" className="w-9 h-5"><rect width="38" height="24" rx="3" fill="#1A1F71" /><text x="4" y="17" fill="white" fontSize="11" fontWeight="700" fontFamily="Arial">VISA</text></svg>
    },
    {
      id: "orange", label: "Orange Money", sub: "Paiement mobile",
      icon: <svg viewBox="0 0 32 32" className="w-7 h-7"><circle cx="16" cy="16" r="16" fill="#FF6600" /><circle cx="16" cy="16" r="9" fill="white" /><circle cx="16" cy="16" r="5" fill="#FF6600" /></svg>
    },
    {
      id: "bank", label: "Virement bancaire", sub: "Tous établissements",
      icon: <svg viewBox="0 0 28 24" className="w-7 h-6" fill="none"><rect x="1" y="10" width="26" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" /><path d="M14 2L2 8h24L14 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><rect x="5" y="13" width="3" height="6" fill="currentColor" /><rect x="12.5" y="13" width="3" height="6" fill="currentColor" /><rect x="20" y="13" width="3" height="6" fill="currentColor" /></svg>
    },
    {
      id: "agency", label: "Espèce en agence", sub: "Versement en cash",
      icon: <svg viewBox="0 0 28 22" className="w-7 h-6" fill="none"><rect x="1" y="4" width="26" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" /><circle cx="14" cy="11.5" r="3.5" stroke="currentColor" strokeWidth="1.5" /><path d="M1 8h4M23 8h4M1 15h4M23 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
    },
  ];

  const simulate = (next: PayStep) => {
    setErr("");
    setStep("processing");
    setTimeout(() => setStep(next), 1800);
  };

  const handleVisa = (e: React.FormEvent) => {
    e.preventDefault();
    if (card.num.replace(/\s/g, "").length < 16) { setErr("Numéro de carte incomplet"); return; }
    if (card.exp.length < 5) { setErr("Date d'expiration invalide"); return; }
    if (card.cvv.length < 3) { setErr("CVV invalide"); return; }
    simulate("success");
  };

  const handleOrangeSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (orange.phone.replace(/\D/g, "").length < 9) { setErr("Numéro invalide"); return; }
    setErr(""); setStep("processing");
    setTimeout(() => { setOtpSent(true); setStep("otp"); }, 1500);
  };

  const handleOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (orange.otp.length < 4) { setErr("Code invalide"); return; }
    simulate("success");
  };

  const handleBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bank.holder || !bank.iban || !bank.bankName) { setErr("Remplissez tous les champs"); return; }
    simulate("success");
  };

  const handleAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency.nom || !agency.phone) { setErr("Remplissez tous les champs"); return; }
    simulate("success");
  };

  const inp = "w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/12 rounded-[3px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]/60 font-mono transition-colors";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A1628] border border-white/10 rounded-[4px] w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Tricolor stripe */}
        <div className="h-[3px] flex rounded-t-[4px] overflow-hidden sticky top-0">
          <div className="flex-1 bg-[#CE1126]" /><div className="flex-1 bg-[#FCD116]" /><div className="flex-1 bg-[#009460]" />
        </div>

        <div className="p-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-white text-xl font-light mb-0.5" style={{ fontFamily: "'Crimson Pro', serif" }}>
                {step === "success" ? "Paiement confirmé" : "Paiement sécurisé"}
              </h2>
              <p className="text-white/40 text-[11px] font-mono">
                Forfait {plan.name} · <span className="text-[#FCD116]">{price} {plan.currency}/mois</span>
                {annual && " · abonnement annuel"}
              </p>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1"><X size={18} /></button>
          </div>

          {/* Order summary strip */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/4 border border-white/8 rounded-[3px] mb-6">
            <div>
              <p className="text-white/50 text-[9px] font-mono uppercase tracking-widest">Montant total</p>
              <p className="text-white text-base font-bold font-mono mt-0.5">{totalLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-[9px] font-mono uppercase tracking-widest">Référence</p>
              <p className="text-[#FCD116] text-[11px] font-mono mt-0.5">{ref}</p>
            </div>
          </div>

          {/* ── PROCESSING ── */}
          {step === "processing" && (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-full border-2 border-[#1B3A6B]/40 border-t-[#FCD116] animate-spin mx-auto" />
              <p className="text-white/60 text-[12px] font-mono">Traitement en cours…</p>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#009460]/15 border border-[#009460]/30 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-[#009460]" />
              </div>
              <div>
                <p className="text-white text-lg font-medium" style={{ fontFamily: "'Crimson Pro', serif" }}>
                  {method === "bank" ? "Ordre de virement enregistré" : method === "agency" ? "Bon de versement généré" : "Paiement accepté !"}
                </p>
                <p className="text-white/40 text-[11px] font-mono mt-1.5">
                  {method === "bank"
                    ? "Effectuez le virement avec la référence ci-dessous. Votre compte sera activé dès réception."
                    : method === "agency"
                    ? "Présentez cette référence en agence pour effectuer le versement."
                    : "Votre abonnement est activé. Accédez à votre espace de gestion."}
                </p>
              </div>
              {(method === "bank" || method === "agency") && (
                <div className="bg-[#1B3A6B]/20 border border-[#1B3A6B]/30 rounded-[3px] p-4 text-left space-y-2">
                  <p className="text-white/40 text-[9px] font-mono uppercase tracking-widest mb-3">Instructions de paiement</p>
                  {method === "bank" && <>
                    <p className="text-white/70 text-[11px] font-mono"><span className="text-white/35">Banque :</span> Société Générale Guinée / BICIGUI</p>
                    <p className="text-white/70 text-[11px] font-mono"><span className="text-white/35">Titulaire :</span> RITS GUINEE SARL</p>
                    <p className="text-white/70 text-[11px] font-mono"><span className="text-white/35">IBAN :</span> GN61 0001 0000 1234 5678 9012 345</p>
                    <p className="text-white/70 text-[11px] font-mono"><span className="text-white/35">Objet :</span> {ref}</p>
                    <p className="text-white/70 text-[11px] font-mono"><span className="text-white/35">Montant :</span> {totalLabel}</p>
                  </>}
                  {method === "agency" && <>
                    <p className="text-white/70 text-[11px] font-mono"><span className="text-white/35">Bénéficiaire :</span> RITS GUINEE SARL</p>
                    <p className="text-white/70 text-[11px] font-mono"><span className="text-white/35">Référence :</span> <span className="text-[#FCD116]">{ref}</span></p>
                    <p className="text-white/70 text-[11px] font-mono"><span className="text-white/35">Montant :</span> {totalLabel}</p>
                    <p className="text-white/70 text-[11px] font-mono"><span className="text-white/35">Agences :</span> Conakry · Kindia · Kankan · Labé · N'Zérékoré</p>
                  </>}
                  <p className="text-white/30 text-[9px] font-mono pt-1">Contact : {CONTACT_PHONE} · {CONTACT_EMAIL}</p>
                </div>
              )}
              <button onClick={onSuccess}
                className="w-full py-3.5 text-sm font-mono font-semibold rounded-[3px] transition-all hover:opacity-90 mt-4"
                style={{ background: "linear-gradient(135deg, #009460 0%, #006040 100%)", color: "white" }}>
                {method === "bank" || method === "agency" ? "Compris, je vais effectuer le paiement" : "Accéder à mon espace"}
              </button>
            </div>
          )}

          {/* ── METHOD SELECTOR ── */}
          {step === "method" && (
            <>
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {METHODS.map(m => (
                  <button key={m.id} onClick={() => setMethod(m.id)}
                    className={`flex items-center gap-3 px-3.5 py-3.5 border rounded-[3px] text-left transition-all ${method === m.id ? "border-[#1B3A6B] bg-[#1B3A6B]/15" : "border-white/10 hover:border-white/20 bg-white/3"}`}>
                    <span className={method === m.id ? "opacity-100" : "opacity-50"}>{m.icon}</span>
                    <span>
                      <p className="text-white text-[12px] font-mono font-medium leading-tight">{m.label}</p>
                      <p className="text-white/35 text-[9px] font-mono">{m.sub}</p>
                    </span>
                    {method === m.id && <div className="ml-auto w-2 h-2 rounded-full bg-[#FCD116] shrink-0" />}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep("form")}
                className="w-full py-3.5 text-sm font-mono font-semibold rounded-[3px] flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #CE1126 0%, #8B0A1A 100%)", color: "white" }}>
                Continuer avec {METHODS.find(m => m.id === method)?.label} <ArrowRight size={14} />
              </button>
            </>
          )}

          {/* ── VISA FORM ── */}
          {step === "form" && method === "visa" && (
            <form onSubmit={handleVisa} className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <button type="button" onClick={() => setStep("method")} className="text-white/30 hover:text-white transition-colors"><ChevronRight size={14} className="rotate-180" /></button>
                <p className="text-white/50 text-[10px] font-mono uppercase tracking-widest">Paiement par carte bancaire</p>
              </div>
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Numéro de carte</label>
                <div className="relative">
                  <input className={inp} value={card.num} onChange={e => setCard(c => ({ ...c, num: fmtCard(e.target.value) }))}
                    placeholder="4111 1111 1111 1111" maxLength={19} autoFocus />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg viewBox="0 0 38 24" className="w-7 h-4"><rect width="38" height="24" rx="3" fill="#1A1F71" /><text x="4" y="17" fill="white" fontSize="11" fontWeight="700" fontFamily="Arial">VISA</text></svg>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Expiration (MM/AA)</label>
                  <input className={inp} value={card.exp} onChange={e => setCard(c => ({ ...c, exp: fmtExpiry(e.target.value) }))} placeholder="12/27" maxLength={5} />
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1.5">CVV</label>
                  <input className={inp} value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))} placeholder="•••" type="password" maxLength={4} />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Titulaire de la carte</label>
                <input className={inp} value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value }))} placeholder="AMADOU DIALLO" />
              </div>
              {err && <p className="text-[#CE1126] text-[11px] font-mono flex items-center gap-1.5"><AlertCircle size={12} />{err}</p>}
              <div className="flex items-center gap-2 px-3 py-2.5 bg-white/3 border border-white/8 rounded-[3px]">
                <Shield size={11} className="text-[#009460]" />
                <p className="text-white/30 text-[10px] font-mono">Connexion sécurisée SSL 256-bit · PCI DSS compliant</p>
              </div>
              <button type="submit" className="w-full py-3.5 text-sm font-mono font-semibold rounded-[3px] transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #CE1126 0%, #8B0A1A 100%)", color: "white" }}>
                Payer {price} GNF
              </button>
            </form>
          )}

          {/* ── ORANGE MONEY FORM ── */}
          {step === "form" && method === "orange" && (
            <form onSubmit={handleOrangeSend} className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <button type="button" onClick={() => setStep("method")} className="text-white/30 hover:text-white transition-colors"><ChevronRight size={14} className="rotate-180" /></button>
                <p className="text-white/50 text-[10px] font-mono uppercase tracking-widest">Orange Money Guinée</p>
              </div>
              <div className="flex justify-center py-3">
                <svg viewBox="0 0 64 64" className="w-16 h-16"><circle cx="32" cy="32" r="32" fill="#FF6600" /><circle cx="32" cy="32" r="18" fill="white" /><circle cx="32" cy="32" r="10" fill="#FF6600" /></svg>
              </div>
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Numéro Orange Money</label>
                <input className={inp} value={orange.phone} type="tel"
                  onChange={e => setOrange(o => ({ ...o, phone: e.target.value }))}
                  placeholder="+224 6XX XXX XXX" autoFocus />
              </div>
              <div className="px-3 py-3 bg-[#FF6600]/8 border border-[#FF6600]/20 rounded-[3px] space-y-1">
                <p className="text-[#FF6600] text-[10px] font-mono font-semibold">Comment ça marche :</p>
                <p className="text-white/40 text-[10px] font-mono">1. Entrez votre numéro Orange Money</p>
                <p className="text-white/40 text-[10px] font-mono">2. Recevez un code OTP par SMS</p>
                <p className="text-white/40 text-[10px] font-mono">3. Confirmez le paiement de {price} GNF</p>
              </div>
              {err && <p className="text-[#CE1126] text-[11px] font-mono flex items-center gap-1.5"><AlertCircle size={12} />{err}</p>}
              <button type="submit" className="w-full py-3.5 text-sm font-mono font-semibold rounded-[3px] transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #FF6600 0%, #CC4400 100%)", color: "white" }}>
                Recevoir le code OTP
              </button>
            </form>
          )}

          {/* ── OTP STEP ── */}
          {step === "otp" && (
            <form onSubmit={handleOtp} className="space-y-4">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full bg-[#FF6600]/15 border border-[#FF6600]/30 flex items-center justify-center mx-auto mb-3">
                  <Phone size={20} className="text-[#FF6600]" />
                </div>
                <p className="text-white text-[13px] font-mono">Code OTP envoyé</p>
                <p className="text-white/40 text-[11px] font-mono mt-1">SMS envoyé au <span className="text-white/70">{orange.phone}</span></p>
              </div>
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Code OTP (4-6 chiffres)</label>
                <input className={`${inp} text-center text-2xl tracking-[0.3em]`} value={orange.otp}
                  onChange={e => setOrange(o => ({ ...o, otp: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                  placeholder="••••••" autoFocus maxLength={6} />
              </div>
              <div className="px-3 py-2.5 bg-white/3 border border-white/8 rounded-[3px]">
                <p className="text-white/30 text-[10px] font-mono">Montant débité : <span className="text-[#FF6600]">{price} GNF</span> depuis {orange.phone}</p>
              </div>
              {err && <p className="text-[#CE1126] text-[11px] font-mono flex items-center gap-1.5"><AlertCircle size={12} />{err}</p>}
              <button type="submit" className="w-full py-3.5 text-sm font-mono font-semibold rounded-[3px] transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #FF6600 0%, #CC4400 100%)", color: "white" }}>
                Confirmer le paiement
              </button>
              <button type="button" onClick={() => { setStep("form"); setOtpSent(false); }}
                className="w-full py-2 text-[11px] font-mono text-white/30 hover:text-white/60 transition-colors">
                Changer de numéro
              </button>
            </form>
          )}

          {/* ── BANK FORM ── */}
          {step === "form" && method === "bank" && (
            <form onSubmit={handleBank} className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <button type="button" onClick={() => setStep("method")} className="text-white/30 hover:text-white transition-colors"><ChevronRight size={14} className="rotate-180" /></button>
                <p className="text-white/50 text-[10px] font-mono uppercase tracking-widest">Virement bancaire</p>
              </div>
              {/* Recipient info */}
              <div className="px-4 py-3 bg-[#1B3A6B]/15 border border-[#1B3A6B]/25 rounded-[3px] space-y-1.5 mb-2">
                <p className="text-white/40 text-[9px] font-mono uppercase tracking-widest mb-2">Coordonnées bénéficiaire</p>
                <p className="text-white/70 text-[11px] font-mono"><span className="text-white/35">Titulaire : </span>RITS GUINEE SARL</p>
                <p className="text-white/70 text-[11px] font-mono"><span className="text-white/35">Banque : </span>BICIGUI / Société Générale Guinée</p>
                <p className="text-white/70 text-[11px] font-mono"><span className="text-white/35">IBAN : </span>GN61 0001 0000 1234 5678 9012 345</p>
                <p className="text-white/70 text-[11px] font-mono"><span className="text-white/35">Montant : </span><span className="text-[#FCD116]">{totalLabel}</span></p>
                <p className="text-white/70 text-[11px] font-mono"><span className="text-white/35">Référence : </span><span className="text-[#FCD116]">{ref}</span></p>
              </div>
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Votre nom / institution *</label>
                <input className={inp} value={bank.holder} onChange={e => setBank(b => ({ ...b, holder: e.target.value }))} placeholder="Mairie de Kindia" autoFocus required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Votre banque *</label>
                  <input className={inp} value={bank.bankName} onChange={e => setBank(b => ({ ...b, bankName: e.target.value }))} placeholder="BICIGUI" required />
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1.5">N° de compte</label>
                  <input className={inp} value={bank.iban} onChange={e => setBank(b => ({ ...b, iban: e.target.value }))} placeholder="GN61 ..." required />
                </div>
              </div>
              {err && <p className="text-[#CE1126] text-[11px] font-mono flex items-center gap-1.5"><AlertCircle size={12} />{err}</p>}
              <button type="submit" className="w-full py-3.5 text-sm font-mono font-semibold rounded-[3px] transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #0E1F3D 100%)", color: "white" }}>
                Valider le virement
              </button>
            </form>
          )}

          {/* ── AGENCY FORM ── */}
          {step === "form" && method === "agency" && (
            <form onSubmit={handleAgency} className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <button type="button" onClick={() => setStep("method")} className="text-white/30 hover:text-white transition-colors"><ChevronRight size={14} className="rotate-180" /></button>
                <p className="text-white/50 text-[10px] font-mono uppercase tracking-widest">Espèce en agence</p>
              </div>
              <div className="px-4 py-3 bg-white/4 border border-white/10 rounded-[3px] space-y-1 mb-2">
                <p className="text-white/40 text-[9px] font-mono uppercase tracking-widest mb-2">Agences disponibles</p>
                {["Conakry (Kaloum)", "Kindia", "Kankan", "Labé", "N'Zérékoré", "Mamou", "Faranah"].map(a => (
                  <p key={a} className="text-white/50 text-[10px] font-mono flex items-center gap-1.5"><MapPin size={8} className="text-[#009460]" />{a}</p>
                ))}
              </div>
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Votre nom complet *</label>
                <input className={inp} value={agency.nom} onChange={e => setAgency(a => ({ ...a, nom: e.target.value }))} placeholder="Amadou Diallo" autoFocus required />
              </div>
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Téléphone *</label>
                <input className={inp} type="tel" value={agency.phone} onChange={e => setAgency(a => ({ ...a, phone: e.target.value }))} placeholder="+224 6XX XXX XXX" required />
              </div>
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Agence préférée</label>
                <select className={`${inp} appearance-none`} value={agency.wilaya} onChange={e => setAgency(a => ({ ...a, wilaya: e.target.value }))}>
                  <option value="">Choisir une agence</option>
                  {["Conakry (Kaloum)", "Kindia", "Kankan", "Labé", "N'Zérékoré", "Mamou", "Faranah"].map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div className="px-3 py-2.5 bg-[#FCD116]/8 border border-[#FCD116]/20 rounded-[3px]">
                <p className="text-[#FCD116] text-[10px] font-mono">Montant à verser : <span className="font-bold">{price} GNF</span></p>
                <p className="text-white/30 text-[9px] font-mono mt-0.5">Présentez la référence <span className="text-[#FCD116]">{ref}</span> au guichet</p>
              </div>
              {err && <p className="text-[#CE1126] text-[11px] font-mono flex items-center gap-1.5"><AlertCircle size={12} />{err}</p>}
              <button type="submit" className="w-full py-3.5 text-sm font-mono font-semibold rounded-[3px] transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #CE1126 0%, #8B0A1A 100%)", color: "white" }}>
                Générer mon bon de versement
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Contact Modal ─────────────────────────────────────────────────────────────

const CONTACT_EMAIL = "ritsguinee@gmail.com";
const CONTACT_PHONE = "+224 626 001 110";

function ContactModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ nom: "", commune: "", email: "", tel: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.email || !form.message) return;
    setLoading(true);
    const subject = encodeURIComponent(`[PLATFORM SNRR] Demande Préfecture — ${form.commune || form.nom}`);
    const body = encodeURIComponent(
      `Nom : ${form.nom}\nOrganisation : ${form.commune}\nEmail : ${form.email}\nTéléphone : ${form.tel}\n\n${form.message}`
    );
    setTimeout(() => {
      window.open(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`, "_blank");
      setSent(true);
      setLoading(false);
    }, 600);
  };

  const inp = "w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/12 rounded-[3px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]/50 font-mono transition-colors resize-none";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A1628] border border-white/10 rounded-[4px] w-full max-w-lg shadow-2xl">
        <div className="h-[3px] flex rounded-t-[4px] overflow-hidden">
          <div className="flex-1 bg-[#CE1126]" /><div className="flex-1 bg-[#FCD116]" /><div className="flex-1 bg-[#009460]" />
        </div>
        <div className="p-7">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-white text-xl font-light mb-0.5" style={{ fontFamily: "'Crimson Pro', serif" }}>
                Forfait Préfecture
              </h2>
              <p className="text-white/40 text-[11px] font-mono">Contactez notre équipe pour un devis personnalisé</p>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1"><X size={18} /></button>
          </div>

          {/* Contact info strip */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <a href={`mailto:${CONTACT_EMAIL}`}
              className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 bg-white/4 border border-white/10 rounded-[3px] hover:border-white/20 transition-colors group">
              <Mail size={13} className="text-[#009460] shrink-0" />
              <span className="text-white/60 text-[11px] font-mono group-hover:text-white transition-colors truncate">{CONTACT_EMAIL}</span>
            </a>
            <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
              className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 bg-white/4 border border-white/10 rounded-[3px] hover:border-white/20 transition-colors group">
              <Phone size={13} className="text-[#FCD116] shrink-0" />
              <span className="text-white/60 text-[11px] font-mono group-hover:text-white transition-colors">{CONTACT_PHONE}</span>
            </a>
          </div>

          {sent ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#009460]/15 border border-[#009460]/30 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} className="text-[#009460]" />
              </div>
              <div>
                <p className="text-white text-base font-medium" style={{ fontFamily: "'Crimson Pro', serif" }}>Message transmis !</p>
                <p className="text-white/40 text-[12px] font-mono mt-1">Votre client mail s{"'"}est ouvert avec le message pré-rempli.</p>
                <p className="text-white/30 text-[11px] font-mono mt-1">Notre équipe vous répondra dans les 24h.</p>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <p className="text-white/35 text-[11px] font-mono">Ou contactez-nous directement :</p>
                <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
                  className="inline-flex items-center justify-center gap-2 text-[#FCD116] text-[13px] font-mono font-semibold hover:underline">
                  <Phone size={12} /> {CONTACT_PHONE}
                </a>
              </div>
              <button onClick={onClose}
                className="mt-4 w-full py-3 text-[12px] font-mono border border-white/15 rounded-[3px] text-white/60 hover:text-white hover:bg-white/5 transition-all">
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Nom complet *</label>
                  <input className={inp} value={form.nom} onChange={set("nom")} placeholder="Amadou Diallo" autoFocus required />
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Préfecture / Commune</label>
                  <input className={inp} value={form.commune} onChange={set("commune")} placeholder="Préfecture de Kindia" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Email *</label>
                  <input className={inp} type="email" value={form.email} onChange={set("email")} placeholder="direction@prefecture.gn" required />
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Téléphone</label>
                  <input className={inp} type="tel" value={form.tel} onChange={set("tel")} placeholder="+224 6XX XXX XXX" />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-white/40 mb-1.5">Message *</label>
                <textarea className={`${inp} h-24`} value={form.message} onChange={set("message")}
                  placeholder="Décrivez vos besoins : nombre de communes, modules souhaités, délai de déploiement…"
                  required />
              </div>

              {/* Features reminder */}
              <div className="bg-[#1B3A6B]/12 border border-[#1B3A6B]/25 rounded-[3px] px-4 py-3">
                <p className="text-white/50 text-[10px] font-mono mb-2">Inclus dans le forfait Préfecture :</p>
                <div className="grid grid-cols-2 gap-1">
                  {["Multi-communes illimité", "Console centrale", "Rapports consolidés", "Accompagnement dédié"].map(f => (
                    <p key={f} className="text-[10px] font-mono text-white/40 flex items-center gap-1.5">
                      <Check size={9} className="text-[#009460] shrink-0" /> {f}
                    </p>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 text-sm font-mono font-semibold rounded-[3px] flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #0E1F3D 100%)", color: "white" }}>
                {loading
                  ? <><span className="animate-spin w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full inline-block" /> Envoi en cours…</>
                  : <><Mail size={14} /> Envoyer la demande</>}
              </button>
              <p className="text-center text-[9px] font-mono text-white/20">
                Envoyé à {CONTACT_EMAIL} · Réponse sous 24h
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Pricing Section ───────────────────────────────────────────────────────────

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  visa: (
    <svg viewBox="0 0 48 30" className="w-10 h-6 fill-current opacity-70">
      <rect width="48" height="30" rx="4" fill="white" fillOpacity="0.08" />
      <text x="5" y="21" fontSize="13" fontWeight="700" fontFamily="Arial" fill="#FCD116">VISA</text>
    </svg>
  ),
  orange: (
    <svg viewBox="0 0 48 30" className="w-10 h-6">
      <rect width="48" height="30" rx="4" fill="#FF6900" fillOpacity="0.15" />
      <circle cx="24" cy="15" r="7" fill="#FF6900" fillOpacity="0.6" />
      <text x="24" y="26" fontSize="7" fontWeight="600" fontFamily="Arial" fill="white" textAnchor="middle">MONEY</text>
    </svg>
  ),
  bank: (
    <svg viewBox="0 0 48 30" className="w-10 h-6 fill-current opacity-70">
      <rect width="48" height="30" rx="4" fill="white" fillOpacity="0.06" />
      <rect x="8" y="18" width="32" height="3" rx="1" fill="white" fillOpacity="0.4" />
      <polygon points="24,6 8,14 40,14" fill="white" fillOpacity="0.4" />
      <rect x="11" y="14" width="3" height="4" fill="white" fillOpacity="0.3" />
      <rect x="19" y="14" width="3" height="4" fill="white" fillOpacity="0.3" />
      <rect x="26" y="14" width="3" height="4" fill="white" fillOpacity="0.3" />
      <rect x="34" y="14" width="3" height="4" fill="white" fillOpacity="0.3" />
    </svg>
  ),
  cash: (
    <svg viewBox="0 0 48 30" className="w-10 h-6 fill-current opacity-70">
      <rect width="48" height="30" rx="4" fill="white" fillOpacity="0.06" />
      <rect x="8" y="10" width="32" height="10" rx="2" fill="#009460" fillOpacity="0.3" stroke="#009460" strokeOpacity="0.4" strokeWidth="1" />
      <circle cx="24" cy="15" r="3" fill="#009460" fillOpacity="0.5" />
    </svg>
  ),
};

function PricingSection({ tr, onTrial, onPay }: { tr: typeof T.fr; onTrial: () => void; onPay: (annual: boolean) => void }) {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#CE1126] text-[10px] font-mono uppercase tracking-widest mb-3">Tarifs</p>
          <h2 className="text-4xl font-light text-[#111827] mb-4" style={{ fontFamily: "'Crimson Pro', serif" }}>{tr.pricing.title}</h2>
          <p className="text-[#111827]/60 text-base max-w-xl mx-auto font-light">{tr.pricing.sub}</p>

          {/* Monthly / Annual toggle */}
          <div className="inline-flex items-center gap-3 mt-8 bg-[#111827]/5 border border-[#111827]/12 rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-[12px] font-mono transition-all ${!annual ? "bg-[#1B3A6B] text-white shadow" : "text-[#111827]/60 hover:text-[#111827]"}`}>
              {tr.pricing.toggleMonthly}
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-[12px] font-mono transition-all flex items-center gap-2 ${annual ? "bg-[#009460] text-white shadow" : "text-[#111827]/60 hover:text-[#111827]"}`}>
              {tr.pricing.toggleAnnual}
              <span className="text-[9px] px-1.5 py-0.5 bg-[#7A5A00]/12 text-[#7A5A00] rounded-full font-semibold">{tr.pricing.saveBadge}</span>
            </button>
          </div>
          {annual && (
            <p className="text-[10px] font-mono text-[#006040] mt-2">
              ✓ {tr.pricing.annualNote} — total {annual ? "48 000 000" : ""} GNF/an
            </p>
          )}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Trial */}
          <div className="bg-white/80 border border-[#111827]/10 rounded-[4px] p-7 flex flex-col shadow-sm">
            <div className="mb-6">
              <p className="text-[#111827]/55 text-[10px] font-mono uppercase tracking-widest mb-2">{tr.pricing.trial.name}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-bold text-[#111827]" style={{ fontFamily: "'Crimson Pro', serif" }}>{tr.pricing.trial.price}</span>
                <span className="text-[#111827]/50 text-sm font-mono">GNF</span>
              </div>
              <p className="text-[#7A5A00] text-[11px] font-mono mt-1">{tr.pricing.trial.period}</p>
              <p className="text-[#111827]/55 text-[11px] font-mono mt-2 leading-relaxed">{tr.pricing.trial.desc}</p>
            </div>
            <ul className="space-y-2.5 mb-7 flex-1">
              {tr.pricing.trial.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[12px] font-mono text-[#111827]/70">
                  <Check size={11} className="text-[#009460] shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button onClick={onTrial} className="w-full py-3 text-sm font-mono font-semibold border border-[#111827]/20 rounded-[3px] text-[#111827] hover:bg-[#111827]/6 transition-all">
              {tr.pricing.trial.cta}
            </button>
          </div>

          {/* Pro — highlighted */}
          <div className="relative bg-[#0E1F3D] border border-[#1B3A6B]/60 rounded-[4px] p-7 flex flex-col shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#CE1126] text-white text-[10px] font-mono px-3 py-1 rounded-full whitespace-nowrap">
              Recommandé
            </div>
            {annual && (
              <div className="absolute -top-3 right-5 bg-[#009460] text-white text-[9px] font-mono px-2.5 py-1 rounded-full">
                –20%
              </div>
            )}
            <div className="mb-6">
              <p className="text-white/50 text-[10px] font-mono uppercase tracking-widest mb-2">{tr.pricing.pro.name}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-bold text-white" style={{ fontFamily: "'Crimson Pro', serif" }}>
                  {annual ? tr.pricing.pro.priceAnnual : tr.pricing.pro.priceMonthly}
                </span>
                <span className="text-white/40 text-sm font-mono">{tr.pricing.pro.currency}</span>
              </div>
              {annual && (
                <p className="text-white/25 text-[10px] font-mono line-through mt-0.5">{tr.pricing.pro.priceMonthly} GNF/mois</p>
              )}
              <p className="text-[#FCD116] text-[11px] font-mono mt-1">
                {annual ? tr.pricing.annualNote : tr.pricing.monthlyNote}
              </p>
              <p className="text-white/35 text-[11px] font-mono mt-2 leading-relaxed">{tr.pricing.pro.desc}</p>
            </div>
            <ul className="space-y-2.5 mb-7 flex-1">
              {tr.pricing.pro.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[12px] font-mono text-white/70">
                  <Check size={11} className="text-[#FCD116] shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => onPay(annual)} className="w-full py-3 text-sm font-mono font-semibold rounded-[3px] transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #CE1126 0%, #8B0A1A 100%)", color: "white" }}>
              {tr.pricing.pro.cta}
            </button>
          </div>

          {/* Enterprise */}
          <div className="bg-white/80 border border-[#111827]/10 rounded-[4px] p-7 flex flex-col shadow-sm">
            <div className="mb-6">
              <p className="text-[#111827]/55 text-[10px] font-mono uppercase tracking-widest mb-2">{tr.pricing.enterprise.name}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-[#111827]" style={{ fontFamily: "'Crimson Pro', serif" }}>{tr.pricing.enterprise.price}</span>
              </div>
              <p className="text-[#111827]/55 text-[11px] font-mono mt-3 leading-relaxed">{tr.pricing.enterprise.desc}</p>
            </div>
            <ul className="space-y-2.5 mb-7 flex-1">
              {tr.pricing.enterprise.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[12px] font-mono text-[#111827]/70">
                  <Check size={11} className="text-[#4A6B8A] shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => setShowContact(true)} className="w-full py-3 text-sm font-mono font-semibold border border-[#1B3A6B]/50 rounded-[3px] text-[#1B3A6B] hover:bg-[#1B3A6B]/8 transition-all">
              {tr.pricing.enterprise.cta}
            </button>
          </div>
        </div>

        {/* Payment methods */}
        <div className="mt-12 bg-white/70 border border-[#111827]/10 rounded-[4px] p-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#111827]/50 mb-5 text-center">{tr.pricing.payments.title}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tr.pricing.payments.methods.map(m => (
              <div key={m.key} className="flex flex-col items-center gap-2.5 p-4 bg-white/80 border border-[#111827]/10 rounded-[3px] hover:border-[#111827]/20 transition-colors">
                {PAYMENT_ICONS[m.key]}
                <div className="text-center">
                  <p className="text-[11px] font-mono font-semibold text-[#111827]/80">{m.label}</p>
                  <p className="text-[9px] font-mono text-[#111827]/50 mt-0.5 leading-relaxed">{m.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
          {[
            { icon: Shield, l: "SSL & Chiffrement AES-256" },
            { icon: Clock, l: "SLA 99.9% garanti" },
            { icon: Zap, l: "Déploiement 48h" },
            { icon: Globe, l: "Hébergement africain" },
          ].map(b => (
            <div key={b.l} className="flex items-center gap-2 text-[11px] font-mono text-[#111827]/45">
              <b.icon size={12} className="text-[#111827]/35" /> {b.l}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────────

export function SaasLanding({ onEnterApp, onSuperAdmin }: {
  onEnterApp: (tenant: TenantConfig) => void;
  onSuperAdmin: () => void;
}) {
  const [lang, setLang] = useState<Lang>("fr");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showTrial, setShowTrial] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [payAnnual, setPayAnnual] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const tr = T[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMobileMenu(false); };

  return (
    <div className="min-h-screen bg-[#EBF4EC] text-[#111827] overflow-x-hidden">
      {/* Modals */}
      {showTrial && <TrialModal t={tr} onClose={() => setShowTrial(false)} onSuccess={(t) => { setShowTrial(false); onEnterApp(t); }} />}
      {showLogin && <LoginModal t={tr} onClose={() => setShowLogin(false)} onSuccess={(t) => { setShowLogin(false); onEnterApp(t); }} onSuperAdmin={() => { setShowLogin(false); onSuperAdmin(); }} />}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
      {showPayment && (
        <PaymentModal
          plan={tr.pricing.pro}
          annual={payAnnual}
          onClose={() => setShowPayment(false)}
          onSuccess={() => { setShowPayment(false); setShowTrial(true); }}
        />
      )}

      {/* ── NAVBAR ─────────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "bg-[#EBF4EC]/97 backdrop-blur border-b border-[#111827]/10 shadow-sm" : "bg-transparent"}`}>
        {/* Flag strip */}
        <div className="h-[2px] flex">
          <div className="flex-1 bg-[#CE1126]" /><div className="flex-1 bg-[#FCD116]" /><div className="flex-1 bg-[#009460]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-6">
          {/* Logo */}
          <div className="shrink-0">
            <PlatformLogo height={34} />
          </div>

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-6 ml-4">
            {[["features", tr.nav.features], ["pricing", tr.nav.pricing], ["testimonials", tr.nav.testimonials]].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-[#111827]/55 text-[13px] font-mono hover:text-[#111827] transition-colors">{label}</button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Lang toggle */}
          <button onClick={() => setLang(l => l === "fr" ? "en" : "fr")}
            className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-[#111827]/45 hover:text-[#111827]/80 transition-colors border border-[#111827]/12 px-2.5 py-1 rounded-full">
            <Languages size={11} />
            {lang.toUpperCase()}
          </button>

          {/* Super admin hidden trigger (triple-click logo or special combo) */}
          <button onDoubleClick={onSuperAdmin} className="hidden md:flex items-center gap-2 text-[12px] font-mono text-[#111827]/60 hover:text-[#111827] transition-colors" onClick={() => setShowLogin(true)}>
            {tr.nav.login}
          </button>
          <button onClick={() => setShowTrial(true)}
            className="hidden md:flex items-center gap-1.5 text-[12px] font-mono font-semibold px-4 py-2 rounded-[3px] transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #CE1126 0%, #8B0A1A 100%)", color: "white" }}>
            {tr.nav.trial} <ChevronRight size={12} />
          </button>

          {/* Mobile menu */}
          <button className="md:hidden text-[#111827]/65 hover:text-[#111827]" onClick={() => setMobileMenu(m => !m)}>
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileMenu && (
          <div className="md:hidden bg-[#E0EEE1] border-b border-[#111827]/12 px-6 py-4 space-y-3">
            {[["features", tr.nav.features], ["pricing", tr.nav.pricing], ["testimonials", tr.nav.testimonials]].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left text-sm font-mono text-[#111827]/65 hover:text-[#111827] py-1">{label}</button>
            ))}
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setShowLogin(true); setMobileMenu(false); }} className="flex-1 py-2.5 text-sm font-mono border border-[#111827]/20 rounded-[3px] text-[#111827]/65">{tr.nav.login}</button>
              <button onClick={() => { setShowTrial(true); setMobileMenu(false); }} className="flex-1 py-2.5 text-sm font-mono font-semibold rounded-[3px]" style={{ background: "#CE1126", color: "white" }}>{lang === "fr" ? "Essai gratuit" : "Free trial"}</button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px]" style={{ background: "radial-gradient(circle, rgba(0,148,96,0.12) 0%, transparent 70%)" }} />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: "radial-gradient(circle, rgba(206,17,38,0.07) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[80px]" style={{ background: "radial-gradient(circle, rgba(27,58,107,0.08) 0%, transparent 70%)" }} />
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(30,60,32,0.04) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#B8860B]/30 bg-[#B8860B]/8 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] animate-pulse" />
            <span className="text-[#7A5A00] text-[11px] font-mono">{tr.hero.badge}</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light leading-[1.08] mb-6" style={{ fontFamily: "'Crimson Pro', serif" }}>
            {tr.hero.h1a}<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #CE1126 0%, #FCD116 50%, #009460 100%)" }}>
              {tr.hero.h1b}
            </span>
          </h1>

          <p className="text-[#111827]/60 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10 font-light">
            {tr.hero.sub}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <button onClick={() => setShowTrial(true)}
              className="flex items-center gap-2 px-7 py-4 text-sm font-mono font-semibold rounded-[3px] transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #CE1126 0%, #8B0A1A 100%)", color: "white" }}>
              {tr.hero.cta1} <ChevronRight size={14} />
            </button>
            <button onClick={() => scrollTo("features")}
              className="flex items-center gap-2 px-7 py-4 text-sm font-mono text-[#111827]/65 border border-[#111827]/14 rounded-[3px] hover:border-[#111827]/35 hover:text-[#111827] transition-all">
              <Play size={12} fill="currentColor" /> {tr.hero.cta2}
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-3 text-[#111827]/45 text-[12px] font-mono">
            <div className="flex -space-x-1.5">
              {["#CE1126","#1B3A6B","#009460","#B8860B","#4A6B8A"].map((c, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-[#EBF4EC] flex items-center justify-center text-[8px] font-bold text-white" style={{ background: c }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            {tr.hero.social} <strong className="text-[#111827]">40+</strong> {tr.hero.communes}
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="max-w-5xl mx-auto mt-16 relative">
          <div className="bg-[#0A1628] border border-[#111827]/10 rounded-[6px] overflow-hidden shadow-2xl">
            <div className="h-8 bg-[#060E1C] border-b border-white/6 flex items-center gap-2 px-4">
              {["#CE1126","#FCD116","#009460"].map((c,i) => <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
              <span className="text-white/30 text-[10px] font-mono mx-auto">PLATFORM SNRR — Tableau de bord</span>
            </div>
            {/* Fake dashboard tiles */}
            <div className="p-6 grid grid-cols-4 gap-3">
              {[
                { l: "Recettes 2024", v: "2.4 Mrd GNF", c: "#CE1126", up: true },
                { l: "Contribuables", v: "14 872", c: "#1B3A6B", up: true },
                { l: "Taux recouvrement", v: "83.4%", c: "#009460", up: true },
                { l: "Paiements / jour", v: "47", c: "#B8860B", up: false },
              ].map(s => (
                <div key={s.l} className="bg-white/6 border border-white/8 rounded-[3px] p-3">
                  <p className="text-white/40 text-[9px] font-mono uppercase tracking-wider mb-2">{s.l}</p>
                  <p className="text-white font-mono font-bold text-base">{s.v}</p>
                  <p className="text-[9px] font-mono mt-1 flex items-center gap-0.5" style={{ color: s.up ? "#009460" : "#CE1126" }}>
                    {s.up ? "↑" : "↓"} {s.up ? "+12% vs 2023" : "−3 aujourd'hui"}
                  </p>
                </div>
              ))}
              {/* Fake sparklines */}
              <div className="col-span-3 bg-white/6 border border-white/8 rounded-[3px] p-3">
                <p className="text-white/40 text-[9px] font-mono uppercase tracking-wider mb-3">Évolution mensuelle des recettes</p>
                <svg viewBox="0 0 400 60" className="w-full h-12">
                  <polyline points="0,50 35,42 70,38 105,20 140,28 175,15 210,22 245,10 280,18 315,8 350,12 385,5" fill="none" stroke="#CE1126" strokeWidth="2" strokeLinecap="round" />
                  <polyline points="0,55 35,50 70,48 105,40 140,42 175,35 210,38 245,30 280,32 315,25 350,28 385,22" fill="none" stroke="#4A9FFF" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" />
                </svg>
              </div>
              <div className="bg-white/6 border border-white/8 rounded-[3px] p-3 flex flex-col gap-2">
                <p className="text-white/40 text-[9px] font-mono uppercase tracking-wider">Statut système</p>
                {[["API", "#009460"], ["DB", "#009460"], ["Maps", "#009460"], ["Paiements", "#FCD116"]].map(([l, c]) => (
                  <div key={l} className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-white/50">{l}</span>
                    <span className="flex items-center gap-1" style={{ color: c }}><span className="w-1 h-1 rounded-full" style={{ background: c }} />OK</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Glow under dashboard */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 blur-3xl opacity-30" style={{ background: "linear-gradient(90deg, #CE1126, #1B3A6B, #009460)" }} />
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────────────────── */}
      <section className="border-y border-[#111827]/8 bg-[#111827]/3 py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {tr.stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-bold text-[#111827] mb-1" style={{ fontFamily: "'Crimson Pro', serif" }}>{s.v}</p>
              <p className="text-[#111827]/55 text-[10px] font-mono uppercase tracking-widest">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#7A5A00] text-[10px] font-mono uppercase tracking-widest mb-3">Modules</p>
            <h2 className="text-4xl font-light text-[#111827] mb-4" style={{ fontFamily: "'Crimson Pro', serif" }}>{tr.features.title}</h2>
            <p className="text-[#111827]/58 text-base max-w-xl mx-auto font-light">{tr.features.sub}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tr.features.items.map((f, i) => (
              <div key={i} className="bg-white/70 border border-[#111827]/8 rounded-[4px] p-6 hover:bg-white/80 hover:border-[#111827]/14 transition-all group">
                <div className="w-10 h-10 rounded-[3px] flex items-center justify-center mb-4" style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                  <f.icon size={18} style={{ color: f.color }} />
                </div>
                <h3 className="text-[#111827] text-sm font-semibold mb-2">{f.title}</h3>
                <p className="text-[#111827]/55 text-[12px] font-mono leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-y border-[#111827]/8 bg-[#111827]/3">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#009460] text-[10px] font-mono uppercase tracking-widest mb-3">Processus</p>
            <h2 className="text-4xl font-light text-[#111827]" style={{ fontFamily: "'Crimson Pro', serif" }}>{tr.how.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tr.how.steps.map((s, i) => (
              <div key={i} className="relative">
                {i < 2 && <div className="hidden md:block absolute top-5 left-[calc(50%+2rem)] right-0 h-[1px] bg-[#111827]/10" />}
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full border border-[#111827]/14 bg-white/75 flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#7A5A00] text-[11px] font-mono font-bold">{s.n}</span>
                  </div>
                  <h3 className="text-[#111827] font-medium mb-2">{s.t}</h3>
                  <p className="text-[#111827]/55 text-[12px] font-mono leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────────────── */}
      <PricingSection tr={tr} onTrial={() => setShowTrial(true)} onPay={(ann) => { setPayAnnual(ann); setShowPayment(true); }} />

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-20 px-6 border-y border-[#111827]/8 bg-[#111827]/3">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#B8860B] text-[10px] font-mono uppercase tracking-widest mb-3">Témoignages</p>
            <h2 className="text-4xl font-light text-[#111827]" style={{ fontFamily: "'Crimson Pro', serif" }}>{tr.testimonials.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tr.testimonials.items.map((t, i) => (
              <div key={i} className="bg-white/70 border border-[#111827]/8 rounded-[4px] p-6">
                <Stars n={t.rating} />
                <p className="text-[#111827]/70 text-[13px] font-light leading-relaxed mt-4 mb-5 italic">{"\"" + t.text + "\""}</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: ["#CE1126","#1B3A6B","#009460"][i] }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[#111827] text-[12px] font-semibold">{t.name}</p>
                    <p className="text-[#111827]/50 text-[10px] font-mono">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#009460]/25 bg-[#009460]/8 rounded-full mb-6">
            <TrendingUp size={11} className="text-[#009460]" />
            <span className="text-[#009460] text-[10px] font-mono">+156% de recouvrement moyen en 12 mois</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-[#111827] mb-4" style={{ fontFamily: "'Crimson Pro', serif" }}>{tr.cta.title}</h2>
          <p className="text-[#111827]/58 text-base mb-8 font-light">{tr.cta.sub}</p>
          <button onClick={() => setShowTrial(true)}
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-mono font-semibold rounded-[3px] transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #CE1126 0%, #8B0A1A 100%)", color: "white" }}>
            {tr.cta.btn} <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#111827]/8 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="mb-2">
              <PlatformLogo height={30} />
            </div>
            <p className="text-[#111827]/40 text-[11px] font-mono">{tr.footer.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-5">
            {tr.footer.links.map(l => <a key={l} href="#" className="text-[#111827]/40 text-[11px] font-mono hover:text-[#111827]/60 transition-colors">{l}</a>)}
            <button onDoubleClick={onSuperAdmin} className="text-[#111827]/20 text-[10px] font-mono hover:text-[#111827]/35 transition-colors">Admin</button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#111827]/35">
              <span className="w-1.5 h-1.5 rounded-full bg-[#009460] animate-pulse" />
              Système opérationnel
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-white/5 text-center text-[#111827]/28 text-[10px] font-mono">
          © {new Date().getFullYear()} {tr.footer.copy}
        </div>
      </footer>
    </div>
  );
}
