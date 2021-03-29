function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var samplesData = data.samples;
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var samplesFilter = samplesData.filter(sampleObj => sampleObj.id == sample);
    //  5. Create a variable that holds the first sample in the array.
    var sampleSelect = samplesFilter[0];
    
    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otuDirct = []
    for (index in sampleSelect.otu_ids) {
      otuDirct.push({
        id: sampleSelect.otu_ids[index],
        label: sampleSelect.otu_labels[index],
        sample_value: sampleSelect.sample_values[index]
      });
    }

    otuIds = otuDirct.map(ident => ident.id);
    otuValues = otuDirct.map(ident => ident.sample_value);
    otuLabel = otuDirct.map(ident => ident.label);


    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 
    var otuSorted = otuDirct.sort((a,b) => a.sample_value - b.sample_value).reverse();
    console.log(otuSorted)

    var topOtuIds = otuSorted.slice(0,10);

    // convert values for each Otu into a string

    var yticks = topOtuIds.map(ident => "OTU " + ident.id);

    // 8. Create the trace for the bar chart. 
    var barTrace = {
      x: topOtuIds.map(ident => ident.sample_value).reverse(),
      y: yticks,
      text: topOtuIds.map(ident => ident.label),
      orientation: "h",
      type: "bar"
    };
    var barData = [barTrace];

    // 9. Create the layout for the bar chart. 
    var barLayout = {
      title: "Top Ten Bacteria Cultures Found"
    };

    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout);

// 1. Create the trace for the bubble chart.
    var bubTrace = {
      x: otuDirct.map(ident => ident.id),
      y: otuDirct.map(ident => ident.sample_value),
      text: otuDirct.map(ident => ident.label),
      mode: 'markers',
      marker: {
        color: otuIds,
        colorscale: 'Earth',
        size: otuValues,
        sizeref: .05,
        sizemode: 'area'
      }
    };
    console.log(otuIds)
    var bubbleData = [bubTrace];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: "Bacteria Cultures Per Sample",
      showlegend: false,
      hovermode: "closest",
      xaxis: {title: "OTU ID"}
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout)

    sampleMetadata = data.metadata.filter(ident => ident.id == sample);
    sampleWfreq = sampleMetadata.map(ident => parseFloat(ident.wfreq));

    console.log(sampleMetadata.map(ident => ident.wfreq));
    console.log(sampleWfreq)
    // 4. Create the trace for the gauge chart.
    var gaugeData = [{
      type: "indicator",
      domain: {x: [0,1], y: [0,1]},
      value: parseFloat(sampleWfreq),
      title: {text : "<b>Belly Button Washing Frequency</b>:<br> Scrubs per Week"},
      mode: "gauge+number",
      gauge: {
        axis: {range: [0,10]},
        steps: [
          {range: [0, 2], color: "red"},
          {range: [2, 4], color: "orange"},
          {range: [4, 6], color: "yellow"},
          {range: [6, 8], color: "lightgreen"},
          {range: [8, 10], color: "green"}
        ],
        bar: {color: "black"}
      }
    }
  ];
    
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
      width: 600, height: 450, margin: {t: 0, b: 0}
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot('gauge', gaugeData, gaugeLayout)
  });
}
