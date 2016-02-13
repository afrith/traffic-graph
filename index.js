var express = require('express');

var db = require('./db'),
  fetch = require('./fetch');

var interval = 2 * 60 * 1000; // 2 minutes

var port = parseInt(process.env.PORT) || 3000;

var app = express();
app.use('/', require('./routes'));

db.connect(function (err, database) {
  if (err) {
    console.log('Mongo connect error:', err);
    return;
  }

  //fetch.fetchAndSave();
  setInterval(function() {
    fetch.fetchAndSave();
  }, interval);

  app.listen(port, function () {
    console.log('Listening on port ' + port);
  });
});
