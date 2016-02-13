var http = require('http'),
  express = require('express'),
  exphbs  = require('express-handlebars'),
  socketio = require('socket.io');

var db = require('./db'),
  fetch = require('./fetch');

var interval = 2 * 60 * 1000; // 2 minutes

var port = parseInt(process.env.PORT) || 3000;

var app = express();
var http_server = http.Server(app);
var io = socketio(http_server);

app.use(express.static('static'));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use('/', require('./routes'));

db.connect(function (err, database) {
  if (err) {
    console.log('Mongo connect error:', err);
    return;
  }

  //fetch.fetchAndSave();
  setInterval(function() {
    fetch.fetchAndSave(function (err, new_point) {
      if (err) {
        console.log('fetchAndSave error:', err);
        return;
      }
      new_point.time = new_point.time.getTime();
      io.emit('new_point', new_point);
    });
  }, interval);

  http_server.listen(port, function () {
    console.log('Listening on port ' + port);
  });
});
