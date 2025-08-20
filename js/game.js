// Battle Cats 2D - Moteur de jeu principal

class Game {
    constructor(canvas) {
        // DESTRUCTION IMMÉDIATE de toute instance précédente si elle existe
        if (window.game && window.game !== this) {
            console.log('🧨 DESTRUCTION instance précédente détectée !');
            if (window.game.isRunning) {
                window.game.stop();
            }
            // Clear brutal de l'ancienne instance
            if (window.game.allyUnits) window.game.allyUnits.length = 0;
            if (window.game.enemyUnits) window.game.enemyUnits.length = 0;
            if (window.game.projectiles) window.game.projectiles.length = 0;
            if (window.game.effects) window.game.effects.length = 0;
        }
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Dimensions du jeu
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Variables de gameplay
        this.spawnLine = this.height * 0.8; // Ligne de sol où les unités apparaissent
        
        // Positions des tours (au sol)
        this.allyTowerX = this.width - 100;
        this.enemyTowerX = 100;
        
        // État du jeu
        this.towers = {
            ally: {
                x: this.allyTowerX,
                y: this.spawnLine, // Maintenant au sol
                health: 1000,
                maxHealth: 1000,
                width: 80,
                height: 120,
                isTower: true,
                hitbox: {
                    x: this.allyTowerX - 40,
                    y: this.spawnLine - 120,
                    width: 80,
                    height: 120
                }
            },
            enemy: {
                x: this.enemyTowerX,
                y: this.spawnLine, // Maintenant au sol
                health: levelManager.getEnemyTowerHealthForCurrentLevel(), // Valeur selon niveau
                maxHealth: levelManager.getEnemyTowerHealthForCurrentLevel(), // Valeur selon niveau
                width: 80,
                height: 120,
                isTower: true,
                hitbox: {
                    x: this.enemyTowerX - 40,
                    y: this.spawnLine - 120,
                    width: 80,
                    height: 120
                }
            }
        };
        
        // Collections d'entités
        this.allyUnits = [];
        this.enemyUnits = [];
        this.projectiles = [];
        this.effects = [];
        
        // Variables de gameplay
        this.enemySpawnTimer = 0;
        this.enemySpawnDelay = levelManager.getSpawnDelayForCurrentLevel(); // Délai selon niveau
        
        // DÉLAI INITIAL pour éviter spawn immédiat lors changement niveau
        this.initialSpawnDelay = 3000; // 3 secondes avant premier spawn
        this.hasInitialDelayPassed = false;
        
        // Système trigger Hippoe pour niveaux 4-5 uniquement
        this.hippoeTriggered = false;
        this.hippoeTriggerDamage = 500; // Spawn hippoe après 500 dégâts sur tour
        
        // Événements
        this.setupEventListeners();
        
        // Initialiser la tour ennemie pour le niveau actuel
        this.updateEnemyTowerForLevel();
    }

    setupEventListeners() {
        // Clic sur le canvas pour placer des unités
        this.canvas.addEventListener('click', (e) => {
            if (this.isRunning) {
                this.handleCanvasClick(e);
            }
        });
    }

    handleCanvasClick(e) {
        // Plus besoin de logique de placement manuel
        // Les unités sont maintenant créées directement depuis l'interface
        console.log('Clic sur le canvas - Les unités se créent via les boutons');
    }

    spawnAllyUnit(type, x, y) {
        // Position finale devant la tour alliée
        const spawnX = x; // Utiliser directement la position calculée dans l'UI
        const unit = unitSystem.createUnit(type, 'ally', spawnX, this.spawnLine);
        if (unit) {
            this.allyUnits.push(unit);
            
            // Effet visuel de spawn
            this.createEffect('spawn', spawnX, this.spawnLine);
            
            console.log(`Unité alliée créée: ${type} à (${spawnX}, ${this.spawnLine}) devant la tour`);
        }
    }

