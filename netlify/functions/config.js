// ========================================
// NETLIFY FUNCTION - ENVIRONMENT CONFIG
// ========================================
// Returns environment variables for the frontend
// Set environment variables in Netlify dashboard

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers
        };
    }

    try {
        // Extract environment variables
        const config = {
            INDEX1_NAME: process.env.INDEX1_NAME || 'all-products',
            INDEX1_APP_ID: process.env.INDEX1_APP_ID || 'UUCTQPKC2Z',
            INDEX1_API_KEY: process.env.INDEX1_API_KEY || '6981524f62d3f21830c3cd11643e1cd2',
            INDEX1_TITLE: process.env.INDEX1_TITLE || 'Production Search',
            
            INDEX2_NAME: process.env.INDEX2_NAME || 'demo_rivly_ns',
            INDEX2_APP_ID: process.env.INDEX2_APP_ID || 'T3J6BKODKM',
            INDEX2_API_KEY: process.env.INDEX2_API_KEY || '85be8167f9237efc6997e81f8af59f73',
            INDEX2_TITLE: process.env.INDEX2_TITLE || 'NeuralSearch'
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(config)
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to load configuration',
                message: error.message 
            })
        };
    }
};