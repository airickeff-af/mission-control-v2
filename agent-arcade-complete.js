// Agent Arcade - Complete Game Suite
const games = {
    towerDefense: {
        name: "Agent Tower Defense",
        description: "Defend Mission Control from bugs and glitches!",
        status: "ready",
        highScore: 0
    },
    spaceShooter: {
        name: "Nexus Space Shooter",
        description: "Pilot Nexus through asteroid fields!",
        status: "ready", 
        highScore: 0
    },
    memoryMatch: {
        name: "Agent Memory Match",
        description: "Match agent cards to unlock abilities!",
        status: "ready",
        highScore: 0
    }
};

// Token system
let playerTokens = localStorage.getItem('arcadeTokens') || 100;
let unlockedItems = JSON.parse(localStorage.getItem('unlockedItems') || '[]');

// Arcade shop items
const shopItems = [
    { id: 'office_neon', name: 'Neon Office Theme', cost: 500, type: 'theme' },
    { id: 'agent_gold', name: 'Gold Agent Skin', cost: 1000, type: 'skin' },
    { id: 'desk_upgrade', name: 'Standing Desk', cost: 300, type: 'furniture' },
    { id: 'plant_rare', name: 'Rare Pixel Plant', cost: 200, type: 'decoration' }
];

// Game initialization
function initArcade() {
    updateTokenDisplay();
    loadHighScores();
    renderShop();
}

function updateTokenDisplay() {
    document.getElementById('tokenCount').textContent = `🪙 ${playerTokens}`;
}

function earnTokens(amount) {
    playerTokens += amount;
    localStorage.setItem('arcadeTokens', playerTokens);
    updateTokenDisplay();
    showNotification(`+${amount} tokens!`);
}

function spendTokens(amount) {
    if (playerTokens >= amount) {
        playerTokens -= amount;
        localStorage.setItem('arcadeTokens', playerTokens);
        updateTokenDisplay();
        return true;
    }
    showNotification('Not enough tokens!');
    return false;
}

function showNotification(msg) {
    const notif = document.createElement('div');
    notif.className = 'arcade-notification';
    notif.textContent = msg;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initArcade);
