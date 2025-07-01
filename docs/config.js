// Dashboard Configuration
// This file can be easily modified to change data sources and behavior

window.DASHBOARD_CONFIG = {
  // === DATA SOURCE SETTINGS ===
  
  // Set to false to use local data.json instead of Google Sheets
  USE_LIVE_GOOGLE_SHEETS: true,
  
  // Cache duration in milliseconds (5 minutes)
  // Set to 0 to disable caching
  CACHE_DURATION: 5 * 60 * 1000,
  
  // === GOOGLE SHEETS SETTINGS ===
  // WARNING: These URLs are visible in client-side code
  // Only use with PUBLIC Google Sheets for security
  
  GOOGLE_SHEET_ID: '1xMLrp1nNKhQeHAnBdN-BpDdjVj_uuLIV06hKPe8wtBk',
  
  SHEET_GIDS: {
    logic_model_expanded: '1442531113',  // Logic model Expanded sheet
    research: '477836847',              // Use same sheet for now (no research data)
    header_tooltips: '459672780',       // Use same sheet for now  
    input_tooltips: '304412178'         // Use same sheet for now
  },
  
  // === SECURITY OPTIONS ===
  
  // For PRIVATE Google Sheets, you have these options:
  // 1. Use a server-side proxy (recommended)
  // 2. Use Google Sheets API with OAuth (complex client-side setup)
  // 3. Publish sheets as CSV (makes them public)
  
  // Example server-side API endpoint (uncomment to use)
  // API_BASE_URL: '/api/dashboard-data',
  
  // === PERFORMANCE SETTINGS ===
  
  // Show loading indicators
  SHOW_LOADING_INDICATORS: true,
  
  // Show cache status
  SHOW_CACHE_STATUS: true,
  
  // Retry failed requests
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000, // milliseconds
};

// === SECURITY RECOMMENDATIONS ===
/*

FOR PRODUCTION USE:

1. PRIVATE SHEETS - Create a server-side API:
   - Set USE_LIVE_GOOGLE_SHEETS: false
   - Create an API endpoint that fetches from Google Sheets server-side
   - Use environment variables for credentials
   - Enable CORS only for your domain

2. PUBLIC SHEETS - Current approach is fine but consider:
   - Rate limiting on your server
   - Monitoring for unusual traffic
   - Regular review of sheet permissions

3. ENHANCED SECURITY:
   - Use Content Security Policy (CSP) headers
   - Implement request signing/validation
   - Add user authentication if needed
   - Consider using a CDN for static files

EXAMPLE SERVER-SIDE SETUP (Node.js/Express):

```javascript
app.get('/api/dashboard-data', async (req, res) => {
  try {
    // Server-side Google Sheets API call with credentials
    const data = await fetchFromPrivateSheets();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});
```

*/ 