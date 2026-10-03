import { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronRight, ChevronLeft, Save, MapPin, User, Home, Calculator,
  CheckCircle2, Camera, Upload, X, Navigation, Loader2, Video, VideoOff, AlertTriangle,
} from "lucide-react";

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
  periodeTaxe?: string;
  statusOccupation?: string;
  pourcentageEtat?: number;
  pourcentageAgent?: number;
  pourcentageCommune?: number;
}

interface District { nom: string; secteurs: string[]; }
interface Commune { nom: string; districts: District[]; }

export interface CommuneConfig {
  code: string;
  communeName: string;
  communes: Commune[];
  sousPrefectures: string[];
  spStats: Record<string, any>;
  quartierColors: Record<string, string>;
  agents: string[];
}

// Helper: generate secteurs with district initial prefix
const sect = (prefix: string, n = 5) => Array.from({ length: n }, (_, i) => `${prefix}-S${i + 1}`);

const COMMUNES_MAMOU: Commune[] = [
  {
    nom: "Commune Urbaine de Mamou",
    districts: [
      { nom: "Centre-ville", secteurs: ["Secteur 1 — Marché Central", "Secteur 2 — Mairie", "Secteur 3 — Mosquée Centrale", "Secteur 4 — Gare Routière"] },
      { nom: "Sikhourou", secteurs: ["SK-S1", "SK-S2", "SK-S3", "SK-S4", "SK-S5"] },
      { nom: "Gongoré", secteurs: ["GN-S1", "GN-S2", "GN-S3", "GN-S4", "GN-S5"] },
      { nom: "Donghol Touma", secteurs: ["DT-S1", "DT-S2", "DT-S3", "DT-S4", "DT-S5"] },
      { nom: "Saré Koura", secteurs: ["SA-S1", "SA-S2", "SA-S3", "SA-S4", "SA-S5"] },
      { nom: "Porédaka (Urbain)", secteurs: sect("PU") },
      { nom: "Téguéréya (Urbain)", secteurs: sect("TU") },
      { nom: "Tountouroun", secteurs: sect("TO") },
      { nom: "Pelel", secteurs: sect("PE") },
    ],
  },
  {
    nom: "Sous-Préfecture de Dounet",
    districts: [
      { nom: "Dounet-Centre", secteurs: ["DC-S1", "DC-S2", "DC-S3", "DC-S4", "DC-S5"] },
      { nom: "Kourayanah", secteurs: sect("KO") },
      { nom: "Bhouria-Dounet", secteurs: sect("BD") },
      { nom: "Tangaly", secteurs: sect("TA") },
    ],
  },
  {
    nom: "Sous-Préfecture de Gongoret",
    districts: [
      { nom: "Gongoret-Centre", secteurs: sect("GC") },
      { nom: "Gongoret-Nord", secteurs: sect("GN") },
      { nom: "Gongoret-Périphérie", secteurs: sect("GP") },
    ],
  },
  {
    nom: "Sous-Préfecture de Kegneko",
    districts: [
      { nom: "Kegneko-Centre", secteurs: sect("KC") },
      { nom: "Kegneko-Est", secteurs: sect("KE") },
      { nom: "Kegneko-Ouest", secteurs: sect("KO") },
    ],
  },
  {
    nom: "Sous-Préfecture de Nyagara",
    districts: [
      { nom: "Nyagara-Centre", secteurs: sect("NC") },
      { nom: "Nyagara-Marché", secteurs: sect("NM") },
    ],
  },
  {
    nom: "Sous-Préfecture de Ouré-Kaba",
    districts: [
      { nom: "Ouré-Centre", secteurs: sect("OC") },
      { nom: "Kaba", secteurs: sect("KA") },
      { nom: "Ouré-Périphérie", secteurs: sect("OP") },
    ],
  },
  {
    nom: "Sous-Préfecture de Porédaka",
    districts: [
      { nom: "Porédaka-Centre", secteurs: ["PC-S1", "PC-S2", "PC-S3", "PC-S4", "PC-S5"] },
      { nom: "Bhouria", secteurs: sect("BH") },
      { nom: "Dar es Salam", secteurs: sect("DS") },
      { nom: "Kolissoko", secteurs: sect("KL") },
      { nom: "Sankarela", secteurs: ["Sankarela Centre", "Ley-Bowal", "Fello", "Horé Bowal", "Kolla", "Donghol Marga"] },
    ],
  },
  {
    nom: "Sous-Préfecture de Saramoussaya",
    districts: [
      { nom: "Saramoussaya-Centre", secteurs: sect("SC") },
      { nom: "Saramoussaya-Périphérie", secteurs: sect("SP") },
      { nom: "Saramoussaya-Rural", secteurs: sect("SR") },
    ],
  },
  {
    nom: "Sous-Préfecture de Soyah",
    districts: [
      { nom: "Soyah-Centre", secteurs: sect("SO") },
      { nom: "Soyah-Nord", secteurs: sect("SN") },
      { nom: "Soyah-Sud", secteurs: sect("SS") },
    ],
  },
  {
    nom: "Sous-Préfecture de Téguéréya",
    districts: [
      { nom: "Téguéréya-Centre", secteurs: ["TC-S1", "TC-S2", "TC-S3", "TC-S4", "TC-S5"] },
      { nom: "Téguéréya-Est", secteurs: sect("TE") },
      { nom: "Téguéréya-Ouest", secteurs: sect("TO") },
    ],
  },
];

