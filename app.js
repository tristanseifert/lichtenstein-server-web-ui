var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

var hbs = require('express-handlebars');
var Handlebars = require('handlebars');

// create lichtenstein connection
var config = require('config');

var lichtenstein_api = require('./lichtenstein/api');

lichtenstein_api.connect({
  host: config.get('lichtenstein.host'),
  port: config.get('lichtenstein.port')
});

global.lichtenstein = lichtenstein_api;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/',

  helpers: {
    addOne: function(input) {
      return (Number(input) + 1);
    },
    toHexString: function(input) {
      return '0x' + Number(input).toString(16).toUpperCase();
    },
    formatBytes: function(input) {
      var bytes = Number(input);
      // TODO: implement, lol
      return bytes + ' bytes';
    },
    encodeJson: function(object) {
      return Handlebars.SafeString(JSON.stringify(object));
    }
  }
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// API (before CSRF to avoid having it)
var apiRouter = require('./routes/api');
app.use('/api/v1', apiRouter);

// csrf protection
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });

app.use(csrfProtection, function(req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// sass for stylesheets
var sassMiddleware = require('node-sass-middleware');

app.use('/css',
  sassMiddleware({
    src: __dirname + '/sass', //where the sass files are
    dest: __dirname + '/public/css', //where css should go
    debug: true,

    // stylesheets are at /css over HTTP
    // prefix: '/css',

    // include for Foundation
    includePaths: [
      'node_modules/foundation-sites/scss'
    ]
  })
);

// serve foundation JS
app.use("/js/jquery.min.js", express.static(__dirname + '/node_modules/jquery/dist/jquery.min.js'));
app.use("/js/foundation.min.js", express.static(__dirname + '/node_modules/foundation-sites/dist/js/foundation.min.js'));
app.use("/js/toastr.min.js", express.static(__dirname + '/node_modules/toastr/build/toastr.min.js'));

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// index page
var indexRouter = require('./routes/index');
app.use('/', indexRouter);

// server status
var statusRouter = require('./routes/status');
app.use('/status', statusRouter);

// nodes
var nodeRouter = require('./routes/node');
app.use('/node', nodeRouter);
// groups
var groupRouter = require('./routes/group');
app.use('/group', groupRouter);
// routines
var routineRouter = require('./routes/routine');
app.use('/routine', routineRouter);

// tools
var toolsRouter = require('./routes/tools');
app.use('/tools', toolsRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
