window.onload = async function () {
  const namespace = 'pilot-data-dashboard';

  const dashboard = document.getElementById(namespace);

  const headersWrapper = document.createElement('div');
  headersWrapper.id = `${namespace}-header-wrapper`;
  dashboard.appendChild(headersWrapper);

  const columnsWrapper = document.createElement('div');
  columnsWrapper.id = `${namespace}-columns-wrapper`;
  dashboard.appendChild(columnsWrapper);

  const inputId = `${namespace}-input`;
  const strategiesId = `${namespace}-strategies`;
  const outputsId = `${namespace}-outputs`;
  const immediateOutputsId = `${namespace}-immediate-outputs`;
  const intermediateOutputsId = `${namespace}-intermediate-outputs`;
  const longTermOutputsId = `${namespace}-long-term-outputs`;

  const modalId = `${namespace}-modal`;
  const textClass = `${namespace}-datum`;

  const brandGradient = ['#f7dea0', '#fdcd6c', '#fdbc4a', '#fcab32', '#f9991f', '#f78600'];
  const brandBlack = '#222323';

  const columns = {
    [inputId]: {
      color: brandBlack,
      headerBackground: brandGradient[0],
      headerColor: brandBlack,
      label: 'Input',
    },
    [strategiesId]: {
      color: brandBlack,
      headerBackground: brandGradient[1],
      headerColor: brandBlack,
      label: 'Strategies',
    },
    [outputsId]: {
      color: brandBlack,
      headerBackground: brandGradient[2],
      headerColor: brandBlack,
      label: 'Outputs',
    },
    [immediateOutputsId]: {
      color: brandBlack,
      headerBackground: brandGradient[3],
      headerColor: brandBlack,
      label: 'Immediate Outputs',
    },
    [intermediateOutputsId]: {
      color: brandBlack,
      headerBackground: brandGradient[4],
      headerColor: brandBlack,
      label: 'Intermediate Outputs',
    },
    [longTermOutputsId]: {
      color: brandBlack,
      headerBackground: brandGradient[5],
      headerColor: brandBlack,
      label: 'Long Term Outputs',
    },
  };

  const modal = document.createElement('div');
  modal.id = modalId;

  const modalContent = document.createElement('div');
  modalContent.id = `${namespace}-modal-content`;
  modalContent.style.border = `3px solid ${brandGradient[2]}80`;
  modalContent.style.background = '#FFF';
  modal.appendChild(modalContent);

  const closeWrapper = document.createElement('div');
  closeWrapper.id = `${namespace}-close-wrapper`;
  modalContent.appendChild(closeWrapper);

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeWrapper.appendChild(closeButton);

  const modalHeader = document.createElement('div');
  modalHeader.id = `${namespace}-modal-header`;
  modalContent.appendChild(modalHeader);

  const researchWrapper = document.createElement('div');
  modalContent.appendChild(researchWrapper);

  const researchHeader = document.createElement('div');
  researchHeader.innerText = 'Research';
  researchWrapper.appendChild(researchHeader);

  const resarchBody = document.createElement('div');
  researchWrapper.appendChild(resarchBody);

  modal.onclick = () => {
    modal.scrollTop = 0;
    modal.style.display = 'none';
  };
  closeButton.onclick = () => {
    modal.scrollTop = 0;
    modal.style.display = 'none';
  };
  modalContent.onclick = e => e.stopPropagation();
  document.body.appendChild(modal);

  Object.entries(columns).map(([_, { headerBackground, headerColor, label }], i) => {
    const headerEl = document.createElement('div');
    headerEl.className = `${namespace}-header`;
    headersWrapper.appendChild(headerEl);

    const textEl = document.createElement('div');
    textEl.className = `${namespace}-header-text`;
    textEl.innerText = label;
    Object.assign(textEl.style, {
      background: headerBackground,
      color: headerColor,
    });
    headerEl.appendChild(textEl);

    const arrowLeftEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrowLeftEl.setAttribute('width', '12px');
    arrowLeftEl.setAttribute('height', '100%');
    arrowLeftEl.setAttribute('viewBox', '0 0 100 100');
    arrowLeftEl.setAttribute('preserveAspectRatio', 'none');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0,0 100,0 100,100 0,100 100,50 0,0');
    polygon.setAttribute('fill', headerBackground);

    arrowLeftEl.appendChild(polygon);

    Object.assign(arrowLeftEl.style, {
      position: 'absolute',
    });
    headerEl.appendChild(arrowLeftEl);

    if (i !== Object.entries(columns).length - 1) {
      const arrowRightEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      arrowRightEl.setAttribute('width', '12px');
      arrowRightEl.setAttribute('height', '100%');
      arrowRightEl.setAttribute('viewBox', '0 0 100 100');
      arrowRightEl.setAttribute('preserveAspectRatio', 'none');
      const polygon2 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon2.setAttribute('points', '0,0 100,50 0,100 0,0');
      polygon2.setAttribute('fill', headerBackground);

      arrowRightEl.appendChild(polygon2);

      Object.assign(arrowRightEl.style, {
        position: 'absolute',
        left: '100%',
      });
      headerEl.appendChild(arrowRightEl);
    }

    return headerEl;
  });

  const columnEls = Object.entries(columns).map(([id, { headerBackground, color }]) => {
    const columnWrapper = document.createElement('div');
    columnWrapper.id = id;
    columnWrapper.className = `${namespace}-column-wrapper`;
    columnWrapper.style.color = color;
    columnWrapper.style.border = `2px solid ${headerBackground}80`;
    columnWrapper.style.background = `${headerBackground}1A`;
    columnsWrapper.appendChild(columnWrapper);
    return columnWrapper;
  });

  let data = null;
  try {
    const dataRaw = await fetch('./assets/data.json');
    data = await dataRaw.json();
  } catch (error) {
    return;
  }

  const strategyValues = Object.values(data.strategies);

  const addDataToColumn = (data, columnId, handleMouseenter, handleMouseleave, handleClick) => {
    data.forEach((datum, i) => {
      const wrapperDiv = document.createElement('div');
      document.getElementById(columnId).appendChild(wrapperDiv);

      const dataDiv = document.createElement('div');
      dataDiv.className = `${namespace}-data-wrapper`;
      Object.assign(dataDiv.style, {
        borderBottom: `2px solid ${columns[columnId].headerBackground}80`,
      });
      wrapperDiv.appendChild(dataDiv);

      const img = document.createElement('img');
      img.src = './assets/brush.svg';
      img.className = `${namespace}-bg-img`;
      dataDiv.appendChild(img);

      if (columnId === strategiesId) {
        const button = document.createElement('button');
        button.className = `${textClass} ${namespace}-button`;
        button.textContent = datum;
        Object.assign(button.style, {
          textDecorationColor: `${brandGradient[1]}`,
        });
        dataDiv.appendChild(button);
      } else {
        const textDiv = document.createElement('div');
        textDiv.className = textClass;
        dataDiv.appendChild(textDiv);
        textDiv.innerText = datum;
      }

      if (handleMouseenter) {
        dataDiv.style.cursor = 'pointer';
        dataDiv.onmouseenter = handleMouseenter(i);
      }
      if (handleMouseleave) {
        dataDiv.onmouseleave = handleMouseleave;
      }
      if (handleClick) {
        dataDiv.onclick = handleClick(i);
      }
    });
  };

  const highlightColumn = (data, columnKey, columnId) => {
    const highlightIndices = data[columnKey];
    const highlightColumn = document.getElementById(columnId);
    const columnChildren = highlightColumn.getElementsByTagName('img');
    highlightIndices.forEach(idx => {
      const highlightImg = columnChildren[idx];
      Object.assign(highlightImg.style, {
        visibility: 'visible',
      });
    });
  };

  const removeColumnHighlights = () => {
    columnEls.forEach(columnEl => {
      const children = [...columnEl.getElementsByTagName('img')];
      children.forEach(child => {
        Object.assign(child.style, { visibility: 'hidden' });
      });
    });
  };

  addDataToColumn(data.inputs, inputId);
  addDataToColumn(
    Object.keys(data.strategies),
    strategiesId,
    i => () => {
      highlightColumn(strategyValues[i], 'outputs', outputsId);
      highlightColumn(strategyValues[i], 'immediateOutputs', immediateOutputsId);
      highlightColumn(strategyValues[i], 'intermediateOutputs', intermediateOutputsId);
    },
    removeColumnHighlights,
    i => () => {
      document.getElementById(modalId);
      modalHeader.innerText = strategyValues[i].label;
      modal.style.display = 'block';

      [...researchWrapper.children].forEach((c, i) => i !== 0 && c.remove());

      strategyValues[i].research.forEach(r => {
        const relatedOutcome = r.relatedOutcome;
        const citationLink = r.citationLink;
        const citationLinkText = r.citationLinkText;
        const citation = r.citation;
        const researchEl = document.createElement('div');
        researchEl.className = `${namespace}-research-item`;
        const researchHeader = document.createElement('div');
        researchHeader.innerText = `Related Outcome: ${relatedOutcome}`;
        researchHeader.className = `${namespace}-research-item-header`;
        const researchCitation = document.createElement('div');
        researchCitation.innerText = citation;

        const researchLink = document.createElement('a');
        researchLink.setAttribute('href', citationLink);
        researchLink.innerText = citationLinkText;
        researchLink.setAttribute('rel', 'noopener noreferrer');
        researchLink.setAttribute('target', '_blank');
        researchEl.appendChild(researchHeader);
        researchEl.appendChild(researchCitation);
        researchEl.appendChild(researchLink);
        researchWrapper.appendChild(researchEl);
      });
      resarchBody;
    }
  );
  addDataToColumn(data.outputs, outputsId);
  addDataToColumn(data.immediateOutputs, immediateOutputsId);
  addDataToColumn(data.intermediateOutputs, intermediateOutputsId);
  addDataToColumn(data.longTermOutputs, longTermOutputsId);
};
