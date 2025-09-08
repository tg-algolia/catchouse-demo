# Algolia Side-by-Side Search Demo

A clean, professional demo application to compare search results between two different Algolia configurations side-by-side. Perfect for showcasing the differences between standard search and NeuralSearch, or comparing different indices and configurations.

## Features

- **Side-by-Side Comparison**: Compare two different Algolia search configurations simultaneously
- **Configurable**: Easy-to-configure search parameters, styling, and hit card attributes
- **Responsive Design**: Clean, modern interface with Algolia branding
- **Secure**: API keys and sensitive data stored separately from code
- **Netlify Ready**: Optimized for easy deployment on Netlify

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/tjgreff/algolia-sidebyside-demo.git
cd algolia-sidebyside-demo
```

### 2. Configure Your Search
```bash
cp config.example.js config.js
```

Edit `config.js` with your Algolia credentials:
```javascript
window.ALGOLIA_CONFIG = {
    // Index 1 Configuration
    INDEX1_NAME: 'your-index-name',
    INDEX1_APP_ID: 'YOUR_APP_ID',
    INDEX1_API_KEY: 'your-search-only-api-key',
    INDEX1_TITLE: 'Production Search',
    
    // Index 2 Configuration  
    INDEX2_NAME: 'your-neuralsearch-index',
    INDEX2_APP_ID: 'YOUR_APP_ID_2',
    INDEX2_API_KEY: 'your-search-only-api-key-2',
    INDEX2_TITLE: 'NeuralSearch',
    
    // Customize hit card attributes
    TITLE_ATTRIBUTE: 'title',
    BRAND_ATTRIBUTE: 'brand',
    PRICE_ATTRIBUTE: 'priceBest.standard',
    // ... more configuration options
};
```

### 3. Deploy to Netlify

#### Option A: GitHub Integration (Recommended)
1. Push this repository to your GitHub account
2. Connect your GitHub account to Netlify
3. Create a new site from your repository
4. Netlify will automatically deploy from the `main` branch

#### Option B: Manual Deploy
1. Build the site locally (if needed)
2. Drag and drop the project folder to Netlify's deploy interface

## Configuration Options

### Search Configuration
- `INDEX1_NAME`, `INDEX1_APP_ID`, `INDEX1_API_KEY` - First search configuration
- `INDEX2_NAME`, `INDEX2_APP_ID`, `INDEX2_API_KEY` - Second search configuration
- `INDEX1_TITLE`, `INDEX2_TITLE` - Display names for each panel

### Visual Configuration
- `FALLBACK_IMAGE` - Default image when product images aren't available
- `FAVICON_URL` - Browser tab icon
- `FONT_FAMILY` - Google Font family name

### Hit Card Attributes
- `TITLE_ATTRIBUTE` - Product title field
- `BRAND_ATTRIBUTE` - Brand badge field
- `DESCRIPTION_ATTRIBUTE` - Product description field  
- `PRICE_ATTRIBUTE` - Price field (supports nested properties like `priceBest.standard`)
- `EXTRA_ATTRIBUTE` - Additional attribute to display

## Image Handling

The demo supports Cloudinary image optimization. If your data includes an `images` array with a `source` field, images will be automatically loaded from:
```
https://res.cloudinary.com/rivly/f_auto,q_auto/{images[0].source}
```

## Security

- **API Keys**: Search-only API keys are used and stored in a separate config file
- **Environment Variables**: Sensitive data is kept out of the main HTML file
- **GitHub Safety**: `config.js` should be added to `.gitignore` for production use

## Deployment

### Netlify Environment Variables (Production)
For production deployments, you can set environment variables in Netlify:

1. Go to Site Settings → Environment Variables
2. Add your configuration values:
   - `INDEX1_APP_ID`
   - `INDEX1_API_KEY`
   - `INDEX1_NAME`
   - etc.

3. Modify the config loading to use environment variables in production

### Build Settings
- Build command: None required (static site)
- Publish directory: `/` (root directory)

## Development

### Local Development
1. Clone the repository
2. Copy and configure `config.js`
3. Open `index.html` in a web browser
4. Or use a local server: `python -m http.server 8000`

### Customization
- Modify CSS in `index.html` for styling changes
- Update hit card layout in the `hitTemplate` function
- Add more configuration options in `config.js`

## Troubleshooting

### "Configuration Missing" Error
- Ensure `config.js` exists and is properly formatted
- Check that all required configuration values are provided
- Verify API keys have search permissions

### No Search Results
- Verify your Algolia App ID and API key
- Ensure the index names are correct
- Check that your API key has search permissions for the specified indices

### Images Not Loading
- Verify the `images[0].source` attribute exists in your data
- Check that the Cloudinary URL structure matches your setup
- Ensure the fallback image URL is accessible

## Support

- [Algolia Documentation](https://www.algolia.com/doc/)
- [InstantSearch.js Documentation](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/js/)
- [Netlify Documentation](https://docs.netlify.com/)

## License

MIT License - feel free to use and modify as needed.