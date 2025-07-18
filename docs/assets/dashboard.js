window.onload = async function () {
  
  // ========================================
  // CONSTANTS & CONFIGURATION
  // ========================================
  
  /** Namespace used for CSS classes to prevent collision */
  const NAMESPACE = 'momentum-dashboard';
  
  /** Dashboard DOM element */
  const dashboard = document.getElementById(NAMESPACE);
  
  /** Column IDs for consistent reference */
  const COLUMN_IDS = {
    input: `${NAMESPACE}-input`,
    pbcComponents: `${NAMESPACE}-pbc-components`,
    partners: `${NAMESPACE}-partners`,
    strategies: `${NAMESPACE}-strategies`,
    outputs: `${NAMESPACE}-outputs`,
    immediateOutputs: `${NAMESPACE}-immediate-outputs`,
    intermediateOutputs: `${NAMESPACE}-intermediate-outputs`,
    longTermOutputs: `${NAMESPACE}-long-term-outputs`
  };
  
  /** CSS class for data text elements */
  const TEXT_CLASS = `${NAMESPACE}-datum`;
  
  
  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  
  /**
   * Creates a DOM element with namespace-aware ID and class
   * @param {Element} parent - Parent element to append to
   * @param {string} type - HTML tag type
   * @param {string} id - Element ID (will be prefixed with namespace)
   * @param {string} className - CSS class name (will be prefixed with namespace)
   * @returns {Element} Created element
   */
  const createElement = (parent, type, id, className) => {
    const el = document.createElement(type);
    if (id) {
      el.id = `${NAMESPACE}-${id}`;
    }
    if (className) {
      el.className = `${NAMESPACE}-${className}`;
    }
    parent.appendChild(el);
    return el;
  };

  /**
   * Adds a tooltip to an element using the TooltipManager
   * @param {Element} parent - Parent element for the tooltip icon
   * @param {string} tooltipText - Text to display in tooltip
   * @param {Element} root - Root element for tooltip positioning
   */
  const addTooltip = (parent, tooltipText, root) => {
    return window.TooltipManager.addTooltip(parent, tooltipText, root, NAMESPACE);
  };

  
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  /** Whether a strategy has been clicked/selected */
  let isStrategySelected = false;
  
  /** Whether a partner has been clicked/selected */
  let isPartnerSelected = false;
  
  /** Global data object loaded from external source */
  let data = null;
  
  /** Array of strategy objects for easy access */
  let strategyList = [];

  
  // ========================================
  // COLOR & STYLING WRAPPER FUNCTIONS
  // ========================================
  
  /** Gets the color for a PBC Component using ColorManager */
  const getPBCComponentColor = (pbcComponent) => {
    return window.ColorManager.getPBCColor(pbcComponent, data);
  };

  /** Generates a gradient based on a PBC component color */
  const createPBCGradient = (baseColor) => {
    return window.ColorManager.generatePBCGradient(baseColor);
  };

  /** Updates the entire dashboard's color scheme */
  const updateDashboardColors = (newGradient) => {
    const columnIds = Object.values(COLUMN_IDS);
    return window.ColorManager.updateBrandGradient(newGradient, NAMESPACE, columnIds, columns);
  };

  
  // ========================================
  // FILTER WRAPPER FUNCTIONS  
  // ========================================
  
  /** Filters the Partners column based on selected PBC Components */
  const applyPartnerFiltering = () => {
    return window.FilterManager.filterPartnersFromPBC(NAMESPACE, COLUMN_IDS.partners, data);
  };

  /** Clears all styling from Partner column items */
  const clearPartnerStyling = () => {
    return window.FilterManager.clearPartnerColumnColors(NAMESPACE, COLUMN_IDS.partners);
  };

  /**
   * Toggles column visibility and creates horizontal filter bars
   * @param {string} columnId - ID of column to toggle
   * @param {string} columnLabel - Display label for the column
   * @param {string} dataKey - Key in data object for this column type
   * @param {number} colorIndex - Index in color gradient for this column
   * @param {boolean} hideColumn - Whether to hide the column
   */
  const toggleColumnVisibility = (columnId, columnLabel, dataKey, colorIndex, hideColumn) => {
    const config = {
      columnId, columnLabel, dataKey, colorIndex, hideColumn,
      namespace: NAMESPACE, 
      strategiesId: COLUMN_IDS.strategies, 
      partnersId: COLUMN_IDS.partners, 
      outputsId: COLUMN_IDS.outputs, 
      immediateOutputsId: COLUMN_IDS.immediateOutputs, 
      intermediateOutputsId: COLUMN_IDS.intermediateOutputs, 
      longTermOutputsId: COLUMN_IDS.longTermOutputs,
      dashboard, dashboardWrapper, data, strategyValues: strategyList,
      addElement: createElement, 
      getPBCColor: getPBCComponentColor, 
      generatePBCGradient: createPBCGradient, 
      updateBrandGradient: updateDashboardColors, 
      updateButtonVisibility: updateNavigationButtons
    };
    return window.FilterManager.toggleColumn(config);
  };

  
  // ========================================
  // UI CREATION & LAYOUT
  // ========================================
  
  /** Create main dashboard layout containers */
  const dashboardWrapper = createElement(dashboard, 'div', 'body-wrapper');
  const headersWrapper = createElement(dashboardWrapper, 'div', 'header-wrapper');
  const columnsWrapper = createElement(dashboardWrapper, 'div', 'columns-wrapper');

  /** Initialize column configuration with default colors */
  const brandGradient = window.ColorManager.getOriginalBrandGradient();

  const columns = {
    [COLUMN_IDS.pbcComponents]: {
      columnColor: brandGradient[0],
      label: 'PBC Components',
    },
    [COLUMN_IDS.partners]: {
      columnColor: brandGradient[1],
      label: 'Partners',
    },
    [COLUMN_IDS.strategies]: {
      columnColor: brandGradient[2],
      label: 'Strategies',
    },
    [COLUMN_IDS.outputs]: {
      columnColor: brandGradient[3],
      label: 'Outputs',
    },
    [COLUMN_IDS.immediateOutputs]: {
      columnColor: brandGradient[4],
      label: 'Immediate Outcomes',
    },
    [COLUMN_IDS.intermediateOutputs]: {
      columnColor: brandGradient[5],
      label: 'Intermediate Outcomes',
    },
    [COLUMN_IDS.longTermOutputs]: {
      columnColor: brandGradient[6],
      label: 'Long-Term Outcomes',
    },
  };

  /**
   * Creates a modal dialog for displaying strategy details
   * @returns {Object} Object containing modal elements
   */
  const createStrategyModal = () => {
    const modal = createElement(document.body, 'div', 'modal');
    modal.onclick = () => {
      modal.scrollTop = 0;
      modal.style.display = 'none';
    };

    const modalContent = createElement(modal, 'div', 'modal-content');
    modalContent.style.border = `6px solid ${window.ColorManager.getCurrentBrandGradient()[0]}`;
    modalContent.style.background = '#FFF';
    modalContent.onclick = e => e.stopPropagation();

    const closeWrapper = createElement(modalContent, 'div', 'close-wrapper');
    const closeButton = createElement(closeWrapper, 'button');
    closeButton.textContent = 'Close';
    closeButton.onclick = () => {
      modal.scrollTop = 0;
      modal.style.display = 'none';
    };

    const modalHeader = createElement(modalContent, 'div', 'modal-header');
    const researchWrapper = createElement(modalContent, 'div');
    const researchParagraph = createElement(researchWrapper, 'div');
    const researchHeader = createElement(researchWrapper, 'div', 'research-header');
    researchHeader.innerText = 'Research';
    const researchBody = createElement(researchWrapper, 'div');
    
    return { modal, modalHeader, researchParagraph, researchBody };
  };

  const { modal, modalHeader, researchParagraph, researchBody } = createStrategyModal();

  
  // ========================================
  // DATA LOADING & PROCESSING
  // ========================================
  
  /** Load data from external source (Google Sheets or local file) */
  try {
    // Use external configuration
    const CONFIG = window.DASHBOARD_CONFIG || {
      USE_LIVE_GOOGLE_SHEETS: false,
      CACHE_DURATION: 0
    };

    // Clear all cache for debugging
    console.log('🗑️ Clearing all cached data for debugging');
    localStorage.clear();
    
    const now = Date.now();
    
    if (CONFIG.USE_LIVE_GOOGLE_SHEETS) {
      // Add loading indicator
      const loadingDiv = createElement(dashboardWrapper, 'div', 'loading');
      loadingDiv.style.textAlign = 'center';
      loadingDiv.style.padding = '40px';
      loadingDiv.style.fontSize = '18px';
      loadingDiv.innerText = 'Loading fresh data from Google Sheets...';

      // Function to fetch and parse CSV
      const fetchCSV = async (gid) => {
        const url = `https://docs.google.com/spreadsheets/d/${CONFIG.GOOGLE_SHEET_ID}/export?format=csv&gid=${gid}`;
        console.log(`🌐 Fetching sheet gid ${gid}: ${url}`);
        
        try {
          const response = await fetch(url);
          console.log(`📡 Response status for gid ${gid}:`, response.status, response.statusText);
          console.log(`📡 Response headers for gid ${gid}:`, [...response.headers.entries()]);
          console.log(`📡 Response URL for gid ${gid}:`, response.url);
          
          if (!response.ok) {
            console.error(`❌ Bad response for gid ${gid}:`, response.status, response.statusText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const text = await response.text();
          console.log(`✅ Successfully fetched gid ${gid}, data length:`, text.length);
          console.log(`📄 First 200 chars of gid ${gid}:`, text.substring(0, 200));
          
          // Check if we got redirected to a login page
          if (text.includes('accounts.google.com') || text.includes('ServiceLogin')) {
            console.error(`❌ gid ${gid} returned login page - sheet may not be public`);
            throw new Error('Redirected to login page - sheet not public');
          }
          
          // Check if we got HTML instead of CSV
          if (text.trim().startsWith('<')) {
            console.error(`❌ gid ${gid} returned HTML instead of CSV`);
            console.log(`🔍 HTML content:`, text.substring(0, 500));
            throw new Error('Received HTML instead of CSV - check sheet permissions');
          }
          
          return text;
        } catch (fetchError) {
          console.error(`❌ Fetch error for gid ${gid}:`, fetchError);
          throw fetchError;
        }
      };

      // Fetch all sheets in parallel
      const [modelRaw, researchRaw, headerTooltipsRaw, inputTooltipsRaw] = await Promise.all([
        fetchCSV(CONFIG.SHEET_GIDS.logic_model_expanded),
        fetchCSV(CONFIG.SHEET_GIDS.research),
        fetchCSV(CONFIG.SHEET_GIDS.header_tooltips),
        fetchCSV(CONFIG.SHEET_GIDS.input_tooltips)
      ]);

      console.log('🔍 RAW DATA FROM LOGIC MODEL EXPANDED SHEET:');
      console.log('📄 First 1000 characters:', modelRaw.substring(0, 1000));
      console.log('📊 Total length:', modelRaw.length);
      console.log('📋 First 5 lines:');
      modelRaw.split('\n').slice(0, 5).forEach((line, i) => {
        console.log(`Line ${i + 1}:`, line);
      });

      // Improved CSV parser to handle multiline fields
      const parseCSV = (csvText) => {
        const rows = [];
        let currentRow = [];
        let currentField = '';
        let inQuotes = false;
        let i = 0;
        
        while (i < csvText.length) {
          const char = csvText[i];
          
          if (char === '"') {
            if (inQuotes && csvText[i + 1] === '"') {
              // Handle escaped quotes ""
              currentField += '"';
              i++; // Skip next quote
            } else {
              // Toggle quote state
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            // End of field
            currentRow.push(currentField.trim());
            currentField = '';
          } else if (char === '\n' && !inQuotes) {
            // End of row
            currentRow.push(currentField.trim());
            if (currentRow.some(field => field.length > 0)) {
              rows.push(currentRow);
            }
            currentRow = [];
            currentField = '';
          } else {
            // Regular character (including newlines inside quotes)
            currentField += char;
          }
          i++;
        }
        
        // Handle last field/row
        if (currentField || currentRow.length > 0) {
          currentRow.push(currentField.trim());
          if (currentRow.some(field => field.length > 0)) {
            rows.push(currentRow);
          }
        }
        
        if (rows.length === 0) return [];
        
        const headers = rows[0].map(h => h.replace(/"/g, '').trim());
        
        return rows.slice(1).map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = (row[index] || '').replace(/"/g, '').trim();
          });
          return obj;
        });
      };

      const parseCSVRows = (csvText) => {
        return csvText.split('\n')
          .filter(line => line.trim())
          .map(line => {
            const values = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim().replace(/"/g, ''));
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim().replace(/"/g, ''));
            return values;
          });
      };

      // Parse the CSV data
      const model = parseCSV(modelRaw);
      const research = parseCSV(researchRaw);
      const headerTooltips = parseCSVRows(headerTooltipsRaw);
      const inputTooltips = parseCSV(inputTooltipsRaw);

      console.log('🗃️ PARSED LOGIC MODEL DATA:');
      console.log('📝 Number of rows:', model.length);
      console.log('🏷️ Column headers:', Object.keys(model[0] || {}));
      console.log('📋 First 3 rows of parsed data:');
      model.slice(0, 3).forEach((row, i) => {
        console.log(`Row ${i + 1}:`, row);
      });
      
      // Check specifically for PBC Components column
      if (model.length > 0) {
        const hasePBCColumn = Object.keys(model[0]).find(key => 
          key.toLowerCase().includes('pbc') || key.toLowerCase().includes('component')
        );
        console.log('🔍 PBC Components column found:', hasePBCColumn);
        if (hasePBCColumn) {
          console.log('📊 PBC Components sample values:');
          model.slice(0, 5).forEach((row, i) => {
            console.log(`  Row ${i + 1} PBC:`, row[hasePBCColumn]);
          });
        }
      }

      // Helper functions from parseData.js
      const arrayify = multilineRow => {
        return multilineRow
          .split('\n')
          .map(item => item.trim())
          .filter(item => item);
      };

      const getUnique = (data, key) => {
        return [...new Set(data.map(row => arrayify(row[key])).flat())];
      };

      // Extract unique values
      const inputs = getUnique(model, 'Inputs');
      const pbcComponents = getUnique(model, 'PBC Component');
      const partners = getUnique(model, 'Partners');
      const outputs = getUnique(model, 'Output');
      const immediateOutputs = getUnique(model, 'Immediate Outcomes');
      const intermediateOutputs = getUnique(model, 'Intermediate Outcomes');
      const longTermOutputs = getUnique(model, 'Long-term Outcomes');

      // Build strategies object
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
            longTermOutputs: arrayify(row['Long-term Outcomes']).map(output =>
              longTermOutputs.indexOf(output),
            ),
            partners: arrayify(row.Partners).map(partner => partners.indexOf(partner)),
            pbcComponents: arrayify(row['PBC Component'] || '').map(component => pbcComponents.indexOf(component)),
            research: [],
          },
        ]),
      );

      // Process research data with safety checks
      research.forEach((r, index) => {        
        // Safety checks for required fields
        if (!r.Strategy) {
          console.log(`⚠️ Skipping research item ${index} - missing Strategy`);
          return;
        }
        
        if (!r.Citation) {
          console.log(`⚠️ Skipping research item ${index} - missing Citation`);
          return;
        }
        
        const researchStrategy = r.Strategy.trim();
        if (!strategies[researchStrategy]) {
          console.log(`❌ No strategy found for ${researchStrategy}`);
          return;
        }
        
        const citationSanitized = r.Citation.split('http');
        if (citationSanitized.length !== 2) {
          console.log('⚠️ Error processing citation', r.Citation);
          return; // Skip this item instead of continuing with bad data
        }
        
        const relatedOutcome = (r['Related Outcome'] || '').trim();
        const researchDatum = {
          citation: citationSanitized[0],
          citationLinkText: 'http' + citationSanitized[1],
          citationLink: r['Citation Link'] || '',
          relatedOutcomes: [relatedOutcome],
        };
        
        const match = strategies[researchStrategy].research.find(
          rs => rs.citation === researchDatum.citation,
        );
        if (!match) {
          strategies[researchStrategy].research.push(researchDatum);
        } else {
          if (!match.relatedOutcomes.includes(relatedOutcome)) {
            match.relatedOutcomes.push(relatedOutcome);
          }
        }
      });

      // Sort research citations alphabetically
      Object.entries(strategies).forEach(([_, strategy], i) => {
        strategy.research.sort((a, b) => {
          return a.citation.replace('"', '').localeCompare(b.citation.replace('"', ''));
        });
      });
      // Build final data object
      data = {
        headerTooltips: headerTooltips.map(t => t[1]),
        inputs,
        inputTooltips: inputs.map(input => {
          const tooltip = inputTooltips.find(t => t['Inputs Condensed'] === input);
          return tooltip ? (tooltip['Description'] || input) : input;
        }),
        pbcComponents,
        strategies,
        partners,
        outputs,
        immediateOutputs,
        intermediateOutputs,
        longTermOutputs,
      };

      console.log('🎯 FINAL DATA OBJECT:');
      console.log('📊 PBC Components in data:', data.pbcComponents);
      console.log('🏗️ Sample strategy with PBC mapping:', Object.values(data.strategies)[0]);

      console.log('Data loaded from Google Sheets:', data);
      
      // Cache the data
      localStorage.setItem('dashboard-data', JSON.stringify(data));
      localStorage.setItem('dashboard-data-timestamp', now.toString());
      
      // Remove loading indicator
      loadingDiv.remove();
    } else {
      // Fall back to local data.json when live sheets are disabled
      const dataRaw = await fetch('./assets/data.json');
      data = await dataRaw.json();
      console.log('Using local data.json:', data);
    }
     
  } catch (error) {
    console.error('Error loading data from Google Sheets:', error);
    
    // Try to fall back to local data.json
    try {
      const dataRaw = await fetch('./assets/data.json');
      data = await dataRaw.json();
      console.log('Fallback to local data.json:', data);
      
      // Update loading indicator to show fallback
      const loadingDiv = document.getElementById(`${NAMESPACE}-loading`);
      if (loadingDiv) {
        loadingDiv.innerText = 'Using cached data (Google Sheets unavailable)';
        loadingDiv.style.color = '#f65c2c';
        setTimeout(() => loadingDiv.remove(), 3000);
      }
    } catch (fallbackError) {
      console.error('Failed to load fallback data:', fallbackError);
      
      // Show error message
      const errorDiv = createElement(dashboardWrapper, 'div', 'error');
      errorDiv.style.textAlign = 'center';
      errorDiv.style.padding = '40px';
      errorDiv.style.fontSize = '18px';
      errorDiv.style.color = '#d32f2f';
      errorDiv.innerText = 'Failed to load data. Please try again later.';
      return;
    }
  }

  // Set strategy list for easy access
  strategyList = Object.values(data.strategies);

  
  // ========================================
  // HEADER & COLUMN CREATION
  // ========================================
  
  /**
   * Creates an arrow-shaped header element for a column
   * @param {Object} config - Configuration object
   * @param {string} config.columnColor - Background color for the header
   * @param {string} config.label - Text label for the header
   * @param {string} config.tooltip - Tooltip text
   * @param {boolean} config.isLast - Whether this is the last header (no right arrow)
   */
  const createHeaderElement = ({ columnColor, label, tooltip, isLast }) => {
    const headerEl = createElement(headersWrapper, 'div', null, 'header');
    const labelWrapper = createElement(headerEl, 'div', null, 'header-label-wrapper');
    const labelInnerWrapper = createElement(labelWrapper, 'div');
    const headerText = createElement(labelInnerWrapper, 'h2');
    headerText.innerText = label + ' ';
    addTooltip(labelInnerWrapper, tooltip, dashboardWrapper);
    labelWrapper.style.background = columnColor;

    // Create the left side of the header arrows
    const arrowLeftEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrowLeftEl.setAttribute('width', '12px');
    arrowLeftEl.setAttribute('height', '100%');
    arrowLeftEl.setAttribute('viewBox', '0 0 100 100');
    arrowLeftEl.setAttribute('preserveAspectRatio', 'none');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0,0 100,0 100,100 0,100 100,50 0,0');
    polygon.setAttribute('fill', columnColor);
    arrowLeftEl.appendChild(polygon);
    arrowLeftEl.style.position = 'absolute';
    headerEl.appendChild(arrowLeftEl);

    if (!isLast) {
      // Create the right side of the header arrows
      const arrowRightEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      arrowRightEl.setAttribute('width', '12px');
      arrowRightEl.setAttribute('height', '100%');
      arrowRightEl.setAttribute('viewBox', '0 0 100 100');
      arrowRightEl.setAttribute('preserveAspectRatio', 'none');
      const polygon2 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon2.setAttribute('points', '0,0 100,50 0,100 0,0');
      polygon2.setAttribute('fill', columnColor);
      arrowRightEl.appendChild(polygon2);
      Object.assign(arrowRightEl.style, {
        position: 'absolute',
        left: '100%',
      });
      headerEl.appendChild(arrowRightEl);
    }
  };

  // Create headers for all columns
  Object.entries(columns).map(([_, { columnColor, label }], i) => {
    createHeaderElement({
      columnColor,
      label,
      tooltip: data.headerTooltips[i],
      isLast: i === Object.entries(columns).length - 1,
    });
  });

  // Create wrapper column elements for each column
  const columnEls = Object.entries(columns).map(([id, { columnColor }]) => {
    const columnWrapper = createElement(columnsWrapper, 'div', null, 'column-wrapper');
    columnWrapper.id = id;
    columnWrapper.style.border = `1px solid ${columnColor}80`;
    columnWrapper.style.background = `${columnColor}1A`;
    return columnWrapper;
  });

  
  // ========================================
  // HOVER & HIGHLIGHT FUNCTIONALITY
  // ========================================
  
  /**
   * Removes hover highlights from partner elements and connected strategies
   */
  const clearPartnerHighlights = () => {
    if (isStrategySelected) {
      return; // Don't clear highlights when a strategy is selected
    }
    
    // Clear partner highlights
    const partnersColumn = document.getElementById(COLUMN_IDS.partners);
    if (partnersColumn) {
      const partnersChildren = partnersColumn.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
      [...partnersChildren].forEach(child => {
        const partnerTextElement = child.querySelector(`.${TEXT_CLASS}`);
        if (partnerTextElement) {
          partnerTextElement.style.background = 'transparent';
        }
      });
    }
    
    // Clear strategy wrapper highlights
    const strategiesColumn = document.getElementById(COLUMN_IDS.strategies);
    if (strategiesColumn) {
      const strategiesChildren = strategiesColumn.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
      [...strategiesChildren].forEach(child => {
        child.style.background = 'transparent';
      });
    }
  };

  /**
   * Gets the primary PBC Component color for a specific strategy
   * @param {number} strategyIndex - Index of the strategy in strategyList
   * @returns {string} Hex color code
   */
  const getStrategyThemeColor = (strategyIndex) => {
    const strategy = strategyList[strategyIndex];
    if (strategy && strategy.pbcComponents && strategy.pbcComponents.length > 0) {
      // Get the first (primary) PBC Component for this strategy
      const primaryPBCIndex = strategy.pbcComponents[0];
      const primaryPBC = data.pbcComponents[primaryPBCIndex];
      return getPBCComponentColor(primaryPBC);
    }
    // Fallback to default Strategy color if no PBC Component found
    return columns[COLUMN_IDS.strategies].columnColor;
  };

  /**
   * Gets the currently active theme color based on dashboard state
   * @returns {string|null} Hex color code or null if no specific theme is active
   */
  const getActiveThemeColor = () => {
    // 1. Check if a PBC component is currently selected from the horizontal filter
    if (window.FilterManager.hasSelectedItems()) {
      const selectedPBC = Array.from(window.FilterManager.getSelectedItems())[0];
      return getPBCComponentColor(selectedPBC);
    }
    
    // 2. Check if a specific strategy is currently selected
    if (isStrategySelected) {
      const strategiesColumn = document.getElementById(COLUMN_IDS.strategies);
      const strategiesChildren = strategiesColumn.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
      
      // Find the currently visible (selected) strategy
      for (let i = 0; i < strategiesChildren.length; i++) {
        if (strategiesChildren[i].style.display !== 'none') {
          return getStrategyThemeColor(i);
        }
      }
    }
    
    // 3. Default: return null to indicate individual strategy colors should be used
    return null;
  };

  /**
   * Creates a hover highlight function for partner connections
   * @param {number} partnerIndex - Index of the partner to highlight
   * @returns {Function} Event handler function
   */
  const createPartnerHighlight = (partnerIndex) => () => {
    if (isStrategySelected) {
      return; // Don't highlight when a strategy is already selected
    }
    
    // Find all strategies connected to this partner
    const connectedStrategies = [];
    strategyList.forEach((strategy, strategyIdx) => {
      if (strategy.partners && strategy.partners.includes(partnerIndex)) {
        connectedStrategies.push(strategyIdx);
      }
    });
    
    // Determine highlight color: use theme color if available, otherwise use first connected strategy's color
    const themeColor = getActiveThemeColor();
    let highlightColor;
    
    if (themeColor) {
      // Use the current theme color for consistent highlighting
      highlightColor = themeColor;
    } else if (connectedStrategies.length > 0) {
      // Use the first connected strategy's PBC color
      highlightColor = getStrategyThemeColor(connectedStrategies[0]);
    } else {
      // Fallback to Partners column color
      highlightColor = columns[COLUMN_IDS.partners].columnColor;
    }
    
    // Highlight the hovered partner itself
    const partnersColumn = document.getElementById(COLUMN_IDS.partners);
    const partnersChildren = partnersColumn.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
    if (partnersChildren[partnerIndex]) {
      const partnerTextElement = partnersChildren[partnerIndex].querySelector(`.${TEXT_CLASS}`);
      if (partnerTextElement) {
        partnerTextElement.style.background = `${highlightColor}80`;
      }
    }
    
    // Highlight strategies connected to this partner using consistent color
    const strategiesColumn = document.getElementById(COLUMN_IDS.strategies);
    const strategiesChildren = strategiesColumn.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
    connectedStrategies.forEach(strategyIdx => {
      if (strategiesChildren[strategyIdx]) {
        strategiesChildren[strategyIdx].style.background = `${highlightColor}80`;
      }
    });
  };

  
  // ========================================
  // MAIN FILTER & SELECTION FUNCTIONS
  // ========================================
  
  /**
   * Clears all filters and shows all columns
   */
  const clearAllFilters = () => {
    isStrategySelected = false;
    isPartnerSelected = false;
    
    const config = {
      namespace: NAMESPACE, 
      pbcComponentsId: COLUMN_IDS.pbcComponents, 
      partnersId: COLUMN_IDS.partners, 
      strategiesId: COLUMN_IDS.strategies, 
      outputsId: COLUMN_IDS.outputs, 
      immediateOutputsId: COLUMN_IDS.immediateOutputs, 
      intermediateOutputsId: COLUMN_IDS.intermediateOutputs, 
      longTermOutputsId: COLUMN_IDS.longTermOutputs,
      textClass: TEXT_CLASS, 
      getPBCColor: getPBCComponentColor, 
      updateBrandGradient: updateDashboardColors, 
      updateButtonVisibility: updateNavigationButtons, 
      data
    };
    
    return window.FilterManager.unfilterColumns(config);
  };

  /**
   * Shows only a specific strategy and its connected elements
   * @param {number} strategyIndex - Index of strategy to show
   * @returns {Function} Event handler function
   */
  const selectStrategy = (strategyIndex) => () => {
    if (isStrategySelected && !isPartnerSelected) {
      clearAllFilters();
      return;
    }
    
    // Set strategy as selected to disable hover states
    isStrategySelected = true;

    const strategiesColumn = document.getElementById(COLUMN_IDS.strategies);
    const strategiesChildren = strategiesColumn.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
    [...strategiesChildren].forEach((child, idx) => {
      child.style.display = idx === strategyIndex ? 'block' : 'none';
    });

    // Filter connected columns to show only related items
    const filterConnectedColumn = (strategy, columnKey, columnId) => {
      const highlightIndices = strategy[columnKey];
      const column = document.getElementById(columnId);
      const columnChildren = column.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
      [...columnChildren].forEach((child, i) => {
        child.style.display = highlightIndices.includes(i) ? 'block' : 'none';
      });
    };

    const selectedStrategy = strategyList[strategyIndex];
    
    filterConnectedColumn(selectedStrategy, 'pbcComponents', COLUMN_IDS.pbcComponents);
    
    // Handle Partners column: preserve partner filter if active, otherwise filter by strategy
    if (!isPartnerSelected) {
      filterConnectedColumn(selectedStrategy, 'partners', COLUMN_IDS.partners);
    }
    
    filterConnectedColumn(selectedStrategy, 'outputs', COLUMN_IDS.outputs);
    filterConnectedColumn(selectedStrategy, 'immediateOutputs', COLUMN_IDS.immediateOutputs);
    filterConnectedColumn(selectedStrategy, 'intermediateOutputs', COLUMN_IDS.intermediateOutputs);
    filterConnectedColumn(selectedStrategy, 'longTermOutputs', COLUMN_IDS.longTermOutputs);

    // Apply color theme based on the selected strategy's PBC component
    if (selectedStrategy.pbcComponents && selectedStrategy.pbcComponents.length > 0) {
      const primaryPBCIndex = selectedStrategy.pbcComponents[0];
      const primaryPBCComponent = data.pbcComponents[primaryPBCIndex];
      const primaryPBCColor = getPBCComponentColor(primaryPBCComponent);
      
      console.log(`🎨 Strategy "${selectedStrategy.label}" - Applying brand gradient for PBC component: "${primaryPBCComponent}"`);
      
      // Apply brand gradient based on the primary PBC component
      const newGradient = createPBCGradient(primaryPBCColor);
      updateDashboardColors(newGradient);
      
      // Update FilterManager's selected items
      window.FilterManager.clearSelectedItems();
      window.FilterManager.addSelectedItem(primaryPBCComponent);
      
      // Highlight the corresponding PBC component in the horizontal filter
      const pbcHorizontalBar = document.getElementById(`${NAMESPACE}-horizontal-pbcComponents`);
      if (pbcHorizontalBar) {
        // Clear existing selections
        const allPBCButtons = pbcHorizontalBar.querySelectorAll('div');
        allPBCButtons.forEach(button => {
          if (button.textContent && button.classList.contains('selected')) {
            button.classList.remove('selected');
            const buttonPBCColor = getPBCComponentColor(button.textContent);
            button.style.backgroundColor = `${buttonPBCColor}20`;
          }
        });
        
        // Highlight the primary PBC component
        allPBCButtons.forEach(button => {
          if (button.textContent === primaryPBCComponent) {
            button.classList.add('selected');
            button.style.backgroundColor = `${primaryPBCColor}80`;
            console.log(`🟢 Highlighted PBC component button: "${primaryPBCComponent}"`);
          }
        });
      }
    }

    updateNavigationButtons();
  };

  /**
   * Shows only a specific partner and its connected elements
   * @param {number} partnerIndex - Index of partner to show
   * @returns {Function} Event handler function
   */
  const selectPartner = (partnerIndex) => () => {
    if (isPartnerSelected && !isStrategySelected) {
      clearAllFilters();
      return;
    }
    
    // Set partner as selected to disable hover states
    isPartnerSelected = true;

    // Show only the clicked partner
    const partnersColumn = document.getElementById(COLUMN_IDS.partners);
    const partnersChildren = partnersColumn.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
    [...partnersChildren].forEach((child, idx) => {
      child.style.display = idx === partnerIndex ? 'block' : 'none';
    });

    // Find all strategies connected to this partner
    const connectedStrategies = [];
    strategyList.forEach((strategy, strategyIdx) => {
      if (strategy.partners && strategy.partners.includes(partnerIndex)) {
        // If a PBC component is selected, only include strategies that also match that PBC component
        if (window.FilterManager.hasSelectedItems()) {
          const selectedPBC = Array.from(window.FilterManager.getSelectedItems())[0];
          const strategyPBCComponents = strategy.pbcComponents ? strategy.pbcComponents.map(idx => data.pbcComponents[idx]) : [];
          if (strategyPBCComponents.includes(selectedPBC)) {
            connectedStrategies.push(strategyIdx);
          }
        } else {
          // No PBC filter active, include all strategies for this partner
          connectedStrategies.push(strategyIdx);
        }
      }
    });

    // Handle Strategies column: preserve strategy filter if active, otherwise show connected strategies
    if (!isStrategySelected) {
      const strategiesColumn = document.getElementById(COLUMN_IDS.strategies);
      const strategiesChildren = strategiesColumn.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
      [...strategiesChildren].forEach((child, idx) => {
        child.style.display = connectedStrategies.includes(idx) ? 'block' : 'none';
      });
    }

    // Handle outcome columns: only filter if no strategy is already selected
    if (!isStrategySelected) {
      // Collect all outcomes from connected strategies
      const allConnectedOutcomes = {
        pbcComponents: new Set(),
        outputs: new Set(),
        immediateOutputs: new Set(),
        intermediateOutputs: new Set(),
        longTermOutputs: new Set()
      };
      
      connectedStrategies.forEach(strategyIdx => {
        const strategy = strategyList[strategyIdx];
        if (strategy.pbcComponents) strategy.pbcComponents.forEach(idx => allConnectedOutcomes.pbcComponents.add(idx));
        if (strategy.outputs) strategy.outputs.forEach(idx => allConnectedOutcomes.outputs.add(idx));
        if (strategy.immediateOutputs) strategy.immediateOutputs.forEach(idx => allConnectedOutcomes.immediateOutputs.add(idx));
        if (strategy.intermediateOutputs) strategy.intermediateOutputs.forEach(idx => allConnectedOutcomes.intermediateOutputs.add(idx));
        if (strategy.longTermOutputs) strategy.longTermOutputs.forEach(idx => allConnectedOutcomes.longTermOutputs.add(idx));
      });

      // Filter outcome columns to only show connected outcomes
      const filterOutcomeColumn = (columnId, connectedSet) => {
        const column = document.getElementById(columnId);
        const columnChildren = column.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
        [...columnChildren].forEach((child, idx) => {
          child.style.display = connectedSet.has(idx) ? 'block' : 'none';
        });
      };

      filterOutcomeColumn(COLUMN_IDS.pbcComponents, allConnectedOutcomes.pbcComponents);
      filterOutcomeColumn(COLUMN_IDS.outputs, allConnectedOutcomes.outputs);
      filterOutcomeColumn(COLUMN_IDS.immediateOutputs, allConnectedOutcomes.immediateOutputs);
      filterOutcomeColumn(COLUMN_IDS.intermediateOutputs, allConnectedOutcomes.intermediateOutputs);
      filterOutcomeColumn(COLUMN_IDS.longTermOutputs, allConnectedOutcomes.longTermOutputs);
    }

    updateNavigationButtons();
  };

  
  // ========================================
  // NAVIGATION BUTTON MANAGEMENT
  // ========================================
  
  /** Navigation buttons for filtering controls */
  const strategiesColumn = document.getElementById(COLUMN_IDS.strategies);
  const partnersColumn = document.getElementById(COLUMN_IDS.partners);
  const seeAllButton = document.createElement('button');
  const seeAllPartnersButton = document.createElement('button');
  const showAllPartnerStrategiesButton = document.createElement('button');
  const showAllPBCStrategiesButton = document.createElement('button');
  const showAllPBCPartnersButton = document.createElement('button');

  /**
   * Updates the visibility and text of navigation buttons based on current filter state
   */
  const updateNavigationButtons = () => {
    const config = {
      seeAllButton, seeAllPartnersButton, showAllPartnerStrategiesButton, 
      showAllPBCStrategiesButton, showAllPBCPartnersButton,
      clickedStrategy: isStrategySelected, 
      clickedPartner: isPartnerSelected, 
      namespace: NAMESPACE, 
      partnersId: COLUMN_IDS.partners, 
      data
    };
    return window.FilterManager.updateButtonVisibility(config);
  };

  /**
   * Shows all strategies for the currently selected partner
   */
  const showAllPartnerStrategies = () => {
    if (!isPartnerSelected) return;
    
    // Clear PBC component selection when showing all partner strategies
    window.FilterManager.clearSelectedItems();
    
    // Reset to original color scheme
    updateDashboardColors(window.ColorManager.getOriginalBrandGradient());
    console.log(`🎨 Reset to original brand gradient for partner strategies view`);
    
    // Clear any PBC component selections in the horizontal filter
    const pbcHorizontalBar = document.getElementById(`${NAMESPACE}-horizontal-pbcComponents`);
    if (pbcHorizontalBar) {
      const allPBCButtons = pbcHorizontalBar.querySelectorAll('div.selected');
      allPBCButtons.forEach(button => {
        button.classList.remove('selected');
        const buttonPBCColor = getPBCComponentColor(button.textContent);
        button.style.backgroundColor = `${buttonPBCColor}20`;
      });
    }
    
    // Clear strategy filter but keep partner filter
    isStrategySelected = false;
    
    // Find the currently selected partner
    const partnersChildren = partnersColumn.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
    let selectedPartnerIndex = -1;
    
    [...partnersChildren].forEach((child, idx) => {
      if (child.style.display !== 'none') {
        selectedPartnerIndex = idx;
      }
    });
    
    if (selectedPartnerIndex === -1) return;
    
    // Find all strategies connected to this partner
    const connectedStrategies = [];
    strategyList.forEach((strategy, strategyIdx) => {
      if (strategy.partners && strategy.partners.includes(selectedPartnerIndex)) {
        connectedStrategies.push(strategyIdx);
      }
    });
    
    // Show all connected strategies
    const strategiesChildren = strategiesColumn.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
    [...strategiesChildren].forEach((child, idx) => {
      child.style.display = connectedStrategies.includes(idx) ? 'block' : 'none';
    });
    
    // Show all outcomes connected to these strategies
    const allConnectedOutcomes = {
      pbcComponents: new Set(),
      outputs: new Set(),
      immediateOutputs: new Set(),
      intermediateOutputs: new Set(),
      longTermOutputs: new Set()
    };
    
    connectedStrategies.forEach(strategyIdx => {
      const strategy = strategyList[strategyIdx];
      if (strategy.pbcComponents) strategy.pbcComponents.forEach(idx => allConnectedOutcomes.pbcComponents.add(idx));
      if (strategy.outputs) strategy.outputs.forEach(idx => allConnectedOutcomes.outputs.add(idx));
      if (strategy.immediateOutputs) strategy.immediateOutputs.forEach(idx => allConnectedOutcomes.immediateOutputs.add(idx));
      if (strategy.intermediateOutputs) strategy.intermediateOutputs.forEach(idx => allConnectedOutcomes.intermediateOutputs.add(idx));
      if (strategy.longTermOutputs) strategy.longTermOutputs.forEach(idx => allConnectedOutcomes.longTermOutputs.add(idx));
    });

    // Filter outcome columns
    const filterOutcomeColumn = (columnId, connectedSet) => {
      const column = document.getElementById(columnId);
      const columnChildren = column.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
      [...columnChildren].forEach((child, idx) => {
        child.style.display = connectedSet.has(idx) ? 'block' : 'none';
      });
    };

    filterOutcomeColumn(COLUMN_IDS.pbcComponents, allConnectedOutcomes.pbcComponents);
    filterOutcomeColumn(COLUMN_IDS.outputs, allConnectedOutcomes.outputs);
    filterOutcomeColumn(COLUMN_IDS.immediateOutputs, allConnectedOutcomes.immediateOutputs);
    filterOutcomeColumn(COLUMN_IDS.intermediateOutputs, allConnectedOutcomes.intermediateOutputs);
    filterOutcomeColumn(COLUMN_IDS.longTermOutputs, allConnectedOutcomes.longTermOutputs);
    
    updateNavigationButtons();
    
    // Clear all background highlights
    const allColumnIds = Object.values(COLUMN_IDS);
    allColumnIds.forEach(columnId => {
      const column = document.getElementById(columnId);
      const columnChildren = column.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
      [...columnChildren].forEach(child => {
        child.style.background = 'transparent';
        
        const textElements = child.getElementsByClassName(TEXT_CLASS);
        [...textElements].forEach(textEl => {
          textEl.style.background = 'transparent';
          textEl.style.backgroundColor = '';
          textEl.style.boxShadow = '';
          textEl.style.opacity = '';
        });
      });
    });
    
    clearPartnerStyling();
  };

  /**
   * Shows all partners for the currently selected PBC component
   */
  const showAllPBCPartners = () => {
    if (window.FilterManager.getSelectedItemsSize() === 0) return; // No PBC component selected
    
    // Clear partner and strategy filters but keep PBC filter
    isPartnerSelected = false;
    isStrategySelected = false;
    
    // Get the selected PBC component
    const selectedPBC = Array.from(window.FilterManager.getSelectedItems())[0];
    
    // Find all strategies connected to this PBC component
    const connectedStrategies = [];
    strategyList.forEach((strategy, strategyIdx) => {
      const strategyPBCComponents = strategy.pbcComponents ? strategy.pbcComponents.map(idx => data.pbcComponents[idx]) : [];
      if (strategyPBCComponents.includes(selectedPBC)) {
        connectedStrategies.push(strategyIdx);
      }
    });
    
    // Show all connected strategies
    const strategiesChildren = strategiesColumn.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
    [...strategiesChildren].forEach((child, idx) => {
      child.style.display = connectedStrategies.includes(idx) ? 'block' : 'none';
    });
    
    // Find all partners connected to these strategies
    const connectedPartners = new Set();
    connectedStrategies.forEach(strategyIdx => {
      const strategy = strategyList[strategyIdx];
      if (strategy.partners) {
        strategy.partners.forEach(partnerIdx => connectedPartners.add(partnerIdx));
      }
    });
    
    // Show all connected partners
    const partnersChildren = partnersColumn.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
    [...partnersChildren].forEach((child, idx) => {
      child.style.display = connectedPartners.has(idx) ? 'block' : 'none';
    });
    
    // Show all outcomes connected to these strategies
    const allConnectedOutcomes = {
      pbcComponents: new Set(),
      outputs: new Set(),
      immediateOutputs: new Set(),
      intermediateOutputs: new Set(),
      longTermOutputs: new Set()
    };
    
    connectedStrategies.forEach(strategyIdx => {
      const strategy = strategyList[strategyIdx];
      if (strategy.pbcComponents) strategy.pbcComponents.forEach(idx => allConnectedOutcomes.pbcComponents.add(idx));
      if (strategy.outputs) strategy.outputs.forEach(idx => allConnectedOutcomes.outputs.add(idx));
      if (strategy.immediateOutputs) strategy.immediateOutputs.forEach(idx => allConnectedOutcomes.immediateOutputs.add(idx));
      if (strategy.intermediateOutputs) strategy.intermediateOutputs.forEach(idx => allConnectedOutcomes.intermediateOutputs.add(idx));
      if (strategy.longTermOutputs) strategy.longTermOutputs.forEach(idx => allConnectedOutcomes.longTermOutputs.add(idx));
    });

    // Filter outcome columns
    const filterOutcomeColumn = (columnId, connectedSet) => {
      const column = document.getElementById(columnId);
      const columnChildren = column.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
      [...columnChildren].forEach((child, idx) => {
        child.style.display = connectedSet.has(idx) ? 'block' : 'none';
      });
    };

    filterOutcomeColumn(COLUMN_IDS.pbcComponents, allConnectedOutcomes.pbcComponents);
    filterOutcomeColumn(COLUMN_IDS.outputs, allConnectedOutcomes.outputs);
    filterOutcomeColumn(COLUMN_IDS.immediateOutputs, allConnectedOutcomes.immediateOutputs);
    filterOutcomeColumn(COLUMN_IDS.intermediateOutputs, allConnectedOutcomes.intermediateOutputs);
    filterOutcomeColumn(COLUMN_IDS.longTermOutputs, allConnectedOutcomes.longTermOutputs);
    
    // Clear all background highlights
    const allColumnIds = Object.values(COLUMN_IDS);
    allColumnIds.forEach(columnId => {
      const column = document.getElementById(columnId);
      const columnChildren = column.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
      [...columnChildren].forEach(child => {
        child.style.background = 'transparent';
        
        const textElements = child.getElementsByClassName(TEXT_CLASS);
        [...textElements].forEach(textEl => {
          textEl.style.background = 'transparent';
          textEl.style.backgroundColor = '';
          textEl.style.boxShadow = '';
          textEl.style.opacity = '';
        });
      });
    });
    
    clearPartnerStyling();
    updateNavigationButtons();
  };

  /**
   * Shows all strategies for the currently selected PBC component
   */
  const showAllPBCStrategies = () => {
    if (!isStrategySelected && !isPartnerSelected) return;
    
    let primaryPBCComponent;
    let primaryPBCColor;
    
    if (window.FilterManager.hasSelectedItems()) {
      // Use the currently selected PBC component
      primaryPBCComponent = Array.from(window.FilterManager.getSelectedItems())[0];
      primaryPBCColor = getPBCComponentColor(primaryPBCComponent);
    } else if (isStrategySelected) {
      // Fallback: derive PBC component from selected strategy
      const strategiesChildren = strategiesColumn.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
      let selectedStrategyIndex = -1;
      
      [...strategiesChildren].forEach((child, idx) => {
        if (child.style.display !== 'none') {
          selectedStrategyIndex = idx;
        }
      });
      
      if (selectedStrategyIndex === -1) return;
      
      const selectedStrategy = strategyList[selectedStrategyIndex];
      const strategyPBCComponents = selectedStrategy.pbcComponents || [];
      
      if (strategyPBCComponents.length === 0) return;
      
      const primaryPBCIndex = strategyPBCComponents[0];
      primaryPBCComponent = data.pbcComponents[primaryPBCIndex];
      primaryPBCColor = getPBCComponentColor(primaryPBCComponent);
    } else {
      return; // No valid state to proceed
    }
    
    console.log(`🎨 Applying brand gradient for PBC component: "${primaryPBCComponent}"`);
    
    // Apply brand gradient based on the primary PBC component
    const newGradient = createPBCGradient(primaryPBCColor);
    updateDashboardColors(newGradient);
    
    // Update FilterManager's selected items
    window.FilterManager.clearSelectedItems();
    window.FilterManager.addSelectedItem(primaryPBCComponent);
    
    // Highlight the corresponding PBC component in the horizontal filter
    const pbcHorizontalBar = document.getElementById(`${NAMESPACE}-horizontal-pbcComponents`);
    if (pbcHorizontalBar) {
      // Clear existing selections
      const allPBCButtons = pbcHorizontalBar.querySelectorAll('div');
      allPBCButtons.forEach(button => {
        if (button.textContent && button.classList.contains('selected')) {
          button.classList.remove('selected');
          const buttonPBCColor = getPBCComponentColor(button.textContent);
          button.style.backgroundColor = `${buttonPBCColor}20`;
        }
      });
      
      // Highlight the primary PBC component
      allPBCButtons.forEach(button => {
        if (button.textContent === primaryPBCComponent) {
          button.classList.add('selected');
          button.style.backgroundColor = `${primaryPBCColor}80`;
          console.log(`🟢 Highlighted PBC component button: "${primaryPBCComponent}"`);
        }
      });
    }
    
    // Find all strategies that match the PBC component
    const connectedStrategies = [];
    strategyList.forEach((strategy, strategyIdx) => {
      if (strategy.pbcComponents) {
        const strategyPBCComponents = strategy.pbcComponents.map(idx => data.pbcComponents[idx]);
        if (strategyPBCComponents.includes(primaryPBCComponent)) {
          // If a partner is also selected, only include strategies connected to that partner
          if (isPartnerSelected) {
            // Find the selected partner index
            const partnersChildren = partnersColumn.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
            let selectedPartnerIndex = -1;
            [...partnersChildren].forEach((child, idx) => {
              if (child.style.display !== 'none') {
                selectedPartnerIndex = idx;
              }
            });
            
            if (selectedPartnerIndex !== -1 && strategy.partners && strategy.partners.includes(selectedPartnerIndex)) {
              connectedStrategies.push(strategyIdx);
            }
          } else {
            // No partner filter, include all strategies for this PBC component
            connectedStrategies.push(strategyIdx);
          }
        }
      }
    });
    
    // Clear strategy filter but keep partner filter if it exists
    isStrategySelected = false;
    
    // Show all connected strategies
    const strategiesChildren = strategiesColumn.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
    [...strategiesChildren].forEach((child, idx) => {
      child.style.display = connectedStrategies.includes(idx) ? 'block' : 'none';
    });
    
    // Show connected outcomes and partners
    const allConnectedOutcomes = {
      pbcComponents: new Set(),
      outputs: new Set(),
      immediateOutputs: new Set(),
      intermediateOutputs: new Set(),
      longTermOutputs: new Set()
    };
    
    connectedStrategies.forEach(strategyIdx => {
      const strategy = strategyList[strategyIdx];
      if (strategy.pbcComponents) strategy.pbcComponents.forEach(idx => allConnectedOutcomes.pbcComponents.add(idx));
      if (strategy.outputs) strategy.outputs.forEach(idx => allConnectedOutcomes.outputs.add(idx));
      if (strategy.immediateOutputs) strategy.immediateOutputs.forEach(idx => allConnectedOutcomes.immediateOutputs.add(idx));
      if (strategy.intermediateOutputs) strategy.intermediateOutputs.forEach(idx => allConnectedOutcomes.intermediateOutputs.add(idx));
      if (strategy.longTermOutputs) strategy.longTermOutputs.forEach(idx => allConnectedOutcomes.longTermOutputs.add(idx));
    });

    // Filter outcome columns
    const filterOutcomeColumn = (columnId, connectedSet) => {
      const column = document.getElementById(columnId);
      const columnChildren = column.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
      [...columnChildren].forEach((child, idx) => {
        child.style.display = connectedSet.has(idx) ? 'block' : 'none';
      });
    };

    filterOutcomeColumn(COLUMN_IDS.pbcComponents, allConnectedOutcomes.pbcComponents);
    filterOutcomeColumn(COLUMN_IDS.outputs, allConnectedOutcomes.outputs);
    filterOutcomeColumn(COLUMN_IDS.immediateOutputs, allConnectedOutcomes.immediateOutputs);
    filterOutcomeColumn(COLUMN_IDS.intermediateOutputs, allConnectedOutcomes.intermediateOutputs);
    filterOutcomeColumn(COLUMN_IDS.longTermOutputs, allConnectedOutcomes.longTermOutputs);
    
    // Filter partners based on the connected strategies
    const allConnectedPartners = new Set();
    connectedStrategies.forEach(strategyIdx => {
      const strategy = strategyList[strategyIdx];
      if (strategy.partners) strategy.partners.forEach(idx => allConnectedPartners.add(idx));
    });
    
    const partnersChildren = partnersColumn.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
    [...partnersChildren].forEach((child, idx) => {
      child.style.display = allConnectedPartners.has(idx) ? 'block' : 'none';
    });
    
    updateNavigationButtons();
    
    // Clear all background highlights
    const allColumnIds = Object.values(COLUMN_IDS);
    allColumnIds.forEach(columnId => {
      const column = document.getElementById(columnId);
      const columnChildren = column.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
      [...columnChildren].forEach(child => {
        child.style.background = 'transparent';
        
        const textElements = child.getElementsByClassName(TEXT_CLASS);
        [...textElements].forEach(textEl => {
          textEl.style.background = 'transparent';
          textEl.style.backgroundColor = '';
          textEl.style.boxShadow = '';
          textEl.style.opacity = '';
        });
      });
    });
    
    clearPartnerStyling();
  };

  
  // ========================================
  // MODAL & INTERACTION HANDLERS
  // ========================================
  
  /**
   * Creates a function to show the strategy details modal
   * @param {number} strategyIndex - Index of the strategy to show details for
   * @returns {Function} Event handler function
   */
  const createStrategyModalHandler = (strategyIndex) => () => {
    modalHeader.innerText = strategyList[strategyIndex].label;
    researchParagraph.innerText = strategyList[strategyIndex].details;

    // Clear existing research items
    [...researchBody.children].forEach((c, i) => i !== 0 && c.remove());

    // Add research items
    strategyList[strategyIndex].research.forEach(r => {
      const researchEl = createElement(researchBody, 'div', null, 'research-item');
      const researchCitation = createElement(researchEl, 'div');
      researchCitation.innerText = r.citation;

      const researchLink = document.createElement('a');
      researchLink.setAttribute('href', r.citationLink);
      researchLink.innerText = r.citationLinkText;
      researchLink.setAttribute('rel', 'noopener noreferrer');
      researchLink.setAttribute('target', '_blank');
      researchEl.appendChild(researchLink);

      const researchOutcomesWrapper = createElement(researchEl, 'div', null, 'research-outcomes-wrapper');
      researchOutcomesWrapper.innerText = `Related Outcomes: `;
      const researchOutcomes = createElement(researchOutcomesWrapper, 'span', null, 'research-outcomes');
      researchOutcomes.innerText = r.relatedOutcomes.join(', ');
    });

    modal.style.display = 'block';
  };

  
  // ========================================
  // COLUMN DATA POPULATION
  // ========================================
  
  /**
   * Populates a column with data items and sets up appropriate interactions
   * @param {Array} data - Array of data items to display
   * @param {string} columnId - ID of the column to populate
   * @param {Array} tooltips - Optional array of tooltip texts
   */
  const populateColumn = (data, columnId, tooltips) => {
    data.forEach((datum, i) => {
      const wrapperDiv = document.createElement('div');
      document.getElementById(columnId).appendChild(wrapperDiv);

      const dataDiv = document.createElement('div');
      dataDiv.className = `${NAMESPACE}-data-wrapper`;
      if (i !== data.length - 1) {
        dataDiv.style.borderBottom = `1px solid ${columns[columnId].columnColor}80`;
      }
      wrapperDiv.appendChild(dataDiv);

      if (columnId === COLUMN_IDS.strategies) {
        // Special handling for strategy items
        const button = document.createElement('button');
        button.className = `${TEXT_CLASS} ${NAMESPACE}-button`;
        button.textContent = datum;
        button.style.paddingTop = '14px'; // Extra padding for the PBC color pill
        dataDiv.appendChild(button);

        // Create colored pill for PBC component spanning full width of strategy box
        const colorPill = document.createElement('div');
        colorPill.style.position = 'absolute';
        colorPill.style.top = '8px';
        colorPill.style.left = '0';
        colorPill.style.right = '0';
        colorPill.style.height = '8px';
        colorPill.style.backgroundColor = getStrategyThemeColor(i);
        colorPill.style.borderRadius = '4px';
        colorPill.style.zIndex = '10';
        
        // Make dataDiv relatively positioned to contain the absolute pill
        dataDiv.style.position = 'relative';
        dataDiv.appendChild(colorPill);

        const filterButtonWrapper = document.createElement('div');
        filterButtonWrapper.className = `${NAMESPACE}-filter-button-wrapper`;
        const filterButton = document.createElement('button');
        filterButton.className = `${NAMESPACE}-filter-button`;
        filterButton.textContent = 'Learn more';
        filterButtonWrapper.appendChild(filterButton);
        dataDiv.appendChild(filterButtonWrapper);

        // Set up event handlers
        button.onclick = selectStrategy(i);
        filterButton.onclick = createStrategyModalHandler(i);
        
        // Add hover functionality to highlight connected outcomes
        const highlightStrategyConnections = () => {
          if (isStrategySelected) return; // Don't highlight when strategy is already selected
          
          const strategy = strategyList[i];
          // Use theme color if available, otherwise use individual strategy color
          const themeColor = getActiveThemeColor();
          const strategyColor = themeColor || getStrategyThemeColor(i);
          
          // Highlight the strategy itself
          dataDiv.setAttribute('data-original-bg-before-hover', dataDiv.style.background || '');
          dataDiv.style.background = `${strategyColor}80`;
          
          // Helper function to highlight outcome items
          const highlightOutcomeItems = (columnId, indices) => {
            if (!indices || indices.length === 0) return;
            
            const column = document.getElementById(columnId);
            const columnChildren = column.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
            
            indices.forEach(idx => {
              if (columnChildren[idx]) {
                const textElement = columnChildren[idx].querySelector(`.${TEXT_CLASS}`);
                if (textElement) {
                  textElement.setAttribute('data-original-bg-before-hover', textElement.style.background || '');
                  textElement.style.background = `${strategyColor}80`;
                }
              }
            });
          };
          
          // Highlight all connected outcomes
          highlightOutcomeItems(COLUMN_IDS.outputs, strategy.outputs);
          highlightOutcomeItems(COLUMN_IDS.immediateOutputs, strategy.immediateOutputs);
          highlightOutcomeItems(COLUMN_IDS.intermediateOutputs, strategy.intermediateOutputs);
          highlightOutcomeItems(COLUMN_IDS.longTermOutputs, strategy.longTermOutputs);
        };
        
        const clearStrategyHighlights = () => {
          if (isStrategySelected) return; // Don't clear when strategy is selected
          
          // Restore strategy background
          const originalBg = dataDiv.getAttribute('data-original-bg-before-hover') || '';
          dataDiv.style.background = originalBg || 'transparent';
          
          // Restore outcome backgrounds
          const allOutcomeColumns = [COLUMN_IDS.outputs, COLUMN_IDS.immediateOutputs, COLUMN_IDS.intermediateOutputs, COLUMN_IDS.longTermOutputs];
          allOutcomeColumns.forEach(columnId => {
            const column = document.getElementById(columnId);
            if (column) {
              const columnChildren = column.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
              [...columnChildren].forEach(child => {
                const textElement = child.querySelector(`.${TEXT_CLASS}`);
                if (textElement) {
                  const originalChildBg = textElement.getAttribute('data-original-bg-before-hover') || '';
                  textElement.style.background = originalChildBg || 'transparent';
                }
              });
            }
          });
        };
        
        // Attach hover events
        button.onmouseenter = highlightStrategyConnections;
        button.onmouseleave = clearStrategyHighlights;
        
      } else {
        // Standard text item handling
        const textDiv = document.createElement('div');
        textDiv.className = TEXT_CLASS;
        dataDiv.appendChild(textDiv);
        textDiv.innerText = datum;
        if (tooltips) {
          addTooltip(textDiv, tooltips[i], dashboardWrapper);
        }
        
        // Add click functionality for Partners column
        if (columnId === COLUMN_IDS.partners) {
          dataDiv.onclick = selectPartner(i);
          dataDiv.style.cursor = 'pointer';
          
          // Add hover functionality
          dataDiv.onmouseenter = createPartnerHighlight(i);
          dataDiv.onmouseleave = clearPartnerHighlights;
        }
        
        // Add hover functionality for outcome columns to highlight strategies
        const highlightRelatedStrategies = () => {
          if (isStrategySelected) return; // Don't highlight when strategy is selected
          
          // Find strategies that are connected to this item
          const connectedStrategies = [];
          strategyList.forEach((strategy, strategyIdx) => {
            let isConnected = false;
            
            if (columnId === COLUMN_IDS.outputs && strategy.outputs.includes(i)) {
              isConnected = true;
            } else if (columnId === COLUMN_IDS.immediateOutputs && strategy.immediateOutputs.includes(i)) {
              isConnected = true;
            } else if (columnId === COLUMN_IDS.intermediateOutputs && strategy.intermediateOutputs.includes(i)) {
              isConnected = true;
            } else if (columnId === COLUMN_IDS.longTermOutputs && strategy.longTermOutputs.includes(i)) {
              isConnected = true;
            }
            
            if (isConnected) {
              connectedStrategies.push(strategyIdx);
            }
          });
          
          // Determine highlight color
          const themeColor = getActiveThemeColor();
          let highlightColor;
          
          if (themeColor) {
            highlightColor = themeColor;
          } else if (connectedStrategies.length > 0) {
            highlightColor = getStrategyThemeColor(connectedStrategies[0]);
          } else {
            highlightColor = columns[COLUMN_IDS.strategies].columnColor;
          }
          
          // Highlight the hovered outcome item
          textDiv.setAttribute('data-original-bg-before-hover', textDiv.style.background || '');
          textDiv.style.background = `${highlightColor}80`;
          
          // Highlight connected strategies
          const strategiesColumn = document.getElementById(COLUMN_IDS.strategies);
          const strategiesChildren = strategiesColumn.getElementsByClassName(`${NAMESPACE}-data-wrapper`);
          connectedStrategies.forEach(strategyIdx => {
            if (strategiesChildren[strategyIdx]) {
              strategiesChildren[strategyIdx].setAttribute('data-original-bg-before-hover', strategiesChildren[strategyIdx].style.background || '');
              strategiesChildren[strategyIdx].style.background = `${highlightColor}80`;
            }
          });
        };
        
        const clearItemHighlights = () => {
          if (isStrategySelected) return; // Don't clear when strategy is selected
          
          // Restore original background for the hovered outcome item
          const originalItemBg = textDiv.getAttribute('data-original-bg-before-hover') || '';
          textDiv.style.background = originalItemBg || 'transparent';
          
          // Clear highlights from strategies column
          const strategiesColumn = document.getElementById(COLUMN_IDS.strategies);
          if (strategiesColumn) {
            const strategiesChildren = [...strategiesColumn.getElementsByClassName(`${NAMESPACE}-data-wrapper`)];
            strategiesChildren.forEach(child => {
              const originalChildBg = child.getAttribute('data-original-bg-before-hover') || '';
              child.style.background = originalChildBg || 'transparent';
            });
          }
        };
        
        // Add hover events (only for outcome columns)
        const outcomeColumns = [COLUMN_IDS.outputs, COLUMN_IDS.immediateOutputs, COLUMN_IDS.intermediateOutputs, COLUMN_IDS.longTermOutputs];
        if (outcomeColumns.includes(columnId)) {
          dataDiv.onmouseenter = highlightRelatedStrategies;
          dataDiv.onmouseleave = clearItemHighlights;
        }
      }
    });
  };

  
  // ========================================
  // BUTTON SETUP & INITIALIZATION
  // ========================================
  
  // Set up navigation buttons
  seeAllButton.className = `${NAMESPACE}-see-all`;
  seeAllButton.style.display = 'none';
  seeAllButton.textContent = 'See All Strategies';
  strategiesColumn.appendChild(seeAllButton);
  seeAllButton.onclick = clearAllFilters;

  showAllPartnerStrategiesButton.className = `${NAMESPACE}-see-all`;
  showAllPartnerStrategiesButton.style.display = 'none';
  showAllPartnerStrategiesButton.textContent = 'Show all Strategies for this Partner';
  showAllPartnerStrategiesButton.style.marginTop = '10px';
  strategiesColumn.appendChild(showAllPartnerStrategiesButton);
  showAllPartnerStrategiesButton.onclick = showAllPartnerStrategies;

  showAllPBCStrategiesButton.className = `${NAMESPACE}-see-all`;
  showAllPBCStrategiesButton.style.display = 'none';
  showAllPBCStrategiesButton.textContent = 'Show all Strategies for this PBC Component';
  showAllPBCStrategiesButton.style.marginTop = '10px';
  strategiesColumn.appendChild(showAllPBCStrategiesButton);
  showAllPBCStrategiesButton.onclick = showAllPBCStrategies;

  seeAllPartnersButton.className = `${NAMESPACE}-see-all`;
  seeAllPartnersButton.style.display = 'none';
  seeAllPartnersButton.textContent = 'See All Partners';
  partnersColumn.appendChild(seeAllPartnersButton);
  seeAllPartnersButton.onclick = clearAllFilters;

  showAllPBCPartnersButton.className = `${NAMESPACE}-see-all`;
  showAllPBCPartnersButton.style.display = 'none';
  showAllPBCPartnersButton.textContent = 'Show All Partners for this PBC Component';
  partnersColumn.appendChild(showAllPBCPartnersButton);
  showAllPBCPartnersButton.onclick = showAllPBCPartners;

  // Populate all columns with data
  populateColumn(data.pbcComponents, COLUMN_IDS.pbcComponents);
  populateColumn(data.partners, COLUMN_IDS.partners);
  populateColumn(Object.keys(data.strategies), COLUMN_IDS.strategies);
  populateColumn(data.outputs, COLUMN_IDS.outputs);
  populateColumn(data.immediateOutputs, COLUMN_IDS.immediateOutputs);
  populateColumn(data.intermediateOutputs, COLUMN_IDS.intermediateOutputs);
  populateColumn(data.longTermOutputs, COLUMN_IDS.longTermOutputs);

  
  // ========================================
  // INITIAL SETUP & AUTO-SELECTION
  // ========================================
  
  // Hide PBC Components column by default and create horizontal filter
  toggleColumnVisibility(COLUMN_IDS.pbcComponents, 'PBC Components', 'pbcComponents', 0, true);
  
  // Auto-select the first PBC component on load
  setTimeout(() => {
    const pbcHorizontalBar = document.getElementById(`${NAMESPACE}-horizontal-pbcComponents`);
    if (pbcHorizontalBar && data.pbcComponents && data.pbcComponents.length > 0) {
      const firstPBCComponent = data.pbcComponents[0];
      const firstPBCButton = [...pbcHorizontalBar.querySelectorAll('div')]
        .find(button => button.textContent === firstPBCComponent);
      
      if (firstPBCButton) {
        // Select the first PBC component
        window.FilterManager.addSelectedItem(firstPBCComponent);
        firstPBCButton.classList.add('selected');
        
        // Apply selected styling
        const pbcColor = getPBCComponentColor(firstPBCComponent);
        firstPBCButton.style.backgroundColor = `${pbcColor}80`;
        
        // Update brand gradient based on selected PBC component
        const newGradient = createPBCGradient(pbcColor);
        updateDashboardColors(newGradient);
        
        console.log(`🎯 Auto-selected first PBC Component on load: "${firstPBCComponent}"`);
      }
    }
    
    applyPartnerFiltering();
  }, 100);

  
  // ========================================
  // FOOTER
  // ========================================
  
  /** Create footer with attribution */
  const createFooter = () => {
    const footer = createElement(dashboard, 'div', 'footer');
    const footerText = createElement(footer, 'div');
    footerText.innerText = 'Built and maintained by';
    const footerLink = createElement(footer, 'a');
    footerLink.setAttribute('href', 'http://www.januaryadvisors.com');
    footerLink.setAttribute('rel', 'noopener noreferrer');
    footerLink.setAttribute('target', '_blank');
    const footerLogo = createElement(footerLink, 'img');
    footerLogo.src = './assets/logo.svg';
  };
  
  createFooter();
};
