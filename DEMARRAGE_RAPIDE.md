# 🚀 Démarrage rapide — SNRR-Mamou avec Google Maps

Guide de démarrage en **5 étapes simples** pour activer la cartographie Google Maps.

---

## ⏱️ Temps estimé : 10 minutes

---

## Étape 1️⃣ : Créer un compte Google Cloud (3 min)

### Si vous avez déjà un compte Gmail

✅ Vous êtes prêt, passez à l'étape 2

### Si vous n'avez pas de compte Gmail

1. Allez sur https://accounts.google.com/
2. Cliquez sur **Créer un compte**
3. Remplissez le formulaire
4. Vérifiez votre adresse email
5. Terminé ✓

---

## Étape 2️⃣ : Activer Google Maps API (4 min)

### Actions à réaliser

1. **Ouvrez** https://console.cloud.google.com/

2. **Créez un projet**
   - Cliquez sur le sélecteur de projet (en haut)
   - Cliquez sur **Nouveau projet**
   - Nom du projet : `SNRR-Mamou`
   - Cliquez sur **Créer**
   - Attendez 10 secondes ⏳

3. **Activez la facturation** (obligatoire, mais gratuit jusqu'à 200$/mois)
   - Menu ☰ > **Facturation**
   - Cliquez sur **Associer un compte de facturation**
   - **Créer un compte de facturation**
   - Remplissez les informations de carte bancaire
   - ⚠️ **Pas de panique** : Vous ne serez pas débité tant que vous restez sous 200$/mois
   - Validez

4. **Activez l'API Maps**
   - Menu ☰ > **APIs & Services** > **Bibliothèque**
   - Recherchez : `Maps JavaScript API`
   - Cliquez sur le résultat
   - Cliquez sur **Activer**
   - Attendez 5 secondes ⏳

5. **Créez une clé API**
   - Menu ☰ > **APIs & Services** > **Identifiants**
   - Cliquez sur **+ Créer des identifiants**
   - Sélectionnez **Clé API**
   - 🎉 **Votre clé est générée !**
   - Cliquez sur **Copier** (icône 📋)

**Votre clé ressemble à** :
```
AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **Important** : Conservez cette clé précieusement, vous en aurez besoin à l'étape suivante !

---

## Étape 3️⃣ : Configurer la clé dans l'application (1 min)

### Actions à réaliser

1. **Ouvrez** le fichier `/src/app/App.tsx`

2. **Trouvez** la ligne contenant `GOOGLE_MAPS_API_KEY` (environ ligne 2023)

   Elle ressemble à ceci :
   ```typescript
   const GOOGLE_MAPS_API_KEY = "AIzaSyBVk9TKj8rVjQpOQa4mhQjL9kC3TkH-8Lk";
   ```

3. **Remplacez** la valeur par votre clé API :
   ```typescript
   const GOOGLE_MAPS_API_KEY = "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
   ```
   *(Collez la clé que vous avez copiée à l'étape 2)*

4. **Enregistrez** le fichier (Ctrl+S / Cmd+S)

✅ **C'est tout !**

---

## Étape 4️⃣ : Tester l'application (1 min)

### Actions à réaliser

1. **Lancez** l'application en développement :
   ```bash
   pnpm dev
   ```

2. **Ouvrez** votre navigateur à l'adresse affichée (généralement http://localhost:5173)

3. **Connectez-vous** à l'application

4. **Cliquez** sur **Cartographie** dans le menu de gauche

5. **Vérifiez** :
   - ✅ La carte Google Maps s'affiche
   - ✅ Les marqueurs des contribuables apparaissent
   - ✅ Les zones de quartiers sont visibles
   - ✅ Vous pouvez zoomer/dézoomer

**🎉 Ça marche ? Félicitations !**

---

## Étape 5️⃣ : Sécuriser votre clé API (1 min)

### Pourquoi sécuriser ?

Sans restriction, n'importe qui pourrait utiliser votre clé API et consommer votre quota gratuit.

### Actions à réaliser

1. **Retournez** sur https://console.cloud.google.com/

2. **Allez** dans **APIs & Services** > **Identifiants**

3. **Cliquez** sur votre clé API

4. **Sous "Restrictions relatives aux applications"** :
   - Sélectionnez **Référents HTTP (sites Web)**
   - Ajoutez :
     ```
     http://localhost:*
     https://votre-domaine.com/*
     ```
     *(Remplacez `votre-domaine.com` par votre vrai domaine)*

5. **Sous "Restrictions relatives aux API"** :
   - Sélectionnez **Limiter la clé**
   - Cochez **Maps JavaScript API**

6. **Cliquez** sur **Enregistrer**

✅ **Votre clé est maintenant sécurisée !**

---

## ✅ Checklist finale

Avant de considérer la configuration terminée, vérifiez que :

- [ ] Vous avez créé un projet Google Cloud
- [ ] La facturation est activée (carte bancaire enregistrée)
- [ ] L'API "Maps JavaScript API" est activée
- [ ] Vous avez créé une clé API
- [ ] La clé est configurée dans `/src/app/App.tsx`
- [ ] L'application fonctionne (`pnpm dev`)
- [ ] La carte s'affiche dans le module Cartographie
- [ ] Les marqueurs des contribuables sont visibles
- [ ] Vous avez sécurisé votre clé API (restrictions)

**Tout est coché ?** 🎉 **Vous êtes prêt !**

---

## 📍 Prochaines étapes

### Former les agents recenseurs

**Distribuez** le fichier `GUIDE_TERRAIN.md` à vos agents de terrain.

Ce guide explique :
- Comment collecter les coordonnées GPS avec un smartphone
- Le format de saisie requis
- Les bonnes pratiques sur le terrain
- La résolution de problèmes courants

### Commencer le recensement

1. **Allez** dans le module **Recensement**
2. **Cliquez** sur **+ Nouveau contribuable**
3. **Remplissez** le formulaire
4. **Saisissez** les coordonnées GPS au format : `10.3792° N, 12.0862° W`
5. **Enregistrez**
6. **Vérifiez** dans **Cartographie** que le point apparaît sur la carte

### Tester avec des données exemples

Le système contient déjà des contribuables de test avec coordonnées GPS :

| Contribuable | Quartier | GPS |
|-------------|----------|-----|
| Diallo Mamadou | Sikhourou | `10.3792° N, 12.0862° W` |
| Bah Fatoumata | Centre-ville | `10.3801° N, 12.0871° W` |
| Sow Ibrahim | Donghol Touma | `10.3815° N, 12.0845° W` |

Allez dans **Cartographie** pour les voir sur la carte !

---

## ❓ Besoin d'aide ?

### Documentation disponible

| Fichier | Description |
|---------|-------------|
| `README.md` | Documentation générale |
| `GOOGLE_MAPS_SETUP.md` | Guide complet Google Maps |
| `GUIDE_TERRAIN.md` | Manuel agents recenseurs |
| `INTEGRATION_GOOGLE_MAPS.md` | Résumé de l'intégration |
| `CHANGELOG.md` | Historique des versions |

### Problèmes courants

**❌ La carte ne s'affiche pas**
→ Vérifiez que vous avez bien copié la clé API complète  
→ Vérifiez que l'API "Maps JavaScript API" est activée  
→ Consultez `GOOGLE_MAPS_SETUP.md` section "Résolution de problèmes"

**❌ Message "For development purposes only"**
→ Activez la facturation dans Google Cloud Console  
→ Ajoutez des restrictions à votre clé API

**❌ Les marqueurs n'apparaissent pas**
→ Vérifiez le format GPS : `10.3792° N, 12.0862° W`  
→ Assurez-vous que les contribuables ont des coordonnées GPS  
→ Désactivez les filtres dans Cartographie

### Support

- **Documentation** : Lisez les fichiers `.md` dans le projet
- **Email** : support@snrr-mamou.gn
- **Téléphone** : +224 6XX XX XX XX

---

## 💡 Conseils

### Quota gratuit

Vous avez **200 $/mois gratuit** = **~28 000 chargements de carte**

**Pour Mamou** (~500 chargements/mois) = **100% gratuit** 🎉

### Surveillance

Configurez des alertes de quota dans Google Cloud Console :
1. Menu ☰ > **APIs & Services** > **Quotas**
2. Recherchez "Maps JavaScript API"
3. Cliquez sur "Créer une alerte de quota"
4. Seuil : 80%
5. Email : votre adresse

Vous recevrez un email si vous approchez du quota.

### Backup de la clé

**Conservez votre clé API dans un endroit sûr** :
- Gestionnaire de mots de passe (1Password, LastPass, etc.)
- Fichier chiffré sur votre ordinateur
- **Ne la partagez jamais publiquement** (GitHub, email, etc.)

---

## 🎯 Récapitulatif

**Vous avez maintenant :**
- ✅ Un compte Google Cloud opérationnel
- ✅ L'API Maps JavaScript activée
- ✅ Une clé API configurée et sécurisée
- ✅ Une carte Google Maps fonctionnelle dans SNRR-Mamou
- ✅ La capacité de géolocaliser tous vos contribuables
- ✅ Une plateforme complète de gestion fiscale avec cartographie

**🎉 Félicitations ! Vous êtes prêt à utiliser SNRR-Mamou avec Google Maps !**

---

**Bon recensement !**

*Guide préparé pour la Commune de Mamou — Juin 2026*
