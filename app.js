const createError = require('http-errors');
const express = require('express');
const path = require('path');

//these packages are used to parse cookie values
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const expressValidator = require('express-validator');
const session = require('express-session');

//database
const db = require('monk')('127.0.0.1:27017/nodeblog');

// these packages will aid in application routing
const indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const categoriesRouter = require('./routes/categories');

const app = express();

//make moments global
app.locals.moment = require('moment');

//global function to truncate text
app.locals.truncateText = function(text, length){
  return text.substring(0, length);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(logger('dev'));//logs request routs to the console
app.use(express.json());//parses body of incomins http request & sets it to request.body
app.use(express.urlencoded({ extended: false }));//parses query string data in the URL (e.g. /profile?id=5) and puts this in request.query.
app.use(cookieParser());//This takes all the cookies the client sends and puts them in request.cookies.
app.use(express.static(path.join(__dirname, 'public')));

// express-session is used by connect-flash
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// Express Validator
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.')
      , root = namespace.shift()
      , formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

// Connect-Flash
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// make db accessible to router
app.use(function (req, res, next) {
  req.db = db;
  next();
});

//setup routers
app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/categories', categoriesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
