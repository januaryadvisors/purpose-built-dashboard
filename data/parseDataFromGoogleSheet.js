const fs = require('fs');
const fetch = require('node-fetch');

const showExpectedColumns = () => {
  console.log('=== EXPECTED COLUMN HEADERS ===\n');
  
  console.log('1. LOGIC MODEL CSV (logic_model_expanded.csv):');
  console.log('   Expected columns:');
  console.log('   - Inputs');
  console.log('   - Strategy');
  console.log('   - Paragraph description');
  console.log('   - Output');
  console.log('   - Immediate Outcomes');
  console.log('   - Intermediate Outcomes');
  console.log('   - Long-term Outcomes');
  console.log('   - Partners');
  console.log('   - Impact Goal');
  console.log('');
  
  console.log('2. RESEARCH CSV (research.csv):');
  console.log('   Expected columns:');
  console.log('   - Strategy');
  console.log('   - Related Outcome');
  console.log('   - Citation');
  console.log('   - Citation Link');
  console.log('');
  
  console.log('3. HEADER TOOLTIPS CSV (header_tooltips.csv):');
  console.log('   Expected format: Two columns with header names and descriptions');
  console.log('   Example:');
  console.log('   Inputs,The resources and materials needed to run the program.');
  console.log('   Partners,The organizations and individuals who collaborate...');
  console.log('');
  
  console.log('4. INPUT TOOLTIPS CSV (input_tooltips.csv):');
  console.log('   Expected columns:');
  console.log('   - Inputs Condensed');
  console.log('   - Description');
  console.log('');
  
  console.log('=== GOOGLE SHEET SETUP INSTRUCTIONS ===');
  console.log('');
  console.log('1. Make sure your Google Sheet is set to "Anyone with the link can view"');
  console.log('   - Go to Share button in top right');
  console.log('   - Click "Change to anyone with the link"');
  console.log('   - Set to "Viewer"');
  console.log('');
  console.log('2. Organize your data into 4 separate sheets (tabs):');
  console.log('   - Sheet 1: Logic model data');
  console.log('   - Sheet 2: Research data');
  console.log('   - Sheet 3: Header tooltips');
  console.log('   - Sheet 4: Input tooltips');
  console.log('');
  console.log('3. Ensure column headers match exactly (case-sensitive)');
  console.log('');
};

