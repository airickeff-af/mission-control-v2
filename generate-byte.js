const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'assets', 'pets');
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

// BYTE THE CYBER-CORGI

function drawByteSleeping(ctx) {
    // Body (sleeping position)
    ctx.fillStyle = '#D2691E'; // Corgi brown
    ctx.beginPath();
    ctx.ellipse(32, 42, 20, 12, 0, 0, Math.PI*2);
    ctx.fill();
    
    // Head
    ctx.beginPath();
    ctx.arc(20, 36, 12, 0, Math.PI*2);
    ctx.fill();
    
    // White face
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(16, 38, 6, 0, Math.PI*2);
    ctx.fill();
    
    // Ears
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.ellipse(14, 28, 4, 7, -0.3, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(24, 28, 4, 7, 0.3, 0, Math.PI*2);
    ctx.fill();
    
    // USB tail
    ctx.fillStyle = '#666';
    ctx.fillRect(48, 40, 8, 4);
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(50, 41, 2, 2);
    
    // Closed eyes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(14, 36); ctx.lineTo(18, 36);
    ctx.stroke();
    
    // Zzz
    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('Z', 38, 28);
    ctx.font = 'bold 8px monospace';
    ctx.fillText('z', 44, 24);
}

function drawByteAwake(ctx) {
    // Body
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.ellipse(32, 42, 14, 10, 0, 0, Math.PI*2);
    ctx.fill();
    
    // Head
    ctx.beginPath();
    ctx.arc(32, 28, 12, 0, Math.PI*2);
    ctx.fill();
    
    // White face
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(32, 30, 7, 0, Math.PI*2);
    ctx.fill();
    
    // Ears (perky)
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.moveTo(24, 20); ctx.lineTo(20, 8); ctx.lineTo(28, 18);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(40, 20); ctx.lineTo(44, 8); ctx.lineTo(36, 18);
    ctx.fill();
    
    // USB tail (glowing)
    ctx.fillStyle = '#444';
    ctx.fillRect(44, 40, 10, 6);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(46, 42, 3, 2);
    
    // Eyes (open)
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(28, 28, 2, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(36, 28, 2, 0, Math.PI*2);
    ctx.fill();
    
    // Happy mouth
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(32, 32, 3, 0, Math.PI);
    ctx.stroke();
    
    // Tongue
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.ellipse(32, 35, 2, 3, 0, 0, Math.PI*2);
    ctx.fill();
}

function drawByteBegging(ctx) {
    // Sitting body
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.ellipse(32, 44, 12, 14, 0, 0, Math.PI*2);
    ctx.fill();
    
    // Head (tilted)
    ctx.save();
    ctx.translate(32, 26);
    ctx.rotate(-0.2);
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI*2);
    ctx.fill();
    
    // White face
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(0, 2, 7, 0, Math.PI*2);
    ctx.fill();
    
    // Puppy eyes
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(-3, -1, 3, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3, -1, 3, 0, Math.PI*2);
    ctx.fill();
    
    // Sparkles
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(-4, -2, 1, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(2, -2, 1, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
    
    // Paws up
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.ellipse(26, 38, 4, 6, -0.5, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(38, 38, 4, 6, 0.5, 0, Math.PI*2);
    ctx.fill();
}

function drawByteExcited(ctx) {
    // Body (jumping pose)
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.ellipse(32, 38, 12, 10, 0, 0, Math.PI*2);
    ctx.fill();
    
    // Head
    ctx.beginPath();
    ctx.arc(32, 24, 11, 0, Math.PI*2);
    ctx.fill();
    
    // Huge happy mouth
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(32, 28, 6, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.arc(32, 32, 3, 0, Math.PI*2);
    ctx.fill();
    
    // Excited eyes
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(27, 22, 2, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(37, 22, 2, 0, Math.PI*2);
    ctx.fill();
    
    // Ears flying back
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.ellipse(18, 20, 8, 4, -0.5, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(46, 20, 8, 4, 0.5, 0, Math.PI*2);
    ctx.fill();
    
    // USB tail wagging
    ctx.fillStyle = '#00d4ff';
    ctx.beginPath();
    ctx.moveTo(42, 38);
    ctx.lineTo(52, 32);
    ctx.lineTo(54, 40);
    ctx.fill();
}

function drawByteBed(ctx) {
    // Dog bed
    ctx.fillStyle = '#4169E1';
    ctx.beginPath();
    ctx.ellipse(32, 44, 28, 16, 0, 0, Math.PI*2);
    ctx.fill();
    
    // Cushion
    ctx.fillStyle = '#6495ED';
    ctx.beginPath();
    ctx.ellipse(32, 42, 22, 12, 0, 0, Math.PI*2);
    ctx.fill();
    
    // Byte logo
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BYTE', 32, 38);
    
    // Bone toy
    ctx.fillStyle = '#FFF';
    ctx.fillRect(46, 48, 12, 4);
    ctx.beginPath();
    ctx.arc(46, 48, 3, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(46, 52, 3, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(58, 48, 3, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(58, 52, 3, 0, Math.PI*2);
    ctx.fill();
}

// Generate all Byte sprites
console.log('🐕 Generating Byte the Cyber-Corgi...\n');

createSprite('byte_sleep', drawByteSleeping);
createSprite('byte_awake', drawByteAwake);
createSprite('byte_beg', drawByteBegging);
createSprite('byte_excited', drawByteExcited);
createSprite('byte_bed', drawByteBed);

console.log('\n✅ Byte sprites generated!');
console.log(`Output: ${OUTPUT_DIR}`);