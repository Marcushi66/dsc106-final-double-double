// script.js

const margin = { top: 30, right: 20, bottom: 60, left: 60 };
const width = 760;
const height = 360;

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

// tooltip div
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// 读取聚合后的 CSV
d3.csv("gold_diff_winrate.csv", d3.autoType).then((data) => {
  // x 轴：分箱标签，按 CSV 顺序
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.gold_bin))
    .range([0, chartWidth])
    .padding(0.2);

  // y 轴：胜率 0 - 1
  const y = d3.scaleLinear().domain([0, 1]).range([chartHeight, 0]);

  // 画 x 轴
  chartG
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(25)")
    .style("text-anchor", "start");

  // 画 y 轴
  chartG
    .append("g")
    .attr("class", "axis")
    .call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickFormat((d) => d3.format(".0%")(d))
    );

  // y 轴标签
  svg
    .append("text")
    .attr("x", margin.left - 40)
    .attr("y", margin.top - 10)
    .attr("fill", "#e5e7eb")
    .attr("text-anchor", "start")
    .style("font-size", "11px")
    .text("Win Rate");

  // 全局平均胜率参考线
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

  // 画柱子
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
