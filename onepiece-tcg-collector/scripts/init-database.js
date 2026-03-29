const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/onepiece.db');
const SCHEMA_PATH = path.join(__dirname, '../data/schema.sql');

function initDatabase() {
    console.log('🗄️  Initializing One Piece TCG database...');
    
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const db = new Database(DB_PATH);
    
    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');
    
    // Execute schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schema);
    
    console.log('✅ Database initialized successfully!');
    console.log(`📁 Database location: ${DB_PATH}`);
    
    // Insert sample cards (OP01 set)
    insertSampleCards(db);
    
    db.close();
}

function insertSampleCards(db) {
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO cards 
        (card_number, name_en, name_jp, set_code, set_name_en, set_name_jp, rarity, card_type, color, cost, power, attribute)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const cards = [
        // OP01 - Romance Dawn
        ['OP01-001', 'Roronoa Zoro', 'ロロノア・ゾロ', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'SR', 'Character', 'Green', 3, 5000, 'Slash'],
        ['OP01-002', 'Monkey D. Luffy', 'モンキー・D・ルフィ', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'SEC', 'Character', 'Red', 4, 6000, 'Strike'],
        ['OP01-003', 'Nami', 'ナミ', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'R', 'Character', 'Blue', 2, 3000, 'Wisdom'],
        ['OP01-004', 'Nico Robin', 'ニコ・ロビン', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'SR', 'Character', 'Purple', 3, 4000, 'Wisdom'],
        ['OP01-005', 'Sanji', 'サンジ', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'SR', 'Character', 'Blue', 3, 5000, 'Strike'],
        ['OP01-006', 'Tony Tony Chopper', 'トニートニー・チョッパー', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'C', 'Character', 'Green', 1, 2000, 'Wisdom'],
        ['OP01-007', 'Shanks', 'シャンクス', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'SEC', 'Character', 'Red', 5, 7000, 'Slash'],
        ['OP01-008', 'Trafalgar Law', 'トラファルガー・ロー', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'SR', 'Character', 'Blue', 4, 5000, 'Slash'],
        ['OP01-009', 'Eustass Kid', 'ユースタス・キッド', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'SR', 'Character', 'Red', 4, 6000, 'Special'],
        ['OP01-010', 'Gol D. Roger', 'ゴール・D・ロジャー', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'SEC', 'Character', 'Red', 6, 8000, 'Slash'],
        ['OP01-011', 'Silvers Rayleigh', 'シルバーズ・レイリー', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'R', 'Character', 'Purple', 3, 4000, 'Slash'],
        ['OP01-012', 'Buggy', 'バギー', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'R', 'Character', 'Red', 2, 3000, 'Slash'],
        ['OP01-013', 'Dracule Mihawk', 'ジュラキュール・ミホーク', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'SR', 'Character', 'Green', 5, 6000, 'Slash'],
        ['OP01-014', 'Edward Newgate', 'エドワード・ニューゲート', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'SEC', 'Character', 'White', 7, 10000, 'Strike'],
        ['OP01-015', 'Portgas D. Ace', 'ポートガス・D・エース', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'SR', 'Character', 'Red', 4, 5500, 'Special'],
        ['OP01-016', 'Marco', 'マルコ', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'SR', 'Character', 'Blue', 3, 4000, 'Special'],
        ['OP01-017', 'Jozu', 'ジョズ', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'U', 'Character', 'Yellow', 3, 4000, 'Strike'],
        ['OP01-018', 'Vista', 'ビスタ', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'U', 'Character', 'Green', 3, 4000, 'Slash'],
        ['OP01-019', 'Izou', 'イゾウ', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'C', 'Character', 'Pink', 2, 3000, 'Ranged'],
        ['OP01-020', 'Kingdew', 'キングデュー', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'C', 'Character', 'Yellow', 2, 3000, 'Strike'],
        ['OP01-021', 'Boa Hancock', 'ボア・ハンコック', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'SR', 'Character', 'Purple', 4, 5000, 'Special'],
        ['OP01-022', 'Koby', 'コビー', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'C', 'Character', 'Blue', 1, 1000, 'Strike'],
        ['OP01-023', 'Helmeppo', 'ヘルメッポ', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'C', 'Character', 'Blue', 1, 1000, 'Slash'],
        ['OP01-024', 'Kuro', 'クロ', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'C', 'Character', 'Black', 2, 3000, 'Slash'],
        ['OP01-025', 'Krieg', 'クリーク', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'C', 'Character', 'Blue', 3, 4000, 'Ranged'],
        ['OP01-026', 'Arlong', 'アーロン', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'C', 'Character', 'Blue', 3, 4000, 'Slash'],
        ['OP01-027', 'Crocodile', 'クロコダイル', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'SR', 'Character', 'Blue', 4, 5000, 'Special'],
        ['OP01-028', 'Nico Olvia', 'ニコ・オルビア', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'C', 'Character', 'Purple', 2, 2000, 'Wisdom'],
        ['OP01-029', 'Nefertari Cobra', 'ネフェルタリ・コブラ', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'C', 'Character', 'Yellow', 1, 0, 'Wisdom'],
        ['OP01-030', 'Kozuki Oden', '光月おでん', 'OP01', 'Romance Dawn', 'ROMANCE DAWN', 'SR', 'Character', 'Red', 5, 7000, 'Slash'],
    ];
    
    const insertMany = db.transaction((cardsList) => {
        for (const card of cardsList) {
            stmt.run(card);
        }
    });
    
    insertMany(cards);
    console.log(`✅ Inserted ${cards.length} sample cards from OP01`);
}

if (require.main === module) {
    initDatabase();
}

module.exports = { initDatabase };
