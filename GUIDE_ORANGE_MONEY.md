# Guide d'utilisation : Paiement Orange Money

## Vue d'ensemble

Le module de paiement Orange Money permet d'effectuer des transactions sécurisées via Orange Money Guinée directement depuis la plateforme SNRR-Mamou. Les contribuables peuvent payer leurs taxes (CFU et Patentes) en utilisant leur compte Orange Money.

## Fonctionnalités principales

### 1. Deux méthodes de paiement

#### **Méthode 1 : Paiement par numéro**
- Saisir manuellement le numéro Orange Money du payeur
- Format requis : `+224 6XX XX XX XX`
- Validation automatique du format
- Traitement instantané de la transaction

#### **Méthode 2 : Scanner QR Code**
- Scanner le QR Code Orange Money du contribuable
- Extraction automatique du numéro de téléphone
- Plus rapide et sans erreur de saisie

### 2. Processus de paiement sécurisé

Le processus suit 4 étapes :

1. **Sélection de la méthode** : Choix entre numéro ou QR Code
2. **Saisie/Scan** : Entrée du numéro Orange Money
3. **Validation** : Vérification des informations avant paiement
4. **Confirmation** : Reçu de transaction et notifications

### 3. Notifications automatiques

Après chaque paiement réussi, des notifications sont envoyées automatiquement :

- **📧 Email** : Reçu de paiement envoyé au contribuable (si email renseigné)
- **📱 WhatsApp** : Notification envoyée au numéro de gestion : `+224626001110`

## Comment utiliser le module

### Depuis le module Paiements

1. Cliquer sur **"Nouveau paiement"** dans le menu Paiements
2. Sélectionner le contribuable dans la liste
3. Saisir le montant à payer
4. Cliquer sur le bouton **"Payer avec Orange Money"** (encadré orange)
5. Suivre les étapes du processus de paiement

### Depuis un dossier contribuable

1. Ouvrir le dossier d'un contribuable (vue détaillée)
2. Cliquer sur **"Enregistrer un paiement"**
3. Cliquer sur **"Payer avec Orange Money"**
4. Le contribuable et son montant sont pré-remplis

## Configuration technique

### Numéro marchand Orange Money

Le numéro marchand de la Commune de Mamou est configuré dans le système :
- **Numéro marchand** : `+224 626 00 11 10`

### Numéro WhatsApp pour notifications

Les notifications de paiement sont envoyées au numéro :
- **WhatsApp de gestion** : `+224626001110`

### Intégration API (Production)

⚠️ **Note importante** : La version actuelle utilise une simulation de l'API Orange Money pour la démonstration.

Pour la mise en production, il faut :

1. **Obtenir les identifiants API Orange Money** :
   - Contacter Orange Money Business Guinée
   - Obtenir les clés API (Client ID, Client Secret)
   - Obtenir l'URL de l'API de production

2. **Configurer les endpoints** :
   - Endpoint d'authentification
   - Endpoint de paiement
   - Endpoint de vérification de transaction

3. **Remplacer la simulation dans `/src/app/components/OrangeMoneyPayment.tsx`** :
   ```typescript
   // Remplacer cette section (ligne ~110) :
   const processPayment = async () => {
     setIsProcessing(true);
     setError(null);

     try {
       // TODO: Remplacer par l'appel API réel Orange Money
       const response = await fetch('https://api.orange.money.gn/v1/payment', {
         method: 'POST',
         headers: {
           'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           amount: montant,
           currency: 'GNF',
           payerNumber: numeroPayeur,
           merchantNumber: numeroMarchand,
           reference: contribuableId,
           description: `Paiement CFU/Patente - ${contribuableNom}`
         })
       });

       const data = await response.json();
       
       if (data.status === 'SUCCESS') {
         // Traiter le succès
       } else {
         // Traiter l'erreur
       }
     } catch (err) {
       // Gérer l'erreur
     }
   };
   ```

## Réconciliation et reporting

### Suivi des transactions

Toutes les transactions Orange Money sont enregistrées dans le module **Paiements** avec :
- Référence de transaction unique (format : `OM-XXXXXXXX`)
- Date et heure précises
- Numéro du payeur
- Montant payé
- Statut (Validé/Échoué)

### Export des données

Les transactions Orange Money peuvent être exportées via :
- **PDF** : Reçus individuels ou rapport consolidé
- **Excel** : Tableau de toutes les transactions pour analyse
- **CSV** : Import dans d'autres systèmes comptables

### Dashboard Business Intelligence

Le module **Business Intelligence** inclut les paiements Orange Money dans :
- Graphiques de répartition par méthode de paiement
- Évolution des recettes par opérateur
- Taux de paiement mobile vs espèces
- Projections basées sur l'historique Orange Money

## Sécurité

### Mesures de sécurité implémentées

1. **Validation des numéros** : Format Orange Money strict
2. **Confirmation avant paiement** : Écran de validation des détails
3. **Notifications en temps réel** : Email + WhatsApp automatiques
4. **Reçus sécurisés** : Référence unique non-modifiable
5. **Traçabilité complète** : Logs de toutes les transactions

### Recommandations

- ⚠️ Vérifier toujours le numéro Orange Money avant validation
- ✅ Demander confirmation au contribuable avant de procéder
- ✅ Conserver les reçus de transaction (PDF/impression)
- ✅ Réconcilier quotidiennement avec le compte Orange Money

## Dépannage

### Problèmes courants

| Problème | Cause | Solution |
|----------|-------|----------|
| "Numéro invalide" | Format incorrect | Vérifier le format : +224 6XX XX XX XX |
| "Transaction échouée" | Solde insuffisant | Vérifier le solde du compte payeur |
| "Scanner ne fonctionne pas" | Permissions caméra | Autoriser l'accès à la caméra dans le navigateur |
| "Notifications non envoyées" | Configuration manquante | Vérifier les paramètres email/WhatsApp |

### Support technique

Pour toute assistance technique :
- **Email** : support@mamou-commune.gn
- **Téléphone** : +224 626 00 11 10
- **WhatsApp** : +224626001110

## Permissions requises

Les profils suivants peuvent accéder au module de paiement Orange Money :

- ✅ **Maire** : Accès complet
- ✅ **Receveur Municipal** : Accès complet
- ✅ **Superviseur** : Accès complet
- ✅ **Agent de Recouvrement** : Peut effectuer des paiements
- ❌ **Agent de Recensement** : Aucun accès aux paiements

## Évolutions futures

### Fonctionnalités prévues

1. **Paiement récurrent** : Mise en place de prélèvements automatiques mensuels
2. **MTN Money** : Intégration de MTN Mobile Money
3. **Moov Money** : Ajout d'autres opérateurs guinéens
4. **Paiement fractionné** : Possibilité de payer en plusieurs fois
5. **Rappels automatiques** : SMS de rappel avant échéance
6. **QR Code dynamique** : Génération de QR Code personnalisé par contribuable

---

**Version** : 1.0  
**Dernière mise à jour** : Juin 2026  
**Plateforme** : SNRR-Mamou — Système National de Recensement et de Recouvrement
