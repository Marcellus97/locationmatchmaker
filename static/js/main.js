import { getStates } from "./states.js";
import {
  updateSliderValue,
  addFeature,
  feature,
  featuresArray,
  featuresObjects,
  generateFeatureCheckboxes,
} from "./features.js";

let gMap;

window.updateSliderValue = updateSliderValue;

// keep track of what we have displayed
let currentDisplayedFeaturesMap = new Map();
let stateChoices; // will be created later
// Set initial display values
window.onload = function () {
  document.getElementById("checkbox-container").innerHTML =
    generateFeatureCheckboxes();
  document.querySelectorAll(".form-check-input").forEach((input) => {
    input.addEventListener("change", hideShowSlider);
  });

  // buttonEventListener
  document
    .getElementById("resultsButton")
    .addEventListener("click", getResults);

  featuresArray().forEach((feature) => {
    addFeature(feature);
  });
  // add default feature sliders
  // defaultFeaturesArray().forEach((feature) => {
  // check the box and trigger the 'change' event
  // document.getElementById(`${feature.id}Checkbox`).click();
  // });

  //default featureIds
  // let featureIds = defaultFeaturesArray().map((feature) => feature.id);
  // let prefIds = defaultFeaturesArray().map((feature) => feature.id + "-weight");
  // const ids = featureIds
  // .concat(prefIds);
  // .concat(["housing-price", "housing-price-weight"]);
  // console.log(ids);
  // const ids = [
  // "walkability",
  // "density",
  // "warm-weather",
  // "rain",
  // "housing-price",
  // "housing-weight",
  // "job-prospects",
  // ];
  // ids.forEach((id) => updateSliderValue(id));
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

  dropDown.addEventListener("change", () => updateStateHighlights("select"));
};

/*  D3.JS MAP CODE */
var margin = 20;
var width = 1200;
var height = 800;
var path = d3.geoPath();

/* ───────── Gradient for ranks 1‥10 ───────── */
const rankColor = d3
  .scaleLinear()
  .domain([1, 5, 10]) // 1 → green, 5 → yellow, 10 → red
  .range(["#2ecc71", "#f1c40f", "#e74c3c"])
  .clamp(true);
/* ─────────────────────────────────────────── */

var svg = d3
  .select("svg")
  .attr("width", width)
  .attr("height", height)
  // .attr("viewBox", [0, 0, 500, 500])
  .attr("viewBox", [0, 0, width, height])
  .attr("style", "max-width: 100%; height: auto;");

var countyStatesPromise = d3.json("/static/data/counties-albers-10m.json");
// var ranksPromise = d3.csv("/static/data/gold/final_data_rank.csv");

Promise.all([countyStatesPromise]).then(ready);

function ready(values) {
  var countryStates = values[0];
  createMap(countryStates, []);
  /* ------------------------------------------------------------- *
   * Zoom + pan                                                    *
   * ------------------------------------------------------------- */
  const zoom = d3
    .zoom()
    .scaleExtent([1, 8]) // 1× … 8×
    .translateExtent([
      [0, 0],
      [width, height],
    ]) // stay inside canvas
    .on("zoom", zoomed);

  svg
    .call(zoom) // wheel / pinch / dbl‑click
    .on("dblclick.zoom", null); // disable dbl‑click to zoom
  d3.select("#zoomIn").on("click", () =>
    svg.transition().call(zoom.scaleBy, 1.4)
  );
  d3.select("#zoomOut").on("click", () =>
    svg.transition().call(zoom.scaleBy, 1 / 1.4)
  );
  d3.select("#zoomReset").on("click", () =>
    svg.transition().call(zoom.transform, d3.zoomIdentity)
  );

  function zoomed() {
    // get the new transform
    const t = d3.event.transform;
    // apply it to our map‑layer
    gMap.attr("transform", t);

    // adjust all stroke widths so they stay 1–2px on screen
    gMap.selectAll(".county, .states path").attr("stroke-width", function () {
      const base = +this.dataset.baseStrokeWidth || 1;
      return base / t.k;
    });
  }
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

  /* single container that we’ll transform on zoom */
  gMap = svg.append("g").attr("class", "map-layer");

  /* --- counties --- */
  gMap
    .append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(countyFeatures)
    .enter()
    .append("path")
    .attr("id", (d) => "county-" + d.id)
    .attr("class", "county county-blank")
    .attr("d", path)
    .attr("fill", "white")
    .attr("stroke", "#ddd");

  /* --- states --- */
  gMap
    .append("g")
    .attr("class", "states")
    .selectAll("path")
    .data(stateFeatures)
    .enter()
    .append("path")
    .attr("id", (d) => "state-" + d.id)
    .attr("data-name", (d) => d.properties.name.toUpperCase())
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", "black");
}