const TYPES_BIEN = ["Résidentiel", "Commercial", "Industriel", "Administratif", "Mixte", "Agricole"];
const USAGES_BIEN: Record<string, string[]> = {
  Résidentiel: ["Habitation principale", "Résidence secondaire", "Location", "Villa"],
  Commercial: ["Boutique", "Restaurant", "Pharmacie", "Hôtel", "Supermarché", "Salon", "Atelier"],
  Industriel: ["Entrepôt", "Usine", "Dépôt", "Hangar"],
  Administratif: ["Bureau", "Siège social", "Agence", "École privée"],
  Mixte: ["Habitation + commerce", "Immeuble mixte"],
  Agricole: ["Exploitation agricole", "Élevage", "Verger"],
};
const CATEGORIES_FISCALES = [
  { code: "A", label: "Catégorie A — Taux 12%", taux: 12 },
  { code: "B", label: "Catégorie B — Taux 8%", taux: 8 },
  { code: "C", label: "Catégorie C — Taux 5%", taux: 5 },
];
const PERIODES = [
  { code: "Journalier", label: "Journalier", mult: 365 },
  { code: "Hebdomadaire", label: "Hebdomadaire", mult: 52 },
  { code: "Mensuel", label: "Mensuel", mult: 12 },
  { code: "Trimestriel", label: "Trimestriel", mult: 4 },
  { code: "Semestriel", label: "Semestriel", mult: 2 },
  { code: "Annuel", label: "Annuel", mult: 1 },
];

const inputCls = "w-full px-3 py-2 text-sm bg-input-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary text-foreground";
const selectCls = "w-full px-3 py-2 text-sm bg-input-background border border-border rounded-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary text-foreground";

function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] font-mono text-muted-foreground mt-1 italic">{hint}</p>}
    </div>
  );
}

const STEP_CONFIG = [
  { label: "Localisation", icon: MapPin, color: "#CE1126", bg: "bg-[#CE1126]", border: "border-[#CE1126]", light: "bg-[#CE1126]/10" },
  { label: "Contribuable", icon: User, color: "#B8860B", bg: "bg-[#B8860B]", border: "border-[#B8860B]", light: "bg-[#B8860B]/10" },
  { label: "Bien", icon: Home, color: "#009460", bg: "bg-[#009460]", border: "border-[#009460]", light: "bg-[#009460]/10" },
  { label: "Taxation", icon: Calculator, color: "#1B3A6B", bg: "bg-[#1B3A6B]", border: "border-[#1B3A6B]", light: "bg-[#1B3A6B]/10" },
];

