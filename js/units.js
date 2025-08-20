// Battle Cats 2D - Système d'unités

class Unit {
    constructor(type, team, x, y) {
        this.type = type;
        this.team = team; // 'ally' ou 'enemy'
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        
        // Hitbox pour les collisions (réduite)
        this.hitbox = {
            width: 25,
            height: 25,
            offsetX: 0,
            offsetY: 0
        };
        
        // Propriétés par défaut
        this.health = 100;
        this.maxHealth = 100;
        this.damage = 10;
        this.speed = 50;
        this.attackRange = 45; // Distance d'attaque plus courte comme Battle Cats
        this.attackCooldown = 1000; // ms
        this.lastAttack = 0;
        
        // État
        this.shouldBeRemoved = false;
        this.targetX = team === 'ally' ? 0 : 1200; // Direction de mouvement
        this.isAttacking = false;
        this.isMoving = true;
        this.target = null; // Cible actuelle
        this.animationTimer = 0;
        
        // Charger les stats spécifiques
        this.loadStats();
    }
    
    loadStats() {
        const stats = unitSystem.getUnitStats(this.type);
        Object.assign(this, stats);
        
        // BUFF des ennemis de base à partir du niveau 4
        if (this.team === 'enemy' && this.type === 'doge' && levelManager.getCurrentLevel() >= 4) {
            const buffMultiplier = 1.2; // 20% plus fort
            this.health = Math.round(this.health * buffMultiplier);
            this.damage = Math.round(this.damage * buffMultiplier);
            console.log(`Doge buffé niveau ${levelManager.getCurrentLevel()}: ${this.health} PV, ${this.damage} dégâts`);
        }
        
        this.maxHealth = this.health;
        
        // Appliquer taille custom pour boss si définie
        if (stats.width) this.width = stats.width;
        if (stats.height) this.height = stats.height;
    }
    
    update(deltaTime) {
        this.animationTimer += deltaTime;
        
        // Trouver la cible la plus proche
        this.findTarget();
        
        // Décider de l'action : bouger ou attaquer
        if (this.target && this.isInAttackRange(this.target)) {
            this.isMoving = false;
            this.isAttacking = true;
            this.attack(deltaTime);
        } else {
            this.isMoving = true;
            this.isAttacking = false;
            this.move(deltaTime);
        }
        
        // Vérifier si l'unité doit être supprimée
        if (this.health <= 0) {
            this.shouldBeRemoved = true;
            this.onDeath();
        }
    }
    
    onDeath() {
        if (this.team === 'enemy') {
            // Récompenses selon le type d'ennemi
            if (this.type === 'doge') {
                economy.addMoney(15);
                console.log('+15 gold (Doge killed)');
            } else if (this.type === 'boss_level3') {
                economy.addMoney(70);
                console.log('+70 gold (Hippoe Boss killed!)');
            } else if (this.type === 'boss_level6') {
                economy.addMoney(150);
                console.log('+150 gold (Piggie Boss killed!)');
            } else {
                // Fallback pour autres ennemis
                economy.addMoney(5); 
            }
        }
    }
    
    findTarget() {
        // Obtenir la liste des ennemis depuis le jeu
        if (!game) return;
        
        const enemies = this.team === 'ally' ? game.enemyUnits : game.allyUnits;
        let closestTarget = null;
        let closestDistance = Infinity;
        
        // Chercher l'ennemi le plus proche dans la direction de mouvement
        enemies.forEach(enemy => {
            const direction = this.team === 'ally' ? -1 : 1;
            
            // Vérifier que l'ennemi est dans la bonne direction
            if ((this.team === 'ally' && enemy.x < this.x) || 
                (this.team === 'enemy' && enemy.x > this.x)) {
                
                const distance = Math.abs(this.x - enemy.x);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestTarget = enemy;
                }
            }
        });
        
        // Vérifier aussi les tours ennemies
        const enemyTower = this.team === 'ally' ? game.towers.enemy : game.towers.ally;
        const towerDistance = Math.abs(this.x - enemyTower.x);
        