    spawnEnemyUnit() {
        const currentLevel = levelManager.getCurrentLevel();
        
        // NIVEAU 6 : Gestion spéciale Piggie + Doges
        if (currentLevel === 6) {
            const piggieExists = this.enemyUnits.some(unit => unit.type === 'boss_level6');
            
            if (!piggieExists) {
                // Spawner d'abord le Piggie boss
                const unit = unitSystem.createUnit('boss_level6', 'enemy', this.enemyTowerX + 50, this.spawnLine);
                if (unit) {
                    this.enemyUnits.push(unit);
                    console.log('PIGGIE BOSS spawné ! (Niveau 6)');
                }
                return;
            } else {
                // Piggie existe déjà, spawner des doges toutes les 6 secondes
                const unit = unitSystem.createUnit('doge', 'enemy', this.enemyTowerX + 50, this.spawnLine);
                if (unit) {
                    this.enemyUnits.push(unit);
                    console.log('Doge renforts spawné ! (Niveau 6)');
                }
                return;
            }
        }
        
        const enemyTypes = levelManager.getEnemyTypesForCurrentLevel();
        const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const unit = unitSystem.createUnit(randomType, 'enemy', this.enemyTowerX + 50, this.spawnLine);
        
        if (unit) {
            this.enemyUnits.push(unit);
            console.log(`Unité ennemie créée: ${randomType} (Niveau ${levelManager.getCurrentLevel()})`);
        }
    }
    
    spawnHippoeReinforcement() {
        const unit = unitSystem.createUnit('boss_level3', 'enemy', this.enemyTowerX + 50, this.spawnLine);
        
        if (unit) {
            this.enemyUnits.push(unit);
            this.createEffect('spawn', unit.x, unit.y - unit.height/2);
            console.log(`HIPPOE RENFORTS ! Tour ennemie à ${this.hippoeTriggerDamage}+ dégâts (Niveaux 4-5 uniquement)`);
            
            if (ui) {
                ui.showMessage('HIPPOE RENFORTS !', 'warning', 3000);
            }
        }
    }

    start() {
        this.isRunning = true;
        this.gameLoop();
        console.log('Battle Cats 2D démarré !');
    }

    stop() {
        this.isRunning = false;
        console.log('Battle Cats 2D arrêté !');
    }

