var margin = {top: 10, right: 30, bottom: 30, left: 50};
var width, height;

var x = d3.time.scale();
var y = d3.scale.linear();

var xAxis = d3.svg.axis().scale(x).orient('bottom');
var yAxis = d3.svg.axis().scale(y).orient('left');

function returnX (d) { return x(d.time); }
function returnY(field) {
  return function (d) {
    return y(d[field]);
  }
}

var bg_line = d3.svg.line()
  .x(returnX)
  .y(returnY('best_guess'))
  .interpolate('basis');

var pess_line = d3.svg.line()
  .x(returnX)
  .y(returnY('pessimistic'))
  .interpolate('basis');

var opt_line = d3.svg.line()
  .x(returnX)
  .y(returnY('optimistic'))
  .interpolate('basis');

var fill = d3.svg.area()
  .x(returnX)
  .y0(returnY('pessimistic'))
  .y1(returnY('optimistic'))
  .interpolate('basis');

var svg = d3.select('#chart').append('svg')
    .style('width', '100%')
    .style('height', '100%');
var chart = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

function handleRow (d) {
  return {
    time: new Date(+d.time),
    best_guess: +d.best_guess/60,
    pessimistic: +d.pessimistic/60,
    optimistic: +d.optimistic/60
  };
}

chart.append('path').datum(data).attr('class', 'fill');

chart.append('g').attr('class', 'x axis');
chart.append('g').attr('class', 'y axis');

chart.append('path').attr('class', 'line pessimistic');
chart.append('path').attr('class', 'line optimistic');
chart.append('path').attr('class', 'line best_guess');

d3.select(window).on('resize', resize);
resize();

function resize() {
  width = parseInt(d3.select('#chart').style('width'), 10) - margin.left - margin.right;
  height = parseInt(d3.select('#chart').style('height'), 10) - margin.top - margin.bottom;

  x.range([0, width]);
  y.range([height, 0]);

  redraw();
}

var data;

function redraw() {
  if (!data) return;

  x.domain(d3.extent(data, function (d) { return d.time; }));
  y.domain([0, d3.max(data, function (d) {
    return d3.max([d.best_guess, d.pessimistic, d.optimistic]);
  })]).nice();

  chart.select('.x.axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
  chart.select('.y.axis').call(yAxis);

  chart.select('.line.best_guess').datum(data).attr('d', bg_line);
  chart.select('.line.pessimistic').datum(data).attr('d', pess_line);
  chart.select('.line.optimistic').datum(data).attr('d', opt_line);
  chart.select('.fill').datum(data).attr('d', fill);
}

d3.csv('lastdata/10800', handleRow, function (err, response) {
  data = response;
  redraw();
});
