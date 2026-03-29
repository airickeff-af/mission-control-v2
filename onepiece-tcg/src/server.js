const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const Fuse = require('fuse.js');

const app = express();
const PORT = process.env.PORT || 3456;
const DB_PATH = path.join(__dirname, '../data/onepiece.db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Database connection
let db;
try {
    db = new Database(DB_PATH);
    console.log('✅ Connected to database');
} catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
}

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
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Search cards with fuzzy matching
app.get('/api/search', (req, res) => {
    try {
        const { q, limit = 10 } = req.query;
        
        if (!q || q.length < 2) {
            return res.json({ 
                query: q, 
                results: [], 
                count: 0,
                suggestions: []
            });
        }

        // Get all cards for fuzzy search
        const allCards = db.prepare('SELECT * FROM cards').all();
        
        const fuse = new Fuse(allCards, fuseOptions);
        const searchResults = fuse.search(q, { limit: parseInt(limit) });
        
        // Format results with prices
        const results = searchResults.map(result => {
            const card = result.item;
            const prices = getCardPrices(card.id);
            
            return {
                ...card,
                matchScore: result.score,
                prices
            };
        });

        // Generate AI-like suggestions for misspellings
        const suggestions = generateSuggestions(q, allCards);

        res.json({
            query: q,
            results,
            count: results.length,
            suggestions: results.length === 0 ? suggestions : []
        });
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get card by ID
app.get('/api/cards/:id', (req, res) => {
    try {
        const { id } = req.params;
        const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(id);
        
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        
        const prices = getCardPrices(id);
        const priceHistory = getPriceHistory(id);
        
        res.json({
            ...card,
            prices,
            priceHistory
        });
    } catch (err) {
        console.error('Get card error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get card by card number
app.get('/api/cards/number/:number', (req, res) => {
    try {
        const { number } = req.params;
        const card = db.prepare('SELECT * FROM cards WHERE card_number = ?').get(number);
        
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        
        const prices = getCardPrices(card.id);
        const priceHistory = getPriceHistory(card.id);
        
        res.json({
            ...card,
            prices,
            priceHistory
        });
    } catch (err) {
        console.error('Get card error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get all cards with pagination
app.get('/api/cards', (req, res) => {
    try {
        const { page = 1, limit = 50, set } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        let query = 'SELECT * FROM cards';
        let countQuery = 'SELECT COUNT(*) as count FROM cards';
        let params = [];
        
        if (set) {
            query += ' WHERE set_code = ?';
            countQuery += ' WHERE set_code = ?';
            params.push(set);
        }
        
        query += ' ORDER BY set_code, card_number LIMIT ? OFFSET ?';
        
        const cards = db.prepare(query).all(...params, parseInt(limit), offset);
        const { count } = db.prepare(countQuery).get(...params);
        
        res.json({
            cards,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Get cards error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get price history for graphing
app.get('/api/cards/:id/history', (req, res) => {
    try {
        const { id } = req.params;
        const { grade = 'ungraded', language = 'en', days = 30 } = req.query;
        
        const history = db.prepare(`
            SELECT * FROM price_history 
            WHERE card_id = ? AND grade = ? AND language = ?
            AND recorded_at >= datetime('now', '-${days} days')
            ORDER BY recorded_at ASC
        `).all(id, grade, language);
        
        res.json({
            cardId: id,
            grade,
            language,
            days,
            data: history
        });
    } catch (err) {
        console.error('Get history error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get sets list
app.get('/api/sets', (req, res) => {
    try {
        const sets = db.prepare(`
            SELECT set_code, set_name_en, set_name_jp, COUNT(*) as card_count
            FROM cards
            GROUP BY set_code
            ORDER BY set_code
        `).all();
        
        res.json({ sets });
    } catch (err) {
        console.error('Get sets error:', err);
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
            const price = db.prepare(`
                SELECT price, currency, source, scraped_at
                FROM prices
                WHERE card_id = ? AND grade = ? AND language = ?
                ORDER BY scraped_at DESC
                LIMIT 1
            `).get(cardId, grade, lang);
            
            prices[grade][lang] = price || null;
        }
    }
    
    return prices;
}

function getPriceHistory(cardId) {
    const history = db.prepare(`
        SELECT grade, language, avg_price, recorded_at
        FROM price_history
        WHERE card_id = ?
        ORDER BY recorded_at DESC
        LIMIT 100
    `).all(cardId);
    
    return history;
}

function generateSuggestions(query, allCards) {
    // Simple suggestion generation based on edit distance
    const suggestions = [];
    const queryLower = query.toLowerCase();
    
    for (const card of allCards.slice(0, 100)) {
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
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
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

// Start server
app.listen(PORT, () => {
    console.log(`🚀 One Piece TCG Collector API running on port ${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api`);
    console.log(`🌐 App: http://localhost:${PORT}`);
});

module.exports = app;
