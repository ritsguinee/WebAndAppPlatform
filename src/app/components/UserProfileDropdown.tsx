import { useState, useRef, useEffect } from "react";
import {
  ChevronDown, User, Mail, Phone, Calendar, Shield, LogOut, Clock, MapPin,
  Camera, Upload, X, Video, VideoOff, Trash2, Edit2,
} from "lucide-react";

interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  email: string;
  telephone: string;
  derniere: string;
  statut: string;
  dateCreation: string;
  identifiant?: string;
}

interface UserProfileDropdownProps {
  user: Utilisateur;
  onLogout: () => void;
  onPhotoChange?: () => void;
}

const ROLE_COLORS: Record<string, string> = {
  "Administrateur": "#CE1126",
  "Maire": "#1B3A6B",
  "Receveur municipal": "#B8860B",
  "Superviseur": "#009460",
  "Agent recenseur": "#6366f1",
  "Agent recouvrement": "#f59e0b",
};

function getProfilePhotoKey(userId: string) {
  return `snrr_profile_photo_${userId}`;
}

export function UserProfileDropdown({ user, onLogout, onPhotoChange }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(() => {
    return localStorage.getItem(getProfilePhotoKey(user.id));
  });
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (!cameraActive) setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, cameraActive]);

  // Save photo to localStorage whenever it changes
  const savePhoto = (dataUrl: string | null) => {
    if (dataUrl) {
      localStorage.setItem(getProfilePhotoKey(user.id), dataUrl);
    } else {
      localStorage.removeItem(getProfilePhotoKey(user.id));
    }
    setProfilePhoto(dataUrl);
    onPhotoChange?.();
  };

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setCameraError("Accès à la caméra refusé. Autorisez l'accès dans les paramètres du navigateur.");
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
    const video = videoRef.current;
    // Crop to square from center
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.beginPath();
    ctx.arc(128, 128, 128, 0, Math.PI * 2);
    ctx.clip();
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 256, 256);
    ctx.restore();
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    savePhoto(dataUrl);
    stopCamera();
    setShowPhotoEditor(false);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      // Crop to 256×256 circle via canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const size = Math.min(img.width, img.height);
        ctx.save();
        ctx.beginPath();
        ctx.arc(128, 128, 128, 0, Math.PI * 2);
        ctx.clip();
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 256, 256);
        ctx.restore();
        savePhoto(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    setShowPhotoEditor(false);
    e.target.value = "";
  };

  const removePhoto = () => {
    savePhoto(null);
    setShowPhotoEditor(false);
  };

  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), []);

  const roleColor = ROLE_COLORS[user.role] ?? "#1B3A6B";
  const initials = `${user.nom[0] ?? ""}${user.prenom[0] ?? ""}`.toUpperCase();

  // Avatar component — reused in topbar chip and dropdown header
  const Avatar = ({ size, className = "" }: { size: number; className?: string }) => (
    profilePhoto ? (
      <img
        src={profilePhoto}
        alt={`${user.prenom} ${user.nom}`}
        className={`rounded-full object-cover border-2 border-white/30 ${className}`}
        style={{ width: size, height: size }}
      />
    ) : (
      <div
        className={`rounded-full flex items-center justify-center text-white font-bold font-mono border-2 border-white/20 ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.35, background: roleColor }}
      >
        {initials}
      </div>
    )
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Topbar trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-3 border-l border-border hover:bg-secondary/50 transition-colors rounded-sm px-2 py-1"
      >
        <div className="flex-col items-end mr-2 hidden lg:flex">
          <p className="text-xs font-medium text-foreground">{user.prenom} {user.nom}</p>
          <p className="text-[10px] text-muted-foreground font-mono">{user.role}</p>
        </div>
        <Avatar size={28} />
        <ChevronDown size={12} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-sm shadow-2xl z-50 overflow-hidden">

          {/* ── Header avec photo ── */}
          <div className="relative bg-gradient-to-r from-[#CE1126] via-[#FCD116] to-[#009460] px-5 py-5">
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative flex items-center gap-4">
              {/* Photo + bouton modifier */}
              <div className="relative shrink-0">
                <Avatar size={56} className="border-2 border-white/50 shadow-lg" />
                <button
                  onClick={(e) => { e.stopPropagation(); setShowPhotoEditor(v => !v); }}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
                  title="Modifier la photo de profil"
                >
                  <Edit2 size={11} className="text-[#1B3A6B]" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight">{user.prenom} {user.nom}</p>
                {user.identifiant && (
                  <p className="text-white/70 text-[10px] font-mono">@{user.identifiant}</p>
                )}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-mono mt-1.5 bg-white/20 text-white border border-white/30">
                  <Shield size={9} />
                  {user.role}
                </div>
              </div>
            </div>

            {/* Photo editor panel */}
            {showPhotoEditor && (
              <div className="relative mt-4 bg-black/40 backdrop-blur-sm rounded-sm p-3 space-y-2">
                {cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full rounded-sm object-cover"
                      style={{ maxHeight: 180 }}
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-mono bg-white text-[#1B3A6B] rounded-sm hover:bg-white/90 transition-colors font-semibold"
                      >
                        <Camera size={12} /> Capturer
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono bg-white/20 text-white rounded-sm hover:bg-white/30 transition-colors"
                      >
                        <VideoOff size={12} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-white/80 text-[10px] font-mono">Modifier la photo de profil</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-mono bg-white text-[#1B3A6B] rounded-sm hover:bg-white/90 transition-colors font-semibold"
                      >
                        <Video size={11} /> Caméra
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-mono bg-white/20 text-white rounded-sm hover:bg-white/30 transition-colors"
                      >
                        <Upload size={11} /> Importer
                      </button>
                      {profilePhoto && (
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono bg-red-500/70 text-white rounded-sm hover:bg-red-500 transition-colors"
                          title="Supprimer la photo"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {cameraError && (
                  <p className="text-red-300 text-[10px] font-mono">{cameraError}</p>
                )}
                <button
                  type="button"
                  onClick={() => { stopCamera(); setShowPhotoEditor(false); setCameraError(""); }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                >
                  <X size={10} />
                </button>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileImport} />
          </div>

          {/* ── Infos session ── */}
          <div className="px-5 py-4 bg-secondary/30">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
              <User size={10} /> Informations de session
            </p>
            <div className="space-y-2">
              {[
                { icon: Mail, label: "Email", value: user.email },
                { icon: Phone, label: "Téléphone", value: user.telephone },
                { icon: Clock, label: "Dernière connexion", value: user.derniere },
                {
                  icon: Calendar, label: "Membre depuis",
                  value: new Date(user.dateCreation).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }),
                },
                { icon: MapPin, label: "Localisation", value: "Commune Urbaine de Mamou" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2 text-xs">
                  <Icon size={12} className="text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-muted-foreground text-[10px] font-mono mb-0.5">{label}</p>
                    <p className="text-foreground font-mono truncate text-xs">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Statut ── */}
          <div className="px-5 py-3 border-t border-border flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground">Statut du compte</span>
            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium border rounded-sm font-mono tracking-wide ${
              user.statut === "Actif"
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}>
              {user.statut}
            </span>
          </div>

          {/* ── Déconnexion ── */}
          <div className="px-5 py-3 border-t border-border bg-secondary/20">
            <button
              onClick={() => { setIsOpen(false); onLogout(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono bg-[#009460] text-white rounded-sm hover:opacity-90 transition-opacity"
            >
              <LogOut size={13} /> Déconnexion sécurisée
            </button>
          </div>

          {/* ── Footer ── */}
          <div className="px-5 py-2 bg-secondary/10 border-t border-border flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#CE1126]" />
              <div className="w-2 h-2 rounded-full bg-[#FCD116]" />
              <div className="w-2 h-2 rounded-full bg-[#009460]" />
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">SNRR-Mamou · République de Guinée</p>
          </div>
        </div>
      )}
    </div>
  );
}
