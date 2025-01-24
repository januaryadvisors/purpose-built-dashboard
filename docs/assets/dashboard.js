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
  const strategiesId = `${namespace}-strategies`;
  const outputsId = `${namespace}-outputs`;
  const immediateOutputsId = `${namespace}-immediate-outputs`;
  const intermediateOutputsId = `${namespace}-intermediate-outputs`;
  const longTermOutputsId = `${namespace}-long-term-outputs`;

  const brandGradient = ['#f7dea0', '#fdcd6c', '#fdbc4a', '#fcab32', '#f9991f', '#f78600'];

  const dashboardWrapper = addElement(dashboard, 'div', 'body-wrapper');
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
    [strategiesId]: {
      columnColor: brandGradient[1],
      label: 'Strategies',
    },
    [outputsId]: {
      columnColor: brandGradient[2],
      label: 'Outputs',
    },
    [immediateOutputsId]: {
      columnColor: brandGradient[3],
      label: 'Immediate Outcomes',
    },
    [intermediateOutputsId]: {
      columnColor: brandGradient[4],
      label: 'Intermediate Outcomes',
    },
    [longTermOutputsId]: {
      columnColor: brandGradient[5],
      label: 'Long-Term Outcomes',
    },
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
    const dataRaw = await fetch('./assets/data.json');
    data = await dataRaw.json();
    console.log(data);
  } catch (error) {
    return;
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

    // Only show the relateed outcomes
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
      }
    });
  };

  const strategiesColumn = document.getElementById(strategiesId);
  const seeAllButton = document.createElement('button');

  addDataToColumn(data.inputs, inputId, data.inputTooltips);
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
