window.onload = async function () {
  console.log('loaded');
  const dashboard = document.getElementById('pilot-data-dashboard');
  dashboard.style.fontFamily = "'Helvetica neue', Helvetica, sans-serif";

  const headersWrapper = document.createElement('div');
  headersWrapper.style.display = 'flex';
  headersWrapper.style.gap = '12px';
  dashboard.appendChild(headersWrapper);

  const columnsWrapper = document.createElement('div');
  columnsWrapper.style.display = 'flex';
  columnsWrapper.style.gap = '12px';
  dashboard.appendChild(columnsWrapper);

  const namespace = 'pilot-data-dashboard';

  const inputId = `${namespace}-input`;
  const strategiesId = `${namespace}-strategies`;
  const outputsId = `${namespace}-outputs`;
  const immediateOutputsId = `${namespace}-immediate-outputs`;
  const intermediateOutputsId = `${namespace}-intermediate-outputs`;
  const longTermOutputsId = `${namespace}-long-term-outputs`;

  const textClass = `${namespace}-datum`;

  const lightOrange = '#FFE7CC';
  const lightYellow = '#FEECBD';
  const brandOrange = '#F89728';
  const brandYellow = '#FFC425';
  const brandBlack = '#222323';
  const highlightColor = brandOrange;

  const columns = {
    [inputId]: {
      background: lightYellow,
      color: brandBlack,
      headerBackground: brandYellow,
      headerColor: brandBlack,
      label: 'Input',
    },
    [strategiesId]: {
      background: lightYellow,
      color: brandBlack,
      headerBackground: brandYellow,
      headerColor: brandBlack,
      label: 'Strategies',
    },
    [outputsId]: {
      background: lightOrange,
      color: brandBlack,
      headerBackground: brandOrange,
      headerColor: '#FFF',
      label: 'Outputs',
    },
    [immediateOutputsId]: {
      background: lightOrange,
      color: brandBlack,
      headerBackground: brandOrange,
      headerColor: '#FFF',
      label: 'Immediate Outputs',
    },
    [intermediateOutputsId]: {
      background: lightOrange,
      color: brandBlack,
      headerBackground: brandOrange,
      headerColor: '#FFF',
      label: 'Intermediate Outputs',
    },
    [longTermOutputsId]: {
      background: lightOrange,
      color: brandBlack,
      headerBackground: brandOrange,
      headerColor: '#FFF',
      label: 'Long Term Outputs',
    },
  };

  Object.entries(columns).map(([_, { headerBackground, headerColor, label }], i) => {
    const headerEl = document.createElement('div');
    Object.assign(headerEl.style, {
      alignItems: 'center',
      display: 'flex',
      margin: '0 0 12px 0',
      position: 'relative',
      width: '20%',
    });
    headersWrapper.appendChild(headerEl);

    if (i !== 0) {
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
    }

    const textEl = document.createElement('div');
    textEl.innerHTML = label;
    Object.assign(textEl.style, {
      alignItems: 'center',
      alignSelf: 'stretch',
      background: headerBackground,
      color: headerColor,
      display: 'flex',
      flexGrow: 1,
      fontSize: '16px',
      fontWeight: 'semibold',
      margin: i === 0 ? '0' : '0 0 0 12px',
      padding: '12px 12px 12px 14px',
      textTransform: 'uppercase',
    });
    headerEl.appendChild(textEl);

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

  const columnEls = Object.entries(columns).map(([id, { background, color }]) => {
    const columnWrapper = document.createElement('div');
    columnWrapper.id = id;
    columnWrapper.style.width = '20%';
    columnWrapper.style.background = background;
    columnWrapper.style.color = color;
    columnWrapper.style.fontSize = '16px';
    columnWrapper.style.lineHeight = '22px';
    columnsWrapper.appendChild(columnWrapper);
    return columnWrapper;
  });

  const dataRaw = await fetch('./data.json');
  const data = await dataRaw.json();

  const strategyValues = Object.values(data.strategies);

  const addDataToColumn = (data, columnId, handleMouseenter, handleMouseleave) => {
    data.forEach((datum, i) => {
      const wrapperDiv = document.createElement('div');
      document.getElementById(columnId).appendChild(wrapperDiv);

      const dataDiv = document.createElement('div');
      Object.assign(dataDiv.style, {
        borderBottom: `2px dotted ${columns[columnId].headerBackground}`,
        margin: '0 6px',
      });
      wrapperDiv.appendChild(dataDiv);

      const textDiv = document.createElement('div');
      textDiv.className = textClass;
      Object.assign(textDiv.style, {
        borderRadius: '2px',
        padding: '6px',
        margin: '6px 0',
      });
      dataDiv.appendChild(textDiv);

      textDiv.innerHTML = datum;
      if (handleMouseenter) {
        dataDiv.style.cursor = 'pointer';
        dataDiv.onmouseenter = handleMouseenter(i);
      }
      if (handleMouseleave) {
        dataDiv.onmouseleave = handleMouseleave;
      }
    });
  };

  const highlightColumn = (data, columnKey, columnId) => {
    const highlightIndices = data[columnKey];
    const highlightColumn = document.getElementById(columnId);
    const columnChildren = highlightColumn.getElementsByClassName(textClass);
    highlightIndices.forEach(idx => {
      Object.assign(columnChildren[idx].style, { background: highlightColor, color: '#FFF' });
    });
  };

  const removeColumnHighlights = () => {
    columnEls.forEach(columnEl => {
      const children = [...columnEl.getElementsByClassName(textClass)];
      children.forEach(child => {
        Object.assign(child.style, { background: 'transparent', color: brandBlack });
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
      highlightColumn(strategyValues[i], 'longTermOutputs', longTermOutputsId);
    },
    removeColumnHighlights
  );
  addDataToColumn(data.outputs, outputsId);
  addDataToColumn(data.immediateOutputs, immediateOutputsId);
  addDataToColumn(data.intermediateOutputs, intermediateOutputsId);
  addDataToColumn(data.longTermOutputs, longTermOutputsId);

  console.log(data);
};
