const fs = require('fs');

const parse = async () => {
  const d3dsv = await import('d3-dsv');

  const modelRaw = fs.readFileSync('./logic_model.csv', { encoding: 'utf8' });
  const researchRaw = fs.readFileSync('./research.csv', { encoding: 'utf8' });

  const arrayify = multilineRow => {
    return multilineRow
      .split('\n')
      .map(item => item.trim())
      .filter(item => item);
  };

  const getUnique = (data, key) => {
    return [...new Set(data.map(row => arrayify(row[key])).flat())];
  };

  const model = d3dsv.csvParse(modelRaw);
  const research = d3dsv.csvParse(researchRaw);

  const inputs = getUnique(model, 'Inputs');
  const outputs = getUnique(model, 'Output');
  const immediateOutputs = getUnique(model, 'Immediate Outcomes <1year');
  const intermediateOutputs = getUnique(model, 'Intermediate Outcomes 1-5 years');
  const longTermOutputs = getUnique(model, 'Long-term Outcomes (5-10+ years)');

  const strategies = Object.fromEntries(
    model.map(row => [
      row.Strategy.trim(),
      {
        label: row.Strategy,
        details: row.Paragraph,
        outputs: arrayify(row.Output).map(output => outputs.indexOf(output)),
        immediateOutputs: arrayify(row['Immediate Outcomes <1year']).map(output =>
          immediateOutputs.indexOf(output)
        ),
        intermediateOutputs: arrayify(row['Intermediate Outcomes 1-5 years']).map(output =>
          intermediateOutputs.indexOf(output)
        ),
        research: [],
      },
    ])
  );

  const data = {
    inputs,
    strategies,
    outputs,
    immediateOutputs,
    intermediateOutputs,
    longTermOutputs,
  };

  research.forEach(r => {
    const researchStrategy = r.Strategy.trim();
    if (!data.strategies[researchStrategy]) {
      console.log(`No strategy found for ${researchStrategy}`);
      return;
    }
    const citationSanitized = r['Citation'].split('http');
    if (citationSanitized.length !== 2) {
      console.log('Error processing citation', r['Citation']);
    }
    const researchDatum = {
      citation: citationSanitized[0],
      citationLinkText: 'http' + citationSanitized[1],
      citationLink: r['Citation Link'],
      relatedOutcome: r['Related Outcome'],
    };
    data.strategies[researchStrategy].research.push(researchDatum);
  });

  fs.writeFileSync('../dist/assets/data.json', JSON.stringify(data), 'utf8');
};

parse();
