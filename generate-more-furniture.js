const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SPRITE_SIZE = 64;
const OUTPUT_DIR = path.join(__dirname, 'assets', 'furniture');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

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

// GYM EQUIPMENT

// Treadmill
function drawTreadmill(ctx) {
    // Base
    ctx.fillStyle = '#444';
    ctx.fillRect(8, 40, 48, 12);
    // Belt
    ctx.fillStyle = '#222';
    ctx.fillRect(10, 42, 44, 8);
    // Handrails
    ctx.fillStyle = '#666';
    ctx.fillRect(12, 20, 4, 20);
    ctx.fillRect(48, 20, 4, 20);
    // Console
    ctx.fillStyle = '#333';
    ctx.fillRect(10, 16, 44, 8);
    // Screen
    ctx.fillStyle = '#0f0';
    ctx.fillRect(20, 18, 24, 4);
}

// Dumbbells
function drawDumbbells(ctx) {
    // Left weight
    ctx.fillStyle = '#333';
    ctx.fillRect(8, 28, 8, 16);
    // Handle
    ctx.fillStyle = '#666';
    ctx.fillRect(16, 34, 12, 4);
    // Right weight
    ctx.fillStyle = '#333';
    ctx.fillRect(28, 28, 8, 16);
    // Second dumbbell
    ctx.fillStyle = '#333';
    ctx.fillRect(38, 30, 6, 12);
    ctx.fillStyle = '#666';
    ctx.fillRect(44, 35, 8, 3);
    ctx.fillStyle = '#333';
    ctx.fillRect(52, 30, 6, 12);
}

// Weight Bench
function drawWeightBench(ctx) {
    // Seat
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(12, 36, 40, 8);
    // Backrest
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(12, 24, 20, 12);
    // Frame
    ctx.fillStyle = '#666';
    ctx.fillRect(16, 44, 4, 12);
    ctx.fillRect(44, 44, 4, 12);
    // Barbell
    ctx.fillStyle = '#888';
    ctx.fillRect(4, 16, 56, 3);
    // Weights
    ctx.fillStyle = '#333';
    ctx.fillRect(4, 12, 6, 12);
    ctx.fillRect(54, 12, 6, 12);
}

// Yoga Mat
function drawYogaMat(ctx) {
    ctx.fillStyle = '#9370DB';
    ctx.fillRect(16, 20, 32, 40);
    ctx.strokeStyle = '#7B68EE';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 20, 32, 40);
    // Rolled edge
    ctx.fillStyle = '#8A2BE2';
    ctx.fillRect(14, 18, 36, 6);
}

// Water Cooler
function drawWaterCooler(ctx) {
    // Base
    ctx.fillStyle = '#666';
    ctx.fillRect(24, 44, 16, 12);
    // Bottle
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.ellipse(32, 28, 12, 18, 0, 0, Math.PI*2);
    ctx.fill();
    // Highlight
    ctx.fillStyle = '#B0E0E6';
    ctx.beginPath();
    ctx.ellipse(28, 24, 4, 8, 0, 0, Math.PI*2);
    ctx.fill();
    // Spigot
    ctx.fillStyle = '#333';
    ctx.fillRect(30, 42, 4, 4);
}

// MORE OFFICE FURNITURE

// Vending Machine
function drawVendingMachine(ctx) {
    // Body
    ctx.fillStyle = '#DC143C';
    ctx.fillRect(12, 8, 40, 48);
    // Glass front
    ctx.fillStyle = 'rgba(135,206,235,0.6)';
    ctx.fillRect(16, 12, 32, 32);
    // Drinks
    ['#FF0000', '#00FF00', '#0000FF', '#FFD700'].forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(18 + (i%2)*16, 16 + Math.floor(i/2)*14, 6, 10);
    });
    // Coin slot
    ctx.fillStyle = '#333';
    ctx.fillRect(26, 46, 12, 6);
}

// Coffee Machine
function drawCoffeeMachine(ctx) {
    // Body
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(16, 16, 32, 40);
    // Dispenser
    ctx.fillStyle = '#333';
    ctx.fillRect(22, 24, 20, 16);
    // Cup
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(32, 44, 6, 0, Math.PI*2);
    ctx.fill();
    // Coffee
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(32, 44, 4, 0, Math.PI*2);
    ctx.fill();
    // Steam
    ctx.strokeStyle = '#AAA';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(28, 12); ctx.lineTo(26, 8);
    ctx.moveTo(32, 10); ctx.lineTo(32, 6);
    ctx.moveTo(36, 12); ctx.lineTo(38, 8);
    ctx.stroke();
}

// Clock
function drawClock(ctx) {
    // Face
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(32, 32, 24, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();
    // Numbers
    ctx.fillStyle = '#333';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    [12,3,6,9].forEach((n,i) => {
        const angle = (i * 90 - 90) * Math.PI / 180;
        ctx.fillText(n, 32 + Math.cos(angle)*18, 36 + Math.sin(angle)*18);
    });
    // Hands
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(32, 32); ctx.lineTo(32, 20); // Hour
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(32, 32); ctx.lineTo(40, 32); // Minute
    ctx.stroke();
}

// Bookshelf
function drawBookshelf(ctx) {
    // Frame
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(8, 8, 48, 48);
    // Shelves
    ctx.fillStyle = '#654321';
    ctx.fillRect(12, 20, 40, 4);
    ctx.fillRect(12, 36, 40, 4);
    ctx.fillRect(12, 52, 40, 4);
    // Books
    const colors = ['#DC143C', '#4169E1', '#228B22', '#FFD700', '#FF6347'];
    colors.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(14 + i*7, 12, 5, 8);
    });
    colors.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(14 + i*7, 28, 5, 8);
    });
}

// TV/Screen
function drawTV(ctx) {
    // Frame
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(12, 16, 40, 32);
    // Screen
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(16, 20, 32, 24);
    // Stand
    ctx.fillStyle = '#333';
    ctx.fillRect(28, 48, 8, 8);
    ctx.fillRect(20, 52, 24, 4);
    // Glow
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(18, 22, 10, 8);
}

// Generate all sprites
console.log('🏢 Generating Additional Furniture Sprites...\n');

console.log('🦾 GYM EQUIPMENT:');
createSprite('treadmill', drawTreadmill);
createSprite('dumbbells', drawDumbbells);
createSprite('weight_bench', drawWeightBench);
createSprite('yoga_mat', drawYogaMat);
createSprite('water_cooler_gym', drawWaterCooler);

console.log('\n🏢 OFFICE FURNITURE:');
createSprite('vending_machine', drawVendingMachine);
createSprite('coffee_machine', drawCoffeeMachine);
createSprite('clock', drawClock);
createSprite('bookshelf', drawBookshelf);
createSprite('tv_screen', drawTV);

console.log('\n✅ All additional sprites generated!');
console.log(`Output: ${OUTPUT_DIR}`);