const express =require("express");
const router = express.Router();

const multer= require("multer");
const {storage}= require("../cloudConfig.js")
const upload=multer({storage});

const wrapAsync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/ExpressError.js");
const  {listingSchema}=require("../schema.js");
const Listing = require("../models/listing.js");
//make sure its an object...but why?

const {isLoggedIn}= require('../middlewares.js');

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    }
}


// index rourte
router.get("/", wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});

    res.render("listings/index.ejs", { allListing });

}));

//New route
router.get("/new",isLoggedIn, wrapAsync((req, res) => {

    res.render("listings/new.ejs");
    //wrong method to give path "/listing/new.ejs"
}));

//show route...READ operation
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:"author"}).populate("owner");
     if(!listing){
         req.flash("error", "The listing Does not exist");
         
         res.redirect("/listing") 
     }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
}));

//Create route
router.post("/", upload.single('listing[image]'), validateListing, wrapAsync(async (req, res) => {
    let url=req.file.path;
    let filename =req.file.filename;
    console.log(url+"..."+filename)
      if(  !req.body.listing){
        throw new ExpressError(400,"Send valid data for listing");
      }
    // res.send(req.file);
    let newList = new Listing(req.body.listing);
    newList.owner= req.user._id;
    newList.image={url,filename};
    await newList.save();
    req.flash("success", "New item created");  
    res.redirect("/listing");
}));

//edit route
router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res) => { 
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "The listing Does not exist");
        res.redirect("/listing")
    }

    let originalImageUrl = listing.image.url;
    let scaledDown = originalImageUrl.replace("/upload/","/upload/e_blur:5 0,w_250/");

    res.render("listings/edit.ejs", { listing, scaledDown });
    console.log(scaledDown);
    console.log(originalImageUrl)
}));


//Update Route
router.put("/:id", upload.single('listing[image]'), validateListing, isLoggedIn, wrapAsync(async (req, res) => {
    // if (!req.body.listing) {
    //     throw new ExpressError(400, "Send valid data for listing");
    // }

    let { id } = req.params;
   let listing= await Listing.findByIdAndUpdate(id, { ...req.body.listing }); // see how id is given as parameter
   
   if(typeof req.file != "undefined"){
   let url = req.file.path;
    let filename = req.file.filename;
   listing.image={url,filename};
   await listing.save();
   }
    req.flash("success", "Succesfully Edited!");  
    res.redirect(`/listing/${id}`);
}));




//DELETE
router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndDelete(id);
    console.log("deleted");
    req.flash("success", "Deleted Successfully");  
    res.redirect("/listing");

}));


module.exports=router;