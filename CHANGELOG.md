# Changelog SNRR-Mamou

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [2.0.0] - 2026-06-28

### 🗺️ Migration Google Maps

#### Ajouté
- **Intégration Google Maps** en remplacement de React Leaflet
  - Utilisation de `@vis.gl/react-google-maps` (bibliothèque officielle Google)
  - Carte interactive centrée sur Mamou, Guinée (10.3755° N, 12.0892° W)
  - Marqueurs personnalisés pour les contribuables avec codes couleur par quartier
  - InfoWindows pour afficher les détails des contribuables au clic
  - Marqueurs de quartiers avec statistiques (contribuables, recouvrement, recettes)
  - Gestion de l'état des InfoWindows (ouverture/fermeture)

- **Configuration API Google Maps**
  - Documentation complète dans `GOOGLE_MAPS_SETUP.md`
  - Instructions d'obtention de clé API
  - Guide de sécurisation et restrictions
  - Gestion des quotas et alertes de coûts

- **Bannière d'information**
  - Alerte visuelle dans le module Cartographie
  - Lien direct vers Google Cloud Console
  - Instructions de configuration

- **Guides utilisateur**
  - `README.md` : Documentation générale du projet
  - `GOOGLE_MAPS_SETUP.md` : Guide détaillé de configuration Google Maps
  - `GUIDE_TERRAIN.md` : Manuel pour agents recenseurs sur le terrain
  - Instructions de saisie des coordonnées GPS
  - Format requis : `Latitude° N, Longitude° W`

- **Aide contextuelle**
  - Message d'aide dans le champ GPS du formulaire contribuable
  - Format et exemples de coordonnées
  - Explication de l'affichage sur Google Maps

#### Modifié
- **Format des coordonnées géographiques**
  - Migration de `[lat, lng]` (Leaflet) vers `{ lat, lng }` (Google Maps)
  - Mise à jour de `MAMOU_CENTER` et toutes les références
  - Parser de coordonnées GPS adapté au nouveau format
  - Support du format utilisateur : `10.3792° N, 12.0862° W`

- **Composants de cartographie**
  - Remplacement de `MapContainer`, `TileLayer`, `Marker`, `Popup`, `Circle` (Leaflet)
  - Par `APIProvider`, `GoogleMap`, `AdvancedMarker`, `InfoWindow` (Google Maps)
  - Nouveau composant `CustomMarker` pour marqueurs personnalisés
  - Gestion des quartiers avec cercles colorés remplacés par des marqueurs

#### Supprimé
- Dépendance `react-leaflet` et `leaflet` (conservées pour compatibilité)
- Fonction `createCustomIcon` (Leaflet-specific)
- Import de `L` from `leaflet`

#### Technique
- Installation de `@vis.gl/react-google-maps@^1.8.3`
- Utilisation de l'API Google Maps Platform
- Clé API requise pour le fonctionnement
- Support des cartes hors ligne via Google Maps (cache automatique)

---

## [1.0.0] - 2026-06-15

### Version initiale

#### Fonctionnalités principales

- **Module Tableau de bord**
  - Statistiques en temps réel des recettes fiscales
  - Graphiques de recouvrement (Recharts)
  - Vue d'ensemble par quartier

- **Module Recensement**
  - Gestion complète des contribuables
  - Capture photo du contribuable via webcam
  - Upload de photos du bâtiment (multiples)
  - Upload de plans cadastraux
  - Upload de documents justificatifs
  - Génération d'identifiant unique (MOU-YYYY-XXXXX)
  - Génération de QR Code sécurisé

- **Module Taxation**
  - Calcul de la Contribution Foncière Unique (CFU)
  - Gestion des Patentes
  - Simulation fiscale
  - Génération d'avis d'imposition avec 4 options :
    - Imprimer
    - Envoyer par email
    - Partager par WhatsApp
    - Télécharger PDF (html2pdf.js)

- **Module Paiements**
  - Support Orange Money Guinée (API complète code marchand)
  - Support MTN Money
  - Paiement par QR Code
  - Paiement en espèces
  - Génération de reçus
  - Historique des transactions

- **Module Cartographie SIG** (v1 - Leaflet)
  - Carte OpenStreetMap
  - Localisation des contribuables
  - Zones de quartiers
  - Filtres par type, statut, quartier
  - Recherche géographique

- **Module Rapports & BI**
  - Statistiques détaillées
  - Exportations de données
  - Analyses par période

- **Module Utilisateurs**
  - Gestion des profils (Maire, Receveur, Superviseur, Agents)
  - Droits d'accès par rôle
  - Journal d'activité

- **Module Sécurité & Audit**
  - Traçabilité des actions
  - Journaux d'audit
  - Système d'authentification

#### Design
- Palette institutionnelle : Bleu marine (#1B3A6B), Or (#B8860B)
- Typographies : Crimson Pro, Inter, JetBrains Mono
- Interface gouvernementale avec esthétique parchemin crème

#### Technique
- React 18 avec TypeScript
- Tailwind CSS 4
- Recharts pour les graphiques
- Lucide React pour les icônes
- html2pdf.js pour génération PDF
- React Leaflet pour cartographie (v1)

---

## Nomenclature des versions

Le projet suit le versionnage sémantique ([SemVer](https://semver.org/)) :

- **MAJOR** : Changements incompatibles avec les versions précédentes
- **MINOR** : Ajout de fonctionnalités compatible avec versions précédentes
- **PATCH** : Corrections de bugs compatibles avec versions précédentes

---

## Notes de migration

### De 1.0.0 à 2.0.0

**Action requise :**
1. Obtenir une clé API Google Maps (voir `GOOGLE_MAPS_SETUP.md`)
2. Configurer la clé dans `/src/app/App.tsx`
3. Vérifier le format des coordonnées GPS existantes
4. Former les agents recenseurs au nouveau format de saisie GPS

**Données existantes :**
- Les coordonnées GPS existantes sont automatiquement migrées
- Aucune perte de données
- Le parser de coordonnées supporte l'ancien et le nouveau format

**Avantages de la migration :**
- ✅ Meilleure qualité de carte (Google Maps vs OpenStreetMap)
- ✅ Support officiel de Google
- ✅ Mises à jour automatiques des cartes
- ✅ Données de localisation plus précises pour la Guinée
- ✅ Support de fonctionnalités avancées (Street View, Traffic, etc.)
- ✅ Performance améliorée
- ✅ Interface plus familière pour les utilisateurs

---

**Légende :**
- 🗺️ Cartographie
- 💰 Finance/Taxation
- 👥 Utilisateurs
- 🔒 Sécurité
- 📊 Rapports/BI
- 📱 Mobile
- 🐛 Correction de bug
- ⚡ Performance
- 📚 Documentation
