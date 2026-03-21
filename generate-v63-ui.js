const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'assets', 'furniture');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const SPRITE_SIZE = 64;

function createSprite(name, drawFn) {
    const canvas = createCanvas(SPRITE_SIZE, SPRITE_SIZE);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
    ctx.imageSmoothingEnabled = false;
    drawFn(ctx);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(OUTPUT_DIR, `${name}.png`), buffer);
    console.log(`✅ Generated: ${name}.png`);
}

// ENERGY BAR - For UI overlay
function drawEnergyBarFull(ctx) {
    ctx.fillStyle = '#333';
    ctx.fillRect(4, 20, 56, 24);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(6, 22, 52, 20);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('100%', 32, 36);
}

function drawEnergyBarMedium(ctx) {
    ctx.fillStyle = '#333';
    ctx.fillRect(4, 20, 56, 24);
    ctx.fillStyle = '#ff0';
    ctx.fillRect(6, 22, 26, 20);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('50%', 32, 36);
}

function drawEnergyBarLow(ctx) {
    ctx.fillStyle = '#333';
    ctx.fillRect(4, 20, 56, 24);
    ctx.fillStyle = '#f00';
    ctx.fillRect(6, 22, 10, 20);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('15%', 32, 36);
}

// FIRE EFFECT
function drawFireEffect(ctx) {
    // Transparent background
    ctx.clearRect(0, 0, 64, 64);
    
    // Fire flames
    const flames = ['#ff0000', '#ff4500', '#ffa500', '#ffff00'];
    flames.forEach((color, i) => {
        ctx.fillStyle = color;
        const height = 20 - i * 4;
        const width = 16 - i * 2;
        const x = 32 - width/2;
        const y = 50 - i * 8;
        ctx.beginPath();
        ctx.moveTo(x, 60);
        ctx.lineTo(x + width/2, y);
        ctx.lineTo(x + width, 60);
        ctx.fill();
    });
    
    // ON FIRE text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ON', 32, 14);
    ctx.fillText('FIRE!', 32, 24);
}

// ICE/TIRED EFFECT
function drawIceEffect(ctx) {
    ctx.clearRect(0, 0, 64, 64);
    
    // Ice crystals
    ctx.fillStyle = 'rgba(135, 206, 235, 0.8)';
    for (let i = 0; i < 5; i++) {
        const x = 16 + (i % 3) * 16;
        const y = 16 + Math.floor(i / 3) * 24;
        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x + 6, y);
        ctx.lineTo(x, y + 8);
        ctx.lineTo(x - 6, y);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.fillStyle = '#87CEEB';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TIRED', 32, 12);
}

// LEVEL UP BADGE
function drawLevelUpBadge(ctx) {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(32, 4);
    ctx.lineTo(38, 20);
    ctx.lineTo(56, 20);
    ctx.lineTo(42, 30);
    ctx.lineTo(48, 48);
    ctx.lineTo(32, 36);
    ctx.lineTo(16, 48);
    ctx.lineTo(22, 30);
    ctx.lineTo(8, 20);
    ctx.lineTo(26, 20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LVL', 32, 28);
    ctx.font = 'bold 12px monospace';
    ctx.fillText('UP!', 32, 40);
}

// NOTIFICATION ICONS
function drawNotificationTaskComplete(ctx) {
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(20, 32);
    ctx.lineTo(28, 42);
    ctx.lineTo(44, 22);
    ctx.stroke();
}

function drawNotificationBug(ctx) {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BUG!', 32, 38);
}

function drawNotificationCoffee(ctx) {
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('☕', 32, 26);
    ctx.font = '8px monospace';
    ctx.fillText('BREAK', 32, 42);
}

// WORKSTATION WITH COMPUTER
function drawWorkstation(ctx) {
    // Desk
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(8, 36, 48, 20);
    ctx.fillRect(12, 28, 4, 12);
    ctx.fillRect(48, 28, 4, 12);
    
    // Computer monitor
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(20, 16, 24, 16);
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(22, 18, 20, 12);
    
    // Code lines on screen
    ctx.fillStyle = '#0f0';
    ctx.fillRect(24, 20, 8, 2);
    ctx.fillRect(24, 24, 12, 2);
    ctx.fillRect(24, 28, 6, 2);
    
    // Stand
    ctx.fillStyle = '#333';
    ctx.fillRect(30, 32, 4, 4);
}

// COMMANDER DESK
function drawCommanderDesk(ctx) {
    // Large desk
    ctx.fillStyle = '#654321';
    ctx.fillRect(4, 32, 56, 24);
    
    // Fancy trim
    ctx.fillStyle = '#DAA520';
    ctx.fillRect(4, 32, 56, 4);
    
    // Computer
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(24, 12, 16, 20);
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(26, 14, 12, 14);
    
    // Commander chair
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(28, 40, 8, 16);
    ctx.fillRect(24, 36, 16, 8);
}

// GENERATE ALL UI SPRITES
console.log('🎨 Generating v6.3 UI Sprites...\n');

console.log('⚡ Energy Bars:');
createSprite('energy_full', drawEnergyBarFull);
createSprite('energy_medium', drawEnergyBarMedium);
createSprite('energy_low', drawEnergyBarLow);

console.log('🔥 Status Effects:');
createSprite('effect_fire', drawFireEffect);
createSprite('effect_ice', drawIceEffect);

console.log('⭐ Level Up:');
createSprite('level_up_badge', drawLevelUpBadge);

console.log('🔔 Notifications:');
createSprite('notif_task_complete', drawNotificationTaskComplete);
createSprite('notif_bug', drawNotificationBug);
createSprite('notif_coffee', drawNotificationCoffee);

console.log('🖥️ Furniture:');
createSprite('workstation', drawWorkstation);
createSprite('commander_desk_large', drawCommanderDesk);

console.log('\n✅ All v6.3 UI sprites generated!');
console.log(`Output: ${OUTPUT_DIR}`);