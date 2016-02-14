var timeAxisFormat = d3.time.format.multi([
  [":%S", function(d) { return d.getSeconds(); }],
  ["%H:%M", function(d) { return d.getMinutes() || d.getHours(); }],
  ["%e %b", function(d) { return true; }],
]);

var interval;

var margin = {top: 10, right: 70, bottom: 30, left: 70};
var width, height;

var x = d3.time.scale();
var y = d3.scale.linear();

var xAxis = d3.svg.axis().scale(x).orient('bottom').tickFormat(timeAxisFormat);
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

var fill = d3.svg.area()
  .x(returnX)
  .y0(returnY('pessimistic'))
  .y1(returnY('optimistic'))
  .interpolate('basis');

var chart = d3.select('#chart svg g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var overlay = chart.select('rect.overlay');
var focus = chart.select('g.focus');
overlay.on('mouseover', function () { focus.style('display', null); });
overlay.on('mouseout', function () { focus.style('display', 'none'); });
overlay.on('mousemove', mousemove);

var hmFormat = d3.time.format('%H:%M');
var durFormat = function(dur) {
  var mins = Math.floor(dur);
  var secs = Math.round((dur % 1) * 60);
  return mins + 'm ' + secs + 's';
}

function mousemove () {
  var x0 = x.invert(d3.mouse(this)[0]);
  var bisector = d3.bisector(function (d) { return d.time; }).left;
  var i = bisector(data, x0, 1);
  var d0 = data[i-1], d1 = data[i]
  var d = (d1 && x0 - d0.time > d1.time - x0) ? d1 : d0;
  focus.attr('transform', 'translate(' + x(d.time) + ',0)');
  focus.selectAll('.best_guess')
    .attr('transform', 'translate(0,' + y(d.best_guess) + ')');
  focus.selectAll('.pessimistic')
    .attr('transform', 'translate(0,' + y(d.pessimistic) + ')');
  focus.selectAll('.optimistic')
    .attr('transform', 'translate(0,' + y(d.optimistic) + ')');
  focus.select('text.time')
    .attr('transform', 'translate(0,' + y(d.optimistic) + '),rotate(-90)')
    .text(hmFormat(d.time));
  focus.select('text.best_guess').text(durFormat(d.best_guess));
  focus.select('text.pessimistic').text(durFormat(d.pessimistic));
  focus.select('text.optimistic').text(durFormat(d.optimistic));
}

d3.select(window).on('resize', resize);
resize();

function resize() {
  var chart = d3.select('#chart');
  width = parseInt(chart.style('width'), 10);
  height = parseInt(chart.style('height'), 10);
  height = Math.min(Math.round(width * 0.61803398875), height);
  chart.select('svg').style('height', height + 'px');
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  x.range([0, width]);
  y.range([height, 0]);

  xAxis.ticks(width < 680 ? 5 : 10);

  chart.select('#ylabel').attr('x', -Math.round(height/2));

  chart.select('clipPath rect').attr('width', width).attr('height', height);
  chart.select('rect.overlay').attr('width', width).attr('height', height);

  redraw();
}

var data;

function redraw() {
  if (!data) return;

  var now = new Date();
  var then = new Date(now.getTime() - (interval * 1000));

  x.domain([then, now]);
  y.domain([0, d3.max(data, function (d) {
    return d3.max([d.best_guess, d.pessimistic, d.optimistic]);
  })]).nice();

  chart.select('.x.axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
  chart.select('.y.axis').call(yAxis);

  chart.select('.line.best_guess').datum(data).attr('d', bg_line);
  chart.select('.fill').datum(data).attr('d', fill);
}

function handleRow (d) {
  return {
    time: new Date(+d.time),
    best_guess: +d.best_guess/60,
    pessimistic: +d.pessimistic/60,
    optimistic: +d.optimistic/60
  };
}

function reloadData(secs, cb) {
  interval = secs;
  d3.csv('lastdata/' + (secs + 300), handleRow, function (err, response) {
    data = response;
    redraw();
    if (cb) cb();
  });
}

document.getElementById('interval').onchange = function (event) {
  reloadData(event.target.value);
};

reloadData(21600, function () {
  var socket = io();
  socket.on('new_point', function(msg) {
    var new_point = handleRow(msg);
    data.push(new_point);
    redraw();
  });
});
