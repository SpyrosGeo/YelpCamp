var express = require("express");
var mongoose = require("mongoose");
var Campground = require('./models/campground');
var seedDB = require('./seeds');
var app = express();
var bodyParser = require("body-parser");
mongoose.connect("mongodb://localhost/trashcamp", {
  useNewUrlParser: true
});
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");

seedDB();

app.get("/", function(req, res) {
  res.render("landing");
});
//Index
app.get("/campgrounds", function(req, res) {
  //get data from the DB
  Campground.find({},function(err,allCampgrounds) {
    if (err) {
      console.log('error', error);
    } else {
      res.render("index",{campgrounds:allCampgrounds});
    }
  });
});
//NEW-show form
app.get("/campgrounds/new", function(req, res) {
  res.render("new");
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
          res.render("show",{campground: foundCampground});
        }
      });
    });

app.listen(8080, function() {
  console.log("server is up");
});
