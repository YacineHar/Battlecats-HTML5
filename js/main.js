// Battle Cats 2D - Point d'entrée principal

class GameManager {
    constructor() {
        this.isLoading = true;
        this.loadingProgress = 0;
        this.canvas = null;
        this.ctx = null;
    }
    
    async initialize() {
        console.log('Initialisation de Battle Cats 2D...');
        
        try {
            // 1. Obtenir le canvas
            this.canvas = document.getElementById('game-canvas');
            if (!this.canvas) {
                throw new Error('Canvas non trouvé !');
            }
            
            this.ctx = this.canvas.getContext('2d');
            console.log('Canvas initialisé');
            
            // 2. Afficher l'écran de chargement
            this.showLoadingScreen();
            
            // 3. Charger les assets
            await this.loadAssets();
            
            // 4. Initialiser les systèmes
            this.initializeSystems();
            
            // 5. Démarrer le jeu
            this.startGame();
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
            this.showErrorMessage(error.message);
        }
    }
    
    showLoadingScreen() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('BATTLE CATS 2D', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Chargement en cours...', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
    
    updateLoadingScreen(progress) {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Titre
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('BATTLE CATS 2D', this.canvas.width / 2, this.canvas.height / 2 - 80);
        
        // Sous-titre
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Tower Defense Game', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        // Barre de progression
        const barWidth = 300;
        const barHeight = 20;
        const barX = (this.canvas.width - barWidth) / 2;
        const barY = this.canvas.height / 2;
        
        // Fond de la barre
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progression
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(barX, barY, (barWidth * progress) / 100, barHeight);
        
        // Bordure
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Texte de progression
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`${Math.round(progress)}%`, this.canvas.width / 2, barY + 40);
        
        // Instructions
        if (progress >= 100) {
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText('Prêt ! Cliquez pour commencer', this.canvas.width / 2, barY + 80);
        }
    }
    
    loadAssets() {
        return new Promise((resolve) => {
            // Simuler le chargement avec des mises à jour de progression
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 10;
                if (progress > 95) progress = 95;
                
                this.updateLoadingScreen(progress);
            }, 100);
            
            assetManager.loadAssets(() => {
                clearInterval(progressInterval);
                this.updateLoadingScreen(100);
                console.log('Assets chargés');
                
                // Attendre un moment pour afficher "Prêt"
                setTimeout(() => {
                    resolve();
                }, 500);
            });
        });
    }
    
    initializeSystems() {
        console.log('Initialisation des systèmes...');
        
        // Initialiser l'interface utilisateur
        ui.initialize();
        console.log('Interface utilisateur initialisée');
        
        // Créer l'instance du jeu
        game = new Game(this.canvas);
        console.log('Moteur de jeu initialisé');
        
        // Configurer les événements globaux
        this.setupGlobalEvents();
        console.log('Événements configurés');
        
        this.isLoading = false;
    }
    
    setupGlobalEvents() {
        // Redimensionnement de la fenêtre
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Événements clavier
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        // Événement de clic pour démarrer
        const startClickHandler = () => {
            if (!this.isLoading && !game.isRunning) {
                this.canvas.removeEventListener('click', startClickHandler);
                game.start();
                
                // Démarrer la boucle de mise à jour de l'UI
                this.startUIUpdateLoop();
            }
        };
        
        this.canvas.addEventListener('click', startClickHandler);
    }
    
    startUIUpdateLoop() {
        const updateUI = () => {
            if (game && game.isRunning) {
                ui.update();
            }
            requestAnimationFrame(updateUI);
        };
        updateUI();
    }
    
    handleResize() {
        // Pour une version plus avancée, on pourrait redimensionner le canvas
        console.log('Fenêtre redimensionnée');
    }
    
    handleKeyDown(e) {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                if (game && game.isRunning) {
                    // Pause/Resume
                    game.isRunning ? game.stop() : game.start();
                }
                break;
            case 'Escape':
                if (game && game.isRunning) {
                    game.stop();
                    this.showPauseMenu();
                }
                break;
            case 'KeyR':
                // Restart
                if (game) {
                    this.restartGame();
                }
                break;
        }
    }
    
    startGame() {
        console.log('Démarrage du jeu...');
        
        // Afficher les instructions initiales
        this.showWelcomeMessage();
        
        console.log('Battle Cats 2D prêt !');
    }
    
    showWelcomeMessage() {
        ui.showMessage('Bienvenue dans Battle Cats 2D !', 'success', 3000);
        
        setTimeout(() => {
            ui.showMessage('Cliquez sur le terrain pour placer vos unités', 'info', 4000);
        }, 3500);
    }
    
    showErrorMessage(message) {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FF4444';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Erreur !', this.canvas.width / 2, this.canvas.height / 2 - 30);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2 + 10);
        
        this.ctx.fillText('Veuillez recharger la page', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
    
    showPauseMenu() {
        ui.showMessage('Jeu en pause - Appuyez sur Espace pour reprendre', 'info', 5000);
    }
    
    restartGame() {
        if (game) {
            game.stop();
            
            // Réinitialiser l'économie
            economy.reset();
            
            // Recréer le jeu
            game = new Game(this.canvas);
            game.start();
            
            ui.showMessage('Jeu redémarré !', 'success');
        }
    }
}

// Point d'entrée principal
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM chargé, initialisation du jeu...');
    
    const gameManager = new GameManager();
    gameManager.initialize();
});

// Variables globales pour debug
window.gameDebug = {
    game: () => game,
    economy: () => economy,
    unitSystem: () => unitSystem,
    assetManager: () => assetManager,
    ui: () => ui,
    
    // Fonctions de debug utiles
    addMoney: (amount) => economy.addMoney(amount),
    spawnUnit: (type) => {
        if (game) {
            game.spawnAllyUnit(type, 600, game.spawnLine);
        }
    },
    
    info: () => {
        console.log('=== Battle Cats 2D Debug Info ===');
        console.log('Argent:', economy.getMoney());
        console.log('Énergie:', economy.formatEnergy());
        console.log('Unités alliées:', game ? game.allyUnits.length : 0);
        console.log('Unités ennemies:', game ? game.enemyUnits.length : 0);
        console.log('Jeu actif:', game ? game.isRunning : false);
    }
};

console.log('Tapez "gameDebug.info()" dans la console pour des infos de debug');
console.log('Tapez "gameDebug.addMoney(1000)" pour ajouter de l\'argent');
