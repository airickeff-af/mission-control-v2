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
        this.soldUrl = 'https://www.ebay.com/sch/i.html';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        };
    }

    async getSoldListings(cardName, grade = 'ungraded') {
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
        
        try {
            // eBay sold listings search URL
            const params = new URLSearchParams({
                '_nkw': searchQuery,
                'LH_Sold': '1',  // Sold items only
                'LH_Complete': '1',  // Completed listings
                '_ipg': '25',  // Items per page
                '_sop': '12'   // Sort by recently sold first
            });
            
            const searchUrl = `${this.soldUrl}?${params.toString()}`;
            const response = await axios.get(searchUrl, { headers: this.headers, timeout: 10000 });
            const $ = cheerio.load(response.data);
            
            const listings = [];
            let totalSales = 0;
            let count = 0;
            
            // Parse sold listings
            $('.s-item').each((i, el) => {
                const title = $(el).find('.s-item__title').text().trim();
                const priceText = $(el).find('.s-item__price').text().trim();
                const dateText = $(el).find('.s-item__title--tag').text().trim();
                const link = $(el).find('.s-item__link').attr('href');
                const image = $(el).find('.s-item__image-img').attr('src');
                
                // Parse price
                const priceMatch = priceText.match(/\$([\d,]+\.?\d*)/);
                const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : null;
                
                if (price && title.toLowerCase().includes(cardName.toLowerCase())) {
                    listings.push({
                        title,
                        price,
                        date: dateText,
                        link,
                        image,
                        source: 'ebay'
                    });
                    totalSales += price;
                    count++;
                }
            });
            
            // Calculate statistics
            const prices = listings.map(l => l.price).sort((a, b) => a - b);
            const avgPrice = count > 0 ? totalSales / count : null;
            const medianPrice = count > 0 ? prices[Math.floor(count / 2)] : null;
            const lowPrice = count > 0 ? prices[0] : null;
            const highPrice = count > 0 ? prices[prices.length - 1] : null;
            
            return {
                query: searchQuery,
                source: 'ebay',
                grade,
                listings: listings.slice(0, 10),  // Return top 10
                statistics: {
                    count,
                    average: avgPrice ? parseFloat(avgPrice.toFixed(2)) : null,
                    median: medianPrice,
                    low: lowPrice,
                    high: highPrice
                },
                searchUrl,
                lastUpdated: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('eBay scraper error:', error.message);
            return {
                query: searchQuery,
                source: 'ebay',
                grade,
                error: error.message,
                note: 'eBay scraping may be blocked. Try using eBay API for production.',
                listings: [],
                statistics: null
            };
        }
    }

    async searchActiveListings(cardName, grade = 'ungraded') {
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
        
        try {
            const params = new URLSearchParams({
                '_nkw': searchQuery,
                '_ipg': '25',
                '_sop': '12'
            });
            
            const searchUrl = `${this.soldUrl}?${params.toString()}`;
            const response = await axios.get(searchUrl, { headers: this.headers, timeout: 10000 });
            const $ = cheerio.load(response.data);
            
            const listings = [];
            
            $('.s-item').each((i, el) => {
                const title = $(el).find('.s-item__title').text().trim();
                const priceText = $(el).find('.s-item__price').text().trim();
                const link = $(el).find('.s-item__link').attr('href');
                const image = $(el).find('.s-item__image-img').attr('src');
                
                const priceMatch = priceText.match(/\$([\d,]+\.?\d*)/);
                const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : null;
                
                if (price && title.toLowerCase().includes(cardName.toLowerCase())) {
                    listings.push({
                        title,
                        price,
                        link,
                        image,
                        source: 'ebay',
                        type: 'active'
                    });
                }
            });
            
            return {
                query: searchQuery,
                source: 'ebay',
                grade,
                type: 'active',
                listings: listings.slice(0, 10),
                count: listings.length,
                searchUrl,
                lastUpdated: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('eBay active listings error:', error.message);
            return {
                query: searchQuery,
                source: 'ebay',
                grade,
                error: error.message,
                listings: []
            };
        }
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

class PSAPriceScraper {
    // PSA (Professional Sports Authenticator) Price Guide
    constructor() {
        this.baseUrl = 'https://www.psacard.com';
        this.priceGuideUrl = 'https://www.psacard.com/auctionprices';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        };
    }

    async searchCard(cardName, cardNumber = null) {
        try {
            // PSA Price Guide search for One Piece cards
            const searchQuery = cardNumber 
                ? `One Piece ${cardNumber} ${cardName}`
                : `One Piece ${cardName}`;
            
            const params = new URLSearchParams({
                'keywords': searchQuery,
                'category': 'tradingcards'  // Trading Cards category
            });
            
            const searchUrl = `${this.priceGuideUrl}/search?${params.toString()}`;
            const response = await axios.get(searchUrl, { 
                headers: this.headers, 
                timeout: 15000,
                maxRedirects: 5
            });
            const $ = cheerio.load(response.data);
            
            const results = [];
            
            // Parse PSA price guide results
            $('.auction-price-item, .price-guide-item, tr[data-card-id]').each((i, el) => {
                const name = $(el).find('.card-name, .title, td:nth-child(2)').text().trim();
                const cardNum = $(el).find('.card-number, .number, td:nth-child(3)').text().trim();
                const set = $(el).find('.set-name, .set, td:nth-child(4)').text().trim();
                const grade = $(el).find('.grade, .psa-grade, td:nth-child(5)').text().trim();
                const avgPrice = $(el).find('.avg-price, .average, td:nth-child(6)').text().trim();
                const count = $(el).find('.auction-count, .count, td:nth-child(7)').text().trim();
                const link = $(el).find('a').attr('href');
                
                if (name && avgPrice) {
                    results.push({
                        name,
                        cardNumber: cardNum,
                        set,
                        grade: this.parsePSAGrade(grade),
                        avgPrice: this.parsePrice(avgPrice),
                        auctionCount: parseInt(count) || 0,
                        url: link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : searchUrl,
                        source: 'psa',
                        lastUpdated: new Date().toISOString()
                    });
                }
            });
            
            // If no structured results, try alternative selectors
            if (results.length === 0) {
                // Try different PSA page structures
                $('table tr, .results .item').each((i, el) => {
                    const text = $(el).text();
                    if (text.toLowerCase().includes(cardName.toLowerCase()) && 
                        text.toLowerCase().includes('one piece')) {
                        const cells = $(el).find('td');
                        if (cells.length >= 5) {
                            results.push({
                                name: $(cells[1]).text().trim(),
                                cardNumber: $(cells[2]).text().trim(),
                                set: $(cells[3]).text().trim(),
                                grade: this.parsePSAGrade($(cells[4]).text().trim()),
                                avgPrice: this.parsePrice($(cells[5]).text().trim()),
                                source: 'psa',
                                note: 'Alternative parsing used'
                            });
                        }
                    }
                });
            }
            
            return {
                query: searchQuery,
                source: 'psa',
                results: results.slice(0, 10),
                count: results.length,
                searchUrl,
                lastUpdated: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('PSA scraper error:', error.message);
            return {
                query: cardName,
                source: 'psa',
                error: error.message,
                note: 'PSA website may require authentication. Use psacard.com/auctionprices directly.',
                results: [],
                directSearchUrl: `https://www.psacard.com/auctionprices/search?keywords=${encodeURIComponent('One Piece ' + cardName)}`,
                lastUpdated: new Date().toISOString()
            };
        }
    }

    async getCardPriceHistory(cardName, grade = '10') {
        try {
            // Get historical price data from PSA
            const searchResults = await this.searchCard(cardName);
            
            if (!searchResults.results || searchResults.results.length === 0) {
                return {
                    cardName,
                    source: 'psa',
                    grade,
                    error: 'No results found',
                    history: []
                };
            }

            // Filter by grade
            const gradeResult = searchResults.results.find(r => r.grade === grade) || searchResults.results[0];
            
            return {
                cardName,
                source: 'psa',
                grade: gradeResult.grade,
                currentPrice: gradeResult.avgPrice,
                auctionCount: gradeResult.auctionCount,
                url: gradeResult.url,
                lastUpdated: new Date().toISOString(),
                note: 'Historical data available at PSA URL'
            };
            
        } catch (error) {
            console.error('PSA price history error:', error.message);
            return {
                cardName,
                source: 'psa',
                grade,
                error: error.message,
                history: []
            };
        }
    }

    parsePSAGrade(gradeText) {
        // Normalize PSA grade text (e.g., "PSA 10" -> "psa10")
        const match = gradeText.match(/PSA\s*(\d+(?:\.5)?)/i);
        if (match) {
            return `psa${match[1]}`;
        }
        return gradeText.toLowerCase().replace(/\s+/g, '');
    }

    parsePrice(priceStr) {
        if (!priceStr) return null;
        const match = priceStr.match(/[\d,]+\.?\d*/);
        return match ? parseFloat(match[0].replace(',', '')) : null;
    }
}

class PriceAggregator {
    constructor() {
        this.tcgplayer = new TCGPlayerScraper();
        this.ebay = new EbayScraper();
        this.yuyutei = new YuyuTeiScraper();
        this.psa = new PSAPriceScraper();
    }

    async getCardPrices(cardName, cardNumber = null, options = {}) {
        const { grades = ['ungraded', 'psa9', 'psa10'], language = 'en' } = options;
        
        const results = {
            cardName,
            timestamp: new Date().toISOString(),
            sources: {},
            prices: {}
        };

        // Fetch from all sources in parallel
        const [tcgResults, psaResults, ebaySoldResults, ebayActiveResults] = await Promise.allSettled([
            this.tcgplayer.searchCard(cardName).catch(e => ({ error: e.message })),
            this.psa.searchCard(cardName, cardNumber).catch(e => ({ error: e.message })),
            this.ebay.getSoldListings(cardName, 'psa10').catch(e => ({ error: e.message })),
            this.ebay.searchActiveListings(cardName, 'psa10').catch(e => ({ error: e.message }))
        ]);

        // Store raw source data
        results.sources = {
            tcgplayer: tcgResults.status === 'fulfilled' ? tcgResults.value : { error: tcgResults.reason?.message },
            psa: psaResults.status === 'fulfilled' ? psaResults.value : { error: psaResults.reason?.message },
            ebay: {
                sold: ebaySoldResults.status === 'fulfilled' ? ebaySoldResults.value : { error: ebaySoldResults.reason?.message },
                active: ebayActiveResults.status === 'fulfilled' ? ebayActiveResults.value : { error: ebayActiveResults.reason?.message }
            }
        };

        // Aggregate prices by grade
        for (const grade of grades) {
            results.prices[grade] = {
                en: {
                    tcgplayer: null,
                    psa: null,
                    ebay: {
                        sold: { average: null, median: null, low: null, high: null, count: 0 },
                        active: { average: null, count: 0 }
                    }
                },
                jp: {
                    yuyutei: null
                }
            };

            // Extract PSA graded prices
            if (psaResults.status === 'fulfilled' && psaResults.value.results) {
                const psaGradeKey = grade.toLowerCase();
                const psaMatch = psaResults.value.results.find(r => 
                    r.grade === psaGradeKey || 
                    r.grade === grade.replace('psa', '') ||
                    (grade === 'psa10' && r.grade === '10') ||
                    (grade === 'psa9' && r.grade === '9')
                );
                if (psaMatch) {
                    results.prices[grade].en.psa = {
                        price: psaMatch.avgPrice,
                        auctionCount: psaMatch.auctionCount,
                        url: psaMatch.url
                    };
                }
            }

            // Extract eBay sold prices for this grade
            if (ebaySoldResults.status === 'fulfilled' && ebaySoldResults.value.statistics) {
                const stats = ebaySoldResults.value.statistics;
                results.prices[grade].en.ebay.sold = {
                    average: stats.average,
                    median: stats.median,
                    low: stats.low,
                    high: stats.high,
                    count: stats.count,
                    listings: ebaySoldResults.value.listings?.slice(0, 5) || []
                };
            }

            // Extract eBay active listings
            if (ebayActiveResults.status === 'fulfilled' && ebayActiveResults.value.listings) {
                const activeListings = ebayActiveResults.value.listings;
                const avgPrice = activeListings.length > 0 
                    ? activeListings.reduce((sum, l) => sum + l.price, 0) / activeListings.length 
                    : null;
                results.prices[grade].en.ebay.active = {
                    average: avgPrice ? parseFloat(avgPrice.toFixed(2)) : null,
                    count: activeListings.length,
                    listings: activeListings.slice(0, 5)
                };
            }

            // Extract TCGPlayer prices (from raw results)
            if (tcgResults.status === 'fulfilled' && Array.isArray(tcgResults.value) && tcgResults.value.length > 0) {
                const tcgMatch = tcgResults.value.find(r => 
                    r.name.toLowerCase().includes(cardName.toLowerCase())
                );
                if (tcgMatch) {
                    results.prices[grade].en.tcgplayer = {
                        price: tcgMatch.price,
                        url: tcgMatch.url
                    };
                }
            }
        }

        // Add market summary
        results.summary = {
            bestPrice: this.findBestPrice(results.prices),
            mostReliable: this.findMostReliableSource(results.sources),
            lastUpdated: new Date().toISOString()
        };

        return results;
    }

    findBestPrice(prices) {
        let bestPrice = Infinity;
        let bestSource = null;
        let bestGrade = null;

        for (const [grade, data] of Object.entries(prices)) {
            if (data.en.tcgplayer?.price && data.en.tcgplayer.price < bestPrice) {
                bestPrice = data.en.tcgplayer.price;
                bestSource = 'tcgplayer';
                bestGrade = grade;
            }
            if (data.en.psa?.price && data.en.psa.price < bestPrice) {
                bestPrice = data.en.psa.price;
                bestSource = 'psa';
                bestGrade = grade;
            }
            if (data.en.ebay.sold?.average && data.en.ebay.sold.average < bestPrice) {
                bestPrice = data.en.ebay.sold.average;
                bestSource = 'ebay_sold';
                bestGrade = grade;
            }
        }

        return bestPrice === Infinity ? null : {
            price: bestPrice,
            source: bestSource,
            grade: bestGrade
        };
    }

    findMostReliableSource(sources) {
        // Determine which source has the most data
        const scores = {
            psa: sources.psa?.results ? sources.psa.results.length : 0,
            tcgplayer: Array.isArray(sources.tcgplayer) ? sources.tcgplayer.length : 0,
            ebay: (sources.ebay?.sold?.listings?.length || 0) + (sources.ebay?.active?.listings?.length || 0)
        };
        
        return Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .map(([source, count]) => ({ source, count }))[0] || null;
    }
}
}

module.exports = {
    TCGPlayerScraper,
    EbayScraper,
    YuyuTeiScraper,
    CardRushScraper,
    PSAPriceScraper,
    PriceAggregator
};
