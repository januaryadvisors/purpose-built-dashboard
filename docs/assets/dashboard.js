window.onload = async function () {
  const addElement = (parent, type, id, className) => {
    const el = document.createElement(type);
    if (id) {
      el.id = `${namespace}-${id}`;
    }
    if (className) {
      el.className = `${namespace}-${className}`;
    }
    parent.appendChild(el);
    return el;
  };

  const addTooltip = (parent, tooltipText, root) => {
    const infoWrapper = addElement(parent, 'div', null, 'tooltip-icon');
    infoWrapper.style.display = 'inline';
    const infoEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    infoEl.style.position = '';
    infoEl.setAttribute('viewBox', '0 0 24 24');
    const infoPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    infoPath.setAttribute(
      'd',
      'm11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z',
    );
    infoPath.setAttribute('stroke-linecap', 'round');
    infoPath.setAttribute('stroke-linejoin', 'round');
    infoPath.setAttribute('stroke-width', 1.5);
    infoEl.appendChild(infoPath);
    infoWrapper.appendChild(infoEl);
    parent.appendChild(infoWrapper);
    // Create Tooltip
    const tooltip = addElement(root, 'div', null, 'tooltip');
    tooltip.innerText = tooltipText;
    tooltip.style.display = 'none';
    tooltip.style.position = 'fixed';
    tooltip.style.transform = 'translateY(-50%)';

    infoWrapper.onmouseenter = () => {
      const bounds = infoEl.getBoundingClientRect();
      if (bounds.left < window.innerWidth / 2) {
        tooltip.style.left = bounds.right + 'px';
        tooltip.style.top = bounds.top + 12 + 'px';
        tooltip.style.margin = '0 0 0 6px';
      } else {
        tooltip.style.right = window.innerWidth - bounds.left + 'px';
        tooltip.style.top = bounds.top + 12 + 'px';
        tooltip.style.margin = '0 6px 0';
      }
      tooltip.style.display = 'block';
    };
    infoWrapper.onmouseleave = () => {
      tooltip.style.display = 'none';
    };
  };

  // Namespace used for css classes to prevent collision
  const namespace = 'momentum-dashboard';

  const dashboard = document.getElementById(namespace);

  const inputId = `${namespace}-input`;
  const partnersId = `${namespace}-partners`;
  const strategiesId = `${namespace}-strategies`;
  const outputsId = `${namespace}-outputs`;
  const immediateOutputsId = `${namespace}-immediate-outputs`;
  const intermediateOutputsId = `${namespace}-intermediate-outputs`;
  const longTermOutputsId = `${namespace}-long-term-outputs`;

  const brandGradient = ['#fbcdb0', '#f8A97d', '#f5844a', '#f65c2c', '#D75027', '#b84521', '#9a3b1c'];

  const dashboardWrapper = addElement(dashboard, 'div', 'body-wrapper');
  
  // Add controls section for the checkbox
  const controlsWrapper = addElement(dashboardWrapper, 'div', 'controls-wrapper');
  controlsWrapper.style.marginBottom = '20px';
  controlsWrapper.style.padding = '10px';
  controlsWrapper.style.backgroundColor = '#f5f5f5';
  controlsWrapper.style.borderRadius = '5px';
  
  const checkboxLabel = addElement(controlsWrapper, 'label');
  checkboxLabel.style.display = 'flex';
  checkboxLabel.style.alignItems = 'center';
  checkboxLabel.style.gap = '8px';
  checkboxLabel.style.fontSize = '14px';
  
  const checkbox = addElement(checkboxLabel, 'input');
  checkbox.type = 'checkbox';
  checkbox.id = `${namespace}-hide-partners`;
  
  const checkboxText = addElement(checkboxLabel, 'span');
  checkboxText.textContent = 'Hide Partners Column';
  
  const headersWrapper = addElement(dashboardWrapper, 'div', 'header-wrapper');
  const columnsWrapper = addElement(dashboardWrapper, 'div', 'columns-wrapper');

  const textClass = `${namespace}-datum`;

  // Holds whether or not a strategy has been clicked
  let clickedStrategy = false;

  const columns = {
    [inputId]: {
      columnColor: brandGradient[0],
      label: 'Inputs',
    },
    [partnersId]: {
      columnColor: brandGradient[1],
      label: 'Partners',
    },
    [strategiesId]: {
      columnColor: brandGradient[2],
      label: 'Strategies',
    },
    [outputsId]: {
      columnColor: brandGradient[3],
      label: 'Outputs',
    },
    [immediateOutputsId]: {
      columnColor: brandGradient[4],
      label: 'Immediate Outcomes',
    },
    [intermediateOutputsId]: {
      columnColor: brandGradient[5],
      label: 'Intermediate Outcomes',
    },
    [longTermOutputsId]: {
      columnColor: brandGradient[6],
      label: 'Long-Term Outcomes',
    },
  };

  // Function to toggle partners column visibility
  const togglePartnersColumn = (hidePartners) => {
    // Find the partners header by looking for the header with "Partners" text
    const allHeaders = document.querySelectorAll(`.${namespace}-header`);
    const partnersHeader = Array.from(allHeaders).find(header => 
      header.querySelector('h2') && header.querySelector('h2').textContent.includes('Partners')
    );
    const partnersColumn = document.getElementById(partnersId);
    
    // Check if horizontal partners bar already exists
    let horizontalPartnersBar = document.getElementById(`${namespace}-horizontal-partners`);
    
    // Track selected partners for filtering
    let selectedPartners = new Set();
    
    // Function to filter strategies based on selected partners
    const filterStrategiesByPartners = () => {
      const strategiesColumn = document.getElementById(strategiesId);
      const strategiesChildren = strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`);
      
      if (selectedPartners.size === 0) {
        // Show all strategies if no partners selected
        [...strategiesChildren].forEach(child => {
          child.style.display = 'block';
        });
        
        // Show all items in other columns
        const allColumns = [outputsId, immediateOutputsId, intermediateOutputsId, longTermOutputsId];
        allColumns.forEach(columnId => {
          const column = document.getElementById(columnId);
          if (column) {
            const columnChildren = column.getElementsByClassName(`${namespace}-data-wrapper`);
            [...columnChildren].forEach(child => {
              child.style.display = 'block';
            });
          }
        });
      } else {
        // Get visible strategies
        const visibleStrategies = [];
        [...strategiesChildren].forEach((child, idx) => {
          const strategy = strategyValues[idx];
          const strategyPartners = strategy.partners.map(partnerIdx => data.partners[partnerIdx]);
          const hasSelectedPartner = strategyPartners.some(partner => selectedPartners.has(partner));
          
          if (hasSelectedPartner) {
            visibleStrategies.push(strategy);
            child.style.display = 'block';
          } else {
            child.style.display = 'none';
          }
        });
        
        // Filter other columns based on visible strategies
        const filterColumnByStrategies = (columnId, dataKey) => {
          const column = document.getElementById(columnId);
          if (!column) return;
          
          const columnChildren = column.getElementsByClassName(`${namespace}-data-wrapper`);
          const columnData = data[dataKey];
          
          [...columnChildren].forEach((child, idx) => {
            const item = columnData[idx];
            
            // Check if this item is connected to any visible strategy
            const isConnected = visibleStrategies.some(strategy => {
              const strategyItems = strategy[dataKey];
              return strategyItems && strategyItems.includes(idx);
            });
            
            child.style.display = isConnected ? 'block' : 'none';
          });
        };
        
        // Filter each column
        filterColumnByStrategies(outputsId, 'outputs');
        filterColumnByStrategies(immediateOutputsId, 'immediateOutputs');
        filterColumnByStrategies(intermediateOutputsId, 'intermediateOutputs');
        filterColumnByStrategies(longTermOutputsId, 'longTermOutputs');
      }
    };
    
    if (hidePartners) {
      // Hide partners column
      if (partnersHeader) partnersHeader.style.display = 'none';
      if (partnersColumn) partnersColumn.style.display = 'none';
      
      // Create horizontal partners bar if it doesn't exist
      if (!horizontalPartnersBar) {
        horizontalPartnersBar = addElement(dashboard, 'div', 'horizontal-partners');
        horizontalPartnersBar.style.display = 'flex';
        horizontalPartnersBar.style.flexWrap = 'wrap';
        horizontalPartnersBar.style.gap = '10px';
        horizontalPartnersBar.style.padding = '15px';
        horizontalPartnersBar.style.backgroundColor = brandGradient[1] + '1A';
        horizontalPartnersBar.style.border = `2px solid ${brandGradient[1]}80`;
        horizontalPartnersBar.style.borderRadius = '8px';
        horizontalPartnersBar.style.marginBottom = '20px';
        
        // Add title
        const titleDiv = addElement(horizontalPartnersBar, 'div');
        titleDiv.style.fontWeight = 'bold';
        titleDiv.style.marginBottom = '10px';
        titleDiv.style.width = '100%';
        titleDiv.style.color = brandGradient[1];
        titleDiv.textContent = 'Partners (click to filter strategies):';
        
        // Add partners as clickable toggle buttons
        data.partners.forEach(partner => {
          const partnerDiv = addElement(horizontalPartnersBar, 'div');
          partnerDiv.style.padding = '8px 12px';
          partnerDiv.style.backgroundColor = brandGradient[1] + '20';
          partnerDiv.style.border = `1px solid ${brandGradient[1]}60`;
          partnerDiv.style.borderRadius = '4px';
          partnerDiv.style.fontSize = '14px';
          partnerDiv.style.color = brandGradient[1];
          partnerDiv.style.cursor = 'pointer';
          partnerDiv.style.transition = 'all 0.2s ease';
          partnerDiv.textContent = partner;
          
          // Add click functionality
          partnerDiv.addEventListener('click', () => {
            if (selectedPartners.has(partner)) {
              // Deselect partner
              selectedPartners.delete(partner);
              partnerDiv.style.backgroundColor = brandGradient[1] + '20';
              partnerDiv.style.border = `1px solid ${brandGradient[1]}60`;
            } else {
              // Select partner
              selectedPartners.add(partner);
              partnerDiv.style.backgroundColor = brandGradient[1] + '60';
              partnerDiv.style.border = `2px solid ${brandGradient[1]}`;
            }
            filterStrategiesByPartners();
          });
          
          // Add hover effects
          partnerDiv.addEventListener('mouseenter', () => {
            if (!selectedPartners.has(partner)) {
              partnerDiv.style.backgroundColor = brandGradient[1] + '40';
            }
          });
          
          partnerDiv.addEventListener('mouseleave', () => {
            if (!selectedPartners.has(partner)) {
              partnerDiv.style.backgroundColor = brandGradient[1] + '20';
            }
          });
        });
        
        // Insert the horizontal partners bar before the dashboardWrapper
        dashboard.insertBefore(horizontalPartnersBar, dashboardWrapper);
      } else {
        horizontalPartnersBar.style.display = 'flex';
      }
    } else {
      // Show partners column
      if (partnersHeader) partnersHeader.style.display = 'flex';
      if (partnersColumn) partnersColumn.style.display = 'block';
      
      // Hide horizontal partners bar
      if (horizontalPartnersBar) {
        horizontalPartnersBar.style.display = 'none';
      }
      
      // Clear any partner filtering when showing the column
      selectedPartners.clear();
      const strategiesColumn = document.getElementById(strategiesId);
      if (strategiesColumn) {
        const strategiesChildren = strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`);
        [...strategiesChildren].forEach(child => {
          child.style.display = 'block';
        });
      }
    }
  };

  // Add event listener to checkbox
  checkbox.addEventListener('change', (e) => {
    togglePartnersColumn(e.target.checked);
  });

  // Create our modal element
  const createModal = () => {
    const modal = addElement(document.body, 'div', 'modal');
    modal.onclick = () => {
      modal.scrollTop = 0;
      modal.style.display = 'none';
    };

    const modalContent = addElement(modal, 'div', 'modal-content');
    modalContent.style.border = `6px solid ${brandGradient[0]}`;
    modalContent.style.background = '#FFF';
    modalContent.onclick = e => e.stopPropagation();

    const closeWrapper = addElement(modalContent, 'div', 'close-wrapper');

    const closeButton = addElement(closeWrapper, 'button');
    closeButton.textContent = 'Close';
    closeButton.onclick = () => {
      modal.scrollTop = 0;
      modal.style.display = 'none';
    };

    const modalHeader = addElement(modalContent, 'div', 'modal-header');
    const researchWrapper = addElement(modalContent, 'div');
    const researchParagraph = addElement(researchWrapper, 'div');
    const researchHeader = addElement(researchWrapper, 'div', 'research-header');
    researchHeader.innerText = 'Research';
    const researchBody = addElement(researchWrapper, 'div');
    return { modal, modalHeader, researchParagraph, researchBody };
  };

  const { modal, modalHeader, researchParagraph, researchBody } = createModal();

  // Shows modal with strategy details
  const showStrategyModal = i => () => {
    modalHeader.innerText = strategyValues[i].label;

    researchParagraph.innerText = strategyValues[i].details;

    [...researchBody.children].forEach((c, i) => i !== 0 && c.remove());

    strategyValues[i].research.forEach(r => {
      const relatedOutcomes = r.relatedOutcomes;
      const citationLink = r.citationLink;
      const citationLinkText = r.citationLinkText;
      const citation = r.citation;
      const researchEl = addElement(researchBody, 'div', null, 'research-item');
      const researchCitation = addElement(researchEl, 'div');
      researchCitation.innerText = citation;

      const researchLink = document.createElement('a');
      researchLink.setAttribute('href', citationLink);
      researchLink.innerText = citationLinkText;
      researchLink.setAttribute('rel', 'noopener noreferrer');
      researchLink.setAttribute('target', '_blank');
      researchEl.appendChild(researchLink);

      const researchOutcomesWrapper = addElement(
        researchEl,
        'div',
        null,
        'research-outcomes-wrapper',
      );
      researchOutcomesWrapper.innerText = `Related Outcomes: `;
      const researchOutcomes = addElement(
        researchOutcomesWrapper,
        'span',
        null,
        'research-outcomes',
      );
      researchOutcomes.innerText = relatedOutcomes.join(', ');
    });

    modal.style.display = 'block';
  };

  // Creates an arrow for the header with text
  const createHeaderElement = ({ columnColor, label, tooltip, isLast }) => {
    const headerEl = addElement(headersWrapper, 'div', null, 'header');
    const labelWrapper = addElement(headerEl, 'div', null, 'header-label-wrapper');
    const labelInnerWrapper = addElement(labelWrapper, 'div');
    const headerText = addElement(labelInnerWrapper, 'h2');
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

  let data = null;
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
    
    // Skip cache check for now to always fetch fresh data
    if (false && CONFIG.USE_LIVE_GOOGLE_SHEETS) {
      data = JSON.parse(cachedData);
      console.log('Using cached data');
      
      // Show cache status
      const cacheDiv = addElement(dashboardWrapper, 'div', 'cache-status');
      cacheDiv.style.textAlign = 'center';
      cacheDiv.style.padding = '10px';
      cacheDiv.style.fontSize = '12px';
      cacheDiv.style.color = '#666';
      cacheDiv.style.backgroundColor = '#f0f0f0';
      cacheDiv.style.borderRadius = '3px';
      cacheDiv.style.marginBottom = '10px';
      const cacheAge = Math.round((now - parseInt(cacheTimestamp)) / 1000 / 60);
      cacheDiv.innerText = `Using cached data (${cacheAge} min old) - Refresh page to check for updates`;
    } else if (CONFIG.USE_LIVE_GOOGLE_SHEETS) {
      // Add loading indicator
      const loadingDiv = addElement(dashboardWrapper, 'div', 'loading');
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
            // All long term outputs are associated with every strategy
            longTermOutputs: longTermOutputs.map((_, i) => i),
            partners: arrayify(row.Partners).map(partner => partners.indexOf(partner)),
            research: [],
          },
        ]),
      );

      // Process research data with safety checks
      console.log('📚 Processing research data, count:', research.length);
      research.forEach((r, index) => {
        console.log(`📝 Processing research item ${index}:`, r);
        
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
          console.log(`✅ Added research to ${researchStrategy}`);
        } else {
          if (!match.relatedOutcomes.includes(relatedOutcome)) {
            match.relatedOutcomes.push(relatedOutcome);
            console.log(`📝 Added outcome to existing research in ${researchStrategy}`);
          }
        }
      });

      // Sort research citations alphabetically
      Object.entries(strategies).forEach(([_, strategy], i) => {
        strategy.research.sort((a, b) => {
          return a.citation.replace('"', '').localeCompare(b.citation.replace('"', ''));
        });
      });
      console.log('//////')
      console.log(inputTooltips)
      console.log('//////')
      // Build final data object
      data = {
        headerTooltips: headerTooltips.map(t => t[1]),
        inputs,
        inputTooltips: inputs.map(input => {
          const tooltip = inputTooltips.find(t => t['Inputs Condensed'] === input);
          return tooltip ? (tooltip['Description'] || input) : input;
        }),
        strategies,
        partners,
        outputs,
        immediateOutputs,
        intermediateOutputs,
        longTermOutputs,
      };

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
      const loadingDiv = document.getElementById(`${namespace}-loading`);
      if (loadingDiv) {
        loadingDiv.innerText = 'Using cached data (Google Sheets unavailable)';
        loadingDiv.style.color = '#f65c2c';
        setTimeout(() => loadingDiv.remove(), 3000);
      }
    } catch (fallbackError) {
      console.error('Failed to load fallback data:', fallbackError);
      
      // Show error message
      const errorDiv = addElement(dashboardWrapper, 'div', 'error');
      errorDiv.style.textAlign = 'center';
      errorDiv.style.padding = '40px';
      errorDiv.style.fontSize = '18px';
      errorDiv.style.color = '#d32f2f';
      errorDiv.innerText = 'Failed to load data. Please try again later.';
      return;
    }
  }

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
    const columnWrapper = addElement(columnsWrapper, 'div', null, 'column-wrapper');
    columnWrapper.id = id;
    columnWrapper.style.border = `1px solid ${columnColor}80`;
    columnWrapper.style.background = `${columnColor}1A`;
    return columnWrapper;
  });

  // Helper fn that highlights a column if it's associated with the hovered column
  const highlightColumn = (data, columnKey, columnId) => {
    const highlightIndices = data[columnKey];
    const highlightColumn = document.getElementById(columnId);
    const columnChildren = highlightColumn.getElementsByClassName(textClass);
    highlightIndices.forEach(idx => {
      const dataToHighlight = columnChildren[idx];
      dataToHighlight.style.background = `${columns[columnId].columnColor}80`;
    });
  };

  // Removes column higlights
  const removeColumnHighlights = () => {
    if (clickedStrategy) {
      return;
    }
    columnEls.forEach(columnEl => {
      const dataChildren = [...columnEl.getElementsByClassName(textClass)];
      dataChildren.forEach(child => {
        child.style.background = 'transparent';
      });
    });
  };

  const strategyValues = Object.values(data.strategies);

  const highlightStrategyOutcomes = i => () => {
    if (clickedStrategy) {
      return;
    }
    highlightColumn(strategyValues[i], 'partners', partnersId);
    highlightColumn(strategyValues[i], 'outputs', outputsId);
    highlightColumn(strategyValues[i], 'immediateOutputs', immediateOutputsId);
    highlightColumn(strategyValues[i], 'intermediateOutputs', intermediateOutputsId);
    highlightColumn(strategyValues[i], 'longTermOutputs', longTermOutputsId);
  };

  const unfilterColumns = () => {
    clickedStrategy = false;
    [strategiesId, outputsId, immediateOutputsId, intermediateOutputsId].forEach(columnId => {
      const column = document.getElementById(columnId);
      const columnChildren = column.getElementsByClassName(`${namespace}-data-wrapper`);
      [...columnChildren].forEach(child => {
        child.style.display = 'block';
      });
    });
    seeAllButton.style.display = 'none';
  };

  const filterToStrategy = i => () => {
    if (clickedStrategy) {
      unfilterColumns();
      return;
    }
    // Only show the clicked on strategy
    highlightStrategyOutcomes(i);
    // Set clickedStrategy to true so we can disable hover states
    clickedStrategy = true;

    const strategiesColumn = document.getElementById(strategiesId);
    const strategiesChildren = strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`);
    [...strategiesChildren].forEach((child, idx) => {
      if (idx !== i) {
        child.style.display = 'none';
      } else {
        child.style.display = 'block';
      }
    });

    // Only show the related outcomes
    const filterColumn = (data, columnKey, columnId) => {
      const highlightIndices = data[columnKey];
      const highlightColumn = document.getElementById(columnId);
      const columnChildren = highlightColumn.getElementsByClassName(`${namespace}-data-wrapper`);
      [...columnChildren].forEach((child, i) => {
        if (!highlightIndices.includes(i)) {
          child.style.display = 'none';
        } else {
          child.style.display = 'block';
        }
      });
    };

    filterColumn(strategyValues[i], 'partners', partnersId);
    filterColumn(strategyValues[i], 'outputs', outputsId);
    filterColumn(strategyValues[i], 'immediateOutputs', immediateOutputsId);
    filterColumn(strategyValues[i], 'intermediateOutputs', intermediateOutputsId);

    // Show the reset button
    seeAllButton.style.display = 'block';
  };

  const addDataToColumn = (data, columnId, tooltips) => {
    data.forEach((datum, i) => {
      const wrapperDiv = document.createElement('div');
      document.getElementById(columnId).appendChild(wrapperDiv);

      const dataDiv = document.createElement('div');
      dataDiv.className = `${namespace}-data-wrapper`;
      if (i !== data.length - 1) {
        dataDiv.style.borderBottom = `1px solid ${columns[columnId].columnColor}80`;
      }
      wrapperDiv.appendChild(dataDiv);

      if (columnId === strategiesId) {
        dataDiv.onmouseenter = highlightStrategyOutcomes(i);
        dataDiv.onmouseleave = removeColumnHighlights;

        const button = document.createElement('button');
        button.className = `${textClass} ${namespace}-button`;
        button.textContent = datum;
        dataDiv.appendChild(button);

        const filterButtonWrapper = document.createElement('div');
        filterButtonWrapper.className = `${namespace}-filter-button-wrapper`;
        const filterButton = document.createElement('button');
        filterButton.className = `${namespace}-filter-button`;
        filterButton.textContent = 'Learn more';
        filterButtonWrapper.appendChild(filterButton);
        dataDiv.appendChild(filterButtonWrapper);

        button.onclick = filterToStrategy(i);
        filterButton.onclick = showStrategyModal(i);
      } else {
        const textDiv = document.createElement('div');
        textDiv.className = textClass;
        dataDiv.appendChild(textDiv);
        textDiv.innerText = datum;
        if (tooltips) {
          addTooltip(textDiv, tooltips[i], dashboardWrapper);
        }
        
        // Add hover functionality for non-strategy columns
        const highlightRelatedStrategies = () => {
          if (clickedStrategy) return;
          
          // Highlight the hovered item itself
          textDiv.style.background = `${columns[columnId].columnColor}80`;
          
          // Find strategies that are connected to this item
          const connectedStrategies = [];
          strategyValues.forEach((strategy, strategyIdx) => {
            let isConnected = false;
            
            if (columnId === outputsId && strategy.outputs.includes(i)) {
              isConnected = true;
            } else if (columnId === immediateOutputsId && strategy.immediateOutputs.includes(i)) {
              isConnected = true;
            } else if (columnId === intermediateOutputsId && strategy.intermediateOutputs.includes(i)) {
              isConnected = true;
            } else if (columnId === longTermOutputsId && strategy.longTermOutputs.includes(i)) {
              isConnected = true;
            }
            
            if (isConnected) {
              connectedStrategies.push(strategyIdx);
            }
          });
          
          // Highlight connected strategies
          const strategiesColumn = document.getElementById(strategiesId);
          const strategiesChildren = strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`);
          connectedStrategies.forEach(strategyIdx => {
            if (strategiesChildren[strategyIdx]) {
              strategiesChildren[strategyIdx].style.background = `${columns[strategiesId].columnColor}80`;
            }
          });
          
          // Highlight related items in other columns based on connected strategies
          const highlightRelatedItems = (targetColumnId, dataKey) => {
            const targetColumn = document.getElementById(targetColumnId);
            if (!targetColumn) return;
            
            const targetChildren = targetColumn.getElementsByClassName(`${namespace}-data-wrapper`);
            const targetData = data[dataKey];
            
            // Get all related items from connected strategies
            const relatedItems = new Set();
            connectedStrategies.forEach(strategyIdx => {
              const strategy = strategyValues[strategyIdx];
              if (strategy[dataKey]) {
                strategy[dataKey].forEach(itemIdx => {
                  relatedItems.add(itemIdx);
                });
              }
            });
            
            // Highlight related items
            [...targetChildren].forEach((child, idx) => {
              if (relatedItems.has(idx)) {
                child.style.background = `${columns[targetColumnId].columnColor}80`;
              }
            });
          };
          
          // Highlight related items in all other columns
          if (columnId !== outputsId) highlightRelatedItems(outputsId, 'outputs');
          if (columnId !== immediateOutputsId) highlightRelatedItems(immediateOutputsId, 'immediateOutputs');
          if (columnId !== intermediateOutputsId) highlightRelatedItems(intermediateOutputsId, 'intermediateOutputs');
          if (columnId !== longTermOutputsId) highlightRelatedItems(longTermOutputsId, 'longTermOutputs');
        };
        
        const removeItemHighlights = () => {
          if (clickedStrategy) return;
          
          // Remove highlight from hovered item
          textDiv.style.background = 'transparent';
          
          // Remove highlights from all columns manually
          const allColumns = [strategiesId, outputsId, immediateOutputsId, intermediateOutputsId, longTermOutputsId];
          allColumns.forEach(columnId => {
            const column = document.getElementById(columnId);
            if (column) {
              const columnChildren = [...column.getElementsByClassName(`${namespace}-data-wrapper`)];
              columnChildren.forEach(child => {
                child.style.background = 'transparent';
              });
            }
          });
        };
        
        dataDiv.onmouseenter = highlightRelatedStrategies;
        dataDiv.onmouseleave = removeItemHighlights;
      }
    });
  };

  const strategiesColumn = document.getElementById(strategiesId);
  const seeAllButton = document.createElement('button');

  addDataToColumn(data.inputs, inputId, data.inputTooltips);
  addDataToColumn(data.partners, partnersId);
  addDataToColumn(Object.keys(data.strategies), strategiesId);

  seeAllButton.className = `${namespace}-see-all`;
  seeAllButton.style.display = 'none';
  seeAllButton.textContent = 'See All Strategies';
  strategiesColumn.appendChild(seeAllButton);
  seeAllButton.onclick = unfilterColumns;

  addDataToColumn(data.outputs, outputsId);
  addDataToColumn(data.immediateOutputs, immediateOutputsId);
  addDataToColumn(data.intermediateOutputs, intermediateOutputsId);
  addDataToColumn(data.longTermOutputs, longTermOutputsId);

  const addFooter = () => {
    const footer = addElement(dashboard, 'div', 'footer');
    const footerText = addElement(footer, 'div');
    footerText.innerText = 'Built and maintained by';
    const footerLink = addElement(footer, 'a');
    footerLink.setAttribute('href', 'http://www.januaryadvisors.com');
    footerLink.setAttribute('rel', 'noopener noreferrer');
    footerLink.setAttribute('target', '_blank');
    const footerLogo = addElement(footerLink, 'img');
    footerLogo.src = './assets/logo.svg';
  };
  addFooter();
};
