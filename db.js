var MongoClient = require('mongodb').MongoClient;

var mongourl = process.env.MONGO_URI || 'mongodb://localhost/traffic-graph';

var state = {
  db: null,
}

exports.connect = function(cb) {
  if (state.db) return cb();

  MongoClient.connect(mongourl, function(err, db) {
    if (err) return cb(err);
    state.db = db;
    cb();
  })
}

exports.get = function() {
  return state.db;
}

exports.close = function(cb) {
  if (state.db) {
    state.db.close(function(err, result) {
      state.db = null;
      cb(err);
    });
  }
}
