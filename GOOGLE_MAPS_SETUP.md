# 🗺️ Configuration Google Maps pour SNRR-Mamou

Guide détaillé pour configurer et utiliser Google Maps dans la plateforme SNRR-Mamou.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Obtenir une clé API Google Maps](#obtenir-une-clé-api-google-maps)
3. [Configuration dans l'application](#configuration-dans-lapplication)
4. [Sécurisation de la clé API](#sécurisation-de-la-clé-api)
5. [Saisie des coordonnées GPS](#saisie-des-coordonnées-gps)
6. [Résolution des problèmes](#résolution-des-problèmes)

---

## Prérequis

- Un compte Google (Gmail)
- Accès à [Google Cloud Console](https://console.cloud.google.com/)
- Carte bancaire (pour la vérification, mais l'utilisation gratuite est disponible)

> **Note** : Google offre 200 $ de crédit gratuit par mois pour l'utilisation de Google Maps. Pour la plupart des communes, cela couvre largement les besoins.

---

## Obtenir une clé API Google Maps

### Étape 1 : Créer un projet Google Cloud

1. Accédez à [console.cloud.google.com](https://console.cloud.google.com/)
2. Cliquez sur le sélecteur de projet en haut de la page
3. Cliquez sur **Nouveau projet**
4. Nommez votre projet (ex: "SNRR-Mamou")
5. Cliquez sur **Créer**

### Étape 2 : Activer la facturation (obligatoire)

1. Dans le menu de navigation, allez à **Facturation**
2. Cliquez sur **Associer un compte de facturation**
3. Créez un nouveau compte ou sélectionnez un compte existant
4. Suivez les étapes de vérification de la carte bancaire

> **Rassurez-vous** : Vous ne serez pas facturé tant que vous restez dans les limites gratuites (200 $/mois).

### Étape 3 : Activer l'API Maps JavaScript

1. Dans le menu de navigation, allez à **APIs & Services** > **Bibliothèque**
2. Recherchez **"Maps JavaScript API"**
3. Cliquez sur l'API dans les résultats
4. Cliquez sur **Activer**
5. Attendez quelques secondes que l'activation se termine

### Étape 4 : Créer une clé API

1. Allez dans **APIs & Services** > **Identifiants**
2. Cliquez sur **+ Créer des identifiants**
3. Sélectionnez **Clé API**
4. Votre clé API est générée et affichée
5. **Copiez cette clé immédiatement** et conservez-la en lieu sûr

**Exemple de clé API :**
```
AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Configuration dans l'application

### Méthode 1 : Configuration directe (Développement)

1. Ouvrez le fichier `/src/app/App.tsx`
2. Recherchez la ligne contenant `GOOGLE_MAPS_API_KEY` (environ ligne 2020)
3. Remplacez la valeur par votre clé :

```typescript
const GOOGLE_MAPS_API_KEY = "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
```

### Méthode 2 : Variables d'environnement (Production recommandée)

**Pour Vite (ce projet) :**

1. Créez un fichier `.env.local` à la racine du projet :

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

2. Modifiez `/src/app/App.tsx` :

```typescript
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
```

3. Ajoutez `.env.local` à votre `.gitignore` :

```gitignore
.env.local
.env.*.local
```

> **Important** : Ne commitez JAMAIS votre clé API dans Git !

---

## Sécurisation de la clé API

### Restriction par URL (Recommandé)

1. Retournez sur [console.cloud.google.com](https://console.cloud.google.com/)
2. Allez dans **APIs & Services** > **Identifiants**
3. Cliquez sur votre clé API
4. Sous **Restrictions relatives aux applications** :
   - Sélectionnez **Référents HTTP (sites Web)**
   - Ajoutez vos domaines autorisés :
     ```
     http://localhost:*
     https://votre-domaine.com/*
     https://*.votre-domaine.com/*
     ```

### Restriction par API

1. Sous **Restrictions relatives aux API** :
   - Sélectionnez **Limiter la clé**
   - Cochez **Maps JavaScript API**
2. Cliquez sur **Enregistrer**

### Quotas et alertes

1. Allez dans **APIs & Services** > **Quotas**
2. Recherchez "Maps JavaScript API"
3. Configurez des alertes de quota :
   - Seuil : 80% du quota gratuit
   - Email : votre adresse email

---

## Saisie des coordonnées GPS

### Format requis

Les coordonnées doivent être saisies dans ce format exact :

```
Latitude° N, Longitude° W
```

**Exemples pour Mamou :**

| Quartier | Coordonnées GPS |
|----------|----------------|
| Centre-ville | `10.3801° N, 12.0871° W` |
| Sikhourou | `10.3792° N, 12.0862° W` |
| Gongoré | `10.3788° N, 12.0892° W` |
| Donghol Touma | `10.3815° N, 12.0845° W` |
| Saré Koura | `10.3762° N, 12.0833° W` |
| Porédaka | `10.3720° N, 12.0880° W` |
| Téguéréya | `10.3825° N, 12.0920° W` |

### Méthodes pour obtenir les coordonnées

#### Option 1 : Google Maps Web

1. Ouvrez [maps.google.com](https://maps.google.com)
2. Recherchez l'adresse ou pointez l'emplacement sur la carte
3. **Clic droit** sur l'emplacement
4. Sélectionnez **"Plus d'infos sur cet endroit"**
5. Les coordonnées apparaissent en bas (ex: `10.3792, -12.0862`)
6. Convertissez au format requis : `10.3792° N, 12.0862° W`

#### Option 2 : Smartphone avec GPS

**Sur Android (Google Maps) :**
1. Ouvrez Google Maps
2. Appuyez longuement sur l'emplacement
3. Les coordonnées apparaissent en haut
4. Notez-les au format requis

**Sur iPhone (Plans ou Google Maps) :**
1. Ouvrez l'application
2. Déposez une épingle sur l'emplacement
3. Glissez vers le haut pour voir les détails
4. Copiez les coordonnées

#### Option 3 : Application GPS tierce

Applications recommandées :
- **Maps.me** (hors ligne, gratuit)
- **Organic Maps** (open source)
- **GPS Status & Toolbox** (Android)

### Conversion automatique

Si vous avez des coordonnées au format décimal (ex: `10.3792, -12.0862`), voici comment les convertir :

**Format source :**
```
10.3792, -12.0862
```

**Format requis :**
```
10.3792° N, 12.0862° W
```

**Règles :**
- Latitude positive → ajoutez `° N`
- Longitude négative → retirez le `-` et ajoutez `° W`

---

## Résolution des problèmes

### ❌ La carte ne s'affiche pas

**Causes possibles :**

1. **Clé API invalide ou manquante**
   - Vérifiez que vous avez bien copié la clé complète
   - Vérifiez qu'il n'y a pas d'espaces avant ou après la clé

2. **API Maps JavaScript pas activée**
   - Retournez sur Google Cloud Console
   - Vérifiez que l'API est bien activée

3. **Restrictions de clé API**
   - Vérifiez que votre URL est dans la liste des référents autorisés
   - En développement local, autorisez `http://localhost:*`

4. **Quota dépassé**
   - Vérifiez vos quotas dans Google Cloud Console
   - Contactez Google pour augmenter les quotas si nécessaire

### ❌ Message d'erreur : "For development purposes only"

Cela signifie que :
- Soit vous n'avez pas de compte de facturation actif
- Soit vous utilisez une clé API sans restriction (watermark Google)

**Solution :**
1. Activez la facturation dans Google Cloud Console
2. Ajoutez des restrictions à votre clé API

### ❌ Les marqueurs ne s'affichent pas

**Vérifications :**

1. **Format des coordonnées GPS**
   - Vérifiez que le format est exact : `Latitude° N, Longitude° W`
   - Exemple incorrect : `10.3792N, 12.0862W` (manque les `°` et espaces)
   - Exemple correct : `10.3792° N, 12.0862° W`

2. **Coordonnées hors zone**
   - Vérifiez que les coordonnées sont bien en Guinée
   - Latitude Mamou : ~10.37°
   - Longitude Mamou : ~-12.09° (ou 12.09° W)

3. **Données non sauvegardées**
   - Assurez-vous d'avoir bien enregistré le contribuable
   - Rechargez la page de cartographie

### ❌ Erreur "RefererNotAllowedMapError"

**Cause :** Votre domaine n'est pas autorisé dans les restrictions de la clé API.

**Solution :**
1. Allez dans Google Cloud Console > Identifiants
2. Cliquez sur votre clé API
3. Ajoutez votre domaine dans les référents HTTP autorisés

---

## 💰 Tarification et quotas

### Utilisation gratuite

Google offre **200 $ de crédit gratuit par mois**, ce qui équivaut à :

- **28 000 chargements de carte par mois** (Maps JavaScript API)
- **40 000 requêtes de géocodage par mois**

### Estimation pour Mamou

Pour une commune de ~7000 contribuables :
- Chargements de carte : ~500/mois
- Coût estimé : **0 $** (largement dans le quota gratuit)

### Surveillance des coûts

1. Configurez des alertes de facturation
2. Consultez régulièrement le tableau de bord Google Cloud
3. Optimisez en cachant les données de carte

---

## 📞 Support

### Ressources officielles

- [Documentation Google Maps Platform](https://developers.google.com/maps)
- [Console Google Cloud](https://console.cloud.google.com/)
- [Tarification Google Maps](https://mapsplatform.google.com/pricing/)

### Support technique SNRR-Mamou

Pour toute question spécifique à l'application SNRR-Mamou :
- Email : support@snrr-mamou.gn
- Documentation : Voir fichier `README.md`

---

**Dernière mise à jour** : Juin 2026
