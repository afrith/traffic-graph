var request = require('request'),
  querystring = require('querystring'),
  async = require('async'),
  mongo = require('mongodb').MongoClient,
  _ = require('underscore');

var interval = 2 * 60 * 1000; // 2 minutes

var url_base = 'https://maps.googleapis.com/maps/api/directions/json?'
var api_key = process.env.API_KEY;

var origin = process.env.ORIGIN || '50 Parliament Street, Cape Town';
var destination = process.env.DESTINATION || '60 Klipper Road, Rondebosch, Cape Town';

var mongourl = process.env.MONGO_URI || 'mongodb://localhost/traffic-graph';

mongo.connect(mongourl, function (err, db) {
  if (err) {
    console.log('Mongo connect error:', err);
    return;
  }

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

  function requestAndWrite () {
    var time = new Date();
    async.parallel({
      best_guess: requestFunction('best_guess'),
      pessimistic: requestFunction('pessimistic'),
      optimistic: requestFunction('optimistic')
    }, function (err, res) {
      if (err) return console.log('Error getting times: ' + err);

      res.time = time;
      db.collection('datapoints').insert(res, function (err) {
        if (err) {
          console.log('Mongo insert error:', err);
        }
      })
    });
  }

  requestAndWrite();
  setInterval(function() {
    requestAndWrite();
  }, interval);

});
