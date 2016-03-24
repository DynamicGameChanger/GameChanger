var express = require('express'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  fs = require('fs'),
  path = require('path'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  buildPic = require('./buildPic'),
  qs = require('qs'),
  mongoURI = 'mongodb://localhost/GameUsers',
  UserCtrl = require('./authenticate/userController'),
  SessionCtrl = require('./authenticate/sessionController'),
mongoose = require('mongoose');
var q = '';

mongoose.connect(mongoURI);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded());
app.use(cookieParser());
// app.get('/*', function(req, res, next) {
//   // console.log('get: ', req.query.id)
//
//   next();
// });

app.get('/', function(req, res) {
  q = '/' + req.query.id;
  res.sendFile(path.join(__dirname, '/home.html'));
});

app.get('/welcome', function(req, res) {
  res.sendFile(path.join(__dirname, '/welcome.html'));
});


// app.post('/signup', UserCtrl.createUser);
app.post('/login', UserCtrl.verify);
io.sockets.setMaxListeners(100);

var socketClients = {};
// initializes socket on Get request to Controller page
function startSocket(nameSpace) {

  var nsp = io.of(nameSpace);

  nsp.on('connection', function(socket) {
    var socketCount = Object.keys(socketClients).length;
    socketClients[socket.id] = socket;
    console.log('users connected: ', socketCount);

    socket.on('obj', function(val) {
      console.log('received Initial Object');
      nsp.emit('obj', val);
    });


    socket.on('changeVariable', function(val) {
      nsp.emit('changeVariable', val);
    });

    //captures img from game and emits to controller
    socket.on('image', imgObj => {
      buildPic(imgObj, nsp);
    });

    socket.on('chartData', data => {
      // need to figure out how to get controller to join room to listen from emits
      nsp.emit('chartData', data);
    });

    socket.on('disconnect', () => {
      console.log('disconnect and remove');
      delete socketClients[socket.id];
    })
  });
}


app.get('/controller', function(req, res) {
  if (SessionCtrl.isLoggedIn(req, res)) {
    q = '/' + req.query.id;
    startSocket(q);
    return res.sendFile(path.join(__dirname, '/controller/controller.html'));
  }
  return res.send('Please login')
});

app.get('/controller3', function(req, res) {
  q = '/' + req.query.id;
  res.sendFile(path.join(__dirname, '/controller/controller3.html'));
  // res.render('./controller/controller');
});

app.get('/snake', function(req, res) {
  res.sendFile(path.join(__dirname, '/games/snake/snake.html'));
  client = 'snake'
});

app.get('/marble', function(req, res) {
  res.sendFile(path.join(__dirname, '/games/marble/index.html'));
  client = 'marble'
});

app.get('*.js', function(req, res) {
  res.writeHead(200, {
    'content-type': 'text/javascript; charset=UTF-8'
  });
  res.end(fs.readFileSync(path.join(__dirname, req.url)));
});

app.get('*.css', function(req, res) {
  res.writeHead(200, {
    'content-type': 'text/css; charset=UTF-8'
  });
  res.end(fs.readFileSync(path.join(__dirname, req.url)));
});

// app.get('/controller/font-awesome/fonts/fontawesome-webfont.woff?v=4.1.0', function(req, res) {
//   res.writeHead(200, {
//     'content-type': 'text/css; charset=UTF-8'
//   });
//   res.end(fs.readFileSync(path.join(__dirname, req.url)));
// });
//
// app.get('/controller/js/gritter/images/ie-spacer.gif', function(req, res) {
//   res.writeHead(200, {
//     'content-type': 'text/css; charset=UTF-8'
//   });
//   res.end(fs.readFileSync(path.join(__dirname, req.url)));
// });
//
// app.get('/controller/font-awesome/fonts/fontawesome-webfont.ttf?v=4.1.0', function(req, res) {
//   res.writeHead(200, {
//     'content-type': 'text/css; charset=UTF-8'
//   });
//   res.end(fs.readFileSync(path.join(__dirname, req.url)));
// });

app.get('*.jpg', function(req, res) {
  res.writeHead(200, {
    'content-type': 'image/jpg'
  });
  res.end(fs.readFileSync(path.join(__dirname, req.url)));
});
app.get('*.png', function(req, res) {
  res.writeHead(200, {
    'content-type': 'image/png'
  });
  res.end(fs.readFileSync(path.join(__dirname, req.url)));
});

var port = process.env.PORT || 3000
http.listen(port, function() {
  console.log('I\'m listening!!');
});
