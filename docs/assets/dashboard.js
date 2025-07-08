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

  const brandGradient = ['#A8A8A8', '#D1E9E6', '#92E2DA', '#01A997', '#006C69', '#3DAF49', '#207429'];

  const dashboardWrapper = addElement(dashboard, 'div', 'body-wrapper');
  
  // Add controls section for the checkbox
  const controlsWrapper = addElement(dashboardWrapper, 'div', 'controls-wrapper');
  controlsWrapper.style.marginBottom = '20px';
  controlsWrapper.style.padding = '10px';
  controlsWrapper.style.backgroundColor = '#f5f5f5';
  controlsWrapper.style.borderRadius = '5px';
  controlsWrapper.style.display = 'flex';
  controlsWrapper.style.gap = '20px';
  controlsWrapper.style.flexWrap = 'wrap';
  
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
  
  // Holds whether or not a partner has been clicked
  let clickedPartner = false;

  // Track selected items for filtering (used by PBC Components horizontal bar)
  let selectedItems = new Set();

  // PBC Component color palette - expanded to support more components
  const pbcColorPalette = [
    '#E55525', // Blue (Economic Vitality)
    '#C49730', // Green (Education)
    '#2A5384', // Orange/Peach (Community Vibrancy)
    '#582D60', // Purple (fourth component)
    '#F2D480', // Yellow (fifth component if needed)
    '#8FB8C5', // Light Blue (sixth component if needed)
  ];

  // Function to get PBC Component color dynamically
  const getPBCColor = (pbcComponent) => {
    if (!data || !data.pbcComponents) {
      return pbcColorPalette[0]; // Default to first color
    }
    
    // Find the index of this PBC component in the data array
    const componentIndex = data.pbcComponents.indexOf(pbcComponent);
    
    if (componentIndex !== -1 && componentIndex < pbcColorPalette.length) {
      return pbcColorPalette[componentIndex];
    }
    
    // If component not found or index exceeds palette, use modulo to cycle through colors
    const fallbackIndex = componentIndex !== -1 ? componentIndex % pbcColorPalette.length : 0;
    return pbcColorPalette[fallbackIndex];
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

  // Function to filter Partners column based on selected PBC Components
  const filterPartnersFromPBC = () => {
    const pbcHorizontalBar = document.getElementById(`${namespace}-horizontal-pbcComponents`);
    
    if (!pbcHorizontalBar) {
      console.log('❌ Missing PBC Components horizontal bar');
      return;
    }
    
    // Get currently selected PBC Components by checking CSS classes
    const selectedPBCComponents = new Set();
    const pbcButtons = pbcHorizontalBar.querySelectorAll('div.selected');
    pbcButtons.forEach(button => {
      selectedPBCComponents.add(button.textContent);
    });
    
    console.log(`📋 Currently selected PBC Components: [${Array.from(selectedPBCComponents).join(', ')}]`);
    
    const partnersColumn = document.getElementById(partnersId);
    if (!partnersColumn) return;
    
    const partnersChildren = partnersColumn.getElementsByClassName(`${namespace}-data-wrapper`);
    
    if (selectedPBCComponents.size === 0) {
      // No PBC Components selected - show all partners and clear colors
      [...partnersChildren].forEach(child => {
        child.style.display = 'block';
        const partnerItem = child.querySelector(`.${namespace}-datum`);
        if (partnerItem) {
          partnerItem.style.backgroundColor = '';
          partnerItem.style.border = '';
          partnerItem.style.background = '';
          partnerItem.style.borderRadius = '';
          partnerItem.style.padding = '';
          partnerItem.removeAttribute('data-pbc-colored');
          partnerItem.removeAttribute('data-original-bg');
          partnerItem.removeAttribute('data-original-border');
          partnerItem.removeAttribute('data-original-border-radius');
          partnerItem.removeAttribute('data-original-padding');
        }
      });
      console.log('🧹 No PBC Components selected, showing all partners');
      return;
    }
    
    // Find all partners that should be visible based on selected PBC Components
    const partnersToShow = new Set();
    const partnerPBCMapping = new Map(); // partner -> Set of connected PBCs
    
    Object.values(data.strategies).forEach(strategy => {
      const strategyPBCComponents = strategy.pbcComponents ? strategy.pbcComponents.map(idx => data.pbcComponents[idx]) : [];
      const hasSelectedPBC = strategyPBCComponents.some(pbc => selectedPBCComponents.has(pbc));
      
      if (hasSelectedPBC) {
        // Add all partners from this strategy
        const strategyPartners = strategy.partners ? strategy.partners.map(idx => data.partners[idx]) : [];
        strategyPartners.forEach(partner => {
          partnersToShow.add(partner);
          if (!partnerPBCMapping.has(partner)) {
            partnerPBCMapping.set(partner, new Set());
          }
          // Add connected PBC Components for this partner
          strategyPBCComponents.forEach(pbc => {
            if (selectedPBCComponents.has(pbc)) {
              partnerPBCMapping.get(partner).add(pbc);
            }
          });
        });
      }
    });
    
    console.log(`🤝 Partners that should be visible: [${Array.from(partnersToShow).join(', ')}]`);
    
    // Show/hide partners and apply colors
    [...partnersChildren].forEach((child, idx) => {
      const partner = data.partners[idx];
      
      if (partnersToShow.has(partner)) {
        child.style.display = 'block';
        
        // Apply color coordination based on connected PBC Components
        const connectedPBCs = Array.from(partnerPBCMapping.get(partner) || []);
        const partnerItem = child.querySelector(`.${namespace}-datum`);
        
        if (partnerItem && connectedPBCs.length > 0) {
          // Mark this item as PBC-colored for hover preservation
          partnerItem.setAttribute('data-pbc-colored', 'true');
          
          if (connectedPBCs.length === 1) {
            // Single PBC Component - use that color
            const pbcColor = getPBCColor(connectedPBCs[0]);
            partnerItem.style.backgroundColor = pbcColor + '20'; // Light version
            partnerItem.style.border = `2px solid ${pbcColor}60`;
            // Store the original styling in data attributes for hover restoration
            partnerItem.setAttribute('data-original-bg', pbcColor + '20');
            partnerItem.setAttribute('data-original-border', `2px solid ${pbcColor}60`);
            console.log(`🎨 Applied ${connectedPBCs[0]} color to visible partner: ${partner}`);
          } else {
            // Multiple PBC Components - create gradient background
            const color1 = getPBCColor(connectedPBCs[0]);
            const color2 = getPBCColor(connectedPBCs[1]);
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
        }
      } else {
        child.style.display = 'none';
      }
    });
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
        titleDiv.textContent = `${columnLabel} (click to filter pillars):`;
        
        // Add items as clickable toggle buttons
        data[dataKey].forEach(item => {
          const itemDiv = addElement(horizontalBar, 'div');
          
          // Add base filter button class
          itemDiv.classList.add('momentum-dashboard-filter-button');
          
          // Add specific classes based on item type
          if (dataKey === 'pbcComponents') {
            // Add PBC Component specific class based on index for dynamic coloring
            const pbcIndex = data[dataKey].indexOf(item);
            itemDiv.classList.add(`pbc-component-${pbcIndex}`);
            
            // Set the background color directly for the button
            const pbcColor = getPBCColor(item);
            itemDiv.style.setProperty('--pbc-color', pbcColor);
            itemDiv.style.backgroundColor = `${pbcColor}20`;
            itemDiv.style.borderColor = `${pbcColor}80`;
            itemDiv.style.color = pbcColor;
            
            // Add hover and selected state handling
            itemDiv.addEventListener('mouseenter', () => {
              if (!itemDiv.classList.contains('selected')) {
                itemDiv.style.backgroundColor = `${pbcColor}40`;
              }
            });
            
            itemDiv.addEventListener('mouseleave', () => {
              if (!itemDiv.classList.contains('selected')) {
                itemDiv.style.backgroundColor = `${pbcColor}20`;
              }
            });
          }
          
          itemDiv.textContent = item;
          
                      // Add click functionality
            itemDiv.addEventListener('click', () => {
              if (dataKey === 'pbcComponents') {
                // Exclusive selection for PBC Components
                if (selectedItems.has(item)) {
                  // Deselect the current item
                  selectedItems.delete(item);
                  itemDiv.classList.remove('selected');
                  
                  // Reset to unselected styling for PBC components
                  if (dataKey === 'pbcComponents') {
                    const pbcColor = getPBCColor(item);
                    itemDiv.style.backgroundColor = `${pbcColor}20`;
                  }
                  
                  console.log(`🔴 Deselected ${dataKey}: ${item}`);
                } else {
                  // First, deselect all other PBC Components
                  const allPBCButtons = horizontalBar.querySelectorAll('div');
                  allPBCButtons.forEach(button => {
                    if (button.textContent && button.classList.contains('selected')) {
                      selectedItems.delete(button.textContent);
                      button.classList.remove('selected');
                      
                      // Reset styling for deselected PBC components
                      if (dataKey === 'pbcComponents') {
                        const buttonPBCColor = getPBCColor(button.textContent);
                        button.style.backgroundColor = `${buttonPBCColor}20`;
                      }
                    }
                  });
                  
                  // Then select the clicked item
                  selectedItems.add(item);
                  itemDiv.classList.add('selected');
                  
                  // Apply selected styling for PBC components
                  if (dataKey === 'pbcComponents') {
                    const pbcColor = getPBCColor(item);
                    itemDiv.style.backgroundColor = `${pbcColor}80`;
                  }
                  
                  console.log(`🟢 Selected ${dataKey}: ${item} (exclusive)`);
                }
              } else {
                // Non-exclusive selection for other types (if any)
                if (selectedItems.has(item)) {
                  // Deselect item
                  selectedItems.delete(item);
                  itemDiv.classList.remove('selected');
                  console.log(`🔴 Deselected ${dataKey}: ${item}`);
                } else {
                  // Select item
                  selectedItems.add(item);
                  itemDiv.classList.add('selected');
                  console.log(`🟢 Selected ${dataKey}: ${item}`);
                }
              }
              
              filterStrategiesByItems();
              
              // Filter Partners column based on selected PBC Components
              if (dataKey === 'pbcComponents') {
                console.log('🔄 Filtering Partners column from PBC Components');
                filterPartnersFromPBC();
                
                // Show "See All" buttons when PBC component is selected
                if (selectedItems.size > 0) {
                  seeAllButton.style.display = 'block';
                  seeAllPartnersButton.style.display = 'block';
                } else {
                  seeAllButton.style.display = 'none';
                  seeAllPartnersButton.style.display = 'none';
                }
              }
            });
          
          // Hover effects are now handled by CSS
        });
        
        // Insert the horizontal bar before the dashboardWrapper
        dashboard.insertBefore(horizontalBar, dashboardWrapper);
      } else {
        horizontalBar.style.display = 'flex';
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

  // Add event listener for checkbox
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
    if (clickedStrategy || clickedPartner) {
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
    if (clickedStrategy || clickedPartner) {
      return;
    }
    // This function is now unused - we have custom hover functionality for strategies
    // All highlighting is handled by the individual hover functions in addDataToColumn
  };

  const highlightPartnerOutcomes = i => () => {
    if (clickedStrategy || clickedPartner) {
      return;
    }
    
    // Find all strategies connected to this partner
    const connectedStrategies = [];
    strategyValues.forEach((strategy, strategyIdx) => {
      if (strategy.partners && strategy.partners.includes(i)) {
        connectedStrategies.push(strategyIdx);
      }
    });
    
    // Use the first connected strategy's color for highlighting
    const highlightColor = connectedStrategies.length > 0 
      ? getStrategyPBCColor(connectedStrategies[0])
      : columns[partnersId].columnColor;
    
    // Highlight strategies connected to this partner
    const strategiesColumn = document.getElementById(strategiesId);
    const strategiesChildren = strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`);
    connectedStrategies.forEach(strategyIdx => {
      if (strategiesChildren[strategyIdx]) {
        const strategyColor = getStrategyPBCColor(strategyIdx);
        strategiesChildren[strategyIdx].style.background = `${strategyColor}80`;
      }
    });
    
    // Highlight all outcomes from connected strategies
    const allConnectedOutcomes = {
      pbcComponents: new Set(),
      outputs: new Set(),
      immediateOutputs: new Set(),
      intermediateOutputs: new Set(),
      longTermOutputs: new Set()
    };
    
    connectedStrategies.forEach(strategyIdx => {
      const strategy = strategyValues[strategyIdx];
      if (strategy.pbcComponents) strategy.pbcComponents.forEach(idx => allConnectedOutcomes.pbcComponents.add(idx));
      if (strategy.outputs) strategy.outputs.forEach(idx => allConnectedOutcomes.outputs.add(idx));
      if (strategy.immediateOutputs) strategy.immediateOutputs.forEach(idx => allConnectedOutcomes.immediateOutputs.add(idx));
      if (strategy.intermediateOutputs) strategy.intermediateOutputs.forEach(idx => allConnectedOutcomes.intermediateOutputs.add(idx));
      if (strategy.longTermOutputs) strategy.longTermOutputs.forEach(idx => allConnectedOutcomes.longTermOutputs.add(idx));
    });
    
    // Highlight the collected outcomes
    const highlightOutcomeSet = (columnId, outcomeSet) => {
      const column = document.getElementById(columnId);
      const columnChildren = column.getElementsByClassName(textClass);
      Array.from(outcomeSet).forEach(idx => {
        if (columnChildren[idx]) {
          columnChildren[idx].style.background = `${highlightColor}80`;
        }
      });
    };
    
    highlightOutcomeSet(pbcComponentsId, allConnectedOutcomes.pbcComponents);
    highlightOutcomeSet(outputsId, allConnectedOutcomes.outputs);
    highlightOutcomeSet(immediateOutputsId, allConnectedOutcomes.immediateOutputs);
    highlightOutcomeSet(intermediateOutputsId, allConnectedOutcomes.intermediateOutputs);
    highlightOutcomeSet(longTermOutputsId, allConnectedOutcomes.longTermOutputs);
  };

  // Function to highlight the directional flow from strategy to outcomes
  const highlightDirectionalFlow = (strategyIndex) => {
    const strategy = strategyValues[strategyIndex];
    const strategyColor = getStrategyPBCColor(strategyIndex);
    
    // Highlight the strategy itself
    const strategiesColumn = document.getElementById(strategiesId);
    const strategiesChildren = strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`);
    if (strategiesChildren[strategyIndex]) {
      strategiesChildren[strategyIndex].style.background = `${strategyColor}80`;
    }
    
    // Helper function to highlight items in outcome columns
    const highlightOutcomeItems = (columnId, indices) => {
      if (!indices || indices.length === 0) return;
      
      const column = document.getElementById(columnId);
      const columnChildren = column.getElementsByClassName(`${namespace}-data-wrapper`);
      
      indices.forEach(idx => {
        if (columnChildren[idx] && columnChildren[idx].style.display !== 'none') {
          const textElement = columnChildren[idx].querySelector(`.${textClass}`);
          if (textElement) {
            textElement.style.background = `${strategyColor}80`;
          }
        }
      });
    };
    
    // Highlight outputs (first level)
    highlightOutcomeItems(outputsId, strategy.outputs);
    
    // Highlight immediate outcomes (second level)  
    highlightOutcomeItems(immediateOutputsId, strategy.immediateOutputs);
    
    // Highlight intermediate outcomes (third level)
    highlightOutcomeItems(intermediateOutputsId, strategy.intermediateOutputs);
    
    // Highlight long-term outcomes (fourth level)
    highlightOutcomeItems(longTermOutputsId, strategy.longTermOutputs);
  };

  const unfilterColumns = () => {
    clickedStrategy = false;
    clickedPartner = false;
    
    // Clear PBC Component selections in the top filter
    const pbcHorizontalBar = document.getElementById(`${namespace}-horizontal-pbcComponents`);
    if (pbcHorizontalBar && pbcHorizontalBar.style.display !== 'none') {
      const selectedPBCButtons = pbcHorizontalBar.querySelectorAll('div.selected');
      selectedPBCButtons.forEach(button => {
        button.classList.remove('selected');
        
        // Reset the button's visual styling to unselected state
        const pbcColor = getPBCColor(button.textContent);
        button.style.backgroundColor = `${pbcColor}20`;
      });
      
      // Trigger the filter update which will detect no selected PBC components
      // and reset everything properly
      filterPartnersFromPBC();
      
      // Also ensure strategies column shows all items when PBC filters are cleared
      const strategiesColumn = document.getElementById(strategiesId);
      if (strategiesColumn) {
        const strategiesChildren = strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`);
        [...strategiesChildren].forEach(child => {
          child.style.display = 'block';
        });
      }
    }
    
    [pbcComponentsId, partnersId, strategiesId, outputsId, immediateOutputsId, intermediateOutputsId, longTermOutputsId].forEach(columnId => {
      const column = document.getElementById(columnId);
      const columnChildren = column.getElementsByClassName(`${namespace}-data-wrapper`);
      [...columnChildren].forEach(child => {
        child.style.display = 'block';
        // Clear any background highlighting
        child.style.background = 'transparent';
        
        // Also clear highlights from the text elements inside
        const textElements = child.getElementsByClassName(textClass);
        [...textElements].forEach(textEl => {
          textEl.style.background = 'transparent';
          textEl.style.backgroundColor = '';
          textEl.style.boxShadow = '';
          textEl.style.opacity = '';
        });
      });
    });
    
    // Clear Partner column colors
    clearPartnerColumnColors();
    
    seeAllButton.style.display = 'none';
    seeAllPartnersButton.style.display = 'none';
    showAllPartnerStrategiesButton.style.display = 'none';
    showAllPBCStrategiesButton.style.display = 'none';
  };

  const filterToStrategy = i => () => {
    if (clickedStrategy && !clickedPartner) {
      unfilterColumns();
      return;
    }
    
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
    
    // Handle Partners column: if partner filter is active, preserve it; otherwise filter by strategy
    if (!clickedPartner) {
      filterColumn(strategyValues[i], 'partners', partnersId);
    }
    
    filterColumn(strategyValues[i], 'outputs', outputsId);
    filterColumn(strategyValues[i], 'immediateOutputs', immediateOutputsId);
    filterColumn(strategyValues[i], 'intermediateOutputs', intermediateOutputsId);
    filterColumn(strategyValues[i], 'longTermOutputs', longTermOutputsId);

    // Show the reset button
    seeAllButton.style.display = 'block';
    
    // Show the "Show all Strategies for this PBC Component" button
    showAllPBCStrategiesButton.style.display = 'block';
    
    // Show the "Show all Strategies for this Partner" button if a partner is also filtered
    if (clickedPartner) {
      showAllPartnerStrategiesButton.style.display = 'block';
    }
  };

  const filterToPartner = i => () => {
    if (clickedPartner && !clickedStrategy) {
      unfilterColumns();
      return;
    }
    
    // Set clickedPartner to true so we can disable hover states
    clickedPartner = true;

    // Only show the clicked partner
    const partnersColumn = document.getElementById(partnersId);
    const partnersChildren = partnersColumn.getElementsByClassName(`${namespace}-data-wrapper`);
    [...partnersChildren].forEach((child, idx) => {
      if (idx !== i) {
        child.style.display = 'none';
      } else {
        child.style.display = 'block';
      }
    });

    // Find all strategies connected to this partner
    const connectedStrategies = [];
    strategyValues.forEach((strategy, strategyIdx) => {
      if (strategy.partners && strategy.partners.includes(i)) {
        connectedStrategies.push(strategyIdx);
      }
    });

    // Handle Strategies column: if strategy filter is active, preserve it; otherwise show connected strategies
    if (!clickedStrategy) {
      const strategiesColumn = document.getElementById(strategiesId);
      const strategiesChildren = strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`);
      [...strategiesChildren].forEach((child, idx) => {
        if (!connectedStrategies.includes(idx)) {
          child.style.display = 'none';
        } else {
          child.style.display = 'block';
        }
      });
    }

    // Handle outcome columns: only filter if no strategy is already clicked
    if (!clickedStrategy) {
      // Collect all outcomes from connected strategies
      const allConnectedOutcomes = {
        pbcComponents: new Set(),
        outputs: new Set(),
        immediateOutputs: new Set(),
        intermediateOutputs: new Set(),
        longTermOutputs: new Set()
      };
      
      connectedStrategies.forEach(strategyIdx => {
        const strategy = strategyValues[strategyIdx];
        if (strategy.pbcComponents) strategy.pbcComponents.forEach(idx => allConnectedOutcomes.pbcComponents.add(idx));
        if (strategy.outputs) strategy.outputs.forEach(idx => allConnectedOutcomes.outputs.add(idx));
        if (strategy.immediateOutputs) strategy.immediateOutputs.forEach(idx => allConnectedOutcomes.immediateOutputs.add(idx));
        if (strategy.intermediateOutputs) strategy.intermediateOutputs.forEach(idx => allConnectedOutcomes.intermediateOutputs.add(idx));
        if (strategy.longTermOutputs) strategy.longTermOutputs.forEach(idx => allConnectedOutcomes.longTermOutputs.add(idx));
      });

      // Filter outcome columns to only show connected outcomes
      const filterOutcomeColumn = (columnId, connectedSet) => {
        const column = document.getElementById(columnId);
        const columnChildren = column.getElementsByClassName(`${namespace}-data-wrapper`);
        [...columnChildren].forEach((child, idx) => {
          if (connectedSet.has(idx)) {
            child.style.display = 'block';
          } else {
            child.style.display = 'none';
          }
        });
      };

      filterOutcomeColumn(pbcComponentsId, allConnectedOutcomes.pbcComponents);
      filterOutcomeColumn(outputsId, allConnectedOutcomes.outputs);
      filterOutcomeColumn(immediateOutputsId, allConnectedOutcomes.immediateOutputs);
      filterOutcomeColumn(intermediateOutputsId, allConnectedOutcomes.intermediateOutputs);
      filterOutcomeColumn(longTermOutputsId, allConnectedOutcomes.longTermOutputs);
    }

    // Show the reset buttons
    seeAllPartnersButton.style.display = 'block';
    seeAllButton.style.display = 'block';
    
    // Show the "Show all Strategies for this Partner" button only if a strategy is also filtered
    if (clickedStrategy) {
      showAllPartnerStrategiesButton.style.display = 'block';
    }
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
        const button = document.createElement('button');
        button.className = `${textClass} ${namespace}-button`;
        button.textContent = datum;
        button.style.paddingTop = '14px'; // Extra padding to make room for the pill
        dataDiv.appendChild(button);

        // Create colored pill for PBC component in top left of strategy box
        const dotSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        dotSvg.setAttribute('width', '16');
        dotSvg.setAttribute('height', '8');
        dotSvg.setAttribute('viewBox', '0 0 16 8');
        dotSvg.style.position = 'absolute';
        dotSvg.style.top = '8px';
        dotSvg.style.left = '8px';
        dotSvg.style.zIndex = '10';
        dotSvg.style.marginBottom = '8px';
        
        const dotPill = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        dotPill.setAttribute('x', '0');
        dotPill.setAttribute('y', '0');
        dotPill.setAttribute('width', '16');
        dotPill.setAttribute('height', '8');
        dotPill.setAttribute('rx', '4');
        dotPill.setAttribute('ry', '4');
        dotPill.setAttribute('fill', getStrategyPBCColor(i));
        
        dotSvg.appendChild(dotPill);
        
        // Make dataDiv relatively positioned to contain the absolute dot
        dataDiv.style.position = 'relative';
        dataDiv.appendChild(dotSvg);

        const filterButtonWrapper = document.createElement('div');
        filterButtonWrapper.className = `${namespace}-filter-button-wrapper`;
        const filterButton = document.createElement('button');
        filterButton.className = `${namespace}-filter-button`;
        filterButton.textContent = 'Learn more';
        filterButtonWrapper.appendChild(filterButton);
        dataDiv.appendChild(filterButtonWrapper);

        button.onclick = filterToStrategy(i);
        filterButton.onclick = showStrategyModal(i);
        
        // Add hover functionality to highlight connected outcomes
        const highlightStrategyOutcomes = () => {
          if (clickedStrategy || clickedPartner) return;
          
          const strategy = strategyValues[i];
          const strategyColor = getStrategyPBCColor(i);
          
          // Highlight the strategy itself
          dataDiv.setAttribute('data-original-bg-before-hover', dataDiv.style.background || '');
          dataDiv.style.background = `${strategyColor}80`;
          
          // Helper function to highlight outcome items
          const highlightOutcomeItems = (columnId, indices) => {
            if (!indices || indices.length === 0) return;
            
            const column = document.getElementById(columnId);
            const columnChildren = column.getElementsByClassName(`${namespace}-data-wrapper`);
            
            indices.forEach(idx => {
              if (columnChildren[idx]) {
                const textElement = columnChildren[idx].querySelector(`.${textClass}`);
                if (textElement) {
                  textElement.setAttribute('data-original-bg-before-hover', textElement.style.background || '');
                  textElement.style.background = `${strategyColor}80`;
                }
              }
            });
          };
          
          // Highlight all connected outcomes
          highlightOutcomeItems(outputsId, strategy.outputs);
          highlightOutcomeItems(immediateOutputsId, strategy.immediateOutputs);
          highlightOutcomeItems(intermediateOutputsId, strategy.intermediateOutputs);
          highlightOutcomeItems(longTermOutputsId, strategy.longTermOutputs);
        };
        
        const removeStrategyHighlights = () => {
          if (clickedStrategy || clickedPartner) return;
          
          // Restore strategy background
          const originalBg = dataDiv.getAttribute('data-original-bg-before-hover') || '';
          if (originalBg) {
            dataDiv.style.background = originalBg;
          } else {
            dataDiv.style.background = 'transparent';
          }
          
          // Restore outcome backgrounds
          const allOutcomeColumns = [outputsId, immediateOutputsId, intermediateOutputsId, longTermOutputsId];
          allOutcomeColumns.forEach(columnId => {
            const column = document.getElementById(columnId);
            if (column) {
              const columnChildren = column.getElementsByClassName(`${namespace}-data-wrapper`);
              [...columnChildren].forEach(child => {
                const textElement = child.querySelector(`.${textClass}`);
                if (textElement) {
                  const originalChildBg = textElement.getAttribute('data-original-bg-before-hover') || '';
                  if (originalChildBg) {
                    textElement.style.background = originalChildBg;
                  } else {
                    textElement.style.background = 'transparent';
                  }
                }
              });
            }
          });
        };
        
        // Attach hover events to the strategy button
        button.onmouseenter = highlightStrategyOutcomes;
        button.onmouseleave = removeStrategyHighlights;
      } else {
        const textDiv = document.createElement('div');
        textDiv.className = textClass;
        dataDiv.appendChild(textDiv);
        textDiv.innerText = datum;
        if (tooltips) {
          addTooltip(textDiv, tooltips[i], dashboardWrapper);
        }
        
        // Add click functionality for Partners column
        if (columnId === partnersId) {
          dataDiv.onclick = filterToPartner(i);
          dataDiv.style.cursor = 'pointer';
        }
        
                // Add hover functionality for outcome columns to highlight strategies
        const highlightRelatedStrategies = () => {
          if (clickedStrategy || clickedPartner) return;
          
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
          
          // Highlight the hovered outcome item
          textDiv.setAttribute('data-original-bg-before-hover', textDiv.style.background || '');
          textDiv.setAttribute('data-original-bgcolor-before-hover', textDiv.style.backgroundColor || '');
          
          if (connectedStrategies.length > 0) {
            const firstStrategyIdx = connectedStrategies[0];
            const highlightColor = getStrategyPBCColor(firstStrategyIdx);
            textDiv.style.background = `${highlightColor}80`;
          } else {
            // Fallback to Strategy color if no connected strategies found
            textDiv.style.background = `${columns[strategiesId].columnColor}80`;
          }
          
          // Highlight connected strategies using their PBC Component colors
          const strategiesColumn = document.getElementById(strategiesId);
          const strategiesChildren = strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`);
          connectedStrategies.forEach(strategyIdx => {
            if (strategiesChildren[strategyIdx]) {
              // Store original background before highlighting
              strategiesChildren[strategyIdx].setAttribute('data-original-bg-before-hover', strategiesChildren[strategyIdx].style.background || '');
              
              const strategyColor = getStrategyPBCColor(strategyIdx);
              strategiesChildren[strategyIdx].style.background = `${strategyColor}80`;
            }
          });
        };
        
        const removeItemHighlights = () => {
          if (clickedStrategy || clickedPartner) return;
          
          // Store original background before hover for restoration
          const originalItemBg = textDiv.getAttribute('data-original-bg-before-hover') || '';
          const originalItemBackgroundColor = textDiv.getAttribute('data-original-bgcolor-before-hover') || '';
          
          // Restore original background for the hovered outcome item
          if (originalItemBg) {
            textDiv.style.background = originalItemBg;
          } else if (originalItemBackgroundColor) {
            textDiv.style.backgroundColor = originalItemBackgroundColor;
            textDiv.style.background = '';
          } else {
            textDiv.style.background = 'transparent';
          }
          textDiv.style.boxShadow = '';
          
          // Clear highlights from strategies column, preserving original backgrounds
          const strategiesColumn = document.getElementById(strategiesId);
          if (strategiesColumn) {
            const strategiesChildren = [...strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`)];
            strategiesChildren.forEach(child => {
              const originalChildBg = child.getAttribute('data-original-bg-before-hover') || '';
              if (originalChildBg) {
                child.style.background = originalChildBg;
              } else {
                child.style.background = 'transparent';
              }
            });
          }
        };
        
        // Add hover events (only for outcome columns to highlight strategies)
        const outcomeColumns = [outputsId, immediateOutputsId, intermediateOutputsId, longTermOutputsId];
        if (outcomeColumns.includes(columnId)) {
          dataDiv.onmouseenter = highlightRelatedStrategies;
          dataDiv.onmouseleave = removeItemHighlights;
        }
      }
    });
  };

  const strategiesColumn = document.getElementById(strategiesId);
  const partnersColumn = document.getElementById(partnersId);
  const seeAllButton = document.createElement('button');
  const seeAllPartnersButton = document.createElement('button');
  const showAllPartnerStrategiesButton = document.createElement('button');
  const showAllPBCStrategiesButton = document.createElement('button');

  addDataToColumn(data.pbcComponents, pbcComponentsId);
  addDataToColumn(data.partners, partnersId);
  addDataToColumn(Object.keys(data.strategies), strategiesId);

  seeAllButton.className = `${namespace}-see-all`;
  seeAllButton.style.display = 'none';
  seeAllButton.textContent = 'See All Strategies';
  strategiesColumn.appendChild(seeAllButton);
  seeAllButton.onclick = unfilterColumns;

  showAllPartnerStrategiesButton.className = `${namespace}-see-all`;
  showAllPartnerStrategiesButton.style.display = 'none';
  showAllPartnerStrategiesButton.textContent = 'Show all Strategies for this Partner';
  showAllPartnerStrategiesButton.style.marginTop = '10px';
  strategiesColumn.appendChild(showAllPartnerStrategiesButton);

  showAllPBCStrategiesButton.className = `${namespace}-see-all`;
  showAllPBCStrategiesButton.style.display = 'none';
  showAllPBCStrategiesButton.textContent = 'Show all Strategies for this PBC Component';
  showAllPBCStrategiesButton.style.marginTop = '10px';
  strategiesColumn.appendChild(showAllPBCStrategiesButton);
  
  // Create function to show all strategies for current partner
  const showAllPartnerStrategies = () => {
    if (!clickedPartner) return;
    
    // Clear selectedItems when showing all partner strategies
    selectedItems.clear();
    
    // Clear strategy filter but keep partner filter
    clickedStrategy = false;
    
    // Find the currently selected partner
    const partnersColumn = document.getElementById(partnersId);
    const partnersChildren = partnersColumn.getElementsByClassName(`${namespace}-data-wrapper`);
    let selectedPartnerIndex = -1;
    
    [...partnersChildren].forEach((child, idx) => {
      if (child.style.display !== 'none') {
        selectedPartnerIndex = idx;
      }
    });
    
    if (selectedPartnerIndex === -1) return;
    
    // Find all strategies connected to this partner
    const connectedStrategies = [];
    strategyValues.forEach((strategy, strategyIdx) => {
      if (strategy.partners && strategy.partners.includes(selectedPartnerIndex)) {
        connectedStrategies.push(strategyIdx);
      }
    });
    
    // Show all connected strategies
    const strategiesChildren = strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`);
    [...strategiesChildren].forEach((child, idx) => {
      if (!connectedStrategies.includes(idx)) {
        child.style.display = 'none';
      } else {
        child.style.display = 'block';
      }
    });
    
    // Collect all outcomes from connected strategies
    const allConnectedOutcomes = {
      pbcComponents: new Set(),
      outputs: new Set(),
      immediateOutputs: new Set(),
      intermediateOutputs: new Set(),
      longTermOutputs: new Set()
    };
    
    connectedStrategies.forEach(strategyIdx => {
      const strategy = strategyValues[strategyIdx];
      if (strategy.pbcComponents) strategy.pbcComponents.forEach(idx => allConnectedOutcomes.pbcComponents.add(idx));
      if (strategy.outputs) strategy.outputs.forEach(idx => allConnectedOutcomes.outputs.add(idx));
      if (strategy.immediateOutputs) strategy.immediateOutputs.forEach(idx => allConnectedOutcomes.immediateOutputs.add(idx));
      if (strategy.intermediateOutputs) strategy.intermediateOutputs.forEach(idx => allConnectedOutcomes.intermediateOutputs.add(idx));
      if (strategy.longTermOutputs) strategy.longTermOutputs.forEach(idx => allConnectedOutcomes.longTermOutputs.add(idx));
    });

    // Filter outcome columns to show all connected outcomes
    const filterOutcomeColumn = (columnId, connectedSet) => {
      const column = document.getElementById(columnId);
      const columnChildren = column.getElementsByClassName(`${namespace}-data-wrapper`);
      [...columnChildren].forEach((child, idx) => {
        if (connectedSet.has(idx)) {
          child.style.display = 'block';
        } else {
          child.style.display = 'none';
        }
      });
    };

    filterOutcomeColumn(pbcComponentsId, allConnectedOutcomes.pbcComponents);
    filterOutcomeColumn(outputsId, allConnectedOutcomes.outputs);
    filterOutcomeColumn(immediateOutputsId, allConnectedOutcomes.immediateOutputs);
    filterOutcomeColumn(intermediateOutputsId, allConnectedOutcomes.intermediateOutputs);
    filterOutcomeColumn(longTermOutputsId, allConnectedOutcomes.longTermOutputs);
    
    // Hide this button since we're now showing all strategies for the partner
    showAllPartnerStrategiesButton.style.display = 'none';
    
    // Clear all background colors from table items
    [pbcComponentsId, partnersId, strategiesId, outputsId, immediateOutputsId, intermediateOutputsId, longTermOutputsId].forEach(columnId => {
      const column = document.getElementById(columnId);
      const columnChildren = column.getElementsByClassName(`${namespace}-data-wrapper`);
      [...columnChildren].forEach(child => {
        // Clear wrapper background
        child.style.background = 'transparent';
        
        // Clear text element backgrounds
        const textElements = child.getElementsByClassName(textClass);
        [...textElements].forEach(textEl => {
          textEl.style.background = 'transparent';
          textEl.style.backgroundColor = '';
          textEl.style.boxShadow = '';
          textEl.style.opacity = '';
        });
      });
    });
    
    // Also clear Partner column colors
    clearPartnerColumnColors();
  };
  
  showAllPartnerStrategiesButton.onclick = showAllPartnerStrategies;

  // Create function to show all strategies for current PBC component
  const showAllPBCStrategies = () => {
    if (!clickedStrategy) return;
    
    // Clear selectedItems when showing all PBC strategies
    selectedItems.clear();
    
    // Find the currently selected strategy
    const strategiesChildren = strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`);
    let selectedStrategyIndex = -1;
    
    [...strategiesChildren].forEach((child, idx) => {
      if (child.style.display !== 'none') {
        selectedStrategyIndex = idx;
      }
    });
    
    if (selectedStrategyIndex === -1) return;
    
    // Get the PBC components of the selected strategy
    const selectedStrategy = strategyValues[selectedStrategyIndex];
    const strategyPBCComponents = selectedStrategy.pbcComponents || [];
    
    if (strategyPBCComponents.length === 0) return;
    
    // Find all strategies that share any PBC component with the selected strategy
    const connectedStrategies = [];
    strategyValues.forEach((strategy, strategyIdx) => {
      if (strategy.pbcComponents) {
        const hasSharedPBC = strategy.pbcComponents.some(pbcIdx => 
          strategyPBCComponents.includes(pbcIdx)
        );
        if (hasSharedPBC) {
          connectedStrategies.push(strategyIdx);
        }
      }
    });
    
    // Clear strategy filter but keep other states
    clickedStrategy = false;
    
    // Show all connected strategies
    [...strategiesChildren].forEach((child, idx) => {
      if (!connectedStrategies.includes(idx)) {
        child.style.display = 'none';
      } else {
        child.style.display = 'block';
      }
    });
    
    // Collect all outcomes from connected strategies
    const allConnectedOutcomes = {
      pbcComponents: new Set(),
      outputs: new Set(),
      immediateOutputs: new Set(),
      intermediateOutputs: new Set(),
      longTermOutputs: new Set()
    };
    
    connectedStrategies.forEach(strategyIdx => {
      const strategy = strategyValues[strategyIdx];
      if (strategy.pbcComponents) strategy.pbcComponents.forEach(idx => allConnectedOutcomes.pbcComponents.add(idx));
      if (strategy.outputs) strategy.outputs.forEach(idx => allConnectedOutcomes.outputs.add(idx));
      if (strategy.immediateOutputs) strategy.immediateOutputs.forEach(idx => allConnectedOutcomes.immediateOutputs.add(idx));
      if (strategy.intermediateOutputs) strategy.intermediateOutputs.forEach(idx => allConnectedOutcomes.intermediateOutputs.add(idx));
      if (strategy.longTermOutputs) strategy.longTermOutputs.forEach(idx => allConnectedOutcomes.longTermOutputs.add(idx));
    });

    // Filter outcome columns to show all connected outcomes
    const filterOutcomeColumn = (columnId, connectedSet) => {
      const column = document.getElementById(columnId);
      const columnChildren = column.getElementsByClassName(`${namespace}-data-wrapper`);
      [...columnChildren].forEach((child, idx) => {
        if (connectedSet.has(idx)) {
          child.style.display = 'block';
        } else {
          child.style.display = 'none';
        }
      });
    };

    filterOutcomeColumn(pbcComponentsId, allConnectedOutcomes.pbcComponents);
    filterOutcomeColumn(outputsId, allConnectedOutcomes.outputs);
    filterOutcomeColumn(immediateOutputsId, allConnectedOutcomes.immediateOutputs);
    filterOutcomeColumn(intermediateOutputsId, allConnectedOutcomes.intermediateOutputs);
    filterOutcomeColumn(longTermOutputsId, allConnectedOutcomes.longTermOutputs);
    
    // Also filter partners based on the connected strategies
    const allConnectedPartners = new Set();
    connectedStrategies.forEach(strategyIdx => {
      const strategy = strategyValues[strategyIdx];
      if (strategy.partners) strategy.partners.forEach(idx => allConnectedPartners.add(idx));
    });
    
    const partnersChildren = partnersColumn.getElementsByClassName(`${namespace}-data-wrapper`);
    [...partnersChildren].forEach((child, idx) => {
      if (allConnectedPartners.has(idx)) {
        child.style.display = 'block';
      } else {
        child.style.display = 'none';
      }
    });
    
    // Hide this button since we're now showing all strategies for the PBC component
    showAllPBCStrategiesButton.style.display = 'none';
    
    // Clear all background colors from table items
    [pbcComponentsId, partnersId, strategiesId, outputsId, immediateOutputsId, intermediateOutputsId, longTermOutputsId].forEach(columnId => {
      const column = document.getElementById(columnId);
      const columnChildren = column.getElementsByClassName(`${namespace}-data-wrapper`);
      [...columnChildren].forEach(child => {
        // Clear wrapper background
        child.style.background = 'transparent';
        
        // Clear text element backgrounds
        const textElements = child.getElementsByClassName(textClass);
        [...textElements].forEach(textEl => {
          textEl.style.background = 'transparent';
          textEl.style.backgroundColor = '';
          textEl.style.boxShadow = '';
          textEl.style.opacity = '';
        });
      });
    });
    
    // Also clear Partner column colors
    clearPartnerColumnColors();
  };
  
  showAllPBCStrategiesButton.onclick = showAllPBCStrategies;

  seeAllPartnersButton.className = `${namespace}-see-all`;
  seeAllPartnersButton.style.display = 'none';
  seeAllPartnersButton.textContent = 'See All Partners';
  partnersColumn.appendChild(seeAllPartnersButton);
  seeAllPartnersButton.onclick = unfilterColumns;

  addDataToColumn(data.outputs, outputsId);
  addDataToColumn(data.immediateOutputs, immediateOutputsId);
  addDataToColumn(data.intermediateOutputs, intermediateOutputsId);
  addDataToColumn(data.longTermOutputs, longTermOutputsId);

  // Trigger PBC Components to be hidden by default
  toggleColumn(pbcComponentsId, 'PBC Components', 'pbcComponents', 0, true);
  
  // Since PBC Components are hidden by default, apply initial Partner filtering
  setTimeout(() => {
    filterPartnersFromPBC();
  }, 100);

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