        if (towerDistance < closestDistance && towerDistance <= 80) { // Les tours sont attaquables à 80px
            closestTarget = enemyTower;
            closestTarget.isTower = true; // Marquer comme tour pour le traitement spécial
        }
        
        this.target = closestTarget;
    }
    
    isInAttackRange(target) {
        if (!target) return false;
        
        const distance = Math.abs(this.x - target.x);
        return distance <= this.attackRange;
    }
    
    move(deltaTime) {
        if (!this.isMoving) return;
        
        const direction = this.team === 'ally' ? -1 : 1;
        this.x += direction * this.speed * (deltaTime / 1000);
        
        // Vérifier les limites
        if ((this.team === 'ally' && this.x <= 0) || 
            (this.team === 'enemy' && this.x >= 1200)) {
            this.shouldBeRemoved = true;
        }
    }
    
    attack(deltaTime) {
        if (!this.target) return;
        
        const currentTime = Date.now();
        if (currentTime - this.lastAttack >= this.attackCooldown) {
            // Effectuer l'attaque selon le type de cible
            if (this.target.isTower) {
                // Attaque sur une tour
                this.target.health -= this.damage;
                console.log(`${this.team} ${this.type} attaque la tour pour ${this.damage} dégâts! (${this.target.health}/${this.target.maxHealth})`);
                
                // Effet visuel sur la tour
                if (game) {
                    game.createEffect('attack', this.target.x, this.target.y - 60);
                }
            } else {
                // Attaque sur une unité
                this.target.takeDamage(this.damage);
                console.log(`${this.team} ${this.type} attaque une unité pour ${this.damage} dégâts!`);
                
                // Effet visuel sur l'unité
                if (game) {
                    game.createEffect('attack', this.x, this.y - 20);
                }
            }
            
            this.lastAttack = currentTime;
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
    }
    
    onDeath() {
        // Récompense pour avoir tué une unité ennemie
        if (this.team === 'enemy') {
            economy.addMoney(15); // Tuer un chien donne 15 gold
        }
    }
    
    render(ctx) {
        ctx.save();
        
        // Dessiner l'unité
        this.drawSprite(ctx);
        
        // Dessiner la barre de vie
        this.drawHealthBar(ctx);
        
        ctx.restore();
    }
    
    drawSprite(ctx) {
        // Obtenir le sprite approprié
        let spriteKey = this.type + '_idle';
        if (this.team === 'enemy') {
            spriteKey = 'enemy_' + spriteKey;
        }
        
        const sprite = assetManager.getAsset('cats', spriteKey);
        
        // Debug: afficher quelle clé sprite est utilisée
        if (!sprite) {
            console.log(`Sprite manquant pour ${this.type} (${this.team}): ${spriteKey}`);
        } else if (this.type.includes('boss')) {
            console.log(`Sprite boss chargé: ${this.type} (${this.team}) -> ${spriteKey}`);
        }
        
        // Animation d'attaque (changement de couleur)
        if (this.isAttacking) {
            ctx.filter = 'hue-rotate(20deg) brightness(1.2)';
        }
        
        if (sprite) {
            // Dessiner le sprite sans flip - les sprites sont déjà orientés correctement
            ctx.drawImage(sprite, this.x - this.width/2, this.y - this.height, this.width, this.height);
        } else {
            // Fallback si le sprite n'est pas disponible
            let color = this.team === 'ally' ? '#4CAF50' : '#F44336';
            if (this.isAttacking) {
                color = this.team === 'ally' ? '#FF5722' : '#9C27B0';
            }
            ctx.fillStyle = color;
            ctx.fillRect(this.x - this.width/2, this.y - this.height, this.width, this.height);
        }
        
        // Reset filter
        ctx.filter = 'none';
        
        // Debug: dessiner la hitbox (optionnel)
        if (false) { // Changez en true pour voir les hitboxes
            ctx.strokeStyle = this.team === 'ally' ? 'blue' : 'red';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                this.x - this.hitbox.width/2,
                this.y - this.hitbox.height,
                this.hitbox.width,
                this.hitbox.height
            );
        }
    }
    
    drawHealthBar(ctx) {
        if (this.health === this.maxHealth) return;
        
        const barWidth = this.width;
        const barHeight = 4;
        const barX = this.x - barWidth/2;
        const barY = this.y - this.height - 10;
        
        // Fond de la barre
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Barre de vie
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : 
                       healthPercent > 0.25 ? '#FF9800' : '#F44336';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }
}

