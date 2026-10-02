SYSTÈME NUMÉRIQUE DE RECENSEMENT ET DE RECOUVREMENT DES RECETTES COMMUNALES DE MAMOU (SNRR-MAMOU)
CAHIER DES CHARGES TECHNIQUE
Version 1.0 – Juin 2026
________________________________________
SOMMAIRE
1.	PRÉSENTATION DU PROJET
2.	OBJECTIFS DU PROJET
3.	ARCHITECTURE GÉNÉRALE DU SYSTÈME
4.	MODULE DE RECENSEMENT
5.	MODULE DE GÉOLOCALISATION
6.	MODULE DE TAXATION
7.	MODULE DE PAIEMENT ÉLECTRONIQUE
8.	INNOVATION QR CODE FISCAL
9.	MODULE DE CONTRÔLE ET AUDIT
10.	TABLEAU DE BORD DÉCISIONNEL
11.	MODULE REPORTING & BUSINESS INTELLIGENCE
12.	GESTION DES UTILISATEURS
13.	SÉCURITÉ
14.	TECHNOLOGIES RECOMMANDÉES
15.	RÉSULTATS ATTENDUS
16.	GLOSSAIRE
________________________________________
1. PRÉSENTATION DU PROJET
1.1 Intitulé du projet
Système Numérique de Recensement et de Recouvrement des Recettes Communales de Mamou (SNRR-Mamou)
1.2 Maître d'ouvrage
Commune Urbaine de Mamou
1.3 Contexte
Les collectivités locales de Mamou disposent de plusieurs sources de recettes fiscales et parafiscales, notamment :
•	Contribution Foncière Unique (CFU)
•	Patentes et licences commerciales
•	Taxes de marché
•	Occupation du domaine public
•	Taxes sur les matériaux de construction
•	Droits divers communaux
Le système actuel de gestion est essentiellement manuel, entraînant :
•	Difficultés de recensement des contribuables
•	Perte de recettes
•	Fraudes et détournements
•	Absence de traçabilité
•	Difficultés de suivi des paiements
•	Faible capacité de pilotage des recettes
Le présent projet vise à moderniser entièrement le processus de recensement, de taxation et de recouvrement.
________________________________________
2. OBJECTIFS DU PROJET
2.1 Objectif général
Déployer une plateforme numérique centralisée permettant le recensement exhaustif des contribuables et le recouvrement sécurisé des recettes communales.
2.2 Objectifs spécifiques
•	Identifier tous les contribuables de la commune
•	Géolocaliser l'ensemble des biens imposables
•	Produire automatiquement les avis d'imposition
•	Digitaliser le paiement des taxes
•	Réduire les fraudes
•	Sécuriser les recettes communales
•	Améliorer la transparence financière
•	Faciliter le suivi budgétaire communal
________________________________________
3. ARCHITECTURE GÉNÉRALE DU SYSTÈME
Le système sera composé de :
A. Application mobile de recensement
Utilisée par les agents terrain.
B. Plateforme Web d'administration
Utilisée par :
•	Le Maire
•	Le Receveur communal
•	Les Services financiers
•	Les Administrateurs système
C. Base de données centrale
Serveur sécurisé hébergé dans le cloud.
D. Système de paiement électronique
Intégré aux opérateurs Mobile Money et aux terminaux POS.
________________________________________
4. MODULE DE RECENSEMENT
4.1 Fonctionnalités
Informations du contribuable
•	Nom complet
•	Téléphone
•	Adresse
•	Numéro d'identification nationale
•	Photo du contribuable
Informations du bien
•	Numéro unique du bien
•	Quartier
•	Secteur
•	Coordonnées GPS
•	Type de bâtiment
•	Usage du bâtiment
•	Surface
•	Valeur locative
Documents
•	Photos du bâtiment
•	Plans cadastraux
•	Documents justificatifs
4.2 Identification numérique
Chaque bien recevra :
•	Un identifiant unique
•	Un QR Code sécurisé
________________________________________
5. MODULE DE GÉOLOCALISATION
5.1 Fonctionnalités
•	Cartographie SIG
•	Localisation GPS précise
•	Affichage des contribuables sur carte
•	Recherche géographique
•	Délimitation des secteurs fiscaux
•	Statistiques par quartier
________________________________________
6. MODULE DE TAXATION
6.1 Contribution Foncière Unique (CFU)
Calcul automatique selon :
•	Valeur locative
•	Catégorie du bâtiment
•	Zone géographique
6.2 Taxes professionnelles
•	Boutiques
•	Restaurants
•	Ateliers
•	Stations-service
•	Pharmacies
•	Hôtels
6.3 Redevances
•	Marchés
•	Occupation du domaine public
•	Matériaux de construction
•	Activités diverses
6.4 Fonctionnalités
•	Paramétrage des taux
•	Simulation fiscale
•	Révision annuelle
•	Génération automatique des avis
________________________________________
7. MODULE DE PAIEMENT ÉLECTRONIQUE
7.1 Moyens de paiement
Mobile Money
•	Orange Money
•	MTN Mobile Money
•	Autres opérateurs
Cartes bancaires
•	Visa
•	Mastercard
QR Code
Paiement par scan.
Paiement espèces
Validation numérique obligatoire.
7.2 Fonctionnalités
•	Encaissement sécurisé
•	Reçu électronique instantané
•	Historique des paiements
•	Synchronisation automatique
•	Réconciliation bancaire
________________________________________
8. INNOVATION QR CODE FISCAL
8.1 Description
Chaque maison recevra une plaque ou autocollant contenant :
•	QR Code unique
•	Numéro fiscal
•	Référence cadastrale
8.2 Processus
1.	L'agent scanne le QR Code
2.	Le dossier fiscal s'ouvre automatiquement
3.	Vérification des arriérés
4.	Paiement immédiat
5.	Reçu électronique généré
6.	Mise à jour automatique de la base
8.3 Avantages
•	Réduction de la fraude
•	Gain de temps
•	Identification rapide
•	Traçabilité totale
________________________________________
9. MODULE DE CONTRÔLE ET AUDIT
9.1 Suivi des agents
•	Identification sécurisée
•	Géolocalisation
•	Horodatage
•	Historique des opérations
9.2 Journal d'audit
Enregistrement de :
•	Connexions
•	Modifications
•	Paiements
•	Annulations
•	Corrections
________________________________________
10. TABLEAU DE BORD DÉCISIONNEL
10.1 Pour le Maire
•	Total des recettes
•	Taux de recouvrement
•	Prévisions budgétaires
•	Comparatif mensuel
10.2 Pour le Receveur
•	Encaissements quotidiens
•	Soldes
•	Recettes par catégorie
10.3 Pour les superviseurs
•	Performance des agents
•	Nombre de contribuables visités
•	Montants collectés
11. MODULE REPORTING & BUSINESS INTELLIGENCE
11.1 Rapports standards
•	Recettes journalières
•	Recettes mensuelles
•	CFU collectée
•	Taxes professionnelles
11.2 Rapports avancés
•	Analyse prédictive
•	Cartographie fiscale
•	Zones à faible recouvrement
•	Indicateurs de performance
11.3 Export
•	PDF
•	Excel
•	CSV
•	Word
12. GESTION DES UTILISATEURS
12.1 Profils
Profil	Rôle
Administrateur	Accès total
Maire	Consultation stratégique
Receveur	Gestion des recettes
Superviseur	Contrôle des équipes
Agent recenseur	Collecte des données
Agent de recouvrement	Encaissement des taxes
13. SÉCURITÉ
13.1 Authentification
•	Mot de passe sécurisé
•	Double authentification
•	Biométrie
13.2 Protection des données
•	Chiffrement SSL
•	Sauvegardes automatiques
•	Hébergement sécurisé Cloud
13.3 Conformité
•	Protection des données personnelles
•	Archivage légal
•	Traçabilité complète
________________________________________
14. TECHNOLOGIES RECOMMANDÉES
Composant	Technologie
Front-End Web	ReactJS
Front-End Mobile	Flutter
Back-End	Laravel / Node.js
Mobile	Flutter (Android/iOS)
Base de données	PostgreSQL + PostGIS
Cartographie	OpenStreetMap / Google Maps
Paiement	APIs Mobile Money / APIs bancaires
________________________________________
15. RÉSULTATS ATTENDUS
•	Recensement exhaustif des contribuables
•	Augmentation des recettes communales de 30 à 60 %
•	Réduction significative de la fraude
•	Amélioration de la transparence
•	Disponibilité d'une base fiscale fiable
•	Pilotage en temps réel des recettes
•	Extension future à l'ensemble des communes de Guinée
________________________________________
16. GLOSSAIRE
Terme	Définition
CFU	Contribution Foncière Unique
SIG	Système d'Information Géographique
QR Code	Quick Response Code
POS	Point Of Sale (terminal de paiement)
API	Application Programming Interface
SSL	Secure Sockets Layer
BI	Business Intelligence
________________________________________
Document validé par :
________________________________________
Le Maire de la Commune Urbaine de Mamou
________________________________________
Le Receveur communal
________________________________________
Le Chef de projet SNRR-Mamou
________________________________________
Fin du document

