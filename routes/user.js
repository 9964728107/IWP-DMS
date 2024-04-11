const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapasync = require("../utils/wrapasync.js");
const passport = require('passport');
const { saveRedirectUrl } = require("../middlewares.js");

router.get("/signup",(req,res)=>{
    res.render("./users/signup.ejs");
}); 


    router.post("/signup", wrapasync(async(req,res)=>{
    
    
    try
    {  let {username,email,password}=req.body;
        let newUser = new User({email:email,username:username});
    let registeredUser = await User.register(newUser,password);
    console.log(registeredUser);
        req.login(registeredUser,(err) => {
            if (err) {
                return next(err);
            }
            
        req.flash("Success", "Welcome to Wandelust!");
        res.redirect("/listing");

            });
        
    }
    catch(e){
        req.flash("error",e.message);
        // res.redirect("/signup")
        console.log(e);
        }
    }));

    router.get("/login", (req, res) => {
            res.render("./users/login.ejs");
        }); 

    router.post("/login",saveRedirectUrl,
    passport.authenticate('local',{failureRedirect: '/login',
    failureFlash:true}),async (req,res)=>{

    req.flash("success","Welcome to the site!");
        let redirectUrl = res.locals.redirectUrl || "/listing";
        res.redirect(redirectUrl);

    })


router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
       return next(err);
        }
        req.flash("error", "you are logged out!");
        res.redirect("/listing");
       
    });
    
})




module.exports = router;