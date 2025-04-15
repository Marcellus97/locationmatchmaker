function updateValue(id) {
  const slider = document.getElementById(id);
  const display = document.getElementById(id + "-value");
  display.textContent = slider.value;
}

// Set initial display values
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

/*  D3.JS MAP CODE */
var margin = 20;
var width = 1200;
var height = 800;
var path = d3.geoPath();

var countyStatesPromise = d3.json("/static/data/counties-albers-10m.json");
var ranksPromise = d3.csv("/static/data/gold/final_data_rank.csv");

Promise.all([countyStatesPromise, ranksPromise]).then(ready);

function ready(values) {
  var countryStates = values[0];
  var ranks = values[1];
  console.log("ranks ", values[1]);
  createMap(countryStates, ranks);
}

function createMap(countryStates, ranks) {
  console.log(countryStates);
  // testing this for filtering
  // clone the object
  var filtered = structuredClone(countryStates);
  filtered.objects.counties.geometries =
    filtered.objects.counties.geometries.filter(
      (d) => d.properties.name == "Butler"
    );

  let countyNames = countryStates.objects.counties.geometries.map(
    (d) =>
      // return {
      //   id : d[""],
      // name : d.properties.name.toLowerCase()

      // turns "Crème Brûlée" into "Creme Brulee"
      d.properties.name
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
    // }
  );
  let missing = [];

  // normalize string accents
  //https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
  console.log(ranks);
  console.log(countyNames);
  ranks.forEach((r) => {
    let name = r["COUNTY_Name"].toLowerCase();
    let name2 = r["COUNTY"].toLowerCase();
    if (!countyNames.includes(name) && !countyNames.includes(name2)) {
      missing.push(r);
    }
  });
  console.log(missing);

  var svg = d3
    .select("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  svg
    .append("g")
    .selectAll("path")
    .data(
      topojson.feature(countryStates, countryStates.objects.counties).features
    )
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", "#ddd")
    .exit();

  svg
    .append("g")
    .selectAll("path")
    .data(topojson.feature(filtered, filtered.objects.counties).features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "#afa")
    .attr("stroke", "black")
    .exit();

  svg
    .append("g")
    .selectAll("path")
    .data(
      topojson.feature(countryStates, countryStates.objects.states).features
    )
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", "black")
    .exit();
}
