// main.js
console.log("D3 version:", d3.version);

// Simple example: add an SVG and a circle
const svg = d3
  .select("#viz")
  .append("svg")
  .attr("width", 400)
  .attr("height", 300);

svg
  .append("circle")
  .attr("cx", 200)
  .attr("cy", 150)
  .attr("r", 50)
  .attr("fill", "steelblue");
