#!/usr/bin/env node
/**
 * Sprite Sheet Splitter
 * Splits Meebit sprite sheets into individual direction frames
 * Output: nexus-down-0.png, nexus-down-1.png, etc.
 */

import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

const AGENTS = [
  'nexus', 'glasses', 'quill', 'pixel', 'gary', 'larry',
  'sentry', 'audit', 'cipher', 'limitless', 'olivia'
];

const DIRECTIONS = ['down', 'up', 'left', 'right'];
const FRAMES_PER_ROW = 8;
const FRAME_SIZE = 128;

const INPUT_DIR = './assets/meebits-downloaded';
const OUTPUT_DIR = './assets/meebits-split';

async function splitSpriteSheet(agent) {
  const inputPath = path.join(INPUT_DIR, `${agent}-sprite.png`);
  const outputAgentDir = path.join(OUTPUT_DIR, agent);
  
  if (!fs.existsSync(inputPath)) {
    console.log(`❌ ${agent}: sprite sheet not found`);
    return false;
  }
  
  // Create output directory
  if (!fs.existsSync(outputAgentDir)) {
    fs.mkdirSync(outputAgentDir, { recursive: true });
  }
  
  try {
    const img = await loadImage(inputPath);
    
    // Process each direction (row)
    for (let dirIdx = 0; dirIdx < 4; dirIdx++) {
      const direction = DIRECTIONS[dirIdx];
      
      // Process each frame in the row
      for (let frameIdx = 0; frameIdx < FRAMES_PER_ROW; frameIdx++) {
        const canvas = createCanvas(FRAME_SIZE, FRAME_SIZE);
        const ctx = canvas.getContext('2d');
        
        // Source coordinates
        const sx = frameIdx * FRAME_SIZE;
        const sy = dirIdx * FRAME_SIZE;
        
        // Draw frame to canvas
        ctx.drawImage(
          img,
          sx, sy, FRAME_SIZE, FRAME_SIZE,
          0, 0, FRAME_SIZE, FRAME_SIZE
        );
        
        // Save frame
        const outputPath = path.join(outputAgentDir, `${direction}-${frameIdx}.png`);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);
      }
      
      console.log(`  ✓ ${agent}/${direction}: 8 frames`);
    }
    
    return true;
  } catch (err) {
    console.error(`❌ ${agent}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('🎭 Sprite Sheet Splitter');
  console.log('========================\n');
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  let success = 0;
  for (const agent of AGENTS) {
    process.stdout.write(`Splitting ${agent}... `);
    if (await splitSpriteSheet(agent)) {
      success++;
    }
  }
  
  console.log(`\n========================`);
  console.log(`✅ Split ${success}/${AGENTS.length} agents`);
  console.log(`📁 Output: ${OUTPUT_DIR}/`);
  console.log(`\nStructure:`);
  console.log(`  nexus/`);
  console.log(`    down-0.png, down-1.png, ... down-7.png`);
  console.log(`    up-0.png, up-1.png, ... up-7.png`);
  console.log(`    left-0.png, left-1.png, ... left-7.png`);
  console.log(`    right-0.png, right-1.png, ... right-7.png`);
}

main().catch(console.error);
