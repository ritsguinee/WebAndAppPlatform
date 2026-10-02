# Module Orange Money - SNRR-Mamou

## 📱 Vue d'ensemble

Le module Orange Money permet aux contribuables de la commune de Mamou de payer leurs taxes (CFU et Patentes) via Orange Money Guinée, directement depuis la plateforme SNRR-Mamou. Ce module offre une expérience de paiement moderne, rapide et sécurisée.

## ✨ Fonctionnalités

### 🎯 Méthodes de paiement

1. **Paiement par numéro Orange Money**
   - Saisie manuelle du numéro du payeur
   - Validation automatique du format guinéen (+224 6XX XX XX XX)
   - Interface intuitive avec auto-complétion

2. **Paiement par scan QR Code**
   - Scanner le QR Code Orange Money du contribuable
   - Extraction automatique des informations
   - Zéro erreur de saisie

### 🔄 Processus de paiement en 4 étapes

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Sélection   │────▶│ Saisie/Scan  │────▶│  Validation  │────▶│ Confirmation │
│  de méthode  │     │  du numéro   │     │ des détails  │     │  & Reçu      │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

### 📧 Notifications automatiques

Après chaque paiement réussi :
- **Email** : Reçu envoyé au contribuable (si email renseigné)
- **WhatsApp** : Notification à l'équipe de gestion (+224626001110)

### 🧾 Génération de reçu

Chaque transaction génère automatiquement :
- Référence unique (format : `OM-XXXXXXXX`)
- Reçu PDF téléchargeable
- Reçu imprimable
- Données exportables (Excel, CSV)

## 🎨 Captures d'écran

### Interface de sélection de méthode
- Design moderne avec les couleurs Orange Money
- Deux options claires : Numéro ou QR Code
- Affichage du montant à payer

### Écran de validation
- Récapitulatif complet de la transaction
- Vérification avant paiement
- Bouton de confirmation sécurisé

### Confirmation de paiement
- Statut visuel (succès/échec)
- Détails de la transaction
- Options de téléchargement et impression

## 🔧 Architecture technique

### Composants créés

```
/src/app/components/
└── OrangeMoneyPayment.tsx    # Composant principal du module
```

### Fichiers modifiés

```
/src/app/App.tsx               # Intégration dans l'application
├── Import du composant OrangeMoneyPayment
├── Ajout du type modal "orange-money-payment"
├── Modification du PaiementForm avec bouton Orange Money
└── Gestion du modal de paiement Orange Money
```

### Dépendances installées

```json
{
  "react-qr-scanner": "1.0.0-alpha.11",  // Scanner QR Code
  "qrcode.react": "^4.2.0"               // Génération QR Code
}
```

## 📊 Intégration avec les modules existants

### Module Paiements
- Ajout automatique dans l'historique des paiements
- Marquage du contribuable comme "Payé"
- Export inclus dans les rapports de paiement

### Module Business Intelligence
- Statistiques Orange Money dans les graphiques
- Comparaison avec autres méthodes de paiement
- Tendances et projections

### Module Notifications
- Intégration avec le système de notifications existant
- Envoi automatique via email et WhatsApp
- Historique des notifications dans le module dédié

## 🔐 Sécurité

### Mesures implémentées

1. **Validation stricte** : Format de numéro Orange Money vérifié
2. **Confirmation utilisateur** : Double vérification avant paiement
3. **Références uniques** : Impossibilité de duplication de transaction
4. **Notifications temps réel** : Traçabilité complète
5. **Logs d'audit** : Toutes les transactions enregistrées

### Recommandations de production

- ⚠️ Ne jamais appeler l'API Orange Money depuis le frontend
- ✅ Utiliser un backend intermédiaire sécurisé
- ✅ Stocker les credentials dans des variables d'environnement
- ✅ Implémenter le rate limiting sur les endpoints
- ✅ Chiffrer les données sensibles

## 🚀 Comment utiliser

### Pour les utilisateurs finaux

1. Naviguer vers le module **Paiements**
2. Cliquer sur **"Nouveau paiement"**
3. Sélectionner le contribuable et saisir le montant
4. Cliquer sur **"Payer avec Orange Money"** (encadré orange)
5. Choisir la méthode (numéro ou QR Code)
6. Valider le paiement
7. Télécharger/imprimer le reçu

### Pour les développeurs

Consulter les guides d'intégration :
- [`GUIDE_ORANGE_MONEY.md`](/GUIDE_ORANGE_MONEY.md) : Guide utilisateur
- [`INTEGRATION_ORANGE_MONEY_API.md`](/INTEGRATION_ORANGE_MONEY_API.md) : Guide technique API

## 📋 Configuration

### Configuration actuelle (Démo)

```typescript
const numeroMarchand = "+224 626 00 11 10";  // Numéro marchand commune
const notificationWhatsApp = "+224626001110"; // Notifications WhatsApp
```

### Configuration production

