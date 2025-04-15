// Update the displayed slider value.
function updateValue(id) {
    const slider = document.getElementById(id);
    const display = document.getElementById(id + "-value");
    display.textContent = slider.value;
  }
  
  // When the page loads, set all slider displays:
  window.onload = function () {
    const ids = [
      "walkability",
      "density",
      "warm-weather",
      "rain",
      "housing-price",
      "job-prospects",
    ];
    ids.forEach((id) => updateValue(id));
  };
  
  /* =====================
     D3 + Map Code
  ===================== */
  
  const margin = 20;
  const width = 1200;
  const height = 800;
  const path = d3.geoPath();
  
  // Example file references for your data
  const countyStatesPromise = d3.json("./counties-albers-10m.json");
  const ranksPromise = d3.csv("../data/gold/final_data_rank.csv"); 
  
  Promise.all([countyStatesPromise, ranksPromise])
  .then(ready)
  .catch((error) => {
    console.error("Error loading data:", error);
  });
  
  function ready([countryStates, ranks]) {
    console.log("ranks", ranks);
    createMap(countryStates, ranks);
  }
  
  function createMap(countryStates, ranks) {
    console.log(countryStates);
  
    // Example of filtering
    const filtered = structuredClone(countryStates);
    filtered.objects.counties.geometries = filtered.objects.counties.geometries.filter(
      (d) => d.properties.name === "Butler"
    );
  
    // Doing some “missing” check
    let countyNames = countryStates.objects.counties.geometries.map((d) =>
      d.properties.name
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
    );
    let missing = [];
  
    ranks.forEach((r) => {
      let name = r["COUNTY_Name"].toLowerCase();
      let name2 = r["COUNTY"].toLowerCase();
      if (!countyNames.includes(name) && !countyNames.includes(name2)) {
        missing.push(r);
      }
    });
    console.log("Missing counties in data: ", missing);
  
    // Setup SVG
    const svg = d3
      .select("#choropleth")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", "100%")
      .style("height", "auto");
  
    // Counties: default fill
    svg
      .append("g")
      .selectAll("path")
      .data(topojson.feature(countryStates, countryStates.objects.counties).features)
      .join("path")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#ddd");
  
    // Filtered example fill
    svg
      .append("g")
      .selectAll("path")
      .data(topojson.feature(filtered, filtered.objects.counties).features)
      .join("path")
      .attr("d", path)
      .attr("fill", "#afa")
      .attr("stroke", "black");
  
    // State outlines
    svg
      .append("g")
      .selectAll("path")
      .data(topojson.feature(countryStates, countryStates.objects.states).features)
      .join("path")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "black");
  }
