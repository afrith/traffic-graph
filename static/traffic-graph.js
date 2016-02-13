var margin = {top: 10, right: 30, bottom: 30, left: 50};
var width = 200, height = 200; // placeholder

var x = d3.time.scale();
var y = d3.scale.linear();

var xAxis = d3.svg.axis().scale(x).orient('bottom');
var yAxis = d3.svg.axis().scale(y).orient('left');

function accessorX (d) {
  return x(d.time);
}

var bg_line = d3.svg.line()
  .x(accessorX)
  .y(function (d) { return y(d.best_guess); })
  .interpolate('basis');

var pess_line = d3.svg.line()
  .x(accessorX)
  .y(function (d) { return y(d.pessimistic); })
  .interpolate('basis');

var opt_line = d3.svg.line()
  .x(accessorX)
  .y(function (d) { return y(d.optimistic); })
  .interpolate('basis');

var fill = d3.svg.area()
  .x(accessorX)
  .y0(function (d) { return y(d.pessimistic); })
  .y1(function (d) { return y(d.optimistic); })
  .interpolate('basis');

var svg = d3.select('#chart').append('svg')
    .style('width', '100%')
    .style('height', '100%')
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

function handleRow (d) {
  return {
    time: new Date(+d.time),
    best_guess: +d.best_guess/60,
    pessimistic: +d.pessimistic/60,
    optimistic: +d.optimistic/60
  };
}

d3.csv('lastdata/10800', handleRow, function (err, data) {
  x.domain(d3.extent(data, function (d) { return d.time; }));
  y.domain([0, d3.max(data, function (d) {
    return d3.max([d.best_guess, d.pessimistic, d.optimistic]);
  })]).nice();

  svg.append('path').datum(data).attr('class', 'fill');

  svg.append('g').attr('class', 'x axis');
  svg.append('g').attr('class', 'y axis');

  svg.append('path').datum(data).attr('class', 'line pessimistic');
  svg.append('path').datum(data).attr('class', 'line optimistic');
  svg.append('path').datum(data).attr('class', 'line best_guess');

  d3.select(window).on('resize', resize);
  resize();

  function resize() {
    width = parseInt(d3.select('#chart').style('width'), 10) - margin.left - margin.right;
    height = parseInt(d3.select('#chart').style('height'), 10) - margin.top - margin.bottom;

    x.range([0, width]);
    y.range([height, 0]);

    svg.select('.x.axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
    svg.select('.y.axis').call(yAxis);
    svg.select('.line.best_guess').attr('d', bg_line);
    svg.select('.line.pessimistic').attr('d', pess_line);
    svg.select('.line.optimistic').attr('d', opt_line);
    svg.select('.fill').attr('d', fill);

    redraw();
  }

  function redraw() {
    svg.select('.line.best_guess').datum(data);
    svg.select('.line.pessimistic').datum(data);
    svg.select('.line.optimistic').datum(data);
    svg.select('.fill').datum(data);
  }
});
