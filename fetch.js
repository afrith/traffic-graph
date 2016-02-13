var request = require('request'),
  querystring = require('querystring'),
  async = require('async');

var db = require('./db');

var url_base = 'https://maps.googleapis.com/maps/api/directions/json?'
var api_key = process.env.API_KEY;

var origin = process.env.ORIGIN || '50 Parliament Street, Cape Town';
var destination = process.env.DESTINATION || '60 Klipper Road, Rondebosch, Cape Town';

function requestFunction(traffic_model) {
  return function (cb) {
    var query = {
      origin: origin,
      destination: destination,
      key: api_key,
      mode: 'driving',
      departure_time: 'now',
      traffic_model: traffic_model
    };

    var url = url_base + querystring.stringify(query);

    request(url, function (err, resp, body) {
      if (err) return cb(err);
      if (resp.statusCode != 200) return cb('Request failed, status code ' + resp.statusCode);

      var data = JSON.parse(body);
      if (data.status != 'OK') return cb('Request unsuccessful, status ' + data.status);

      cb(null, data.routes[0].legs[0].duration_in_traffic.value);
    });
  }
}

exports.fetchAndSave = function (cb) {
  var time = new Date();
  async.parallel({
    best_guess: requestFunction('best_guess'),
    pessimistic: requestFunction('pessimistic'),
    optimistic: requestFunction('optimistic')
  }, function (err, res) {
    if (err) return cb(err);

    res.time = time;
    db.get().collection('datapoints').insert(res, function (err) {
      if (err) return cb(err);
      cb(null, res);
    })
  });
}
