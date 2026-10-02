import {
  Bell, Mail, MessageCircle, Settings, Download, Filter, Calendar,
  CheckCircle2, AlertTriangle, Clock, X, RefreshCw, TrendingUp,
  BarChart3, Send, User, FileText
} from "lucide-react";
import { useState } from "react";
import type { NotificationLog } from "./notification-helpers";
import { ExportButton } from "./ExportButton";
import type { ExportColumn } from "../utils/export-utils";

interface NotificationSettings {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  autoSendAvis: boolean;
  emailSmtp?: string;
  emailPort?: string;
  emailUser?: string;
  whatsappApi?: string;
}

interface NotificationsViewProps {
  notifications: NotificationLog[];
  settings: NotificationSettings;
  onClearNotification: (id: string) => void;
  onClearAll: () => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
}

type FilterStatus = 'all' | 'envoyé' | 'échoué' | 'en cours';
type FilterType = 'all' | 'email' | 'whatsapp';

export function NotificationsView({
  notifications,
  settings,
  onClearNotification,
  onClearAll,
  onOpenSettings,
  onRefresh
}: NotificationsViewProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Statistiques
  const stats = {
    total: notifications.length,
    envoyes: notifications.filter(n => n.statut === 'envoyé').length,
    echoues: notifications.filter(n => n.statut === 'échoué').length,
    enCours: notifications.filter(n => n.statut === 'en cours').length,
    emails: notifications.filter(n => n.type === 'email').length,
    whatsapp: notifications.filter(n => n.type === 'whatsapp').length,
  };

  // Filtrage
  const filteredNotifications = notifications.filter(notif => {
    const matchesStatus = filterStatus === 'all' || notif.statut === filterStatus;
    const matchesType = filterType === 'all' || notif.type === filterType;
    const matchesSearch = !searchQuery || 
      notif.contribuable.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.destinataire.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.sujet.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusIcon = (statut: NotificationLog['statut']) => {
    switch (statut) {
      case 'envoyé':
        return <CheckCircle2 className="w-5 h-5 text-[#009460]" />;
      case 'échoué':
        return <AlertTriangle className="w-5 h-5 text-[#CE1126]" />;
      case 'en cours':
        return <Clock className="w-5 h-5 text-[#FCD116]" />;
    }
  };

  const getTypeIcon = (type: NotificationLog['type']) => {
    return type === 'email' 
      ? <Mail className="w-5 h-5 text-[#1B3A6B]" />
      : <MessageCircle className="w-5 h-5 text-[#009460]" />;
  };

  const getStatusBadge = (statut: NotificationLog['statut']) => {
    const badges = {
      'envoyé': 'bg-[#009460]/10 text-[#009460] border-[#009460]/20',
      'échoué': 'bg-[#CE1126]/10 text-[#CE1126] border-[#CE1126]/20',
      'en cours': 'bg-[#FCD116]/10 text-[#B8860B] border-[#B8860B]/20'
    };
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${badges[statut]}`}>
        {statut.charAt(0).toUpperCase() + statut.slice(1)}
      </span>
    );
  };

  // Colonnes pour export
  const exportColumns: ExportColumn[] = [
    { header: 'ID', accessor: (n: NotificationLog) => n.id },
    { header: 'Type', accessor: (n: NotificationLog) => n.type.toUpperCase() },
    { header: 'Destinataire', accessor: (n: NotificationLog) => n.destinataire },
    { header: 'Contribuable', accessor: (n: NotificationLog) => n.contribuable },
    { header: 'Sujet', accessor: (n: NotificationLog) => n.sujet },
    { header: 'Statut', accessor: (n: NotificationLog) => n.statut },
    { header: 'Date', accessor: (n: NotificationLog) => n.date },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1B3A6B] mb-2">
            Centre de Notifications
          </h1>
          <p className="text-sm text-[#1B3A6B]/70">
            Suivi des notifications automatiques envoyées par email et WhatsApp
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#1B3A6B] border border-[#1B3A6B]/20 rounded-md hover:bg-[#FCD116]/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B3A6B] text-white rounded-md hover:bg-[#1B3A6B]/90 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Paramètres
          </button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#1B3A6B]/10 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[#1B3A6B]/10 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#1B3A6B]" />
            </div>
            <TrendingUp className="w-4 h-4 text-[#009460]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#1B3A6B] mb-1">
            {stats.total}
          </div>
          <div className="text-xs text-[#1B3A6B]/60 uppercase tracking-wide">
            Total notifications
          </div>
        </div>

        <div className="bg-white border border-[#009460]/20 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[#009460]/10 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#009460]" />
            </div>
            <div className="text-xs font-medium text-[#009460]">
              {stats.total > 0 ? Math.round((stats.envoyes / stats.total) * 100) : 0}%
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-[#009460] mb-1">
            {stats.envoyes}
          </div>
          <div className="text-xs text-[#1B3A6B]/60 uppercase tracking-wide">
            Envoyés avec succès
          </div>
        </div>

        <div className="bg-white border border-[#CE1126]/20 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[#CE1126]/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#CE1126]" />
            </div>
            <div className="text-xs font-medium text-[#CE1126]">
              {stats.total > 0 ? Math.round((stats.echoues / stats.total) * 100) : 0}%
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-[#CE1126] mb-1">
            {stats.echoues}
          </div>
          <div className="text-xs text-[#1B3A6B]/60 uppercase tracking-wide">
            Échoués
          </div>
        </div>

        <div className="bg-white border border-[#B8860B]/20 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-[#FCD116]/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#B8860B]" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-[#B8860B] mb-1">
            {stats.enCours}
          </div>
          <div className="text-xs text-[#1B3A6B]/60 uppercase tracking-wide">
            En cours
          </div>
        </div>
      </div>

      {/* État de configuration */}
      <div className="bg-gradient-to-r from-[#F8F6F0] to-white border border-[#1B3A6B]/10 rounded-lg p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-[#1B3A6B]/10">
            <Settings className="w-6 h-6 text-[#1B3A6B]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#1B3A6B] mb-2">Configuration des notifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1B3A6B]" />
                <span className="text-[#1B3A6B]/70">Email:</span>
                <span className={`font-medium ${settings.emailEnabled ? 'text-[#009460]' : 'text-[#CE1126]'}`}>
                  {settings.emailEnabled ? 'Activé' : 'Désactivé'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#009460]" />
                <span className="text-[#1B3A6B]/70">WhatsApp:</span>
                <span className={`font-medium ${settings.whatsappEnabled ? 'text-[#009460]' : 'text-[#CE1126]'}`}>
                  {settings.whatsappEnabled ? 'Activé' : 'Désactivé'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#B8860B]" />
                <span className="text-[#1B3A6B]/70">Auto-envoi:</span>
                <span className={`font-medium ${settings.autoSendAvis ? 'text-[#009460]' : 'text-[#CE1126]'}`}>
                  {settings.autoSendAvis ? 'Activé' : 'Désactivé'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#1B3A6B]" />
                <span className="text-[#1B3A6B]/70">Taux de succès:</span>
                <span className="font-medium text-[#009460]">
                  {stats.total > 0 ? Math.round((stats.envoyes / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="bg-white border border-[#1B3A6B]/10 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Recherche */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par contribuable, destinataire ou sujet..."
              className="w-full px-4 py-2 border border-[#1B3A6B]/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B]"
            />
          </div>

          {/* Filtres */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="px-3 py-2 border border-[#1B3A6B]/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20"
            >
              <option value="all">Tous les types</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="px-3 py-2 border border-[#1B3A6B]/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20"
            >
              <option value="all">Tous les statuts</option>
              <option value="envoyé">Envoyés</option>
              <option value="échoué">Échoués</option>
              <option value="en cours">En cours</option>
            </select>

            <ExportButton
              data={filteredNotifications}
              columns={exportColumns}
              filename="notifications-snrr-mamou"
              label="Exporter"
            />

            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="flex items-center gap-2 px-4 py-2 bg-[#CE1126]/10 text-[#CE1126] border border-[#CE1126]/20 rounded-md hover:bg-[#CE1126]/20 transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                Tout effacer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="bg-white border border-[#1B3A6B]/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8F6F0] border-b border-[#1B3A6B]/10">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#1B3A6B] uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#1B3A6B] uppercase tracking-wider">
                  Contribuable
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#1B3A6B] uppercase tracking-wider">
                  Sujet
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#1B3A6B] uppercase tracking-wider">
                  Destinataire
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#1B3A6B] uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#1B3A6B] uppercase tracking-wider">
                  Date
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-[#1B3A6B] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B3A6B]/5">
              {filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Bell className="w-12 h-12 text-[#1B3A6B]/20 mx-auto mb-3" />
                    <p className="text-sm text-[#1B3A6B]/60 mb-1">
                      {searchQuery || filterStatus !== 'all' || filterType !== 'all'
                        ? 'Aucune notification ne correspond aux filtres'
                        : 'Aucune notification pour le moment'}
                    </p>
                    <p className="text-xs text-[#1B3A6B]/40">
                      Les notifications apparaîtront ici après l'envoi
                    </p>
                  </td>
                </tr>
              ) : (
                filteredNotifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-[#FCD116]/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(notif.type)}
                        <span className="text-sm font-medium text-[#1B3A6B]">
                          {notif.type === 'email' ? 'Email' : 'WhatsApp'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#1B3A6B]/40" />
                        <span className="text-sm text-[#1B3A6B]">{notif.contribuable}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#1B3A6B]/40" />
                        <span className="text-sm text-[#1B3A6B]">{notif.sujet}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-[#1B3A6B]/70">
                        {notif.destinataire}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(notif.statut)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#1B3A6B]/40" />
                        <span className="text-xs font-mono text-[#1B3A6B]/60">
                          {notif.date}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onClearNotification(notif.id)}
                        className="p-2 text-[#1B3A6B]/40 hover:text-[#CE1126] hover:bg-[#CE1126]/10 rounded-md transition-colors"
                        title="Supprimer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Répartition par type */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#1B3A6B]/10 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-[#1B3A6B] mb-4 uppercase tracking-wide">
              Répartition par type
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1B3A6B]/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#1B3A6B]" />
                  </div>
                  <span className="text-sm text-[#1B3A6B]">Email</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-[#1B3A6B]/10 rounded-full h-2">
                    <div 
                      className="bg-[#1B3A6B] h-2 rounded-full transition-all"
                      style={{ width: `${stats.total > 0 ? (stats.emails / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono font-semibold text-[#1B3A6B] w-12 text-right">
                    {stats.emails}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#009460]/10 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-[#009460]" />
                  </div>
                  <span className="text-sm text-[#1B3A6B]">WhatsApp</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-[#009460]/10 rounded-full h-2">
                    <div 
                      className="bg-[#009460] h-2 rounded-full transition-all"
                      style={{ width: `${stats.total > 0 ? (stats.whatsapp / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono font-semibold text-[#009460] w-12 text-right">
                    {stats.whatsapp}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#1B3A6B]/10 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-[#1B3A6B] mb-4 uppercase tracking-wide">
              Répartition par statut
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#009460]" />
                  <span className="text-sm text-[#1B3A6B]">Envoyés</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-[#009460]/10 rounded-full h-2">
                    <div 
                      className="bg-[#009460] h-2 rounded-full transition-all"
                      style={{ width: `${stats.total > 0 ? (stats.envoyes / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono font-semibold text-[#009460] w-12 text-right">
                    {stats.envoyes}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#CE1126]" />
                  <span className="text-sm text-[#1B3A6B]">Échoués</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-[#CE1126]/10 rounded-full h-2">
                    <div 
                      className="bg-[#CE1126] h-2 rounded-full transition-all"
                      style={{ width: `${stats.total > 0 ? (stats.echoues / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono font-semibold text-[#CE1126] w-12 text-right">
                    {stats.echoues}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#B8860B]" />
                  <span className="text-sm text-[#1B3A6B]">En cours</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-[#FCD116]/20 rounded-full h-2">
                    <div 
                      className="bg-[#B8860B] h-2 rounded-full transition-all"
                      style={{ width: `${stats.total > 0 ? (stats.enCours / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono font-semibold text-[#B8860B] w-12 text-right">
                    {stats.enCours}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
