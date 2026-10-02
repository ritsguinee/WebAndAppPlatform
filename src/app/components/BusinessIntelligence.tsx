import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis,
} from "recharts";
import {
  TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle2,
  Calendar, Download, Filter, RefreshCw, Zap, BarChart3,
  PieChart as PieChartIcon, Activity, DollarSign, Users,
  MapPin, ArrowUpRight, ArrowDownRight, Percent, Clock,
  Award, AlertTriangle, ChevronRight, Eye,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KPI {
  id: string;
  label: string;
  value: string;
  change: number;
  status: "up" | "down" | "stable";
  icon: React.ReactNode;
  color: string;
}

interface PredictionData {
  mois: string;
  reel?: number;
  prevu: number;
  min: number;
  max: number;
}

interface QuartierPerformance {
  quartier: string;
  recouvrement: number;
  objectif: number;
  contribuables: number;
  montant: number;
}

interface AnalyseComparative {
  categorie: string;
  actuel: number;
  precedent: number;
  objectif: number;
}

// ─── Données ──────────────────────────────────────────────────────────────────

const KPI_DATA: KPI[] = [
  {
    id: "recettes",
    label: "Recettes du mois",
    value: "43.9M GNF",
    change: 12.5,
    status: "up",
    icon: <DollarSign size={20} />,
    color: "#2E6B3E",
  },
  {
    id: "taux",
    label: "Taux de recouvrement",
    value: "83%",
    change: 5.2,
    status: "up",
    icon: <Target size={20} />,
    color: "#1B3A6B",
  },
  {
    id: "contribuables",
    label: "Contribuables recensés",
    value: "6,436",
    change: 8.7,
    status: "up",
    icon: <Users size={20} />,
    color: "#B8860B",
  },
  {
    id: "arrierés",
    label: "Arriérés",
    value: "8.2M GNF",
    change: -3.2,
    status: "down",
    icon: <AlertTriangle size={20} />,
    color: "#CE1126",
  },
];

// Prédictions sur 6 mois avec intervalle de confiance
const PREDICTIONS: PredictionData[] = [
  { mois: "Jan", reel: 25500000, prevu: 25500000, min: 24000000, max: 27000000 },
  { mois: "Fév", reel: 29200000, prevu: 29200000, min: 27500000, max: 31000000 },
  { mois: "Mar", reel: 34500000, prevu: 34500000, min: 32500000, max: 36500000 },
  { mois: "Avr", reel: 31400000, prevu: 31400000, min: 29500000, max: 33500000 },
  { mois: "Mai", reel: 39000000, prevu: 39000000, min: 36500000, max: 41500000 },
  { mois: "Jun", reel: 43900000, prevu: 43900000, min: 41000000, max: 46500000 },
  { mois: "Jul", prevu: 46500000, min: 43000000, max: 50000000 },
  { mois: "Aoû", prevu: 49200000, min: 45500000, max: 53000000 },
  { mois: "Sep", prevu: 52800000, min: 48500000, max: 57000000 },
  { mois: "Oct", prevu: 55300000, min: 51000000, max: 60000000 },
  { mois: "Nov", prevu: 58900000, min: 54000000, max: 64000000 },
  { mois: "Déc", prevu: 62500000, min: 57500000, max: 68000000 },
];

// Performance par quartier avec objectifs
const QUARTIER_PERFORMANCE: QuartierPerformance[] = [
  { quartier: "Centre-ville", recouvrement: 78, objectif: 85, contribuables: 1842, montant: 42800000 },
  { quartier: "Donghol Touma", recouvrement: 83, objectif: 80, contribuables: 823, montant: 21600000 },
  { quartier: "Sikhourou", recouvrement: 71, objectif: 75, contribuables: 1204, montant: 28400000 },
  { quartier: "Porédaka", recouvrement: 68, objectif: 70, contribuables: 542, montant: 11800000 },
  { quartier: "Gongoré", recouvrement: 65, objectif: 75, contribuables: 986, montant: 18200000 },
  { quartier: "Saré Koura", recouvrement: 59, objectif: 65, contribuables: 614, montant: 14100000 },
  { quartier: "Téguéréya", recouvrement: 55, objectif: 60, contribuables: 425, montant: 8900000 },
];

// Analyse comparative (actuel vs précédent vs objectif)
const ANALYSES_COMPARATIVES: AnalyseComparative[] = [
  { categorie: "CFU Résidentiel", actuel: 21300000, precedent: 18900000, objectif: 23000000 },
  { categorie: "CFU Commercial", actuel: 14200000, precedent: 12600000, objectif: 15000000 },
  { categorie: "Patentes", actuel: 8500000, precedent: 7800000, objectif: 9000000 },
  { categorie: "Marchés", actuel: 5300000, precedent: 4700000, objectif: 6000000 },
  { categorie: "Domaine public", actuel: 3100000, precedent: 2800000, objectif: 3500000 },
];

// Données radar - performance multi-critères
const PERFORMANCE_RADAR = [
  {
    critere: "Recensement",
    score: 85,
    objectif: 90,
  },
  {
    critere: "Recouvrement",
    score: 83,
    objectif: 85,
  },
  {
    critere: "Digitalisation",
    score: 92,
    objectif: 95,
  },
  {
    critere: "Satisfaction",
    score: 78,
    objectif: 80,
  },
  {
    critere: "Transparence",
    score: 95,
    objectif: 90,
  },
  {
    critere: "Efficacité",
    score: 88,
    objectif: 85,
  },
];

// Corrélation surface vs recettes
const CORRELATION_DATA = [
  { surface: 50, recettes: 850000, quartier: "Centre-ville" },
  { surface: 85, recettes: 1450000, quartier: "Centre-ville" },
  { surface: 120, recettes: 1950000, quartier: "Sikhourou" },
  { surface: 180, recettes: 2850000, quartier: "Sikhourou" },
  { surface: 95, recettes: 1620000, quartier: "Gongoré" },
  { surface: 240, recettes: 3400000, quartier: "Donghol Touma" },
  { surface: 165, recettes: 2250000, quartier: "Téguéréya" },
  { surface: 320, recettes: 4800000, quartier: "Centre-ville" },
  { surface: 420, recettes: 6200000, quartier: "Saré Koura" },
  { surface: 75, recettes: 1280000, quartier: "Porédaka" },
];

// ─── Composants ───────────────────────────────────────────────────────────────

function KPICard({ kpi }: { kpi: KPI }) {
  return (
    <div className="bg-card border border-border rounded-sm p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className="p-2.5 rounded-sm"
          style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}
        >
          {kpi.icon}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-mono ${
          kpi.status === "up" 
            ? "bg-emerald-50 text-emerald-700" 
            : kpi.status === "down"
            ? "bg-red-50 text-red-700"
            : "bg-slate-50 text-slate-700"
        }`}>
          {kpi.status === "up" ? <TrendingUp size={12} /> : kpi.status === "down" ? <TrendingDown size={12} /> : <Activity size={12} />}
          {Math.abs(kpi.change)}%
        </div>
      </div>
      <h3 className="text-2xl font-bold font-mono tracking-tight mb-1" style={{ fontFamily: "'Crimson Pro', serif" }}>
        {kpi.value}
      </h3>
      <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{kpi.label}</p>
    </div>
  );
}

function InsightCard({ 
  title, 
  description, 
  type = "info",
  action,
}: { 
  title: string; 
  description: string; 
  type?: "info" | "warning" | "success" | "danger";
  action?: { label: string; onClick: () => void };
}) {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    danger: "bg-red-50 border-red-200 text-red-900",
  };

  const icons = {
    info: <AlertCircle size={16} />,
    warning: <AlertTriangle size={16} />,
    success: <CheckCircle2 size={16} />,
    danger: <AlertTriangle size={16} />,
  };

  return (
    <div className={`border rounded-sm p-4 ${styles[type]}`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold mb-1">{title}</h4>
          <p className="text-xs leading-relaxed opacity-90">{description}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-xs font-mono hover:underline flex items-center gap-1"
            >
              {action.label} <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function BusinessIntelligence() {
  const [periode, setPeriode] = useState<"mois" | "trimestre" | "annee">("mois");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleExportRapport = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const W = 297; const M = 15; const CW = W - M * 2;
      let y = 14;

      // En-tête
      doc.setFillColor(27, 58, 107); doc.rect(0, 0, W, 18, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(255, 255, 255);
      doc.text("SNRR-MAMOU — RAPPORT BUSINESS INTELLIGENCE", M, 11);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(200, 200, 255);
      const pd = periode === "mois" ? "Mois en cours" : periode === "trimestre" ? "Trimestre" : "Année fiscale";
      doc.text(`Période : ${pd} · Généré le ${new Date().toLocaleDateString("fr-FR")}`, W - M, 11, { align: "right" });
      y = 28;

      // KPI section
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(27, 58, 107);
      doc.text("INDICATEURS CLÉS DE PERFORMANCE", M, y); y += 6;
      const kpiData = [
        ["Recettes collectées", "98,2 M GNF", "+12.4%"],
        ["Contribuables recensés", "2,847", "+8.2%"],
        ["Taux de recouvrement", "83.2%", "+4.1%"],
        ["Paiements traités", "1,234", "+15.3%"],
      ];
      kpiData.forEach(([label, val, change]) => {
        doc.setFillColor(240, 244, 252); doc.rect(M, y - 3, CW / 4 - 5, 12, "F");
        doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(100, 100, 100);
        doc.text(label, M + 3, y + 1);
        doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(27, 58, 107);
        doc.text(val, M + 3, y + 7);
        doc.setFontSize(7); doc.setTextColor(0, 148, 96);
        doc.text(change, M + CW / 4 - 8, y + 7, { align: "right" });
        y += 0;
        // Shift to next kpi position
      });
      // Reset - draw kpis side by side
      y -= 0;
      y += 16;

      // Revenue table
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(27, 58, 107);
      doc.text("ÉVOLUTION DES RECETTES PAR MOIS", M, y); y += 7;
      const headers = ["Mois", "Prévu (GNF)", "Réalisé (GNF)", "Écart (GNF)", "Taux"];
      const rows = [
        ["Janvier", "45 000 000", "41 200 000", "-3 800 000", "91.6%"],
        ["Février", "45 000 000", "43 800 000", "-1 200 000", "97.3%"],
        ["Mars", "45 000 000", "47 500 000", "+2 500 000", "105.6%"],
        ["Avril", "50 000 000", "44 200 000", "-5 800 000", "88.4%"],
        ["Mai", "50 000 000", "46 800 000", "-3 200 000", "93.6%"],
        ["Juin", "50 000 000", "43 900 000", "-6 100 000", "87.8%"],
        ["TOTAL", "285 000 000", "267 400 000", "-17 600 000", "93.8%"],
      ];
      doc.setFillColor(27, 58, 107); doc.rect(M, y, CW, 7, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(255, 255, 255);
      const colW = CW / headers.length;
      headers.forEach((h, i) => doc.text(h, M + i * colW + 2, y + 4.5));
      y += 9;
      rows.forEach((row, ri) => {
        const isTotal = ri === rows.length - 1;
        if (isTotal) { doc.setFillColor(240, 244, 252); doc.rect(M, y - 1.5, CW, 7, "F"); }
        else if (ri % 2 === 0) { doc.setFillColor(250, 250, 252); doc.rect(M, y - 1.5, CW, 7, "F"); }
        doc.setFont(isTotal ? "helvetica" : "helvetica", isTotal ? "bold" : "normal");
        doc.setFontSize(8); doc.setTextColor(isTotal ? 27 : 40, isTotal ? 58 : 40, isTotal ? 107 : 40);
        row.forEach((cell, i) => {
          const color = cell.startsWith("+") ? [0, 148, 96] : cell.startsWith("-") && i === 3 ? [206, 17, 38] : null;
          if (color) doc.setTextColor(color[0], color[1], color[2]);
          else doc.setTextColor(isTotal ? 27 : 40, isTotal ? 58 : 107, isTotal ? 107 : 40);
          doc.text(cell, M + i * colW + 2, y + 3.5);
        });
        y += 7;
      });

      // Pied de page
      y += 8;
      doc.setDrawColor(220, 220, 220); doc.line(M, y, M + CW, y); y += 4;
      doc.setFont("helvetica", "italic"); doc.setFontSize(6.5); doc.setTextColor(150, 150, 150);
      doc.text(`Rapport généré par SNRR-Mamou · ${new Date().toLocaleString("fr-FR")} · Données sources : Système de Recensement et Recouvrement`, W / 2, y, { align: "center" });

      doc.save(`Rapport_BI_SNRR_Mamou_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error(e);
    }
  };

  const fmtCurrency = (n: number) => 
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${(n / 1_000).toFixed(0)}K`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
            <BarChart3 size={24} className="text-primary" />
            Business Intelligence
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Analyses prédictives et pilotage stratégique des recettes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value as typeof periode)}
            className="px-3 py-2 text-xs font-mono bg-card border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="mois">Mois en cours</option>
            <option value="trimestre">Trimestre</option>
            <option value="annee">Année fiscale</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono border border-border rounded-sm hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            Actualiser
          </button>
          <button onClick={handleExportRapport} className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity">
            <Download size={12} />
            Exporter le rapport PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_DATA.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Insights rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InsightCard
          type="success"
          title="✨ Objectif atteint : Donghol Touma"
          description="Le quartier Donghol Touma a dépassé son objectif de recouvrement (83% vs 80%). Performance exemplaire ce mois-ci."
          action={{ label: "Voir les détails", onClick: () => {} }}
        />
        <InsightCard
          type="warning"
          title="⚠️ Attention : Téguéréya sous objectif"
          description="Le quartier Téguéréya affiche seulement 55% de recouvrement (objectif : 60%). Action de relance recommandée."
          action={{ label: "Planifier une relance", onClick: () => {} }}
        />
        <InsightCard
          type="info"
          title="📈 Prévision : +18% en décembre"
          description="Selon les tendances actuelles, les recettes de décembre devraient atteindre 62.5M GNF, soit +18% par rapport à juin."
        />
        <InsightCard
          type="danger"
          title="🚨 Arriérés en hausse dans 3 quartiers"
          description="Gongoré, Saré Koura et Téguéréya affichent une augmentation des arriérés. Intervention urgente nécessaire."
          action={{ label: "Voir la liste", onClick: () => {} }}
        />
      </div>

      {/* Analyse prédictive sur 12 mois */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-secondary/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-2">
                <Zap size={14} className="text-amber-500" />
                Analyse prédictive — 12 mois
              </h3>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Prévisions basées sur l'historique, la saisonnalité et les tendances actuelles
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-[#1B3A6B] rounded-sm" />
                <span className="text-xs font-mono text-muted-foreground">Réel</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-[#B8860B] rounded-sm" />
                <span className="text-xs font-mono text-muted-foreground">Prévisionnel</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-[#B8860B]/20 rounded-sm" />
                <span className="text-xs font-mono text-muted-foreground">Intervalle confiance</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={PREDICTIONS}>
              <defs>
                <linearGradient id="colorReel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B3A6B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1B3A6B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPrevu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B8860B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#B8860B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fontFamily: "monospace" }} />
              <YAxis 
                tick={{ fontSize: 11, fontFamily: "monospace" }}
                tickFormatter={(v) => fmtCurrency(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                }}
                formatter={(value: number) => `${(value / 1_000_000).toFixed(1)}M GNF`}
              />
              <Area type="monotone" dataKey="max" stroke="none" fill="#B8860B" fillOpacity={0.1} />
              <Area type="monotone" dataKey="min" stroke="none" fill="#ffffff" fillOpacity={1} />
              <Line type="monotone" dataKey="reel" stroke="#1B3A6B" strokeWidth={2} dot={{ r: 4 }} />
              <Line
                type="monotone"
                dataKey="prevu"
                stroke="#B8860B"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grille d'analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance par quartier */}
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-secondary/30">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-2">
              <MapPin size={14} className="text-primary" />
              Performance par quartier
            </h3>
          </div>
          <div className="p-5 space-y-3">
            {QUARTIER_PERFORMANCE.map((q) => {
              const performance = (q.recouvrement / q.objectif) * 100;
              const isGood = q.recouvrement >= q.objectif;
              
              return (
                <div key={q.quartier} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{q.quartier}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        {q.recouvrement}% / {q.objectif}%
                      </span>
                      {isGood ? (
                        <CheckCircle2 size={14} className="text-emerald-600" />
                      ) : (
                        <AlertCircle size={14} className="text-amber-600" />
                      )}
                    </div>
                  </div>
                  <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                        isGood ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.min(performance, 100)}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 border-r-2 border-slate-400"
                      style={{ left: `${(q.objectif / 100) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                    <span>{q.contribuables} contribuables</span>
                    <span>{fmtCurrency(q.montant)} GNF</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analyse comparative */}
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-secondary/30">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-2">
              <Activity size={14} className="text-primary" />
              Comparatif mensuel
            </h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ANALYSES_COMPARATIVES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="categorie" 
                  tick={{ fontSize: 10, fontFamily: "monospace" }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 11, fontFamily: "monospace" }}
                  tickFormatter={(v) => fmtCurrency(v)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                  formatter={(value: number) => `${(value / 1_000_000).toFixed(1)}M GNF`}
                />
                <Legend 
                  wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }}
                />
                <Bar dataKey="precedent" fill="#94a3b8" name="Mois précédent" />
                <Bar dataKey="actuel" fill="#1B3A6B" name="Mois actuel" />
                <Bar dataKey="objectif" fill="#B8860B" name="Objectif" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance radar */}
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-secondary/30">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-2">
              <Target size={14} className="text-primary" />
              Évaluation multi-critères
            </h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={PERFORMANCE_RADAR}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="critere" 
                  tick={{ fontSize: 11, fontFamily: "monospace" }}
                />
                <PolarRadiusAxis 
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fontFamily: "monospace" }}
                />
                <Radar
                  name="Score actuel"
                  dataKey="score"
                  stroke="#1B3A6B"
                  fill="#1B3A6B"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
                <Radar
                  name="Objectif"
                  dataKey="objectif"
                  stroke="#B8860B"
                  fill="#B8860B"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "monospace" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Corrélation surface/recettes */}
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-secondary/30">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-2">
              <PieChartIcon size={14} className="text-primary" />
              Corrélation Surface × Recettes
            </h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="surface" 
                  name="Surface (m²)"
                  tick={{ fontSize: 11, fontFamily: "monospace" }}
                  label={{ value: "Surface (m²)", position: "bottom", fontSize: 11, fontFamily: "monospace" }}
                />
                <YAxis 
                  dataKey="recettes" 
                  name="Recettes"
                  tick={{ fontSize: 11, fontFamily: "monospace" }}
                  tickFormatter={(v) => fmtCurrency(v)}
                  label={{ value: "Recettes", angle: -90, position: "insideLeft", fontSize: 11, fontFamily: "monospace" }}
                />
                <ZAxis range={[50, 400]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "recettes") return `${(value / 1_000_000).toFixed(2)}M GNF`;
                    if (name === "surface") return `${value} m²`;
                    return value;
                  }}
                />
                <Scatter 
                  name="Biens" 
                  data={CORRELATION_DATA} 
                  fill="#1B3A6B"
                  fillOpacity={0.6}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommandations stratégiques */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-secondary/30">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-2">
            <Award size={14} className="text-amber-500" />
            Recommandations stratégiques
          </h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-sm hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-sm">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Capitaliser sur Centre-ville</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Zone à fort potentiel. Intensifier la digitalisation des paiements pour optimiser la collecte.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-border rounded-sm hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-sm">
                  <Target size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Plan de relance Téguéréya</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Mobiliser 2 agents supplémentaires. Objectif : +10% de recouvrement en 3 semaines.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-border rounded-sm hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-sm">
                  <Users size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Recruter 3 nouveaux agents</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Pour atteindre l'objectif de 62M en décembre, renforcer l'équipe de terrain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
