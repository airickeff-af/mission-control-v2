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
    
    // Clear with transparent background
    ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
    
    // Disable anti-aliasing for pixel art
    ctx.imageSmoothingEnabled = false;
    
    drawFn(ctx);
    
    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(OUTPUT_DIR, `${name}.png`), buffer);
    console.log(`✅ Generated: ${name}.png`);
}

// Wood desk with computer
function drawDesk(ctx) {
    // Desktop (wood)
    ctx.fillStyle = '#8B6914';
    ctx.fillRect(8, 28, 48, 20);
    // Desktop top highlight
    ctx.fillStyle = '#C4A77D';
    ctx.fillRect(8, 28, 48, 4);
    // Desk legs
    ctx.fillStyle = '#5C4033';
    ctx.fillRect(12, 48, 8, 12);
    ctx.fillRect(44, 48, 8, 12);
    // Computer monitor
    ctx.fillStyle = '#333';
    ctx.fillRect(20, 12, 24, 16);
    // Screen
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(22, 14, 20, 12);
    // Screen glow
    ctx.fillStyle = '#B0E0E6';
    ctx.fillRect(22, 14, 20, 4);
    // Monitor stand
    ctx.fillStyle = '#555';
    ctx.fillRect(30, 28, 4, 4);
    // Keyboard
    ctx.fillStyle = '#444';
    ctx.fillRect(22, 32, 20, 4);
    // Papers
    ctx.fillStyle = '#FFF';
    ctx.fillRect(36, 30, 10, 6);
    ctx.strokeStyle = '#CCC';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(38, 32);
    ctx.lineTo(44, 32);
    ctx.stroke();
}

