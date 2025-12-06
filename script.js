// script.js

const margin = { top: 30, right: 20, bottom: 60, left: 60 };
const width = 760;
const height = 360;

// ⭐ Metric switcher ⭐
function updateMetric(metric) {
  document.querySelectorAll(".map-icon").forEach((b) => {
    b.classList.toggle("active", b.dataset.metric === metric);
  });

  if (metric === "gold") {
    // Right now only gold chart exists
    // So simply re-render or do nothing
    console.log("Showing gold difference metric");
  } else {
    alert(`Metric "${metric}" is not implemented yet.`);
  }
}

// Bind events
document.querySelectorAll(".map-icon").forEach((btn) => {
  btn.addEventListener("click", () => {
    updateMetric(btn.dataset.metric);
  });
});


const svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

const chartG = svg
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

d3.csv("gold_diff_winrate.csv", d3.autoType).then((data) => {
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.gold_bin))
    .range([0, chartWidth])
    .padding(0.2);

  const y = d3
    .scaleLinear()
    .domain([0, 1])
    .range([chartHeight, 0]);

  chartG
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(25)")
    .style("text-anchor", "start");

  chartG
    .append("g")
    .attr("class", "axis")
    .call(
      d3.axisLeft(y)
        .ticks(5)
        .tickFormat((d) => d3.format(".0%")(d))
    );

  svg
    .append("text")
    .attr("x", margin.left - 40)
    .attr("y", margin.top - 10)
    .attr("fill", "#e5e7eb")
    .attr("text-anchor", "start")
    .style("font-size", "11px")
    .text("Win Rate");

  const overallWin =
    d3.sum(data, (d) => d.win_rate * d.count) /
    d3.sum(data, (d) => d.count);

  chartG
    .append("line")
    .attr("x1", 0)
    .attr("x2", chartWidth)
    .attr("y1", y(overallWin))
    .attr("y2", y(overallWin))
    .attr("stroke", "#6b7280")
    .attr("stroke-dasharray", "4 3");

  chartG
    .append("text")
    .attr("x", chartWidth - 4)
    .attr("y", y(overallWin) - 6)
    .attr("text-anchor", "end")
    .attr("fill", "#9ca3af")
    .style("font-size", "11px")
    .text(`Overall ≈ ${d3.format(".0%")(overallWin)}`);

  chartG
    .selectAll("rect.bar")
    .data(data)
    .join("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.gold_bin))
    .attr("width", x.bandwidth())
    .attr("y", (d) => y(d.win_rate))
    .attr("height", (d) => chartHeight - y(d.win_rate))
    .attr("fill", "#3b82f6")
    .on("mouseover", function (event, d) {
      d3.select(this).attr("fill", "#f97316");

      tooltip
        .style("opacity", 1)
        .html(
          `<strong>${d.gold_bin}</strong><br/>
           Win rate: ${d3.format(".1%")(d.win_rate)}<br/>
           Games: ${d.count}`
        )
        .style("left", event.pageX + 12 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("fill", "#3b82f6");
      tooltip.style("opacity", 0);
    });
});
