// One Piece TCG Collector - Frontend App
const API_BASE = '/api';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const suggestionsDiv = document.getElementById('suggestions');
const suggestionsList = document.getElementById('suggestionsList');
const resultsSection = document.getElementById('resultsSection');
const resultsGrid = document.getElementById('resultsGrid');
const resultsCount = document.getElementById('resultsCount');
const loadingDiv = document.getElementById('loading');
const cardModal = document.getElementById('cardModal');
const modalBody = document.getElementById('modalBody');

// State
let searchTimeout = null;
let currentResults = [];

// Initialize
async function init() {
    updateLastUpdated();
    
    // Search input with debounce
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            suggestionsDiv.classList.remove('show');
            return;
        }
        
        searchTimeout = setTimeout(() => {
            searchCards();
        }, 300);
    });

    // Enter key to search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            clearTimeout(searchTimeout);
            searchCards();
        }
    });

    // Close modal on overlay click
    cardModal.addEventListener('click', (e) => {
        if (e.target === cardModal) {
            closeModal();
        }
    });
}

// Search cards
async function searchCards() {
    const query = searchInput.value.trim();
    
    if (query.length < 2) return;
    
    showLoading();
    hideSuggestions();
    
    try {
        const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&limit=20`);
        const data = await response.json();
        
        currentResults = data.results;
        
        if (data.results.length === 0) {
            showNoResults(query, data.suggestions);
        } else {
            displayResults(data.results, data.count);
        }
        
        // Show suggestions if there are any and no exact matches
        if (data.suggestions && data.suggestions.length > 0 && data.results.length === 0) {
            displaySuggestions(data.suggestions);
        }
        
    } catch (err) {
        console.error('Search error:', err);
        showError('Failed to search. Please try again.');
    } finally {
        hideLoading();
    }
}

// Display search results
function displayResults(results, count) {
    resultsSection.style.display = 'block';
    resultsCount.textContent = `${count} treasure${count !== 1 ? 's' : ''} found`;
    
    resultsGrid.innerHTML = results.map(card => `
        <div class="card-item" onclick="showCardDetail(${card.id})">
            <div class="card-header">
                <span class="card-number">${card.card_number}</span>
                <span class="card-rarity rarity-${card.rarity}">${card.rarity}</span>
            </div>
            <div class="card-body">
                <div class="card-name">${card.name_en}</div>
                <div class="card-name-jp">${card.name_jp || ''}</div>
                <div class="card-set">${card.set_name_en} (${card.set_code})</div>
                
                <div class="price-grid">
                    <div class="price-box">
                        <div class="price-label">Ungraded (EN)</div>
                        <div class="price-value price-en">${formatPrice(card.prices?.ungraded?.en?.price)}</div>
                    </div>
                    <div class="price-box">
                        <div class="price-label">PSA 10 (EN)</div>
                        <div class="price-value price-en">${formatPrice(card.prices?.psa10?.en?.price)}</div>
                    </div>
                    <div class="price-box">
                        <div class="price-label">Ungraded (JP)</div>
                        <div class="price-value price-jp">${formatPrice(card.prices?.ungraded?.jp?.price, '¥')}</div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Show card detail modal
async function showCardDetail(cardId) {
    showModal();
    modalBody.innerHTML = '<div class="loading">Loading card details...</div>';
    
    try {
        const response = await fetch(`${API_BASE}/cards/${cardId}`);
        const card = await response.json();
        
        modalBody.innerHTML = `
            <div class="detail-header">
                <div class="detail-image">
                    🏴‍☠️
                </div>
                <div class="detail-info">
                    <span class="card-number">${card.card_number}</span>
                    <h2>${card.name_en}</h2>
                    <h3>${card.name_jp || ''}</h3>
                    <span class="card-rarity rarity-${card.rarity}">${card.rarity}</span>
                    
                    <div class="detail-stats">
                        <div class="stat-item">
                            <div class="stat-label">Type</div>
                            <div class="stat-value">${card.card_type}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Color</div>
                            <div class="stat-value">${card.color}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Cost</div>
                            <div class="stat-value">${card.cost}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Power</div>
                            <div class="stat-value">${card.power || '-'}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Counter</div>
                            <div class="stat-value">${card.counter || '-'}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Attribute</div>
                            <div class="stat-value">${card.attribute || '-'}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <h3 style="color: var(--accent-gold); margin: 2rem 0 1rem; font-family: 'Press Start 2P', cursive; font-size: 0.7rem;">
                💰 MARKET PRICES
            </h3>
            
            <table class="price-table">
                <thead>
                    <tr>
                        <th>Grade</th>
                        <th>English (USD)</th>
                        <th>Japanese (JPY)</th>
                    </tr>
                </thead>
                <tbody>
                    ${generatePriceRows(card.prices)}
                </tbody>
            </table>
            
            <h3 style="color: var(--accent-gold); margin: 2rem 0 1rem; font-family: 'Press Start 2P', cursive; font-size: 0.7rem;">
                📈 PRICE HISTORY (30 Days)
            </h3>
            
            <div class="chart-container">
                <canvas id="priceChart"></canvas>
            </div>
        `;
        
        // Load price chart
        loadPriceChart(cardId);
        
    } catch (err) {
        console.error('Card detail error:', err);
        modalBody.innerHTML = '<div style="text-align: center; color: var(--accent-red);">Failed to load card details</div>';
    }
}

// Generate price table rows
function generatePriceRows(prices) {
    const grades = [
        { key: 'ungraded', label: 'Ungraded (Raw)' },
        { key: 'psa9', label: 'PSA 9' },
        { key: 'psa10', label: 'PSA 10' },
        { key: 'bgs9', label: 'BGS 9' },
        { key: 'bgs9.5', label: 'BGS 9.5' },
        { key: 'bgs10', label: 'BGS 10 (Pristine)' }
    ];
    
    return grades.map(grade => {
        const enPrice = prices?.[grade.key]?.en?.price;
        const jpPrice = prices?.[grade.key]?.jp?.price;
        
        return `
            <tr>
                <td><span class="grade-badge grade-${grade.key}">${grade.label}</span></td>
                <td style="color: var(--accent-green);">${enPrice ? `$${enPrice.toFixed(2)}` : 'N/A'}</td>
                <td style="color: var(--accent-blue);">${jpPrice ? `¥${Math.round(jpPrice)}` : 'N/A'}</td>
            </tr>
        `;
    }).join('');
}

// Load price history chart
async function loadPriceChart(cardId) {
    try {
        const response = await fetch(`${API_BASE}/cards/${cardId}/history?grade=psa10&language=en&days=30`);
        const data = await response.json();
        
        const ctx = document.getElementById('priceChart');
        if (!ctx) return;
        
        const labels = data.data.map(d => new Date(d.recorded_at).toLocaleDateString());
        const prices = data.data.map(d => d.avg_price);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'PSA 10 Price (USD)',
                    data: prices,
                    borderColor: '#ffd700',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#fff', font: { family: 'VT323', size: 14 } }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#a0a0a0', font: { family: 'VT323' } },
                        grid: { color: '#2d3a5a' }
                    },
                    y: {
                        ticks: { 
                            color: '#a0a0a0', 
                            font: { family: 'VT323' },
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        },
                        grid: { color: '#2d3a5a' }
                    }
                }
            }
        });
    } catch (err) {
        console.error('Chart error:', err);
    }
}

