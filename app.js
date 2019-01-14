var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var hbs = require('express-handlebars');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// index page (the only page we serve, l0l)
app.use('/', indexRouter);

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