const test_data = {
  num_adults: 2,
  num_children: 0,
  "Average Temperature F": 70,
  "Life Expectancy": 80,
  Unemployment_Rate: 4.0,
};

function getUserInput() {
  // const input = { ...test_data };
  let input = {};

  // This handles features
  document
    .querySelectorAll("div.slider-group:not(.d-none) input.featureSlider")
    .forEach((elm) => {
      let value = parseInt(elm.value);
      let dataFrameKey = elm.getAttribute("dataFrameKey");
      input[dataFrameKey] = value;
    });

  // This handles features weights, and normalizing all values down to floats, making sure it adds to one
  let weights = {};
  let total = 0;
  document
    .querySelectorAll("div.slider-group:not(.d-none) input.featureWeightSlider")
    .forEach((elm) => {
      let value = parseInt(elm.value);
      console.log("parsing crrectlye?", value);
      let dataFrameKey = elm.getAttribute("dataFrameKey");
      weights[dataFrameKey] = value;
      total += value;
    });

  // divide by total so all the values are floats that add up to 1
  Object.keys(weights).forEach((key) => {
    console.log("total", total);
    console.log("old ", weights[key]);
    let scaledValue = weights[key] / total;
    console.log("new", scaledValue);
    input[key] = scaledValue;
  });
  const states = stateChoices.getValue(true); // ["FLORIDA", "TEXAS"]
  // if (states.length) {
  //   input.states = states; // multi-state or single state as a list
  // } else {
  //   const allOpt = document.getElementById("stateDropdown").selectedOptions[0];
  //   const singleState = allOpt ? allOpt.value : ""; // empty string means ALL
  //   input.states = singleState ? [singleState] : []; // Treat single state as a list
  // }

  input.states = stateChoices.getValue(true);
  // input.median_sale_price = +document.getElementById("housing-price").value;
  return input;
}

let currentTop10Geo = [];
let currentTop10Data = [];
let activeCountyId = null; // keeps track of the open card

function getResults() {
  console.log("current features");
  console.log(currentDisplayedFeaturesMap);
  let userInput = getUserInput();
  console.log("getting results for user input", userInput);

  const apiPromise = fetch("/api/ranking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userInput),
  }).then((body) => body.json());

  Promise.all([countyStatesPromise, apiPromise]).then((values) => {
    let counties = values[0].objects.counties;
    let ranks = values[1].results;

    ranks.forEach((r) => {
      r.fipscode = String(r.fipscode);
    });

    // Make sure we're filtering with string comparison
    counties = counties.geometries.filter((d) =>
      ranks.some((r) => String(r.fipscode) === String(d.id))
    );

    currentTop10Geo = counties; // geometry
    currentTop10Data = ranks; // all the stats
    updateMap();
    updateList(ranks);

    // Highlight the top 10 counties on the map
    highlightMapCounties(ranks);

    // // Attach hover listeners for the top 10 counties
    // attachHoverListeners(currentTop10Geo);
    attachMapHoverListeners(currentTop10Geo);

    updateStateHighlights("result");
  });
}