// Office chair front
function drawChairFront(ctx) {
    // Seat
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(20, 36, 24, 8);
    // Backrest
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(20, 16, 24, 20);
    // Backrest highlight
    ctx.fillStyle = '#5B7EBE';
    ctx.fillRect(22, 18, 20, 16);
    // Armrests
    ctx.fillStyle = '#2E5090';
    ctx.fillRect(16, 28, 4, 12);
    ctx.fillRect(44, 28, 4, 12);
    // Base
    ctx.fillStyle = '#555';
    ctx.fillRect(30, 44, 4, 8);
    // Wheels
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(28, 52, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(36, 52, 3, 0, Math.PI*2); ctx.fill();
}

// Office chair back
function drawChairBack(ctx) {
    // Backrest (from behind)
    ctx.fillStyle = '#2E5090';
    ctx.fillRect(20, 16, 24, 24);
    // Frame
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(18, 14, 28, 4);
    ctx.fillRect(18, 14, 4, 26);
    ctx.fillRect(42, 14, 4, 26);
    // Base
    ctx.fillStyle = '#555';
    ctx.fillRect(30, 42, 4, 10);
    // Wheels
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(28, 52, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(36, 52, 3, 0, Math.PI*2); ctx.fill();
}

// Office chair left
function drawChairLeft(ctx) {
    // Seat (side view)
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(24, 36, 20, 8);
    // Backrest (side)
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(36, 16, 8, 22);
    ctx.fillStyle = '#5B7EBE';
    ctx.fillRect(38, 18, 4, 18);
    // Base
    ctx.fillStyle = '#555';
    ctx.fillRect(32, 44, 4, 8);
    // Wheels
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(30, 52, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(38, 52, 3, 0, Math.PI*2); ctx.fill();
}

// Office chair right
function drawChairRight(ctx) {
    // Mirror of left
    ctx.save();
    ctx.translate(64, 0);
    ctx.scale(-1, 1);
    drawChairLeft(ctx);
    ctx.restore();
}

// Wood floor tile
function drawFloor(ctx) {
    // Base wood
    ctx.fillStyle = '#C4A77D';
    ctx.fillRect(0, 0, 64, 64);
    // Plank lines
    ctx.strokeStyle = '#A08060';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 16); ctx.lineTo(64, 16);
    ctx.moveTo(0, 32); ctx.lineTo(64, 32);
    ctx.moveTo(0, 48); ctx.lineTo(64, 48);
    ctx.stroke();
    // Wood grain detail
    ctx.strokeStyle = '#B89A6F';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(8 + i * 16, 4);
        ctx.lineTo(12 + i * 16, 12);
        ctx.moveTo(16 + i * 16, 20);
        ctx.lineTo(20 + i * 16, 28);
        ctx.stroke();
    }
}

// Meeting table
function drawMeetingTable(ctx) {
    // Table top (oval-ish)
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(32, 32, 28, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    // Table highlight
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(32, 28, 24, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    // Center
    ctx.fillStyle = '#CD853F';
    ctx.beginPath();
    ctx.ellipse(32, 26, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // Coffee cups
    ctx.fillStyle = '#FFF';
    ctx.beginPath(); ctx.arc(20, 30, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(44, 30, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#8B4513';
    ctx.beginPath(); ctx.arc(20, 30, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(44, 30, 2, 0, Math.PI*2); ctx.fill();
}

// Whiteboard
function drawWhiteboard(ctx) {
    // Frame
    ctx.fillStyle = '#555';
    ctx.fillRect(8, 12, 48, 40);
    // Board
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(12, 16, 40, 32);
    // Text "TASKS!"
    ctx.fillStyle = '#333';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TASKS!', 32, 30);
    ctx.font = '8px monospace';
    ctx.fillText('○ Code', 32, 40);
    ctx.fillText('○ Design', 32, 46);
    // Tray
    ctx.fillStyle = '#777';
    ctx.fillRect(12, 48, 40, 4);
    // Marker
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(16, 50, 8, 2);
}

// Potted plant
function drawPlant(ctx) {
    // Pot
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.moveTo(24, 48);
    ctx.lineTo(40, 48);
    ctx.lineTo(38, 56);
    ctx.lineTo(26, 56);
    ctx.closePath();
    ctx.fill();
    // Pot rim
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(22, 46, 20, 4);
    // Leaves
    ctx.fillStyle = '#228B22';
    // Leaf 1
    ctx.beginPath(); ctx.ellipse(28, 36, 6, 10, -0.3, 0, Math.PI*2); ctx.fill();
    // Leaf 2
    ctx.beginPath(); ctx.ellipse(36, 34, 6, 10, 0.3, 0, Math.PI*2); ctx.fill();
    // Leaf 3
    ctx.beginPath(); ctx.ellipse(32, 26, 5, 8, 0, 0, Math.PI*2); ctx.fill();
    // Leaf highlights
    ctx.fillStyle = '#32CD32';
    ctx.beginPath(); ctx.ellipse(28, 34, 3, 6, -0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(36, 32, 3, 6, 0.3, 0, Math.PI*2); ctx.fill();
}

// Commander desk (larger executive)
function drawCommanderDesk(ctx) {
    // Desktop (executive wood - darker)
    ctx.fillStyle = '#5C4033';
    ctx.fillRect(4, 24, 56, 24);
    // Desktop top highlight
    ctx.fillStyle = '#8B6914';
    ctx.fillRect(4, 24, 56, 6);
    // Desk legs (sturdy)
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(8, 48, 10, 14);
    ctx.fillRect(46, 48, 10, 14);
    // Large monitor
    ctx.fillStyle = '#222';
    ctx.fillRect(16, 8, 32, 18);
    // Screen (larger)
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(18, 10, 28, 14);
    // Screen glow
    ctx.fillStyle = '#B0E0E6';
    ctx.fillRect(18, 10, 28, 5);
    // Monitor stand (executive)
    ctx.fillStyle = '#444';
    ctx.fillRect(28, 26, 8, 4);
    // Keyboard
    ctx.fillStyle = '#333';
    ctx.fillRect(18, 30, 28, 5);
    // Executive phone
    ctx.fillStyle = '#222';
    ctx.fillRect(48, 28, 10, 6);
    // Papers (organized)
    ctx.fillStyle = '#FFF';
    ctx.fillRect(8, 30, 8, 5);
}

// Filing cabinet
function drawCabinet(ctx) {
    // Body
    ctx.fillStyle = '#708090';
    ctx.fillRect(20, 16, 24, 40);
    // Top drawer
    ctx.fillStyle = '#778899';
    ctx.fillRect(22, 18, 20, 16);
    // Bottom drawer
    ctx.fillRect(22, 36, 20, 18);
    // Handles
    ctx.fillStyle = '#333';
    ctx.fillRect(30, 24, 4, 3);
    ctx.fillRect(30, 44, 4, 3);
    // Label holders
    ctx.fillStyle = '#FFF';
    ctx.fillRect(26, 28, 12, 4);
    ctx.fillRect(26, 48, 12, 4);
}

// Water cooler
function drawWaterCooler(ctx) {
    // Base
    ctx.fillStyle = '#666';
    ctx.fillRect(24, 44, 16, 10);
    // Bottle
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.ellipse(32, 36, 10, 14, 0, 0, Math.PI*2);
    ctx.fill();
    // Bottle highlight
    ctx.fillStyle = '#B0E0E6';
    ctx.beginPath();
    ctx.ellipse(30, 34, 4, 8, 0, 0, Math.PI*2);
    ctx.fill();
    // Spigot
    ctx.fillStyle = '#333';
    ctx.fillRect(30, 42, 4, 4);
}

// Generate all sprites
console.log('🏢 Generating Kairosoft Furniture Sprites...\n');

createSprite('desk', drawDesk);
createSprite('chair_front', drawChairFront);
createSprite('chair_back', drawChairBack);
createSprite('chair_left', drawChairLeft);
createSprite('chair_right', drawChairRight);
createSprite('floor_wood', drawFloor);
createSprite('meeting_table', drawMeetingTable);
createSprite('whiteboard', drawWhiteboard);
createSprite('plant', drawPlant);
createSprite('commander_desk', drawCommanderDesk);
createSprite('cabinet', drawCabinet);
createSprite('water_cooler', drawWaterCooler);

console.log(`\n✅ All sprites saved to: ${OUTPUT_DIR}`);
console.log('\nGenerated sprites:');
const files = fs.readdirSync(OUTPUT_DIR);
files.forEach(f => console.log(`  - ${f}`));