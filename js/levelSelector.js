// Sélecteur de niveau pour Battle Cats 2D

class LevelSelector {
    constructor() {
        this.isVisible = false;
    }
    
    show() {
        this.hideExistingScreens();
        
        const levelSelectorScreen = document.createElement('div');
        levelSelectorScreen.id = 'level-selector-screen';
        levelSelectorScreen.className = 'game-overlay';
        
        const unlockedLevels = levelManager.getUnlockedLevels();
        const maxUnlocked = Math.max(...unlockedLevels);
        
        let levelsHTML = '';
        for (let i = 1; i <= levelManager.maxLevel; i++) {
            const isUnlocked = unlockedLevels.includes(i);
            const isBoss = levelManager.bossLevels.includes(i);
            const levelConfig = levelManager.levelConfig[i];
            
            let statusClass = '';
            let statusIcon = '';
            let clickable = '';
            
            if (isUnlocked) {
                statusClass = 'unlocked';
                statusIcon = 'OUVERT';
                clickable = `onclick="levelSelector.selectLevel(${i})"`;
            } else {
                statusClass = 'locked';
                statusIcon = 'FERME';
                clickable = '';
            }
            
            if (isBoss) {
                statusClass += ' boss-level';
            }
            
            levelsHTML += `
                <div class="level-card ${statusClass}" ${clickable}>
                    <div class="level-number">${i}</div>
                    <div class="level-name">${levelConfig.name}</div>
                    <div class="level-status">${statusIcon}</div>
                    ${isBoss ? '<div class="boss-indicator">BOSS</div>' : ''}
                </div>
            `;
        }
        
        levelSelectorScreen.innerHTML = `
            <div class="level-selector-content">
                <h1>SÉLECTION DE NIVEAU</h1>
                <p>Choisissez votre niveau :</p>
                
                <div class="levels-grid">
                    ${levelsHTML}
                </div>
                
                <div class="level-selector-buttons">
                    <button class="level-selector-btn back-btn" onclick="levelSelector.hide()">
                        Retour
                    </button>
                    <button class="level-selector-btn reset-btn" onclick="levelSelector.resetProgress()">
                        Reset Progression
                    </button>
                </div>
                
                <div class="progress-info">
                    <p>Progression: ${unlockedLevels.length}/${levelManager.maxLevel} niveaux débloqués</p>
                    <p>Niveau maximum atteint: ${maxUnlocked}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(levelSelectorScreen);
        
        // Animation d'entrée
        setTimeout(() => {
            levelSelectorScreen.classList.add('show');
        }, 100);
        
        this.isVisible = true;
    }
    
    hide() {
        const levelSelectorScreen = document.getElementById('level-selector-screen');
        if (levelSelectorScreen) {
            levelSelectorScreen.classList.remove('show');
            setTimeout(() => {
                levelSelectorScreen.remove();
            }, 300);
        }
        this.isVisible = false;
    }
    
    selectLevel(level) {
        if (levelManager.setCurrentLevel(level)) {
            this.hide();
            
            // UTILISER LA MÊME MÉTHODE QUE "RECOMMENCER NIVEAU" (qui fonctionne)
            economy.reset(); // Reset économie complète
            
            // Recréer le jeu EXACTEMENT comme restartLevel() qui fonctionne
            if (game) {
                game = new Game(document.getElementById('game-canvas'));
                game.start();
            }
            
            console.log('NIVEAU CHANGÉ avec méthode restartLevel() qui fonctionne');
            
            // Mettre à jour l'UI
            if (ui) {
                ui.updateLevelDisplay(level);
                ui.showMessage(`${levelManager.getCurrentLevelName()} sélectionné !`, 'info', 2000);
            }
            
            console.log(`RESET COMPLET - ${levelManager.getCurrentLevelName()}`);
        } else {
            if (ui) {
                ui.showMessage(`Niveau ${level} non débloqué !`, 'error', 2000);
            }
        }
    }
    
    resetProgress() {
        if (confirm('Êtes-vous sûr de vouloir reset votre progression ?\nTous les niveaux débloqués seront perdus !')) {
            localStorage.removeItem('battlecats2d_progress');
            levelManager.unlockedLevels = [1];
            levelManager.currentLevel = 1;
            levelManager.saveProgress();
            
            this.hide();
            
            if (ui) {
                ui.showMessage('Progression resetée !', 'info', 2000);
                ui.updateLevelDisplay(1);
            }
            
            // Redémarrer le jeu au niveau 1
            economy.reset();
            if (game) {
                game = new Game(document.getElementById('game-canvas'));
                game.start();
            }
        }
    }
    
    hideExistingScreens() {
        // Cacher autres écrans
        const gameOverScreen = document.getElementById('game-over-screen');
        if (gameOverScreen) {
            gameOverScreen.remove();
        }
    }
}

// Instance globale
const levelSelector = new LevelSelector();
