/**
 * KAIROSOFT Isometric Grid Engine
 * KAIRO-01: Isometric Grid System
 * 
 * Features:
 * - 20x20 tile grid
 * - rotateX 60°, rotateZ -45° projection
 * - Click-to-tile coordinate conversion
 * - Z-index layering for depth sorting
 */

class IsometricGrid {
    constructor(options = {}) {
        this.gridSize = options.gridSize || 20;
        this.tileWidth = options.tileWidth || 64;
        this.tileHeight = options.tileHeight || 32;
        this.container = options.container || document.body;
        
        // Isometric projection angles
        this.rotateX = options.rotateX || 60;
        this.rotateZ = options.rotateZ || -45;
        
        // Grid data
        this.tiles = new Map(); // key: "x,y", value: tileData
        this.tileElements = new Map();
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.generateGrid();
    }
    
    createScene() {
        // Create the isometric container
        this.scene = document.createElement('div');
        this.scene.className = 'isometric-scene';
        this.scene.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
            perspective: 2000px;
        `;
        
        // Create the world container with isometric transform
        this.world = document.createElement('div');
        this.world.className = 'isometric-world';
        this.world.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform-style: preserve-3d;
            transform: rotateX(${this.rotateX}deg) rotateZ(${this.rotateZ}deg);
        `;
        
        this.scene.appendChild(this.world);
        this.container.appendChild(this.scene);
        
        // Set up click handler for coordinate conversion
        this.scene.addEventListener('click', (e) => this.handleClick(e));
    }
    