class UnitSystem {
    constructor() {
        this.unitTypes = {
            basic: {
                name: 'Normal Cat',
                health: 250,
                damage: 20,
                speed: 60, // Speed 10 en gameplay
                cost: 50,
                attackRange: 80,
                attackCooldown: 1230, // 1.23 secondes
                deploymentCooldown: 2000, // 2 secondes entre déploiements
                description: 'Unité de base équilibrée'
            },
            tank: {
                name: 'Tank Cat',
                health: 1000,
                damage: 5,
                speed: 48, // Speed 8 en gameplay
                cost: 100,
                attackRange: 60,
                attackCooldown: 2230, // 2.23 secondes
                deploymentCooldown: 2000, // 2 secondes entre déploiements
                description: 'Très résistant mais attaque faiblement',
                // Taille augmentée de 10%
                width: 55,
                height: 55
            },
            attack: {
                name: 'Axe Cat',
                health: 500,
                damage: 62,
                speed: 72, // Speed 12 en gameplay
                cost: 150,
                attackRange: 120,
                attackCooldown: 900, // 0.90 secondes
                deploymentCooldown: 2000, // 2 secondes entre déploiements
                description: 'Attaque puissante et rapide',
                // Taille augmentée de 10%
                width: 55,
                height: 55
            },
            // Unités ennemies
            doge: {
                name: 'Doge',
                health: 90,
                damage: 8,
                speed: 30, // Speed 5 en gameplay
                cost: 0, // Les ennemis n'ont pas de coût
                attackRange: 80,
                attackCooldown: 1570, // 1.57 secondes
                deploymentCooldown: 0, // Pas de cooldown pour les ennemis
                description: 'Ennemi de base'
            },
                                // Boss Level 3 - Hippoe du Désert
                    boss_level3: {
                        name: 'Hippoe du Désert',
                        health: 800,
                        damage: 35,
                        speed: 18, // Plus lent mais plus fort
                        cost: 0,
                        attackRange: 110,
                        attackCooldown: 3500, // Attaque plus lente mais devastating
                        deploymentCooldown: 0,
                        description: 'Boss de niveau 3 - Hippoe du désert',
                        // Taille spéciale pour boss (plus grand)
                        width: 120,
                        height: 120
                    },
                    // Boss Level 6 (Final) - Piggie
                    boss_level6: {
                        name: 'Piggie Boss Final',
                        health: 2000, // Boss final plus résistant
                        damage: 85,   // Attaque dévastatrice
                        speed: 8,     // Plus lent mais implacable
                        cost: 0,
                        attackRange: 140,
                        attackCooldown: 5000, // 5 secondes entre attaques
                        deploymentCooldown: 0,
                        description: 'Boss final - Piggie Emperor',
                        // Taille spéciale pour boss final (encore plus grand)
                        width: 140,
                        height: 140
                    }
        };
    }
    
    getUnitStats(type) {
        return this.unitTypes[type] || this.unitTypes.basic;
    }
    
    createUnit(type, team, x, y) {
        if (!this.unitTypes[type]) {
            console.warn(`Type d'unité invalide: ${type}`);
            return null;
        }
        
        return new Unit(type, team, x, y);
    }
    
    getUnitInfo(type) {
        return this.unitTypes[type];
    }
    
    getAllUnitTypes() {
        return Object.keys(this.unitTypes);
    }
}

// Instance globale du système d'unités
const unitSystem = new UnitSystem();
