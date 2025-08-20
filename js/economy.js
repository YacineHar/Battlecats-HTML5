// Battle Cats 2D - Système d'économie

class Economy {
    constructor() {
        this.money = 50;            // Argent de départ
        this.maxMoney = 100;        // Limite d'argent de départ
        this.moneyLevel = 1;        // Niveau de limite d'argent (1-8)
        this.baseMoneyPerSecond = 10; // Génération de base
        this.moneyPerSecond = 10;   // Génération d'argent passive actuelle
        
        this.energy = 100;          // Énergie de départ
        this.maxEnergy = 100;       // Énergie maximum
        this.energyPerSecond = 5;   // Régénération d'énergie
        
        // Événements de mise à jour
        this.onMoneyChange = null;
        this.onEnergyChange = null;
        this.onMoneyLevelChange = null;
        
        // Timer pour la génération passive
        this.passiveTimer = 0;
        this.passiveInterval = 1000; // 1 seconde
    }
    
    update(deltaTime) {
        this.passiveTimer += deltaTime;
        
        if (this.passiveTimer >= this.passiveInterval) {
            // Génération passive d'argent
            this.addMoney(this.moneyPerSecond);
            
            // Régénération d'énergie
            this.addEnergy(this.energyPerSecond);
            
            this.passiveTimer = 0;
        }
    }
    
    // Gestion de l'argent
    addMoney(amount) {
        this.money = Math.min(this.money + amount, this.maxMoney);
        this.notifyMoneyChange();
    }
    
    spendMoney(amount) {
        if (this.canAfford(amount)) {
            this.money -= amount;
            this.notifyMoneyChange();
            return true;
        }
        return false;
    }
    
    canAfford(amount) {
        return this.money >= amount;
    }
    
    getMoney() {
        return this.money;
    }
    
    getMaxMoney() {
        return this.maxMoney;
    }
    
    getMoneyLevel() {
        return this.moneyLevel;
    }
    
    // Système de niveau d'argent
    getUpgradeCost() {
        if (this.moneyLevel >= 8) return null; // Niveau max atteint
        return this.moneyLevel * 40; // 40, 80, 120, 160, 200, 240, 280
    }
    
    canUpgradeMoneyLevel() {
        const cost = this.getUpgradeCost();
        return cost !== null && this.money >= cost;
    }
    
    upgradeMoneyLevel() {
        const cost = this.getUpgradeCost();
        if (!cost || !this.canUpgradeMoneyLevel()) {
            return false;
        }
        
        // Payer le coût
        this.money -= cost;
        
        // Augmenter le niveau
        this.moneyLevel++;
        
        // Recalculer la limite et la vitesse de production
        this.updateMoneyStats();
        
        this.notifyMoneyChange();
        this.notifyMoneyLevelChange();
        
        return true;
    }
    
    updateMoneyStats() {
        // Nouvelle limite: 100 + (niveau-1) * bonus
        const bonusPerLevel = 50;
        this.maxMoney = 100 + (this.moneyLevel - 1) * bonusPerLevel;
        
        // Nouvelle vitesse: base + 5% par niveau supplémentaire
        const speedBonus = (this.moneyLevel - 1) * 0.05;
        this.moneyPerSecond = Math.round(this.baseMoneyPerSecond * (1 + speedBonus));
    }
    
    // Gestion de l'énergie
    addEnergy(amount) {
        this.energy = Math.min(this.energy + amount, this.maxEnergy);
        this.notifyEnergyChange();
    }
    
    spendEnergy(amount) {
        if (this.hasEnergy(amount)) {
            this.energy -= amount;
            this.notifyEnergyChange();
            return true;
        }
        return false;
    }
    
    hasEnergy(amount) {
        return this.energy >= amount;
    }
    
    getEnergy() {
        return this.energy;
    }
    
    getMaxEnergy() {
        return this.maxEnergy;
    }
    
    // Événements
    notifyMoneyChange() {
        if (this.onMoneyChange) {
            this.onMoneyChange(this.money);
        }
    }
    
    notifyEnergyChange() {
        if (this.onEnergyChange) {
            this.onEnergyChange(this.energy, this.maxEnergy);
        }
    }
    
    notifyMoneyLevelChange() {
        if (this.onMoneyLevelChange) {
            this.onMoneyLevelChange(this.moneyLevel, this.getUpgradeCost());
        }
    }
    
    // Configuration des callbacks
    setMoneyChangeCallback(callback) {
        this.onMoneyChange = callback;
    }
    
    setEnergyChangeCallback(callback) {
        this.onEnergyChange = callback;
    }
    
    setMoneyLevelChangeCallback(callback) {
        this.onMoneyLevelChange = callback;
    }
    
    // Méthodes utilitaires
    reset() {
        this.money = 50;
        this.maxMoney = 100;
        this.moneyLevel = 1;
        this.moneyPerSecond = this.baseMoneyPerSecond;
        this.energy = 100;
        this.notifyMoneyChange();
        this.notifyEnergyChange();
        this.notifyMoneyLevelChange();
    }
    
    // Améliorer la génération passive
    upgradeMoneyGeneration(cost, increase) {
        if (this.spendMoney(cost)) {
            this.moneyPerSecond += increase;
            return true;
        }
        return false;
    }
    
    upgradeEnergyCapacity(cost, increase) {
        if (this.spendMoney(cost)) {
            this.maxEnergy += increase;
            this.addEnergy(increase); // Bonus immédiat
            return true;
        }
        return false;
    }
    
    // Formater l'affichage des nombres
    formatMoney() {
        if (this.money >= 1000000) {
            return (this.money / 1000000).toFixed(1) + 'M';
        } else if (this.money >= 1000) {
            return (this.money / 1000).toFixed(1) + 'K';
        }
        return this.money.toString();
    }
    
    formatEnergy() {
        return `${this.energy}/${this.maxEnergy}`;
    }
    
    // Système de récompenses
    getKillReward(unitType) {
        const rewards = {
            basic: 10,
            tank: 15,
            attack: 12
        };
        return rewards[unitType] || 10;
    }
    
    getWaveCompleteReward(waveNumber) {
        return 50 + (waveNumber * 10);
    }
    
    // Sauvegarde et chargement (pour plus tard)
    save() {
        return {
            money: this.money,
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            moneyPerSecond: this.moneyPerSecond,
            energyPerSecond: this.energyPerSecond
        };
    }
    
    load(data) {
        if (data) {
            this.money = data.money || 1000;
            this.energy = data.energy || 100;
            this.maxEnergy = data.maxEnergy || 100;
            this.moneyPerSecond = data.moneyPerSecond || 10;
            this.energyPerSecond = data.energyPerSecond || 5;
            
            this.notifyMoneyChange();
            this.notifyEnergyChange();
        }
    }

    resetForNextLevel() {
        // Reset économie COMPLÈTEMENT entre chaque niveau
        this.money = 50;
        this.maxMoney = 100;
        this.moneyLevel = 1;
        this.baseMoneyPerSecond = 10;
        this.moneyPerSecond = 10;
        this.energy = 100;
        this.maxEnergy = 100;
        this.energyPerSecond = 5;
        this.notifyMoneyChange();
        this.notifyEnergyChange();
        this.notifyMoneyLevelChange();
        console.log('Economy reset COMPLÈTEMENT pour nouveau niveau.');
    }
}

// Instance globale de l'économie
const economy = new Economy();
