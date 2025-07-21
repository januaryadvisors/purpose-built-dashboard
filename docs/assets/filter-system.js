/**
 * Unified Filter System for the Dashboard
 * Manages all filtering state and logic in one place
 */
window.FilterSystem = (function() {

  // ========================================
  // FILTER STATE (Single Source of Truth)
  // ========================================
  
  let filterState = {
    selectedPBC: null,        // Currently selected PBC component
    selectedPartner: null,    // Currently selected partner index
    selectedStrategy: null,   // Currently selected strategy index
    mode: 'overview'          // Current filtering mode
  };

  // Valid modes and their precedence
  const MODES = {
    overview: 'overview',           // No filters active
    pbc: 'pbc',                    // PBC component selected
    partner: 'partner',            // Partner selected  
    strategy: 'strategy',          // Strategy selected
    pbcPartner: 'pbc-partner',     // PBC + Partner
    pbcStrategy: 'pbc-strategy',   // PBC + Strategy
    partnerStrategy: 'partner-strategy' // Partner + Strategy (rare)
  };

  let namespace = '';
  let columnIds = {};
  let data = {};
  let strategyList = [];

  // ========================================
  // INITIALIZATION
  // ========================================

  const init = (config) => {
    namespace = config.namespace;
    columnIds = config.columnIds;
    data = config.data;
    strategyList = config.strategyList;
  };

  // ========================================
  // CORE FILTERING LOGIC
  // ========================================

  /**
   * Generic function to show/hide items in a column
   * @param {string} columnId - ID of column to filter
   * @param {Set|Array} visibleIndices - Indices of items to show
   */
  const filterColumn = (columnId, visibleIndices) => {
    const column = document.getElementById(columnId);
    if (!column) return;

    const children = column.getElementsByClassName(`${namespace}-data-wrapper`);
    const visibleSet = new Set(visibleIndices);

    [...children].forEach((child, idx) => {
      child.style.display = visibleSet.has(idx) ? 'block' : 'none';
    });
  };

  /**
   * Find all strategies that match current filter criteria
   * @returns {Array} Array of strategy indices
   */
  const getVisibleStrategies = () => {
    return strategyList
      .map((strategy, idx) => ({ strategy, idx }))
      .filter(({ strategy, idx }) => {
        // Check PBC filter
        if (filterState.selectedPBC) {
          const strategyPBCs = (strategy.pbcComponents || []).map(i => data.pbcComponents[i]);
          if (!strategyPBCs.includes(filterState.selectedPBC)) return false;
        }

        // Check Partner filter  
        if (filterState.selectedPartner !== null) {
          if (!strategy.partners || !strategy.partners.includes(filterState.selectedPartner)) return false;
        }

        // Check Strategy filter
        if (filterState.selectedStrategy !== null) {
          return idx === filterState.selectedStrategy;
        }

        return true;
      })
      .map(({ idx }) => idx);
  };

  /**
   * Get all items connected to visible strategies for a specific outcome type
   * @param {string} outcomeKey - Key in strategy object (e.g., 'outputs', 'partners')
   * @returns {Set} Set of connected item indices
   */
  const getConnectedItems = (outcomeKey) => {
    const connectedItems = new Set();
    const visibleStrategies = getVisibleStrategies();

    visibleStrategies.forEach(strategyIdx => {
      const strategy = strategyList[strategyIdx];
      if (strategy[outcomeKey]) {
        strategy[outcomeKey].forEach(itemIdx => connectedItems.add(itemIdx));
      }
    });

    return connectedItems;
  };

  /**
   * Apply all filters based on current state
   */
  const applyFilters = () => {
    const visibleStrategies = getVisibleStrategies();

    // Filter Strategies column
    filterColumn(columnIds.strategies, visibleStrategies);

    // Filter outcome columns based on connected strategies
    filterColumn(columnIds.pbcComponents, getConnectedItems('pbcComponents'));
    filterColumn(columnIds.outputs, getConnectedItems('outputs'));
    filterColumn(columnIds.immediateOutputs, getConnectedItems('immediateOutputs'));
    filterColumn(columnIds.intermediateOutputs, getConnectedItems('intermediateOutputs'));
    filterColumn(columnIds.longTermOutputs, getConnectedItems('longTermOutputs'));

    // Filter Partners column (special handling based on mode)
    if (filterState.selectedPartner !== null) {
      // Show only selected partner
      filterColumn(columnIds.partners, [filterState.selectedPartner]);
    } else {
      // Show all partners connected to visible strategies
      filterColumn(columnIds.partners, getConnectedItems('partners'));
    }
  };

  /**
   * Update visual state (colors, buttons, etc.) based on current filters
   */
  const updateVisualState = () => {
    // Update PBC component highlighting
    if (filterState.selectedPBC) {
      const pbcColor = window.ColorManager.getPBCColor(filterState.selectedPBC, data);
      const newGradient = window.ColorManager.generatePBCGradient(pbcColor);
      window.ColorManager.updateBrandGradient(newGradient, namespace, Object.values(columnIds), {});

      // Update horizontal PBC buttons
      const pbcBar = document.getElementById(`${namespace}-horizontal-pbcComponents`);
      if (pbcBar) {
        const buttons = pbcBar.querySelectorAll('div');
        buttons.forEach(button => {
          if (button.textContent === filterState.selectedPBC) {
            button.classList.add('selected');
            button.style.backgroundColor = `${pbcColor}80`;
          } else {
            button.classList.remove('selected');
            const buttonColor = window.ColorManager.getPBCColor(button.textContent, data);
            button.style.backgroundColor = `${buttonColor}20`;
          }
        });
      }
    } else {
      // Reset to original colors
      const originalGradient = window.ColorManager.getOriginalBrandGradient();
      window.ColorManager.updateBrandGradient(originalGradient, namespace, Object.values(columnIds), {});
      
      // Clear all PBC component button highlights
      const pbcBar = document.getElementById(`${namespace}-horizontal-pbcComponents`);
      if (pbcBar) {
        const buttons = pbcBar.querySelectorAll('div');
        buttons.forEach(button => {
          button.classList.remove('selected');
          const buttonColor = window.ColorManager.getPBCColor(button.textContent, data);
          button.style.backgroundColor = `${buttonColor}20`;
        });
      }
    }

    // Clear visual highlights
    clearHighlights();

    // Update filter manager state
    window.FilterManager.clearSelectedItems();
    if (filterState.selectedPBC) {
      window.FilterManager.addSelectedItem(filterState.selectedPBC);
    }
  };

  /**
   * Clear all visual highlights from the dashboard
   */
  const clearHighlights = () => {
    Object.values(columnIds).forEach(columnId => {
      const column = document.getElementById(columnId);
      if (!column) return;

      const children = column.getElementsByClassName(`${namespace}-data-wrapper`);
      [...children].forEach(child => {
        child.style.background = 'transparent';
        
        const textElements = child.getElementsByClassName(`${namespace}-datum`);
        [...textElements].forEach(textEl => {
          textEl.style.background = 'transparent';
          textEl.style.backgroundColor = '';
          textEl.style.boxShadow = '';
          textEl.style.opacity = '';
        });
      });
    });

    // Clear partner styling
    if (window.FilterManager.clearPartnerColumnColors) {
      window.FilterManager.clearPartnerColumnColors(namespace, columnIds.partners);
    }
  };

  // ========================================
  // PUBLIC API - FILTER ACTIONS
  // ========================================

  /**
   * Select a PBC component
   * @param {string} pbcComponent - Name of PBC component
   */
  const selectPBC = (pbcComponent) => {
    filterState.selectedPBC = pbcComponent;
    filterState.selectedPartner = null;
    filterState.selectedStrategy = null;
    filterState.mode = MODES.pbc;
    
    applyFilters();
    updateVisualState();
  };

  /**
   * Select a partner
   * @param {number} partnerIndex - Index of partner
   */
  const selectPartner = (partnerIndex) => {
    if (filterState.selectedPartner === partnerIndex && !filterState.selectedStrategy) {
      // Clicking same partner - clear all filters
      clearAllFilters();
      return;
    }

    filterState.selectedPartner = partnerIndex;
    filterState.selectedStrategy = null;
    
    if (filterState.selectedPBC) {
      filterState.mode = MODES.pbcPartner;
    } else {
      filterState.mode = MODES.partner;
    }
    
    applyFilters();
    updateVisualState();
  };

  /**
   * Select a strategy
   * @param {number} strategyIndex - Index of strategy
   */
  const selectStrategy = (strategyIndex) => {
    if (filterState.selectedStrategy === strategyIndex && !filterState.selectedPartner) {
      // Clicking same strategy - clear all filters
      clearAllFilters();
      return;
    }

    filterState.selectedStrategy = strategyIndex;
    
    // Auto-select the strategy's primary PBC component
    const strategy = strategyList[strategyIndex];
    if (strategy.pbcComponents && strategy.pbcComponents.length > 0) {
      const primaryPBCIndex = strategy.pbcComponents[0];
      filterState.selectedPBC = data.pbcComponents[primaryPBCIndex];
    }
    
    if (filterState.selectedPartner !== null) {
      filterState.mode = MODES.partnerStrategy;
    } else if (filterState.selectedPBC) {
      filterState.mode = MODES.pbcStrategy;
    } else {
      filterState.mode = MODES.strategy;
    }
    
    applyFilters();
    updateVisualState();
  };

  /**
   * Show all strategies for the current PBC component
   */
  const showAllPBCStrategies = () => {
    if (!filterState.selectedPBC) return;
    
    filterState.selectedPartner = null;
    filterState.selectedStrategy = null;
    filterState.mode = MODES.pbc;
    
    applyFilters();
    updateVisualState();
  };

  /**
   * Show all partners for the current PBC component
   */
  const showAllPBCPartners = () => {
    if (!filterState.selectedPBC) return;
    
    filterState.selectedPartner = null;
    filterState.selectedStrategy = null;
    filterState.mode = MODES.pbc;
    
    applyFilters();
    updateVisualState();
  };

  /**
   * Show all strategies for the current partner
   */
  const showAllPartnerStrategies = () => {
    if (filterState.selectedPartner === null) return;
    
    filterState.selectedPBC = null;
    filterState.selectedStrategy = null;
    filterState.mode = MODES.partner;
    
    applyFilters();
    updateVisualState();
  };

  /**
   * Clear all filters and return to overview mode
   */
  const clearAllFilters = () => {
    filterState = {
      selectedPBC: null,
      selectedPartner: null,
      selectedStrategy: null,
      mode: MODES.overview
    };
    
    // Show all items in all columns
    Object.values(columnIds).forEach(columnId => {
      const column = document.getElementById(columnId);
      if (!column) return;
      
      const children = column.getElementsByClassName(`${namespace}-data-wrapper`);
      [...children].forEach(child => {
        child.style.display = 'block';
      });
    });
    
    updateVisualState();
  };

  // ========================================
  // GETTERS
  // ========================================

  const getFilterState = () => ({ ...filterState });
  const isStrategySelected = () => filterState.selectedStrategy !== null;
  const isPartnerSelected = () => filterState.selectedPartner !== null;
  const isPBCSelected = () => filterState.selectedPBC !== null;

  // ========================================
  // PUBLIC API
  // ========================================

  return {
    init,
    selectPBC,
    selectPartner,
    selectStrategy,
    showAllPBCStrategies,
    showAllPBCPartners,
    showAllPartnerStrategies,
    clearAllFilters,
    getFilterState,
    isStrategySelected,
    isPartnerSelected,
    isPBCSelected,
    applyFilters,
    updateVisualState
  };

})(); 