import { getStates } from "./states.js";
import {
  updateSliderValue,
  addFeature,
  smallFeaturesArray,
  feature,
} from "./features.js";

window.updateSliderValue = updateSliderValue;
let stateChoices; // will be created later
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
    (feature) => feature.id + "-weight"
  );
  const ids = featureIds
    .concat(prefIds)
    .concat(["housing-price", "housing-price-weight"]);
  console.log(ids);
  // const ids = [
  // "walkability",
  // "density",
  // "warm-weather",
  // "rain",
  // "housing-price",
  // "housing-weight",
  // "job-prospects",
  // ];
  ids.forEach((id) => updateSliderValue(id));
  const dropDown = document.getElementById("stateDropdown");
  let updatedDropDownHtml = "";
  getStates().forEach((s) => {
    let value = s == "--- ALL STATES ---" ? "" : s;
    updatedDropDownHtml += `<option value="${value}">${s}</option>`;
  });
  // let dropDown = document.getElementById("stateDropdown");
  dropDown.innerHTML = updatedDropDownHtml;
  dropDown.selectedIndex = 0;

  stateChoices = new Choices(dropDown, {
    removeItemButton: true,
    searchEnabled: true,
    searchResultLimit: 50, // all 50 states → nothing trimmed
    shouldSort: false,
    placeholder: true,
    placeholderValue: "Search or scroll…",
  });
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
  const input = { ...test_data };

  const states = stateChoices.getValue(true); // ["FLORIDA", "TEXAS"]
  // if (states.length) {
  //   input.states = states; // multi-state or single state as a list
  // } else {
  //   const allOpt = document.getElementById("stateDropdown").selectedOptions[0];
  //   const singleState = allOpt ? allOpt.value : ""; // empty string means ALL
  //   input.states = singleState ? [singleState] : []; // Treat single state as a list
  // }

  input.states = stateChoices.getValue(true);
  input.median_sale_price = +document.getElementById("housing-price").value;
  return input;
}

let currentTop10Geo = [];
let currentTop10Data = [];
let activeCountyId = null; // keeps track of the open card

function getResults() {
  let userInput = getUserInput();
  console.log("getting results for user input", userInput);

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
    
    ranks.forEach(r => {
      r.fipscode = String(r.fipscode);
    });

    // Make sure we're filtering with string comparison
    counties = counties.geometries.filter((d) =>
      ranks.some((r) => String(r.fipscode) === String(d.id))
    );

    currentTop10Geo = counties; // geometry
    currentTop10Data = ranks; // all the stats
    updateMap(counties);
    updateList(ranks);

    // Highlight the top 10 counties on the map
    highlightMapCounties(ranks);

    // // Attach hover listeners for the top 10 counties
    // attachHoverListeners(currentTop10Geo);
    attachMapHoverListeners(currentTop10Geo);
  });
}

// function getResults(){
//   fetch("http://localhost:8080/api/ranking",{
//       method:"POST",
//       headers:{ "Content-Type":"application/json" },
//       body:JSON.stringify(getUserInput())
//   })
//   .then(res=>{
//       if(!res.ok) throw new Error(`Server error ${res.status}`);
//       return res.json();
//   })
//   .then(data=>{
//       currentTop10Data = data.results;
//       updateList(currentTop10Data);

//       // geo filter
//       const counties = countyStatesPromise.then(cjson=>{
//         const all = cjson.objects.counties;
//         return all.geometries.filter(g =>
//           currentTop10Data.some(r => r.fipscode.toString() === g.id)
//         );
//       });

//       counties.then(geos=>{
//         currentTop10Geo = geos;
//         updateMap(geos);
//         highlightMapCounties(geos);
//         attachHoverListeners(currentTop10Geo);
//         attachMapHoverListeners(currentTop10Geo);
//       });
//   })
//   .catch(err=>{
//       console.error(err);
//       alert("Server error – see console for details.");
//   });
// }


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
  ranks.sort((a,b) => a.rank - b.rank);
  ranks.forEach((r) => {
    updatedHtml += `<li class="top10Item" data-county-id="${r.fipscode}">${r.rank} - ${r.COUNTY} - ${r.STATE}</li>`;
  });
  document.querySelector("#top10List").innerHTML = updatedHtml;

  // Reattach hover event listeners after updating the list
  attachHoverListeners(ranks);
}

