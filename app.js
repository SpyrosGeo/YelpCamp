var express = require("express");
var mongoose = require("mongoose");
var Campground = require('./models/campground');
var Comment = require("./models/comment");
var User = require('./models/user');
var seedDB = require('./seeds');
var app = express();
var bodyParser = require("body-parser");
var passport = require('passport');
var LocalStrategy = require('passport-local');

mongoose.connect("mongodb://localhost/trashcamp", {
  useNewUrlParser: true
});
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");
app.use(express.static("public"));
seedDB();
//PASSPORT CONFIG
app.use(require("express-session")({
  secret:"kiba",
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//passes the current user in every route
app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  next();
});

//Routes
app.get("/", function(req, res) {
  res.render("landing");
});
//Index
app.get("/campgrounds", function(req, res) {
  // console.log(req.user);
  //get data from the DB
  Campground.find({},function(err,allCampgrounds) {
    if (err) {
      console.log('error', error);
    } else {
      res.render("campgrounds/index",{campgrounds:allCampgrounds);
    }
  });
});
//NEW-show form
app.get("/campgrounds/new", function(req, res) {
  res.render("campgrounds/new");
});

//CREATE -add new campground to DB
app.post("/campgrounds", function(req, res) {
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var newCampground = {
    name: name,
    image: image,
    description: desc
  };
  //create a new campground and save to database
  Campground.create(newCampground,function(err,newlyCreated) {
      if (err) {
        console.log('err', err);
      } else {
          //redirect
        res.redirect("/campgrounds");
      }
  });
});

//Show
  app.get("/campgrounds/:id",function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if (err) {
          console.log('err', err);
        } else {
          // console.log('foundCampground:', foundCampground);
          res.render("campgrounds/show",{campground: foundCampground});
        }
      });
    });
    app.get("/campgrounds/:id/comments/new",isLoggedIn,function(req, res) {
      Campground.findById(req.params.id,function (err,campground) {
          if (err) {
            console.log('err', err);
          } else {
            res.render("comments/new",{campground: campground});
          }
      });
    });

    app.post("/campgrounds/:id/comments",isLoggedIn,function(req, res) {
      Campground.findById(req.params.id,function (err,campground) {
          if (err) {
            console.log('err:', err);
            res.status("404");
          } else {
            // console.log(req.body.comment);
            Comment.create(req.body.comment,function(err,comment) {
                if (err) {
                  console.log('err:', err);
                } else {
                  campground.comments.push(comment);
                  campground.save();
                  res.redirect("/campgrounds/"+campground._id+"")
                }
            });
          }
      });
    });



//=========================================
// AUTH ROUTES
//=========================================
app.get("/register",function (req, res) {
  res.render("register");
});
//handle sign up logic
app.post("/register",function (req, res) {
  var newUser = new User({username: req.body.username});
  User.register(newUser,req.body.password,function (err,user) {
    if (err) {
      console.log('err:', err);
      return res.render("register");
    }
    passport.authenticate("local")(req, res,function () {
      res.redirect("/campgrounds");
    });
  });
});
//SHOW LOGIN form
app.get("/login",function (req, res) {
  res.render("login");
});
//handling login logic
app.post("/login",passport.authenticate("local",{
  successRedirect:"/campgrounds",
  failureRedirect:"/login"

}),function(req, res) {
  res.send("login logic happens");
});
//LOGOUT ROUTE
app.get("/logout",function (req, res) {
  //comes with the packages that are installed
  req.logout();
  res.redirect("/campgrounds")
});




//middleware
function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }

}

app.listen(8081, function() {
  console.log("server is up");
});
