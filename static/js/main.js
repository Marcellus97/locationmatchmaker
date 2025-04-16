function updateValue(id) {
  const slider = document.getElementById(id);
  const display = document.getElementById(id + "-value");
  display.textContent = slider.value;
}

// Set initial display values
window.onload = function () {
  const ids = [
    // "walkability",
    // "density",
    // "warm-weather",
    // "rain",
    "housing-price",
    // "job-prospects",
  ];
  ids.forEach((id) => updateValue(id));

  updatedDropDownHtml = "";
  getStates().forEach((s) => {
    let value = s == "--- ALL STATES ---" ? "" : s;
    updatedDropDownHtml += `<option value="${value}">${s}</option>`;
  });
  let dropDown = document.getElementById("stateDropdown");
  dropDown.innerHTML = updatedDropDownHtml;
  dropDown.selectedIndex = 0;
};

/*  D3.JS MAP CODE */
var margin = 20;
var width = 1200;
var height = 800;
var path = d3.geoPath();

var svg = d3
  .select("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", [0, 0, width, height])
  .attr("style", "max-width: 100%; height: auto;");

var countyStatesPromise = d3.json("/static/data/counties-albers-10m.json");
var ranksPromise = d3.csv("/static/data/gold/final_data_rank.csv");

Promise.all([countyStatesPromise, ranksPromise]).then(ready);

function ready(values) {
  var countryStates = values[0];
  createMap(countryStates, []);
}

function createMap(countryStates, ranks) {
  let countyFeatures = topojson.feature(
    countryStates,
    countryStates.objects.counties
  ).features;
  let stateFeatures = topojson.feature(
    countryStates,
    countryStates.objects.states
  ).features;

  svg
    .append("g")
    .selectAll("path")
    .data(countyFeatures)
    .enter()
    .append("path")
    .attr("id", (d) => "county-" + d.id)
    .attr("class", "county county-blank")
    .attr("d", path)
    .attr("fill", "white")
    .attr("stroke", "#ddd")
    .exit();

  svg
    .append("g")
    .selectAll("path")
    .data(stateFeatures)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", "black")
    .exit();
}

const test_data = {
  num_adults: 2,
  num_children: 0,
  "Average Temperature F": 70,
  "Life Expectancy": 80,
  Unemployment_Rate: 4.0,
};

function getUserInput() {
  // clone
  let input = { ...test_data };

  input.state = document.getElementById("stateDropdown").value;

  return input;
}

function getResults() {
  let userInput = getUserInput();
  console.log("getting results");

  const apiPromise = fetch("http://localhost:8080/api/ranking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // replace with userInput
    body: JSON.stringify(userInput),
  }).then((body) => body.json());

  //
  Promise.all([countyStatesPromise, apiPromise]).then((values) => {
    let counties = values[0].objects.counties;
    let ranks = values[1].results;

    // filter counties
    counties = counties.geometries.filter((d) =>
      ranks.some((r) => r.fipscode.toString() === d.id)
    );

    updateMap(counties);
    updateList(ranks);
  });
}

function updateMap(counties) {
  resetMapCounties();
  highlightMapCounties(counties);
}

function highlightMapCounties(counties) {
  let idArray = counties.map((c) => "#county-" + c.id);
  document.querySelectorAll(idArray).forEach((countySvg) => {
    countySvg.setAttribute("class", "county county-highlighted");
    countySvg.setAttribute("fill", "green");
  });
}

function resetMapCounties() {
  document.querySelectorAll(".county-highlighted").forEach((countySvg) => {
    countySvg.setAttribute("class", "county county-blank");
    countySvg.setAttribute("fill", "white");
  });
}

function updateList(ranks) {
  let updatedHtml = "";
  ranks.forEach((r) => {
    updatedHtml += `<li class="top10Item">${r.rank} - ${r.COUNTY} - ${r.STATE}</li>`;
  });
  document.querySelector("#top10List").innerHTML = updatedHtml;
}

function getStates() {
  return [
    "--- ALL STATES ---",
    "ALABAMA",
    "ALASKA",
    "ARIZONA",
    "ARKANSAS",
    "CALIFORNIA",
    "COLORADO",
    "CONNECTICUT",
    "DISTRICT OF COLUMBIA",
    "DELAWARE",
    "FLORIDA",
    "GEORGIA",
    "HAWAII",
    "IDAHO",
    "ILLINOIS",
    "INDIANA",
    "IOWA",
    "KANSAS",
    "KENTUCKY",
    "LOUISIANA",
    "MAINE",
    "MARYLAND",
    "MASSACHUSETTS",
    "MICHIGAN",
    "MINNESOTA",
    "MISSISSIPPI",
    "MISSOURI",
    "MONTANA",
    "NEBRASKA",
    "NEVADA",
    "NEW HAMPSHIRE",
    "NEW JERSEY",
    "NEW MEXICO",
    "NEW YORK",
    "NORTH CAROLINA",
    "NORTH DAKOTA",
    "OHIO",
    "OKLAHOMA",
    "OREGON",
    "PENNSYLVANIA",
    "RHODE ISLAND",
    "SOUTH CAROLINA",
    "SOUTH DAKOTA",
    "TENNESSEE",
    "TEXAS",
    "UTAH",
    "VERMONT",
    "VIRGINIA",
    "WASHINGTON",
    "WEST VIRGINIA",
    "WISCONSIN",
    "WYOMING",
  ];
}
