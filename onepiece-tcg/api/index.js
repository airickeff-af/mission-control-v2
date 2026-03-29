// One Piece TCG Collector - Serverless API for Vercel
const express = require('express');
const cors = require('cors');
const path = require('path');
const Fuse = require('fuse.js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database (for Vercel serverless)
// In production, use a real database like PlanetScale, Supabase, or MongoDB
let cardsDB = [];
let pricesDB = [];
let priceHistoryDB = [];

// Initialize with sample data
function initDatabase() {
    cardsDB = [
        { id: 1, card_number: 'OP01-001', name_en: 'Roronoa Zoro', name_jp: 'ロロノア・ゾロ', set_code: 'OP01', set_name_en: 'Romance Dawn', set_name_jp: 'ROMANCE DAWN', rarity: 'SR', card_type: 'Character', color: 'Green', cost: 3, power: 5000, attribute: 'Slash', image_url: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-001.png' },
        { id: 2, card_number: 'OP01-002', name_en: 'Monkey D. Luffy', name_jp: 'モンキー・D・ルフィ', set_code: 'OP01', set_name_en: 'Romance Dawn', set_name_jp: 'ROMANCE DAWN', rarity: 'SEC', card_type: 'Character', color: 'Red', cost: 4, power: 6000, attribute: 'Strike', image_url: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-002.png' },
        { id: 3, card_number: 'OP01-003', name_en: 'Nami', name_jp: 'ナミ', set_code: 'OP01', set_name_en: 'Romance Dawn', set_name_jp: 'ROMANCE DAWN', rarity: 'R', card_type: 'Character', color: 'Blue', cost: 2, power: 3000, attribute: 'Wisdom', image_url: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-003.png' },
        { id: 4, card_number: 'OP01-004', name_en: 'Nico Robin', name_jp: 'ニコ・ロビン', set_code: 'OP01', set_name_en: 'Romance Dawn', set_name_jp: 'ROMANCE DAWN', rarity: 'SR', card_type: 'Character', color: 'Purple', cost: 3, power: 4000, attribute: 'Wisdom', image_url: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-004.png' },
        { id: 5, card_number: 'OP01-005', name_en: 'Sanji', name_jp: 'サンジ', set_code: 'OP01', set_name_en: 'Romance Dawn', set_name_jp: 'ROMANCE DAWN', rarity: 'SR', card_type: 'Character', color: 'Blue', cost: 3, power: 5000, attribute: 'Strike', image_url: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-005.png' },
        { id: 6, card_number: 'OP01-006', name_en: 'Tony Tony Chopper', name_jp: 'トニートニー・チョッパー', set_code: 'OP01', set_name_en: 'Romance Dawn', set_name_jp: 'ROMANCE DAWN', rarity: 'C', card_type: 'Character', color: 'Green', cost: 1, power: 2000, attribute: 'Wisdom', image_url: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-006.png' },
        { id: 7, card_number: 'OP01-007', name_en: 'Shanks', name_jp: 'シャンクス', set_code: 'OP01', set_name_en: 'Romance Dawn', set_name_jp: 'ROMANCE DAWN', rarity: 'SEC', card_type: 'Character', color: 'Red', cost: 5, power: 7000, attribute: 'Slash', image_url: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-007.png' },
        { id: 8, card_number: 'OP01-008', name_en: 'Trafalgar Law', name_jp: 'トラファルガー・ロー', set_code: 'OP01', set_name_en: 'Romance Dawn', set_name_jp: 'ROMANCE DAWN', rarity: 'SR', card_type: 'Character', color: 'Blue', cost: 4, power: 5000, attribute: 'Slash', image_url: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-008.png' },
        { id: 9, card_number: 'OP01-009', name_en: 'Eustass Kid', name_jp: 'ユースタス・キッド', set_code: 'OP01', set_name_en: 'Romance Dawn', set_name_jp: 'ROMANCE DAWN', rarity: 'SR', card_type: 'Character', color: 'Red', cost: 4, power: 6000, attribute: 'Special', image_url: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-009.png' },
        { id: 10, card_number: 'OP01-010', name_en: 'Gol D. Roger', name_jp: 'ゴール・D・ロジャー', set_code: 'OP01', set_name_en: 'Romance Dawn', set_name_jp: 'ROMANCE DAWN', rarity: 'SEC', card_type: 'Character', color: 'Red', cost: 6, power: 8000, attribute: 'Slash', image_url: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-010.png' },
        { id: 11, card_number: 'OP01-011', name_en: 'Silvers Rayleigh', name_jp: 'シルバーズ・レイリー', set_code: 'OP01', set_name_en: 'Romance Dawn', set_name_jp: 'ROMANCE DAWN', rarity: 'R', card_type: 'Character', color: 'Purple', cost: 3, power: 4000, attribute: 'Slash', image_url: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-011.png' },
        { id: 12, card_number: 'OP01-012', name_en: 'Buggy', name_jp: 'バギー', set_code: 'OP01', set_name_en: 'Romance Dawn', set_name_jp: 'ROMANCE DAWN', rarity: 'R', card_type: 'Character', color: 'Red', cost: 2, power: 3000, attribute: 'Slash', image_url: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-012.png' },
        { id: 13, card_number: 'OP01-013', name_en: 'Dracule Mihawk', name_jp: 'ジュラキュール・ミホーク', set_code: 'OP01', set_name_en: 'Romance Dawn', set_name_jp: 'ROMANCE DAWN', rarity: 'SR', card_type: 'Character', color: 'Green', cost: 5, power: 6000, attribute: 'Slash', image_url: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-013.png' },
        { id: 14, card_number: 'OP01-014', name_en: 'Edward Newgate', name_jp: 'エドワード・ニューゲート', set_code: 'OP01', set_name_en: 'Romance Dawn', set_name_jp: 'ROMANCE DAWN', rarity: 'SEC', card_type: 'Character', color: 'White', cost: 7, power: 10000, attribute: 'Strike', image_url: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-014.png' },
        { id: 15, card_number: 'OP01-015', name_en: 'Portgas D. Ace', name_jp: 'ポートガス・D・エース', set_code: 'OP01', set_name_en: 'Romance Dawn', set_name_jp: 'ROMANCE DAWN', rarity: 'SR', card_type: 'Character', color: 'Red', cost: 4, power: 5500, attribute: 'Special', image_url: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-015.png' },
        { id: 16, card_number: 'OP01-016', name_en: 'Marco', name_jp: 'マルコ', set_code: 'OP01', set_name_en: 'Romance Dawn', set_name_jp: 'ROMANCE DAWN', rarity: 'SR', card_type: 'Character', color: 'Blue', cost: 3, power: 4000, attribute: 'Special', image_url: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-016.png' },
        { id: 17, card_number: 'OP01-021', name_en: 'Boa Hancock', name_jp: 'ボア・ハンコック', set_code: 'OP01', set_name_name_en: 'Romance Dawn', set_name_jp: 'ROMANCE DAWN', rarity: 'SR', card_type: 'Character', color: 'Purple', cost: 4, power: 5000, attribute: 'Special', image_url: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-021.png' },
        { id: 18, card_number: 'OP01-030', name_en: 'Kozuki Oden', name_jp: '光月おでん', set_code: 'OP01', set_name_en: 'Romance Dawn', set_name_jp: 'ROMANCE DAWN', rarity: 'SR', card_type: 'Character', color: 'Red', cost: 5, power: 7000, attribute: 'Slash', image_url: 'https://en.onepiece-cardgame.com/images/cardlist/card/OP01-030.png' },
    ];
    
    // Generate mock prices
    cardsDB.forEach(card => {
        const grades = ['ungraded', 'psa9', 'psa10', 'bgs9', 'bgs9.5', 'bgs10'];
        grades.forEach(grade => {
            pricesDB.push({
                card_id: card.id,
                grade: grade,
                language: 'en',
                price: generateMockPrice(card.rarity, grade),
                currency: 'USD',
                source: 'tcgplayer',
                scraped_at: new Date().toISOString()
            });
            pricesDB.push({
                card_id: card.id,
                grade: grade,
                language: 'jp',
                price: generateMockPrice(card.rarity, grade) * 150, // JPY
                currency: 'JPY',
                source: 'yuyutei',
                scraped_at: new Date().toISOString()
            });
        });
    });
}

function generateMockPrice(rarity, grade) {
    const basePrices = { 'C': 0.50, 'U': 1.00, 'R': 3.00, 'SR': 15.00, 'SEC': 80.00, 'L': 150.00, 'SP': 25.00 };
    const gradeMultipliers = { 'ungraded': 1, 'psa9': 3, 'psa10': 10, 'bgs9': 3.5, 'bgs9.5': 8, 'bgs10': 15 };
    const base = basePrices[rarity] || 1.00;
    const multiplier = gradeMultipliers[grade] || 1;
    return parseFloat((base * multiplier * (0.9 + Math.random() * 0.2)).toFixed(2));
}

// Initialize on startup
initDatabase();

// Fuse.js options for fuzzy search
const fuseOptions = {
    keys: [
        { name: 'name_en', weight: 0.5 },
        { name: 'name_jp', weight: 0.3 },
        { name: 'card_number', weight: 0.2 }
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), cards: cardsDB.length });
});

// Search cards with fuzzy matching
app.get('/api/search', (req, res) => {
    try {
        const { q, limit = 10 } = req.query;
        
        if (!q || q.length < 2) {
            return res.json({ query: q, results: [], count: 0, suggestions: [] });
        }

        const fuse = new Fuse(cardsDB, fuseOptions);
        const searchResults = fuse.search(q, { limit: parseInt(limit) });
        
        const results = searchResults.map(result => {
            const card = result.item;
            const prices = getCardPrices(card.id);
            return { ...card, matchScore: result.score, prices };
        });

        const suggestions = generateSuggestions(q, cardsDB);

        res.json({ query: q, results, count: results.length, suggestions: results.length === 0 ? suggestions : [] });
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get card by ID
app.get('/api/cards/:id', (req, res) => {
    try {
        const card = cardsDB.find(c => c.id === parseInt(req.params.id));
        if (!card) return res.status(404).json({ error: 'Card not found' });
        
        const prices = getCardPrices(card.id);
        const priceHistory = getPriceHistory(card.id);
        
        res.json({ ...card, prices, priceHistory });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get card by card number
app.get('/api/cards/number/:number', (req, res) => {
    try {
        const card = cardsDB.find(c => c.card_number === req.params.number);
        if (!card) return res.status(404).json({ error: 'Card not found' });
        
        const prices = getCardPrices(card.id);
        const priceHistory = getPriceHistory(card.id);
        
        res.json({ ...card, prices, priceHistory });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all cards with pagination
app.get('/api/cards', (req, res) => {
    try {
        const { page = 1, limit = 50, set } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        let filtered = set ? cardsDB.filter(c => c.set_code === set) : cardsDB;
        const total = filtered.length;
        const cards = filtered.slice(offset, offset + parseInt(limit));
        
        res.json({
            cards,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get price history for graphing
app.get('/api/cards/:id/history', (req, res) => {
    try {
        const { grade = 'ungraded', language = 'en', days = 30 } = req.query;
        const history = priceHistoryDB.filter(h => 
            h.card_id === parseInt(req.params.id) &&
            h.grade === grade &&
            h.language === language
        );
        
        res.json({ cardId: req.params.id, grade, language, days, data: history });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get sets list
app.get('/api/sets', (req, res) => {
    try {
        const sets = [...new Set(cardsDB.map(c => c.set_code))].map(code => ({
            set_code: code,
            set_name_en: cardsDB.find(c => c.set_code === code)?.set_name_en,
            set_name_jp: cardsDB.find(c => c.set_code === code)?.set_name_jp,
            card_count: cardsDB.filter(c => c.set_code === code).length
        }));
        
        res.json({ sets });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Helper functions
function getCardPrices(cardId) {
    const grades = ['ungraded', 'psa9', 'psa10', 'bgs9', 'bgs9.5', 'bgs10'];
    const languages = ['en', 'jp'];
    const prices = {};
    
    for (const grade of grades) {
        prices[grade] = {};
        for (const lang of languages) {
            const price = pricesDB.find(p => 
                p.card_id === cardId && p.grade === grade && p.language === lang
            );
            prices[grade][lang] = price || null;
        }
    }
    return prices;
}

function getPriceHistory(cardId) {
    return priceHistoryDB.filter(h => h.card_id === cardId).slice(0, 100);
}

function generateSuggestions(query, allCards) {
    const suggestions = [];
    const queryLower = query.toLowerCase();
    
    for (const card of allCards) {
        const nameLower = card.name_en.toLowerCase();
        const distance = levenshteinDistance(queryLower, nameLower);
        
        if (distance <= 3 && distance > 0) {
            suggestions.push({
                name: card.name_en,
                cardNumber: card.card_number,
                setCode: card.set_code
            });
        }
        if (suggestions.length >= 5) break;
    }
    
    return suggestions;
}

function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
    for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                );
            }
        }
    }
    return matrix[str2.length][str1.length];
}

// For Vercel - export the app
module.exports = app;

// For local development
if (require.main === module) {
    const PORT = process.env.PORT || 3456;
    app.listen(PORT, () => {
        console.log(`🚀 One Piece TCG Collector API running on port ${PORT}`);
    });
}
