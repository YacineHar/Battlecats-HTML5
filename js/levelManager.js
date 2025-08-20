// Gestionnaire des niveaux Battle Cats 2D

class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.maxLevel = 6;
        this.bossLevels = [3, 6]; // Niveaux avec boss
        this.isLevelCompleted = false;
        this.unlockedLevels = this.loadProgress(); // Charger progression sauvegardée
        
        // Configuration des niveaux avec progression dynamique
        this.baseTowerHealth = 1000; // Santé de base de la tour ennemie
        this.baseSpawnDelay = 6000; // Délai de spawn de base (6s)
        
                        this.levelConfig = {
                    1: { name: "Niveau 1 - Forêt", enemyTypes: ['doge'] },
                    2: { name: "Niveau 2 - Plaine", enemyTypes: ['doge'] },
                    3: { name: "Niveau 3 - Désert (Boss Hippoe)", enemyTypes: ['boss_level3'] },
                    4: { name: "Niveau 4 - Côte", enemyTypes: ['doge'] },
                    5: { name: "Niveau 5 - Festival", enemyTypes: ['doge'] },
                    6: { name: "Niveau 6 - Le Pic (Boss)", enemyTypes: ['boss_level6', 'doge'] }
                };
        
        this.onLevelChange = null;
        this.onLevelComplete = null;
        this.onGameComplete = null;
    }
    
    getCurrentLevel() {
        return this.currentLevel;
    }
    
    getCurrentLevelConfig() {
        return this.levelConfig[this.currentLevel];
    }
    
    getCurrentLevelName() {
        return this.levelConfig[this.currentLevel].name;
    }
    
    isBossLevel(level = this.currentLevel) {
        return this.bossLevels.includes(level);
    }
    
    getEnemyTypesForCurrentLevel() {
        return this.levelConfig[this.currentLevel].enemyTypes;
    }
    
    getSpawnDelayForCurrentLevel() {
        // NIVEAU 6 : Délai fixe de 6 secondes pour les doges renforts
        if (this.currentLevel === 6) {
            console.log(`Niveau ${this.currentLevel}: Délai spawn = 6000ms (délai fixe pour doges après Piggie)`);
            return 6000; // 6 secondes
        }
        
        // Niveau 3 boss : délai spécial
        if (this.currentLevel === 3) {
            return 15000; // Boss level 3: 15s
        }
        
        // Calcul dynamique: -10% à chaque niveau (plus rapide)
        const difficultyMultiplier = 1 - ((this.currentLevel - 1) * 0.10);
        const calculatedDelay = Math.round(this.baseSpawnDelay * difficultyMultiplier);
        
        console.log(`Niveau ${this.currentLevel}: Délai spawn = ${calculatedDelay}ms (${Math.round((1-difficultyMultiplier)*100)}% plus rapide)`);
        return calculatedDelay;
    }
    
    getEnemyTowerHealthForCurrentLevel() {
        // +10% de santé à chaque niveau (progression normale)
        const healthMultiplier = 1 + ((this.currentLevel - 1) * 0.10);
        const calculatedHealth = Math.round(this.baseTowerHealth * healthMultiplier);
        
        console.log(`Niveau ${this.currentLevel}: Tour ennemie = ${calculatedHealth} PV (+${Math.round((healthMultiplier-1)*100)}%)`);
        return calculatedHealth;
    }
    
    // Méthode appelée quand la tour ennemie est détruite
    onEnemyTowerDestroyed() {
        if (!this.isLevelCompleted) {
            this.isLevelCompleted = true;
            this.completeCurrentLevel();
        }
    }
    
    completeCurrentLevel() {
        console.log(`Niveau ${this.currentLevel} terminé ! Tour ennemie détruite !`);
        
        // Débloquer le niveau suivant
        this.unlockNextLevel();
        
        if (this.onLevelComplete) {
            this.onLevelComplete(this.currentLevel);
        }
        
        // Vérifier si c'est la fin du jeu
        if (this.currentLevel >= this.maxLevel) {
            this.completeGame();
            return;
        }
        
        // Ne plus passer automatiquement au niveau suivant
        // Le joueur cliquera sur "Niveau suivant"
    }
    
    nextLevel() {
        if (this.currentLevel < this.maxLevel) {
            this.currentLevel++;
            this.isLevelCompleted = false;
            
            console.log(`Passage au niveau ${this.currentLevel}: ${this.getCurrentLevelName()}`);
            
            if (this.onLevelChange) {
                this.onLevelChange(this.currentLevel);
            }
        }
    }
    
    completeGame() {
        console.log('JEU TERMINÉ ! Tous les niveaux complétés !');
        
        if (this.onGameComplete) {
            this.onGameComplete();
        }
    }
    
    reset() {
        this.currentLevel = 1;
        this.isLevelCompleted = false;
        console.log('LevelManager reset - Retour au niveau 1');
    }
    
    // Callbacks
    setLevelChangeCallback(callback) {
        this.onLevelChange = callback;
    }
    
    setLevelCompleteCallback(callback) {
        this.onLevelComplete = callback;
    }
    
    setGameCompleteCallback(callback) {
        this.onGameComplete = callback;
    }
    
    // Méthodes utilitaires
    isCurrentLevelCompleted() {
        return this.isLevelCompleted;
    }
    
    isLastLevel() {
        return this.currentLevel >= this.maxLevel;
    }
    
    // Système de sauvegarde/chargement
    saveProgress() {
        const progress = {
            unlockedLevels: this.unlockedLevels,
            maxLevelReached: Math.max(...this.unlockedLevels)
        };
        localStorage.setItem('battlecats2d_progress', JSON.stringify(progress));
        console.log('Progression sauvegardée:', progress);
    }
    
    loadProgress() {
        const saved = localStorage.getItem('battlecats2d_progress');
        if (saved) {
            const progress = JSON.parse(saved);
            console.log('Progression chargée:', progress);
            return progress.unlockedLevels || [1]; // Au minimum niveau 1 débloqué
        }
        return [1]; // Premier lancement: seul niveau 1 débloqué
    }
    
    unlockNextLevel() {
        const nextLevel = this.currentLevel + 1;
        if (nextLevel <= this.maxLevel && !this.unlockedLevels.includes(nextLevel)) {
            this.unlockedLevels.push(nextLevel);
            this.saveProgress();
            console.log(`Niveau ${nextLevel} débloqué !`);
        }
    }
    
    isLevelUnlocked(level) {
        return this.unlockedLevels.includes(level);
    }
    
    getUnlockedLevels() {
        return [...this.unlockedLevels].sort((a, b) => a - b);
    }
    
    setCurrentLevel(level) {
        if (this.isLevelUnlocked(level)) {
            this.currentLevel = level;
            this.isLevelCompleted = false;
            console.log(`Niveau défini à: ${level} - ${this.getCurrentLevelName()}`);
            return true;
        }
        console.log(`Niveau ${level} non débloqué !`);
        return false;
    }
}

// Instance globale
const levelManager = new LevelManager();
