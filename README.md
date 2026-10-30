# SNRR — Système National de Recensement et de Recouvrement

Plateforme web d'administration fiscale municipale pour la commune de Mamou en Guinée.

> 📚 **Nouveau ?** Consultez le [Guide de démarrage rapide](DEMARRAGE_RAPIDE.md) (10 min) ou l'[Index de documentation](INDEX_DOCUMENTATION.md)

## 🌍 Configuration Google Maps

Cette application utilise **Google Maps** pour la cartographie SIG et la géolocalisation des contribuables.

### Obtenir une clé API Google Maps

1. Accédez à la [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API **Maps JavaScript API** :
   - Dans le menu de navigation, allez à **APIs & Services** > **Library**
   - Recherchez "Maps JavaScript API"
   - Cliquez sur **Enable**
4. Créez une clé API :
   - Allez dans **APIs & Services** > **Credentials**
   - Cliquez sur **Create Credentials** > **API Key**
   - Copiez la clé générée
5. (Recommandé) Restreignez votre clé API pour plus de sécurité :
   - Cliquez sur votre clé API
   - Sous **Application restrictions**, sélectionnez **HTTP referrers**
   - Ajoutez votre domaine (ex: `https://votre-domaine.com/*`)
   - Sous **API restrictions**, sélectionnez **Restrict key** et choisissez "Maps JavaScript API"

### Configurer la clé dans l'application

1. Ouvrez le fichier `/src/app/App.tsx`
2. Trouvez la ligne contenant `GOOGLE_MAPS_API_KEY` (environ ligne 2020)
3. Remplacez la valeur par votre clé API :

```typescript
const GOOGLE_MAPS_API_KEY = "VOTRE_CLÉ_API_ICI";
```

## 📍 Saisie des coordonnées GPS

Les coordonnées GPS doivent être saisies manuellement lors du recensement des contribuables.

### Format requis

```
Latitude° N, Longitude° W
```

**Exemples pour Mamou :**
- Centre-ville : `10.3801° N, 12.0871° W`
- Sikhourou : `10.3792° N, 12.0862° W`
- Gongoré : `10.3788° N, 12.0892° W`

### Comment obtenir les coordonnées GPS ?

**Option 1 : Google Maps Web**
1. Ouvrez [Google Maps](https://maps.google.com)
2. Recherchez l'adresse ou cliquez sur l'emplacement
3. Faites un clic droit et sélectionnez "Plus d'infos sur cet endroit"
4. Les coordonnées apparaissent en bas de l'écran

**Option 2 : Smartphone (GPS)**
1. Activez la localisation sur votre téléphone
2. Utilisez une application GPS (Google Maps, Maps.me, etc.)
3. Notez les coordonnées au format décimal

**Option 3 : Application mobile de recensement**
- Utilisez l'appareil photo ou le GPS du smartphone
- Capturez automatiquement les coordonnées sur le terrain

### Conversion du format

Si vos coordonnées sont au format décimal (ex: `10.3792, -12.0862`), convertissez-les en :
```
10.3792° N, 12.0862° W
```
⚠️ **Important :** Pour la Guinée, les longitudes sont négatives (Ouest). Indiquez toujours `° W` sans le signe négatif.

## 🗺️ Fonctionnalités de la cartographie

- **Visualisation interactive** : Carte Google Maps centrée sur Mamou
- **Marqueurs personnalisés** : Localisation précise de chaque contribuable
- **Zones de quartiers** : Affichage des secteurs avec statistiques
- **Filtres avancés** : Recherche par type, statut, quartier, secteur
- **InfoWindows** : Informations détaillées au clic sur un marqueur
- **Export de carte** : Téléchargement des données cartographiques

## 🏛️ Modules de la plateforme

1. **Tableau de bord** — Vue d'ensemble des recettes et statistiques
2. **Recensement** — Gestion des contribuables et biens immobiliers
3. **Taxation** — Calcul CFU et Patentes
4. **Paiements** — Orange Money, MTN Money, QR Code, Espèces
5. **Cartographie SIG** — Visualisation géographique (Google Maps)
6. **Rapports & BI** — Analyses et business intelligence
7. **Business Intelligence** — 📊 Analyses prédictives, KPI, recommandations stratégiques
8. **Notifications** — Centre de notifications email et WhatsApp
9. **Utilisateurs** — Gestion des profils et droits d'accès
10. **Sécurité & Audit** — Traçabilité et journalisation

## 🎨 Design

- **Palette institutionnelle** : Bleu marine (#1B3A6B), Or (#B8860B), Crème parchemin
- **Typographies** : 
  - Crimson Pro (chiffres et titres)
  - Inter (texte général)
  - JetBrains Mono (données et code)

## 🚀 Installation

```bash
# Installer les dépendances
pnpm install

# Lancer le serveur de développement
pnpm dev

# Compiler pour la production
pnpm build
```

## 📦 Technologies

- **React 18** avec TypeScript
- **Tailwind CSS 4**
- **Google Maps** (`@vis.gl/react-google-maps`)
- **Recharts** (graphiques)
- **Lucide React** (icônes)
- **html2pdf.js** (génération PDF)

## 📝 Notes importantes

- **Coordonnées GPS** : Les coordonnées doivent être saisies manuellement lors du recensement
- **Clé API Google Maps** : Obligatoire pour afficher la cartographie
- **Sécurité** : Ne pas exposer la clé API dans le code source public (utiliser des variables d'environnement en production)
- **Géolocalisation Guinée** : Zone géographique couverte : Préfecture de Mamou (10.37° N, 12.09° W)

## 🌍 Préfecture de Mamou

**Quartiers de la Commune Urbaine :**
- Centre-ville (Secteurs S-01, S-02, S-03)
- Sikhourou (Secteurs S-04, S-05, S-06)
- Gongoré (Secteurs S-07, S-08, S-09, S-10)
- Donghol Touma (Secteurs S-11, S-12)
- Saré Koura (Secteurs S-13, S-14)
- Porédaka (Secteurs S-15, S-16)
- Téguéréya (Secteurs S-17, S-18)

**Sous-préfectures :**
Mamou-Centre, Dounet, Gongoret, Kegneko, Nyagara, Ouré-Kaba, Porédaka, Saramoussaya, Soyah, Téguéréya

## 📄 Licence

Propriété de la Commune de Mamou — Tous droits réservés
