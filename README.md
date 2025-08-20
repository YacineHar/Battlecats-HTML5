# 🐱 Battle Cats 2D

Un jeu de tower defense inspiré de Battle Cats, développé en HTML5, CSS et JavaScript vanilla.

## 🎮 À propos du jeu

Battle Cats 2D est un jeu de stratégie en temps réel où vous devez défendre votre tour alliée contre les vagues d'ennemis. Recrutez différents types de chats, améliorez votre économie et détruisez la tour ennemie pour remporter la victoire !

### ✨ Fonctionnalités

- **🎯 Gameplay stratégique** : Déployez vos unités tactiquement pour défendre votre tour
- **🐱 Unités variées** : 3 types de chats avec des capacités différentes
- **💰 Système d'économie** : Générez de l'argent et améliorez votre production
- **🏰 Tours destructibles** : Barres de vie pour les tours alliée et ennemie
- **🎨 Interface moderne** : Design épuré et responsive
- **⏸️ Menu pause** : Contrôle total de votre partie
- **🌍 Interface française** : Entièrement localisé

## 🚀 Installation et lancement

### Prérequis
- Un navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Python 3 (pour le serveur local)

### Démarrage rapide

1. **Clonez le repository**
   ```bash
   git clone [URL_DU_REPO]
   cd Battlecats_html5
   ```

2. **Lancez le serveur local**
   ```bash
   python3 -m http.server 8000
   ```

3. **Ouvrez votre navigateur**
   ```
   http://localhost:8000
   ```

## 🎯 Comment jouer

### 🐱 Types d'unités

| Unité | Coût | Description |
|-------|------|-------------|
| **Chat Basic** | 50💰 | Unité polyvalente, équilibrée en attaque et défense |
| **Chat Tank** | 100💰 | Unité défensive avec beaucoup de points de vie |
| **Chat Attaquant** | 150💰 | Unité offensive avec des dégâts élevés |

### 🎮 Contrôles

- **Clic gauche** sur une unité pour la déployer
- **Bouton PAUSE** pour mettre le jeu en pause
- **Amélioration d'économie** pour augmenter votre production d'argent

### 🏆 Objectif

Détruisez la tour ennemie avant que votre tour alliée ne soit détruite !

## 🏗️ Architecture du projet

```
Battlecats_html5/
├── assets/                 # Ressources graphiques
│   ├── backgrounds/        # Arrière-plans des niveaux
│   ├── cats/              # Sprites des unités
│   ├── effects/           # Effets visuels
│   └── towers/            # Images des tours
├── js/                    # Code JavaScript
│   ├── main.js           # Point d'entrée principal
│   ├── game.js           # Logique de jeu
│   ├── units.js          # Gestion des unités
│   ├── economy.js        # Système économique
│   ├── ui.js             # Interface utilisateur
│   ├── levelManager.js   # Gestion des niveaux
│   ├── levelSelector.js  # Sélection de niveau
│   ├── pauseMenu.js      # Menu pause
│   └── assets.js         # Chargement des assets
├── index.html            # Page principale
├── style.css             # Styles CSS
└── README.md             # Documentation
```

## 🛠️ Technologies utilisées

- **HTML5** : Structure de la page et canvas de jeu
- **CSS3** : Styling et animations
- **JavaScript ES6+** : Logique de jeu et interactions
- **Canvas API** : Rendu graphique 2D
- **Local Storage** : Sauvegarde des données

## 🎨 Assets et ressources

Le jeu utilise des sprites et images personnalisées pour :
- Les unités (chats et ennemis)
- Les tours (alliée et ennemie)
- Les arrière-plans de bataille
- Les effets visuels (explosions, pièces)

## 🔧 Développement

### Structure du code

Le projet suit une architecture modulaire avec séparation des responsabilités :

- **Game Engine** (`game.js`) : Boucle de jeu principale
- **Unit Management** (`units.js`) : Logique des unités
- **Economy System** (`economy.js`) : Gestion de l'argent
- **UI Controller** (`ui.js`) : Interface utilisateur
- **Level System** (`levelManager.js`) : Progression des niveaux

### Ajout de nouvelles fonctionnalités

1. Créez votre module dans le dossier `js/`
2. Ajoutez le script dans `index.html`
3. Intégrez-le dans le système existant

## 🙏 Remerciements

- Inspiré par le jeu original Battle Cats de PONOS Corporation
- Développé avec passion pour l'apprentissage du développement web


---

**Amusez-vous bien avec Battle Cats 2D ! 🐱⚔️**
