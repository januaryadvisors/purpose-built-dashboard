const fs = require('fs');

const parse = async () => {
  const d3dsv = await import('d3-dsv');

  const modelRaw = fs.readFileSync('./logic_model.csv', { encoding: 'utf8' });
  const researchRaw = fs.readFileSync('./research.csv', { encoding: 'utf8' });
  const headerTootipsRaw = fs.readFileSync('./header_tooltips.csv', { encoding: 'utf8' });
  const inputTooltipsRaw = fs.readFileSync('./input_tooltips.csv', { encoding: 'utf8' });

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
  const headerTooltips = d3dsv.csvParseRows(headerTootipsRaw);
  const inputTooltips = d3dsv.csvParse(inputTooltipsRaw);

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
        details: row['Paragraph description'],
        outputs: arrayify(row.Output).map(output => outputs.indexOf(output)),
        immediateOutputs: arrayify(row['Immediate Outcomes <1year']).map(output =>
          immediateOutputs.indexOf(output)
        ),
        intermediateOutputs: arrayify(row['Intermediate Outcomes 1-5 years']).map(output =>
          intermediateOutputs.indexOf(output)
        ),
        // All long term outputs are associated with every strategy
        longTermOutputs: longTermOutputs.map((_, i) => i),
        research: [],
      },
    ])
  );

  const data = {
    headerTooltips: headerTooltips.map(t => t[1]),
    inputs,
    inputTooltips: inputs.map(input => inputTooltips.find(t => t[0] === input)[1]),
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
    const relatedOutcome = r['Related Outcome'].trim();
    const researchDatum = {
      citation: citationSanitized[0],
      citationLinkText: 'http' + citationSanitized[1],
      citationLink: r['Citation Link'],
      relatedOutcomes: [relatedOutcome],
    };
    const match = data.strategies[researchStrategy].research.find(
      rs => rs.citation === researchDatum.citation
    );
    if (!match) {
      data.strategies[researchStrategy].research.push(researchDatum);
    } else {
      if (!match.relatedOutcomes.includes(relatedOutcome)) {
        match.relatedOutcomes.push(relatedOutcome);
      }
    }
  });

  Object.entries(data.strategies).forEach(([_, strategy], i) => {
    // Alphabetize research ignoring any leading smartquotes
    strategy.research.sort((a, b) => {
      return a.citation.replace('“', '').localeCompare(b.citation.replace('“', ''));
    });
  });

  fs.writeFileSync('../dist/assets/data.json', JSON.stringify(data), 'utf8');
};

parse();
