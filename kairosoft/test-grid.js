/**
 * KAIRO-01 Validation Tests
 * Run with: node test-grid.js
 */

// Mock DOM for Node.js testing
const mockElement = () => ({
    style: {},
    className: '',
    dataset: {},
    textContent: '',
    addEventListener: () => {},
    appendChild: () => {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 })
});

global.document = {
    createElement: mockElement,
    addEventListener: () => {}
};
global.calculateDepth = (x, y) => x + y;

// Load and execute the grid engine
const fs = require('fs');
const gridCode = fs.readFileSync('./isometric-grid.js', 'utf8');

// Execute in this context
const vm = require('vm');
const context = vm.createContext({
    document: global.document,
    calculateDepth: global.calculateDepth,
    console,
    module: { exports: {} }
});
vm.runInContext(gridCode, context);

// Get the IsometricGrid class
const IsometricGrid = context.IsometricGrid || context.module.exports.IsometricGrid;

if (!IsometricGrid) {
    console.error('❌ Failed to load IsometricGrid class');
    process.exit(1);
}

console.log('🎮 KAIRO-01: Isometric Grid System Tests\n');
console.log('=' .repeat(50));

// Test 1: Grid instantiation
console.log('\n✅ Test 1: Grid Instantiation');
const mockContainer = mockElement();
mockContainer.dispatchEvent = () => {};

const grid = new IsometricGrid({
    container: mockContainer,
    gridSize: 20,
    tileWidth: 64,
    tileHeight: 32
});

console.log(`   Grid Size: ${grid.gridSize}×${grid.gridSize}`);
console.log(`   Total Tiles: ${grid.tiles.size}`);
console.log(`   Expected: 400`);
if (grid.tiles.size !== 400) {
    console.log('   ❌ Should have 400 tiles');
    process.exit(1);
}

// Test 2: Projection Angles
console.log('\n✅ Test 2: Projection Angles');
console.log(`   rotateX: ${grid.rotateX}°`);
console.log(`   rotateZ: ${grid.rotateZ}°`);
if (grid.rotateX !== 60 || grid.rotateZ !== -45) {
    console.log('   ❌ Projection angles incorrect');
    process.exit(1);
}

// Test 3: Grid to World Conversion
console.log('\n✅ Test 3: Grid to World Conversion');
const testCases = [
    { x: 0, y: 0, expected: { x: 0, y: 0 } },
    { x: 1, y: 0, expected: { x: 32, y: 16 } },
    { x: 0, y: 1, expected: { x: -32, y: 16 } },
    { x: 1, y: 1, expected: { x: 0, y: 32 } }
];

let allPass = true;
testCases.forEach(tc => {
    const result = grid.gridToWorld(tc.x, tc.y);
    const pass = Math.abs(result.x - tc.expected.x) < 0.1 && 
                 Math.abs(result.y - tc.expected.y) < 0.1;
    console.log(`   [${tc.x},${tc.y}] → (${result.x}, ${result.y}) ${pass ? '✓' : '❌'}`);
    if (!pass) allPass = false;
});

if (!allPass) process.exit(1);

// Test 4: Z-Index Depth Calculation
console.log('\n✅ Test 4: Z-Index Depth Calculation');
const depths = [
    { x: 0, y: 0, depth: 0 },
    { x: 19, y: 0, depth: 19 },
    { x: 0, y: 19, depth: 19 },
    { x: 19, y: 19, depth: 38 }
];

depths.forEach(d => {
    const calc = grid.calculateDepth(d.x, d.y);
    const pass = calc === d.depth;
    console.log(`   [${d.x},${d.y}] depth=${calc} ${pass ? '✓' : '❌'}`);
    if (!pass) allPass = false;
});

if (!allPass) process.exit(1);

// Test 5: Tile Storage
console.log('\n✅ Test 5: Tile Storage');
const tile = grid.getTile(5, 5);
console.log(`   Get tile [5,5]: ${tile ? 'Found ✓' : 'Missing ❌'}`);
if (!tile || tile.x !== 5 || tile.y !== 5) {
    console.log('   ❌ Tile should have correct coordinates');
    process.exit(1);
}

// Test 6: Tile Data
console.log('\n✅ Test 6: Tile Data Management');
grid.setTileData(5, 5, { type: 'grass', height: 2 });
const tileWithData = grid.getTile(5, 5);
console.log(`   Set data: { type: 'grass', height: 2 }`);
console.log(`   Retrieved: ${JSON.stringify(tileWithData.data)}`);
if (!tileWithData.data || tileWithData.data.type !== 'grass') {
    console.log('   ❌ Data should be stored');
    process.exit(1);
}

console.log('\n' + '='.repeat(50));
console.log('✅ All tests passed!');
console.log('\n📦 KAIRO-01 Ready for KAIRO-02 (Floor Tiles)');