    gameLoop(timestamp = 0) {
        if (!this.isRunning) return;
        
        this.deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(this.deltaTime);
        this.render();
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(deltaTime) {
        // Spawn automatique des ennemis avec délai initial
        this.enemySpawnTimer += deltaTime;
        
        // Vérifier le délai initial d'abord
        if (!this.hasInitialDelayPassed) {
            if (this.enemySpawnTimer >= this.initialSpawnDelay) {
                this.hasInitialDelayPassed = true;
                this.enemySpawnTimer = 0; // Reset timer pour commencer le cycle normal
                console.log('Délai initial écoulé, début du spawn des ennemis');
            }
        } else {
            // Spawn normal après le délai initial
            if (this.enemySpawnTimer >= this.enemySpawnDelay) {
                this.spawnEnemyUnit();
                this.enemySpawnTimer = 0;
            }
        }
        
        // Mise à jour des unités alliées
        this.allyUnits.forEach((unit, index) => {
            unit.update(deltaTime);
            if (unit.shouldBeRemoved) {
                this.allyUnits.splice(index, 1);
            }
        });
        
        // Mise à jour des unités ennemies
        this.enemyUnits.forEach((unit, index) => {
            unit.update(deltaTime);
            if (unit.shouldBeRemoved) {
                this.enemyUnits.splice(index, 1);
            }
        });
        
        // Mise à jour des projectiles
        this.projectiles.forEach((projectile, index) => {
            projectile.update(deltaTime);
            if (projectile.shouldBeRemoved) {
                this.projectiles.splice(index, 1);
            }
        });
        
        // Mise à jour des effets
        this.effects.forEach((effect, index) => {
            effect.update(deltaTime);
            if (effect.shouldBeRemoved) {
                this.effects.splice(index, 1);
            }
        });
        
        // Vérification des collisions
        this.checkCollisions();
        
        // Mise à jour de l'économie
        economy.update(deltaTime);
    }

    checkCollisions() {
        // Les unités gèrent maintenant leurs propres attaques
        // On vérifie juste la santé des tours pour la fin de partie
        
        // Mettre à jour les barres de vie des tours dans l'UI
        ui.updateTowerHealth('ally', Math.max(0, this.towers.ally.health), this.towers.ally.maxHealth);
        ui.updateTowerHealth('enemy', Math.max(0, this.towers.enemy.health), this.towers.enemy.maxHealth);
        
        // Vérifier trigger Hippoe pour niveaux 4-5 SEULEMENT (pas niveau 6)
        const currentLevel = levelManager.getCurrentLevel();
        if (!this.hippoeTriggered && currentLevel >= 4 && currentLevel <= 5) {
            const damageDealt = this.towers.enemy.maxHealth - this.towers.enemy.health;
            if (damageDealt >= this.hippoeTriggerDamage) {
                this.spawnHippoeReinforcement();
                this.hippoeTriggered = true;
            }
        }
        
        // Vérifier fin de partie
        if (this.towers.ally.health <= 0) {
            this.gameOver('defeat');
        } else if (this.towers.enemy.health <= 0) {
            // IMPORTANT: Débloquer le niveau suivant AVANT le game over
            levelManager.onEnemyTowerDestroyed();
            this.gameOver('victory');
        }
    }

    checkUnitTowerCollision(unit, tower) {
        return unit.x < tower.x + tower.width &&
               unit.x + unit.width > tower.x &&
               unit.y < tower.y + tower.height &&
               unit.y + unit.height > tower.y;
    }

    checkUnitCollision(unit1, unit2) {
        const distance = Math.sqrt(
            Math.pow(unit1.x - unit2.x, 2) + 
            Math.pow(unit1.y - unit2.y, 2)
        );
        return distance < (unit1.width + unit2.width) / 2;
    }

    createEffect(type, x, y) {
        let duration = 500;
        switch(type) {
            case 'attack': duration = 300; break;
            case 'spawn': duration = 600; break;
            case 'explosion': duration = 500; break;
            default: duration = 500;
        }
        
        const effect = {
            type: type,
            x: x,
            y: y,
            timer: 0,
            duration: duration,
            shouldBeRemoved: false,
            update: function(deltaTime) {
                this.timer += deltaTime;
                if (this.timer >= this.duration) {
                    this.shouldBeRemoved = true;
                }
            }
        };
        this.effects.push(effect);
    }

    render() {
        // Nettoyer le canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Dessiner le fond
        this.drawBackground();
        
        // Dessiner les tours
        this.drawTowers();
        
        // Dessiner les unités
        this.allyUnits.forEach(unit => unit.render(this.ctx));
        this.enemyUnits.forEach(unit => unit.render(this.ctx));
        
        // Dessiner les projectiles
        this.projectiles.forEach(projectile => projectile.render(this.ctx));
        
        // Dessiner les effets
        this.effects.forEach(effect => this.drawEffect(effect));
    }

                drawBackground() {
                // Choisir le background selon le niveau actuel
                const currentLevel = levelManager.getCurrentLevel();
                let backgroundKey = 'battlefield'; // Niveau 1 par défaut
                
                // Sélection dynamique des backgrounds pour tous les niveaux
                if (currentLevel >= 1 && currentLevel <= 6) {
                    backgroundKey = currentLevel === 1 ? 'battlefield' : `battlefield${currentLevel}`;
                }
        
        const backgroundSprite = assetManager.getAsset('backgrounds', backgroundKey);
        
        if (backgroundSprite) {
            // Dessiner le background en plein écran
            this.ctx.drawImage(backgroundSprite, 0, 0, this.width, this.height);
        } else {
            // Fallback: gradient de fond
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(0.5, '#90EE90');
            gradient.addColorStop(1, '#228B22');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // Ligne de sol
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.spawnLine);
        this.ctx.lineTo(this.width, this.spawnLine);
        this.ctx.stroke();
        
        // Ligne centrale pour séparer les zones
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2, 0);
        this.ctx.lineTo(this.width / 2, this.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawTowers() {
        // Tour alliée (droite) - dessiner au sol
        const allyTowerSprite = assetManager.getAsset('towers', 'ally_tower');
        if (allyTowerSprite) {
            this.ctx.drawImage(
                allyTowerSprite,
                this.towers.ally.hitbox.x,
                this.towers.ally.hitbox.y,
                this.towers.ally.width,
                this.towers.ally.height
            );
        } else {
            // Fallback
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fillRect(
                this.towers.ally.hitbox.x,
                this.towers.ally.hitbox.y,
                this.towers.ally.width,
                this.towers.ally.height
            );
        }
        
        // Tour ennemie (gauche) - dessiner au sol
        const enemyTowerSprite = assetManager.getAsset('towers', 'enemy_tower');
        if (enemyTowerSprite) {
            this.ctx.drawImage(
                enemyTowerSprite,
                this.towers.enemy.hitbox.x,
                this.towers.enemy.hitbox.y,
                this.towers.enemy.width,
                this.towers.enemy.height
            );
        } else {
            // Fallback
            this.ctx.fillStyle = '#F44336';
            this.ctx.fillRect(
                this.towers.enemy.hitbox.x,
                this.towers.enemy.hitbox.y,
                this.towers.enemy.width,
                this.towers.enemy.height
            );
        }
        
        // Debug: dessiner les hitboxes (optionnel)
        if (false) { // Changez en true pour voir les hitboxes
            this.ctx.strokeStyle = 'red';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                this.towers.ally.hitbox.x,
                this.towers.ally.hitbox.y,
                this.towers.ally.hitbox.width,
                this.towers.ally.hitbox.height
            );
            this.ctx.strokeRect(
                this.towers.enemy.hitbox.x,
                this.towers.enemy.hitbox.y,
                this.towers.enemy.hitbox.width,
                this.towers.enemy.hitbox.height
            );
        }
    }

    drawEffect(effect) {
        const progress = effect.timer / effect.duration;
        const alpha = 1 - progress;
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        
        if (effect.type === 'explosion') {
            const radius = 30 * (1 - progress);
            this.ctx.fillStyle = '#FF6B35';
            this.ctx.beginPath();
            this.ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (effect.type === 'attack') {
            // Effet d'attaque : étoile ou éclair
            const size = 15 * (1 - progress);
            this.ctx.fillStyle = '#FFD700';
            this.ctx.strokeStyle = '#FF4500';
            this.ctx.lineWidth = 2;
            
            // Dessiner une étoile d'attaque
            this.ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
                const x = effect.x + Math.cos(angle) * size;
                const y = effect.y + Math.sin(angle) * size;
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        } else if (effect.type === 'spawn') {
            // Effet de spawn : cercles concentriques
            const maxRadius = 40;
            const radius1 = maxRadius * progress;
            const radius2 = maxRadius * (progress - 0.3);
            const radius3 = maxRadius * (progress - 0.6);
            
            this.ctx.strokeStyle = '#4CAF50';
            this.ctx.lineWidth = 3;
            
            if (radius1 > 0) {
                this.ctx.beginPath();
                this.ctx.arc(effect.x, effect.y, radius1, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            if (radius2 > 0) {
                this.ctx.strokeStyle = '#8BC34A';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(effect.x, effect.y, radius2, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            if (radius3 > 0) {
                this.ctx.strokeStyle = '#CDDC39';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(effect.x, effect.y, radius3, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }

    drawDebugLines() {
        // Ligne centrale
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2, 0);
        this.ctx.lineTo(this.width / 2, this.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    gameOver(result) {
        this.stop();
        console.log(`Fin de partie: ${result}`);
        
        // Créer l'effet de fin de partie
        if (result === 'victory') {
            this.createEffect('explosion', this.towers.enemy.x, this.towers.enemy.y);
            ui.showGameOverScreen(true);
        } else {
            this.createEffect('explosion', this.towers.ally.x, this.towers.ally.y);
            ui.showGameOverScreen(false);
        }
    }
    
    // Mettre à jour la tour ennemie selon le niveau
    updateEnemyTowerForLevel() {
        const newHealth = levelManager.getEnemyTowerHealthForCurrentLevel();
        this.towers.enemy.health = newHealth;
        this.towers.enemy.maxHealth = newHealth;
        
        console.log(`Tour ennemie mise à jour: ${newHealth} PV (Niveau ${levelManager.getCurrentLevel()})`);
    }
    
    // Reset pour niveau suivant
    resetForNextLevel() {
        // Reset de la tour alliée
        this.towers.ally.health = this.towers.ally.maxHealth;
        
        // Mettre à jour la tour ennemie selon le nouveau niveau
        this.updateEnemyTowerForLevel();
        
        // Clear des unités
        this.allyUnits = [];
        this.enemyUnits = [];
        this.effects = [];
        
        // Reset des timers
        this.enemySpawnTimer = 0;
        this.enemySpawnDelay = levelManager.getSpawnDelayForCurrentLevel();
        
        console.log(`Prêt pour le ${levelManager.getCurrentLevelName()}`);
    }
    
    // Reset et redémarrage complet
    resetAndStart() {
        this.resetForNextLevel();
        this.start();
        console.log('Game fully reset and restarted.');
    }
}

// Instance globale du jeu
let game = null;
