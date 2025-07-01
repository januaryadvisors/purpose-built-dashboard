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
  const pbcComponentsId = `${namespace}-pbc-components`;
  const partnersId = `${namespace}-partners`;
  const strategiesId = `${namespace}-strategies`;
  const outputsId = `${namespace}-outputs`;
  const immediateOutputsId = `${namespace}-immediate-outputs`;
  const intermediateOutputsId = `${namespace}-intermediate-outputs`;
  const longTermOutputsId = `${namespace}-long-term-outputs`;

  const brandGradient = ['#fbcdb0', '#f8A97d', '#f5844a', '#f65c2c', '#D75027', '#b84521', '#9a3b1c'];

  const dashboardWrapper = addElement(dashboard, 'div', 'body-wrapper');
  
  // Add controls section for the checkboxes
  const controlsWrapper = addElement(dashboardWrapper, 'div', 'controls-wrapper');
  controlsWrapper.style.marginBottom = '20px';
  controlsWrapper.style.padding = '10px';
  controlsWrapper.style.backgroundColor = '#f5f5f5';
  controlsWrapper.style.borderRadius = '5px';
  controlsWrapper.style.display = 'flex';
  controlsWrapper.style.gap = '20px';
  controlsWrapper.style.flexWrap = 'wrap';
  
  // Partners checkbox
  const partnersCheckboxLabel = addElement(controlsWrapper, 'label');
  partnersCheckboxLabel.style.display = 'flex';
  partnersCheckboxLabel.style.alignItems = 'center';
  partnersCheckboxLabel.style.gap = '8px';
  partnersCheckboxLabel.style.fontSize = '14px';
  
  const partnersCheckbox = addElement(partnersCheckboxLabel, 'input');
  partnersCheckbox.type = 'checkbox';
  partnersCheckbox.id = `${namespace}-hide-partners`;
  
  const partnersCheckboxText = addElement(partnersCheckboxLabel, 'span');
  partnersCheckboxText.textContent = 'Hide Partners Column';
  
  // PBC Components checkbox
  const pbcCheckboxLabel = addElement(controlsWrapper, 'label');
  pbcCheckboxLabel.style.display = 'flex';
  pbcCheckboxLabel.style.alignItems = 'center';
  pbcCheckboxLabel.style.gap = '8px';
  pbcCheckboxLabel.style.fontSize = '14px';
  
  const pbcCheckbox = addElement(pbcCheckboxLabel, 'input');
  pbcCheckbox.type = 'checkbox';
  pbcCheckbox.id = `${namespace}-hide-pbc-components`;
  pbcCheckbox.checked = true;
  
  const pbcCheckboxText = addElement(pbcCheckboxLabel, 'span');
  pbcCheckboxText.textContent = 'Hide PBC Components Column';
  
  const headersWrapper = addElement(dashboardWrapper, 'div', 'header-wrapper');
  const columnsWrapper = addElement(dashboardWrapper, 'div', 'columns-wrapper');

  const textClass = `${namespace}-datum`;

  // Holds whether or not a strategy has been clicked
  let clickedStrategy = false;

  // PBC Component color mapping
  const pbcColors = {
    'Economic Vitality': '#7B8FC5',
    'Education': '#7ED7A2', 
    'Community Vibrancy': '#E5B8A0'
  };

  // Function to get PBC Component color
  const getPBCColor = (pbcComponent) => {
    const pbcColors = {
      'Economic Vitality': '#7B8FC5',
      'Education': '#7ED7A2', 
      'Community Vibrancy': '#E5B8A0'
    };
    return pbcColors[pbcComponent] || '#E1B047'; // Default to mustard if not found
  };

    // Function to blend two hex colors (alternative to half-half split)
  const blendColors = (color1, color2) => {
    // Remove # if present
    color1 = color1.replace('#', '');
    color2 = color2.replace('#', '');
    
    // Parse RGB components
    const r1 = parseInt(color1.substr(0, 2), 16);
    const g1 = parseInt(color1.substr(2, 2), 16);
    const b1 = parseInt(color1.substr(4, 2), 16);
    
    const r2 = parseInt(color2.substr(0, 2), 16);
    const g2 = parseInt(color2.substr(2, 2), 16);
    const b2 = parseInt(color2.substr(4, 2), 16);
    
    // Average the colors
    const r = Math.round((r1 + r2) / 2);
    const g = Math.round((g1 + g2) / 2);
    const b = Math.round((b1 + b2) / 2);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Function to trigger Partner button clicks based on selected PBC Components
  const triggerPartnerCascadeFromPBC = () => {
    const pbcHorizontalBar = document.getElementById(`${namespace}-horizontal-pbcComponents`);
    const partnersHorizontalBar = document.getElementById(`${namespace}-horizontal-partners`);
    
    if (!pbcHorizontalBar || !partnersHorizontalBar) {
      console.log('❌ Missing horizontal bars for cascade');
      return;
    }
    
    // Get currently selected PBC Components by checking CSS classes
    const selectedPBCComponents = new Set();
    const pbcButtons = pbcHorizontalBar.querySelectorAll('div.selected');
    pbcButtons.forEach(button => {
      selectedPBCComponents.add(button.textContent);
    });
    
    console.log(`📋 Currently selected PBC Components: [${Array.from(selectedPBCComponents).join(', ')}]`);
    
    // Find all partners that should be selected based on selected PBC Components
    const partnersToSelect = new Set();
    if (selectedPBCComponents.size > 0) {
      // Go through strategies to find which partners are connected to selected PBC Components
      Object.values(data.strategies).forEach(strategy => {
        const strategyPBCComponents = strategy.pbcComponents ? strategy.pbcComponents.map(idx => data.pbcComponents[idx]) : [];
        const hasSelectedPBC = strategyPBCComponents.some(pbc => selectedPBCComponents.has(pbc));
        
        if (hasSelectedPBC) {
          // Add all partners from this strategy
          const strategyPartners = strategy.partners ? strategy.partners.map(idx => data.partners[idx]) : [];
          strategyPartners.forEach(partner => partnersToSelect.add(partner));
        }
      });
    } else {
      // No PBC Components selected - clear all Partner button selections
      console.log('🧹 No PBC Components selected, clearing all Partner buttons');
      clearPartnerButtonSelections();
      return; // Exit early since we just need to clear everything
    }
    
    console.log(`🤝 Partners that should be selected: [${Array.from(partnersToSelect).join(', ')}]`);
    
    // Get all Partner buttons and determine which ones need to be clicked
    const partnerButtons = partnersHorizontalBar.querySelectorAll('div.partner-button');
    partnerButtons.forEach(button => {
      const partnerName = button.textContent;
      const shouldBeSelected = partnersToSelect.has(partnerName);
      const isCurrentlySelected = button.classList.contains('selected');
      
      console.log(`🔍 Partner "${partnerName}": shouldBe=${shouldBeSelected}, currently=${isCurrentlySelected}`);
      
      // Find which PBC Components this partner is connected to
      const connectedPBCs = new Set();
      if (shouldBeSelected) {
        Object.values(data.strategies).forEach(strategy => {
          const strategyPBCComponents = strategy.pbcComponents ? strategy.pbcComponents.map(idx => data.pbcComponents[idx]) : [];
          const hasSelectedPBC = strategyPBCComponents.some(pbc => selectedPBCComponents.has(pbc));
          
          if (hasSelectedPBC) {
            const strategyPartners = strategy.partners ? strategy.partners.map(idx => data.partners[idx]) : [];
            if (strategyPartners.includes(partnerName)) {
              strategyPBCComponents.forEach(pbc => {
                if (selectedPBCComponents.has(pbc)) {
                  connectedPBCs.add(pbc);
                }
              });
            }
          }
        });
      }
      
      // Only trigger click if the state needs to change
      if (shouldBeSelected && !isCurrentlySelected) {
        // Need to select this partner
        console.log(`👆 Clicking to SELECT partner: ${partnerName}`);
        button.click();
        
        // Apply color styling based on connected PBC Components
        setTimeout(() => {
          applyPartnerColors(button, Array.from(connectedPBCs));
        }, 100); // Increased delay to ensure click handler finishes
        
      } else if (!shouldBeSelected && isCurrentlySelected) {
        // Need to deselect this partner
        console.log(`👆 Clicking to DESELECT partner: ${partnerName}`);
        button.click();
      }
    });
  };

  // Function to apply PBC Component colors to Partner buttons using CSS classes
  const applyPartnerColors = (partnerButton, connectedPBCs) => {
    if (connectedPBCs.length === 0) return;
    
    console.log(`🎨 Applying colors to partner "${partnerButton.textContent}" for PBCs: [${connectedPBCs.join(', ')}]`);
    
    // Clear any existing PBC Component classes
    partnerButton.classList.remove('pbc-economic-vitality', 'pbc-education', 'pbc-community-vibrancy');
    
    // Add CSS classes based on connected PBC Components
    connectedPBCs.forEach(pbc => {
      const pbcClass = pbc.toLowerCase().replace(/\s+/g, '-');
      partnerButton.classList.add(`pbc-${pbcClass}`);
    });
    
    if (connectedPBCs.length === 1) {
      console.log(`🎨 Applied ${connectedPBCs[0]} CSS class to partner: ${partnerButton.textContent}`);
    } else {
      console.log(`🌈 Applied multiple PBC CSS classes to partner: ${partnerButton.textContent}`);
    }
  };

  // Function to clear Partner column colors
  const clearPartnerColumnColors = () => {
    const partnersColumn = document.getElementById(partnersId);
    if (partnersColumn) {
      const partnersChildren = partnersColumn.getElementsByClassName(`${namespace}-data-wrapper`);
      [...partnersChildren].forEach(child => {
        const partnerItem = child.querySelector(`.${namespace}-datum`);
        if (partnerItem) {
          partnerItem.style.backgroundColor = '';
          partnerItem.style.border = '';
          partnerItem.style.background = '';
          partnerItem.style.borderRadius = '';
          partnerItem.style.padding = '';
          partnerItem.style.boxShadow = '';
          partnerItem.style.opacity = '';
          // Clear data attributes
          partnerItem.removeAttribute('data-pbc-colored');
          partnerItem.removeAttribute('data-original-bg');
          partnerItem.removeAttribute('data-original-border');
          partnerItem.removeAttribute('data-original-border-radius');
          partnerItem.removeAttribute('data-original-padding');
        }
      });
      console.log('🧹 Cleared Partner column colors and data attributes');
    }
  };

  // Function to clear Partner button selections in horizontal bar
  const clearPartnerButtonSelections = () => {
    const partnersHorizontalBar = document.getElementById(`${namespace}-horizontal-partners`);
    if (partnersHorizontalBar && partnersHorizontalBar.style.display !== 'none') {
      const selectedPartnerButtons = partnersHorizontalBar.querySelectorAll('div.selected');
      selectedPartnerButtons.forEach(button => {
        console.log(`🧹 Deselecting Partner button: ${button.textContent}`);
        button.click(); // This will deselect it and restore transparent background
      });
      // Also clear any orphaned PBC Component classes from all Partner buttons
      const allPartnerButtons = partnersHorizontalBar.querySelectorAll('div.partner-button');
      allPartnerButtons.forEach(button => {
        button.classList.remove('pbc-economic-vitality', 'pbc-education', 'pbc-community-vibrancy');
      });
      console.log('🧹 Cleared all Partner button selections and PBC Component classes');
    }
  };

  // Function to check if PBC Components are currently filtered
  const isPBCComponentsFiltered = () => {
    const pbcHorizontalBar = document.getElementById(`${namespace}-horizontal-pbcComponents`);
    if (pbcHorizontalBar && pbcHorizontalBar.style.display !== 'none') {
      // Check if any PBC Component buttons are selected
      const pbcButtons = pbcHorizontalBar.querySelectorAll('div.selected');
      return pbcButtons.length > 0;
    }
    return false;
  };

  const columns = {
    [pbcComponentsId]: {
      columnColor: brandGradient[0],
      label: 'PBC Components',
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

  // Generic function to toggle column visibility
  const toggleColumn = (columnId, columnLabel, dataKey, colorIndex, hideColumn) => {
    // Find the column header by looking for the header with the specified label
    const allHeaders = document.querySelectorAll(`.${namespace}-header`);
    const columnHeader = Array.from(allHeaders).find(header => 
      header.querySelector('h2') && header.querySelector('h2').textContent.includes(columnLabel)
    );
    const column = document.getElementById(columnId);
    
    // Check if horizontal bar already exists
    let horizontalBar = document.getElementById(`${namespace}-horizontal-${dataKey}`);
    
    // Track selected items for filtering
    let selectedItems = new Set();
    
    // Function to filter strategies based on selected items
    const filterStrategiesByItems = () => {
      const strategiesColumn = document.getElementById(strategiesId);
      if (!strategiesColumn) return;
      
      const strategiesChildren = strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`);
      
      if (selectedItems.size === 0) {
        // Show all strategies
        [...strategiesChildren].forEach(child => {
          child.style.display = 'block';
        });
        
        // Show all items in other columns
        const allColumns = [partnersId, outputsId, immediateOutputsId, intermediateOutputsId, longTermOutputsId];
        allColumns.forEach(columnId => {
          const column = document.getElementById(columnId);
          if (column) {
            const columnChildren = column.getElementsByClassName(`${namespace}-data-wrapper`);
            [...columnChildren].forEach(child => {
              child.style.display = 'block';
            });
          }
        });
        
        // Clear Partner column colors when no PBC Components are selected
        if (dataKey === 'pbcComponents') {
          clearPartnerColumnColors();
          // Also clear Partner button selections in horizontal bar
          clearPartnerButtonSelections();
        }
        
        return;
      }
      
      // Get visible strategies
      const visibleStrategies = [];
      [...strategiesChildren].forEach((child, idx) => {
        const strategy = strategyValues[idx];
        const strategyItems = strategy[dataKey] ? strategy[dataKey].map(itemIdx => data[dataKey][itemIdx]) : [];
        const hasSelectedItem = strategyItems.some(item => selectedItems.has(item));
        
        if (hasSelectedItem) {
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
      
      // Always filter Partners column based on visible strategies
      if (dataKey === 'pbcComponents') {
        // When filtering by PBC Components, filter Partners based on the strategies that are visible
        const partnersColumn = document.getElementById(partnersId);
        if (partnersColumn) {
          const partnersChildren = partnersColumn.getElementsByClassName(`${namespace}-data-wrapper`);
          console.log(`🤝 Filtering Partners column based on PBC Components`);
          
          [...partnersChildren].forEach((child, idx) => {
            const partner = data.partners[idx];
            
            // Check if this partner is connected to any visible strategy
            const isConnectedToPBCComponent = visibleStrategies.some(strategy => {
              return strategy.partners && strategy.partners.includes(idx);
            });
            
            if (isConnectedToPBCComponent) {
              child.style.display = 'block';
              
              // Apply color coordination based on connected PBC Components
              const connectedPBCs = new Set();
              visibleStrategies.forEach(strategy => {
                if (strategy.partners && strategy.partners.includes(idx)) {
                  const strategyPBCComponents = strategy.pbcComponents ? strategy.pbcComponents.map(pbcIdx => data.pbcComponents[pbcIdx]) : [];
                  strategyPBCComponents.forEach(pbc => {
                    if (selectedItems.has(pbc)) {
                      connectedPBCs.add(pbc);
                    }
                  });
                }
              });
              
              // Apply color styling to the Partner column item
              const partnerItem = child.querySelector(`.${namespace}-datum`);
              if (partnerItem && connectedPBCs.size > 0) {
                const connectedPBCsArray = Array.from(connectedPBCs);
                
                // Mark this item as PBC-colored for hover preservation
                partnerItem.setAttribute('data-pbc-colored', 'true');
                
                if (connectedPBCsArray.length === 1) {
                  // Single PBC Component - use that color
                  const pbcColor = getPBCColor(connectedPBCsArray[0]);
                  partnerItem.style.backgroundColor = pbcColor + '20'; // Light version
                  partnerItem.style.border = `2px solid ${pbcColor}60`;
                  // Store the original styling in data attributes for hover restoration
                  partnerItem.setAttribute('data-original-bg', pbcColor + '20');
                  partnerItem.setAttribute('data-original-border', `2px solid ${pbcColor}60`);
                  console.log(`🎨 Applied ${connectedPBCsArray[0]} color to visible partner: ${partner}`);
                } else {
                  // Multiple PBC Components - create gradient background
                  const color1 = getPBCColor(connectedPBCsArray[0]);
                  const color2 = getPBCColor(connectedPBCsArray[1]);
                  const gradient = `linear-gradient(135deg, ${color1}20 50%, ${color2}20 50%)`;
                  partnerItem.style.background = gradient;
                  partnerItem.style.border = `2px solid ${color1}60`;
                  // Store the original styling in data attributes for hover restoration
                  partnerItem.setAttribute('data-original-bg', gradient);
                  partnerItem.setAttribute('data-original-border', `2px solid ${color1}60`);
                  console.log(`🌈 Applied gradient background to visible partner: ${partner}`);
                }
                partnerItem.style.borderRadius = '4px';
                partnerItem.style.padding = '4px 8px';
                partnerItem.setAttribute('data-original-border-radius', '4px');
                partnerItem.setAttribute('data-original-padding', '4px 8px');
              } else {
                // Clear PBC-colored marking if no PBCs connected
                partnerItem?.removeAttribute('data-pbc-colored');
                partnerItem?.removeAttribute('data-original-bg');
                partnerItem?.removeAttribute('data-original-border');
                partnerItem?.removeAttribute('data-original-border-radius');
                partnerItem?.removeAttribute('data-original-padding');
              }
            } else {
              child.style.display = 'none';
            }
            
            console.log(`🤝 Partner "${partner}" connected to PBC strategies: ${isConnectedToPBCComponent}`);
          });
        }
      } else {
        // For other filtering types, filter Partners normally
        filterColumnByStrategies(partnersId, 'partners');
      }
    };
    
    if (hideColumn) {
      // Hide column
      if (columnHeader) columnHeader.style.display = 'none';
      if (column) column.style.display = 'none';
      
      // Create horizontal bar if it doesn't exist
      if (!horizontalBar) {
        horizontalBar = addElement(dashboard, 'div', `horizontal-${dataKey}`);
        horizontalBar.style.display = 'flex';
        horizontalBar.style.flexWrap = 'wrap';
        horizontalBar.style.gap = '10px';
        horizontalBar.style.padding = '15px';
        horizontalBar.style.backgroundColor = brandGradient[colorIndex] + '1A';
        horizontalBar.style.border = `2px solid ${brandGradient[colorIndex]}80`;
        horizontalBar.style.borderRadius = '8px';
        horizontalBar.style.marginBottom = '20px';
        
        // Add title
        const titleDiv = addElement(horizontalBar, 'div');
        titleDiv.style.fontWeight = 'bold';
        titleDiv.style.marginBottom = '10px';
        titleDiv.style.width = '100%';
        titleDiv.style.color = brandGradient[colorIndex];
        titleDiv.textContent = `${columnLabel} (click to filter strategies):`;
        
        // Add items as clickable toggle buttons
        data[dataKey].forEach(item => {
          const itemDiv = addElement(horizontalBar, 'div');
          
          // Add base filter button class
          itemDiv.classList.add('momentum-dashboard-filter-button');
          
          // Add specific classes based on item type
          if (dataKey === 'pbcComponents') {
            // Add PBC Component specific class
            const pbcClass = item.toLowerCase().replace(/\s+/g, '-');
            itemDiv.classList.add(`pbc-${pbcClass}`);
          } else if (dataKey === 'partners') {
            // Add Partner button class
            itemDiv.classList.add('partner-button');
          }
          
          itemDiv.textContent = item;
          
          // Add click functionality
          itemDiv.addEventListener('click', () => {
            if (selectedItems.has(item)) {
              // Deselect item
              selectedItems.delete(item);
              itemDiv.classList.remove('selected');
              // Clear any PBC Component color classes from Partner buttons
              if (dataKey === 'partners') {
                itemDiv.classList.remove('pbc-economic-vitality', 'pbc-education', 'pbc-community-vibrancy');
              }
              console.log(`🔴 Deselected ${dataKey}: ${item}`);
            } else {
              // Select item
              selectedItems.add(item);
              itemDiv.classList.add('selected');
              console.log(`🟢 Selected ${dataKey}: ${item}`);
            }
            filterStrategiesByItems();
            
            // Cascading filter: If we're filtering PBC Components and Partners column is also hidden,
            // trigger corresponding Partner button clicks
            if (dataKey === 'pbcComponents') {
              const partnersHorizontalBar = document.getElementById(`${namespace}-horizontal-partners`);
              if (partnersHorizontalBar && partnersHorizontalBar.style.display !== 'none') {
                // Partners column is also hidden, so trigger cascading
                console.log('🔄 Triggering Partner cascade from PBC Components');
                triggerPartnerCascadeFromPBC();
              }
            }
            // Note: We intentionally don't cascade from Partners to PBC Components (one-way only)
          });
          
          // Hover effects are now handled by CSS
        });
        
        // Insert the horizontal bar before the dashboardWrapper
        dashboard.insertBefore(horizontalBar, dashboardWrapper);
      } else {
        horizontalBar.style.display = 'flex';
      }
      
      // Special handling for Partners column: Check if PBC Components are already selected
      if (dataKey === 'partners') {
        console.log('🔄 Partners column hidden - checking for existing PBC Component selections');
        const pbcHorizontalBar = document.getElementById(`${namespace}-horizontal-pbcComponents`);
        if (pbcHorizontalBar && pbcHorizontalBar.style.display !== 'none') {
          // PBC Components are also hidden, trigger cascade if any are selected
          const selectedPBCButtons = pbcHorizontalBar.querySelectorAll('div.selected');
          if (selectedPBCButtons.length > 0) {
            console.log('🎯 Found existing PBC Component selections, triggering Partner cascade');
            triggerPartnerCascadeFromPBC();
          }
        }
      }
    } else {
      // Show column
      if (columnHeader) columnHeader.style.display = 'flex';
      if (column) column.style.display = 'block';
      
      // Hide horizontal bar
      if (horizontalBar) {
        horizontalBar.style.display = 'none';
      }
      
      // Clear any filtering when showing the column
      selectedItems.clear();
      const strategiesColumn = document.getElementById(strategiesId);
      if (strategiesColumn) {
        const strategiesChildren = strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`);
        [...strategiesChildren].forEach(child => {
          child.style.display = 'block';
        });
      }
      
      // Show all items in other columns
      const allColumns = [partnersId, outputsId, immediateOutputsId, intermediateOutputsId, longTermOutputsId];
      allColumns.forEach(columnId => {
        const column = document.getElementById(columnId);
        if (column) {
          const columnChildren = column.getElementsByClassName(`${namespace}-data-wrapper`);
          [...columnChildren].forEach(child => {
            child.style.display = 'block';
          });
        }
      });
    }
  };

  // Add event listeners for checkboxes
  partnersCheckbox.addEventListener('change', (e) => {
    toggleColumn(partnersId, 'Partners', 'partners', 1, e.target.checked);
  });
  
  pbcCheckbox.addEventListener('change', (e) => {
    toggleColumn(pbcComponentsId, 'PBC Components', 'pbcComponents', 0, e.target.checked);
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

      console.log('🔍 EXTRACTED UNIQUE VALUES:');
      console.log('📊 PBC Components:', pbcComponents);
      console.log('👥 Partners:', partners);
      console.log('🎯 Strategies count:', model.length);

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
  const highlightColumn = (data, columnKey, columnId, overrideColor = null) => {
    const highlightIndices = data[columnKey];
    const highlightColumn = document.getElementById(columnId);
    const columnChildren = highlightColumn.getElementsByClassName(textClass);
    // Use override color if provided, otherwise use the column's own color
    const highlightColor = overrideColor || columns[columnId].columnColor;
    highlightIndices.forEach(idx => {
      const dataToHighlight = columnChildren[idx];
      dataToHighlight.style.background = `${highlightColor}80`;
    });
  };

  // Removes column higlights (excluding Partners to preserve PBC Component colors)
  const removeColumnHighlights = () => {
    if (clickedStrategy) {
      return;
    }
    columnEls.forEach(columnEl => {
      // Skip Partners column to preserve PBC Component colors
      if (columnEl.id === partnersId) {
        return;
      }
      const dataChildren = [...columnEl.getElementsByClassName(textClass)];
      dataChildren.forEach(child => {
        child.style.background = 'transparent';
      });
    });
  };

  const strategyValues = Object.values(data.strategies);

  // Function to get the primary PBC Component color for a strategy
  const getStrategyPBCColor = (strategyIndex) => {
    const strategy = strategyValues[strategyIndex];
    if (strategy && strategy.pbcComponents && strategy.pbcComponents.length > 0) {
      // Get the first (primary) PBC Component for this strategy
      const primaryPBCIndex = strategy.pbcComponents[0];
      const primaryPBC = data.pbcComponents[primaryPBCIndex];
      return getPBCColor(primaryPBC);
    }
    // Fallback to default Strategy color if no PBC Component found
    return columns[strategiesId].columnColor;
  };

  const highlightStrategyOutcomes = i => () => {
    if (clickedStrategy) {
      return;
    }
    // Use the PBC Component color for this specific strategy
    const strategyColor = getStrategyPBCColor(i);
    highlightColumn(strategyValues[i], 'pbcComponents', pbcComponentsId, strategyColor);
    // Skip Partners column highlighting to preserve PBC Component colors
    // highlightColumn(strategyValues[i], 'partners', partnersId);
    highlightColumn(strategyValues[i], 'outputs', outputsId, strategyColor);
    highlightColumn(strategyValues[i], 'immediateOutputs', immediateOutputsId, strategyColor);
    highlightColumn(strategyValues[i], 'intermediateOutputs', intermediateOutputsId, strategyColor);
  };

  const unfilterColumns = () => {
    clickedStrategy = false;
    [pbcComponentsId, partnersId, strategiesId, outputsId, immediateOutputsId, intermediateOutputsId, longTermOutputsId].forEach(columnId => {
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

    filterColumn(strategyValues[i], 'pbcComponents', pbcComponentsId);
    // Skip Partners column highlighting to preserve PBC Component colors
    // filterColumn(strategyValues[i], 'partners', partnersId);
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
          
          // Find strategies that are connected to this item
          const connectedStrategies = [];
          strategyValues.forEach((strategy, strategyIdx) => {
            let isConnected = false;
            
            if (columnId === pbcComponentsId && strategy.pbcComponents.includes(i)) {
              isConnected = true;
            } else if (columnId === partnersId && strategy.partners.includes(i)) {
              isConnected = true;
            } else if (columnId === outputsId && strategy.outputs.includes(i)) {
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
          
          // Highlight the hovered item itself
          // Special handling for Partners column when PBC Components are filtered
          if (columnId === partnersId && textDiv.hasAttribute('data-pbc-colored')) {
            // This Partner item has PBC Component colors - add subtle hover effect
            textDiv.style.boxShadow = `0 0 8px ${columns[columnId].columnColor}80`;
            
            // Brighten the existing PBC Component color for hover
            const originalBg = textDiv.getAttribute('data-original-bg');
            if (originalBg) {
              if (originalBg.includes('linear-gradient')) {
                // For gradients, add a subtle overlay
                textDiv.style.background = originalBg;
                textDiv.style.opacity = '0.8';
              } else if (originalBg.includes('#')) {
                // For solid colors, increase opacity from 20 to 40
                const brighterBg = originalBg.replace(/20$/, '40');
                textDiv.style.backgroundColor = brighterBg;
              }
            }
          } else {
            // Use PBC Component color from the first connected strategy for item highlighting
            if (connectedStrategies.length > 0) {
              const firstStrategyIdx = connectedStrategies[0];
              const highlightColor = getStrategyPBCColor(firstStrategyIdx);
              textDiv.style.background = `${highlightColor}80`;
            } else {
              // Fallback to Strategy color if no connected strategies found
              textDiv.style.background = `${columns[strategiesId].columnColor}80`;
            }
          }
          
          // Highlight connected strategies using their PBC Component colors
          const strategiesColumn = document.getElementById(strategiesId);
          const strategiesChildren = strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`);
          connectedStrategies.forEach(strategyIdx => {
            if (strategiesChildren[strategyIdx]) {
              const strategyColor = getStrategyPBCColor(strategyIdx);
              strategiesChildren[strategyIdx].style.background = `${strategyColor}80`;
            }
          });
          
          // Highlight related items in other columns based on connected strategies
          const highlightRelatedItems = (targetColumnId, dataKey) => {
            const targetColumn = document.getElementById(targetColumnId);
            if (!targetColumn) return;
            
            const targetChildren = targetColumn.getElementsByClassName(`${namespace}-data-wrapper`);
            const targetData = data[dataKey];
            
            // Get all related items from connected strategies and track which strategies connect to each item
            const relatedItems = new Map(); // itemIdx -> [strategyIdx1, strategyIdx2, ...]
            connectedStrategies.forEach(strategyIdx => {
              const strategy = strategyValues[strategyIdx];
              if (strategy[dataKey]) {
                strategy[dataKey].forEach(itemIdx => {
                  if (!relatedItems.has(itemIdx)) {
                    relatedItems.set(itemIdx, []);
                  }
                  relatedItems.get(itemIdx).push(strategyIdx);
                });
              }
            });
            
            // Highlight related items using the PBC Component color of the first connected strategy
            [...targetChildren].forEach((child, idx) => {
              if (relatedItems.has(idx)) {
                const connectedStrategyIndices = relatedItems.get(idx);
                const firstStrategyIdx = connectedStrategyIndices[0];
                const highlightColor = getStrategyPBCColor(firstStrategyIdx);
                child.style.background = `${highlightColor}80`;
              }
            });
          };
          
          // Highlight related items in all other columns (excluding Partners to preserve PBC Component colors)
          if (columnId !== pbcComponentsId) highlightRelatedItems(pbcComponentsId, 'pbcComponents');
          // Skip Partners column highlighting to preserve PBC Component colors
          // if (columnId !== partnersId) highlightRelatedItems(partnersId, 'partners');
          if (columnId !== outputsId) highlightRelatedItems(outputsId, 'outputs');
          if (columnId !== immediateOutputsId) highlightRelatedItems(immediateOutputsId, 'immediateOutputs');
          if (columnId !== intermediateOutputsId) highlightRelatedItems(intermediateOutputsId, 'intermediateOutputs');
          if (columnId !== longTermOutputsId) highlightRelatedItems(longTermOutputsId, 'longTermOutputs');
        };
        
        const removeItemHighlights = () => {
          if (clickedStrategy) return;
          
          // Remove highlight from hovered item
          if (columnId === partnersId && textDiv.hasAttribute('data-pbc-colored')) {
            // For Partners with PBC Component colors, restore original styling
            textDiv.style.boxShadow = ''; // Clear any box shadow effects
            textDiv.style.opacity = ''; // Clear any opacity changes
            
            // Restore original PBC Component styling from data attributes
            const originalBg = textDiv.getAttribute('data-original-bg');
            const originalBorder = textDiv.getAttribute('data-original-border');
            const originalBorderRadius = textDiv.getAttribute('data-original-border-radius');
            const originalPadding = textDiv.getAttribute('data-original-padding');
            
            if (originalBg) {
              if (originalBg.includes('linear-gradient')) {
                textDiv.style.background = originalBg;
              } else {
                textDiv.style.backgroundColor = originalBg;
              }
            }
            if (originalBorder) {
              textDiv.style.border = originalBorder;
            }
            if (originalBorderRadius) {
              textDiv.style.borderRadius = originalBorderRadius;
            }
            if (originalPadding) {
              textDiv.style.padding = originalPadding;
            }
          } else {
            textDiv.style.background = 'transparent';
            textDiv.style.boxShadow = ''; // Clear any box shadow effects
          }
          
          // Remove highlights from all columns manually (excluding Partners to preserve PBC Component colors)
          const allColumns = [pbcComponentsId, strategiesId, outputsId, immediateOutputsId, intermediateOutputsId, longTermOutputsId];
          allColumns.forEach(columnId => {
            const column = document.getElementById(columnId);
            if (column) {
              const columnChildren = [...column.getElementsByClassName(`${namespace}-data-wrapper`)];
              columnChildren.forEach(child => {
                child.style.background = 'transparent';
              });
            }
          });
          
          // Partners column is intentionally excluded from highlight clearing to preserve PBC Component colors
        };
        
        dataDiv.onmouseenter = highlightRelatedStrategies;
        dataDiv.onmouseleave = removeItemHighlights;
      }
    });
  };

  const strategiesColumn = document.getElementById(strategiesId);
  const seeAllButton = document.createElement('button');

  addDataToColumn(data.pbcComponents, pbcComponentsId);
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

  // Trigger PBC Components to be hidden by default
  toggleColumn(pbcComponentsId, 'PBC Components', 'pbcComponents', 0, true);

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
