// Example Node.js/Express server for securely accessing private Google Sheets
// This is a REFERENCE IMPLEMENTATION - not meant to be run directly

const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();

// Enable CORS only for your domain in production
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:8000'
}));

// Google Sheets API setup
const sheets = google.sheets('v4');

async function getGoogleAuth() {
  // Option 1: Service Account (recommended for server-side)
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_CREDENTIALS_PATH, // Path to service account JSON
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  
  // Option 2: OAuth2 (if you need user-specific access)
  // const auth = new google.auth.OAuth2(
  //   process.env.GOOGLE_CLIENT_ID,
  //   process.env.GOOGLE_CLIENT_SECRET,
  //   process.env.GOOGLE_REDIRECT_URI
  // );
  
  return auth;
}

// API endpoint to fetch dashboard data
app.get('/api/dashboard-data', async (req, res) => {
  try {
    const auth = await getGoogleAuth();
    
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    // Define sheet ranges
    const ranges = [
      'Logic Model Expanded!A:Z',  // Adjust ranges as needed
      'Research!A:Z',
      'Header Tooltips!A:Z',
      'Input Tooltips!A:Z'
    ];
    
    // Fetch all sheets in one API call
    const response = await sheets.spreadsheets.values.batchGet({
      auth,
      spreadsheetId,
      ranges,
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING'
    });
    
    // Transform the data to match your dashboard format
    const [modelData, researchData, headerTooltipsData, inputTooltipsData] = response.data.valueRanges;
    
    // Convert to CSV-like format or directly process
    const processedData = processSheetData({
      model: modelData.values,
      research: researchData.values,
      headerTooltips: headerTooltipsData.values,
      inputTooltips: inputTooltipsData.values
    });
    
    // Set cache headers (optional)
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
    
    res.json(processedData);
    
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch data',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

function processSheetData({ model, research, headerTooltips, inputTooltips }) {
  // Convert Google Sheets values to your dashboard data format
  // This function should implement the same logic as your parseData.js
  
  // Convert rows to objects with headers
  const modelObjects = arrayToObjects(model);
  const researchObjects = arrayToObjects(research);
  const inputTooltipsObjects = arrayToObjects(inputTooltips);
  
  // Apply the same processing logic as parseData.js
  // ... (implement your parsing logic here)
  
  return {
    // Return the same structure as your current data.json
    headerTooltips: headerTooltips.map(t => t[1]),
    inputs: [], // processed inputs
    inputTooltips: [], // processed tooltips
    strategies: {}, // processed strategies
    partners: [], // processed partners
    outputs: [], // processed outputs
    immediateOutputs: [],
    intermediateOutputs: [],
    longTermOutputs: []
  };
}

function arrayToObjects(rows) {
  if (!rows || rows.length === 0) return [];
  
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Dashboard API server running on port ${PORT}`);
});

// Required environment variables:
// - GOOGLE_SHEET_ID: Your Google Sheets ID
// - GOOGLE_CREDENTIALS_PATH: Path to service account JSON file
// - ALLOWED_ORIGIN: Your dashboard domain
// - NODE_ENV: 'production' or 'development'

// To use this with your dashboard:
// 1. In config.js, set USE_LIVE_GOOGLE_SHEETS: false
// 2. Uncomment API_BASE_URL: '/api/dashboard-data'
// 3. Deploy this server and update the API_BASE_URL to your server URL 