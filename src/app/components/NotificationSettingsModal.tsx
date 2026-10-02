import { X, Mail, MessageCircle, Settings, Save, AlertTriangle, CheckCircle2, Globe, Lock, Zap } from "lucide-react";
import { useState } from "react";

interface NotificationSettings {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  autoSendAvis: boolean;
  emailSmtp?: string;
  emailPort?: string;
  emailUser?: string;
  whatsappApi?: string;
}

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onSave: (settings: NotificationSettings) => void;
}

export function NotificationSettingsModal({
  isOpen,
  onClose,
  settings: initialSettings,
  onSave
}: NotificationSettingsModalProps) {
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<'general' | 'email' | 'whatsapp'>('general');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(settings);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  const updateSetting = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-[#1B3A6B] to-[#1B3A6B]/90 text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Paramètres de Notification</h2>
                <p className="text-xs text-white/70 mt-0.5">
                  Configuration des notifications automatiques
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="border-b border-[#1B3A6B]/10 bg-[#F8F6F0]">
          <div className="flex gap-1 p-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'general'
                  ? 'bg-white text-[#1B3A6B] shadow-sm'
                  : 'text-[#1B3A6B]/60 hover:text-[#1B3A6B] hover:bg-white/50'
              }`}
            >
              <Zap className="w-4 h-4" />
              Général
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'email'
                  ? 'bg-white text-[#1B3A6B] shadow-sm'
                  : 'text-[#1B3A6B]/60 hover:text-[#1B3A6B] hover:bg-white/50'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email (SMTP)
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'whatsapp'
                  ? 'bg-white text-[#1B3A6B] shadow-sm'
                  : 'text-[#1B3A6B]/60 hover:text-[#1B3A6B] hover:bg-white/50'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Onglet Général */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Avertissement de sécurité */}
              <div className="bg-[#FCD116]/10 border border-[#B8860B]/30 rounded-lg p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-[#B8860B] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-[#1B3A6B] text-sm mb-1">
                    Configuration requise
                  </h4>
                  <p className="text-xs text-[#1B3A6B]/70 leading-relaxed">
                    Pour utiliser les notifications automatiques, vous devez configurer 
                    les paramètres SMTP (Email) et l'API WhatsApp Business dans les onglets correspondants.
                  </p>
                </div>
              </div>

              {/* Options générales */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#1B3A6B] mb-3">
                  Options de notification
                </h3>

                {/* Activer Email */}
                <label className="flex items-start gap-3 p-4 bg-[#F8F6F0] rounded-lg cursor-pointer hover:bg-[#FCD116]/5 transition-colors border border-[#1B3A6B]/10">
                  <input
                    type="checkbox"
                    checked={settings.emailEnabled}
                    onChange={(e) => updateSetting('emailEnabled', e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#1B3A6B] rounded border-[#1B3A6B]/30 focus:ring-2 focus:ring-[#1B3A6B]/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-[#1B3A6B]" />
                      <span className="font-medium text-[#1B3A6B] text-sm">
                        Activer les notifications Email
                      </span>
                    </div>
                    <p className="text-xs text-[#1B3A6B]/60">
                      Permet l'envoi automatique d'emails aux contribuables
                    </p>
                  </div>
                </label>

                {/* Activer WhatsApp */}
                <label className="flex items-start gap-3 p-4 bg-[#F8F6F0] rounded-lg cursor-pointer hover:bg-[#009460]/5 transition-colors border border-[#1B3A6B]/10">
                  <input
                    type="checkbox"
                    checked={settings.whatsappEnabled}
                    onChange={(e) => updateSetting('whatsappEnabled', e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#009460] rounded border-[#009460]/30 focus:ring-2 focus:ring-[#009460]/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="w-4 h-4 text-[#009460]" />
                      <span className="font-medium text-[#1B3A6B] text-sm">
                        Activer les notifications WhatsApp
                      </span>
                    </div>
                    <p className="text-xs text-[#1B3A6B]/60">
                      Permet l'envoi automatique de messages WhatsApp
                    </p>
                  </div>
                </label>

                {/* Envoi automatique */}
                <label className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#FCD116]/10 to-[#B8860B]/10 rounded-lg cursor-pointer hover:from-[#FCD116]/20 hover:to-[#B8860B]/20 transition-colors border border-[#B8860B]/20">
                  <input
                    type="checkbox"
                    checked={settings.autoSendAvis}
                    onChange={(e) => updateSetting('autoSendAvis', e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#B8860B] rounded border-[#B8860B]/30 focus:ring-2 focus:ring-[#B8860B]/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-[#B8860B]" />
                      <span className="font-medium text-[#1B3A6B] text-sm">
                        Envoi automatique des avis d'imposition
                      </span>
                    </div>
                    <p className="text-xs text-[#1B3A6B]/60">
                      Envoie automatiquement par Email et WhatsApp lors de la génération d'un avis
                    </p>
                  </div>
                </label>
              </div>

              {/* Statut de configuration */}
              <div className="bg-white border border-[#1B3A6B]/10 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-[#1B3A6B] mb-3">
                  État de la configuration
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#1B3A6B]/70">Serveur SMTP configuré</span>
                    {settings.emailSmtp ? (
                      <span className="flex items-center gap-1 text-[#009460] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Oui
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#CE1126] font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Non
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#1B3A6B]/70">API WhatsApp configurée</span>
                    {settings.whatsappApi ? (
                      <span className="flex items-center gap-1 text-[#009460] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Oui
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#CE1126] font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Non
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Email */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="bg-[#1B3A6B]/5 border border-[#1B3A6B]/10 rounded-lg p-4 flex gap-3">
                <Lock className="w-5 h-5 text-[#1B3A6B] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-[#1B3A6B] text-sm mb-1">
                    Sécurité des données
                  </h4>
                  <p className="text-xs text-[#1B3A6B]/70 leading-relaxed">
                    Ces informations sont stockées de manière sécurisée et utilisées uniquement 
                    pour l'envoi des notifications. Ne partagez jamais vos identifiants.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1B3A6B] mb-2">
                    Serveur SMTP
                  </label>
                  <input
                    type="text"
                    value={settings.emailSmtp || ''}
                    onChange={(e) => updateSetting('emailSmtp', e.target.value)}
                    placeholder="smtp.exemple.com"
                    className="w-full px-3 py-2 border border-[#1B3A6B]/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]"
                  />
                  <p className="text-xs text-[#1B3A6B]/60 mt-1">
                    Adresse du serveur SMTP de votre fournisseur de messagerie
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1B3A6B] mb-2">
                    Port SMTP
                  </label>
                  <input
                    type="text"
                    value={settings.emailPort || ''}
                    onChange={(e) => updateSetting('emailPort', e.target.value)}
                    placeholder="587"
                    className="w-full px-3 py-2 border border-[#1B3A6B]/20 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]"
                  />
                  <p className="text-xs text-[#1B3A6B]/60 mt-1">
                    Port TLS/STARTTLS (généralement 587) ou SSL (465)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1B3A6B] mb-2">
                    Identifiant / Email
                  </label>
                  <input
                    type="email"
                    value={settings.emailUser || ''}
                    onChange={(e) => updateSetting('emailUser', e.target.value)}
                    placeholder="notification@mamou-commune.gn"
                    className="w-full px-3 py-2 border border-[#1B3A6B]/20 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]"
                  />
                  <p className="text-xs text-[#1B3A6B]/60 mt-1">
                    Adresse email utilisée pour l'authentification et comme expéditeur
                  </p>
                </div>

                <div className="bg-[#FCD116]/10 border border-[#B8860B]/20 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[#1B3A6B] mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Fournisseurs recommandés
                  </h4>
                  <ul className="text-xs text-[#1B3A6B]/70 space-y-1">
                    <li>• Gmail: smtp.gmail.com:587</li>
                    <li>• SendGrid: smtp.sendgrid.net:587</li>
                    <li>• Office365: smtp.office365.com:587</li>
                    <li>• Amazon SES: email-smtp.region.amazonaws.com:587</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Onglet WhatsApp */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              <div className="bg-[#009460]/5 border border-[#009460]/20 rounded-lg p-4 flex gap-3">
                <MessageCircle className="w-5 h-5 text-[#009460] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-[#1B3A6B] text-sm mb-1">
                    WhatsApp Business API
                  </h4>
                  <p className="text-xs text-[#1B3A6B]/70 leading-relaxed">
                    Utilisez l'API WhatsApp Business officielle pour l'envoi professionnel de messages. 
                    L'utilisation de WhatsApp Web n'est pas recommandée pour un usage institutionnel.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1B3A6B] mb-2">
                    URL de l'API WhatsApp
                  </label>
                  <input
                    type="text"
                    value={settings.whatsappApi || ''}
                    onChange={(e) => updateSetting('whatsappApi', e.target.value)}
                    placeholder="https://api.whatsapp.com/v1/messages"
                    className="w-full px-3 py-2 border border-[#1B3A6B]/20 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#009460]/20 focus:border-[#009460]"
                  />
                  <p className="text-xs text-[#1B3A6B]/60 mt-1">
                    Point de terminaison de votre API WhatsApp Business
                  </p>
                </div>

                <div className="bg-[#009460]/10 border border-[#009460]/20 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[#1B3A6B] mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Fournisseurs d'API WhatsApp
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <p className="font-medium text-[#1B3A6B] mb-1">Meta (Officiel)</p>
                      <p className="text-[#1B3A6B]/70">
                        WhatsApp Business Platform - Solution officielle de Meta
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-[#1B3A6B] mb-1">Twilio</p>
                      <p className="text-[#1B3A6B]/70">
                        API WhatsApp Business via Twilio - Intégration simplifiée
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-[#1B3A6B] mb-1">MessageBird</p>
                      <p className="text-[#1B3A6B]/70">
                        Service de messagerie professionnel avec support WhatsApp
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FCD116]/10 border border-[#B8860B]/20 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[#1B3A6B] mb-2">
                    ℹ️ Mode de développement
                  </h4>
                  <p className="text-xs text-[#1B3A6B]/70 leading-relaxed mb-3">
                    En l'absence de configuration API, les boutons WhatsApp ouvriront 
                    WhatsApp Web avec le message pré-rempli pour envoi manuel.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="border-t border-[#1B3A6B]/10 p-6 bg-[#F8F6F0]">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#1B3A6B] hover:bg-white rounded-md transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saved}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all
                ${saved
                  ? 'bg-[#009460] text-white'
                  : 'bg-[#1B3A6B] text-white hover:bg-[#1B3A6B]/90 active:scale-95'
                }
                shadow-sm hover:shadow-md
              `}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Enregistré !
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer les paramètres
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
