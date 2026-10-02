// ─── Définition des rôles et permissions ──────────────────────────────────────

export type Role = "Administrateur" | "Maire" | "Receveur municipal" | "Superviseur" | "Agent recenseur" | "Agent recouvrement";

export type Permission = 
  | "view_dashboard"
  | "view_recensement" | "create_recensement" | "edit_recensement" | "delete_recensement"
  | "view_taxation" | "create_taxation" | "edit_taxation" | "delete_taxation"
  | "view_paiements" | "create_paiements" | "validate_paiements" | "cancel_paiements"
  | "view_cartographie"
  | "view_rapports" | "export_rapports"
  | "view_business_intelligence"
  | "view_utilisateurs" | "create_utilisateurs" | "edit_utilisateurs" | "delete_utilisateurs"
  | "view_securite" | "manage_securite"
  | "view_parametres" | "edit_parametres"
  | "view_notifications" | "send_notifications"
  | "view_exercice_fiscal" | "edit_exercice_fiscal";

// Matrice des permissions par rôle
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  "Administrateur": [
    // Accès super admin à tout
    "view_dashboard",
    "view_recensement", "create_recensement", "edit_recensement", "delete_recensement",
    "view_taxation", "create_taxation", "edit_taxation", "delete_taxation",
    "view_paiements", "create_paiements", "validate_paiements", "cancel_paiements",
    "view_cartographie",
    "view_rapports", "export_rapports",
    "view_business_intelligence",
    "view_exercice_fiscal", "edit_exercice_fiscal",
    "view_utilisateurs", "create_utilisateurs", "edit_utilisateurs", "delete_utilisateurs",
    "view_securite", "manage_securite",
    "view_parametres", "edit_parametres",
    "view_notifications", "send_notifications"
  ],

  "Maire": [
    "view_dashboard",
    "view_recensement", "create_recensement", "edit_recensement", "delete_recensement",
    "view_taxation", "create_taxation", "edit_taxation", "delete_taxation",
    "view_paiements", "create_paiements", "validate_paiements", "cancel_paiements",
    "view_cartographie",
    "view_rapports", "export_rapports",
    "view_business_intelligence",
    "view_exercice_fiscal",
    "view_utilisateurs", "create_utilisateurs", "edit_utilisateurs", "delete_utilisateurs",
    "view_securite", "manage_securite",
    "view_parametres", "edit_parametres",
    "view_notifications", "send_notifications"
  ],

  "Receveur municipal": [
    "view_dashboard",
    "view_recensement", "edit_recensement",
    "view_taxation", "create_taxation", "edit_taxation",
    "view_paiements", "create_paiements", "validate_paiements", "cancel_paiements",
    "view_cartographie",
    "view_rapports", "export_rapports",
    "view_business_intelligence",
    "view_exercice_fiscal", "edit_exercice_fiscal",
    "view_utilisateurs",
    "view_securite",
    "view_parametres",
    "view_notifications", "send_notifications"
  ],

  "Superviseur": [
    "view_dashboard",
    "view_recensement", "create_recensement", "edit_recensement",
    "view_taxation", "create_taxation", "edit_taxation",
    "view_paiements", "create_paiements",
    "view_cartographie",
    "view_rapports", "export_rapports",
    "view_business_intelligence",
    "view_exercice_fiscal",
    "view_utilisateurs",
    "view_securite",
    "view_notifications", "send_notifications"
  ],
  
  "Agent recenseur": [
    // Recensement uniquement
    "view_dashboard",
    "view_recensement", "create_recensement", "edit_recensement",
    "view_cartographie",
    "view_notifications"
  ],
  
  "Agent recouvrement": [
    // Paiements et taxation
    "view_dashboard",
    "view_recensement",
    "view_taxation",
    "view_paiements", "create_paiements",
    "view_cartographie",
    "view_notifications", "send_notifications"
  ]
};

// Fonction pour vérifier si un rôle a une permission
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// Fonction pour vérifier si un rôle a accès à une vue
export function canAccessView(role: Role, view: string): boolean {
  const viewPermissions: Record<string, Permission> = {
    "dashboard": "view_dashboard",
    "recensement": "view_recensement",
    "taxation": "view_taxation",
    "paiements": "view_paiements",
    "cartographie": "view_cartographie",
    "rapports": "view_rapports",
    "business-intelligence": "view_business_intelligence",
    "exercice-fiscal": "view_exercice_fiscal",
    "utilisateurs": "view_utilisateurs",
    "securite": "view_securite",
    "parametres": "view_parametres",
    "notifications": "view_notifications"
  };
  
  const requiredPermission = viewPermissions[view];
  return requiredPermission ? hasPermission(role, requiredPermission) : false;
}

// Descriptions des rôles
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  "Administrateur": "Accès super admin à toutes les fonctionnalités de la plateforme. Gestion stratégique et validation finale.",
  "Maire": "Accès complet à toutes les fonctionnalités de la plateforme. Gestion stratégique et validation finale.",
  "Receveur municipal": "Gestion financière complète : taxation, paiements, recouvrement et génération de rapports financiers.",
  "Superviseur": "Supervision des opérations, contrôle qualité des données et validation des recensements.",
  "Agent recenseur": "Recensement des contribuables sur le terrain, saisie et mise à jour des informations.",
  "Agent recouvrement": "Enregistrement des paiements, suivi des recouvrements et envoi de notifications aux contribuables."
};

// Icônes des rôles (noms d'icônes lucide-react)
export const ROLE_ICONS: Record<Role, string> = {
  "Administrateur": "Crown",
  "Maire": "Crown",
  "Receveur municipal": "Wallet",
  "Superviseur": "Shield",
  "Agent recenseur": "Clipboard",
  "Agent recouvrement": "Coins"
};

// Couleurs des badges de rôle
export const ROLE_COLORS: Record<Role, string> = {
  "Administrateur": "bg-purple-100 text-purple-800 border-purple-200",
  "Maire": "bg-purple-100 text-purple-800 border-purple-200",
  "Receveur municipal": "bg-blue-100 text-blue-800 border-blue-200",
  "Superviseur": "bg-green-100 text-green-800 border-green-200",
  "Agent recenseur": "bg-amber-100 text-amber-800 border-amber-200",
  "Agent recouvrement": "bg-teal-100 text-teal-800 border-teal-200"
};