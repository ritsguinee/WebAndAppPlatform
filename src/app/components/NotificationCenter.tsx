import { Bell, Mail, MessageCircle, CheckCircle2, AlertTriangle, Clock, X, Settings, Send, RefreshCw, Download } from "lucide-react";
import { useState } from "react";
import type { NotificationLog } from "../components/notification-helpers";

interface NotificationCenterProps {
  notifications: NotificationLog[];
  onClearNotification: (id: string) => void;
  onClearAll: () => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
}

export function NotificationCenter({
  notifications,
  onClearNotification,
  onClearAll,
  onOpenSettings,
  onRefresh
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => n.statut === 'en cours' || n.statut === 'envoyé').length;

  const getStatusIcon = (statut: NotificationLog['statut']) => {
    switch (statut) {
      case 'envoyé':
        return <CheckCircle2 className="w-4 h-4 text-[#009460]" />;
      case 'échoué':
        return <AlertTriangle className="w-4 h-4 text-[#CE1126]" />;
      case 'en cours':
        return <Clock className="w-4 h-4 text-[#FCD116]" />;
    }
  };

  const getTypeIcon = (type: NotificationLog['type']) => {
    return type === 'email' 
      ? <Mail className="w-4 h-4 text-[#1B3A6B]" />
      : <MessageCircle className="w-4 h-4 text-[#009460]" />;
  };

  const getStatusText = (statut: NotificationLog['statut']) => {
    switch (statut) {
      case 'envoyé': return 'Envoyé';
      case 'échoué': return 'Échec';
      case 'en cours': return 'En cours';
    }
  };

  return (
    <div className="relative">
      {/* Bouton cloche avec badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#1B3A6B] hover:bg-[#FCD116]/10 rounded-lg transition-colors duration-200"
        title="Centre de notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#CE1126] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#F8F6F0] shadow-md">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panneau de notifications */}
      {isOpen && (
        <>
          {/* Overlay pour fermer en cliquant à l'extérieur */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 mt-2 w-[420px] bg-white rounded-lg shadow-2xl border border-[#1B3A6B]/20 z-50 overflow-hidden">
            {/* En-tête */}
            <div className="bg-gradient-to-r from-[#1B3A6B] to-[#1B3A6B]/90 text-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  <h3 className="font-semibold">Centre de Notifications</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-white/80">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''} • {unreadCount} non traité{unreadCount !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="border-b border-[#1B3A6B]/10 p-3 bg-[#F8F6F0] flex gap-2">
              <button
                onClick={onRefresh}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[#1B3A6B] bg-white hover:bg-[#FCD116]/20 border border-[#1B3A6B]/20 rounded-md transition-colors"
                title="Actualiser"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Actualiser
              </button>
              <button
                onClick={onOpenSettings}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[#1B3A6B] bg-white hover:bg-[#FCD116]/20 border border-[#1B3A6B]/20 rounded-md transition-colors"
                title="Paramètres"
              >
                <Settings className="w-3.5 h-3.5" />
                Paramètres
              </button>
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[#CE1126] bg-white hover:bg-[#CE1126]/10 border border-[#CE1126]/20 rounded-md transition-colors"
                  title="Tout effacer"
                >
                  <X className="w-3.5 h-3.5" />
                  Tout effacer
                </button>
              )}
            </div>

            {/* Liste des notifications */}
            <div className="max-h-[480px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-[#1B3A6B]/20 mx-auto mb-3" />
                  <p className="text-sm text-[#1B3A6B]/60 mb-1">Aucune notification</p>
                  <p className="text-xs text-[#1B3A6B]/40">
                    Les notifications d'envoi apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#1B3A6B]/10">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-4 hover:bg-[#FCD116]/5 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        {/* Icône de type */}
                        <div className="flex-shrink-0 w-8 h-8 bg-[#F8F6F0] rounded-full flex items-center justify-center border border-[#1B3A6B]/10">
                          {getTypeIcon(notif.type)}
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-medium text-[#1B3A6B] truncate">
                              {notif.sujet}
                            </h4>
                            <button
                              onClick={() => onClearNotification(notif.id)}
                              className="flex-shrink-0 p-1 text-[#1B3A6B]/40 hover:text-[#CE1126] hover:bg-[#CE1126]/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                              title="Supprimer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="text-xs text-[#1B3A6B]/70 mb-2 line-clamp-1">
                            {notif.contribuable}
                          </p>

                          <div className="flex items-center gap-3 text-xs">
                            <span className="font-mono text-[#1B3A6B]/60">
                              {notif.destinataire}
                            </span>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(notif.statut)}
                              <span className={`font-medium ${
                                notif.statut === 'envoyé' ? 'text-[#009460]' :
                                notif.statut === 'échoué' ? 'text-[#CE1126]' :
                                'text-[#B8860B]'
                              }`}>
                                {getStatusText(notif.statut)}
                              </span>
                            </div>
                          </div>

                          <p className="text-[10px] text-[#1B3A6B]/50 mt-2">
                            {notif.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pied de page avec statistiques */}
            {notifications.length > 0 && (
              <div className="border-t border-[#1B3A6B]/10 p-3 bg-[#F8F6F0]">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div className="font-mono font-semibold text-[#009460]">
                      {notifications.filter(n => n.statut === 'envoyé').length}
                    </div>
                    <div className="text-[#1B3A6B]/60">Envoyés</div>
                  </div>
                  <div>
                    <div className="font-mono font-semibold text-[#B8860B]">
                      {notifications.filter(n => n.statut === 'en cours').length}
                    </div>
                    <div className="text-[#1B3A6B]/60">En cours</div>
                  </div>
                  <div>
                    <div className="font-mono font-semibold text-[#CE1126]">
                      {notifications.filter(n => n.statut === 'échoué').length}
                    </div>
                    <div className="text-[#1B3A6B]/60">Échoués</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
