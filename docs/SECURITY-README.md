# Dashboard Security Guide

## Current Setup: Client-Side Google Sheets Integration

The dashboard now supports live data updates from Google Sheets with configurable security options.

## Security Considerations

### ⚠️ Current Implementation (Public Sheets Only)

**What's visible to users:**
- Google Sheets URL and Sheet ID in browser developer tools
- All API requests to Google Sheets in network tab
- Sheet structure and content (if public)

**Risk Level: LOW** (for public data)
- ✅ Suitable for public/open data
- ✅ No server infrastructure needed
- ⚠️ Sheet URLs are exposed in client code
- ❌ Cannot work with private sheets

### 🔒 For Private/Sensitive Data

**The current client-side approach CANNOT be used with private Google Sheets** because:
1. Authentication credentials would be exposed in browser
2. CORS policies block cross-origin requests to private sheets
3. No way to securely store API keys client-side

## Configuration Options

### Quick Setup (Public Sheets)

1. **Enable/Disable Live Updates:**
   ```javascript
   // In config.js
   USE_LIVE_GOOGLE_SHEETS: true  // Live from Google Sheets
   USE_LIVE_GOOGLE_SHEETS: false // Use local data.json
   ```

2. **Configure Caching:**
   ```javascript
   CACHE_DURATION: 5 * 60 * 1000  // 5 minutes
   CACHE_DURATION: 0              // No caching
   ```

3. **Update Sheet References:**
   ```javascript
   GOOGLE_SHEET_ID: 'your-sheet-id-here',
   SHEET_GIDS: {
     logic_model_expanded: '0',    // Update these GIDs
     research: '1578984965',       // to match your sheets
     // ...
   }
   ```

## Production Security Options

### Option 1: Server-Side Proxy (Recommended for Private Sheets)

**Benefits:**
- ✅ Works with private Google Sheets
- ✅ Credentials stay on server
- ✅ Can implement rate limiting
- ✅ Can add authentication/authorization
- ✅ Better error handling

**Setup:**
1. Use the `server-proxy-example.js` as a starting point
2. Set up Google Service Account credentials
3. Deploy the API server
4. Update config:
   ```javascript
   USE_LIVE_GOOGLE_SHEETS: false
   API_BASE_URL: 'https://your-api-server.com/api/dashboard-data'
   ```

**Required Environment Variables:**
```bash
GOOGLE_SHEET_ID=your-private-sheet-id
GOOGLE_CREDENTIALS_PATH=/path/to/service-account.json
ALLOWED_ORIGIN=https://your-dashboard-domain.com
NODE_ENV=production
```

### Option 2: Static Export with CI/CD

**Benefits:**
- ✅ Works with private sheets
- ✅ No runtime server needed
- ✅ Very fast loading
- ✅ Can version control data changes

**Setup:**
1. Create a GitHub Action/CI pipeline
2. Use `parseDataFromGoogleSheet.js` to fetch and process data
3. Commit updated `data.json` to repository
4. Deploy static files

**Example GitHub Action:**
```yaml
name: Update Dashboard Data
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  update-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: node data/parseDataFromGoogleSheet.js
        env:
          GOOGLE_CREDENTIALS: ${{ secrets.GOOGLE_CREDENTIALS }}
      - run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add docs/assets/data.json
          git commit -m "Update dashboard data" || exit 0
          git push
```

### Option 3: Hybrid Approach

**Benefits:**
- ✅ Fast initial load (cached data)
- ✅ Fresh data when needed
- ✅ Graceful fallbacks

**Setup:**
1. Use static `data.json` for initial load
2. Fetch fresh data in background
3. Update UI when new data available
4. Cache for subsequent visits

## Implementation Examples

### Making Sheets Private but Accessible

1. **Service Account Method:**
   - Create Google Cloud Project
   - Enable Google Sheets API
   - Create Service Account
   - Share sheet with service account email
   - Use server-side proxy

2. **Published CSV Method:**
   - File → Share → Publish to web
   - Choose "Comma-separated values (.csv)"
   - This makes data public but hides sheet structure

### Rate Limiting Considerations

Google Sheets has API limits:
- **Read requests:** 100 requests per 100 seconds per user
- **CSV export:** Generally more permissive but not guaranteed

For high-traffic sites, consider:
- Server-side caching
- CDN for static data
- Request batching

## Migration Guide

### From Current Setup to Private Sheets

1. **Immediate (Low Security):**
   ```javascript
   // config.js
   USE_LIVE_GOOGLE_SHEETS: false
   ```
   Uses local `data.json`, update manually

2. **Short Term (Medium Security):**
   - Set up server-side proxy
   - Deploy API endpoint
   - Update config to use API

3. **Long Term (High Security):**
   - Implement authentication
   - Add request signing
   - Use CDN and caching strategies
   - Monitor and alert on usage

## Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Usually means trying to access private sheet from client
   - Solution: Use server-side proxy

2. **Rate Limiting:**
   - Reduce request frequency
   - Implement caching
   - Use server-side batching

3. **Authentication Errors:**
   - Check service account permissions
   - Verify sheet sharing settings
   - Ensure correct scopes

### Debug Mode

Enable detailed logging:
```javascript
// Add to config.js
DEBUG_MODE: true
```

This will log all requests, responses, and timing information to browser console.

## Best Practices Summary

1. **For Public Data:** Current client-side approach is fine
2. **For Private Data:** Always use server-side proxy
3. **For Production:** Implement proper caching and monitoring
4. **For High Traffic:** Consider static generation with CI/CD
5. **Always:** Keep credentials secure and use environment variables 