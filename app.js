var express = require("express");
var mongoose = require("mongoose");
var app = express();
var bodyParser = require("body-parser");
mongoose.connect("mongodb://localhost/trashcamp", {
  useNewUrlParser: true
});

//SCHEMA SETUP

var campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  description:String
});
var Campground = mongoose.model("Campground", campgroundSchema);
// Campground.create({
//   name: "Autism Creek",
//   image: "https://farm4.staticflickr.com/3062/2984119099_82336dfc3b.jpg",
//   description:"this is a sad autistic body of water!"
// },function(err,campground) {
//   if (err) {
//     console.log('err', err);
//   }else {
//     console.log("New campground:",campground);
//   }
// });

app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");

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
    Campground.findById(req.params.id, function(err, foundCampground) {
        if (err) {
          console.log('err', err);
        } else {
          res.render("show",{campground: foundCampground});
        }
      });
    });

app.listen(8080, function() {
  console.log("server is up");
});
