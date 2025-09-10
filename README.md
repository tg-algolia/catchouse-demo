# Algolia Side-by-Side Search Demo

A clean, professional demo application to compare search results between two different Algolia configurations side-by-side. Perfect for showcasing the differences between standard search and NeuralSearch, or comparing different indices and configurations.

## Features

- **Side-by-Side Comparison**: Compare two different Algolia search configurations simultaneously
- **Secure Environment Variables**: API keys loaded via Netlify Functions for production security
- **Configurable**: Easy-to-configure search parameters and styling
- **Responsive Design**: Clean, modern interface with Algolia branding
- **Netlify Ready**: Optimized for easy deployment with serverless functions

## Architecture

- **Frontend**: Static HTML with vanilla JavaScript
- **Configuration**: Two-tier system:
  - **Environment Variables**: Sensitive data (API keys, App IDs) via Netlify Functions
  - **Content Variables**: Styling and content configuration in HTML
- **Security**: API keys never exposed in client-side code in production

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/tjgreff/algolia-sidebyside-demo.git
cd algolia-sidebyside-demo
```

### 2. Configure Environment Variables

#### For Local Development:
```bash
cp config.example.js config.js
```

Edit `config.js` with your Algolia credentials:
```javascript
window.ENV_CONFIG = {
    // Index 1 Configuration
    INDEX1_NAME: 'your-index-name',
    INDEX1_APP_ID: 'YOUR_APP_ID',
    INDEX1_API_KEY: 'your-search-only-api-key',
    INDEX1_TITLE: 'Production Search',
    
    // Index 2 Configuration  
    INDEX2_NAME: 'your-neuralsearch-index',
    INDEX2_APP_ID: 'YOUR_APP_ID_2',
    INDEX2_API_KEY: 'your-search-only-api-key-2',
    INDEX2_TITLE: 'NeuralSearch'
};
```

#### For Production (Netlify):
Set environment variables in Netlify Dashboard under **Site Settings → Environment Variables**:
- `INDEX1_NAME`
- `INDEX1_APP_ID` 
- `INDEX1_API_KEY`
- `INDEX1_TITLE`
- `INDEX2_NAME`
- `INDEX2_APP_ID`
- `INDEX2_API_KEY`
- `INDEX2_TITLE`

### 3. Deploy to Netlify

#### Option A: GitHub Integration (Recommended)
1. Push this repository to your GitHub account
2. Connect your GitHub account to Netlify
3. Create a new site from your repository
4. Set environment variables in Netlify dashboard
5. Netlify will automatically deploy with serverless functions

#### Option B: Manual Deploy
1. Set up environment variables in Netlify dashboard first
2. Drag and drop the project folder to Netlify's deploy interface

## Configuration Options

### Environment Variables (Sensitive)
These are loaded via Netlify Functions for security:
- `INDEX1_NAME`, `INDEX1_APP_ID`, `INDEX1_API_KEY`, `INDEX1_TITLE` - First search configuration
- `INDEX2_NAME`, `INDEX2_APP_ID`, `INDEX2_API_KEY`, `INDEX2_TITLE` - Second search configuration

### Content Variables (Public)
These are configured directly in the HTML file:
- `FALLBACK_IMAGE` - Default image when product images aren't available
- `FAVICON_URL` - Browser tab icon
- `FONT_FAMILY` - Google Font family name
- `TITLE_ATTRIBUTE`, `BRAND_ATTRIBUTE`, etc. - Hit card attribute mappings

## Local Development

### Using Netlify CLI (Recommended)
```bash
npm install -g netlify-cli
netlify dev
```
This runs the Netlify Functions locally for full development experience.

### Simple File Server
```bash
python -m http.server 8000
# or
npx http-server
```
This will use the `config.js` fallback for local development.

## Image Handling

The demo supports Cloudinary image optimization. If your data includes an `images` array with a `source` field, images will be automatically loaded from:
```
https://res.cloudinary.com/rivly/f_auto,q_auto/{images[0].source}
```

## Security Features

- **API Keys Protection**: Sensitive data never exposed in client-side code in production
- **Netlify Functions**: Serverless functions handle environment variable loading
- **Fallback Configuration**: Local config file for development (gitignored)
- **CORS Headers**: Proper cross-origin resource sharing configuration

## File Structure

```
algolia-sidebyside-demo/
├── index.html                 # Main application
├── config.example.js          # Environment variables template
├── config.js                  # Local development config (gitignored)
├── netlify/
│   └── functions/
│       └── config.js          # Netlify function for env vars
├── netlify.toml              # Netlify configuration
├── package.json              # Node.js configuration
├── README.md                 # Documentation
└── .gitignore               # Security-focused ignore rules
```

## Deployment

### Netlify Environment Variables
Set these in your Netlify dashboard:

1. Go to **Site Settings → Environment Variables**
2. Add your configuration values:
   - `INDEX1_NAME`: Your first index name
   - `INDEX1_APP_ID`: Your first Algolia App ID
   - `INDEX1_API_KEY`: Your first search-only API key
   - `INDEX1_TITLE`: Display name for first panel
   - `INDEX2_NAME`: Your second index name
   - `INDEX2_APP_ID`: Your second Algolia App ID
   - `INDEX2_API_KEY`: Your second search-only API key
   - `INDEX2_TITLE`: Display name for second panel

### Build Settings
- **Build command**: None required (static site with functions)
- **Publish directory**: `.` (root directory)
- **Functions directory**: `netlify/functions` (automatic)

## Customization

### Styling
Modify CSS directly in `index.html` under the `<style>` section.

### Hit Card Layout
Update the `hitTemplate` function in `index.html` to change how results are displayed.

### Content Configuration  
Modify the `CONTENT_CONFIG` object in `index.html` for:
- Fallback images
- Font families
- Hit card attribute mappings

## Troubleshooting

### "Configuration Error" Message
- **Production**: Check that environment variables are set in Netlify dashboard
- **Local**: Ensure `config.js` exists and is properly formatted
- **Functions**: Verify Netlify functions are deploying correctly

### No Search Results
- Verify your Algolia App IDs and API keys
- Ensure the index names are correct
- Check that API keys have search permissions for the specified indices

### Images Not Loading
- Verify the `images[0].source` attribute exists in your data
- Check that the Cloudinary URL structure matches your setup
- Ensure the fallback image URL is accessible

### Local Development Issues
- Use `netlify dev` for full function support
- Ensure Node.js version 18+ is installed
- Check that `config.js` exists for local fallback

## Support

- [Algolia Documentation](https://www.algolia.com/doc/)
- [InstantSearch.js Documentation](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/js/)
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)

## License

MIT License - feel free to use and modify as needed.