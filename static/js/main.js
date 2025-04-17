import { getStates } from "./states.js";
import {
  updateSliderValue,
  addFeature,
  smallFeaturesArray,
  feature,
} from "./features.js";

window.updateSliderValue = updateSliderValue;
// Set initial display values
window.onload = function () {
  // buttonEventListener
  document
    .getElementById("resultsButton")
    .addEventListener("click", getResults);

  // add feature sliders
  smallFeaturesArray().forEach((feature) => {
    addFeature(feature);
  });

  let featureIds = smallFeaturesArray().map((feature) => feature.id);
  let prefIds = smallFeaturesArray().map(
    (feature) => feature.id + "-preference"
  );
  const ids = featureIds
    .concat(prefIds)
    .concat(["housing-price", "housing-preference"]);
  console.log(ids);
  // const ids = [
  // "walkability",
  // "density",
  // "warm-weather",
  // "rain",
  // "housing-price",
  // "housing-preference",
  // "job-prospects",
  // ];
  ids.forEach((id) => updateSliderValue(id));

  let updatedDropDownHtml = "";
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
// var ranksPromise = d3.csv("/static/data/gold/final_data_rank.csv");

Promise.all([countyStatesPromise]).then(ready);

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
  console.log("get user input");
  // clone
  let input = { ...test_data };

  input.state = document.getElementById("stateDropdown").value;
  input["median_sale_price"] = document.getElementById("housing-price").value;
  // input["housingPreference"] = document.getElementById("housing-preference").value;

  return input;
}

let currentTop10Geo = [];
function getResults() {
  let userInput = getUserInput();
  console.log("getting results");

  const apiPromise = fetch("http://localhost:8080/api/ranking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userInput),
  }).then((body) => body.json());

  Promise.all([countyStatesPromise, apiPromise]).then((values) => {
    let counties = values[0].objects.counties;
    let ranks = values[1].results;

    // Filter counties
    counties = counties.geometries.filter((d) =>
      ranks.some((r) => r.fipscode.toString() === d.id)
    );

    currentTop10Geo = counties;             // save for later
    updateMap(counties);
    updateList(ranks);

    // Highlight the top 10 counties on the map
    highlightMapCounties(ranks);

    // Attach hover listeners for the top 10 counties
    attachHoverListeners(ranks, currentTop10Geo);
    attachMapHoverListeners(ranks);
  });
}

function updateMap(counties) {
  resetMapCounties();
  highlightMapCounties(counties);
}

function highlightMapCounties(counties) {
  counties.forEach((county) => {
    const countySvg = document.querySelector(`#county-${county.id}`);
    if (countySvg) {
      countySvg.setAttribute("stroke", "green");
      countySvg.setAttribute("stroke-width", "2");
      countySvg.setAttribute("fill", "rgba(0, 255, 0, 0.2)"); // Light green fill
      countySvg.classList.add("county-top10");
    }
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
    updatedHtml += `<li class="top10Item" data-county-id="${r.fipscode}">${r.rank} - ${r.COUNTY} - ${r.STATE}</li>`;
  });
  document.querySelector("#top10List").innerHTML = updatedHtml;

  // Reattach hover event listeners after updating the list
  attachHoverListeners(ranks);
}

function highlightCountyOnMap(countyId) {
  // First reset any previous highlights to avoid confusion
  document.querySelectorAll(".county-hover").forEach(county => {
    county.classList.remove("county-hover");
  });
  
  // Add hover highlight to the target county
  const countyElement = document.querySelector(`#county-${countyId}`);
  if (countyElement) {
    countyElement.classList.add("county-hover");
    
    // Ensure this county is on top of others by appending it to its parent
    const parent = countyElement.parentNode;
    parent.appendChild(countyElement);
  }
}

