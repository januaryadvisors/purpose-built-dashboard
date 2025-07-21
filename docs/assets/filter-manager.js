// Filter management functionality for the dashboard
window.FilterManager = (function() {

  // Track selected items for filtering (used by PBC Components horizontal bar)
  let selectedItems = new Set();

  // Function to filter Partners column based on selected PBC Components
  const filterPartnersFromPBC = (namespace, partnersId, data) => {
    const pbcHorizontalBar = document.getElementById(`${namespace}-horizontal-pbcComponents`);
    if (!pbcHorizontalBar) {
      return;
    }
    
    const partnersColumn = document.getElementById(partnersId);
    if (!partnersColumn) return;
    
    // Get selected PBC components (simplified)
    const selectedPBCs = new Set([...pbcHorizontalBar.querySelectorAll('div.selected')]
      .map(btn => btn.textContent));
    
    
    const partnersChildren = partnersColumn.getElementsByClassName(`${namespace}-data-wrapper`);
    
    // Early return: if no PBC selected, show all partners
    if (selectedPBCs.size === 0) {
      [...partnersChildren].forEach(child => {
        child.style.display = 'block';
        // Use the simplified clearing approach
        const partnerItem = child.querySelector(`.${namespace}-datum`);
        if (partnerItem) {
          partnerItem.removeAttribute('style');
          ['data-pbc-colored', 'data-original-bg', 'data-original-border', 
           'data-original-border-radius', 'data-original-padding'].forEach(attr => {
            partnerItem.removeAttribute(attr);
          });
        }
      });
      return;
    }
    
    // Find visible partners (simplified)
    const visiblePartners = new Set();
    Object.values(data.strategies).forEach(strategy => {
      // Check if strategy has any selected PBC components
      const strategyPBCs = (strategy.pbcComponents || []).map(idx => data.pbcComponents[idx]);
      const hasSelectedPBC = strategyPBCs.some(pbc => selectedPBCs.has(pbc));
      
      if (hasSelectedPBC) {
        // Add all partners from this strategy
        (strategy.partners || []).forEach(partnerIdx => {
          visiblePartners.add(data.partners[partnerIdx]);
        });
      }
    });
    
    
    // Show/hide partners in one loop
    [...partnersChildren].forEach((child, idx) => {
      child.style.display = visiblePartners.has(data.partners[idx]) ? 'block' : 'none';
    });
  };

  // Function to clear Partner column colors
  const clearPartnerColumnColors = (namespace, partnersId) => {
    const partnersColumn = document.getElementById(partnersId);
    if (partnersColumn) {
      const partnersChildren = partnersColumn.getElementsByClassName(`${namespace}-data-wrapper`);
      [...partnersChildren].forEach(child => {
        const partnerItem = child.querySelector(`.${namespace}-datum`);
        if (partnerItem) {
          partnerItem.removeAttribute('style');
          
          // Clear data attributes in one go
          ['data-pbc-colored', 'data-original-bg', 'data-original-border', 
           'data-original-border-radius', 'data-original-padding'].forEach(attr => {
            partnerItem.removeAttribute(attr);
          });
        }
      });
    }
  };

  // Function to hide PBC Components column and create horizontal filter bar
  const toggleColumn = (config) => {
    const {
      columnId, columnLabel, dataKey, colorIndex,
      namespace, strategiesId, partnersId, outputsId, immediateOutputsId, intermediateOutputsId, longTermOutputsId,
      dashboard, dashboardWrapper, data, strategyValues,
      addElement, getPBCColor, generatePBCGradient, updateBrandGradient, updateButtonVisibility
    } = config;

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
          clearPartnerColumnColors(namespace, partnersId);
          // Reset brand gradient to original colors when no PBC components are selected
          updateBrandGradient(window.ColorManager.getOriginalBrandGradient());
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
            
          });
        }
      } else {
        // For other filtering types, filter Partners normally
        filterColumnByStrategies(partnersId, 'partners');
      }
    };
    
    // Hide column and create horizontal filter bar
    if (columnHeader) columnHeader.style.display = 'none';
    if (column) column.style.display = 'none';
    
    // Create horizontal bar if it doesn't exist
    if (!horizontalBar) {
        horizontalBar = addElement(dashboard, 'div', `horizontal-${dataKey}`);
        horizontalBar.style.display = 'flex';
        horizontalBar.style.flexWrap = 'wrap';
        horizontalBar.style.gap = '10px';
        horizontalBar.style.padding = '15px';
        const currentGradient = window.ColorManager.getCurrentBrandGradient();
        horizontalBar.style.backgroundColor = currentGradient[colorIndex] + '1A';
        horizontalBar.style.border = `2px solid ${currentGradient[colorIndex]}80`;
        horizontalBar.style.borderRadius = '8px';
        horizontalBar.style.marginBottom = '20px';
        
        // Add title
        const titleDiv = addElement(horizontalBar, 'div');
        titleDiv.style.fontWeight = 'bold';
        titleDiv.style.marginBottom = '10px';
        titleDiv.style.width = '100%';
        titleDiv.style.color = currentGradient[colorIndex];
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
            const isPBCComponent = dataKey === 'pbcComponents';
            
            if (isPBCComponent) {
              // Exclusive selection for PBC Components
              if (selectedItems.has(item)) {
                // Deselect the current item
                selectedItems.delete(item);
                itemDiv.classList.remove('selected');
                
                // Reset to unselected styling for PBC components
                const pbcColor = getPBCColor(item);
                itemDiv.style.backgroundColor = `${pbcColor}20`;
                
                // Reset to original brand gradient when PBC component is deselected
                updateBrandGradient(window.ColorManager.getOriginalBrandGradient());
              } else {
                // First, deselect all other PBC Components
                const allPBCButtons = horizontalBar.querySelectorAll('div');
                allPBCButtons.forEach(button => {
                  if (button.textContent && button.classList.contains('selected')) {
                    selectedItems.delete(button.textContent);
                    button.classList.remove('selected');
                    
                    // Reset styling for deselected PBC components
                    const buttonPBCColor = getPBCColor(button.textContent);
                    button.style.backgroundColor = `${buttonPBCColor}20`;
                  }
                });
                
                // Then select the clicked item
                selectedItems.add(item);
                itemDiv.classList.add('selected');
                
                // Apply selected styling for PBC components
                const pbcColor = getPBCColor(item);
                itemDiv.style.backgroundColor = `${pbcColor}80`;
                
                // Update brand gradient based on selected PBC component
                const newGradient = generatePBCGradient(pbcColor);
                updateBrandGradient(newGradient);
              }
              
              // Update button visibility when PBC component is selected
              updateButtonVisibility();
            } else {
              // Non-exclusive selection for other types (if any)
              if (selectedItems.has(item)) {
                // Deselect item
                selectedItems.delete(item);
                itemDiv.classList.remove('selected');
              } else {
                // Select item
                selectedItems.add(item);
                itemDiv.classList.add('selected');
              }
            }
            
            filterStrategiesByItems();
          });
          
        });
        
        // Insert the horizontal bar before the dashboardWrapper
        dashboard.insertBefore(horizontalBar, dashboardWrapper);
      } else {
        horizontalBar.style.display = 'flex';
      }
  };

  // Function to clear all filters and show all columns
  const unfilterColumns = (config) => {
    const {
      namespace, pbcComponentsId, partnersId, strategiesId, outputsId, immediateOutputsId, intermediateOutputsId, longTermOutputsId,
      textClass, getPBCColor, updateBrandGradient, updateButtonVisibility
    } = config;

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
      filterPartnersFromPBC(namespace, partnersId, config.data);
      
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
    clearPartnerColumnColors(namespace, partnersId);
    
    // Reset brand gradient to original colors
    updateBrandGradient(window.ColorManager.getOriginalBrandGradient());
    
    updateButtonVisibility();
  };

  // Function to update button visibility based on current filter state
  const updateButtonVisibility = (config) => {
    const {
      seeAllButton, seeAllPartnersButton, showAllPartnerStrategiesButton, 
      showAllPBCStrategiesButton, showAllPBCPartnersButton,
      clickedStrategy, clickedPartner, namespace, partnersId, data
    } = config;

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
      
      // Update button text with the actual PBC component name and context
      if (clickedPartner) {
        // Find the selected partner name
        const partnersColumn = document.getElementById(partnersId);
        const partnersChildren = partnersColumn.getElementsByClassName(`${namespace}-data-wrapper`);
        let selectedPartnerName = '';
        [...partnersChildren].forEach((child, idx) => {
          if (child.style.display !== 'none') {
            selectedPartnerName = data.partners[idx];
          }
        });
        showAllPBCStrategiesButton.textContent = `Back to ${selectedPBCName} Strategies`;
      } else {
        showAllPBCStrategiesButton.textContent = `View All Strategies for ${selectedPBCName}`;
      }
      
      showAllPBCPartnersButton.textContent = `View All Partners for ${selectedPBCName}`;
      
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

  // Getters and setters for selectedItems
  const getSelectedItems = () => {
    return new Set(selectedItems);
  };

  const setSelectedItems = (items) => {
    selectedItems = new Set(items);
  };

  const addSelectedItem = (item) => {
    selectedItems.add(item);
  };

  const removeSelectedItem = (item) => {
    selectedItems.delete(item);
  };

  const clearSelectedItems = () => {
    selectedItems.clear();
  };

  const hasSelectedItems = () => {
    return selectedItems.size > 0;
  };

  const getSelectedItemsSize = () => {
    return selectedItems.size;
  };

  // Public API
  return {
    filterPartnersFromPBC,
    clearPartnerColumnColors,
    toggleColumn,
    unfilterColumns,
    updateButtonVisibility,
    getSelectedItems,
    setSelectedItems,
    addSelectedItem,
    removeSelectedItem,
    clearSelectedItems,
    hasSelectedItems,
    getSelectedItemsSize
  };
})(); 