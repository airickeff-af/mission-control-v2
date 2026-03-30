# 🏴‍☠️ One Piece TCG Collector

A comprehensive card price tracking application for One Piece TCG with support for English and Japanese markets, multiple grading tiers, and automated daily price updates.

## Features

- 🔍 **Fuzzy Search** - Find cards even with typos or partial names
- 📷 **Camera Scanner** - AI-powered card recognition (PSA App-style)
  - Japanese & English card support
  - OCR text extraction
  - Instant price lookup after scan
- 🌍 **Multi-Source Prices:**
  - **PSA** (Professional Sports Authenticator) - Graded card prices
  - **eBay** - Sold listings + Active listings
  - **TCGPlayer** - Primary market pricing
  - **Japanese Markets** - Yuyu-tei, Card Rush
- 💎 **Grading Support** - Ungraded (Raw), PSA 9/10, BGS 9/9.5/10
- 📊 **Price Charts** - 30-day price history with interactive graphs
- 🔄 **Auto Updates** - Daily price scraping at 3:00 AM
- 🤖 **AI Suggestions** - Smart recommendations for misspelled card names

## Quick Start

```bash
# Install dependencies
npm install

# Initialize database with sample cards
npm run init-db

# Start the server
npm start
```

Then open http://localhost:3456 in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the API server |
| `npm run init-db` | Initialize database with sample cards |
| `npm run scrape` | Run price scrapers manually |
| `npm run update` | Update all card prices |
| `npm run dev` | Start with hot reload (requires nodemon) |

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api/search?q={query}` | Fuzzy search cards |
| `GET /api/cards` | List all cards (paginated) |
| `GET /api/cards/{id}` | Get card by ID with prices |
| `GET /api/cards/number/{number}` | Get card by card number |
| `GET /api/cards/{id}/history` | Get price history |
| `GET /api/sets` | List all card sets |
| `GET /api/prices/search?q={card}&number={num}&grade={grade}` | **Multi-source price search** (TCGPlayer, PSA, eBay) |

## Price Grades

- `ungraded` - Raw/ungraded card
- `psa9` - PSA 9 Mint
- `psa10` - PSA 10 Gem Mint
- `bgs9` - BGS 9 Mint
- `bgs9.5` - BGS 9.5 Gem Mint
- `bgs10` - BGS 10 Pristine

## Database Schema

```
cards
├── id, card_number, name_en, name_jp
├── set_code, set_name_en, set_name_jp
├── rarity, card_type, color, cost, power
└── attribute, effect_text, trigger

prices
├── card_id, grade, language
├── price, currency, source, url
└── scraped_at

price_history
├── card_id, grade, language
├── avg_price, min_price, max_price, volume
└── recorded_at
```

## Deployment

### Local Development
```bash
npm install
npm run init-db
npm start
```

### Production with Auto-Updates
```bash
npm install
npm run init-db
npm start &
npm run scheduler  # In separate terminal/window
```

### Docker (Optional)
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run init-db
EXPOSE 3456
CMD ["npm", "start"]
```

## Data Sources

### English Market
- **TCGPlayer** - Primary market pricing
- **PSA (Professional Sports Authenticator)** - Graded card prices and auction data
- **eBay** - Sold listings and active listings for market comparison

### Japanese Market
- Yuyu-tei
- Card Rush
- Magi

## Camera Card Scanner (PSA App-Style)

The scanner uses AI vision technology similar to the official PSA App:

1. **Point camera at card** - Works with Japanese & English cards
2. **OCR extracts text** - Card number, name, set code
3. **Instant match** - Database lookup in <1 second
4. **Price display** - Shows PSA, eBay, TCGPlayer prices

### Implementation
See `docs/PSA_SCANNER_INTEGRATION.md` for full technical guide:
- Google Vision API (recommended for OCR)
- TensorFlow.js (client-side ML)
- AWS Rekognition

### Reference Apps
- **PSA App** (Official) - iOS/Android, instant card ID + PSA prices
- **OP.TCG** - 32K+ users, AI scanner for One Piece
- **TCG Stacked** - One Piece specific scanner + collection tracking
- **Arcane** - Multi-TCG with PSA verification API

## TODO / Roadmap

- [ ] Real scraper implementations for all sources
- [ ] Card image scraping/display
- [ ] User collection tracking
- [ ] Price alerts/notifications
- [ ] Portfolio value calculator
- [ ] Mobile app (React Native)
- [ ] Export to CSV/Excel

## License

MIT - Built with ❤️ for the One Piece TCG community
