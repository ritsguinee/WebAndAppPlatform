import { Mail, MessageCircle, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface NotificationButtonsProps {
  email?: string;
  telephone?: string;
  onSendEmail: (email: string) => Promise<void>;
  onSendWhatsApp: (phone: string) => Promise<void>;
  disabled?: boolean;
  contribuableName?: string;
  avisReference?: string;
}

export function NotificationButtons({
  email,
  telephone,
  onSendEmail,
  onSendWhatsApp,
  disabled = false,
  contribuableName,
  avisReference
}: NotificationButtonsProps) {
  const [emailSending, setEmailSending] = useState(false);
  const [whatsappSending, setWhatsappSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [whatsappSent, setWhatsappSent] = useState(false);

  const handleSendEmail = async () => {
    if (!email || disabled || emailSending) return;
    
    setEmailSending(true);
    try {
      await onSendEmail(email);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (error) {
      console.error('Erreur envoi email:', error);
    } finally {
      setEmailSending(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!telephone || disabled || whatsappSending) return;
    
    setWhatsappSending(true);
    try {
      await onSendWhatsApp(telephone);
      setWhatsappSent(true);
      setTimeout(() => setWhatsappSent(false), 3000);
    } catch (error) {
      console.error('Erreur envoi WhatsApp:', error);
    } finally {
      setWhatsappSending(false);
    }
  };

  const hasEmailOrPhone = email || telephone;

  if (!hasEmailOrPhone) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-[#FCD116]/10 border border-[#B8860B]/30 rounded-md">
        <Send className="w-4 h-4 text-[#B8860B]" />
        <span className="text-xs text-[#1B3A6B]/70">
          Aucun contact disponible
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Bouton Email */}
      {email && (
        <button
          onClick={handleSendEmail}
          disabled={disabled || emailSending || emailSent}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
            ${emailSent
              ? 'bg-[#009460] text-white'
              : 'bg-[#1B3A6B] text-white hover:bg-[#1B3A6B]/90 active:scale-95'
            }
            ${(disabled || emailSending) && !emailSent ? 'opacity-50 cursor-not-allowed' : ''}
            border border-[#1B3A6B]/20 shadow-sm hover:shadow-md
          `}
          title={email}
        >
          {emailSending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Envoi...</span>
            </>
          ) : emailSent ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Envoyé !</span>
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              <span>Envoyer par Email</span>
            </>
          )}
        </button>
      )}

      {/* Bouton WhatsApp */}
      {telephone && (
        <button
          onClick={handleSendWhatsApp}
          disabled={disabled || whatsappSending || whatsappSent}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
            ${whatsappSent
              ? 'bg-[#009460] text-white'
              : 'bg-[#009460] text-white hover:bg-[#007850] active:scale-95'
            }
            ${(disabled || whatsappSending) && !whatsappSent ? 'opacity-50 cursor-not-allowed' : ''}
            border border-[#007850]/20 shadow-sm hover:shadow-md
          `}
          title={telephone}
        >
          {whatsappSending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Envoi...</span>
            </>
          ) : whatsappSent ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Envoyé !</span>
            </>
          ) : (
            <>
              <MessageCircle className="w-4 h-4" />
              <span>Envoyer par WhatsApp</span>
            </>
          )}
        </button>
      )}

      {/* Bouton d'envoi simultané */}
      {email && telephone && (
        <button
          onClick={async () => {
            await handleSendEmail();
            await handleSendWhatsApp();
          }}
          disabled={disabled || emailSending || whatsappSending || (emailSent && whatsappSent)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
            ${(emailSent && whatsappSent)
              ? 'bg-[#009460] text-white'
              : 'bg-gradient-to-r from-[#1B3A6B] to-[#009460] text-white hover:opacity-90 active:scale-95'
            }
            ${(disabled || emailSending || whatsappSending) && !(emailSent && whatsappSent) ? 'opacity-50 cursor-not-allowed' : ''}
            border border-white/20 shadow-sm hover:shadow-md
          `}
          title="Envoyer par Email et WhatsApp"
        >
          {(emailSending || whatsappSending) ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Envoi multiple...</span>
            </>
          ) : (emailSent && whatsappSent) ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Tout envoyé !</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Envoyer les deux</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

interface QuickNotifyButtonProps {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'email' | 'whatsapp' | 'both' | 'custom';
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function QuickNotifyButton({
  icon,
  label,
  onClick,
  variant = 'custom',
  disabled = false,
  loading = false,
  size = 'md'
}: QuickNotifyButtonProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-2 text-sm gap-2',
    lg: 'px-4 py-2.5 text-base gap-2'
  };

  const variantClasses = {
    email: 'bg-[#1B3A6B] text-white hover:bg-[#1B3A6B]/90 border-[#1B3A6B]/20',
    whatsapp: 'bg-[#009460] text-white hover:bg-[#007850] border-[#007850]/20',
    both: 'bg-gradient-to-r from-[#1B3A6B] to-[#009460] text-white hover:opacity-90 border-white/20',
    custom: 'bg-[#B8860B] text-white hover:bg-[#B8860B]/90 border-[#B8860B]/20'
  };

  const defaultIcon = variant === 'email' ? <Mail className="w-4 h-4" /> :
                      variant === 'whatsapp' ? <MessageCircle className="w-4 h-4" /> :
                      variant === 'both' ? <Send className="w-4 h-4" /> :
                      <Send className="w-4 h-4" />;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center justify-center rounded-md font-medium transition-all duration-200
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 shadow-sm hover:shadow-md'}
        border
      `}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon || defaultIcon
      )}
      <span>{label}</span>
    </button>
  );
}