    generateGrid() {
        // Generate tiles in order for proper z-indexing (back-to-front)
        // For isometric: render from furthest to closest
        // With rotateZ -45°, we need to think about the viewing angle
        
        const tiles = [];
        
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                tiles.push({ x, y });
            }
        }
        
        // Sort tiles by depth (back-to-front for proper layering)
        // With rotateX 60 and rotateZ -45, we need to calculate depth
        tiles.sort((a, b) => this.calculateDepth(a.x, a.y) - calculateDepth(b.x, b.y));
        
        // Create tile elements
        tiles.forEach(({ x, y }) => {
            this.createTile(x, y);
        });
    }
    
    createTile(x, y) {
        const tile = document.createElement('div');
        tile.className = 'isometric-tile';
        tile.dataset.x = x;
        tile.dataset.y = y;
        
        // Calculate position in world space
        const pos = this.gridToWorld(x, y);
        
        // Determine tile color based on position (for visual testing)
        const hue = ((x + y) * 15) % 360;
        const lightness = 40 + ((x * y) % 20);
        
        tile.style.cssText = `
            position: absolute;
            width: ${this.tileWidth}px;
            height: ${this.tileHeight}px;
            left: ${pos.x}px;
            top: ${pos.y}px;
            background: linear-gradient(135deg, hsl(${hue}, 60%, ${lightness}%), hsl(${hue}, 60%, ${lightness - 10}%));
            border: 1px solid rgba(255,255,255,0.2);
            box-sizing: border-box;
            cursor: pointer;
            transition: transform 0.1s, filter 0.1s;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: rgba(255,255,255,0.6);
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            user-select: none;
        `;
        
        tile.textContent = `${x},${y}`;
        
        // Hover effects
        tile.addEventListener('mouseenter', () => {
            tile.style.filter = 'brightness(1.2)';
            tile.style.transform = 'translateZ(10px)';
        });
        
        tile.addEventListener('mouseleave', () => {
            tile.style.filter = 'brightness(1)';
            tile.style.transform = 'translateZ(0)';
        });
        
        // Store tile
        const key = `${x},${y}`;
        this.tiles.set(key, { x, y, element: tile });
        this.tileElements.set(key, tile);
        
        this.world.appendChild(tile);
        
        return tile;
    }
    
    /**
     * Convert grid coordinates to world coordinates
     */
    gridToWorld(x, y) {
        // Isometric projection math
        // With rotateX 60° and rotateZ -45°
        const worldX = (x - y) * (this.tileWidth / 2);
        const worldY = (x + y) * (this.tileHeight / 2);
        
        return { x: worldX, y: worldY };
    }
    
    /**
     * Convert screen coordinates to grid coordinates
     * This is the reverse transformation
     */
    screenToGrid(screenX, screenY) {
        // Get the bounding rect of the world element
        const worldRect = this.world.getBoundingClientRect();
        
        // Calculate position relative to world center
        const relativeX = screenX - (worldRect.left + worldRect.width / 2);
        const relativeY = screenY - (worldRect.top + worldRect.height / 2);
        
        // Apply inverse rotation to get world coordinates
        // For rotateZ(-45°), the inverse is rotateZ(45°)
        // For rotateX(60°), we need to handle the perspective
        
        const radZ = (45 * Math.PI) / 180;
        const cosZ = Math.cos(radZ);
        const sinZ = Math.sin(radZ);
        
        // Inverse rotate Z
        const rotatedX = relativeX * cosZ - relativeY * sinZ;
        const rotatedY = relativeX * sinZ + relativeY * cosZ;
        
        // Adjust for the X rotation (simplified for isometric)
        const scaleFactor = 1 / Math.cos((60 * Math.PI) / 180);
        const adjustedY = rotatedY * scaleFactor;
        
        // Convert to grid coordinates
        const x = (rotatedX / (this.tileWidth / 2) + adjustedY / (this.tileHeight / 2)) / 2;
        const y = (adjustedY / (this.tileHeight / 2) - rotatedX / (this.tileWidth / 2)) / 2;
        
        return {
            x: Math.floor(x),
            y: Math.floor(y)
        };
    }
    
    /**
     * Handle click events and convert to grid coordinates
     */
    handleClick(e) {
        const gridPos = this.screenToGrid(e.clientX, e.clientY);
        
        // Check if within grid bounds
        if (gridPos.x >= 0 && gridPos.x < this.gridSize &&
            gridPos.y >= 0 && gridPos.y < this.gridSize) {
            
            this.onTileClick(gridPos.x, gridPos.y, e);
        }
    }
    
    /**
     * Override this method to handle tile clicks
     */
    onTileClick(x, y, event) {
        console.log(`Tile clicked: ${x}, ${y}`);
        
        // Dispatch custom event
        const tileEvent = new CustomEvent('tileclick', {
            detail: { x, y, event }
        });
        this.container.dispatchEvent(tileEvent);
        
        // Highlight clicked tile
        this.highlightTile(x, y);
    }
    
    /**
     * Highlight a specific tile
     */
    highlightTile(x, y) {
        // Remove previous highlight
        this.clearHighlight();
        
        const key = `${x},${y}`;
        const tile = this.tileElements.get(key);
        
        if (tile) {
            tile.style.boxShadow = '0 0 20px 5px rgba(255,255,0,0.8), inset 0 0 10px rgba(255,255,0,0.5)';
            tile.style.zIndex = '1000';
            this.highlightedTile = key;
        }
    }
    
    clearHighlight() {
        if (this.highlightedTile) {
            const tile = this.tileElements.get(this.highlightedTile);
            if (tile) {
                tile.style.boxShadow = '';
                tile.style.zIndex = '';
            }
            this.highlightedTile = null;
        }
    }
    
    /**
     * Get tile at specific grid coordinates
     */
    getTile(x, y) {
        return this.tiles.get(`${x},${y}`);
    }
    
    /**
     * Set tile data
     */
    setTileData(x, y, data) {
        const key = `${x},${y}`;
        const tile = this.tiles.get(key);
        if (tile) {
            tile.data = { ...tile.data, ...data };
        }
    }
    
    /**
     * Calculate depth for z-index sorting
     */
    calculateDepth(x, y) {
        // For isometric with our rotation, depth is x + y
        return x + y;
    }
}

// Helper function for sorting
function calculateDepth(x, y) {
    return x + y;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IsometricGrid };
}
