import { useRef, useState, useEffect } from "react";
import { Printer, Download, X, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import { NotificationButtons } from "./NotificationButtons";
import watermarkImg from "@/imports/images.jpg";
import logoImg from "@/imports/images__1_.jpg";

interface Contribuable {
  id: string; nom: string; prenom: string; telephone: string; nin: string;
  quartier: string; secteur: string; type: string; usage: string;
  surface: number; valeur: number; statut: string; date: string;
  coordGps: string; categorie: string;
  email?: string;
  commune?: string; district?: string;
  photoContribuable?: string;
  photosBatiment?: string[];
  plansCadastraux?: string[];
  documentsJustificatifs?: string[];
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
  type: "email" | "whatsapp";
  destinataire: string;
  contribuable: string;
  sujet: string;
  statut: "envoyé" | "échoué" | "en cours";
  date: string;
}

interface AvisImpositionProps {
  contribuable: Contribuable;
  onClose: () => void;
  notificationSettings?: NotificationSettings;
  onNotificationSent?: (log: NotificationLog) => void;
}

const now = () =>
  new Date().toLocaleString("fr-FR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });

const fmtShort = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("fr-FR");
};

const TAUX_CFU: Record<string, number> = {
  A: 0.12, B: 0.10, C: 0.08, D: 0.06,
};

export function AvisImpositionEnhanced({
  contribuable,
  onClose,
  notificationSettings,
  onNotificationSent,
}: AvisImpositionProps) {
  const avisRef = useRef<HTMLDivElement>(null);
  const anneeExercice = new Date().getFullYear();
  const dateEmission = now();
  const numAvis = `AVIS-${anneeExercice}-${contribuable.id.split("-").pop()?.padStart(4, "0")}`;
  const dateEcheance = new Date(new Date().setMonth(new Date().getMonth() + 2))
    .toLocaleDateString("fr-FR");
  const [autoSent, setAutoSent] = useState(false);
  const [sendState, setSendState] = useState<"idle" | "sending" | "done">("idle");
  const [pdfLoading, setPdfLoading] = useState(false);

  // Calcul des taxes basé sur la catégorie du contribuable
  const tauxCFU = TAUX_CFU[contribuable.categorie] ?? 0.08;
  const montantCFU = Math.round(contribuable.valeur * tauxCFU);
  const taxePatente = contribuable.type === "Commercial" ? 500_000 : 0;
  const taxeEnseigne = contribuable.type === "Commercial" ? 150_000 : 0;
  const totalDu = montantCFU + taxePatente + taxeEnseigne;
  const penalite = contribuable.statut === "Arriéré" ? Math.round(totalDu * 0.10) : 0;
  const totalFinal = totalDu + penalite;

  const handlePrint = () => {
    if (!avisRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <title>Avis d'imposition ${numAvis}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Crimson Pro', serif; background: #fff; color: #1a1a1a; }
        .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 16mm 18mm; position: relative; }
        .flag-strip { height: 4px; display: flex; margin-bottom: 8mm; }
        .flag-strip div { flex: 1; }
        .header { text-align: center; border-bottom: 2px solid #B8860B; padding-bottom: 8mm; margin-bottom: 6mm; }
        .header h1 { font-size: 22pt; font-weight: 700; color: #1B3A6B; }
        .header h2 { font-size: 16pt; font-weight: 600; color: #B8860B; margin-top: 4px; }
        .header p { font-family: 'JetBrains Mono', monospace; font-size: 8pt; color: #666; }
        .title { text-align: center; padding: 6mm 0; border-bottom: 1px solid #ddd; margin-bottom: 5mm; }
        .title h3 { font-size: 20pt; font-weight: 700; color: #1B3A6B; letter-spacing: 2px; }
        .title p { font-family: monospace; font-size: 8pt; color: #888; margin-top: 2px; }
        .num { font-family: monospace; font-size: 10pt; color: #B8860B; font-weight: 700; margin-top: 3px; }
        section { border: 1px solid rgba(27,58,107,0.2); border-radius: 2px; padding: 5mm; margin-bottom: 4mm; }
        section h4 { font-size: 9pt; font-weight: 700; color: #1B3A6B; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 3mm; margin-bottom: 3mm; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; font-size: 10pt; }
        .grid2 .label { font-family: monospace; font-size: 7pt; color: #888; }
        .grid2 .val { font-weight: 600; }
        .grid2.span2 { grid-column: span 2; }
        table { width: 100%; font-size: 9pt; border-collapse: collapse; }
        tr td { padding: 2.5mm 3mm; border-bottom: 1px solid #eee; }
        .total-row { background: rgba(27,58,107,0.06); }
        .total-row td { font-size: 12pt; font-weight: 700; color: #1B3A6B; }
        .total-row td:last-child { color: #B8860B; }
        .payment-box { background: #fffbf0; border: 1px solid #e6c97a; padding: 4mm; font-size: 9pt; }
        .payment-box h4 { color: #7a5c00; font-size: 9pt; margin-bottom: 3mm; }
        .footer { text-align: center; font-family: monospace; font-size: 7pt; color: #aaa; border-top: 1px solid #eee; padding-top: 4mm; margin-top: 6mm; }
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.04; width: 60%; }
        .sig-row { display: flex; justify-content: space-between; margin-top: 8mm; font-size: 9pt; }
        .sig-box { text-align: center; width: 45%; }
        .sig-line { border-top: 1px solid #ccc; margin-top: 15mm; padding-top: 2mm; font-family: monospace; font-size: 7pt; color: #888; }
      </style>
    </head><body>
      <div class="page">
        <img class="watermark" src="${watermarkImg}" alt="" />
        <div class="flag-strip">
          <div style="background:#CE1126"></div>
          <div style="background:#FCD116"></div>
          <div style="background:#009460"></div>
        </div>
        <div class="header">
          <img src="${logoImg}" alt="Blason" style="width:70px;height:70px;object-fit:contain;margin-bottom:6px;" />
          <h1>RÉPUBLIQUE DE GUINÉE</h1>
          <p style="margin:4px 0">Travail &bull; Justice &bull; Solidarité</p>
          <h2>COMMUNE URBAINE DE MAMOU</h2>
          <p>Préfecture de Mamou &mdash; Service des Impôts et Taxes Locales</p>
          <p style="margin-top:4px">SNRR-Mamou &mdash; Système Numérique de Recensement et de Recouvrement</p>
        </div>
        <div class="title">
          <h3>AVIS D'IMPOSITION</h3>
          <p>Exercice fiscal ${anneeExercice}</p>
          <p class="num">N° ${numAvis}</p>
        </div>
        <section>
          <h4>Informations du Contribuable</h4>
          <div class="grid2">
            <div><div class="label">Nom et Prénoms</div><div class="val">${contribuable.prenom} ${contribuable.nom}</div></div>
            <div><div class="label">N° Identifiant Fiscal</div><div class="val" style="color:#1B3A6B;font-family:monospace">${contribuable.id}</div></div>
            <div><div class="label">Téléphone</div><div class="val">${contribuable.telephone}</div></div>
            <div><div class="label">N° Identification Nationale</div><div class="val">${contribuable.nin || "—"}</div></div>
            <div><div class="label">Adresse</div><div class="val">${contribuable.quartier}, Secteur ${contribuable.secteur}</div></div>
            <div><div class="label">Email</div><div class="val">${contribuable.email || "—"}</div></div>
          </div>
        </section>
        <section>
          <h4>Bien Imposable</h4>
          <div class="grid2">
            <div><div class="label">Type de bien</div><div class="val">${contribuable.type}</div></div>
            <div><div class="label">Usage</div><div class="val">${contribuable.usage}</div></div>
            <div><div class="label">Surface</div><div class="val">${contribuable.surface} m²</div></div>
            <div><div class="label">Catégorie fiscale</div><div class="val">${contribuable.categorie} (taux ${(tauxCFU * 100).toFixed(0)}%)</div></div>
            <div><div class="label">Valeur locative annuelle</div><div class="val">${contribuable.valeur.toLocaleString("fr-FR")} GNF</div></div>
            <div><div class="label">Coordonnées GPS</div><div class="val" style="font-size:8pt;font-family:monospace">${contribuable.coordGps || "—"}</div></div>
          </div>
        </section>
        <section>
          <h4>Détail des Taxes et Montants</h4>
          <table>
            <tr><td>Contribution Foncière Unique (CFU) — Cat. ${contribuable.categorie} — Taux ${(tauxCFU * 100).toFixed(0)}%</td><td style="text-align:right;font-weight:600;font-family:monospace">${montantCFU.toLocaleString("fr-FR")} GNF</td></tr>
            ${contribuable.type === "Commercial" ? `<tr><td>Taxe de Patente (activité commerciale)</td><td style="text-align:right;font-weight:600;font-family:monospace">${taxePatente.toLocaleString("fr-FR")} GNF</td></tr><tr><td>Taxe d'Enseigne</td><td style="text-align:right;font-weight:600;font-family:monospace">${taxeEnseigne.toLocaleString("fr-FR")} GNF</td></tr>` : ""}
            ${penalite > 0 ? `<tr><td style="color:#CE1126">Pénalité de retard (10%)</td><td style="text-align:right;font-weight:600;font-family:monospace;color:#CE1126">${penalite.toLocaleString("fr-FR")} GNF</td></tr>` : ""}
            <tr class="total-row"><td><strong>MONTANT TOTAL À PAYER</strong></td><td style="text-align:right"><strong>${totalFinal.toLocaleString("fr-FR")} GNF</strong></td></tr>
          </table>
        </section>
        <div class="payment-box">
          <h4>&#128197; Modalités de Paiement</h4>
          <p><strong>Date d'émission :</strong> ${dateEmission}</p>
          <p><strong>Date limite de paiement :</strong> ${dateEcheance}</p>
          <p style="margin-top:4mm"><strong>Moyens de paiement acceptés :</strong></p>
          <ul style="margin-left:4mm;margin-top:2mm;font-family:monospace;font-size:8pt">
            <li>&#128242; Orange Money / MTN Money</li>
            <li>&#9654; QR Code fiscal</li>
            <li>&#128176; Espèces — Guichet de la Recette Communale de Mamou</li>
          </ul>
        </div>
        <div class="sig-row">
          <div class="sig-box"><div class="sig-line">Le Contribuable<br/>${contribuable.prenom} ${contribuable.nom}</div></div>
          <div class="sig-box"><div class="sig-line">Le Receveur Municipal<br/>Commune Urbaine de Mamou</div></div>
        </div>
        <div class="footer">
          <p>Document officiel généré par SNRR-Mamou — N° ${numAvis} — ${dateEmission}</p>
          <p style="margin-top:2mm">Pour toute réclamation : Service des Impôts Locaux — Commune de Mamou — Tél : +224 621 00 00 00</p>
        </div>
      </div>
    </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = 210; const M = 18; const CW = W - M * 2;
      let y = 14;

      // Bande tricolore
      doc.setFillColor(206, 17, 38); doc.rect(M, y, CW / 3, 2, "F");
      doc.setFillColor(252, 209, 22); doc.rect(M + CW / 3, y, CW / 3, 2, "F");
      doc.setFillColor(0, 148, 96); doc.rect(M + (CW * 2) / 3, y, CW / 3, 2, "F");
      y += 6;

      // Logo
      try {
        doc.addImage(logoImg, "JPEG", W / 2 - 12, y, 24, 24, "", "FAST");
      } catch { /* logo optionnel */ }
      y += 28;

      // En-tête
      doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(27, 58, 107);
      doc.text("RÉPUBLIQUE DE GUINÉE", W / 2, y, { align: "center" }); y += 5;
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(120, 120, 120);
      doc.text("Travail · Justice · Solidarité", W / 2, y, { align: "center" }); y += 5;
      doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(184, 134, 11);
      doc.text("COMMUNE URBAINE DE MAMOU", W / 2, y, { align: "center" }); y += 5;
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(120, 120, 120);
      doc.text("Préfecture de Mamou · Service des Impôts et Taxes Locales · SNRR-Mamou", W / 2, y, { align: "center" }); y += 6;
      doc.setDrawColor(184, 134, 11); doc.setLineWidth(0.5); doc.line(M, y, M + CW, y); y += 7;

      // Titre
      doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(27, 58, 107);
      doc.text("AVIS D'IMPOSITION", W / 2, y, { align: "center" }); y += 6;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100, 100, 100);
      doc.text(`Exercice fiscal ${anneeExercice}`, W / 2, y, { align: "center" }); y += 5;
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(184, 134, 11);
      doc.text(`N° ${numAvis}`, W / 2, y, { align: "center" }); y += 5;
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(150, 150, 150);
      doc.text(`Émis le : ${dateEmission}`, W / 2, y, { align: "center" }); y += 8;

      // Section helper
      const section = (title: string, rows: [string, string][]) => {
        doc.setFillColor(240, 244, 252); doc.rect(M, y, CW, 6, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(27, 58, 107);
        doc.text(title.toUpperCase(), M + 3, y + 4); y += 9;
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(30, 30, 30);
        rows.forEach(([label, val]) => {
          doc.setTextColor(120, 120, 120); doc.setFontSize(7);
          doc.text(label, M + 2, y);
          doc.setTextColor(30, 30, 30); doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
          doc.text(val, M + CW / 2, y);
          doc.setFont("helvetica", "normal");
          y += 5;
        });
        y += 3;
      };

      section("Informations du Contribuable", [
        ["Nom et Prénoms", `${contribuable.prenom} ${contribuable.nom}`],
        ["N° Identifiant Fiscal", contribuable.id],
        ["N° Identification Nationale", contribuable.nin || "—"],
        ["Téléphone", contribuable.telephone],
        ["Email", contribuable.email || "—"],
        ["Adresse", `${contribuable.quartier}, Secteur ${contribuable.secteur}`],
      ]);

      section("Bien Imposable", [
        ["Type de bien", contribuable.type],
        ["Usage", contribuable.usage],
        ["Surface", `${contribuable.surface} m²`],
        ["Catégorie fiscale", `Cat. ${contribuable.categorie} — Taux ${(tauxCFU * 100).toFixed(0)}%`],
        ["Valeur locative annuelle", `${contribuable.valeur.toLocaleString("fr-FR")} GNF`],
        ["Coordonnées GPS", contribuable.coordGps || "—"],
      ]);

      // Tableau des taxes
      doc.setFillColor(240, 244, 252); doc.rect(M, y, CW, 6, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(27, 58, 107);
      doc.text("DÉTAIL DES TAXES", M + 3, y + 4); y += 9;

      const taxRows: [string, string, string][] = [
        [`CFU — Cat. ${contribuable.categorie} (${(tauxCFU * 100).toFixed(0)}%)`, `${contribuable.valeur.toLocaleString("fr-FR")} GNF`, `${montantCFU.toLocaleString("fr-FR")} GNF`],
      ];
      if (contribuable.type === "Commercial") {
        taxRows.push(["Taxe de Patente (activité commerciale)", "Forfait", `${taxePatente.toLocaleString("fr-FR")} GNF`]);
        taxRows.push(["Taxe d'Enseigne", "Forfait", `${taxeEnseigne.toLocaleString("fr-FR")} GNF`]);
      }
      if (penalite > 0) taxRows.push(["Pénalité de retard (10%)", `${totalDu.toLocaleString("fr-FR")} GNF`, `${penalite.toLocaleString("fr-FR")} GNF`]);

      // Header
      doc.setFillColor(27, 58, 107); doc.rect(M, y, CW, 7, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(255, 255, 255);
      doc.text("Désignation", M + 2, y + 4.5);
      doc.text("Base", M + CW * 0.6, y + 4.5);
      doc.text("Montant", M + CW - 2, y + 4.5, { align: "right" });
      y += 9;

      taxRows.forEach(([label, base, montant], i) => {
        if (i % 2 === 0) { doc.setFillColor(248, 249, 252); doc.rect(M, y - 1.5, CW, 6.5, "F"); }
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(40, 40, 40);
        doc.text(label, M + 2, y + 3);
        doc.setTextColor(120, 120, 120);
        doc.text(base, M + CW * 0.6, y + 3);
        doc.setFont("helvetica", "bold"); doc.setTextColor(40, 40, 40);
        doc.text(montant, M + CW - 2, y + 3, { align: "right" });
        y += 6.5;
      });

      // Total
      doc.setFillColor(27, 58, 107); doc.rect(M, y, CW, 9, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
      doc.text("MONTANT TOTAL À PAYER", M + 2, y + 6);
      doc.setTextColor(252, 209, 22); doc.setFontSize(11);
      doc.text(`${totalFinal.toLocaleString("fr-FR")} GNF`, M + CW - 2, y + 6, { align: "right" });
      y += 14;

      // Modalités de paiement
      doc.setFillColor(255, 251, 235); doc.rect(M, y, CW, 28, "F");
      doc.setDrawColor(230, 201, 122); doc.rect(M, y, CW, 28);
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(120, 80, 0);
      doc.text("MODALITÉS DE PAIEMENT", M + 3, y + 5); y += 8;
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(80, 60, 0);
      doc.text(`Date d'émission : ${dateEmission}`, M + 3, y); y += 5;
      doc.text(`Date limite de paiement : ${dateEcheance}`, M + 3, y); y += 5;
      doc.text("Moyens acceptés : Orange Money · MTN Money · QR Code · Espèces (Guichet communal)", M + 3, y);
      y += 15;

      // Signatures
      doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.3);
      doc.line(M, y, M + CW / 2 - 10, y);
      doc.line(M + CW / 2 + 10, y, M + CW, y);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(120, 120, 120);
      doc.text(`Le Contribuable — ${contribuable.prenom} ${contribuable.nom}`, M + (CW / 4), y + 4, { align: "center" });
      doc.text("Le Receveur Municipal — Commune de Mamou", M + (3 * CW / 4), y + 4, { align: "center" });
      y += 14;

      // Pied de page
      doc.setDrawColor(220, 220, 220); doc.line(M, y, M + CW, y); y += 4;
      doc.setFont("helvetica", "italic"); doc.setFontSize(6.5); doc.setTextColor(160, 160, 160);
      doc.text(`Document officiel — SNRR-Mamou · N° ${numAvis} · ${dateEmission}`, W / 2, y, { align: "center" }); y += 4;
      doc.text("Pour toute réclamation : Service des Impôts Locaux — Commune de Mamou — Tél : +224 621 00 00 00", W / 2, y, { align: "center" });

      doc.save(`Avis_Imposition_${numAvis}_${contribuable.nom}_${contribuable.prenom}.pdf`);
    } catch (e) {
      console.error(e);
      // Fallback: ouvrir la fenêtre d'impression
      handlePrint();
    } finally {
      setPdfLoading(false);
    }
  };

  const handleEmail = async (email: string) => {
    setSendState("sending");
    if (onNotificationSent) {
      onNotificationSent({
        id: `NOTIF-${Date.now()}`,
        type: "email",
        destinataire: email,
        contribuable: `${contribuable.prenom} ${contribuable.nom}`,
        sujet: `Avis d'imposition ${numAvis}`,
        statut: "envoyé",
        date: now(),
      });
    }
    const subject = encodeURIComponent(`Avis d'imposition ${numAvis} — ${contribuable.prenom} ${contribuable.nom}`);
    const body = encodeURIComponent(
      `Bonjour ${contribuable.prenom} ${contribuable.nom},\n\n` +
      `Veuillez trouver ci-joint votre avis d'imposition n°${numAvis} pour l'exercice ${anneeExercice}.\n\n` +
      `Montant total dû : ${totalFinal.toLocaleString("fr-FR")} GNF\n` +
      `Date d'échéance : ${dateEcheance}\n\n` +
      `Cordialement,\nLe Service des Impôts Locaux\nCommune de Mamou`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setTimeout(() => setSendState("done"), 1500);
  };

  const handleWhatsApp = async (phone: string) => {
    setSendState("sending");
    if (onNotificationSent) {
      onNotificationSent({
        id: `NOTIF-${Date.now()}`,
        type: "whatsapp",
        destinataire: phone,
        contribuable: `${contribuable.prenom} ${contribuable.nom}`,
        sujet: `Avis d'imposition ${numAvis}`,
        statut: "envoyé",
        date: now(),
      });
    }
    const msg =
      `🏛️ *COMMUNE DE MAMOU — AVIS D'IMPOSITION*\n\n` +
      `📋 N° ${numAvis} — Exercice ${anneeExercice}\n` +
      `👤 ${contribuable.prenom} ${contribuable.nom}\n` +
      `📍 ${contribuable.quartier}, Secteur ${contribuable.secteur}\n\n` +
      `💰 *Montant total dû : ${totalFinal.toLocaleString("fr-FR")} GNF*\n` +
      `📅 Échéance : ${dateEcheance}\n\n` +
      `Merci de procéder au paiement avant la date limite.\n` +
      `📞 Infos : Service des Impôts — Commune de Mamou`;
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
    setTimeout(() => setSendState("done"), 1500);
  };

  useEffect(() => {
    if (notificationSettings?.autoSendAvis && !autoSent) {
      const t = setTimeout(async () => {
        if (notificationSettings.emailEnabled && contribuable.email) await handleEmail(contribuable.email);
        if (notificationSettings.whatsappEnabled && contribuable.telephone) await handleWhatsApp(contribuable.telephone);
        setAutoSent(true);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [notificationSettings, autoSent]);

  return (
    /* ── Modal overlay plein écran ── */
    <div className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      {/* ── Barre d'action flottante ── */}
      <div className="shrink-0 flex items-center justify-between gap-3 px-6 py-3 bg-[#0E1F3D] border-b border-white/10 shadow-xl print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            <div className="w-2 h-6 bg-[#CE1126] rounded-sm" />
            <div className="w-2 h-6 bg-[#FCD116] rounded-sm" />
            <div className="w-2 h-6 bg-[#009460] rounded-sm" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold" style={{ fontFamily: "'Crimson Pro', serif" }}>
              Avis d'Imposition — N° {numAvis}
            </p>
            <p className="text-white/40 text-[10px] font-mono">{contribuable.prenom} {contribuable.nom} · Exercice {anneeExercice}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Envoi auto confirmé */}
          {notificationSettings?.autoSendAvis && autoSent && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-sm bg-emerald-500/10">
              <CheckCircle2 size={10} /> Envoyé auto.
            </span>
          )}
          {sendState === "done" && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-sm bg-emerald-500/10">
              <CheckCircle2 size={10} /> Notification envoyée
            </span>
          )}

          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-white/20 text-white rounded-sm hover:bg-white/10 transition-colors">
            <Printer size={12} /> Imprimer
          </button>
          <button onClick={handleDownloadPDF} disabled={pdfLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-[#B8860B] text-white rounded-sm hover:opacity-90 transition-opacity disabled:opacity-60">
            <Download size={12} /> {pdfLoading ? "PDF…" : "Télécharger PDF"}
          </button>

          {/* Notifications */}
          <div className="border-l border-white/10 pl-2 flex items-center gap-2">
            <span className="text-[10px] font-mono text-white/40 hidden lg:block">Envoyer :</span>
            <NotificationButtons
              email={contribuable.email}
              telephone={contribuable.telephone}
              onSendEmail={handleEmail}
              onSendWhatsApp={handleWhatsApp}
              contribuableName={`${contribuable.prenom} ${contribuable.nom}`}
              avisReference={numAvis}
            />
          </div>

          <button onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono border border-white/20 text-white/60 rounded-sm hover:bg-white/10 hover:text-white transition-colors ml-1">
            <X size={12} /> Fermer
          </button>
        </div>
      </div>

      {/* ── Zone de défilement du document ── */}
      <div className="flex-1 overflow-y-auto py-8 px-4 flex justify-center">
        <div
          ref={avisRef}
          className="w-full bg-[#FEFCF8] shadow-2xl rounded-sm"
          style={{ maxWidth: "820px", minHeight: "1120px", position: "relative", fontFamily: "'Crimson Pro', serif" }}
        >
          {/* Filigrane sur le document */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden rounded-sm">
            <img src={watermarkImg} alt="" aria-hidden="true"
              className="w-3/5 object-contain"
              style={{ opacity: 0.05, mixBlendMode: "multiply", filter: "grayscale(100%)" }} />
          </div>

          {/* Contenu du document */}
          <div className="relative z-10 p-10 space-y-5">
            {/* Bande drapeau */}
            <div className="h-1.5 flex rounded-sm overflow-hidden -mt-0 mb-4">
              <div className="flex-1 bg-[#CE1126]" />
              <div className="flex-1 bg-[#FCD116]" />
              <div className="flex-1 bg-[#009460]" />
            </div>

            {/* En-tête officiel */}
            <div className="text-center border-b-2 border-[#B8860B] pb-6">
              <div className="flex justify-center mb-3">
                <img src={logoImg} alt="Blason République de Guinée" className="w-20 h-20 object-contain" />
              </div>
              <h1 className="text-2xl font-bold text-[#1B3A6B] tracking-wide">RÉPUBLIQUE DE GUINÉE</h1>
              <p className="text-xs font-mono text-gray-500 mt-1">Travail · Justice · Solidarité</p>
              <h2 className="text-xl font-bold text-[#B8860B] mt-3">COMMUNE URBAINE DE MAMOU</h2>
              <p className="text-xs font-mono text-gray-500 mt-1">Préfecture de Mamou · Service des Impôts et Taxes Locales</p>
              <p className="text-[10px] font-mono text-gray-400 mt-0.5">SNRR-Mamou — Système Numérique de Recensement et de Recouvrement</p>
            </div>

            {/* Titre */}
            <div className="text-center py-4 border-b border-gray-200">
              <h3 className="text-3xl font-bold text-[#1B3A6B] tracking-[0.12em]">AVIS D'IMPOSITION</h3>
              <p className="text-sm font-mono text-gray-500 mt-2">Exercice fiscal {anneeExercice}</p>
              <p className="text-sm font-mono text-[#B8860B] font-bold mt-1">N° {numAvis}</p>
              <p className="text-xs font-mono text-gray-400 mt-1">Émis le : {dateEmission}</p>
            </div>

            {/* Statut arriéré */}
            {contribuable.statut === "Arriéré" && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-sm text-xs font-mono text-red-700">
                <AlertTriangle size={13} className="text-red-500 shrink-0" />
                Compte en situation d'arriéré — une pénalité de retard de 10% est appliquée.
              </div>
            )}

            {/* Infos contribuable */}
            <div className="border border-[#1B3A6B]/20 rounded-sm overflow-hidden">
              <div className="bg-[#1B3A6B]/5 px-4 py-2 border-b border-[#1B3A6B]/10">
                <h4 className="text-xs font-bold text-[#1B3A6B] uppercase tracking-widest">Informations du Contribuable</h4>
              </div>
              <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                {[
                  { label: "Nom et Prénoms", val: `${contribuable.prenom} ${contribuable.nom}` },
                  { label: "N° Identifiant Fiscal", val: contribuable.id, mono: true, accent: true },
                  { label: "N° Identification Nationale", val: contribuable.nin || "—" },
                  { label: "Téléphone", val: contribuable.telephone },
                  { label: "Email", val: contribuable.email || "—" },
                  { label: "Adresse", val: `${contribuable.quartier}, Secteur ${contribuable.secteur}` },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-0.5">{f.label}</p>
                    <p className={`font-semibold ${f.mono ? "font-mono text-xs" : ""} ${f.accent ? "text-[#1B3A6B]" : "text-gray-800"}`}>{f.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bien imposable */}
            <div className="border border-[#1B3A6B]/20 rounded-sm overflow-hidden">
              <div className="bg-[#1B3A6B]/5 px-4 py-2 border-b border-[#1B3A6B]/10">
                <h4 className="text-xs font-bold text-[#1B3A6B] uppercase tracking-widest">Bien Imposable</h4>
              </div>
              <div className="p-5 grid grid-cols-3 gap-x-8 gap-y-3 text-sm">
                {[
                  { label: "Type de bien", val: contribuable.type },
                  { label: "Usage", val: contribuable.usage },
                  { label: "Surface", val: `${contribuable.surface} m²` },
                  { label: "Catégorie fiscale", val: `Cat. ${contribuable.categorie} (${(tauxCFU * 100).toFixed(0)}%)` },
                  { label: "Valeur locative annuelle", val: `${contribuable.valeur.toLocaleString("fr-FR")} GNF` },
                  { label: "Coordonnées GPS", val: contribuable.coordGps || "—", mono: true, small: true },
                ].map(f => (
                  <div key={f.label}>
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-0.5">{f.label}</p>
                    <p className={`font-semibold ${f.mono ? "font-mono" : ""} ${f.small ? "text-xs" : "text-sm"} text-gray-800`}>{f.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Détail des taxes */}
            <div className="border border-[#1B3A6B]/20 rounded-sm overflow-hidden">
              <div className="bg-[#1B3A6B]/5 px-4 py-2 border-b border-[#1B3A6B]/10">
                <h4 className="text-xs font-bold text-[#1B3A6B] uppercase tracking-widest">Détail des Taxes</h4>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-2 text-left text-[10px] font-mono text-gray-400 uppercase tracking-widest">Désignation</th>
                    <th className="px-5 py-2 text-left text-[10px] font-mono text-gray-400 uppercase tracking-widest">Base</th>
                    <th className="px-5 py-2 text-right text-[10px] font-mono text-gray-400 uppercase tracking-widest">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-800">Contribution Foncière Unique (CFU)</p>
                      <p className="text-[10px] font-mono text-gray-400">Catégorie {contribuable.categorie} — Taux {(tauxCFU * 100).toFixed(0)}%</p>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{contribuable.valeur.toLocaleString("fr-FR")} GNF</td>
                    <td className="px-5 py-3 text-right font-bold font-mono text-gray-800">{montantCFU.toLocaleString("fr-FR")} GNF</td>
                  </tr>
                  {contribuable.type === "Commercial" && <>
                    <tr className="border-b border-gray-100">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-gray-800">Taxe de Patente</p>
                        <p className="text-[10px] font-mono text-gray-400">Activité commerciale</p>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">Forfait</td>
                      <td className="px-5 py-3 text-right font-bold font-mono text-gray-800">{taxePatente.toLocaleString("fr-FR")} GNF</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-gray-800">Taxe d'Enseigne</p>
                        <p className="text-[10px] font-mono text-gray-400">Activité commerciale</p>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">Forfait</td>
                      <td className="px-5 py-3 text-right font-bold font-mono text-gray-800">{taxeEnseigne.toLocaleString("fr-FR")} GNF</td>
                    </tr>
                  </>}
                  {penalite > 0 && (
                    <tr className="border-b border-red-100 bg-red-50/50">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-red-700">Pénalité de retard</p>
                        <p className="text-[10px] font-mono text-red-400">10% du montant dû</p>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-red-400">{totalDu.toLocaleString("fr-FR")} GNF</td>
                      <td className="px-5 py-3 text-right font-bold font-mono text-red-600">{penalite.toLocaleString("fr-FR")} GNF</td>
                    </tr>
                  )}
                  <tr className="bg-[#1B3A6B]/5">
                    <td colSpan={2} className="px-5 py-4 text-base font-bold text-[#1B3A6B]">MONTANT TOTAL À PAYER</td>
                    <td className="px-5 py-4 text-right text-2xl font-bold font-mono text-[#B8860B]" style={{ fontFamily: "'Crimson Pro', serif" }}>
                      {totalFinal.toLocaleString("fr-FR")} GNF
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Modalités de paiement */}
            <div className="bg-amber-50 border border-amber-200 rounded-sm p-5">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-3">Modalités de Paiement</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-amber-900">
                <div>
                  <p className="text-[10px] font-mono text-amber-600 mb-0.5">Date d'émission</p>
                  <p className="font-semibold">{dateEmission}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-amber-600 mb-0.5">Date limite de paiement</p>
                  <p className="font-semibold text-[#CE1126]">{dateEcheance}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-amber-200">
                <p className="text-[10px] font-mono text-amber-600 mb-2 uppercase tracking-widest">Moyens de paiement acceptés</p>
                <div className="flex flex-wrap gap-2">
                  {["📱 Orange Money", "📱 MTN Money", "⬛ QR Code fiscal", "💵 Espèces — Guichet Communal"].map(m => (
                    <span key={m} className="text-xs font-mono bg-amber-100 border border-amber-200 text-amber-900 px-2 py-1 rounded-sm">{m}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-12 pt-4">
              <div className="text-center">
                <div className="border-t border-gray-300 pt-3">
                  <p className="text-xs font-mono text-gray-400">Le Contribuable</p>
                  <p className="text-sm font-semibold text-gray-700 mt-1">{contribuable.prenom} {contribuable.nom}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-300 pt-3">
                  <p className="text-xs font-mono text-gray-400">Le Receveur Municipal</p>
                  <p className="text-sm font-semibold text-gray-700 mt-1">Commune Urbaine de Mamou</p>
                </div>
              </div>
            </div>

            {/* Pied de page */}
            <div className="text-center pt-4 border-t border-gray-200">
              <div className="flex justify-center mb-2">
                <div className="h-0.5 w-20 flex">
                  <div className="flex-1 bg-[#CE1126]" />
                  <div className="flex-1 bg-[#FCD116]" />
                  <div className="flex-1 bg-[#009460]" />
                </div>
              </div>
              <p className="text-[10px] font-mono text-gray-400 italic">
                Document officiel généré par SNRR-Mamou · N° {numAvis} · {dateEmission}
              </p>
              <p className="text-[10px] font-mono text-gray-400 mt-1">
                Pour toute réclamation : Service des Impôts Locaux — Commune de Mamou — Tél : +224 621 00 00 00
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
