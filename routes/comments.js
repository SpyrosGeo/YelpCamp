var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require('../models/campground');
var Comment = require('../models/comment');



router.get("/new",isLoggedIn,function(req, res) {
  Campground.findById(req.params.id,function (err,campground) {
      if (err) {
        console.log('err', err);
      } else {
        res.render("comments/new",{campground: campground});
      }
  });
});

router.post("/",isLoggedIn,function(req, res) {
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
              //add username and id to comment
              comment.author.id = req.user._id;
              comment.author.username =req.user.username;
              //save comment
              comment.save();
              //
              campground.comments.push(comment);
              campground.save();
              // console.log('comment:', comment);
              res.redirect("/campgrounds/"+campground._id+"")
            }
        });
      }
  });
});
//EDIT ROUTE
router.get("/:comment_id/edit",checkCommentOwnership,function (req, res) {
Comment.findById(req.params.comment_id,function (err,foundComment) {
  if (err) {
    console.log('err:', err);
  } else {
    res.render("comments/edit",{campground_id:req.params.id, comment:foundComment});
  }
  });
});
//UPDATE Route
router.put("/:comment_id",checkCommentOwnership,function (req, res) {
Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function (err,updatedComment) {
    if (err) {
      res.redirect("back");
    } else {
      res.redirect("/campgrounds/"+ req.params.id);
    }
});

});
//COMMENT DESTROY ROUTE
router.delete("/:comment_id",checkCommentOwnership,function(req, res) {
  //findByIdAndRemove
  Comment.findByIdAndRemove(req.params.comment_id,function (err) {
      if (err) {
        res.redirect("back");
      } else {
        res.redirect("/campgrounds/"+req.params.id);
      }
  });
});



//MIDDLEWARE
function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

function checkCommentOwnership(req,res,next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id,function (err,foundComment) {
      if (err) {
        res.redirect("back");
      } else {
          //does the user own the comment
          if (foundComment.author.id.equals(req.user._id)) {
            next();
          } else {
            res.redirect("back");
          }
      }
    });
  } else {
    res.redirect("back");
  }
}
module.exports = router;
