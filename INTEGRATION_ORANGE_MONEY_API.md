# Guide d'intégration API Orange Money Guinée

## Vue d'ensemble technique

Ce document décrit comment intégrer l'API Orange Money Guinée en production pour remplacer la simulation actuelle du module de paiement SNRR-Mamou.

## Prérequis

### 1. Compte marchand Orange Money

Contactez Orange Money Business Guinée pour obtenir :

- **Numéro marchand** : Numéro de téléphone Orange Money Business
- **Client ID** : Identifiant unique de votre application
- **Client Secret** : Clé secrète pour l'authentification
- **URL API** : Endpoint de l'API (environnement test et production)

**Contacts Orange Money Business Guinée** :
- Email : business@orange-money.gn
- Téléphone : +224 622 XX XX XX (à confirmer avec Orange)
- Agence : Centre commercial Kaloum, Conakry

### 2. Documentation API Orange Money

Demandez la documentation officielle incluant :
- Spécifications des endpoints
- Formats de requêtes/réponses
- Codes d'erreur
- Limites de taux (rate limits)
- Webhooks pour les notifications

## Architecture de l'intégration

### Flux de paiement

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐      ┌──────────────┐
│ Frontend    │─────▶│ Backend API  │─────▶│ Orange Money API│─────▶│ Orange Money │
│ (React)     │◀─────│ (Node.js)    │◀─────│                 │◀─────│ Platform     │
└─────────────┘      └──────────────┘      └─────────────────┘      └──────────────┘
```

**Important** : Pour des raisons de sécurité, **NE JAMAIS** appeler l'API Orange Money directement depuis le frontend. Utilisez un backend intermédiaire.

## Configuration backend (recommandé)

### Option 1 : API Node.js/Express

Créez un backend API pour gérer les transactions Orange Money :

```javascript
// server/api/orange-money.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

// Configuration (à stocker dans des variables d'environnement)
const ORANGE_MONEY_CONFIG = {
  baseURL: process.env.ORANGE_MONEY_API_URL,
  clientId: process.env.ORANGE_MONEY_CLIENT_ID,
  clientSecret: process.env.ORANGE_MONEY_CLIENT_SECRET,
  merchantNumber: process.env.ORANGE_MONEY_MERCHANT_NUMBER
};