export function ContribuableFormEnhanced({
  initial, onSave, onClose, communeConfig,
}: {
  initial?: Partial<Contribuable>;
  onSave: (c: Contribuable) => void;
  onClose: () => void;
  communeConfig?: CommuneConfig;
}) {
  const COMMUNES = useMemo<Commune[]>(() => {
    if (!communeConfig) return COMMUNES_MAMOU;
    return communeConfig.communes;
  }, [communeConfig]);

  const communeCode = communeConfig?.code ?? "MOU";
  const defaultCommune = COMMUNES[0]?.nom ?? "Commune Urbaine de Mamou";
  const defaultDistrict = COMMUNES[0]?.districts[0]?.nom ?? "Centre-ville";
  const defaultSecteur = COMMUNES[0]?.districts[0]?.secteurs[0] ?? "Secteur 1 — Marché Central";

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Partial<Contribuable>>({
    nom: "", prenom: "", telephone: "", email: "", nin: "",
    commune: defaultCommune,
    district: defaultDistrict,
    quartier: defaultDistrict,
    secteur: defaultSecteur,
    adresseContribuable: "", localisationActivite: "", coordGps: "",
    type: "Résidentiel", usage: "Habitation principale",
    surface: 0, categorie: "B",
    memeProprietaire: true,
    nomProprietaire: "", prenomProprietaire: "", telephoneProprietaire: "", emailProprietaire: "", ninProprietaire: "",
    valeurLocative: true, valeur: 0, montantForfaitaire: 0,
    periodeTaxe: "Annuel", statusOccupation: "Occupé",
    statut: "En attente", date: new Date().toISOString().slice(0, 10),
    pourcentageEtat: 15, pourcentageAgent: 5, pourcentageCommune: 80,
    ...initial,
  });

  // Camera states (partagé entre contribuable et bâtiment via cameraTarget)
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<"contribuable" | "batiment">("contribuable");
  const [cameraError, setCameraError] = useState("");
  // "capture" = file input avec capture=environment/user (contourne la permission navigateur)
  const [useCaptureMode, setUseCaptureMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileBatInputRef = useRef<HTMLInputElement>(null);
  const captureContribRef = useRef<HTMLInputElement>(null);
  const captureBatRef = useRef<HTMLInputElement>(null);

  // GPS states
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  const setF = (k: keyof Contribuable, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const communeObj = COMMUNES.find(c => c.nom === form.commune) ?? COMMUNES[0];
  const districtObj = communeObj.districts.find(d => d.nom === form.district) ?? communeObj.districts[0];

  const handleCommuneChange = (nom: string) => {
    const c = COMMUNES.find(x => x.nom === nom) ?? COMMUNES[0];
    const d = c.districts[0];
    setForm(f => ({ ...f, commune: nom, district: d.nom, quartier: d.nom, secteur: d.secteurs[0] }));
  };
  const handleDistrictChange = (nom: string) => {
    const d = communeObj.districts.find(x => x.nom === nom) ?? communeObj.districts[0];
    setForm(f => ({ ...f, district: nom, quartier: nom, secteur: d.secteurs[0] }));
  };

  const gpsWatchRef = useRef<number | null>(null);
  const [gpsMethod, setGpsMethod] = useState<"gps" | "ip" | null>(null);

  const stopGpsWatch = () => {
    if (gpsWatchRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchRef.current);
      gpsWatchRef.current = null;
    }
  };

  // Fallback : géolocalisation par IP (ne nécessite aucune permission)
  const locateByIP = async () => {
    setGpsLoading(true);
    setGpsError("");
    setGpsAccuracy(null);
    setGpsMethod("ip");
    try {
      // ipapi.co — HTTPS, gratuit, sans clé, CORS ok
      const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(8000) });
      const data = await res.json();
      if (data.latitude && data.longitude) {
        setF("coordGps", `${Number(data.latitude).toFixed(6)}, ${Number(data.longitude).toFixed(6)}`);
        // La précision par IP est d'environ 1–5 km — on l'indique
        setGpsAccuracy(3000);
        setGpsLoading(false);
      } else {
        throw new Error(data.reason ?? "Échec");
      }
    } catch {
      setGpsLoading(false);
      setGpsMethod(null);
      setGpsError("Impossible de déterminer la position automatiquement. Entrez les coordonnées manuellement ci-dessous.");
    }
  };

  // GPS via watchPosition — acquisition progressive, s'arrête quand précision ≤ 50 m
  const handleGPS = async (silent = false) => {
    if (!navigator.geolocation) {
      // Pas de géolocalisation du tout → fallback IP
      if (!silent) await locateByIP();
      return;
    }

    // Vérifier l'état de la permission AVANT de tenter l'accès
    let permState: PermissionState = "prompt";
    try {
      const result = await navigator.permissions.query({ name: "geolocation" as PermissionName });
      permState = result.state;
    } catch { /* navigateurs qui ne supportent pas l'API Permissions */ }

    if (permState === "denied") {
      // Permission bloquée — basculer directement sur IP sans afficher d'erreur inutile
      if (!silent) await locateByIP();
      return;
    }

    stopGpsWatch();
    setGpsLoading(true);
    setGpsError("");
    setGpsAccuracy(null);
    setGpsMethod("gps");

    const timeout = setTimeout(async () => {
      stopGpsWatch();
      // Timeout → essayer IP en silence
      await locateByIP();
    }, 15000);

    gpsWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setF("coordGps", `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setGpsAccuracy(Math.round(accuracy));
        if (accuracy <= 50) {
          clearTimeout(timeout);
          stopGpsWatch();
          setGpsLoading(false);
        }
      },
      async (err) => {
        clearTimeout(timeout);
        stopGpsWatch();
        if (err.code === 1) {
          // Permission refusée → fallback IP automatique
          if (!silent) await locateByIP();
          else setGpsLoading(false);
        } else {
          setGpsLoading(false);
          if (!silent) {
            setGpsError(
              err.code === 2
                ? "Signal GPS absent. Placez-vous en extérieur et réessayez."
                : "Position indisponible. Entrez les coordonnées manuellement."
            );
          }
        }
      },
      { enableHighAccuracy: true, timeout: 14000, maximumAge: 0 }
    );
  };

  // Nettoyage au démontage
  useEffect(() => () => { stopGpsWatch(); }, []);

  // Capture automatique dès que l'étape Localisation s'ouvre et que le champ est vide
  useEffect(() => {
    if (step === 0 && !form.coordGps) {
      handleGPS(true);
    }
    // Forcer le démarrage de la caméra dès que l'étape photo du contribuable est atteinte
    if (step === 1 && !form.photoContribuable && !cameraActive) {
      const timer = setTimeout(() => startCamera("contribuable"), 300);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Camera capture — essaie getUserMedia, bascule sur input capture si permission refusée
  const startCamera = async (target: "contribuable" | "batiment" = "contribuable") => {
    setCameraError("");
    setCameraTarget(target);

    // Vérifier l'état de la permission caméra avant d'appeler getUserMedia
    let permState: PermissionState = "prompt";
    try {
      const result = await navigator.permissions.query({ name: "camera" as PermissionName });
      permState = result.state;
    } catch { /* API Permissions non supportée */ }

    if (permState === "denied") {
      // Basculer directement sur le mode capture (ouverture caméra OS sans permission navigateur)
      setUseCaptureMode(true);
      setTimeout(() => {
        if (target === "batiment") captureBatRef.current?.click();
        else captureContribRef.current?.click();
      }, 50);
      return;
    }

    const facingMode = target === "batiment" ? "environment" : "user";
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setUseCaptureMode(false);
      setCameraActive(true);
    } catch (e: any) {
      // Refus au dialog → basculer silencieusement sur capture OS
      setUseCaptureMode(true);
      setTimeout(() => {
        if (target === "batiment") captureBatRef.current?.click();
        else captureContribRef.current?.click();
      }, 50);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    if (cameraTarget === "batiment") {
      setF("photosBatiment", [...(form.photosBatiment ?? []), dataUrl]);
    } else {
      setF("photoContribuable", dataUrl);
    }
    stopCamera();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setF("photoContribuable", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleBatFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setF("photosBatiment", [...(form.photosBatiment ?? []), reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), []);

  // Auto-calc montant
  const cat = CATEGORIES_FISCALES.find(c => c.code === form.categorie) ?? CATEGORIES_FISCALES[1];
  const per = PERIODES.find(p => p.code === form.periodeTaxe) ?? PERIODES[5];
  const baseAnnuel = form.valeurLocative ? (form.valeur ?? 0) * per.mult : (form.montantForfaitaire ?? 0) * per.mult;
  const montantCalc = form.valeurLocative ? Math.round(baseAnnuel * cat.taux / 100) : Math.round((form.montantForfaitaire ?? 0) * per.mult);

  const partEtat = form.pourcentageEtat ?? 15;
  const partAgent = form.pourcentageAgent ?? 5;
  const partCommune = form.pourcentageCommune ?? 80;
  const totalPct = partEtat + partAgent + partCommune;

  const usages = USAGES_BIEN[form.type ?? "Résidentiel"] ?? [];
  useEffect(() => {
    const opts = USAGES_BIEN[form.type ?? "Résidentiel"] ?? [];
    if (!opts.includes(form.usage ?? "")) setF("usage", opts[0] ?? "");
  }, [form.type]);

  const canNext = () => {
    if (step === 0) return !!(form.commune && form.district && form.secteur);
    if (step === 1) return !!(form.nom && form.prenom && form.telephone);
    if (step === 2) return !!(form.type && form.surface);
    return totalPct === 100;
  };

  const handleSave = () => {
    if (totalPct !== 100) { alert(`Les pourcentages doivent totaliser 100% (actuellement ${totalPct}%)`); return; }
    const c: Contribuable = {
      id: initial?.id ?? `${communeCode}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`,
      nom: form.nom!, prenom: form.prenom!, telephone: form.telephone!, email: form.email,
      nin: form.nin ?? "", commune: form.commune!, district: form.district!,
      quartier: form.district!, secteur: form.secteur!,
      adresseContribuable: form.adresseContribuable, localisationActivite: form.localisationActivite,
      coordGps: form.coordGps ?? "", type: form.type!, usage: form.usage!, surface: Number(form.surface),
      categorie: form.categorie!, memeProprietaire: form.memeProprietaire,
      nomProprietaire: form.memeProprietaire ? form.nom : form.nomProprietaire,
      prenomProprietaire: form.memeProprietaire ? form.prenom : form.prenomProprietaire,
      telephoneProprietaire: form.memeProprietaire ? form.telephone : form.telephoneProprietaire,
      emailProprietaire: form.memeProprietaire ? form.email : form.emailProprietaire,
      ninProprietaire: form.memeProprietaire ? form.nin : form.ninProprietaire,
      valeurLocative: form.valeurLocative, valeur: form.valeurLocative ? Number(form.valeur) : 0,
      montantForfaitaire: form.valeurLocative ? 0 : Number(form.montantForfaitaire),
      periodeTaxe: form.periodeTaxe!, statusOccupation: form.statusOccupation!,
      statut: form.statut!, date: form.date!,
      pourcentageEtat: partEtat, pourcentageAgent: partAgent, pourcentageCommune: partCommune,
      photoContribuable: form.photoContribuable, photosBatiment: form.photosBatiment,
      plansCadastraux: form.plansCadastraux, documentsJustificatifs: form.documentsJustificatifs,
    };
    onSave(c);
  };

  const sc = STEP_CONFIG[step];

  return (
    <div className="flex flex-col" style={{ maxHeight: "82vh" }}>
      {/* Progress bar */}
      <div className="px-6 pt-5 pb-4 shrink-0">
        <div className="flex items-center gap-0">
          {STEP_CONFIG.map((s, i) => {
            const done = i < step; const active = i === step; const Icon = s.icon;
            return (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <button type="button" onClick={() => i < step && setStep(i)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-mono transition-all border ${active ? `${s.bg} text-white ${s.border} shadow-sm` : done ? "bg-emerald-100 text-emerald-700 border-emerald-200 cursor-pointer" : "bg-secondary text-muted-foreground border-border cursor-default"}`}
                >
                  {done ? <CheckCircle2 size={12} /> : <Icon size={12} />}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </button>
                {i < STEP_CONFIG.length - 1 && <div className={`h-px flex-1 mx-1 transition-colors ${done ? "bg-emerald-300" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>
        <div className={`mt-3 px-3 py-1.5 rounded-sm text-xs font-mono ${sc.light} border ${sc.border}/30`} style={{ color: sc.color }}>
          Étape {step + 1} sur 4 — {sc.label}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-5">

        {/* ── STEP 0 — Localisation ─────────────────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Field label="Commune / Sous-préfecture" required>
                <select className={selectCls} value={form.commune} onChange={e => handleCommuneChange(e.target.value)}>
                  {COMMUNES.map(c => <option key={c.nom} value={c.nom}>{c.nom}</option>)}
                </select>
                <p className="text-[10px] font-mono text-muted-foreground mt-1">{communeObj.districts.length} districts disponibles</p>
              </Field>
              <Field label="District / Quartier" required>
                <select className={selectCls} value={form.district} onChange={e => handleDistrictChange(e.target.value)}>
                  {communeObj.districts.map(d => <option key={d.nom} value={d.nom}>{d.nom}</option>)}
                </select>
                <p className="text-[10px] font-mono text-muted-foreground mt-1">{districtObj.secteurs.length} secteurs dans ce district</p>
              </Field>
              <Field label="Secteur" required>
                <select className={selectCls} value={form.secteur} onChange={e => setF("secteur", e.target.value)}>
                  {districtObj.secteurs.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Adresse complète du contribuable">
              <input className={inputCls} value={form.adresseContribuable ?? ""} onChange={e => setF("adresseContribuable", e.target.value)} placeholder="Rue, quartier, numéro de parcelle…" />
            </Field>

            <div>
              <label className="flex items-center gap-2 text-xs font-mono text-muted-foreground cursor-pointer mb-2">
                <input type="checkbox" className="w-3.5 h-3.5 accent-[#CE1126]"
                  checked={!!form.localisationActivite}
                  onChange={e => setF("localisationActivite", e.target.checked ? " " : "")}
                />
                L'adresse de l'activité est différente de l'adresse de domicile
              </label>
              {!!form.localisationActivite && (
                <input className={inputCls} value={form.localisationActivite} onChange={e => setF("localisationActivite", e.target.value)} placeholder="Adresse précise de l'activité" />
              )}
            </div>

            {/* ── GPS ─────────────────────────────────────────────────── */}
            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Coordonnées GPS
              </label>

              {/* Bouton principal — grande zone tactile, très visible */}
              <button
                type="button"
                onClick={() => handleGPS(false)}
                disabled={gpsLoading}
                className="w-full flex items-center justify-center gap-3 rounded-sm transition-all active:scale-95 touch-manipulation"
                style={{
                  padding: "14px 16px",
                  background: gpsLoading
                    ? "linear-gradient(135deg,#5A6F8C,#3D5070)"
                    : form.coordGps
                    ? "linear-gradient(135deg,#007848,#009460)"
                    : "linear-gradient(135deg,#CE1126,#8B0A1A)",
                  color: "white",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "JetBrains Mono, monospace",
                  boxShadow: gpsLoading ? "none" : "0 3px 12px rgba(0,0,0,0.25)",
                  opacity: gpsLoading ? 0.85 : 1,
                }}
              >
                {gpsLoading ? (
                  <>
                    <span className="relative flex h-4 w-4 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50" />
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-white/80" />
                    </span>
                    {gpsMethod === "ip" ? "Localisation par réseau…" : "Acquisition GPS…"}
                  </>
                ) : form.coordGps ? (
                  <>
                    <Navigation size={18} />
                    Recapturer ma position
                  </>
                ) : (
                  <>
                    <Navigation size={18} />
                    Ma position — Localiser automatiquement
                  </>
                )}
              </button>

              {/* Champ coordonnées (lecture + édition manuelle) */}
              <div className="flex gap-2">
                <input
                  className={`${inputCls} flex-1 font-mono text-xs`}
                  value={form.coordGps ?? ""}
                  onChange={e => { setF("coordGps", e.target.value); setGpsAccuracy(null); }}
                  placeholder={gpsLoading ? "Acquisition en cours…" : "lat, lng  ou  entrez manuellement"}
                  readOnly={gpsLoading}
                  inputMode="decimal"
                />
              </div>

              {/* État GPS */}
              {gpsLoading && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-sm">
                  <Loader2 size={12} className="animate-spin text-blue-600 shrink-0" />
                  <div className="text-[10px] font-mono text-blue-700 leading-relaxed">
                    {gpsMethod === "ip"
                      ? <><span className="font-semibold">Localisation par réseau…</span> (GPS indisponible)</>
                      : <><span className="font-semibold">GPS actif</span> — Restez à l'extérieur{gpsAccuracy !== null && ` · ±${gpsAccuracy} m`}</>
                    }
                  </div>
                </div>
              )}
              {gpsError && (
                <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-300 rounded-sm">
                  <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] font-mono text-amber-800 leading-relaxed">
                    {gpsError}
                  </div>
                </div>
              )}
              {form.coordGps && !gpsError && !gpsLoading && (
                <div className="flex items-center gap-3 px-3 py-2 bg-green-50 border border-green-200 rounded-sm">
                  <CheckCircle2 size={13} className="text-[#009460] shrink-0" />
                  <div className="text-[10px] font-mono text-[#007848] leading-relaxed">
                    <span className="font-semibold">Position enregistrée</span>
                    {gpsMethod === "ip"
                      ? " · via réseau (précision ~1–5 km — vérifiez sur la carte)"
                      : gpsAccuracy !== null
                        ? ` · ±${gpsAccuracy} m${gpsAccuracy <= 10 ? " ✓✓ Excellente" : gpsAccuracy <= 50 ? " ✓ Bonne" : ""}`
                        : ""
                    }
                  </div>
                </div>
              )}
              <p className="text-[9px] font-mono text-muted-foreground/50">
                Exemple : 10.380100, -12.087100
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 1 — Contribuable & Propriétaire ─────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            <p className="text-xs font-mono text-muted-foreground border-l-2 pl-3 italic" style={{ borderColor: "#B8860B" }}>Identité du contribuable</p>

            {/* Photo contribuable */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground">Photo du contribuable</label>
              {cameraActive ? (
                <div className="space-y-2">
                  <video ref={videoRef} className="w-full max-h-48 rounded-sm bg-black object-cover" autoPlay playsInline muted />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex gap-2">
                    <button type="button" onClick={capturePhoto}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-sm bg-[#B8860B] text-white hover:opacity-90 transition-opacity flex-1">
                      <Camera size={12} /> Capturer
                    </button>
                    <button type="button" onClick={stopCamera}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-sm border border-border hover:bg-secondary transition-colors">
                      <VideoOff size={12} /> Arrêter
                    </button>
                  </div>
                </div>
              ) : form.photoContribuable ? (
                <div className="relative inline-block">
                  <img src={form.photoContribuable} alt="Photo contribuable" className="w-24 h-24 rounded-sm object-cover border-2 border-[#B8860B]" />
                  <button type="button" onClick={() => setF("photoContribuable", undefined)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button type="button" onClick={() => startCamera("contribuable")}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-sm border border-[#B8860B]/40 text-[#B8860B] hover:bg-[#B8860B]/10 transition-colors">
                    <Video size={12} /> Prendre une photo
                  </button>
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-sm border border-border text-muted-foreground hover:bg-secondary transition-colors">
                    <Upload size={12} /> Importer
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileImport} />
                  {/* Input capture OS — contourne la permission navigateur */}
                  <input ref={captureContribRef} type="file" accept="image/*" capture="user" className="hidden"
                    onChange={e => { handleFileImport(e); setUseCaptureMode(false); }} />
                </div>
              )}
              {cameraError && <p className="text-[10px] font-mono text-red-600">{cameraError}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Nom de famille" required>
                <input className={inputCls} value={form.nom} onChange={e => setF("nom", e.target.value)} placeholder="ex. Diallo" />
              </Field>
              <Field label="Prénom(s)" required>
                <input className={inputCls} value={form.prenom} onChange={e => setF("prenom", e.target.value)} placeholder="ex. Mamadou" />
              </Field>
              <Field label="Téléphone" required>
                <input className={inputCls} value={form.telephone} onChange={e => setF("telephone", e.target.value)} placeholder="+224 6XX XX XX XX" />
              </Field>
              <Field label="Email">
                <input type="email" className={inputCls} value={form.email ?? ""} onChange={e => setF("email", e.target.value)} placeholder="exemple@email.gn" />
              </Field>
              <Field label="N° Identification nationale (NIN)">
                <input className={inputCls} value={form.nin ?? ""} onChange={e => setF("nin", e.target.value)} placeholder="ex. GN2401234567" />
              </Field>
              <Field label="Statut fiscal">
                <select className={selectCls} value={form.statut} onChange={e => setF("statut", e.target.value)}>
                  {["En attente", "Payé", "Arriéré"].map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            <div className="border-t border-border pt-4">
              <label className="flex items-center gap-2 text-xs font-mono text-muted-foreground cursor-pointer mb-3">
                <input type="checkbox" className="w-3.5 h-3.5 accent-[#B8860B]"
                  checked={form.memeProprietaire !== false}
                  onChange={e => setF("memeProprietaire", e.target.checked)}
                />
                <span className="font-medium text-foreground">Le contribuable est aussi le propriétaire du bien</span>
              </label>
              {form.memeProprietaire === false && (
                <div className="space-y-3 p-4 bg-[#B8860B]/5 border border-[#B8860B]/20 rounded-sm">
                  <p className="text-xs font-mono text-[#B8860B] font-medium">Informations du propriétaire</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Nom propriétaire">
                      <input className={inputCls} value={form.nomProprietaire ?? ""} onChange={e => setF("nomProprietaire", e.target.value)} />
                    </Field>
                    <Field label="Prénom propriétaire">
                      <input className={inputCls} value={form.prenomProprietaire ?? ""} onChange={e => setF("prenomProprietaire", e.target.value)} />
                    </Field>
                    <Field label="Téléphone propriétaire">
                      <input className={inputCls} value={form.telephoneProprietaire ?? ""} onChange={e => setF("telephoneProprietaire", e.target.value)} />
                    </Field>
                    <Field label="Email propriétaire">
                      <input className={inputCls} value={form.emailProprietaire ?? ""} onChange={e => setF("emailProprietaire", e.target.value)} />
                    </Field>
                    <Field label="NIN propriétaire">
                      <input className={inputCls} value={form.ninProprietaire ?? ""} onChange={e => setF("ninProprietaire", e.target.value)} />
                    </Field>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2 — Bien & Occupation ────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Type de bien" required>
                <select className={selectCls} value={form.type} onChange={e => setF("type", e.target.value)}>
                  {TYPES_BIEN.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Usage" required>
                <select className={selectCls} value={form.usage} onChange={e => setF("usage", e.target.value)}>
                  {usages.map(u => <option key={u}>{u}</option>)}
                </select>
              </Field>
              <Field label="Surface (m²)" required>
                <input type="number" className={inputCls} value={form.surface || ""} onChange={e => setF("surface", e.target.value)} min="0" placeholder="0" />
              </Field>
              <Field label="Date de recensement">
                <input type="date" className={inputCls} value={form.date} onChange={e => setF("date", e.target.value)} />
              </Field>
            </div>

            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">Statut d'occupation</p>
              <div className="flex gap-2">
                {["Occupé", "Inoccupé"].map(s => (
                  <button key={s} type="button" onClick={() => setF("statusOccupation", s)}
                    className={`flex-1 py-2 text-sm font-mono rounded-sm border transition-all ${form.statusOccupation === s ? (s === "Occupé" ? "bg-[#009460] text-white border-[#009460]" : "bg-amber-500 text-white border-amber-500") : "bg-card border-border text-muted-foreground hover:border-[#009460]/50"}`}
                  >{s}</button>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Mode de calcul fiscal</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setF("valeurLocative", true)}
                  className={`flex-1 py-2 text-sm font-mono rounded-sm border transition-all ${form.valeurLocative ? "bg-[#009460] text-white border-[#009460]" : "bg-card border-border text-muted-foreground"}`}>
                  Valeur locative applicable
                </button>
                <button type="button" onClick={() => setF("valeurLocative", false)}
                  className={`flex-1 py-2 text-sm font-mono rounded-sm border transition-all ${!form.valeurLocative ? "bg-[#009460] text-white border-[#009460]" : "bg-card border-border text-muted-foreground"}`}>
                  Forfait
                </button>
              </div>
              {form.valeurLocative ? (
                <Field label="Valeur locative annuelle (GNF)">
                  <input type="number" className={inputCls} value={form.valeur || ""} onChange={e => setF("valeur", e.target.value)} min="0" placeholder="ex. 2 400 000" />
                </Field>
              ) : (
                <Field label="Montant forfaitaire de base (GNF)">
                  <input type="number" className={inputCls} value={form.montantForfaitaire || ""} onChange={e => setF("montantForfaitaire", e.target.value)} min="0" placeholder="ex. 50 000" />
                </Field>
              )}
            </div>

            {/* Photos du bâtiment */}
            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Photos du bâtiment</p>
              {/* Caméra active pour bâtiment */}
              {cameraActive && cameraTarget === "batiment" ? (
                <div className="space-y-2">
                  <video ref={videoRef} className="w-full max-h-44 rounded-sm bg-black object-cover" autoPlay playsInline muted />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex gap-2">
                    <button type="button" onClick={capturePhoto}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-sm bg-[#1B3A6B] text-white hover:opacity-90 transition-opacity flex-1">
                      <Camera size={12} /> Capturer
                    </button>
                    <button type="button" onClick={stopCamera}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-sm border border-border hover:bg-secondary transition-colors">
                      <VideoOff size={12} /> Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Galerie photos bâtiment */}
                  {form.photosBatiment && form.photosBatiment.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {form.photosBatiment.map((p, i) => (
                        <div key={i} className="relative">
                          <img src={p} alt={`Bâtiment ${i + 1}`} className="w-20 h-20 rounded-sm object-cover border border-[#1B3A6B]/30" />
                          <button type="button"
                            onClick={() => setF("photosBatiment", form.photosBatiment!.filter((_, j) => j !== i))}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => startCamera("batiment")}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-sm border border-[#1B3A6B]/40 text-[#1B3A6B] hover:bg-[#1B3A6B]/10 transition-colors">
                      <Camera size={12} /> Photographier
                    </button>
                    <button type="button" onClick={() => fileBatInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-sm border border-border text-muted-foreground hover:bg-secondary transition-colors">
                      <Upload size={12} /> Importer
                    </button>
                    <input ref={fileBatInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleBatFileImport} />
                    {/* Input capture OS bâtiment — caméra arrière sans permission navigateur */}
                    <input ref={captureBatRef} type="file" accept="image/*" capture="environment" className="hidden"
                      onChange={e => { handleBatFileImport(e); setUseCaptureMode(false); }} />
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Période de paiement</p>
              <div className="grid grid-cols-3 gap-2">
                {PERIODES.map(p => (
                  <button key={p.code} type="button" onClick={() => setF("periodeTaxe", p.code)}
                    className={`py-2 px-1 text-xs font-mono rounded-sm border transition-all ${form.periodeTaxe === p.code ? "bg-[#009460] text-white border-[#009460]" : "bg-card border-border text-muted-foreground hover:border-[#009460]/40"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3 — Taxation & Recouvrement ────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Catégorie fiscale</p>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES_FISCALES.map(c => (
                  <button key={c.code} type="button" onClick={() => setF("categorie", c.code)}
                    className={`py-3 text-xs font-mono rounded-sm border transition-all ${form.categorie === c.code ? "bg-[#1B3A6B] text-white border-[#1B3A6B]" : "bg-card border-border text-muted-foreground hover:border-[#1B3A6B]/40"}`}>
                    <div className="font-bold text-base">{c.code}</div>
                    <div className="text-[10px] mt-0.5">{c.taux}%</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#1B3A6B]/5 border border-[#1B3A6B]/20 rounded-sm space-y-2">
              <p className="text-xs font-mono text-[#1B3A6B] font-medium uppercase tracking-widest">Simulation fiscale automatique</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="text-muted-foreground">Mode</div>
                <div className="font-medium">{form.valeurLocative ? "Valeur locative" : "Forfait"}</div>
                <div className="text-muted-foreground">Base imposable</div>
                <div className="font-medium">{(form.valeurLocative ? (form.valeur ?? 0) : (form.montantForfaitaire ?? 0)).toLocaleString("fr-FR")} GNF</div>
                <div className="text-muted-foreground">Période (×{per.mult})</div>
                <div className="font-medium">{form.periodeTaxe}</div>
                <div className="text-muted-foreground">Taux CFU Cat. {form.categorie}</div>
                <div className="font-medium">{cat.taux}%</div>
              </div>
              <div className="border-t border-[#1B3A6B]/20 pt-2 flex items-center justify-between">
                <span className="text-xs font-mono text-[#1B3A6B] font-bold">MONTANT TOTAL ANNUEL</span>
                <span className="text-lg font-bold text-[#1B3A6B]" style={{ fontFamily: "'Crimson Pro', serif" }}>
                  {montantCalc.toLocaleString("fr-FR")} GNF
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Répartition du recouvrement</p>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-sm ${totalPct === 100 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {totalPct}% / 100%
                </span>
              </div>
              {[
                { key: "pourcentageEtat" as keyof Contribuable, label: "Part de l'État", val: partEtat },
                { key: "pourcentageAgent" as keyof Contribuable, label: "Part de l'Agent", val: partAgent },
                { key: "pourcentageCommune" as keyof Contribuable, label: "Part de la Commune", val: partCommune },
              ].map(({ key, label, val }) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground">{label}</span>
                    <div className="flex items-center gap-2">
                      <input type="number" min="0" max="100"
                        className="w-14 px-2 py-0.5 text-xs font-mono bg-input-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary text-center"
                        value={val} onChange={e => setF(key, Number(e.target.value))} />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>
                  <input type="range" min="0" max="100" value={val}
                    onChange={e => setF(key, Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none bg-border accent-[#1B3A6B]" />
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-sm border border-border">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="px-3 py-2 text-left text-muted-foreground">Bénéficiaire</th>
                    <th className="px-3 py-2 text-right text-muted-foreground">%</th>
                    <th className="px-3 py-2 text-right text-muted-foreground">Montant (GNF)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "État", pct: partEtat },
                    { label: "Agent recenseur", pct: partAgent },
                    { label: "Commune de Mamou", pct: partCommune },
                  ].map(r => (
                    <tr key={r.label} className="border-t border-border/50">
                      <td className="px-3 py-2">{r.label}</td>
                      <td className="px-3 py-2 text-right">{r.pct}%</td>
                      <td className="px-3 py-2 text-right text-primary font-medium">{Math.round(montantCalc * r.pct / 100).toLocaleString("fr-FR")}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-border bg-secondary/30 font-bold">
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-right">{totalPct}%</td>
                    <td className="px-3 py-2 text-right text-primary">{montantCalc.toLocaleString("fr-FR")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border flex items-center justify-between shrink-0 bg-card/50">
        <button type="button" onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors">
          <ChevronLeft size={14} /> {step === 0 ? "Annuler" : "Précédent"}
        </button>
        <div className="flex gap-1">
          {STEP_CONFIG.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === step ? "w-6" : "w-2"}`}
              style={{ background: i <= step ? sc.color : "#d1d5db" }} />
          ))}
        </div>
        {step < 3 ? (
          <button type="button" onClick={() => canNext() && setStep(s => s + 1)} disabled={!canNext()}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-mono rounded-sm transition-all"
            style={{ background: canNext() ? sc.color : undefined, color: canNext() ? "white" : undefined, opacity: canNext() ? 1 : 0.5 }}>
            Suivant <ChevronRight size={14} />
          </button>
        ) : (
          <button type="button" onClick={handleSave} disabled={totalPct !== 100}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-mono rounded-sm transition-all"
            style={{ background: totalPct === 100 ? "#1B3A6B" : undefined, color: totalPct === 100 ? "white" : undefined, opacity: totalPct === 100 ? 1 : 0.5 }}>
            <Save size={14} /> Enregistrer
          </button>
        )}
      </div>
    </div>
  );
}