/* ─── make any element draggable by its <h3> header ─────────────── */
function makeDraggable(el) {
  const handle = el.querySelector("h3");
  if (!handle) return; // no header → nothing to do
  handle.style.cursor = "grab";

  handle.addEventListener("mousedown", (e) => {
    e.preventDefault();

    /* starting point */
    const startX = e.clientX;
    const startY = e.clientY;
    const origLeft = parseInt(el.style.left) || 0;
    const origTop = parseInt(el.style.top) || 0;

    el.classList.add("dragging");
    handle.style.cursor = "grabbing";

    /* move */
    function dragMove(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      el.style.left = origLeft + dx + "px";
      el.style.top = origTop + dy + "px";
    }
    /* stop */
    function dragEnd() {
      document.removeEventListener("mousemove", dragMove);
      document.removeEventListener("mouseup", dragEnd);
      el.classList.remove("dragging");
      handle.style.cursor = "grab";
    }

    document.addEventListener("mousemove", dragMove);
    document.addEventListener("mouseup", dragEnd);
  });
}

function updateMap() {
  resetMapCounties();
  highlightMapCounties(currentTop10Data);
}

function highlightMapCounties(ranks) {
  ranks.forEach((r, i) => {
    const countySvg = document.querySelector(`#county-${r.fipscode}`);
    if (!countySvg) return;

    const delay = i * 50;
    const strokeCol = rankColor(r.rank); // green → yellow → red

    /* build a semi‑transparent fill */
    const fillCol = d3.color(strokeCol);
    if (fillCol) fillCol.opacity = 0.25; // 25 % alpha

    // reset first
    countySvg.setAttribute("class", "county county-blank");
    countySvg.setAttribute("stroke", "#ddd");
    countySvg.setAttribute("stroke-width", "1");
    countySvg.setAttribute("fill", "white");

    /* delayed entrance */
    setTimeout(() => {
      countySvg.setAttribute("stroke", strokeCol);
      countySvg.setAttribute("stroke-width", "2");
      countySvg.setAttribute("fill", fillCol + "");
      countySvg.classList.remove("county-blank");
      countySvg.classList.add("county-top10");

      /* NEW ─ store the colours so we can restore later */
      countySvg.dataset.baseStrokeWidth = 2; // or 3 etc.
      countySvg.dataset.baseStroke = strokeCol;
      countySvg.dataset.baseFill = fillCol + "";
    }, delay);
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
  ranks.sort((a, b) => a.rank - b.rank);
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
  document.querySelectorAll(".county").forEach((countySvg) => {
    if (countySvg.id === `county-${countyId}`) {
      countySvg.setAttribute("stroke", "#007bff");
      countySvg.setAttribute("stroke-width", "2");
      countySvg.setAttribute("fill", "rgba(0, 123, 255, 0.25)");
      countySvg.classList.add("county-hover", "county-zoom");
      const parent = countySvg.parentNode;
      parent.appendChild(countySvg);
    }
  });
}

function resetHighlights(top10Geo = []) {
  /* clear hover highlights but KEEP the active one */
  document.querySelectorAll(".top10Item").forEach((item) => {
    const itemCountyId = item.dataset.countyId;
    if (itemCountyId !== String(activeCountyId)) {
      item.classList.remove("highlighted");
    } else {
      item.classList.add("highlighted"); // Ensure active item stays highlighted
    }
  });

  document.querySelectorAll(".county").forEach((countySvg) => {
    const id = countySvg.id.replace("county-", "");
    
    // First reset to default styles
    if (id !== String(activeCountyId)) {
      countySvg.setAttribute("stroke", "#ddd");
      countySvg.setAttribute("stroke-width", "1");
      countySvg.setAttribute("fill", "white");
      countySvg.classList.remove("county-hover", "county-zoom");
    }
  });

  /* restore the original gradient stroke/fill on each top‑10 county */
  top10Geo.forEach((c) => {
    const id = c.id ?? c.fipscode;
    const svg = document.querySelector(`#county-${id}`);
    if (!svg) return;

    /* keep active one blue & zoomed – others go back to gradient */
    if (String(activeCountyId) === String(id)) {
      svg.classList.add("county-zoom"); // stay popped‑out
      return;
    }

    const stroke = svg.dataset.baseStroke || "#28a745";
    const fill = svg.dataset.baseFill || "rgba(40,167,69,.2)";

    svg.setAttribute("stroke", stroke);
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("fill", fill);
    svg.classList.remove("county-hover", "county-zoom");
    svg.classList.add("county-top10");
  });

  /* finally, make sure the active one stays blue */
  if (activeCountyId) {
    const activeElement = document.querySelector(`#county-${activeCountyId}`);
    if (activeElement) {
      activeElement.setAttribute("stroke", "#007bff");
      activeElement.setAttribute("stroke-width", "3");
      activeElement.setAttribute("fill", "rgba(0, 123, 255, 0.2)");
    }
    highlightListItem(activeCountyId);
  }
}

function attachHoverListeners(top10Data) {
  // First remove any existing listeners to prevent duplicates
  document.querySelectorAll(".top10Item").forEach((item) => {
    item.removeEventListener("mouseenter", onItemMouseEnter);
    item.removeEventListener("mouseleave", onItemMouseLeave);
    item.removeEventListener("click", onItemClick);
  });
  
  // Then attach new listeners
  document.querySelectorAll(".top10Item").forEach((item) => {
    const countyId = item.dataset.countyId;
    
    item.addEventListener("mouseenter", onItemMouseEnter);
    item.addEventListener("mouseleave", onItemMouseLeave);
    item.addEventListener("click", onItemClick);
  });
}

// Define handlers outside to avoid creating new functions on each attachment
function onItemMouseEnter(e) {
  const countyId = this.dataset.countyId;
  if (activeCountyId) return; // No hover effects when info box is open
  highlightListItem(countyId);
  highlightCountyBorder(countyId);
}

function onItemMouseLeave(e) {
  if (activeCountyId) return;
  resetHighlights(currentTop10Geo);
}

function onItemClick(e) {
  const countyId = this.dataset.countyId;
  showCountyStats(countyId, e);
}

function onItemClose() {
  // Hide the info box
  const infoBox = document.getElementById("countyInfoBox");
  if (infoBox) {
    infoBox.style.display = "none";
  }
  
  // Clear the active county id
  const previouslyActiveId = activeCountyId;
  activeCountyId = null;
  
  // Reset all highlights
  resetHighlights(currentTop10Geo);
  
  // Ensure the previously active county is properly restored to top10 styling if applicable
  const county = currentTop10Data.find(d => String(d.fipscode) === String(previouslyActiveId));
  if (county) {
    const countySvg = document.querySelector(`#county-${previouslyActiveId}`);
    if (countySvg) {
      countySvg.setAttribute("stroke", "green");
      countySvg.setAttribute("stroke-width", "2");
      countySvg.setAttribute("fill", "rgba(0, 255, 0, 0.2)");
      countySvg.classList.add("county-top10");
      countySvg.classList.remove("county-hover");
    }
  }
}

function attachMapHoverListeners(top10Geo) {
  document.querySelectorAll(".county").forEach((countySvg) => {
    const countyId = countySvg.id.replace("county-", "");

    countySvg.addEventListener("mouseenter", () => {
      if (activeCountyId) return; // ⇐ hover disabled when card open
      highlightListItem(countyId);
      highlightCountyBorder(countyId);
    });

    countySvg.addEventListener("mouseleave", () => {
      if (activeCountyId) return; // ⇐ same guard
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
    box.className = "county-info-box hidden";
    box.style.display = "none";
    box.innerHTML = `<span class="ci-close">&times;</span>`; // add X
    document.querySelector(".right-section").appendChild(box);

    /* hook the close button */
    box.querySelector(".ci-close").addEventListener("click", () => {
      // Add fade-out animation
      box.classList.add("hidden");
      // Wait for animation to complete before hiding
      setTimeout(() => {
        box.style.display = "none";
        activeCountyId = null;
      }, 300);
    });
    makeDraggable(box); // ← NEW
  }
  return box;
}


function showCountyStats(countyId, evt) {
  /* toggle behaviour */
  if (activeCountyId === countyId) {
    const box = getOrCreateInfoBox();
    box.classList.add("hidden");
    setTimeout(() => {
      box.style.display = "none";
      activeCountyId = null;
      document
        .querySelectorAll(".county-zoom")
        .forEach((el) => el.classList.remove("county-zoom"));
    }, 300);
    onItemClose();
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
  const ignore = ["fipscode", "COUNTY", "STATE", "rank"];

  // Group data by categories for better organization
  const categories = {
    Housing: [],
    Weather: [],
    Expenses: [],
    Amenities: [],
    "Natural Disasters": [],
    Other: [],
  };

  // Sort data into categories
  Object.entries(data).forEach(([k, v]) => {
    if (!ignore.includes(k)) {
      const label = k.replace(/_/g, " ");
      let category = "Other";

      // Simple categorization based on key names
      if (
        k.includes("Housing") ||
        k.includes("home") ||
        k.includes("sale") ||
        k.includes("list")
      ) {
        category = "Housing";
      } else if (
        k.includes("Temperature") ||
        k.includes("Precipitation") ||
        k.includes("Weather")
      ) {
        category = "Weather";
      } else if (
        k.includes("Monthly") ||
        k.includes("cost") ||
        k.includes("price")
      ) {
        category = "Expenses";
      } else if (
        k.includes("Access") ||
        k.includes("Food") ||
        k.includes("Physicians")
      ) {
        category = "Amenities";
      } else if (
        k.includes("risk") ||
        k.includes("Risk") ||
        k.includes("RISK") ||
        k.includes("RESL")
      ) {
        category = "Natural Disasters";
      }

      categories[category].push({
        key: k,
        label: label,
        value: v,
      });
    }
  });

  // Add rank at the top
  if (data.rank) {
    body += `
      <div class="ci-row" style="background-color: #f8f9fa; padding: 8px; border-radius: 4px; margin-bottom: 12px;">
        <span class="ci-label">Rank</span>
        <span class="ci-value" style="color: #007bff; font-size: 1.1em;">#${data.rank}</span>
      </div>`;
  }

  // Add each category and its data
  for (const [category, items] of Object.entries(categories)) {
    if (items.length > 0) {
      body += `<div style="margin-top: 10px; margin-bottom: 5px; font-weight: bold; color: #555;">${category}</div>`;

      items.forEach((item) => {
        body += `
          <div class="ci-row">
            <span class="ci-label">${item.label}</span>
            <span class="ci-value">${item.value}</span>
          </div>`;
      });
    }
  }

  box.innerHTML = `<span class="ci-close">&times;</span>${body}`;
  makeDraggable(box);

  /* re‑attach close handler (because we just rewrote innerHTML) */
  box.querySelector(".ci-close").addEventListener("click", () => {
    box.classList.add("hidden");
    setTimeout(() => {
      box.style.display = "none";
      activeCountyId = null;
      document
        .querySelectorAll(".county-zoom")
        .forEach((el) => el.classList.remove("county-zoom"));
    }, 300);
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

  // Show with animation
  box.style.display = "block";
  // Remove hidden class after a brief delay to trigger the animation
  setTimeout(() => {
    box.classList.remove("hidden");
    box.classList.add("pulse");
    // Remove pulse animation after it completes
    setTimeout(() => {
      box.classList.remove("pulse");
    }, 1500);
  }, 10);

  /* re‑apply permanent highlight */
  highlightListItem(countyId); // blue list row
  highlightCountyBorder(countyId); // blue map outline
}

function hideShowSlider(event) {
  // convert to feature id
  // let featureId = event.target.id.replace("Checkbox", "");
  let featureId = event.target.getAttribute("featureId");
  if (this.checked) {
    currentDisplayedFeaturesMap.set(featureId, featuresObjects()[featureId]);
    document
      .querySelector(`.slider-group:has(#${featureId})`)
      .classList.remove("d-none");
  } else {
    currentDisplayedFeaturesMap.delete(featureId);
    document
      .querySelector(`.slider-group:has(#${featureId})`)
      .classList.add("d-none");
  }
}

function updateStateHighlights(phase = "select") {
  /* phase: "select" → blue, "result" → green                         */
  const selected = new Set(
    stateChoices.getValue(true).map((s) => s.toUpperCase())
  );

  /* clear previous highlights */
  d3.selectAll(".state-selected, .state-result")
    .classed("state-selected", false)
    .classed("state-result", false);

  /* “all states” (empty list) → nothing to highlight */
  if (!selected.size) return;

  d3.selectAll("path[data-name]")
    .filter(function () {
      return selected.has(this.dataset.name);
    })
    .classed("state-selected", phase === "select")
    .classed("state-result", phase === "result");
}