Pour la production, configurer :
1. **API Orange Money** : Client ID, Secret, PIN marchand
2. **Backend API** : Endpoints sécurisés pour les transactions
3. **Webhooks** : URL pour recevoir les notifications asynchrones
4. **Monitoring** : Logs et alertes pour les transactions

Voir [`INTEGRATION_ORANGE_MONEY_API.md`](/INTEGRATION_ORANGE_MONEY_API.md) pour les détails.

## 🎯 Permissions d'accès

| Profil | Accès au module |
|--------|----------------|
| Maire | ✅ Accès complet |
| Receveur Municipal | ✅ Accès complet |
| Superviseur | ✅ Accès complet |
| Agent de Recouvrement | ✅ Peut effectuer des paiements |
| Agent de Recensement | ❌ Aucun accès |

## 📈 Statistiques et reporting

### Données trackées

- Nombre de transactions Orange Money
- Montant total collecté via Orange Money
- Taux de succès/échec des transactions
- Temps moyen de traitement
- Méthode préférée (numéro vs QR Code)

### Exports disponibles

- **PDF** : Reçus individuels et rapports consolidés
- **Excel** : Liste complète des transactions
- **CSV** : Export pour systèmes tiers
- **Dashboard BI** : Graphiques et analyses

## 🔮 Évolutions futures

### Fonctionnalités prévues

1. **Multi-opérateurs** 
   - MTN Mobile Money
   - Moov Money
   - Autres opérateurs guinéens

2. **Paiements récurrents**
   - Abonnements mensuels automatiques
   - Rappels avant échéance

3. **Paiements fractionnés**
   - Payer en plusieurs fois
   - Plans de paiement personnalisés

4. **QR Code personnalisés**
   - Génération de QR Code par contribuable
   - Liens de paiement directs

5. **Rapprochement bancaire**
   - Réconciliation automatique avec le compte Orange Money
   - Export pour logiciels comptables

## 🐛 Dépannage

### Problèmes courants

| Problème | Solution |
|----------|----------|
| Scanner QR ne fonctionne pas | Autoriser l'accès caméra dans le navigateur |
| "Numéro invalide" | Vérifier le format : +224 6XX XX XX XX |
| Transaction échouée | Vérifier solde Orange Money du payeur |
| Notifications non envoyées | Vérifier configuration email/WhatsApp |

### Logs de debug

Les transactions sont loggées dans la console navigateur :
```javascript
console.log("📧 Email envoyé:", notifEmail);
console.log("📱 WhatsApp envoyé:", notifWhatsApp);
```

## 📞 Support

Pour assistance technique :
- **Email** : support@mamou-commune.gn
- **Téléphone** : +224 626 00 11 10
- **WhatsApp** : +224626001110

## 📄 Documentation associée

- [`/GUIDE_ORANGE_MONEY.md`](/GUIDE_ORANGE_MONEY.md) - Guide utilisateur complet
- [`/INTEGRATION_ORANGE_MONEY_API.md`](/INTEGRATION_ORANGE_MONEY_API.md) - Guide d'intégration API
- [`/RESUME_MODIFICATIONS.md`](/RESUME_MODIFICATIONS.md) - Historique des modifications

## 🏆 Avantages du module

### Pour les contribuables
- ✅ Paiement rapide et facile
- ✅ Pas besoin de se déplacer
- ✅ Reçu instantané
- ✅ Paiement 24/7

### Pour la commune
- ✅ Réduction des délais de recouvrement
- ✅ Moins de manipulation d'espèces
- ✅ Traçabilité complète
- ✅ Réconciliation automatisée
- ✅ Statistiques en temps réel

### Pour les agents
- ✅ Interface intuitive
- ✅ Moins d'erreurs de saisie
- ✅ Gain de temps
- ✅ Notifications automatiques

## 🎨 Design et UX

Le module suit la charte graphique SNRR-Mamou :
- **Couleurs primaires** : Orange (#FF7900) pour Orange Money
- **Polices** : 
  - Crimson Pro (chiffres et montants)
  - Inter (texte courant)
  - JetBrains Mono (données techniques)
- **Design** : Interface claire et moderne
- **Responsive** : Fonctionne sur desktop et mobile

## 🔄 Workflow complet

```mermaid
graph TD
    A[Agent ouvre nouveau paiement] --> B[Saisit montant et contribuable]
    B --> C[Clique "Payer avec Orange Money"]
    C --> D{Choix méthode}
    D -->|Numéro| E[Saisie numéro Orange Money]
    D -->|QR Code| F[Scan QR Code]
    E --> G[Validation des informations]
    F --> G
    G --> H[Traitement paiement]
    H --> I{Résultat}
    I -->|Succès| J[Génération reçu]
    I -->|Échec| K[Affichage erreur + Réessayer]
    J --> L[Envoi notifications Email + WhatsApp]
    L --> M[Enregistrement dans base de données]
    M --> N[Fin - Contribuable marqué "Payé"]
```

---

**Version** : 1.0  
**Date de création** : Juin 2026  
**Auteur** : Équipe SNRR-Mamou  
**Plateforme** : SNRR-Mamou — Système National de Recensement et de Recouvrement
