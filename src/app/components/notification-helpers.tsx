// ─── Helpers pour les notifications ──────────────────────────────────────────

export interface NotificationLog {
  id: string;
  type: 'email' | 'whatsapp';
  destinataire: string;
  contribuable: string;
  sujet: string;
  statut: 'envoyé' | 'échoué' | 'en cours';
  date: string;
}

export function createNotificationLog(
  type: 'email' | 'whatsapp',
  destinataire: string,
  contribuable: string,
  sujet: string
): NotificationLog {
  return {
    id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    destinataire,
    contribuable,
    sujet,
    statut: 'envoyé',
    date: new Date().toLocaleString('fr-FR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  };
}

export function sendEmailNotification(
  email: string,
  subject: string,
  body: string,
  autoSend: boolean = false
): void {
  if (!autoSend) {
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
}

export function sendWhatsAppNotification(
  phone: string,
  message: string
): void {
  const cleanPhone = phone.replace(/\D/g, '');
  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
}