const parseFromGoogleSheet = async () => {
  const d3dsv = await import('d3-dsv');

  // Google Sheet ID from your URL
  const SHEET_ID = '1sSudr0w4J2Bc-CbY_abNqglTn9sEu-imJ8MydYHOT7A';
  
  // Function to fetch CSV data from Google Sheet using node-fetch
  const fetchCSVFromSheet = async (sheetId, gid = 0) => {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.text();
      return data;
    } catch (error) {
      console.error(`Error fetching sheet ${gid}:`, error.message);
      throw error;
    }
  };

  try {
    // Fetch data from Google Sheets using the correct gid values
    console.log('Fetching data from Google Sheets...\n');
    
    const modelRaw = await fetchCSVFromSheet(SHEET_ID, 1482534373); // Sheet 1: Logic model data
    const researchRaw = await fetchCSVFromSheet(SHEET_ID, 1030263523); // Sheet 2: Research data
    const headerTooltipsRaw = await fetchCSVFromSheet(SHEET_ID, 459672780); // Sheet 3: Header tooltips
    const inputTooltipsRaw = await fetchCSVFromSheet(SHEET_ID, 304412178); // Sheet 4: Input tooltips

    console.log('✓ Successfully fetched all sheets\n');

    const arrayify = multilineRow => {
      // Add null/undefined check
      if (!multilineRow || multilineRow === '') {
        return [];
      }
      return multilineRow
        .split('\n')
        .map(item => item.trim())
        .filter(item => item);
    };

    const getUnique = (data, key) => {
      return [...new Set(data.map(row => arrayify(row[key])).flat())];
    };

    const model = d3dsv.csvParse(modelRaw);
    const research = d3dsv.csvParse(researchRaw);
    const headerTooltips = d3dsv.csvParseRows(headerTooltipsRaw);
    const inputTooltips = d3dsv.csvParse(inputTooltipsRaw);

    // Debug: Log the parsed data structure
    console.log('Data summary:');
    console.log(`- Logic model: ${model.length} rows`);
    console.log(`- Research: ${research.length} rows`);
    console.log(`- Header tooltips: ${headerTooltips.length} rows`);
    console.log(`- Input tooltips: ${inputTooltips.length} rows\n`);

    const inputs = getUnique(model, 'Inputs');
    const partners = getUnique(model, 'Partners');
    const outputs = getUnique(model, 'Output');
    const immediateOutputs = getUnique(model, 'Immediate Outcomes');
    const intermediateOutputs = getUnique(model, 'Intermediate Outcomes');
    const longTermOutputs = getUnique(model, 'Long-term Outcomes');

    const strategies = Object.fromEntries(
      model.map(row => [
        row.Strategy.trim(),
        {
          label: row.Strategy,
          details: row['Paragraph description'],
          outputs: arrayify(row.Output).map(output => outputs.indexOf(output)),
          immediateOutputs: arrayify(row['Immediate Outcomes']).map(output =>
            immediateOutputs.indexOf(output),
          ),
          intermediateOutputs: arrayify(row['Intermediate Outcomes']).map(output =>
            intermediateOutputs.indexOf(output),
          ),
          // All long term outputs are associated with every strategy
          longTermOutputs: longTermOutputs.map((_, i) => i),
          partners: arrayify(row.Partners).map(partner => partners.indexOf(partner)),
          research: [],
        },
      ]),
    );

    const data = {
      headerTooltips: headerTooltips.map(t => t[1]),
      inputs,
      inputTooltips: inputs.map(
        input => inputTooltips.find(t => t['Inputs Condensed'] === input)['Description'],
      ),
      strategies,
      partners,
      outputs,
      immediateOutputs,
      intermediateOutputs,
      longTermOutputs,
    };

    research.forEach(r => {
      const researchStrategy = r.Strategy.trim();
      if (!data.strategies[researchStrategy]) {
        console.log(`No strategy found for ${researchStrategy}`);
        return;
      }
      const citationSanitized = r['Citation'].split('http');
      if (citationSanitized.length !== 2) {
        console.log('Error processing citation', r['Citation']);
      }
      const relatedOutcome = r['Related Outcome'].trim();
      const researchDatum = {
        citation: citationSanitized[0],
        citationLinkText: 'http' + citationSanitized[1],
        citationLink: r['Citation Link'],
        relatedOutcomes: [relatedOutcome],
      };
      const match = data.strategies[researchStrategy].research.find(
        rs => rs.citation === researchDatum.citation,
      );
      if (!match) {
        data.strategies[researchStrategy].research.push(researchDatum);
      } else {
        if (!match.relatedOutcomes.includes(relatedOutcome)) {
          match.relatedOutcomes.push(relatedOutcome);
        }
      }
    });

    Object.entries(data.strategies).forEach(([_, strategy], i) => {
      // Alphabetize research ignoring any leading smartquotes
      strategy.research.sort((a, b) => {
        return a.citation.replace('"', '').localeCompare(b.citation.replace('"', ''));
      });
    });

    fs.writeFileSync('../docs/assets/data.json', JSON.stringify(data), 'utf8');
    console.log('✅ Data successfully parsed from Google Sheet and saved to data.json');
  } catch (error) {
    console.error('Error fetching or parsing data from Google Sheet:', error);
  }
};

// Show expected columns first, then run the parser
showExpectedColumns();
console.log('=== STARTING PARSING ===\n');
parseFromGoogleSheet(); 