// Fonction d'authentification OAuth2
async function getAccessToken() {
  try {
    const response = await axios.post(
      `${ORANGE_MONEY_CONFIG.baseURL}/oauth/v2/token`,
      {
        grant_type: 'client_credentials'
      },
      {
        auth: {
          username: ORANGE_MONEY_CONFIG.clientId,
          password: ORANGE_MONEY_CONFIG.clientSecret
        }
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error('Erreur authentification Orange Money:', error);
    throw new Error('Échec authentification Orange Money');
  }
}

// Endpoint pour initier un paiement
router.post('/initiate-payment', async (req, res) => {
  try {
    const { amount, payerNumber, reference, description } = req.body;
    
    // Validation des données
    if (!amount || !payerNumber || !reference) {
      return res.status(400).json({ error: 'Données manquantes' });
    }
    
    // Obtenir le token d'accès
    const accessToken = await getAccessToken();
    
    // Initier le paiement
    const paymentResponse = await axios.post(
      `${ORANGE_MONEY_CONFIG.baseURL}/omcoreapis/1.0.2/mp/pay`,
      {
        subscriber_msisdn: payerNumber.replace(/\s/g, ''), // Format: 224621123456
        merchant_msisdn: ORANGE_MONEY_CONFIG.merchantNumber,
        amount: amount,
        currency: 'GNF',
        order_id: reference,
        reference: description,
        pin: process.env.ORANGE_MONEY_PIN // PIN du compte marchand
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Retourner la réponse
    res.json({
      success: true,
      transactionId: paymentResponse.data.transaction_id,
      status: paymentResponse.data.status,
      data: paymentResponse.data
    });
    
  } catch (error) {
    console.error('Erreur paiement Orange Money:', error.response?.data || error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || 'Erreur lors du paiement'
    });
  }
});

// Endpoint pour vérifier le statut d'une transaction
router.get('/transaction-status/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const accessToken = await getAccessToken();
    
    const statusResponse = await axios.get(
      `${ORANGE_MONEY_CONFIG.baseURL}/omcoreapis/1.0.2/mp/paymentstatus/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    res.json({
      success: true,
      status: statusResponse.data.status,
      data: statusResponse.data
    });
    
  } catch (error) {
    console.error('Erreur vérification statut:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification du statut'
    });
  }
});

export default router;
```

### Variables d'environnement (.env)

```bash
# Orange Money API Configuration
ORANGE_MONEY_API_URL=https://api.orange.com/orange-money-webpay/gn/v1
ORANGE_MONEY_CLIENT_ID=your_client_id_here
ORANGE_MONEY_CLIENT_SECRET=your_client_secret_here
ORANGE_MONEY_MERCHANT_NUMBER=224626001110
ORANGE_MONEY_PIN=your_merchant_pin_here

# Environnement (test ou production)
ORANGE_MONEY_ENV=test
```

### Option 2 : Supabase Edge Functions

Si vous utilisez Supabase, créez une Edge Function :

```typescript
// supabase/functions/orange-money-payment/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ORANGE_MONEY_API_URL = Deno.env.get('ORANGE_MONEY_API_URL')
const ORANGE_MONEY_CLIENT_ID = Deno.env.get('ORANGE_MONEY_CLIENT_ID')
const ORANGE_MONEY_CLIENT_SECRET = Deno.env.get('ORANGE_MONEY_CLIENT_SECRET')

serve(async (req) => {
  try {
    const { amount, payerNumber, reference, description } = await req.json()
    
    // Authentification Orange Money
    const authResponse = await fetch(`${ORANGE_MONEY_API_URL}/oauth/v2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${ORANGE_MONEY_CLIENT_ID}:${ORANGE_MONEY_CLIENT_SECRET}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })
    
    const { access_token } = await authResponse.json()
    
    // Initier le paiement
    const paymentResponse = await fetch(`${ORANGE_MONEY_API_URL}/omcoreapis/1.0.2/mp/pay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscriber_msisdn: payerNumber.replace(/\s/g, ''),
        merchant_msisdn: Deno.env.get('ORANGE_MONEY_MERCHANT_NUMBER'),
        amount: amount,
        currency: 'GNF',
        order_id: reference,
        reference: description
      })
    })
    
    const paymentData = await paymentResponse.json()
    
    return new Response(JSON.stringify({
      success: true,
      transactionId: paymentData.transaction_id,
      status: paymentData.status
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

## Modification du frontend

Modifiez `/src/app/components/OrangeMoneyPayment.tsx` :

```typescript
// Remplacer la fonction processPayment (ligne ~110)
const processPayment = async () => {
  setIsProcessing(true);
  setError(null);

  try {
    // Appel à votre backend API au lieu de la simulation
    const response = await fetch('/api/orange-money/initiate-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Ajouter l'authentification si nécessaire
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        amount: montant,
        payerNumber: numeroPayeur,
        reference: contribuableId,
        description: `Paiement CFU/Patente - ${contribuableNom}`
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la transaction');
    }

    const data = await response.json();

    if (data.success) {
      // Vérifier le statut de la transaction
      const statusResponse = await fetch(`/api/orange-money/transaction-status/${data.transactionId}`);
      const statusData = await statusResponse.json();

      if (statusData.status === 'SUCCESS' || statusData.status === 'SUCCESSFUL') {
        const transactionRef = `OM-${data.transactionId}`;
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
        sendNotifications(nouveauTransaction);
      } else if (statusData.status === 'FAILED') {
        throw new Error(statusData.data?.message || 'Transaction échouée');
      } else if (statusData.status === 'PENDING') {
        // Gérer les transactions en attente
        setError('Transaction en attente de confirmation. Veuillez patienter...');
        // Implémenter un polling ou un webhook pour vérifier le statut
      }
    } else {
      throw new Error(data.error || 'Erreur inconnue');
    }

    setIsProcessing(false);

  } catch (err: any) {
    setIsProcessing(false);
    setError(err.message || "Échec de la transaction. Veuillez réessayer.");

    const transactionEchouee: Transaction = {
      ref: `OM-ERR-${Date.now().toString().slice(-8)}`,
      montant: montant,
      numeroPayeur: numeroPayeur,
      numeroMarchand: numeroMarchand,
      date: new Date().toLocaleString("fr-GN"),
      statut: 'échoué',
      messageStatut: err.message || 'Transaction échouée'
    };
    setTransaction(transactionEchouee);
  }
};
```

## Webhooks (notifications asynchrones)

Pour recevoir les notifications de changement de statut de transaction :

```javascript
// server/api/webhooks/orange-money.js
import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Endpoint webhook pour les notifications Orange Money
router.post('/notification', (req, res) => {
  try {
    // Vérifier la signature du webhook (sécurité)
    const signature = req.headers['x-orange-signature'];
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', process.env.ORANGE_MONEY_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Signature invalide' });
    }
    
    // Traiter la notification
    const { transaction_id, status, order_id, amount } = req.body;
    
    console.log('Notification reçue:', { transaction_id, status, order_id });
    
    // Mettre à jour la base de données
    // TODO: Implémenter la mise à jour dans votre base de données
    // updateTransactionStatus(transaction_id, status);
    
    // Envoyer des notifications aux utilisateurs si nécessaire
    if (status === 'SUCCESS') {
      // sendEmailNotification(order_id);
      // sendWhatsAppNotification(order_id);
    }
    
    // Confirmer la réception du webhook
    res.status(200).json({ message: 'Notification reçue' });
    
  } catch (error) {
    console.error('Erreur traitement webhook:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
```

## Gestion des erreurs

### Codes d'erreur courants Orange Money

| Code | Description | Action |
|------|-------------|--------|
| 400 | Mauvaise requête | Vérifier les paramètres envoyés |
| 401 | Non autorisé | Vérifier les identifiants API |
| 402 | Solde insuffisant | Informer l'utilisateur |
| 403 | Transaction interdite | Compte bloqué ou limites dépassées |
| 404 | Transaction non trouvée | Vérifier l'ID de transaction |
| 500 | Erreur serveur Orange | Réessayer plus tard |
| 503 | Service indisponible | Réessayer plus tard |

### Implémentation de la gestion d'erreurs

```typescript
function handleOrangeMoneyError(error: any): string {
  const errorCode = error.response?.status || error.code;
  const errorMessage = error.response?.data?.message || error.message;
  
  switch (errorCode) {
    case 400:
      return 'Données de transaction invalides. Veuillez vérifier les informations.';
    case 401:
      return 'Erreur d\'authentification. Contactez le support technique.';
    case 402:
      return 'Solde insuffisant sur le compte Orange Money.';
    case 403:
      return 'Transaction interdite. Le compte peut être bloqué.';
    case 404:
      return 'Transaction introuvable.';
    case 500:
    case 503:
      return 'Service Orange Money temporairement indisponible. Réessayez dans quelques minutes.';
    default:
      return errorMessage || 'Erreur inconnue lors de la transaction.';
  }
}
```

## Sécurité et bonnes pratiques

### 1. Stockage sécurisé des credentials

✅ **À faire** :
- Stocker Client ID, Client Secret et PIN dans des variables d'environnement
- Utiliser un gestionnaire de secrets (AWS Secrets Manager, Azure Key Vault, etc.)
- Chiffrer les données sensibles en base de données

❌ **À ne pas faire** :
- Hardcoder les credentials dans le code source
- Commiter les fichiers .env dans Git
- Exposer les credentials côté frontend

### 2. Validation des entrées

```typescript
function validateOrangeNumber(number: string): boolean {
  // Format Orange Money Guinée: 224XXXXXXXXX (12 chiffres)
  const regex = /^224[67]\d{8}$/;
  return regex.test(number.replace(/\s/g, ''));
}

function validateAmount(amount: number): boolean {
  const MIN_AMOUNT = 1000; // 1,000 GNF minimum
  const MAX_AMOUNT = 5000000; // 5,000,000 GNF maximum
  return amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;
}
```

### 3. Rate limiting

Protégez vos endpoints contre les abus :

```javascript
import rateLimit from 'express-rate-limit';

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 tentatives de paiement
  message: 'Trop de tentatives de paiement. Réessayez plus tard.'
});

router.post('/initiate-payment', paymentLimiter, async (req, res) => {
  // ...
});
```

### 4. Logs et monitoring

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'orange-money-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'orange-money-combined.log' })
  ]
});

// Logger chaque transaction
logger.info('Paiement initié', {
  transactionId: transactionId,
  amount: amount,
  payerNumber: maskPhoneNumber(payerNumber), // Masquer les numéros dans les logs
  timestamp: new Date().toISOString()
});
```

## Tests

### 1. Environnement de test Orange Money

Utilisez l'environnement de test fourni par Orange Money :
- URL API test : `https://api-test.orange.com/...`
- Numéros de test fournis par Orange
- Montants de test

### 2. Tests unitaires

```typescript
// tests/orange-money.test.ts
import { validateOrangeNumber, validateAmount } from '../utils/validation';

describe('Orange Money Validation', () => {
  test('valide un numéro Orange Money correct', () => {
    expect(validateOrangeNumber('+224 621 12 34 56')).toBe(true);
    expect(validateOrangeNumber('224621123456')).toBe(true);
  });
  
  test('rejette un numéro invalide', () => {
    expect(validateOrangeNumber('621123456')).toBe(false);
    expect(validateOrangeNumber('+224 521 12 34 56')).toBe(false);
  });
  
  test('valide un montant correct', () => {
    expect(validateAmount(5000)).toBe(true);
    expect(validateAmount(1000000)).toBe(true);
  });
  
  test('rejette un montant invalide', () => {
    expect(validateAmount(500)).toBe(false); // Trop petit
    expect(validateAmount(10000000)).toBe(false); // Trop grand
  });
});
```

## Checklist de mise en production

- [ ] Obtenir les credentials API Orange Money (Client ID, Secret, PIN)
- [ ] Configurer l'environnement de production (variables d'environnement)
- [ ] Implémenter le backend API sécurisé
- [ ] Tester en environnement de test Orange Money
- [ ] Configurer les webhooks pour les notifications
- [ ] Implémenter la gestion d'erreurs complète
- [ ] Ajouter les logs et monitoring
- [ ] Configurer le rate limiting
- [ ] Tester les cas d'erreur (solde insuffisant, compte bloqué, etc.)
- [ ] Valider la réconciliation comptable
- [ ] Former les utilisateurs
- [ ] Déployer en production
- [ ] Surveiller les premières transactions

## Support et ressources

- **Documentation Orange Money** : À demander à Orange Business
- **Support technique Orange** : business@orange-money.gn
- **Communauté développeurs** : [Orange Developer Portal](https://developer.orange.com/)

---

**Note** : Les endpoints et formats d'API mentionnés sont des exemples génériques. Consultez la documentation officielle Orange Money Guinée pour les spécifications exactes.
