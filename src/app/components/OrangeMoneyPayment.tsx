import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrScanner } from "react-qr-scanner";
import {
  Smartphone, Scan, CheckCircle2, XCircle, AlertCircle, Loader2,
  Phone, Banknote, FileText, Clock, RefreshCw, ChevronRight,
  Mail, Send, Check, X as XIcon, Download, Printer
} from "lucide-react";

interface OrangeMoneyPaymentProps {
  montant: number;
  contribuableId: string;
  contribuableNom: string;
  contribuableTelephone?: string;
  contribuableEmail?: string;
  onSuccess: (transactionRef: string) => void;
  onCancel: () => void;
  notificationWhatsApp?: string; // Numéro pour notifications WhatsApp (+224626001110)
}

interface Transaction {
  ref: string;
  montant: number;
  numeroPayeur: string;
  numeroMarchand: string;
  date: string;
  statut: 'en-attente' | 'validé' | 'échoué' | 'annulé';
  messageStatut?: string;
}

export function OrangeMoneyPayment({
  montant,
  contribuableId,
  contribuableNom,
  contribuableTelephone,
  contribuableEmail,
  onSuccess,
  onCancel,
  notificationWhatsApp = "+224626001110"
}: OrangeMoneyPaymentProps) {
  const [etape, setEtape] = useState<'selection' | 'saisie' | 'scan' | 'validation' | 'confirmation'>('selection');
  const [methode, setMethode] = useState<'numero' | 'qr-code' | null>(null);
  const [numeroPayeur, setNumeroPayeur] = useState("");
  const [numeroMarchand] = useState("+224 626 00 11 10"); // Numéro marchand Orange Money de la commune
  const [qrData, setQrData] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [notificationsSent, setNotificationsSent] = useState(false);
  
  const qrScannerRef = useRef<any>(null);

  // Générer le QR Code marchand Orange Money
  const generateMerchantQR = () => {
    const qrPayload = {
      type: "ORANGE_MONEY_GN",
      merchant: numeroMarchand,
      amount: montant,
      currency: "GNF",
      reference: contribuableId,
      description: `Paiement CFU/Patente - ${contribuableNom}`,
      commune: "Mamou",
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(qrPayload);
  };

  // Scanner le QR Code du payeur
  const handleQRScan = (data: any) => {
    if (data) {
      try {
        const scannedData = typeof data === 'string' ? data : data.text;
        setQrData(scannedData);
        
        // Simuler l'extraction du numéro Orange Money depuis le QR
        const match = scannedData.match(/\+224\s?6\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/);
        if (match) {
          setNumeroPayeur(match[0]);
          setEtape('validation');
        } else {
          setError("QR Code invalide. Veuillez scanner un QR Code Orange Money valide.");
        }
      } catch (err) {
        setError("Erreur lors du scan du QR Code.");
      }
    }
  };

  const handleQRError = (err: any) => {
    console.error("Erreur scanner QR:", err);
    setError("Impossible d'accéder à la caméra. Veuillez vérifier les permissions.");
  };

  // Valider le numéro Orange Money
  const validateOrangeNumber = (num: string): boolean => {
    // Format Orange Money Guinée: +224 6XX XX XX XX
    const regex = /^\+224\s?6\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/;
    return regex.test(num);
  };

  // Simuler l'appel API Orange Money
  const processPayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Simulation de l'API Orange Money (en production, remplacer par l'API réelle)
      await new Promise(resolve => setTimeout(resolve, 2500));

      const transactionRef = `OM-${Date.now().toString().slice(-8)}`;
      const nouveauTransaction: Transaction = {
        ref: transactionRef,
        montant: montant,
        numeroPayeur: numeroPayeur,
        numeroMarchand: numeroMarchand,
        date: new Date().toLocaleString("fr-GN"),
        statut: 'validé',
        messageStatut: 'Paiement réussi'
      };

      setTransaction(nouveauTransaction);
      setEtape('confirmation');
      
      // Envoyer les notifications
      sendNotifications(nouveauTransaction);
      
      setIsProcessing(false);
    } catch (err) {
      setIsProcessing(false);
      setError("Échec de la transaction. Veuillez réessayer.");
      
      const transactionEchouee: Transaction = {
        ref: `OM-ERR-${Date.now().toString().slice(-8)}`,
        montant: montant,
        numeroPayeur: numeroPayeur,
        numeroMarchand: numeroMarchand,
        date: new Date().toLocaleString("fr-GN"),
        statut: 'échoué',
        messageStatut: 'Transaction échouée. Solde insuffisant ou compte bloqué.'
      };
      setTransaction(transactionEchouee);
    }
  };

  // Envoyer les notifications (Email + WhatsApp)
  const sendNotifications = async (trans: Transaction) => {
    try {
      // Simulation d'envoi de notifications
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const notifEmail = {
        destinataire: contribuableEmail || `${contribuableTelephone}@temp.gn`,
        sujet: `Confirmation de paiement - ${trans.ref}`,
        corps: `Votre paiement de ${montant.toLocaleString('fr-GN')} GNF a été validé. Référence: ${trans.ref}`,
      };

      const notifWhatsApp = {
        destinataire: notificationWhatsApp,
        message: `✅ PAIEMENT VALIDÉ\nContribuable: ${contribuableNom}\nMontant: ${montant.toLocaleString('fr-GN')} GNF\nRéférence: ${trans.ref}\nDate: ${trans.date}`,
      };

      console.log("📧 Email envoyé:", notifEmail);
      console.log("📱 WhatsApp envoyé:", notifWhatsApp);
      
      setNotificationsSent(true);
    } catch (err) {
      console.error("Erreur lors de l'envoi des notifications:", err);
    }
  };

  // Affichage de la sélection de méthode
  const renderSelection = () => (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
          <Smartphone className="text-white" size={32} />
        </div>
        <h3 className="text-xl font-light text-foreground" style={{ fontFamily: "'Crimson Pro', serif" }}>
          Paiement Orange Money
        </h3>
        <p className="text-sm text-muted-foreground font-mono">
          Montant à payer : <span className="text-orange-600 font-bold" style={{ fontFamily: "'Crimson Pro', serif" }}>
            {montant.toLocaleString('fr-GN')} GNF
          </span>
        </p>
      </div>

      <div className="border-t border-b border-border py-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-mono">Contribuable</span>
          <span className="font-medium">{contribuableNom}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-mono">Référence</span>
          <span className="font-mono text-primary">{contribuableId}</span>
        </div>
      </div>

      {/* Information sur le numéro marchand destinataire */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 rounded-sm p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Smartphone className="text-orange-600" size={18} />
          <p className="text-xs font-mono uppercase tracking-widest text-orange-900 font-semibold">
            Numéro marchand destinataire
          </p>
        </div>
        <div className="bg-white border border-orange-200 rounded-sm p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-orange-700 font-mono mb-0.5">Commune de Mamou</p>
            <p className="text-lg font-bold text-orange-600 font-mono tracking-wider">
              {numeroMarchand}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <Banknote className="text-orange-600" size={20} />
          </div>
        </div>
        <p className="text-xs text-orange-800/70 font-mono italic text-center">
          Les paiements seront crédités sur ce numéro
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Choisir la méthode de paiement
        </p>
        
        <button
          onClick={() => { setMethode('numero'); setEtape('saisie'); }}
          className="w-full p-4 border-2 border-border rounded-sm hover:border-orange-500 hover:bg-orange-50/50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
              <Phone className="text-orange-600 group-hover:text-white" size={24} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">Payer par numéro</p>
              <p className="text-xs text-muted-foreground font-mono">Saisir le numéro Orange Money</p>
            </div>
            <ChevronRight className="text-muted-foreground" size={20} />
          </div>
        </button>

        <button
          onClick={() => { setMethode('qr-code'); setEtape('scan'); }}
          className="w-full p-4 border-2 border-border rounded-sm hover:border-orange-500 hover:bg-orange-50/50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
              <Scan className="text-orange-600 group-hover:text-white" size={24} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">Scanner QR Code</p>
              <p className="text-xs text-muted-foreground font-mono">Scanner le QR du payeur</p>
            </div>
            <ChevronRight className="text-muted-foreground" size={20} />
          </div>
        </button>
      </div>

      <button
        onClick={onCancel}
        className="w-full px-4 py-2.5 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors"
      >
        Annuler
      </button>
    </div>
  );

  // Affichage de la saisie du numéro
  const renderSaisie = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <button
          onClick={() => setEtape('selection')}
          className="p-1.5 hover:bg-secondary rounded-sm transition-colors"
        >
          <ChevronRight className="rotate-180 text-muted-foreground" size={18} />
        </button>
        <h3 className="text-sm font-mono uppercase tracking-widest text-foreground">
          Saisir le numéro
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
            Numéro Orange Money du payeur <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={numeroPayeur}
            onChange={(e) => setNumeroPayeur(e.target.value)}
            placeholder="+224 6XX XX XX XX"
            className="w-full px-4 py-3 text-base bg-input-background border-2 border-border rounded-sm font-mono focus:outline-none focus:border-orange-500 text-foreground placeholder:text-muted-foreground/50"
          />
          <p className="text-xs text-muted-foreground/70 font-mono mt-1 italic">
            Format : +224 6XX XX XX XX
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-sm">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={16} />
            <p className="text-sm text-red-800 font-mono">{error}</p>
          </div>
        )}

        <div className="bg-orange-50 border border-orange-200 rounded-sm p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Banknote className="text-orange-600" size={18} />
            <p className="text-sm font-mono text-orange-900">Montant à débiter</p>
          </div>
          <p className="text-2xl font-bold text-orange-600" style={{ fontFamily: "'Crimson Pro', serif" }}>
            {montant.toLocaleString('fr-GN')} GNF
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          onClick={() => setEtape('selection')}
          className="flex-1 px-4 py-2.5 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors"
        >
          Retour
        </button>
        <button
          onClick={() => {
            if (!validateOrangeNumber(numeroPayeur)) {
              setError("Numéro Orange Money invalide. Veuillez vérifier le format.");
              return;
            }
            setError(null);
            setEtape('validation');
          }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono bg-orange-600 text-white rounded-sm hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!numeroPayeur}
        >
          Continuer <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  // Affichage du scanner QR
  const renderScan = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <button
          onClick={() => setEtape('selection')}
          className="p-1.5 hover:bg-secondary rounded-sm transition-colors"
        >
          <ChevronRight className="rotate-180 text-muted-foreground" size={18} />
        </button>
        <h3 className="text-sm font-mono uppercase tracking-widest text-foreground">
          Scanner QR Code
        </h3>
      </div>

      <div className="space-y-4">
        <div className="bg-orange-50 border-2 border-orange-200 rounded-sm p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-orange-600" size={18} />
            <p className="text-sm font-mono font-semibold text-orange-900">Instructions</p>
          </div>
          <ol className="text-xs text-orange-800 space-y-1 font-mono ml-6 list-decimal">
            <li>Demandez au contribuable d'ouvrir son application Orange Money</li>
            <li>Accéder à "Mon QR Code" dans l'application</li>
            <li>Scanner le QR Code affiché ci-dessous avec la caméra</li>
          </ol>
        </div>

        <div className="border-2 border-dashed border-orange-300 rounded-sm p-6 bg-white">
          <div className="aspect-square max-w-sm mx-auto bg-slate-100 rounded-sm flex items-center justify-center">
            {/* Simulateur de caméra pour le scan */}
            <div className="text-center space-y-3">
              <Scan className="mx-auto text-orange-600 animate-pulse" size={64} />
              <p className="text-sm text-muted-foreground font-mono">
                Positionnez le QR Code Orange Money
              </p>
              <button
                onClick={() => {
                  // Simulation de scan réussi pour démo
                  setNumeroPayeur("+224 621 45 89 23");
                  setEtape('validation');
                }}
                className="mt-4 px-4 py-2 bg-orange-600 text-white text-xs font-mono rounded-sm hover:bg-orange-700 transition-colors"
              >
                Simuler scan réussi (Démo)
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-sm">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={16} />
            <p className="text-sm text-red-800 font-mono">{error}</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setEtape('selection')}
        className="w-full px-4 py-2.5 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors"
      >
        Retour
      </button>
    </div>
  );

  // Affichage de la validation
  const renderValidation = () => (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center">
          <CheckCircle2 className="text-orange-600" size={32} />
        </div>
        <h3 className="text-xl font-light text-foreground" style={{ fontFamily: "'Crimson Pro', serif" }}>
          Confirmer le paiement
        </h3>
        <p className="text-sm text-muted-foreground font-mono">
          Vérifiez les informations avant de valider
        </p>
      </div>

      <div className="border-2 border-orange-200 rounded-sm overflow-hidden">
        <div className="bg-orange-50 px-4 py-2 border-b border-orange-200">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-900">
            Détails de la transaction
          </p>
        </div>
        <div className="p-4 space-y-3 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <Phone className="text-muted-foreground mt-0.5" size={16} />
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase">Numéro payeur</p>
                <p className="text-sm font-semibold font-mono text-foreground">{numeroPayeur}</p>
              </div>
            </div>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <Smartphone className="text-muted-foreground mt-0.5" size={16} />
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase">Numéro marchand</p>
                <p className="text-sm font-semibold font-mono text-foreground">{numeroMarchand}</p>
              </div>
            </div>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <FileText className="text-muted-foreground mt-0.5" size={16} />
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase">Référence</p>
                <p className="text-sm font-semibold font-mono text-primary">{contribuableId}</p>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-border">
            <div className="flex items-start gap-2">
              <Banknote className="text-orange-600 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase">Montant total</p>
                <p className="text-2xl font-bold text-orange-600" style={{ fontFamily: "'Crimson Pro', serif" }}>
                  {montant.toLocaleString('fr-GN')} GNF
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-sm">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={16} />
          <p className="text-sm text-red-800 font-mono">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          onClick={() => setEtape(methode === 'numero' ? 'saisie' : 'scan')}
          className="flex-1 px-4 py-2.5 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors"
          disabled={isProcessing}
        >
          Retour
        </button>
        <button
          onClick={processPayment}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono bg-orange-600 text-white rounded-sm hover:bg-orange-700 transition-colors disabled:opacity-50"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Traitement...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              Valider le paiement
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Affichage de la confirmation
  const renderConfirmation = () => {
    if (!transaction) return null;

    const isSuccess = transaction.statut === 'validé';

    return (
      <div className="p-6 space-y-6">
        <div className="text-center space-y-3">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
            isSuccess ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isSuccess ? (
              <CheckCircle2 className="text-green-600" size={48} />
            ) : (
              <XCircle className="text-red-600" size={48} />
            )}
          </div>
          <h3 className="text-2xl font-light text-foreground" style={{ fontFamily: "'Crimson Pro', serif" }}>
            {isSuccess ? 'Paiement réussi !' : 'Paiement échoué'}
          </h3>
          <p className="text-sm text-muted-foreground font-mono">
            {transaction.messageStatut}
          </p>
        </div>

        {isSuccess && (
          <div className="bg-green-50 border-2 border-green-200 rounded-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="text-green-600" size={18} />
              <p className="text-sm font-mono font-semibold text-green-900">Reçu de transaction</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-green-800 font-mono">Référence</span>
                <span className="font-mono font-bold text-green-900">{transaction.ref}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-green-800 font-mono">Montant</span>
                <span className="font-mono font-bold text-green-900">{transaction.montant.toLocaleString('fr-GN')} GNF</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-green-800 font-mono">Date</span>
                <span className="font-mono text-green-900">{transaction.date}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-green-800 font-mono">De</span>
                <span className="font-mono text-green-900">{transaction.numeroPayeur}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-green-800 font-mono">Vers</span>
                <span className="font-mono text-green-900">{transaction.numeroMarchand}</span>
              </div>
            </div>
          </div>
        )}

        {notificationsSent && isSuccess && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-sm">
            <Send className="text-blue-600 shrink-0 mt-0.5" size={16} />
            <div className="space-y-1">
              <p className="text-sm text-blue-900 font-mono font-semibold">Notifications envoyées</p>
              <ul className="text-xs text-blue-800 font-mono space-y-0.5">
                {contribuableEmail && <li>📧 Email à {contribuableEmail}</li>}
                <li>📱 WhatsApp à {notificationWhatsApp}</li>
              </ul>
            </div>
          </div>
        )}

        <div className="border-t border-border pt-4 space-y-3">
          {isSuccess ? (
            <>
              <button
                onClick={() => {
                  // Télécharger le reçu (simulation)
                  alert(`Reçu ${transaction.ref} téléchargé`);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors"
              >
                <Download size={16} />
                Télécharger le reçu
              </button>
              <button
                onClick={() => {
                  // Imprimer le reçu (simulation)
                  window.print();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors"
              >
                <Printer size={16} />
                Imprimer le reçu
              </button>
              <button
                onClick={() => {
                  onSuccess(transaction.ref);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono bg-green-600 text-white rounded-sm hover:bg-green-700 transition-colors"
              >
                <Check size={16} />
                Terminer
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setEtape('selection');
                  setError(null);
                  setTransaction(null);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-mono bg-orange-600 text-white rounded-sm hover:bg-orange-700 transition-colors"
              >
                <RefreshCw size={16} />
                Réessayer
              </button>
              <button
                onClick={onCancel}
                className="w-full px-4 py-2.5 text-sm font-mono border border-border rounded-sm hover:bg-secondary transition-colors"
              >
                Annuler
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative bg-card border border-border rounded-sm shadow-2xl w-full max-w-lg">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <Smartphone className="text-orange-600" size={24} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest font-mono">
              Orange Money
            </h2>
            <p className="text-xs text-orange-100 font-mono">Paiement sécurisé</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 hover:bg-orange-700 rounded-sm transition-colors text-white"
        >
          <XIcon size={18} />
        </button>
      </div>

      {etape === 'selection' && renderSelection()}
      {etape === 'saisie' && renderSaisie()}
      {etape === 'scan' && renderScan()}
      {etape === 'validation' && renderValidation()}
      {etape === 'confirmation' && renderConfirmation()}
    </div>
  );
}