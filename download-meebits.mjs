#!/usr/bin/env node
/**
 * Meebit Asset Downloader
 * Downloads sprite sheets and VRM files for all Mission Control agents
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

const AGENTS = [
  { id: 'nexus', meebitId: 1 },
  { id: 'glasses', meebitId: 42 },
  { id: 'quill', meebitId: 100 },
  { id: 'pixel', meebitId: 200 },
  { id: 'gary', meebitId: 300 },
  { id: 'larry', meebitId: 500 },
  { id: 'sentry', meebitId: 600 },
  { id: 'audit', meebitId: 700 },
  { id: 'cipher', meebitId: 800 },
  { id: 'limitless', meebitId: 1000 },
  { id: 'olivia', meebitId: 1500 }
];

const OUTPUT_DIR = './assets/meebits-downloaded';

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Status ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', reject);
  });
}

async function fetchMetadata(meebitId) {
  return new Promise((resolve, reject) => {
    https.get(`https://meebits.app/meebit/${meebitId}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function downloadAgentAssets(agent) {
  console.log(`\n📥 Downloading ${agent.id} (Meebit #${agent.meebitId})...`);
  
  try {
    // Fetch metadata
    const metadata = await fetchMetadata(agent.meebitId);
    console.log(`   Type: ${metadata.type}`);
    
    // Download sprite sheet
    if (metadata.sprite_sheet) {
      const spritePath = path.join(OUTPUT_DIR, `${agent.id}-sprite.png`);
      console.log(`   🎭 Sprite: ${metadata.sprite_sheet}`);
      await downloadFile(metadata.sprite_sheet, spritePath);
      console.log(`   ✅ Sprite saved: ${spritePath}`);
    }
    
    // Download full body image
    if (metadata.image) {
      const imagePath = path.join(OUTPUT_DIR, `${agent.id}-full.png`);
      console.log(`   🖼️  Full body: ${metadata.image}`);
      await downloadFile(metadata.image, imagePath);
      console.log(`   ✅ Full body saved: ${imagePath}`);
    }
    
    // Download VRM if available
    if (metadata.vrm) {
      const vrmPath = path.join(OUTPUT_DIR, `${agent.id}.vrm`);
      console.log(`   👤 VRM: ${metadata.vrm}`);
      await downloadFile(metadata.vrm, vrmPath);
      console.log(`   ✅ VRM saved: ${vrmPath}`);
    } else {
      console.log(`   ⚠️  No VRM available`);
    }
    
    // Save metadata
    const metaPath = path.join(OUTPUT_DIR, `${agent.id}-metadata.json`);
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
    console.log(`   💾 Metadata saved`);
    
    return { success: true, agent: agent.id };
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
    return { success: false, agent: agent.id, error: err.message };
  }
}

async function main() {
  console.log('🏢 Mission Control - Meebit Asset Downloader');
  console.log('==============================================');
  
  const results = [];
  for (const agent of AGENTS) {
    const result = await downloadAgentAssets(agent);
    results.push(result);
    // Small delay to be nice to the server
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n==============================================');
  console.log('📊 DOWNLOAD SUMMARY');
  console.log('==============================================');
  const success = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`✅ Success: ${success}/${AGENTS.length}`);
  console.log(`❌ Failed: ${failed}/${AGENTS.length}`);
  
  if (failed > 0) {
    console.log('\nFailed agents:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.agent}: ${r.error}`);
    });
  }
  
  console.log(`\n📁 Assets saved to: ${OUTPUT_DIR}/`);
}

main().catch(console.error);