// Display suggestions for misspellings
function displaySuggestions(suggestions) {
    suggestionsList.innerHTML = suggestions.map(s => `
        <div class="suggestion-item" onclick="searchSuggestion('${s.name}')">
            <strong>${s.name}</strong> - ${s.cardNumber} (${s.setCode})
        </div>
    `).join('');
    
    suggestionsDiv.classList.add('show');
}

// Search from suggestion
function searchSuggestion(name) {
    searchInput.value = name;
    suggestionsDiv.classList.remove('show');
    searchCards();
}

// Utility functions
function formatPrice(price, symbol = '$') {
    if (price === null || price === undefined) return 'N/A';
    return symbol === '$' ? `$${price.toFixed(2)}` : `¥${Math.round(price)}`;
}

function showLoading() {
    loadingDiv.style.display = 'block';
    resultsSection.style.display = 'none';
}

function hideLoading() {
    loadingDiv.style.display = 'none';
}

function showNoResults(query, suggestions) {
    resultsSection.style.display = 'block';
    resultsCount.textContent = 'No treasures found';
    resultsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🏴‍☠️</div>
            <h3>No cards found for "${query}"</h3>
            <p>Try checking your spelling or browse all cards</p>
        </div>
    `;
    
    if (suggestions && suggestions.length > 0) {
        displaySuggestions(suggestions);
    }
}

function showError(message) {
    resultsSection.style.display = 'block';
    resultsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--accent-red);">
            <h3>❌ ${message}</h3>
        </div>
    `;
}

function hideSuggestions() {
    suggestionsDiv.classList.remove('show');
}

function showModal() {
    cardModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    cardModal.classList.remove('show');
    document.body.style.overflow = '';
}

function updateLastUpdated() {
    const now = new Date();
    document.getElementById('lastUpdated').textContent = now.toLocaleString();
}

// Initialize app
init();
