// Menu Pause pour Battle Cats 2D

class PauseMenu {
    constructor() {
        this.isPaused = false;
        this.gameWasPausedByMenu = false;
    }
    
    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }
    
    pause() {
        if (!this.isPaused) {
            this.isPaused = true;
            this.gameWasPausedByMenu = true;
            
            // Arrêter le jeu
            if (game && game.isRunning) {
                game.stop();
            }
            
            this.show();
            console.log('Jeu mis en pause');
        }
    }
    
    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.gameWasPausedByMenu = false;
            
            this.hide();
            
            // Reprendre le jeu
            if (game && !game.isRunning) {
                game.start();
            }
            
            console.log('Jeu repris');
        }
    }
    
    show() {
        this.hideExistingScreens();
        
        const pauseScreen = document.createElement('div');
        pauseScreen.id = 'pause-screen';
        pauseScreen.className = 'game-overlay';
        
        const currentLevelName = levelManager.getCurrentLevelName();
        const currentMoney = economy.getMoney();
        const maxMoney = economy.getMaxMoney();
        const moneyLevel = economy.getMoneyLevel();
        
        pauseScreen.innerHTML = `
            <div class="pause-content">
                <h1>JEU EN PAUSE</h1>
                
                <div class="pause-info">
                    <p><strong>${currentLevelName}</strong></p>
                    <p>Argent: ${currentMoney}/${maxMoney} (Niveau ${moneyLevel})</p>
                </div>
                
                <div class="pause-buttons">
                    <button class="pause-btn resume-btn" onclick="pauseMenu.resume()">
                        Reprendre
                    </button>
                    
                    <button class="pause-btn restart-btn" onclick="pauseMenu.restartLevel()">
                        Recommencer Niveau
                    </button>
                    
                    <button class="pause-btn level-select-btn" onclick="pauseMenu.goToLevelSelect()">
                        Sélection Niveau
                    </button>
                    
                    <button class="pause-btn quit-btn" onclick="pauseMenu.quitToMenu()">
                        Quitter
                    </button>
                </div>
                
                <div class="pause-tips">
                    <p><strong>Astuce:</strong> Appuyez sur <kbd>P</kbd> pour faire pause/reprendre</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(pauseScreen);
        
        // Animation d'entrée
        setTimeout(() => {
            pauseScreen.classList.add('show');
        }, 100);
    }
    
    hide() {
        const pauseScreen = document.getElementById('pause-screen');
        if (pauseScreen) {
            pauseScreen.classList.remove('show');
            setTimeout(() => {
                pauseScreen.remove();
            }, 300);
        }
    }
    
    restartLevel() {
        this.hide();
        
        // Reset l'économie pour le niveau actuel
        economy.reset();
        
        // Redémarrer le jeu au niveau actuel
        if (game) {
            game.resetAndStart();
        }
        
        if (ui) {
            ui.showMessage('Niveau redémarré !', 'info', 2000);
        }
        
        this.isPaused = false;
        this.gameWasPausedByMenu = false;
    }
    
    goToLevelSelect() {
        this.hide();
        
        // Ouvrir le sélecteur de niveau
        levelSelector.show();
        
        this.isPaused = false;
        this.gameWasPausedByMenu = false;
    }
    
    quitToMenu() {
        this.hide();
        
        // Arrêter le jeu
        if (game && game.isRunning) {
            game.stop();
        }
        
        // Reset au niveau 1
        levelManager.setCurrentLevel(1);
        economy.reset();
        
        if (game) {
            game = new Game(document.getElementById('game-canvas'));
            game.start();
        }
        
        if (ui) {
            ui.updateLevelDisplay(1);
            ui.showMessage('Retour au niveau 1', 'info', 2000);
        }
        
        this.isPaused = false;
        this.gameWasPausedByMenu = false;
    }
    
    hideExistingScreens() {
        // Cacher autres écrans
        const gameOverScreen = document.getElementById('game-over-screen');
        const levelSelectorScreen = document.getElementById('level-selector-screen');
        
        if (gameOverScreen) {
            gameOverScreen.remove();
        }
        if (levelSelectorScreen) {
            levelSelectorScreen.remove();
        }
    }
    
    // Méthode utilitaire pour vérifier l'état
    isGamePaused() {
        return this.isPaused;
    }
}

// Instance globale
const pauseMenu = new PauseMenu();

// Gestion des touches de raccourci
document.addEventListener('keydown', (event) => {
    // Pause/Resume avec P seulement (ESPACE retiré)
    if (event.code === 'KeyP') {
        event.preventDefault();
        
        // Ne pas interférer si on est dans un autre menu
        const hasOtherScreens = document.getElementById('game-over-screen') || 
                               document.getElementById('level-selector-screen');
        
        if (!hasOtherScreens) {
            pauseMenu.togglePause();
        }
    }
});
