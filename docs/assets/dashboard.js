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

  // Original brand gradient - stored for resetting
  const originalBrandGradient = ['#A8A8A8', '#D1E9E6', '#92E2DA', '#01A997', '#006C69', '#3DAF49', '#207429'];
  
  // Current brand gradient - will be modified based on selected PBC component
  let brandGradient = [...originalBrandGradient];

  const dashboardWrapper = addElement(dashboard, 'div', 'body-wrapper');
  

  
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

  // Function to generate gradient colors based on a base PBC component color
  const generatePBCGradient = (baseColor) => {
    // Remove # if present
    const cleanColor = baseColor.replace('#', '');
    
    // Parse RGB components
    const r = parseInt(cleanColor.substr(0, 2), 16);
    const g = parseInt(cleanColor.substr(2, 2), 16);
    const b = parseInt(cleanColor.substr(4, 2), 16);
    
    // Create a gradient from light to dark based on the base color
    const generateShade = (baseR, baseG, baseB, factor) => {
      const newR = Math.round(Math.min(255, Math.max(0, baseR + (255 - baseR) * factor)));
      const newG = Math.round(Math.min(255, Math.max(0, baseG + (255 - baseG) * factor)));
      const newB = Math.round(Math.min(255, Math.max(0, baseB + (255 - baseB) * factor)));
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    };
    
    // Generate a complementary darker shade for variety
    const generateDarkShade = (baseR, baseG, baseB, factor) => {
      const newR = Math.round(Math.max(0, baseR * factor));
      const newG = Math.round(Math.max(0, baseG * factor));
      const newB = Math.round(Math.max(0, baseB * factor));
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    };
    
    return [
      generateShade(r, g, b, 0.7),    // Lightest - PBC Components
      generateShade(r, g, b, 0.5),    // Light - Partners  
      generateShade(r, g, b, 0.3),    // Medium-light - Strategies
      baseColor,                      // Base color - Outputs
      generateDarkShade(r, g, b, 0.8), // Medium-dark - Immediate Outcomes
      generateDarkShade(r, g, b, 0.6), // Dark - Intermediate Outcomes
      generateDarkShade(r, g, b, 0.4)  // Darkest - Long-Term Outcomes
    ];
  };

  // Function to update all UI elements with the new brand gradient
  const updateBrandGradient = (newGradient) => {
    brandGradient = [...newGradient];
    
    // Update column colors in the columns object
    const columnIds = [pbcComponentsId, partnersId, strategiesId, outputsId, immediateOutputsId, intermediateOutputsId, longTermOutputsId];
    columnIds.forEach((columnId, index) => {
      if (columns[columnId]) {
        columns[columnId].columnColor = brandGradient[index];
      }
    });
    
    // Update existing header elements
    const headerElements = document.querySelectorAll(`.${namespace}-header`);
    headerElements.forEach((headerEl, index) => {
      const labelWrapper = headerEl.querySelector(`.${namespace}-header-label-wrapper`);
      if (labelWrapper) {
        labelWrapper.style.background = brandGradient[index];
      }
      
      // Update arrow colors
      const leftArrow = headerEl.querySelector('svg polygon');
      if (leftArrow) {
        leftArrow.setAttribute('fill', brandGradient[index]);
      }
      
      const rightArrow = headerEl.querySelectorAll('svg polygon')[1];
      if (rightArrow) {
        rightArrow.setAttribute('fill', brandGradient[index]);
      }
    });
    
    // Update column wrapper borders and backgrounds
    const columnWrappers = document.querySelectorAll(`.${namespace}-column-wrapper`);
    columnWrappers.forEach((wrapper, index) => {
      if (brandGradient[index]) {
        wrapper.style.border = `1px solid ${brandGradient[index]}80`;
        wrapper.style.background = `${brandGradient[index]}1A`;
      }
    });
    
    // Update data wrapper borders within each column
    columnIds.forEach((columnId, index) => {
      const column = document.getElementById(columnId);
      if (column && brandGradient[index]) {
        const dataWrappers = column.querySelectorAll(`.${namespace}-data-wrapper`);
        dataWrappers.forEach((wrapper, dataIndex, arr) => {
          if (dataIndex !== arr.length - 1) { // Don't add border to last item
            wrapper.style.borderBottom = `1px solid ${brandGradient[index]}80`;
          }
        });
      }
    });
    
    // Update horizontal bar styling if it exists
    const pbcHorizontalBar = document.getElementById(`${namespace}-horizontal-pbcComponents`);
    if (pbcHorizontalBar) {
      pbcHorizontalBar.style.backgroundColor = brandGradient[0] + '1A';
      pbcHorizontalBar.style.border = `2px solid ${brandGradient[0]}80`;
      
      const titleDiv = pbcHorizontalBar.querySelector('div');
      if (titleDiv && titleDiv.style.fontWeight === 'bold') {
        titleDiv.style.color = brandGradient[0];
      }
    }
    
    console.log('🎨 Updated brand gradient:', brandGradient);
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
    
    Object.values(data.strategies).forEach(strategy => {
      const strategyPBCComponents = strategy.pbcComponents ? strategy.pbcComponents.map(idx => data.pbcComponents[idx]) : [];
      const hasSelectedPBC = strategyPBCComponents.some(pbc => selectedPBCComponents.has(pbc));
      
      if (hasSelectedPBC) {
        // Add all partners from this strategy
        const strategyPartners = strategy.partners ? strategy.partners.map(idx => data.partners[idx]) : [];
        strategyPartners.forEach(partner => {
          partnersToShow.add(partner);
        });
      }
    });
    
    console.log(`🤝 Partners that should be visible: [${Array.from(partnersToShow).join(', ')}]`);
    
    // Show/hide partners and apply colors
    [...partnersChildren].forEach((child, idx) => {
      const partner = data.partners[idx];
      
      if (partnersToShow.has(partner)) {
        child.style.display = 'block';
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
          // Reset brand gradient to original colors when no PBC components are selected
          updateBrandGradient(originalBrandGradient);
        }
        
        return;
      }
      
      // Get visible strategies
      const visibleStrategies = [];
      console.log(`🔍 Filtering strategies based on selected ${dataKey}:`, Array.from(selectedItems));
      
      [...strategiesChildren].forEach((child, idx) => {
        const strategy = strategyValues[idx];
        const strategyItems = strategy[dataKey] ? strategy[dataKey].map(itemIdx => data[dataKey][itemIdx]) : [];
        const hasSelectedItem = strategyItems.some(item => selectedItems.has(item));
        
        // Debug logging for PBC components
        if (dataKey === 'pbcComponents') {
          console.log(`📊 Strategy "${strategy.label}": PBC Components = [${strategyItems.join(', ')}], hasSelectedItem = ${hasSelectedItem}`);
        }
        
        if (hasSelectedItem) {
          visibleStrategies.push(strategy);
          child.style.display = 'block';
        } else {
          child.style.display = 'none';
        }
      });
      
      console.log(`✅ Visible strategies after filtering: ${visibleStrategies.length} out of ${strategiesChildren.length}`);
      
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
                  
                  // Reset to original brand gradient when PBC component is deselected
                  if (dataKey === 'pbcComponents') {
                    updateBrandGradient(originalBrandGradient);
                  }
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
                    
                    // Update brand gradient based on selected PBC component
                    const newGradient = generatePBCGradient(pbcColor);
                    updateBrandGradient(newGradient);
                    
                    console.log(`🎯 PBC Component selected: "${item}"`);
                    console.log(`📦 Current selectedItems:`, Array.from(selectedItems));
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
                
                // Update button visibility when PBC component is selected
              if (dataKey === 'pbcComponents') {
                updateButtonVisibility();
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

  // Removes column highlights
  const removeColumnHighlights = () => {
    if (clickedStrategy) {
      return; // Allow hover when only partner is filtered
    }
    columnEls.forEach(columnEl => {
      const dataChildren = [...columnEl.getElementsByClassName(textClass)];
      dataChildren.forEach(child => {
        child.style.background = 'transparent';
      });
    });
  };

  // Removes partner hover highlights (both partner and connected strategies)
  const removePartnerHighlights = () => {
    if (clickedStrategy) {
      return; // Allow hover when only partner is filtered
    }
    
    // Clear partner highlights
    const partnersColumn = document.getElementById(partnersId);
    if (partnersColumn) {
      const partnersChildren = partnersColumn.getElementsByClassName(`${namespace}-data-wrapper`);
      [...partnersChildren].forEach(child => {
        const partnerTextElement = child.querySelector(`.${textClass}`);
        if (partnerTextElement) {
          partnerTextElement.style.background = 'transparent';
        }
      });
    }
    
    // Clear strategy wrapper highlights
    const strategiesColumn = document.getElementById(strategiesId);
    if (strategiesColumn) {
      const strategiesChildren = strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`);
      [...strategiesChildren].forEach(child => {
        child.style.background = 'transparent';
      });
    }
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

  // Function to get the current theme color for hover highlights based on dashboard state
  const getCurrentThemeColor = () => {
    // 1. Check if a PBC component is currently selected from the horizontal filter
    if (selectedItems.size > 0) {
      const selectedPBC = Array.from(selectedItems)[0]; // Get the first (and only in exclusive mode) selected PBC
      return getPBCColor(selectedPBC);
    }
    
    // 2. Check if a specific strategy is currently selected (clickedStrategy = true)
    if (clickedStrategy) {
      const strategiesColumn = document.getElementById(strategiesId);
      const strategiesChildren = strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`);
      
      // Find the currently visible (selected) strategy
      for (let i = 0; i < strategiesChildren.length; i++) {
        if (strategiesChildren[i].style.display !== 'none') {
          return getStrategyPBCColor(i);
        }
      }
    }
    
    // 3. Default: return null to indicate individual strategy colors should be used
    return null;
  };

  const highlightStrategyOutcomes = i => () => {
    if (clickedStrategy) {
      return; // Allow hover when only partner is filtered
    }
    // This function is now unused - we have custom hover functionality for strategies
    // All highlighting is handled by the individual hover functions in addDataToColumn
  };

  const highlightPartnerOutcomes = i => () => {
    if (clickedStrategy) {
      return; // Allow hover when only partner is filtered
    }
    
    // Find all strategies connected to this partner
    const connectedStrategies = [];
    strategyValues.forEach((strategy, strategyIdx) => {
      if (strategy.partners && strategy.partners.includes(i)) {
        connectedStrategies.push(strategyIdx);
      }
    });
    
    // Determine highlight color: use theme color if available, otherwise use first connected strategy's color
    const themeColor = getCurrentThemeColor();
    let highlightColor;
    
    if (themeColor) {
      // Use the current theme color for consistent highlighting
      highlightColor = themeColor;
    } else if (connectedStrategies.length > 0) {
      // Use the first connected strategy's PBC color
      highlightColor = getStrategyPBCColor(connectedStrategies[0]);
    } else {
      // Fallback to Partners column color
      highlightColor = columns[partnersId].columnColor;
    }
    
    // Highlight the hovered partner itself
    const partnersColumn = document.getElementById(partnersId);
    const partnersChildren = partnersColumn.getElementsByClassName(`${namespace}-data-wrapper`);
    if (partnersChildren[i]) {
      const partnerTextElement = partnersChildren[i].querySelector(`.${textClass}`);
      if (partnerTextElement) {
        partnerTextElement.style.background = `${highlightColor}80`;
      }
    }
    
    // Highlight strategies connected to this partner using consistent color
    const strategiesColumn = document.getElementById(strategiesId);
    const strategiesChildren = strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`);
    connectedStrategies.forEach(strategyIdx => {
      if (strategiesChildren[strategyIdx]) {
        strategiesChildren[strategyIdx].style.background = `${highlightColor}80`;
      }
    });
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
    
    // Clear selected items
    selectedItems.clear();
    
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
    
    // Reset brand gradient to original colors
    updateBrandGradient(originalBrandGradient);
    
    updateButtonVisibility();
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

    // Apply brand gradient based on the selected strategy's PBC component
    const selectedStrategy = strategyValues[i];
    if (selectedStrategy.pbcComponents && selectedStrategy.pbcComponents.length > 0) {
      // Get the primary PBC component for branding
      const primaryPBCIndex = selectedStrategy.pbcComponents[0];
      const primaryPBCComponent = data.pbcComponents[primaryPBCIndex];
      const primaryPBCColor = getPBCColor(primaryPBCComponent);
      
      console.log(`🎨 Strategy "${selectedStrategy.label}" - Applying brand gradient for PBC component: "${primaryPBCComponent}"`);
      
      // Apply brand gradient based on the primary PBC component
      const newGradient = generatePBCGradient(primaryPBCColor);
      updateBrandGradient(newGradient);
      
      // Update selectedItems to reflect the strategy's PBC component
      selectedItems.clear();
      selectedItems.add(primaryPBCComponent);
      
      // Highlight the corresponding PBC component in the horizontal filter
      const pbcHorizontalBar = document.getElementById(`${namespace}-horizontal-pbcComponents`);
      if (pbcHorizontalBar) {
        // First, clear any existing selections
        const allPBCButtons = pbcHorizontalBar.querySelectorAll('div');
        allPBCButtons.forEach(button => {
          if (button.textContent && button.classList.contains('selected')) {
            button.classList.remove('selected');
            const buttonPBCColor = getPBCColor(button.textContent);
            button.style.backgroundColor = `${buttonPBCColor}20`;
          }
        });
        
        // Then highlight the primary PBC component
        allPBCButtons.forEach(button => {
          if (button.textContent === primaryPBCComponent) {
            button.classList.add('selected');
            button.style.backgroundColor = `${primaryPBCColor}80`;
            console.log(`🟢 Highlighted PBC component button: "${primaryPBCComponent}"`);
          }
        });
      }
    }

    updateButtonVisibility();
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

    updateButtonVisibility();
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

        // Create colored pill for PBC component spanning full width of strategy box
        const dotPill = document.createElement('div');
        dotPill.style.position = 'absolute';
        dotPill.style.top = '8px';
        dotPill.style.left = '0';
        dotPill.style.right = '0';
        dotPill.style.height = '8px';
        dotPill.style.backgroundColor = getStrategyPBCColor(i);
        dotPill.style.borderRadius = '4px';
        dotPill.style.zIndex = '10';
        
        // Make dataDiv relatively positioned to contain the absolute dot
        dataDiv.style.position = 'relative';
        dataDiv.appendChild(dotPill);

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
          if (clickedStrategy) return; // Allow hover when only partner is filtered
          
          const strategy = strategyValues[i];
          // Use theme color if available, otherwise use individual strategy color
          const themeColor = getCurrentThemeColor();
          const strategyColor = themeColor || getStrategyPBCColor(i);
          
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
          if (clickedStrategy) return; // Allow hover when only partner is filtered
          
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
          
          // Add hover functionality to highlight connected strategies
          dataDiv.onmouseenter = highlightPartnerOutcomes(i);
          dataDiv.onmouseleave = removePartnerHighlights;
        }
        
                // Add hover functionality for outcome columns to highlight strategies
        const highlightRelatedStrategies = () => {
          if (clickedStrategy) return; // Allow hover when only partner is filtered
          
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
          
          // Determine highlight color: use theme color if available, otherwise use first connected strategy's color
          const themeColor = getCurrentThemeColor();
          let highlightColor;
          
          if (themeColor) {
            // Use the current theme color for consistent highlighting
            highlightColor = themeColor;
          } else if (connectedStrategies.length > 0) {
            // Use the first connected strategy's PBC color
            const firstStrategyIdx = connectedStrategies[0];
            highlightColor = getStrategyPBCColor(firstStrategyIdx);
          } else {
            // Fallback to Strategy column color if no connected strategies found
            highlightColor = columns[strategiesId].columnColor;
          }
          
          // Highlight the hovered outcome item
          textDiv.setAttribute('data-original-bg-before-hover', textDiv.style.background || '');
          textDiv.setAttribute('data-original-bgcolor-before-hover', textDiv.style.backgroundColor || '');
          textDiv.style.background = `${highlightColor}80`;
          
          // Highlight connected strategies using the same color for consistency
          const strategiesColumn = document.getElementById(strategiesId);
          const strategiesChildren = strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`);
          connectedStrategies.forEach(strategyIdx => {
            if (strategiesChildren[strategyIdx]) {
              // Store original background before highlighting
              strategiesChildren[strategyIdx].setAttribute('data-original-bg-before-hover', strategiesChildren[strategyIdx].style.background || '');
              
              strategiesChildren[strategyIdx].style.background = `${highlightColor}80`;
            }
          });
        };
        
        const removeItemHighlights = () => {
          if (clickedStrategy) return; // Allow hover when only partner is filtered
          
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
  const showAllPBCPartnersButton = document.createElement('button');

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
  
  // Create function to show all partners for current PBC component
  const showAllPBCPartners = () => {
    if (selectedItems.size === 0) return; // No PBC component selected
    
    // Clear partner and strategy filters but keep PBC filter
    clickedPartner = false;
    clickedStrategy = false;
    
    // Get the selected PBC component
    const selectedPBC = Array.from(selectedItems)[0];
    
    // Find all strategies connected to this PBC component
    const connectedStrategies = [];
    strategyValues.forEach((strategy, strategyIdx) => {
      const strategyPBCComponents = strategy.pbcComponents ? strategy.pbcComponents.map(idx => data.pbcComponents[idx]) : [];
      if (strategyPBCComponents.includes(selectedPBC)) {
        connectedStrategies.push(strategyIdx);
      }
    });
    
    // Show all connected strategies
    const strategiesChildren = strategiesColumn.getElementsByClassName(`${namespace}-data-wrapper`);
    [...strategiesChildren].forEach((child, idx) => {
      if (connectedStrategies.includes(idx)) {
        child.style.display = 'block';
      } else {
        child.style.display = 'none';
      }
    });
    
    // Find all partners connected to these strategies
    const connectedPartners = new Set();
    connectedStrategies.forEach(strategyIdx => {
      const strategy = strategyValues[strategyIdx];
      if (strategy.partners) {
        strategy.partners.forEach(partnerIdx => connectedPartners.add(partnerIdx));
      }
    });
    
    // Show all connected partners
    const partnersChildren = partnersColumn.getElementsByClassName(`${namespace}-data-wrapper`);
    [...partnersChildren].forEach((child, idx) => {
      if (connectedPartners.has(idx)) {
        child.style.display = 'block';
      } else {
        child.style.display = 'none';
      }
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
      const strategy = strategyValues[strategyIdx];
      if (strategy.pbcComponents) strategy.pbcComponents.forEach(idx => allConnectedOutcomes.pbcComponents.add(idx));
      if (strategy.outputs) strategy.outputs.forEach(idx => allConnectedOutcomes.outputs.add(idx));
      if (strategy.immediateOutputs) strategy.immediateOutputs.forEach(idx => allConnectedOutcomes.immediateOutputs.add(idx));
      if (strategy.intermediateOutputs) strategy.intermediateOutputs.forEach(idx => allConnectedOutcomes.intermediateOutputs.add(idx));
      if (strategy.longTermOutputs) strategy.longTermOutputs.forEach(idx => allConnectedOutcomes.longTermOutputs.add(idx));
    });

    // Filter outcome columns
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
    
    // Clear all background highlights
    [pbcComponentsId, partnersId, strategiesId, outputsId, immediateOutputsId, intermediateOutputsId, longTermOutputsId].forEach(columnId => {
      const column = document.getElementById(columnId);
      const columnChildren = column.getElementsByClassName(`${namespace}-data-wrapper`);
      [...columnChildren].forEach(child => {
        child.style.background = 'transparent';
        const textElements = child.getElementsByClassName(textClass);
        [...textElements].forEach(textEl => {
          textEl.style.background = 'transparent';
          textEl.style.backgroundColor = '';
          textEl.style.boxShadow = '';
          textEl.style.opacity = '';
        });
      });
    });
    
    clearPartnerColumnColors();
    updateButtonVisibility();
  };

  // Function to update button visibility based on current state
  const updateButtonVisibility = () => {
    // Hide all buttons first
    seeAllButton.style.display = 'none';
    seeAllPartnersButton.style.display = 'none';
    showAllPartnerStrategiesButton.style.display = 'none';
    showAllPBCStrategiesButton.style.display = 'none';
    showAllPBCPartnersButton.style.display = 'none';
    
    const isPBCSelected = selectedItems.size > 0;
    
    if (isPBCSelected) {
      // Get the selected PBC component name
      const selectedPBCName = Array.from(selectedItems)[0];
      
      // Update button text with the actual PBC component name
      showAllPBCStrategiesButton.textContent = `Show All Strategies for ${selectedPBCName}`;
      showAllPBCPartnersButton.textContent = `Show All Partners for ${selectedPBCName}`;
      
      // PBC component is selected - use smart button logic
      
      // For Strategies column
      if (clickedStrategy) {
        // Single strategy is selected - show PBC-specific button
        showAllPBCStrategiesButton.style.display = 'block';
      } else if (clickedPartner) {
        // Partner is selected, strategies are filtered by partner - show PBC-specific button
        showAllPBCStrategiesButton.style.display = 'block';
      } else {
        // All strategies for PBC are shown - show general button
        seeAllButton.style.display = 'block';
      }
      
      // For Partners column  
      if (clickedPartner) {
        // Single partner is selected - show PBC-specific button
        showAllPBCPartnersButton.style.display = 'block';
      } else {
        // All partners for PBC are shown - show general button
        seeAllPartnersButton.style.display = 'block';
      }
      
    } else {
      // No PBC component selected - use original logic
      if (clickedStrategy || clickedPartner) {
        seeAllButton.style.display = 'block';
      }
      
      if (clickedPartner || clickedStrategy) {
        seeAllPartnersButton.style.display = 'block';
      }
      
      if (clickedStrategy && clickedPartner) {
        showAllPartnerStrategiesButton.style.display = 'block';
      }
    }
  };

  // Create function to show all strategies for current partner
  const showAllPartnerStrategies = () => {
    if (!clickedPartner) return;
    
    // Clear selectedItems when showing all partner strategies
    selectedItems.clear();
    
    // Reset brand gradient to original colors since we're not focusing on a specific PBC component
    updateBrandGradient(originalBrandGradient);
    console.log(`🎨 Reset to original brand gradient for partner strategies view`);
    
    // Clear any PBC component selections in the horizontal filter
    const pbcHorizontalBar = document.getElementById(`${namespace}-horizontal-pbcComponents`);
    if (pbcHorizontalBar) {
      const allPBCButtons = pbcHorizontalBar.querySelectorAll('div.selected');
      allPBCButtons.forEach(button => {
        button.classList.remove('selected');
        const buttonPBCColor = getPBCColor(button.textContent);
        button.style.backgroundColor = `${buttonPBCColor}20`;
      });
    }
    
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
    
    updateButtonVisibility();
    
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
    
    // Get the primary PBC component for branding
    const primaryPBCIndex = strategyPBCComponents[0];
    const primaryPBCComponent = data.pbcComponents[primaryPBCIndex];
    const primaryPBCColor = getPBCColor(primaryPBCComponent);
    
    console.log(`🎨 Applying brand gradient for PBC component: "${primaryPBCComponent}"`);
    
    // Apply brand gradient based on the primary PBC component
    const newGradient = generatePBCGradient(primaryPBCColor);
    updateBrandGradient(newGradient);
    
    // Update selectedItems to reflect the current PBC component selection
    selectedItems.clear();
    selectedItems.add(primaryPBCComponent);
    
    // Highlight the corresponding PBC component in the horizontal filter
    const pbcHorizontalBar = document.getElementById(`${namespace}-horizontal-pbcComponents`);
    if (pbcHorizontalBar) {
      // First, clear any existing selections
      const allPBCButtons = pbcHorizontalBar.querySelectorAll('div');
      allPBCButtons.forEach(button => {
        if (button.textContent && button.classList.contains('selected')) {
          button.classList.remove('selected');
          const buttonPBCColor = getPBCColor(button.textContent);
          button.style.backgroundColor = `${buttonPBCColor}20`;
        }
      });
      
      // Then highlight the primary PBC component
      allPBCButtons.forEach(button => {
        if (button.textContent === primaryPBCComponent) {
          button.classList.add('selected');
          button.style.backgroundColor = `${primaryPBCColor}80`;
          console.log(`🟢 Highlighted PBC component button: "${primaryPBCComponent}"`);
        }
      });
    }
    
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
    
    updateButtonVisibility();
    
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

  showAllPBCPartnersButton.className = `${namespace}-see-all`;
  showAllPBCPartnersButton.style.display = 'none';
  showAllPBCPartnersButton.textContent = 'Show All Partners for this PBC Component';
  partnersColumn.appendChild(showAllPBCPartnersButton);
  showAllPBCPartnersButton.onclick = showAllPBCPartners;

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
