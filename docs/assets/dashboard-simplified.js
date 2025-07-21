window.onload = async function () {
  
  // ========================================
  // CONSTANTS & CONFIGURATION  
  // ========================================
  
  const NAMESPACE = 'momentum-dashboard';
  const dashboard = document.getElementById(NAMESPACE);
  
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
  
  const TEXT_CLASS = `${NAMESPACE}-datum`;
  let data = null;
  let strategyList = [];

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  
  const createElement = (parent, type, id, className) => {
    const el = document.createElement(type);
    if (id) el.id = `${NAMESPACE}-${id}`;
    if (className) el.className = `${NAMESPACE}-${className}`;
    parent.appendChild(el);
    return el;
  };

  // ========================================
  // UI SETUP (same as before...)
  // ========================================
  
  const dashboardWrapper = createElement(dashboard, 'div', 'body-wrapper');
  const headersWrapper = createElement(dashboardWrapper, 'div', 'header-wrapper');
  const columnsWrapper = createElement(dashboardWrapper, 'div', 'columns-wrapper');

  // Create columns, headers, modal, etc. (same as before)
  // ... [UI creation code] ...

  // ========================================
  // DATA LOADING
  // ========================================
  
  try {
    data = await window.DataLoader.loadData(dashboardWrapper, createElement, NAMESPACE);
    strategyList = Object.values(data.strategies);
  } catch (error) {
    console.error('Failed to load data:', error);
    return;
  }

  // ========================================
  // INITIALIZE FILTER SYSTEM
  // ========================================
  
  window.FilterSystem.init({
    namespace: NAMESPACE,
    columnIds: COLUMN_IDS,
    data: data,
    strategyList: strategyList
  });

  // ========================================
  // EVENT HANDLERS (MUCH SIMPLER!)
  // ========================================

  /**
   * Create partner click handler - now just one line!
   */
  const createPartnerClickHandler = (partnerIndex) => () => {
    window.FilterSystem.selectPartner(partnerIndex);
  };

  /**
   * Create strategy click handler - now just one line!
   */
  const createStrategyClickHandler = (strategyIndex) => () => {
    window.FilterSystem.selectStrategy(strategyIndex);
  };

  /**
   * Create PBC click handler - now just one line!
   */
  const createPBCClickHandler = (pbcComponent) => () => {
    window.FilterSystem.selectPBC(pbcComponent);
  };

  // ========================================
  // NAVIGATION BUTTONS (SIMPLIFIED!)
  // ========================================
  
  const seeAllButton = document.createElement('button');
  seeAllButton.className = `${NAMESPACE}-see-all`;
  seeAllButton.textContent = 'View All';
  seeAllButton.onclick = () => window.FilterSystem.clearAllFilters();

  const showAllPBCStrategiesButton = document.createElement('button');
  showAllPBCStrategiesButton.className = `${NAMESPACE}-see-all`;
  showAllPBCStrategiesButton.textContent = 'Show All PBC Strategies';
  showAllPBCStrategiesButton.onclick = () => window.FilterSystem.showAllPBCStrategies();

  const showAllPBCPartnersButton = document.createElement('button');
  showAllPBCPartnersButton.className = `${NAMESPACE}-see-all`;
  showAllPBCPartnersButton.textContent = 'Show All PBC Partners';
  showAllPBCPartnersButton.onclick = () => window.FilterSystem.showAllPBCPartners();

  const showAllPartnerStrategiesButton = document.createElement('button');
  showAllPartnerStrategiesButton.className = `${NAMESPACE}-see-all`;
  showAllPartnerStrategiesButton.textContent = 'Show Partner Strategies';
  showAllPartnerStrategiesButton.onclick = () => window.FilterSystem.showAllPartnerStrategies();

  // ========================================
  // POPULATE COLUMNS (same as before)
  // ========================================
  
  const populateColumn = (data, columnId, tooltips) => {
    data.forEach((datum, i) => {
      const wrapperDiv = document.createElement('div');
      document.getElementById(columnId).appendChild(wrapperDiv);

      const dataDiv = document.createElement('div');
      dataDiv.className = `${NAMESPACE}-data-wrapper`;
      wrapperDiv.appendChild(dataDiv);

      if (columnId === COLUMN_IDS.strategies) {
        // Strategy items
        const button = document.createElement('button');
        button.className = `${TEXT_CLASS} ${NAMESPACE}-button`;
        button.textContent = datum;
        button.onclick = createStrategyClickHandler(i); // ← ONE LINE!
        dataDiv.appendChild(button);

      } else if (columnId === COLUMN_IDS.partners) {
        // Partner items  
        const textDiv = document.createElement('div');
        textDiv.className = TEXT_CLASS;
        textDiv.innerText = datum;
        dataDiv.onclick = createPartnerClickHandler(i); // ← ONE LINE!
        dataDiv.appendChild(textDiv);

      } else {
        // Regular items
        const textDiv = document.createElement('div');
        textDiv.className = TEXT_CLASS;
        textDiv.innerText = datum;
        dataDiv.appendChild(textDiv);
      }
    });
  };

  // Populate all columns
  populateColumn(data.pbcComponents, COLUMN_IDS.pbcComponents);
  populateColumn(data.partners, COLUMN_IDS.partners);  
  populateColumn(Object.keys(data.strategies), COLUMN_IDS.strategies);
  populateColumn(data.outputs, COLUMN_IDS.outputs);
  populateColumn(data.immediateOutputs, COLUMN_IDS.immediateOutputs);
  populateColumn(data.intermediateOutputs, COLUMN_IDS.intermediateOutputs);
  populateColumn(data.longTermOutputs, COLUMN_IDS.longTermOutputs);

  // ========================================
  // INITIAL SETUP
  // ========================================
  
  // Auto-select first PBC component
  setTimeout(() => {
    if (data.pbcComponents && data.pbcComponents.length > 0) {
      window.FilterSystem.selectPBC(data.pbcComponents[0]); // ← ONE LINE!
    }
  }, 100);

}; 