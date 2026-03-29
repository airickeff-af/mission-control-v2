const axios = require('axios');
const cheerio = require('cheerio');

class TCGPlayerScraper {
    constructor() {
        this.baseUrl = 'https://www.tcgplayer.com';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        };
    }

    async searchCard(cardName) {
        try {
            const searchUrl = `${this.baseUrl}/search/one-piece+${encodeURIComponent(cardName)}/product?productLineName=one-piece-card-game`;
            const response = await axios.get(searchUrl, { headers: this.headers });
            const $ = cheerio.load(response.data);
            
            const results = [];
            $('.search-result').each((i, el) => {
                const name = $(el).find('.search-result__title').text().trim();
                const price = $(el).find('.search-result__price').text().trim();
                const url = $(el).find('a').attr('href');
                
                if (name && price) {
                    results.push({
                        name,
                        price: this.parsePrice(price),
                        url: this.baseUrl + url,
                        source: 'tcgplayer'
                    });
                }
            });
            
            return results;
        } catch (error) {
            console.error('TCGPlayer search error:', error.message);
            return [];
        }
    }

    parsePrice(priceStr) {
        const match = priceStr.match(/[\d,]+\.?\d*/);
        return match ? parseFloat(match[0].replace(',', '')) : 0;
    }
}

class EbayScraper {
    constructor() {
        this.baseUrl = 'https://www.ebay.com';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        };
    }

    async getSoldListings(cardName, grade = 'ungraded') {
        // Note: eBay sold data requires more complex scraping
        // This is a simplified structure
        const gradeTerms = {
            'ungraded': '',
            'psa9': 'PSA 9',
            'psa10': 'PSA 10',
            'bgs9': 'BGS 9',
            'bgs9.5': 'BGS 9.5',
            'bgs10': 'BGS 10'
        };
        
        const gradeQuery = gradeTerms[grade] || '';
        const searchQuery = `One Piece TCG ${cardName} ${gradeQuery}`.trim();
        
        // Return structure for sold listings
        return {
            query: searchQuery,
            source: 'ebay',
            note: 'eBay sold listings require authenticated access or advanced scraping',
            averagePrice: null,
            lastSold: null
        };
    }
}

class YuyuTeiScraper {
    // Japanese market scraper
    constructor() {
        this.baseUrl = 'https://yuyu-tei.jp';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        };
    }

    async searchCard(cardName) {
        // Yuyu-tei is one of the largest Japanese card shops
        // Requires handling Japanese text
        try {
            const searchUrl = `${this.baseUrl}/game_t/sell/sell_price.php?search=1&name=${encodeURIComponent(cardName)}&kana=`;
            // Implementation would parse their HTML structure
            return [];
        } catch (error) {
            console.error('Yuyu-tei error:', error.message);
            return [];
        }
    }
}

class CardRushScraper {
    // Another major Japanese card shop
    constructor() {
        this.baseUrl = 'https://www.cardrush-mtg.jp';
    }
}

class PriceAggregator {
    constructor() {
        this.tcgplayer = new TCGPlayerScraper();
        this.ebay = new EbayScraper();
        this.yuyutei = new YuyuTeiScraper();
    }

    async getCardPrices(cardName, options = {}) {
        const { grades = ['ungraded', 'psa10'], language = 'en' } = options;
        
        const results = {
            cardName,
            timestamp: new Date().toISOString(),
            prices: {}
        };

        for (const grade of grades) {
            results.prices[grade] = {
                en: null,
                jp: null
            };

            // English prices
            if (language === 'en' || language === 'all') {
                try {
                    const tcgResults = await this.tcgplayer.searchCard(`${cardName} ${grade === 'psa10' ? 'PSA 10' : ''}`);
                    if (tcgResults.length > 0) {
                        results.prices[grade].en = {
                            tcgplayer: tcgResults[0].price,
                            currency: 'USD'
                        };
                    }
                } catch (e) {
                    console.error(`Error fetching ${grade} EN price:`, e.message);
                }
            }

            // Japanese prices
            if (language === 'jp' || language === 'all') {
                // Would integrate with Japanese scrapers
                results.prices[grade].jp = {
                    note: 'Japanese price scraping in development',
                    currency: 'JPY'
                };
            }
        }

        return results;
    }
}

module.exports = {
    TCGPlayerScraper,
    EbayScraper,
    YuyuTeiScraper,
    CardRushScraper,
    PriceAggregator
};
