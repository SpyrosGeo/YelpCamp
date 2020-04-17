var express = require("express");
var mongoose = require("mongoose");
var flash = require('connect-flash');
var Campground = require('./models/campground');
var Comment = require("./models/comment");
var User = require('./models/user');
var seedDB = require('./seeds');
var app = express();
var bodyParser = require("body-parser");
var passport = require('passport');
var LocalStrategy = require('passport-local');
var commentRoutes = require('./routes/comments');
var campgroundRoutes = require('./routes/campgrounds');
var indexRoutes = require('./routes/index');
var methodOverride = require('method-override');
mongoose.connect("mongodb://mongo:27017/trashcamp", {
  useNewUrlParser: true,
  useUnifiedTopology:true
});
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();//seed the database
app.use(require("express-session")({
  secret:"kiba",
  resave:false,
  saveUninitialized:false
}));
//PASSPORT configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//passes the current user in every route
app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use(indexRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
app.listen(8086, function() {
  console.log("server is up");
});