function highlightListItem(countyId) {
  document.querySelectorAll(".top10Item").forEach(item => {
    if (item.dataset.countyId === countyId) {
      item.classList.add("highlighted");
      
      // Scroll the item into view if it's not already visible
      const container = document.getElementById("top10List");
      if (container.scrollHeight > container.clientHeight) {
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      item.classList.remove("highlighted");
    }
  });
}



// function highlightListItem(countyId) {
//   // Highlight the corresponding list item
//   document.querySelectorAll(".top10Item").forEach((item) => {
//     if (item.dataset.countyId === countyId) {
//       item.classList.add("highlighted");
//     } else {
//       item.classList.remove("highlighted");
//     }
//   });
// }

function highlightCountyBorder(countyId) {
  // Highlight the corresponding county and hide others
  document.querySelectorAll(".county").forEach((countySvg) => {
    if (countySvg.id === `county-${countyId}`) {
      countySvg.setAttribute("stroke", "#007bff"); // Modern blue color
      countySvg.setAttribute("stroke-width", "3");
      countySvg.setAttribute("fill", "rgba(0, 123, 255, 0.2)"); // Light blue fill
      countySvg.style.display = "block"; // Ensure the highlighted county is visible
    } else {
      countySvg.style.display = "none"; // Hide other counties
    }
  });
}

// function resetHighlights(top10Counties = []) {
//   /* clear all temporary highlights */
//   document.querySelectorAll(".top10Item").forEach((item) =>
//     item.classList.remove("highlighted")
//   );

//   document.querySelectorAll(".county").forEach((countySvg) => {
//     countySvg.style.display = "block";
//     countySvg.setAttribute("stroke", "#ddd");
//     countySvg.setAttribute("stroke-width", "1");
//     countySvg.setAttribute("fill", "white");
//   });

//   /* re‑apply the original green outlines */
//   top10Counties.forEach((c) => {
//     const id = c.id ?? c.fipscode;        // works for either object
//     const countySvg = document.querySelector(`#county-${id}`);
//     if (countySvg) {
//       countySvg.setAttribute("stroke", "green");
//       countySvg.setAttribute("stroke-width", "2");
//       countySvg.setAttribute("fill", "rgba(0,255,0,0.2)");
//     }
//   });
// }

// Fixed function to attach hover listeners
function attachHoverListeners(rankList, top10Geo = []) {  // Provide default empty array
  // Clear any existing event listeners (to prevent duplicates)
  document.querySelectorAll(".top10Item").forEach(item => {
    item.replaceWith(item.cloneNode(true));
  });
  
  document.querySelectorAll(".county").forEach(county => {
    const newCounty = county.cloneNode(true);
    county.parentNode.replaceChild(newCounty, county);
  });
  
  // Attach new listeners to list items
  document.querySelectorAll(".top10Item").forEach(listItem => {
    listItem.addEventListener("mouseenter", () => {
      const countyId = listItem.dataset.countyId;
      highlightListItem(countyId);
      highlightCountyOnMap(countyId);
    });
    
    listItem.addEventListener("mouseleave", () => {
      resetHighlights(top10Geo);
    });
    
    // Add click functionality to center on the county
    listItem.addEventListener("click", () => {
      const countyId = listItem.dataset.countyId;
      const county = document.querySelector(`#county-${countyId}`);
      if (county) {
        // You could add map centering/zooming functionality here if desired
        // For now, just make the highlight persist
        resetHighlights(top10Geo);
        highlightListItem(countyId);
        highlightCountyOnMap(countyId);
      }
    });
  });
  
  // Attach new listeners to map counties
  document.querySelectorAll(".county").forEach(county => {
    const countyId = county.id.replace("county-", "");
    
    // Check if the county is in top10Geo array (with safety checks)
    const isTop10County = Array.isArray(top10Geo) && top10Geo.length > 0 && 
      top10Geo.some(c => c && (c.id === countyId || c.fipscode === countyId));
    
    // Only add hover effects to counties in the top 10
    if (isTop10County) {
      county.addEventListener("mouseenter", () => {
        highlightListItem(countyId);
        highlightCountyOnMap(countyId);
      });
      
      county.addEventListener("mouseleave", () => {
        resetHighlights(top10Geo);
      });
      
      // Make counties clickable
      county.style.cursor = "pointer";
      county.addEventListener("click", () => {
        resetHighlights(top10Geo);
        highlightListItem(countyId);
        highlightCountyOnMap(countyId);
      });
    }
  });
}

// And update the resetHighlights function for safety
function resetHighlights(top10Counties = []) {
  // Remove hover effect from counties
  document.querySelectorAll(".county-hover").forEach(county => {
    county.classList.remove("county-hover");
  });
  
  // Remove highlight from list items
  document.querySelectorAll(".top10Item").forEach(item => {
    item.classList.remove("highlighted");
  });
  
  // Ensure top10 counties have their default styling
  document.querySelectorAll(".county").forEach(county => {
    county.classList.remove("county-top10");
    county.setAttribute("stroke", "#ddd");
    county.setAttribute("stroke-width", "1");
    county.setAttribute("fill", "white");
  });
  
  // Re-apply the top10 styling (with safety check)
  if (Array.isArray(top10Counties) && top10Counties.length > 0) {
    top10Counties.forEach(c => {
      if (c) {  // Make sure c exists
        const id = c.id || c.fipscode;
        if (id) {  // Make sure id exists
          const countySvg = document.querySelector(`#county-${id}`);
          if (countySvg) {
            countySvg.classList.add("county-top10");
          }
        }
      }
    });
  }
}


function attachMapHoverListeners(top10Geo) {
  document.querySelectorAll(".county").forEach((countySvg) => {
    countySvg.addEventListener("mouseenter", () => {
      const countyId = countySvg.id.replace("county-", "");
      highlightListItem(countyId);
    });
    countySvg.addEventListener("mouseleave", () => resetHighlights(top10Geo));
  });
}

// Add hover event listeners for the map
document.querySelectorAll(".county").forEach((countySvg) => {
  countySvg.addEventListener("mouseenter", () => {
    const countyId = countySvg.id.replace("county-", "");
    highlightListItem(countyId);
  });
  countySvg.addEventListener("mouseleave", resetHighlights);
});

// Add hover event listeners for the top 10 list
document.querySelectorAll(".top10Item").forEach((listItem) => {
  listItem.addEventListener("mouseenter", () => {
    const countyId = listItem.dataset.countyId;
    highlightCountyBorder(countyId);
  });
  listItem.addEventListener("mouseleave", resetHighlights);
});
