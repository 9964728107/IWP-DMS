
const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");const { Cursor } = require("mongoose");
const User = require("../models/user.js");
const { isLoggedIn } = require("../middlewares.js");


const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// Reviews
// Post route
router.post("/",isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    let {id}=req.params;
    let {comment,rating}= req.body.review;
   

    let author = req.user._id;
    let authorName= await User.findById(author);
    let listing = await Listing.findById(id);
    let newReview = new Review({comment:comment,rating:rating,author:author,authorName:authorName.username});

     listing.reviews.push(newReview);

    await listing.save();
    await newReview.save();
// console.log(req.params);
    console.log("New review saved");
    req.flash("success", "Review added!");  
    res.redirect(`/listing/${listing._id}`);
}));

// Delete reviews
router.delete("/:reviewId", isLoggedIn, wrapAsync(async (req, res, next) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!"); 
    res.redirect(`/listing/${id}`);
}));

module.exports = router;
