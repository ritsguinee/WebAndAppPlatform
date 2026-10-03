import { useState, useRef, useEffect } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  LayoutDashboard, Users, MapPin, Calculator, CreditCard, FileBarChart2,
  ShieldCheck, LogOut, TrendingUp, AlertTriangle, CheckCircle2, Clock,
  Search, Download, Plus, QrCode, Eye, Edit2, Trash2, Bell, ChevronDown,
  Menu, Building2, ArrowUpRight, ArrowDownRight, Banknote, Map, X,
  Save, ChevronRight, Printer, Send, RefreshCw, Filter, Settings,
  UserCheck, Lock, Globe, Phone, Mail, Home, FileText, Camera, Upload,
  MessageCircle, Smartphone, Zap, ExternalLink, WifiOff, CheckCircle,
  Navigation, Crosshair,
} from "lucide-react";
// MapLibre imported dynamically in Cartographie component
import { QRCodeSVG } from "qrcode.react";
import { AvisImpositionEnhanced } from "./components/AvisImpositionEnhanced";
import logoImg from "@/imports/images__1_.jpg";
import { LoginPage } from "./components/LoginPage";
import { ExportButton } from "./components/ExportButton";
import { UserProfileDropdown } from "./components/UserProfileDropdown";
import { NotificationCenter } from "./components/NotificationCenter";
import { NotificationButtons } from "./components/NotificationButtons";
import { NotificationSettingsModal } from "./components/NotificationSettingsModal";
import { NotificationsView } from "./components/NotificationsView";
import { BusinessIntelligence } from "./components/BusinessIntelligence";
import { OrangeMoneyPayment } from "./components/OrangeMoneyPayment";
import { ContribuableFormEnhanced } from "./components/ContribuableFormEnhanced";
import { canAccessView, hasPermission, ROLE_COLORS, ROLE_PERMISSIONS, ROLE_DESCRIPTIONS } from "./utils/roles-permissions";
import type { Role, Permission } from "./utils/roles-permissions";
import type { ExportColumn } from "./utils/export-utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type View = "dashboard" | "recensement" | "taxation" | "paiements" | "cartographie" | "rapports" | "business-intelligence" | "exercice-fiscal" | "utilisateurs" | "securite" | "parametres" | "notifications";
type ModalType =
  | null
  | "new-contribuable" | "edit-contribuable" | "view-contribuable" | "qr-code" | "delete-contribuable"
  | "new-paiement" | "view-paiement" | "orange-money-payment"
  | "new-user" | "edit-user" | "view-user-detail" | "delete-user"
  | "reset-password" | "configure-access"
  | "new-taxe" | "edit-taxe" | "simulation-fiscale" | "avis-imposition"
  | "confirm-delete";

interface Contribuable {
  id: string; nom: string; prenom: string; telephone: string; nin: string;
  quartier: string; secteur: string; type: string; usage: string;
  surface: number; valeur: number; statut: string; date: string;
  coordGps: string; categorie: string;
  email?: string;
  photoContribuable?: string;
  photosBatiment?: string[];
  plansCadastraux?: string[];
  documentsJustificatifs?: string[];
  // Nouveaux champs
  commune?: string;
  district?: string;
  adresseContribuable?: string;
  localisationActivite?: string;
  memeProprietaire?: boolean;
  nomProprietaire?: string;
  prenomProprietaire?: string;
  telephoneProprietaire?: string;
  emailProprietaire?: string;
  ninProprietaire?: string;
  valeurLocative?: boolean;
  montantForfaitaire?: number;
  periodeTaxe?: string; // journalier, hebdomadaire, mensuel, trimestriel, annuel
  statusOccupation?: string; // occupé, vacant
  pourcentageEtat?: number;
  pourcentageAgent?: number;
  pourcentageCommune?: number;
  agentRecenseur?: string;
}

interface NotificationSettings {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  autoSendAvis: boolean;
  emailSmtp?: string;
  emailPort?: string;
  emailUser?: string;
  whatsappApi?: string;
}

interface NotificationLog {
  id: string;
  type: 'email' | 'whatsapp';
  destinataire: string;
  contribuable: string;
  sujet: string;
  statut: 'envoyé' | 'échoué' | 'en cours';
  date: string;
}

interface Paiement {
  ref: string; contribuableId: string; contribuable: string; montant: number;
  methode: string; operateur: string; date: string; statut: string; recu: string;
}

interface Utilisateur {
  id: string; nom: string; prenom: string; role: string; email: string;
  telephone: string; derniere: string; statut: string; dateCreation: string;
  identifiant?: string;
  permissions?: string[];
  motDePasseReset?: boolean;
}

interface Taxe {
  id: string; libelle: string; categorie: string; taux: number;
  base: string; periodicite: string; actif: boolean;
}

// ─── Données initiales ────────────────────────────────────────────────────────
const CONTRIBUABLES_INIT: Contribuable[] = [
  { id: "MOU-2024-00142", nom: "Diallo", prenom: "Mamadou", telephone: "+224 621 45 89 23", email: "m.diallo@example.gn", nin: "GN2401234567", quartier: "Sikhourou", secteur: "S-04", type: "Résidentiel", usage: "Habitation principale", surface: 180, valeur: 2400000, statut: "Payé", date: "2024-06-12", coordGps: "10.3792° N, 12.0862° W", categorie: "B" },
  { id: "MOU-2024-00143", nom: "Bah", prenom: "Fatoumata", telephone: "+224 664 12 34 56", email: "f.bah@example.gn", nin: "GN2401234568", quartier: "Centre-ville", secteur: "S-01", type: "Commercial", usage: "Boutique", surface: 95, valeur: 3800000, statut: "En attente", date: "2024-06-10", coordGps: "10.3801° N, 12.0871° W", categorie: "A" },
  { id: "MOU-2024-00144", nom: "Sow", prenom: "Ibrahim", telephone: "+224 628 77 88 99", email: "i.sow@example.gn", nin: "GN2401234569", quartier: "Donghol Touma", secteur: "S-11", type: "Résidentiel", usage: "Habitation principale", surface: 240, valeur: 2900000, statut: "Payé", date: "2024-06-08", coordGps: "10.3815° N, 12.0845° W", categorie: "B" },
  { id: "MOU-2024-00145", nom: "Barry", prenom: "Aissatou", telephone: "+224 655 99 11 22", nin: "GN2401234570", quartier: "Gongoré", secteur: "S-09", type: "Commercial", usage: "Restaurant", surface: 60, valeur: 1800000, statut: "Arriéré", date: "2024-05-30", coordGps: "10.3788° N, 12.0892° W", categorie: "A" },
  { id: "MOU-2024-00146", nom: "Camara", prenom: "Sékou", telephone: "+224 621 55 66 77", nin: "GN2401234571", quartier: "Saré Koura", secteur: "S-13", type: "Industriel", usage: "Entrepôt", surface: 420, valeur: 8600000, statut: "Payé", date: "2024-06-15", coordGps: "10.3762° N, 12.0833° W", categorie: "C" },
  { id: "MOU-2024-00147", nom: "Sylla", prenom: "Mariama", telephone: "+224 666 33 44 55", nin: "GN2401234572", quartier: "Sikhourou", secteur: "S-04", type: "Résidentiel", usage: "Habitation principale", surface: 130, valeur: 1600000, statut: "En attente", date: "2024-06-11", coordGps: "10.3798° N, 12.0858° W", categorie: "B" },
  { id: "MOU-2024-00148", nom: "Kouyaté", prenom: "Alhassane", telephone: "+224 628 44 55 66", nin: "GN2401234573", quartier: "Centre-ville", secteur: "S-02", type: "Commercial", usage: "Pharmacie", surface: 75, valeur: 4200000, statut: "Arriéré", date: "2024-05-18", coordGps: "10.3808° N, 12.0865° W", categorie: "A" },
  { id: "MOU-2024-00149", nom: "Diakité", prenom: "Hawa", telephone: "+224 621 88 99 00", nin: "GN2401234574", quartier: "Gongoré", secteur: "S-10", type: "Résidentiel", usage: "Habitation principale", surface: 200, valeur: 2200000, statut: "Payé", date: "2024-06-14", coordGps: "10.3780° N, 12.0888° W", categorie: "B" },
  { id: "MOU-2024-00150", nom: "Condé", prenom: "Mohamed", telephone: "+224 621 11 22 33", nin: "GN2401234575", quartier: "Porédaka", secteur: "S-15", type: "Commercial", usage: "Boutique", surface: 85, valeur: 3200000, statut: "Payé", date: "2024-06-16", coordGps: "10.3720° N, 12.0880° W", categorie: "A" },
  { id: "MOU-2024-00151", nom: "Baldé", prenom: "Aminata", telephone: "+224 664 44 55 66", nin: "GN2401234576", quartier: "Téguéréya", secteur: "S-17", type: "Résidentiel", usage: "Habitation principale", surface: 165, valeur: 1950000, statut: "En attente", date: "2024-06-17", coordGps: "10.3825° N, 12.0920° W", categorie: "B" },
  { id: "MOU-2024-00152", nom: "Touré", prenom: "Alseny", telephone: "+224 628 66 77 88", nin: "GN2401234577", quartier: "Centre-ville", secteur: "S-03", type: "Commercial", usage: "Hôtel", surface: 320, valeur: 7500000, statut: "Payé", date: "2024-06-18", coordGps: "10.3805° N, 12.0868° W", categorie: "A" },
  { id: "MOU-2024-00153", nom: "Bangoura", prenom: "Kadiatou", telephone: "+224 655 22 33 44", nin: "GN2401234578", quartier: "Gongoré", secteur: "S-08", type: "Résidentiel", usage: "Habitation principale", surface: 145, valeur: 1750000, statut: "Arriéré", date: "2024-05-25", coordGps: "10.3785° N, 12.0895° W", categorie: "B" },
];

const PAIEMENTS_INIT: Paiement[] = [
  { ref: "PAY-2024-8821", contribuableId: "MOU-2024-00146", contribuable: "Camara Sékou", montant: 8600000, methode: "Mobile Money", operateur: "Orange Money", date: "2024-06-15 09:14", statut: "Validé", recu: "REC-8821" },
  { ref: "PAY-2024-8820", contribuableId: "MOU-2024-00142", contribuable: "Diallo Mamadou", montant: 2400000, methode: "Mobile Money", operateur: "MTN", date: "2024-06-12 14:32", statut: "Validé", recu: "REC-8820" },
  { ref: "PAY-2024-8819", contribuableId: "MOU-2024-00149", contribuable: "Diakité Hawa", montant: 2200000, methode: "Espèces", operateur: "—", date: "2024-06-14 11:05", statut: "Validé", recu: "REC-8819" },
  { ref: "PAY-2024-8818", contribuableId: "MOU-2024-00144", contribuable: "Sow Ibrahim", montant: 2900000, methode: "QR Code", operateur: "Orange Money", date: "2024-06-08 16:48", statut: "Validé", recu: "REC-8818" },
  { ref: "PAY-2024-8817", contribuableId: "MOU-2024-00143", contribuable: "Bah Fatoumata", montant: 1900000, methode: "Mobile Money", operateur: "MTN", date: "2024-06-10 10:22", statut: "En attente", recu: "" },
  { ref: "PAY-2024-8816", contribuableId: "MOU-2024-00145", contribuable: "Barry Aissatou", montant: 900000, methode: "Espèces", operateur: "—", date: "2024-06-07 13:55", statut: "Annulé", recu: "" },
];

const UTILISATEURS_INIT: Utilisateur[] = [
  { id: "USR-000", nom: "Admin", prenom: "Système", role: "Administrateur", email: "admin@mamou-commune.gn", telephone: "+224 626 00 11 10", derniere: "2024-06-15 09:00", statut: "Actif", dateCreation: "2024-01-01", identifiant: "admin" },
  { id: "USR-001", nom: "Soumah", prenom: "Alpha Condé", role: "Maire", email: "maire@mamou-commune.gn", telephone: "+224 621 00 11 22", derniere: "2024-06-15 09:00", statut: "Actif", dateCreation: "2024-01-15", identifiant: "a.soumah" },
  { id: "USR-002", nom: "Bah", prenom: "Mamadou", role: "Receveur municipal", email: "m.bah@mamou-commune.gn", telephone: "+224 664 33 44 55", derniere: "2024-06-15 08:45", statut: "Actif", dateCreation: "2024-01-20", identifiant: "m.bah" },
  { id: "USR-003", nom: "Diallo", prenom: "Fatoumata", role: "Superviseur", email: "f.diallo@mamou-commune.gn", telephone: "+224 628 55 66 77", derniere: "2024-06-14 17:30", statut: "Actif", dateCreation: "2024-02-01", identifiant: "f.diallo" },
  { id: "USR-004", nom: "Sow", prenom: "Ibrahima", role: "Agent recenseur", email: "i.sow@mamou-commune.gn", telephone: "+224 655 77 88 99", derniere: "2024-06-15 07:20", statut: "Actif", dateCreation: "2024-02-10", identifiant: "i.sow" },
  { id: "USR-005", nom: "Kouyaté", prenom: "Mariama", role: "Agent recenseur", email: "m.kouyate@mamou-commune.gn", telephone: "+224 621 99 00 11", derniere: "2024-06-13 15:00", statut: "Inactif", dateCreation: "2024-03-05", identifiant: "m.kouyate" },
  { id: "USR-006", nom: "Barry", prenom: "Sékou", role: "Agent recouvrement", email: "s.barry@mamou-commune.gn", telephone: "+224 666 22 33 44", derniere: "2024-06-15 10:10", statut: "Actif", dateCreation: "2024-03-12", identifiant: "s.barry" },
];

const TAXES_INIT: Taxe[] = [
  { id: "TAX-001", libelle: "Contribution Foncière Unique — Catégorie A", categorie: "CFU", taux: 12, base: "Valeur locative", periodicite: "Annuelle", actif: true },
  { id: "TAX-002", libelle: "Contribution Foncière Unique — Catégorie B", categorie: "CFU", taux: 8, base: "Valeur locative", periodicite: "Annuelle", actif: true },
  { id: "TAX-003", libelle: "Contribution Foncière Unique — Catégorie C", categorie: "CFU", taux: 5, base: "Valeur locative", periodicite: "Annuelle", actif: true },
  { id: "TAX-004", libelle: "Patente — Boutiques", categorie: "Patentes", taux: 3.5, base: "Chiffre d'affaires", periodicite: "Annuelle", actif: true },
  { id: "TAX-005", libelle: "Patente — Restaurants", categorie: "Patentes", taux: 4.2, base: "Chiffre d'affaires", periodicite: "Annuelle", actif: true },
  { id: "TAX-006", libelle: "Patente — Pharmacies", categorie: "Patentes", taux: 5.0, base: "Chiffre d'affaires", periodicite: "Annuelle", actif: true },
  { id: "TAX-007", libelle: "Taxe de marché — Étals fixes", categorie: "Marchés", taux: 0, base: "Forfait mensuel", periodicite: "Mensuelle", actif: true },
  { id: "TAX-008", libelle: "Occupation domaine public", categorie: "Domaine", taux: 0, base: "Surface × tarif", periodicite: "Mensuelle", actif: true },
];

// ─── Données graphiques & exercice fiscal ────────────────────────────────────
type RecetteMois = { id: string; mois: string; cfu: number; patentes: number; marches: number; autres: number };
type ObjectifsFiscaux = { cfu: number; patentes: number; marches: number; autres: number };
type ExerciceStore = Record<string, { mois: RecetteMois[]; objectifs: ObjectifsFiscaux }>;

const MOIS_LABELS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

const RECETTES_DEFAULT: RecetteMois[] = [
  { id:"m1",  mois:"Jan", cfu:12400000, patentes:8200000,  marches:3100000, autres:1800000 },
  { id:"m2",  mois:"Fév", cfu:14100000, patentes:9400000,  marches:3600000, autres:2100000 },
  { id:"m3",  mois:"Mar", cfu:16800000, patentes:11200000, marches:4200000, autres:2400000 },
  { id:"m4",  mois:"Avr", cfu:15200000, patentes:10100000, marches:3900000, autres:2200000 },
  { id:"m5",  mois:"Mai", cfu:18900000, patentes:12600000, marches:4700000, autres:2800000 },
  { id:"m6",  mois:"Jun", cfu:21300000, patentes:14200000, marches:5300000, autres:3100000 },
  { id:"m7",  mois:"Jul", cfu:0, patentes:0, marches:0, autres:0 },
  { id:"m8",  mois:"Aoû", cfu:0, patentes:0, marches:0, autres:0 },
  { id:"m9",  mois:"Sep", cfu:0, patentes:0, marches:0, autres:0 },
  { id:"m10", mois:"Oct", cfu:0, patentes:0, marches:0, autres:0 },
  { id:"m11", mois:"Nov", cfu:0, patentes:0, marches:0, autres:0 },
  { id:"m12", mois:"Déc", cfu:0, patentes:0, marches:0, autres:0 },
];
const OBJECTIFS_DEFAULT: ObjectifsFiscaux = { cfu:250000000, patentes:160000000, marches:60000000, autres:40000000 };

const EXERCICE_KEY = "snrr_exercice_recettes";
function loadExerciceFor(key: string): ExerciceStore {
  try { const r = localStorage.getItem(key); if (r) return JSON.parse(r); } catch {}
  return { "2024": { mois: RECETTES_DEFAULT, objectifs: OBJECTIFS_DEFAULT } };
}
function loadExercice(): ExerciceStore { return loadExerciceFor(EXERCICE_KEY); }
function saveExerciceFor(key: string, d: ExerciceStore) { localStorage.setItem(key, JSON.stringify(d)); }
function saveExercice(d: ExerciceStore) { saveExerciceFor(EXERCICE_KEY, d); }

// ─── Audit log ────────────────────────────────────────────────────────────────
type AuditEntry = { id: string; action: string; user: string; ip: string; date: string; type: "info" | "warning" | "error" };

const AUDIT_KEY = "snrr_audit_log";
const AUDIT_SEED: AuditEntry[] = [
  { id: "as1", action: "Connexion réussie", user: "Alpha C. Soumah", ip: "196.28.14.22", date: "2024-06-15 09:00:14", type: "info" },
  { id: "as2", action: "Export PDF généré", user: "Mamadou Bah", ip: "196.28.14.45", date: "2024-06-15 08:52:31", type: "info" },
  { id: "as3", action: "Modification de taxe CFU-002", user: "Fatoumata Diallo", ip: "196.28.14.72", date: "2024-06-14 17:28:04", type: "warning" },
  { id: "as4", action: "Tentative de connexion échouée (3×)", user: "Inconnu", ip: "41.202.208.14", date: "2024-06-14 16:15:42", type: "error" },
  { id: "as5", action: "Annulation de paiement PAY-8816", user: "Sékou Barry", ip: "196.28.14.88", date: "2024-06-14 15:44:10", type: "warning" },
  { id: "as6", action: "Nouveau recensement MOU-2024-00149", user: "Ibrahima Sow", ip: "196.28.14.33", date: "2024-06-14 14:02:55", type: "info" },
  { id: "as7", action: "Modification du profil USR-005", user: "Alpha C. Soumah", ip: "196.28.14.22", date: "2024-06-13 11:30:00", type: "warning" },
];
function loadAuditFor(key: string): AuditEntry[] {
  try { const r = localStorage.getItem(key); if (r) return JSON.parse(r); } catch {}
  return AUDIT_SEED;
}
function loadAudit(): AuditEntry[] { return loadAuditFor(AUDIT_KEY); }
function saveAuditFor(key: string, logs: AuditEntry[]) { localStorage.setItem(key, JSON.stringify(logs.slice(0, 500))); }
function saveAudit(logs: AuditEntry[]) { saveAuditFor(AUDIT_KEY, logs); }

// backward-compat alias used by chart code that still references recettesMonthly
const recettesMonthly = RECETTES_DEFAULT;

const recouvrementData = [
  { id: "r1", mois: "Jan", taux: 62 },
  { id: "r2", mois: "Fév", taux: 68 },
  { id: "r3", mois: "Mar", taux: 71 },
  { id: "r4", mois: "Avr", taux: 74 },
  { id: "r5", mois: "Mai", taux: 79 },
  { id: "r6", mois: "Jun", taux: 83 },
];

const repartitionData = [
  { id: "rep1", name: "CFU", value: 48, color: "#1B3A6B" },
  { id: "rep2", name: "Patentes", value: 28, color: "#B8860B" },
  { id: "rep3", name: "Marchés", value: 14, color: "#2E6B3E" },
  { id: "rep4", name: "Domaine public", value: 6, color: "#8B1A1A" },
  { id: "rep5", name: "Autres", value: 4, color: "#4A6B8A" },
];

const quartierStats = [
  { quartier: "Centre-ville", contribuables: 1842, recouvert: 78, montant: 42800000 },
  { quartier: "Sikhourou", contribuables: 1204, recouvert: 71, montant: 28400000 },
  { quartier: "Gongoré", contribuables: 986, recouvert: 65, montant: 18200000 },
  { quartier: "Donghol Touma", contribuables: 823, recouvert: 83, montant: 21600000 },
  { quartier: "Saré Koura", contribuables: 614, recouvert: 59, montant: 14100000 },
  { quartier: "Porédaka", contribuables: 542, recouvert: 68, montant: 11800000 },
  { quartier: "Téguéréya", contribuables: 425, recouvert: 55, montant: 8900000 },
];

// ─── Données sous-préfectures ─────────────────────────────────────────────────
const SP_STATS: Record<string, {
  label: string; contribuables: number; taux: number; recettes: number; arriere: number;
  districts: Record<string, { contribuables: number; taux: number; recettes: number; secteurs: string[] }>;
}> = {
  "Commune Urbaine de Mamou": {
    label: "Commune Urbaine", contribuables: 6471, taux: 78, recettes: 142800000, arriere: 1420,
    districts: {
      "Centre-ville": { contribuables: 1842, taux: 83, recettes: 42800000, secteurs: ["Secteur 1 — Marché Central", "Secteur 2 — Mairie", "Secteur 3 — Mosquée Centrale", "Secteur 4 — Gare Routière"] },
      "Sikhourou": { contribuables: 1204, taux: 71, recettes: 28400000, secteurs: ["Secteur 1", "Secteur 2", "Secteur 3"] },
      "Gongoré": { contribuables: 986, taux: 65, recettes: 18200000, secteurs: ["Secteur 1", "Secteur 2", "Secteur 3", "Secteur 4"] },
      "Donghol Touma": { contribuables: 823, taux: 83, recettes: 21600000, secteurs: ["Secteur 1", "Secteur 2", "Secteur 3"] },
      "Saré Koura": { contribuables: 614, taux: 59, recettes: 14100000, secteurs: ["Secteur 1", "Secteur 2"] },
      "Porédaka (Urbain)": { contribuables: 542, taux: 68, recettes: 11800000, secteurs: ["Secteur 1", "Secteur 2"] },
      "Téguéréya (Urbain)": { contribuables: 425, taux: 55, recettes: 8900000, secteurs: ["Secteur 1", "Secteur 2"] },
    },
  },
  "Sous-Préfecture de Dounet": {
    label: "SP Dounet", contribuables: 1842, taux: 62, recettes: 38400000, arriere: 700,
    districts: {
      "Dounet-Centre": { contribuables: 720, taux: 67, recettes: 16200000, secteurs: ["Secteur 1", "Secteur 2", "Secteur 3"] },
      "Kourayanah": { contribuables: 540, taux: 58, recettes: 11800000, secteurs: ["Secteur 1", "Secteur 2"] },
      "Bhouria-Dounet": { contribuables: 380, taux: 61, recettes: 7800000, secteurs: ["Secteur 1", "Secteur 2"] },
      "Tangaly": { contribuables: 202, taux: 55, recettes: 2600000, secteurs: ["Secteur 1", "Secteur 2"] },
    },
  },
  "Sous-Préfecture de Gongoret": {
    label: "SP Gongoret", contribuables: 1240, taux: 55, recettes: 24600000, arriere: 560,
    districts: {
      "Gongoret-Centre": { contribuables: 620, taux: 60, recettes: 13400000, secteurs: ["Secteur 1", "Secteur 2"] },
      "Gongoret-Nord": { contribuables: 380, taux: 52, recettes: 7200000, secteurs: ["Secteur 1", "Secteur 2"] },
      "Gongoret-Périphérie": { contribuables: 240, taux: 48, recettes: 4000000, secteurs: ["Secteur 1", "Secteur 2", "Secteur 3"] },
    },
  },
  "Sous-Préfecture de Kegneko": {
    label: "SP Kegneko", contribuables: 980, taux: 58, recettes: 18200000, arriere: 410,
    districts: {
      "Kegneko-Centre": { contribuables: 420, taux: 63, recettes: 8600000, secteurs: ["Secteur 1", "Secteur 2"] },
      "Kegneko-Est": { contribuables: 340, taux: 55, recettes: 6000000, secteurs: ["Secteur 1", "Secteur 2"] },
      "Kegneko-Ouest": { contribuables: 220, taux: 51, recettes: 3600000, secteurs: ["Secteur 1", "Secteur 2"] },
    },
  },
  "Sous-Préfecture de Nyagara": {
    label: "SP Nyagara", contribuables: 760, taux: 48, recettes: 12800000, arriere: 395,
    districts: {
      "Nyagara-Centre": { contribuables: 440, taux: 52, recettes: 7600000, secteurs: ["Secteur 1", "Secteur 2"] },
      "Nyagara-Marché": { contribuables: 320, taux: 43, recettes: 5200000, secteurs: ["Secteur 1", "Secteur 2"] },
    },
  },
  "Sous-Préfecture de Ouré-Kaba": {
    label: "SP Ouré-Kaba", contribuables: 1120, taux: 66, recettes: 22400000, arriere: 382,
    districts: {
      "Ouré-Centre": { contribuables: 480, taux: 70, recettes: 10400000, secteurs: ["Secteur 1", "Secteur 2"] },
      "Kaba": { contribuables: 420, taux: 65, recettes: 8200000, secteurs: ["Secteur 1", "Secteur 2", "Secteur 3"] },
      "Ouré-Périphérie": { contribuables: 220, taux: 60, recettes: 3800000, secteurs: ["Secteur 1", "Secteur 2"] },
    },
  },
  "Sous-Préfecture de Porédaka": {
    label: "SP Porédaka", contribuables: 890, taux: 52, recettes: 15600000, arriere: 430,
    districts: {
      "Porédaka-Centre": { contribuables: 380, taux: 58, recettes: 7200000, secteurs: ["Secteur 1", "Secteur 2", "Secteur 3"] },
      "Bhouria": { contribuables: 240, taux: 49, recettes: 4400000, secteurs: ["Secteur 1", "Secteur 2"] },
      "Dar es Salam": { contribuables: 160, taux: 48, recettes: 2600000, secteurs: ["Secteur 1", "Secteur 2"] },
      "Kolissoko": { contribuables: 110, taux: 46, recettes: 1400000, secteurs: ["Secteur 1", "Secteur 2"] },
    },
  },
  "Sous-Préfecture de Saramoussaya": {
    label: "SP Saramoussaya", contribuables: 680, taux: 44, recettes: 10200000, arriere: 380,
    districts: {
      "Saramoussaya-Centre": { contribuables: 310, taux: 48, recettes: 5000000, secteurs: ["Secteur 1", "Secteur 2"] },
      "Saramoussaya-Périphérie": { contribuables: 240, taux: 42, recettes: 3400000, secteurs: ["Secteur 1", "Secteur 2"] },
      "Saramoussaya-Rural": { contribuables: 130, taux: 38, recettes: 1800000, secteurs: ["Secteur 1", "Secteur 2"] },
    },
  },
  "Sous-Préfecture de Soyah": {
    label: "SP Soyah", contribuables: 820, taux: 57, recettes: 14800000, arriere: 352,
    districts: {
      "Soyah-Centre": { contribuables: 380, taux: 62, recettes: 7200000, secteurs: ["Secteur 1", "Secteur 2"] },
      "Soyah-Nord": { contribuables: 280, taux: 54, recettes: 5000000, secteurs: ["Secteur 1", "Secteur 2"] },
      "Soyah-Sud": { contribuables: 160, taux: 49, recettes: 2600000, secteurs: ["Secteur 1", "Secteur 2"] },
    },
  },
  "Sous-Préfecture de Téguéréya": {
    label: "SP Téguéréya", contribuables: 560, taux: 50, recettes: 8600000, arriere: 280,
    districts: {
      "Téguéréya-Centre": { contribuables: 260, taux: 55, recettes: 4200000, secteurs: ["Secteur 1", "Secteur 2", "Secteur 3"] },
      "Téguéréya-Est": { contribuables: 180, taux: 48, recettes: 2800000, secteurs: ["Secteur 1", "Secteur 2"] },
      "Téguéréya-Ouest": { contribuables: 120, taux: 44, recettes: 1600000, secteurs: ["Secteur 1", "Secteur 2"] },
    },
  },
};

const AGENTS_RECENSEURS = [
  "Tous les agents", "I. Sow", "S. Barry", "F. Diallo", "M. Kouyaté", "H. Barry", "A. Camara", "B. Diallo",
];

// ─── Commune geographic config ─────────────────────────────────────────────────
export interface CommuneConfig {
  code: string; // 3-letter prefix for IDs e.g. "MOU", "KIN"
  communeName: string;
  communes: Array<{ nom: string; districts: Array<{ nom: string; secteurs: string[]; lat?: number; lng?: number }> }>;
  sousPrefectures: string[];
  spStats: Record<string, { label: string; contribuables: number; taux: number; recettes: number; arriere: number; districts: Record<string, { contribuables: number; taux: number; recettes: number; secteurs: string[] }> }>;
  quartierColors: Record<string, string>;
  agents: string[];
  mapCenter?: { lat: number; lng: number; zoom?: number };
}

// Seeded random for deterministic fake data per commune
function seededRand(seed: string, idx: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  h = (Math.imul(h, idx + 1) ^ (h >>> 16)) | 0;
  return Math.abs(h % 1000) / 1000;
}

// ─── Real Guinea administrative geography ─────────────────────────────────────
// Sources: découpages administratifs officiels de la République de Guinée
interface GeoData {
  nom: string;                                              // official full name of the main entity
  districts: { nom: string; secteurs: string[] }[];        // quartiers of the main commune urbaine
  sousPrefectures?: string[];                              // sous-préfectures (for prefectures)
}

const s = (pfx: string, n: number) => Array.from({ length: n }, (_, i) => `${pfx}-S${i + 1}`);

const GUINEA_GEO: Record<string, GeoData> = {
  // ── CONAKRY ──────────────────────────────────────────────────────────────────
  "conakry-kaloum": {
    nom: "Commune de Kaloum",
    districts: [
      { nom: "Almamya",   secteurs: ["Almamya-S1", "Almamya-S2", "Almamya-S3", "Almamya-S4"] },
      { nom: "Boulbinet", secteurs: ["Boulbinet-S1", "Boulbinet-S2", "Boulbinet-S3"] },
      { nom: "Coronthie", secteurs: ["Coronthie-S1", "Coronthie-S2", "Coronthie-S3", "Coronthie-S4", "Coronthie-S5"] },
      { nom: "Kaloum",    secteurs: ["Kaloum-S1", "Kaloum-S2", "Kaloum-S3"] },
      { nom: "Tombo",     secteurs: ["Tombo-S1", "Tombo-S2", "Tombo-S3", "Tombo-S4"] },
    ],
  },
  "conakry-dixinn": {
    nom: "Commune de Dixinn",
    districts: [
      { nom: "Camayenne",        secteurs: s("CAM", 4) },
      { nom: "Dixinn-Centre",    secteurs: s("DC",  3) },
      { nom: "Dixinn-Mosquée",   secteurs: s("DM",  2) },
      { nom: "Landréah",         secteurs: s("LND", 3) },
      { nom: "Minière",          secteurs: s("MIN", 2) },
      { nom: "Belle-Vue",        secteurs: s("BV",  2) },
    ],
  },
  "conakry-ratoma": {
    nom: "Commune de Ratoma",
    districts: [
      { nom: "Bambeto",    secteurs: s("BAM", 5) },
      { nom: "Cosa",       secteurs: s("COS", 4) },
      { nom: "Kaporo",     secteurs: s("KAP", 3) },
      { nom: "Kobaya",     secteurs: s("KOB", 3) },
      { nom: "Koloma",     secteurs: s("KOL", 3) },
      { nom: "Lambandji",  secteurs: s("LAM", 3) },
      { nom: "Nongo",      secteurs: s("NON", 4) },
      { nom: "Ratoma",     secteurs: s("RAT", 4) },
      { nom: "Simbaya",    secteurs: s("SIM", 5) },
      { nom: "Wanindara",  secteurs: s("WAN", 5) },
    ],
  },
  "conakry-matam": {
    nom: "Commune de Matam",
    districts: [
      { nom: "Dabondy",    secteurs: s("DAB", 3) },
      { nom: "Enco-5",     secteurs: s("EN5", 2) },
      { nom: "Hamdallaye", secteurs: s("HAM", 4) },
      { nom: "Madina",     secteurs: s("MAD", 5) },
      { nom: "Matam",      secteurs: s("MAT", 3) },
      { nom: "Taouyah",    secteurs: s("TAO", 4) },
    ],
  },
  "conakry-matoto": {
    nom: "Commune de Matoto",
    districts: [
      { nom: "Kagbelen",   secteurs: s("KAG", 3) },
      { nom: "Kissosso",   secteurs: s("KIS", 3) },
      { nom: "Kobayah",    secteurs: s("KBY", 3) },
      { nom: "Mansanyi",   secteurs: s("MAN", 3) },
      { nom: "Matoto",     secteurs: s("MTO", 4) },
      { nom: "Sonfonia",   secteurs: s("SON", 5) },
      { nom: "Yimbaya",    secteurs: s("YIM", 4) },
    ],
  },

  // ── RÉGION DE KINDIA ─────────────────────────────────────────────────────────
  "kindia-cu": {
    nom: "Commune Urbaine de Kindia",
    districts: [
      { nom: "Centre-ville",  secteurs: ["Marché", "Mairie", "Mosquée", "Préfecture"] },
      { nom: "Kouria",        secteurs: s("KOU", 3) },
      { nom: "Sangoyah",      secteurs: s("SAN", 3) },
      { nom: "Tinsou",        secteurs: s("TIN", 2) },
      { nom: "Mambia",        secteurs: s("MAM", 2) },
      { nom: "Gbèrè",         secteurs: s("GBE", 3) },
    ],
    sousPrefectures: [],
  },
  "kindia": {
    nom: "Préfecture de Kindia",
    districts: [
      { nom: "Kindia-Centre", secteurs: ["Marché", "Mairie", "Gare"] },
      { nom: "Kouria",        secteurs: s("KOU", 3) },
      { nom: "Sangoyah",      secteurs: s("SAN", 2) },
    ],
    sousPrefectures: ["Kindia (CU)", "Bangouya", "Damakania", "Friguiagbé", "Kolenté", "Molota", "Souguéta", "Yambéring"],
  },
  "coyah": {
    nom: "Préfecture de Coyah",
    districts: [
      { nom: "Coyah-Centre",  secteurs: s("CC", 4) },
      { nom: "Coyah-Sud",     secteurs: s("CS", 3) },
    ],
    sousPrefectures: ["Coyah (CU)", "Manéah", "Maneya", "Ouassou", "Wonkifong"],
  },
  "dubreka": {
    nom: "Préfecture de Dubréka",
    districts: [
      { nom: "Dubréka-Centre", secteurs: s("DC", 3) },
      { nom: "Dubréka-Côte",   secteurs: s("DCO", 2) },
    ],
    sousPrefectures: ["Dubréka (CU)", "Benty", "Khorira", "Koba", "Tanéné"],
  },
  "forecariah": {
    nom: "Préfecture de Forécariah",
    districts: [
      { nom: "Forécariah-Centre", secteurs: s("FC", 3) },
      { nom: "Forécariah-Côte",   secteurs: s("FCO", 2) },
    ],
    sousPrefectures: ["Forécariah (CU)", "Farmoréah", "Kakossa", "Kaback", "Maférinya", "Moussayah", "N'Dema", "Tougnifily"],
  },
  "telimele": {
    nom: "Préfecture de Télimélé",
    districts: [
      { nom: "Télimélé-Centre", secteurs: s("TC", 3) },
      { nom: "Télimélé-Nord",   secteurs: s("TN", 2) },
    ],
    sousPrefectures: ["Télimélé (CU)", "Bourouwal-Tapé", "Daramagnaki", "Fello-Koundoua", "Gongoré", "Kitinian", "Missira-Donghol", "Santou", "Thionthian"],
  },

  // ── RÉGION DE BOKÉ ───────────────────────────────────────────────────────────
  "boke-cu": {
    nom: "Commune Urbaine de Boké",
    districts: [
      { nom: "Centre-ville",   secteurs: ["Marché", "Port", "Mairie", "Mosquée"] },
      { nom: "Kolaboui",       secteurs: s("KOL", 3) },
      { nom: "Sangarédi-Route",secteurs: s("SAN", 2) },
      { nom: "Hafia",          secteurs: s("HAF", 2) },
      { nom: "Gbantama",       secteurs: s("GBA", 2) },
    ],
  },
  "boke": {
    nom: "Préfecture de Boké",
    districts: [
      { nom: "Boké-Centre",    secteurs: ["Marché", "Port", "Mairie"] },
      { nom: "Boké-Nord",      secteurs: s("BN", 3) },
    ],
    sousPrefectures: ["Boké (CU)", "Kamsar", "Sangarédi", "Tanéné", "Tougnifily-Boké"],
  },
  "boffa": {
    nom: "Préfecture de Boffa",
    districts: [
      { nom: "Boffa-Centre",   secteurs: s("BFC", 3) },
      { nom: "Boffa-Côte",     secteurs: s("BFCO", 2) },
    ],
    sousPrefectures: ["Boffa (CU)", "Boundou-Waadou", "Douprou", "Koba", "Mankountan", "Tamita"],
  },
  "fria": {
    nom: "Commune Urbaine de Fria",
    districts: [
      { nom: "Fria-Centre",    secteurs: ["Cité Alumine", "Marché", "Mairie", "Mosquée"] },
      { nom: "Fria-Ville",     secteurs: s("FV", 3) },
      { nom: "Yomboyali",      secteurs: s("YOM", 2) },
      { nom: "Boffa-Route",    secteurs: s("BR", 2) },
    ],
  },
  "gaoual": {
    nom: "Préfecture de Gaoual",
    districts: [
      { nom: "Gaoual-Centre",  secteurs: s("GC", 3) },
      { nom: "Gaoual-Nord",    secteurs: s("GN", 2) },
    ],
    sousPrefectures: ["Gaoual (CU)", "Foulamory", "Hidayatou", "Kakoni", "Touba"],
  },
  "koundara": {
    nom: "Préfecture de Koundara",
    districts: [
      { nom: "Koundara-Centre", secteurs: s("KC", 3) },
      { nom: "Koundara-Nord",   secteurs: s("KN", 2) },
    ],
    sousPrefectures: ["Koundara (CU)", "Bagata", "Guingan", "Termessé", "Youkounkoun"],
  },

  // ── RÉGION DE MAMOU ──────────────────────────────────────────────────────────
  "mamou-cu": {
    nom: "Commune Urbaine de Mamou",
    districts: [
      { nom: "Centre-ville",  secteurs: ["Secteur 1 — Marché Central", "Secteur 2 — Mairie", "Secteur 3 — Mosquée Centrale", "Secteur 4 — Gare Routière"] },
      { nom: "Sikhourou",     secteurs: ["SK-S1", "SK-S2", "SK-S3", "SK-S4", "SK-S5"] },
      { nom: "Gongoré",       secteurs: ["GN-S1", "GN-S2", "GN-S3", "GN-S4", "GN-S5"] },
      { nom: "Donghol Touma", secteurs: ["DT-S1", "DT-S2", "DT-S3", "DT-S4", "DT-S5"] },
      { nom: "Saré Koura",    secteurs: ["SA-S1", "SA-S2", "SA-S3", "SA-S4", "SA-S5"] },
      { nom: "Porédaka (Urbain)", secteurs: s("PU", 5) },
      { nom: "Téguéréya (Urbain)",secteurs: s("TU", 5) },
      { nom: "Tountouroun",   secteurs: s("TO", 4) },
      { nom: "Pelel",         secteurs: s("PE", 3) },
    ],
    sousPrefectures: [],
  },
  "mamou": {
    nom: "Préfecture de Mamou",
    districts: [
      { nom: "Centre-ville",  secteurs: ["Marché Central", "Mairie", "Mosquée Centrale", "Gare Routière"] },
      { nom: "Sikhourou",     secteurs: s("SK", 4) },
      { nom: "Gongoré",       secteurs: s("GN", 4) },
    ],
    sousPrefectures: ["Mamou (CU)", "Bouliwel", "Dounet", "Gongoret", "Kegneko", "Konkouré", "Nyagara", "Ouré-Kaba", "Porédaka", "Saramoussaya", "Soyah", "Téguéréya", "Tolo"],
  },
  "dalaba": {
    nom: "Préfecture de Dalaba",
    districts: [
      { nom: "Dalaba-Centre",  secteurs: ["Marché", "Mairie", "Mosquée", "École"] },
      { nom: "Dalaba-Plateau", secteurs: s("DP", 3) },
    ],
    sousPrefectures: ["Dalaba (CU)", "Ditinn", "Kaala", "Mombéya", "Santou-Dalaba"],
  },
  "pita": {
    nom: "Préfecture de Pita",
    districts: [
      { nom: "Pita-Centre",     secteurs: ["Marché", "Mairie", "Mosquée", "Gare"] },
      { nom: "Pita-Plateau",    secteurs: s("PP", 3) },
    ],
    sousPrefectures: ["Pita (CU)", "Bourouwal", "Dongol-Touma", "Gongoré-Pita", "Maci", "Mitty", "Ouré-Pita", "Pelel", "Timbi-Madina", "Timbi-Touni", "Tountouroun-Pita"],
  },

  // ── RÉGION DE LABÉ ───────────────────────────────────────────────────────────
  "labe-cu": {
    nom: "Commune Urbaine de Labé",
    districts: [
      { nom: "Labé-Centre",   secteurs: ["Marché", "Mairie", "Mosquée Centrale", "Préfecture"] },
      { nom: "Tata",          secteurs: s("TAT", 3) },
      { nom: "Diari-Ville",   secteurs: s("DV", 3) },
      { nom: "Pellel-Daka",   secteurs: s("PD", 2) },
      { nom: "Hafia",         secteurs: s("HAF", 2) },
      { nom: "Koïn",          secteurs: s("KON", 2) },
    ],
  },
  "labe": {
    nom: "Préfecture de Labé",
    districts: [
      { nom: "Labé-Centre",   secteurs: ["Marché", "Mairie", "Mosquée"] },
      { nom: "Tata",          secteurs: s("TAT", 3) },
    ],
    sousPrefectures: ["Labé (CU)", "Diari", "Hafia", "Kaalan", "Lébékéré", "Noussy", "Popodara", "Tountouroun-Labé"],
  },
  "koubia": {
    nom: "Préfecture de Koubia",
    districts: [
      { nom: "Koubia-Centre",  secteurs: s("KC", 3) },
      { nom: "Koubia-Plateau", secteurs: s("KP", 2) },
    ],
    sousPrefectures: ["Koubia (CU)", "Fello-Bayla", "Gallah", "Koïn-Koubia"],
  },
  "lelouma": {
    nom: "Préfecture de Lélouma",
    districts: [
      { nom: "Lélouma-Centre", secteurs: s("LC", 3) },
      { nom: "Lélouma-Est",    secteurs: s("LE", 2) },
    ],
    sousPrefectures: ["Lélouma (CU)", "Diari-Lélouma", "Gadha-Woundou", "Maci-Lélouma", "Parawol", "Salambandé", "Tangaly-Lélouma"],
  },
  "mali": {
    nom: "Préfecture de Mali",
    districts: [
      { nom: "Mali-Centre",    secteurs: s("MC", 3) },
      { nom: "Mali-Nord",      secteurs: s("MN", 2) },
    ],
    sousPrefectures: ["Mali (CU)", "Féou", "Hidayatou-Mali", "Madina-Woula", "Touba-Mali", "Yembéring"],
  },
  "tougue": {
    nom: "Préfecture de Tougué",
    districts: [
      { nom: "Tougué-Centre",  secteurs: s("TC", 3) },
      { nom: "Tougué-Nord",    secteurs: s("TN", 2) },
    ],
    sousPrefectures: ["Tougué (CU)", "Bourouwal-Tougué", "Gaps", "Kalinko", "Kollet", "Leffa-Mafara"],
  },

  // ── RÉGION DE FARANAH ────────────────────────────────────────────────────────
  "faranah-cu": {
    nom: "Commune Urbaine de Faranah",
    districts: [
      { nom: "Faranah-Centre",  secteurs: ["Marché", "Mairie", "Gare-Fluviale", "Mosquée"] },
      { nom: "Farako",          secteurs: s("FAR", 3) },
      { nom: "Passaya",         secteurs: s("PAS", 2) },
      { nom: "Senko",           secteurs: s("SEN", 2) },
    ],
  },
  "faranah": {
    nom: "Préfecture de Faranah",
    districts: [
      { nom: "Faranah-Centre",  secteurs: ["Marché", "Mairie", "Gare"] },
      { nom: "Faranah-Fleuve",  secteurs: s("FF", 2) },
    ],
    sousPrefectures: ["Faranah (CU)", "Banian", "Bissikrima", "Gnama", "Marela", "Passaya", "Sandenia", "Tiro"],
  },
  "dabola": {
    nom: "Préfecture de Dabola",
    districts: [
      { nom: "Dabola-Centre",   secteurs: s("DC", 3) },
      { nom: "Dabola-Plateau",  secteurs: s("DP", 2) },
    ],
    sousPrefectures: ["Dabola (CU)", "Arfamoussaya", "Fia", "Kindoye", "Ndéma", "Pelléya"],
  },
  "dinguiraye": {
    nom: "Préfecture de Dinguiraye",
    districts: [
      { nom: "Dinguiraye-Centre", secteurs: s("DC", 3) },
      { nom: "Dinguiraye-Nord",   secteurs: s("DN", 2) },
    ],
    sousPrefectures: ["Dinguiraye (CU)", "Bendou", "Diari-Dinguiraye", "Doura", "Gagnakaly", "Kalinko-Dinguiraye", "Koba-Dinguiraye"],
  },
  "kissidougou": {
    nom: "Préfecture de Kissidougou",
    districts: [
      { nom: "Kissidougou-Centre", secteurs: s("KC", 3) },
      { nom: "Kissidougou-Sud",    secteurs: s("KS", 2) },
    ],
    sousPrefectures: ["Kissidougou (CU)", "Fermessadou-Pombo", "Firawa", "Gbangbadou", "Kondiadou", "Manfran", "Yendé-Millimou", "Yendé-Moussa"],
  },

  // ── RÉGION DE KANKAN ─────────────────────────────────────────────────────────
  "kankan-cu": {
    nom: "Commune Urbaine de Kankan",
    districts: [
      { nom: "Kankan-Centre",  secteurs: ["Marché Central", "Mairie", "Mosquée Karamoko", "Gare Fluviale"] },
      { nom: "Gbèrèdou",       secteurs: s("GBE", 4) },
      { nom: "Kourouma",       secteurs: s("KOU", 3) },
      { nom: "Bato",           secteurs: s("BAT", 3) },
      { nom: "Moribakoura",    secteurs: s("MOR", 2) },
      { nom: "Komaréya",       secteurs: s("KOM", 2) },
    ],
  },
  "kankan": {
    nom: "Préfecture de Kankan",
    districts: [
      { nom: "Kankan-Centre",  secteurs: ["Marché", "Mairie", "Mosquée"] },
      { nom: "Gbèrèdou",       secteurs: s("GBE", 3) },
    ],
    sousPrefectures: ["Kankan (CU)", "Balandougou", "Banankoro", "Bordo", "Cissela", "Djanka", "Faralako", "Founou", "Gbèrèdou-Hamdallaye", "Kouroussa-Kankan", "Missamana", "Moribayah", "Sabadou-Baranama"],
  },
  "kerouane": {
    nom: "Préfecture de Kérouané",
    districts: [
      { nom: "Kérouané-Centre", secteurs: s("KC", 3) },
      { nom: "Kérouané-Nord",   secteurs: s("KN", 2) },
    ],
    sousPrefectures: ["Kérouané (CU)", "Banié", "Damaro", "Komodou", "Sibiribaro", "Soromaya", "Traoréla"],
  },
  "kouroussa": {
    nom: "Préfecture de Kouroussa",
    districts: [
      { nom: "Kouroussa-Centre", secteurs: s("KC", 3) },
      { nom: "Kouroussa-Fleuve", secteurs: s("KF", 2) },
    ],
    sousPrefectures: ["Kouroussa (CU)", "Babila", "Baro", "Doura-Kouroussa", "Douako", "Koumana", "Sanguiana", "Tiro-Kouroussa"],
  },
  "mandiana": {
    nom: "Préfecture de Mandiana",
    districts: [
      { nom: "Mandiana-Centre", secteurs: s("MC", 3) },
      { nom: "Mandiana-Est",    secteurs: s("ME", 2) },
    ],
    sousPrefectures: ["Mandiana (CU)", "Faralako-Mandiana", "Kiniéran", "Krédou", "Morodou", "Nianiana", "Nyamina", "Saladou", "Sossodala", "Nono"],
  },
  "siguiri": {
    nom: "Préfecture de Siguiri",
    districts: [
      { nom: "Siguiri-Centre",  secteurs: ["Marché", "Mairie", "Fleuve Niger", "Mines"] },
      { nom: "Siguiri-Mines",   secteurs: s("SM", 3) },
      { nom: "Norassoba",       secteurs: s("NOR", 2) },
    ],
    sousPrefectures: ["Siguiri (CU)", "Doko", "Franwalia", "Kiniero", "Kintinian", "Maléah", "Norassoba", "Niagassola", "Ouaran", "Saladou-Siguiri"],
  },

  // ── RÉGION DE N'ZÉRÉKORÉ ─────────────────────────────────────────────────────
  "nzerekore-cu": {
    nom: "Commune Urbaine de N'Zérékoré",
    districts: [
      { nom: "N'Zérékoré-Centre", secteurs: ["Marché Central", "Mairie", "Cathédrale", "Mosquée"] },
      { nom: "Tokpota",           secteurs: s("TOK", 3) },
      { nom: "Gbakoré",           secteurs: s("GBA", 3) },
      { nom: "Gbèkouré",          secteurs: s("GBE", 2) },
      { nom: "Yalenzou",          secteurs: s("YAL", 3) },
      { nom: "Gbié",              secteurs: s("GBI", 2) },
    ],
  },
  "nzerekore": {
    nom: "Préfecture de N'Zérékoré",
    districts: [
      { nom: "N'Zérékoré-Centre", secteurs: ["Marché", "Mairie", "Cathédrale"] },
      { nom: "Tokpota",           secteurs: s("TOK", 2) },
    ],
    sousPrefectures: ["N'Zérékoré (CU)", "Bounouma", "Gouécké", "Lainé", "Orémai", "Samoé", "Sowonata", "Tounkarata"],
  },
  "beyla": {
    nom: "Préfecture de Beyla",
    districts: [
      { nom: "Beyla-Centre",    secteurs: s("BC", 3) },
      { nom: "Beyla-Forêt",     secteurs: s("BF", 2) },
    ],
    sousPrefectures: ["Beyla (CU)", "Diassodou", "Gbondou", "Karala", "Moussadou", "Nionsomoridou", "Sanankoro-Beyla", "Sindou", "Sinko"],
  },
  "gueckedou": {
    nom: "Préfecture de Guéckédou",
    districts: [
      { nom: "Guéckédou-Centre", secteurs: s("GC", 3) },
      { nom: "Guéckédou-Fleuve", secteurs: s("GF", 2) },
    ],
    sousPrefectures: ["Guéckédou (CU)", "Fangamadou", "Guéckédou-Rural", "Kassadou", "Nongoa", "Ouendou", "Tèwomèy"],
  },
  "lola": {
    nom: "Préfecture de Lola",
    districts: [
      { nom: "Lola-Centre",     secteurs: s("LC", 3) },
      { nom: "Lola-Forêt",      secteurs: s("LF", 2) },
    ],
    sousPrefectures: ["Lola (CU)", "Bossou", "Gouéla", "Nzo", "Tounkarata-Lola", "Zérékoré"],
  },
  "macenta": {
    nom: "Préfecture de Macenta",
    districts: [
      { nom: "Macenta-Centre",  secteurs: s("MC", 3) },
      { nom: "Macenta-Forêt",   secteurs: s("MF", 2) },
    ],
    sousPrefectures: ["Macenta (CU)", "Balizia", "Bofossou", "Femenia", "Gbangbadou-Macenta", "Kouankan", "Moussadou-Macenta", "N'Zébéla", "Sérédou", "Simpar"],
  },
  "yomou": {
    nom: "Préfecture de Yomou",
    districts: [
      { nom: "Yomou-Centre",    secteurs: s("YC", 3) },
      { nom: "Yomou-Forêt",     secteurs: s("YF", 2) },
    ],
    sousPrefectures: ["Yomou (CU)", "Bignamou", "Daro", "Diécké", "Nionsomoridou-Yomou"],
  },
};

// Extract short name from full official name ("Commune Urbaine de Mamou" → "Mamou")
function shortName(fullName: string): string {
  return fullName
    .replace(/^Commune Urbaine de /i, "")
    .replace(/^Préfecture de /i, "")
    .replace(/^Commune de /i, "")
    .trim();
}

// Build plausible geographic data for any commune
const MAMOU_CENTER = { lat: 10.3755, lng: -12.0892 };

// GPS coordinates for all Guinean administrative entities
const GUINEA_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  // ── CONAKRY ──
  "conakry-kaloum":     { lat: 9.5143,  lng: -13.7005, zoom: 14 },
  "conakry-dixinn":     { lat: 9.5460,  lng: -13.6750, zoom: 14 },
  "conakry-matam":      { lat: 9.5667,  lng: -13.6400, zoom: 14 },
  "conakry-ratoma":     { lat: 9.6050,  lng: -13.6233, zoom: 13 },
  "conakry-matoto":     { lat: 9.5300,  lng: -13.5833, zoom: 13 },
  // ── KINDIA ──
  "kindia":             { lat: 10.0583, lng: -12.8658, zoom: 13 },
  "coyah":              { lat: 9.7167,  lng: -13.3833, zoom: 13 },
  "dubreka":            { lat: 9.7833,  lng: -13.5167, zoom: 13 },
  "forecariah":         { lat: 9.4167,  lng: -13.0833, zoom: 13 },
  "telimele":           { lat: 10.9000, lng: -13.0333, zoom: 12 },
  "telimele-cu":        { lat: 10.9000, lng: -13.0333, zoom: 13 },
  // ── BOKÉ ──
  "boke":               { lat: 10.9333, lng: -14.2833, zoom: 13 },
  "boke-cu":            { lat: 10.9333, lng: -14.2833, zoom: 14 },
  "boffa":              { lat: 10.1833, lng: -14.0500, zoom: 13 },
  "fria":               { lat: 10.3667, lng: -13.5500, zoom: 13 },
  "gaoual":             { lat: 11.7500, lng: -13.2000, zoom: 13 },
  "koundara":           { lat: 12.4833, lng: -13.3000, zoom: 12 },
  "kamsar":             { lat: 10.6833, lng: -14.6000, zoom: 13 },
  // ── MAMOU ──
  "mamou":              { lat: 10.3755, lng: -12.0892, zoom: 13 },
  "mamou-cu":           { lat: 10.3755, lng: -12.0892, zoom: 14 },
  "dalaba":             { lat: 10.6833, lng: -12.2500, zoom: 13 },
  "pita":               { lat: 11.0667, lng: -12.4000, zoom: 13 },
  "tougue":             { lat: 11.4500, lng: -11.6833, zoom: 12 },
  // ── LABÉ ──
  "labe":               { lat: 11.3167, lng: -12.2833, zoom: 13 },
  "labe-cu":            { lat: 11.3167, lng: -12.2833, zoom: 14 },
  "koubia":             { lat: 11.5667, lng: -11.8833, zoom: 13 },
  "lelouma":            { lat: 11.2000, lng: -12.1000, zoom: 13 },
  "mali":               { lat: 12.0833, lng: -12.3000, zoom: 12 },
  // ── FARANAH ──
  "faranah":            { lat: 10.0500, lng: -10.7333, zoom: 13 },
  "faranah-cu":         { lat: 10.0500, lng: -10.7333, zoom: 14 },
  "dabola":             { lat: 10.7500, lng: -11.1167, zoom: 13 },
  "dinguiraye":         { lat: 11.3000, lng: -10.7167, zoom: 12 },
  "kissidougou":        { lat: 9.1833,  lng: -10.1167, zoom: 13 },
  // ── KANKAN ──
  "kankan":             { lat: 10.3833, lng: -9.3000,  zoom: 13 },
  "kankan-cu":          { lat: 10.3833, lng: -9.3000,  zoom: 14 },
  "kouroussa":          { lat: 10.6500, lng: -9.8833,  zoom: 13 },
  "mandiana":           { lat: 10.6333, lng: -8.6667,  zoom: 12 },
  "siguiri":            { lat: 11.4167, lng: -9.1667,  zoom: 13 },
  "kerouane":           { lat: 9.2667,  lng: -9.0167,  zoom: 13 },
  // ── N'ZÉRÉKORÉ ──
  "nzerekore":          { lat: 7.7500,  lng: -8.8167,  zoom: 13 },
  "nzerekore-cu":       { lat: 7.7500,  lng: -8.8167,  zoom: 14 },
  "beyla":              { lat: 8.6833,  lng: -8.6500,  zoom: 13 },
  "gueckedou":          { lat: 8.5667,  lng: -10.1333, zoom: 13 },
  "lola":               { lat: 7.8167,  lng: -8.5333,  zoom: 13 },
  "macenta":            { lat: 8.5500,  lng: -9.4667,  zoom: 13 },
  "yomou":              { lat: 7.5667,  lng: -9.2500,  zoom: 13 },
};

function getCenter(communeId: string): { lat: number; lng: number; zoom: number } {
  if (GUINEA_CENTERS[communeId]) return GUINEA_CENTERS[communeId];
  // Fuzzy match: strip suffixes like -cu, -prefecture
  const base = communeId.replace(/-(cu|prefecture|pref|urbaine)$/i, "");
  if (GUINEA_CENTERS[base]) return GUINEA_CENTERS[base];
  return { lat: MAMOU_CENTER.lat, lng: MAMOU_CENTER.lng, zoom: 13 };
}

// Generate GPS coordinates for each district around a center with seeded offsets
function genDistrictCoords(
  districts: { nom: string; secteurs: string[] }[],
  center: { lat: number; lng: number },
  communeId: string
): { nom: string; secteurs: string[]; lat: number; lng: number }[] {
  const spread = 0.018; // ~2km radius
  return districts.map((d, i) => {
    const angle = (i / districts.length) * 2 * Math.PI + seededRand(communeId, i + 100);
    const dist = spread * (0.4 + seededRand(communeId, i + 200) * 0.6);
    return {
      ...d,
      lat: center.lat + Math.sin(angle) * dist,
      lng: center.lng + Math.cos(angle) * dist,
    };
  });
}

// Generate simulated contribuables with GPS near the given center
function genSimContribuables(
  center: { lat: number; lng: number },
  communeId: string,
  communeCode: string,
  districts: { nom: string; secteurs: string[]; lat?: number; lng?: number }[],
  count = 30
): Contribuable[] {
  const surnames = ["Diallo","Bah","Sow","Barry","Camara","Sylla","Kouyaté","Diakité","Condé","Baldé","Touré","Bangoura","Kourouma","Soumah","Keita"];
  const firstnames = ["Mamadou","Fatoumata","Ibrahim","Aissatou","Sékou","Mariama","Alhassane","Hawa","Mohamed","Aminata","Alpha","Kadiatou","Ibrahima","Mariam"];
  const types = ["Résidentiel","Commercial","Industriel","Administratif"];
  const usages = ["Habitation principale","Boutique","Restaurant","Entrepôt","Bureau","Pharmacie"];
  const statuts = ["Payé","En attente","Arriéré","Payé","Payé"] as const;
  const cats = ["A","B","C"] as const;
  const spread = 0.012;
  const year = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => {
    const r = (n: number) => seededRand(`${communeId}-contrib-${i}`, n);
    const distIdx = Math.floor(r(0) * districts.length);
    const dist = districts[distIdx];
    const baseLat = dist?.lat ?? center.lat;
    const baseLng = dist?.lng ?? center.lng;
    const angle = r(1) * 2 * Math.PI;
    const radius = spread * (0.1 + r(2) * 0.9);
    const lat = baseLat + Math.sin(angle) * radius;
    const lng = baseLng + Math.cos(angle) * radius;
    const nomIdx = Math.floor(r(3) * surnames.length);
    const prenomIdx = Math.floor(r(4) * firstnames.length);
    const typeIdx = Math.floor(r(5) * types.length);
    const usageIdx = Math.floor(r(6) * usages.length);
    const statutIdx = Math.floor(r(7) * statuts.length);
    const cat = cats[Math.floor(r(8) * cats.length)];
    const surface = 60 + Math.floor(r(9) * 400);
    const valeur = (800000 + Math.floor(r(10) * 8000000));
    const num = String(i + 1).padStart(5, "0");
    return {
      id: `${communeCode}-${year}-${num}`,
      nom: surnames[nomIdx],
      prenom: firstnames[prenomIdx],
      telephone: `+224 6${String(Math.floor(r(11)*9)+1)}${String(Math.floor(r(12)*10000000)).padStart(7,"0")}`,
      nin: `GN${year}${String(Math.floor(r(13)*90000000)+10000000)}`,
      quartier: dist?.nom ?? "Centre-ville",
      secteur: dist?.secteurs?.[Math.floor(r(14)*((dist?.secteurs?.length??1)))] ?? "S-01",
      type: types[typeIdx],
      usage: usages[usageIdx],
      surface,
      valeur,
      statut: statuts[statutIdx],
      date: `${year}-${String(Math.floor(r(15)*11)+1).padStart(2,"0")}-${String(Math.floor(r(16)*27)+1).padStart(2,"0")}`,
      coordGps: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      categorie: cat,
    };
  });
}

function buildCommuneConfig(communeId: string, communeName: string): CommuneConfig {
  const baseName = shortName(communeName);
  const code = baseName.slice(0, 3).toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const COLOR_PALETTE = ["#1B3A6B", "#B8860B", "#2E6B3E", "#8B1A1A", "#4A6B8A", "#6B4A8A", "#8A6B4A", "#2E6B6B", "#6B2E3E"];
  const r = (i: number) => seededRand(communeId, i);
  const center = getCenter(communeId);

  // Mamou — use exact known data
  if (communeId === "mamou" || communeId === "mamou-cu") {
    const mamouDistricts = PREFECTURE_MAMOU.communes[0].districts ?? (PREFECTURE_MAMOU.communes[0] as any).quartiers?.map((q: any) => ({ nom: q.nom, secteurs: q.secteurs, lat: q.lat, lng: q.lng })) ?? [];
    return {
      code: "MOU",
      communeName,
      communes: PREFECTURE_MAMOU.communes,
      sousPrefectures: PREFECTURE_MAMOU.sousPrefectures,
      spStats: SP_STATS,
      quartierColors: QUARTIER_COLORS,
      agents: AGENTS_RECENSEURS,
      mapCenter: { lat: MAMOU_CENTER.lat, lng: MAMOU_CENTER.lng, zoom: 13 },
    };
  }

  // Use real Guinea geo data if available
  const geo = GUINEA_GEO[communeId];

  const isPrefecture = communeName.toLowerCase().startsWith("préfecture");
  const entityLabel = isPrefecture ? "Préfecture" : "Commune Urbaine";
  const mainNom = geo?.nom ?? (isPrefecture ? `Commune Urbaine de ${baseName}` : communeName);
  const districts = geo?.districts ?? [
    { nom: `${baseName}-Centre`, secteurs: ["Marché", "Mairie", "Mosquée", "Gare"] },
    { nom: `${baseName}-Nord`,   secteurs: ["Nord-S1", "Nord-S2", "Nord-S3"] },
    { nom: `${baseName}-Sud`,    secteurs: ["Sud-S1", "Sud-S2", "Sud-S3"] },
    { nom: "Résidentiel",        secteurs: ["Rés-S1", "Rés-S2"] },
    { nom: "Zone Commerciale",   secteurs: ["ZC-S1", "ZC-S2", "ZC-S3"] },
  ];

  const communeUrbaine = { nom: mainNom, districts };

  // Sous-préfectures: use real data if available, else generate
  const spSuffixes = ["Centre", "Nord", "Sud", "Est", "Ouest", "Rural", "Périphérie", "Plateau"];
  const sousPrefectures: string[] = geo?.sousPrefectures ?? Array.from(
    { length: isPrefecture ? 6 + Math.floor(r(1) * 4) : 3 + Math.floor(r(1) * 3) },
    (_, i) => i === 0 ? `${baseName}-Centre` : `SP-${baseName}-${spSuffixes[i % spSuffixes.length]}`
  );

  // Build spStats with seeded values
  const spStats: CommuneConfig["spStats"] = {};

  const mainContribs = 3000 + Math.floor(r(2) * 5000);
  const mainTaux = 55 + Math.floor(r(3) * 30);
  const mainDistricts: Record<string, { contribuables: number; taux: number; recettes: number; secteurs: string[] }> = {};
  districts.forEach((d, i) => {
    const dc = 200 + Math.floor(r(i + 20) * 800);
    const dt = 50 + Math.floor(r(i + 30) * 35);
    mainDistricts[d.nom] = { contribuables: dc, taux: dt, recettes: dc * (70000 + Math.floor(r(i + 40) * 30000)), secteurs: d.secteurs };
  });
  spStats[mainNom] = { label: entityLabel, contribuables: mainContribs, taux: mainTaux, recettes: mainContribs * (80000 + Math.floor(r(4) * 40000)), arriere: Math.floor(mainContribs * 0.2), districts: mainDistricts };

  sousPrefectures.slice(1).forEach((sp, i) => {
    const spContribs = 400 + Math.floor(r(i + 50) * 1200);
    const spTaux = 40 + Math.floor(r(i + 60) * 30);
    const spLabel = sp.replace(`SP-${baseName}-`, "").replace(` (CU)`, "");
    const spDistricts: Record<string, { contribuables: number; taux: number; recettes: number; secteurs: string[] }> = {};
    [`${spLabel}-Centre`, `${spLabel}-Périphérie`].forEach((d, j) => {
      const dc = 100 + Math.floor(r(i + j + 70) * 500);
      spDistricts[d] = { contribuables: dc, taux: 40 + Math.floor(r(i + j + 80) * 25), recettes: dc * 50000, secteurs: ["Secteur 1", "Secteur 2"] };
    });
    spStats[`Sous-Préfecture de ${spLabel}`] = { label: `SP ${spLabel}`, contribuables: spContribs, taux: spTaux, recettes: spContribs * 60000, arriere: Math.floor(spContribs * 0.25), districts: spDistricts };
  });

  const quartierColors: Record<string, string> = {};
  districts.forEach((d, i) => { quartierColors[d.nom] = COLOR_PALETTE[i % COLOR_PALETTE.length]; });

  // Enrich districts with GPS coordinates
  const districtsWithCoords = genDistrictCoords(districts, center, communeId);

  return {
    code,
    communeName,
    communes: [{ nom: mainNom, districts: districtsWithCoords }],
    sousPrefectures,
    spStats,
    quartierColors,
    agents: AGENTS_RECENSEURS,
    mapCenter: { lat: center.lat, lng: center.lng, zoom: center.zoom },
  };
}

// ─── FlagLogo ─────────────────────────────────────────────────────────────────
function FlagLogo({ size = 32 }: { size?: number }) {
  return (
    <img src={logoImg} alt="Blason République de Guinée"
      style={{ width: size, height: size, objectFit: "contain", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.3))" }}
    />
  );
}

// ─── Données géographiques de Mamou ──────────────────────────────────────────
// (MAMOU_CENTER is also defined earlier in the file before GUINEA_CENTERS for buildCommuneConfig)
// Structure administrative de Mamou
const PREFECTURE_MAMOU = {
  nom: "Mamou",
  communes: [
    {
      nom: "Commune Urbaine de Mamou",
      quartiers: [
        { nom: "Centre-ville", lat: 10.3801, lng: -12.0871, secteurs: ["S-01", "S-02", "S-03"] },
        { nom: "Sikhourou", lat: 10.3792, lng: -12.0862, secteurs: ["S-04", "S-05", "S-06"] },
        { nom: "Gongoré", lat: 10.3788, lng: -12.0892, secteurs: ["S-07", "S-08", "S-09", "S-10"] },
        { nom: "Donghol Touma", lat: 10.3815, lng: -12.0845, secteurs: ["S-11", "S-12"] },
        { nom: "Saré Koura", lat: 10.3762, lng: -12.0833, secteurs: ["S-13", "S-14"] },
        { nom: "Porédaka", lat: 10.3720, lng: -12.0880, secteurs: ["S-15", "S-16"] },
        { nom: "Téguéréya", lat: 10.3825, lng: -12.0920, secteurs: ["S-17", "S-18"] },
      ]
    }
  ],
  sousPrefectures: [
    "Mamou-Centre",
    "Dounet",
    "Gongoret",
    "Kegneko",
    "Nyagara",
    "Ouré-Kaba",
    "Porédaka",
    "Saramoussaya",
    "Soyah",
    "Téguéréya"
  ]
};

// Couleurs pour les quartiers
const QUARTIER_COLORS: Record<string, string> = {
  "Centre-ville": "#1B3A6B",
  "Sikhourou": "#B8860B",
  "Gongoré": "#2E6B3E",
  "Donghol Touma": "#8B1A1A",
  "Saré Koura": "#4A6B8A",
  "Porédaka": "#6B4A8A",
  "Téguéréya": "#8A6B4A",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtShort = (n: number) => `${n.toLocaleString("fr-FR")} GNF`;

// ─── Utilitaire d'impression ──────────────────────────────────────────────────
function printSection(opts: {
  title: string;
  subtitle?: string;
  html: string;
  landscape?: boolean;
  pos?: boolean; // format ticket POS 80mm
}) {
  const { title, subtitle, html, landscape = false, pos = false } = opts;
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  const date = new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
  const pageSize = pos
    ? "@page { size: 80mm auto; margin: 4mm; }"
    : landscape
    ? "@page { size: A4 landscape; margin: 15mm; }"
    : "@page { size: A4 portrait; margin: 15mm; }";

  w.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>${title}</title>
<style>
  ${pageSize}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Arial', sans-serif; font-size: ${pos ? "10px" : "11px"}; color: #1a1a2e; }
  .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; border-bottom: 2px solid #1B3A6B; margin-bottom: 14px; }
  .header-left { display: flex; align-items: center; gap: 10px; }
  .flag-strip { display: flex; height: 6px; width: 36px; border-radius: 1px; overflow: hidden; }
  .flag-r { flex:1; background:#CE1126; } .flag-y { flex:1; background:#FCD116; } .flag-g { flex:1; background:#009460; }
  .logo-box { width: 36px; height: 36px; background: #1B3A6B; border-radius: 3px; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:14px; }
  .org { font-size: 8px; color: #6b6b6b; line-height:1.4; }
  .title-h1 { font-size: ${pos ? "12px" : "16px"}; font-weight: bold; color: #1B3A6B; }
  .subtitle { font-size: 9px; color: #888; margin-top: 2px; }
  .date-stamp { font-size: 9px; color: #888; font-family: monospace; text-align:right; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #1B3A6B; color: white; padding: 5px 8px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 4px 8px; font-size: 10px; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) td { background: #f8f7f4; }
  .badge-paye { color: #15803d; font-weight: bold; }
  .badge-attente { color: #b45309; font-weight: bold; }
  .badge-arriere { color: #b91c1c; font-weight: bold; }
  .footer { margin-top: 20px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 8px; color: #aaa; display:flex; justify-content:space-between; }
  .total-row td { font-weight: bold; background: #f0f4ff; border-top: 2px solid #1B3A6B; }
  .pos-divider { border-top: 1px dashed #999; margin: 6px 0; }
  .pos-center { text-align: center; }
  .pos-mono { font-family: monospace; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <div class="header-left">
    <div>
      <div class="flag-strip"><div class="flag-r"></div><div class="flag-y"></div><div class="flag-g"></div></div>
    </div>
    <img src="${logoImg}" alt="Blason" style="width:36px;height:36px;object-fit:contain;" />
    <div class="org">
      <div style="font-weight:bold;font-size:10px;color:#1B3A6B">SNRR-MAMOU</div>
      <div>Commune Urbaine de Mamou</div>
      <div>République de Guinée</div>
    </div>
  </div>
  <div style="text-align:right">
    <div class="title-h1">${title}</div>
    ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ""}
    <div class="date-stamp">Édité le ${date}</div>
  </div>
</div>
${html}
<div class="footer">
  <span>SNRR-MAMOU © ${new Date().getFullYear()} — Document officiel</span>
  <span>Imprimé le ${date}</span>
</div>
</body></html>`);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 400);
}

// Format POS ticket (80mm thermal receipt)
function printPOSReceipt(opts: {
  title: string; ref: string; lines: { label: string; value: string; bold?: boolean }[];
  footer?: string; qrValue?: string;
}) {
  const { title, ref, lines, footer, qrValue } = opts;
  const date = new Date().toLocaleString("fr-FR");
  const linesHtml = lines.map(l =>
    `<tr><td class="pos-mono">${l.label}</td><td class="pos-mono" style="text-align:right;${l.bold ? "font-weight:bold" : ""}">${l.value}</td></tr>`
  ).join("");
  printSection({
    title, pos: true,
    html: `
      <div class="pos-center pos-mono" style="font-size:9px;margin-bottom:6px;">
        <div style="font-weight:bold;font-size:11px;">${title}</div>
        <div>Réf: ${ref}</div>
        <div>${date}</div>
      </div>
      <div class="pos-divider"></div>
      <table style="font-size:10px;"><tbody>${linesHtml}</tbody></table>
      <div class="pos-divider"></div>
      ${qrValue ? `<div class="pos-center" style="font-size:8px;margin-top:4px;">[QR: ${qrValue}]</div>` : ""}
      ${footer ? `<div class="pos-center pos-mono" style="font-size:8px;margin-top:6px;">${footer}</div>` : ""}
    `,
  });
}

const genId = (prefix: string) =>
  `${prefix}-${Date.now().toString().slice(-6)}`;

const now = () => new Date().toLocaleString("fr-GN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(/\//g, "-");

function StatusBadge({ statut }: { statut: string }) {
  const map: Record<string, string> = {
    Payé: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Validé: "bg-emerald-100 text-emerald-800 border-emerald-200",
    "En attente": "bg-amber-100 text-amber-800 border-amber-200",
    Arriéré: "bg-red-100 text-red-800 border-red-200",
    Annulé: "bg-slate-100 text-slate-600 border-slate-200",
    Actif: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Inactif: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded-sm font-mono tracking-wide ${map[statut] ?? "bg-slate-100 text-slate-600"}`}>
      {statut}
    </span>
  );
}

// ─── QR Code réel (scannable) ─────────────────────────────────────────────────
function QrDisplay({ value }: { value: string }) {
  const qrValue = `SNRR:${value}`;
  return (
    <div className="inline-block border-[3px] border-white shadow-xl bg-white p-2">
      <QRCodeSVG value={qrValue} size={160} fgColor="#1B3A6B" bgColor="white" level="M" />
    </div>
  );
}

// ─── QR Scanner Modal ─────────────────────────────────────────────────────────
function QRScannerModal({ contribuables, onFound, onClose }: {
  contribuables: Contribuable[];
  onFound: (c: Contribuable) => void;
  onClose: () => void;
}) {
  const [found, setFound] = useState<Contribuable | null>(null);
  const [camErr, setCamErr] = useState("");
  const [scanning, setScanning] = useState(true);
  const [lastRaw, setLastRaw] = useState("");
  const [manualId, setManualId] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;
    startCam();
    return () => {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startCam = async () => {
    setCamErr("");
    // Vérifier la permission avant d'appeler getUserMedia
    let permState: PermissionState = "prompt";
    try {
      const r = await navigator.permissions.query({ name: "camera" as PermissionName });
      permState = r.state;
    } catch { /* non supporté */ }

    if (permState === "denied") {
      setCamErr("denied");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        tick();
      }
    } catch (e: any) {
      if (e?.name === "NotAllowedError" || e?.name === "PermissionDeniedError") {
        setCamErr("denied");
      } else if (e?.name === "NotFoundError") {
        setCamErr("Aucune caméra détectée sur cet appareil.");
      } else {
        setCamErr("Impossible d'activer la caméra. Réessayez.");
      }
    }
  };

  const handleManualSearch = () => {
    const id = manualId.trim().replace(/^SNRR:/i, "");
    if (!id) return;
    const c = contribuables.find(x => x.id.toLowerCase() === id.toLowerCase() ||
      `${x.prenom} ${x.nom}`.toLowerCase().includes(id.toLowerCase()));
    if (c) { setFound(c); setScanning(false); }
    else setCamErr(`Aucun contribuable trouvé pour "${id}"`);
  };

  const tick = async () => {
    if (!activeRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) { rafRef.current = requestAnimationFrame(tick); return; }
    const w = video.videoWidth, h = video.videoHeight;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h);
    // Dynamically import jsQR to keep bundle small
    const { default: jsQR } = await import("jsqr").catch(() => ({ default: null }));
    if (jsQR) {
      const code = jsQR(img.data, w, h, { inversionAttempts: "dontInvert" });
      if (code?.data && code.data !== lastRaw) {
        setLastRaw(code.data);
        const raw = code.data.trim();
        const id = raw.startsWith("SNRR:") ? raw.slice(5) : raw;
        const c = contribuables.find(x => x.id === id);
        if (c) {
          setFound(c);
          setScanning(false);
          streamRef.current?.getTracks().forEach(t => t.stop());
          return;
        } else {
          // Unknown QR — brief flash then continue
          setTimeout(() => setLastRaw(""), 2000);
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const reset = () => {
    setFound(null); setLastRaw(""); setScanning(true);
    startCam();
  };

  const photo = found ? (localStorage.getItem(`snrr_contrib_photo_${found.id}`) ?? found.photoContribuable) : null;
  const statColor = found ? (found.statut === "Payé" ? "#009460" : found.statut === "Arriéré" ? "#CE1126" : "#B8860B") : "#1B3A6B";

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-card rounded-t-xl sm:rounded-sm border border-border w-full sm:max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-primary/5">
          <div className="flex items-center gap-2">
            <QrCode size={16} className="text-primary" />
            <span className="text-sm font-semibold font-mono">Scanner un QR code</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {found ? (
            /* ─── Résultat trouvé ─── */
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-mono font-semibold"
                style={{ background: `${statColor}15`, border: `1px solid ${statColor}40`, color: statColor }}>
                <CheckCircle size={13} /> Contribuable identifié
              </div>
              <div className="flex items-center gap-4 p-4 bg-secondary/40 rounded-sm border border-border">
                {photo
                  ? <img src={photo} alt="" className="w-14 h-14 rounded-sm object-cover border-2 shrink-0" style={{ borderColor: statColor }} />
                  : <div className="w-14 h-14 rounded-sm flex items-center justify-center text-xl font-bold font-mono text-white shrink-0"
                      style={{ background: statColor }}>{found.nom[0]}{found.prenom[0]}</div>
                }
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{found.prenom} {found.nom}</p>
                  <p className="text-xs font-mono text-muted-foreground">{found.id}</p>
                  <p className="text-xs font-mono text-muted-foreground truncate">{found.quartier} · {found.type}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-mono rounded-sm font-semibold"
                    style={{ background: `${statColor}20`, color: statColor }}>{found.statut}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={reset}
                  className="flex-1 py-3 text-xs font-mono border border-border rounded-sm hover:bg-secondary transition-colors">
                  Scanner à nouveau
                </button>
                <button onClick={() => { onFound(found); onClose(); }}
                  className="flex-1 py-3 text-xs font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">
                  <Eye size={12} /> Ouvrir la fiche
                </button>
              </div>
            </div>
          ) : camErr ? (
            /* ─── Caméra refusée : saisie manuelle ─── */
            <div className="space-y-4 py-1">
              {camErr === "denied" ? (
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-sm">
                  <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-mono text-amber-800 leading-relaxed">
                    Caméra non autorisée dans ce navigateur.<br />
                    Entrez l'identifiant SNRR directement ci-dessous.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-sm">
                  <AlertTriangle size={14} className="text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-mono text-red-700">{camErr}</p>
                </div>
              )}

              {/* Saisie manuelle de l'ID */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Identifiant du contribuable
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualId}
                    onChange={e => { setManualId(e.target.value); setCamErr(prev => prev === "denied" ? prev : ""); }}
                    onKeyDown={e => e.key === "Enter" && handleManualSearch()}
                    placeholder="ex. MOU-2024-12345 ou nom prénom"
                    className="flex-1 px-3 py-2.5 text-sm border border-border rounded-sm font-mono bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                  <button onClick={handleManualSearch}
                    className="px-4 py-2.5 text-xs font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity flex items-center gap-1.5">
                    <Eye size={13} /> Chercher
                  </button>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">
                  Format : MOU-AAAA-XXXXX — visible sur l'avis d'imposition
                </p>
              </div>

              {/* Réessayer la caméra */}
              <div className="border-t border-border pt-3">
                <button onClick={startCam}
                  className="w-full py-2.5 text-xs font-mono border border-border rounded-sm hover:bg-secondary transition-colors flex items-center justify-center gap-2 text-muted-foreground">
                  <RefreshCw size={12} /> Réessayer l'accès caméra
                </button>
              </div>
            </div>
          ) : (
            /* ─── Vue caméra active ─── */
            <>
              <p className="text-xs font-mono text-muted-foreground text-center">
                Pointez la caméra arrière sur le QR code du contribuable
              </p>
              <div className="relative rounded-sm overflow-hidden bg-black" style={{ aspectRatio: "4/3" }}>
                <video ref={videoRef} autoPlay playsInline muted
                  className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                {/* Viewfinder */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative" style={{ width: "55%", aspectRatio: "1" }}>
                    {/* Corners */}
                    {[["top-0 left-0 border-t-2 border-l-2","tl"],["top-0 right-0 border-t-2 border-r-2","tr"],
                      ["bottom-0 left-0 border-b-2 border-l-2","bl"],["bottom-0 right-0 border-b-2 border-r-2","br"]].map(([cls]) => (
                      <div key={cls} className={`absolute w-5 h-5 ${cls} border-[#FCD116]`} />
                    ))}
                    {/* Scan line */}
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-[#FCD116]/70 animate-pulse" />
                    {/* Dark overlay outside frame */}
                    <div className="absolute inset-0 border-2 border-white/10" />
                  </div>
                </div>
                {/* Unknown QR flash */}
                {lastRaw && !found && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    <div className="bg-red-600/90 text-white text-[10px] font-mono px-3 py-1.5 rounded-sm flex items-center gap-1.5">
                      <AlertTriangle size={10} /> Code non reconnu
                    </div>
                  </div>
                )}
                {/* Scanning indicator */}
                {scanning && !lastRaw && (
                  <div className="absolute top-3 left-0 right-0 flex justify-center">
                    <div className="bg-black/60 text-white/70 text-[10px] font-mono px-3 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FCD116] animate-ping inline-block" />
                      Scan en cours…
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Accès refusé ─────────────────────────────────────────────────────────────
function AccessDenied({ role, view }: { role: string; view: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-6 p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
        <Lock size={28} className="text-[#CE1126]" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Crimson Pro', serif" }}>
          Accès non autorisé
        </h2>
        <p className="text-sm text-muted-foreground font-mono leading-relaxed">
          Votre rôle <span className="text-foreground font-semibold">{role}</span> ne dispose pas des autorisations nécessaires pour accéder à ce module.
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          Contactez un administrateur pour obtenir les droits d'accès requis.
        </p>
      </div>
      <div className="flex items-center gap-1.5 px-4 py-2 bg-secondary/50 border border-border rounded-sm">
        <ShieldCheck size={12} className="text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground">Module : <span className="text-foreground">{view}</span></span>
      </div>
    </div>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, size = "md" }: {
  title: string; onClose: () => void; children: React.ReactNode; size?: "sm" | "md" | "lg" | "xl";
}) {
  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-card border border-border rounded-sm shadow-2xl w-full ${widths[size]} max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30 shrink-0">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest font-mono">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-sm transition-colors text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

// ─── Champ formulaire ─────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm bg-input-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/50";
const selectCls = `${inputCls} cursor-pointer`;

// ─── Composant capture photo ──────────────────────────────────────────────────
function PhotoCapture({ label, photo, onPhotoChange }: { label: string; photo?: string; onPhotoChange: (photo: string | null) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsCapturing(true);
    } catch (error) {
      alert("Impossible d'accéder à la caméra. Veuillez vérifier les permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        onPhotoChange(photoData);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
        {label}
      </label>
      
      {photo && !isCapturing && (
        <div className="relative inline-block">
          <img src={photo} alt="Photo" className="w-32 h-32 object-cover border-2 border-border rounded-sm" />
          <button
            type="button"
            onClick={() => onPhotoChange(null)}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {isCapturing && (
        <div className="space-y-2">
          <video ref={videoRef} autoPlay className="w-full max-w-sm border-2 border-primary rounded-sm" />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={capturePhoto}
              className="flex items-center gap-2 px-3 py-2 text-xs font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity"
            >
              <Camera size={14} /> Capturer
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-3 py-2 text-xs font-mono border border-border rounded-sm hover:bg-secondary transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {!photo && !isCapturing && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startCamera}
            className="flex items-center gap-2 px-3 py-2 text-xs font-mono border border-border rounded-sm hover:bg-secondary transition-colors"
          >
            <Camera size={14} /> Prendre photo
          </button>
          <label className="flex items-center gap-2 px-3 py-2 text-xs font-mono border border-border rounded-sm hover:bg-secondary transition-colors cursor-pointer">
            <Upload size={14} /> Charger fichier
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}

// ─── Composant upload documents multiples ─────────────────────────────────────
function MultiFileUpload({ label, files, onFilesChange, accept = "image/*,.pdf" }: { 
  label: string; 
  files?: string[]; 
  onFilesChange: (files: string[]) => void;
  accept?: string;
}) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      const readers = Array.from(fileList).map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(readers).then(results => {
        onFilesChange([...(files || []), ...results]);
      });
    }
  };

  const removeFile = (index: number) => {
    onFilesChange((files || []).filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
        {label}
      </label>
      
      {files && files.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              {file.startsWith('data:image') ? (
                <img src={file} alt={`Document ${index + 1}`} className="w-full h-20 object-cover border border-border rounded-sm" />
              ) : (
                <div className="w-full h-20 flex items-center justify-center border border-border rounded-sm bg-secondary">
                  <FileText size={24} className="text-muted-foreground" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 px-3 py-2 text-xs font-mono border border-border rounded-sm hover:bg-secondary transition-colors cursor-pointer inline-flex">
        <Upload size={14} /> Ajouter des fichiers
        <input
          type="file"
          accept={accept}
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>
      <p className="text-xs text-muted-foreground/70 font-mono">{files?.length || 0} fichier(s)</p>
    </div>
  );
}

// ─── Formulaire Contribuable ──────────────────────────────────────────────────
function ContribuableForm({
  initial, onSave, onClose, communeConfig, communeName = "Mamou",
}: {
  initial?: Partial<Contribuable>;
  onSave: (c: Contribuable) => void;
  onClose: () => void;
  communeConfig?: CommuneConfig;
  communeName?: string;
}) {
  const mainCommune = communeConfig?.communes[0] ?? PREFECTURE_MAMOU.communes[0];
  const quartiers = (mainCommune as any).districts ?? (mainCommune as any).quartiers ?? [];
  const firstQ = quartiers[0]?.nom ?? "Centre-ville";
  const communeCode = communeConfig?.code ?? "MOU";
  const [form, setForm] = useState<Partial<Contribuable>>({
    nom: "", prenom: "", telephone: "", nin: "", quartier: firstQ,
    secteur: quartiers[0]?.secteurs?.[0] ?? "S-01", type: "Résidentiel", usage: "Habitation principale",
    surface: 0, valeur: 0, statut: "En attente", categorie: "B",
    commune: mainCommune.nom,
    coordGps: "", date: new Date().toISOString().slice(0, 10),
    ...initial,
  });
  const set = (k: keyof Contribuable, v: string | number) => setForm((f) => ({ ...f, [k]: v }));
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const captureGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("coordGps", `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleSave = () => {
    if (!form.nom || !form.prenom || !form.telephone) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    const c: Contribuable = {
      id: initial?.id ?? `${communeCode}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`,
      nom: form.nom!, prenom: form.prenom!, telephone: form.telephone!,
      nin: form.nin ?? "", quartier: form.quartier!, secteur: form.secteur!,
      type: form.type!, usage: form.usage!, surface: Number(form.surface),
      valeur: Number(form.valeur), statut: form.statut!, date: form.date!,
      coordGps: form.coordGps ?? "", categorie: form.categorie!,
      photoContribuable: form.photoContribuable,
      photosBatiment: form.photosBatiment,
      plansCadastraux: form.plansCadastraux,
      documentsJustificatifs: form.documentsJustificatifs,
    };
    onSave(c);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-5">
      <p className="text-xs font-mono text-muted-foreground border-l-2 border-accent pl-3 italic">
        Informations du contribuable
      </p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nom de famille" required>
          <input className={inputCls} value={form.nom} onChange={(e) => set("nom", e.target.value)} placeholder="ex. Diallo" />
        </Field>
        <Field label="Prénom(s)" required>
          <input className={inputCls} value={form.prenom} onChange={(e) => set("prenom", e.target.value)} placeholder="ex. Mamadou" />
        </Field>
        <Field label="Téléphone" required>
          <input className={inputCls} value={form.telephone} onChange={(e) => set("telephone", e.target.value)} placeholder="+224 6XX XX XX XX" />
        </Field>
        <Field label="N° Identification nationale">
          <input className={inputCls} value={form.nin} onChange={(e) => set("nin", e.target.value)} placeholder="ex. GN2401234567" />
        </Field>
      </div>

      <p className="text-xs font-mono text-muted-foreground border-l-2 border-accent pl-3 italic">
        Informations du bien
      </p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Quartier" required>
          <select className={selectCls} value={form.quartier} onChange={(e) => set("quartier", e.target.value)}>
            {quartiers.map((q: any) => (
              <option key={q.nom}>{q.nom}</option>
            ))}
          </select>
        </Field>
        <Field label="Secteur">
          <select className={selectCls} value={form.secteur} onChange={(e) => set("secteur", e.target.value)}>
            {(() => {
              const quartier = quartiers.find((q: any) => q.nom === form.quartier);
              const secteurs = quartier?.secteurs || ["S-01"];
              return secteurs.map((s: string) => <option key={s}>{s}</option>);
            })()}
          </select>
        </Field>
        <Field label="Type de bâtiment" required>
          <select className={selectCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
            {["Résidentiel", "Commercial", "Industriel", "Administratif", "Mixte"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Usage du bâtiment">
          <select className={selectCls} value={form.usage} onChange={(e) => set("usage", e.target.value)}>
            {["Habitation principale", "Boutique", "Restaurant", "Pharmacie", "Hôtel", "Atelier", "Entrepôt", "Bureau"].map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </Field>
        <Field label="Catégorie fiscale" required>
          <select className={selectCls} value={form.categorie} onChange={(e) => set("categorie", e.target.value)}>
            {["A", "B", "C"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Surface (m²)" required>
          <input type="number" className={inputCls} value={form.surface || ""} onChange={(e) => set("surface", e.target.value)} placeholder="0" min="0" />
        </Field>
        <Field label="Valeur locative annuelle (GNF)" required>
          <input type="number" className={inputCls} value={form.valeur || ""} onChange={(e) => set("valeur", e.target.value)} placeholder="0" min="0" />
        </Field>
        <Field label="Coordonnées GPS">
          <div className="flex gap-2">
            <input className={`${inputCls} flex-1 font-mono text-xs`} value={form.coordGps} onChange={(e) => { set("coordGps", e.target.value); setGpsAccuracy(null); }}
              placeholder="Latitude, Longitude" readOnly={gpsLoading} />
            <button type="button" onClick={captureGPS} disabled={gpsLoading}
              className="flex items-center gap-1 px-3 py-2 text-xs font-mono rounded-sm shrink-0 text-white transition-opacity"
              style={{ background: "#CE1126", opacity: gpsLoading ? 0.7 : 1 }}>
              {gpsLoading
                ? <><svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.4" strokeDashoffset="10" /></svg> GPS…</>
                : <><MapPin size={12} /> {form.coordGps ? "Recapturer" : "Ma position"}</>}
            </button>
          </div>
          {form.coordGps && !gpsLoading && (
            <p className="text-[10px] font-mono text-[#009460] mt-1 flex items-center gap-1">
              ✓ Position capturée{gpsAccuracy !== null ? ` · Précision ±${gpsAccuracy} m` : ""}
            </p>
          )}
        </Field>
        <Field label="Statut de paiement">
          <select className={selectCls} value={form.statut} onChange={(e) => set("statut", e.target.value)}>
            {["En attente", "Payé", "Arriéré"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Date d'enregistrement">
          <input type="date" className={inputCls} value={form.date} onChange={(e) => set("date", e.target.value)} />
        </Field>
      </div>

      <p className="text-xs font-mono text-muted-foreground border-l-2 border-accent pl-3 italic">
        Documents et photos
      </p>
      
      <div className="space-y-4">
        <PhotoCapture
          label="Photo du contribuable"
          photo={form.photoContribuable}
          onPhotoChange={(photo) => setForm((f) => ({ ...f, photoContribuable: photo || undefined }))}
        />
        
        <MultiFileUpload
          label="Photos du bâtiment"
          files={form.photosBatiment}
          onFilesChange={(files) => setForm((f) => ({ ...f, photosBatiment: files }))}
          accept="image/*"
        />
        
        <MultiFileUpload
          label="Plans cadastraux"
          files={form.plansCadastraux}
          onFilesChange={(files) => setForm((f) => ({ ...f, plansCadastraux: files }))}
          accept="image/*,.pdf"
        />
        
        <MultiFileUpload
          label="Documents justificatifs"
          files={form.documentsJustificatifs}
          onFilesChange={(files) => setForm((f) => ({ ...f, documentsJustificatifs: files }))}
          accept="image/*,.pdf,.doc,.docx"
        />
      </div>

      <div className="flex gap-3 pt-2 border-t border-border">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors">
          Annuler
        </button>
        <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity">
          <Save size={14} /> {initial?.id ? "Enregistrer les modifications" : "Créer le dossier"}
        </button>
      </div>
    </form>
  );
}

// ─── Vue détail contribuable ──────────────────────────────────────────────────
function ContribuableDetail({ c, onEdit, onClose, onPaiement, notificationSettings, onNotificationSent, communeName = "Mamou" }: {
  c: Contribuable; onEdit: () => void; onClose: () => void; onPaiement: () => void;
  notificationSettings?: NotificationSettings;
  onNotificationSent?: (log: NotificationLog) => void;
  communeName?: string;
}) {
  const [showAvis, setShowAvis] = useState(false);

  return (
    <>
      {showAvis && (
        <AvisImpositionEnhanced
          contribuable={c}
          onClose={() => setShowAvis(false)}
          notificationSettings={notificationSettings}
          onNotificationSent={onNotificationSent}
        />
      )}
    <div className="p-6 space-y-6">
      <div className="flex items-start gap-6">
        <div className="shrink-0">
          {c.photoContribuable ? (
            <img src={c.photoContribuable} alt={`${c.prenom} ${c.nom}`} className="w-16 h-16 rounded-sm object-cover border-2 border-primary" />
          ) : (
            <div className="w-16 h-16 rounded-sm bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary font-mono">
              {c.nom[0]}{c.prenom[0]}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-light text-foreground" style={{ fontFamily: "'Crimson Pro', serif" }}>
            {c.prenom} {c.nom}
          </h3>
          <p className="font-mono text-xs text-primary mt-0.5">{c.id}</p>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge statut={c.statut} />
            <span className="text-xs font-mono text-muted-foreground border border-border px-2 py-0.5 rounded-sm">{c.type}</span>
            <span className="text-xs font-mono text-muted-foreground border border-border px-2 py-0.5 rounded-sm">Cat. {c.categorie}</span>
          </div>
        </div>
        <QrDisplay value={c.id} />
      </div>

      {/* Localisation */}
      <div className="space-y-1">
        <p className="text-xs font-mono text-muted-foreground border-l-2 border-[#CE1126] pl-3 italic">Localisation</p>
        <div className="grid grid-cols-2 gap-px bg-border rounded-sm overflow-hidden border border-border">
          {[
            { label: "Commune / SP", value: c.commune ?? c.quartier, icon: MapPin },
            { label: "District / Quartier", value: c.district ?? c.quartier, icon: Home },
            { label: "Secteur", value: c.secteur, icon: MapPin },
            { label: "Coordonnées GPS", value: c.coordGps || "Non renseigné", icon: Globe },
          ].map((f) => (
            <div key={f.label} className="bg-card p-3 flex items-start gap-2.5">
              <f.icon size={13} className="text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">{f.label}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{f.value}</p>
              </div>
            </div>
          ))}
        </div>
        {c.adresseContribuable && (
          <div className="bg-card border border-border rounded-sm p-3 text-xs font-mono text-muted-foreground">Adresse : {c.adresseContribuable}</div>
        )}
      </div>

      {/* Identité */}
      <div className="space-y-1">
        <p className="text-xs font-mono text-muted-foreground border-l-2 border-[#B8860B] pl-3 italic">Contribuable & Propriétaire</p>
        <div className="grid grid-cols-2 gap-px bg-border rounded-sm overflow-hidden border border-border">
          {[
            { label: "Téléphone", value: c.telephone, icon: Phone },
            { label: "N° Identification (NIN)", value: c.nin || "—", icon: UserCheck },
            { label: "Date enregistrement", value: c.date, icon: Clock },
            { label: "Propriétaire", value: c.memeProprietaire !== false ? "Même que le contribuable" : `${c.prenomProprietaire ?? ""} ${c.nomProprietaire ?? ""}`.trim() || "—", icon: UserCheck },
          ].map((f) => (
            <div key={f.label} className="bg-card p-3 flex items-start gap-2.5">
              <f.icon size={13} className="text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">{f.label}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bien & Taxation */}
      <div className="space-y-1">
        <p className="text-xs font-mono text-muted-foreground border-l-2 border-[#009460] pl-3 italic">Bien & Taxation</p>
        <div className="grid grid-cols-2 gap-px bg-border rounded-sm overflow-hidden border border-border">
          {[
            { label: "Type", value: c.type, icon: Building2 },
            { label: "Usage", value: c.usage, icon: FileText },
            { label: "Surface", value: `${c.surface} m²`, icon: FileText },
            { label: "Occupation", value: c.statusOccupation ?? "Occupé", icon: Home },
            { label: "Mode de calcul", value: c.valeurLocative !== false ? "Valeur locative" : "Forfait", icon: Calculator },
            { label: c.valeurLocative !== false ? "Valeur locative" : "Montant forfaitaire", value: fmtShort(c.valeur), icon: Banknote },
            { label: "Période", value: c.periodeTaxe ?? "Annuel", icon: Clock },
            { label: "Catégorie fiscale", value: `Catégorie ${c.categorie}`, icon: Calculator },
          ].map((f) => (
            <div key={f.label} className="bg-card p-3 flex items-start gap-2.5">
              <f.icon size={13} className="text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">{f.label}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Répartition recouvrement */}
      {(c.pourcentageEtat !== undefined || c.pourcentageAgent !== undefined) && (
        <div className="space-y-1">
          <p className="text-xs font-mono text-muted-foreground border-l-2 border-[#1B3A6B] pl-3 italic">Répartition du recouvrement</p>
          <div className="overflow-hidden rounded-sm border border-border">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="px-3 py-2 text-left text-muted-foreground">Bénéficiaire</th>
                  <th className="px-3 py-2 text-right text-muted-foreground">%</th>
                  <th className="px-3 py-2 text-right text-muted-foreground">Montant estimé (GNF)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "État", pct: c.pourcentageEtat ?? 15 },
                  { label: "Agent recenseur", pct: c.pourcentageAgent ?? 5 },
                  { label: communeName, pct: c.pourcentageCommune ?? 80 },
                ].map(r => (
                  <tr key={r.label} className="border-t border-border/50">
                    <td className="px-3 py-2">{r.label}</td>
                    <td className="px-3 py-2 text-right">{r.pct}%</td>
                    <td className="px-3 py-2 text-right text-primary">{Math.round(c.valeur * r.pct / 100).toLocaleString("fr")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Documents et Photos */}
      {(c.photosBatiment || c.plansCadastraux || c.documentsJustificatifs) && (
        <div className="space-y-4">
          <p className="text-xs font-mono text-muted-foreground border-l-2 border-accent pl-3 italic">
            Documents et photos attachés
          </p>
          
          {c.photosBatiment && c.photosBatiment.length > 0 && (
            <div>
              <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground mb-2">Photos du bâtiment ({c.photosBatiment.length})</p>
              <div className="grid grid-cols-4 gap-2">
                {c.photosBatiment.map((photo, idx) => (
                  <img key={idx} src={photo} alt={`Bâtiment ${idx + 1}`} className="w-full h-20 object-cover border border-border rounded-sm" />
                ))}
              </div>
            </div>
          )}
          
          {c.plansCadastraux && c.plansCadastraux.length > 0 && (
            <div>
              <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground mb-2">Plans cadastraux ({c.plansCadastraux.length})</p>
              <div className="grid grid-cols-4 gap-2">
                {c.plansCadastraux.map((plan, idx) => (
                  plan.startsWith('data:image') ? (
                    <img key={idx} src={plan} alt={`Plan ${idx + 1}`} className="w-full h-20 object-cover border border-border rounded-sm" />
                  ) : (
                    <div key={idx} className="w-full h-20 flex items-center justify-center border border-border rounded-sm bg-secondary">
                      <FileText size={24} className="text-muted-foreground" />
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
          
          {c.documentsJustificatifs && c.documentsJustificatifs.length > 0 && (
            <div>
              <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground mb-2">Documents justificatifs ({c.documentsJustificatifs.length})</p>
              <div className="grid grid-cols-4 gap-2">
                {c.documentsJustificatifs.map((doc, idx) => (
                  doc.startsWith('data:image') ? (
                    <img key={idx} src={doc} alt={`Document ${idx + 1}`} className="w-full h-20 object-cover border border-border rounded-sm" />
                  ) : (
                    <div key={idx} className="w-full h-20 flex items-center justify-center border border-border rounded-sm bg-secondary">
                      <FileText size={24} className="text-muted-foreground" />
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button onClick={onClose} className="px-3 py-2 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors">
          Fermer
        </button>
        <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-2 text-sm font-mono border border-primary text-primary rounded-sm hover:bg-primary/5 transition-colors">
          <Edit2 size={13} /> Modifier
        </button>
        <button onClick={() => {
          const cat = c.categorie ?? "B";
          const taux = cat === "A" ? 12 : cat === "C" ? 5 : 8;
          const montant = Math.round((c.valeur ?? 0) * taux / 100);
          printSection({
            title: "Fiche Contribuable",
            subtitle: `ID: ${c.id} · ${c.commune ?? communeName}`,
            html: `
              <table>
                <thead><tr><th colspan="2" style="background:#1B3A6B;color:white;text-align:center">${c.prenom} ${c.nom} — ${c.id}</th></tr></thead>
                <tbody>
                  <tr><td><b>Téléphone</b></td><td>${c.telephone}</td></tr>
                  <tr><td><b>Email</b></td><td>${c.email ?? "—"}</td></tr>
                  <tr><td><b>NIN</b></td><td>${c.nin || "—"}</td></tr>
                  <tr><td><b>District</b></td><td>${c.district ?? c.quartier}</td></tr>
                  <tr><td><b>Secteur</b></td><td>${c.secteur}</td></tr>
                  <tr><td><b>Coordonnées GPS</b></td><td>${c.coordGps || "—"}</td></tr>
                  <tr><td><b>Type de bien</b></td><td>${c.type} — ${c.usage}</td></tr>
                  <tr><td><b>Surface</b></td><td>${c.surface} m²</td></tr>
                  <tr><td><b>Valeur locative</b></td><td>${fmtShort(c.valeur)}</td></tr>
                  <tr><td><b>Catégorie fiscale</b></td><td>${cat} (taux ${taux}%)</td></tr>
                  <tr><td><b>Montant CFU annuel</b></td><td style="font-weight:bold;color:#1B3A6B">${fmtShort(montant)}</td></tr>
                  <tr><td><b>Statut</b></td><td class="badge-${c.statut === "Payé" ? "paye" : c.statut === "Arriéré" ? "arriere" : "attente"}">${c.statut}</td></tr>
                </tbody>
              </table>`,
          });
        }} className="flex items-center gap-1.5 px-3 py-2 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors">
          <Printer size={13} /> Imprimer fiche
        </button>
        <button onClick={() => setShowAvis(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-mono bg-[#B8860B] text-white rounded-sm hover:opacity-90 transition-opacity">
          <FileText size={13} /> Générer avis
        </button>
        <button onClick={onPaiement} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-mono bg-accent text-accent-foreground rounded-sm hover:opacity-90 transition-opacity">
          <CreditCard size={13} /> Enregistrer paiement
        </button>
      </div>
    </div>
    </>
  );
}

// ─── Formulaire Paiement ──────────────────────────────────────────────────────
function PaiementForm({
  contribuables, initial, onSave, onClose, onOrangeMoney,
}: {
  contribuables: Contribuable[];
  initial?: Partial<Paiement & { contribuableId?: string }>;
  onSave: (p: Paiement) => void;
  onClose: () => void;
  onOrangeMoney?: (contribuableId: string, montant: number) => void;
}) {
  const [form, setForm] = useState({
    contribuableId: initial?.contribuableId ?? contribuables[0]?.id ?? "",
    montant: initial?.montant ?? "",
    methode: "Mobile Money",
    operateur: "Orange Money",
    statut: "Validé",
  });
  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));
  const contrib = contribuables.find((c) => c.id === form.contribuableId);

  const handleSave = () => {
    if (!form.contribuableId || !form.montant) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    const ref = `PAY-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    onSave({
      ref,
      contribuableId: form.contribuableId,
      contribuable: contrib ? `${contrib.prenom} ${contrib.nom}` : "",
      montant: Number(form.montant),
      methode: form.methode,
      operateur: form.methode === "Espèces" ? "—" : form.operateur,
      date: now(),
      statut: form.statut,
      recu: form.statut === "Validé" ? `REC-${ref.split("-").pop()}` : "",
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-5">
      <div className="space-y-4">
        <Field label="Contribuable" required>
          <select className={selectCls} value={form.contribuableId} onChange={(e) => set("contribuableId", e.target.value)}>
            {contribuables.map((c) => (
              <option key={c.id} value={c.id}>{c.id} — {c.prenom} {c.nom}</option>
            ))}
          </select>
        </Field>

        {contrib && (
          <div className="bg-secondary/50 border border-border rounded-sm p-3 text-xs font-mono space-y-1 text-muted-foreground">
            <div className="flex justify-between"><span>Quartier :</span><span>{contrib.quartier}</span></div>
            <div className="flex justify-between"><span>Type :</span><span>{contrib.type}</span></div>
            <div className="flex justify-between"><span>Valeur locative :</span><span className="font-semibold text-foreground">{fmtShort(contrib.valeur)}</span></div>
            <div className="flex justify-between"><span>Statut actuel :</span><span><StatusBadge statut={contrib.statut} /></span></div>
          </div>
        )}

        <Field label="Montant (GNF)" required>
          <input type="number" className={inputCls} value={form.montant} onChange={(e) => set("montant", e.target.value)} placeholder="0" min="0" />
        </Field>

        <Field label="Méthode de paiement" required>
          <select className={selectCls} value={form.methode} onChange={(e) => set("methode", e.target.value)}>
            {["Mobile Money", "Espèces", "QR Code", "Carte bancaire"].map((m) => <option key={m}>{m}</option>)}
          </select>
        </Field>

        {form.methode !== "Espèces" && (
          <Field label="Opérateur">
            <select className={selectCls} value={form.operateur} onChange={(e) => set("operateur", e.target.value)}>
              {["Orange Money", "MTN Mobile Money", "Visa", "Mastercard"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
        )}

        <Field label="Statut">
          <select className={selectCls} value={form.statut} onChange={(e) => set("statut", e.target.value)}>
            {["Validé", "En attente"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      {onOrangeMoney && form.contribuableId && form.montant && (
        <div className="border-t border-border pt-4">
          <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 border-2 border-orange-200 rounded-sm p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center shrink-0">
                <Smartphone className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-900 mb-1">Paiement Orange Money</p>
                <p className="text-xs text-orange-800 font-mono mb-3">
                  Effectuez un paiement sécurisé via Orange Money avec scan QR Code ou saisie de numéro
                </p>
                <button
                  type="button"
                  onClick={() => onOrangeMoney(form.contribuableId, Number(form.montant))}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-mono bg-orange-600 text-white rounded-sm hover:bg-orange-700 transition-colors"
                >
                  <Smartphone size={16} />
                  Payer avec Orange Money
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2 border-t border-border">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors">
          Annuler
        </button>
        <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity">
          <CheckCircle2 size={14} /> Enregistrer manuellement
        </button>
      </div>
    </form>
  );
}

// ─── Vue reçu de paiement ─────────────────────────────────────────────────────
function RecuPaiement({ p, onClose, communeName = "Mamou" }: { p: Paiement; onClose: () => void; communeName?: string }) {
  return (
    <div className="p-6 space-y-6">
      <div className="border border-border rounded-sm p-6 bg-background space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{communeName}</p>
            <p className="text-xs font-mono text-muted-foreground">SNRR · Reçu fiscal</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-muted-foreground">Référence</p>
            <p className="font-mono text-sm font-bold text-primary">{p.recu || p.ref}</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            ["Contribuable", p.contribuable],
            ["Référence paiement", p.ref],
            ["Montant payé", fmtShort(p.montant)],
            ["Méthode", p.methode],
            ["Opérateur", p.operateur],
            ["Date et heure", p.date],
            ["Statut", p.statut],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">{k} :</span>
              <span className="font-medium text-foreground">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center pt-2">
          <QrDisplay value={p.ref} />
        </div>
        <p className="text-center text-xs font-mono text-muted-foreground">
          Ce reçu est valide. Scanner le QR code pour vérifier l'authenticité.
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors">
          Fermer
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity" onClick={() => {
          printPOSReceipt({
            title: "Reçu de Paiement",
            ref: p.recu || p.ref,
            lines: [
              { label: "Contribuable", value: p.contribuable },
              { label: "Réf. paiement", value: p.ref },
              { label: "Montant", value: fmtShort(p.montant), bold: true },
              { label: "Méthode", value: p.methode },
              { label: "Opérateur", value: p.operateur },
              { label: "Date", value: p.date },
              { label: "Statut", value: p.statut, bold: true },
            ],
            footer: `Merci de votre paiement.<br/>${communeName}`,
            qrValue: p.ref,
          });
        }}>
          <Printer size={13} /> Imprimer (POS)
        </button>
      </div>
    </div>
  );
}

// ─── Formulaire Utilisateur ───────────────────────────────────────────────────
const ROLES_CONFIG: Record<string, { color: string; permissions: string[] }> = {
  "Administrateur":     { color: "#CE1126", permissions: ["Accès total", "Gestion utilisateurs", "Configuration système", "Audit complet"] },
  "Maire":             { color: "#1B3A6B", permissions: ["Tableaux de bord", "Rapports", "Validation paiements", "Vue générale"] },
  "Receveur municipal":{ color: "#B8860B", permissions: ["Paiements", "Recouvrement", "Rapports financiers", "Reçus"] },
  "Superviseur":       { color: "#009460", permissions: ["Recensement", "Taxation", "Rapports", "Surveillance agents"] },
  "Agent recenseur":   { color: "#6366f1", permissions: ["Recensement contribuables", "Géolocalisation", "Photos terrain"] },
  "Agent recouvrement":{ color: "#f59e0b", permissions: ["Paiements", "Reçus", "Consultation dossiers"] },
};

function UserForm({ initial, onSave, onClose, existingEmails = [], existingIdentifiants = [], communeDomain = "mamou-commune.gn" }: {
  initial?: Partial<Utilisateur>;
  onSave: (u: Utilisateur) => void;
  onClose: () => void;
  existingEmails?: string[];
  existingIdentifiants?: string[];
  communeDomain?: string;
}) {
  const isEdit = !!initial?.id;
  const [step, setStep] = useState(0); // 0=identité, 1=accès, 2=confirmation
  const [form, setForm] = useState<Partial<Utilisateur>>({
    nom: "", prenom: "", role: "Agent recenseur", email: "",
    telephone: "", statut: "Actif", identifiant: "", ...initial,
  });
  const [pwd, setPwd] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<Utilisateur | null>(null);

  const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, ".");

  const set = (k: keyof Utilisateur, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k as string]; return n; });
  };

  // Auto-générer email et identifiant depuis nom/prénom
  const suggestEmail = () => {
    if (form.prenom && form.nom) {
      if (!form.email) {
        set("email", `${normalize(form.prenom)}.${normalize(form.nom)}@${communeDomain}`);
      }
      if (!form.identifiant) {
        set("identifiant", `${normalize(form.prenom)[0]}.${normalize(form.nom)}`);
      }
    }
  };

  // Auto-générer mot de passe fort
  const generatePassword = () => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!";
    const pwd = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setPwd(pwd); setPwdConfirm(pwd); setShowPwd(true);
  };

  const pwdStrength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    return s;
  };
  const strength = pwdStrength(pwd);
  const strengthLabel = ["Très faible", "Faible", "Moyen", "Fort", "Très fort"][strength];
  const strengthColor = ["#CE1126", "#f59e0b", "#FCD116", "#009460", "#059669"][strength];

  const validateStep0 = () => {
    const e: Record<string, string> = {};
    if (!form.nom?.trim()) e.nom = "Nom requis";
    if (!form.prenom?.trim()) e.prenom = "Prénom requis";
    if (!form.identifiant?.trim()) e.identifiant = "Identifiant requis";
    else if (!/^[a-z0-9._-]{3,20}$/.test(form.identifiant)) e.identifiant = "3-20 caractères : lettres minuscules, chiffres, points";
    else if (existingIdentifiants.includes(form.identifiant) && form.identifiant !== initial?.identifiant) e.identifiant = "Identifiant déjà utilisé";
    if (!form.email?.trim()) e.email = "Email requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalide";
    else if (existingEmails.includes(form.email) && form.email !== initial?.email) e.email = "Email déjà utilisé";
    if (!form.telephone?.trim()) e.telephone = "Téléphone requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep1 = () => {
    if (isEdit) return true;
    const e: Record<string, string> = {};
    if (!pwd) e.pwd = "Mot de passe requis";
    else if (pwd.length < 8) e.pwd = "Minimum 8 caractères";
    if (pwd !== pwdConfirm) e.pwdConfirm = "Les mots de passe ne correspondent pas";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && validateStep0()) setStep(1);
    else if (step === 1) {
      if (!validateStep1()) return;
      const u: Utilisateur = {
        id: initial?.id ?? `USR-${String(Date.now()).slice(-6)}`,
        nom: form.nom!, prenom: form.prenom!, role: form.role!,
        email: form.email!, telephone: form.telephone ?? "",
        statut: form.statut!, derniere: "Jamais",
        dateCreation: new Date().toISOString().slice(0, 10),
        identifiant: form.identifiant?.trim() || undefined,
      };
      if (isEdit) { onSave(u); return; }
      setCreated(u);
      setStep(2);
    }
  };

  const handleConfirm = () => {
    if (created) onSave(created);
  };

  const roleInfo = ROLES_CONFIG[form.role ?? "Agent recenseur"];
  const initials = `${form.prenom?.[0] ?? ""}${form.nom?.[0] ?? ""}`.toUpperCase();

  // ── Étape 2 : Confirmation ──
  if (step === 2 && created) {
    return (
      <div className="p-6 space-y-5">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg"
            style={{ background: roleInfo?.color ?? "#1B3A6B" }}>
            {initials}
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">{created.prenom} {created.nom}</p>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">{created.id} · {created.role}</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
            <CheckCircle2 size={12} className="text-emerald-600" />
            <span className="text-xs font-mono text-emerald-700">Compte créé avec succès</span>
          </div>
        </div>

        <div className="bg-secondary/40 border border-border rounded-sm divide-y divide-border text-sm">
          {[
            { label: "Identifiant", value: created.identifiant ?? "—", mono: true },
            { label: "Email de connexion", value: created.email, mono: true },
            { label: "Mot de passe temporaire", value: showPwd ? pwd : "••••••••••••", mono: true, action: () => setShowPwd(!showPwd) },
            { label: "Rôle", value: created.role },
            { label: "Statut", value: created.statut },
            { label: "Date de création", value: created.dateCreation },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-muted-foreground font-mono">{row.label}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${row.mono ? "font-mono" : ""}`}>{row.value}</span>
                {row.action && (
                  <button type="button" onClick={row.action} className="text-[10px] font-mono text-primary hover:underline">
                    {showPwd ? "Masquer" : "Afficher"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-sm p-3 flex items-start gap-2 text-xs font-mono text-amber-800">
          <AlertTriangle size={12} className="shrink-0 mt-0.5 text-amber-600" />
          L'utilisateur devra changer son mot de passe à la première connexion. Communiquez ces identifiants de façon sécurisée.
        </div>

        <div className="flex gap-3 pt-2 border-t border-border">
          <button type="button" onClick={() => {
            const txt = `Identifiants SNRR\nIdentifiant : ${created.identifiant ?? ""}\nEmail : ${created.email}\nMot de passe : ${pwd}\nID : ${created.id}`;
            navigator.clipboard?.writeText(txt).catch(() => {});
          }} className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors">
            <Download size={13} /> Copier identifiants
          </button>
          <button type="button" onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity">
            <CheckCircle2 size={14} /> Terminer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Stepper */}
      {!isEdit && (
        <div className="flex items-center gap-0 px-6 pt-5 pb-4 border-b border-border">
          {[{ n: 0, label: "Identité" }, { n: 1, label: "Accès" }].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-0 flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {step > n ? <CheckCircle2 size={14} /> : n + 1}
                </div>
                <span className={`text-xs font-mono ${step >= n ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
              </div>
              {n < 1 && <div className={`flex-1 h-px mx-3 transition-colors ${step > n ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="p-6 space-y-5">

        {/* ── Étape 0 — Identité ── */}
        {step === 0 && (
          <>
            {/* Avatar preview */}
            <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-sm border border-border">
              <div className="w-12 h-12 rounded-sm flex items-center justify-center text-lg font-bold text-white shrink-0 transition-all"
                style={{ background: roleInfo?.color ?? "#1B3A6B" }}>
                {initials || "?"}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{form.prenom || "Prénom"} {form.nom || "Nom"}</p>
                <p className="text-xs font-mono text-muted-foreground">{form.role}</p>
                <p className="text-xs font-mono text-muted-foreground">{form.email || `email@${communeDomain}`}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Nom de famille" required>
                <input className={`${inputCls} ${errors.nom ? "border-red-400" : ""}`}
                  value={form.nom} onChange={e => set("nom", e.target.value)}
                  onBlur={suggestEmail} placeholder="ex. Bah" autoFocus />
                {errors.nom && <p className="text-[10px] font-mono text-red-500 mt-0.5">{errors.nom}</p>}
              </Field>
              <Field label="Prénom(s)" required>
                <input className={`${inputCls} ${errors.prenom ? "border-red-400" : ""}`}
                  value={form.prenom} onChange={e => set("prenom", e.target.value)}
                  onBlur={suggestEmail} placeholder="ex. Mamadou" />
                {errors.prenom && <p className="text-[10px] font-mono text-red-500 mt-0.5">{errors.prenom}</p>}
              </Field>
              <Field label="Rôle" required>
                <select className={selectCls} value={form.role} onChange={e => set("role", e.target.value)}>
                  {Object.keys(ROLES_CONFIG).map(r => <option key={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Statut">
                <select className={selectCls} value={form.statut} onChange={e => set("statut", e.target.value)}>
                  {["Actif", "Inactif"].map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Identifiant de connexion" required>
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground select-none">@</span>
                    <input className={`${inputCls} pl-7 ${errors.identifiant ? "border-red-400" : form.identifiant && !errors.identifiant ? "border-emerald-400" : ""}`}
                      value={form.identifiant} onChange={e => set("identifiant", e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                      placeholder="p.nom" autoComplete="off" />
                  </div>
                  {!form.identifiant && (
                    <button type="button" onClick={suggestEmail}
                      className="px-2 py-1 text-[10px] font-mono border border-border rounded-sm hover:bg-secondary whitespace-nowrap text-muted-foreground">
                      Auto
                    </button>
                  )}
                </div>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Utilisé pour se connecter à la plateforme</p>
                {errors.identifiant && <p className="text-[10px] font-mono text-red-500 mt-0.5">{errors.identifiant}</p>}
              </Field>
              <Field label="Email professionnel" required>
                <div className="flex gap-1.5">
                  <input type="email" className={`${inputCls} flex-1 ${errors.email ? "border-red-400" : ""}`}
                    value={form.email} onChange={e => set("email", e.target.value)}
                    placeholder={`prenom.nom@${communeDomain}`} />
                  {!form.email && (
                    <button type="button" onClick={suggestEmail}
                      className="px-2 py-1 text-[10px] font-mono border border-border rounded-sm hover:bg-secondary whitespace-nowrap text-muted-foreground">
                      Auto
                    </button>
                  )}
                </div>
                {errors.email && <p className="text-[10px] font-mono text-red-500 mt-0.5">{errors.email}</p>}
              </Field>
              <Field label="Téléphone" required>
                <input className={`${inputCls} ${errors.telephone ? "border-red-400" : ""}`}
                  value={form.telephone} onChange={e => set("telephone", e.target.value)}
                  placeholder="+224 6XX XX XX XX" />
                {errors.telephone && <p className="text-[10px] font-mono text-red-500 mt-0.5">{errors.telephone}</p>}
              </Field>
            </div>

            {/* Permissions du rôle */}
            {roleInfo && (
              <div className="p-3 rounded-sm border border-border bg-secondary/20">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Permissions du rôle sélectionné</p>
                <div className="flex flex-wrap gap-1.5">
                  {roleInfo.permissions.map(p => (
                    <span key={p} className="text-[10px] font-mono px-2 py-0.5 rounded-sm border text-white"
                      style={{ background: roleInfo.color + "cc", borderColor: roleInfo.color }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Étape 1 — Mot de passe & Accès ── */}
        {step === 1 && !isEdit && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-muted-foreground">Définissez le mot de passe temporaire du compte</p>
              <button type="button" onClick={generatePassword}
                className="flex items-center gap-1 text-xs font-mono text-primary hover:underline">
                <RefreshCw size={10} /> Générer automatiquement
              </button>
            </div>

            <Field label="Mot de passe temporaire" required>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} className={`${inputCls} pr-10 font-mono ${errors.pwd ? "border-red-400" : ""}`}
                  value={pwd} onChange={e => { setPwd(e.target.value); setErrors(er => { const n = {...er}; delete n.pwd; return n; }); }}
                  placeholder="Minimum 8 caractères" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-mono">
                  {showPwd ? "Masquer" : "Afficher"}
                </button>
              </div>
              {pwd && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex gap-0.5 h-1">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="flex-1 rounded-full transition-all"
                        style={{ background: i < strength ? strengthColor : "#e5e7eb" }} />
                    ))}
                  </div>
                  <p className="text-[10px] font-mono" style={{ color: strengthColor }}>{strengthLabel}</p>
                </div>
              )}
              {errors.pwd && <p className="text-[10px] font-mono text-red-500 mt-0.5">{errors.pwd}</p>}
            </Field>

            <Field label="Confirmer le mot de passe" required>
              <input type={showPwd ? "text" : "password"} className={`${inputCls} font-mono ${errors.pwdConfirm ? "border-red-400" : pwd && pwdConfirm && pwd === pwdConfirm ? "border-emerald-400" : ""}`}
                value={pwdConfirm} onChange={e => { setPwdConfirm(e.target.value); setErrors(er => { const n = {...er}; delete n.pwdConfirm; return n; }); }}
                placeholder="Répétez le mot de passe" />
              {pwdConfirm && pwd === pwdConfirm && (
                <p className="text-[10px] font-mono text-emerald-600 mt-0.5 flex items-center gap-1"><CheckCircle2 size={9} /> Mots de passe identiques</p>
              )}
              {errors.pwdConfirm && <p className="text-[10px] font-mono text-red-500 mt-0.5">{errors.pwdConfirm}</p>}
            </Field>

            <div className="bg-secondary/40 border border-border rounded-sm p-4 space-y-2">
              <p className="text-xs font-mono font-semibold text-foreground">Récapitulatif du compte</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-muted-foreground">
                <div><span className="text-foreground font-medium">{form.prenom} {form.nom}</span></div>
                <div>{form.role}</div>
                <div className="col-span-2 text-[11px]">{form.email}</div>
                <div>{form.telephone}</div>
                <div className={form.statut === "Actif" ? "text-emerald-600" : "text-red-500"}>{form.statut}</div>
              </div>
            </div>
          </>
        )}

        {/* ── Étape 1 — Mode édition (pas de mdp) ── */}
        {step === 0 && isEdit && (
          <div className="flex gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors">
              Annuler
            </button>
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity">
              <Save size={14} /> Enregistrer les modifications
            </button>
          </div>
        )}

        {/* Navigation steps */}
        {!isEdit && (
          <div className="flex gap-3 pt-2 border-t border-border">
            {step > 0 && (
              <button type="button" onClick={() => setStep(s => s - 1)}
                className="px-4 py-2.5 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors">
                ← Retour
              </button>
            )}
            {step === 0 && (
              <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors">
                Annuler
              </button>
            )}
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity">
              {step === 0 && <><ChevronRight size={14} /> Suivant — Accès</>}
              {step === 1 && <><CheckCircle2 size={14} /> Créer le compte</>}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

// ─── Formulaire Taxe ──────────────────────────────────────────────────────────
function TaxeForm({ initial, onSave, onClose }: {
  initial?: Partial<Taxe>; onSave: (t: Taxe) => void; onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Taxe>>({
    libelle: "", categorie: "CFU", taux: 0, base: "Valeur locative", periodicite: "Annuelle", actif: true, ...initial,
  });
  const set = (k: keyof Taxe, v: string | number | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.libelle) { alert("Libellé requis."); return; }
    onSave({
      id: initial?.id ?? genId("TAX"),
      libelle: form.libelle!, categorie: form.categorie!,
      taux: Number(form.taux), base: form.base!,
      periodicite: form.periodicite!, actif: form.actif!,
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-4">
      <Field label="Libellé de la taxe" required>
        <input className={inputCls} value={form.libelle} onChange={(e) => set("libelle", e.target.value)} placeholder="ex. CFU — Catégorie A" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Catégorie">
          <select className={selectCls} value={form.categorie} onChange={(e) => set("categorie", e.target.value)}>
            {["CFU", "Patentes", "Marchés", "Domaine", "Divers"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Taux (%)">
          <input type="number" step="0.1" className={inputCls} value={form.taux} onChange={(e) => set("taux", e.target.value)} min="0" max="100" />
        </Field>
        <Field label="Base de calcul">
          <select className={selectCls} value={form.base} onChange={(e) => set("base", e.target.value)}>
            {["Valeur locative", "Chiffre d'affaires", "Forfait mensuel", "Surface × tarif"].map((b) => <option key={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Périodicité">
          <select className={selectCls} value={form.periodicite} onChange={(e) => set("periodicite", e.target.value)}>
            {["Annuelle", "Mensuelle", "Trimestrielle"].map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="actif" checked={form.actif} onChange={(e) => set("actif", e.target.checked)} className="w-4 h-4 accent-primary" />
        <label htmlFor="actif" className="text-sm font-mono text-foreground">Taxe active</label>
      </div>
      <div className="flex gap-3 pt-2 border-t border-border">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors">
          Annuler
        </button>
        <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity">
          <Save size={14} /> {initial?.id ? "Enregistrer" : "Créer la taxe"}
        </button>
      </div>
    </form>
  );
}

// ─── Simulation fiscale ───────────────────────────────────────────────────────
function SimulationFiscale({ taxes, contribuables, onClose }: {
  taxes: Taxe[]; contribuables: Contribuable[]; onClose: () => void;
}) {
  const [sel, setSel] = useState(contribuables[0]?.id ?? "");
  const [result, setResult] = useState<{ libelle: string; montant: number }[] | null>(null);
  const [showAvis, setShowAvis] = useState(false);

  const contrib = contribuables.find((c) => c.id === sel);

  const simulate = () => {
    if (!contrib) return;
    const applicables = taxes.filter((t) => {
      if (t.categorie === "CFU" && t.libelle.includes(`Catégorie ${contrib.categorie}`)) return true;
      if (t.categorie === "Patentes" && contrib.type === "Commercial") return true;
      return false;
    });
    setResult(applicables.map((t) => ({
      libelle: t.libelle,
      montant: t.taux > 0 ? Math.round(contrib.valeur * t.taux / 100) : 120000,
    })));
  };

  const total = result?.reduce((s, r) => s + r.montant, 0) ?? 0;

  return (
    <>
      {showAvis && contrib && (
        <AvisImpositionEnhanced
          contribuable={contrib}
          onClose={() => setShowAvis(false)}
        />
      )}
    <div className="p-6 space-y-5">
      <Field label="Sélectionner un contribuable">
        <select className={selectCls} value={sel} onChange={(e) => setSel(e.target.value)}>
          {contribuables.map((c) => <option key={c.id} value={c.id}>{c.id} — {c.prenom} {c.nom}</option>)}
        </select>
      </Field>

      {contrib && (
        <div className="bg-secondary/40 border border-border rounded-sm p-3 grid grid-cols-3 gap-3 text-xs font-mono">
          <div><span className="text-muted-foreground">Type :</span> <span>{contrib.type}</span></div>
          <div><span className="text-muted-foreground">Catégorie :</span> <span>{contrib.categorie}</span></div>
          <div><span className="text-muted-foreground">Valeur locative :</span> <span className="font-bold">{fmtShort(contrib.valeur)}</span></div>
        </div>
      )}

      <button onClick={simulate} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity">
        <Calculator size={14} /> Calculer les taxes applicables
      </button>

      {result && (
        <div className="border border-border rounded-sm overflow-hidden">
          <div className="bg-secondary/40 px-4 py-2 border-b border-border">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Résultat de simulation</span>
          </div>
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left text-muted-foreground">Taxe</th>
                <th className="px-4 py-2 text-right text-muted-foreground">Montant</th>
              </tr>
            </thead>
            <tbody>
              {result.map((r) => (
                <tr key={r.libelle} className="border-b border-border/50">
                  <td className="px-4 py-2">{r.libelle}</td>
                  <td className="px-4 py-2 text-right font-semibold text-primary">{fmtShort(r.montant)}</td>
                </tr>
              ))}
              <tr className="bg-primary/5">
                <td className="px-4 py-2 font-bold text-foreground">TOTAL À PAYER</td>
                <td className="px-4 py-2 text-right font-bold text-primary text-sm">{fmtShort(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors">
          Fermer
        </button>
        {result && contrib && (
          <button onClick={() => setShowAvis(true)} className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-mono bg-[#B8860B] text-white rounded-sm hover:opacity-90 transition-opacity">
            <FileText size={13} /> Générer l'avis d'imposition
          </button>
        )}
      </div>
    </div>
    </>
  );
}

// ─── Confirmation suppression ─────────────────────────────────��───────────────
function ConfirmDelete({ label, onConfirm, onClose }: { label: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-sm">
        <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-red-800">Confirmation de suppression</p>
          <p className="text-sm text-red-700 mt-1">
            Êtes-vous certain de vouloir supprimer <strong>{label}</strong> ? Cette action est irréversible.
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors">
          Annuler
        </button>
        <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono bg-destructive text-destructive-foreground rounded-sm hover:opacity-90 transition-opacity">
          <Trash2 size={14} /> Supprimer définitivement
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VUES PRINCIPALES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── SVG charts (remplace Recharts BarChart pour éviter le bug de clés dupliquées) ──
function SvgLineChart({ data, series, height = 220 }: {
  data: Record<string, number | string>[];
  series: { key: string; color: string; label: string }[];
  height?: number;
}) {
  const P = { t: 10, r: 10, b: 26, l: 42 };
  const W = 580, H = height, cW = W - P.l - P.r, cH = H - P.t - P.b;
  const maxY = Math.max(...data.flatMap(d => series.map(s => (d[s.key] as number) || 0)), 1);
  const px = (i: number) => P.l + (i / Math.max(data.length - 1, 1)) * cW;
  const py = (v: number) => P.t + cH - (v / maxY) * cH;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block" }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = P.t + cH * (1 - t);
        return <g key={i}>
          <line x1={P.l} x2={P.l + cW} y1={y} y2={y} stroke="rgba(26,26,46,0.07)" strokeDasharray="3 2" />
          <text x={P.l - 4} y={y + 3} textAnchor="end" fontSize={9} fontFamily="JetBrains Mono" fill="#6B6457">{`${(maxY * t / 1e6).toFixed(0)}M`}</text>
        </g>;
      })}
      {series.map((s) => {
        const pts = data.map((d, i) => `${px(i)},${py((d[s.key] as number) || 0)}`).join(" ");
        return <polyline key={s.key} points={pts} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />;
      })}
      {series.map((s) =>
        data.map((d, i) => (
          <circle key={`${s.key}-${i}`} cx={px(i)} cy={py((d[s.key] as number) || 0)} r={3} fill={s.color} />
        ))
      )}
      {data.map((d, i) => (
        <text key={i} x={px(i)} y={H - 5} textAnchor="middle" fontSize={9} fontFamily="JetBrains Mono" fill="#6B6457">
          {String(d.mois).slice(0, 3)}
        </text>
      ))}
      {series.map((s, si) => (
        <g key={s.key}>
          <line x1={P.l + si * 80} x2={P.l + si * 80 + 14} y1={P.t + 4} y2={P.t + 4} stroke={s.color} strokeWidth={2} />
          <text x={P.l + si * 80 + 18} y={P.t + 7} fontSize={9} fontFamily="JetBrains Mono" fill="#6B6457">{s.label}</text>
        </g>
      ))}
    </svg>
  );
}

function SvgGroupedBar({ data, series, height = 220, yFmt = (v: number) => `${(v / 1e6).toFixed(0)}M` }: {
  data: Record<string, number | string>[];
  series: { key: string; color: string }[];
  height?: number;
  yFmt?: (v: number) => string;
}) {
  const P = { t: 10, r: 10, b: 26, l: 40 };
  const W = 580, H = height, cW = W - P.l - P.r, cH = H - P.t - P.b;
  const maxY = Math.max(...data.flatMap(d => series.map(s => (d[s.key] as number) || 0)), 1);
  const gW = cW / data.length;
  const bW = Math.max(2, (gW * 0.72) / series.length);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block" }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = P.t + cH * (1 - t);
        return <g key={i}>
          <line x1={P.l} x2={P.l + cW} y1={y} y2={y} stroke="rgba(26,26,46,0.07)" strokeDasharray="3 2" />
          <text x={P.l - 4} y={y + 3} textAnchor="end" fontSize={9} fontFamily="JetBrains Mono" fill="#6B6457">{yFmt(maxY * t)}</text>
        </g>;
      })}
      {data.map((d, di) => {
        const gx = P.l + gW * di + gW * 0.14;
        return <g key={di}>
          {series.map((s, si) => {
            const val = (d[s.key] as number) || 0;
            const bH = Math.max(0, (val / maxY) * cH);
            return <rect key={si} x={gx + si * bW} y={P.t + cH - bH} width={Math.max(1, bW - 1)} height={bH} fill={s.color} rx={1} />;
          })}
          <text x={gx + (series.length * bW) / 2} y={H - 5} textAnchor="middle" fontSize={9} fontFamily="JetBrains Mono" fill="#6B6457">
            {String(d.mois).slice(0, 3)}
          </text>
        </g>;
      })}
    </svg>
  );
}

function SvgHBar({ data, height = 220 }: { data: { nom: string; taux: number }[]; height?: number }) {
  const P = { t: 6, r: 48, b: 6, l: 84 };
  const W = 480, H = Math.max(height, data.length * 26 + P.t + P.b);
  const cW = W - P.l - P.r, cH = H - P.t - P.b;
  const rowH = cH / Math.max(data.length, 1);
  const bH = Math.min(13, rowH * 0.55);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block" }}>
      {[0, 25, 50, 75, 100].map((v, i) => {
        const x = P.l + (v / 100) * cW;
        return <line key={i} x1={x} x2={x} y1={P.t} y2={H - P.b} stroke="rgba(26,26,46,0.07)" strokeDasharray="3 2" />;
      })}
      {data.map((d, i) => {
        const cy = P.t + i * rowH + rowH / 2;
        const fill = d.taux >= 70 ? "#009460" : d.taux >= 55 ? "#B8860B" : "#CE1126";
        const bW = Math.max(2, (d.taux / 100) * cW);
        return <g key={i}>
          <text x={P.l - 5} y={cy + 4} textAnchor="end" fontSize={9} fontFamily="JetBrains Mono" fill="#6B6457">{String(d.nom).slice(0, 12)}</text>
          <rect x={P.l} y={cy - bH / 2} width={bW} height={bH} fill={fill} rx={1} />
          <text x={P.l + bW + 4} y={cy + 4} fontSize={9} fontFamily="JetBrains Mono" fill={fill} fontWeight="bold">{d.taux}%</text>
        </g>;
      })}
    </svg>
  );
}

function SvgStackedBar({ data, series, height = 200 }: {
  data: Record<string, number | string>[];
  series: { key: string; color: string }[];
  height?: number;
}) {
  const P = { t: 10, r: 10, b: 26, l: 40 };
  const W = 580, H = height, cW = W - P.l - P.r, cH = H - P.t - P.b;
  const maxY = Math.max(...data.map(d => series.reduce((s, c) => s + ((d[c.key] as number) || 0), 0)), 1);
  const slotW = cW / Math.max(data.length, 1);
  const bW = Math.max(4, slotW * 0.55);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block" }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = P.t + cH * (1 - t);
        return <g key={i}>
          <line x1={P.l} x2={P.l + cW} y1={y} y2={y} stroke="rgba(26,26,46,0.07)" strokeDasharray="3 2" />
          <text x={P.l - 4} y={y + 3} textAnchor="end" fontSize={9} fontFamily="JetBrains Mono" fill="#6B6457">{`${(maxY * t / 1e6).toFixed(0)}M`}</text>
        </g>;
      })}
      {data.map((d, di) => {
        const gx = P.l + slotW * di + (slotW - bW) / 2;
        let yOff = 0;
        return <g key={di}>
          {series.map((s, si) => {
            const val = (d[s.key] as number) || 0;
            const bh = Math.max(0, (val / maxY) * cH);
            const ry = P.t + cH - yOff - bh;
            yOff += bh;
            return <rect key={si} x={gx} y={ry} width={bW} height={bh} fill={s.color} rx={si === series.length - 1 && bh > 0 ? 1 : 0} />;
          })}
          <text x={gx + bW / 2} y={H - 5} textAnchor="middle" fontSize={9} fontFamily="JetBrains Mono" fill="#6B6457">{String(d.mois).slice(0, 3)}</text>
        </g>;
      })}
    </svg>
  );
}

function Dashboard({ onNavigate, contribuables, paiements, currentUserRole, recettesData, communeName = "Mamou", communeConfig }: {
  onNavigate: (v: View) => void; contribuables: Contribuable[]; paiements: Paiement[];
  currentUserRole?: Role; recettesData?: RecetteMois[]; communeName?: string; communeConfig?: CommuneConfig;
}) {
  const spStats = communeConfig?.spStats ?? SP_STATS;
  const recettesMonthly = recettesData ?? RECETTES_DEFAULT;
  const [selectedSP, setSelectedSP] = useState<string | null>(null);
  const totalRecettes = paiements.filter((p) => p.statut === "Validé").reduce((s, p) => s + p.montant, 0);
  const payes = contribuables.filter((c) => c.statut === "Payé").length;
  const taux = contribuables.length ? Math.round((payes / contribuables.length) * 100) : 0;

  const kpis = [
    { label: "Recettes totales 2024", value: fmtShort(totalRecettes || 98200000), icon: Banknote, trend: "+18.4%", color: "text-[#1B3A6B]", view: "paiements" as View },
    { label: "Taux de recouvrement", value: `${taux || 83}%`, icon: TrendingUp, trend: "+21 pts", color: "text-emerald-700", view: "rapports" as View },
    { label: "Contribuables recensés", value: contribuables.length.toLocaleString("fr"), icon: Users, trend: `+${contribuables.length}`, color: "text-[#B8860B]", view: "recensement" as View },
    { label: "Paiements en attente", value: String(paiements.filter((p) => p.statut === "En attente").length || contribuables.filter((c) => c.statut === "En attente").length), icon: Clock, trend: "à traiter", color: "text-amber-700", view: "paiements" as View },
  ];

  const recent = [
    { action: "Paiement validé", detail: `Camara Sékou — ${fmtShort(8600000)}`, time: "Il y a 15 min", icon: CheckCircle2, view: "paiements" as View },
    { action: "Nouveau recensement", detail: "Bah Fatoumata — Gongoré", time: "Il y a 32 min", icon: Plus, view: "recensement" as View },
    { action: "Arriéré signalé", detail: "Barry Aissatou — Centre-ville", time: "Il y a 1 h", icon: AlertTriangle, view: "recensement" as View },
    { action: "QR Code scanné", detail: "MOU-2024-00144 — Sow Ibrahim", time: "Il y a 1 h 15", icon: QrCode, view: "paiements" as View },
    { action: "Rapport généré", detail: "Recettes mensuelles — Mai 2024", time: "Il y a 2 h", icon: FileBarChart2, view: "rapports" as View },
  ];

  const spData = selectedSP ? spStats[selectedSP] : null;

  return (
    <div className="space-y-6">
      {/* Guinean flag banner */}
      <div className="rounded-sm overflow-hidden shadow-sm">
        <div className="h-1.5 flex">
          <div className="flex-1 bg-[#CE1126]" />
          <div className="flex-1 bg-[#FCD116]" />
          <div className="flex-1 bg-[#009460]" />
        </div>
        <div className="bg-[#1B3A6B] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlagLogo size={36} />
            <div>
              <p className="text-white font-bold text-sm">{communeName}</p>
              <p className="text-white/60 text-xs font-mono">{Object.keys(spStats).length} communes & sous-préfectures</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs font-mono">Taux global</p>
            <p className="text-[#FCD116] font-bold text-xl" style={{ fontFamily: "'Crimson Pro', serif" }}>
              {Math.round(Object.values(spStats).reduce((s, d) => s + d.taux, 0) / Math.max(Object.keys(spStats).length, 1))}%
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <button key={k.label} onClick={() => onNavigate(k.view)}
            className="bg-card border border-border rounded-sm p-5 flex flex-col gap-3 hover:shadow-md hover:border-primary/30 transition-all text-left group"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono">{k.label}</span>
              <k.icon size={16} className={k.color} />
            </div>
            <span className={`text-3xl font-light ${k.color}`} style={{ fontFamily: "'Crimson Pro', serif" }}>{k.value}</span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">{k.trend} vs. 2023</span>
              <ChevronRight size={12} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </button>
        ))}
      </div>

      {/* SP Navigation Panel */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-2">
            <MapPin size={12} /> Indicateurs par commune / sous-préfecture
          </h3>
          {selectedSP && (
            <button onClick={() => setSelectedSP(null)} className="text-xs font-mono text-primary hover:underline flex items-center gap-1">
              <X size={10} /> Voir toutes
            </button>
          )}
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
            {Object.entries(spStats).map(([key, sp]) => {
              const color = sp.taux >= 70 ? "#009460" : sp.taux >= 55 ? "#B8860B" : "#CE1126";
              const active = selectedSP === key;
              return (
                <button key={key} onClick={() => setSelectedSP(active ? null : key)}
                  className={`text-left px-3 py-2.5 rounded-sm border text-xs font-mono transition-all ${
                    active ? "border-[#1B3A6B] bg-[#1B3A6B] text-white" : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <div className="font-medium truncate mb-1" title={key}>{sp.label}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] opacity-70">{sp.contribuables.toLocaleString("fr")}</span>
                    <span className="font-bold text-sm" style={{ color: active ? "white" : color }}>{sp.taux}%</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* SP Drill-down */}
          {spData ? (
            <div className="border-t border-border pt-4 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Contribuables", value: spData.contribuables.toLocaleString("fr"), color: "#1B3A6B" },
                  { label: "Taux recouvrement", value: `${spData.taux}%`, color: spData.taux >= 70 ? "#009460" : spData.taux >= 55 ? "#B8860B" : "#CE1126" },
                  { label: "Recettes", value: fmtShort(spData.recettes), color: "#B8860B" },
                  { label: "Arriérés", value: spData.arriere.toLocaleString("fr"), color: "#CE1126" },
                ].map(k => (
                  <div key={k.label} className="bg-background border border-border rounded-sm p-3">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">{k.label}</div>
                    <div className="text-xl font-bold" style={{ color: k.color, fontFamily: "'Crimson Pro', serif" }}>{k.value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {Object.entries(spData.districts).map(([dist, d]) => (
                  <div key={dist} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-medium">{dist}</span>
                      <span className="text-muted-foreground">{d.contribuables.toLocaleString("fr")} contrib. — {fmtShort(d.recettes)}</span>
                      <span className="font-bold" style={{ color: d.taux >= 70 ? "#009460" : d.taux >= 55 ? "#B8860B" : "#CE1126" }}>{d.taux}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${d.taux}%`, background: d.taux >= 70 ? "#009460" : d.taux >= 55 ? "#B8860B" : "#CE1126" }} />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {d.secteurs.map(s => (
                        <span key={s} className="text-[9px] font-mono bg-secondary px-1.5 py-0.5 rounded-sm text-muted-foreground">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border-t border-border pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-border">
                      {["Commune / SP", "Contribuables", "Taux", "Recettes", "Arriérés"].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-muted-foreground uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(spStats).map(([key, sp]) => {
                      const color = sp.taux >= 70 ? "#009460" : sp.taux >= 55 ? "#B8860B" : "#CE1126";
                      return (
                        <tr key={key} className="border-b border-border/40 hover:bg-secondary/30 cursor-pointer transition-colors" onClick={() => setSelectedSP(key)}>
                          <td className="px-3 py-2.5 font-medium">{sp.label}</td>
                          <td className="px-3 py-2.5">{sp.contribuables.toLocaleString("fr")}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="h-1 w-14 bg-muted rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${sp.taux}%`, background: color }} />
                              </div>
                              <span style={{ color }} className="font-bold">{sp.taux}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-primary">{fmtShort(sp.recettes)}</td>
                          <td className="px-3 py-2.5 text-[#CE1126]">{sp.arriere.toLocaleString("fr")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-sm p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Recettes par catégorie — 2024</h3>
            <button onClick={() => onNavigate("rapports")} className="text-xs font-mono text-primary hover:underline flex items-center gap-1">
              Voir rapports <ChevronRight size={11} />
            </button>
          </div>
          <SvgGroupedBar
            data={recettesMonthly}
            series={[
              { key: "cfu", color: "#1B3A6B" },
              { key: "patentes", color: "#B8860B" },
              { key: "marches", color: "#2E6B3E" },
              { key: "autres", color: "#4A6B8A" },
            ]}
            height={220}
          />
        </div>
        <div className="bg-card border border-border rounded-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Activités récentes</h3>
          </div>
          <div className="space-y-2">
            {recent.map((a) => (
              <button key={a.action + a.time} onClick={() => onNavigate(a.view)} className="w-full flex items-start gap-3 py-2 border-b border-border/50 last:border-0 text-left hover:bg-secondary/30 -mx-2 px-2 rounded-sm transition-colors">
                <div className="mt-0.5 p-1.5 bg-secondary rounded-sm shrink-0">
                  <a.icon size={11} className="text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground leading-snug">{a.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.detail}</p>
                  <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">{a.time}</p>
                </div>
                <ChevronRight size={11} className="text-muted-foreground shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BI Preview */}
      <div className="bg-gradient-to-r from-[#1B3A6B]/5 via-[#B8860B]/5 to-[#2E6B3E]/5 border border-[#B8860B]/20 rounded-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
              <TrendingUp size={18} className="text-[#B8860B]" />
              Business Intelligence — Analyses Prédictives
            </h3>
            <p className="text-xs text-muted-foreground font-mono">Prévisions, tendances et recommandations pour optimiser les recettes</p>
          </div>
          <button onClick={() => onNavigate("business-intelligence")}
            className="flex items-center gap-2 px-4 py-2 text-xs font-mono bg-[#B8860B] text-white rounded-sm hover:bg-[#9a7109] transition-colors whitespace-nowrap"
          >
            Accéder <ChevronRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white/50 border border-border/50 rounded-sm p-3">
            <div className="text-xs text-muted-foreground font-mono mb-1">Prévision Déc. 2024</div>
            <div className="text-xl font-bold text-[#1B3A6B]" style={{ fontFamily: "'Crimson Pro', serif" }}>62.5M GNF</div>
            <div className="text-xs text-emerald-600 font-mono mt-1">+18% vs juin</div>
          </div>
          <div className="bg-white/50 border border-border/50 rounded-sm p-3">
            <div className="text-xs text-muted-foreground font-mono mb-1">Meilleur quartier</div>
            <div className="text-xl font-bold text-[#2E6B3E]" style={{ fontFamily: "'Crimson Pro', serif" }}>Donghol T.</div>
            <div className="text-xs text-emerald-600 font-mono mt-1">83% recouvrement</div>
          </div>
          <div className="bg-white/50 border border-border/50 rounded-sm p-3">
            <div className="text-xs text-muted-foreground font-mono mb-1">Action requise</div>
            <div className="text-xl font-bold text-[#CE1126]" style={{ fontFamily: "'Crimson Pro', serif" }}>3 zones</div>
            <div className="text-xs text-amber-600 font-mono mt-1">Relance nécessaire</div>
          </div>
        </div>
      </div>

      {/* ── Carte des permissions du rôle ── */}
      {currentUserRole && (() => {
        const perms = ROLE_PERMISSIONS[currentUserRole] ?? [];
        const desc = ROLE_DESCRIPTIONS[currentUserRole] ?? "";
        const roleColor = {
          "Administrateur": "#CE1126", "Maire": "#1B3A6B",
          "Receveur municipal": "#B8860B", "Superviseur": "#009460",
          "Agent recenseur": "#6366f1", "Agent recouvrement": "#f59e0b",
        }[currentUserRole] ?? "#1B3A6B";

        // Group permissions by module
        const PERM_GROUPS: Record<string, { label: string; perms: string[] }> = {
          recensement: { label: "Recensement", perms: perms.filter(p => p.includes("recensement")) },
          taxation: { label: "Taxation", perms: perms.filter(p => p.includes("taxation")) },
          paiements: { label: "Paiements", perms: perms.filter(p => p.includes("paiements")) },
          rapports: { label: "Rapports & BI", perms: perms.filter(p => p.includes("rapports") || p.includes("business")) },
          utilisateurs: { label: "Utilisateurs", perms: perms.filter(p => p.includes("utilisateurs")) },
          securite: { label: "Sécurité", perms: perms.filter(p => p.includes("securite") || p.includes("parametres")) },
          autres: { label: "Autres", perms: perms.filter(p => p.includes("dashboard") || p.includes("cartographie") || p.includes("notifications")) },
        };

        const PERM_LABEL: Record<string, string> = {
          view_dashboard: "Tableau de bord", view_recensement: "Consulter", create_recensement: "Créer",
          edit_recensement: "Modifier", delete_recensement: "Supprimer",
          view_taxation: "Consulter", create_taxation: "Créer", edit_taxation: "Modifier", delete_taxation: "Supprimer",
          view_paiements: "Consulter", create_paiements: "Créer", validate_paiements: "Valider", cancel_paiements: "Annuler",
          view_cartographie: "Cartographie", view_rapports: "Rapports", export_rapports: "Exporter",
          view_business_intelligence: "Business Intelligence",
          view_utilisateurs: "Consulter", create_utilisateurs: "Créer", edit_utilisateurs: "Modifier", delete_utilisateurs: "Supprimer",
          view_securite: "Consulter", manage_securite: "Gérer",
          view_parametres: "Consulter", edit_parametres: "Modifier",
          view_notifications: "Consulter", send_notifications: "Envoyer",
        };

        return (
          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} style={{ color: roleColor }} />
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Vos permissions — {currentUserRole}</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm border text-white" style={{ background: roleColor + "cc", borderColor: roleColor }}>
                {perms.length} permissions
              </span>
            </div>
            {desc && (
              <div className="px-5 py-2.5 border-b border-border/50 text-xs font-mono text-muted-foreground italic">{desc}</div>
            )}
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.values(PERM_GROUPS).filter(g => g.perms.length > 0).map(group => (
                <div key={group.label} className="space-y-1.5">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border pb-1">{group.label}</p>
                  {group.perms.map(p => (
                    <div key={p} className="flex items-center gap-1.5">
                      <CheckCircle2 size={9} style={{ color: roleColor }} className="shrink-0" />
                      <span className="text-[10px] font-mono text-foreground/80">{PERM_LABEL[p] ?? p}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Recensement ──────────────────────────────────────────────────────────────
function Recensement({ contribuables, onAdd, onEdit, onView, onDelete, onNewPaiement, canCreate, canEdit, canDelete, communeName = "Mamou" }: {
  contribuables: Contribuable[];
  onAdd: () => void;
  onEdit: (c: Contribuable) => void;
  onView: (c: Contribuable) => void;
  onDelete: (c: Contribuable) => void;
  onNewPaiement: (c: Contribuable) => void;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  communeName?: string;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tous");
  const [statut, setStatut] = useState("Tous");
  const [page, setPage] = useState(1);
  const [avisContribuable, setAvisContribuable] = useState<Contribuable | null>(null);
  const PAGE_SIZE = 10;
  const types = ["Tous", "Résidentiel", "Commercial", "Industriel"];
  const statuts = ["Tous", "Payé", "En attente", "Arriéré"];

  const filtered = contribuables.filter((c) => {
    const matchSearch = `${c.nom} ${c.prenom} ${c.id} ${c.quartier}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Tous" || c.type === filter;
    const matchStatut = statut === "Tous" || c.statut === statut;
    return matchSearch && matchFilter && matchStatut;
  });

  const contribuablesColumns: ExportColumn[] = [
    { header: "Identifiant", key: "id", width: 25 },
    { header: "Nom", key: "nom", width: 30 },
    { header: "Prénom", key: "prenom", width: 30 },
    { header: "Téléphone", key: "telephone", width: 25 },
    { header: "NIN", key: "nin", width: 25 },
    { header: "Quartier", key: "quartier", width: 30 },
    { header: "Type", key: "type", width: 25 },
    { header: "Surface (m²)", key: "surface", width: 20 },
    { header: "Valeur locative (GNF)", key: "valeur", width: 35 },
    { header: "Statut", key: "statut", width: 20 },
  ];

  return (
    <div className="space-y-5">
      {/* Modal Avis d'imposition inline */}
      {avisContribuable && (
        <AvisImpositionEnhanced
          contribuable={avisContribuable}
          onClose={() => setAvisContribuable(null)}
        />
      )}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Nom, identifiant, quartier…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex border border-border rounded-sm overflow-hidden">
            {types.map((t) => (
              <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 text-xs font-mono transition-colors ${filter === t ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary"}`}>{t}</button>
            ))}
          </div>
          <div className="flex border border-border rounded-sm overflow-hidden">
            {statuts.map((s) => (
              <button key={s} onClick={() => setStatut(s)} className={`px-3 py-1.5 text-xs font-mono transition-colors ${statut === s ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:bg-secondary"}`}>{s}</button>
            ))}
          </div>
          <ExportButton
            data={filtered}
            columns={contribuablesColumns}
            filename={`contribuables-mamou-${new Date().toISOString().split('T')[0]}`}
            title={`Liste des Contribuables - ${communeName}`}
            subtitle={`${filter} - ${statut} (${filtered.length} contribuables)`}
            metadata={{
              "Date d'export": new Date().toLocaleDateString('fr-FR'),
              "Filtres appliqués": `Type: ${filter}, Statut: ${statut}`,
              "Total contribuables": filtered.length.toString()
            }}
            variant="compact"
          />
          <button onClick={() => {
            const rows = filtered.map(c => `
              <tr>
                <td>${c.id}</td>
                <td>${c.nom} ${c.prenom}</td>
                <td>${c.telephone}</td>
                <td>${c.quartier} / ${c.secteur}</td>
                <td>${c.type}</td>
                <td>${c.surface} m²</td>
                <td>${fmtShort(c.valeur)}</td>
                <td class="badge-${c.statut === "Payé" ? "paye" : c.statut === "Arriéré" ? "arriere" : "attente"}">${c.statut}</td>
              </tr>`).join("");
            printSection({
              title: "Liste des Contribuables",
              subtitle: `${filter} · ${statut} — ${filtered.length} contribuables`,
              html: `<table><thead><tr><th>ID</th><th>Nom complet</th><th>Téléphone</th><th>Quartier / Secteur</th><th>Type</th><th>Surface</th><th>Valeur locative</th><th>Statut</th></tr></thead><tbody>${rows}</tbody></table>`,
            });
          }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-border rounded-sm hover:bg-secondary transition-colors bg-card whitespace-nowrap">
            <Printer size={12} /> Imprimer
          </button>
          {canCreate !== false && (
            <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity whitespace-nowrap">
              <Plus size={12} /> Nouveau contribuable
            </button>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {["Identifiant", "Contribuable", "Quartier", "Type", "Surface", "Valeur locative", "Statut", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm font-mono text-muted-foreground">Aucun contribuable trouvé.</td></tr>
              ) : filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((c, i) => (
                <tr key={c.id} className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${i % 2 === 0 ? "" : "bg-background/30"}`}>
                  <td className="px-4 py-3 font-mono text-xs text-primary font-medium">{c.id}</td>
                  <td className="px-4 py-3 text-sm font-medium">{c.prenom} {c.nom}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.quartier}</td>
                  <td className="px-4 py-3"><span className="text-xs font-mono text-muted-foreground border border-border px-1.5 py-0.5 rounded-sm">{c.type}</span></td>
                  <td className="px-4 py-3 font-mono text-xs">{c.surface} m²</td>
                  <td className="px-4 py-3 font-mono text-xs">{fmtShort(c.valeur)}</td>
                  <td className="px-4 py-3"><StatusBadge statut={c.statut} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button title="Voir le dossier" onClick={() => onView(c)} className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-sm transition-colors text-muted-foreground"><Eye size={13} /></button>
                      <button title="Avis d'imposition" onClick={() => setAvisContribuable(c)} className="p-1.5 hover:bg-[#B8860B]/10 hover:text-[#B8860B] rounded-sm transition-colors text-muted-foreground"><FileText size={13} /></button>
                      {canEdit !== false && (
                        <button title="Modifier" onClick={() => onEdit(c)} className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-sm transition-colors text-muted-foreground"><Edit2 size={13} /></button>
                      )}
                      <button title="Paiement" onClick={() => onNewPaiement(c)} className="p-1.5 hover:bg-emerald-50 hover:text-emerald-700 rounded-sm transition-colors text-muted-foreground"><CreditCard size={13} /></button>
                      {canDelete !== false && (
                        <button title="Supprimer" onClick={() => onDelete(c)} className="p-1.5 hover:bg-red-50 hover:text-destructive rounded-sm transition-colors text-muted-foreground"><Trash2 size={13} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground bg-secondary/20">
          <span>{Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} ({contribuables.length} total)</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-2 py-1 rounded-sm hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed">‹</button>
            {Array.from({ length: Math.ceil(filtered.length / PAGE_SIZE) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`px-2 py-1 rounded-sm ${p === page ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / PAGE_SIZE), p + 1))} disabled={page >= Math.ceil(filtered.length / PAGE_SIZE)}
              className="px-2 py-1 rounded-sm hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Taxation ───────────────────────────��────────���────────────────────────────
function Taxation({ taxes, contribuables, onAdd, onEdit, onDelete, onSimulation, canCreate, canEdit, canDelete }: {
  taxes: Taxe[]; contribuables: Contribuable[];
  onAdd: () => void; onEdit: (t: Taxe) => void; onDelete: (t: Taxe) => void; onSimulation: () => void;
  canCreate?: boolean; canEdit?: boolean; canDelete?: boolean;
}) {
  const [filter, setFilter] = useState("Tous");
  const cats = ["Tous", "CFU", "Patentes", "Marchés", "Domaine", "Divers"];
  const filtered = taxes.filter((t) => filter === "Tous" || t.categorie === filter);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { cat: "CFU", count: taxes.filter((t) => t.categorie === "CFU").length, color: "bg-[#1B3A6B]/10 text-[#1B3A6B]" },
          { cat: "Patentes", count: taxes.filter((t) => t.categorie === "Patentes").length, color: "bg-[#B8860B]/10 text-[#B8860B]" },
          { cat: "Marchés", count: taxes.filter((t) => t.categorie === "Marchés").length, color: "bg-emerald-50 text-emerald-800" },
          { cat: "Domaine", count: taxes.filter((t) => t.categorie === "Domaine").length, color: "bg-red-50 text-red-800" },
        ].map((k) => (
          <div key={k.cat} className={`rounded-sm border border-border p-4 flex items-center justify-between ${k.color} bg-card`}>
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{k.cat}</p>
              <p className="text-2xl font-light mt-1" style={{ fontFamily: "'Crimson Pro', serif" }}>{k.count} taux</p>
            </div>
            <Calculator size={20} className="opacity-30" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex border border-border rounded-sm overflow-hidden">
          {cats.map((c) => (
            <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 text-xs font-mono transition-colors ${filter === c ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary"}`}>{c}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => {
            const rows = filtered.map(t => `
              <tr>
                <td>${t.id}</td>
                <td>${t.libelle}</td>
                <td>${t.categorie}</td>
                <td>${t.taux > 0 ? t.taux + "%" : "Forfait"}</td>
                <td>${t.base}</td>
                <td>${t.periodicite}</td>
                <td style="color:${t.actif ? "#15803d" : "#b91c1c"};font-weight:bold">${t.actif ? "Actif" : "Inactif"}</td>
              </tr>`).join("");
            printSection({
              title: "Barème des Taxes et Redevances",
              subtitle: `Filtre: ${filter} — ${filtered.length} taux`,
              html: `<table><thead><tr><th>ID</th><th>Libellé</th><th>Catégorie</th><th>Taux</th><th>Base</th><th>Périodicité</th><th>Statut</th></tr></thead><tbody>${rows}</tbody></table>`,
            });
          }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-border rounded-sm hover:bg-secondary transition-colors bg-card">
            <Printer size={12} /> Imprimer
          </button>
          <button onClick={onSimulation} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-accent text-accent rounded-sm hover:bg-accent/5 transition-colors">
            <Calculator size={12} /> Simulation fiscale
          </button>
          {canCreate !== false && (
            <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity">
              <Plus size={12} /> Nouveau taux
            </button>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              {["Code", "Libellé", "Catégorie", "Taux", "Base de calcul", "Périodicité", "Statut", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={t.id} className={`border-b border-border/50 hover:bg-secondary/20 transition-colors ${i % 2 === 0 ? "" : "bg-background/20"}`}>
                <td className="px-4 py-3 font-mono text-xs text-primary">{t.id}</td>
                <td className="px-4 py-3 text-sm font-medium max-w-[260px]">{t.libelle}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono border border-border px-1.5 py-0.5 rounded-sm text-muted-foreground">{t.categorie}</span>
                </td>
                <td className="px-4 py-3 font-mono text-sm font-bold text-primary">
                  {t.taux > 0 ? `${t.taux}%` : "Forfait"}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{t.base}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{t.periodicite}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-sm border ${t.actif ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {t.actif ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {canEdit !== false && (
                      <button onClick={() => onEdit(t)} className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-sm transition-colors text-muted-foreground"><Edit2 size={13} /></button>
                    )}
                    {canDelete !== false && (
                      <button onClick={() => onDelete(t)} className="p-1.5 hover:bg-red-50 hover:text-destructive rounded-sm transition-colors text-muted-foreground"><Trash2 size={13} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Paiements ────────────────────────────────────────────────────────────────
function Paiements({ paiements, contribuables, onNew, onView, onCancel, canCreate, canCancel, communeName = "Mamou", communeId = "mamou" }: {
  paiements: Paiement[]; contribuables: Contribuable[];
  onNew: () => void; onView: (p: Paiement) => void; onCancel: (p: Paiement) => void;
  canCreate?: boolean; canCancel?: boolean; communeName?: string; communeId?: string;
}) {
  const orangeKey = `snrr_${communeId}_orange_config`;
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("Tous");
  const [showOrangeAPI, setShowOrangeAPI] = useState(false);
  const [orangeConfig, setOrangeConfig] = useState(() => {
    try { const s = localStorage.getItem(orangeKey); if (s) return JSON.parse(s); } catch {}
    return {
      codeMarchand: `CM-${communeId.toUpperCase()}-2024`,
      cleAPI: "sk_live_*********************",
      urlAPI: "https://api.orange.com/orange-money-webpay/gn/v1",
      environment: "production" as "sandbox" | "production",
      numeroMarchand: "+224 620 00 00 00",
      webhookURL: `https://snrr-${communeId}.gov.gn/api/webhooks/orange-money`,
    };
  });
  const [testingAPI, setTestingAPI] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{success: boolean; message: string} | null>(null);
  
  const statuts = ["Tous", "Validé", "En attente", "Annulé"];

  const valides = paiements.filter((p) => p.statut === "Validé");
  const attente = paiements.filter((p) => p.statut === "En attente");
  const totJour = valides.slice(0, 2).reduce((s, p) => s + p.montant, 0);
  const totMois = valides.reduce((s, p) => s + p.montant, 0);

  const filtered = paiements.filter((p) => {
    const matchSearch = `${p.ref} ${p.contribuable}`.toLowerCase().includes(search.toLowerCase());
    const matchStatut = statut === "Tous" || p.statut === statut;
    return matchSearch && matchStatut;
  });

  const paiementsColumns: ExportColumn[] = [
    { header: "Référence", key: "ref", width: 25 },
    { header: "Contribuable", key: "contribuable", width: 35 },
    { header: "Montant (GNF)", key: "montant", width: 25 },
    { header: "Méthode", key: "methode", width: 25 },
    { header: "Opérateur", key: "operateur", width: 25 },
    { header: "Date", key: "date", width: 30 },
    { header: "Statut", key: "statut", width: 20 },
  ];

  // Simuler un appel API Orange Money
  const testOrangeAPI = async () => {
    setTestingAPI(true);
    setApiTestResult(null);
    
    // Simulation d'un appel API (2 secondes)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock de réponse API
    const success = orangeConfig.codeMarchand && orangeConfig.cleAPI.length > 20;
    setApiTestResult({
      success,
      message: success 
        ? "✓ Connexion réussie à l'API Orange Money Guinée" 
        : "✗ Échec de connexion - Vérifiez vos identifiants"
    });
    setTestingAPI(false);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Encaissements aujourd'hui", value: fmtShort(totJour || 10800000), icon: Banknote, color: "text-primary" },
          { label: "Total ce mois", value: fmtShort(totMois || 43900000), icon: TrendingUp, color: "text-emerald-700" },
          { label: "En attente de validation", value: attente.length, icon: Clock, color: "text-amber-700" },
        ].map((k) => (
          <div key={k.label} className="bg-card border border-border rounded-sm p-4 flex items-center gap-4">
            <div className="p-2.5 bg-secondary rounded-sm">
              <k.icon size={16} className={k.color} />
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">{k.label}</p>
              <p className={`text-xl font-light mt-0.5 ${k.color}`} style={{ fontFamily: "'Crimson Pro', serif" }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration API Orange Money */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <button
          onClick={() => setShowOrangeAPI(!showOrangeAPI)}
          className="w-full px-5 py-3 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-b border-orange-200/50 flex items-center justify-between hover:from-orange-500/15 hover:to-orange-600/15 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-orange-500 flex items-center justify-center">
              <Smartphone size={20} className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-medium text-foreground">API Orange Money Guinée</h3>
              <p className="text-xs font-mono text-muted-foreground">
                Code marchand: {orangeConfig.codeMarchand} • {orangeConfig.environment === "production" ? "Production" : "Sandbox"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {apiTestResult && (
              <span className={`text-xs font-mono ${apiTestResult.success ? "text-emerald-700" : "text-red-700"}`}>
                {apiTestResult.success ? "✓ Connecté" : "✗ Déconnecté"}
              </span>
            )}
            <ChevronRight size={16} className={`text-muted-foreground transition-transform ${showOrangeAPI ? "rotate-90" : ""}`} />
          </div>
        </button>

        {showOrangeAPI && (
          <div className="p-5 space-y-4 bg-secondary/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5">Code Marchand</label>
                <input
                  type="text"
                  value={orangeConfig.codeMarchand}
                  onChange={(e) => setOrangeConfig({...orangeConfig, codeMarchand: e.target.value})}
                  className="w-full px-3 py-2 text-sm font-mono bg-input-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="CM-XXXX-XXXX"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5">Numéro Marchand Orange Money</label>
                <input
                  type="text"
                  value={orangeConfig.numeroMarchand}
                  onChange={(e) => setOrangeConfig({...orangeConfig, numeroMarchand: e.target.value})}
                  className="w-full px-3 py-2 text-sm font-mono bg-input-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="+224 6XX XX XX XX"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-muted-foreground mb-1.5">Clé API (Secret Key)</label>
                <input
                  type="password"
                  value={orangeConfig.cleAPI}
                  onChange={(e) => setOrangeConfig({...orangeConfig, cleAPI: e.target.value})}
                  className="w-full px-3 py-2 text-sm font-mono bg-input-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="sk_live_*************************"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5">URL API</label>
                <input
                  type="text"
                  value={orangeConfig.urlAPI}
                  onChange={(e) => setOrangeConfig({...orangeConfig, urlAPI: e.target.value})}
                  className="w-full px-3 py-2 text-sm font-mono bg-input-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="https://api.orange.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1.5">Environnement</label>
                <select
                  value={orangeConfig.environment}
                  onChange={(e) => setOrangeConfig({...orangeConfig, environment: e.target.value as "sandbox" | "production"})}
                  className={selectCls}
                >
                  <option value="sandbox">Sandbox (Test)</option>
                  <option value="production">Production</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-muted-foreground mb-1.5">URL Webhook (Notifications)</label>
                <input
                  type="text"
                  value={orangeConfig.webhookURL}
                  onChange={(e) => setOrangeConfig({...orangeConfig, webhookURL: e.target.value})}
                  className="w-full px-3 py-2 text-sm font-mono bg-input-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="https://snrr-mamou.gov.gn/api/webhooks/orange-money"
                />
              </div>
            </div>

            {apiTestResult && (
              <div className={`p-3 rounded-sm border ${
                apiTestResult.success 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                  : "bg-red-50 border-red-200 text-red-800"
              }`}>
                <p className="text-xs font-mono">{apiTestResult.message}</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <button
                onClick={testOrangeAPI}
                disabled={testingAPI}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono bg-orange-500 text-white rounded-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testingAPI ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  <>
                    <Zap size={12} />
                    Tester la connexion API
                  </>
                )}
              </button>
              <button onClick={() => {
                localStorage.setItem(orangeKey, JSON.stringify(orangeConfig));
                const btn = document.getElementById("btn-save-orange");
                if (btn) { btn.textContent = "✓ Sauvegardé"; setTimeout(() => { btn.textContent = "Sauvegarder la configuration"; }, 2000); }
              }} id="btn-save-orange" className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono border border-border rounded-sm hover:bg-secondary transition-colors">
                <Save size={12} />
                Sauvegarder la configuration
              </button>
              <div className="flex-1" />
              <a
                href="https://developer.orange.com/apis/orange-money-webpay/getting-started"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-mono text-primary hover:underline"
              >
                <ExternalLink size={11} />
                Documentation API
              </a>
            </div>

            {/* Exemple d'intégration */}
            <div className="bg-slate-900 rounded-sm p-4 overflow-x-auto">
              <p className="text-xs font-mono text-slate-400 mb-2">Exemple de requête API Orange Money :</p>
              <pre className="text-xs font-mono text-emerald-400">
{`POST ${orangeConfig.urlAPI}/webpayment
Authorization: Bearer ${orangeConfig.cleAPI.substring(0, 15)}...
Content-Type: application/json

{
  "merchant_key": "${orangeConfig.codeMarchand}",
  "currency": "GNF",
  "order_id": "MOU-2024-00156",
  "amount": 500000,
  "return_url": "https://snrr-mamou.gov.gn/success",
  "cancel_url": "https://snrr-mamou.gov.gn/cancel",
  "notif_url": "${orangeConfig.webhookURL}",
  "lang": "fr"
}`}
              </pre>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Référence ou contribuable…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div className="flex border border-border rounded-sm overflow-hidden">
          {statuts.map((s) => (
            <button key={s} onClick={() => setStatut(s)} className={`px-3 py-1.5 text-xs font-mono transition-colors ${statut === s ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary"}`}>{s}</button>
          ))}
        </div>
        <ExportButton
          data={filtered}
          columns={paiementsColumns}
          filename={`paiements-${statut.toLowerCase()}-${new Date().toISOString().split('T')[0]}`}
          title={`Registre des Paiements - ${communeName}`}
          subtitle={`${statut} - ${filtered.length} transactions`}
          metadata={{
            "Date d'export": new Date().toLocaleDateString('fr-FR'),
            "Filtre statut": statut,
            "Total transactions": filtered.length.toString(),
            "Montant total": `${filtered.filter(p => p.statut === "Validé").reduce((s, p) => s + p.montant, 0).toLocaleString('fr-FR')} GNF`
          }}
          variant="compact"
        />
        <button onClick={() => {
          const total = filtered.filter(p => p.statut === "Validé").reduce((s, p) => s + p.montant, 0);
          const rows = filtered.map(p => `
            <tr>
              <td>${p.ref}</td>
              <td>${p.contribuable}</td>
              <td style="font-weight:bold;text-align:right">${fmtShort(p.montant)}</td>
              <td>${p.methode}</td>
              <td>${p.operateur}</td>
              <td>${p.date}</td>
              <td class="badge-${p.statut === "Validé" ? "paye" : p.statut === "Annulé" ? "arriere" : "attente"}">${p.statut}</td>
            </tr>`).join("");
          printSection({
            title: "Registre des Paiements",
            subtitle: `Statut: ${statut} — ${filtered.length} transactions`,
            html: `<table>
              <thead><tr><th>Référence</th><th>Contribuable</th><th>Montant</th><th>Méthode</th><th>Opérateur</th><th>Date</th><th>Statut</th></tr></thead>
              <tbody>${rows}</tbody>
              <tfoot><tr class="total-row"><td colspan="2"><b>TOTAL ENCAISSÉ</b></td><td style="text-align:right;font-weight:bold">${fmtShort(total)}</td><td colspan="4"></td></tr></tfoot>
            </table>`,
            landscape: true,
          });
        }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-border rounded-sm hover:bg-secondary transition-colors bg-card whitespace-nowrap">
          <Printer size={12} /> Imprimer liste
        </button>
        {canCreate !== false && (
          <button onClick={onNew} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity whitespace-nowrap">
            <Plus size={12} /> Nouveau paiement
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {["Référence", "Contribuable", "Montant", "Méthode", "Opérateur", "Date & Heure", "Statut", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm font-mono text-muted-foreground">Aucun paiement trouvé.</td></tr>
              ) : filtered.map((p, i) => (
                <tr key={p.ref} className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${i % 2 === 0 ? "" : "bg-background/20"}`}>
                  <td className="px-4 py-3 font-mono text-xs text-primary font-medium">{p.ref}</td>
                  <td className="px-4 py-3 text-sm font-medium">{p.contribuable}</td>
                  <td className="px-4 py-3 font-mono text-sm font-semibold">{fmtShort(p.montant)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.methode}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.operateur}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.date}</td>
                  <td className="px-4 py-3"><StatusBadge statut={p.statut} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button title="Voir le reçu" onClick={() => onView(p)} className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-sm transition-colors text-muted-foreground"><Eye size={13} /></button>
                      {p.recu && <button title="Imprimer le reçu" onClick={() => onView(p)} className="p-1.5 hover:bg-accent/10 hover:text-accent rounded-sm transition-colors text-muted-foreground"><Printer size={13} /></button>}
                      {p.statut === "En attente" && canCancel !== false && (
                        <button title="Annuler" onClick={() => onCancel(p)} className="p-1.5 hover:bg-red-50 hover:text-destructive rounded-sm transition-colors text-muted-foreground"><X size={13} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Cartographie ─────────────────────────────────────────────────────��───────
// ═════════════════════════════════════════════════════════════════════════════
// ⚙️ CONFIGURATION GOOGLE MAPS — À PERSONNALISER OBLIGATOIREMENT
// ═════════════════════════════════════════════════════════════════════════════
/**
 * 🗺️ CONFIGURATION OBLIGATOIRE : Clé API Google Maps
 * 
 * Pour activer la cartographie interactive de Mamou, vous devez obtenir 
 * votre propre clé API Google Maps.
 * 
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 📋 GUIDE DE CONFIGURATION ÉTAPE PAR ÉTAPE                          │
 * └─────────────────────────────────────────────────────────────────────┘
 * 
 * ÉTAPE 1 : Accéder à Google Cloud Console
 *   🔗 https://console.cloud.google.com/
 * 
 * ÉTAPE 2 : Créer un nouveau projet
 *   • Dans le menu principal, cliquez sur "Sélectionner un projet"
 *   • Cliquez sur "Nouveau projet"
 *   • Nom suggéré : "SNRR-Mamou-Cartographie"
 *   • Cliquez sur "CRÉER"
 * 
 * ÉTAPE 3 : Activer l'API Maps JavaScript
 *   • Menu : APIs et services > Bibliothèque
 *   • Recherchez : "Maps JavaScript API"
 *   • Cliquez sur le résultat, puis sur "ACTIVER"
 * 
 * ÉTAPE 4 : Créer une clé API
 *   • Menu : APIs et services > Identifiants
 *   • Bouton : CRÉER DES IDENTIFIANTS > Clé API
 *   • Une clé API sera générée automatiquement
 *   • Copiez cette clé
 * 
 * ÉTAPE 5 : (FORTEMENT RECOMMANDÉ) Sécuriser la clé API
 *   • Cliquez sur le nom de votre clé pour la modifier
 *   • Section "Restrictions liées aux applications" :
 *     - Sélectionnez "Référents HTTP (sites Web)"
 *     - Ajoutez vos domaines (ex: https://snrr-mamou.gn/*)
 *   • Section "Restrictions liées aux API" :
 *     - Sélectionnez "Limiter la clé"
 *     - Cochez uniquement "Maps JavaScript API"
 *   • Cliquez sur "ENREGISTRER"
 * 
 * ÉTAPE 6 : Configurer la clé dans ce fichier
 *   • Remplacez "VOTRE_CLE_API_GOOGLE_MAPS_ICI" ci-dessous
 *   • Gardez les guillemets
 *   • Sauvegardez le fichier
 * 
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ⚠️ IMPORTANT                                                        │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ • Sans clé API valide, la carte ne fonctionnera pas                │
 * │ • Ne partagez jamais votre clé API publiquement                    │
 * │ • Activez les restrictions pour éviter l'utilisation non autorisée │
 * │ • Surveillez votre utilisation dans Google Cloud Console           │
 * └─────────────────────────────────────────────────────────────────────┘
 * 
 * 📚 Documentation officielle :
 *    https://developers.google.com/maps/documentation/javascript/get-api-key
 * 
 * ��� Tarification (mise à jour 2024) :
 *    Google offre 200$ de crédit mensuel gratuit, largement suffisant
 *    pour une commune de la taille de Mamou.
 */

// ⬇️ REMPLACEZ LA CLÉ CI-DESSOUS PAR VOTRE CLÉ API GOOGLE MAPS
// ═════════════════════════════════════════════════════════════════════════════

const MAP_STYLES = {
  streets: {
    label: "Carte",
    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
    attribution: "© OpenStreetMap contributors",
  },
  satellite: {
    label: "Satellite",
    tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
    attribution: "© Esri, Maxar, GeoEye, Earthstar Geographics",
  },
  topo: {
    label: "Topo",
    tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"],
    attribution: "© Esri, HERE, Garmin, Intermap, USGS",
  },
  dark: {
    label: "Sombre",
    tiles: ["https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"],
    attribution: "© OpenStreetMap contributors © CARTO",
  },
} as const;

type MapTileMode = keyof typeof MAP_STYLES;

function Cartographie({ onNavigate, contribuables, communeName = "Mamou", communeConfig, communeId = "mamou" }: { onNavigate: (v: View) => void, contribuables: Contribuable[]; communeName?: string; communeConfig?: CommuneConfig; communeId?: string }) {
  const prefecture = communeConfig ?? { sousPrefectures: PREFECTURE_MAMOU.sousPrefectures, communes: PREFECTURE_MAMOU.communes, quartierColors: QUARTIER_COLORS, mapCenter: undefined };
  const sousPrefectures = prefecture.sousPrefectures;
  const mainCommune = prefecture.communes[0];
  const quartierColors = (prefecture as CommuneConfig).quartierColors ?? QUARTIER_COLORS;
  const mapCenter = (prefecture as CommuneConfig).mapCenter ?? { lat: MAMOU_CENTER.lat, lng: MAMOU_CENTER.lng, zoom: 13 };
  const districts = mainCommune.districts ?? (mainCommune as any).quartiers ?? [];

  // Build quartier stats dynamically from districts (seeded per commune)
  const localQuartierStats = districts.map((d, i) => ({
    quartier: d.nom,
    contribuables: 200 + Math.floor(seededRand(communeId, i + 20) * 1200),
    recouvert: 50 + Math.floor(seededRand(communeId, i + 30) * 40),
    montant: (200 + Math.floor(seededRand(communeId, i + 40) * 800)) * (60000 + Math.floor(seededRand(communeId, i + 50) * 30000)),
  }));

  // Simulated contribuables with GPS coordinates in this commune
  const simContribuables = genSimContribuables(
    { lat: mapCenter.lat, lng: mapCenter.lng },
    communeId,
    (prefecture as CommuneConfig).code ?? communeId.slice(0, 3).toUpperCase(),
    districts,
    40
  );

  // Merge real contribuables that have valid GPS with simulated ones (simulated shown if real is empty)
  const allContribuables = contribuables.length > 0 ? contribuables : simContribuables;
  const [activeQ, setActiveQ] = useState<string | null>(null);
  const [showContribuables, setShowContribuables] = useState(true);
  const [selectedSousPref, setSelectedSousPref] = useState<string | null>(null);
  const [searchGeo, setSearchGeo] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatut, setFilterStatut] = useState<string>("all");
  const [selectedMarker, setSelectedMarker] = useState<Contribuable | null>(null);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapTileMode, setMapTileMode] = useState<MapTileMode>("streets");
  const userMarkerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  
  const parseCoords = (coordGps: string): { lat: number; lng: number } | null => {
    if (!coordGps?.trim()) return null;
    // Format décimal : "10.380100, -12.087100"
    const dec = coordGps.match(/^(-?[\d.]+)\s*,\s*(-?[\d.]+)$/);
    if (dec) {
      const lat = parseFloat(dec[1]), lng = parseFloat(dec[2]);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
    // Format DMS : "10.3792° N, 12.0862° W"
    const dms = coordGps.match(/([\d.]+)°?\s*N,\s*([\d.]+)°?\s*([WE])/i);
    if (dms) {
      const isWest = dms[3].toUpperCase() === "W";
      return { lat: parseFloat(dms[1]), lng: isWest ? -parseFloat(dms[2]) : parseFloat(dms[2]) };
    }
    return null;
  };

  const contribuablesWithCoords = allContribuables
    .map(c => ({ ...c, coords: parseCoords(c.coordGps) }))
    .filter(c => c.coords !== null)
    .filter(c => {
      if (filterType !== "all" && c.type !== filterType) return false;
      if (filterStatut !== "all" && c.statut !== filterStatut) return false;
      if (searchGeo) {
        const s = searchGeo.toLowerCase();
        return c.nom.toLowerCase().includes(s) || c.prenom.toLowerCase().includes(s) ||
          c.quartier.toLowerCase().includes(s) || c.id.toLowerCase().includes(s);
      }
      return true;
    });

  // Contribuable markers ref — track to remove/re-add cleanly
  const contribMarkersRef = useRef<any[]>([]);

  const addContribMarkers = (map: any, Marker: any, Popup: any, list: typeof contribuablesWithCoords) => {
    // Remove existing markers
    contribMarkersRef.current.forEach(m => m.remove());
    contribMarkersRef.current = [];
    list.forEach(c => {
      const color = c.statut === "Payé" ? "#009460" : c.statut === "Arriéré" ? "#CE1126" : "#B8860B";
      const photo = localStorage.getItem(`snrr_contrib_photo_${c.id}`) ?? c.photoContribuable;
      const avatarHtml = photo
        ? `<img src="${photo}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid ${color};display:block" />`
        : `<div style="width:32px;height:32px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;color:white;border:2px solid white">${c.nom[0]}${c.prenom[0]}</div>`;
      const el = document.createElement("div");
      el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.5)`;
      const marker = new Marker({ element: el })
        .setLngLat([c.coords!.lng, c.coords!.lat])
        .setPopup(new Popup({ offset: 14, closeButton: false, maxWidth: "220px" }).setHTML(
          `<div style="font-family:JetBrains Mono,monospace;font-size:11px;padding:10px;min-width:200px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #eee">
              ${avatarHtml}
              <div>
                <div style="font-weight:bold;font-size:12px">${c.prenom} ${c.nom}</div>
                <div style="color:${color};font-size:10px;padding:1px 5px;border-radius:2px;background:${color}18;display:inline-block;margin-top:2px">${c.statut}</div>
              </div>
            </div>
            <div style="color:#555;line-height:1.7">
              ID: <b style="color:#1B3A6B">${c.id}</b><br/>
              Quartier: <b>${c.quartier}</b><br/>
              Type: ${c.type} · ${c.usage ?? ""}<br/>
              Surface: <b>${c.surface} m²</b><br/>
              Valeur: <b>${c.valeur.toLocaleString("fr-FR")} GNF</b>
            </div>
          </div>`
        ))
        .addTo(map);
      contribMarkersRef.current.push(marker);
    });
  };

  // MapLibre GL initialisation
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let mapInstance: any = null;
    let MarkerCls: any = null;
    let PopupCls: any = null;

    import("maplibre-gl").then((mod) => {
      const { Map: MapGL, AttributionControl, NavigationControl, Marker, Popup } = mod as any;
      if (!MapGL || !mapContainerRef.current) return;
      MarkerCls = Marker;
      PopupCls = Popup;

      // Use OSM raster tiles directly (no external style JSON needed)
      const osmStyle = {
        version: 8 as const,
        sources: {
          osm: {
            type: "raster" as const,
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm-tiles", type: "raster" as const, source: "osm" }],
      };

      mapInstance = new MapGL({
        container: mapContainerRef.current,
        style: osmStyle,
        center: [mapCenter.lng, mapCenter.lat],
        zoom: mapCenter.zoom ?? 13,
        attributionControl: false,
      });

      mapInstance.on("load", () => {
        mapRef.current = mapInstance;
        setMapLoaded(true);
        mapInstance.addControl(new AttributionControl({ compact: true }), "bottom-right");
        mapInstance.addControl(new NavigationControl(), "top-right");

        // District cluster markers — using coords from communeConfig or simulated
        localQuartierStats.forEach((q, i) => {
          const distCoords = districts[i] as { lat?: number; lng?: number } | undefined;
          const lat = distCoords?.lat;
          const lng = distCoords?.lng;
          if (!lat || !lng) return;
          const el = document.createElement("div");
          const color = quartierColors[q.quartier] || "#4A6B8A";
          el.innerHTML = `<div style="padding:3px 7px;border-radius:10px;background:${color};color:white;font-size:10px;font-weight:bold;font-family:monospace;white-space:nowrap;border:2px solid white;box-shadow:0 1px 6px rgba(0,0,0,0.35);cursor:pointer">${q.quartier.split(" ")[0].slice(0,12)}</div>`;
          new Marker({ element: el })
            .setLngLat([lng, lat])
            .setPopup(new Popup({ offset: 14, closeButton: false }).setHTML(
              `<div style="font-family:JetBrains Mono,monospace;font-size:11px;padding:8px;min-width:170px">
                <b style="color:${color};font-size:13px">${q.quartier}</b><br/>
                <div style="color:#555;margin-top:4px;line-height:1.7">
                  Contribuables: <b>${q.contribuables.toLocaleString("fr")}</b><br/>
                  Recouvrement: <b style="color:${color}">${q.recouvert}%</b><br/>
                  Recettes: <b>${q.montant.toLocaleString("fr-FR")} GNF</b>
                </div>
              </div>`
            ))
            .addTo(mapInstance);
        });

        // Initial contribuable markers
        if (showContribuables) {
          addContribMarkers(mapInstance, MarkerCls, PopupCls, contribuablesWithCoords);
        }
      });
    }).catch(console.error);
    return () => {
      contribMarkersRef.current.forEach(m => m.remove());
      contribMarkersRef.current = [];
      mapInstance?.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-draw contribuable markers on filter/toggle change
  useEffect(() => {
    if (!mapRef.current) return;
    import("maplibre-gl").then((mod) => {
      const { Marker, Popup } = mod as any;
      if (!Marker) return;
      if (!showContribuables) {
        contribMarkersRef.current.forEach(m => m.remove());
        contribMarkersRef.current = [];
      } else {
        addContribMarkers(mapRef.current, Marker, Popup, contribuablesWithCoords);
      }
    });
  }, [contribuablesWithCoords.length, showContribuables, filterType, filterStatut, searchGeo]);

  // Swap tile source when mode changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const source = mapRef.current.getSource("osm") as any;
    if (source?.setTiles) source.setTiles(MAP_STYLES[mapTileMode].tiles);
  }, [mapTileMode, mapLoaded]);

  const handleMyPosition = () => {
    if (!navigator.geolocation) { setGeoError("Géolocalisation non supportée"); return; }
    setGeoLocating(true); setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        setGeoLocating(false);
        if (!mapRef.current) return;
        // Fly to user position
        mapRef.current.flyTo({ center: [lng, lat], zoom: 16, speed: 1.4, curve: 1.2 });
        // Remove previous user marker
        userMarkerRef.current?.remove();
        // Add pulsing "you are here" marker
        import("maplibre-gl").then((mod) => {
          const { Marker, Popup } = mod as any;
          if (!Marker) return;
          const el = document.createElement("div");
          el.style.cssText = `position:relative;width:20px;height:20px`;
          el.innerHTML = `
            <div style="position:absolute;inset:0;border-radius:50%;background:#1B3A6B;border:3px solid white;box-shadow:0 2px 8px rgba(27,58,107,0.6);z-index:1"></div>
            <div style="position:absolute;inset:-6px;border-radius:50%;background:rgba(27,58,107,0.2);animation:ping 1.5s ease-out infinite"></div>
            <style>@keyframes ping{0%{transform:scale(0.8);opacity:0.8}100%{transform:scale(2.2);opacity:0}}</style>
          `;
          const marker = new Marker({ element: el })
            .setLngLat([lng, lat])
            .setPopup(new Popup({ offset: 16, closeButton: false }).setHTML(
              `<div style="font-family:monospace;font-size:11px;padding:8px;min-width:160px">
                <div style="font-weight:bold;color:#1B3A6B;margin-bottom:4px">📍 Vous êtes ici</div>
                <div style="color:#555">Lat: ${lat.toFixed(6)}</div>
                <div style="color:#555">Lng: ${lng.toFixed(6)}</div>
                <div style="color:#888;margin-top:4px">Précision: ±${Math.round(accuracy)} m</div>
              </div>`
            ))
            .addTo(mapRef.current);
          marker.togglePopup();
          userMarkerRef.current = marker;
        });
      },
      (err) => {
        setGeoLocating(false);
        setGeoError(
          err.code === 1 ? "Accès refusé. Autorisez la géolocalisation." :
          err.code === 3 ? "Délai dépassé. Réessayez en zone dégagée." :
          "Position indisponible."
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-light text-foreground" style={{ fontFamily: "'Crimson Pro', serif" }}>
            Cartographie SIG — {communeName}
          </h2>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            MapLibre GL • {MAP_STYLES[mapTileMode].label} • {contribuablesWithCoords.length} biens géolocalisés
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Ma position */}
          <button
            onClick={handleMyPosition}
            disabled={geoLocating}
            title="Centrer la carte sur ma position GPS"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border rounded-sm transition-colors bg-card border-border hover:bg-secondary disabled:opacity-50"
          >
            {geoLocating ? <RefreshCw size={12} className="animate-spin" /> : <Crosshair size={12} />}
            Ma position
          </button>
          <button
            onClick={() => setShowContribuables(!showContribuables)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border rounded-sm transition-colors ${showContribuables ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-secondary"}`}
          >
            <Users size={12} /> Contribuables
          </button>
          <button onClick={() => {
            const rows = contribuablesWithCoords.map(c => `
              <tr>
                <td>${c.id}</td>
                <td>${c.nom} ${c.prenom}</td>
                <td>${c.quartier} / ${c.secteur}</td>
                <td>${c.type}</td>
                <td class="badge-${c.statut === "Payé" ? "paye" : c.statut === "Arriéré" ? "arriere" : "attente"}">${c.statut}</td>
                <td>${c.coordGps}</td>
              </tr>`).join("");
            printSection({
              title: "Cartographie SIG — Biens géolocalisés",
              subtitle: `${contribuablesWithCoords.length} biens · OpenStreetMap`,
              html: `<table><thead><tr><th>ID</th><th>Contribuable</th><th>Quartier / Secteur</th><th>Type</th><th>Statut</th><th>Coordonnées GPS</th></tr></thead><tbody>${rows}</tbody></table>`,
              landscape: true,
            });
          }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-border rounded-sm hover:bg-secondary transition-colors bg-card">
            <Download size={12} /> Exporter
          </button>
        </div>
      </div>

      {/* Geo error */}
      {geoError && (
        <div className="flex items-center gap-2 text-xs font-mono text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
          <MapPin size={12} /> {geoError}
          <button onClick={() => setGeoError("")} className="ml-auto"><X size={12} /></button>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-card border border-border rounded-sm p-3 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Recherche contribuable, quartier…" value={searchGeo}
            onChange={e => setSearchGeo(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-input-background border border-border rounded-sm font-mono w-full focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-2 py-1.5 text-xs bg-input-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="all">Tous types</option>
          {["Résidentiel","Commercial","Industriel","Administratif","Mixte"].map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
          className="px-2 py-1.5 text-xs bg-input-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="all">Tous statuts</option>
          {["Payé","En attente","Arriéré"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* MapLibre map */}
          <div className="bg-card border border-border rounded-sm overflow-hidden" style={{ height: 500 }}>
            <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-secondary/30 flex-wrap gap-2">
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                <Map size={11} /> Carte interactive — {MAP_STYLES[mapTileMode].label}
              </span>
              <div className="flex items-center gap-1">
                {(Object.entries(MAP_STYLES) as [MapTileMode, typeof MAP_STYLES[MapTileMode]][]).map(([key, s]) => (
                  <button
                    key={key}
                    onClick={() => setMapTileMode(key)}
                    className={`px-2.5 py-1 text-[10px] font-mono rounded-sm transition-colors ${
                      mapTileMode === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono text-muted-foreground">{contribuablesWithCoords.length} géolocalisés</span>
            </div>
            <div style={{ position: "relative", height: 458 }}>
              <div ref={mapContainerRef} style={{ position: "absolute", inset: 0 }} />
              {!mapLoaded && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#e8e0d8", zIndex: 1 }}
                  className="text-xs font-mono text-muted-foreground animate-pulse">
                  <div className="text-center space-y-2">
                    <Map size={24} className="mx-auto opacity-40" />
                    <p>Chargement de la carte OpenStreetMap…</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Légende */}
          <div className="bg-card border border-border rounded-sm p-4">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-3">Légende</h3>
            <div className="flex flex-wrap gap-4">
              {[{ color: "#009460", label: "Payé" }, { color: "#B8860B", label: "En attente" }, { color: "#CE1126", label: "Arriéré" }].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ background: l.color }} />
                  <span className="text-xs font-mono">{l.label}</span>
                </div>
              ))}
              {localQuartierStats.slice(0, 5).map(q => (
                <div key={q.quartier} className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-sm border border-border opacity-70" style={{ background: quartierColors[q.quartier] || "#4A6B8A" }} />
                  <span className="text-[10px] font-mono truncate max-w-[80px]">{q.quartier.split("-")[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-sm p-4">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-3 flex items-center gap-2">
              <Globe size={11} /> Sous-préfectures ({sousPrefectures.length})
            </h3>
            <div className="space-y-1 max-h-44 overflow-y-auto">
              {sousPrefectures.map(sp => (
                <button key={sp} onClick={() => setSelectedSousPref(selectedSousPref === sp ? null : sp)}
                  className={`w-full text-left px-2 py-1.5 text-xs font-mono rounded-sm transition-colors ${selectedSousPref === sp ? "bg-primary/10 text-primary" : "hover:bg-secondary/50"}`}>
                  {sp}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-3">Statistiques par quartier</h3>
            <div className="space-y-2">
              {localQuartierStats.map(q => (
                <button key={q.quartier} onClick={() => setActiveQ(activeQ === q.quartier ? null : q.quartier)}
                  className={`w-full bg-card border rounded-sm p-3 text-left transition-all ${activeQ === q.quartier ? "border-primary shadow-md" : "border-border hover:border-primary/40"}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: quartierColors[q.quartier] || "#4A6B8A" }} />
                      <span className="text-xs font-medium truncate max-w-[120px]">{q.quartier}</span>
                    </div>
                    <span className={`text-xs font-mono font-bold shrink-0 ${q.recouvert >= 75 ? "text-emerald-700" : q.recouvert >= 60 ? "text-amber-700" : "text-red-700"}`}>{q.recouvert}%</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden mb-1.5">
                    <div className="h-full rounded-full" style={{ width: `${q.recouvert}%`, background: q.recouvert >= 75 ? "#009460" : q.recouvert >= 60 ? "#B8860B" : "#CE1126" }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                    <span>{q.contribuables.toLocaleString("fr")} contrib.</span>
                    <span>{(q.montant / 1_000_000).toFixed(1)}M GNF</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rapports ─────────────────────────────────────────────────────────────────
function Rapports({ contribuables, recettesData, communeName = "Mamou", communeConfig }: { contribuables: Contribuable[]; recettesData?: RecetteMois[]; communeName?: string; communeConfig?: CommuneConfig }) {
  const spStats = communeConfig?.spStats ?? SP_STATS;
  const recettesMonthly = recettesData ?? RECETTES_DEFAULT;
  const [period, setPeriod] = useState("mensuel");
  const [showFilters, setShowFilters] = useState(false);
  const [filtreCommune, setFiltreCommune] = useState("Toutes");
  const [filtreDistrict, setFiltreDistrict] = useState("Tous");
  const [filtreSecteur, setFiltreSecteur] = useState("Tous");
  const [filtreAgent, setFiltreAgent] = useState("Tous les agents");
  const [filtreType, setFiltreType] = useState("Tous");
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const [filtreDateDeb, setFiltreDateDeb] = useState("2024-01-01");
  const [filtreDateFin, setFiltreDateFin] = useState("2024-12-31");

  // Wire period preset to date range
  useEffect(() => {
    const n = new Date();
    const y = n.getFullYear();
    const m = String(n.getMonth() + 1).padStart(2, "0");
    const d = String(n.getDate()).padStart(2, "0");
    if (period === "journalier") {
      setFiltreDateDeb(`${y}-${m}-${d}`);
      setFiltreDateFin(`${y}-${m}-${d}`);
    } else if (period === "mensuel") {
      setFiltreDateDeb(`${y}-${m}-01`);
      setFiltreDateFin(`${y}-${m}-31`);
    } else if (period === "annuel") {
      setFiltreDateDeb(`${y}-01-01`);
      setFiltreDateFin(`${y}-12-31`);
    }
  }, [period]);

  const allCommunes = ["Toutes", ...Object.keys(spStats)];
  const allDistricts = filtreCommune !== "Toutes"
    ? ["Tous", ...Object.keys(spStats[filtreCommune]?.districts ?? {})]
    : ["Tous"];

  const handleCommuneFilter = (c: string) => { setFiltreCommune(c); setFiltreDistrict("Tous"); setFiltreSecteur("Tous"); };
  const handleDistrictFilter = (d: string) => { setFiltreDistrict(d); setFiltreSecteur("Tous"); };

  const allSecteurs = filtreDistrict !== "Tous" && filtreCommune !== "Toutes"
    ? ["Tous", ...(spStats[filtreCommune]?.districts[filtreDistrict]?.secteurs ?? [])]
    : ["Tous"];

  const activeFilterCount = [
    filtreCommune !== "Toutes", filtreDistrict !== "Tous", filtreSecteur !== "Tous",
    filtreAgent !== "Tous les agents", filtreType !== "Tous", filtreStatut !== "Tous",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setFiltreCommune("Toutes"); setFiltreDistrict("Tous"); setFiltreSecteur("Tous");
    setFiltreAgent("Tous les agents"); setFiltreType("Tous"); setFiltreStatut("Tous");
    setFiltreDateDeb("2024-01-01"); setFiltreDateFin("2024-12-31");
  };

  const filtered = contribuables.filter(c => {
    if (filtreCommune !== "Toutes" && (c.commune ?? c.quartier) !== filtreCommune) return false;
    if (filtreDistrict !== "Tous" && (c.district ?? c.quartier) !== filtreDistrict) return false;
    if (filtreSecteur !== "Tous" && c.secteur !== filtreSecteur) return false;
    if (filtreAgent !== "Tous les agents" && c.agentRecenseur !== filtreAgent) return false;
    if (filtreType !== "Tous" && c.type !== filtreType) return false;
    if (filtreStatut !== "Tous" && c.statut !== filtreStatut) return false;
    if (c.date < filtreDateDeb || c.date > filtreDateFin) return false;
    return true;
  });

  const totalVal = filtered.reduce((s, c) => s + c.valeur, 0);
  const payeCount = filtered.filter(c => c.statut === "Payé").length;
  const tauxRecouvrement = filtered.length ? Math.round(payeCount / filtered.length * 100) : 0;

  // Chart data by commune — use filtered dataset when any filter is active
  const byCommune = activeFilterCount > 0
    ? (() => {
        const groups: Record<string, { contribuables: number; paye: number }> = {};
        for (const c of filtered) {
          const key = c.commune ?? c.quartier ?? "Autre";
          if (!groups[key]) groups[key] = { contribuables: 0, paye: 0 };
          groups[key].contribuables++;
          if (c.statut === "Payé") groups[key].paye++;
        }
        return Object.entries(groups)
          .map(([nom, g]) => ({
            nom,
            contribuables: g.contribuables,
            taux: g.contribuables ? Math.round(g.paye / g.contribuables * 100) : 0,
            recettes: Math.round(g.contribuables * 0.5 * 100) / 100,
          }))
          .sort((a, b) => b.contribuables - a.contribuables);
      })()
    : Object.entries(spStats).map(([, sp]) => ({
        nom: sp.label,
        contribuables: sp.contribuables,
        taux: sp.taux,
        recettes: sp.recettes / 1_000_000,
      }));

  // Recettes line chart slice by period
  const recettesSlice = period === "journalier"
    ? recettesMonthly.slice(0, 1)
    : period === "mensuel"
    ? recettesMonthly.slice(0, 3)
    : recettesMonthly;

  const indicateursData = [
    { indicateur: "CFU", prevu: 24000000, realise: 21300000, ecart: -2700000, taux: 89 },
    { indicateur: "Patentes & Licences", prevu: 16000000, realise: 14200000, ecart: -1800000, taux: 89 },
    { indicateur: "Taxes de marché", prevu: 6000000, realise: 5300000, ecart: -700000, taux: 88 },
    { indicateur: "Domaine public", prevu: 4000000, realise: 3100000, ecart: -900000, taux: 78 },
    { indicateur: "Total", prevu: 50000000, realise: 43900000, ecart: -6100000, taux: 88 },
  ];

  const indicateursColumns: ExportColumn[] = [
    { header: "Indicateur", key: "indicateur", width: 40 },
    { header: "Prévu (GNF)", key: "prevu", width: 30 },
    { header: "Réalisé (GNF)", key: "realise", width: 30 },
    { header: "Écart (GNF)", key: "ecart", width: 30 },
    { header: "Taux (%)", key: "taux", width: 20 },
  ];

  return (
    <div className="space-y-5">
      {/* Header + period + export */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex border border-border rounded-sm overflow-hidden">
            {["journalier", "mensuel", "annuel"].map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-1.5 text-xs font-mono capitalize transition-colors ${period === p ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-secondary"}`}>{p}</button>
            ))}
          </div>
          <button onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border rounded-sm transition-colors ${showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/40"}`}
          >
            <Filter size={12} />
            Filtres
            {activeFilterCount > 0 && (
              <span className="bg-[#CE1126] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
        </div>
        <ExportButton
          data={indicateursData}
          columns={indicateursColumns}
          filename={`rapport-${filtreCommune !== "Toutes" ? filtreCommune.replace(/\s+/g, "-") + "-" : ""}${period}-${new Date().toISOString().split("T")[0]}`}
          title={`Rapport de Performance - SNRR ${communeName}`}
          subtitle={`Période: ${period} | Zone: ${filtreCommune} | ${filtered.length} contribuables`}
          metadata={{
            "Date de génération": new Date().toLocaleDateString("fr-FR"),
            "Période": period,
            "Zone": filtreCommune,
            "District": filtreDistrict,
            "Secteur": filtreSecteur,
            "Agent": filtreAgent,
            "Généré par": `Système SNRR — ${communeName}`,
          }}
          variant="default"
        />
        <button onClick={() => {
          const rows = indicateursData.map((r: any) => `
            <tr>
              <td>${r.indicateur}</td>
              <td style="text-align:right">${fmtShort(r.prevu)}</td>
              <td style="text-align:right;font-weight:bold">${fmtShort(r.realise)}</td>
              <td style="text-align:right;color:${r.realise >= r.prevu ? "#15803d" : "#b91c1c"}">${r.realise >= r.prevu ? "+" : ""}${fmtShort(r.realise - r.prevu)}</td>
              <td style="text-align:center;font-weight:bold">${r.taux}%</td>
            </tr>`).join("");
          printSection({
            title: "Rapport de Performance Fiscale",
            subtitle: `Période: ${period} · Zone: ${filtreCommune} · ${filtered.length} contribuables`,
            html: `<table>
              <thead><tr><th>Indicateur</th><th>Prévu (GNF)</th><th>Réalisé (GNF)</th><th>Écart (GNF)</th><th>Taux</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>`,
            landscape: true,
          });
        }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-border rounded-sm hover:bg-secondary transition-colors bg-card">
          <Printer size={12} /> Imprimer rapport
        </button>
      </div>

      {/* Advanced filters panel */}
      {showFilters && (
        <div className="bg-card border border-border rounded-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-foreground uppercase tracking-widest">Filtres avancés</span>
            <button onClick={resetFilters} className="text-xs font-mono text-[#CE1126] hover:underline flex items-center gap-1">
              <RefreshCw size={10} /> Réinitialiser
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Commune / SP</label>
              <select className="w-full px-2 py-1.5 text-xs bg-input-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                value={filtreCommune} onChange={e => handleCommuneFilter(e.target.value)}>
                {allCommunes.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">District</label>
              <select className="w-full px-2 py-1.5 text-xs bg-input-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                value={filtreDistrict} onChange={e => handleDistrictFilter(e.target.value)} disabled={filtreCommune === "Toutes"}>
                {allDistricts.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Secteur</label>
              <select className="w-full px-2 py-1.5 text-xs bg-input-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                value={filtreSecteur} onChange={e => setFiltreSecteur(e.target.value)} disabled={filtreDistrict === "Tous"}>
                {allSecteurs.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Agent recenseur</label>
              <select className="w-full px-2 py-1.5 text-xs bg-input-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                value={filtreAgent} onChange={e => setFiltreAgent(e.target.value)}>
                {AGENTS_RECENSEURS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Type de bien</label>
              <select className="w-full px-2 py-1.5 text-xs bg-input-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                value={filtreType} onChange={e => setFiltreType(e.target.value)}>
                {["Tous", "Résidentiel", "Commercial", "Industriel", "Administratif", "Mixte"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Statut fiscal</label>
              <select className="w-full px-2 py-1.5 text-xs bg-input-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
                {["Tous", "Payé", "En attente", "Arriéré"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Date début</label>
              <input type="date" className="w-full px-2 py-1.5 text-xs bg-input-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                value={filtreDateDeb} onChange={e => setFiltreDateDeb(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Date fin</label>
              <input type="date" className="w-full px-2 py-1.5 text-xs bg-input-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                value={filtreDateFin} onChange={e => setFiltreDateFin(e.target.value)} />
            </div>
          </div>
          {/* Results KPIs */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border">
            {[
              { label: "Résultats", value: filtered.length.toString(), color: "#1B3A6B" },
              { label: "Taux recouvrement", value: `${tauxRecouvrement}%`, color: tauxRecouvrement >= 70 ? "#009460" : tauxRecouvrement >= 55 ? "#B8860B" : "#CE1126" },
              { label: "Valeur totale", value: fmtShort(totalVal), color: "#B8860B" },
              { label: "Payés", value: payeCount.toString(), color: "#009460" },
            ].map(k => (
              <div key={k.label} className="text-center">
                <div className="text-[10px] font-mono text-muted-foreground mb-0.5">{k.label}</div>
                <div className="text-lg font-bold" style={{ color: k.color, fontFamily: "'Crimson Pro', serif" }}>{k.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-sm p-5">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-6">
            {filtreCommune !== "Toutes" ? `Districts — ${spStats[filtreCommune]?.label}` : "Taux de recouvrement par commune"}
          </h3>
          <SvgHBar data={byCommune.slice(0, 8)} height={220} />
        </div>

        <div className="bg-card border border-border rounded-sm p-5">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-6">CFU vs. Patentes — 2024</h3>
          <SvgLineChart
            data={recettesSlice}
            series={[
              { key: "cfu", color: "#1B3A6B", label: "CFU" },
              { key: "patentes", color: "#B8860B", label: "Patentes" },
            ]}
            height={220}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Indicateurs de performance — Juin 2024</h3>
          <div className="flex items-center gap-2">
            <ExportButton
              data={indicateursData}
              columns={indicateursColumns}
              filename="indicateurs-performance-juin-2024"
              title="Indicateurs de Performance Détaillés"
              subtitle="Juin 2024 - Commune de Mamou"
              variant="compact"
            />
            <button onClick={() => {
              const rows = [
                { ind: "CFU", prev: 24000000, real: 21300000, taux: 89 },
                { ind: "Patentes & Licences", prev: 16000000, real: 14200000, taux: 89 },
                { ind: "Taxes de marché", prev: 6000000, real: 5300000, taux: 88 },
                { ind: "Domaine public", prev: 4000000, real: 3100000, taux: 78 },
                { ind: "Total", prev: 50000000, real: 43900000, taux: 88 },
              ].map(r => `<tr class="${r.ind === "Total" ? "total-row" : ""}"><td>${r.ind}</td><td style="text-align:right">${fmtShort(r.prev)}</td><td style="text-align:right;font-weight:bold">${fmtShort(r.real)}</td><td style="text-align:right;color:${r.real >= r.prev ? "#15803d" : "#b91c1c"}">${fmtShort(r.real - r.prev)}</td><td style="text-align:center">${r.taux}%</td></tr>`).join("");
              printSection({
                title: "Indicateurs de Performance — Juin 2024",
                subtitle: `${communeName} · Système SNRR`,
                html: `<table><thead><tr><th>Indicateur</th><th>Prévu</th><th>Réalisé</th><th>Écart</th><th>Taux</th></tr></thead><tbody>${rows}</tbody></table>`,
              });
            }} className="flex items-center gap-1 text-xs font-mono border border-border px-2 py-1 rounded-sm hover:bg-secondary transition-colors">
              <Printer size={10} /> Imprimer
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Indicateur", "Prévu", "Réalisé", "Écart", "Taux"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { ind: "CFU", prev: 24000000, real: 21300000, taux: 89 },
                { ind: "Patentes & Licences", prev: 16000000, real: 14200000, taux: 89 },
                { ind: "Taxes de marché", prev: 6000000, real: 5300000, taux: 88 },
                { ind: "Domaine public", prev: 4000000, real: 3100000, taux: 78 },
                { ind: "Total", prev: 50000000, real: 43900000, taux: 88 },
              ].map((r, i) => (
                <tr key={r.ind} className={`border-b border-border/50 ${i % 2 === 0 ? "" : "bg-background/30"} ${r.ind === "Total" ? "font-bold bg-secondary/40" : ""}`}>
                  <td className="px-5 py-3 text-sm font-medium">{r.ind}</td>
                  <td className="px-5 py-3 font-mono text-xs">{fmtShort(r.prev)}</td>
                  <td className="px-5 py-3 font-mono text-xs text-primary">{fmtShort(r.real)}</td>
                  <td className="px-5 py-3 font-mono text-xs text-red-600">{fmtShort(r.real - r.prev)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${r.taux}%` }} />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{r.taux}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Utilisateurs (Fleetio-style) ────────────────────────────────────────────
const ROLE_META: Record<string, { color: string; bg: string; icon: string; desc: string }> = {
  "Administrateur":      { color: "#1B3A6B", bg: "#EEF2F8", icon: "A", desc: "Accès complet à tous les modules" },
  "Maire":               { color: "#7C3AED", bg: "#F5F0FF", icon: "M", desc: "Vue générale, validation, rapports" },
  "Receveur municipal":  { color: "#065F46", bg: "#ECFDF5", icon: "R", desc: "Paiements, taxation, recouvrement" },
  "Superviseur":         { color: "#B45309", bg: "#FFFBEB", icon: "S", desc: "Supervision agents, rapports" },
  "Agent recenseur":     { color: "#0369A1", bg: "#EFF6FF", icon: "AR", desc: "Recensement, cartographie" },
  "Agent recouvrement":  { color: "#9D174D", bg: "#FFF1F2", icon: "AC", desc: "Collecte paiements, terrain" },
};

// ─── Reset Password Modal ────────────────────────────────────────────────────
function ResetPasswordModal({ user, onClose, onReset }: {
  user: Utilisateur;
  onClose: () => void;
  onReset: (userId: string, newPassword: string) => void;
}) {
  const generated = () => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!";
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };
  const [password, setPassword] = useState(generated);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(password).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const handleConfirm = () => {
    onReset(user.id, password);
    setDone(true);
  };

  const meta = ROLE_META[user.role] ?? { color: "#1B3A6B", bg: "#EEF2F8" };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-sm w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold">Réinitialiser le mot de passe</h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{user.prenom} {user.nom}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-sm text-muted-foreground transition-colors"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-5">
          {done ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 size={26} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Mot de passe réinitialisé !</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">L'utilisateur devra changer son mot de passe à la prochaine connexion.</p>
              </div>
              <button onClick={onClose} className="px-5 py-2 text-xs font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity">Fermer</button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 rounded-sm" style={{ background: meta.bg }}>
                <div className="w-10 h-10 rounded-sm flex items-center justify-center text-sm font-bold text-white font-mono" style={{ background: meta.color }}>
                  {user.prenom[0]}{user.nom[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{user.prenom} {user.nom}</p>
                  <p className="text-xs font-mono text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Nouveau mot de passe généré</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-3 text-sm font-mono bg-background border border-border rounded-sm tracking-widest text-foreground select-all">
                    {password}
                  </code>
                  <button onClick={handleCopy}
                    className={`px-3 py-3 text-xs font-mono rounded-sm border transition-all whitespace-nowrap ${copied ? "border-emerald-300 text-emerald-700 bg-emerald-50" : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"}`}>
                    {copied ? <CheckCircle2 size={14} /> : <Save size={14} />}
                  </button>
                  <button onClick={() => setPassword(generated())}
                    className="px-3 py-3 text-xs font-mono rounded-sm border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-all">
                    <RefreshCw size={14} />
                  </button>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground mt-1.5">Copiez ce mot de passe avant de confirmer — il ne sera plus affiché.</p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm">
                <p className="text-[11px] font-mono text-amber-700 flex items-center gap-2">
                  <AlertTriangle size={12} className="shrink-0" />
                  L'utilisateur sera déconnecté et devra utiliser ce mot de passe temporaire.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors text-muted-foreground">Annuler</button>
                <button onClick={handleConfirm} className="flex-1 py-2.5 text-sm font-mono bg-amber-600 text-white rounded-sm hover:opacity-90 transition-opacity">
                  Confirmer la réinitialisation
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Configure Access Modal ───────────────────────────────────────────────────
const ALL_PERMISSIONS: { key: string; label: string; module: string }[] = [
  { key: "view_dashboard", label: "Voir le tableau de bord", module: "Dashboard" },
  { key: "view_recensement", label: "Voir le recensement", module: "Recensement" },
  { key: "create_recensement", label: "Créer des contribuables", module: "Recensement" },
  { key: "edit_recensement", label: "Modifier des contribuables", module: "Recensement" },
  { key: "delete_recensement", label: "Supprimer des contribuables", module: "Recensement" },
  { key: "view_taxation", label: "Voir la taxation", module: "Taxation" },
  { key: "create_taxation", label: "Créer des taxes", module: "Taxation" },
  { key: "edit_taxation", label: "Modifier des taxes", module: "Taxation" },
  { key: "delete_taxation", label: "Supprimer des taxes", module: "Taxation" },
  { key: "view_paiements", label: "Voir les paiements", module: "Paiements" },
  { key: "create_paiements", label: "Enregistrer un paiement", module: "Paiements" },
  { key: "validate_paiements", label: "Valider un paiement", module: "Paiements" },
  { key: "cancel_paiements", label: "Annuler un paiement", module: "Paiements" },
  { key: "view_cartographie", label: "Voir la cartographie", module: "Cartographie" },
  { key: "view_rapports", label: "Voir les rapports", module: "Rapports" },
  { key: "export_rapports", label: "Exporter les données", module: "Rapports" },
  { key: "view_business_intelligence", label: "Voir le Business Intelligence", module: "Rapports" },
  { key: "view_exercice_fiscal", label: "Voir l'exercice fiscal", module: "Rapports" },
  { key: "edit_exercice_fiscal", label: "Modifier l'exercice fiscal", module: "Rapports" },
  { key: "view_utilisateurs", label: "Voir les utilisateurs", module: "Administration" },
  { key: "create_utilisateurs", label: "Créer des comptes", module: "Administration" },
  { key: "edit_utilisateurs", label: "Modifier des comptes", module: "Administration" },
  { key: "delete_utilisateurs", label: "Supprimer des comptes", module: "Administration" },
  { key: "view_securite", label: "Voir les logs de sécurité", module: "Administration" },
  { key: "manage_securite", label: "Gérer la sécurité", module: "Administration" },
  { key: "view_parametres", label: "Voir les paramètres", module: "Administration" },
  { key: "edit_parametres", label: "Modifier les paramètres", module: "Administration" },
  { key: "view_notifications", label: "Voir les notifications", module: "Notifications" },
  { key: "send_notifications", label: "Envoyer des notifications", module: "Notifications" },
];

function ConfigureAccessModal({ user, onClose, onSave }: {
  user: Utilisateur;
  onClose: () => void;
  onSave: (userId: string, permissions: string[]) => void;
}) {
  const roleDefaults = ROLE_PERMISSIONS[user.role as Role] ?? [];
  const [overrides, setOverrides] = useState<string[]>(user.permissions ?? roleDefaults);

  const modules = Array.from(new Set(ALL_PERMISSIONS.map(p => p.module)));

  const toggle = (key: string) => {
    setOverrides(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const resetToRole = () => setOverrides(roleDefaults);
  const grantAll = () => setOverrides(ALL_PERMISSIONS.map(p => p.key));
  const revokeAll = () => setOverrides([]);

  const meta = ROLE_META[user.role] ?? { color: "#1B3A6B", bg: "#EEF2F8", desc: "" };
  const changed = JSON.stringify([...overrides].sort()) !== JSON.stringify([...roleDefaults].sort());

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-sm w-full max-w-xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-sm font-semibold">Configurer les accès</h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{user.prenom} {user.nom} · <span style={{ color: meta.color }}>{user.role}</span></p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-sm text-muted-foreground transition-colors"><X size={15} /></button>
        </div>

        <div className="px-6 py-3 border-b border-border bg-secondary/30 shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border ${changed ? "border-amber-300 text-amber-700 bg-amber-50" : "border-border text-muted-foreground"}`}>
              {changed ? "Permissions personnalisées" : "Permissions par rôle"}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">{overrides.length}/{ALL_PERMISSIONS.length} actives</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={resetToRole} className="px-2 py-1 text-[10px] font-mono border border-border rounded-sm hover:bg-secondary text-muted-foreground transition-colors">Réinitialiser au rôle</button>
            <button onClick={grantAll} className="px-2 py-1 text-[10px] font-mono border border-emerald-300 rounded-sm hover:bg-emerald-50 text-emerald-700 transition-colors">Tout activer</button>
            <button onClick={revokeAll} className="px-2 py-1 text-[10px] font-mono border border-red-200 rounded-sm hover:bg-red-50 text-destructive transition-colors">Tout révoquer</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {modules.map(mod => {
            const perms = ALL_PERMISSIONS.filter(p => p.module === mod);
            const activeCount = perms.filter(p => overrides.includes(p.key)).length;
            return (
              <div key={mod}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{mod}</p>
                  <span className="text-[9px] font-mono text-muted-foreground">{activeCount}/{perms.length}</span>
                </div>
                <div className="space-y-1">
                  {perms.map(p => {
                    const isActive = overrides.includes(p.key);
                    const isDefault = roleDefaults.includes(p.key);
                    return (
                      <label key={p.key} className={`flex items-center gap-3 px-3 py-2 rounded-sm cursor-pointer transition-colors ${isActive ? "bg-primary/5 border border-primary/15" : "bg-background border border-border/50 hover:border-border"}`}>
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${isActive ? "bg-primary border-primary" : "border-border"}`}
                          onClick={() => toggle(p.key)}>
                          {isActive && <CheckCircle2 size={10} className="text-white" />}
                        </div>
                        <span className="text-xs font-mono flex-1" onClick={() => toggle(p.key)}>{p.label}</span>
                        {!isDefault && isActive && <span className="text-[9px] font-mono text-emerald-600 px-1.5 py-0.5 bg-emerald-50 rounded-sm border border-emerald-200">+</span>}
                        {isDefault && !isActive && <span className="text-[9px] font-mono text-amber-600 px-1.5 py-0.5 bg-amber-50 rounded-sm border border-amber-200">retiré</span>}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors text-muted-foreground">Annuler</button>
          <button onClick={() => { onSave(user.id, overrides); onClose(); }}
            className="flex-1 py-2.5 text-sm font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity">
            Enregistrer les accès
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── User Detail Modal ────────────────────────────────────────────────────────
function UserDetailModal({ user, onClose, onEdit, onResetPassword, onToggleStatut, onDelete }: {
  user: Utilisateur;
  onClose: () => void;
  onEdit: () => void;
  onResetPassword: () => void;
  onToggleStatut: () => void;
  onDelete: () => void;
}) {
  const meta = ROLE_META[user.role] ?? { color: "#1B3A6B", bg: "#EEF2F8", icon: user.nom[0], desc: "" };
  const rolePerms = ROLE_PERMISSIONS[user.role as Role] ?? [];
  const effectivePerms = user.permissions ?? rolePerms;
  const hasOverrides = user.permissions !== undefined;

  const modules = Array.from(new Set(ALL_PERMISSIONS.map(p => p.module)));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-sm w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-sm font-semibold">Fiche utilisateur</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-sm text-muted-foreground transition-colors"><X size={15} /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Profile header */}
          <div className="px-6 py-5 border-b border-border" style={{ background: meta.bg }}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-sm flex items-center justify-center text-xl font-bold text-white font-mono shrink-0" style={{ background: meta.color }}>
                {user.prenom[0]}{user.nom[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold">{user.prenom} {user.nom}</h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border ${user.statut === "Actif" ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-amber-200 text-amber-700 bg-amber-50"}`}>{user.statut}</span>
                  {user.motDePasseReset && <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm border border-amber-300 text-amber-700 bg-amber-50">MDP temporaire</span>}
                </div>
                {user.identifiant && <p className="text-xs font-mono mt-0.5" style={{ color: meta.color }}>@{user.identifiant}</p>}
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                  <span className="text-xs font-mono font-semibold" style={{ color: meta.color }}>{user.role}</span>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{meta.desc}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Contact info */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Mail size={12} />, label: "Email", value: user.email },
                { icon: <Phone size={12} />, label: "Téléphone", value: user.telephone || "—" },
                { icon: <Clock size={12} />, label: "Dernière connexion", value: user.derniere },
                { icon: <Users size={12} />, label: "Membre depuis", value: user.dateCreation },
              ].map(item => (
                <div key={item.label} className="p-3 bg-background border border-border rounded-sm">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1 mb-1">
                    {item.icon} {item.label}
                  </p>
                  <p className="text-xs font-mono text-foreground truncate">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Permissions summary */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Permissions</p>
                {hasOverrides && <span className="text-[9px] font-mono text-amber-600 px-1.5 py-0.5 bg-amber-50 border border-amber-200 rounded-sm">Personnalisées</span>}
              </div>
              <div className="space-y-2">
                {modules.map(mod => {
                  const perms = ALL_PERMISSIONS.filter(p => p.module === mod);
                  const activePerms = perms.filter(p => effectivePerms.includes(p.key));
                  if (activePerms.length === 0) return null;
                  return (
                    <div key={mod} className="flex items-start gap-3 p-2.5 bg-background border border-border rounded-sm">
                      <p className="text-[10px] font-mono text-muted-foreground w-24 shrink-0 mt-0.5">{mod}</p>
                      <div className="flex flex-wrap gap-1">
                        {activePerms.map(p => (
                          <span key={p.key} className="text-[9px] font-mono px-1.5 py-0.5 bg-primary/8 text-primary border border-primary/20 rounded-sm">{p.label}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Actions footer */}
        <div className="px-6 py-4 border-t border-border shrink-0">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button onClick={onEdit} className="flex items-center justify-center gap-2 py-2 text-xs font-mono border border-primary/40 text-primary rounded-sm hover:bg-primary/6 transition-colors">
              <Edit2 size={12} /> Modifier
            </button>
            <button onClick={onResetPassword} className="flex items-center justify-center gap-2 py-2 text-xs font-mono border border-amber-300 text-amber-700 rounded-sm hover:bg-amber-50 transition-colors">
              <Lock size={12} /> Réinitialiser MDP
            </button>
            <button onClick={onToggleStatut} className={`flex items-center justify-center gap-2 py-2 text-xs font-mono border rounded-sm transition-colors ${user.statut === "Actif" ? "border-orange-300 text-orange-700 hover:bg-orange-50" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}`}>
              <UserCheck size={12} /> {user.statut === "Actif" ? "Suspendre" : "Réactiver"}
            </button>
            <button onClick={onDelete} className="flex items-center justify-center gap-2 py-2 text-xs font-mono border border-red-200 text-destructive rounded-sm hover:bg-red-50 transition-colors">
              <Trash2 size={12} /> Supprimer
            </button>
          </div>
          <button onClick={onClose} className="w-full py-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">Fermer</button>
        </div>
      </div>
    </div>
  );
}

function InviteModal({ onClose, onInvite }: { onClose: () => void; onInvite: (email: string, role: string) => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Agent recenseur");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !nom) return;
    setLoading(true);
    setTimeout(() => { setSent(true); setLoading(false); onInvite(email, role); }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-sm w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold">Inviter un membre</h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">Un lien d'activation sera envoyé par email</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-sm text-muted-foreground transition-colors"><X size={15} /></button>
        </div>
        <div className="p-6">
          {sent ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 size={26} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Invitation envoyée !</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">{email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Rôle attribué : <span className="font-medium" style={{ color: ROLE_META[role]?.color }}>{role}</span></p>
              </div>
              <button onClick={onClose} className="mt-2 px-5 py-2 text-xs font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity">Fermer</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Prénom *</label>
                  <input className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Amadou" autoFocus />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Nom *</label>
                  <input className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    value={nom} onChange={e => setNom(e.target.value)} placeholder="Diallo" required />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Email *</label>
                <input type="email" required className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  value={email} onChange={e => setEmail(e.target.value)} placeholder="agent@commune.gn" />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Rôle</label>
                <select className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                  value={role} onChange={e => setRole(e.target.value)}>
                  {Object.keys(ROLE_META).map(r => <option key={r}>{r}</option>)}
                </select>
                {ROLE_META[role] && (
                  <p className="text-[10px] font-mono text-muted-foreground mt-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: ROLE_META[role].color }} />
                    {ROLE_META[role].desc}
                  </p>
                )}
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 text-sm font-mono font-semibold bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi…</> : <>Envoyer l'invitation</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Utilisateurs({
  utilisateurs,
  onAdd, onEdit, onDelete, onView, onResetPassword, onConfigureAccess, onToggleStatut,
  canCreate, canEdit, canDelete,
}: {
  utilisateurs: Utilisateur[];
  onAdd: () => void;
  onEdit: (u: Utilisateur) => void;
  onDelete: (u: Utilisateur) => void;
  onView: (u: Utilisateur) => void;
  onResetPassword: (u: Utilisateur) => void;
  onConfigureAccess: (u: Utilisateur) => void;
  onToggleStatut: (u: Utilisateur) => void;
  canCreate?: boolean; canEdit?: boolean; canDelete?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tous");
  const [statutFilter, setStatutFilter] = useState("Tous");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showInvite, setShowInvite] = useState(false);
  const [invited, setInvited] = useState<{ email: string; role: string; nom: string }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const roles = ["Tous", ...Array.from(new Set(utilisateurs.map(u => u.role)))];

  const filtered = utilisateurs.filter(u => {
    const q = search.toLowerCase();
    const matchQ = `${u.nom} ${u.prenom} ${u.email} ${u.role} ${u.identifiant ?? ""}`.toLowerCase().includes(q);
    const matchR = roleFilter === "Tous" || u.role === roleFilter;
    const matchS = statutFilter === "Tous" || u.statut === statutFilter;
    return matchQ && matchR && matchS;
  });

  const actifs = utilisateurs.filter(u => u.statut === "Actif").length;
  const inactifs = utilisateurs.filter(u => u.statut === "Inactif").length;

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const selectAll = () => setSelected(new Set(filtered.map(u => u.id)));
  const clearSelected = () => setSelected(new Set());

  const handleInvite = (email: string, role: string) => {
    const nom = email.split("@")[0].split(".").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
    setInvited(prev => [...prev, { email, role, nom }]);
  };

  const utilisateursColumns: ExportColumn[] = [
    { header: "Nom", key: "nom", width: 30 }, { header: "Prénom", key: "prenom", width: 30 },
    { header: "Email", key: "email", width: 40 }, { header: "Rôle", key: "role", width: 30 },
    { header: "Téléphone", key: "telephone", width: 25 }, { header: "Statut", key: "statut", width: 20 },
    { header: "Date création", key: "dateCreation", width: 25 },
  ];

  return (
    <div className="space-y-5">
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onInvite={handleInvite} />}

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Membres", value: utilisateurs.length, color: "text-primary", sub: "total comptes", onClick: () => setStatutFilter("Tous") },
          { label: "Actifs", value: actifs, color: "text-emerald-700", sub: "accès actif", onClick: () => setStatutFilter("Actif") },
          { label: "Inactifs", value: inactifs, color: "text-amber-700", sub: "accès suspendu", onClick: () => setStatutFilter("Inactif") },
          { label: "En attente", value: invited.length, color: "text-violet-700", sub: "invitation envoyée", onClick: () => {} },
        ].map(s => (
          <button key={s.label} onClick={s.onClick} className="bg-card border border-border rounded-sm px-4 py-3 text-left hover:border-primary/30 transition-colors">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{s.sub}</p>
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/8 border border-primary/20 rounded-sm">
          <span className="text-xs font-mono text-primary font-semibold">{selected.size} sélectionné{selected.size > 1 ? "s" : ""}</span>
          <div className="flex items-center gap-1.5 ml-2">
            <button onClick={() => { filtered.filter(u => selected.has(u.id)).forEach(u => onToggleStatut(u)); clearSelected(); }}
              className="px-2.5 py-1 text-[10px] font-mono border border-amber-300 text-amber-700 rounded-sm hover:bg-amber-50 transition-colors">
              Basculer statut
            </button>
            {canDelete !== false && (
              <button onClick={() => { filtered.filter(u => selected.has(u.id)).forEach(u => onDelete(u)); clearSelected(); }}
                className="px-2.5 py-1 text-[10px] font-mono border border-red-200 text-destructive rounded-sm hover:bg-red-50 transition-colors">
                Supprimer la sélection
              </button>
            )}
          </div>
          <button onClick={clearSelected} className="ml-auto text-muted-foreground hover:text-foreground transition-colors"><X size={13} /></button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <div className="relative max-w-xs flex-1 min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Nom, email, identifiant…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-4 py-2 text-xs bg-card border border-border rounded-sm font-mono w-full focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {roles.map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 text-[10px] font-mono rounded-sm border transition-all ${roleFilter === r ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                {r}
              </button>
            ))}
            {statutFilter !== "Tous" && (
              <button onClick={() => setStatutFilter("Tous")}
                className="px-2.5 py-1 text-[10px] font-mono rounded-sm border border-amber-300 bg-amber-50 text-amber-700 flex items-center gap-1">
                {statutFilter} <X size={9} />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-sm overflow-hidden">
            <button onClick={() => setViewMode("grid")} className={`p-1.5 transition-colors ${viewMode === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"}`} title="Vue cartes">
              <LayoutDashboard size={13} />
            </button>
            <button onClick={() => setViewMode("table")} className={`p-1.5 transition-colors ${viewMode === "table" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"}`} title="Vue table">
              <FileBarChart2 size={13} />
            </button>
          </div>
          <ExportButton data={filtered} columns={utilisateursColumns}
            filename={`membres-snrr-${new Date().toISOString().split('T')[0]}`}
            title="Registre des Membres" subtitle={`${filtered.length} comptes`}
            metadata={{ "Date d'export": new Date().toLocaleDateString('fr-FR') }}
            variant="compact" />
          {canCreate !== false && (<>
            <button onClick={() => setShowInvite(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-primary/40 text-primary rounded-sm hover:bg-primary/6 transition-colors whitespace-nowrap">
              <Mail size={12} /> Inviter
            </button>
            <button onClick={onAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity whitespace-nowrap">
              <Plus size={12} /> Créer un compte
            </button>
          </>)}
        </div>
      </div>

      {/* Pending invitations */}
      {invited.length > 0 && (
        <div className="bg-violet-50 border border-violet-200 rounded-sm px-4 py-3">
          <p className="text-xs font-mono font-semibold text-violet-700 mb-2">{invited.length} invitation(s) en attente</p>
          <div className="flex flex-wrap gap-2">
            {invited.map((inv, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-violet-200 rounded-sm text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-violet-800">{inv.email}</span>
                <span className="text-violet-400">·</span>
                <span className="text-muted-foreground">{inv.role}</span>
                <button onClick={() => setInvited(p => p.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive transition-colors"><X size={10} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── GRID VIEW ── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(u => {
            const meta = ROLE_META[u.role] ?? { color: "#1B3A6B", bg: "#EEF2F8", icon: u.nom[0], desc: "" };
            const isSelected = selected.has(u.id);
            return (
              <div key={u.id} className={`bg-card border rounded-sm p-5 flex flex-col gap-3 transition-all ${isSelected ? "border-primary/50 shadow-sm ring-1 ring-primary/20" : "border-border hover:border-primary/30 hover:shadow-sm"}`}>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative cursor-pointer" onClick={() => toggleSelect(u.id)}>
                      <div className="w-11 h-11 rounded-sm flex items-center justify-center text-sm font-bold text-white font-mono shrink-0"
                        style={{ background: meta.color }}>
                        {isSelected ? <CheckCircle2 size={18} className="text-white" /> : <>{u.prenom[0]}{u.nom[0]}</>}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">{u.prenom} {u.nom}</p>
                      {u.identifiant && <p className="text-[10px] font-mono text-primary/70">@{u.identifiant}</p>}
                      {u.motDePasseReset && <p className="text-[9px] font-mono text-amber-600 mt-0.5">MDP temporaire</p>}
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border cursor-pointer select-none transition-colors ${u.statut === "Actif" ? "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100" : "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"}`}
                    onClick={() => onToggleStatut(u)} title="Cliquer pour changer le statut">
                    {u.statut}
                  </span>
                </div>

                {/* Role pill */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-sm" style={{ background: meta.bg }}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono font-semibold" style={{ color: meta.color }}>{u.role}</p>
                    <p className="text-[9px] font-mono text-muted-foreground leading-tight truncate">{meta.desc}</p>
                  </div>
                  {u.permissions && <span className="text-[9px] font-mono text-amber-600 px-1 bg-amber-50 border border-amber-200 rounded-sm shrink-0">custom</span>}
                </div>

                {/* Contact */}
                <div className="space-y-1">
                  <p className="text-[11px] font-mono text-muted-foreground flex items-center gap-2 truncate">
                    <Mail size={10} className="shrink-0" /> {u.email}
                  </p>
                  {u.telephone && (
                    <p className="text-[11px] font-mono text-muted-foreground flex items-center gap-2">
                      <Phone size={10} className="shrink-0" /> {u.telephone}
                    </p>
                  )}
                  <p className="text-[9px] font-mono text-muted-foreground/60 flex items-center gap-1">
                    <Clock size={8} /> {u.derniere}
                  </p>
                </div>

                {/* Action buttons — always visible */}
                <div className="pt-2 border-t border-border/60 grid grid-cols-3 gap-1">
                  <button onClick={() => onView(u)} title="Voir le profil"
                    className="flex items-center justify-center gap-1 py-1.5 text-[10px] font-mono rounded-sm border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                    <Eye size={11} /> Profil
                  </button>
                  {canEdit !== false ? (
                    <button onClick={() => onEdit(u)} title="Modifier"
                      className="flex items-center justify-center gap-1 py-1.5 text-[10px] font-mono rounded-sm border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                      <Edit2 size={11} /> Modifier
                    </button>
                  ) : <div />}
                  <button onClick={() => onResetPassword(u)} title="Réinitialiser le mot de passe"
                    className="flex items-center justify-center gap-1 py-1.5 text-[10px] font-mono rounded-sm border border-border text-muted-foreground hover:border-amber-300 hover:text-amber-700 transition-colors">
                    <Lock size={11} /> MDP
                  </button>
                  <button onClick={() => onConfigureAccess(u)} title="Configurer les accès"
                    className="flex items-center justify-center gap-1 py-1.5 text-[10px] font-mono rounded-sm border border-border text-muted-foreground hover:border-violet-300 hover:text-violet-700 transition-colors">
                    <ShieldCheck size={11} /> Accès
                  </button>
                  <button onClick={() => onToggleStatut(u)} title={u.statut === "Actif" ? "Suspendre" : "Réactiver"}
                    className={`flex items-center justify-center gap-1 py-1.5 text-[10px] font-mono rounded-sm border transition-colors ${u.statut === "Actif" ? "border-orange-200 text-orange-700 hover:bg-orange-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}>
                    <UserCheck size={11} /> {u.statut === "Actif" ? "Suspendre" : "Réactiver"}
                  </button>
                  {canDelete !== false ? (
                    <button onClick={() => onDelete(u)} title="Supprimer"
                      className="flex items-center justify-center gap-1 py-1.5 text-[10px] font-mono rounded-sm border border-border text-muted-foreground hover:border-red-200 hover:text-destructive transition-colors">
                      <Trash2 size={11} /> Supprimer
                    </button>
                  ) : <div />}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-muted-foreground">
              <Users size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-mono">Aucun membre trouvé</p>
            </div>
          )}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {viewMode === "table" && (
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="px-3 py-3 w-8">
                    <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={e => e.target.checked ? selectAll() : clearSelected()}
                      className="w-3.5 h-3.5 rounded-sm accent-primary cursor-pointer" />
                  </th>
                  <th className="px-5 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Membre</th>
                  <th className="px-5 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Rôle</th>
                  <th className="px-5 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Contact</th>
                  <th className="px-5 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Dernière connexion</th>
                  <th className="px-5 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Statut</th>
                  <th className="px-5 py-3 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const meta = ROLE_META[u.role] ?? { color: "#1B3A6B", bg: "#EEF2F8", icon: u.nom[0], desc: "" };
                  const isSelected = selected.has(u.id);
                  return (
                    <tr key={u.id} className={`border-b border-border/50 transition-colors ${isSelected ? "bg-primary/5" : i % 2 === 0 ? "hover:bg-secondary/30" : "bg-background/20 hover:bg-secondary/30"}`}>
                      <td className="px-3 py-3">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(u.id)}
                          className="w-3.5 h-3.5 rounded-sm accent-primary cursor-pointer" />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold text-white font-mono shrink-0" style={{ background: meta.color }}>
                            {u.prenom[0]}{u.nom[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{u.prenom} {u.nom}</p>
                            <p className="text-[10px] font-mono text-muted-foreground">{u.identifiant ? `@${u.identifiant}` : u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] font-mono border px-2 py-0.5 rounded-sm flex items-center gap-1.5 w-fit" style={{ color: meta.color, borderColor: meta.color + "40", background: meta.bg }}>
                          {u.role}
                          {u.permissions && <span className="text-[8px] px-1 bg-amber-100 text-amber-700 rounded-sm">custom</span>}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{u.telephone || "—"}</td>
                      <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{u.derniere}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => onToggleStatut(u)}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border cursor-pointer transition-colors ${u.statut === "Actif" ? "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100" : "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"}`}>
                          {u.statut}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 justify-center">
                          <button onClick={() => onView(u)} title="Voir le profil" className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-sm transition-colors text-muted-foreground"><Eye size={12} /></button>
                          {canEdit !== false && <button onClick={() => onEdit(u)} title="Modifier" className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-sm transition-colors text-muted-foreground"><Edit2 size={12} /></button>}
                          <button onClick={() => onResetPassword(u)} title="Réinitialiser MDP" className="p-1.5 hover:bg-amber-50 hover:text-amber-700 rounded-sm transition-colors text-muted-foreground"><Lock size={12} /></button>
                          <button onClick={() => onConfigureAccess(u)} title="Configurer accès" className="p-1.5 hover:bg-violet-50 hover:text-violet-700 rounded-sm transition-colors text-muted-foreground"><ShieldCheck size={12} /></button>
                          {canDelete !== false && <button onClick={() => onDelete(u)} title="Supprimer" className="p-1.5 hover:bg-red-50 hover:text-destructive rounded-sm transition-colors text-muted-foreground"><Trash2 size={12} /></button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Permission matrix */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Matrice des droits d'accès par rôle</h3>
          <p className="text-[9px] font-mono text-muted-foreground">{Object.keys(ROLE_META).length} rôles · {utilisateurs.length} membres</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-muted-foreground font-mono text-[10px]">Module</th>
                {[["Admin","#1B3A6B"],["Maire","#7C3AED"],["Receveur","#065F46"],["Superviseur","#B45309"],["Agent rec.","#0369A1"],["Agent recouv.","#9D174D"]].map(([r,c]) => (
                  <th key={r} className="px-3 py-3 text-center text-[10px]" style={{ color: c }}>{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Tableau de bord", true, true, true, true, false, false],
                ["Recensement", true, false, true, true, true, false],
                ["Taxation", true, false, true, true, false, false],
                ["Paiements", true, false, true, true, false, true],
                ["Cartographie", true, true, true, true, true, false],
                ["Rapports & BI", true, true, true, true, false, false],
                ["Utilisateurs", true, false, false, false, false, false],
                ["Sécurité & Audit", true, false, false, false, false, false],
              ].map(([mod, ...perms]) => (
                <tr key={String(mod)} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-4 py-2.5 text-foreground font-medium text-[11px]">{mod}</td>
                  {(perms as boolean[]).map((p, j) => (
                    <td key={j} className="px-3 py-2.5 text-center">
                      {p ? <CheckCircle2 size={12} className="text-emerald-600 mx-auto" /> : <X size={11} className="text-muted-foreground/20 mx-auto" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Manual Payment (Administration) ─────────────────────────────────────────
function ManualPaymentAdmin({
  contribuables, paiements, onSave, communeName = "Mamou",
}: {
  contribuables: Contribuable[];
  paiements: Paiement[];
  onSave: (p: Paiement) => void;
  communeName?: string;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Contribuable | null>(null);
  const [form, setForm] = useState({
    montant: "", methode: "Espèces", operateur: "—", notes: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [success, setSuccess] = useState<Paiement | null>(null);
  const [filter, setFilter] = useState<"tous" | "impayé" | "arriéré">("tous");

  const methodes = ["Espèces", "Mobile Money", "Virement bancaire", "Chèque", "QR Code"];
  const operateursMap: Record<string, string[]> = {
    "Mobile Money": ["Orange Money", "MTN MoMo", "Cellcom"],
    "Espèces": ["—"],
    "Virement bancaire": ["BCRG", "Ecobank", "UBA", "BNI"],
    "Chèque": ["—"],
    "QR Code": ["Orange Money", "MTN MoMo"],
  };

  const filtered = contribuables.filter(c => {
    const q = search.toLowerCase();
    const match = `${c.nom} ${c.prenom} ${c.id} ${c.telephone} ${c.quartier}`.toLowerCase().includes(q);
    const matchFilter =
      filter === "tous" ? true :
      filter === "impayé" ? c.statut === "En attente" :
      filter === "arriéré" ? c.statut === "Arriéré" : true;
    return match && matchFilter;
  });

  const recentPaiements = [...paiements]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  const handleSubmit = () => {
    if (!selected || !form.montant) return;
    const year = new Date().getFullYear();
    const ref = `PAY-${year}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const recu = `REC-${ref.split("-").pop()}`;
    const newP: Paiement = {
      ref, contribuableId: selected.id,
      contribuable: `${selected.nom} ${selected.prenom}`,
      montant: Number(form.montant),
      methode: form.methode, operateur: form.operateur,
      date: `${form.date} ${new Date().toTimeString().slice(0, 5)}`,
      statut: "Validé", recu,
    };
    onSave(newP);
    setSuccess(newP);
    setSelected(null);
    setForm({ montant: "", methode: "Espèces", operateur: "—", notes: "", date: new Date().toISOString().slice(0, 10) });
  };

  const fmt = (n: number) => new Intl.NumberFormat("fr-GN").format(n) + " GNF";

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <div className="bg-card border border-emerald-200 rounded-sm p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-emerald-800">Paiement enregistré avec succès</h3>
            <p className="text-xs font-mono text-muted-foreground mt-1">{success.ref} · {success.recu}</p>
          </div>
          <div className="bg-background border border-border rounded-sm p-4 text-left space-y-2">
            {[
              ["Contribuable", success.contribuable],
              ["Montant", fmt(success.montant)],
              ["Méthode", `${success.methode} — ${success.operateur}`],
              ["Date", success.date],
              ["Référence", success.ref],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-semibold">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setSuccess(null)}
              className="flex-1 py-2.5 text-xs font-mono bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity">
              Nouveau paiement
            </button>
            <button onClick={() => window.print()}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-mono border border-border rounded-sm hover:bg-secondary transition-colors text-muted-foreground">
              <Printer size={13} /> Imprimer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      {/* Left: contribuable picker */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-semibold">Sélectionner un contribuable</h3>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{contribuables.length} contribuables enregistrés</p>
            </div>
            <div className="flex items-center gap-1.5">
              {(["tous", "impayé", "arriéré"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 text-[10px] font-mono rounded-sm border transition-all capitalize ${filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                  {f === "tous" ? "Tous" : f === "impayé" ? "En attente" : "Arriérés"}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            <div className="relative mb-3">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Nom, ID, téléphone, quartier…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 text-xs bg-background border border-border rounded-sm font-mono w-full focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
              {filtered.map(c => (
                <button key={c.id} onClick={() => { setSelected(c); setForm(f => ({ ...f, montant: String(c.valeur) })); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-sm border text-left transition-all ${selected?.id === c.id ? "border-primary/50 bg-primary/6 ring-1 ring-primary/20" : "border-border hover:border-primary/30 hover:bg-secondary/30"}`}>
                  <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary font-mono">{c.nom[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold truncate">{c.prenom} {c.nom}</p>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm border shrink-0 ${c.statut === "Payé" ? "border-emerald-200 text-emerald-700 bg-emerald-50" : c.statut === "Arriéré" ? "border-red-200 text-red-700 bg-red-50" : "border-amber-200 text-amber-700 bg-amber-50"}`}>
                        {c.statut}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">{c.id} · {c.quartier}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono font-semibold">{fmt(c.valeur)}</p>
                    <p className="text-[9px] font-mono text-muted-foreground">{c.type}</p>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  <Search size={24} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-mono">Aucun contribuable trouvé</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right: payment form + recent */}
      <div className="lg:col-span-2 space-y-4">
        {/* Payment form */}
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-secondary/30">
            <h3 className="text-xs font-semibold">Saisie du paiement</h3>
            {selected ? (
              <p className="text-[10px] font-mono text-primary mt-0.5">{selected.prenom} {selected.nom} · {selected.id}</p>
            ) : (
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Sélectionnez un contribuable</p>
            )}
          </div>
          <div className="p-5 space-y-4">
            {selected && (
              <div className="p-3 bg-primary/5 border border-primary/15 rounded-sm">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Montant dû</span>
                  <span className="font-semibold text-primary">{fmt(selected.valeur)}</span>
                </div>
                <div className="flex justify-between text-xs font-mono mt-1">
                  <span className="text-muted-foreground">Catégorie</span>
                  <span>{selected.categorie} · {selected.type}</span>
                </div>
              </div>
            )}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Montant (GNF) *</label>
              <input type="number" min="0" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))}
                placeholder="0"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Méthode de paiement</label>
              <select value={form.methode} onChange={e => setForm(f => ({ ...f, methode: e.target.value, operateur: (operateursMap[e.target.value] ?? ["—"])[0] }))}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary appearance-none">
                {methodes.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            {(operateursMap[form.methode] ?? []).length > 1 && (
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Opérateur</label>
                <select value={form.operateur} onChange={e => setForm(f => ({ ...f, operateur: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary appearance-none">
                  {(operateursMap[form.methode] ?? []).map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Date du paiement</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Notes internes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                placeholder="Observation, référence externe…"
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
            </div>
            <button onClick={handleSubmit} disabled={!selected || !form.montant}
              className="w-full py-3 text-sm font-mono font-semibold bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2">
              <Banknote size={15} /> Enregistrer le paiement
            </button>
          </div>
        </div>

        {/* Recent payments */}
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-secondary/30">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Paiements récents</h3>
          </div>
          <div className="divide-y divide-border/60">
            {recentPaiements.length === 0 && (
              <p className="text-xs font-mono text-muted-foreground text-center py-6">Aucun paiement enregistré</p>
            )}
            {recentPaiements.map(p => (
              <div key={p.ref} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{p.contribuable}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{p.ref} · {p.methode}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-mono font-semibold">{fmt(p.montant)}</p>
                  <p className="text-[9px] font-mono text-muted-foreground">{p.date.slice(0, 10)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sécurité ─────────────────────────────────────────────────────────────────
function Securite({ canManage = false, auditLogs, onClearLogs }: { canManage?: boolean; auditLogs?: AuditEntry[]; onClearLogs?: () => void }) {
  const logs = auditLogs ?? AUDIT_SEED;
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "info" | "warning" | "error">("all");

  const displayed = logs.filter(l => {
    if (typeFilter !== "all" && l.type !== typeFilter) return false;
    if (search && !`${l.action} ${l.user} ${l.ip}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // KPIs from real data
  const todayStr = new Date().toLocaleDateString("fr-FR");
  const connexionsToday = logs.filter(l => l.action.startsWith("Connexion réussie") && l.date.includes(todayStr)).length;
  const alertes = logs.filter(l => l.type === "warning").length;
  const erreurs = logs.filter(l => l.type === "error").length;

  const typeStyle: Record<string, string> = { info: "text-blue-600", warning: "text-amber-600", error: "text-red-600" };
  const typeBadge: Record<string, string> = { info: "bg-blue-50 text-blue-700 border border-blue-200", warning: "bg-amber-50 text-amber-700 border border-amber-200", error: "bg-red-50 text-red-700 border border-red-200" };
  const typeLabel: Record<string, string> = { info: "Info", warning: "Avertissement", error: "Erreur" };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Connexions aujourd'hui", value: String(connexionsToday || logs.filter(l => l.action.startsWith("Connexion")).length), icon: ShieldCheck, color: "text-primary" },
          { label: "Avertissements", value: String(alertes), icon: AlertTriangle, color: "text-amber-700" },
          { label: "Erreurs & accès refusés", value: String(erreurs), icon: Lock, color: "text-red-700" },
        ].map((k) => (
          <div key={k.label} className="bg-card border border-border rounded-sm p-4 flex items-center gap-4">
            <div className="p-2 bg-secondary rounded-sm">
              <k.icon size={16} className={k.color} />
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">{k.label}</p>
              <p className={`text-2xl font-light mt-0.5 ${k.color}`} style={{ fontFamily: "'Crimson Pro', serif" }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-secondary/30 flex-wrap gap-2">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Journal d'audit système</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
              className="px-2 py-1 text-xs border border-border rounded-sm bg-background font-mono w-40 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}
              className="px-2 py-1 text-xs border border-border rounded-sm bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="all">Tous types</option>
              <option value="info">Info</option>
              <option value="warning">Avertissement</option>
              <option value="error">Erreur</option>
            </select>
            <button onClick={() => { setSearch(""); setTypeFilter("all"); }}
              className="flex items-center gap-1 text-xs font-mono border border-border px-2 py-1 rounded-sm hover:bg-secondary transition-colors">
              <RefreshCw size={10} /> Rafraîchir
            </button>
            {canManage && (
              <button onClick={() => {
                const rows = displayed.map(l => `"${l.type}","${l.action}","${l.user}","${l.ip}","${l.date}"`).join("\n");
                const csv = `Type,Action,Utilisateur,IP,Date\n${rows}`;
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = `audit-snrr-${new Date().toISOString().slice(0,10)}.csv`; a.click();
                URL.revokeObjectURL(url);
              }} className="flex items-center gap-1 text-xs font-mono border border-border px-2 py-1 rounded-sm hover:bg-secondary transition-colors">
                <Download size={10} /> Exporter CSV
              </button>
            )}
            {canManage && onClearLogs && (
              <button onClick={onClearLogs}
                className="flex items-center gap-1 text-xs font-mono border border-red-200 text-red-600 px-2 py-1 rounded-sm hover:bg-red-50 transition-colors">
                <Trash2 size={10} /> Vider le journal
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                {["Type", "Action", "Utilisateur", "Adresse IP", "Date & Heure"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-mono uppercase tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-xs font-mono text-muted-foreground">Aucun événement trouvé</td></tr>
              )}
              {displayed.map((l, i) => (
                <tr key={l.id} className={`border-b border-border/50 hover:bg-secondary/20 ${i % 2 === 0 ? "" : "bg-background/20"}`}>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${typeBadge[l.type]}`}>{typeLabel[l.type]}</span>
                  </td>
                  <td className="px-5 py-3 text-sm font-medium">{l.action}</td>
                  <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{l.user}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.ip}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-2 border-t border-border bg-secondary/20 text-[10px] font-mono text-muted-foreground">
          {displayed.length} événement{displayed.length !== 1 ? "s" : ""} affiché{displayed.length !== 1 ? "s" : ""} · {logs.length} total
        </div>
      </div>
    </div>
  );
}

// ─── Exercice fiscal ──────────────────────────────────────────────────────────
const CATS_FISCAUX: { key: keyof ObjectifsFiscaux; label: string; color: string }[] = [
  { key: "cfu",      label: "CFU",      color: "#1B3A6B" },
  { key: "patentes", label: "Patentes", color: "#B8860B" },
  { key: "marches",  label: "Marchés",  color: "#2E6B3E" },
  { key: "autres",   label: "Autres",   color: "#4A6B8A" },
];

function ExerciceFiscal({
  store, annee: initAnnee, onSave,
}: {
  store: ExerciceStore;
  annee: string;
  onSave: (annee: string, store: ExerciceStore) => void;
}) {
  const ANNEES = ["2022","2023","2024","2025","2026"];

  const blankYear = () => ({
    mois: MOIS_LABELS.map((m, i) => ({ id:`m${i+1}`, mois:m, cfu:0, patentes:0, marches:0, autres:0 })),
    objectifs: { cfu:0, patentes:0, marches:0, autres:0 },
  });

  const [annee, setAnnee] = useState(initAnnee);
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState<ExerciceStore>(() => {
    const s: ExerciceStore = {};
    for (const y of ANNEES) s[y] = store[y] ?? blankYear();
    return s;
  });

  const cur = draft[annee];

  const setMois = (idx: number, cat: keyof ObjectifsFiscaux, raw: string) => {
    const val = Math.max(0, Number(raw.replace(/\s/g, "").replace(/[^0-9]/g, "")) || 0);
    setDraft(d => {
      const mois = d[annee].mois.map((m, i) => i === idx ? { ...m, [cat]: val } : m);
      return { ...d, [annee]: { ...d[annee], mois } };
    });
    setSaved(false);
  };

  const setObj = (cat: keyof ObjectifsFiscaux, raw: string) => {
    const val = Math.max(0, Number(raw.replace(/\s/g, "").replace(/[^0-9]/g, "")) || 0);
    setDraft(d => ({ ...d, [annee]: { ...d[annee], objectifs: { ...d[annee].objectifs, [cat]: val } } }));
    setSaved(false);
  };

  const handleSave = () => { onSave(annee, draft); setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const totMois = (idx: number) => { const m = cur.mois[idx]; return m.cfu+m.patentes+m.marches+m.autres; };
  const totCat  = (cat: keyof ObjectifsFiscaux) => cur.mois.reduce((s,m) => s+m[cat], 0);
  const grand   = CATS_FISCAUX.reduce((s,c) => s+totCat(c.key), 0);
  const totalObj = CATS_FISCAUX.reduce((s,c) => s+cur.objectifs[c.key], 0);
  const pct = (a: number, b: number) => b > 0 ? Math.min(100, Math.round(a/b*100)) : 0;

  const fmt = (n: number) => n === 0 ? "" : n.toLocaleString("fr-FR");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Exercice fiscal — Saisie des données</h2>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">
            Entrez les recettes collectées mois par mois et définissez les objectifs budgétaires.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={annee}
            onChange={e => { setAnnee(e.target.value); setSaved(false); }}
            className="px-3 py-2 text-sm bg-input-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {ANNEES.map(y => <option key={y}>{y}</option>)}
          </select>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-mono rounded-sm transition-colors ${saved ? "bg-emerald-600 text-white" : "bg-primary text-white hover:bg-primary/90"}`}
          >
            <Save size={13} />{saved ? "Enregistré ✓" : "Enregistrer"}
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CATS_FISCAUX.map(c => {
          const real = totCat(c.key);
          const obj  = cur.objectifs[c.key];
          const p    = pct(real, obj);
          return (
            <div key={c.key} className="bg-card border border-border rounded-sm p-4 space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{c.label}</p>
              <p className="text-sm font-bold" style={{ color: c.color }}>{fmtShort(real)}</p>
              {obj > 0 && (
                <>
                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width:`${p}%`, background:c.color }} />
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground">{p}% · obj. {fmtShort(obj)}</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Objectifs */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-secondary/30">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Objectifs budgétaires {annee} (GNF)</h3>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATS_FISCAUX.map(c => (
            <div key={c.key}>
              <label className="block text-xs font-mono uppercase tracking-widest mb-1.5" style={{ color: c.color }}>{c.label}</label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full px-3 py-2 text-sm bg-input-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                value={fmt(cur.objectifs[c.key])}
                onChange={e => setObj(c.key, e.target.value)}
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Monthly table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Recettes mensuelles {annee}</h3>
          <span className="text-[10px] font-mono text-muted-foreground">
            Total : <strong className="text-foreground">{fmtShort(grand)}</strong>
            {totalObj > 0 && <> · Obj. {fmtShort(totalObj)} · {pct(grand,totalObj)}%</>}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-secondary/20">
                <th className="text-left px-4 py-2.5 text-muted-foreground font-normal text-[10px] uppercase tracking-wider">Mois</th>
                {CATS_FISCAUX.map(c => (
                  <th key={c.key} className="px-3 py-2.5 text-right text-[10px] uppercase tracking-wider font-normal" style={{ color:c.color }}>{c.label}</th>
                ))}
                <th className="px-4 py-2.5 text-right text-muted-foreground font-normal text-[10px] uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {cur.mois.map((m, idx) => (
                <tr key={m.id} className="border-b border-border/40 hover:bg-secondary/10 transition-colors group">
                  <td className="px-4 py-1.5 font-semibold text-foreground w-14">{m.mois}</td>
                  {CATS_FISCAUX.map(c => (
                    <td key={c.key} className="px-2 py-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-full text-right bg-transparent border border-transparent group-hover:border-border/50 focus:border-primary focus:bg-secondary/30 rounded-sm px-2 py-1 outline-none transition-all text-xs font-mono placeholder:text-muted-foreground/30"
                        value={fmt(m[c.key])}
                        onChange={e => setMois(idx, c.key, e.target.value)}
                        placeholder="0"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-1.5 text-right font-semibold text-foreground">
                    {totMois(idx) > 0 ? fmtShort(totMois(idx)) : <span className="text-muted-foreground/40">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-secondary/30">
                <td className="px-4 py-2.5 font-bold text-[10px] uppercase tracking-wider text-foreground">TOTAL</td>
                {CATS_FISCAUX.map(c => (
                  <td key={c.key} className="px-3 py-2.5 text-right font-bold" style={{ color:c.color }}>{fmtShort(totCat(c.key))}</td>
                ))}
                <td className="px-4 py-2.5 text-right font-bold text-foreground">{fmtShort(grand)}</td>
              </tr>
              {totalObj > 0 && (
                <tr className="border-t border-border/40">
                  <td className="px-4 py-2 text-[10px] text-muted-foreground uppercase tracking-wider">Objectif</td>
                  {CATS_FISCAUX.map(c => (
                    <td key={c.key} className="px-3 py-2 text-right text-[10px] text-muted-foreground">{fmtShort(cur.objectifs[c.key])}</td>
                  ))}
                  <td className="px-4 py-2 text-right text-[10px] text-muted-foreground">{fmtShort(totalObj)}</td>
                </tr>
              )}
              {totalObj > 0 && (
                <tr>
                  <td className="px-4 py-2 text-[10px] text-muted-foreground uppercase tracking-wider">Taux</td>
                  {CATS_FISCAUX.map(c => {
                    const p = pct(totCat(c.key), cur.objectifs[c.key]);
                    return (
                      <td key={c.key} className="px-3 py-2 text-right text-[10px] font-semibold"
                        style={{ color: p>=80?"#2E6B3E":p>=50?"#B8860B":"#8B1A1A" }}>
                        {p}%
                      </td>
                    );
                  })}
                  <td className="px-4 py-2 text-right text-[10px] font-semibold"
                    style={{ color: pct(grand,totalObj)>=80?"#2E6B3E":pct(grand,totalObj)>=50?"#B8860B":"#8B1A1A" }}>
                    {pct(grand,totalObj)}%
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </div>

      {/* Bar chart preview (only months with data) */}
      {grand > 0 && (
        <div className="bg-card border border-border rounded-sm p-5">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-4">
            Visualisation mensuelle {annee}
          </h3>
          <SvgStackedBar
            data={cur.mois.filter(m => m.cfu + m.patentes + m.marches + m.autres > 0)}
            series={CATS_FISCAUX}
            height={200}
          />
        </div>
      )}
    </div>
  );
}

// ─── Paramètres ───────────────────────────────────────────────────────────────
function Parametres({ canEdit = false, communeName = "Mamou", communeDomain = "mamou-commune.gn" }: { canEdit?: boolean; communeName?: string; communeDomain?: string }) {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    nomCommune: communeName,
    anneeFiscale: "2024",
    devise: "GNF",
    emailAdmin: `admin@${communeDomain}`,
    smsActif: true,
    emailActif: true,
    backupAuto: true,
    sessionTimeout: "30",
    twoFactor: false,
  });
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div className="space-y-6 max-w-2xl">
      {!canEdit && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-sm text-amber-800 text-xs font-mono">
          <Lock size={12} /> Mode lecture seule — votre rôle ne permet pas de modifier les paramètres système.
        </div>
      )}
      <div style={{ pointerEvents: canEdit ? "auto" : "none", opacity: canEdit ? 1 : 0.75 }} className="space-y-6">
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-secondary/30">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Paramètres généraux</h3>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Nom de la commune">
            <input className={inputCls} value={form.nomCommune} onChange={(e) => set("nomCommune", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Année fiscale">
              <select className={selectCls} value={form.anneeFiscale} onChange={(e) => set("anneeFiscale", e.target.value)}>
                {["2022", "2023", "2024", "2025"].map((y) => <option key={y}>{y}</option>)}
              </select>
            </Field>
            <Field label="Devise">
              <select className={selectCls} value={form.devise} onChange={(e) => set("devise", e.target.value)}>
                {["GNF", "USD", "EUR"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Email administrateur">
            <input type="email" className={inputCls} value={form.emailAdmin} onChange={(e) => set("emailAdmin", e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-secondary/30">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Notifications</h3>
        </div>
        <div className="p-5 space-y-3">
          {[
            { key: "smsActif", label: "Notifications SMS", desc: "Envoyer des SMS aux contribuables pour les avis et rappels" },
            { key: "emailActif", label: "Notifications email", desc: "Envoyer des emails de confirmation de paiement" },
            { key: "backupAuto", label: "Sauvegarde automatique", desc: "Sauvegarder les données automatiquement chaque nuit" },
          ].map((n) => (
            <div key={n.key} className="flex items-start justify-between gap-4 py-2 border-b border-border/50 last:border-0">
              <div>
                <p className="text-sm font-medium">{n.label}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{n.desc}</p>
              </div>
              <button
                onClick={() => set(n.key, !form[n.key as keyof typeof form])}
                className={`relative shrink-0 w-10 h-5 rounded-full transition-colors ${form[n.key as keyof typeof form] ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[n.key as keyof typeof form] ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-secondary/30">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Sécurité</h3>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Délai d'expiration de session (minutes)">
            <input type="number" className={inputCls} value={form.sessionTimeout} onChange={(e) => set("sessionTimeout", e.target.value)} min="5" max="120" />
          </Field>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Double authentification (2FA)</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">Exiger une vérification supplémentaire à la connexion</p>
            </div>
            <button onClick={() => set("twoFactor", !form.twoFactor)}
              className={`relative shrink-0 w-10 h-5 rounded-full transition-colors ${form.twoFactor ? "bg-primary" : "bg-muted"}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.twoFactor ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp API */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center gap-2">
          <MessageCircle size={13} className="text-emerald-600" />
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">WhatsApp Business API</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Numéro WhatsApp Business" hint="+224 626 00 11 10">
              <input className={inputCls} value={form.whatsappPhone ?? "+224 626 00 11 10"} onChange={e => set("whatsappPhone", e.target.value)} placeholder="+224 6XX XX XX XX" />
            </Field>
            <Field label="Token API WhatsApp">
              <input type="password" className={inputCls} value={form.whatsappToken ?? ""} onChange={e => set("whatsappToken", e.target.value)} placeholder="Bearer eyJ..." />
            </Field>
          </div>
          <Field label="ID du modèle de message (template)">
            <input className={inputCls} value={form.whatsappTemplate ?? "avis_imposition_mamou"} onChange={e => set("whatsappTemplate", e.target.value)} />
          </Field>
          <div className="flex items-start justify-between gap-4 pt-1">
            <div>
              <p className="text-sm font-medium">Envoi automatique d'avis par WhatsApp</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">Envoyer l'avis dès génération au numéro enregistré du contribuable</p>
            </div>
            <button onClick={() => set("whatsappAutoSend", !(form as any).whatsappAutoSend)}
              className={`relative shrink-0 w-10 h-5 rounded-full transition-colors ${(form as any).whatsappAutoSend ? "bg-emerald-600" : "bg-muted"}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${(form as any).whatsappAutoSend ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Gestion API REST */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center gap-2">
          <Zap size={13} className="text-[#B8860B]" />
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">API REST — Gestion des accès</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="URL de base de l'API">
              <input className={inputCls} value={form.apiBaseUrl ?? "https://api.snrr-mamou.gn/v1"} onChange={e => set("apiBaseUrl", e.target.value)} />
            </Field>
            <Field label="Clé API principale">
              <input type="password" className={inputCls} value={form.apiKey ?? ""} onChange={e => set("apiKey", e.target.value)} placeholder="snrr_live_..." />
            </Field>
          </div>
          <div className="overflow-hidden rounded-sm border border-border">
            <table className="w-full text-xs font-mono">
              <thead className="bg-secondary/50">
                <tr>
                  {["Endpoint", "Méthode", "Description", "Statut"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { endpoint: "/contribuables", method: "GET/POST", desc: "Gestion des contribuables", active: true },
                  { endpoint: "/paiements", method: "GET/POST", desc: "Enregistrer les paiements", active: true },
                  { endpoint: "/avis", method: "GET/POST", desc: "Génération des avis", active: true },
                  { endpoint: "/rapports", method: "GET", desc: "Export des rapports", active: false },
                  { endpoint: "/sync", method: "POST", desc: "Synchronisation hors-ligne", active: true },
                ].map(r => (
                  <tr key={r.endpoint} className="border-t border-border/50 hover:bg-secondary/20">
                    <td className="px-3 py-2 text-primary font-bold">{r.endpoint}</td>
                    <td className="px-3 py-2 text-amber-700">{r.method}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.desc}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold ${r.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {r.active ? "ACTIF" : "INACTIF"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-[#1B3A6B]/5 border border-[#1B3A6B]/20 rounded-sm">
            <p className="text-xs font-mono text-[#1B3A6B]">Documentation API : <span className="font-bold">GET /docs</span> — authentification Bearer Token requise pour tous les endpoints</p>
          </div>
        </div>
      </div>
      </div>{/* end read-only wrapper */}

      {canEdit ? (
        <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-2.5 text-sm font-mono rounded-sm transition-all ${saved ? "bg-emerald-600 text-white" : "bg-primary text-primary-foreground hover:opacity-90"}`}>
          {saved ? <><CheckCircle2 size={14} /> Enregistré !</> : <><Save size={14} /> Enregistrer les paramètres</>}
        </button>
      ) : (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-sm text-amber-800 text-xs font-mono">
          <Lock size={12} /> Consultation uniquement — vous n'avez pas les droits de modifier les paramètres.
        </div>
      )}
    </div>
  );
}

// ─── Centre de notifications ─────────────────────────────────────────────────
function NotificationsCenter({ 
  settings, 
  logs, 
  onUpdateSettings 
}: { 
  settings: NotificationSettings;
  logs: NotificationLog[];
  onUpdateSettings: (settings: NotificationSettings) => void;
}) {
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'logs'>('settings');
  const [localSettings, setLocalSettings] = useState(settings);
  
  const handleSave = () => {
    onUpdateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    setLocalSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateSetting = (key: keyof NotificationSettings, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const statsEnvoyes = logs.filter(l => l.statut === 'envoyé').length;
  const statsEchoues = logs.filter(l => l.statut === 'échoué').length;
  const statsEmail = logs.filter(l => l.type === 'email' && l.statut === 'envoyé').length;
  const statsWhatsapp = logs.filter(l => l.type === 'whatsapp' && l.statut === 'envoyé').length;

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-sm flex items-center justify-center">
              <CheckCircle2 size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Envoyés</p>
              <p className="text-2xl font-light" style={{ fontFamily: "'Crimson Pro', serif" }}>{statsEnvoyes}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-sm flex items-center justify-center">
              <Mail size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Emails</p>
              <p className="text-2xl font-light" style={{ fontFamily: "'Crimson Pro', serif" }}>{statsEmail}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-sm flex items-center justify-center">
              <MessageCircle size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">WhatsApp</p>
              <p className="text-2xl font-light" style={{ fontFamily: "'Crimson Pro', serif" }}>{statsWhatsapp}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-sm flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">Échoués</p>
              <p className="text-2xl font-light" style={{ fontFamily: "'Crimson Pro', serif" }}>{statsEchoues}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-sm font-mono transition-all border-b-2 ${
            activeTab === 'settings' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings size={14} />
            Paramètres
          </div>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-sm font-mono transition-all border-b-2 ${
            activeTab === 'logs' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText size={14} />
            Journal d'envois
          </div>
        </button>
      </div>

      {/* Contenu des tabs */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-2xl">
          {/* Activation des notifications */}
          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-secondary/30">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Activation des canaux</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-4 py-3 border-b border-border/50">
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Notifications Email</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      Envoi automatique des avis d'imposition par email
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting('emailEnabled')}
                  className={`relative shrink-0 w-10 h-5 rounded-full transition-colors ${
                    localSettings.emailEnabled ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      localSettings.emailEnabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-start justify-between gap-4 py-3 border-b border-border/50">
                <div className="flex items-start gap-3">
                  <MessageCircle size={18} className="text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Notifications WhatsApp</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      Envoi automatique des avis d'imposition par WhatsApp
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting('whatsappEnabled')}
                  className={`relative shrink-0 w-10 h-5 rounded-full transition-colors ${
                    localSettings.whatsappEnabled ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      localSettings.whatsappEnabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-start justify-between gap-4 py-3">
                <div className="flex items-start gap-3">
                  <Zap size={18} className="text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Envoi automatique d'avis</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      Envoyer automatiquement les avis après génération (Email + WhatsApp)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting('autoSendAvis')}
                  className={`relative shrink-0 w-10 h-5 rounded-full transition-colors ${
                    localSettings.autoSendAvis ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      localSettings.autoSendAvis ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Configuration Email */}
          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-secondary/30">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Configuration Email SMTP</h3>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Serveur SMTP">
                <input
                  type="text"
                  className={inputCls}
                  value={localSettings.emailSmtp || ''}
                  onChange={(e) => updateSetting('emailSmtp', e.target.value)}
                  placeholder="smtp.example.com"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Port SMTP">
                  <input
                    type="text"
                    className={inputCls}
                    value={localSettings.emailPort || ''}
                    onChange={(e) => updateSetting('emailPort', e.target.value)}
                    placeholder="587"
                  />
                </Field>
                <Field label="Utilisateur">
                  <input
                    type="text"
                    className={inputCls}
                    value={localSettings.emailUser || ''}
                    onChange={(e) => updateSetting('emailUser', e.target.value)}
                    placeholder="notifications@mamou-commune.gn"
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Configuration WhatsApp */}
          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-secondary/30">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Configuration WhatsApp API</h3>
            </div>
            <div className="p-5 space-y-4">
              <Field label="URL API WhatsApp Business">
                <input
                  type="text"
                  className={inputCls}
                  value={localSettings.whatsappApi || ''}
                  onChange={(e) => updateSetting('whatsappApi', e.target.value)}
                  placeholder="https://api.whatsapp.com/send"
                />
              </Field>
              <div className="bg-blue-50 border border-blue-200 rounded-sm p-3 flex gap-3">
                <ExternalLink size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium">Configuration WhatsApp Business API</p>
                  <p className="mt-1 text-blue-600">
                    Pour activer l'envoi automatique par WhatsApp, vous devez configurer un compte WhatsApp Business API.
                    <a href="https://business.whatsapp.com" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                      En savoir plus
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton sauvegarder */}
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-mono rounded-sm transition-all ${
              saved ? 'bg-emerald-600 text-white' : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {saved ? (
              <>
                <CheckCircle2 size={14} /> Paramètres enregistrés !
              </>
            ) : (
              <>
                <Save size={14} /> Enregistrer les paramètres
              </>
            )}
          </button>
        </div>
      )}

      {/* Journal d'envois */}
      {activeTab === 'logs' && (
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              Journal des envois
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={() => window.location.reload()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-border rounded-sm hover:bg-secondary transition-colors">
                <RefreshCw size={12} /> Actualiser
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-border bg-secondary/30">
                <tr>
                  <th className="text-left px-4 py-2 font-mono text-muted-foreground uppercase tracking-wider">ID</th>
                  <th className="text-left px-4 py-2 font-mono text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-2 font-mono text-muted-foreground uppercase tracking-wider">Contribuable</th>
                  <th className="text-left px-4 py-2 font-mono text-muted-foreground uppercase tracking-wider">Destinataire</th>
                  <th className="text-left px-4 py-2 font-mono text-muted-foreground uppercase tracking-wider">Sujet</th>
                  <th className="text-left px-4 py-2 font-mono text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-2 font-mono text-muted-foreground uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="px-4 py-3 font-mono text-muted-foreground">{log.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {log.type === 'email' ? (
                          <>
                            <Mail size={14} className="text-blue-600" />
                            <span className="font-mono">Email</span>
                          </>
                        ) : (
                          <>
                            <MessageCircle size={14} className="text-green-600" />
                            <span className="font-mono">WhatsApp</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">{log.contribuable}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{log.destinataire}</td>
                    <td className="px-4 py-3">{log.sujet}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{log.date}</td>
                    <td className="px-4 py-3">
                      <StatusBadge statut={log.statut === 'envoyé' ? 'Validé' : log.statut === 'échoué' ? 'Annulé' : 'En attente'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP PRINCIPALE
// ═══════════════════════════════════════════════════════════════════════════════

const NAV_ITEMS: { id: View; label: string; icon: typeof LayoutDashboard; group?: string }[] = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "recensement", label: "Recensement", icon: Users, group: "Modules" },
  { id: "taxation", label: "Taxation", icon: Calculator, group: "Modules" },
  { id: "paiements", label: "Paiements", icon: CreditCard, group: "Modules" },
  { id: "cartographie", label: "Cartographie SIG", icon: MapPin, group: "Modules" },
  { id: "rapports", label: "Rapports & BI", icon: FileBarChart2, group: "Modules" },
  { id: "business-intelligence", label: "Business Intelligence", icon: TrendingUp, group: "Modules" },
  { id: "exercice-fiscal", label: "Exercice fiscal", icon: Calculator, group: "Modules" },
  { id: "notifications", label: "Notifications", icon: Bell, group: "Modules" },
  { id: "utilisateurs", label: "Utilisateurs", icon: Users, group: "Administration" },
  { id: "securite", label: "Sécurité & Audit", icon: ShieldCheck, group: "Administration" },
  { id: "parametres", label: "Paramètres", icon: Settings, group: "Administration" },
];

const VIEW_LABELS: Record<View, string> = {
  dashboard: "Tableau de bord",
  recensement: "Module de recensement",
  taxation: "Module de taxation",
  paiements: "Paiements électroniques",
  cartographie: "Cartographie SIG",
  rapports: "Rapports & Business Intelligence",
  "business-intelligence": "Business Intelligence - Analyses Prédictives",
  "exercice-fiscal": "Exercice fiscal — Saisie des données",
  notifications: "Centre de notifications",
  utilisateurs: "Gestion des utilisateurs",
  securite: "Sécurité & Journal d'audit",
  parametres: "Paramètres du système",
};

// ─── Sync queue helpers (persisted in localStorage) ───────────────────────────
const SYNC_QUEUE_KEY = "snrr_sync_queue";
type SyncOp = { id: string; type: "create" | "update" | "delete"; entity: string; data: unknown; ts: number };
function loadSyncQueueFor(key: string): SyncOp[] {
  try { return JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { return []; }
}
function loadSyncQueue(): SyncOp[] { return loadSyncQueueFor(SYNC_QUEUE_KEY); }
function saveSyncQueueFor(key: string, q: SyncOp[]) { localStorage.setItem(key, JSON.stringify(q)); }
function saveSyncQueue(q: SyncOp[]) { saveSyncQueueFor(SYNC_QUEUE_KEY, q); }
function enqueueSyncOpFor(key: string, op: Omit<SyncOp, "id" | "ts">) {
  const q = loadSyncQueueFor(key);
  q.push({ ...op, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, ts: Date.now() });
  saveSyncQueueFor(key, q);
}
function enqueueSyncOp(op: Omit<SyncOp, "id" | "ts">) { enqueueSyncOpFor(SYNC_QUEUE_KEY, op); }
function clearSyncQueueFor(key: string) { saveSyncQueueFor(key, []); }
function clearSyncQueue() { clearSyncQueueFor(SYNC_QUEUE_KEY); }

export function TenantApp({ tenant, onExit }: { tenant?: TenantConfig | null; onExit?: () => void }) {
  // --- Commune identity derived from tenant prop ---
  const communeName      = tenant?.commune ?? "Préfecture de Mamou";
  const communeId        = tenant?.id      ?? "mamou";
  const communeDomain    = `${communeId}.gn`;
  const communeEmail     = (suffix: string) => `${suffix}@${communeDomain}`;
  // Short display name: strip "Préfecture de " / "Commune Urbaine de " / "Commune de "
  const communeShortName = communeName
    .replace(/^Préfecture de /i, "")
    .replace(/^Commune Urbaine de /i, "")
    .replace(/^Commune de /i, "")
    .trim();
  // Entity type badge for UI
  const isCommune        = communeName.toLowerCase().includes("commune");
  const entityBadge      = isCommune ? "CU" : "PREF";

  // Tenant-scoped localStorage helpers — all data isolated per commune
  const tKey = (k: string) => `snrr_${communeId}_${k}`;
  const tLoad = <T,>(k: string, fallback: () => T): T => {
    try { const r = localStorage.getItem(tKey(k)); if (r) return JSON.parse(r) as T; } catch {}
    return fallback();
  };
  const tSave = (k: string, v: unknown) => {
    try { localStorage.setItem(tKey(k), JSON.stringify(v)); } catch {}
  };

  // Commune geographic config (quartiers, sous-préfectures, SP stats, etc.)
  const communeConfig = buildCommuneConfig(communeId, communeName);

  // Adapt seed contribuables to this commune's geography and ID prefix
  const adaptContribuables = (): Contribuable[] => {
    const quartiers = communeConfig.communes[0]?.districts ?? [];
    const firstQ = quartiers[0]?.nom ?? "Centre-ville";
    return CONTRIBUABLES_INIT.map((c, i) => {
      const q = quartiers[i % Math.max(quartiers.length, 1)];
      const quartier = q?.nom ?? firstQ;
      const secteur = q?.secteurs[0] ?? "S-01";
      const year = new Date().getFullYear();
      return {
        ...c,
        id: `${communeConfig.code}-${year}-${c.id.split("-").pop()}`,
        quartier,
        secteur,
        commune: communeConfig.communes[0]?.nom,
      };
    });
  };

  // Adapt seed users: replace mamou-commune.gn domain with this commune's domain
  const adaptUtilisateurs = (): Utilisateur[] =>
    UTILISATEURS_INIT.map(u => ({
      ...u,
      email: u.email
        .replace("mamou-commune.gn", communeDomain)
        .replace("mamou.gn", communeDomain),
    }));

  // Auto-create workspace admin for this commune when entering from portal
  const buildAdminUser = (): Utilisateur => {
    const seed = adaptUtilisateurs().find(u => u.role === "Administrateur" && u.statut === "Actif");
    return seed ?? {
      id: "USR-000", nom: "Admin", prenom: "Système", role: "Administrateur",
      email: communeEmail("admin"), telephone: "+224 620 00 00 00",
      derniere: new Date().toLocaleString("fr-FR"), statut: "Actif",
      dateCreation: "2024-01-01", identifiant: "admin",
    };
  };

  const [currentUser, setCurrentUser] = useState<Utilisateur | null>(() =>
    tenant ? buildAdminUser() : null
  );
  const [profilePhotoVersion, setProfilePhotoVersion] = useState(0);

  // Hash-based browser history — read initial view from URL hash
  const hashToView = (): View => {
    const h = window.location.hash.replace("#", "") as View;
    const valid: View[] = ["dashboard","recensement","taxation","paiements","cartographie","rapports","business-intelligence","exercice-fiscal","utilisateurs","securite","parametres","notifications"];
    return valid.includes(h) ? h : "dashboard";
  };
  const [view, setViewState] = useState<View>(hashToView);

  const setView = (v: View) => {
    setViewState(v);
    window.history.pushState({ view: v }, "", `#${v}`);
  };

  // Sync app state when user navigates with browser back/forward buttons
  useEffect(() => {
    const onPop = () => setViewState(hashToView());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Exercice fiscal — tenant-scoped
  const exerciceKeyT = tKey("exercice_recettes");
  const [exerciceStore, setExerciceStore] = useState<ExerciceStore>(() => loadExerciceFor(exerciceKeyT));
  const [exerciceAnnee, setExerciceAnnee] = useState("2024");
  const handleSaveExercice = (annee: string, store: ExerciceStore) => {
    setExerciceStore(store);
    setExerciceAnnee(annee);
    saveExerciceFor(exerciceKeyT, store);
  };
  const recettesActuelles: RecetteMois[] = exerciceStore[exerciceAnnee]?.mois ?? RECETTES_DEFAULT;

  // Audit log — tenant-scoped
  const auditKeyT = tKey("audit_log");
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(() => loadAuditFor(auditKeyT));

  const addAuditLog = (action: string, type: AuditEntry["type"] = "info") => {
    const entry: AuditEntry = {
      id: `al-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      action,
      user: currentUser ? `${currentUser.prenom} ${currentUser.nom}` : "Système",
      ip: "—",
      date: new Date().toLocaleString("fr-FR").replace(",", ""),
      type,
    };
    setAuditLogs(prev => {
      const updated = [entry, ...prev];
      saveAuditFor(auditKeyT, updated);
      return updated;
    });
  };

  const handleClearAuditLogs = () => {
    setAuditLogs([]); saveAuditFor(auditKeyT, []);
  };

  // Offline / sync state — tenant-scoped
  const syncKeyT = tKey("sync_queue");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueueLength, setSyncQueueLength] = useState(() => loadSyncQueueFor(syncKeyT).length);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "done">("idle");

  useEffect(() => {
    const online = () => { setIsOnline(true); triggerSync(); };
    const offline = () => { setIsOnline(false); };
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw-sync.js").catch(() => {});
      navigator.serviceWorker.addEventListener("message", (e) => {
        if (e.data?.type === "SYNC_READY") triggerSync();
      });
    }
    return () => { window.removeEventListener("online", online); window.removeEventListener("offline", offline); };
  }, []);

  const triggerSync = async () => {
    const q = loadSyncQueueFor(syncKeyT);
    if (q.length === 0) return;
    setSyncStatus("syncing");
    await new Promise(r => setTimeout(r, 1200));
    clearSyncQueueFor(syncKeyT);
    setSyncQueueLength(0);
    setSyncStatus("done");
    setTimeout(() => setSyncStatus("idle"), 3000);
  };

  // Wrap data mutations to enqueue when offline
  const withSync = <T,>(entity: string, type: SyncOp["type"], fn: () => T, data: unknown): T => {
    const result = fn();
    if (!navigator.onLine) {
      enqueueSyncOpFor(syncKeyT, { type, entity, data });
      setSyncQueueLength(loadSyncQueueFor(syncKeyT).length);
    }
    return result;
  };

  // Data state — fully tenant-scoped: load from localStorage first, seed if empty
  const [contribuables, setContribuables] = useState<Contribuable[]>(() =>
    tLoad("contribuables", adaptContribuables)
  );
  const [paiements, setPaiements] = useState<Paiement[]>(() =>
    tLoad("paiements", () => PAIEMENTS_INIT)
  );
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>(() =>
    tLoad("utilisateurs", adaptUtilisateurs)
  );
  const [taxes, setTaxes] = useState<Taxe[]>(() =>
    tLoad("taxes", () => TAXES_INIT)
  );

  // Persist all data changes to tenant-scoped localStorage
  useEffect(() => { tSave("contribuables", contribuables); }, [contribuables]);
  useEffect(() => { tSave("paiements", paiements); }, [paiements]);
  useEffect(() => { tSave("utilisateurs", utilisateurs); }, [utilisateurs]);
  useEffect(() => { tSave("taxes", taxes); }, [taxes]);

  // Modal state
  const [modal, setModal] = useState<ModalType>(null);
  const [modalData, setModalData] = useState<Contribuable | Paiement | Utilisateur | Taxe | null>(null);
  const [adminTab, setAdminTab] = useState<"membres" | "paiements">("membres");

  const openModal = (type: ModalType, data?: Contribuable | Paiement | Utilisateur | Taxe | null) => {
    setModal(type);
    setModalData(data ?? null);
  };
  const closeModal = () => { setModal(null); setModalData(null); };

  // Notifications
  const [notifCount] = useState(4);
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    whatsappEnabled: true,
    autoSendAvis: true,
    emailSmtp: `smtp.${communeDomain}`,
    emailPort: '587',
    emailUser: `notifications@${communeDomain}`,
    whatsappApi: 'https://api.whatsapp.com/send',
  });

  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([
    { id: 'NOTIF-001', type: 'email', destinataire: 'f.diallo@example.com', contribuable: 'Diallo Mamadou', sujet: 'Avis d\'imposition 2024', statut: 'envoyé', date: '2024-06-15 09:20' },
    { id: 'NOTIF-002', type: 'whatsapp', destinataire: '+224 621 45 89 23', contribuable: 'Diallo Mamadou', sujet: 'Avis d\'imposition 2024', statut: 'envoyé', date: '2024-06-15 09:20' },
    { id: 'NOTIF-003', type: 'email', destinataire: 'a.barry@example.com', contribuable: 'Barry Aissatou', sujet: 'Rappel paiement CFU', statut: 'envoyé', date: '2024-06-14 14:30' },
    { id: 'NOTIF-004', type: 'whatsapp', destinataire: '+224 655 99 11 22', contribuable: 'Barry Aissatou', sujet: 'Rappel paiement CFU', statut: 'envoyé', date: '2024-06-14 14:30' },
  ]);

  const handleNotificationSent = (log: NotificationLog) => {
    setNotificationLogs(prev => [log, ...prev]);
  };

  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedContribuable, setScannedContribuable] = useState<Contribuable | null>(null);

  const handleClearNotification = (id: string) => {
    setNotificationLogs(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotificationLogs([]);
  };

  const handleRefreshNotifications = () => {
    // Simuler un refresh - en production, appeler une API
    console.log('Actualisation des notifications...');
  };

  const handleSendEmail = async (email: string, contribuable?: Contribuable, avisRef?: string) => {
    const subject = avisRef ? `Avis d'imposition ${avisRef}` : "Notification fiscale";
    const body = `Bonjour,\n\nVeuillez trouver ci-joint votre avis d'imposition.\n\n${communeName} — Système SNRR`;
    
    // Créer le log de notification
    const log: NotificationLog = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'email',
      destinataire: email,
      contribuable: contribuable ? `${contribuable.nom} ${contribuable.prenom}` : 'Contribuable',
      sujet: subject,
      statut: 'envoyé',
      date: new Date().toLocaleString('fr-FR', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
    
    handleNotificationSent(log);
    
    // Ouvrir le client email
    if (!notificationSettings.autoSendAvis) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };

  const handleSendWhatsApp = async (phone: string, contribuable?: Contribuable, avisRef?: string) => {
    const message = avisRef 
      ? `Bonjour, votre avis d'imposition ${avisRef} est disponible. ${communeName} — SNRR`
      : `Bonjour, vous avez une notification de ${communeName} — SNRR`;
    
    // Créer le log de notification
    const log: NotificationLog = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'whatsapp',
      destinataire: phone,
      contribuable: contribuable ? `${contribuable.nom} ${contribuable.prenom}` : 'Contribuable',
      sujet: avisRef ? `Avis d'imposition ${avisRef}` : 'Notification fiscale',
      statut: 'envoyé',
      date: new Date().toLocaleString('fr-FR', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
    
    handleNotificationSent(log);
    
    // Ouvrir WhatsApp
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleLogin = (user: Utilisateur) => {
    setCurrentUser(user);
    setUtilisateurs(prev => prev.map(u =>
      u.id === user.id ? { ...u, derniere: now() } : u
    ));
    // Ensure the current hash view is in browser history
    const v = hashToView();
    window.history.replaceState({ view: v }, "", `#${v}`);
    // Audit — use functional form so we don't need currentUser to be set yet
    const entry: AuditEntry = {
      id: `al-${Date.now()}`,
      action: `Connexion réussie — ${user.prenom} ${user.nom} (${user.role})`,
      user: `${user.prenom} ${user.nom}`,
      ip: "—",
      date: new Date().toLocaleString("fr-FR").replace(",", ""),
      type: "info",
    };
    setAuditLogs(prev => { const u = [entry, ...prev]; saveAudit(u); return u; });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewState("dashboard");
    window.history.replaceState({ view: "dashboard" }, "", "#dashboard");
  };

  // Vérifier si l'utilisateur a accès à une vue
  const userCanAccessView = (viewId: View): boolean => {
    if (!currentUser) return false;
    return canAccessView(currentUser.role as Role, viewId);
  };

  // Vérifier si l'utilisateur a une permission
  const userHasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    return hasPermission(currentUser.role as Role, permission);
  };

  if (!currentUser) return <LoginPage onLogin={handleLogin} utilisateurs={utilisateurs} commune={communeName} communeId={communeId} />;

  const guard = (viewId: View, element: React.ReactNode) => {
    if (!userCanAccessView(viewId)) return <AccessDenied role={currentUser!.role} view={VIEW_LABELS[viewId]} />;
    return element;
  };

  const renderView = () => {
    switch (view) {
      case "dashboard": return <Dashboard onNavigate={setView} contribuables={contribuables} paiements={paiements} currentUserRole={currentUser!.role as Role} recettesData={recettesActuelles} communeName={communeName} communeConfig={communeConfig} />;
      case "recensement": return guard("recensement", (
        <Recensement
          contribuables={contribuables}
          onAdd={() => openModal("new-contribuable")}
          onEdit={(c) => openModal("edit-contribuable", c)}
          onView={(c) => openModal("view-contribuable", c)}
          onDelete={(c) => openModal("delete-contribuable", c)}
          onNewPaiement={(c) => { setView("paiements"); openModal("new-paiement", c); }}
          canCreate={userHasPermission("create_recensement")}
          canEdit={userHasPermission("edit_recensement")}
          canDelete={userHasPermission("delete_recensement")}
          communeName={communeName}
        />
      ));
      case "taxation": return guard("taxation", (
        <Taxation
          taxes={taxes}
          contribuables={contribuables}
          onAdd={() => openModal("new-taxe")}
          onEdit={(t) => openModal("edit-taxe", t)}
          onDelete={(t) => openModal("confirm-delete", t)}
          onSimulation={() => openModal("simulation-fiscale")}
          canCreate={userHasPermission("create_taxation")}
          canEdit={userHasPermission("edit_taxation")}
          canDelete={userHasPermission("delete_taxation")}
        />
      ));
      case "paiements": return guard("paiements", (
        <Paiements
          paiements={paiements}
          contribuables={contribuables}
          onNew={() => openModal("new-paiement")}
          onView={(p) => openModal("view-paiement", p)}
          onCancel={(p) => {
            setPaiements((prev) => prev.map((x) => x.ref === p.ref ? { ...x, statut: "Annulé" } : x));
            addAuditLog(`Annulation paiement — ${p.ref} (${p.contribuable})`, "warning");
          }}
          canCreate={userHasPermission("create_paiements")}
          canCancel={userHasPermission("cancel_paiements")}
          communeName={communeName}
          communeId={communeId}
        />
      ));
      case "cartographie": return guard("cartographie", <Cartographie onNavigate={setView} contribuables={contribuables} communeName={communeName} communeConfig={communeConfig} communeId={communeId} />);
      case "rapports": return guard("rapports", <Rapports contribuables={contribuables} recettesData={recettesActuelles} communeName={communeName} communeConfig={communeConfig} />);
      case "business-intelligence": return guard("business-intelligence", <BusinessIntelligence />);
      case "exercice-fiscal": return guard("exercice-fiscal", <ExerciceFiscal store={exerciceStore} annee={exerciceAnnee} onSave={handleSaveExercice} />);
      case "utilisateurs": return guard("utilisateurs", (
        <div className="space-y-5">
          {/* Admin section tabs */}
          <div className="flex items-center gap-1 border-b border-border pb-0">
            {([
              { key: "membres", label: "Gestion des membres", icon: Users },
              { key: "paiements", label: "Paiements manuels", icon: Banknote },
            ] as const).map(tab => (
              <button key={tab.key} onClick={() => setAdminTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono border-b-2 transition-all -mb-px ${adminTab === tab.key ? "border-primary text-primary font-semibold" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}>
                <tab.icon size={13} /> {tab.label}
              </button>
            ))}
          </div>
          {adminTab === "membres" && (
            <Utilisateurs
              utilisateurs={utilisateurs}
              onAdd={() => openModal("new-user")}
              onEdit={(u) => openModal("edit-user", u)}
              onDelete={(u) => openModal("confirm-delete", u)}
              onView={(u) => openModal("view-user-detail", u)}
              onResetPassword={(u) => openModal("reset-password", u)}
              onConfigureAccess={(u) => openModal("configure-access", u)}
              onToggleStatut={(u) => {
                const newStatut = u.statut === "Actif" ? "Inactif" : "Actif";
                setUtilisateurs(prev => prev.map(x => x.id === u.id ? { ...x, statut: newStatut } : x));
                addAuditLog(`Statut utilisateur ${newStatut === "Inactif" ? "suspendu" : "réactivé"} — ${u.prenom} ${u.nom}`, newStatut === "Inactif" ? "warning" : "info");
              }}
              canCreate={userHasPermission("create_utilisateurs")}
              canEdit={userHasPermission("edit_utilisateurs")}
              canDelete={userHasPermission("delete_utilisateurs")}
            />
          )}
          {adminTab === "paiements" && (
            <ManualPaymentAdmin
              contribuables={contribuables}
              paiements={paiements}
              onSave={(p) => {
                setPaiements(prev => [p, ...prev]);
                addAuditLog(`Paiement manuel enregistré — ${p.ref} · ${p.contribuable} · ${new Intl.NumberFormat("fr-GN").format(p.montant)} GNF`, "info");
              }}
              communeName={communeName}
            />
          )}
        </div>
      ));
      case "securite": return guard("securite", <Securite canManage={userHasPermission("manage_securite")} auditLogs={auditLogs} onClearLogs={handleClearAuditLogs} />);
      case "parametres": return guard("parametres", <Parametres canEdit={userHasPermission("edit_parametres")} communeName={communeName} communeDomain={communeDomain} />);
      case "notifications": return guard("notifications", (
        <NotificationsView
          notifications={notificationLogs}
          settings={notificationSettings}
          onClearNotification={handleClearNotification}
          onClearAll={handleClearAllNotifications}
          onOpenSettings={() => setShowNotificationSettings(true)}
          onRefresh={handleRefreshNotifications}
          canSend={userHasPermission("send_notifications")}
        />
      ));
      default: return null;
    }
  };

  // Sidebar groups
  const groups = ["", "Modules", "Administration"];

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-0 overflow-hidden"} shrink-0 bg-[#0F2040] text-white flex flex-col transition-all duration-300 ease-in-out`}>
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <div className="flex items-center gap-2.5 mb-1">
            {/* Logo blason officiel */}
            <img src={logoImg} alt="Blason République de Guinée" className="w-9 h-9 object-contain drop-shadow-lg shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold tracking-widest uppercase text-white whitespace-nowrap truncate">SNRR · {communeShortName}</p>
                <span className={`shrink-0 text-[7px] font-mono px-1 py-0.5 rounded border ${isCommune ? "text-[#009460] border-[#009460]/40 bg-[#009460]/15" : "text-[#FCD116] border-[#FCD116]/40 bg-[#FCD116]/15"}`}>{entityBadge}</span>
              </div>
              <p className="text-[10px] text-white/40 font-mono truncate">{communeEmail("admin")}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
          {groups.map((group) => {
            const items = NAV_ITEMS.filter((i) => (i.group ?? "") === group && userCanAccessView(i.id));
            if (!items.length) return null;
            return (
              <div key={group}>
                {group && <p className="px-3 text-xs font-mono text-white/25 uppercase tracking-widest mb-1">{group}</p>}
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setView(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all group ${view === item.id ? "bg-[#B8860B]/20 text-[#E8A820] border-l-2 border-[#B8860B]" : "text-white/55 hover:text-white hover:bg-white/5 border-l-2 border-transparent"}`}
                    >
                      <item.icon size={14} className={view === item.id ? "text-[#E8A820]" : "text-white/35 group-hover:text-white/60"} />
                      <span className="font-medium text-xs tracking-wide whitespace-nowrap">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            {/* profilePhotoVersion triggers re-render when photo changes */}
            {profilePhotoVersion >= 0 && (() => {
              const photo = localStorage.getItem(`snrr_profile_photo_${currentUser!.id}`);
              return photo ? (
                <img src={photo} alt="Profil" className="w-8 h-8 rounded-full object-cover border border-[#B8860B]/50 shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-sm bg-[#B8860B]/30 flex items-center justify-center text-xs font-bold text-[#E8A820] font-mono shrink-0">
                  {currentUser!.nom[0]}{currentUser!.prenom[0]}
                </div>
              );
            })()}

            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{currentUser!.prenom} {currentUser!.nom}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ROLES_CONFIG[currentUser!.role]?.color ?? "#B8860B" }} />
                <p className="text-[10px] text-white/40 font-mono truncate">{currentUser!.role}</p>
              </div>
            </div>
          </div>
          {/* Permissions count */}
          {(() => {
            const count = ROLE_PERMISSIONS[currentUser!.role as Role]?.length ?? 0;
            return (
              <div className="flex items-center gap-1.5 px-2 py-1.5 mb-2 rounded-sm bg-white/5 border border-white/10">
                <ShieldCheck size={10} className="text-white/30 shrink-0" />
                <span className="text-[10px] font-mono text-white/30">{count} permission{count > 1 ? "s" : ""} actives</span>
              </div>
            );
          })()}
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/35 hover:text-white/70 rounded-sm hover:bg-white/5 transition-colors font-mono">
            <LogOut size={12} /> Déconnexion
          </button>
          {onExit && (
            <button onClick={onExit} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#CE1126]/50 hover:text-[#CE1126] rounded-sm hover:bg-[#CE1126]/10 transition-colors font-mono">
              <ExternalLink size={12} /> Retour au portail
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-card border-b border-border flex items-center px-5 gap-4 shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-sm hover:bg-secondary transition-colors text-muted-foreground">
            <Menu size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-foreground truncate">{VIEW_LABELS[view]}</h1>
            <p className="text-xs text-muted-foreground font-mono hidden sm:block">
              {communeName} · {new Date().toLocaleDateString("fr-GN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Offline / sync indicator */}
            {!isOnline && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-semibold">
                <WifiOff size={11} />
                <span className="hidden sm:inline">Hors-ligne</span>
                {syncQueueLength > 0 && <span className="ml-0.5 bg-amber-600 text-white rounded-full px-1.5 py-0.5 text-[9px]">{syncQueueLength}</span>}
              </div>
            )}
            {syncStatus === "syncing" && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-blue-100 dark:bg-blue-900/30 border border-blue-300 text-blue-800 dark:text-blue-300 text-[10px] font-mono font-semibold animate-pulse">
                <RefreshCw size={11} className="animate-spin" />
                <span className="hidden sm:inline">Sync…</span>
              </div>
            )}
            {syncStatus === "done" && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-mono font-semibold">
                <CheckCircle size={11} />
                <span className="hidden sm:inline">Synchronisé</span>
              </div>
            )}
            <div className="relative hidden md:block">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Recherche globale…" className="pl-8 pr-3 py-1.5 text-xs bg-secondary border border-border rounded-sm font-mono w-44 focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button onClick={() => setShowQRScanner(true)}
              title="Scanner un QR code contribuable"
              className="relative p-2 rounded-sm hover:bg-secondary transition-colors text-muted-foreground hover:text-primary">
              <QrCode size={16} />
            </button>
            <NotificationCenter
              notifications={notificationLogs}
              onClearNotification={handleClearNotification}
              onClearAll={handleClearAllNotifications}
              onOpenSettings={() => setShowNotificationSettings(true)}
              onRefresh={handleRefreshNotifications}
            />
            <UserProfileDropdown user={currentUser!} onLogout={handleLogout} onPhotoChange={() => setProfilePhotoVersion(v => v + 1)} />
          </div>
        </header>
        {/* Offline / sync banner */}
        {!isOnline && syncQueueLength > 0 && (
          <div className="shrink-0 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-5 py-2 flex items-center gap-2 text-xs font-mono text-amber-800 dark:text-amber-300">
            <WifiOff size={12} />
            <span>Mode hors-ligne actif · <b>{syncQueueLength} opération{syncQueueLength > 1 ? "s" : ""}</b> en attente de synchronisation · Les données sont sauvegardées localement</span>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="px-6 py-2 border-b border-border/50 bg-background flex items-center gap-2 text-xs font-mono text-muted-foreground shrink-0">
          <button onClick={() => setView("dashboard")} className="hover:text-foreground transition-colors">SNRR · {communeShortName}</button>
          <ChevronRight size={11} />
          <span className="text-foreground">{VIEW_LABELS[view]}</span>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {renderView()}
        </main>
      </div>

      {/* ── Modals ────────────────────────────────────��────────────────────── */}

      {modal === "new-contribuable" && (
        <Modal title="Nouveau contribuable" onClose={closeModal} size="xl">
          <ContribuableFormEnhanced
            communeConfig={communeConfig}
            onSave={(c) => {
              withSync("contribuable", "create", () => setContribuables((prev) => [...prev, c]), c);
              addAuditLog(`Nouveau recensement — ${c.id} (${c.prenom} ${c.nom})`);
              closeModal();
            }}
            onClose={closeModal}
          />
        </Modal>
      )}

      {modal === "edit-contribuable" && modalData && (
        <Modal title="Modifier le dossier" onClose={closeModal} size="xl">
          <ContribuableFormEnhanced
            communeConfig={communeConfig}
            initial={modalData as Contribuable}
            onSave={(c) => {
              withSync("contribuable", "update", () => setContribuables((prev) => prev.map((x) => x.id === c.id ? c : x)), c);
              addAuditLog(`Modification dossier — ${c.id} (${c.prenom} ${c.nom})`, "warning");
              closeModal();
            }}
            onClose={closeModal}
          />
        </Modal>
      )}

      {modal === "view-contribuable" && modalData && (
        <Modal title={`Dossier fiscal — ${(modalData as Contribuable).id}`} onClose={closeModal} size="xl">
          <ContribuableDetail
            c={modalData as Contribuable}
            onEdit={() => openModal("edit-contribuable", modalData)}
            onClose={closeModal}
            onPaiement={() => { setView("paiements"); openModal("new-paiement", modalData); }}
            notificationSettings={notificationSettings}
            onNotificationSent={handleNotificationSent}
            communeName={communeName}
          />
        </Modal>
      )}

      {modal === "delete-contribuable" && modalData && (
        <Modal title="Supprimer le dossier" onClose={closeModal} size="sm">
          <ConfirmDelete
            label={`${(modalData as Contribuable).prenom} ${(modalData as Contribuable).nom}`}
            onConfirm={() => {
              const c = modalData as Contribuable;
              setContribuables((prev) => prev.filter((x) => x.id !== c.id));
              addAuditLog(`Suppression dossier — ${c.id} (${c.prenom} ${c.nom})`, "warning");
            }}
            onClose={closeModal}
          />
        </Modal>
      )}

      {modal === "new-paiement" && (
        <Modal title="Enregistrer un paiement" onClose={closeModal} size="md">
          <PaiementForm
            contribuables={contribuables}
            initial={modalData ? { contribuableId: (modalData as Contribuable).id } : undefined}
            onSave={(p) => {
              setPaiements((prev) => [p, ...prev]);
              if (p.statut === "Validé") { setContribuables((pr) => pr.map((c) => c.id === p.contribuableId ? { ...c, statut: "Payé" } : c)); }
              addAuditLog(`Paiement enregistré — ${p.ref} (${p.contribuable}, ${p.montant.toLocaleString("fr-FR")} GNF)`);
              closeModal();
            }}
            onClose={closeModal}
            onOrangeMoney={(contribuableId, montant) => {
              const contrib = contribuables.find(c => c.id === contribuableId);
              if (contrib) {
                openModal("orange-money-payment", { ...contrib, valeur: montant } as any);
              }
            }}
          />
        </Modal>
      )}

      {modal === "orange-money-payment" && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <OrangeMoneyPayment
            montant={(modalData as any).valeur || (modalData as Contribuable).valeur}
            contribuableId={(modalData as Contribuable).id}
            contribuableNom={`${(modalData as Contribuable).prenom} ${(modalData as Contribuable).nom}`}
            contribuableTelephone={(modalData as Contribuable).telephone}
            contribuableEmail={(modalData as Contribuable).email}
            notificationWhatsApp="+224626001110"
            onSuccess={(transactionRef) => {
              const contrib = contribuables.find(c => c.id === (modalData as Contribuable).id);
              if (contrib) {
                const paiement: Paiement = {
                  ref: transactionRef,
                  contribuableId: contrib.id,
                  contribuable: `${contrib.prenom} ${contrib.nom}`,
                  montant: (modalData as any).valeur || contrib.valeur,
                  methode: "Mobile Money",
                  operateur: "Orange Money",
                  date: now(),
                  statut: "Validé",
                  recu: `REC-${transactionRef.split("-").pop()}`
                };
                setPaiements((prev) => [paiement, ...prev]);
                setContribuables((prev) => prev.map((c) => c.id === contrib.id ? { ...c, statut: "Payé" } : c));
                addAuditLog(`Paiement Orange Money — ${transactionRef} (${contrib.prenom} ${contrib.nom})`);
              }
              closeModal();
            }}
            onCancel={closeModal}
          />
        </div>
      )}

      {modal === "view-paiement" && modalData && (
        <Modal title="Détail du paiement" onClose={closeModal} size="md">
          <RecuPaiement p={modalData as Paiement} onClose={closeModal} communeName={communeName} />
        </Modal>
      )}

      {modal === "new-taxe" && (
        <Modal title="Nouveau taux fiscal" onClose={closeModal} size="md">
          <TaxeForm
            onSave={(t) => { setTaxes((prev) => [...prev, t]); addAuditLog(`Nouveau taux fiscal — ${t.libelle}`); closeModal(); }}
            onClose={closeModal}
          />
        </Modal>
      )}

      {modal === "edit-taxe" && modalData && (
        <Modal title="Modifier le taux fiscal" onClose={closeModal} size="md">
          <TaxeForm
            initial={modalData as Taxe}
            onSave={(t) => { setTaxes((prev) => prev.map((x) => x.id === t.id ? t : x)); addAuditLog(`Modification taux fiscal — ${t.libelle}`, "warning"); closeModal(); }}
            onClose={closeModal}
          />
        </Modal>
      )}

      {modal === "simulation-fiscale" && (
        <Modal title="Simulation fiscale" onClose={closeModal} size="lg">
          <SimulationFiscale taxes={taxes} contribuables={contribuables} onClose={closeModal} />
        </Modal>
      )}

      {modal === "new-user" && (
        <Modal title="Créer un nouveau compte utilisateur" onClose={closeModal} size="lg">
          <UserForm
            onSave={(u) => { setUtilisateurs((prev) => [...prev, u]); addAuditLog(`Nouveau compte utilisateur — ${u.prenom} ${u.nom} (${u.role})`); closeModal(); }}
            onClose={closeModal}
            existingEmails={utilisateurs.map(u => u.email)}
            existingIdentifiants={utilisateurs.map(u => u.identifiant).filter(Boolean) as string[]}
            communeDomain={communeDomain}
          />
        </Modal>
      )}

      {modal === "edit-user" && modalData && (
        <Modal title="Modifier l'utilisateur" onClose={closeModal} size="lg">
          <UserForm
            initial={modalData as Utilisateur}
            onSave={(u) => { setUtilisateurs((prev) => prev.map((x) => x.id === u.id ? u : x)); addAuditLog(`Modification utilisateur — ${u.prenom} ${u.nom} (${u.role})`, "warning"); closeModal(); }}
            onClose={closeModal}
            existingEmails={utilisateurs.map(u => u.email)}
            existingIdentifiants={utilisateurs.map(u => u.identifiant).filter(Boolean) as string[]}
            communeDomain={communeDomain}
          />
        </Modal>
      )}

      {modal === "confirm-delete" && modalData && (
        <Modal title="Confirmation de suppression" onClose={closeModal} size="sm">
          <ConfirmDelete
            label={"libelle" in (modalData as Taxe) ? (modalData as Taxe).libelle : `${(modalData as Utilisateur).prenom} ${(modalData as Utilisateur).nom}`}
            onConfirm={() => {
              if ("libelle" in (modalData as Taxe)) {
                const t = modalData as Taxe;
                setTaxes((prev) => prev.filter((x) => x.id !== t.id));
                addAuditLog(`Suppression taux fiscal — ${t.libelle}`, "warning");
              } else {
                const u = modalData as Utilisateur;
                setUtilisateurs((prev) => prev.filter((x) => x.id !== u.id));
                addAuditLog(`Suppression utilisateur — ${u.prenom} ${u.nom} (${u.role})`, "warning");
              }
            }}
            onClose={closeModal}
          />
        </Modal>
      )}

      {modal === "reset-password" && modalData && (
        <ResetPasswordModal
          user={modalData as Utilisateur}
          onClose={closeModal}
          onReset={(userId, _pwd) => {
            setUtilisateurs(prev => prev.map(x => x.id === userId ? { ...x, motDePasseReset: true } : x));
            addAuditLog(`Réinitialisation MDP — ${(modalData as Utilisateur).prenom} ${(modalData as Utilisateur).nom}`, "warning");
            closeModal();
          }}
        />
      )}

      {modal === "configure-access" && modalData && (
        <ConfigureAccessModal
          user={modalData as Utilisateur}
          onClose={closeModal}
          onSave={(userId, permissions) => {
            setUtilisateurs(prev => prev.map(x => x.id === userId ? { ...x, permissions } : x));
            addAuditLog(`Permissions personnalisées — ${(modalData as Utilisateur).prenom} ${(modalData as Utilisateur).nom}`, "warning");
          }}
        />
      )}

      {modal === "view-user-detail" && modalData && (
        <UserDetailModal
          user={modalData as Utilisateur}
          onClose={closeModal}
          onEdit={() => { openModal("edit-user", modalData); }}
          onResetPassword={() => { openModal("reset-password", modalData); }}
          onToggleStatut={() => {
            const u = modalData as Utilisateur;
            const newStatut = u.statut === "Actif" ? "Inactif" : "Actif";
            setUtilisateurs(prev => prev.map(x => x.id === u.id ? { ...x, statut: newStatut } : x));
            addAuditLog(`Statut utilisateur ${newStatut === "Inactif" ? "suspendu" : "réactivé"} — ${u.prenom} ${u.nom}`, newStatut === "Inactif" ? "warning" : "info");
            closeModal();
          }}
          onDelete={() => { openModal("confirm-delete", modalData); }}
        />
      )}

      {/* Modale des paramètres de notification */}
      <NotificationSettingsModal
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
        settings={notificationSettings}
        onSave={(newSettings) => {
          setNotificationSettings(newSettings);
          setShowNotificationSettings(false);
        }}
      />

      {/* QR Scanner */}
      {showQRScanner && (
        <QRScannerModal
          contribuables={contribuables}
          onFound={(c) => { setScannedContribuable(c); setShowQRScanner(false); }}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {/* Fiche contribuable après scan QR */}
      {scannedContribuable && (
        <Modal title={`${scannedContribuable.prenom} ${scannedContribuable.nom}`} onClose={() => setScannedContribuable(null)} size="lg">
          <ContribuableDetail
            c={scannedContribuable}
            onEdit={() => { openModal("edit-contribuable", scannedContribuable); setScannedContribuable(null); }}
            onClose={() => setScannedContribuable(null)}
            onPaiement={() => { openModal("new-paiement", scannedContribuable); setScannedContribuable(null); }}
            notificationSettings={notificationSettings}
            onNotificationSent={(log) => setNotificationLogs(prev => [log, ...prev])}
            communeName={communeName}
          />
        </Modal>
      )}
    </div>
  );
}

// ─── SaaS Multi-Tenant Router ─────────────────────────────────────────────────

export interface TenantConfig {
  id: string;
  name: string;
  commune: string;
  country: string;
  locale: "fr" | "en";
  plan: "trial" | "pro" | "enterprise";
  trialEndsAt?: string;
  features: string[];
  logo?: string;
  primaryColor?: string;
}

import { SaasLanding } from "./components/SaasLanding";
import { SuperAdmin } from "./components/SuperAdmin";

type AppMode = "landing" | "superadmin" | "tenant";

function loadMode(): AppMode {
  if (window.location.hash === "#superadmin") return "superadmin";
  return "landing";
}

export default function AppRouter() {
  const [mode, setMode] = useState<AppMode>(loadMode);
  const [tenant, setTenant] = useState<TenantConfig | null>(null);

  const enterTenant = (t: TenantConfig) => {
    setTenant(t);
    setMode("tenant");
    window.history.pushState({}, "", "#dashboard");
  };

  const exitTenant = () => {
    setTenant(null);
    setMode("landing");
    window.history.pushState({}, "", "#");
  };

  const enterSuperAdmin = () => {
    setMode("superadmin");
    window.history.pushState({}, "", "#superadmin");
  };

  const exitSuperAdmin = () => {
    setMode("landing");
    window.history.pushState({}, "", "#");
  };

  if (mode === "superadmin") return <SuperAdmin onExit={exitSuperAdmin} />;
  if (mode === "tenant" && tenant) return <TenantApp tenant={tenant} onExit={exitTenant} />;
  return <SaasLanding onEnterApp={enterTenant} onSuperAdmin={enterSuperAdmin} />;
}
