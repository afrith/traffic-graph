var db = require('./db'),
  fetch = require('./fetch');

var interval = 2 * 60 * 1000; // 2 minutes

db.connect(function (err, database) {
  if (err) {
    console.log('Mongo connect error:', err);
    return;
  }

  fetch.fetchAndSave();
  setInterval(function() {
    fetch.fetchAndSave();
  }, interval);
});
