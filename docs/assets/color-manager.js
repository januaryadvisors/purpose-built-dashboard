// Color management functionality for the dashboard
window.ColorManager = (function() {

  // PBC Component color palette - expanded to support more components
  const pbcColorPalette = [
    '#E55525', // Blue (Economic Vitality)
    '#C49730', // Green (Education)
    '#2A5384', // Orange/Peach (Community Vibrancy)
    '#582D60', // Purple (fourth component)
    '#F2D480', // Yellow (fifth component if needed)
    '#8FB8C5', // Light Blue (sixth component if needed)
  ];

  // Original brand gradient - stored for resetting
  const originalBrandGradient = ['#A8A8A8', '#D1E9E6', '#92E2DA', '#01A997', '#006C69', '#3DAF49', '#207429'];
  
  // Current brand gradient - will be modified based on selected PBC component
  let brandGradient = [...originalBrandGradient];

  /*==============================*/
  // Function to get PBC Component color dynamically
  /*==============================*/
  const getPBCColor = (pbcComponent, data) => {
    if (!data || !data.pbcComponents) {
      return pbcColorPalette[0]; // Default to first color
    }
    // Find the index of this PBC component in the data array
    const componentIndex = data.pbcComponents.indexOf(pbcComponent);
    return pbcColorPalette[componentIndex];
  };

  /*==============================*/
  // Function to generate gradient colors based on a base PBC component color
  /*==============================*/
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

  /*==============================*/
  // Function to update all UI elements with the new brand gradient
  /*==============================*/
  const updateBrandGradient = (newGradient, namespace, columnIds, columns) => {
    brandGradient = [...newGradient];
    
    // Update column colors in the columns object
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
      };

  // Function to get the current brand gradient
  const getCurrentBrandGradient = () => {
    return [...brandGradient];
  };

  // Function to reset to original brand gradient
  const resetToOriginalGradient = () => {
    return [...originalBrandGradient];
  };

  // Public API
  return {
    getPBCColor,
    generatePBCGradient,
    updateBrandGradient,
    getCurrentBrandGradient,
    resetToOriginalGradient,
    getOriginalBrandGradient: () => [...originalBrandGradient]
  };
})(); 