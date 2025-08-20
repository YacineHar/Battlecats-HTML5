
class UI {
    constructor() {
        this.selectedUnit = null;
        this.elements = {};
        this.isInitialized = false;
        this.unitCooldowns = {}; // Cooldowns de déploiement par type d'unité
        
        // Références aux éléments DOM
        this.initElements();
        this.setupEventListeners();
    }
    
    initElements() {
        this.elements = {
            moneyAmount: document.getElementById('money-amount'),
            energyAmount: document.getElementById('energy-amount'),
            moneyLevelNumber: document.getElementById('money-level-number'),
            upgradeMoneyBtn: document.getElementById('upgrade-money-btn'),
            upgradeCost: document.getElementById('upgrade-cost'),
            allyHealthFill: document.getElementById('ally-health-fill'),
            allyHealthText: document.getElementById('ally-health-text'),
            enemyHealthFill: document.getElementById('enemy-health-fill'),
            enemyHealthText: document.getElementById('enemy-health-text'),
            unitButtons: document.querySelectorAll('.unit-button'),
            currentLevel: document.getElementById('current-level'),
            levelProgress: document.getElementById('level-progress')
        };
        
        // Vérifier que tous les éléments sont présents
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element) {
                console.warn(`Élément UI non trouvé: ${key}`);
            }
        }
    }
    
    setupEventListeners() {
        // Événements des boutons d'unités
        this.elements.unitButtons.forEach(button => {
            // Utiliser mousedown au lieu de click pour une meilleure réactivité
            button.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Éviter les conflits
                this.selectUnit(e.currentTarget);
            });
            
            // Tooltip au survol avec délai pour éviter les "clips"
            let tooltipTimeout;
            button.addEventListener('mouseenter', (e) => {
                // Ne pas afficher le tooltip si le bouton est en train d'être cliqué
                if (!e.currentTarget.classList.contains('clicking')) {
                    tooltipTimeout = setTimeout(() => {
                        this.showUnitTooltip(e.currentTarget);
                    }, 200); // Délai de 200ms
                }
            });
            
            button.addEventListener('mouseleave', (e) => {
                clearTimeout(tooltipTimeout);
                this.hideUnitTooltip();
            });
        });
        
        // Événement du bouton d'upgrade
        if (this.elements.upgradeMoneyBtn) {
            this.elements.upgradeMoneyBtn.addEventListener('click', () => {
                this.upgradeMoneyLevel();
            });
        }
        
        // Configurer les callbacks de l'économie
        economy.setMoneyChangeCallback((money) => {
            this.updateMoneyDisplay(money);
            this.updateUnitButtonStates(); // Mettre à jour les boutons quand l'argent change
        });
        
        economy.setEnergyChangeCallback((energy, maxEnergy) => {
            this.updateEnergyDisplay(energy, maxEnergy);
        });
        
        economy.setMoneyLevelChangeCallback((level, upgradeCost) => {
            this.updateMoneyLevelDisplay(level, upgradeCost);
        });
    }
    
    selectUnit(buttonElement) {
        const unitType = buttonElement.dataset.unit;
        const unitCost = parseInt(buttonElement.dataset.cost);
        
        // Vérifier le cooldown de déploiement
        if (this.isUnitOnCooldown(unitType)) {
            const remainingTime = Math.ceil(this.getRemainingCooldown(unitType) / 1000);
            this.showMessage(`${unitType} en recharge ! ${remainingTime}s restantes`, 'error');
            return;
        }
        
        // Protection contre les clics multiples
        if (buttonElement.classList.contains('clicking')) {
            return;
        }
        
        // Vérifier si on peut se permettre cette unité
        if (!economy.canAfford(unitCost)) {
            this.showMessage("Pas assez d'argent !", 'error');
            return;
        }
        
        // Spawn immédiat de l'unité
        if (game && game.isRunning) {
            // Position pile devant la tour alliée
            const towerX = game.towers.ally.x;
            const x = towerX - 60 + Math.random() * 20; // Spawn devant la tour (-60 à -40px)
            const y = game.spawnLine;
            
            game.spawnAllyUnit(unitType, x, y);
            economy.spendMoney(unitCost);
            
            // Démarrer le cooldown de déploiement (2 secondes)
            const unitStats = unitSystem.getUnitStats(unitType);
            this.startUnitCooldown(unitType, unitStats.deploymentCooldown || 2000);
            
            // Animation du bouton avec protection
            buttonElement.classList.add('clicking');
            buttonElement.style.transform = 'scale(0.9)';
            setTimeout(() => {
                buttonElement.style.transform = '';
                buttonElement.classList.remove('clicking');
            }, 300);
            
            this.showMessage(`${unitType} déployé !`, 'success', 1000);
            console.log(`Unité créée: ${unitType} (${unitCost} gold) près de la tour`);
        }
    }
    
    getSelectedUnit() {
        return this.selectedUnit;
    }
    
    updateMoneyDisplay(money) {
        if (this.elements.moneyAmount) {
            this.elements.moneyAmount.textContent = `${money}/${economy.getMaxMoney()}`;
        }
        
        // Mettre à jour l'état des boutons
        this.updateUnitButtonStates();
        this.updateUpgradeButtonState();
    }
    
    updateMoneyLevelDisplay(level, upgradeCost) {
        if (this.elements.moneyLevelNumber) {
            this.elements.moneyLevelNumber.textContent = level;
        }
        
        if (this.elements.upgradeCost && upgradeCost !== null) {
            this.elements.upgradeCost.textContent = upgradeCost;
        }
        
        this.updateUpgradeButtonState();
    }
    
    updateUpgradeButtonState() {
        if (!this.elements.upgradeMoneyBtn) return;
        
        const upgradeCost = economy.getUpgradeCost();
        
        if (upgradeCost === null) {
            // Niveau max atteint
            this.elements.upgradeMoneyBtn.innerHTML = `
                <img src="assets/effects/efficiency.png" alt="Efficiency" class="upgrade-icon">
                <div class="upgrade-text">
                    <span class="upgrade-label">MAX</span>
                </div>
            `;
            this.elements.upgradeMoneyBtn.disabled = true;
            this.elements.upgradeMoneyBtn.classList.add('max-level');
        } else if (economy.canUpgradeMoneyLevel()) {
            // Peut upgrade
            this.elements.upgradeMoneyBtn.disabled = false;
            this.elements.upgradeMoneyBtn.classList.remove('max-level');
        } else {
            // Pas assez d'argent
            this.elements.upgradeMoneyBtn.disabled = true;
            this.elements.upgradeMoneyBtn.classList.remove('max-level');
        }
    }
    
    upgradeMoneyLevel() {
        if (economy.upgradeMoneyLevel()) {
            this.showMessage(`Niveau augmenté ! Production: +5%`, 'success', 2000);
        } else {
            this.showMessage('Pas assez d\'argent pour l\'upgrade !', 'error');
        }
    }
    
    updateEnergyDisplay(energy, maxEnergy) {
        if (this.elements.energyAmount) {
            this.elements.energyAmount.textContent = economy.formatEnergy();
        }
    }
    
    updateUnitButtonStates() {
        this.elements.unitButtons.forEach(button => {
            const cost = parseInt(button.dataset.cost);
            const canAfford = economy.canAfford(cost);
            
            if (canAfford) {
                button.classList.remove('disabled');
            } else {
                button.classList.add('disabled');
            }
        });
    }
    
    updateTowerHealth(tower, health, maxHealth) {
        const healthPercent = (health / maxHealth) * 100;
        
        if (tower === 'ally') {
            if (this.elements.allyHealthFill) {
                this.elements.allyHealthFill.style.width = healthPercent + '%';
            }
            if (this.elements.allyHealthText) {
                this.elements.allyHealthText.textContent = `${health}/${maxHealth}`;
            }
        } else if (tower === 'enemy') {
            if (this.elements.enemyHealthFill) {
                this.elements.enemyHealthFill.style.width = healthPercent + '%';
            }
            if (this.elements.enemyHealthText) {
                this.elements.enemyHealthText.textContent = `${health}/${maxHealth}`;
            }
        }
    }
    
    showUnitTooltip(buttonElement) {
        const unitType = buttonElement.dataset.unit;
        const unitInfo = unitSystem.getUnitInfo(unitType);
        
        if (!unitInfo) return;
        
        // Créer ou mettre à jour le tooltip
        let tooltip = document.getElementById('unit-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'unit-tooltip';
            tooltip.className = 'tooltip';
            document.body.appendChild(tooltip);
        }
        
        tooltip.innerHTML = `
            <div class="tooltip-title">${unitInfo.name}</div>
            <div class="tooltip-stats">
                <div>Vie: ${unitInfo.health}</div>
                <div>Dégâts: ${unitInfo.damage}</div>
                <div>Vitesse: ${unitInfo.speed}</div>
                <div>Coût: ${unitInfo.cost}</div>
            </div>
            <div class="tooltip-description">${unitInfo.description}</div>
        `;
        
        // Positionner le tooltip
        const rect = buttonElement.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
        tooltip.style.display = 'block';
    }
    
    hideUnitTooltip() {
        const tooltip = document.getElementById('unit-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }
    
    showMessage(text, type = 'info', duration = 2000) {
        // Créer un message temporaire
        const message = document.createElement('div');
        message.className = `game-message ${type}`;
        message.textContent = text;
        
        // Styles
        Object.assign(message.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '15px 25px',
            borderRadius: '10px',
            fontSize: '18px',
            fontWeight: 'bold',
            zIndex: '1000',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        });
        
        if (type === 'error') {
            message.style.background = '#F44336';
            message.style.color = 'white';
        } else if (type === 'success') {
            message.style.background = '#4CAF50';
            message.style.color = 'white';
        } else {
            message.style.background = '#2196F3';
            message.style.color = 'white';
        }
        
        document.body.appendChild(message);
        
        // Animation d'apparition
        setTimeout(() => {
            message.style.opacity = '1';
        }, 10);
        
        // Suppression automatique
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, duration);
    }
    
    // Initialisation complète de l'UI
    initialize() {
        if (this.isInitialized) return;
        
        // Mise à jour initiale des affichages
        this.updateMoneyDisplay(economy.getMoney());
        // this.updateEnergyDisplay(economy.getEnergy(), economy.getMaxEnergy()); // SUPPRIMÉ: Plus d'énergie
        this.updateMoneyLevelDisplay(economy.getMoneyLevel(), economy.getUpgradeCost());
        this.updateUnitButtonStates();
        this.updateLevelDisplay(levelManager.getCurrentLevel()); // AJOUT: Afficher le niveau dès l'initialisation
        
        // Créer les styles CSS pour les tooltips s'ils n'existent pas
        this.createTooltipStyles();
        
        this.isInitialized = true;
        console.log('Interface utilisateur initialisée');
    }
    
    createTooltipStyles() {
        if (document.getElementById('tooltip-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'tooltip-styles';
        style.textContent = `
            .tooltip {
                position: absolute;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 10px;
                border-radius: 8px;
                font-size: 12px;
                max-width: 200px;
                z-index: 1000;
                display: none;
                border: 2px solid #FFD700;
            }
            
            .tooltip-title {
                font-weight: bold;
                margin-bottom: 5px;
                color: #FFD700;
            }
            
            .tooltip-stats {
                margin-bottom: 5px;
            }
            
            .tooltip-stats div {
                margin: 2px 0;
            }
            
            .tooltip-description {
                font-style: italic;
                color: #CCCCCC;
                font-size: 11px;
            }
            
            .unit-button.selected {
                background: linear-gradient(145deg, #FFD700, #FFA000) !important;
                border-color: #FF6F00 !important;
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Méthode pour mettre à jour périodiquement l'interface
    update() {
        // Mettre à jour les barres de vie des tours si le jeu est actif
        if (game && game.isRunning) {
            this.updateTowerHealth('ally', game.towers.ally.health, game.towers.ally.maxHealth);
            this.updateTowerHealth('enemy', game.towers.enemy.health, game.towers.enemy.maxHealth);
        }
    }
    
    // Écran de fin de partie
    showGameOverScreen(isVictory) {
        // Supprimer un éventuel écran existant
        const existingScreen = document.getElementById('game-over-screen');
        if (existingScreen) {
            existingScreen.remove();
        }
        
        // Créer l'écran de fin de partie
        const gameOverScreen = document.createElement('div');
        gameOverScreen.id = 'game-over-screen';
        gameOverScreen.className = 'game-over-screen';
        
        const title = isVictory ? 'VICTOIRE !' : 'DÉFAITE';
        const message = isVictory ? 
            'Vous avez détruit la tour ennemie !' : 
            'Votre tour a été détruite...';
        const titleColor = isVictory ? '#4CAF50' : '#F44336';
        
        gameOverScreen.innerHTML = `
            <div class="game-over-content">
                <h1 style="color: ${titleColor}">${title}</h1>
                <p>${message}</p>
                
                <div class="game-over-buttons">
                    ${isVictory && !levelManager.isLastLevel() ? `
                        <button class="game-over-btn next-level-btn" onclick="ui.nextLevel()">
                            Niveau suivant
                        </button>
                    ` : ''}
                    ${isVictory && levelManager.isLastLevel() ? `
                        <button class="game-over-btn restart-game-btn" onclick="ui.restartGame()">
                            Rejouer le jeu
                        </button>
                    ` : ''}
                    <button class="game-over-btn restart-btn" onclick="ui.restartLevel()">
                        Recommencer le niveau
                    </button>
                    <button class="game-over-btn map-btn" onclick="ui.goToLevelMap()">
                        Carte des Niveaux
                    </button>
                    <button class="game-over-btn quit-btn" onclick="ui.quitGame()">
                        Quitter
                    </button>
                </div>
                
                <div class="game-stats">
                    <p>Argent final: ${economy.getMoney()}</p>
                    <p>Unités déployées: ${game ? game.allyUnits.length : 0}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(gameOverScreen);
        
        // Animation d'entrée
        setTimeout(() => {
            gameOverScreen.classList.add('show');
        }, 100);
    }
    
    // Actions de l'écran de fin
    restartLevel() {
        console.log('Redémarrage du niveau...');
        this.hideGameOverScreen();
        
        // Réinitialiser l'économie
        economy.reset();
        
        // Recréer le jeu
        if (game) {
            game = new Game(document.getElementById('game-canvas'));
            game.start();
        }
        
        this.showMessage('Niveau redémarré !', 'info');
    }
    
    goToLevelMap() {
        console.log('Ouverture de la carte des niveaux...');
        this.hideGameOverScreen();
        levelSelector.show();
    }
    
    nextLevel() {
        console.log('Passage au niveau suivant...');
        this.hideGameOverScreen();
        
        // Avancer au niveau suivant
        levelManager.nextLevel();
        
        // Reset pour le nouveau niveau (garde les upgrades économiques)
        economy.resetForNextLevel();
        
        // Reset du jeu pour le nouveau niveau
        if (game) {
            game.resetForNextLevel();
            game.start();
        }
        
        const levelName = levelManager.getCurrentLevelName();
        this.showMessage(`Bienvenue au ${levelName} !`, 'info', 2000);
        this.updateLevelDisplay(levelManager.getCurrentLevel());
    }
    
    restartGame() {
        console.log('Redémarrage complet du jeu...');
        this.hideGameOverScreen();
        
        // Reset complet: retour au niveau 1
        levelManager.reset();
        economy.reset();
        
        // Recréer le jeu complètement
        if (game) {
            game = new Game(document.getElementById('game-canvas'));
            game.start();
        }
        
        this.showMessage('Nouveau jeu démarré !', 'info', 2000);
        this.updateLevelDisplay(levelManager.getCurrentLevel());
    }

    quitGame() {
        console.log('Fermeture du jeu...');
        this.hideGameOverScreen();
        
        // Arrêter le jeu
        if (game) {
            game.stop();
        }
        
        // Afficher un message de sortie
        this.showMessage('Merci d\'avoir joué à Battle Cats 2D !', 'success', 4000);
        
        // Optionnel: redirection ou fermeture
        setTimeout(() => {
            if (confirm('Voulez-vous vraiment quitter le jeu ?')) {
                window.close(); // Ferme l'onglet si possible
            }
        }, 2000);
    }
    
    hideGameOverScreen() {
        const gameOverScreen = document.getElementById('game-over-screen');
        if (gameOverScreen) {
            gameOverScreen.classList.remove('show');
            setTimeout(() => {
                gameOverScreen.remove();
            }, 300);
        }
    }

    // Système de cooldown de déploiement
    startUnitCooldown(unitType, cooldownTime) {
        this.unitCooldowns[unitType] = Date.now() + cooldownTime;
        this.updateUnitButtonStates();
    }
    
    isUnitOnCooldown(unitType) {
        return this.unitCooldowns[unitType] && Date.now() < this.unitCooldowns[unitType];
    }
    
    getRemainingCooldown(unitType) {
        if (!this.isUnitOnCooldown(unitType)) return 0;
        return this.unitCooldowns[unitType] - Date.now();
    }
    
    updateUnitButtonStates() {
        this.elements.unitButtons.forEach(button => {
            const unitType = button.dataset.unit;
            const unitCost = parseInt(button.dataset.cost);
            const isOnCooldown = this.isUnitOnCooldown(unitType);
            const canAfford = economy.canAfford(unitCost);
            
            if (isOnCooldown) {
                // Priorité au cooldown
                button.classList.add('on-cooldown');
                button.classList.remove('too-expensive');
                button.disabled = true;
                
                // Afficher le temps restant
                const remainingTime = Math.ceil(this.getRemainingCooldown(unitType) / 1000);
                const costElement = button.querySelector('.unit-cost');
                if (costElement) {
                    costElement.textContent = `${remainingTime}s`;
                }
            } else if (!canAfford) {
                // Pas assez d'argent
                button.classList.remove('on-cooldown');
                button.classList.add('too-expensive');
                button.disabled = true;
                
                // Remettre le coût mais garder l'indication
                const costElement = button.querySelector('.unit-cost');
                if (costElement) {
                    costElement.textContent = `${unitCost} gold`;
                }
            } else {
                // Tout va bien
                button.classList.remove('on-cooldown');
                button.classList.remove('too-expensive');
                button.disabled = false;
                
                // Remettre le coût normal
                const costElement = button.querySelector('.unit-cost');
                if (costElement) {
                    costElement.textContent = `${unitCost} gold`;
                }
            }
        });
    }

    // Mise à jour de l'affichage du niveau
    updateLevelDisplay(level) {
        if (this.elements.currentLevel) {
            const levelName = levelManager.getCurrentLevelName();
            this.elements.currentLevel.textContent = levelName;
        }
        
        this.updateLevelProgress();
    }
    
    updateLevelProgress() {
        if (this.elements.levelProgress) {
            // Objectif simple et clair pour tous les niveaux
            this.elements.levelProgress.textContent = "Détruisez la tour ennemie !";
        }
    }
}

// Callback pour mettre à jour le progrès du niveau
setInterval(() => {
    if (ui && ui.updateLevelProgress) {
        ui.updateLevelProgress();
    }
}, 500); // Mise à jour toutes les 500ms

// Instance globale de l'interface
const ui = new UI();

// Démarrer la mise à jour des cooldowns
setInterval(() => {
    ui.updateUnitButtonStates();
}, 100); // Mise à jour toutes les 100ms
