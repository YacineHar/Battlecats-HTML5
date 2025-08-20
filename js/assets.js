// Battle Cats 2D - Gestionnaire d'Assets

class AssetManager {
    constructor() {
        this.assets = {};
        this.loadedAssets = 0;
        this.totalAssets = 0;
        this.onLoadComplete = null;
    }

    // Liste des assets à charger
    getAssetList() {
        return {
                    cats: {
        basic_idle: 'assets/cats/basic_idle.png',
        tank_idle: 'assets/cats/tank_idle.png',
        attack_idle: 'assets/cats/attack_idle.png',
        enemy_basic_idle: 'assets/cats/enemy_basic_idle.png',
        enemy_doge_idle: 'assets/cats/enemy_basic_idle.png',
        hippoe_idle: 'assets/cats/Hippoe.png', // Boss level 3 sprite
        piggie_idle: 'assets/cats/piggie.png',   // Boss final sprite
        boss_level3_idle: 'assets/cats/Hippoe.png', // Boss level 3 - Hippoe
        boss_level6_idle: 'assets/cats/piggie.png',   // Boss final - Piggie
        // Sprites ennemis boss (avec prefix enemy_)
        enemy_boss_level3_idle: 'assets/cats/Hippoe.png', // Boss Hippoe ennemi
        enemy_boss_level6_idle: 'assets/cats/piggie.png'  // Boss Piggie ennemi
    },
            towers: {
                ally_tower: 'assets/towers/ally_tower.png',
                enemy_tower: 'assets/towers/enemy_tower.png'
            },
    backgrounds: {
        battlefield: 'assets/backgrounds/battlefield.jpeg',   // Niveau 1 - Forêt
        battlefield2: 'assets/backgrounds/battlefield2.png',  // Niveau 2 - Plaine
        battlefield3: 'assets/backgrounds/battlefield3.png',  // Niveau 3 - Désert (Boss Hippoe)
        battlefield4: 'assets/backgrounds/battlefield4.png',  // Niveau 4 - Côte
        battlefield5: 'assets/backgrounds/battlefield5.png',  // Niveau 5 - Festival
        battlefield6: 'assets/backgrounds/battlefield6.png'   // Niveau 6 - Le Pic (Boss)
    },
            effects: {
                explosion: 'assets/effects/explosion.png',
                coin: 'assets/effects/coin.png',
                efficiency: 'assets/effects/efficiency.png'
            }
        };
    }

    // Charge tous les assets
    loadAssets(onComplete) {
        this.onLoadComplete = onComplete;
        const assetList = this.getAssetList();
        this.totalAssets = this.countTotalAssets(assetList);
        
        if (this.totalAssets === 0) {
            this.onLoadComplete();
            return;
        }

        this.loadAssetCategory(assetList);
    }

    // Compte le nombre total d'assets
    countTotalAssets(assetList) {
        let count = 0;
        for (const category in assetList) {
            count += Object.keys(assetList[category]).length;
        }
        return count;
    }

    // Charge une catégorie d'assets
    loadAssetCategory(assetList) {
        for (const category in assetList) {
            this.assets[category] = {};
            for (const assetName in assetList[category]) {
                this.loadSingleAsset(category, assetName, assetList[category][assetName]);
            }
        }
    }

    // Charge un asset individuel
    loadSingleAsset(category, name, path) {
        const img = new Image();
        img.onload = () => {
            this.assets[category][name] = img;
            this.loadedAssets++;
            
            console.log(`Asset chargé: ${category}/${name} (${this.loadedAssets}/${this.totalAssets})`);
            
            if (this.loadedAssets === this.totalAssets) {
                console.log('Tous les assets sont chargés !');
                if (this.onLoadComplete) {
                    this.onLoadComplete();
                }
            }
        };
        
        img.onerror = () => {
            console.warn(`Impossible de charger l'asset: ${path}`);
            // Créer un asset placeholder
            this.assets[category][name] = this.createPlaceholder(50, 50);
            this.loadedAssets++;
            
            if (this.loadedAssets === this.totalAssets) {
                if (this.onLoadComplete) {
                    this.onLoadComplete();
                }
            }
        };
        
        img.src = path;
    }

    // Crée un placeholder pour les assets manquants
    createPlaceholder(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Dessine un carré coloré comme placeholder
        ctx.fillStyle = '#FF6B9D';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('?', width/2, height/2 + 4);
        
        return canvas;
    }

    // Récupère un asset
    getAsset(category, name) {
        if (this.assets[category] && this.assets[category][name]) {
            return this.assets[category][name];
        }
        console.warn(`Asset non trouvé: ${category}/${name}`);
        return this.createPlaceholder(50, 50);
    }

    // Vérifie si tous les assets sont chargés
    isLoaded() {
        return this.loadedAssets === this.totalAssets;
    }

    // Obtient le pourcentage de chargement
    getLoadProgress() {
        return this.totalAssets > 0 ? (this.loadedAssets / this.totalAssets) * 100 : 100;
    }
}

// Instance globale du gestionnaire d'assets
const assetManager = new AssetManager();