function highlightCountyOnMap(countyId) {
  // First reset any previous highlights to avoid confusion
  document.querySelectorAll(".county-hover").forEach((county) => {
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
  document.querySelectorAll(".top10Item").forEach((item) => {
    if (item.dataset.countyId === countyId) {
      item.classList.add("highlighted");

      // Scroll the item into view if it's not already visible
      const container = document.getElementById("top10List");
      if (container.scrollHeight > container.clientHeight) {
        item.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
      // countySvg.style.display = "none"; // Hide other counties
    }
  });
}

function resetHighlights(top10Geo = []) {
  /* clear hover highlights but KEEP the active one */
  document.querySelectorAll(".top10Item").forEach((item) => {
    if (item.dataset.countyId !== String(activeCountyId)) {
      item.classList.remove("highlighted");
    }
  });

  document.querySelectorAll(".county").forEach((countySvg) => {
    const id = countySvg.id.replace("county-", "");
    if (id !== String(activeCountyId)) {
      countySvg.setAttribute("stroke", "#ddd");
      countySvg.setAttribute("stroke-width", "1");
      countySvg.setAttribute("fill", "white");
    }
  });

  /* restore the original green outlines on the top‑10 set */
  top10Geo.forEach((c) => {
    const id = c.id ?? c.fipscode;
    if (id !== String(activeCountyId)) {
      // don’t overwrite active
      const svg = document.querySelector(`#county-${id}`);
      if (svg) {
        svg.setAttribute("stroke", "green");
        svg.setAttribute("stroke-width", "2");
        svg.setAttribute("fill", "rgba(0,255,0,.2)");
      }
    }
  });

  /* finally, make sure the active one stays blue */
  if (activeCountyId) {
    highlightListItem(activeCountyId);
    highlightCountyBorder(activeCountyId);
  }
}

function attachHoverListeners(top10Geo) {
  document.querySelectorAll(".top10Item").forEach((listItem) => {
    const countyId = listItem.dataset.countyId;

    listItem.addEventListener("mouseenter", () => {
      if (activeCountyId) return; // ⇐ hover disabled when card open
      highlightListItem(countyId);
      highlightCountyBorder(countyId);
    });

    listItem.addEventListener("mouseleave", () => {
      if (activeCountyId) return; // ⇐ same guard
      resetHighlights(top10Geo);
    });

    /* click still shows / toggles the stats card */
    listItem.addEventListener("click", (e) => {
      showCountyStats(countyId, e);
    });
  });
}

function attachMapHoverListeners(top10Geo) {
  document.querySelectorAll(".county").forEach((countySvg) => {
    const countyId = countySvg.id.replace("county-", "");

    countySvg.addEventListener("mouseenter", () => {
      if (activeCountyId) return; // ⇐ hover disabled when card open
      highlightListItem(countyId);
      highlightCountyBorder(countyId);
    });

    countySvg.addEventListener("mouseleave", () => {
      if (activeCountyId) return; // ⇐ same guard
      resetHighlights(top10Geo);
    });

    countySvg.addEventListener("click", (e) => {
      showCountyStats(countyId, e); // stats card toggle
    });
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

function getOrCreateInfoBox() {
  let box = document.getElementById("countyInfoBox");
  if (!box) {
    box = document.createElement("div");
    box.id = "countyInfoBox";
    box.className = "county-info-box";
    box.style.display = "none";
    box.innerHTML = `<span class="ci-close">&times;</span>`; // add X
    document.querySelector(".right-section").appendChild(box);

    /* hook the close button */
    box.querySelector(".ci-close").addEventListener("click", () => {
      box.style.display = "none";
      activeCountyId = null;
    });
  }
  return box;
}

function showCountyStats(countyId, evt) {
  /* toggle behaviour */
  if (activeCountyId === countyId) {
    getOrCreateInfoBox().style.display = "none";
    activeCountyId = null;
    return;
  }
  activeCountyId = countyId;

  const data = currentTop10Data.find(
    (d) => String(d.fipscode) === String(countyId)
  );
  if (!data) {
    return;
  }

  const box = getOrCreateInfoBox();

  /* Build prettier content */
  let body = `<h3>${data.COUNTY}, ${data.STATE}</h3>`;
  const ignore = ["fipscode", "COUNTY", "STATE"];
  Object.entries(data).forEach(([k, v]) => {
    if (!ignore.includes(k)) {
      const label = k.replace(/_/g, " ");
      body += `
        <div class="ci-row">
          <span class="ci-label">${label}</span>
          <span class="ci-value">${v}</span>
        </div>`;
    }
  });
  box.innerHTML = `<span class="ci-close">&times;</span>${body}`;

  /* re‑attach close handler (because we just rewrote innerHTML) */
  box.querySelector(".ci-close").addEventListener("click", () => {
    box.style.display = "none";
    activeCountyId = null;
  });

  /* Position next to click (inside right‑section bounds) */
  const right = document
    .querySelector(".right-section")
    .getBoundingClientRect();
  let x = evt.clientX - right.left + 12;
  let y = evt.clientY - right.top + 12;

  /* Keep it inside the panel */
  const maxX = right.width - box.offsetWidth - 12;
  const maxY = right.height - box.offsetHeight - 12;
  box.style.left = `${Math.min(x, maxX)}px`;
  box.style.top = `${Math.min(y, maxY)}px`;
  box.style.display = "block";

  /* re‑apply permanent highlight */
  highlightListItem(countyId); // blue list row
  highlightCountyBorder(countyId); // blue map outline
}
