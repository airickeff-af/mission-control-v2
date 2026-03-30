const { ImageAnnotatorClient } = require('@google-cloud/vision');

class CardVisionRecognizer {
    constructor() {
        // Initialize Vision client
        // Requires GOOGLE_APPLICATION_CREDENTIALS env var
        this.client = new ImageAnnotatorClient();
    }

    /**
     * Recognize a card from image using Google Vision API
     * @param {Buffer} imageBuffer - Image data
     * @returns {Promise<Object>} Recognition result with card info
     */
    async recognizeCard(imageBuffer) {
        try {
            // Perform text detection
            const [result] = await this.client.textDetection({
                image: { content: imageBuffer }
            });
            
            const detections = result.textAnnotations;
            
            if (!detections || detections.length === 0) {
                return {
                    success: false,
                    error: 'No text detected in image',
                    rawText: null
                };
            }

            // Get full text (first annotation is the complete text)
            const fullText = detections[0].description;
            
            // Extract card information
            const cardInfo = this.extractCardInfo(fullText, detections);
            
            return {
                success: true,
                cardInfo,
                rawText: fullText,
                confidence: this.calculateConfidence(cardInfo, detections)
            };
            
        } catch (error) {
            console.error('Vision API error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Extract card number, name, and other info from detected text
     */
    extractCardInfo(fullText, annotations) {
        const lines = fullText.split('\n').map(l => l.trim()).filter(l => l);
        
        // Patterns for One Piece card numbers
        const cardNumberPatterns = [
            /OP\d{2}-\d{3}[A-Z]?/i,           // OP01-001, OP01-002P
            /OP\d{2}-[A-Z]+/i,                // OP01-SEC, OP01-SR
            /ST\d{2}-\d{3}/i,                 // ST01-001 (Starter decks)
            /PR-\d{3}/i,                      // Promo cards
            /P-\d{3}/i                       // Alternative pattern
        ];
        
        let cardNumber = null;
        let cardName = null;
        let power = null;
        let cost = null;
        let isJapanese = false;
        
        // Check for Japanese text
        const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
        isJapanese = japaneseRegex.test(fullText);
        
        // Extract card number
        for (const line of lines) {
            for (const pattern of cardNumberPatterns) {
                const match = line.match(pattern);
                if (match) {
                    cardNumber = match[0].toUpperCase();
                    break;
                }
            }
            if (cardNumber) break;
        }
        
        // Extract power (common pattern: 5000, 6000, etc.)
        const powerMatch = fullText.match(/(\d{4,5})\s*(Power|パワー)/i);
        if (powerMatch) {
            power = parseInt(powerMatch[1]);
        }
        
        // Extract cost (common pattern: Cost 3, etc.)
        const costMatch = fullText.match(/(?:Cost|コスト)\s*(\d)/i);
        if (costMatch) {
            cost = parseInt(costMatch[1]);
        }
        
        // Extract card name (usually near the top, before power/cost)
        // Look for character names (capitalized words)
        if (!isJapanese) {
            // For English cards, look for character names
            const namePatterns = [
                /Monkey\s+D\.?\s*Luffy/i,
                /Roronoa\s+Zoro/i,
                /Shanks/i,
                /Nami/i,
                /Sanji/i,
                /Nico\s+Robin/i,
                /Tony\s+Tony\s+Chopper/i,
                /Trafalgar\s+Law/i,
                /Eustass\s+Kid/i,
                /Gol\s+D\.?\s*Roger/i,
                /Portgas\s+D\.?\s*Ace/i,
                /Boa\s+Hancock/i,
                /Dracule\s+Mihawk/i,
                /Edward\s+Newgate/i,
                /Kozuki\s+Oden/i
            ];
            
            for (const pattern of namePatterns) {
                const match = fullText.match(pattern);
                if (match) {
                    cardName = match[0];
                    break;
                }
            }
        }
        
        // If no specific name found, use first meaningful line
        if (!cardName && lines.length > 0) {
            // Skip lines that look like card numbers or just numbers
            for (const line of lines) {
                if (line.length > 3 && 
                    !line.match(/^OP\d/i) && 
                    !line.match(/^\d+$/) &&
                    !line.match(/^(Cost|Power|Counter)/i)) {
                    cardName = line;
                    break;
                }
            }
        }
        
        return {
            cardNumber,
            cardName,
            power,
            cost,
            isJapanese,
            detectedLines: lines.slice(0, 10) // First 10 lines for debugging
        };
    }

    /**
     * Calculate confidence score based on detection quality
     */
    calculateConfidence(cardInfo, annotations) {
        let score = 0;
        let maxScore = 100;
        
        // Card number is critical
        if (cardInfo.cardNumber) score += 40;
        
        // Card name is important
        if (cardInfo.cardName) score += 30;
        
        // Power/Cost add confidence
        if (cardInfo.power) score += 15;
        if (cardInfo.cost) score += 15;
        
        // Check text quality
        if (annotations.length > 1) {
            const avgConfidence = annotations.slice(1).reduce((sum, a) => 
                sum + (a.confidence || 0), 0) / (annotations.length - 1);
            score *= (0.8 + avgConfidence * 0.2); // Adjust by average confidence
        }
        
        return Math.min(Math.round(score), 100);
    }

    /**
     * Find best matching card from database
     */
    async findMatchingCard(cardInfo, cardsDB) {
        if (!cardInfo.cardNumber && !cardInfo.cardName) {
            return null;
        }
        
        let matches = [];
        
        // Exact match by card number
        if (cardInfo.cardNumber) {
            const exactMatch = cardsDB.find(c => 
                c.card_number.toUpperCase() === cardInfo.cardNumber.toUpperCase()
            );
            if (exactMatch) return { card: exactMatch, matchType: 'exact', confidence: 100 };
            
            // Fuzzy match on card number
            matches = cardsDB.filter(c => 
                c.card_number.toUpperCase().includes(cardInfo.cardNumber.toUpperCase()) ||
                cardInfo.cardNumber.toUpperCase().includes(c.card_number.toUpperCase())
            );
        }
        
        // Match by name if no number match
        if (matches.length === 0 && cardInfo.cardName) {
            const nameLower = cardInfo.cardName.toLowerCase();
            matches = cardsDB.filter(c => 
                c.name_en.toLowerCase().includes(nameLower) ||
                nameLower.includes(c.name_en.toLowerCase()) ||
                (c.name_jp && c.name_jp.includes(cardInfo.cardName))
            );
        }
        
        // Return best match
        if (matches.length > 0) {
            return {
                card: matches[0],
                matchType: 'fuzzy',
                confidence: cardInfo.cardNumber ? 85 : 70,
                alternatives: matches.slice(1, 4) // Top 3 alternatives
            };
        }
        
        return null;
    }
}

module.exports = CardVisionRecognizer;
