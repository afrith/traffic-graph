var express = require('express');
var router = express.Router();

var db = require('./db');

var origin = process.env.ORIGIN || '50 Parliament Street, Cape Town';
var destination = process.env.DESTINATION || '60 Klipper Road, Rondebosch, Cape Town';

router.use(function (err, req, res, next) {
  if (err == 404) {
    res.status(404).send('Not Found');
  } else if (err == 403) {
    res.status(403).send('Forbidden');
  } else if (err == 400) {
    res.status(400).send('Bad Request');
  } else {
    res.status(500).json(err);
  }
});

router.get('/', function (req, res, next) {
  res.render('index', { origin: origin, destination: destination });
});

router.get('/lastdata/:seconds', function (req, res, next) {
  var seconds = parseInt(req.params.seconds);

  if (isNaN(seconds) || seconds <= 0) {
    next(400);
    return;
  }

  var now = (new Date()).getTime();
  var then = new Date(now - req.params.seconds * 1000);

  res.type('csv');
  res.write('time,best_guess,pessimistic,optimistic\n');

  db.get().collection('datapoints')
    .find({time: {$gt: then}}).sort({time: 1})
    .each(function(err, item) {
      if (err) return next(err);
      if (item != null) {
        var data = [item.time.getTime(), item.best_guess, item.pessimistic, item.optimistic];
        res.write(data.join(',') + '\n');
      } else {
        res.end();
      }
    });
});

module.exports = router;
