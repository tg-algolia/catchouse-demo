// ========================================
// CONFIGURATION TEMPLATE
// ========================================
// Copy this file to config.js and fill in your values
// DO NOT commit config.js to version control

window.ALGOLIA_CONFIG = {
    // Search Configuration - Index 1
    INDEX1_NAME: 'your-index-1-name',
    INDEX1_APP_ID: 'YOUR_APP_ID_1',
    INDEX1_API_KEY: 'your-search-only-api-key-1',
    INDEX1_TITLE: 'Production Search',
    INDEX1_DASHBOARD_URL: 'https://dashboard.algolia.com/apps/YOUR_APP_ID_1/explorer/browse/your-index-1',

    // Search Configuration - Index 2
    INDEX2_NAME: 'your-index-2-name',
    INDEX2_APP_ID: 'YOUR_APP_ID_2', 
    INDEX2_API_KEY: 'your-search-only-api-key-2',
    INDEX2_TITLE: 'NeuralSearch',
    INDEX2_DASHBOARD_URL: 'https://dashboard.algolia.com/apps/YOUR_APP_ID_2/explorer/browse/your-index-2',

    // Visual Configuration
    FALLBACK_IMAGE: 'https://your-fallback-image-url.com/image.jpg',
    FAVICON_URL: 'https://your-favicon-url.com/favicon.ico',
    FONT_FAMILY: 'Sora',

    // Hit Card Attributes Configuration
    TITLE_ATTRIBUTE: 'title',
    DESCRIPTION_ATTRIBUTE: 'description',
    PRICE_ATTRIBUTE: 'priceBest.standard', // Use dot notation for nested properties
    EXTRA_ATTRIBUTE: 'category', // Additional attribute to display
    BRAND_ATTRIBUTE: 'brand' // Brand badge attribute
};