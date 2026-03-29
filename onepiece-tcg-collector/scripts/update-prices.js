const Database = require('better-sqlite3');
const path = require('path');
const { PriceAggregator } = require('../src/scrapers');

const DB_PATH = path.join(__dirname, '../data/onepiece.db');

async function updatePrices() {
    console.log('🔄 Starting price update...');
    console.log(`⏰ ${new Date().toLocaleString()}`);
    
    const db = new Database(DB_PATH);
    const aggregator = new PriceAggregator();
    
    try {
        // Get all cards
        const cards = db.prepare('SELECT * FROM cards').all();
        console.log(`📋 Found ${cards.length} cards to update`);
        
        let updated = 0;
        let failed = 0;
        
        for (const card of cards) {
            try {
                console.log(`\n🔄 Updating: ${card.name_en} (${card.card_number})`);
                
                // Get prices for all grades
                const grades = ['ungraded', 'psa9', 'psa10'];
                
                for (const grade of grades) {
                    // Simulate price fetching (replace with actual scraper calls)
                    const mockPrice = generateMockPrice(card.rarity, grade);
                    
                    // Insert price
                    db.prepare(`
                        INSERT INTO prices (card_id, grade, language, price, currency, source, scraped_at)
                        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
                        ON CONFLICT(card_id, grade, language, source, date(scraped_at)) 
                        DO UPDATE SET price = excluded.price, scraped_at = excluded.scraped_at
                    `).run(
                        card.id,
                        grade,
                        'en',
                        mockPrice,
                        'USD',
                        'tcgplayer'
                    );
                    
                    console.log(`  ✓ ${grade}: $${mockPrice}`);
                }
                
                // Update price history
                updatePriceHistory(db, card.id);
                
                updated++;
                
                // Rate limiting
                await sleep(1000);
                
            } catch (err) {
                console.error(`  ❌ Failed: ${err.message}`);
                failed++;
            }
        }
        
        // Update scraper status
        db.prepare(`
            INSERT INTO scraper_status (id, source, last_run, status, items_scraped, errors)
            VALUES (1, 'aggregator', datetime('now'), 'success', ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                last_run = excluded.last_run,
                status = excluded.status,
                items_scraped = excluded.items_scraped,
                errors = excluded.errors
        `).run(updated, failed > 0 ? `${failed} failures` : null);
        
        console.log(`\n✅ Price update complete!`);
        console.log(`   Updated: ${updated}`);
        console.log(`   Failed: ${failed}`);
        
    } catch (err) {
        console.error('❌ Update failed:', err);
    } finally {
        db.close();
    }
}

function generateMockPrice(rarity, grade) {
    // Mock price generation based on rarity and grade
    const basePrices = {
        'C': 0.50,
        'U': 1.00,
        'R': 3.00,
        'SR': 10.00,
        'SEC': 50.00,
        'L': 100.00,
        'SP': 25.00
    };
    
    const gradeMultipliers = {
        'ungraded': 1,
        'psa9': 3,
        'psa10': 10,
        'bgs9': 3.5,
        'bgs9.5': 8,
        'bgs10': 15
    };
    
    const base = basePrices[rarity] || 1.00;
    const multiplier = gradeMultipliers[grade] || 1;
    const variance = (Math.random() - 0.5) * 0.2; // ±10% variance
    
    return parseFloat((base * multiplier * (1 + variance)).toFixed(2));
}

function updatePriceHistory(db, cardId) {
    const grades = ['ungraded', 'psa9', 'psa10'];
    const languages = ['en', 'jp'];
    
    for (const grade of grades) {
        for (const lang of languages) {
            const stats = db.prepare(`
                SELECT 
                    AVG(price) as avg_price,
                    MIN(price) as min_price,
                    MAX(price) as max_price,
                    COUNT(*) as volume
                FROM prices
                WHERE card_id = ? AND grade = ? AND language = ?
                AND scraped_at >= datetime('now', '-1 day')
            `).get(cardId, grade, lang);
            
            if (stats.avg_price) {
                db.prepare(`
                    INSERT INTO price_history (card_id, grade, language, avg_price, min_price, max_price, volume)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `).run(
                    cardId,
                    grade,
                    lang,
                    stats.avg_price,
                    stats.min_price,
                    stats.max_price,
                    stats.volume
                );
            }
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run if called directly
if (require.main === module) {
    updatePrices().then(() => {
        console.log('\n🏁 Done!');
        process.exit(0);
    }).catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
}

module.exports = { updatePrices };
