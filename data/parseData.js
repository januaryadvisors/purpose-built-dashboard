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
      row.Strategy,
      {
        details: row.Paragraph,
        outputs: arrayify(row.Output).map(output => outputs.indexOf(output)),
        immediateOutputs: arrayify(row['Immediate Outcomes <1year']).map(output =>
          immediateOutputs.indexOf(output)
        ),
        intermediateOutputs: arrayify(row['Intermediate Outcomes 1-5 years']).map(output =>
          intermediateOutputs.indexOf(output)
        ),
        longTermOutputs: arrayify(row['Long-term Outcomes (5-10+ years)']).map(output =>
          longTermOutputs.indexOf(output)
        ),
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

  console.log(data);
  console.log(research);

  fs.writeFileSync('../dist/data.json', JSON.stringify(data), 'utf8');
};

parse();
