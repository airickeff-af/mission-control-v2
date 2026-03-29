-- One Piece TCG Collector Database Schema

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_number TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_jp TEXT,
    set_code TEXT NOT NULL,
    set_name_en TEXT,
    set_name_jp TEXT,
    rarity TEXT,
    card_type TEXT,
    color TEXT,
    cost INTEGER,
    power INTEGER,
    counter INTEGER,
    attribute TEXT,
    effect_text TEXT,
    trigger TEXT,
    image_url TEXT,
    release_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(card_number, set_code)
);

-- Prices table - stores all price points
CREATE TABLE IF NOT EXISTS prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER NOT NULL,
    grade TEXT NOT NULL, -- 'ungraded', 'psa9', 'psa10', 'bgs9', 'bgs9.5', 'bgs10'
    language TEXT NOT NULL, -- 'en', 'jp'
    price REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    source TEXT, -- 'tcgplayer', 'ebay', 'yuyutei', 'cardrush', etc.
    url TEXT,
    scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id),
    UNIQUE(card_id, grade, language, source, date(scraped_at))
);

-- Price history for graphs
CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER NOT NULL,
    grade TEXT NOT NULL,
    language TEXT NOT NULL,
    avg_price REAL NOT NULL,
    min_price REAL,
    max_price REAL,
    volume INTEGER,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id)
);

-- Search cache for fuzzy matching
CREATE TABLE IF NOT EXISTS search_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    results TEXT NOT NULL, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Scraper status
CREATE TABLE IF NOT EXISTS scraper_status (
    id INTEGER PRIMARY KEY,
    source TEXT NOT NULL,
    last_run DATETIME,
    status TEXT,
    items_scraped INTEGER,
    errors TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cards_number ON cards(card_number);
CREATE INDEX IF NOT EXISTS idx_cards_name_en ON cards(name_en);
CREATE INDEX IF NOT EXISTS idx_cards_name_jp ON cards(name_jp);
CREATE INDEX IF NOT EXISTS idx_cards_set ON cards(set_code);
CREATE INDEX IF NOT EXISTS idx_prices_card ON prices(card_id);
CREATE INDEX IF NOT EXISTS idx_prices_scraped ON prices(scraped_at);
CREATE INDEX IF NOT EXISTS idx_history_card ON price_history(card_id, grade, language);
CREATE INDEX IF NOT EXISTS idx_history_date ON price_history(recorded_at);
