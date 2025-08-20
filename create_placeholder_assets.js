
const fs = require('fs');
const { createCanvas } = require('canvas');

function createPlaceholderSprite(width, height, color, text) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Fond coloré
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    
    // Bordure
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);
    
    // Texte
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.min(width, height) / 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
    
    return canvas.toBuffer();
}

// Créer les sprites des chats
const catSprites = [
    { name: 'basic_idle', color: '#4CAF50', text: 'CAT' },
    { name: 'tank_idle', color: '#2196F3', text: 'TANK' },
    { name: 'attack_idle', color: '#FF5722', text: 'ATK' },
    { name: 'enemy_basic_idle', color: '#9C27B0', text: 'ECAT' }
];

catSprites.forEach(sprite => {
    const buffer = createPlaceholderSprite(64, 64, sprite.color, sprite.text);
    fs.writeFileSync(`assets/cats/${sprite.name}.png`, buffer);
    console.log(`✅ Créé: assets/cats/${sprite.name}.png`);
});

// Créer les sprites des tours
const towerSprites = [
    { name: 'ally_tower', color: '#4CAF50', text: 'BASE' },
    { name: 'enemy_tower', color: '#F44336', text: 'EVIL' }
];

towerSprites.forEach(sprite => {
    const buffer = createPlaceholderSprite(80, 120, sprite.color, sprite.text);
    fs.writeFileSync(`assets/towers/${sprite.name}.png`, buffer);
    console.log(`✅ Créé: assets/towers/${sprite.name}.png`);
});

// Créer le fond de bataille
const backgroundBuffer = createPlaceholderSprite(1200, 600, '#87CEEB', 'BATTLEFIELD');
fs.writeFileSync('assets/backgrounds/battlefield.png', backgroundBuffer);
console.log('✅ Créé: assets/backgrounds/battlefield.png');

// Créer les effets
const effectSprites = [
    { name: 'explosion', color: '#FF6B35', text: '💥' },
    { name: 'coin', color: '#FFD700', text: '💰' }
];

effectSprites.forEach(sprite => {
    const buffer = createPlaceholderSprite(48, 48, sprite.color, sprite.text);
    fs.writeFileSync(`assets/effects/${sprite.name}.png`, buffer);
    console.log(`✅ Créé: assets/effects/${sprite.name}.png`);
});
