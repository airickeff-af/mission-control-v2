# PSA App Card Scanner Integration Guide

## Overview
The official PSA App has an excellent card scanner that can instantly identify One Piece cards (including Japanese versions) and display pricing data. This document outlines how to integrate similar functionality into the One Piece TCG Collector.

## PSA App Features (Reference)

### Card Recognition
- **Instant Identification**: Point camera at card → immediate recognition
- **Japanese Support**: Recognizes Japanese text on OP cards
- **Multi-Language OCR**: Works with English and Japanese card text
- **Card Database**: Matches scanned image against PSA's card database

### Pricing Data
After scanning, PSA app shows:
- PSA graded prices (PSA 9, PSA 10)
- Recent auction sales
- Price trends
- Population reports

### Japanese One Piece Sets Supported
- 2025 One Piece Japanese Heroines Special Set
- 2025 One Piece Japanese Promotion Card Set  
- 2022 One Piece Japanese 25th Anniversary Premium Card Collection
- All standard OP01-OP08 sets (Japanese)

## Implementation Options

### Option 1: Google Vision API (Recommended)
```javascript
// Use Google Cloud Vision API for OCR
const vision = require('@google-cloud/vision');

async function recognizeCard(imageBuffer) {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.textDetection(imageBuffer);
    const detections = result.textAnnotations;
    
    // Extract card number (e.g., "OP01-001")
    const cardNumber = extractCardNumber(detections[0].description);
    
    // Look up in database
    return await lookupCard(cardNumber);
}
```

### Option 2: TensorFlow.js (Client-side)
```javascript
// Load pre-trained model
const model = await tf.loadLayersModel('/models/op-card-model.json');

// Process image
const tensor = tf.browser.fromPixels(imageElement)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .expandDims();

// Predict
const predictions = await model.predict(tensor).data();
```

### Option 3: AWS Rekognition
```javascript
const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();

async function detectCard(imageBuffer) {
    const params = {
        Image: { Bytes: imageBuffer },
        MaxLabels: 10,
        MinConfidence: 80
    };
    
    const result = await rekognition.detectLabels(params).promise();
    return parseCardLabels(result.Labels);
}
```

## Integration Plan

### Phase 1: Basic OCR (Text Recognition)
1. Capture card image from camera
2. Extract text using OCR (Google Vision)
3. Parse card number (OP01-001 format)
4. Match against local database
5. Display card details + prices

### Phase 2: Image Matching
1. Train model on One Piece card images
2. Use feature extraction to match cards
3. Handle Japanese text recognition
4. Support angled/partial card views

### Phase 3: PSA API Integration
1. After card identification, call PSA API
2. Fetch graded prices
3. Show PSA 9/10 price data
4. Display population reports

## API Costs Estimate

| Service | Cost per 1,000 scans | Notes |
|---------|---------------------|-------|
| Google Vision OCR | $1.50 | Good text accuracy |
| AWS Rekognition | $1.00 | Good object detection |
| Azure Computer Vision | $1.00 | Balanced performance |
| Custom TensorFlow.js | Free (client-side) | Requires training data |

## Recommended Stack

For the One Piece TCG Collector:

1. **OCR**: Google Vision API for text extraction
2. **Database**: Local SQLite + Redis cache
3. **Matching**: Fuzzy string matching on card numbers
4. **Pricing**: PSA Price Guide scraping + eBay sold data
5. **Fallback**: Manual card number entry

## Similar Apps for Reference

1. **PSA App** (Official) - iOS/Android
   - Best for graded card pricing
   - Official PSA data

2. **OP.TCG** - iOS
   - AI scanner for One Piece
   - 32K+ users
   - Japanese + English support

3. **TCG Stacked** - iOS/Android
   - One Piece specific
   - Collection tracking
   - Price alerts

4. **Arcane** - iOS
   - Multi-TCG scanner
   - PSA verification
   - Portfolio tracking

## Implementation Code Snippet

```javascript
// Full recognition pipeline
class CardScanner {
    constructor() {
        this.visionClient = new vision.ImageAnnotatorClient();
        this.cardDB = new CardDatabase();
    }
    
    async scan(imageBuffer) {
        // Step 1: Extract text
        const text = await this.extractText(imageBuffer);
        
        // Step 2: Find card number pattern (OP01-001)
        const cardNumber = this.parseCardNumber(text);
        
        // Step 3: Database lookup
        const card = await this.cardDB.findByNumber(cardNumber);
        
        // Step 4: Fetch PSA prices
        const psaData = await this.fetchPSAPrices(card.name);
        
        return { card, psaData };
    }
    
    parseCardNumber(text) {
        // Match patterns like OP01-001, OP02-SEC, etc.
        const match = text.match(/OP\d{2}-[A-Z0-9]+/i);
        return match ? match[0].toUpperCase() : null;
    }
}
```

## Next Steps

1. Get Google Vision API key
2. Collect sample One Piece card images for testing
3. Build OCR → Card matching pipeline
4. Integrate with existing price scrapers
5. Add camera UI to web app
